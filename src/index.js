require("./base64.js");
String.prototype.URLify = function() {
    return this
        .replace(/%/g,"%25")
        .replace(/\s/g,"%20")
        .replace(/</g,"%3C")
        .replace(/>/g,"%3E")
        .replace(/#/g,"%23")
        .replace(/\+/g,"%2B")
        .replace(/\{/g,"%7B")
        .replace(/\}/g,"%7D")
        .replace(/\|/g,"%7C")
        .replace(/\\/g,"%5C")
        .replace(/\^/g,"%5E")
        .replace(/~/g,"%7E")
        .replace(/\[/g,"%5B")
        .replace(/\]/g,"%5D")
        .replace(/`/g,"%60")
        .replace(/;/g,"%3B")
        .replace(/\//g,"%2F")
        .replace(/\?/g,"%3F")
        .replace(/:/g,"%3A")
        .replace(/@/g,"%40")
        .replace(/=/g,"%3D")
        .replace(/&/g,"%26")
        .replace(/\$/g,"%24")
}


const Server = require("./server.js");
process.env.IS_DEV = process.argv[2] === "dev";
Server.start();