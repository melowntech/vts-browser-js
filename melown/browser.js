/**
 * @constructor
 */
Melown.Browser = function(element_, config_) {
    this.config_ = config_;
    this.ui_ = new Melown.UI(this, (typeof element_ === "string") ? document.getElementById(element_) : element_);

    this.core_ = Melown.MapCore("melown-map", config_);

    if (this.core_ == null) {
        this.ui_.setControlDisplayState("fallback", true);
        return;
    }

    this.autopilot_ = new Melown.Autopilot(this);
    this.rois_ = new Melown.Rois(this);

    this.on("map-loaded", this.onMapLoaded.bind(this));
    this.on("map-unloaded", this.onMapUnloaded.bind(this));
    //this.on("map-position-changed", function(event_){ console.log("map-position-changed", JSON.stringify(event_)); });

    this.on("tick", this.onTick.bind(this));
};

Melown.Browser.prototype.getCore = function() {
    return this.core_;
};

Melown.Browser.prototype.on = function(name_, listener_) {
    this.core_.on(name_, listener_);
};

Melown.Browser.prototype.callListener = function(name_, event_) {
    this.core_.callListener(name_, event_);
};

Melown.Browser.prototype.onMapLoaded = function() {

};

Melown.Browser.prototype.onMapUnloaded = function() {

};

Melown.Browser.prototype.onTick = function() {

    //demo for Tomas
    /*
    if (this.getCore().getMap() != null) {
        var cameraInfo_ = this.getCore().getMap().getCameraInfo();
        var p = [0, 0, 10];
        var p2 = this.getCore().getRenderer().getScreenCoords(p, cameraInfo_["view-projection-matrix"]);
        var screenSize_ = this.getCore().getRenderer().getScreenSize();
    }*/


    this.ui_.tick();
};


