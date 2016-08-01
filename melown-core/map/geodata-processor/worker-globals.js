//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var layerId_ = {};
var stylesheetData_ = {};
var stylesheetLayers_ = {};
var stylesheetBitmaps_ = {};
var forceOrigin_ = false;
var bboxMin_ = [0,0,0];
var bboxMax_ = [1,1,1];
var bboxDelta_ = [1,1,1];
var bboxResolution_ = 4096;
var tileX_ = 0;
var tileY_ = 0;
var tileLod_ = 0;
var fonts_ = {};
var hitState_ = 0;
var groupOrigin_ = [0,0,0];
var autoLod_ = false;

var clamp = function(value_, min_, max_) {
    if (value_ < min_) {
        value_ = min_;
    }

    if (value_ > max_) {
        value_ = max_;
    }

    return value_;
};
