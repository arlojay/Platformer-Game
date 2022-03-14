
console.log("attach");
const Viewport = require("../viewport.js");
const Listener = require("../listeners.js");
const AssetLoader = require("../assetloader.js")

class Renderer {
    static canvas = null;
    static ctx = null;
    static viewport = new Viewport(128, 128, 1, 16);
    static assets = {};

    static attach(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext("2d");

        //Resize canvas to fit screen
        this.resizeCanvas();

        //Apply a listener to this object
        Listener.attach(this);

        //Start draw loop
        this.draw();
    }

    static resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    static draw(t) {
        this.ctx.beginPath();
        this.viewport.left = Math.floor(this.getWorldPos(0, 0)[0]);
        this.viewport.right = Math.ceil(this.getWorldPos(window.innerWidth, 0)[0]);
        this.viewport.top = Math.floor(this.getWorldPos(0, 0)[1]);
        this.viewport.bottom = Math.ceil(this.getWorldPos(0, window.innerHeight)[1]);

        //Clear screen
        this.ctx.fillStyle = "#333333";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        //Fire drawing event for drawing tilemaps and entities
        this.dispatchEvent("draw", t);

        //Continue draw loop
        requestAnimationFrame(a=>this.draw(a));
    }

    //Draws specific entity based on entity.type
    static drawEntity(entity) {
        if(entity.hidden) return;


        switch(entity.type) {
            case "player":
                this.drawPlayer(entity);
                break;
            case "selecteditem":
                this.drawSelectedItem(entity);
                break;
            case "spawnflag":
                this.drawSpawnFlag(entity);
                break;
            case "entitybasic":
                this.drawEntityBasic(entity);
                break;
            case "fireball":
                this.drawFireball(entity);
                break;
        }

    }

    //Player is a red box
    static drawPlayer(player) {

        this.ctx.fillStyle = "#ff0000";
        this.drawRect(player.x, player.y, player.width, player.height, player.rotation);

    }

    //Basic entities are yellow boxes
    static drawEntityBasic(entity) {
        this.ctx.fillStyle = "#ffff00";
        this.drawRect(entity.x, entity.y, entity.width, entity.height, entity.rotation);
    }

    static drawFireball(entity) {
        this.ctx.fillStyle = "#880000";
        this.drawRect(entity.x, entity.y, entity.width, entity.height, entity.rotation);
    }

    static drawSelectedItem(item) {
        this.ctx.globalAlpha = 0.5;
        this.drawImage(item.texture, item.x, item.y, 1, 1, item.rotation);
        this.ctx.globalAlpha = 1.0;
    }

    static drawSpawnFlag(flag) {
        this.drawImage(AssetLoader.assets["menu/spawn"], flag.x, flag.y, 1, 1, flag.rotation);
    }

    static drawDeathZone(height) {
        let { left, right, bottom, top } = this.viewport;
        
        if(height > bottom) return;
        this.ctx.fillStyle = "#ff8800";
        this.drawRect((left + right) / 2, (bottom + height) / 2, right - left, bottom - height);
    }

    //Draws a rectangle in the viewport respective to panning and zoom
    static drawRect(x, y, w = 1, h = 1, r = 0) {
        w *= this.viewport.scale * this.viewport.zoom;
        h *= this.viewport.scale * this.viewport.zoom;

        this.ctx.setTransform(1, 0, 0, 1, ...this.getScreenPos(x, y));
        this.ctx.rotate(r);
        this.ctx.fillRect(
            w/-2, h/-2,
            w,
            h
        )
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    //Draws a rectangle in the viewport respective to panning and zoom
    static drawImage(image, x, y, w = 1, h = 1, r = 0) {
        w *= this.viewport.scale * this.viewport.zoom;
        h *= this.viewport.scale * this.viewport.zoom;

        this.ctx.setTransform(1, 0, 0, 1, ...this.getScreenPos(x, y));
        this.ctx.rotate(r);

        this.ctx.drawImage(
            image,
            w/-2, h/-2,
            w,
            h
        )
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    //Converts world space to screen space
    static getScreenPos(x, y) {
        x -= this.viewport.x;
        y -= this.viewport.y;

        x *= this.viewport.scale * this.viewport.zoom;
        y *= this.viewport.scale * this.viewport.zoom;
        
        x += this.canvas.width / 2;
        y += this.canvas.height / 2;

        return [x,y];
    }

    //Converts screen space to world space
    static getWorldPos(x, y) {
        
        x -= this.canvas.width / 2;
        y -= this.canvas.height / 2;

        x /= this.viewport.scale * this.viewport.zoom;
        y /= this.viewport.scale * this.viewport.zoom;

        x += this.viewport.x;
        y += this.viewport.y;

        return [x,y];
    }

    static drawTilemap(tilemap) {
        //Extract variables
        const { width, height } = this.canvas;
        const { _x, _y, zoom } = this.viewport;
        
        //Use point sampling instead of billinear sampling
        this.ctx.imageSmoothingEnabled = false;
        
        //Draws part of the tilemap's image onto the rendering canvas' screen
        this.ctx.drawImage(
            tilemap.canvas,
            _x - width / 2 / zoom,
            _y - height / 2 / zoom,
            width / zoom,
            height / zoom,
            0, 0, width, height
        );
    }
}

module.exports = Renderer;