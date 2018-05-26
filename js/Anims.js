class SpriteSheet
{
    constructor(sheetSource, sheetSize, tileSize)
    {
        this.context = context;
        this.sheetSize = sheetSize;
        this.tileSize = tileSize;
        this.numTiles = new Point(
            sheetSize.width / tileSize.width,
            sheetSize.height / tileSize.height);
        this.totalTiles = this.numTiles.x * this.numTiles.y;
        this.tileData = new Array();

        //Initialize canvas to store sprite info
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.sheetSize.width;
        this.canvas.height = this.sheetSize.height;
        this.ctx = this.canvas.getContext("2d");
        var sheetObj = new Image();
        sheetObj.src = sheetSource;
        sheetObj.onload = function (){
            this.context.drawImage(sheetObj, 0,0);
            for(var i = 0; i < this.numTiles.y; i++)
            {
                for(var j = 0; j < this.numTiles.x; j++)
                {
                    this.tileData.push(this.context.getImageData(j * this.tileWidth, i * this.tileHeight, this.tileWidth, this.tileHeight));
                }
            }
        }
    }

    get tileWidth()
    {
        return this.tileSize.width;
    }

    get tileHeight()
    {
        return this.tileSize.height;
    }

    render(context, index, position)
    {
        context.putImageData(this.tileData[index], position.x, position.y);
    }
}