const Entity = require("./entity.js");

class SelectedItem extends Entity {
    constructor() {
        super(...arguments);
        
        this.type = "selecteditem";
        this.width = 1;
        this.height = 1;
        this.useGravity = false;
        this.static = true;
        
        this.tickInEditor = true;
    }

    update(tilemaps) {
        this.updatePhysics(tilemaps);
    }
}

module.exports = SelectedItem;