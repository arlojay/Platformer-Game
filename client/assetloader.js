class AssetLoader {
    static blocks = {};
    static assets = {};

    static loadBlocks(...names) {
        names.forEach((name) => {
            const block = require(`./blocks/${name}.js`);
            this.blocks[name] = block;
        })
    }

    static getIdForBlock(name) {
        if(typeof name != "string") return name;

        let block = this.blocks[name];
        return block?.id ?? null;
    }

    static getNameForBlock(id) {
        if(typeof id == "string") return id;

        for(let name of Object.keys(this.blocks)) {
            if(this.blocks[name].id == id) return name;
        }
    }

    static async loadAssets(...names) {
        let promises = [];
        
        for(let name of names) {
            promises.push(new Promise((res,rej) => {
                let img = new Image();
                img.onload = () => {
                    this.assets[name] = img;
                    res(img);
                }
                img.src = `/assets/${name}.png`;
            }));
        }

        for(let promise of promises) {
            await promise;
        }
    }

    static async loadDefault() {

        this.loadBlocks(
            "brick","spike","flag","chain","metal","water",
            "invisible","bouncepad","jumporb","grate","roundspike",
            "spawnpoint","lava","forcefield","wood","gravityorb",
            "levetatingblock","sludge","flagblock","spawnpointblock",
            "technochain","technometal","blue","lock","fireballshooter",

            "icon-experimental"
        );
        await this.loadAssets(
            "menu/debug", "menu/eraser", "menu/exit", "menu/handle",
            "menu/import", "menu/save", "menu/settings", "menu/spawn",
            "menu/start", "menu/stop", "basicCursor", "brushCursor",
            "player", "menu/experimental"
        );
    }
}

module.exports = AssetLoader;