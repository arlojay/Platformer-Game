
class EntityHandler {
    static entities = new Map();
    static entityTypes = {};

    static registerEntity(type) {

        //Check purity
        const te = new TypeError("Entity is not of type class");
        if (typeof type != "function") throw te;
        try { void new type() } catch (e) {
            throw te;
        }

        this.entityTypes[type.name] = type;
    }

    static removeEntity(id) {
        //Find entity in list and kill it
        const ent = this.entities.get(id);
        if (!ent) return;

        ent.kill();
        this.entities.delete(id);
    }

    static spawnEntity(ent, x, y, options = {}) {
        if (typeof ent != "function") ent = this.entityTypes[ent];
        if (!ent) throw new TypeError("Entity not of type class or not found in class list");

        //Create new instance of the entity
        const instance = new ent(x, y);
        Object.assign(instance, options);
        instance.createCollider();

        const id = ("" + Math.random()).slice(2)
        instance.id = id;

        this.entities.set(id, instance);
        return instance;
    }
    static loadDefault() {
        EntityHandler.registerEntity(require("./entities/bouncyball.js"));
        EntityHandler.registerEntity(require("./entities/fireball.js"));
        EntityHandler.registerEntity(require("./entities/key.js"));
        EntityHandler.registerEntity(require("./entities/player.js"));
        EntityHandler.registerEntity(require("./entities/selecteditem.js"));
        EntityHandler.registerEntity(require("./entities/spawnflag.js"));
        EntityHandler.registerEntity(require("./entities/fallingtile.js"));
    }
}



module.exports = EntityHandler;