class Listener {
    static attach(object) {
        const instance = new this();

        //Copies a function over with same parameters
        const copy = (keys) => {
            keys.forEach((n) => {
                //Use function for argument variable

                const localFunction = instance[n];
                object[n] = function() {
                    localFunction.call(instance,...arguments);
                };
            });
        }

        void copy(["addEventListener","removeEventListener","dispatchEvent","waitForEvent"]);
        return instance;
    }

    constructor() {
        this.listeners = {};
    }

    addEventListener(id, callback) {

        //listeners[id] is an array of callbacks
        this.listeners[id] = (this.listeners[id] ?? []).concat(callback);
        return callback;
    }
    removeEventListener(id, callback) {

        //Return if event was successfully removed
        let found = false;

        //Find specified callback in listeners with id and remove it
        this.listeners[id]?.forEach((cb, i) => {
            if(cb == callback) this.listeners[id].splice(i,1);
            found = true;
        });

        return found;
    }
    dispatchEvent(id, ...args) {
        
        //Find callbacks from listener id and call them with rest of provided arguments
        this.listeners[id] ?.forEach(callback => {
            callback(...args);
        });
    }
    waitForEvent(id) {
        return new Promise((res,rej) => {

            //Cannot use arrow syntax because we need the "arguments" variable
            const listener = this.addEventListener(id, function() {
                removeEventListener(id,listener);
                res(...arguments);
            });
        });
    }
}

module.exports = Listener;