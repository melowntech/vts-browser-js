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
    this.planeBuffer_ = new Float32Array(9*3);

    path_ = path_.trim();
    this.baseUrl_ = Melown.Url.getBase(path_);
    this.baseUrlSchema_ = Melown.Url.getSchema(path_);
    this.baseUrlOrigin_ = Melown.Url.getOrigin(path_); 

    this.position_ = new Melown.MapPosition(this, ["obj", 0, 0, "fix", 0,  0, 0, 0,  0, 0]);
    this.lastPosition_ = this.position_.clone();

    this.srses_ = {};
    this.referenceFrame_ = {};
    this.credits_ = {};
    this.creditsByNumber_ = {};
    this.surfaces_ = [];
    this.virtualSurfaces_ = {};
    this.glues_ = {};
    this.freeLayers_ = [];
    this.boundLayers_ = [];
    this.dynamicLayers_ = [];
    this.stylesheets_ = [];
    this.processingTasks_ = [];
    this.tileBuffer_ = new Array(500);
    this.geodataProcessors_ = [];

    this.initialView_ = null;
    this.currentView_ = new Melown.MapView(this, {});
    this.currentViewString_ = "";
    this.namedViews_ = [];
    this.drawCounter_ = 0;
    this.viewCounter_ = 0;
    this.drawChannel_ = 0;
    this.drawChannelNames_ = ["base", "hit"];

    this.freeLayerSequence_ = [];
    this.freeLayersHaveGeodata_ = false;

    this.visibleCredits_ = {
      imagery_ : {},
      glueImagery_ : {},
      mapdata_ : {}
    };
    
    this.mobile_ = false;
   
    this.gpuCache_ = new Melown.MapCache(this, this.config_.mapGPUCache_*1024*1024);
    this.resourcesCache_ = new Melown.MapCache(this, this.config_.mapCache_*1024*1024);
    this.metatileCache_ = new Melown.MapCache(this, this.config_.mapMetatileCache_*1024*1024);

    this.setupMobileMode(this.config_.mapMobileMode_);
    this.setupCache();

    this.loader_ = new Melown.MapLoader(this, this.config_.mapDownloadThreads_);

    this.renderer_ = this.core_.renderer_;//new Melown.Renderer(this.core_, this.core_.div_);
    this.camera_ = this.renderer_.camera_;
    this.cameraDistance_ = 10;
    this.cameraDistance2_ = 10;
    this.cameraPosition_ = [0,0,0];
    this.cameraVector_ = [0,0,1];
    this.cameraCenter_ = [0,0,0];
    this.cameraHeight_ = 0;
    this.cameraTerrainHeight_ = 0;
    this.lastCameraTerrainHeight_ = 0;

    this.stats_ = new Melown.MapStats(this);
    this.resourcesTree_ = new Melown.MapResourceTree(this);
    
    //this.resourcesTree_.findNode([21,565992,360945], true);
    //this.resourcesTree_.findNode([21,565993,360945], true);
    //debugger
    
    this.replay_ = {
        camera_ : null,
        drawnTiles_ : null,
        drawnFreeTiles_ : null,
        nodeBuffer_ : null,
        tracedNodes_ : null,
        tracedFreeNodes_ : null,
        storeTiles_ : false,
        storeFreeTiles_ : false,
        storeNodes_ : false,
        storeFreeNodes_ : false,
        storeLoaded_ : this.config_.mapStoreLoadStats_,
        drawGlobe_ : false,
        drawTiles_ : false,
        drawNodes_ : false,
        drawFreeTiles_ : false,
        drawFreeNodes_ : false,
        drawLoaded_ : false,
        lod_ : 30,
        singleLod_ : false,
        loadedIndex_ : 0,
        singleLodedIndex_ : 0,
        loadedIndex_ : 0,
        loaded_ : [],
        loadFirst_ : 0,
        loadLast_ : 0
    };
    

    this.parseConfig();

    this.geocent_ = !this.getNavigationSrs().isProjected();
    this.planetRadius_ = this.geocent_ ? this.getNavigationSrs().getSrsInfo()["a"] : 100;
    this.processBuffer_ = new Array(60000);
    this.processBuffer2_ = new Array(60000);
    this.drawBuffer_ = new Array(60000);
    this.tmpVec3_ = new Array(3);
    this.tmpVec5_ = new Array(5);

    this.maxDivisionNodeDepth_ = this.getMaxSpatialDivisionNodeDepth();

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
    this.drawEarth_ = true;    
    this.drawTileCounter_ = 0;

    this.ignoreTexelSize_ = false;
    this.drawFog_ = this.config_.mapFog_;
    this.debugTextSize_ = 2.0;
    this.fogDensity_ = 0;
    this.zFactor_ = 0;
    //this.zFactor2_ = 0.000012;
    this.zFactor2_ = 0.003;
    this.zShift_ = 0;
    this.zLastShift_ = 0;
    this.bestMeshTexelSize_ = 1;
    this.bestGeodataTexelSize_ = 1;
    this.log8_ = Math.log(8);
    this.log2_ = Math.log(2);

    this.drawTileState_ = this.renderer_.gpu_.createState({});
    this.drawStardomeState_ = this.renderer_.gpu_.createState({zwrite_:false, ztest_:false});
    this.drawBlendedTileState_ = this.renderer_.gpu_.createState({zequal_:true, blend_:true});
    this.drawAuraState_ = this.renderer_.gpu_.createState({zwrite_:false, blend_:true});
    this.drawAtmoState_ = this.renderer_.gpu_.createState({zwrite_:false, ztest_:false, blend_:true});
    this.drawAtmoState2_ = this.renderer_.gpu_.createState({zwrite_:false, ztest_:true, blend_:false});
