module.exports = class FireballShooter extends require("./block.js") {
    static displayname = "Fireball Shooter";
    static description = "Shoots fireballs out of the front";
    static id = 25;
    static rotatable = true;
    
    static tick(block) {
        spawnEntity(Fireball, block.x + 1.5, block.y + 0.5, { motionX: 6 });
    }
}