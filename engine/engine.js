var Engine = {};

Engine._PAUSED = false;

Engine.Primitive = {};

Engine.Primitive.Factory = function(opts){

	opts = opts || {};
	var primitive = {};
	primitive.GUID = Engine.Utilities.GenerateGUID();
	primitive.Dimensions = opts.Dimensions || new Engine.Dimensions();
	primitive.Position = opts.Position || new Engine.Vector2();
	primitive.Scale = opts.Scale || new Engine.Vector2(1,1);
	primitive.BackColor = opts.BackColor || new Engine.Color(255,255,255,1);
	primitive.BorderColor = opts.BorderColor || new Engine.Color();
	primitive.BorderWidth = 0;
	primitive.IsCollidable = true;
	primitive.ZIndex = 1;
	primitive.Rotation = 0;
	primitive.Velocity = new Engine.Vector2();
	primitive.MouseDown = false;
	primitive.MouseOver = false;
    primitive.TrackingData = new Engine.PropertyTracker();
	primitive.MouseOverMode = Engine.Enums.MouseOverMode.CONTINUOUS;
	primitive._REDRAW = true;
	primitive._INITIALDRAW = false;
	primitive._CLEAR = false;	
	primitive._COLLISIONCHECKHASH = [];
	primitive._CELLHASH = [];
	primitive._BOTTOMLEVELCELLHASH = [];
	primitive.Enums = {};
	primitive.RotationStyle = "center";
	primitive.Enums.RedrawTrackers = {
		Dimensions: 1,
		Position: 2,
		Scale: 3,
		BackColor: 4,
		BorderColor: 5,
		BorderWidth: 6,
		ZIndex: 7,
		Rotation : 8
	}
	primitive.Enums.Corners = {
	   "TOPLEFT": 0,
	   "TOPRIGHT": 1,
	   "BOTTOMRIGHT": 2,
	   "BOTOTMLEFT": 3
	}	
	primitive.Enums.Resize = {
	   "LEFT" : -1,
	   "CENTER" : 0,
	   "RIGHT" : 1
	}
	
	primitive._SETQUADRANTS = function() {
	
	   for(var x in primitive._BOTTOMLEVELCELLHASH) {
		  var cell = primitive._BOTTOMLEVELCELLHASH[x];
		  if(!cell._SHOULDCONTAINSPRITE(primitive)) {
			 cell.RemoveSprite(primitive);
		  }
	   }
	   
	   for(var x in Engine._TOPLEVELCELLS) {
	      var cell = Engine._TOPLEVELCELLS[x];
		  if(cell._SHOULDCONTAINSPRITE(primitive)) {
		     cell.AddSprite(primitive);
		  }
	   }
	}
	
	primitive.GetCenter = function() {
      return primitive._BOUNDINGBOX.Center;  
   }
   primitive.OnCollision = function() {
   
   }
   
   primitive.Resize = function(pivot, delta) {
       var Strength = {};
	   var Center = primitive._BOUNDINGBOX.Center;
	   if(pivot.X > Center.X) {
	      Strength.Horiz = primitive.Enums.Resize.RIGHT;
	   }
	   else if(pivot.X < Center.X) {
	      Strength.Horiz = primitive.Enums.Resize.LEFT;	      
	   }
	   else if(pivot.X == Center.X) {
	      Strength.Horiz = primitive.Enums.Resize.CENTER;	      
	   }
	   
	   if(pivot.Y > Center.Y) {
	      Strength.Vert = primitive.Enums.Resize.RIGHT;
	   }
	   else if(pivot.Y < Center.Y) {
	      Strength.Vert = primitive.Enums.Resize.LEFT;	      
	   }
	   else if(pivot.Y == Center.Y) {
	      Strength.Vert = primitive.Enums.Resize.CENTER;	      
	   }

      if(Strength.Horiz == 	primitive.Enums.Resize.LEFT) {
         primitive.Move( new Engine.Vector2(delta.X,0) );
         primitive.SetDimensions( new Engine.Dimensions(primitive.Dimensions.Width - delta.X,primitive.Dimensions.Height) );
      }	  
      else if(Strength.Horiz == primitive.Enums.Resize.RIGHT) {
         primitive.SetDimensions( new Engine.Dimensions(primitive.Dimensions.Width + delta.X,primitive.Dimensions.Height) );
      }	  
	  
      if(Strength.Vert == primitive.Enums.Resize.LEFT) {
         primitive.Move( new Engine.Vector2(0,delta.Y) );
         primitive.SetDimensions( new Engine.Dimensions(primitive.Dimensions.Width,primitive.Dimensions.Height - delta.Y) );
      }	  
      else if(Strength.Vert == primitive.Enums.Resize.RIGHT) {
         primitive.SetDimensions( new Engine.Dimensions(primitive.Dimensions.Width,primitive.Dimensions.Height + delta.Y) );
      }	  	  
	  
   }
   
    //TODO: Include rotation
	primitive.GetBoundingBox = function() {
      return primitive._BOUNDINGBOX.Bounds;  
   }
 
   primitive.GetScaledDimensions = function() {
	  return primitive._BOUNDINGBOX.Dimensions;
   }
   
	primitive.Contains = function(pt) {
      var bounds = primitive._BOUNDINGBOX.Bounds;
	  if(bounds.Left <= pt.X && bounds.Right >= pt.X) {
	     if(bounds.Top <= pt.Y && bounds.Bottom >= pt.Y) {
		    return true;
		 }
	  }
	  return false;
   }
   primitive.GetBoundingBoxCorners = function() {
        return primitive._BOUNDINGBOX.Corners;
   }

   primitive.IsColliding = function(s) {
   
         
     var thisBounds = primitive._BOUNDINGBOX.Bounds;
	 var sBounds = s._BOUNDINGBOX.Bounds;
	 
	  return (thisBounds.Left <= sBounds.Right &&
			  sBounds.Left <= thisBounds.Right &&
			  thisBounds.Top <= sBounds.Bottom &&
			  sBounds.Top <= thisBounds.Bottom)
	 
   }
   
   primitive.CellCollisionTest = function(cb,opts) {
      var searchChildren = true;
	  var collisions = [];
	  var foundCollision = false;
      for(var x in primitive._BOTTOMLEVELCELLHASH) {
	     var cell = primitive._BOTTOMLEVELCELLHASH[x];

		    if(cell._SPRITECOUNT > 1) {
			    var collisionsNew = cell.CheckForCollisions(primitive, searchChildren);
				for(var c in collisionsNew) {
				   foundCollision = true;
				   if(!collisions[c]) {
				      collisions[c] = collisionsNew[c];
				   }
				}
			}
		 
	  }
	  if(foundCollision && cb) {
	     cb(collisions,opts);
	  }
	  return collisions;
   }
   
   
   
   primitive.Clear = function(c) {
		var oldPosition = primitive.TrackingData.Trackers.Position;

		c.save();
		c.beginPath();

		if(primitive.TrackingData.Trackers.Rotation != 0) {
			var center = {
						X: primitive.TrackingData.Trackers.Position.X + (primitive.TrackingData.Trackers.Scale.X*primitive.TrackingData.Trackers.Dimensions.Width/2), 
						Y: primitive.TrackingData.Trackers.Position.Y + (primitive.TrackingData.Trackers.Scale.Y*primitive.TrackingData.Trackers.Dimensions.Height/2)
			}
			c.translate(center.X,center.Y);
			c.rotate(primitive.TrackingData.Trackers.Rotation);
			c.translate(-center.X, -center.Y);
		}



		c.clearRect(oldPosition.X - primitive.TrackingData.Trackers.BorderWidth, oldPosition.Y - primitive.TrackingData.Trackers.BorderWidth , (primitive.TrackingData.Trackers.Dimensions.Width + primitive.TrackingData.Trackers.BorderWidth)*primitive.TrackingData.Trackers.Scale.X , (primitive.TrackingData.Trackers.Dimensions.Height + primitive.TrackingData.Trackers.BorderWidth)*primitive.TrackingData.Trackers.Scale.Y );

		c.closePath();
		c.restore();  
        		
   }
   
	primitive.Draw = function(c) {
 

			if(primitive._CLEAR) {
               primitive.Clear(c);
			   primitive.TrackingData.ClearTrackers();
			   primitive._CLEAR = false;
			}
			if(primitive._REDRAW == false){return;}
			//primitive._REDRAW = false;
			primitive._INITIALDRAW = true;

            c.save();
            c.beginPath();
            c.fillStyle = primitive.BackColor.HexString;
            c.strokeStyle = primitive.BorderColor.HexString;
			
			if(primitive.BackColor.A != 1) {
				c.globalAlpha = primitive.BackColor.A;
			}

			if(primitive.Rotation != 0) {
			   if(primitive.RotationStyle == "center") {
					var center = primitive._BOUNDINGBOX.Center;
					c.translate(center.X,center.Y);
					c.rotate(primitive.Rotation);
					c.translate(-center.X, -center.Y);
				}
				else if(primitive.RotationStyle == "topLeft") {
					c.translate(primitive.Position.X,primitive.Position.Y);
					c.rotate(primitive.Rotation);
					c.translate(-primitive.Position.X,-primitive.Position.Y);				
				}
			}
			
			c.rect(primitive.Position.X, primitive.Position.Y, primitive.Dimensions.Width*primitive.Scale.X, primitive.Dimensions.Height*primitive.Scale.Y);
					
			c.fill();
			
			if(primitive.BorderWidth > 0) {
				c.lineWidth = primitive.BorderWidth;
				c.stroke();
			}
            c.closePath();
            c.restore();  
   }
   
   primitive.Move = function(v) {
      primitive.SetTrackers();
      primitive.BoundingBoxRedraw(state);
      var oldPosition = {X:primitive.Position.X,Y:primitive.Position.Y};
      primitive.Position.X += v.X;
	  primitive.Position.Y += v.Y;
	  primitive.Refresh();
	  
	  var state = Engine.GetCurrentState();
	  state.UpdatePositionHash(primitive,oldPosition)
	  
	  
   }

   primitive.SetCollidable = function(r) {
      primitive.IsCollidable = r;
   }
   
   primitive.SetVelocity = function(v) {
      primitive.Velocity = v;
	  var state = Engine.GetCurrentState();
	  state.UpdateMovingSprites(primitive);
   }
   primitive.SetPosition = function(p) {
      primitive.Position = p;
	  var state = Engine.GetCurrentState();
	  state.UpdateMovingSprites(primitive);	  
   }
   
   primitive.SetDimensions = function(d) {

      primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.Dimensions.Width = d.Width;
	  primitive.Dimensions.Height = d.Height;
	  primitive.Refresh();
	  
   }   
   primitive.SetScale = function(s) {
      primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.Scale.X = s.X;
	  primitive.Scale.Y = s.Y;
	  primitive.Refresh();
   }
   primitive.SetBackColor = function(c) {
   primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.BackColor = c;
   }
   primitive.SetBorderColor = function(c) {
   primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.BorderColor = c;
   }
   primitive.SetBorderWidth = function(w) {
   primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.BorderWidth = w;
   }
   primitive.SetRotation = function(r) {
   primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.Rotation = r;
	  primitive.Refresh();
   }
   primitive.SetZIndex = function(z) {
   primitive.SetTrackers();
   	  primitive.BoundingBoxRedraw();
      primitive.ZIndex = z;
   }
   
   primitive.SetTrackers = function() {
   
      primitive.TrackingData.AddTracker("Dimensions",new Engine.Dimensions(primitive.Dimensions.Width,primitive.Dimensions.Height));
      primitive.TrackingData.AddTracker("Position",new Engine.Vector2(primitive.Position.X,primitive.Position.Y));
      primitive.TrackingData.AddTracker("Scale",new Engine.Vector2(primitive.Scale.X,primitive.Scale.Y));
      primitive.TrackingData.AddTracker("BackColor",new Engine.Color(primitive.BackColor.R,primitive.BackColor.G,primitive.BackColor.B,primitive.BackColor.A));
      primitive.TrackingData.AddTracker("BorderColor",new Engine.Color(primitive.BorderColor.R,primitive.BorderColor.G,primitive.BorderColor.B,primitive.BorderColor.A));
      primitive.TrackingData.AddTracker("BorderWidth",primitive.BorderWidth);
      primitive.TrackingData.AddTracker("Rotation",primitive.Rotation);
      primitive.TrackingData.AddTracker("ZIndex",primitive.ZIndex);
	  
   }
   
   primitive.BoundingBoxRedraw = function() {
        return;
		primitive._SET_TO_DRAW();
		primitive._REDRAW_NEIGHBORS();
   }
   primitive._REDRAW_NEIGHBORS = function(state) {
     
	  

		  state = state || Engine.GetCurrentState();
		  for(var x in primitive._BOTTOMLEVELCELLHASH) {
		     var cell = primitive._BOTTOMLEVELCELLHASH[x];
			 for(var y in cell.SpriteHash) {
			 var sprite = cell.SpriteHash[y];
			 if(!sprite._REDRAW) {
				 sprite._REDRAW = true;
				 sprite.SetTrackers();
			 }
			 }
		  }

	  }
   
   
 	primitive._SET_TO_DRAW = function() {
	   primitive._REDRAW = true;
	  // primitive._CLEAR = true;
	}  
	
   primitive._SETBOUNDINGBOX = function() {
      var boundingbox = {};
	  
	  var width = primitive.Scale.X*primitive.Dimensions.Width;
	  var height = primitive.Scale.Y*primitive.Dimensions.Height;
	  boundingbox.Dimensions = new Engine.Dimensions(width,height);
	  
      var left = primitive.Position.X;
	  var right = primitive.Position.X + (width);
      var top = primitive.Position.Y;
	  var bottom = primitive.Position.Y + (height);
	  boundingbox.Bounds = new Engine.Bounds(left,right,top,bottom);
	  
	  var topleft = new Engine.Vector2(left,top);
	  var topright = new Engine.Vector2(right,top);
	  var bottomleft = new Engine.Vector2(left,bottom);
	  var bottomright = new Engine.Vector2(right,bottom);	
	  
      boundingbox.Corners = [topleft,topright,bottomright,bottomleft];
	  
	  var center = new Engine.Vector2(left + (width/2), top + (height/2) );
	  
	  boundingbox.Center = center;
	  
      primitive._BOUNDINGBOX = boundingbox;	  
   }
   primitive._SETRADIUS = function() {
      var bottomright = primitive._BOUNDINGBOX.Corners[primitive.Enums.Corners.BOTTOMRIGHT];
	  var center = primitive._BOUNDINGBOX.Center;
	  var xDiff = bottomright.X - center.X;
	  var yDiff = bottomright.Y - center.Y;
	  primitive._BOUNDINGBOX.Radius =  Math.sqrt(xDiff*xDiff + yDiff*yDiff);
   }
   primitive.AddToCollisionHash = function(s) {
      primitive._COLLISIONCHECKHASH[s.GUID] = true;
	  s._COLLISIONCHECKHASH[primitive.GUID] = true;
   }
   primitive._CLEARCOLLISIONHASH = function() {
      primitive._COLLISIONCHECKHASH = [];
   }
   
   primitive.AlreadyCheckedCollision = function(s) {
      return primitive._COLLISIONCHECKHASH[s.GUID];
   }
   
   primitive.CheckForCollisions = function() {
      var state = Engine.GetCurrentState();
	  var collidedSprites = [];
	  
	 var checkSprites = state.RadialCheck(primitive.Position);
	 for(var i = 0; i < checkSprites.length;i++) {
		var checkSprite = checkSprites[i];
		if(checkSprite.IsCollidable == false){continue;}		
		if(primitive == checkSprite){continue;}
		if(primitive.IsColliding(checkSprite)) {
		   collidedSprites.push(checkSprite);
		}
	 }
	 
	 return collidedSprites;
   }
   primitive.PreCollisionTest = function(sprite) {
     // if(!sprite){return false;}
     // if(primitive.AlreadyCheckedCollision(sprite)){return false;}
	  //primitive.AddToCollisionHash(sprite);
	  //return true;
	        primitive._COLLISIONCHECKHASH[sprite.GUID] = true;
	         sprite._COLLISIONCHECKHASH[primitive.GUID] = true;
		return true;
	  
	  
      var thisCenter = primitive._BOUNDINGBOX.Center;
	  var sCenter = sprite.GetCenter()
	  var thisDimensions = primitive._BOUNDINGBOX.Dimensions;
	  var sDimensions = sprite._BOUNDINGBOX.Dimensions;
	  
	  var xDiff = (thisCenter.X-sCenter.X);
	  var yDiff = (thisCenter.Y - sCenter.Y);
	  
	  var thisRadius = primitive._BOUNDINGBOX.Radius;
	  var sRadius = sprite._BOUNDINGBOX.Radius
	  var radius = thisRadius + sRadius;
	  
	  if(xDiff*xDiff + yDiff*yDiff <= (radius*radius)) {
	     return true;
	  }
	  return false;
   }
   
   primitive.Update = function() {
      if(primitive.Velocity.X != 0 || primitive.Velocity.Y != 0) {
	     primitive.Move(primitive.Velocity);
	  }
   }
   primitive.Remove = function() {
   
       primitive.SetTrackers();
	   primitive.BoundingBoxRedraw();
	   primitive.Clear(Engine.Context);
	   for(var x in primitive._CELLHASH) {
	      var cell = primitive._CELLHASH[x];
		  cell.RemoveSprite(primitive);
	   }
   
      delete primitive;
	  for(var x in primitive) {

	     primitive[x] = function(){return false;}
	  }
	  primitive = null;
   } 
   primitive.ContainsPoint = function(pt) {
      if(pt.X >= primitive.Position.X && pt.X <= primitive.Position.X*primitive.Scale.X) {
	     if(pt.Y >= primitive.Position.Y && pt.Y <= primitive.Position.Y*primitive.Scale.Y) {
		    return true;
		 }
	  }
	  return false;
   }
   primitive.IsInViewPort = function() {
      
      var sBounds = primitive._BOUNDINGBOX.Bounds;
	  var canvasBounds = new Engine.Bounds(0,Engine.Canvas.width,0,Engine.Canvas.height);


	  
  return (canvasBounds.Left <= sBounds.Right &&
          sBounds.Left <= canvasBounds.Right &&
          canvasBounds.Top <= sBounds.Bottom &&
          sBounds.Top <= canvasBounds.Bottom)
   
   }
   
   primitive.Stop = function() {
      primitive.SetVelocity( new Engine.Vector2() );
   }
   
   primitive.OverrideUpdate = function(work) {
      var tmp = primitive.Update;
	  primitive.Update = function(c,canvas) {
	     work(primitive);
		 tmp(c,canvas);
	  }
   }
   
   
   primitive.Refresh = function() {
      primitive._SETBOUNDINGBOX();
	  primitive._SETRADIUS();
	  if(opts.SETQUADRANTS == null || opts.SETQUADRANTS == true) {
		primitive._SETQUADRANTS();
	  }
   }
   
   primitive.Refresh();
   
   return primitive;

}