//    this.drawAuraState_ = this.renderer_.gpu_.createState({zwrite_:false, ztest_:false, blend_:true});
    
    this.setupDetailDegradation();

    this.renderSlots_ = [];
    
    this.addRenderSlot("map", this.drawMap.bind(this), true);
};

Melown.Map.prototype.kill = function() {
    this.killed_ = true;
    
    this.tree_.kill();

    for (var key_ in this.freeLayers_) {
        this.getFreeLayer(key_).tree_.kill();
    }

    this.gpuCache_.clear();
    this.resourcesCache_.clear();
    this.metatileCache_.clear();

    if (this.renderer_ != null) {
        this.renderer_.kill();
        this.renderer_ = null;
    }
};

Melown.Map.prototype.setupMobileMode = function() {
    this.mobile_ = this.config_.mapMobileMode_;

    if (!this.mobile_ && this.config_.mapMobileModeAutodect_) {
        this.mobile_ = Melown.Platform.isMobile();        
    }

    this.setupCache();
};

Melown.Map.prototype.setupCache = function() {
    var factor_ = 1 / (this.mobile_ ? Math.pow(2, Math.max(0,this.config_.mapMobileDetailDegradation_-1)) : 1);
    var factor2_ = 1 / (this.mobile_ ? Math.pow(2, this.config_.mapMobileDetailDegradation_) : 1);
    factor_ = (factor_ + factor2_) * 0.5;
    this.resourcesCache_.setMaxCost(this.config_.mapCache_*1024*1024*factor_);
    this.gpuCache_.setMaxCost(this.config_.mapGPUCache_*1024*1024*factor_);
    this.metatileCache_.setMaxCost(this.config_.mapMetatileCache_*1024*1024*(factor_ < 0.8 ? 0.5 : 1));
};

