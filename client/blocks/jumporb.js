module.exports = class JumpOrb extends require("./block.js") {
    static displayname = "Jump Orb";
    static description = "Enables double-jump ability";
    static id = 8;

    static onEntityHit(entity, collision) {
        collision.colliding = false;
        
        if(entity.type == "player") {
            entity.canDoubleJump = true;
        }
    }
}