Engine._TOPLEVELCELLS = {};

Engine.CreateTopLevelCells = function() {

   var Dimensions = new Engine.Dimensions(Engine.Canvas.width/2,Engine.Canvas.height/2);
   
   var cell1 = new Engine.Cell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(0,0),
	  SETQUADRANTS: false
   });
    var cell2 = new Engine.Cell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(Dimensions.Width,0),
	  SETQUADRANTS: false
   });  
    var cell3 = new Engine.Cell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(Dimensions.Width,Dimensions.Height),
	  SETQUADRANTS: false
   });  
     var cell4 = new Engine.Cell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(0,Dimensions.Height),
	  SETQUADRANTS: false
   });  
   
   Engine._TOPLEVELCELLS = {
      TOPLEFT: cell1,
	  TOPRIGHT: cell2,
	  BOTTOMRIGHT: cell3,
	  BOTTOMLEFT: cell4
   }
}

Engine.CreateCellBlock = function(cell,depth) {

   depth = depth || 0;
   var Dimensions = new Engine.Dimensions(cell.Dimensions.Width/2,cell.Dimensions.Height/2);
   var Offset = new Engine.Vector2(cell.Position.X,cell.Position.Y);
   

 
   cell.AddChildCell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(Offset.X,Offset.Y),
	  SETQUADRANTS: false
   });
   cell.AddChildCell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(Dimensions.Width + Offset.X,Offset.Y),
	  SETQUADRANTS: false
   });
   cell.AddChildCell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(Dimensions.Width + Offset.X,Dimensions.Height + Offset.Y),
	  SETQUADRANTS: false
   });
   cell.AddChildCell({
      Dimensions : new Engine.Dimensions(Dimensions.Width,Dimensions.Height),
	  Position: new Engine.Vector2(Offset.X,Dimensions.Height + Offset.Y),
	  SETQUADRANTS: false
   });
   
   if(depth > 0) {
      for(var x in cell.ChildCells) {
	     var childCell = cell.ChildCells[x];
		 childCell._REDRAW = true;
		 childCell.BorderColor = new Engine.Color(0,0,0,1);
		 childCell.BorderWidth = 1;
		 childCell.Draw(Engine.Context);
         Engine.CreateCellBlock(childCell,depth-1);
	  }
   }
   

}



