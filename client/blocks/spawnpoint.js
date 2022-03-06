module.exports = class Spawnpoint extends require("./block.js") {
    static displayname = "Spawnpoint";
    static description = "Sets the player's spawn point";
    static id = 11;
    static rotatable = true;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
        if(entity.type == "player") {
            entity.spawnX = collision.tile.x + 0.5;
            entity.spawnY = collision.tile.y + 0.5;
            entity.spawnInvertedGravity = entity.invertedGravity;
        }
    }
}