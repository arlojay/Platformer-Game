const crypto = require('crypto');

function makeString(input) {
    if (typeof input == "object") {
        return input.toString();
    }
    return `${input}`;
}

//Scramble a string pseudo-randomly using the string as the seed
function scrambleString(str) {
    str = makeString(str);

    const d = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    str = Array.from(str);
    str.sort((a, b) => {
        let c = d.indexOf(a);
        c += d.indexOf(b);
        c %= str.length;
        return (d.indexOf(str[c]) % 2) * 2 - 1;
    })

    return str.join("");
}

//Convert a string to base64 to lengthen it and then scramble it
function abstractString(str, length) {
    str = makeString(str);

    length ??= 32;

    let curString = `${str}`;

    //Encode to base64 a bunch
    while (curString.replace(/=/g, "").length <= length) {
        curString = Buffer.from(curString).toString("base64");
    }

    curString = curString.replace(/=/g, "");

    //Limit to 32 characters
    return scrambleString(curString).slice(0, 32);
}

//Hash a string securely
function hashString(str, method) {
    str = makeString(str);

    method ??= "hex";

    //Hash it with sha256 a bunch
    for (let i = 0; i < 10; i++) {
        str = crypto.createHash("sha256").update(str).digest(method);
    }

    //Scramble it pseudo-randomly to make it harder to decrypt
    str = scrambleString(str);

    return str;
}

module.exports = { scrambleString, abstractString, hashString };