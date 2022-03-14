
console.log("attach");

with(window) {
    //Import modules
    const EntityHandler = require("../entityhandler.js");
    const AssetLoader = require("../assetloader.js");

    const Tilemap = require("../tilemap.js");
    const Input = require("../input.js");
    const ServerInterface = require("../serverinterface.js");

    const Viewport = require("../viewport.js");
    const Renderer = require("./renderer.js");

    const Editor = require("./editor.js");
    
    //Modify prototypes
    {
        Math.lerp = function(v1, v2, t) {
            return v1 + (v2 - v1) * t;
        }
        Number.prototype.mod = function (n) {
            return ((this % n) + n) % n;
        };
    }
    
    player = null;
    spawnflag = null;
    selectedItem = null;
    mouseOverUI = false;
    assets = {};

    //Only tick these objects if simulating is true
    gameObjectSimulators = ["fireball"];
    simulating = false;

    deathZone = 130;


    getIcon = function(id) {
        //Convert string id to numerical id
        if(typeof id == "string") id = AssetLoader.blocks[id]?.id ?? 0;

        return tilemap.getTileImage(id);
    }

    async function start() {
        EntityHandler.loadDefault();
        await AssetLoader.loadDefault();
        
        Renderer.attach(document.querySelector("canvas"));
        Input.listen(document.body);
        
        //Load tilemap
        tilemap = new Tilemap(256,256);
        const [ texture, uvs ] = await tilemap.setTexture({
            src: "/assets/blocks.png",
        });

        //Setup scene
        spawnflag = EntityHandler.spawnEntity("SpawnFlag", Math.floor(tilemap.width / 2) + 0.5, Math.floor(tilemap.height - 20) + 0.5);
        player = EntityHandler.spawnEntity("Player", Math.floor(tilemap.width / 2) + 0.5, Math.floor(tilemap.height / 2) + 0.5);
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
            EntityHandler.entities.forEach((el, i) => {
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

        Editor.addEventListener("save-online", async (data) => {
            console.log("publish",data);
            const { status, body } = await ServerInterface.publishLevel(data);

            if(status == 500) Editor.submissionError(body);
                         else Editor.submissionSuccess(body);
        })


        let t0 = 0;
        //Called whenever a frame is drawn
        Renderer.addEventListener("draw", (t1) => {
            const dt = t1 - t0;
            t0 = t1;

            Renderer.drawTilemap(tilemap);
            Editor.draw(t1);

            //Draw all entities
            EntityHandler.entities.forEach((entity, i) => {
                Renderer.drawEntity(entity);
            });

            Renderer.drawDeathZone(deathZone);
        })

        //Automatically resize canvas on window resize
        window.addEventListener("resize", (e) => {
            Renderer.resizeCanvas();
        })

        const tickableBlocks = [];
        
        //Tick blocks in view
        setInterval(() => {
            if(!simulating) return;
            for(let x = Renderer.viewport.left; x < Renderer.viewport.right; x++) {
                for(let y = Renderer.viewport.top; y < Renderer.viewport.bottom; y++) {
                    const block = tilemap.blocks[x + y * tilemap.width];
                    if(!block || block[0] == -1) continue;

                    const blockobj = AssetLoader.blocks[AssetLoader.getNameForBlock(block[0])];
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
        EntityHandler.entities.forEach((entity) => {
            const isGameObject = !entity.simulateInEditor;
            if(isGameObject && !simulating) return;
            entity.update(tilemap);
        })
    }

    //pyramid of D O O M
    start().then(() => {
        setInterval(() => {
            fixedUpdate()
        },1000/100) //Game speed
    });
}