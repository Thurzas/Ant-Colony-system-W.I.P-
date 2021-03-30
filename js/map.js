class AntMap
{
  constructor(Rectangle,MaxView){
    this.Tiles = new QuadTree(Rectangle,1);
    this.ViewDst= MaxView;
    this.TileInfo=new TileInfo();
    this.InViewDst = Math.floor(this.ViewDst/(TileInfo.Size));
    this.LastUpdate= new Array();
    this.TileBox=new TileBox(this.TileInfo);
    this.Layer=new Array();
    this.Rectangle=Rectangle;
  }
  Reload(){
    this.Tiles=new QuadTree(this.Rectangle,1);
  }
  Contains(Pos)
  {
    /*
    for(var i = 0 ; i < this.Tiles.length;i++){
      //var v = new Vector(Math.floor(this.Tiles[i].V.x / (TileInfo.Size*TileInfo.Size)),Math.floor(this.Tiles[i].V.y / (TileInfo.Size*TileInfo.Size)));
      if(this.Tiles[i].local.x==Pos.x && this.Tiles[i].local.y==Pos.y)
      {
        this.TileBox.Key=this.Tiles[i].local;
        this.TileBox.Value=this.Tiles[i];
        return true;
      }
    }
    return false;
    */
    var list = new Array();
    var Size=TileInfo.Size*TileInfo.Size;
    this.Tiles.query(new Rectangle(Pos.x + Size*0.5 ,Pos.y + Size*0.5,Size,Size),list);
    //console.log(list.length)
    for(var i = 0;i<list.length;i++){
      if(list[i].local.x==Pos.x && list[i].local.y==Pos.y)
      {
          this.TileBox.Key=list[i].local;
          this.TileBox.Value=list[i];
          return true;
      }
    }
    return false;
  }
  UpdateFrom(coords)
  {
    var x = Math.floor(coords.x/(TileInfo.Size*TileInfo.Size));
    var y = Math.floor(coords.y/(TileInfo.Size*TileInfo.Size));
    var b = new Bound(coords,TileInfo.Size*TileInfo.Size)
    //console.log(coords + "   "+x+ "   " + y)
    for(var i =0;i<this.LastUpdate.length;i++){
      this.LastUpdate[i].isVisible=false;
    }
    this.LastUpdate=new Array();

    for( var yOffset = -this.InViewDst; yOffset<=this.InViewDst;yOffset++){
      for( var xOffset = -this.InViewDst; xOffset<=this.InViewDst;xOffset++){
        var v = new Vector(x+xOffset,y+yOffset);
				if(this.Contains(v)) {
          this.TileBox.Value.UpdateVisibility(coords,b);
          if(this.TileBox.Value.isVisible)
          {
            this.Layer.push(this.TileBox.Value);
            this.LastUpdate.push(this.TileBox.Value);
          }
        }
        else {
          var t = new Tile(v,this.TileInfo);
			    this.Tiles.insert(t);
          this.Layer.push(t);
				}
      }
    }
    return b;
  }
  DisplayWithFog(){
    //console.log(this.Layer.length);
    for(var i = 0;i < this.Layer.length;i++){
      if(this.Layer[i].isVisible){
        this.Layer[i].Draw();
      }
    }
    this.Layer=new Array();
  }

  SetNode(Coords,Value){
    var v = new Vector(Math.floor(Coords.x/(TileInfo.Size*TileInfo.Size)),Math.floor(Coords.y/(TileInfo.Size*TileInfo.Size)));
    if(this.Contains(v))
    {
       var nv=new Vector(Math.floor(Coords.x/TileInfo.Size)%TileInfo.Size,Math.floor(Coords.y/TileInfo.Size)%TileInfo.Size);
       //console.log(this.TileBox.Value);
       this.TileBox.Value.selected=true;
       var n = this.TileBox.Value.GetNode(nv);
       n.Value=Value;
    }
    else {
      //console.log("tile not found");
    }
  }
}

class TileBox
{
  constructor(info)
  {
    this.Key=new Vector(0,0);
    if(info===undefined)
      info=new TileInfo();
    this.Value=new Tile(this.Key,info);
  }
}

