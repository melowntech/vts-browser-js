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
    this.loaderSuspended_ = false;

    this.baseURL_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    this.position_ = new Melown.MapPosition(this, ["obj", 0, 0, "fix", 0,  0, 0, 0,  0, 0]);
    this.lastPosition_ = this.position_.clone();

    this.srses_ = {};
    this.referenceFrame_ = {};
    this.credits_ = {};
    this.creditsByNumber_ = {};
    this.surfaces_ = [];
    this.glues_ = [];
    this.freeLayers_ = [];
    this.boundLayers_ = [];
    this.dynamicLayers_ = [];
    this.tileBuffer_ = new Array(500);

    this.initialView_ = null;
    this.currentView_ = new Melown.MapView(this, {});
    this.currentViewString_ = "";
    this.namedViews_ = [];
    this.viewCounter_ = 0;
    this.drawChannel_ = 0;
    this.drawChannelNames_ = ["base", "hit"];

    this.freeLayerSequence_ = [];

    this.visibleCredits_ = {
      imagery_ : [],
      mapdata_ : []
    };

    this.gpuCache_ = new Melown.MapCache(this, this.config_.mapGPUCache_*1024*1024);
    this.resourcesCache_ = new Melown.MapCache(this, this.config_.mapCache_*1024*1024);
    this.metatileCache_ = new Melown.MapCache(this, this.config_.mapMetatileCache_*1024*1024);

    this.loader_ = new Melown.MapLoader(this, this.config_.mapDownloadThreads_);

    this.renderer_ = this.core_.renderer_;//new Melown.Renderer(this.core_, this.core_.div_);
    this.camera_ = this.renderer_.camera_;
    this.cameraDistance_ = 10;
    this.cameraPosition_ = [0,0,0];
    this.cameraVector_ = [0,0,1];
    this.cameraCenter_ = [0,0,0];
    this.cameraHeight_ = 0;

    this.stats_ = new Melown.MapStats(this);
    this.resourcesTree_ = new Melown.MapResourceTree(this);

    this.parseConfig();

    this.tree_ = new Melown.MapSurfaceTree(this, false);
    this.afterConfigParsed();

    this.updateCoutner_ = 0;
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    this.heightmapOnly_ = false;
    this.blendHeightmap_ = true;
    this.drawBBoxes_ = false;
    this.drawMeshBBox_ = false;    
    this.drawLods_ = false;
    this.drawPositions_ = false;
    this.drawTexelSize_ = false;
    this.drawWireframe_ = 0;
    this.drawFaceCount_ = false;
    this.drawDistance_ = false;
    this.drawMaxLod_ = false;
    this.drawTextureSize_ = false;
    this.drawNodeInfo_ = false;
    this.drawLayers_ = true;
    this.drawBoundLayers_ = false;
    this.drawSurfaces_ = false;
    this.drawCredits_ = false;
    this.drawOrder_ = false;
    this.drawTileCounter_ = 0;

    this.ignoreTexelSize_ = false;
    this.drawFog_ = this.config_.mapFog_;
    this.debugTextSize_ = 2.0;
    this.fogDensity_ = 0;
    this.zFactor_ = 1;

    this.drawTileState_ = this.renderer_.gpu_.createState({});
    this.drawBlendedTileState_ = this.renderer_.gpu_.createState({zequal_:true, blend_:true});
    
    this.renderSlots_ = [];
    
    this.addRenderSlot("map", this.drawMap.bind(this), true);
};

