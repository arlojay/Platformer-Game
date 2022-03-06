
console.log("attach");
class Viewport {
    constructor(x, y, zoom, scale) {
        //Scale is world space to pixel scale (example: 16 for 16 pixels per world unit)
        this.scale = scale ?? 1;

        //Viewport transforms
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.zoom = zoom ?? 1;
    }
    get properties() {
        const me = new Viewport();
        me._x = this._x;
        me._y = this._y;
        me.zoom = this.zoom;
        me.scale = this.scale;
        return me;
    }
    set properties(me) {
        this._x = me._x;
        this._y = me._y;
        this.zoom = me.zoom;
        this.scale = me.scale;
    }
    get x() {
        return this._x / this.scale;
    }
    get y() {
        return this._y / this.scale;
    }
    set x(x) {
        this._x = x * this.scale;
    }
    set y(y) {
        this._y = y * this.scale;
    }
}

module.exports = Viewport;