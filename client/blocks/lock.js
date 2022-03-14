module.exports = class Lock extends require("./block.js") {
    static displayname = "Lock block";
    static description = "Unlocks only if the player is holding a key";
    static id = 24;

    static onEntityHit(entity, collision) {
        if(entity.type == "player") {
            if(entity.holdingEntity?.type == "key") {
                delete entity.holdingEntity;
                entity.holdingEntity = null;

                tilemap.setTile(collision.tile.x, collision.tile.y, -1);
            }
        }
    }
}