module.exports = class Flag extends require("./block.js") {
    static displayname = "Flag";
    static description = "Triggers the level win screen";
    static id = 2;
    static rotatable = true;
    
    static onEntityHit(entity, collision) {
        collision.colliding = false;
        if(entity.type == "player") {
            entity.win();
        }
    }
}