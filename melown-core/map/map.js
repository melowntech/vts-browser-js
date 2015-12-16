/** @const */ var Melown_STILE_METADATA = 0;
/** @const */ var Melown_STILE_MESH = 1;
/** @const */ var Melown_STILE_TEXTURE = 2;
/** @const */ var Melown_STILE_HEIGHT = 3;

/**
 * @constructor
 */
Melown.Map = function(core_, mapConfig_, path_, config_) {
    this.config_ = config_ || {};
    this.setConfigParams(config_);
    this.core_ = core_;
    this.proj4_ = this.core_.getProj4();
    this.mapConfig_ = mapConfig_;
    this.coreConfig_ = core_.coreConfig_;
    this.killed_ = false;
    this.urlCounter_ = 0;
    this.config_ = config_ || {};

    this.baseURL_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    this.position_ = new Melown.MapPosition(this, ["obj", 0, 0, "fix", 0,  0, 0, 0,  0, 0]);
    this.lastPosition_ = this.position_.clone();

    this.srses_ = {};
    this.referenceFrame_ = {};
    this.credits_ = {};
    this.surfaces_ = [];
    this.glues_ = [];
    this.freeLayers_ = [];
    this.boundLayers_ = [];
    this.dynamicLayers_ = [];

    this.initialView_ = null;
    this.currentView_ = null;
    this.namedViews_ = [];
    this.viewCounter_ = 0;

    this.surfaceSequence_ = [];
    this.boundLayerSequence_ = [];

    this.mapTrees_ = [];

    this.gpuCache_ = new Melown.MapCache(this, this.config_.mapGpuCache_*1024*1024);
    this.resourcesCache_ = new Melown.MapCache(this, this.config_.mapCache_*1024*1024);
    this.metatileCache_ = new Melown.MapCache(this, this.config_.mapMetatileCache_*1024*1024);

    this.loader_ = new Melown.MapLoader(this);

    this.renderer_ = this.core_.renderer_;//new Melown.Renderer(this.core_, this.core_.div_);
    this.camera_ = this.renderer_.camera_;
    this.cameraDistance_ = 10;
    this.cameraPosition_ = [0,0,0];

    this.stats_ = new Melown.MapStats(this);

    this.parseConfig(this.mapConfig_);

    this.initMapTrees();

    this.updateCoutner_ = 0;
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    this.heightmapOnly_ = false;
    this.blendHeightmap_ = true;
    this.drawBBoxes_ = false;
    this.drawLods_ = false;
    this.drawPositions_ = false;
    this.drawTexelSize_ = false;
    this.drawWireframe_ = 0;
    this.drawFaceCount_ = false;
    this.drawDistance_ = false;
    this.drawMaxLod_ = false;
    this.drawTextureSize_ = false;
    this.drawLayers_ = true;
    this.ignoreTexelSize_ = false;
    this.drawFog_ = true;
    this.debugTextSize_ = 1.0;

    this.drawTileState_ = this.renderer_.gpu_.createState({});
    this.drawBlendedTileState_ = this.renderer_.gpu_.createState({zequal_:true, blend_:true});
};

Melown.Map.prototype.kill = function() {
    this.killed_ = true;

    if (this.renderer_ != null) {
        this.renderer_.kill();
        this.renderer_ = null;
    }
};

Melown.Map.prototype.getCoreInterface = function() {
	return this.core_.interface_;
};

Melown.Map.prototype.getRendererInterface = function() {
	return this.core_.interface_.getRendererInterface();
};

Melown.Map.prototype.initMapTrees = function() {
    var nodes_ = this.referenceFrame_.division_.nodes_;

    for (var i = 0, li = nodes_.length; i < li; i++) {
        this.mapTrees_.push(new Melown.MapTree(this, nodes_[i], false));
    }
};

Melown.Map.prototype.setOption = function(key_, value_) {
};

Melown.Map.prototype.getOption = function(key_) {
};

