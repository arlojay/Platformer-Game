module.exports = class TechnoChain extends require("./block.js") {
    static displayname = "Techno-Chain";
    static description = "Non-solid decoration block";
    static id = 21;
    static rotatable = true;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
    }
}