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
var geocent_ = false;
var tileX_ = 0;
var tileY_ = 0;
var tileLod_ = 0;
var fonts_ = {};
var hitState_ = 0;
var groupOptimize_ = true;
var groupOrigin_ = [0,0,0];
var messageBuffer_ = new Array(65536);
var messageBuffer2_ = new Array(65536);
var messageBufferIndex_ = 0;
var messageBufferSize_ = messageBuffer_.length;
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

vec3Normalize = function(a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2],
        g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
        if (g == 1) {
            b[0] = c;
            b[1] = d;
            b[2] = e;
            return b;
        }
    } else {
        b[0] = 0;
        b[1] = 0;
        b[2] = 0;
        return b;
    }
    g = 1 / g;
    b[0] = c * g;
    b[1] = d * g;
    b[2] = e * g;
    return b;
};

vec3Length = function(a) {
    var b = a[0],
        c = a[1];
    a = a[2];
    return Math.sqrt(b * b + c * c + a * a);
};

var vec3Cross = function(a, b, c) {
    c || (c = a);
    var d = a[0],
        e = a[1];
    a = a[2];
    var g = b[0],
        f = b[1];
    b = b[2];
    c[0] = e * b - a * f;
    c[1] = a * g - d * b;
    c[2] = d * f - e * g;
    return c;
};

vec3AnyPerpendicular = function(a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2];
        
    b[0] = 1;        
    b[1] = 1;        

    var f = c + d;

    if (e) {
        b[2] = -f / e;        
    } else {
        b[2] = 0;
    }

    return b;
};

