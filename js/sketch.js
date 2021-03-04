var tick;
var colony;
var timer;
var tiles;
var amap;
var ants;
var seed = Math.random()*100000;
//var seed =46087.82076826938;
//var seed =62956.347558988076; //ocean
//var seed =60348.07977933963;
//var seed = 76085.86539404195 ; //BABABA BA BANANA
var canvas;
var fpsInfo;
var info;
var coords;
var local;
var colonies = new Array();
var info2;
var lastLoop = new Date();
var thisLoop;
var visible;
var filler;
var limits;
function setup() {
  background(51);
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  amap = new AntMap(32);
  coords=new Vector(0,0);
  local= new Vector(0,0);
  limits = new Vector(Math.round(window.innerWidth/(Tile.Size*node.Size)), Math.round(window.innerHeight/(Tile.Size*node.Size)));
  filler = new Filler(amap);
  new ColonyFactory(colonies,coords,amap);
  timer = createP("time : ");
  tiles = createP("tiles : " + amap.Tiles.length);
  ants = createP("workers : ");
  info = createP("coords : " + coords);
  info2 = createP("local : ");
  fpsInfo = createP("fps :");
  visible = createP("repainted chunks : ");
  tick=0;
  Tile.Seed(seed);
  console.log(Tile.Seed);
  setInterval(CountDown,1000);
  setInterval(WorkingProcess,100);
  console.log(limits);
}

function mouseClicked(){
  console.log(amap);
  colonies.push(new ColonyFactory(colonies,coords,amap));
}
function WorldToLocal(){
  coords.x=mouseX;
  coords.y=mouseY;
  local.x = Math.round(coords.x/(node.Size))
  local.y = Math.round(coords.y/(node.Size));
  info.html("coords : " + coords)
  info2.html("local : " + local);
}
function CountDown()
{
  timer.html(tick);
  tiles.html("tiles : "+ amap.Tiles.length);
  var nb=0;
  for(var i =0; i<colonies.length;i++){
    nb+=colonies[i].Ants.length;
    colonies[i].Update(tick);
  }
  visible.html("repainted chunks : " + amap.LastUpdate.length);
  ants.html("workers : "+ nb);
  tick++;
}

function WorkingProcess(){
  for(var i =0; i<colonies.length;i++){
    colonies[i].Work();
  }
}