Engine.Primitive.Rectangle = function(opts) {
   var rectangle = new Engine.Primitive.Factory(opts);
   rectangle._TYPE = Engine.Enums.PrimitiveType.RECTANGLE;
   return rectangle;
}
Engine.Primitive.Circle = function(opts) {
   var circle = new Engine.Primitive.Factory(opts);
   circle._TYPE = Engine.Enums.PrimitiveType.CIRCLE;
   
   circle.Contains = function(pt) {
      var center = circle._BOUNDINGBOX.Center;
	  var dimensions = circle._BOUNDINGBOX.Dimensions;
	  var xDiff = pt.X - center.X;
	  var yDiff = pt.Y - center.Y;
	  var testValue = ((xDiff*xDiff)/(dimensions.Width*dimensions.Width)) + ((yDiff*yDiff)/(dimensions.Height*dimensions.Height));
	  if(testValue <= 1) {
	     return true;
	  }
	  return false;
   }
   circle.Draw = function(c) {


		c.save();
		c.beginPath();
		c.fillStyle = circle.BackColor.HexString;
		c.lineWidth = circle.BorderWidth;
		c.strokeStyle = circle.BorderColor.HexString;
		c.globalAlpha = circle.BackColor.A;

		var center = circle._BOUNDINGBOX.Center;

		c.translate(center.X,center.Y);
		c.rotate(circle.Rotation);
		c.translate(-center.X, -center.Y);

		c.translate(center.X-circle.Dimensions.Width, center.Y-circle.Dimensions.Height);
		c.scale(circle.Dimensions.Width, circle.Dimensions.Height);
		c.arc(1, 1, 1, 0, 2 * Math.PI, false);
		
				
		c.fill();
		//c.stroke();
		c.closePath();
		c.restore();  
	  
   }
   
   
   
   return circle;
}

