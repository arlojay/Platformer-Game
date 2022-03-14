const Entity = require("./entity.js");

class SpawnFlag extends Entity {
    constructor() {
        super(...arguments);
        
        this.type = "spawnflag";
        this.useGravity = false;
        this.static = true;
        
        this.tickInEditor = true;
    }
}

module.exports = SpawnFlag;