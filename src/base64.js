//from base64
global.atob = function(text) {
    return Buffer.from(text, 'base64').toString();
}

//to base64
global.btoa = function(text) {
    return Buffer.from(text).toString('base64');
}