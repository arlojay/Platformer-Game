require("../utils.js");
const constants = require("../constants.js");
const cookie = require("js-cookie");
document.head.querySelector("title").innerText = "Platformer Game " + constants.version;

//Window bug
window.scrollTo(0, 0);

const BACKGROUND_COUNT = 22;

let t = 0;
setInterval(() => {
    t += 0.01;

    let x = Math.sin(t * 0.31512 + 0.41625);
    let y = Math.sin(t * 0.66132 + 5.12612);

    x += Math.sin(t * 0.00215 + 9.65126);
    y += Math.sin(t * 0.01624 - 3.51261);

    x /= 3;
    y /= 3;

    document.body.querySelector("#background-image").style.backgroundPosition = `${x * window.innerWidth}px ${y * window.innerHeight}px`
}, 10)

setTimeout(() => {
    document.body.querySelector("#background-image").style.background = "url(https://platform.arlojay.com/assets/title-backgrounds/" + Math.ceil(Math.random() * BACKGROUND_COUNT) + ".png)";
});

if (!localStorage.played) {
    document.querySelector(".center-center-align").classList.remove("hidden");
    document.querySelector("#welcome-modal").classList.remove("hidden");

    [...document.querySelector("#welcome-modal > .popup-options").children].forEach((el) => {
        el.addEventListener("click", () => {
            localStorage.played = true;
            document.querySelector(".center-center-align").classList.add("hidden");
            document.querySelector("#welcome-modal").classList.add("hidden");
        })
    })

    localStorage.played = true;
}



let patchNotesOpen = false;
document.querySelector("#patch-notes .open-header").addEventListener("click", e => {
    patchNotesOpen = !patchNotesOpen;

    document.querySelector("#patch-notes").dataset.open = patchNotesOpen;
    console.log("click");
})


if (cookie.get("token") == null) document.querySelector("a[href=\"/account\"]").classList.add("flash");