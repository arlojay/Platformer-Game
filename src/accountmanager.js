const Database = require("@replit/database");
const db = new Database();
const idGenerator = require("./idgenerator.js")(db, "account");

const commonPasswords = reqiure("./commonpasswords.js");

class Account {
    constructor(credentials) {
        Object.assign(this, credentials);
    }
    static async getValue(path) {
        path = "accounts/"+path.URLify().replace(/./g,"/");

        return await db.get(path);
    }
    get id() {
        if(this._id) return this._id;

        let id = idGenerator.next().value;
        
    }
    set registrationError() {
        throw new Error("Assignment to read-only value");
    }
    get registrationError() {
        let { username, password } = this;

        if(username.length > 24) return "Username too long";
        if(username.length < 4) return "Username too short";
        if(username.replace(/[a-zA-Z0-9_-]/g,"").length > 0) return "Username contains invalid characters";

        if(password.length < 6) return "Password too short";
        if(password.replace(/[^a-z^A-Z]/g,"").length == 0) return "Password must contain an alphanumeric character";
        if(password.replace(/[^0-9]/g,"").length == 0) return "Password must contain a number";
        if(password.replace(/[a-zA-Z0-9]/g,"").length == 0) return "Password must contain a symbol";
        if(commonPasswords.includes(password)) return "Password too common";
        
        if(await Account.getValue(""))

        return null;
    }
}

class AccountManager {
    static createAccount(credentials) {
        
    }
}

module.exports = AccountManager;