Melown.Map.prototype.addSrs = function(id_, srs_) {
    this.srses_[id_] = srs_;
};

Melown.Map.prototype.getSrses = function() {
    return this.getMapKeys(this.srses_);
};

Melown.Map.prototype.setReferenceFrame = function(referenceFrame_) {
    this.referenceFrame_ = referenceFrame_;
};

Melown.Map.prototype.addCredit = function(id_, credit_) {
    this.credits_[id_] = credit_;
};

Melown.Map.prototype.addSurface = function(id_, surface_) {
    this.surfaces_.push(surface_);
};

Melown.Map.prototype.getSurface = function(id_) {
    return this.searchArrayById(this.surfaces_, id_);
};

Melown.Map.prototype.getSurfaces = function() {
    var keys_ = [];
    for (var i = 0, li = this.surfaces_.length; i < li; i++) {
        keys_.push(this.surfaces_[i].id_);
    }
    return keys_;
};

Melown.Map.prototype.addGlue = function(id_, glue_) {
    this.glues_[id_] = glue_;
};

Melown.Map.prototype.getGlue = function(id_) {
    return this.searchArrayById(this.glues_, id_);
};

Melown.Map.prototype.addBoundLayer = function(number_, layer_) {
    this.boundLayers_[number_] = layer_;
};

Melown.Map.prototype.getBoundLayerByNumber = function(number_) {
    return this.searchMapByInnerId(this.boundLayers_, number_);
};

Melown.Map.prototype.getBoundLayerById = function(id_) {
    return this.boundLayers_[id_];
};

Melown.Map.prototype.getBoundLayers = function() {
    return this.getMapKeys(this.boundLayers_);
};

Melown.Map.prototype.addFreeLayer = function(id_, layer_) {
    this.freeLayers_[id_] = layer_;
};

Melown.Map.prototype.getFreeLayer = function(id_) {
    return this.freeLayers_[id_];
};

Melown.Map.prototype.getFreeLayers = function() {
    return this.getMapKeys(this.freeLayers_);
};

Melown.Map.prototype.getMapsSrs = function(srs_) {
    if (srs_ == null) {
        return null;
    }

    //is it proj4 string?
    if (srs_.indexOf("+proj") != -1) {
        return new Melown.MapSrs(this, {"srsDef":srs_});
    }

    //search existing srs
    return this.srses_[srs_];
};

Melown.Map.prototype.addMapView = function(id_, view_) {
    this.namedViews_[id_] = view_;
};

Melown.Map.prototype.getMapView = function(id_, view_) {
    return this.namedViews_[id_];
};

Melown.Map.prototype.getMapViews = function() {
    return this.getMapKeys(this.namedViews_);
};

Melown.Map.prototype.setMapView = function(view_) {
    if (view_ == null) {
        return;
    }

    if (view_ != this.currentView_) {
        this.currentView_ = view_;
        this.freeLayers_ = this.currentView_.freeLayers_;
        this.viewCounter_++;
    }

    this.generateSurfaceSequence();
    this.generateBoundLayerSequence();
};

Melown.Map.prototype.searchArrayById = function(array_, id_) {
    for (var i = 0, li = array_.length; i < li; i++) {
        if (array_[i].id_ == id_) {
            return array_[i];
        }
    }

    return null;
};

Melown.Map.prototype.searchMapByInnerId = function(map_, id_) {
    for (var key_ in map_) {
        if (map_[key_].id_ == id_) {
            return map_[key_];
        }
    }

    return null;
};

Melown.Map.prototype.getMapKeys = function(map_) {
    var keys_ = [];
    for (var key_ in map_) {
        keys_.push(key_);
    }
};

