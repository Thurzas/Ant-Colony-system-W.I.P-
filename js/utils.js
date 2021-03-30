
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

class Filler{
  constructor(amap){
    this.Map=amap;
    this.queue=new Array();
    this.visited=new Array();
    this.dx = [0,   1,  1, 1, 0, -1, -1, -1];
    this.dy = [-1, -1,  0, 1, 1, 1, 0, -1];
    this.toFill(new Vector((limits.x/2)*TileInfo.Size*TileInfo.Size,(limits.y/2)*TileInfo.Size*TileInfo.Size));
  }
  work(){
    for(var i =0;i<1000;i++){
      var c = this.queue.shift();
      this.toFill(c);
    }
  }
  contains(V){
    for(var i = 0; i<this.visited.length;i++){
      if(this.visited[i].x===V.x &&this.visited[i].y===V.y)
        return true;
    }
    return false;
  }
  toFill(V){
    if(V===undefined)
      return;
    if(V.x<0||V.y<0 || V.x>limits.x*TileInfo.Size*TileInfo.Size || V.y>limits.y*TileInfo.Size*TileInfo.Size ||this.contains(V))
      return;

    amap.UpdateFrom(V);
    this.visited.push(V);
    for(var i = 0; i<this.dx.length;i++){
      var v = new Vector(V.x+this.dx[i]*amap.InViewDst*TileInfo.Size*TileInfo.Size,V.y+this.dy[i]*amap.InViewDst*TileInfo.Size*TileInfo.Size);
      this.queue.push(v);
    }
  }
}
