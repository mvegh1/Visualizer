   var samplesPerSec = 50;
   var seconds = 300;
   var freqs = 200;
   var samples = samplesPerSec*seconds;
   
var Visualizers = {};
var VisualizerCache = {};
var State;
var numBars;

function LoadRawAudioData(path,cb) {
   if(RawAudioCache[path.trim().toUpperCase()]) {
      State.RawAudioData = RawAudioCache[path.trim().toUpperCase()];
		  samples = State.RawAudioData.length;
		  freqs = State.RawAudioData[0].length;
		  seconds = samples/samplesPerSec;
		  cb({AudioData:State.RawAudioData});
   } else {
	   $.ajax(path).success(function(a,b,c){
		  State.RawAudioData = JSON.parse(a);
		  samples = State.RawAudioData.length;
		  freqs = State.RawAudioData[0].length;
		  seconds = samples/samplesPerSec;
		  cb({AudioData:State.RawAudioData});
	   }).error(function(e){
			console.warn("error fetching raw audio data for",path);
		});
	}
}

RawAudioCache = {};

Visualizers["0"] = function(opts) {
        opts = opts || {};
		var testData = [];
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
		     var strength = j;
		     if(opts.AudioData) {
			    strength = opts.AudioData[i][j];
			 }
			 var theta = (strength/freqs)*360*Math.PI/180;
			 arr.push( strength*Math.sin( theta * i)  );
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["0"] = testData;
	   return testData;   
   }
Visualizers["MODULUS"] =  function(opts) {
        opts = opts || {};
		var testData = [];

	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
		  	 var strength = j;
		     if(opts.AudioData) {
			    strength = opts.AudioData[i][j];
			 }
			 arr.push( i % strength  );
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["MODULUS"] = testData;
	   return testData;   
   }
   
Visualizers["CARTWHEEL-1"] =  function(opts) {
		var testData = [];
        opts = opts || {};
	   var totalIter = 0;
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
		  		     var strength = j;
					 if(opts.AudioData) {
						strength = opts.AudioData[i][j];
					 }
			 totalIter++;
			 var theta = (totalIter*((i+strength)))/(samples*freqs)*360*Math.PI/180;
			 arr.push(50*Math.sin(theta));
			 
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["CARTWHEEL-1"] = testData;
	   return testData;   
   }
   
Visualizers["CARTWHEEL-2"] =  function(opts) {
		var testData = [];
         opts = opts || {};
	   var totalIter = 0;
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
			 totalIter++;
			 var strength = j;
			 if(opts.AudioData) {
				strength = opts.AudioData[i][j];
			 }
			 var theta = (i/strength)*(360)*Math.PI/180;
			 var val = strength*Math.sin(theta);
			 
			 arr.push(val);
			 
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["CARTWHEEL-2"] = testData;
	   return testData;   
   }
   
Visualizers["SUNFLOWER"] =  function(opts) {
		var testData = [];
		opts = opts || {};
		

	   var totalIter = 0;
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
			 totalIter++;
		     var strength = j;
		     if(opts.AudioData) {
			    strength = opts.AudioData[i][j];
			 }
			 var val = (i*strength) % 200;
			 
			 arr.push(val);
			 
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["SUNFLOWER"] = testData;
	   return testData;   
   }
   
Visualizers["PULSE-SPIDER"] =  function(opts) {
		var testData = [];
		var totalRevolutions = 3;
		var totalRevPts = samples/totalRevolutions;
		opts = opts || {};

	   var totalIter = 0;
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
			 totalIter++;
		     var strength = j;
		     if(opts.AudioData) {
			    strength = opts.AudioData[i][j];
			 }
			 var val = (i*Math.pow(strength,0.5)) % 200;
			 
			 arr.push(val);
			 
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["PULSE-SPIDER"] = testData;
	   return testData;   
   }
   
Visualizers["LIGHTNING"] =  function(opts) {
		var testData = [];
        opts = opts || {};

	   var totalIter = 0;

	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
			 totalIter++;
		     var strength = j;
		     if(opts.AudioData) {
			    strength = opts.AudioData[i][j];
			 }
		   var percent =  (i % 360)/samples;
		   var val = 25*Math.tan( (strength/(totalIter % 360))*360*Math.PI/180 );
			 
			 
			 arr.push(val);
			 
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["LIGHTNING"] = testData;
	   return testData;   
   }
   
   