class TileInfo{
  static Size=8;
  constructor(noiseScale,persistance,octaves,lacunarity,Max,Min,ZOffset,Xoffset,Yoffset,riverRange,riverDeepness,Seed){
    if(Seed===undefined)
      Seed=Math.random()*10000;

    if(riverDeepness===undefined)
      riverDeepness = 0.0691438;

    if(riverRange===undefined)
      riverRange = 0.322;

    if(Yoffset===undefined||!Number.isInteger(parseInt(Yoffset)))
    {
      Yoffset = 0;
    }
    if(Xoffset===undefined||!Number.isInteger(parseInt(Xoffset))){
      Xoffset = 0;
    }

    if(ZOffset===undefined)
      ZOffset = 0.022;

    if(Min===undefined)
      Min = -1;

    if(Max===undefined)
      Max = 3;

    if(lacunarity===undefined)
      lacunarity =0.7;

    if(octaves===undefined)
      octaves = 8;

    if(persistance===undefined)
      persistance = 0.9;

    if(noiseScale===undefined)
      noiseScale = 25;


    this.noiseScale = noiseScale;
    this.persistance = persistance;
    this.octaves = octaves;
    this.lacunarity =lacunarity;
    this.Max=Max;
    this.Min=Min;
    this.ZOffset=ZOffset;
    this.XOffset=parseInt(Xoffset);
    this.YOffset=parseInt(Yoffset);
    this.riverRange = riverRange;
    this.riverDeepness=riverDeepness;
    this.Seed=Seed;
  }
}

