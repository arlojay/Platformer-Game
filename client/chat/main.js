const cookie = require("js-cookie");
const { fixIframes, cloneNode, parseTime, parseMarkdown } = require("../utils.js");

fixIframes();

function addMessage(message) {
    const { author, content, time } = message;

    const el = cloneNode("#message-template");

    const elements = {
        author: el.querySelector(".author"),
        content: el.querySelector(".content"),
        time: el.querySelector("time")
    }

    if (author ?.name != null)
        elements.author.textContent = author.name;

    if (author ?.id != null)
        elements.author.href = "/user/" + author.id;

    if (content != null)
        elements.content.innerText = content;

    const updateTime = () => {
        if (time != null)
            elements.time.innerText = parseTime(time);
    }

    updateTime();
    setTimeout(() => setInterval(updateTime, 5000), Math.random * 5000);

    const logs = document.querySelector("#logs");
    let atBottom = logs.scrollTop > logs.scrollHeight - logs.clientHeight - 10;
    logs.appendChild(el);

    if (atBottom) logs.scrollTop = logs.scrollHeight;
}

async function loadMessages() {
    const request = await fetch("/chat/messages?from=0&to=50");
    const logs = document.querySelector("#logs");

    const response = await request.json();

    response.forEach(message => {
        addMessage(message);
    })

    logs.scrollTop = logs.scrollHeight - logs.clientHeight
}

let usersOnline = new Map();

function userJoin(user) {

    let instances = usersOnline.get(user.id) ?? 0;

    usersOnline.set(user.id, ++instances);
    console.log(usersOnline);

    const el = document.querySelector("#online-user-" + user.id) ?? cloneNode("#online-user-template");
    el.classList.add("outset");

    el.querySelector(".name").innerText = user.name;
    el.querySelector(".name").href = "/user/" + user.id;
    el.querySelector(".count").innerText = instances;

    el.setAttribute("id", "online-user-" + user.id);

    if (!document.body.contains(el))
        document.querySelector("#online").appendChild(el);
}

function userLeave(user) {

    let instances = usersOnline.get(user.id) ?? 0;

    usersOnline.set(user.id, --instances);
    console.log(usersOnline);

    const el = document.querySelector("#online-user-" + user.id);

    if (instances <= 0) return el.remove();

    el.querySelector(".count").innerText = instances;
}

function onMessage(data) {
    switch (data.type) {
        case "message":
            addMessage(data.message);
            break;
        case "user-join":
            userJoin(data.message);
            break;
        case "user-leave":
            userLeave(data.message);
            break;
        case "authenticated":
            //Authentication failed
            if (data.message == null) {
                addMessage({
                    content: "You need to be signed in to be able to use the chat"
                })

                //Authentication succeeded
            } else {
                addMessage({
                    content: "Successfully connected to server"
                })
                usersOnline.set(data.message.id, -1);
                loadMessages();
            }
            break;
    }
}

function onOpen(ws) {
    socket = ws;

    ws.send(JSON.stringify({
        type: "authenticate",
        message: cookie.get("token")
    }))
}

let socket = null;
function connect() {
    const ws = new WebSocket(document.location.protocol.replace("http", "ws") + "//" + document.location.host + "/chat");

    ws.onopen = function() {
        onOpen(ws);
    };

    ws.onmessage = function(e) {
        onMessage(JSON.parse(e.data));
    };

    ws.onclose = function(e) {
        console.info("Socket is closed. Reconnect will be attempted in 1 second.", e.reason);
        setTimeout(function() {
            connect();
        }, 1000);
    };

    ws.onerror = function(err) {
        console.info("Socket encountered error: ", err.message, "Closing socket");
        ws.close();
    };
}

connect();


document.querySelector("#input").addEventListener("submit", e => {
    e.preventDefault();

    if (!socket) return addMessage({ content: "Socket is currently disconnected" });

    const textbox = document.querySelector("#input-text");
    socket.send(JSON.stringify({
        type: "message",
        message: textbox.value
    }))

    textbox.value = "";
})