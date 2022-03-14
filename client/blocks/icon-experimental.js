module.exports = class JumpOrb extends require("./block.js") {
    static displayname = "icon.experimental.name";
    static description = "icon.experimental.desc";
    static id = 63;

    static onEntityHit(a,b) {
        b.colliding = false;
    }
}