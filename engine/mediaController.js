
//a poor man's angular implementation without angular
var MediaController = function(input) {
    var $scope = this;
    $scope.defaults = { autoplay: false };
    $scope.settings = $.extend({}, input, $scope.defaults);
    
    if ($scope.settings.media_container) {
        $scope.popcorn = Popcorn($scope.settings.media_container);
        
        if ($scope.settings.gears) {
            $scope.getPowerSpectrum(function() {
                $scope.processPowerSpectrum();
            
                $scope.postProcessing();
            });
        } else {
            console.log('MediaController [NOTE]: No gears supplied in input.');
        }
    } else {
        throw new Error('MediaController\'s input requires a valid media_container property.');
    }
};


MediaController.prototype.processPowerSpectrum = function() {
    var $scope = this;
    
    if ($scope.power_spectrum) {
        for (var i = 0; i < $scope.power_spectrum.length; i++) {
            var currentSample = $scope.power_spectrum[i];
            if (i + 1 < $scope.power_spectrum.length) {
                currentSample.next  = $scope.power_spectrum[i + 1].time;
            } else {
                currentSample.next = $scope.breakpoint;
            }
            
            $scope.setupPopcornEvent(currentSample);
        }
        console.log('done processing the power spectrum');
    } else {
        throw new Error('MediaController requires valid power_spectrum data.');
    }
};

MediaController.prototype.setupPopcornEvent = function(sample) {
    var $scope = this;
    
    if (sample) {
        $scope.popcorn.code({
            start: sample.time,
            end: sample.next,
            onStart: $scope.settings.gears.startTick(sample),
            onEnd: $scope.settings.gears.endTick(sample)
            // onStart: function(options) { }
            // onEnd: function(options) { }
        });
    } else {
        throw new Error('MediaController::setupPopcornEvent discovered a bad sample object.');
    }
};

                
MediaController.prototype.postProcessing = function() {
    var $scope = this;
    if ($scope.settings.gears.processingFinished) {
        $scope.settings.gears.processingFinished();
    } else {
        console.log('MediaController [NOTE]: gears object did not pass optional parameter processingFinished.');
    }
    $scope.handleAutoPlay();
};

MediaController.prototype.handleAutoPlay = function() {
    var $scope = this;
    if ($scope.settings.autoplay) {
        $scope.popcorn.play();
    }
};

MediaController.prototype.getPowerSpectrum = function(cb) {
    var $scope = this;
    if ($scope.settings.power_spectrum_path) {
        $.get($scope.settings.power_spectrum_path, function(data) {
            console.log('got the data');
            var parsed = JSON.parse(data);
            $scope.artist = parsed.artist;
            $scope.song = parsed.song;
            $scope.breakpoint = parsed.breakpoint_actual;
            
            $scope.power_spectrum = parsed.power_spectrum;
            
            cb();
        });
    } else {
        throw new Error('MediaController\'s input requires a valid power_spectrum_path property.');
    }
};