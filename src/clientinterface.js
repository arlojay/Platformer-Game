const TextConverter = require("../common/textconverter.js");

const LZUTF8 = require("lz-string");
const Database = require("@replit/database");
const db = new Database();

//Needs database instance to know if id is taken or not
const idGenerator = require("./idgenerator.js")(db);

const levelCache = new Map();

async function userifyLevel(level, options) {
    let { strip, clone } = options ?? {};
    strip ??= true;
    clone ??= false;
    
    level.new = false;

    let currentTime = new Date().getTime();
    let levelTime = new Date(level.time).getTime() ?? 0;

    // "new" means it was published within the last hour
    if(currentTime - levelTime < 60 * 60 * 1000) level.new = true;


    if(typeof level.author == "string") {
        let authorId = level.author;
        level.author = {};
    
        // When accounts are added, fill the name out with valid information
        level.author.name = "userUnspecified";
        level.author.id = authorId;
    }

    level.played = Math.random() > 0.5;

    level.difficulty = Math.floor(Math.random() * 7);
    
    if(clone) return JSON.parse(JSON.stringify(level));
    return level;
}
async function getLevel(id) {
    let value = levelCache.get(id);
    if(value) return userifyLevel(value);

    value = await db.get("levels/"+id);
    if(!value) return;
    
    levelCache.set(id, value);
    return userifyLevel(value);
}

class ClientInterface {
    static async publish(req) {
        let { blocks, name, desc } = JSON.parse(req.body);

        const author = "c2VfaWQiOiJiYjA1MzYxZC04Njg1LTQ5";
        const time = JSON.parse(JSON.stringify(new Date()));
        const likes = 0;
        const difficulty = -1;

        //Throw if missing data
        if(!blocks) throw "No level data";
        if(!name) throw "No level title";
        if(!desc) throw "No level description";

        //Decompress
        let blockData = TextConverter.asciiToUint8(LZUTF8.decompress(blocks));

        //Make sure there's a 256x256 grid of blocks
        if(blockData.length != 256*256) throw "Malformed level data";

        //Level data check
        if(name.length < 5) throw "Level name too short";
        if(name.length > 64) throw "Level name too long";
        
        if(desc.length < 10) throw "Description too short";
        if(desc.length > 512) throw "Description too long";


        //Make sure there's a flag
        let foundFlag = false;

        let blockId = 0;
        for(let i = 0; i < blockData.length; i++) {
            blockId = Math.floor(blockData[i]/4) - 1;
            if(blockId == 2) {
                foundFlag = true;
                break;
            }
        }

        if(!foundFlag) throw "Level needs a flag";

        //Get next Level id
        let id = (await idGenerator.next()).value;

        //Write to database
        try {
            await db.set(`levels/${id}`, {
                id, name, desc, blocks, author, time, likes, difficulty
            })
        } catch(e) {
            console.log("An error occured whilst writing to database",e);
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
        for(let i of keys) {
            let key = i.replace("levels/","");
            let value = await getLevel(key,{ clone: true });
            
            delete value.blocks;
            levels.push(value);
        }

        return levels;
    }
}

module.exports = ClientInterface;