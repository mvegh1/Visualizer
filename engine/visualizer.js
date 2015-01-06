Engine.Start(function(){
	$(document).ready(function(){

   var CanvasFactory = new Engine.CanvasFactory(800,600);
   Engine.Canvas = CanvasFactory.Canvas;
   Engine.Context = CanvasFactory.Context;
   Engine.OffScreenCanvas = CanvasFactory.OffScreenCanvas;
   Engine.OffScreenContext = CanvasFactory.OffScreenContext;
   Engine.CreateTopLevelCells();  
   
   for(var x in Engine._TOPLEVELCELLS) {
      Engine.CreateCellBlock(Engine._TOPLEVELCELLS[x],4);
   }
   
   
   $(document.body).html(Engine.Canvas);
   
   var State = new Engine.State();
   var block = new Engine.Primitive.Rectangle({
      Dimensions: new Engine.Dimensions(50,50),
	  Position: new Engine.Vector2(350,400),
	  BackColor: new Engine.Color(255,255,0,1)
   });
   State.MouseDownEvents = function(e) {
      var offset = new Engine.Vector2(e.offsetX,e.offsetY);
      var MouseDownSprites = State.RadialCheck(offset);
	  for(var x in MouseDownSprites) {
	     var sprite = MouseDownSprites[x];
		 if(sprite.Contains(offset) ) {
		     sprite.MouseDown = true;
			 Engine.MouseDownSprite = sprite;
		 }
	  }  
   }
   State.MouseMoveEvents = function(e) {
      var sprite = Engine.MouseDownSprite;
	  if(sprite) {
	     sprite.Resize(Engine.MouseMoveCoordinates,Engine.MouseMoveDelta);
	  }
	  
   }
   
var color = Engine.Utilities.GenerateRandomColor();
      var circle = new Engine.Primitive.Circle({      
		  Dimensions: new Engine.Dimensions(100,100),
		  Rotation: 0,
		  Position: new Engine.Vector2(350,250),
		  BackColor: new Engine.Color(255,255,0,1)
	  });
	  State.AddSprite(circle);
	 
function MakeStatistics() {
   var stats = {};
  for(var i = 0; i <= 10000; i++) {
        var num = BinomialDist(1000,0.3);
	  if(!stats[num]){
	     stats[num] = 1;
	  } else {
	     stats[num]++;
	  }
   }
   var keys = Object.keys(stats).sort(function(a,b){ 
      return parseFloat(a)-parseFloat(b);
   });
   var rtn = {};
   rtn.Stats = stats;
   rtn.Keys = keys;
   return rtn;
}	 



function MakeBar(i,opts) {
   opts = opts || {};
   var rotation = i*Math.PI/180;
   var radius = 100;
   var center = new Engine.Vector2(400,300);
   var width = 1;
   var height = Math.floor(200*Math.random());
   if(opts.Height) {
      height = opts.Height;
   }
   var position = new Engine.Vector2( radius*Math.cos(rotation) + center.X, radius*Math.sin(rotation) + center.Y );
   var dimensions = new Engine.Dimensions(width,height);
   var color;
   if(i <= 90) {
      color = new Engine.Color(255,0,0,1);
   }
   else if(i <= 180) {
       color = new Engine.Color(0,255,0,1);    
   }
   else if(i <= 270) {
       color = new Engine.Color(0,0,255,1);
   }
   else {
      color = new Engine.Color(0,0,0,1);
   }
	  
      var bar = new Engine.Primitive.Rectangle({      
		  Dimensions: dimensions,
		  Rotation: rotation,
		  Position: position,
		  BackColor: color
	  });

	  bar.RotationStyle = "topLeft";
	  bar.HeightIncrease = 1;
	  
	  bar.OverrideUpdate(function() {
			  //bar.Rotation += 1*Math.PI/180;
			 // var position = new Engine.Vector2( radius*Math.cos(bar.Rotation + Math.PI/2) + center.X, radius*Math.sin(bar.Rotation + Math.PI/2) + center.Y );
			 // bar.SetPosition(position);
			 // MakeTracker(bar,State);


	     var height = bar.Dimensions.Height;
		 
		 //bar.Dimensions.Height += bar.HeightIncrease;
		 if(bar.Dimensions.Height >= 200) {
		    bar.HeightIncrease*=-1;
			bar.Dimensions.Height = 200;
		 } 
		 else if(bar.Dimensions.Height <= 0) {
		    bar.HeightIncrease *=-1;
			bar.Dimensions.Height = 0;
		 }
	  });

	  
	  
		 bar.Rotation = rotation - Math.PI/2;
		  
		  State.AddSprite(bar);
}

function MakeTracker(b, s) {
   var r  = b.Rotation;
   var pivot = b.Position;
   var h = b.Dimensions.Height;
   var shift = Engine.Utilities.RotatePoint({X:0,Y:h},r,{X:0,Y:0});
   shift = shift.Add(pivot);
   var tracker = new Engine.Primitive.Rectangle({
		  Dimensions: new Engine.Dimensions(1,1),
		  Rotation: 0,
		  Position: shift,
		  BackColor: new Engine.Color(255,0,0,1)   
   });
   


   s.AddSprite(tracker);
   
}	
var stats = MakeStatistics();

for(var i = 0; i < stats.Keys.length; i++) {

      var key = stats.Keys[i];
	  var stat = stats.Stats[key];
	  var opts = {};
	  opts.Height = stat;
	  
	  MakeBar(i,opts);
}

   Engine.PushState(State);
   
   });
});