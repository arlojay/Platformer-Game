const TextConverter = require("../common/textconverter.js");
const LZUTF8 = require("lz-string");

class ClientInterface {
    static publish(req) {
        let { blocks, name, desc } = JSON.parse(req.body);
        if(!blocks) throw "No level data";
        if(!name) throw "No level title";
        if(!desc) throw "No level description";

        //Decompress
        blocks = TextConverter.asciiToUint8(LZUTF8.decompress(blocks));

        if(blocks.length != 1048576) throw "Malformed level data";


        if(name.length < 5) throw "Level name too short";
        if(name.length > 64) throw "Level name too long";
        
        if(desc.length < 10) throw "Description too short";
        if(desc.length > 512) throw "Description too long";

        let foundFlag = false;

        let id = 0;
        for(let i = 0; i < blocks.length; i++) {
            id = Math.floor(blocks[i]/4) - 1;
            if(id == 2) {
                foundFlag = true;
                break;
            }
        }

        if(!foundFlag) throw "Level needs a flag";
    }
}

module.exports = ClientInterface;