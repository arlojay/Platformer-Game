console.log("attach");

const Listener = require("../listeners.js");
const Input = require("../input.js");
const AssetLoader = require("../assetloader.js");
const cookies = require("js-cookie");

class EditorUI {
    static blockCategories = [
        {
            "icon": "brick",
            "name": "Solid blocks",
            "blocks": [
                "brick",
                "metal",
                "invisible",
                "wood",
                "technometal",
                "blue"
            ]
        },
        {
            "icon": "spike",
            "name": "Hazards",
            "blocks": [
                "spike",
                "roundspike",
                "lava",
                "sludge",
                "fireballshooter"
            ]
        },
        {
            "icon": "chain",
            "name": "Decoration",
            "blocks": [
                "chain",
                "technochain",
                "water",
                "grate",
                "levetatingblock"
            ]
        },
        {
            "icon": "flag",
            "name": "Special blocks",
            "blocks": [
                "flag",
                "flagblock",
                "spawnpoint",
                "spawnpointblock",
                "bouncepad",
                "jumporb",
                "forcefield",
                "gravityorb",
            ]
        },
        {
            "icon": "menu/experimental",
            "name": "Experimental (Blocks Still in Development)",
            "blocks": [
                "lock"
            ]
        }
    ]
    static selectedCategory = 0;
    static selectedBlock = 0;
    static selectedBlockName = "";
    static rotation = 0;

    static inPopup = false;

    static openCategory(index) {
        let category = this.blockCategories[index];
        if (!category) return;

        this.selectedCategory = index;

        //Hide all block categories except selected one
        const blockContainers = document.querySelector("#editor-blocks").children;
        [...blockContainers].forEach((child) => {
            if (child.getAttribute("id") == "category-" + index + "-blocks") {
                child.style.visibility = "visible";
            } else {
                child.style.visibility = "hidden";
            }
        })

        this.dispatchEvent("opencategory", this.selectedCategory);
    }

    static selectBlock(name) {
        let block = AssetLoader.blocks[name];
        if (!block) return;

        const clickedElement = document.querySelector(`#category-${this.selectedCategory}-block-${name}`);

        document.querySelector("#editor-selected-block > div > img").src = clickedElement.querySelector("img").src;

        this.selectedBlock = block.id;
        this.selectedBlockName = name;
        this.dispatchEvent("selectblock", name, block.id);
    }

    static showHint(text) {
        const hintElement = document.querySelector("#selection-hint");
        hintElement.hidden = false;
        hintElement.textContent = text;
    }

    static hideHint() {
        const hintElement = document.querySelector("#selection-hint");
        hintElement.hidden = true;
    }

    static setup() {
        Listener.attach(this);

        this.loadCategories();

        //Setup top menu buttons
        document.querySelector("#eraser").addEventListener("click", () => {
            this.selectedBlock = -1;
            this.selectedBlockName = "";
            this.dispatchEvent("eraser");
        })
        document.querySelector("#spawn").addEventListener("click", () => {
            this.dispatchEvent("spawn");
        })

        document.querySelector("#save").addEventListener("click", () => {
            this.dispatchEvent("save");
        })

        document.querySelector("#start").addEventListener("click", () => {
            this.dispatchEvent("start");
        })

        document.querySelector("#stop").addEventListener("click", () => {
            this.dispatchEvent("stop");
        })

        document.querySelector("#brush").addEventListener("click", () => {
            this.dispatchEvent("brush");
        })

        document.querySelector("#select").addEventListener("click", () => {
            this.dispatchEvent("select");
        })

        Input.addEventListener("keydown", (key) => {
            if (key == "r") {
                if (Input.keysPressed.includes("shift")) this.rotation = (this.rotation - 1).mod(4);
                else this.rotation = (this.rotation + 1).mod(4);

                this.dispatchEvent("rotate", this.rotation);
            }
        })

        if (cookies.get("token") == null) {
            document.querySelector("#publish-online").disabled = true;
        }
    }

