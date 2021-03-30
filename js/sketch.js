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
var seed =70943.27408597403;
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
var noiseScale;
var persistance;
var octaves;
var lacunarity;
var Zoffset;
var Xoffset;
var Yoffset;
var riverRange;
var riverDeepness;
var Seed;
var noiseScaleL;
var persistanceL;
var octavesL;
var lacunarityL;
var ZoffsetL;
var XoffsetL;
var YoffsetL;
var riverRangeL;
var riverDeepnessL;
var SeedL;
var noiseScaleO;
var persistanceO;
var octavesO;
var lacunarityO;
var ZoffsetO;
var XoffsetO;
var YoffsetO;
var riverRangeO;
var riverDeepnessO;
var SeedO;
var Min=-1;
var Max=3;

function setup() {
  canvas = createCanvas(window.innerWidth, window.innerHeight);
  limits = new Vector(Math.floor(window.innerWidth/(TileInfo.Size*TileInfo.Size)), Math.floor(window.innerHeight/(TileInfo.Size*TileInfo.Size)));
  amap = new AntMap(new Rectangle(0,0,limits.x,limits.y),TileInfo.Size);
  coords=new Vector(0,0);
  local= new Vector(0,0);
  amap.TileInfo.Seed=seed;
  console.log(amap.TileInfo.Seed);
  filler = new Filler(amap);
  timer = createP("time : ");
  tiles = createP("tiles : " + amap.Tiles.length);
  ants = createP("workers : ");
  info = createP("coords : " + coords);
  info2 = createP("local : ");
  fpsInfo = createP("fps :");
  tick=0;
  setupForm();
  values = createP("noiseScale : " + noiseScale.value() +"   persistance : " +persistance.value() + "   octaves : " +octaves.value()+ "   lacunarity : " +lacunarity.value() + "   Zoffset : "+Zoffset.value() + "   Xoffset : " +Xoffset.value() + "   Yoffset : "+Yoffset.value() + " river's distance from mountain : " + riverRange.value() +"   river deepness" + riverDeepness.value(),"   seed : " + Seed.value());
  setInterval(CountDown,1000);
  setInterval(WorkingProcess,100);
}

function setupForm(){
  setForm();
  noiseScale.input(OnChange);
  persistance.input(OnChange);
  octaves.input(OnChange);
  lacunarity.input(OnChange)
  Zoffset.input(OnChange);
  Xoffset.input(OnChange);
  Yoffset.input(OnChange);
  riverRange.input(OnChange);
  riverDeepness.input(OnChange);
  Seed.input(OnChange);
}
function setForm(){
  var Data=amap.TileInfo;
  noiseScaleO = select('#noiseScaleO');
  persistanceO  = select('#persistanceO');
  octavesO  = select('#octavesO');
  lacunarityO  = select('#lacunarityO');
  ZoffsetO  = select('#ZoffsetO');
  XoffsetO  = select('#XoffsetO');
  YoffsetO = select('#YoffsetO');
  riverRangeO   = select('#riverRangeO');
  riverDeepnessO   = select('#riverDeepnessO');
  noiseScaleL = select('#noiseScaleL');
  persistanceL  = select('#persistanceL');
  octavesL  = select('#octavesL');
  lacunarityL  = select('#lacunarityL');
  ZoffsetL  = select('#ZoffsetL');
  XoffsetL  = select('#XoffsetL');
  YoffsetL = select('#YoffsetL');
  riverRangeL   = select('#riverRangeL');
  riverDeepnessL   = select('#riverDeepnessL');
  SeedL  = select('#seedL');

  noiseScale = select('#noiseScale');
  persistance  = select('#persistance');
  octaves  = select('#octaves');
  lacunarity  = select('#lacunarity');
  Zoffset  = select('#Zoffset');
  Xoffset  = select('#Xoffset');
  Yoffset = select('#Yoffset');
  riverRange   = select('#riverRange');
  riverDeepness   = select('#riverDeepness');
  Seed  = select('#seed');
  console.log(riverRange)
  updateParams(Data);
}
function OnChange(){
  amap.Reload();
  amap.TileInfo=new TileInfo(noiseScale.value(),persistance.value(),octaves.value(),lacunarity.value(),Max,Min,Zoffset.value(),Xoffset.value(),Yoffset.value(),riverRange.value(),riverDeepness.value() ,Seed.value());
  updateParams(amap.TileInfo);
  values.html("");
  values.html("noiseScale : " + noiseScale.value() +"   persistance : " +persistance.value() + "   octaves : " +octaves.value()+ "   lacunarity : " +lacunarity.value() + "   Zoffset : "+Zoffset.value() + "   Xoffset : " +Xoffset.value() + "   Yoffset : "+Yoffset.value() + " river's distance from mountain : " + riverRange.value() +"   river deepness" + riverDeepness.value(),"   seed : " + Seed.value());
  filler=new Filler(amap);
}
function updateParams(data){
  noiseScaleO.html(" " + data.noiseScale);
  persistanceO.html(" "+data.persistance);
  octavesO.html(" "+data.octaves);
  lacunarityO.html(" "+data.lacunarity);
  ZoffsetO.html(" "+data.ZOffset);
  XoffsetO.html(" "+data.XOffset);
  YoffsetO.html(" "+data.YOffset);
  riverRangeO.html(" "+data.riverRange);
  riverDeepnessO.html(" "+data.riverDeepness);
  noiseScale.value(data.noiseScale);
  persistance.value(data.persistance);
  octaves.value(data.octaves);
  lacunarity.value(data.lacunarity);
  Zoffset.value(data.ZOffset);
  Xoffset.value(data.XOffset);
  Yoffset.value(data.YOffset);
  riverRange.value(data.riverRange);
  riverDeepness.value(data.riverDeepness);
  Seed.value(data.Seed);
}
function mouseClicked(){
  //if((coords.x<limits.x && coords.y<limits.y) ||( coords.x>0 && coords.y>0))
  //  colonies.push(new ColonyFactory(colonies,coords,amap));
}
function WorldToLocal(){
  coords.x=mouseX;
  coords.y=mouseY;
  local.x = Math.floor(coords.x/(TileInfo.Size))
  local.y = Math.floor(coords.y/(TileInfo.Size));
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
    colonies[i].resetGCD();
  }
}

function getFPS(){
  var thisLoop = new Date();
  fps=Math.floor(1000 / (thisLoop - lastLoop));
  fpsInfo.html("fps : " +  fps) ;
  lastLoop = thisLoop;
}
function draw()
{
  //  clear();
  filler.work();
  for(var i =0; i<colonies.length;i++){
    colonies[i].Work();
  }
  if((coords.x<limits.x && coords.y<limits.y) ||( coords.x>0 && coords.y>0))
      amap.UpdateFrom(coords);


  amap.DisplayWithFog();
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
