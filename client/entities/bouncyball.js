const Entity = require("./entity.js");

class BouncyBall extends Entity {
    constructor() {
        super(...arguments);
        
        this.useGravity = true;
        this.static = false;
        this.bounciness = 1;
        this.drag = 0.99;
        
        this.killable = true;
        this.killAtSessionEnd = true;
    }

    update(tilemaps) {
        this.updatePhysics(tilemaps);
    }
}

module.exports = BouncyBall;