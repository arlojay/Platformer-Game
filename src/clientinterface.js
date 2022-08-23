const TextConverter = require("../common/textconverter.js");
const registrationChecker = require("../common/registration-checker.js");
const Hasher = require("./hasher.js");

const LZUTF8 = require("lz-string");
const Database = require("@replit/database");
const db = new Database();

//Needs database instance to know if id is taken or not
const idGenerator = require("./idgenerator.js");
const levelIdGenerator = idGenerator.generator(db, "level");
const accountIdGenerator = idGenerator.generator(db, "account");

const levelCache = new Map();
const tokenCache = new Map();

async function userifyLevel(level, options) {
    let { strip, clone } = options ?? {};
    strip ??= true;
    clone ??= false;

    level.new = false;

    let currentTime = new Date().getTime();
    let levelTime = new Date(level.time).getTime() ?? 0;

    // "new" means it was published within the last hour
    if (currentTime - levelTime < 60 * 60 * 1000) level.new = true;


    if (typeof level.author == "string") {
        let authorId = level.author;
        level.author = {};

        // When accounts are added, fill the name out with valid information
        level.author.name = "userUnspecified";
        level.author.id = authorId;
    }

    level.played = Math.random() > 0.5;

    level.difficulty = Math.floor(Math.random() * 7);

    if (clone) return JSON.parse(JSON.stringify(level));
    return level;
}
async function getLevel(id, options) {
    let value = levelCache.get(id);
    if (value) return userifyLevel(value, options);

    value = await db.get("levels/" + id);
    if (!value) return;

    levelCache.set(id, value);
    return userifyLevel(value, options);
}

class ClientInterface {
    static async publish(req) {
        console.log(req.body);
        let { blocks, name, desc } = req.body;

        const author = "c2VfaWQiOiJiYjA1MzYxZC04Njg1LTQ5";
        const time = JSON.parse(JSON.stringify(new Date()));
        const likes = 0;
        const difficulty = -1;

        //Throw if missing data
        if (!blocks) throw "No level data";
        if (!name) throw "No level title";
        if (!desc) throw "No level description";

        //Decompress
        let blockData = TextConverter.asciiToUint8(LZUTF8.decompress(blocks));

        //Make sure there's a 256x256 grid of blocks
        if (blockData.length != 256 * 256) throw "Malformed level data";

        //Level data check
        if (name.length < 5) throw "Level name too short";
        if (name.length > 64) throw "Level name too long";

        if (desc.length < 10) throw "Description too short";
        if (desc.length > 512) throw "Description too long";


        //Make sure there's a flag
        let foundFlag = false;

        let blockId = 0;
        for (let i = 0; i < blockData.length; i++) {
            blockId = Math.floor(blockData[i] / 4) - 1;
            if (blockId == 2) {
                foundFlag = true;
                break;
            }
        }

        if (!foundFlag) throw "Level needs a flag";

        //Get next Level id
        let id = (await levelIdGenerator.next()).value;

        //Write to database
        try {
            await db.set(`levels/${id}`, {
                id, name, desc, blocks, author, time, likes, difficulty
            })
        } catch (e) {
            console.log("An error occured whilst writing to database", e);
            throw "Internal error";
        }
        console.log(`Created new level entry at ${process.env.REPLIT_DB_URL}/levels/${id}`);

        return {
            id, name, desc, author, time, likes, difficulty
        }
    }

    static async getLevel(req) {
        return await getLevel(req.query.id);
    }

    static async levelList(req) {
        const { sort } = req.query;

        let levels = [];

        const keys = await db.list("levels/");
        for (let i of keys) {
            let key = i.replace("levels/", "");
            let value = await getLevel(key, { clone: true });

            delete value.blocks;
            levels.push(value);
        }

        return levels;
    }

    static async register(req) {
        const body = req.body;
        console.log(req.body);

        //Check credentials
        registrationChecker(body.username, body.password, body.passwordConfirm, body.email);


        //Check if account already exists
        if (await this.getAccountByUsername(body.username) != null) throw ["username", "Username taken"];

        //Hash password
        const hashedPassword = Hasher.hashString(body.password);

        //Create account token
        const token = this.getToken(body);
        const id = (await accountIdGenerator.next()).value;

        //Add account to database
        const user = {
            username: body.username,
            password: hashedPassword,
            email: body.email,
            verified: false,
            id: id,
            creationDate: Date.now()
        }
        await db.set("accounts/" + id, user);
        await db.set("token/" + Hasher.hashString(token), id); //Easy reference in the future


        //Return account information
        return Object.assign(user, {
            type: "success",
            token: token
        });
    }

    static async login(req) {
        const body = req.body;
        const genericError = ["username", "Invalid username or password"];


        //Check if account exists in database
        const account = await this.getAccountByUsername(body.username);
        if (account == null) throw genericError;

        //Check credentials to see if they match
        if (account.password != Hasher.hashString(body.password)) throw genericError;

        //Return account information
        return Object.assign(account, {
            type: "success",
            token: this.getToken(body)
        });
    }

    static getToken(body) {
        return Hasher.hashString(Hasher.scrambleString(body.username + body.password));
    }

    static getAccountByUsername(username) {
        return new Promise(async (res, rej) => {
            const list = await db.list("accounts/");

            let promises = [];

            list.forEach(id => {
                promises.push(db.get(id));
            })

            promises.forEach(promise => {
                promise.then(account => {
                    if (account ?.username != username) return;
                    res(account);
                    for (let i = 0; i < promises.length; i++) {
                        delete promises[i];
                    }
                })
            })

            for await (let promise of promises) await promise;

            res(null);
        })
    }

    static async getAccountById(id) {
        const account = await db.get("accounts/" + id);
        return account;
    }

    static async getClientWithToken(token) {
        if (token == null) return;

        let id = tokenCache.get(token) ?? await db.get("token/" + token);

        tokenCache.set(id, token);

        return await db.get("accounts/" + id);
    }
}

module.exports = ClientInterface;