class Point 
{
    constructor(x=0.0, y=0.0) {
        this.x = x;
        this.y = y;
    }

    static distance(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;

        return Math.hypot(dx, dy);
    }
}

class Entity extends Point
{
    constructor(x,y, type, width, height) 
    {
        super(x,y);
        this.type = type;
        this.components = {};
        this.width = width;
        this.height = height;
    }

    addComponent(name, component)
    {
        this.components[name] = component;
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
        for(var index in this.components)
        {
            if(this.components[index] != null)
            {
                this.components[index].render(context, deltaTime);
            }
        }

    }    
}        

//constructor: owner
class Component 
{
    constructor(owner)
    {
        this.owner = owner;
    }
    update(deltaTime)
    {}

    render(context, deltaTime)
    {}
}

//constructor: owner, speed
class MovementComponent extends Component
{
    constructor(owner, speed)
    {
        super(owner);
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
    constructor(owner)
    {
        super(owner);
        this.position = new Point();
        this.angle = 0.0;
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

    get worldX()
    {
        return this.x + this.owner.x;
    }

    get worldY()
    {
        return this.y + this.owner.y;
    }

    setPosition(pos)
    {
        this.position = pos;
    }
}

//owner, width, height, imageFrames, fps, looping
class SpriteComponent extends SceneComponent
{
    constructor(owner, width, height, imageFrames, fps, looping)
    {
        super(owner);
        this.imageFrames = imageFrames;
        this.fps = fps;
        this.width = width;
        this.height = height;
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
        context.translate(this.worldX, this.worldY);
        context.rotate(this.angle);
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
    constructor(owner)
    {
        super(owner);
        this.movement = this.owner.components["movement"];
        this.keys = [];
        this.mousePos = new Point();
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
        this.mousePos.x = event.clientX - canvasBounds.left;
        this.mousePos.y = event.clientY - canvasBounds.top;
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
        super(0,0,"world",width,height);
        this.origin = new Point(this.width/2, this.height/2);
        this.gameObjects = {};
    }

    get player()
    {
        return this.gameObjects["player"];
    }

    set player(value)
    {
        this.gameObjects["player"] = value;
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
        for(var index in this.gameObjects)
        {
            this.gameObjects[index].render(context, deltaTime);
        }
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
        var playerInput = new PlayerInputComponent(player);
        window.addEventListener('keydown', function(e){playerInput.onKeyDown(e);});
        window.addEventListener('keyup', function(e){playerInput.onKeyUp(e);});
        this.canvas.addEventListener('mousemove', function(e){playerInput.onMouseMove(e, this.getBoundingClientRect());});
        this.canvas.addEventListener('mousedown', function(e){playerInput.onMouseDown(e);});
        this.canvas.addEventListener('mouseup', function(e){playerInput.onMouseUp(e);});
        player.addComponent("input", playerInput);
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
    constructor(owner, sheetObj, sheetSize, tileSize, frameLength = 0.5, startIndex = 0)
    {
        super(owner);
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
        context.translate(this.worldX, this.worldY);
        context.rotate(this.angle);
        context.drawImage(
                this.sheetObj,
                this.currentTileX,
                this.currentTileY,
                this.tileSize.x,
                this.tileSize.y, 
                0, 
                0,
                this.owner.width,
                this.owner.height);
        context.restore();
    }
}