Melown.Map.prototype.generateBoundLayerSequence = function() {
    var view_ = this.currentView_;
    var layers_ = view_.boundLayers_;
    this.boundLayerSequence_ = [];

    for (var i = 0, li = layers_.length; i < li; i++) {
        var item_ = layers_[i];

        if (typeof item_ === "string") {
            var layer_ = this.getBoundLayerById(item_);
        } else {
            var layer_ = this.getBoundLayerById(item_["id"]);

            if (layer_ != null && typeof item_["alpha"] !== "undefined") {
                layer_.currentAlpha_ = item_["alpha"];
            }
        }

        if (layer_ != null) {
            this.boundLayerSequence_.push(layer_);
        }
    }
};

Melown.Map.prototype.generateSurfaceSequence = function() {
    var view_ = this.currentView_;
    var surfaces_ = view_.surfaces_;
    this.surfaceSequence_ = [];

    for (var i = 0, li = surfaces_.length; i < li; i++) {

        //check for glue
        if (i + 1 < li) {
            var guleId_ = surfaces_[i].id_ + ";" + surfaces_[i+1].id_;
            var glue_ = this.glues_[glueId_];

            if (glue_ != null) {
                this.surfaceSequence_.push(glue_);
            }
        }

        this.surfaceSequence_.push(this.getSurface(surfaces_[i]));
    }
};

Melown.Map.prototype.setPosition = function(pos_, public_) {
    this.position_ = new Melown.MapPosition(this, pos_);
    this.dirty_ = true;
};

Melown.Map.prototype.convertCoords = function(coords_, source_, destination_) {
    return this.referenceFrame_.convertCoords(coords_, source_, destination_);
};

Melown.Map.prototype.getPhysicalSrs = function(coords_, source_, destination_) {
    return this.referenceFrame_.model_.physicalSrs_;
};

Melown.Map.prototype.getPublicSrs = function() {
    return this.referenceFrame_.model_.publicSrs_;
};

Melown.Map.prototype.getNavigationSrs = function() {
    return this.referenceFrame_.model_.navigationSrs_;
};

Melown.Map.prototype.getPosition = function() {
    return this.position_.clone();
};

Melown.Map.prototype.pan = function(pos_, dx_ ,dy_) {
    var pos2_ = pos_.clone();

    var zoomFactor_ = (pos_.getViewExtent() * Math.tan(Melown.radians(this.camera_.getFov()))) / 800;
    dx_ *= zoomFactor_;
    dy_ *= zoomFactor_;

    var yaw_ = Melown.radians(pos_.getOrientation()[0]);
    var forward_ = [-Math.sin(yaw_), Math.cos(yaw_)];
    var aside_ = [Math.cos(yaw_), Math.sin(yaw_)];

    var coords_ = pos_.getCoords();
    var coords2_ = pos_.getCoords();
    var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

    if (this.getNavigationSrs().isProjected()) {
        pos2_.setCoords2([coords_[0] + (forward_[0]*dy_ - aside_[0]*dx_),
                          coords_[1] + (forward_[1]*dy_ - aside_[1]*dx_)]);
    } else {
        var mx_ = forward_[0]*dy_ - aside_[0]*dx_;
        var my_ = forward_[1]*dy_ - aside_[1]*dx_;

        var azimut_ = Melown.degrees(Math.atan2(mx_, my_));
        var distance_ = Math.sqrt(mx_*mx_ + my_*my_);
        //console.log("azimut: " + azimut_ + " distance: " + distance_);

        var coords_ = pos_.getCoords();
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

        var geod = new GeographicLib.Geodesic.Geodesic(navigationSrsInfo_["a"],
                                                       (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

        var r = geod.Direct(coords_[1], coords_[0], azimut_, distance_);
        pos2_.setCoords2([r.lon2, r.lat2]);

        //console.log("oldpos: " + JSON.stringify(pos_));
        //console.log("newpos: " + JSON.stringify(pos2_));
    }

    return pos2_;
};

Melown.Map.prototype.setConfigParams = function(params_) {
    if (typeof params_ === "object" && params_ !== null) {
        for (var key_ in params_) {
            this.setConfigParam(key_, params_[key_]);
        }
    }
};

Melown.Map.prototype.setConfigParam = function(key_, value_) {
    switch (key_) {
        case "map":                           this.config_.map_ = Melown.validateString(value_, null); break;
        case "mapCache":                      this.config_.mapCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 900); break;
        case "mapGPUCache":                   this.config_.mapGPUCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 360); break;
        case "mapMetatileCache":              this.config_.mapMetatileCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 60); break;
        case "mapTexelSizeFit":               this.config_.mapTexelSizeFit_ = Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 1.1); break;
        case "mapTexelSizeTolerance":         this.config_.mapTexelSizeTolerance_= Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 1.1); break;
        case "mapDownloadThreads":            this.config_.mapDownloadThreads_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 6); break;
        case "mapMaxProcessedMeshes":         this.config_.mapMaxProcessedMeshes_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 1); break;
        case "mapMaxProcessedTextures":       this.config_.mapMaxProcessedTextures_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 1); break;
        case "mapMaxProcessedMetatiles":      this.config_.mapMaxProcessedMetatiles_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 2); break;
        case "mapMobileMode":                 this.config_.mapMobileMode_ = Melown.validateBool(value_, false); break;
        case "mapMobileTexelDegradation":     this.config_.mapMobileTexelDegradation_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 2); break;
        case "mapNavSamplesPerViewExtent":    this.config_.mapNavSamplesPerViewExtent_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 10); break;
    }
};

