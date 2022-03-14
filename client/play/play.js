console.log("attach");
const Input = require("../input.js");
const Renderer = require("./renderer.js");
const SelectedItem = require("../entities/selecteditem.js");
const ServerInterface = require("../serverinterface.js");
const Listener = require("../listeners.js");
const EntityHandler = require("../entityhandler.js");
const AssetLoader = require("../assetloader.js");

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
function getSearchQuery() {
    let values = {};
    window.location.search.replace(/\?/g,"").split("&").forEach(elem => {
        let props = elem.split("=");
        let key = props.splice(0,1)[0];
        let value = props.join("=");
        values[key] = value;
    });
    return values;
}
class Play {
    static hideStartScreen() {
        const el = document.querySelector("#loading-menu");
        el.classList.add("hidden");
    }
    static showStartScreen() {
        const el = document.querySelector("#loading-menu");
        const popupOptions = el.querySelector(".popup-options");

        el.querySelector("h1").textContent = capitalizeFirstLetter(level.name);
        el.querySelector(".loading-gif").classList.add("hidden");
        
        const playButton = document.createElement("input");
        playButton.type = "button";
        playButton.value = "Play";
        
        const browseButton = document.createElement("input");
        browseButton.type = "button";
        browseButton.value = "Back to browse";
        
        popupOptions.appendChild(playButton);
        popupOptions.appendChild(browseButton);

        playButton.addEventListener("click", () => {
            this.dispatchEvent("start");
            this.hideStartScreen();
        })
    }
    static showWinScreen() {
        const el = document.querySelector("#win-screen");

        el.classList.remove("hidden");

        let ratingButtons = el.querySelector(".difficulty-rating > .buttons").children;
        for(let button of [...ratingButtons]) {
            button.addEventListener("click", () => {
                for(let i of [...ratingButtons]) i.classList.remove("selected");
                button.classList.add("selected");
            })
        }

        let responseButtons = el.querySelector(".popup-options").children;

        // Open level page
        responseButtons[0].addEventListener("click", () => {
            window.location = `/browse?level=${window.level.id}`;
        })

        // Replay
        responseButtons[1].addEventListener("click", () => {
            window.location.reload();
        })

        // Back to browse
        responseButtons[2].addEventListener("click", () => {
            window.location = `/browse`;
        })

        el.querySelector(".title").textContent = capitalizeFirstLetter(window.level.name);
    }
    static async win() {
        this.showWinScreen();
    }
    static async setup() {
        Listener.attach(this);

        const { level } = getSearchQuery();

        if(!level) window.location = "/browse";

        let levelData = await ServerInterface.getLevel(level);
        window.level = levelData.body;

        document.querySelector("title").innerText = `Platformer Game Indev - ${levelData.body.title}`;
        
        tilemap.load(levelData.body.blocks);

        player.x = spawnflag.x;
        player.y = spawnflag.y;
        player.spawnX = spawnflag.x;
        player.spawnY = spawnflag.y;
        Renderer.viewport.x = player.x;
        Renderer.viewport.y = player.y;
        deathZone = 240;

        setTimeout(() => {
            this.showStartScreen();
            this.showWinScreen();
        },250);
    }
    static draw() {
        
    }
}

module.exports = Play;