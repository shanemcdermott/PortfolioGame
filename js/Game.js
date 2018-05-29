class Point 
{
    constructor(x=0.0, y=0.0) {
        this.x = x;
        this.y = y;
    }

    add(point)
    {
        return new Point(this.x + point.x, this.y + point.y);
    }

    sub(point)
    {
        return new Point(this.x - point.x, this.y - point.y);
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.hypot(dx, dy);
    }
}

class Transform
{
    constructor(position = new Point(0,0))
    {
        this.position = position;
        this.scale = new Point(1,1);
        this.skew = new Point(0,0);
    }

    apply(context)
    {
        context.transform(this.scale.x,this.skew.x,this.skew.y,this.scale.y,this.position.x,this.position.y);
    }
}

class Entity
{
    constructor(type, position = new Point(0,0)) 
    {
        this.type = type;
        this.transform = new Transform(position);
        this.components = {};
    }

    get x()
    {
        return this.transform.position.x;
    }
    set x(val)
    {
        this.transform.position.x = val;
    }

    get y()
    {
        return this.transform.position.y;
    }

    set y(val)
    {
        this.transform.position.y = val;
    }

    get position()
    {
        return this.transform.position;
    }

    set position(val)
    {
        this.transform.position = val;
    }

    addComponent(component)
    {
        this.components[component.name] = component;
    }

    removeComponent(component)
    {
        delete this.components[component.name];
    }

    update(deltaTime) 
    {
        for(var index in this.components)
        {
            if(this.components[index] != null)
            {
                this.components[index].update(deltaTime);
            }
        }
    }

    render(context, deltaTime)
    {
        context.save();
        this.transform.apply(context);
        for(var index in this.components)
        {
            if(this.components[index] != null)
            {
                this.components[index].render(context, deltaTime);
            }
        }
        context.restore();
    }    
}        

//constructor: owner
class Component 
{
    constructor(name, owner, zOrder=0)
    {
        //Owning Entity
        this.owner = owner;
        //Component Name
        this.name = name;
        //Render order
        this.zOrder = zOrder;
    }

    get zOrder()
    {
        return this.z;
    }

    set zOrder(value)
    {
        this.z = value;
    }


    register(world)
    {
        this.world = world;
    }

    update(deltaTime)
    {}

    render(context, deltaTime)
    {}

    destroy()
    {
        this.world.deregisterComponent(this);
        this.owner.removeComponent(this);
    }
}

//constructor: owner, speed
class MovementComponent extends Component
{
    constructor(name, owner, speed=1, zOrder=-1)
    {
        super(name, owner, zOrder);
        this.speed = speed;
        this.velocity = new Point();
    }

    update(deltaTime)
    {
        this.owner.x += this.speed * this.velocity.x * deltaTime;
        this.owner.y += this.speed * this.velocity.y * deltaTime;
    }

}

//constructor: owner
class SceneComponent extends Component
{
    constructor(name, owner, position = new Point(), angle = 0.0)
    {
        super(name, owner);
        this.transform = new Transform(position);
        this.angle = angle;
    }
    
    get position()
    {
        return this.transform.position;
    }
    
    set position(val)
    {
        this.transform.position = val;
    }

    get x()
    {
        return this.position.x;
    }

    set x(value)
    {
        this.position.x = value;
    }

    get y()
    {
        return this.position.y;
    }
    
    set y(value)
    {
        this.position.y = value;
    }

    get scale()
    {
        return this.transform.scale;
    }

    set scale(value)
    {
        this.transform.scale = value;
    }
}

class BoundsComponent extends SceneComponent
{
    constructor(name, owner, position = new Point(0,0), angle = 0.0)
    {
        super(name, owner, position, angle);
    }

    contains(point)
    {
        throw new TypeError('function: contains has not been defined in child class');
    }

    intersects(otherBounds)
    {
        throw new TypeError('function: intersects has not been defined in child class!');
    }
}

class BoxComponent extends BoundsComponent
{
    constructor(name, owner, width=1, height=1, position = new Point(0,0), angle= 0.0)
    {
        super(name, owner, position, angle);
        this.size = new Point(width, height);
    }

    get width()
    {
        return this.size.x;
    }

    get height()
    {
        return this.size.y;
    }

