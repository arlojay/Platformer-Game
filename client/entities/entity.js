class PointCollider {
    constructor(x,y) {
        this.offsetx = x;
        this.offsety = y;
        this.x = x;
        this.y = y;
    }
    //Check if new position collides with the tilemap
    update(entity, tilemap) {
        this.x = entity.x + this.offsetx;
        this.y = entity.y + this.offsety;

        const tile = tilemap.colliding(this.x, this.y);
        return tile;
    }
}

class Entity {
    static gravity = -0.5;

    constructor(x,y) {
        this.type = "entitybasic";

        //Entity position
        this.x = x ?? 0;
        this.y = y ?? 0;
        this.spawnX = this.x;
        this.spawnY = this.y;
        
        //Is the rigidbody affected by motion?
        this.static = true;

        //Is the rigidbody affected by gravity?
        this.useGravity = true;

        //Entity motion
        this.motionX = 0;
        this.motionY = 0;

        //X motion is multiplied by this value every tick (air resistance / friction)
        this.drag = 0.85;

        //Rigidbody size
        this.width = 0.75;
        this.height = 0.75;
        this.colliderMargin = 0.00001;

        //Other fun attributes
        this.minMoveDistance = 0.1;
        this.bounciness = 0;
        this.timeScale = 1;
        this.killable = false;

        //Graphical attributes
        this.hidden = false;
        this.rotation = 0;

        this.createCollider();
    }

    createCollider() {
        /*
            Collision points

                0 ----- 1
                |       |
                |       |
                2 ----- 3

        */

        //Default point colliders (IMPORTANT: CHANGE WHEN ADJUSTING SIZE)
        this.pointColliders = [
            new PointCollider(this.width / -2, this.height / -2),
            new PointCollider(this.width /  2, this.height / -2),
            new PointCollider(this.width / -2, this.height /  2),
            new PointCollider(this.width /  2, this.height /  2)
        ];
    }

    update(tilemaps) {
        //Move object
        this.updatePhysics(tilemaps);
    }

    updatePhysics(tilemap) {
        if(this.static) return;
        this.canSwim = false;
        
        //Entity falls at 0.5 blocks/s^2
        if(this.useGravity) {
            this.motionY -= Entity.gravity * this.timeScale;
            this.motionX *= this.drag;
            this.motionY *= 1 - (0.01 * this.timeScale);
        } else {
            this.motionX *= this.drag;
            this.motionY *= this.drag;
        }
        this.airTime += 0.01;

        //Limit move distance
        if(Math.abs(this.motionX) < this.minMoveDistance) this.motionX = 0;
        if(Math.abs(this.motionY) < this.minMoveDistance) this.motionY = 0;

        //Check collisions for x axis
        this.x += this.motionX * 0.01 * this.timeScale;
        {
            //Get all colliding points
            const collisions = this.colliding(tilemap);
            let left = false;
            let right = false;

            collisions.forEach((collision) => {
                if(collision.block && collision.colliding) collision.block?.onEntityHit(this, collision);

                //Find whether the collision is on the left or the right
                if(collision.collider.offsetx < 0) left ||= collision.colliding;
                else right ||= collision.colliding;
                
            })

            //Resolve collision
            if(left)
                this.x = Math.ceil(this.x) - (1 - this.width/2) + this.colliderMargin;
            if(right)
                this.x = Math.floor(this.x) + (1 - this.width/2) - this.colliderMargin;

            //If trapped in block then kill entity
            if(left && right && this.killable) this.kill();

            //Bounce back
            if(left || right) this.motionX *= -this.bounciness;
        }
        

        // Check collisions for y axis
        this.y += this.motionY * 0.01 * this.timeScale;
        {
            //Get all colliding points
            const collisions = this.colliding(tilemap);
            let up = false;
            let down = false;

            collisions.forEach((collision) => {

                //Dispatch hit event
                if(collision.block && collision.colliding) collision.block?.onEntityHit(this, collision);

                //Find whether the collision is on the left or the right
                if(collision.collider.offsety < 0) up ||= collision.colliding;
                else down ||= collision.colliding;
            });

            //Resolve collision
            if(up) {
                this.y = Math.ceil(this.y) - (1 - this.height/2) + this.colliderMargin;
                if(Entity.gravity > 0) this.airTime = 0;
            }
            
            if(down) {
                this.y = Math.floor(this.y) + (1 - this.height/2) - this.colliderMargin;
                if(Entity.gravity < 0) this.airTime = 0;
            }

            //If trapped in block then kill entity
            if(up && down && this.killable) this.kill();

            //Bounce back
            if(up || down) this.motionY *= -this.bounciness;
        }

        if(this.y > deathZone + 1 && this.killable) this.kill();
    }

    kill() {
        this.x = this.spawnX;
        this.y = this.spawnY;
        this.motionX = 0;
        this.motionY = 0;
    }

    colliding(tilemap) {
        let collisions = [];

        //Get all colliding points of my point colliders
        for(let collider of this.pointColliders) {
            const [ colliding, block ] = collider.update(this, tilemap);

            //Get behavior instance (contains onEntityHit)
            const blockReference = blocks.findId(block.id);
            collisions.push({ colliding, block: blockReference, tile: block, collider });
        }
        return collisions;
    }
}

module.exports = Entity;