function getFPS(){
  var thisLoop = new Date();
  fps=Math.round(1000 / (thisLoop - lastLoop));
  fpsInfo.html("fps : " +  fps) ;
  lastLoop = thisLoop;
}
function draw()
{
  //clear();
  amap.UpdateFrom(coords);
  for(var i =0; i<colonies.length;i++){
    colonies[i].Display();
  }
  WorldToLocal();
  getFPS();
}

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
    var v = new Vector(Math.round(Coords.x/(Tile.Size*node.Size)),Math.round(Coords.y/(Tile.Size*node.Size)));

    if(this.Map.Contains(v))
    {
       var nv=new Vector(Math.round(Coords.x/node.Size)%Tile.Size,Math.round(Coords.y/node.Size)%Tile.Size);
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
class state {
  constructor(component)
  {
    this.component=component;
  }
  Update(){

  }
}
class Vector{
  constructor(x,y){
    this.x=x;
    this.y=y;
  }
  toString()
  {
    return " ( "+ this.x + " , "+ this.y + " )";
  }
}
class AntFactory{
  constructor(Pos,type)
  {
    this.V=Pos;
    switch(type)
    {
      case "Worker":
        return new Worker(Pos);
      case "Queen":
        return new Queen(Pos);
      case "Soldier":
        return new Soldier(Pos);
      default:
        return new Worker();
    }
  }
}
class Ant{
  static Size = 2;
  constructor(Pos){
    this.V=Pos;
    this.state= new state();

  }
  Work(){
    console.log("i'm just a poor ant, i need no sympathy. Beccause i'm easy come, easy go, little hight, little low.");
  }
  Down(){
    this.V.y++;
  }
  Up(){
    this.V.y--;
  }
  Left(){
    this.V.x--;
  }
  Right(){
    this.V.x++;
  }
  Move(){
    var rx = Math.random()*10 - 5;
    var ry = Math.random()*10 - 5;
    this.V.x+=rx;
    this.V.y+=ry;
  }
  Display(){
    fill(51);
    rect(this.V.x,this.V.y,Ant.Size,Ant.Size);
  }
}
class Worker extends Ant{
  Work(){
    this.Move();
    //console.log("Ready to Work !");
  }
}
class Queen extends Ant{
  constructor(Pos){
    super(Pos);
    this.GaveBirth=true;
  }
  Work(){
    const delay=10;
    if(!this.GaveBirth)
    {
      if(this.Colony.Food>0 && this.Colony.Ants.length<20)
      {
          this.Colony.Ants.push(new AntFactory(new Vector(this.V.x+1,this.V.y),"Worker"));
          this.Colony.Food--;
          this.GaveBirth=true;
      }
    }
  }
  ResetDelay(tick){
    if(tick%10==0)
    {
      this.GaveBirth=false;
    }
  }
}
class Soldier extends Ant{
  Work(){
      console.log("Patroling !");
  }
}
class AntMap
{
  constructor(MaxView){
    this.Tiles = new Array();
    this.ViewDst= 8;
    this.InViewDst = Math.round(this.ViewDst/(Tile.Size));
    this.LastUpdate= new Array();
    this.TileInfo=new TileInfo();
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
          var t = new Tile(v);
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
  constructor()
  {
    this.Key=new Vector(0,0);
    this.Value=new Tile(this.Key);
  }
}

class Tile
{
  static Size = 8;
  static noiseScale = 25;
  static persistance = 1;
  static octaves = 8;
  static lacunarity =0.7;
  static Max=3;
  static Min=0;
  static Zoffset=0.022;
  static XOffset=100000;
  static YOffset=90600;
  static riverRange = 0.322;
  static riverDeepness=0.0691438;
  constructor(v){
    this.Data=new Array();
    this.V=new Vector(v.x*Tile.Size*node.Size,v.y*Tile.Size*node.Size);
    this.local=v;
    this.isVisible=false;
    this.Selected=false;
    this.Visited=false;
    for(var i=0;i<Tile.Size;i++)
    {
      for(var j = 0 ;j<Tile.Size;j++)
      {
        var frequency=1;
        var amplitude=1;
        var noiseHeight=0;

        for(var o = 0; o<Tile.octaves;o++){
          var x = Math.round(this.V.x/Tile.Size)+Tile.XOffset;
          var y = Math.round(this.V.y/Tile.Size)+Tile.YOffset;
            //console.log(x + " " + y);
          var X = (x+i-Tile.Size/2) / Tile.noiseScale * frequency;
					var Y = (y+j-Tile.Size/2) / Tile.noiseScale * frequency;
          noiseHeight += (noise(X,Y)*2 -1)*amplitude+Tile.Zoffset;
          amplitude *= Tile.persistance;
          frequency *= Tile.lacunarity;
        }

        var offset = 0.9;
        var prev = 1.0;
        var river=0;
        for(var o=0 ; o < 1; o++) {
            var x = Math.round(this.V.x/Tile.Size)+Tile.XOffset;
            var y = Math.round(this.V.y/Tile.Size)+Tile.YOffset;
            //console.log(x + " " + y);
            var X = (x+i-Tile.Size/2) / Tile.noiseScale * frequency;
            var Y = (y+j-Tile.Size/2) / Tile.noiseScale * frequency;
            var n = this.ridge(noiseHeight/Tile.riverRange+Tile.Zoffset, offset);
            river += n*amplitude;
            river += n*amplitude*prev;  // scale by previous octave
            prev = n;
            frequency *= Tile.lacunarity;
            amplitude *= Tile.persistance;
        }
        if(noiseHeight>(river/Tile.riverDeepness))
        {
          noiseHeight=river-Tile.Zoffset;
        }

        if(noiseHeight>Tile.Max)
        {
          noiseHeight=Tile.Max;
        }
        if(noiseHeight<Tile.Min)
        {
           noiseHeight=Tile.Min;
        }
        this.Data.push(new node(new Vector(i*node.Size+this.V.x,j*node.Size+this.V.y),noiseHeight));
      }
    }
  }
  ridge(h, offset){
    h = abs(h);     // create creases
    h = offset - h; // invert so creases are at top
    h = h * h;      // sharpen creases
    return h;
  }
  static Seed = function(seed){
    Tile.Seed = seed;
    noiseSeed(Tile.Seed);
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
class Bound
{
  constructor(Pos, Size){
    this.V = Pos;
    this.Size = Size;
  }
  Collide(other,Size){
    var distance = Math.sqrt((this.V.x - other.V.x) * (this.V.x - other.V.x) +
                             (this.V.y - other.V.y) * (this.V.y - other.V.y));
    return distance < (this.Size + Size);
  }

  Draw(){
    stroke("rgb(125,0,0)");
    circle(this.V.x,this.V.y,this.Size);
  }
}

class node
{
  static Size=10;
  constructor(Pos,value){
    this.V=Pos;
    this.Value=value;
    this.Walkable=true;
    this.Food=false;
    this.FoodValue=0;
  }
  Draw(){
    //stroke("rbg(255,255,255)");
    noStroke();
    var water = 0.01;
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
    else if(this.Value>=0 && this.Value < water)
    {
      fill("rgb(2,179,231)");
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
    square(this.V.x,this.V.y,node.Size);
    }
}
class Filler{
  constructor(amap){
    this.cursor=new Vector(0,0);
    this.Map=amap;
    for(var i =0; i<limits.x; i++){
      for(var j = 0; j<limits.y; j++)
      {
        this.cursor.y = ( limits.y - j)*Tile.Size*node.Size;
        this.Map.UpdateFrom(this.cursor);
      }
        this.cursor.x = ( limits.x - i)*Tile.Size*node.Size;
    }
  }
}
