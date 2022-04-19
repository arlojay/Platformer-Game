require("../utils.js");
const constants = require("../constants.js");
document.head.querySelector("title").innerText = 

//Window bug
window.scrollTo(0,0); 


let backgrounds = [];

function loadBackgrounds() {
    return new Promise(async (res,rej) => {
        let promises = [];
        for(let i = 1; i <= 22; i++) {
            let bg = new Image();
            bg.src = `/assets/title-backgrounds/${i}.png`;
    
            promises.push(new Promise((res,rej) => {
                bg.onload = () => {
                    let canvas = document.createElement("canvas");
                    canvas.width = bg.width;
                    canvas.height = bg.height;
                    canvas.getContext("2d").drawImage(bg,0,0);
                    
                    let data = canvas.toDataURL();
                    backgrounds.push([data,bg]);
                    res([data, bg, i]);
                }
            }))
        }

        promises[Math.floor(Math.random() * promises.length)].then(res);
    })
}

let t = 0;
setInterval(() => {
    t+= 0.01;

    let x = Math.sin(t * 0.31512 + 0.41625);
    let y = Math.sin(t * 0.66132 + 5.12612);

    x += Math.sin(t * 0.00215 + 9.65126);
    y += Math.sin(t * 0.01624 - 3.51261);

    x /= 3;
    y /= 3;
    
    document.body.querySelector("#background-image").style.backgroundPosition = `${x*window.innerWidth}px ${y*window.innerHeight}px`
}, 10)

loadBackgrounds().then((res) => {
    const [data, bg, i] = res;

    console.log("loaded "+i,data);
    document.body.querySelector("#background-image").style.background = `url("${data}")`;
})

if(!localStorage.played) {
    document.querySelector(".center-center-align").classList.remove("hidden");
    document.querySelector("#welcome-modal").classList.remove("hidden");

    [...document.querySelector("#welcome-modal > .popup-options").children].forEach((el) => {
        el.addEventListener("click",() => {
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