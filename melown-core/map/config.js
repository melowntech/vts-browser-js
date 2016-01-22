
Melown.Map.prototype.parseConfig = function() {
    //if (this.mapConfig_["version"] < 4) {
      //  return;
    //}

    if (!(this.parseSrses() && this.parseReferenceFrame() &&
          this.parseCredits() && this.parseSurfaces() &&
          this.parseGlues() && this.parseBoundLayers() &&
          this.parseFreeLayers() && this.parseViews() && this.parseParams() )) {
        //wrong config file
    }

    if (this.mapConfig_["position"] != null) {
        //this.mapConfig_["position"][1] = 0;
        //this.mapConfig_["position"][2] = 0;//89.99;

        //this.mapConfig_["position"][5] = 0;
        //this.mapConfig_["position"][6] = 0;

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
    //this.referenceFrame_ = {};

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

    //view_["surfaces"] = { "jenstejn-hf" : [], "jenstejn2015" : [], "jenstejn" : [] }; 
    //view_["surfaces"] = { "jenstejn-hf" : [{"id":"mapycz-basic"}], "jenstejn2015" : [], "jenstejn" : [] }; 

    //view_["surfaces"] = ["jenstejn-hf", "jenstejn2015", "jenstejn"]; 
    //view_["surfaces"] = ["jenstejn-hf", "jenstejn2015"]; 
    //view_["surfaces"] = ["jenstejn-hf", "jenstejn"]; 
    //view_["surfaces"] = ["jenstejn-hf"]; 
    //view_["surfaces"] = ["jenstejn2015"]; 
    //view_["surfaces"] = ["jenstejn"]; 

    this.initialView_ = JSON.parse(JSON.stringify(view_));//new Melown.MapView(this, view_);
    //this.currentView_ = null;

    return true;
};

Melown.Map.prototype.parseGlues = function() {
    var glues_ = this.mapConfig_["glue"];
    this.glues_ = [];

    if (glues_ == null) {
        return true;
    }

    for (var i = 0, li = glues_.length; i < li; i++) {
        var surface_ = new Melown.MapGlue(this, glues_[i], true);
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
        var layer_ = new Melown.MapBoundLayer(this, layers_[key_]);
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
        var layer_ = new Melown.MapFreeLayer(this, layers_[key_]);
        this.addFreeLayer(key_, layer_);
    }

    return true;
};

Melown.Map.prototype.parseParams = function() {

};

Melown.Map.prototype.cloneConfig = function() {
    var json_ = JSON.parse(JSON.stringify(this.mapConfig_));
/*
    json_["lowRes"] =          this.lowRes_;
    json_["degdradeHorizon"] = [this.degdradeHorizon_[0], this.degdradeHorizon_[1], this.degdradeHorizon_[2], this.degdradeHorizon_[3]];
    json_["texelSize"] =       this.texelSize_;
    json_["texelSizeFactor"] = Melown.texelSizeFactor_;
    json_["mapVersion"] =      this.mapVersion_;
    json_["geodata-layers"] =  this.geoLayers_;
*/
    return json_;
};
