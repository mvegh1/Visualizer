var fs = require('fs');

var basePath = "...";
var savePath = basePath + "...";
var path = basePath + "...";
var j = [];
var freqAvgWidth = 2;

fs.readFile(path,{encoding:'UTF8'},function(err,d){
   if(err){
      throw err;
	  process.exit();
   }
   
   var data = d.split("\r\n");
   
   if(data.length == 0) {
      console.log("file to process is empty...exiting");
	  process.exit();
   }
   
   for(var x = 0; x < data.length;x++) {
      var line = data[x];
	  var lineData = data[x].split(",");
	  if(lineData.length == 0) {
	     console.log("line",x,"is empty");
		 continue;
	  }
	  var processedData = [];
	  var time = parseFloat(lineData[0]);
	  for(var y = 1; y < lineData.length;y+=freqAvgWidth){
	     var avg = parseFloat(lineData[y]);
		 var freqCount = 1;
		 for(var z = 1; z < freqAvgWidth;z++) {
			 if(lineData[y+z]){
				avg += parseFloat(lineData[y+z]);
				freqCount++;
			 }
		 }
		 avg = avg/freqCount;
		 processedData.push(avg);
	  }
	  j.push(processedData);
   }
   
   fs.writeFile(savePath,JSON.stringify(j),function(err){
      if(err) {
	     throw err;
		 process.exit();
	  }
   });
   
});