Melown.Map.prototype.kill = function() {
    this.killed_ = true;
    
    this.tree_.kill();

    for (var key_ in freeLayers_) {
        this.getFreeLayer(key_).tree_.kill();
    }

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

Melown.Map.prototype.setOption = function(key_, value_) {
};

Melown.Map.prototype.getOption = function(key_) {
};

Melown.Map.prototype.addSrs = function(id_, srs_) {
    this.srses_[id_] = srs_;
};

Melown.Map.prototype.getSrs = function(srsId_) {
    return this.srses_[srsId_];
};

Melown.Map.prototype.getSrses = function() {
    return this.getMapKeys(this.srses_);
};

Melown.Map.prototype.setReferenceFrame = function(referenceFrame_) {
    this.referenceFrame_ = referenceFrame_;
};

Melown.Map.prototype.addCredit = function(id_, credit_) {
    this.credits_[id_] = credit_;
    this.creditsByNumber_[credit_.id_] = credit_;
    credit_.key_ = id_;
};

Melown.Map.prototype.getCreditByNumber = function(id_) {
    return this.creditsByNumber_[id_];
};

Melown.Map.prototype.getCreditById = function(id_) {
    return this.credits_[id_];
};

Melown.Map.prototype.getCredits = function() {
    return this.getMapKeys(this.credits_);
};

Melown.Map.prototype.getVisibleCredits = function() {
    var imagery_ = this.visibleCredits_.imagery_;
    var imageryArray_ = []; 
    
    for (var key_ in imagery_) {
        var item_ = this.creditsByNumber_[key_];
        if (item_) {
            imageryArray_.push(item_.key_);
        }
    }

    var mapdata_ = this.visibleCredits_.mapdata_;
    var mapdataArray_ = []; 
    
    for (var key_ in mapdata_) {
        var item_ = this.creditsByNumber_[key_];
        if (item_) {
            mapdataArray_.push(item_.key_);
        }
    }

    return {
        "3D" : [], 
        "imagery" : imageryArray_, 
        "mapdata" : mapdataArray_ 
    };
};

Melown.Map.prototype.addSurface = function(id_, surface_) {
    this.surfaces_.push(surface_);
    surface_.index_ = this.surfaces_.length - 1; 
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

Melown.Map.prototype.addBoundLayer = function(id_, layer_) {
    this.boundLayers_[id_] = layer_;
};

Melown.Map.prototype.getBoundLayerByNumber = function(number_) {
    var layers_ = this.boundLayers_;
    for (var key_ in layers_) {
        if (layers_[key_].numberId_ == number_) {
            return layers_[key_];
        }
    }

    return null;
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
    //return this.freeLayers_[id_];
    return this.searchArrayById(this.freeLayers_, id_);
};

Melown.Map.prototype.getFreeLayers = function() {
    var keys_ = [];
    for (var i = 0, li = this.freeLayers_.length; i < li; i++) {
        keys_.push(this.freeLayers_[i].id_);
    }
    return keys_;
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

Melown.Map.prototype.addNamedView = function(id_, view_) {
    this.namedViews_[id_] = view_;
};

Melown.Map.prototype.getNamedView = function(id_) {
    return this.namedViews_[id_];
};

Melown.Map.prototype.getNamedViews = function() {
    return this.getMapKeys(this.namedViews_);
};

Melown.Map.prototype.setView = function(view_, forceRefresh_) {
    if (view_ == null) {
        return;
    }
    
    if (typeof view_ === "string") {
        view_ = this.getNamedView(view_);
        
        if (!view_) {
            return;
        }
        
        //view_ = JSON.parse(JSON.stringify(view_));
        view_ = view_.getInfo();
    }

    var string_ = JSON.stringify(view_);
    if (string_ != this.currentViewString_ || forceRefresh_) {
        this.currentView_.parse(view_);
        this.currentViewString_ = string_;
        this.viewCounter_++;
    }

    this.generateSurfaceSequence();
    this.generateBoundLayerSequence();

    var freeLayers_ = this.currentView_.freeLayers_;
    this.freeLayerSequence_ = [];

    for (var key_ in freeLayers_) {
        var freeLayer_ = this.getFreeLayer(key_);
        
        if (freeLayer_) {
            
            freeLayer_.zFactor_ = freeLayers_[key_]["depthShift"] || 0;
            
            this.freeLayerSequence_.push(freeLayer_);
            
            //TODO: generate bound layer seqence for      
        }
    }

    this.markDirty();
};

Melown.Map.prototype.getView = function() {
    return this.currentView_.getInfo();
};

Melown.Map.prototype.refreshView = function() {
    this.viewCounter_++;
    this.generateSurfaceSequence();
    this.generateBoundLayerSequence();
    this.markDirty();
};

Melown.Map.prototype.searchArrayIndexById = function(array_, id_) {
    for (var i = 0, li = array_.length; i < li; i++) {
        if (array_[i].id_ == id_) {
            return i;
        }
    }

    return -1;
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

    return keys_;
};

Melown.Map.prototype.getMapIds = function(map_) {
    var keys_ = [];
    for (var key_ in map_) {
        keys_.push(key_.id_);
    }

    return keys_;
};

Melown.Map.prototype.setPosition = function(pos_, public_) {
    this.position_ = new Melown.MapPosition(this, pos_);
    this.markDirty();
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

Melown.Map.prototype.setConfigParams = function(params_) {
    if (typeof params_ === "object" && params_ !== null) {
        for (var key_ in params_) {
            this.setConfigParam(key_, params_[key_]);
        }
    }
};

Melown.Map.prototype.getAzimuthCorrection = function(coords_, coords2_) {
    if (!this.getNavigationSrs().isProjected()) {
        var geodesic_ = this.getGeodesic();
        var r = geodesic_.Inverse(coords_[0], coords_[1], coords2_[0], coords2_[1]);
        var ret_ = (r.azi1 - r.azi2);
        if (isNaN(ret_)) {
            ret_ = 0;
        } 
        return ret_; 
    }
    return 0;
};

Melown.Map.prototype.setConfigParam = function(key_, value_) {
    switch (key_) {
        case "map":                           this.config_.map_ = Melown.validateString(value_, null); break;
        case "mapCache":                      this.config_.mapCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 900)*1024*1024;
                                              this.resourcesCache_.setMaxCost(this.config_.mapCache_); break;
        case "mapGPUCache":                   this.config_.mapGPUCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 360)*1024*1024;
                                              this.gpuCache_.setMaxCost(this.config_.mapGPUCache_); break;
        case "mapMetatileCache":              this.config_.mapMetatileCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 60)*1024*1024;
                                              this.metatileCache_.setMaxCost(this.config_.mapMetatileCache_); break;
        case "mapTexelSizeFit":               this.config_.mapTexelSizeFit_ = Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 1.1); break;
        case "mapTexelSizeTolerance":         this.config_.mapTexelSizeTolerance_= Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 2.2); break;
        case "mapLowresBackground":           this.config_.mapLowresBackground_ = Melown.validateBool(value_, false); break;
        case "mapDownloadThreads":            this.config_.mapDownloadThreads_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 6); break;
        case "mapMaxProcessingTime":          this.config_.mapMaxProcessingTime_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 1000/20); break;
        case "mapMobileMode":                 this.config_.mapMobileMode_ = Melown.validateBool(value_, false); break;
        case "mapMobileTexelDegradation":     this.config_.mapMobileTexelDegradation_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 2); break;
        case "mapNavSamplesPerViewExtent":    this.config_.mapNavSamplesPerViewExtent_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 10); break;
        case "mapFog":                        this.config_.mapFog_ = Melown.validateBool(value_, false); break;
        case "mapIgnoreNavtiles":             this.config_.mapIgnoreNavtiles_ = Melown.validateBool(value_, false); break;
        case "mapAllowHires":                 this.config_.mapAllowHires_ = Melown.validateBool(value_, true); break;
        case "mapAllowLowres":                this.config_.mapAllowLowres_ = Melown.validateBool(value_, true); break;
        case "mapAllowSmartSwitching":        this.config_.mapAllowSmartSwitching_ = Melown.validateBool(value_, true); break;
        case "mapHeightLodBlend":             this.config_.mapHeightLodBlend_ = Melown.validateBool(value_, true); break;
        case "mapHeightNodeBlend":            this.config_.mapHeightNodeBlend_ = Melown.validateBool(value_, true); break;
        case "mapBasicTileSequence":          this.config_.mapBasicTileSequence_ = Melown.validateBool(value_, true); break;
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
        case "mapLowresBackground":           return this.config_.mapLowresBackground_;
        case "mapDownloadThreads":            return this.config_.mapDownloadThreads_;
        case "mapMaxProcessingTime":          return this.config_.mapMaxProcessingTime_;
        case "mapMobileMode":                 return this.config_.mapMobileMode_;
        case "mapMobileTexelDegradation":     return this.config_.mapMobileTexelDegradation_;
        case "mapNavSamplesPerViewExtent":    return this.config_.mapNavSamplesPerViewExtent_;
        case "mapFog":                        return this.config_.mapFog_;
        case "mapIgnoreNavtiles":             return this.config_.mapIgnoreNavtiles_;
        case "mapAllowHires":                 return this.config_.mapAllowHires_;
        case "mapAllowLowres":                return this.config_.mapAllowLowres_;
        case "mapAllowSmartSwitching":        return this.config_.mapAllowSmartSwitching_;
        case "mapHeightLodBlend":             return this.config_.mapHeightLodBlend_;
        case "mapHeightNodeBlend":            return this.config_.mapHeightNodeBlend_;
        case "mapBasicTileSequence":          return this.config_.mapBasicTileSequence_;
    }
};

