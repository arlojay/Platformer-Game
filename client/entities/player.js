const Entity = require("./entity.js");
const Listener = require("../listeners.js");

class Player extends Entity {
    constructor() {
        super(...arguments);
        Listener.attach(this);
        
        this.type = "player";

        this.static = true;
        this.hidden = true;
        this.width = 0.75;
        this.height = 0.75;

        this.speed = 1.2;
        this.swimSpeed = 0.95;
        this.jumpHeight = 21;
        this.jumped = false;
        this.lastJump = 0;

        this.canSwim = false;
        this.canDoubleJump = false;
        this.canGravityJump = false;
        this.invertedGravity = false;
        this.spawnInvertedGravity = false;

        this.killable = true;

        this.airTime = 0;
        //If jump is pressed x ms before you land on the ground you still jump
        this.jumpForgiveness = 100;
    }
    

    update(tilemaps) {
        this.timeScale = 1;
        this.canDoubleJump = false;
        this.canGravityJump = false;
        this.updatePhysics(tilemaps);
        
        if(this.y < -10) this.invertedGravity = false;
    }

    kill() {
        this.dispatchEvent("death");
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.motionX = 0;
        this.motionY = 0;
        this.invertedGravity = this.spawnInvertedGravity;
    }

    win() {
        this.dispatchEvent("win");
    }

    move(x = 0, jump = false) {
        if(this.static) return;
        
        Entity.gravity = this.invertedGravity ? 0.5 : -0.5;

        //Move laterally
        this.motionX += x * this.speed;

        if(this.canSwim) {
            if(jump) {
                this.motionY -= 1;
            }
            this.motionY *= this.swimSpeed * (this.invertedGravity ? -1 : 1);
            this.motionX *= this.swimSpeed * (this.invertedGravity ? -1 : 1);
        } else {
            
            const canJump = this.airTime < 0.06 || this.canDoubleJump;

            //Jump if on ground
            if(canJump && jump && !this.jumped) {
                this.motionY = this.jumpHeight * (this.invertedGravity ? 1 : -1);
            }
            //Gravity jump
            if(this.canGravityJump && jump && !this.jumped) {
                this.invertedGravity = !this.invertedGravity;
            }
            //Jump if button pressed "jumpForgiveness" ms before player landed on the ground
            if(performance.now() - this.lastJump < this.jumpForgiveness && canJump) {
                this.motionY = this.jumpHeight * (this.invertedGravity ? 1 : -1);
            }

            //Tracks the last time the spacebar was pressed (used for jump forgiveness)
            if(jump != this.jumped) {
                if(jump) {
                    this.lastJump = performance.now();
                }
                this.jumped = jump;
            }
        }
    }
}

module.exports = Player;