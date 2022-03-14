// Get a list of levels
async function getLevelList(sortType) {
    let response = await fetch(`list?sort=${sortType}`, {
        method: "get",
    })

    let data = await response.json();
    return data;
}

const plateTemplate = document.querySelector("#level-plate-template");
let currentLevel = null;

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
function mod(a,n) {
    return ((a % n ) + n ) % n
}
function parseTime(timeString) {
    let date = new Date(timeString);

    let year = date.getFullYear();
    let month = date.toLocaleString("default", {month:"short"});
    let day = date.getDate();
    let dayName = date.toLocaleString("default", {weekday: "short"});
    let fullDayName = date.toLocaleString("default", {weekday: "long"});

    let hour = mod(date.getHours() - 1, 12) + 1;
    let minute = date.getMinutes();
    let ms = date.getTime();

    let meridian = date.getHours() > 11 ? "PM" : "AM";
    let humanTime = `${hour}:${(minute+"").padStart(2,"0")} ${meridian}`

    hour = mod(hour-1,12)+1;

    if(Date.now() - ms < 60000) {
        
        // Show "a few seconds ago" if less than 1 mins ago
        return "A few seconds ago";

    } else if(Date.now() - ms < 3600000) {

        // Show "x mins ago" if less than an hour ago
        return Math.round((Date.now() - ms) / (60000)) + " mins ago";

    } else if(Math.floor((Date.now()-21600000)/86400000) - Math.floor((ms-21600000)/86400000) == 0) {

        // Show "today at xx:xx XX" if message was sent today
        return `Today at ${humanTime}`;

    } else if(Math.floor((Date.now()-21600000)/86400000) - Math.floor((ms-21600000)/86400000) == 1) {

        // Show "yesterday at xx:xx XX" if message was sent yesterday
        return `Yesterday at ${humanTime}`;

    } else if(Math.floor((Date.now()-21600000)/604800000) - Math.floor((ms-21600000)/604800000) == 0) {

        // Show "day at xx:xx XX" if message was sent in the past week
        return `${fullDayName} at ${humanTime}`;

    } else {

        // Show "xx/xx/xxxx at xx:xx XX" if message was sent over a week ago
        return `${month}/${day}/${year} at ${humanTime}`

    }

    return `${month} ${day}, ${hour}:${minute} ${meridian}`;
}

function convertDifficultyToString(number) {
    switch(number) {
        case 0:
            return "Novice";
        case 1:
            return "Easy";
        case 2:
            return "Normal";
        case 3:
            return "Hard";
        case 4:
            return "Expert";
        case 5:
            return "Insane";
        case 6:
            return "Demon";
        default:
            return "NA";
    }
}
function convertDifficultyToImagePath(number) {
    switch(number) {
        case 0:
            return "/assets/difficulty-ratings/novice.png";
        case 1:
            return "/assets/difficulty-ratings/easy.png";
        case 2:
            return "/assets/difficulty-ratings/normal.png";
        case 3:
            return "/assets/difficulty-ratings/hard.png";
        case 4:
            return "/assets/difficulty-ratings/expert.png";
        case 5:
            return "/assets/difficulty-ratings/insane.png";
        case 6:
            return "/assets/difficulty-ratings/demon.png";
        default:
            return "/assets/difficulty-ratings/not-applicable.png";
    }
}

function selectLevel(level) {
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
    
    history.pushState(null, null, "/browse?level="+level.id);

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

    /*
        <li>
            <div class="level-entry outset unplayed new">
                <img src="/assets/difficulty-ratings/easy.png" class="difficulty" draggable="false">
                <div class="text">
                    <div class="title">Test level</div>
                    <div class="stats">
                        <div class="author">arlojay</div>
                        <div class="likes error">-12</div>
                    </div>
                </div>
            </div>
        </li>
    */

    return plate;
}

function loadLevels(levels) {
    let query = getSearchQuery();
    
    let list = document.querySelector("#level-list");
    for(let level of levels) {
        let el = createLevelPlate(level);
        list.appendChild(el);
        
        let del = list.querySelector("#temp");
        
        del.removeAttribute("id");
        del.addEventListener("click", (e) => {
            selectLevel(level);
        })

        // If level id saved in URL
        if(level.id == query.level) selectLevel(level);
    }
}

getLevelList("recent").then(loadLevels);

document.querySelector("#play-current-level").addEventListener("click", (e) => {
    document.location = "/play?level="+currentLevel.id;
})