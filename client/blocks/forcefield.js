module.exports = class Forcefield extends require("./block.js") {
    static displayname = "Forcefield";
    static description = "Pushes players in the direction it's facing";
    static id = 14;
    static rotatable = true;

    static onEntityHit(entity, collision) {
        collision.colliding = false;

        setTimeout(() => {
            switch(collision.tile.rotation) {
                case 0:
                    entity.motionX += 1;
                    break;
                case 1:
                    entity.motionY += 0.2;
                    break;
                case 2:
                    entity.motionX -= 1;
                    break;
                case 3:
                    entity.motionY -= 0.2;
                    break;
            }
        })
    }
}