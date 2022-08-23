const checkRegistration = require("../../common/registration-checker.js");
const cookies = require("js-cookie");
const { getAccountData, parseTime } = require("../utils.js");

const login = document.querySelector("#login-form");
const register = document.querySelector("#register-form");
const profile = document.querySelector("#profile-content");

let account = null;

async function start() {
    account = await getAccountData();
    console.log(account);

    if (account != null) onLoggedIn();
    else clickLoginTab();
}

async function onLoggedIn() {
    document.querySelector("#login-tab").disabled = true;
    document.querySelector("#register-tab").disabled = true;
    document.querySelector("#profile-tab").disabled = false;

    profile.querySelector(".username").innerText = account.username;
    profile.querySelector(".email").innerText = account.email;
    profile.querySelector(".creation-date").innerText = parseTime(account.creationDate);
    profile.querySelector(".id").innerText = account.id;

    clickProfileTab();
}

async function tryRegister() {

    const username = register.querySelector("input.username").value;
    const password = register.querySelector("input.password").value;
    const passwordConfirm = register.querySelector("input.password-confirm").value;
    const email = register.querySelector("input.email").value;

    checkRegistration(username, password, passwordConfirm, email);

    const body = { username, password, passwordConfirm, email };

    const request = await fetch("/register", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const response = await request.json();

    console.log("response from registration: ", response);

    if (response.type == "error") throw response.message;
    return response;
}

async function tryLogin() {

    const username = login.querySelector("input.username").value;
    const password = login.querySelector("input.password").value;

    const body = { username, password };

    const request = await fetch("/login", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const response = await request.json();

    console.log("response from logging in: ", response);

    if (response.type == "error") throw response.message;
    return response;
}

register.addEventListener("submit", async e => {
    e.preventDefault();

    register.querySelector("input[type=\"submit\"]").disabled = true;

    try {
        register.querySelectorAll(".error").forEach(child => {
            child.innerHTML = "";
        })
        let response = await tryRegister();

        cookies.set("token", response.token);
        account = response;
        onLoggedIn();
    } catch (err) {
        register.querySelector("input[type=\"submit\"]").disabled = false;

        if (!(err instanceof Array)) {
            register.querySelector(".error").innerText = err.message ?? err;
            return;
        }

        const [element, message] = err;

        register.querySelector(".error." + element).innerText = message;
    }

})

login.addEventListener("submit", async e => {
    e.preventDefault();

    login.querySelector("input[type=\"submit\"]").disabled = true;

    try {
        login.querySelectorAll(".error").forEach(child => {
            child.innerHTML = "";
        })
        let response = await tryLogin();

        cookies.set("token", response.token);
        account = response;
        onLoggedIn();
    } catch (err) {
        login.querySelector("input[type=\"submit\"]").disabled = false;

        if (!(err instanceof Array)) {
            login.querySelector(".error").innerText = err.message ?? err;
            return;
        }

        const [element, message] = err;

        const selector = ".error." + element;
        login.querySelector(selector).innerText = message;
    }

})

function clickLoginTab() {
    document.querySelector("#login-content").hidden = false;
    document.querySelector("#register-content").hidden = true;
    document.querySelector("#profile-content").hidden = true;

    login.querySelector("input").focus();
    login.querySelector("input").value;
}
function clickRegisterTab() {
    document.querySelector("#login-content").hidden = true;
    document.querySelector("#register-content").hidden = false;
    document.querySelector("#profile-content").hidden = true;

    login.querySelector("input").focus();
    login.querySelector("input").value;
}
function clickProfileTab() {
    document.querySelector("#login-content").hidden = true;
    document.querySelector("#register-content").hidden = true;
    document.querySelector("#profile-content").hidden = false;
}

document.querySelector("#login-tab").addEventListener("click", clickLoginTab);
document.querySelector("#register-tab").addEventListener("click", clickRegisterTab);
document.querySelector("#profile-tab").addEventListener("click", clickProfileTab);
document.querySelector("#log-out").addEventListener("click", e => {
    cookies.remove("token");
    document.location = document.location;
})

start();