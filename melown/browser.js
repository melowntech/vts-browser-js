/**
 * @constructor
 */
Melown.Browser = function(element_, config_) {
    this.initConfig();
    this.setConfigParams(config_, true);
    this.ui_ = new Melown.UI(this, (typeof element_ === "string") ? document.getElementById(element_) : element_);

    this.core_ = Melown.MapCore("melown-map", config_);

    if (this.core_ == null) {
        this.ui_.setControlDisplayState("fallback", true);
        return;
    }

    this.autopilot_ = new Melown.Autopilot(this);
    this.rois_ = new Melown.Rois(this);
    this.controlMode_ = new Melown.ControlMode(this, this.ui_);

    this.on("map-loaded", this.onMapLoaded.bind(this));
    this.on("map-unloaded", this.onMapUnloaded.bind(this));
    this.on("map-update", this.onMapUpdate.bind(this));

    //this.on("map-position-changed", function(event_){ console.log("map-position-changed", JSON.stringify(event_)); });

    this.on("tick", this.onTick.bind(this));
};

Melown.Browser.prototype.getCore = function() {
    return this.core_;
};

Melown.Browser.prototype.getMap = function() {
    return this.core_.getMap();
};

Melown.Browser.prototype.getUI = function() {
    return this.ui_;
};

Melown.Browser.prototype.getControlMode = function() {
    return this.controlMode_;
};

Melown.Browser.prototype.on = function(name_, listener_) {
    this.core_.on(name_, listener_);
};

Melown.Browser.prototype.callListener = function(name_, event_) {
    this.core_.callListener(name_, event_);
};

Melown.Browser.prototype.onMapLoaded = function() {
/*
    //demo for Tomas
    var map_ = this.getCore().getMap();
    var p = map_.getPosition();
    p[1] = 494264;
    p[2] = 5517976;
    p[3] = "fix";
    p[4] = 403;

    p[8] = 200;

    this.autopilot_.flyTo(p, {"mode":"ballistic", "samplePeriod": 10, "speed":0.1});
*/
    var map_ = this.getCore().getMap();

    if (this.config_.position_) {
        map_.setPosition(this.config_.position_);
        this.config_.position_ = null;
    }

    if (this.config_.view_) {
        map_.setView(this.config_.view_);
        this.config_.view_ = null;
    }

};

Melown.Browser.prototype.onMapUnloaded = function() {

};

Melown.Browser.prototype.onMapUpdate = function() {
    this.dirty_ = true;
    
/*
    //demo for Tomas
    if (!this.demoImage_) {
	    this.demoImage_ = Melown.Http.imageFactory(
	    	"http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
			(function(){
	    		this.getCore().getMap().redraw();
	    		this.demoTexture_ = this.getCore().getRenderer().createTexture({ "source": this.demoImage_ });
	      	}).bind(this)
	    	);
    } 
    
 	var map_ = this.getCore().getMap();

    if (map_ && this.demoTexture_) {
        var p = map_.getPosition();
        p[1] = 494719;
        p[2] = 5517440;
        p[3] = "fix";
        p[4] = 350;

        var coords_ = map_.getPositionCanvasCoords(p);
        
        var renderer_ = this.getCore().getRenderer();
        var canvasSize_ = renderer_.getCanvasSize();
        
        var points_ = [
        	[coords_[0], coords_[1], coords_[2]],
			[canvasSize_[0], 100, 0]        	        
        ];

        renderer_.drawLineString({
        	"points" : points_,
        	"size" : 2.0,
        	"color" : [255,0,255,255],
        	"depth-test" : false,
        	"blend" : false
        	});
        	
        renderer_.drawImage({
        	"rect" : [coords_[0]-12, coords_[1]-12, 24, 24],
        	"texture" : this.demoTexture_,
        	"color" : [255,0,255,255],
        	"depth" : coords_[2],
        	"depth-test" : false,
        	"blend" : true
        	});
    }
*/    
};

Melown.Browser.prototype.onTick = function() {
    this.autopilot_.tick();
    this.ui_.tick(this.dirty_);
    this.dirty_ = false;
};


