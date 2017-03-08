
Melown.Map.prototype.parseConfig = function() {
    //if (this.mapConfig_["version"] < 4) {
      //  return;
    //}

    if (!(this.parseSrses() && this.parseReferenceFrame() &&
          this.parseCredits() && this.parseStylesheets() && 
          this.parseSurfaces() && this.parseGlues() && 
          this.parseVirtualSurfaces() && this.parseBoundLayers() &&
          this.parseFreeLayers() && this.parseViews() &&
          this.parseParams() && this.parseBrowserOptions() )) {
        //wrong config file
    }

    this.stats_.loadedCount_ = 0;
    this.stats_.loadErrorCount_ = 0;
    this.stats_.loadFirst_ = performance.now();
    this.stats_.loadLast_ = this.loadFirst_;
};

Melown.Map.prototype.afterConfigParsed = function() {
    if (this.mapConfig_["position"] != null) {
        this.setPosition(this.mapConfig_["position"], false);
    }

    this.setView(this.initialView_);
};

Melown.Map.prototype.parseSrses = function() {
    var srses_ = this.mapConfig_["srses"];
    this.srses_ = {};

    if (srses_ == null) {
        return false;
    }

    for (var key_ in srses_) {
        this.addSrs(key_, new Melown.MapSrs(this, key_, srses_[key_]));
    }

    return true;
};

Melown.Map.prototype.parseReferenceFrame = function() {
    var rf_ = this.mapConfig_["referenceFrame"];

    if (rf_ == null) {
        return false;
    }

    this.referenceFrame_ = new Melown.MapRefFrame(this, rf_);

    if (this.referenceFrame_.valid_ == false) {
        return false;
    }

    return true;
};


Melown.Map.prototype.parseCredits = function() {
    var credits_ = this.mapConfig_["credits"];
    this.credits_ = {};

    if (credits_ == null) {
        return false;
    }

    for (var key_ in credits_) {
        this.addCredit(key_, new Melown.MapCredit(this, credits_[key_]));
    }

    return true;
};

Melown.Map.prototype.parseSurfaces = function() {
    var surfaces_ = this.mapConfig_["surfaces"];
    this.surfaces_ = [];

    if (surfaces_ == null) {
        return false;
    }

    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = new Melown.MapSurface(this, surfaces_[i]);
        this.addSurface(surface_.id_, surface_);
    }

    return true;
};

Melown.Map.prototype.parseVirtualSurfaces = function() {
    var surfaces_ = this.mapConfig_["virtualSurfaces"];
    this.virtualSurfaces_ = [];

    if (!this.config_.mapVirtualSurfaces_) {
        return true;
    }

    if (surfaces_ == null) {
        return true;
    }

    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = new Melown.MapVirtualSurface(this, surfaces_[i]);
        this.virtualSurfaces_[surface_.strId_] = surface_;
    }

    return true;
};

Melown.Map.prototype.parseViews = function() {
    var views_ = this.mapConfig_["namedViews"];
    this.namedViews_ = [];

    if (views_ != null) {
        for (var key_ in views_) {
            this.addNamedView(key_, new Melown.MapView(this, views_[key_]));
        }
    }

    var view_ = this.mapConfig_["view"];
    if (view_ == null) {
        return true;
    }

    this.initialView_ = JSON.parse(JSON.stringify(view_));
    return true;
};

Melown.Map.prototype.parseGlues = function() {
    var glues_ = this.mapConfig_["glue"];
    this.glues_ = [];

    if (glues_ == null) {
        return true;
    }

    for (var i = 0, li = glues_.length; i < li; i++) {
        var surface_ = new Melown.MapSurface(this, glues_[i], "glue");
        this.addGlue(surface_.id_.join(";"), surface_);
    }

    return true;
};

Melown.Map.prototype.parseBoundLayers = function() {
    var layers_ = this.mapConfig_["boundLayers"];
    this.boundLayers_ = [];

    if (layers_ == null) {
        return true;
    }

    for (var key_ in layers_) {
        var layer_ = new Melown.MapBoundLayer(this, layers_[key_], key_);
        this.addBoundLayer(key_, layer_);
    }

    return true;
};

Melown.Map.prototype.parseFreeLayers = function() {
    var layers_ = this.mapConfig_["freeLayers"];
    this.freeLayers_ = [];

    if (layers_ == null) {
        return true;
    }

    for (var key_ in layers_) {
        var layer_ = new Melown.MapSurface(this, layers_[key_], "free");
        this.addFreeLayer(key_, layer_);
    }

    return true;
};

Melown.Map.prototype.parseStylesheets = function() {
    var styles_ = this.mapConfig_["stylesheets"];
    this.stylesheets_ = [];

    if (styles_ == null) {
        return true;
    }

    for (var key_ in styles_) {
        var style_ = new Melown.MapStylesheet(this, key_, styles_[key_]);
        this.addStylesheet(key_, style_);
    }

    return true;
};

Melown.Map.prototype.parseParams = function() {
    return true;
};

Melown.Map.prototype.parseBrowserOptions = function() {
    var options_ = this.mapConfig_["browserOptions"];
    this.browserOptions_ = {};
    
    if (options_ == null) {
        return true;
    }
    
    this.browserOptions_ = JSON.parse(JSON.stringify(options_));
    return true;
};

Melown.Map.prototype.cloneConfig = function() {
    var json_ = JSON.parse(JSON.stringify(this.mapConfig_));
    return json_;
};
