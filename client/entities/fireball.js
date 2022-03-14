const EntityHandler = require("../entityhandler.js");
const Entity = require("./entity.js");

class Fireball extends Entity {
    constructor() {
        super(...arguments);
        
        this.type = "fireball";
        this.useGravity = false;
        this.static = false;
        this.drag = 1;
        
        this.killable = true;
        this.killAtSessionEnd = true;

        this.life = 1000;
    }

    update(tilemaps) {
        this.updatePhysics(tilemaps);

        if(this.motionX == 0 && this.motionY == 0) {
            EntityHandler.removeEntity(this.id);
        }

        if(this.life-- < 0) removeEntity(this.id);

        if(Math.sqrt((this.x - player.x) ** 2 + (this.y - player.y)**2) < 1) player.kill();
    }
}

module.exports = Fireball;