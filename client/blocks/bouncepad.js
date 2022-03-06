module.exports = class BouncePad extends require("./block.js") {
    static displayname = "Bounce Pad";
    static description = "Bounces the player up by a normal amount";
    static id = 7;
    static rotatable = true;

    static onEntityHit(entity, collision) {
        let ex = entity.x;
        let ey = entity.y;
        let ew = entity.width;
        let eh = entity.height;
        let tx = collision.tile.x;
        let ty = collision.tile.y;

        setTimeout(() => {
            switch(collision.tile.rotation) {
                case 0:
                    if(ey + eh/2 < ty + 0.1 && entity.motionY > -0.1) entity.motionY = -30;
                    break;
                case 1:
                    if(ex - ew/2 > tx + 0.9 && entity.motionX < 0.1) entity.motionX = 90;
                    break;
                case 2:
                    if(ey - eh/2 > ty + 0.9 && entity.motionY > -0.1) entity.motionY = 30;
                    break;
                case 3:
                    if(ex + ew/2 < tx + 0.1 && entity.motionX < 0.1) entity.motionX = -90;
                    break;
            }
        })
    }
}