Engine.Projectile = {};
Engine.Projectile.Factory = function(opts) {
   var projectile = new Engine.Primitive.Factory(opts);
   projectile._TYPE = Engine.Enums.PrimitiveType.PROJECTILE;
   return projectile;
}
Engine.Projectile.Laser = function(opts) {
   var laser = new Engine.Projectile.Factory(opts);
   laser.SetVelocity(opts.Velocity || new Engine.Vector2());
   return laser;
}
Engine.Projectile.RandomBall = function(opts) {
   opts = opts || {};
   var randomball = new Engine.Projectile.Factory(opts);
   randomball.SetVelocity(opts.Velocity || new Engine.Vector2(Math.floor(2*Math.random()),Math.floor(2*Math.random())));
   randomball.Position = (opts.Position || new Engine.Vector2(400,300));
   randomball.SetDimensions(opts.Position || new Engine.Dimensions(Math.floor(30*Math.random()), Math.floor(30*Math.random())));
   randomball.BackColor = (opts.BackColor || new Engine.Color(255,0,255,1) );
   
   var xVelocity = -1;
   if(Math.random() < 0.5){
      xVelocity = 1;
   }
   var yVelocity = -1;
    if(Math.random() < 0.5){
      yVelocity = 1;
   }  
    randomball.SetVelocity(opts.Velocity || new Engine.Vector2(xVelocity,yVelocity) );
  
      
   
   
   
   return randomball;
}

Engine.PropertyTracker = function() {
   var tracker = {};
   tracker.Trackers = {};
   tracker.AddTracker = function(property,value){
       if(!tracker.Trackers[property]) {
			tracker.Trackers[property] = value;
	   }
   }
   tracker.ClearTrackers = function(property) {
      tracker.Trackers = {};
   }
   tracker.RemoveTracker = function(property) {
      delete tracker[property]
   }
   tracker.Contains = function(property) {
      return !!tracker.Trackers[property];
   }
   return tracker;   
}


Engine.Enums = {}
Engine.Enums.MouseOverMode = {
   "ONCE" : 1,
   "CONTINUOUS" : 2
}
Engine.Enums.PrimitiveType = {
   "RECTANGLE" : 1,
   "CIRCLE" : 2,
   "TRIANGLE" : 3,
   "CELL" : 4
}

Engine.Cells = {};
Engine.BottomLevelCells = {};

Engine.Cell = function(opts) {
   var cell = new Engine.Primitive.Rectangle(opts);
   cell.GUID = Engine.Utilities.GenerateGUID();
   cell._TYPE = Engine.Enums.PrimitiveType.CELL;
   cell._REDRAW = false;
   cell._CLEAR = false;
   cell._SPRITECOUNT = 0;
   cell.SpriteHash = [];
   cell.ParentCell = {};
   cell.ChildCells = {};
   cell.AddChildCell = function(opts) {
      opts.SETQUADRANTS = false;
      var childCell = new Engine.Cell(opts);
	  delete Engine.BottomLevelCells[cell.GUID];
	  for(var x in cell.SpriteHash) {
	     var sprite = cell.SpriteHash[x];
		 delete sprite._BOTTOMLEVELCELLHASH[cell.GUID];
		  if(cell._SHOULDCONTAINSPRITE(sprite)) {
			childCell.AddSprite(sprite);
		  }

	  }
	  childCell.ParentCell = cell;
	  cell.ChildCells[childCell.GUID] = childCell;
   }
   cell.RemoveChildCell = function(childCell) {
      
      delete cell.ChildCells[childCell.GUID];
   }
   cell.AddSprite = function(s) {
     if(cell.SpriteHash[s.GUID]){return;}
	 cell._SPRITECOUNT++;
	  cell.SpriteHash[s.GUID] = s;
	  s._CELLHASH[cell.GUID] = cell;
	  if(cell.IsBottomLevel()) {
	     s._BOTTOMLEVELCELLHASH[cell.GUID] = cell;
	  }
	  for(var guid in cell.ChildCells) {
	     var childCell = cell.ChildCells[guid];
		 if(childCell._SHOULDCONTAINSPRITE(s)) {
			childCell.AddSprite(s);
		 }
	  }
   }
    cell.RemoveSprite = function(s) {
	  if(!cell.SpriteHash[s.GUID]){return;}
	  cell._SPRITECOUNT--;
	  delete s._CELLHASH[cell.GUID];
	  delete cell.SpriteHash[s.GUID];
	  for(var guid in cell.ChildCells) {
	     var childCell = cell.ChildCells[guid];
		 childCell.RemoveSprite(s,childCell);
	  }
   }
   
   
   cell.ContainsSprite = function(s) {
      return cell.SpriteHash[s.GUID];
   }
   cell.IsTopLevel = function() {
      return !!cell.ParentCell.GUID;
   }
   cell.IsBottomLevel = function() {
	  for(var x in cell.ChildCells) {
	     return false;
	  }
	  return true;
   }   
   
   

   cell._SHOULDCONTAINSPRITE = function(s) {

	var thisCenter = cell._BOUNDINGBOX.Center;
	var sCenter = s.GetCenter()
	var thisDimensions = cell._BOUNDINGBOX.Dimensions;
	var sDimensions = s._BOUNDINGBOX.Dimensions;

	var xDiff = (thisCenter.X-sCenter.X);
	var yDiff = (thisCenter.Y - sCenter.Y);

	var thisRadius = cell._BOUNDINGBOX.Radius;
	var sRadius = s._BOUNDINGBOX.Radius
	var radius = thisRadius + sRadius;

	if(xDiff*xDiff + yDiff*yDiff <= (radius*radius)) {
		return true;
	}
		return false;
	}   
	
	cell.CheckForCollisions = function(s,searchChildren) {
	   var collisions = [];
	   if(cell._SPRITECOUNT < 2) {
	      return collisions;
	   }
		if(searchChildren) {
			if(!cell.IsBottomLevel()) {
				for(var x in cell.ChildCells) {
					var childCell = cell.ChildCells[x];
					if(childCell.SpriteHash[s.GUID]) {
						collisions.concat( childCell.CheckForCollisions(s,searchChildren) );
					}
				}
			} else {
			for(var guid in cell.SpriteHash) {
				if(s._COLLISIONCHECKHASH[guid]){continue;}
				var checkSprite = cell.SpriteHash[guid];
				if(checkSprite == s){continue;}
				if(!checkSprite.IsCollidable){continue;}
				if(s.IsColliding(checkSprite)) {
					collisions.push(checkSprite);
				}
			}			 
			}
		} else {
		
			for(var guid in cell.SpriteHash) {
				var checkSprite = cell.SpriteHash[guid];
				if(checkSprite == s){continue;}
				if(!checkSprite.IsCollidable){continue;}
				if(s.IsColliding(checkSprite)) {
					collisions.push(checkSprite);
				}
			}

		}
		  
	   return collisions;
		  
	   }

	Engine.Cells[cell.GUID] = cell;
    Engine.BottomLevelCells[cell.GUID] = cell;
	
	
   return cell;	
   
   
}


Engine.Color = function(r,g,b,a) {
   r = r || 0;
   g = g || 0;
   b = b || 0;
   a = a || 1;
   var color = {R:r,G:g,B:b,A:a};
   var hexString = Engine.Utilities.ConvertColorToHexString(color);
   color.HexString = hexString;
   color.Change = function(r,g,b,a) {
      color.R = r;
	  color.G = g;
	  color.B = b;
	  color.A = a || color.A;
   }

   return color;
}