Melown.Map.prototype.getConfigParam = function(key_) {
    switch (key_) {
        case "map":                           return this.config_.map_;
        case "mapCache":                      return this.config_.mapCache_;
        case "mapGPUCache":                   return this.config_.mapGPUCache_;
        case "mapMetatileCache":              return this.config_.mapMetatileCache_;
        case "mapTexelSizeFit":               return this.config_.mapTexelSizeFit_;
        case "mapTexelSizeTolerance":         return this.config_.mapTexelSizeTolerance_;
        case "mapDownloadThreads":            return this.config_.mapDownloadThreads_;
        case "mapMaxProcessedMeshes":         return this.config_.mapMaxProcessedMeshes_;
        case "mapMaxProcessedTextures":       return this.config_.mapMaxProcessedTextures_;
        case "mapMaxProcessedMetatiles":      return this.config_.mapMaxProcessedMetatiles_;
        case "mapMobileMode":                 return this.config_.mapMobileMode_;
        case "mapMobileTexelDegradation":     return this.config_.mapMobileTexelDegradation_;
        case "mapNavSamplesPerViewExtent":    return this.config_.mapNavSamplesPerViewExtent_;
    }
};

Melown.Map.prototype.markDirty = function() {
    this.dirty_ = true;
};

Melown.Map.prototype.update = function() {
    if (this.killed_ == true){
        return;
    }

    if (this.div_ != null && this.div_.style.visibility == "hidden"){
        //loop heartbeat
        window.requestAnimFrame(this.update.bind(this));
        return;
    }

    if (this.position_.isDifferent(this.lastPosition_)) {
        this.core_.callListener("map-position-changed", {"position":this.position_.pos_.slice()});
    }

    this.lastPosition_ = this.position_.clone();

    this.stats_.begin();

    var rect_ = this.renderer_.div_.getBoundingClientRect();

    if (this.renderer_.curSize_[0] != rect_.width || this.renderer_.curSize_[1] != rect_.height) {
        this.renderer_.onResize();
        this.dirty_ = true;
    }

    this.loader_.update();

    if (this.dirty_) {
        this.dirty_ = false;

        this.renderer_.gpu_.setViewport();

        this.updateCamera();
        this.renderer_.dirty_ = true;

        //this.cameraPosition_ = this.renderer_.cameraPosition();

        this.renderer_.paintGL();

        this.draw();
		
		/*
        var points_ = [
            [0,0,0],
            [500,500,0],
            [100, 600,0]
        ];

        this.renderer_.drawLineString(points_, 2.0, [255,0,255,255], false, false);
        */
        
        this.core_.callListener("map-update", {});
    }

    this.stats_.end();

};