class Tile
{
  constructor(v,info){
    if(info===undefined)
      info=new TileInfo();

    this.Data=new Array();
    this.local=v;
    this.isVisible=false;
    this.Info=info;
    this.selected=false;
    this.V=new Vector(v.x*TileInfo.Size*TileInfo.Size,v.y*TileInfo.Size*TileInfo.Size);
    this.x=this.local.x;
    this.y=this.local.y;
    noiseSeed(this.Info.Seed);
    for(var i=0;i<TileInfo.Size;i++)
    {
      for(var j = 0 ;j<TileInfo.Size;j++)
      {
        var frequency=1;
        var amplitude=1;
        var noiseHeight=0;

        for(var o = 0; o<this.Info.octaves;o++){
          var x = this.V.x/TileInfo.Size+1000000*TileInfo.Size+this.Info.XOffset;
          var y = this.V.y/TileInfo.Size+1000000*TileInfo.Size+this.Info.YOffset;
//          var x = Math.floor(this.V.x/TileInfo.Size)+10000000+this.Info.XOffset;
//          var y = Math.floor(this.V.y/TileInfo.Size)+10000000+this.Info.YOffset;
            //console.log(x + " " + y);
          var X = (x+i) / this.Info.noiseScale * frequency;
					var Y = (y+j) / this.Info.noiseScale * frequency;
          noiseHeight += (noise(X,Y)*2 -1)*amplitude+this.Info.ZOffset;
          amplitude *= this.Info.persistance;
          frequency *= this.Info.lacunarity;
        }

        var offset = 0.9;
        var prev = 1;
        var river=0;
        var amp=1;
        for(var o=0 ; o < this.Info.octaves ; o++) {
            var x = Math.floor(this.V.x/TileInfo.Size)+this.Info.XOffset*TileInfo.Size;
            var y = Math.floor(this.V.y/TileInfo.Size)+this.Info.YOffset*TileInfo.Size;
            var X = (x+i) / this.Info.noiseScale*10 * frequency;
            var Y = (y+j) / this.Info.noiseScale*10 * frequency;
            var n = this.ridge(noiseHeight/this.Info.riverRange+this.Info.ZOffset, offset);
            river += n*amp;
            river += n*amp*prev;
            prev = n;
            frequency *= this.Info.lacunarity;
            amp *= this.Info.persistance;
        }
        if(noiseHeight>(river/this.Info.riverDeepness))
        {
          noiseHeight=river;
        }

        if(noiseHeight>this.Info.Max)
        {
          noiseHeight=this.Info.Max;
        }
        if(noiseHeight<this.Info.Min)
        {
           noiseHeight=this.Info.Min;
        }
        this.Data.push(new node(new Vector(i*TileInfo.Size+this.V.x,j*TileInfo.Size+this.V.y),noiseHeight));
      }
    }
  }
  ridge(h, offset){
    h = abs(h);
    h = offset - h;
    h = h * h;
    return h;
  }
  GetNode(coords)
  {
    //console.log("Tile : "+ this.V + "local : " + this.local + "  coords " + coords)
    if(coords.x==undefined || coords.y == undefined)
      return;
    for(var i  =0;i<TileInfo.Size*TileInfo.Size;i++){
      if(this.Data[i].local.x==coords.x && this.Data[i].local.y==coords.y)
      {
        return this.Data[i];
      }
    }
  }
  WorldToLocal(coords)
  {
    return new Vector(Math.floor(coords.x/TileInfo.Size)%TileInfo.Size,Math.floor(coords.y/TileInfo.Size)%TileInfo.Size);
  }
  UpdateVisibility(coords,b)
  {
    if(b.Collide(this,TileInfo.Size*TileInfo.Size))
    {
      this.SetVisible(true);
      this.Draw();
      this.Visited=true;
    }
  }
  SetVisible(visible){
    this.isVisible=visible;
  }
  Draw()
  {
    for(var i=0;i<this.Data.length;i++)
    {
      this.Data[i].Draw();
    }
    noFill();
    if(this.selected)
      stroke("rgb(255,0,0)");
    else
      stroke(51);
    rect(this.V.x,this.V.y,TileInfo.Size*TileInfo.Size,TileInfo.Size*TileInfo.Size);
  }
  contains(point){
    return (point.x >= this.V.x - this.Size().x &&
      point.x <= this.V.x + - this.Size().x &&
      point.y >= this.V.y - - this.Size().y &&
      point.y <= this.V.y + - this.Size().y);
  }
  Size(){
    return new Vector(TileInfo.Size*TileInfo.Size,TileInfo.Size*TileInfo.Size);
  }
}
class node
{
  constructor(Pos,value){
    this.V=Pos;
    this.Value=value;
    this.Walkable=true;
    this.Food=false;
    this.FoodValue=0;
    this.local=new Vector(Math.floor(Pos.x/TileInfo.Size)%TileInfo.Size,Math.floor(Pos.y/TileInfo.Size)%TileInfo.Size)
  }
  Draw(){
    //stroke("rbg(255,255,255)");
    noStroke();
    var water = 0.03;
    var deep = -.5;
    var sand = 0.1
    var grass = 0.4;
    var tree = 0.7;
    var boulder = 1;
    var snow = 1.3;
    if(this.Value===-50)
    {
      fill("rgb(255,0,0)");
      this.Walkable=false;
    }
    else if(this.Value>=-1 && this.Value < deep)
    {
      fill("rgb(2,179,231)");
      this.Walkable=false;
    }
    else if(this.Value>=deep && this.Value < water)
    {
      fill("rgb(0,185,255)");
      this.Walkable=false;
    }
    else if(this.Value>=water && this.Value<=sand)
    {
      fill("rgb(225,228,92)");

    }
    else if(this.Value>sand && this.Value<=grass)
    {
      fill("rgb(133,223,0)");
    }
    else if(this.Value> grass && this.Value<=tree)
    {
      fill("rgb(0,198,0)");
      this.Food=true;
      this.FoodValue=10;
    }
    else if(this.Value> tree && this.Value<boulder ) {
      fill("rgb(120,128,128)");
      this.Walkable=false;
    }
    else if(this.Value>=boulder && this.Value<snow)
    {
      fill("rgb(155,155,155)");
      this.Walkable=false;
    }
    else if(this.Value>=snow)
    {
      fill("rgb(255,255,255)");
      this.Walkable=false;
    }
    square(this.V.x,this.V.y,TileInfo.Size);
    }
}