Melown.Map.prototype.setupDetailDegradation = function(degradeMore_) {
    var factor_ = 0;
    
    if (this.mobile_) {
        factor_ = this.config_.mapMobileDetailDegradation_;
    }

    if (degradeMore_) {
        factor_ += degradeMore_;        
    }

    this.texelSizeFit_ = this.config_.mapTexelSizeFit_ * Math.pow(2,factor_);      
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
    var glueImagery_ = this.visibleCredits_.glueImagery_;
    var imageryArray_ = []; 
    var imagerySpecificity_ = []; 

    for (var key_ in glueImagery_) {
        if (!imagery_[key_]) {
            imagery_[key_] = glueImagery_[key_];
        }
    }
    
    this.visibleCredits_.glueImagery_ = {};
    
    for (var key_ in imagery_) {
        imageryArray_.push(key_);
        imagerySpecificity_.push(imagery_[key_]); 
    }

    //sort imagery
    do {
        var sorted_ = true;
        
        for (var i = 0, li = imagerySpecificity_.length - 1; i < li; i++) {
            if (imagerySpecificity_[i] < imagerySpecificity_[i+1]) {
                var t = imagerySpecificity_[i];
                imagerySpecificity_[i] = imagerySpecificity_[i+1];
                imagerySpecificity_[i+1] = t;
                t = imageryArray_[i];
                imageryArray_[i] = imageryArray_[i+1];
                imageryArray_[i+1] = t;
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);

    var mapdata_ = this.visibleCredits_.mapdata_;
    var mapdataArray_ = []; 
    var mapdataSpecificity_ = []; 

    for (var key_ in mapdata_) {
        mapdataArray_.push(key_);
        mapdataSpecificity_.push(mapdata_[key_]); 
    }
    
    //sort imagery
    do {
        var sorted_ = true;
        
        for (var i = 0, li = mapdataSpecificity_.length - 1; i < li; i++) {
            if (mapdataSpecificity_[i] < mapdataSpecificity_[i+1]) {
                var t = mapdataSpecificity_[i];
                mapdataSpecificity_[i] = mapdataSpecificity_[i+1];
                mapdataSpecificity_[i+1] = t;
                t = mapdataArray_[i];
                mapdataArray_[i] = mapdataArray_[i+1];
                mapdataArray_[i+1] = t;
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);

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
    return this.glues_[id_];
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
    return this.freeLayers_[id_];
    //return this.searchArrayById(this.freeLayers_, id_);
};

Melown.Map.prototype.getFreeLayers = function() {
    var keys_ = [];
    for (var key_ in this.freeLayers_) {
        keys_.push(key_);
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
        view_ = view_.trim();
        
        if (view_.charAt(0) == "{") {
            try {
                view_ = JSON.parse(view_);
            } catch(e){
                return;            
            }
        } else {
            view_ = this.getNamedView(view_);

            if (!view_) {
                return;
            }
            
            //view_ = JSON.parse(JSON.stringify(view_));
            view_ = view_.getInfo();
        }
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
            
            if (freeLayers_[key_]["style"]) {
                freeLayer_.setStyle(freeLayers_[key_]["style"]);
            } else {
                freeLayer_.setStyle(freeLayer_.originalStyle_);
            }
            
            //TODO: generate bound layer seqence for      
        }
    }

    this.markDirty();
};

Melown.Map.prototype.addStylesheet = function(id_, style_) {
    this.stylesheets_[id_] = style_;
};

Melown.Map.prototype.getStylesheet = function(id_) {
    return this.stylesheets_[id_];
    //return this.searchArrayById(this.stylesheets_, id_);
};

Melown.Map.prototype.getStylesheets = function() {
    var keys_ = [];

    for (var key_ in this.stylesheets_) {
        keys_.push(key_);
    }
    return keys_;
};

Melown.Map.prototype.getStylesheetData = function(id_, data_) {
    var stylesheet_ = this.getStylesheet(id_);

    if (stylesheet_) {
        return {"url":stylesheet_.url_, "data": stylesheet_.data_};
    }
    
    return {"url":null, "data":{}};
};

Melown.Map.prototype.setStylesheetData = function(id_, data_) {
    var stylesheet_ = this.getStylesheet(id_);
    
    if (stylesheet_) {
        stylesheet_.data_ = data_;
    }

    if (stylesheet_) {
        stylesheet_.setData(data_);

        for (var key_ in this.freeLayers_) {
            var freeLayer_ = this.getFreeLayer(key_);
            if (freeLayer_ && freeLayer_.geodata_ && freeLayer_.stylesheet_ == stylesheet_) {
                
                if (freeLayer_.geodataProcessor_) {
                    freeLayer_.geodataProcessor_.sendCommand("setStylesheet", { "data" : freeLayer_.stylesheet_.data_, "geocent" : (!this.getNavigationSrs().isProjected()) });
                }

                freeLayer_.geodataCounter_++;
            }
        }
    }

    this.markDirty();
        
    //TODO: reset geodatview in free layers
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

Melown.Map.prototype.processUrl = function(url_, fallback_) {
    if (!url_) {
        return fallback_;
    }
    
    url_ = url_.trim();

    if (url_.indexOf("://") != -1) { //absolute
        return url_;
    } else if (url_.indexOf("//") == 0) {  //absolute without schema
        return this.baseUrlSchema_ + url_;
    } else if (url_.indexOf("/") == 0) {  //absolute without host
        return this.baseUrlOrigin_ + url_;
    } else {  //relative
        return this.baseUrl_ + url_; 
    }
};

Melown.Map.prototype.setConfigParam = function(key_, value_) {
    switch (key_) {
        case "map":                           this.config_.map_ = Melown.validateString(value_, null); break;
        case "mapCache":                      this.config_.mapCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 900); this.setupCache(); break;
        case "mapGPUCache":                   this.config_.mapGPUCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 360); this.setupCache(); break;
        case "mapMetatileCache":              this.config_.mapMetatileCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 60); this.setupCache(); break;
        case "mapTexelSizeFit":               this.config_.mapTexelSizeFit_ = Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 1.1); break;
        case "mapLowresBackground":           this.config_.mapLowresBackground_ = Melown.validateNumber(value_, 0, Number.MAX_INTEGER, 0); break;
        case "mapDownloadThreads":            this.config_.mapDownloadThreads_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 6); break;
        case "mapMaxProcessingTime":          this.config_.mapMaxProcessingTime_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 1000/20); break;
        case "mapMobileMode":                 this.config_.mapMobileMode_ = Melown.validateBool(value_, false); this.setupMobileMode(); break;
        case "mapMobileModeAutodect":         this.config_.mapMobileModeAutodect_ = Melown.validateBool(value_, false); break;
        case "mapMobileDetailDegradation":    this.config_.mapMobileDetailDegradation_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 2); break;
        case "mapNavSamplesPerViewExtent":    this.config_.mapNavSamplesPerViewExtent_ = Melown.validateNumber(value_, 0.00000000001, Number.MAX_INTEGER, 4); break;
        case "mapFog":                        this.config_.mapFog_ = Melown.validateBool(value_, false); break;
        case "mapIgnoreNavtiles":             this.config_.mapIgnoreNavtiles_ = Melown.validateBool(value_, false); break;
        case "mapAllowHires":                 this.config_.mapAllowHires_ = Melown.validateBool(value_, true); break;
        case "mapAllowLowres":                this.config_.mapAllowLowres_ = Melown.validateBool(value_, true); break;
        case "mapAllowSmartSwitching":        this.config_.mapAllowSmartSwitching_ = Melown.validateBool(value_, true); break;
        case "mapDisableCulling":             this.config_.mapDisableCulling_ = Melown.validateBool(value_, false); break;
        case "mapPreciseCulling":             this.config_.mapPreciseCulling_ = Melown.validateBool(value_, false); break;
        case "mapHeightLodBlend":             this.config_.mapHeightLodBlend_ = Melown.validateBool(value_, true); break;
        case "mapHeightNodeBlend":            this.config_.mapHeightNodeBlend_ = Melown.validateBool(value_, true); break;
        case "mapBasicTileSequence":          this.config_.mapBasicTileSequence_ = Melown.validateBool(value_, true); break;
        case "mapSmartNodeParsing":           this.config_.mapSmartNodeParsing_ = Melown.validateBool(value_, true); break;
        case "mapStoreLoadStats":             this.config_.mapStoreLoadStats_ = Melown.validateBool(value_, true);  this.replay_.storeLoaded_ = this.config_.mapStoreLoadStats_; break;
        case "mapXhrImageLoad":               this.config_.mapXhrImageLoad_ = Melown.validateBool(value_, false); break;
        case "mapLoadMode":                   this.config_.mapLoadMode_ = Melown.validateString(value_, "topdown"); break;
        case "mapGeodataLoadMode":            this.config_.mapGeodataLoadMode_ = Melown.validateString(value_, "fit"); break;
        case "mapPreciseBBoxTest":            this.config_.mapPreciseBBoxTest_ = Melown.validateBool(value_, true); break;
        case "mapPreciseDistanceTest":        this.config_.mapPreciseDistanceTest_ = Melown.validateBool(value_, false); break;
        case "mapHeightfiledWhenUnloaded":    this.config_.mapHeightfiledWhenUnloaded_= Melown.validateBool(value_, false); break;
        case "mapForceMetatileV3":            this.config_.mapForceMetatileV3_= Melown.validateBool(value_, false); break;
        case "mapVirtualSurfaces":            this.config_.mapVirtualSurfaces_ = Melown.validateBool(value_, true); break;
        case "mario":                         this.config_.mario_ = Melown.validateBool(value_, true); break;
    }
};

