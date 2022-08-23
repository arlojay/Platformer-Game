const cookie = require("js-cookie");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getSearchQuery() {
    let values = {};
    window.location.search.replace(/\?/g, "").split("&").forEach(elem => {
        let props = elem.split("=");
        let key = props.splice(0, 1)[0];
        let value = props.join("=");
        values[key] = value;
    });
    return values;
}

function mod(a, n) {
    return ((a % n) + n) % n
}
function parseTime(timeString) {
    let date = new Date(timeString);

    let year = date.getFullYear();
    let month = date.toLocaleString("default", { month: "short" });
    let day = date.getDate();
    let dayName = date.toLocaleString("default", { weekday: "short" });
    let fullDayName = date.toLocaleString("default", { weekday: "long" });

    let hour = mod(date.getHours() - 1, 12) + 1;
    let minute = date.getMinutes();
    let ms = date.getTime();

    let meridian = date.getHours() > 11 ? "PM" : "AM";
    let humanTime = `${hour}:${(minute + "").padStart(2, "0")} ${meridian}`

    hour = mod(hour - 1, 12) + 1;

    if (Date.now() - ms < 60000) {

        // Show "a few seconds ago" if less than 1 mins ago
        return "A few seconds ago";

    } else if (Date.now() - ms < 3600000) {

        // Show "x mins ago" if less than an hour ago
        return Math.round((Date.now() - ms) / (60000)) + " mins ago";

    } else if (Math.floor((Date.now() - 21600000) / 86400000) - Math.floor((ms - 21600000) / 86400000) == 0) {

        // Show "today at xx:xx XX" if message was sent today
        return `Today at ${humanTime}`;

    } else if (Math.floor((Date.now() - 21600000) / 86400000) - Math.floor((ms - 21600000) / 86400000) == 1) {

        // Show "yesterday at xx:xx XX" if message was sent yesterday
        return `Yesterday at ${humanTime}`;

    } else if (Math.floor((Date.now() - 21600000) / 604800000) - Math.floor((ms - 21600000) / 604800000) == 0) {

        // Show "day at xx:xx XX" if message was sent in the past week
        return `${fullDayName} at ${humanTime}`;

    } else {

        // Show "xx/xx/xxxx at xx:xx XX" if message was sent over a week ago
        return `${month}/${day}/${year} at ${humanTime}`

    }

    return `${month} ${day}, ${hour}:${minute} ${meridian}`;
}