Visualizers["RANDOM"] =  function(opts) {
		var testData = [];
        opts = opts || {};
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {

			 arr.push( 200*Math.random()  );
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["RANDOM"] = testData;
	   return testData;   
   }

   
Visualizers["ORDERED"] =  function() {
		var testData = [];
        var opts = {};
	   var dummy = [];
	   for(var j = 0; j < freqs; j++) {
	      dummy.push({val:j,inc:1});
	   }
	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
			 var d = dummy[j];
			 d.val += d.inc;
			 if(d.val >= freqs) {
			    d.val = freqs;
				d.inc *=-1;
			 }
			 else if(d.val <= 0) {
			    d.val = 0;
				d.inc *= -1;
			 }
			 arr.push(d.val);
		  }
		  testData.push(arr);
	   }
	   VisualizerCache["ORDERED"] = testData;
	   return testData;   
   }
Visualizers["ACTUAL"] = function(opts) {
   var testData = [];
   opts = opts || {};
 	   for(var i = 0; i < samples; i++) {
		  var arr = [];
		  for(var j = 0; j < freqs; j++) {
		     var strength = j;
		     if(opts.AudioData) {
			    strength = opts.AudioData[i][j];
			 }
			arr.push(strength);			 
          }
		  testData.push(arr);
        }	
	   VisualizerCache["ACTUAL"] = testData;
	   return testData;   		
}
   
   $(document).ready(function(){
   	  var select = $("<select id='visualizer-ddl'></select>");
      for(var x in Visualizers) {
	     var option = $("<option value='" + x + "'>" + x + "</option>");
		 select.append(option);
	  }
	  select.change(function(){
	     var val = select.val();
		 //Engine.Audio.Stop();
		 //Engine.Audio.SetCurrentTime(0);
		 LoadAudioData("MidnightJSON.txt",val)
		// Engine.Audio.Play();
		 
	  });
	  $('#canvasTarget').append(select);
   });


function LoadAudioData(path,method,cb){
   if(VisualizerCache[method.trim().toUpperCase()]) {
      State.VisualizerData = VisualizerCache[method.trim().toUpperCase()];
	  if(cb){
		cb();
	  }
   }
   if(path.trim().length > 0) {
       LoadRawAudioData(path,function(opts) {
          State.VisualizerData = Visualizers[method.trim().toUpperCase()](opts);	
		  if(cb) {
			cb();		  
		  }
	   });
   } else {
   State.VisualizerData = Visualizers[method.trim().toUpperCase()]();
	  if(cb){
		cb();
	  }
	}
}



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


        $("#canvasTarget").append(Engine.Canvas);

        State = new Engine.State();



        //Engine.Audio = new Engine.AudioFactory("rebuild.mp3");


        function MakeBar(i,opts) {
        opts = opts || {};
        var rotation = (i/numBars)*360*Math.PI/180;
        var radius = 100;
        var center = new Engine.Vector2(400,300);
        var width = 1;
        var height = Math.floor(200*Math.random());
        var position = new Engine.Vector2( radius*Math.cos(rotation) + center.X, radius*Math.sin(rotation) + center.Y );
        var dimensions = new Engine.Dimensions(width,height);
        var color;
        if(rotation <= Math.PI/2) {
          color = new Engine.Color(0,0,255,1);
        }
        else if(rotation <= Math.PI) {
           color = new Engine.Color(0,255,0,1);    
        }
        else if(rotation <= (3/2)*Math.PI) {
           color = new Engine.Color(255,128,00,1);
        }
        else {
          color = new Engine.Color(255,0,0,1);
        }
          
          var bar = new Engine.Primitive.Rectangle({      
              Dimensions: dimensions,
              Rotation: rotation,
              Position: position,
              BackColor: color
          });

          bar.RotationStyle = "topLeft";
          bar.AudioDataIndex = i;
          

          bar.OverrideUpdate(function() {
          
              if(Engine.Audio.IsPlaying()) {
              
                  var time = Engine.Utilities.Round(Engine.Audio.GetCurrentTime(),2);
                  var position = time*samplesPerSec;
                  var dataTickFull = State.VisualizerData[position];
                  if(dataTickFull) {
                      var strength = dataTickFull[bar.AudioDataIndex];
                      if(strength != null) {
                         bar.SetDimensions( new Engine.Dimensions(1,strength) );
                      }
                  }
              }
              
          });

          
          
             bar.Rotation = rotation - Math.PI/2;
              
              State.AddSprite(bar);
        }







        Engine.PushState(State);

        LoadAudioData("MidnightJSON.txt","0",function(){ 
          numBars = State.VisualizerData[0].length;
          for(var i = 0; i < numBars; i++) {
           MakeBar(i);
          }
          //Engine.Audio.Play();
        });
   

   
   });
});

document.addEventListener("DOMContentLoaded", function() {
    var AUTOPLAY = false;
	var pop = Popcorn("#rebuildaudio");
	
	//doLyrics(pop);
	//doBeats(pop);
	
	if (AUTOPLAY) {
		pop.play();
	}
}, false);