Melown.Map.prototype.getConfigParam = function(key_) {
    switch (key_) {
        case "map":                           return this.config_.map_;
        case "mapCache":                      return this.config_.mapCache_;
        case "mapGPUCache":                   return this.config_.mapGPUCache_;
        case "mapMetatileCache":              return this.config_.mapMetatileCache_;
        case "mapTexelSizeFit":               return this.config_.mapTexelSizeFit_;
        case "mapLowresBackground":           return this.config_.mapLowresBackground_;
        case "mapDownloadThreads":            return this.config_.mapDownloadThreads_;
        case "mapMaxProcessingTime":          return this.config_.mapMaxProcessingTime_;
        case "mapMobileMode":                 return this.config_.mapMobileMode_;
        case "mapMobileModeAutodect":         return this.config_.mapMobileModeAutodect_;
        case "mapMobileDetailDegradation":    return this.config_.mapMobileDetailDegradation_;
        case "mapNavSamplesPerViewExtent":    return this.config_.mapNavSamplesPerViewExtent_;
        case "mapFog":                        return this.config_.mapFog_;
        case "mapIgnoreNavtiles":             return this.config_.mapIgnoreNavtiles_;
        case "mapAllowHires":                 return this.config_.mapAllowHires_;
        case "mapAllowLowres":                return this.config_.mapAllowLowres_;
        case "mapAllowSmartSwitching":        return this.config_.mapAllowSmartSwitching_;
        case "mapDisableCulling":             return this.config_.mapDisableCulling_;
        case "mapPreciseCulling":             return this.config_.mapPreciseCulling_;
        case "mapHeightLodBlend":             return this.config_.mapHeightLodBlend_;
        case "mapHeightNodeBlend":            return this.config_.mapHeightNodeBlend_;
        case "mapBasicTileSequence":          return this.config_.mapBasicTileSequence_;
        case "mapSmartNodeParsing":           return this.config_.mapSmartNodeParsing_;
        case "mapStoreLoadStats":             return this.config_.mapStoreLoadStats_;
        case "mapXhrImageLoad":               return this.config_.mapXhrImageLoad_;
        case "mapLoadMode":                   return this.config_.mapLoadMode_;
        case "mapGeodataLoadMode":            return this.config_.mapGeodataLoadMode_;
        case "mapPreciseBBoxTest":            return this.config_.mapPreciseBBoxTest_;
        case "mapPreciseDistanceTest":        return this.config_.mapPreciseDistanceTest_;
        case "mapHeightfiledWhenUnloaded":    return this.config_.mapHeightfiledWhenUnloaded_;
        case "mapForceMetatileV3":            return this.config_.mapForceMetatileV3_;
        case "mapVirtualSurfaces":            return this.config_.mapVirtualSurfaces_;
        case "mario":                         return this.config_.mario_;
    }
};

