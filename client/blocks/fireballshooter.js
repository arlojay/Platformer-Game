const EntityHandler = require("../entityhandler.js");

module.exports = class FireballShooter extends require("./block.js") {
    static displayname = "Fireball Shooter";
    static description = "Shoots fireballs out of the front";
    static id = 25;
    static rotatable = true;

    static tick(block) {
        let x = 0;
        let y = 0;

        let entity = null;
        switch (block.rotation) {
            case 0:
                entity = EntityHandler.spawnEntity("FallingTile", block.x + 0.5, block.y - 0.5, { motionY: -6 });
                break;
            case 1:
                entity = EntityHandler.spawnEntity("FallingTile", block.x + 1.5, block.y + 0.5, { motionX: 6 });
                break;
            case 2:
                entity = EntityHandler.spawnEntity("FallingTile", block.x + 0.5, block.y + 1.5, { motionY: 6 });
                break;
            case 3:
                entity = EntityHandler.spawnEntity("FallingTile", block.x - 0.5, block.y + 0.5, { motionX: -6 });
                break;
        }

        entity.tileid = 1
    }
}