function convertDifficultyToString(number) {
    switch (number) {
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
    switch (number) {
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

function createCustomDropdowns() {
    let dropdowns = document.querySelectorAll(".dropdown");

    [...dropdowns].forEach(el => {
        let optionsObject = [];
        let selectedOption = null;

        let options = [...el.querySelectorAll("option")];

        let optionsList = document.createElement("div");

        options.forEach(option => {
            let el = document.createElement("div");
            el.innerHTML = option.innerHTML;
            el.value = option.value;
            el.name = option.name;

            el.classList.add("dropdown-option");
            optionsList.appendChild(el);

            const entry = {
                text: option.innerHTML,
                value: option.value,
                name: option.name,
                element: el
            };
            optionsObject.push(entry)
            option.remove();

            el.addEventListener("click", e => {
                toggleOpen();
                selectOption(entry);
            })
        })

        el.innerHTML = `<div class="selected"></div>`;

        const selectOption = (option) => {
            el.querySelector(".selected").innerHTML = option.text;
            selectedOption = option;
        }
        const resize = () => {
            let rect = el.getBoundingClientRect();

            optionsList.style.position = "absolute";
            optionsList.style.left = rect.left + "px";
            optionsList.style.top = rect.bottom + "px";
            optionsList.style.width = (rect.right - rect.left) + "px";
            optionsList.style.overflowX = "hidden";
        }
        const toggleOpen = () => {
            resize();

            open = !open;
            el.dataset.open = open;
        }

        resize();
        selectOption(optionsObject[0]);

        optionsList.classList.add("options");

        let open = false;
        el.querySelector(".selected").addEventListener("click", toggleOpen)
        el.dataset.open = false;

        el.appendChild(optionsList);
    });
}

function fixIframes() {
    const f = () => {
        const iframes = document.querySelectorAll("iframe");
        [...iframes].forEach(frame => {
            const size = frame.getBoundingClientRect();
            frame.width = size.right - size.left;
            frame.height = size.bottom - size.top;
        })
    }
    window.addEventListener("resize", f);
    f();
}

function cloneNode(template) {
    if (typeof template == "string") template = document.querySelector(template);

    const el = template.content.cloneNode(true);
    const a = document.createElement("div");
    a.appendChild(el);
    return a.children[0];
}

function stringifyMarkdown(element) {

}
function parseMarkdown(text) {
    let bold = false;
    let italic = false;
    let underlined = false;
    let boldItalic = false;

    const element = document.createElement("div");
    let currentBlock = document.createElement("span");
    let currentText = "";

    const finishBlock = () => {
        if (currentText == "") return;


        if (bold || boldItalic) currentBlock.classList.add("bold");
        if (italic || boldItalic) currentBlock.classList.add("italic");
        if (underlined) currentBlock.classList.add("underlined");

        currentBlock.innerText = currentText;
        currentText = "";

        element.appendChild(currentBlock);
        currentBlock = document.createElement("span");
    }

    for (let i = 0; i < text.length; i++) {
        const currentChar = text[i] ?? "";
        const lastChar = text[i - 1] ?? "";
        const nextChar = text[i + 1] ?? "";

        if (lastChar != "\\") {
            if (lastChar == "*" && currentChar == "*" && nextChar == "*") {
                finishBlock();
                boldItalic = !boldItalic;

                continue;
            }

            if (lastChar != "*" && currentChar == "*" && nextChar != "*") {
                finishBlock();
                italic = !italic;

                continue;
            }

            if (lastChar != "*" && currentChar == "*" && nextChar == "*") {
                continue;
            }
            if (lastChar == "*" && currentChar == "*" && nextChar != "*") {
                finishBlock();
                bold = !bold;

                continue;
            }

            if (lastChar != "_" && currentChar == "_" && nextChar != "_") {
                finishBlock();
                italic = !italic;

                continue;
            }

            if (lastChar != "_" && currentChar == "_" && nextChar == "_") {
                continue;
            }
            if (lastChar == "_" && currentChar == "_" && nextChar != "_") {
                finishBlock();
                underlined = !underlined;

                continue;
            }
        }

        currentText += currentChar;
    }

    finishBlock();

    return element;
}

async function getAccountData() {
    const token = cookie.get("token");
    if (!token) return;

    const request = await fetch("/info?" + new URLSearchParams({ token }), { method: "GET" });

    const data = await request.json();

    if (data.type == "error") throw data.message;

    return data.message;
}

//Automatically executes
{

    function setupPWA() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/serviceworker.js")
                .then(() => { console.log("Service Worker Registered"); });
        }


        let promptElement = document.createElement("div");
        promptElement.setAttribute("id", "install-desktop-app");
        promptElement.innerHTML = `
        <h2>Desktop version ready</h2>
        <button>Install</button>
        `;


        document.body.appendChild(promptElement);
        promptElement.hidden = true;

        let addBtn = promptElement.querySelector("button");

        window.addEventListener("beforeinstallprompt", (deferredPrompt) => {
            deferredPrompt.preventDefault();

            promptElement.hidden = false;

            addBtn.addEventListener("click", (e) => {
                addBtn.style.display = "none";
                deferredPrompt.prompt();

                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === "accepted") {
                        console.log("User accepted the A2HS prompt");
                    } else {
                        console.log("User dismissed the A2HS prompt");
                    }
                    deferredPrompt = null;
                });
            });
        });
    }
    function setupFadeTransition() {

        document.querySelector("#transition-fade") ?.remove();



        const cascadeWall = document.createElement("div");
        cascadeWall.setAttribute("id", "transition-fade");
        document.body.insertBefore(cascadeWall, document.body.children[0]);

        let t2 = Date.now();
    }
    function fadeToBlack() {
        document.querySelector("#transition-fade") ?.classList.add("activate");
    }

    [...document.querySelectorAll("a")].forEach(el => {
        el.addEventListener("click", fadeToBlack);
    })

    setupFadeTransition();
    if (document.querySelector('link[rel="manifest"]') != null) setupPWA();
}

module.exports = {
    capitalizeFirstLetter,
    getSearchQuery,
    mod,
    parseTime,
    convertDifficultyToString,
    convertDifficultyToImagePath,
    createCustomDropdowns,
    fixIframes,
    cloneNode,
    parseMarkdown,
    stringifyMarkdown,
    getAccountData
};