module.exports = class Chain extends require("./block.js") {
    static displayname = "Chain";
    static description = "Non-solid decoration block";
    static id = 3;
    static rotatable = true;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
    }
}