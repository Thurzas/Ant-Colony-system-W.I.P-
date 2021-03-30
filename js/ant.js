
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

  From_Nest(){

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
