console.log("attach");
const Renderer = require("./renderer.js");
const ServerInterface = require("../serverinterface.js");
const Listener = require("../listeners.js");
const { getSearchQuery, capitalizeFirstLetter } = require("../utils.js");

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
        
        const browseButton = document.createElement("a");
        browseButton.classList.add("button");
        browseButton.innerText = "Back to browse";
        browseButton.href = "/browse";
        
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

        document.querySelector("title").innerText = `Platformer Game Indev - ${levelData.body.name}`;
        
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
        },250);

        [...document.querySelectorAll(".open-level-page")].forEach(el => {
            el.href = "/browse?level="+level;
        })
    }
    static draw() {
        
    }
}

module.exports = Play;