const Listener = require("./listeners.js");
console.log("attach");

class Input {
    static leftMousePressed = false;
    static rightMousePressed = false;
    static middleMousePressed = false;
    static mouseX = 0;
    static mouseY = 0;
    static keysPressed = [];
	static canvas = document.querySelector("canvas")

    static listen(element) {
        Listener.attach(Input);

        document.addEventListener("mousedown", (e) => {

            //Update respective variable
            if(e.button == 0) this.leftMousePressed = true;
            if(e.button == 1) this.rightMousePressed = true;
            if(e.button == 2) this.middleMousePressed = true;
            
            this.changed = true;
            this.dispatchEvent("mousedown",e.button);
            this.dispatchEvent("inputchanged");
        })

        document.addEventListener("mouseup", (e) => {

            //Update respective variable
            if(e.button == 0) this.leftMousePressed = false;
            if(e.button == 1) this.rightMousePressed = false;
            if(e.button == 2) this.middleMousePressed = false;
            
            this.changed = true;
            this.dispatchEvent("mouseup",e.button);
            this.dispatchEvent("inputchanged");
        })

        element.addEventListener("mousemove", (e) => {
            //Updates mouse position
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            this.changed = true;
            this.dispatchEvent("mousemove",this.mouseX,this.mouseY);
            this.dispatchEvent("inputchanged");
        })

        element.addEventListener("touchmove", (e) => {
            //Does the same thing as mouse position but calculates offset
            let cvsOffset = this.canvas.getBoundingClientRect();
            this.mouseX = e.touches[0].clientX - cvsOffset.x;
            this.mouseY = e.touches[0].clientY - cvsOffset.y;

            this.changed = true;
            this.dispatchEvent("touchmove",this.mouseX,this.mouseY);
            this.dispatchEvent("mousemove",this.mouseX,this.mouseY);
            this.dispatchEvent("inputchanged");
        })

        document.addEventListener("keydown", (e) => {

            //Adds key pressed to the keysPressed array if it doesn't already exist
            let key = e.key.toLowerCase();
            if(!this.keysPressed.includes(key)) this.keysPressed.push(key);
            
            this.changed = true;
            this.dispatchEvent("keydown",key);
            this.dispatchEvent("inputchanged");
        })

        document.addEventListener("keyup", (e) => {

            //Removes key pressed from the keysPressed array if it exists
            let key = e.key.toLowerCase();
            if(this.keysPressed.includes(key)) this.keysPressed.splice(this.keysPressed.indexOf(key),1);
            
            this.changed = true;
            this.dispatchEvent("keyup",key);
            this.dispatchEvent("inputchanged");
        })
    }
}

module.exports = Input;