module.exports = class RoundSpike extends require("./block.js") {
    static displayname = "Round Spike";
    static description = "Kills the player on touch of any side";
    static id = 10;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
        if(entity.type == "player") {
            if(Math.sqrt((entity.x - collision.tile.x - 0.5)**2 + (entity.y - collision.tile.y - 0.5)**2) < 0.8) {
                entity.kill();
            }
        }
    }
}