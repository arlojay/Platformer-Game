module.exports = class JumpOrb extends require("./block.js") {
    static displayname = "Gravity Orb";
    static description = "Flips gravity on use";
    static id = 16;

    static onEntityHit(entity, collision) {
        collision.colliding = false;
        
        if(entity.type == "player") {
            entity.canGravityJump = true;
        }
    }
}