const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

module.exports = function(username, password, passwordConfirm, email) {
    if (username.length < 4)
        throw ["username", "Username too short"];
    if (username.length > 16)
        throw ["username", "Username too long"];
    if (/[^a-z^A-Z^0-9^_^-]/g.test(username))
        throw ["username", "Username contains invalid characters"];

    if (password != passwordConfirm)
        throw ["password-confirm", "Passwords do not match"];

    if (password.length < 4)
        throw ["password", "Password too short"];
    if (!/[a-zA-Z]/.test(password))
        throw ["password", "Password must contain an alphanumeric character"];
    if (!(/[0-9]/.test(password) || /[^a-z^A-Z^0-9]/.test(password)))
        throw ["password", "Password must contain a number or symbol"];

    if (!emailRegex.test(email))
        throw ["email", "Email is not valid"];
}