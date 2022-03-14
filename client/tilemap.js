const LZUTF8 = require("lz-string");
const TextConverter = require("../common/textconverter.js");
console.log("attach");

class Tile {
    constructor(arr, x, y) {
        arr = new Int8Array(arr ?? [-1, 0, false, false]);
        this.id = arr[0];
        this.rotation = arr[1];
        this.flipX = arr[2];
        this.flipY = arr[3];
        
        this.x = x ?? 0;
        this.y = y ?? 0;
    }
}

class TileLoader {
    static image = null;
    static tiles = [];

    //Loads an image from the specified path
    static loadFile(filePath) {
        return new Promise((res,rej) => {
            const img = new Image();

            img.onload = () => {
                res(img);
            }
            img.onerror = (e) => {
                rej(new Error("An error occured whilst loading image"));
            }

            img.src = filePath;
        })
    }

    //Draws, extrudes, and stitches textures into a single atlas
    static calculateTiles(image, options) {
        options ??= {};

        //Default options
        options.width ??= 16;
        options.height ??= 16;
        options.extrude ??= 1;
        options.sliceDirection ??= "horizontal";

        //Calculate tile dimensions
        const hTiles = Math.floor(image.width / options.width);
        const vTiles = Math.floor(image.height / options.height);

        const imageWidth = (options.width + options.extrude * 2) * hTiles;
        const imageHeight = (options.height + options.extrude * 2) * vTiles;

        const drawingTiles = Array(hTiles * vTiles);

        //Create a canvas for the atlas
        const canvas = document.createElement("canvas");
        canvas.width = imageWidth;
        canvas.height = imageHeight;
        
        const ctx = canvas.getContext("2d");

        //Enable point sampling instead of billinear
        ctx.imageSmoothingEnabled = false;

        for(let tileX = 0; tileX < hTiles; tileX++) {
            for(let tileY = 0; tileY < vTiles; tileY++) {

                //Get index of tile (based on slice direction: horizontal or vertical)
                const index = options.sliceDirection == "horizontal" ? ( tileX + tileY * hTiles ) : ( tileY + tileX * vTiles );
                if(index >= options.tileCount) continue;

                //Corresponding x and y positions on the canvas to the image
                const x = (options.width + options.extrude * 2) * tileX + options.extrude;
                const y = (options.height + options.extrude * 2) * tileY + options.extrude;

                //Draw image to canvas with spacing of double extrusion
                ctx.drawImage(image,
                    tileX * options.width, tileY * options.height,
                    options.width, options.height,
                    x, y,
                    options.width, options.height
                );

                //Coordinates for drawing image
                drawingTiles[index] = {
                    sx: x,
                    sy: y,
                    sw: options.width,
                    sh: options.height
                };
            }
        }

        //Extrude left
        for(let x = 0; x < hTiles; x++) {
            let sx = (options.width + options.extrude * 2) * x + options.extrude;
            let dx = sx - options.extrude;
            ctx.drawImage(canvas,
                sx, 0,
                1, imageHeight,
                dx, 0,
                options.extrude, imageHeight
            )
        }

        //Extrude right
        for(let x = 0; x < hTiles; x++) {
            let sx = (options.width + options.extrude * 2) * x + options.extrude + (options.width - 1);
            let dx = sx + 1;
            ctx.drawImage(canvas,
                sx, 0,
                1, imageHeight,
                dx, 0,
                options.extrude, imageHeight
            )
        }

        //Extrude top
        for(let y = 0; y < vTiles; y++) {
            let sy = (options.height + options.extrude * 2) * y + options.extrude;
            let dy = sy - options.extrude;
            ctx.drawImage(canvas,
                0, sy,
                imageWidth, 1,
                0, dy,
                imageWidth, options.extrude
            )
        }

        //Extrude bottom
        for(let y = 0; y < vTiles; y++) {
            let sy = (options.height + options.extrude * 2) * y + options.extrude + (options.height - 1);
            let dy = sy + 1;
            ctx.drawImage(canvas,
                0, sy,
                imageWidth, 1,
                0, dy,
                imageWidth, options.extrude
            )
        }

        //Create tile data
        const tiles = {};
        drawingTiles.forEach((uv, i) => {
            tiles[i] = {uv};
        })


        //Convert canvas to static image
        const newImage = new Image();
        newImage.src = canvas.toDataURL();
        return new Promise((res,rej) => {
            newImage.onload = () => {
                res([newImage, tiles]);
            }
            newImage.onerror = () => {
                rej(new Error("An error occured whilst calculating texture"));
            }
        })
    }
}

