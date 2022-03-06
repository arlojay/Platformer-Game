module.exports = class Lava extends require("./block.js") {
    static displayname = "Lava";
    static description = "Basically dangerous water";
    static id = 12;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
        if(entity.type == "player") {
            if(Math.sqrt((entity.x - collision.tile.x - 0.5)**2 + (entity.y - collision.tile.y - 0.5)**2) < 0.8) {
                entity.kill();
            }
        }
    }
}