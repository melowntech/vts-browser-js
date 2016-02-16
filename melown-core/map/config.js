
Melown.Map.prototype.parseConfig = function() {
    //if (this.mapConfig_["version"] < 4) {
      //  return;
    //}
/*
    this.mapConfig_["boundLayers"] = 
    {
        "bing" : 
        {
            "credits" : [ "bing", "digitalglobe" ],
            "id" : 122,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://t{ms_digit(x,y)}.tiles.virtualearth.net/tiles/a{quad(lod,x,y)}.jpeg?g=854&mkt=en-US&token=Ahu6LJpWaKRj0Fzngk4d58AQFI9jKLsnvovS3ReEVcfOf6rBDCxiLDq-ycxakgOi"
        },
        "katastr" : 
        {
            "credits" : [ "cuzk" ],
            "id" : 128,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://pomerol:8001/cuzk-km/{lod}/{x}/{y}.png"
        },
        "mapycz" : 
        {
            "credits" : [ "seznamcz", "topgis" ],
            "id" : 120,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://m{alt(1,2,3,4)}.mapserver.mapy.cz/ophoto-m/{lod}-{x}-{y}"
        },
        "mapycz-base" : 
        {
            "credits" : [ "seznamcz" ],
            "id" : 127,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://m{alt(1,2,3,4)}.mapserver.mapy.cz/base-m/{lod}-{x}-{y}"
        },
        "mapycz03" : 
        {
            "credits" : [ "geodis", "seznamcz" ],
            "id" : 126,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://m{alt(1,2,3,4)}.mapserver.mapy.cz/ophoto0203-m/{lod}-{x}-{y}"
        },
        "mapycz06" : 
        {
            "credits" : [ "geodis", "seznamcz" ],
            "id" : 125,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://m{alt(1,2,3,4)}.mapserver.mapy.cz/ophoto0406-m/{lod}-{x}-{y}"
        },
        "mapycz12" : 
        {
            "credits" : [ "seznamcz" ],
            "id" : 124,
            "lodRange" : [ 0, 20 ],
            "tileRange" : 
            [
                [ 0, 0 ],
                [ 0, 0 ]
            ],
            "type" : "raster",
            "url" : "http://m{alt(1,2,3,4)}.mapserver.mapy.cz/ophoto1012-m/{lod}-{x}-{y}"
        }
    };
    
    this.mapConfig_["credits"] = 
    {
        "bing" : 
        {
            "id" : 2476,
            "notice" : "Microsoft Corporation",
            "url" : false
        },
        "cuzk" : 
        {
            "id" : 1792,
            "notice" : "ÄŒÃšZK",
            "url" : false
        },
        "digitalglobe" : 
        {
            "id" : 7765,
            "notice" : "DigitalGlobe",
            "url" : false
        },
        "geodis" : 
        {
            "id" : 7767,
            "notice" : "GEODIS",
            "url" : false
        },
        "seznamcz" : 
        {
            "id" : 103,
            "notice" : "Seznam.cz, a.s.",
            "url" : false
        },
        "test" : 
        {
            "id" : 1768,
            "notice" : "Test copy",
            "url" : false
        },
        "topgis" : 
        {
            "id" : 7766,
            "notice" : "TopGis",
            "url" : false
        },
        "usgs" : 
        {
            "id" : 2,
            "notice" : "USGS/NASA",
            "url" : false
        },
        "usgsnasa" : 
        {
            "id" : 2000,
            "notice" : "USGS/NASA",
            "url" : false
        }
    };
*/
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

//    view_["surfaces"] = { "ev" : ["mapycz", {"id": "katastr", "alpha": 0.95}] }; 
//    view_["surfaces"] = { "ev" : ["mapycz"] }; 

//    view_["surfaces"] = { "ev" : [] }; 

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
