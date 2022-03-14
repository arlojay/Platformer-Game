console.log("attach");
const EditorUI = require("./editorui.js");
const Input = require("../input.js");
const Renderer = require("./renderer.js");
const SelectedItem = require("../entities/selecteditem.js");
const Listener = require("../listeners.js");
const EntityHandler = require("../entityhandler.js");
const AssetLoader = require("../assetloader.js");

function compressLevel(name, desc, blocks) {
    blocks ??= tilemap.save();
    
    return {
        name, desc, blocks
    };
}

let lastItemPos = [0,0];
class Editor {
    static selectedItemEntity = null;
    static drawing = false;
    static holdingEntity = null;
    static draggingDeathZone = false;
    static testing = false;
    static preview = null;
    static tool = 0;

    static panning = false;
    static panStart = [0.0,0.0];
    static viewportPosStart = [0.0,0.0];
    
    static setup() {
        Listener.attach(this);

        //Setup UIs
        EditorUI.setup();

        
        this.selectedItemEntity = EntityHandler.spawnEntity(SelectedItem, 0, 0);
        this.selectedItemEntity.texture = new Image();
        {
            EditorUI.addEventListener("*", (type, ...args) => {
                this.dispatchEvent(type, ...args);
            });
            EditorUI.addEventListener("start", () => {
                this.setTesting(true);
                document.querySelector("canvas").style.cursor = "url('/assets/basicCursor.png'), auto";
            });
            EditorUI.addEventListener("stop", () => {
                this.setTesting(false);
                document.querySelector("canvas").style.cursor = `url(/'assets/${this.tool == 0 ? "brushCursor.png" : "basicCursor.png"}'), auto`;
            });
            EditorUI.addEventListener("eraser", () => {
                this.selectedItemEntity.texture.src = AssetLoader.assets["menu/eraser"].src;
                this.selectedItemEntity.rotation = 0;
            });
            EditorUI.addEventListener("spawn", () => {
                this.holdingEntity = spawnflag;
            });
            EditorUI.addEventListener("save", () => {
                EditorUI.openPublishLevelScreen();
            })
            EditorUI.addEventListener("selectblock", (name) => {
                this.selectedItemEntity.rotation = EditorUI.rotation * (Math.PI/2);
                this.selectedItemEntity.texture.src = getIcon(name);
                
                const selectedBlock = AssetLoader.blocks[name];
                if(!selectedBlock || !selectedBlock.rotatable) this.selectedItemEntity.rotation = 0;
            });
            EditorUI.addEventListener("rotate", (rotation) => {
                this.selectedItemEntity.rotation = rotation * (Math.PI/2);
    
                const rotatedBlock = AssetLoader.blocks[EditorUI.selectedBlockName];
                if(!rotatedBlock || !rotatedBlock.rotatable) this.selectedItemEntity.rotation = 0;
            });
            EditorUI.addEventListener("select", () => {
                this.tool = 1;
                document.querySelector("canvas").style.cursor = "url('/assets/basicCursor.png'), auto";
            });
            EditorUI.addEventListener("brush", () => {
                this.tool = 0;
                document.querySelector("canvas").style.cursor = "url('/assets/brushCursor.png'), auto";
            });
            
            document.querySelector("canvas").style.cursor = "url('/assets/brushCursor.png'), auto";
    
            EditorUI.addEventListener("click-save-locally", (name, desc) => {
                const save = compressLevel(name, desc);
                this.dispatchEvent("save-locally", save);
            });
            EditorUI.addEventListener("click-save-online", (name, desc) => {
                const save = compressLevel(name, desc);
                this.dispatchEvent("save-online", save);
            });
        }
        //Zoom view in and out
        document.body.addEventListener("wheel", (e) => {
            if(this.testing || EditorUI.inPopup) return;
            
            if(e.deltaY > 0) {
                Renderer.viewport.zoom /= 1.1;
            } else {
                Renderer.viewport.zoom *= 1.1;
            }
        })

        EditorUI.openCategory(0);
        EditorUI.selectBlock("brick");

        Input.addEventListener("mousedown", (button) => {
            if(mouseOverUI) return;
            if(!this.holdingEntity && this.tool == 0 && button == 0) {
                this.drawing = true;
            } else if(this.tool == 1 && button == 0) {
                if(Math.abs(deathZone - Renderer.getWorldPos(0,Input.mouseY)[1]) < 0.2 / Renderer.viewport.zoom) this.draggingDeathZone = true;
            }
            if(button == 1) {
                this.panning = true;
                this.panStart = [Input.mouseX,Input.mouseY];
                this.viewportPanStart = [Renderer.viewport.x,Renderer.viewport.y];
            }
        })
        Input.addEventListener("mouseup", (button) => {


            if(button == 0) {
                if(this.holdingEntity) {
                    this.holdingEntity.x = Math.floor(this.holdingEntity.x) + 0.5;
                    this.holdingEntity.y = Math.floor(this.holdingEntity.y) + 0.5;
                    this.holdingEntity = null;
                }
                this.drawing = false;
                this.draggingDeathZone = false;
            }
            if(button == 1) {
                this.panning = false;
            }
        })
        
        EditorUI.addEventListener("start", () => {
            this.testing = true;
        })
    }
    static draw() {
        let selectedItemPos = Renderer.getWorldPos(Input.mouseX, Input.mouseY);
        let dist = Math.sqrt((selectedItemPos[0] - lastItemPos[0])**2 + (selectedItemPos[1] - lastItemPos[1])**2);

        this.selectedItemEntity.hidden = (this.holdingEntity) || (this.testing) || (EditorUI.inPopup);

        if(!this.testing && !EditorUI.inPopup) {
            if(this.panning) {
                let [x, y] = Renderer.getWorldPos(...this.panStart);
                let [x2, y2] = Renderer.getWorldPos(Input.mouseX, Input.mouseY);
                x -= x2;
                y -= y2;
                
                

                x += this.viewportPanStart[0];
                y += this.viewportPanStart[1];

                Renderer.viewport.x = x; 
                Renderer.viewport.y = y; 
            } else {
                this.selectedItemEntity.x += ((Math.floor(selectedItemPos[0]) + 0.5) - this.selectedItemEntity.x) / 4;
                this.selectedItemEntity.y += ((Math.floor(selectedItemPos[1]) + 0.5) - this.selectedItemEntity.y) / 4;
                this.selectedItemEntity.hidden ||= this.tool != 0;

                if(this.holdingEntity) {
                    this.holdingEntity.x = this.selectedItemEntity.x;
                    this.holdingEntity.y = this.selectedItemEntity.y;
                }

            }

            if(Input.keysPressed.includes("w")) Renderer.viewport.y -= 0.5/Renderer.viewport.zoom;
            if(Input.keysPressed.includes("s")) Renderer.viewport.y += 0.5/Renderer.viewport.zoom;
            if(Input.keysPressed.includes("a")) Renderer.viewport.x -= 0.5/Renderer.viewport.zoom;
            if(Input.keysPressed.includes("d")) Renderer.viewport.x += 0.5/Renderer.viewport.zoom;
            


            if(this.drawing) {
                let dx = lastItemPos[0] - selectedItemPos[0];
                let dy = lastItemPos[1] - selectedItemPos[1];
                
                let rotation = EditorUI.rotation;
                const block = AssetLoader.blocks[EditorUI.selectedBlockName];
                const rotatable = block?.rotatable ?? false;

                for(let i = 0; i <= 1; i += 1/dist) {
                    let x = Math.lerp(0, dx, i) + selectedItemPos[0];
                    let y = Math.lerp(0, dy, i) + selectedItemPos[1];

                    tilemap.setTile(x, y, EditorUI.selectedBlock, rotatable ? rotation : 0);
                }
            }
            if(this.draggingDeathZone) {
                deathZone = Renderer.getWorldPos(0,Input.mouseY)[1];
            }

            lastItemPos = selectedItemPos;
        }
    }

    static setTesting(testing) {
        this.testing = testing;
        const el1 = document.querySelector("#editor-selected-block");
        const el2 = document.querySelector("#selection-hint");
        const el3 = document.querySelector("#editor-bar-bottom");
        const el4 = document.querySelector("#editor-menu-items");
        const el5 = document.querySelector("#editor-selection-tools");
        const el6 = document.querySelector("#editor-playtesting-menu");

        if(testing) {
            this.preview = Renderer.viewport.properties;
            el1.classList.add("hidden");
            el2.classList.add("hidden");
            el3.classList.add("hidden");
            el4.classList.add("hidden");
            el5.classList.add("hidden");
            el6.classList.remove("hidden");
        } else {
            Renderer.viewport.properties = this.preview;
            el1.classList.remove("hidden");
            el2.classList.remove("hidden");
            el3.classList.remove("hidden");
            el4.classList.remove("hidden");
            el5.classList.remove("hidden");
            el6.classList.add("hidden");
        }
        
        this.dispatchEvent(testing ? "start" : "stop");
    }

    static submissionError(body) {
        EditorUI.submissionError(body);
    }
    static submissionSuccess(body) {
        EditorUI.submissionSuccess(body);
    }
}

module.exports = Editor;