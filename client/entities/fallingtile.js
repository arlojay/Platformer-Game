const EntityHandler = require("../entityhandler.js");
const Entity = require("./entity.js");

class FallingTile extends Entity {
    constructor(...args) {
        super(...args);

        this.type = "fallingtile"

        this.useGravity = true;
        this.static = false;
        this.bounciness = 0;
        this.drag = 0.99;

        this.killable = false;
        this.killAtSessionEnd = true;

        this.tileid = 0;
    }

    update(tilemap) {
        this.updatePhysics(tilemap);
        if (this.motionY == 0 && this.motionX == 0) {
            tilemap.setTile(Math.floor(this.x), Math.floor(this.y), this.tileid)
            EntityHandler.removeEntity(this.id)
        }
    }
}

module.exports = FallingTile;