    get halfSize()
    {
        return new Point(this.width * 0.5, this.height * 0.5);
    }

    get min()
    {
        return this.position.sub(this.halfSize);
    }

    get max()
    {
        return this.position.add(this.halfSize);
    }

    contains(point)
    {
        return point.x > this.min.x && point.x < this.max.x &&
            point.y > this.min.y && point.y < this.max.y;
    }

    intersects(otherBounds)
    {
        return this.intersectsAABB(otherBounds);
    }

    intersectsAABB(aabb)
    {
        var otherMin = aabb.min;
        var otherMax = aabb.max;

        if(this.min.x > otherMin.x || otherMin.x > this.max.x) return false;
        if(this.min.y > otherMax.y || otherMin.y > this.min.y) return false;

        return true;
    }
}

//owner, width, height, imageFrames, fps, looping
class SpriteComponent extends BoxComponent
{
    constructor(name, owner, width, height, imageFrames, fps, looping = true)
    {
        super(name, owner, width, height);
        this.imageFrames = imageFrames;
        this.fps = fps;
        this.looping = looping;
        this.image = new Image();
        this.imageFrame = 0;
        this.image.src = this.imageFrames[this.imageFrame];
    }

    updateImage(deltaTime)
    {
        this.imageFrame += deltaTime * this.fps;
        var imageIndex = Math.round(this.imageFrame);
        if(imageIndex >= this.imageFrames.length)
        {
            if(this.looping)
            {
                imageIndex %= this.imageFrames.length;
                this.imageFrame -= this.imageFrames.length;
            }
            else
            {
                imageIndex = this.imageFrames.length - 1;
            }
        }
        this.image.src= this.imageFrames[imageIndex];
    }

    render(context, deltaTime)
    {
        this.updateImage(deltaTime);
        context.save();
        this.transform.apply(context);
        context.drawImage(this.image, 
                0, 
                0,
                this.width, this.height);
        context.restore();
    }
}

//constructor: owner
class PlayerInputComponent extends Component
{
    constructor(name, owner)
    {
        super(name, owner);
        this.movement = this.owner.components["movement"];
        this.keys = [];
        this.mousePos = new Point();
        this.mouseDelta = new Point();
        this.mouseDown = false;
    }

    onKeyDown(event)
    {
        event.preventDefault();
        this.keys = (this.keys || []);
        this.keys[event.keyCode] = (event.type == "keydown");
    }

    onKeyUp(event)
    {
        this.keys[event.keyCode] = (event.type == "keydown");
    }

    onMouseMove(event, canvasBounds)
    {
        this.mouseDelta.x = this.mousePos.x - event.clientX - canvasBounds.left;
        this.mouseDelta.y = this.mousePos.y - event.clientY - canvasBounds.top;
        this.mousePos.x += this.mouseDelta.x;
        this.mousePos.y += this.mouseDelta.y;
    }

    onMouseDown(event)
    {
        this.mouseIsDown = true;
    }

    onMouseUp(event)
    {
        this.mouseIsDown = false;
        console.log("mouse released at ", this.mousePos);
    }

    processInput()
    {
        var newX = 0;
        var newY = 0;
        if (this.keys && this.keys[37]) {newX = -1; }
        if (this.keys && this.keys[39]) {newX = 1; }
        if (this.keys && this.keys[38]) {newY = -1; }
        if (this.keys && this.keys[40]) {newY = 1; }
        if(newX != 0 || newY != 0)
        {
            this.move(new Point(newX,newY));
        }
        else
        {
            this.stopMoving();
        }
    }

    move(dir)
    {
        this.movement.velocity = dir;
    }

    stopMoving()
    {
        this.movement.velocity = new Point(0,0);
    }
}

class GameWorld extends Entity
{
    constructor(width, height) 
    {
        super("world", new Point(0,0));
        this.gameObjects = {};
        this.components = [];
        this.bounds = new BoxComponent("bounds",this,width,height);
        this.registerComponent(this.bounds);
        this.dirtyRender=false;
    }

    get player()
    {
        return this.gameObjects["player"];
    }

    set player(value)
    {
        this.gameObjects["player"] = value;
    }

    registerComponent(component)
    {
        component.register(this);
        this.components.push(component);
        component.owner.addComponent(component);
    }

