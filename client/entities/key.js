const Entity = require("./entity.js");

class Key extends Entity {
    constructor() {
        super(...arguments);
        
        this.type = "item";
        this.texture = "key";
        this.useGravity = false;
        this.static = true;
    }
}

module.exports = Key;