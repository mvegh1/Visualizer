


//Setup MediaController
document.addEventListener("DOMContentLoaded", function() {
    var gears = {};
    gears.startTick = function(sample) {
        return function() {
            console.log('[startTick] for [' + sample.time + '] and ' + sample.next + ' has ' + sample.frequency_data.length + ' frequencies.');
        };
    };
    gears.endTick = function(sample) {
        return function() {
            console.log('[endTick] for ' + sample.time + ' and [' + sample.next + '] has ' + sample.frequency_data.length + ' frequencies.');
        };
    };
    gears.processingFinished = function() {
        $('#processingMessages').text('Processing is finished. Click play to run system.');
    };
    var mediaController = new MediaController({ media_container: '#rebuildaudio', power_spectrum_path: '../content/rebuild_powerspectrum.csv.json', gears: gears });
    
}, false);
