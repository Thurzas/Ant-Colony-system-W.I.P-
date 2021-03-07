class AntMap
{
  constructor(MaxView){
    this.Tiles = new Array();
    this.ViewDst= MaxView;
    this.TileData=new TileData();
    this.InViewDst = Math.round(this.ViewDst/(Tile.Size));
    this.LastUpdate= new Array();
    this.TileInfo=new TileInfo(this.TileData);
  }
  Contains(Pos)
  {
    for(var i = 0 ; i < this.Tiles.length;i++){
      //var v = new Vector(Math.round(this.Tiles[i].V.x / (Tile.Size*node.Size)),Math.round(this.Tiles[i].V.y / (Tile.Size*node.Size)));
      if(this.Tiles[i].local.x==Pos.x && this.Tiles[i].local.y==Pos.y)
      {
        this.TileInfo.Key=this.Tiles[i].local;
        this.TileInfo.Value=this.Tiles[i];
        return true;
      }
    }
    return false;
  }
  UpdateFrom(coords)
  {
    var x = Math.round(coords.x/(Tile.Size*node.Size));
    var y = Math.round(coords.y/(Tile.Size*node.Size));
    var b = new Bound(coords,Tile.Size*node.Size)
    //console.log(coords + "   "+x+ "   " + y)
    for(var i =0;i<this.LastUpdate.length;i++){
      this.LastUpdate[i].isVisible=false;
    }
    this.LastUpdate=new Array();

    for( var yOffset = -this.InViewDst; yOffset<=this.InViewDst;yOffset++){
      for( var xOffset = -this.InViewDst; xOffset<=this.InViewDst;xOffset++){
        var v = new Vector(x+xOffset,y+yOffset);
				if(this.Contains(v)) {
          this.TileInfo.Value.UpdateVisibility(coords,b);
          if(this.TileInfo.Value.isVisible)
          {
            this.LastUpdate.push(this.TileInfo.Value);
          }
        }
        else {
          var t = new Tile(v,this.TileData);
			    this.Tiles.push(t);
          t.Draw();
				}
      }
    }
    return b;
  }
  DisplayWithFog(){
    for(var i = 0; i< this.Tiles.length;i++)
    {
      if(this.Tiles[i].isVisible)
      {
        this.Tiles[i].Draw();
      }
    }
  }
}

class TileInfo
{
  constructor(info)
  {
    this.Key=new Vector(0,0);
    if(info===undefined)
      info=new TileData();
    this.Value=new Tile(this.Key,info);
  }
}

class TileData{
  constructor(noiseScale,persistance,octaves,lacunarity,Max,Min,Zoffset,Xoffset,Yoffset,riverRange,riverDeepness,Seed){
    if(Seed===undefined)
      Seed=Math.random()*10000;

    if(riverDeepness===undefined)
      riverDeepness = 0.0691438;

    if(riverRange===undefined)
      riverRange = 0.322;

    if(Yoffset===undefined)
      Yoffset = 0;

    if(Xoffset===undefined)
      Xoffset = 0;

    if(Zoffset===undefined)
      Zoffset = 0.022;

    if(Min===undefined)
      Min = 0;

    if(Max===undefined)
      Max = 3;

    if(lacunarity===undefined)
      lacunarity =0.7;

    if(octaves===undefined)
      octaves = 8;

    if(persistance===undefined)
      persistance = 1;

    if(noiseScale===undefined)
      noiseScale = 25;


    this.noiseScale = noiseScale;
    this.persistance = persistance;
    this.octaves = octaves;
    this.lacunarity =lacunarity;
    this.Max=Max;
    this.Min=Min;
    this.Zoffset=Zoffset;
    this.XOffset=Xoffset;
    this.YOffset=Yoffset;
    this.riverRange = riverRange;
    this.riverDeepness=riverDeepness;
    this.Seed=Seed;
  }
}

class Tile
{
  static Size=8;
  constructor(v,info){
    if(info===undefined)
      info=new TileData();
    this.Data=new Array();
    this.local=v;
    this.isVisible=false;
    this.Info=info;
    this.V=new Vector(v.x*Tile.Size*node.Size,v.y*Tile.Size*node.Size);
    noiseSeed(this.Info.Seed);
    for(var i=0;i<Tile.Size;i++)
    {
      for(var j = 0 ;j<Tile.Size;j++)
      {
        var frequency=1;
        var amplitude=1;
        var noiseHeight=0;

        for(var o = 0; o<this.Info.octaves;o++){
          var x = Math.round(this.V.x/Tile.Size)+10000000+this.Info.XOffset;
          var y = Math.round(this.V.y/Tile.Size)+10000000+this.Info.YOffset;
            //console.log(x + " " + y);
          var X = (x+i-Tile.Size/2) / this.Info.noiseScale * frequency;
					var Y = (y+j-Tile.Size/2) / this.Info.noiseScale * frequency;
          noiseHeight += (noise(X,Y)*2 -1)*amplitude+this.Info.Zoffset;
          amplitude *= this.Info.persistance;
          frequency *= this.Info.lacunarity;
        }

        var offset = 0.9;
        var prev = 1.0;
        var river=0;
        for(var o=0 ; o < 1; o++) {
            var x = Math.round(this.V.x/Tile.Size)+10000000+this.Info.XOffset;
            var y = Math.round(this.V.y/Tile.Size)+10000000+this.Info.YOffset;
            //console.log(x + " " + y);
            var X = (x+i-Tile.Size/2) / this.Info.noiseScale * frequency;
            var Y = (y+j-Tile.Size/2) / this.Info.noiseScale * frequency;
            var n = this.ridge(noiseHeight/this.Info.riverRange+this.Info.Zoffset, offset);
            river += n*amplitude;
            river += n*amplitude*prev;  // scale by previous octave
            prev = n;
            frequency *= this.Info.lacunarity;
            amplitude *= this.Info.persistance;
        }
        if(noiseHeight>(river/this.Info.riverDeepness))
        {
          noiseHeight=river-this.Info.Zoffset;
        }

        if(noiseHeight>this.Info.Max)
        {
          noiseHeight=this.Info.Max;
        }
        if(noiseHeight<this.Info.Min)
        {
           noiseHeight=this.Info.Min;
        }
        this.Data.push(new node(new Vector(i*node.Size+this.V.x,j*node.Size+this.V.y),noiseHeight));
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
    console.log("Tile : "+ this.V + "local : " + this.local + "  coords " + coords)
    if(coords.x==undefined || coords.y == undefined)
      return;
    if(coords.x<Tile.Size && coords.y<Tile.Size && coords.x>=0 && coords.y>=0)
      return this.Data[Math.round(coords.x)*Tile.Size + Math.round(coords.y)];
  }
  WorldToLocal(coords)
  {
    return new Vector(Math.round(coords.x/node.Size)%Tile.Size,Math.round(coords.y/node.Size)%Tile.Size);
  }
  UpdateVisibility(coords,b)
  {
    if(b.Collide(this,Tile.Size*node.Size))
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
    stroke(51);
    rect(this.V.x,this.V.y,Tile.Size*node.Size,Tile.Size*node.Size);
  }
}
