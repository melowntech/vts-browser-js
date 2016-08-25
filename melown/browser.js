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
    
    this.updatePosInUrl_ = false;
    this.lastUrlUpdateTime_ = false;

    this.autopilot_ = new Melown.Autopilot(this);
    this.rois_ = new Melown.Rois(this);
    this.controlMode_ = new Melown.ControlMode(this, this.ui_);
    this.presenter_ = new Melown.Presenter(this, config_);

    this.on("map-loaded", this.onMapLoaded.bind(this));
    this.on("map-unloaded", this.onMapUnloaded.bind(this));
    this.on("map-update", this.onMapUpdate.bind(this));
    this.on("map-position-changed", this.onMapPositionChanged.bind(this));

    this.on("tick", this.onTick.bind(this));
};

Melown.Browser.prototype.getCore = function() {
    return this.core_;
};

Melown.Browser.prototype.getMap = function() {
    return this.core_ ? this.core_.getMap() : null;
};

Melown.Browser.prototype.getRenderer = function() {
    return this.core_ ? this.core_.getRenderer() : null;
};

Melown.Browser.prototype.getProj4 = function() {
    return this.core_ ? this.core_.getProj4() : null;
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
    if (this.autopilot_) {
        this.autopilot_.setAutorotate(this.config_.autoRotate_);
        this.autopilot_.setAutopan(this.config_.autoPan_[0], this.config_.autoPan_[1]);
    }
};

Melown.Browser.prototype.getLinkWithCurrentPos = function() {
    var map_ = this.getMap();
    if (map_ == null) {
        return "";
    }

    //get url params
    var params_ = Melown.Url.getParamsFromUrl(window.location.href);
    
    //get position string
    var p = map_.getPosition();
    var s = "";
    s += map_.getPositionViewMode(p) + ",";
    var c = map_.getPositionCoords(p);
    s += c[0].toFixed(6) + "," + c[1].toFixed(6) + "," + map_.getPositionHeightMode(p) + "," + c[2].toFixed(2) + ",";
    var o = map_.getPositionOrientation(p);
    s += o[0].toFixed(2) + "," + o[1].toFixed(2) + "," + o[2].toFixed(2) + ",";
    s += map_.getPositionViewExtent(p).toFixed(2) + "," + map_.getPositionFov(p).toFixed(2);

    //replace old value with new one    
    params_["pos"] = s;
    
    //convert prameters to url parameters string
    s = "";
    for (var key_ in params_) {
        s += ((s.length > 0) ? "&" : "") + key_ + "=" + params_[key_];
    }

    //separete base url and url params
    var urlParts_ = window.location.href.split("?");
    
    if (urlParts_.length > 1) {
        var extraParts_ = urlParts_[1].split("#"); //is there anchor?
        return urlParts_[0] + "?" + s + (extraParts_[1] || ""); 
    } else {
        return urlParts_[0] + "?" + s; 
    }
};

Melown.Browser.prototype.onMapPositionChanged = function() {
    if (this.config_.positionInUrl_) {
        this.updatePosInUrl_ = true;
    }
};

Melown.Browser.prototype.onMapUnloaded = function() {

};

Melown.Browser.prototype.onMapUpdate = function() {
    this.dirty_ = true;

};

Melown.Browser.prototype.onTick = function() {
    this.autopilot_.tick();
    this.ui_.tick(this.dirty_);
    this.dirty_ = false;
    
    if (this.updatePosInUrl_) {
        var timer_ = performance.now(); 
        if ((timer_ - this.lastUrlUpdateTime_) > 1000) {
            if (window.history.replaceState) {
                window.history.replaceState({}, null, this.getLinkWithCurrentPos());
            }        
            this.updatePosInUrl_ = false;
            this.lastUrlUpdateTime_ = timer_;
        }
    }
};


