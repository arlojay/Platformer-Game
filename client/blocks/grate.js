module.exports = class Grate extends require("./block.js") {
    static displayname = "Grate";
    static description = "Player can jump up through the block";
    static id = 9;

    static onEntityHit(entity, collision) {
        if(entity.motionY < 0 || entity.y > collision.tile.y) {
            collision.colliding = false;
        }
    }
}