class ColonyFactory{
  constructor(colonies,Pos,map){
      var Region = new Bound(Pos,Colony.Size);
      for(var i =0;i<colonies.length;i++){
          if(Region.Collide(colonies[i],Colony.Size))
          {
            return;
          }
      }
      return new Colony(new Vector(Pos.x,Pos.y),map);
  }
}
class Colony{
  static Size=10;
  constructor(Pos,map){
    this.Food=50;
    this.V=Pos;
    this.Ants=new Array();
    this.Queen=new AntFactory(Pos,"Queen");
    this.Queen.Colony=this;
    this.Map=map;
  }

  SetNode(Coords,Value){
    var v = new Vector(Math.round(Coords.x/(this.Map.TileData.Size*node.Size)),Math.round(Coords.y/(this.Map.TileData.Size*node.Size)));

    if(this.Map.Contains(v))
    {
       var nv=new Vector(Math.round(Coords.x/node.Size)%this.Map.TileData.Size,Math.round(Coords.y/node.Size)%this.Map.TileData.Size);
       var n = this.Map.TileInfo.Value.GetNode(nv);
       n.Value=-50;
    }
    else {
      console.log("tile not found");
    }
  }
  Work(){
    this.UpdateMap();
    for(var i =0; i < this.Ants.length;i++){
      this.Ants[i].Work();
    }
    this.Queen.Work();
  }
  Display(){
    this.Map.DisplayWithFog();
    for(var i =0;i<this.Ants.length;i++)
    {
      this.Ants[i].Display();
    }
    stroke('rgb(255,0,0)');
    fill('rgb(255,0,0)');
    this.Queen.Display();
    stroke(51);
    fill(51);
  }
  UpdateMap(){
    for(var i = 0;i<this.Ants.length;i++){
      this.Map.UpdateFrom(this.Ants[i].V);
    }
  }
  Update(tick){
    this.Queen.ResetDelay(tick);
  }
}