Melown.Map.prototype.markDirty = function() {
    this.dirty_ = true;
    this.hitMapDirty_ = true;
};

Melown.Map.prototype.getScreenRay = function(screenX_, screenY_) {
    return this.renderer_.getScreenRay(screenX_, screenY_);
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
    
    var fallbackUsed_ = false; 
    var cameraPos_ = this.cameraPosition_;
    var worldPos_;

    var ray_ = cameraSpaceCoords_[4];

    if (this.getNavigationSrs().isProjected()) { //plane fallback
        var planePos_ = [0,0,Math.min(-1000,this.referenceFrame_.getGlobalHeightRange()[0])];
        var planeNormal_ = [0,0,1];

        var d = Melown["Math"]["vec3Dot"](planeNormal_, ray_); //minification is wrong there
        //if (d > 1e-6) {
            var a = [planePos_[0] - cameraPos_[0], planePos_[1] - cameraPos_[1], planePos_[2] - cameraPos_[2]];
            t = Melown["Math"]["vec3Dot"](a, planeNormal_) / d;
            
            //var t = (Melown.Math.vec3Dot(cameraPos_, planeNormal_) + (-500)) / d;            
            if (t >= 0) {
                if (!cameraSpaceCoords_[3] || t < cameraSpaceCoords_[5]) {
                    worldPos_ = [ (ray_[0] * t) + cameraPos_[0],
                                  (ray_[1] * t) + cameraPos_[1],
                                  (ray_[2] * t) + cameraPos_[2] ];
    
                    fallbackUsed_ = true;
                }
            }
        //}

    } else /*if (false)*/ { //elipsoid fallback
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();
        var planetRadius_ = navigationSrsInfo_["b"] + this.referenceFrame_.getGlobalHeightRange()[0];
    
        var offset_ = [cameraPos_[0], cameraPos_[1], cameraPos_[2]];
        var a = Melown["Math"]["vec3Dot"](ray_, ray_); //minification is wrong there
        var b = 2 * Melown["Math"]["vec3Dot"](ray_, offset_);
        var c = Melown["Math"]["vec3Dot"](offset_, offset_) - planetRadius_ * planetRadius_;
        var d = b * b - 4 * a * c;
        
        if (d > 0) {
            d = Math.sqrt(d);
            var t1 = (-b - d) / (2*a);
            var t2 = (-b + d) / (2*a);
            var t = (t1 < t2) ? t1 : t2;
            
            if (!cameraSpaceCoords_[3] || t < cameraSpaceCoords_[5]) {
                worldPos_ = [ (ray_[0] * t) + cameraPos_[0],
                              (ray_[1] * t) + cameraPos_[1],
                              (ray_[2] * t) + cameraPos_[2] ];

                fallbackUsed_ = true;
            }
        }   
    }
    
    if (!cameraSpaceCoords_[3] && !fallbackUsed_) {
        return null;
    }
    
    if (!fallbackUsed_) {
        worldPos_ = [ cameraSpaceCoords_[0] + cameraPos_[0],
                      cameraSpaceCoords_[1] + cameraPos_[1],
                      cameraSpaceCoords_[2] + cameraPos_[2] ];
    }

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
      imagery_ : {},
      glueImagery_ : {},
      mapdata_ : {}
    };

    var projected_ = this.getNavigationSrs().isProjected();

    if (!projected_) {
        //why calling this function distorts camera? why I have call it before update camera< 
        //var camInfo_ = this.position_.getCameraInfo(this.getNavigationSrs().isProjected(), true); //
    }

    var camInfo_ = this.updateCamera();
    this.renderer_.dirty_ = true;
    this.renderer_.drawFog_ = this.drawFog_;

    this.renderer_.cameraPosition_ = this.cameraPosition_;
    this.renderer_.cameraOrientation_ = this.position_.getOrientation();
    this.renderer_.cameraTiltFator_ = Math.cos(Melown.radians(this.renderer_.cameraOrientation_[1]));
    this.renderer_.cameraVector_ = this.cameraVector_; 

    if (projected_) {
        var yaw_ = Melown.radians(this.renderer_.cameraOrientation_[0]);
        this.renderer_.labelVector_ = [-Math.sin(yaw_), Math.cos(yaw_), 0, 0, 0];
    } else {
        var v = camInfo_.vector_;
        this.renderer_.labelVector_ = [v[0], v[1], v[2], 0]; 

        this.cameraGeocentDistance_ = Melown.vec3.length(this.cameraPosition_);

        var n = [0,0,0];
        Melown.vec3.normalize(this.cameraPosition_, n);
        this.cameraGeocentNormal_ = n;
    }

    this.renderer_.distanceFactor_ = 1 / Math.max(1,Math.log(this.cameraDistance_) / Math.log(1.04));
    this.renderer_.tiltFactor_ = (Math.abs(this.renderer_.cameraOrientation_[1]/-90));
   
    if (this.drawChannel_ != 1) {
        this.renderer_.gpu_.clear(true, false);
        //this.renderer_.gpu_.clear(true, true, [0,0,0,255]);
    } else { //dender depth map
        this.renderer_.gpu_.clear(true, true, [255,255,255,255]);
    }

    this.renderer_.gpu_.setState(this.drawStardomeState_);

    if (this.drawChannel_ != 1) {
        //if (this.getNavigationSrs().isProjected()) {    
            //this.renderer_.drawSkydome(this.renderer_.skydomeTexture_, this.renderer_.progSkydome_);
        //} else {
            
        if (this.config_.mapLowresBackground_ < 0.8) {
            if (this.drawWireframe_ == 2) {
                this.renderer_.drawSkydome(this.renderer_.whiteTexture_, this.renderer_.progStardome_);
            } else {
                this.renderer_.drawSkydome(this.renderer_.blackTexture_, this.renderer_.progStardome_);
            }
        }
        
        //}
    }

    this.renderer_.gpu_.setState(this.drawTileState_);

    this.setupDetailDegradation();

    this.loader_.setChannel(0); //0 = hires channel
    this.zFactor_ = 0;
    //if (this.drawEarth_) {
        this.draw(null, projected_, camInfo_);
    //}
};