    deregisterComponent(component)
    {
        var index = this.components.indexOf(component);
        if(index > -1)
        {
            this.components.splice(index,1);
        }
    }

    update(deltaTime)
    {
        for(var index in this.gameObjects)
        {
            this.gameObjects[index].update(deltaTime);
        }
    }

    render(context, deltaTime)
    {
        if(this.dirtyRender)
        {
            this.components.sort(function(a, b){return a.zOrder - b.zOrder});
            this.dirtyRender=false;
        }
        //context.save();
        //this.transform.apply(context);
        for(var index in this.gameObjects)
        {
            this.gameObjects[index].render(context, deltaTime);
        }
        //context.restore();
    }
}

class GameDriver
{
    constructor(canvas, gameWorld)
    {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.context = this.canvas.getContext("2d");
        this.world = gameWorld;
        this.frameNo = 0;
        this.lastUpdate = Date.now();
    }

    get worldOrigin()
    {
        return this.world.origin;
    }

    start(interval)
    {
        this.frameNo = 0;
        this.lastUpdate = Date.now();
        this.interval = interval;
    }

    setupPlayerInput(player)
    {
        var playerInput = new PlayerInputComponent("input", player);
        window.addEventListener('keydown', function(e){playerInput.onKeyDown(e);});
        window.addEventListener('keyup', function(e){playerInput.onKeyUp(e);});
        this.canvas.addEventListener('mousemove', function(e){playerInput.onMouseMove(e, this.getBoundingClientRect());});
        this.canvas.addEventListener('mousedown', function(e){playerInput.onMouseDown(e);});
        this.canvas.addEventListener('mouseup', function(e){playerInput.onMouseUp(e);});
        this.world.registerComponent(playerInput);
        this.playerInput = playerInput;
    }

    clear()
    {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }

    stop()
    {
        clearInterval(this.interval);
    }

    update()
    {
        var now = Date.now();
        var deltaTime = (now - this.lastUpdate) / 100.0;
        this.lastUpdate = now;
        this.frameNo++;
        
        this.playerInput.processInput();
        this.world.update(deltaTime);

        this.clear();
        this.world.render(this.context, deltaTime);
    }

}

class AnimFrame extends Point
{
    constructor(x, y, duration, nextId)
    {
        super(x,y);
        this.duration = duration;
        this.nextId = nextId;
    }
}

class SpriteSheet extends SceneComponent
{
    constructor(name, owner, sheetObj, sheetSize, tileSize, frameLength = 0.5, startIndex = 0)
    {
        super(name, owner);
        this.sheetObj = sheetObj;
        this.tileSize = tileSize;
        this.sheetSize = sheetSize;
        this.numTiles = new Point(
            this.sheetSize.x / this.tileSize.x,
            this.sheetSize.y / this.tileSize.y);
        this.tileData = [];
        var k = 0;
        for(var i = 0; i < this.numTiles.y; i++)
        {
            for(var j = 0; j < this.numTiles.x; j++)
            {
                this.tileData[k] = new AnimFrame(
                    j * this.tileSize.x, 
                    i * this.tileSize.y, 
                    frameLength,
                k+1);
                k++;
            }
            this.tileData[k-1].nextId = k - this.numTiles.x;
        }
        this.tileIndex = startIndex;
        this.frameTime = 0.0;
        this.width = 32;
        this.height = 32;
    }

    update(deltaTime)
    {
        this.frameTime += deltaTime;
        if(this.frameTime >= this.tileData[this.tileIndex].duration)
        {
            this.frameTime -= this.tileData[this.tileIndex].duration;
            this.tileIndex = this.tileData[this.tileIndex].nextId;      
        }
    }

    get currentTileX()
    {
        return this.tileData[this.tileIndex].x;
    }

    get currentTileY()
    {
        return this.tileData[this.tileIndex].y;
    }

    render(context, deltaTime)
    {
        //this.updateImage(deltaTime);
        context.save();
        this.transform.apply(context);
        //context.translate(this.worldX, this.worldY);
        //context.rotate(this.angle);
        context.drawImage(
                this.sheetObj,
                this.currentTileX,
                this.currentTileY,
                this.tileSize.x,
                this.tileSize.y, 
                0, 
                0,
                this.width,
                this.height);
        context.restore();
    }
}