Melown.Map.prototype.markDirty = function() {
    this.dirty_ = true;
    this.hitMapDirty_ = true;
};

Melown.Map.prototype.getHitCoords = function(screenX_, screenY_, mode_, lod_) {
    if (this.hitMapDirty_) {
        this.drawChannel_ = 1;
        this.renderer_.switchToFramebuffer("depth");
        this.processRenderSlots();    
        this.renderer_.switchToFramebuffer("base");
        this.drawChannel_ = 0;
    }

    var cameraSpaceCoords_ = this.renderer_.hitTest(screenX_, screenY_);
    
    if (!cameraSpaceCoords_[3]) {
        return null;
    }
    
    var cameraPos_ = this.cameraPosition_;
    var worldPos_ = [ cameraSpaceCoords_[0] + cameraPos_[0],
                      cameraSpaceCoords_[1] + cameraPos_[1],
                      cameraSpaceCoords_[2] + cameraPos_[2] ];

    var navCoords_ = this.convertCoords(worldPos_, "physical", "navigation");

    if (mode_ == "float") {
        var lod_ =  (lod_ != null) ? lod_ : this.getOptimalHeightLod(navCoords_, 100, this.config_.mapNavSamplesPerViewExtent_);
        var surfaceHeight_ = this.getSurfaceHeight(navCoords_, lod_);
        navCoords_[2] -= surfaceHeight_[0]; 
    }

    return navCoords_;
};

