
console.log("attach");

with(window) {
    //Import modules
    {
        Hasher = require("js-sha256");
        LZUTF8 = require("lz-string");
    
        Tilemap = require("./tilemap.js");
        Input = require("./input.js");
        ServerInterface = require("./serverinterface.js");
    
        Entity = require("./entities/entity.js");
        Player = require("./entities/player.js");
        BouncyBall = require("./entities/bouncyball.js");
        SpawnFlag = require("./entities/spawnflag.js");
        Fireball = require("./entities/fireball.js");
    
        Viewport = require("./viewport.js");
        Renderer = require("./renderer.js");
    
        Editor = require("./editor.js");
    }
    
    //Modify prototypes
    {
        Math.lerp = function(v1, v2, t) {
            return v1 + (v2 - v1) * t;
        }
        Number.prototype.mod = function (n) {
            return ((this % n) + n) % n;
        };
        String.prototype.compress = function() {
            return LZUTF8.compressToEncodedURIComponent(this);
        }
        String.prototype.decompress = function() {
            return LZUTF8.decompressFromEncodedURIComponent(this);
        }
        String.compress = function(text) {
            return LZUTF8.compressToEncodedURIComponent(text);
        }
        String.decompress = function(text) {
            return LZUTF8.decompressFromEncodedURIComponent(text);
        }
}
    entities = new Map();
    player = null;
    spawnflag = null;
    selectedItem = null;
    mouseOverUI = false;
    assets = {};

    //Only tick these objects if simulating is true
    gameObjectSimulators = ["fireball"];
    simulating = false;

    deathZone = 130;

    blocks = {
        findId: function(id) {
            for(let i of Object.values(this)) {
                if(i.id == id) return i;
            }
            return null;
        }
    };

    idGenerator = (function*() {
        let n = 0;
        while(true) {
            let v = n++;
            let hash = Hasher.sha256(`${v}`);
            yield hash.substr(0,16);
        }
    })();

    loadAssets = function(...names) {
        return new Promise(async (resolve, reject) => {
            let promises = [];
            for(let name of names) {
                promises.push(new Promise((res,rej) => {
                    let img = new Image();
                    img.onload = () => {
                        window.assets[name] = img;
                        res(img);
                    }
                    img.src = `assets/${name}.png`;
                }));
            }

            for(let promise of promises) {
                await promise;
            }

            resolve();
        })
    }

    removeEntity = function(id) {
        const ent = entities.get(id);
        if(!ent) return;

        ent.kill();
        entities.delete(id);
    }

    spawnEntity = function(ent, x, y, options = {}) {
        const instance = new ent(x,y);
        Object.assign(instance, options);
        instance.createCollider();

        const id = idGenerator.next().value;
        instance.id = id;

        entities.set(id, instance);
        return instance;
    }

    loadBlocks = function(...names) {
        names.forEach((name) => {
            const block = require(`./blocks/${name}.js`);
            window.blocks[name] = block;
        })
    }

    getIcon = function(id) {
        //Convert string id to numerical id
        if(typeof id == "string") id = blocks[id]?.id ?? 0;

        return tilemap.getTileImage(id);
    }

    async function start() {
        Renderer.attach(document.querySelector("canvas"));
        Input.listen(document.body);
        
        //Load tilemap
        tilemap = new Tilemap(1024,1024);
        const [ texture, uvs ] = await tilemap.setTexture({
            src: "assets/blocks.png",
        });
        
        //Load textures
        await loadAssets("menu/debug", "menu/eraser", "menu/exit", "menu/handle", "menu/import", "menu/save", "menu/settings", "menu/spawn", "menu/start", "menu/stop", "basicCursor", "brushCursor", "player");
        loadBlocks("brick","spike","flag","chain","metal","water","invisible","bouncepad","jumporb","grate","roundspike","spawnpoint","lava","forcefield","wood","gravityorb", "levetatingblock","sludge","flagblock","spawnpointblock","technochain","technometal","blue","lock","fireballshooter");


        //Setup scene
        spawnflag = spawnEntity(SpawnFlag, Math.floor(tilemap.width / 2) + 0.5, Math.floor(tilemap.height - 20) + 0.5);
        player = spawnEntity(Player, Math.floor(tilemap.width / 2) + 0.5, Math.floor(tilemap.height / 2) + 0.5);
        Renderer.viewport.x = spawnflag.x;
        Renderer.viewport.y = spawnflag.y;

        deathZone = spawnflag.y + 10;

        Editor.setup();
        
        player.addEventListener("win", () => {
            simulating = false;
            Editor.setTesting(false);
        })
        Editor.addEventListener("start", () => {
            simulating = true;
            player.static = false;
            player.hidden = false;

            player.x = spawnflag.x;
            player.y = spawnflag.y;
            player.invertedGravity = false;
            player.spawnX = spawnflag.x;
            player.spawnY = spawnflag.y;
            player.spawnInvetedGravity = false;
            
            player.motionX = 0;
            player.motionY = 0;
        })
        Editor.addEventListener("stop", () => {
            simulating = false;
            player.static = true;
            player.hidden = true;

            //Kill all game entities
            entities.forEach((el, i) => {
                if(gameObjectSimulators.includes(el.type)) {
                    removeEntity(el.id);
                }
            })
        })

        document.querySelector("#overlay").addEventListener("mouseover", () => {
            mouseOverUI = true;
        })
        document.querySelector("#overlay").addEventListener("mouseout", () => {
            mouseOverUI = false;
        })

        let t0 = 0;

        Editor.addEventListener("save-online", async (data) => {
            console.log("publish",data);
            await ServerInterface.publishLevel(data);
        })

        //Called whenever a frame is drawn
        Renderer.addEventListener("draw", (t1) => {
            const dt = t1 - t0;
            t0 = t1;

            Renderer.drawTilemap(tilemap);
            Editor.draw(t1);

            //Draw all entities
            entities.forEach((entity, i) => {
                Renderer.drawEntity(entity);
            });

            Renderer.drawDeathZone(deathZone);
        })

        //Automatically resize canvas on window resize
        window.addEventListener("resize", (e) => {
            Renderer.resizeCanvas();
        })

        //Tick blocks in view
        setInterval(() => {
            if(!simulating) return;
            for(let x = Renderer.viewport.left; x < Renderer.viewport.right; x++) {
                for(let y = Renderer.viewport.top; y < Renderer.viewport.bottom; y++) {
                    const block = tilemap.blocks[x + y * tilemap.width];
                    if(!block || block[0] == -1) continue;

                    const blockobj = blocks.findId(block[0]);
                    if(!blockobj) continue;

                    blockobj.tick?.(tilemap.getTile(x,y));
                }
            }
        },1000);
    }

    //Called 100 times a second
    function fixedUpdate() {
        if(Editor.testing) {
            Renderer.viewport.x += (player.x - Renderer.viewport.x) / 10;
            Renderer.viewport.y += (player.y - Renderer.viewport.y) / 10;
            Renderer.viewport.zoom += (2 - Renderer.viewport.zoom) / 50;

            //Move player by directional keys
            const moveX = Input.keysPressed.includes("d") - Input.keysPressed.includes("a");
            player.move(moveX, Input.keysPressed.includes(" "));
        }

        //Tick all entities
        entities.forEach((entity) => {
            const isGameObject = gameObjectSimulators.includes(entity.type) || entity.type == "player";
            if(isGameObject && !simulating) return;
            entity.update(tilemap);
        })
    }

    //pyramid of D O O M
    start().then(() => {
        setInterval(() => {
            fixedUpdate()
        },10)
    });
}