//Returns default texture options
function defTexOpt(textureOptions) {
    let { src, tileWidth, tileHeight, textureExtrusion, sliceDirection, tileCount } = textureOptions ?? {};
    src ??= "tilemap.png";
    tileWidth ??= 16;
    tileHeight ??= 16;
    textureExtrusion ??= 1;
    sliceDirection = sliceDirection == "vertical" ? "vertical" : "horizontal";
    tileCount ??= Infinity;

    return { src, tileWidth, tileHeight, textureExtrusion, sliceDirection, tileCount }
}

class Tilemap {
    constructor(width, height, textureOptions, canvas) {

        //Called on texture load and error
        this.onload = () => {};
        this.onerror = () => {};

        //Load canvas or create new one
        this.canvas ??= document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.textureOptions = defTexOpt(textureOptions);
        let { src, tileWidth, tileHeight, textureExtrusion, sliceDirection, tileCount } = this.textureOptions;

        //Load texture later
        this.texture = { src };
        this.tileSize = [ tileWidth, tileHeight, textureExtrusion ];
        
        //If there are no texture options then setTexture() will likely be called
        if(textureOptions) this.reloadTexture().then(r=>this.onload(r)).catch(this.onerror);

        //Copy parameters
        this.width = width;
        this.height = height;
        this.blocks = Object.seal(Array(this.width * this.height).fill([-1,0,false,false]));

        this.canvas.width = this.width * tileWidth;
        this.canvas.height = this.height * tileHeight;
    }

    setTexture(textureOptions) {
        //Load texture using options from this.textureOptions
        this.textureOptions = defTexOpt(textureOptions);
        let { src, tileWidth, tileHeight, textureExtrusion, sliceDirection, tileCount } = this.textureOptions;

        this.texture = { src };
        this.tileSize = [ tileWidth, tileHeight, textureExtrusion ];
        
        return new Promise((res,rej) => {
            this.reloadTexture()
            .then((r) => {
                this.onload(r);
                res(r);
            }).catch((e) => {
                this.onerror(e);
                rej(e);
            });
        })
    }

    async reloadTexture(src) {
        const [ width, height, extrude ] = this.tileSize;
        const { sliceDirection, tileCount } = this.textureOptions;

        //Load texture from file and calculate uvs
        this.texture = await TileLoader.loadFile(src ?? this.texture.src);
        const [ texture, tiles ] = await TileLoader.calculateTiles(this.texture, { width, height, extrude, sliceDirection, tileCount });
        this.texture = texture;
        this.tiles = tiles;

        return [ texture, tiles ];
    }

    save() {
        const blockArr = new Uint8Array(Math.ceil(this.blocks.length / 4) * 4);
        let block;
        for(let i in this.blocks) {
            block = this.blocks[i];
            blockArr[i] = (block[0]+1) * 4 + block[1];
        }

        let asciistring = TextConverter.uint8ToAscii(blockArr);
        let encoded = LZUTF8.compress(asciistring);

        return encoded;
    }

    load(encoded) {
        let blockArr = TextConverter.asciiToUint8(LZUTF8.decompress(encoded));

        const blocks = new Array(this.width * this.height);
        for(let i = 0; i < this.width * this.height; i++) {
            const id = Math.floor(blockArr[i] / 4) - 1;
            const rotation = blockArr[i] % 4;
            blocks[i] = new Int8Array([id, rotation, 0, 0]);
        }
        console.log(blocks);

        this.blocks = blocks;
        this.reconstruct();
    }

    tileInBounds(x, y) {
        return !(x >= this.width || x < 0 || y >= this.height || y < 0);
    }

