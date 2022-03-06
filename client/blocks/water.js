module.exports = class Water extends require("./block.js") {
    static displayname = "Water";
    static description = "Slows down player when inside, and allows player to swim";
    static id = 5;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;

        entity.timeScale = 0.5;
        if(entity.type == "player") {
            entity.canSwim = true;
        }
    }
}