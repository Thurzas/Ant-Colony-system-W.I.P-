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
var filler;
var limits;
function setup() {
  background(51);
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  amap = new AntMap(32);
  coords=new Vector(0,0);
  local= new Vector(0,0);
  new ColonyFactory(colonies,coords,amap);
  console.log(Tile.Size);
  limits = new Vector(Math.round(window.innerWidth/(Tile.Size*node.Size)), Math.round(window.innerHeight/(Tile.Size*node.Size)));
  filler = new Filler(amap);
  timer = createP("time : ");
  tiles = createP("tiles : " + amap.Tiles.length);
  ants = createP("workers : ");
  info = createP("coords : " + coords);
  info2 = createP("local : ");
  fpsInfo = createP("fps :");
  tick=0;
  amap.TileData.Seed=seed;
  console.log(amap.TileData.Seed);
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