Engine.Vector2 = function(x,y){
   var vec2 = {X:x || 0, Y: y || 0};
   vec2._CALCULATETHETA = function() {
      var xAbs = Math.abs(vec2.X);
	  var yAbs = Math.abs(vec2.Y);
	  
	  var theta = Math.atan(yAbs/xAbs);
	  if(vec2.X >= 0 && vec2.Y >= 0) {
	     vec2.Theta = theta;
		 return vec2.Theta;
	  }
	  else if(vec2.X <= 0 && vec2.Y >= 0) {
	     vec2.Theta = Math.PI - theta;
		 return vec2.Theta;	     
	  }
	  else if(vec2.X <= 0 && vec2.Y <= 0) {
	     vec2.Theta = theta + Math.PI;
		 return vec2.Theta;	     
	  }	  
	  else if(vec2.X >= 0 && vec2.Y <= 0) {
	     vec2.Theta = 2*Math.PI - theta;
		 return vec2.Theta;	     
	  }	  
	  
   }
   vec2._CALCULATETHETA();
   
   vec2.Add = function(v) {
      var tmpVec = new Engine.Vector2(vec2.X + v.X,vec2.Y + v.Y);
	  return tmpVec;
   }
   vec2.Subtract = function(v) {
      var tmpVec = new Engine.Vector2(vec2.X - v.X,vec2.Y - v.Y);
	  return tmpVec;
   }
   vec2.Round = function() {
      return new Engine.Vector2(Math.floor(vec2.X),Math.floor(vec2.Y));
   }
   vec2.Negate = function() {
      vec2.X = -vec2.X;
      vec2.Y = -vec2.Y;
	  vec2._CALCULATETHETA();
      return vec2;	  
   }
   vec2.Rotate = function(theta) {
      vec2 = Engine.Utilities.RotatePoint(vec2,theta,{X:0,Y:0}); 
	  return vec2;
   }
   
   vec2.GetDistantVector = function(radius,theta) {
      var tmpVec = new Engine.Vector2(radius,0);
	  tmpVec = Engine.Utilities.RotatePoint(tmpVec,theta,{X:0,Y:0});
	  return vec2.Add(tmpVec);
   }
   
   vec2.AngleToVector = function(v) {
      var tmpVec = v.Subtract(vec2);
	  return tmpVec.Theta;
   }
   //use ref for now...something is buggy with scope
   vec2.SetTheta = function(theta) {
         
		 var deltaTheta = theta - vec2.Theta;
		 vec2 = vec2.Rotate(deltaTheta);
		 return vec2;
   }
   return vec2;
}
Engine.Vector3 = function(x,y,z){
   var vec3 = {X:x || 0, Y: y || 0,Z:z || 0};
   return vec3;
}

Engine.Dimensions = function(w,h) {
   var dimensions = {Width:w || 0,Height:h || 0};
   return dimensions;
}
Engine.Bounds = function(left,right,top,bottom) {
    var bounds = {};
	bounds.Left = left;
	bounds.Right = right;
	bounds.Top = top;
	bounds.Bottom = bottom;
	return bounds;
}


Engine.States = [];

Engine.State = function() {
   var state = {};
   state.RemoveOutOfViewPortSprites = true;
   state.Sprites = [];
   state._SPRITE_DIMENSIONS_MAP = [];
   state.PositionHash = [];
   state.MovingSprites = [];
   state.ClearScreen = function(c,canvas) {
      Engine.ClearCanvas(c,canvas);
   }
   state.Draw = function(c,canvas) {
      Engine.ClearCanvas(c,canvas);
	 // Engine.ClearCanvas(Engine.OffScreenContext,Engine.OffScreenCanvas);

	  
      for(var x = 0; x < state.Sprites.length;x++) {
	     var sprite = state.Sprites[x];
			 sprite.Update();
			 sprite.Draw(c);
			 if(state.RemoveOutOfViewPortSprites && !sprite.IsInViewPort()) {
			    sprite.Stop();
				state.RemoveSprite(sprite);
			 }
		 
	  }
	  //c.drawImage(Engine.OffScreenCanvas,0,0);
	  
   }
   state.Update = function(c,canvas){  
      state.CheckForCollisions();
      state.Draw(c,canvas);
   }
   state.OverrideUpdate = function(work) {
      var tmp = state.Update;
	  state.Update = function(c,canvas) {
	     work();
		 tmp(c,canvas);
	  }
   }
   state.CheckForCollisions = function() {
      for(var guid in state.MovingSprites) {
	     var sprite = state.MovingSprites[guid];
		 if(!sprite.IsCollidable){continue;}
		 
	     var checkSprites = /*state.ExecuteEfficientCollisionMethod(sprite.Position)*/ state.Sprites;
		 for(var i = 0; i < checkSprites.length;i++) {
		    var checkSprite = checkSprites[i];
			if(checkSprite.IsCollidable == false){continue;}
			if(sprite == checkSprite){continue;}
		    if(sprite.IsColliding(checkSprite)) {
			   checkSprite.SetBackColor( new Engine.Color(0,0,255,1) );
			   sprite.SetBackColor( new Engine.Color(255,128,0,1) );
			}
		 }
		 sprite._CLEARCOLLISIONHASH();
	  }
     
   }
   
   
   state.CheckForCollisions = function(cb) {
       for(var guid in state.MovingSprites) {
	     var sprite = state.MovingSprites[guid];
		 if(!sprite.IsCollidable){continue;}   

		  var collisions = sprite.CellCollisionTest(cb);
		  for(var x in collisions){
		  collisions[x].OnCollision();
		  }
		  
		 
        }	
       for(var guid in state.MovingSprites) {
         state.MovingSprites[guid]._CLEARCOLLISIONHASH();
       }	   
   }
   
   state.Push = function() {
      Engine.States.push(state);
   }
   state.AddSprite = function(s) {
      state.Sprites.push(s);
	  state.UpdatePositionHash(s);
	  
	  state._SPRITE_DIMENSIONS_MAP.push( Engine.Utilities.GetMaxRectangleDiagonal(Engine.Utilities.GetRectangleBounds(s.Position,s.Dimensions)) );
	  state._SPRITE_DIMENSIONS_MAP.sort(function(a,b){
	     return a-b;
	  });
   }
   state.UpdatePositionHash = function(s,oldPosition) {
 	  var position = s.Position;
	  var x = Math.floor(s.Position.X);
	  var y = Math.floor(s.Position.Y);

	  if(!state.PositionHash[x]) {
	     state.PositionHash[x] = [];
	  }
	  if(!state.PositionHash[x][y]) {
	     state.PositionHash[x][y] = [s];
	  } else {
	     state.PositionHash[x][y].push(s);
	  }  
	  
	  if(oldPosition && state.PositionHash[oldx] && state.PositionHash[oldx][oldy]) {
	  var oldx = Math.floor(oldPosition.X);
	  var oldy = Math.floor(oldPosition.Y);
	  
	    var oldHash = state.PositionHash[oldx][oldy];
		var newHash = [];
		for(var x = 0; x < oldHash.length;x++) {
		   var obj = oldHash[x];
		   if(obj != s) {
		      newHash.push(obj);
		   }
		}
		if(newHash.length == 0) {
		   delete state.PositionHash[oldx][oldy];
		   if(Engine.Utilities.IsHashMapEmpty(state.PositionHash[oldx])) {
		      delete state.PositionHash[oldx];
		   }
		} else {
		   state.PositionHash[oldx][oldy] = newHash;		
		}
	  }
   }
   
   state.UpdateMovingSprites = function(s) {
 	  if(s.Velocity.X == 0 && s.Velocity.Y == 0) {
	     delete state.MovingSprites[s.GUID];
	  } else {
	     state.MovingSprites[s.GUID] = s;
	  }
   }
   
   state.RemoveSprite = function(s) {
      var index = state.Sprites.indexOf(s);
	  if(index > -1) {
	  var PositionHashArray = state.PositionHash[Math.floor(s.Position.X)][Math.floor(s.Position.Y)];
	  var PositionHashIndex = PositionHashArray.indexOf(s);
	  state.PositionHash[Math.floor(s.Position.X)][Math.floor(s.Position.Y)].splice(PositionHashIndex,1);
	  
	     var DimensionMapIndex = state._SPRITE_DIMENSIONS_MAP.indexOf( Engine.Utilities.GetMaxRectangleDiagonal(Engine.Utilities.GetRectangleBounds(s.Position,s.Dimensions)) );
		 state._SPRITE_DIMENSIONS_MAP.splice(DimensionMapIndex,1); 
	     state.Sprites.splice(index,1);
		 
		 delete state.MovingSprites[s.GUID];
		 s.Remove();
	  }
   }
   state.RadialCheck = function(offset,radius) {
	  radius = radius || state._SPRITE_DIMENSIONS_MAP[ state._SPRITE_DIMENSIONS_MAP.length - 1 ];
	  var matches = [];
	  var range = new Engine.Bounds(offset.X-radius,offset.X+radius,offset.Y-radius,offset.Y+radius);
	  
	  for(var x = Math.floor(range.Left); x < range.Right;x++) {
	    for(var y = Math.floor(range.Top); y < range.Bottom;y++) {
		
				if(state.PositionHash[x] && state.PositionHash[x][y]) {
				   for(var z = 0; z < state.PositionHash[x][y].length; z++) {
					  var sprite =  state.PositionHash[x][y][z];
					  matches.push(sprite);
				   }
				}		   

        }
      }	
    return matches;	  
   }

   
   
   state.Enums = {};
   state.Enums.CollisionMethods = {
      "RADIAL" : 1,
	  "FORLOOP" : 2
   }
   state.DetermineEfficientCollisionMethod = function(radialCheckLoop) {
      var method = state.Enums.CollisionMethods.RADIAL;
      var spriteCount = state.Sprites.length;
	  if(spriteCount*spriteCount < radialCheckLoop) {
	     method = state.Enums.CollisionMethods.FORLOOP;
	  }
	  method = state.Enums.CollisionMethods.FORLOOP;
	  return method;
   }
   state.ExecuteEfficientCollisionMethod = function(offset,radius) {
      
 	  radius = radius || state._SPRITE_DIMENSIONS_MAP[ state._SPRITE_DIMENSIONS_MAP.length - 1 ];
	  var matches = [];
	  var range = new Engine.Bounds(offset.X-radius,offset.X+radius,offset.Y-radius,offset.Y+radius);
	  var radialCheckLoop = (range.Right-range.Left)*(range.Bottom-range.Top);
      var method = state.DetermineEfficientCollisionMethod(radialCheckLoop);
	  if(method == state.Enums.CollisionMethods.RADIAL) {
	     return state.RadialCheck(offset,radius);
	  }
	  else if(method == state.Enums.CollisionMethods.FORLOOP) {
	     return state.StandardForLoopCollisionCheck(offset);
	  }
	  
   }
   state.StandardForLoopCollisionCheck = function(offset) {
      var matches = [];
      for(var i = 0; i < state.Sprites.length; i++) {
	     var sprite = state.Sprites[i];
		 if(sprite.ContainsPoint(offset)) {
		    matches.push(sprite);
		 }
	  }
	  return matches;
	 // return state.Sprites;
   }
   
   
   
	state.MouseMoveEvents = function(e) {}
	state.MouseDownEvents = function(e) {}
	state.MouseUpEvents = function(e) {}
	state.KeyDownEvents = function(e) {}
	state.KeyUpEvents = function(e) {}
   return state;
}

