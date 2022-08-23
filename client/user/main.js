const { parseTime } = require("../utils.js");
const { username, creationDate, id } = window.REQUESTING_USER_INFO;

document.querySelector("#username").innerText = username;
document.querySelector("#creation-date").innerText = parseTime(creationDate);
document.querySelector("#id").innerText = id;