Melown.Map.prototype.drawMap = function() {
    if (this.drawChannel_ != 1) {
        this.renderer_.gpu_.setViewport();
    }

    this.visibleCredits_ = {
      imagery_ : [],
      mapdata_ : []
    };

    this.updateCamera();
    this.renderer_.dirty_ = true;
    this.renderer_.drawFog_ = this.drawFog_;

   
    this.renderer_.gpu_.clear(true, false);

    this.renderer_.gpu_.setState(this.drawTileState_);

    if (this.getNavigationSrs().isProjected()) {    
        this.renderer_.drawSkydome(this.renderer_.skydomeTexture_, this.renderer_.progSkydome_);
    } else {
        this.renderer_.drawSkydome(this.renderer_.blackTexture_, this.renderer_.progStardome_);
    }

    if (this.config_.mapLowresBackground_) {
        this.zFactor_ = 0.8;
        this.config_.mapTexelSizeFit_ = Number.POSITIVE_INFINITY;//500000000.1;
        this.config_.mapTexelSizeTolerance_ = Number.POSITIVE_INFINITY; //this.config_.mapTexelSizeFit_ * 2;
        this.draw();

        //this.zFactor_ = 0.9;
        //this.config_.mapTexelSizeFit_ = 10.1;
        //this.config_.mapTexelSizeTolerance_ = this.config_.mapTexelSizeFit_ * 2;
        //this.draw();
        this.config_.mapTexelSizeFit_ = 1.1;
        this.config_.mapTexelSizeTolerance_ = 2.2;
    }
    
    this.zFactor_ = 0;
    this.draw();

    if (!this.getNavigationSrs().isProjected()) {    

        //var camInfo_ = this.position_.getCameraInfo(true);
        //this.cameraPosition_;
        
        var atmoSize_ = 50000;
        //this.cameraHeight_;

        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();
        /*
        this.renderer_.drawBall([-this.cameraPosition_[0], -this.cameraPosition_[1], -this.cameraPosition_[2]],
                                  navigationSrsInfo_["a"] + atmoSize_, this.renderer_.progAtmo_, 1, navigationSrsInfo_["a"]);// this.cameraHeight_ > atmoSize_ ? 1 : -1);
                                  */
    }
};


Melown.Map.prototype.update = function() {
    if (this.killed_ == true) {
        return;
    }

    if (this.div_ != null && this.div_.style.visibility == "hidden"){
        //loop heartbeat
        //window.requestAnimFrame(this.update.bind(this));
        return;
    }

    if (this.position_.isDifferent(this.lastPosition_)) {
        this.core_.callListener("map-position-changed", {"position":this.position_.pos_.slice()});
    }

    this.lastPosition_ = this.position_.clone();

    var rect_ = this.renderer_.div_.getBoundingClientRect();

    if (this.renderer_.curSize_[0] != rect_.width || this.renderer_.curSize_[1] != rect_.height) {
        this.renderer_.onResize();
        this.dirty_ = true;
    }

    var dirty_ = this.dirty_;
    this.stats_.begin(dirty_);

    if (!this.loaderSuspended_) {
        this.loader_.update();
    }

    if (this.dirty_) {
        this.dirty_ = false;
        
        this.processRenderSlots();
        
        this.core_.callListener("map-update", {});

        //this.renderer_.gpu_.setState(this.drawTileState_);
        //this.renderer_.gpu_.gl_.disable(this.renderer_.gpu_.gl_.BLEND);
        //this.renderer_.drawImage(300, 0, 256, 256, this.renderer_.hitmapTexture_, null, null, null, false);
        //this.renderer_.drawImage(558, 0, 256, 256, this.renderer_.hitmapTexture_, null, null, null, false);

        //console.log("" + this.stats_.gpuRenderUsed_);
    }

    this.stats_.end(dirty_);
};