Engine.ClearCanvas = function(c,canvas){
   c.clearRect(0, 0, canvas.width, canvas.height); 
}

Engine.PushState = function(state) {
   Engine.States.push(state);
}
Engine.PopState = function() {
   if(states.length > 1) {
	   var states = [];
	   for(var i = 0; i < Engine.States-1;i++) {
		  states.push(Engines.States[i]);
	   }
	   Engine.States = states;
   }
}
Engine.GetCurrentState = function() {
   var length = Engine.States.length;
   if(length > 0) {
      return Engine.States[length-1];
   }
}

Engine.EventTick = function(c,canvas){
   if(Engine._PAUSED){
      return;
   }
   var state = Engine.GetCurrentState();
   if(state){
		state.Update(c,canvas);
   }
}



Engine.CanvasFactory = function(width,height) {

   var guid = Engine.Utilities.GenerateGUID();
   var canvasJQuery = $("<canvas class='engine-canvas'></canvas>");

   
   canvasJQuery.attr('width',width);
   canvasJQuery.attr('height',height);
   canvasJQuery.attr('guid',guid);
   
   var canvas = canvasJQuery[0];
   var ctx = canvas.getContext('2d');
   
	  var OffScreenCanvas = document.createElement("canvas");
	  OffScreenCanvas.width = canvas.width;
	  OffScreenCanvas.height = canvas.height;
	  var OffScreenCanvasCtx = OffScreenCanvas.getContext('2d');
	  

   
   return {Canvas: canvas, Context: ctx, CanvasJQuery: canvasJQuery, OffScreenCanvas: OffScreenCanvas, OffScreenContext: OffScreenCanvasCtx};
   
}


   //State.AddSprite(block);
 
/* 
   var jumpers = [];
   var center = new Engine.Vector2(400,300);
   var radius = 100;
   var innerRadius = 0;
   var freq = 45;
   var midWay = freq/2;
   var speed = 10;
   
   function createJumper(i) {

      var rotation = (i*Math.PI/180);
	  var orientTest = (i % midWay);
	  var velocity;
	  if((i % freq) > midWay) {
	     orientTest = freq - (i % freq);
	  }
	  var startingPosition = new Engine.Vector2( ((orientTest/midWay))*(radius-innerRadius) + innerRadius, 0 );
	  startingPosition.X += center.X;
	  startingPosition.Y += center.Y;
	  
	  startingPosition = Engine.Utilities.RotatePoint(startingPosition,rotation,center).Round();

	  
	  if(orientTest > midWay) {
	     velocity = new Engine.Vector2(-speed,0);
	  } else {
	     velocity = new Engine.Vector2(speed,0);
	  }
	  var velocityThis = Engine.Utilities.RotatePoint(velocity,rotation,{X:0,Y:0});
	  
      var jumper = new Engine.Primitive.Circle({      
		  Dimensions: new Engine.Dimensions(3,3),
		  Velocity: velocityThis,
		  Rotation: rotation,
		  Position: startingPosition,
		  BackColor: Engine.Utilities.GenerateRandomColor()
	  });
	  	  jumper.Velocity = velocityThis;
		  jumper.Rotation = rotation;
		  

	  jumpers.push(jumper);
	  

	  jumper.OverrideUpdate(function jumperUpdate(){
	  
		 var distToCursor = Engine.Utilities.Distance(jumper.Position,Engine.MouseMoveCoordinates);	  
		 if(distToCursor <= 5) {
		    jumper.Stop();
		 }	  
		 else if(jumper.Velocity.X == 0 && jumper.Velocity.Y == 0) {
		    jumper.Velocity = new Engine.Vector2(speed,0);
		 }
		 else {
			 var followTheta = jumper.Position.AngleToVector(Engine.MouseMoveCoordinates);
			 var oldTheta = jumper.Velocity.Theta;
			 jumper.Velocity = jumper.Velocity.SetTheta(followTheta);
		 }
	  
		 var dist = Engine.Utilities.Distance(jumper.Position,center);
		 if(dist > radius ) {
			//jumper.SetVelocity(jumper.Velocity.Negate());
		 } else if(dist < innerRadius ) {
			// jumper.SetVelocity(jumper.Velocity.Negate()); 
		 }	 

		 
         for(var x in Engine.Keys) {
		    if(x == 37) {
			   jumper.Velocity.Rotate(-5*Math.PI/180);
			}
			else if(x == 39) {
			   jumper.Velocity = jumper.Velocity.Rotate(5*Math.PI/180);			   
			}
		 }
		 

		 
		 
	  });
	  
	  State.AddSprite(jumper);   
   }
   for(var i = 0; i < 360; i++) {
      createJumper(i);
   }
   
*/

Engine.AudioFactory = function(path) {
   var audio = {};
   var $elm = $("<audio></audio>");
   $elm.html("<source src='" + path + "'>");
   var elm = $elm[0];
  // $(document).append(elm);
   audio.$ = $elm;
   audio.elm = elm;
   audio.Play = function(){
      elm.play();
   }
   audio.Stop = function(){
      elm.pause();
   }
   audio.GetCurrentTime = function(){
      return elm.currentTime;
   }
   audio.SetCurrentTime = function(t){
      elm.currentTime = t;
   }
   audio.IsPlaying = function() {
      return (!elm.paused || elm.currentTime)
   }
   audio.ChangeSong = function(path){
      elm.src = path;
   }
   return audio;
}