    //Sets a tile without redrawing it
    setTileRaw(x, y, id, rotation, flipX, flipY) {
        const index = x + y * this.width;
        const existingTile = this.blocks[index];

        id ??= existingTile[0];
        rotation ??= existingTile[1];
        flipX ??= existingTile[2];
        flipY ??= existingTile[3];
        const tile = new Int8Array([ id, rotation, flipX, flipY ]);
        
        this.blocks[index] = tile;
    }

    //Changes a tile and redraws it
    setTile(x, y, id, rotation, flipX, flipY) {
        x = Math.floor(x);
        y = Math.floor(y);
        if(!this.tileInBounds(x, y)) return;

        this.setTileRaw(x, y, id, rotation, flipX, flipY);
        this.refreshTile(x,y);
    }

    //Gets a tile and creates a new Tile object which stores easier-to-read id and rotation data
    getTile(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if(!this.tileInBounds(x, y)) return new Tile(null, x, y);

        return new Tile(this.blocks[x + y * this.width], x, y);
    }

    //Converting coordinates to the screen or world
    screenToMap(x,y) {
        return [Math.floor(x / this.textureOptions.tileWidth), Math.floor(y / this.textureOptions.tileWidth)];
    }
    mapToScreen(x,y) {
        return [x * this.textureOptions.tileWidth, y * this.textureOptions.tileWidth];
    }

    getTileImage(id) {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");

        const tile = this.tiles[id] ?? this.tiles[0];
        const uv = tile.uv;

        c.width = uv.sw;
        c.height = uv.sh;
        ctx.drawImage(this.texture, uv.sx, uv.sy, uv.sw, uv.sh, 0, 0, uv.sw, uv.sh);

        return c.toDataURL();
    }

    //Redraws a tile
    refreshTile(x,y) {
        const block = this.blocks[x + y * this.width];

        //Gets tile uv coordinates in the tilemap texture
        const tile = this.tiles[block[0]] ?? this.tiles[0];
        const uv = tile.uv;
        
        //Rotates and flips the tile
        this.ctx.setTransform(block[2] * 2 - 1, 0, 0, block[3] * 2 - 1, x * uv.sw + uv.sw/2, y * uv.sh + uv.sh/2);
        this.ctx.rotate(block[1] * (Math.PI/2) + Math.PI);

        //Remove pixels from that spot and replace them with the ones from the uv coordinates
        this.ctx.clearRect(-uv.sw/2, -uv.sh/2, uv.sw, uv.sh);
        if(block[0] != -1) this.ctx.drawImage(this.texture, uv.sx, uv.sy, uv.sw, uv.sh, -uv.sw/2, -uv.sh/2, uv.sw, uv.sh);
    }

    //Checks if a point is colliding with any blocks
    colliding(x, y) {
        const tile = this.getTile(x,y);
        const collide = tile.id != -1;
        return [collide, tile];
    }

    //Completely redraws the entire tilemap
    reconstruct() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        for(let x = 0; x < this.width; x++) {
            for(let y = 0; y < this.height; y++) {
                const block = this.blocks[x + y * this.width];

                if(block[0] == -1) continue;

                //Gets block uvs
                const tile = this.tiles[block[0]] ?? this.tiles[0];
                const uv = tile.uv;
                
                //Rotates and flips the tile
                this.ctx.setTransform(block[2] * 2 - 1, 0, 0, block[3] * 2 - 1, x * uv.sw + uv.sw/2, y * uv.sh + uv.sh/2);
                this.ctx.rotate(block[1] * (Math.PI/2) + Math.PI);

                //Draws the tile
                this.ctx.drawImage(this.texture, uv.sx, uv.sy, uv.sw, uv.sh, -uv.sw/2, -uv.sh/2, uv.sw, uv.sh);
            }
        }

        //Reset transformations
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.rotate(0);
    }

    //Loops through every tile and calls callback
    fill(callback) {
        this.blocks.forEach((val, index) => {
            const x = index % this.width;
            const y = Math.floor(index / this.width);
            this.setTileRaw(x, y, ...callback(x, y, index));
        })

        //Redraw at the end for more efficiency
        this.reconstruct();
    }
}

module.exports = Tilemap;