Melown.Map.prototype.processProcessingTasks = function() {
    while (this.processingTasks_.length > 0) {
        if (this.stats_.renderBuild_ > this.config_.mapMaxProcessingTime_) {
            this.markDirty();
            return;
        }

        this.processingTasks_[0]();
        this.processingTasks_.shift();
    }
};

Melown.Map.prototype.addProcessingTask = function(task_) {
    this.processingTasks_.push(task_);
};

Melown.Map.prototype.update = function() {
    if (this.killed_ == true) {
        return;
    }

    if (this.core_.tokenExpiration_) {
        if (Date.now() > (this.core_.tokenExpiration_ - (1000*60))) {
            this.core_.tokenExpirationCallback_();
        }
    }

    if (this.div_ != null && this.div_.style.visibility == "hidden"){
        //loop heartbeat
        //window.requestAnimFrame(this.update.bind(this));
        return;
    }

    if (this.position_.isDifferent(this.lastPosition_)) {
        this.core_.callListener("map-position-changed", {"position":this.position_.pos_.slice(), "last-position":this.lastPosition_.pos_.slice()});
    }

    if (this.lastCameraTerrainHeight_ != this.cameraTerrainHeight_) {
        this.core_.callListener("map-position-fixed-height-changed", {"height":this.cameraTerrainHeight_, "last-height":this.lastCameraTerrainHeight_});
    }

    this.lastPosition_ = this.position_.clone();
    this.lastCameraTerrainHeight_ = this.cameraTerrainHeight_;
    this.drawFog_ = this.config_.mapFog_;

    var rect_ = this.renderer_.div_.getBoundingClientRect();

    if (this.renderer_.curSize_[0] != rect_.width || this.renderer_.curSize_[1] != rect_.height) {
        this.renderer_.onResize();
        this.dirty_ = true;
    }

    var dirty_ = this.dirty_;
    this.stats_.begin(dirty_);

    this.loader_.update();

    this.processProcessingTasks();

    if (this.dirty_) {
        this.dirty_ = false;
        this.bestMeshTexelSize_ = 0;//Number.MAX_VALUE;
        this.bestGeodataTexelSize_ = 0;//Number.MAX_VALUE;
        
        this.processRenderSlots();

        this.loader_.update();
        
        this.core_.callListener("map-update", {});

        //this.renderer_.gpu_.setState(this.drawTileState_);
        //this.renderer_.gpu_.gl_.disable(this.renderer_.gpu_.gl_.BLEND);
        //this.renderer_.drawImage(300, 0, 256, 256, this.renderer_.hitmapTexture_, null, null, null, false);
        //this.renderer_.drawImage(558, 0, 256, 256, this.renderer_.hitmapTexture_, null, null, null, false);

        //console.log("" + this.stats_.gpuRenderUsed_);
    }

    this.stats_.end(dirty_);
};