Engine.Start = function(work) {

   work();
   Engine.InitListeners();
   Engine.CycleID = requestAnimationFrame(repeatOften);
   repeatOften();
   
   /*
   var LightsState = new Engine.State();
   Engine.PushState(LightsState);
   LightsState.FlickerDelta = 0.1;

   LightsState.Enums.FlickerEnum = {
      "STATIC": 1,
	  "BRIGHTER":2,
	  "DIMMER": 3
   }
	LightsState.Pulse = function(sprites) {

	 sprites = sprites || LightsState.Sprites;
	for(var x = 0; x < sprites.length;x++) {
	   
		  var bulb = sprites[x];
		  
		  if(bulb.FlickerStatus == LightsState.Enums.FlickerEnum.STATIC) {

				if(bulb.BackColor.A < 0.7) {
				   bulb.FlickerStatus = LightsState.Enums.FlickerEnum.BRIGHTER;
				}
				else if(bulb.BackColor.A >= 0.7) {
				   bulb.FlickerStatus = LightsState.Enums.FlickerEnum.DIMMER;
				}
			 
		  }
		  else if(bulb.FlickerStatus == LightsState.Enums.FlickerEnum.BRIGHTER) {
		     var colorNew = new Engine.Color(bulb.BackColor.R,bulb.BackColor.G,bulb.BackColor.B,bulb.BackColor.A);
			 colorNew.A += LightsState.FlickerDelta;
			 
		     var borderColorNew = new Engine.Color(bulb.BorderColor.R,bulb.BorderColor.G,bulb.BorderColor.B,bulb.BorderColor.A);
			 borderColorNew.A += LightsState.FlickerDelta;

			 if(colorNew.A >= 1) {
				colorNew.A = 1;
				borderColorNew.A = 1;
				bulb.FlickerStatus = LightsState.Enums.FlickerEnum.STATIC;
			 }
			 bulb.SetBackColor(colorNew);
			 bulb.SetBorderColor(borderColorNew);
		  }
		  else if(bulb.FlickerStatus == LightsState.Enums.FlickerEnum.DIMMER) {
		     var colorNew = new Engine.Color(bulb.BackColor.R,bulb.BackColor.G,bulb.BackColor.B,bulb.BackColor.A);
			 colorNew.A -= LightsState.FlickerDelta;
			 
		     var borderColorNew = new Engine.Color(bulb.BorderColor.R,bulb.BorderColor.G,bulb.BorderColor.B,bulb.BorderColor.A);
			 borderColorNew.A -= LightsState.FlickerDelta;
			 
			 if(bulb.BackColor.A <= 0) {
				colorNew.A = 0;
				borderColorNew.A = 0;
				bulb.FlickerStatus = LightsState.Enums.FlickerEnum.STATIC;
			 }
			 bulb.SetBackColor(colorNew);
			 bulb.SetBorderColor(borderColorNew);
		  }
		  
	   }
	} 

    	
   
   LightsState.MouseMoveEvents = function(e) {

      var offset = new Engine.Vector2(e.offsetX,e.offsetY);
	  var radius = 50;
	  var range = new Engine.Bounds(offset.X-radius,offset.X+radius,offset.Y-radius,offset.Y+radius);
	  
	  
	  for(var x = range.Left; x < range.Right;x++) {
	    for(var y = range.Top; y < range.Bottom;y++) {
		    if(Engine.Utilities.Distance(offset,new Engine.Vector2(x,y)) <= radius) {
				if(LightsState.PositionHash[x] && LightsState.PositionHash[x][y]) {
				   for(var z = 0; z < LightsState.PositionHash[x][y].length; z++) {
					  var sprite =  LightsState.PositionHash[x][y][z];
					  LightsState.Pulse([sprite]);
					  sprite.SetScale(new Engine.Vector2(4,4));

					  
				   }
				}
			}
		}
	  }
	  
	  
		 if(Engine.MouseDownSprite) {
		     var xDiff = Engine.MouseMoveCoordinates.X - Engine.MouseMoveCoordinatesPrevious.X;
			 var yDiff = Engine.MouseMoveCoordinates.Y - Engine.MouseMoveCoordinatesPrevious.Y;
			 
		     Engine.MouseDownSprite.Move(new Engine.Vector2(xDiff,yDiff));
			 var collidedSprites = Engine.MouseDownSprite.CheckForCollisions();
			 for(var i = 0; i < collidedSprites.length; i++) {
			    var sprite = collidedSprites[i];
				sprite.SetBackColor( new Engine.Color(255,0,0,1) );
			 }

		  }
		 
	  
   }
   

   
   LightsState.Update = function(c,canvas) {
      LightsState.KeyDownEvents();
      LightsState.CheckForCollisions(function(collisions){
		     for(var x in collisions) {
			    LightsState.RemoveSprite(collisions[x] );
			 }
			 
		  });
      LightsState.Draw(c,canvas);
   }
   
   LightsState.MouseDownEvents = function(e) {
      var offset = new Engine.Vector2(e.offsetX,e.offsetY);
      var MouseDownSprites = LightsState.RadialCheck(offset);
	  for(var x in MouseDownSprites) {
	     var sprite = MouseDownSprites[x];
		 if(sprite.Contains(offset) ) {
		     sprite.MouseDown = true;
			 Engine.MouseDownSprite = sprite;
		 }
	  }  
   }
   
   
   
   var Player = new Engine.Primitive.Rectangle({
      Dimensions: new Engine.Dimensions(50,50),
	  Position: new Engine.Vector2(350,400),
	  BackColor: new Engine.Color(255,255,0,1)
   });
   Player.SetCollidable(false);
   LightsState.AddSprite(Player);
   
   var TestBox = new Engine.Primitive.Rectangle({
      Dimensions: new Engine.Dimensions(50,50),
	  Position: new Engine.Vector2(150,400),
	  BackColor: new Engine.Color(0,255,255,1)
   });
   TestBox.SetCollidable(true);
   LightsState.AddSprite(TestBox);
   
   LightsState.KeyDownEvents = function(e) {
      for(var x in Engine.Keys) {
	     //left
	     if(x == 37) {
		    Player.Move(new Engine.Vector2(-5,0));
		 }
		 //right
		 else if(x == 39) {
		    Player.Move(new Engine.Vector2(5,0));
		 }
	     //up
	     else if(x == 38) {
		    Player.Move(new Engine.Vector2(0,-5));
		 }
	     //down
	     else if(x == 40) {
		    Player.Move(new Engine.Vector2(0,5));
		 }
	     //z
	     else if(x == 90) {
		    Player.SetRotation( Player.Rotation - 0.5 );
		 }
	     //x
	     else if(x == 88) {
		    Player.SetRotation( Player.Rotation + 0.5 );
		 }
		 //s
		 else if(x == 83) {
		 
		 
		 
		    var laserDimensions = new Engine.Dimensions(3,20);
			
		    var leftPosition = new Engine.Vector2(Player.Position.X-3,Player.Position.Y - 3 - laserDimensions.Height);
		    var rightPosition = new Engine.Vector2(Player.Position.X + Player.GetScaledDimensions().Width+3,Player.Position.Y - 3 - laserDimensions.Height);	
			var leftLaserVelocity = new Engine.Vector2(0,-6);
			var rightLaserVelocity = new Engine.Vector2(0,-6);
			
			if(Player.Rotation != 0) {
		       leftPosition = Engine.Utilities.RotatePoint(leftPosition,Player.Rotation,Player.GetCenter());
			   rightPosition = Engine.Utilities.RotatePoint(rightPosition,Player.Rotation,Player.GetCenter());
			}
			
			
		    var LeftLaser = new Engine.Projectile.Laser({
			  Dimensions: new Engine.Dimensions(laserDimensions.Width,laserDimensions.Height),
			  Position: leftPosition,
			  BackColor: new Engine.Color(255,0,0,1)			
			});
			
			var RightLaser = new Engine.Projectile.Laser({
			  Dimensions: new Engine.Dimensions(laserDimensions.Width,laserDimensions.Height),
			  Position: rightPosition,
			  BackColor: new Engine.Color(255,0,0,1)			
			});		
			if(Player.Rotation != 0) {
		       LeftLaser.SetRotation(Player.Rotation);
		       RightLaser.SetRotation(Player.Rotation);				
		       leftLaserVelocity = Engine.Utilities.RotatePoint(leftLaserVelocity,Player.Rotation,new Engine.Vector2());
			   rightLaserVelocity = Engine.Utilities.RotatePoint(rightLaserVelocity,Player.Rotation,new Engine.Vector2());			
			}

           LeftLaser.SetVelocity( leftLaserVelocity );		
           RightLaser.SetVelocity( rightLaserVelocity );
		   
           
           LightsState.AddSprite(LeftLaser);
           LightsState.AddSprite(RightLaser);	
         
		 
		 

	  
		 }
		 //d
		 else if(x == 68) {
		    Engine._PAUSED = !Engine._PAUSED;
		 }
		 //a
		 else if(x == 65) {
		 		 for(var i =0 ; i <= 10; i++) {
				   var randomBall = new Engine.Projectile.RandomBall();
				   LightsState.AddSprite(randomBall);
				 }
		 }
	  }
   }
   
   
   for(var x = 0; x <= 100; x++) {
	   for(var y = 0; y <= 100; y++) {
      var BulbDimensions = new Engine.Dimensions(2,2);
      var BulbPosition = new Engine.Vector2(Math.floor(Engine.Canvas.width*Math.random()), Math.floor(Engine.Canvas.height*Math.random()));
			   var CircleOpts = {
			      Dimensions: new Engine.Dimensions(BulbDimensions.Width,BulbDimensions.Height),
				  BackColor : new Engine.Color(0,0,255),
				  BorderColor: Engine.Utilities.GenerateRandomColor(),
				  Position: new Engine.Vector2(BulbPosition.X,BulbPosition.Y)
			   }
               var circle = new Engine.Primitive.Rectangle(CircleOpts);
			   if(Math.random() < 0.03)
			   circle.SetVelocity(new Engine.Vector2(1,1));

			   circle.FlickerStatus = LightsState.Enums.FlickerEnum.STATIC;
               LightsState.AddSprite(circle);			   
	   }     
   }
   */
   
   
  


   
}



