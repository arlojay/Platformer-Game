module.exports = class Spike extends require("./block.js") {
    static displayname = "Spike";
    static description = "Kills the player on touch on top";
    static id = 1;
    static rotatable = true;
    
    static onEntityHit(entity, collision) {
        if(entity.type == "player") {
            let hitBottom = false;
            switch(collision.tile.rotation) {
                case 0:
                    hitBottom = entity.y > collision.tile.y + 1;
                    break;
                case 1:
                    hitBottom = entity.x < collision.tile.x;
                    break;
                case 2:
                    hitBottom = entity.y < collision.tile.y;
                    break;
                case 3:
                    hitBottom = entity.x > collision.tile.x + 1;
                    break;
            }

            if(hitBottom) {
                collision.colliding = true;
            } else {
                collision.colliding = false;

                if(Math.sqrt((entity.x - (collision.tile.x + 0.5))**2 + (entity.y - (collision.tile.y + 0.5))**2) < 0.75) {
                    entity.kill();
                }
            }
        }
    }
}