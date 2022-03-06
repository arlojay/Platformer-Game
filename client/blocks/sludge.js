module.exports = class Sludge extends require("./block.js") {
    static displayname = "Sludge";
    static description = "Green version of lava, but more toxic (kills you from farther away)";
    static id = 18;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
        entity.kill();
    }
}