const { getSearchQuery, convertDifficultyToImagePath, convertDifficultyToString, parseTime, createCustomDropdowns, fixIframes } = require("../utils.js");

// Get a list of levels
async function getLevelList(sortType) {
    let response = await fetch(`list?sort=${sortType}`, {
        method: "get",
    })

    let data = await response.json();
    return data;
}

const plateTemplate = document.querySelector("#level-plate-template");

function hideLevelPopout() {
    let selectedLevel = document.querySelector(".selected-level");
    let levelList = document.querySelector("#level-list");
    let levelListHeader = document.querySelector("#level-list-header");

    selectedLevel.classList.add("hidden");
    levelList.classList.remove("hidden");
    levelListHeader.classList.remove("hidden");

    selectedLevel.hidden = true;
    levelList.hidden = false;
    levelListHeader.hidden = false;
    
    history.pushState(null, null, "/browse");
    document.querySelector("title").innerText = `Platformer Game Indev - Browse`;
}
function showLevelPopout() {
    let selectedLevel = document.querySelector(".selected-level");
    let levelList = document.querySelector("#level-list");
    let levelListHeader = document.querySelector("#level-list-header");

    selectedLevel.classList.remove("hidden");
    levelList.classList.add("hidden");
    levelListHeader.classList.add("hidden");

    selectedLevel.hidden = false;
    levelList.hidden = true;
    levelListHeader.hidden = true;
}

function selectLevel(level, element) {
    const el = document.querySelector(".selected-level");
    el.classList.remove("hidden");
    
    el.querySelector(".desc").textContent = level.desc;
    el.querySelector(".title").textContent = level.name;
    el.querySelector(".date-published").textContent = parseTime(level.time ?? 0);
    el.querySelector(".author").textContent = level.author.name;
    el.querySelector(".author").href = `/user/${level.author.id}`;
    el.querySelector(".likes").textContent = level.likes ?? 0;
    el.querySelector(".difficulty > img").src = convertDifficultyToImagePath(level.difficulty);
    el.querySelector(".difficulty > span").textContent = convertDifficultyToString(level.difficulty);
    el.querySelector(".id").textContent = level.id;

    document.querySelector("#play-current-level").href = "/play?level="+level.id;
    showLevelPopout();
    
    history.pushState(null, null, "/browse?level="+level.id);
    document.querySelector("title").innerText = `Platformer Game Indev - Browse | ${level.name}`;

    currentLevel = level;
}

function createLevelPlate(level) {
    const plate = plateTemplate.content.cloneNode(true);
    level.difficulty ??= -1;
    
    plate.querySelector(".title").textContent = level.name ?? "Title";
    plate.querySelector(".author").textContent = level.author.name ?? "Author";
    plate.querySelector(".difficulty").src = convertDifficultyToImagePath(level.difficulty);
    plate.querySelector(".likes").textContent = level.likes ?? 0;

    if(!level.new) plate.querySelector(".level-entry").classList.remove("new");
    if(level.played) plate.querySelector(".level-entry").classList.remove("unplayed");

    let p = document.createElement("div");
    p.appendChild(plate);
    
    return p.children[0];
}

function loadLevels(levels) {
    let query = getSearchQuery();
    
    let list = document.querySelector("#level-list");
    for(let level of levels) {
        let el = createLevelPlate(level);

        //.appendChild returns the object that was added, which contains the addEventListener method and other data
        el = list.appendChild(el);

        console.log(el);
        
        el.addEventListener("click", (e) => {
            selectLevel(level, el);
        })

        // If level id saved in URL
        if(level.id == query.level) selectLevel(level, el);
    }
}

getLevelList("recent").then(loadLevels);

//Close level popout
document.querySelector(".selected-level > .close-popup").addEventListener("click", hideLevelPopout);

//Close browse page
document.querySelector("#level-list-header > .close-popup").addEventListener("click", () => {
    // document.location = "/"
});

//Fix iframe sizing
fixIframes();
createCustomDropdowns();