function repeatOften() {
  Engine.EventTick(Engine.Context,Engine.Canvas);
  requestAnimationFrame(repeatOften);
}



Engine.Utilities = {};
Engine.Utilities.GenerateRandomColor = function() {
	var r = Math.floor( 256*Math.random() );
	var g = Math.floor( 256*Math.random() );
	var b = Math.floor( 256*Math.random() );
	var a = 1;
	return new Engine.Color(r,g,b,a);
}
Engine.Utilities.Distance = function(v1,v2) {
   var xDiff = v1.X - v2.X;
   var yDiff = v1.Y - v2.Y;
   return Math.sqrt(xDiff*xDiff + yDiff*yDiff);
}
Engine.Utilities.ConvertColorToHexString = function (c) {
   var r = c.R.toString(16);
   var g = c.G.toString(16);
   var b = c.B.toString(16);
   
   
   if(r.trim().length == 1) {
      r = "0" + r;
   }
   if(g.trim().length == 1) {
      g = "0" + g;
   }
   if(b.trim().length == 1) {
      b = "0" + b;
   }
   
   return "#" + r + g + b;
}
Engine.Utilities.RotatePoint = function(pt,rot,pivot) {
    var x = pt.X;
    var y = pt.Y;
    var xP = (x - pivot.X) * Math.cos(rot) - (y - pivot.Y) * Math.sin(rot) + pivot.X;
    var yP = (x - pivot.X) * Math.sin(rot) + (y - pivot.Y) * Math.cos(rot) + pivot.Y;
    return new Engine.Vector2(xP,yP);
}
Engine.Utilities.Round = function(value,places) {
    var multiplier = Math.pow(10, places);
    return (Math.round(value * multiplier) / multiplier);
}

Engine.Utilities.GenerateGUID = function(length) {
   var length = 128 || length;
   var alphabet = "abcdefghijklmnopqrstuvwxyz01234567689".split("");
   var guid = "";
   for(var i = 0; i < length; i++) {
      var index = Math.floor(alphabet.length*Math.random());
	  guid += alphabet[index];
   }
   return guid;
}
Engine.Utilities.GetMaxRectangleDiagonal = function(bounds) {
  var topleft = new Engine.Vector2();
  topleft.X = bounds.Left;
  topleft.Y = bounds.Top;
  
  var bottomright = new Engine.Vector2();
  bottomright.X = bounds.Right;
  bottomright.Y = bounds.Bottom;
  
  return Engine.Utilities.Distance(topleft,bottomright);
}
Engine.Utilities.GetRectangleBounds = function(topleft,dimensions) {
   var left = topleft.X;
   var right = topleft.X + dimensions.Width;
   var top = topleft.Y;
   var bottom = topleft.Y + dimensions.Height;
   var bounds = new Engine.Bounds(left,right,top,bottom);
   return bounds;
}
Engine.Utilities.IsHashMapEmpty = function(hash) {
   var empty = true;
   for(var x in hash) {
      empty = false;
	  break;
   }
   return empty;
}

Engine.MouseMoveEvents = function(e){
   var state = Engine.GetCurrentState();
   state.MouseMoveEvents(e);
}
Engine.MouseDownEvents = function(e){
   var state = Engine.GetCurrentState();
   state.MouseDownEvents(e);
}
Engine.MouseUpEvents = function(e){
   var state = Engine.GetCurrentState();
   state.MouseUpEvents(e);
   console.log(Engine.MouseDownSprite);
    delete Engine.MouseDownSprite;
  
}

Engine.Keys = {};
Engine.KeyDownEvents = function(e){
   Engine.Keys[e.which] = true;
  // var state = Engine.GetCurrentState();
   //state.KeyDownEvents(e);
}
Engine.KeyUpEvents = function(e){
   var state = Engine.GetCurrentState();
   state.KeyUpEvents(e);
   delete Engine.Keys[e.which];
}
Engine.MousePatch = function(e) {
  if(e.offsetX==undefined) // this works for Firefox
  {
    e.offsetX = (e.clientX - $(e.target).offset().left);
    e.offsetY = (e.clientY - $(e.target).offset().top);
  } 
}
Engine.InitListeners = function() {
   Engine.MouseMoveCoordinates = new Engine.Vector2(0,0);
   
   $(Engine.Canvas).mousemove(function(e){
	   Engine.MousePatch(e);    
      Engine.MouseMoveCoordinatesPrevious = Engine.MouseMoveCoordinates || new Engine.Vector2(e.offsetX,e.offsetY);
      Engine.MouseMoveCoordinates = new Engine.Vector2(e.offsetX,e.offsetY);
	  Engine.MouseMoveDelta = Engine.MouseMoveCoordinates.Subtract(Engine.MouseMoveCoordinatesPrevious);
    //  Engine.MouseMoveEvents(e);
   });   
   $(Engine.Canvas).mousedown(function(e){
   Engine.MousePatch(e); 
      Engine.MouseDownCoordinates = new Engine.Vector2(e.offsetX,e.offsetY);
      Engine.MouseDownEvents(e);
   }); 
   
   $(document).mouseup(function(e){
   Engine.MousePatch(e); 
      Engine.MouseUpEvents(e);
   });  
   
   $(document).keydown(function(e){
      Engine.KeyDownEvents(e);
   });  
    $(document).keyup(function(e){
      Engine.KeyUpEvents(e);
   });    
}


