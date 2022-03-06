const notepack = require("notepack");

class SocketMessage {
    static pack(name,content = null) {
        if(typeof name == "object") {
            return notepack.encode([name.name,name.content]);
        }
        return notepack.encode([name,content]);
    }
    static unpack(raw) {
        const [name,content] = notepack.decode(raw);
        return {name,content};
    }
}

module.exports = SocketMessage;