    static hideLoadingPrompt() {
        const promptBg = document.querySelector("#loading-editor-bg");

        promptBg.classList.add("hidden");
    }

    static loadCategories() {
        for (let i in this.blockCategories) {
            const category = this.blockCategories[i];

            const { icon, name, blocks } = category;

            //Setup ui elements
            const categoryElement = document.createElement("div");
            const imageIcon = document.createElement("img");

            categoryElement.classList.add("menu-icon");
            categoryElement.setAttribute("id", "category-" + i);

            const id = AssetLoader.getIdForBlock(icon);
            imageIcon.src = id != null ? tilemap.getTileImage(id) : `/assets/${icon}.png`;
            imageIcon.draggable = false;

            categoryElement.appendChild(imageIcon);
            categoryElement.addEventListener("click", (e) => {
                this.openCategory(i);
            })
            categoryElement.addEventListener("mouseover", (e) => {
                this.showHint(`${name}`);
            })
            categoryElement.addEventListener("mouseout", (e) => {
                this.hideHint();
            })

            const blockGroupElement = document.createElement("div");
            blockGroupElement.setAttribute("id", "category-" + i + "-blocks");


            for (let block of blocks) {

                //Setup block button
                const blockElement = document.createElement("div");
                const blockImageIcon = document.createElement("img");

                blockElement.classList.add("menu-icon");
                blockElement.setAttribute("id", "category-" + i + "-block-" + block);
                blockImageIcon.src = tilemap.getTileImage(AssetLoader.getIdForBlock(block));
                blockImageIcon.draggable = false;

                blockElement.appendChild(blockImageIcon);
                blockGroupElement.appendChild(blockElement);

                blockElement.addEventListener("click", (e) => {
                    this.selectBlock(block);
                })

                const blockOption = AssetLoader.blocks[block];
                blockElement.addEventListener("mouseover", (e) => {
                    this.showHint(`${blockOption.displayname} | ${blockOption.description}`);
                })
                blockElement.addEventListener("mouseout", (e) => {
                    this.hideHint();
                })
            }

            document.querySelector("#editor-block-groups").appendChild(categoryElement);
            document.querySelector("#editor-blocks").appendChild(blockGroupElement);
        }
    }

    static openPopup(element) {
        element.classList.remove("hidden");
        this.inPopup = true;

        element.querySelector(".close-popup").addEventListener("click", () => {
            this.inPopup = false;
            element.classList.add("hidden");
        });

        element.querySelector("form") ?.addEventListener("submit", (e) => {
            e.preventDefault();
        });
        let options = element.querySelectorAll(".popup-options > input");

        return options
    }

    static openPublishLevelScreen() {
        if (this.inPopup) return;

        const element = document.querySelector("#save-popup");
        const options = this.openPopup(element);

        options[0].onclick = () => {
            const name = element.querySelector(".level-name").value;
            const desc = element.querySelector(".level-desc").value;

            options[0].disabled = true;
            setTimeout(() => {
                this.dispatchEvent("click-save-online", name, desc);
                options[0].disabled = false;
            }, 25)
        }
        options[1].onclick = () => {
            const name = element.querySelector(".level-name").value;
            const desc = element.querySelector(".level-desc").value;

            options[1].disabled = true;
            setTimeout(() => {
                this.dispatchEvent("click-save-locally", name, desc);
                options[1].disabled = false;
            }, 25)
        }
    }

    static submissionSuccess(body) {
        let el = document.querySelector("#submission-message");
        el.textContent = "Level successfully submitted";
        el.setAttribute("class", "success");

        const element = document.querySelector("#save-online-success-popup");
        const options = this.openPopup(element);

        options[0].onclick = () => {
            window.location = `/browse?level=${body.id}`;
        }
        options[1].onclick = () => {
            element.querySelector(".close-popup").click();
        }

        element.querySelector(".level-id").textContent = body.id;
    }
    static submissionError(body) {
        let el = document.querySelector("#submission-message");
        el.textContent = body;
        el.setAttribute("class", "error");
    }
}

module.exports = EditorUI;