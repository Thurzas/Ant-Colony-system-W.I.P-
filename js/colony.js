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
    this.GCD=false;
  }
  Work(){
    this.UpdateMap();
    if(this.GCD)
    {
      for(var i =0; i < this.Ants.length;i++){
        this.Ants[i].Work();
      }
      this.Queen.Work();
      this.GCD=false;
    }
  }
  resetGCD(){
    this.GCD=true;
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
