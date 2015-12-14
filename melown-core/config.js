

Melown.Core.prototype.initConfig = function() {
    this.config_ = {
        map_ : null,
        mapCache_ : 900,
        mapGPUCache_ : 360,
        mapMetatileCache_ : 60,
        mapTexelSizeFit_ : 1.1,
        mapTexelSizeTolerance_ : 2.2,
        mapDownloadThreads_ : 6,
        mapMaxProcessedMeshes_ : 1,
        mapMaxProcessedTextures_ : 1,
        mapMaxProcessedMetatiles_ : 2,
        mapMobileMode_ : false,
        mapMobileTexelDegradation_ : 2,
        mapNavSamplesPerViewExtent_ : 4,
        rendererAntialiasing_ : true,
        rendererAllowScreenshots_ : false
    };
};

Melown.Core.prototype.setConfigParams = function(params_) {
    if (typeof params_ === "object" && params_ !== null) {
        for (var key_ in params_) {
            this.setConfigParam(key_, params_[key_]);
        }
    }
};

Melown.Core.prototype.setConfigParam = function(key_, value_) {
    if (key_ == "map") {
        this.config_.map_ = Melown.validateString(value_, null);
    } else {
        if (key_.indexOf("map") == 0 && this.getMap() != null) {
            this.getMap().setConfigParam(key_, value_);
        }

        if (key_.indexOf("renderer") == 0) {
            this.getRenderer().setConfigParam(key_, value_);
        }
    }
};

Melown.Core.prototype.getConfigParam = function(key_) {
    if (key_ == "map") {
        return this.config_.map_;
    } else {
        if (key_.indexOf("map") == 0 && this.getMap() != null) {
            return this.getMap().getConfigParam(key_, value_);
        }

        if (key_.indexOf("renderer") == 0) {
            return this.getRenderer().getConfigParam(key_, value_);
        }
    }
};


//========================================================================
// OLD STUFF
//========================================================================

/**
 * @constructor
 */
Melown.CoreConfig = function(json_) {
    this.cacheSize_ = (1024*1024*1024);
    this.gpuCacheSize_ = (420*1024*1024);
    this.numThreads_ = 4;

    this.cameraFOV_ = 45.0;
    //this.cameraVisibility_ = 40000.0;
    this.cameraVisibility_ = 1200000.0;
    this.cameraMinDistance_ = 180.0; //seznam 180
    this.cameraMaxDistance_ = this.cameraVisibility_;
    this.cameraMinTilt_ = -90.0;

    this.heightLod_ = 14;

    if (SEZNAMCZ != true) {
        this.cameraMaxTilt_ = 90.0; //seznam -10
        this.cameraConstrainMode_ = "aboveTerrainByPixelSize";
        //this.cameraConstrainMode_ = "aboveTerrainByGSD";
    } else {
        this.cameraMaxTilt_ =  -10;
        this.cameraConstrainMode_ = "aboveTerrainOnly";
    }

    //this.cameraConstrainDistance_ = this.cameraMinDistance_ / 5.0;
    this.cameraConstrainDistance_ = this.cameraMinDistance_ * 0.5;

    this.gridEmbeddingFactor_ = 8;
    this.gridMinTileSize_ = 32.0;

    this.hitTextureSize_ = 1024;
    this.skydomeTexture_ = "./skydome.jpg";

    if (window["MelownScreenScaleFactor_"] < 0.8) {
        this.hitTextureSize_ = 512;
        this.skydomeTexture_ = "./skydome-small.jpg";
    }

    this.controlInertia_ = [0.80, 0.80, 0.80];
    this.controlMode_ = "observer";

    this.map_ = null;

    if (json_ != null) {
        this.map_ = json_["map"];

        if (json_["cacheSize"] != null)     this.cacheSize_ = json_["cacheSize"];
        if (json_["gpuCacheSize"] != null)  this.gpuCacheSize_ = json_["gpuCacheSize"];
        if (json_["numThreads"] != null)    this.numThreads_ = json_["numThreads"];

        if (json_["cameraFOV"] != null)               this.cameraFOV_ = json_["cameraFOV"];
        if (json_["cameraVisibility"] != null)        this.cameraVisibility_ = json_["cameraVisibility"];
        if (json_["cameraMinDistance"] != null)       this.cameraMinDistance_ = json_["cameraMinDistance"];
        if (json_["cameraMaxDistance"] != null)       this.cameraMaxDistance_ = json_["cameraMaxDistance"];
        if (json_["cameraMinTilt"] != null)           this.cameraMinTilt_ = json_["cameraMinTilt"];
        if (json_["cameraMaxTilt"] != null)           this.cameraMaxTilt_ = json_["cameraMaxTilt"];
        if (json_["cameraConstrainMode"] != null)     this.cameraConstrainMode_ = json_["cameraConstrainMode"], this.cameraConstrainDistance_ = this.cameraMinDistance_ / 5.0;

        if (json_["gridEmbeddingFactor"] != null) this.gridEmbeddingFactor_ = json_["gridEmbeddingFactor"];
        if (json_["gridMinTileSize"] != null)     this.gridMinTileSize_ = json_["gridMinTileSize"];

        if (json_["skydomeTexture"] != null)      this.skydomeTexture_ = json_["skydomeTexture"];
        if (json_["hitTextureSize"] != null)      this.hitTextureSize_ = json_["hitTextureSize"];

        if (json_["heightLod"] != null)           this.heightLod_ = json_["heightLod"];
        if (json_["controlMode"] != null)         this.controlMode_ = json_["controlMode"];
        if (json_["controlInertia"] != null) {
            for (var i = 0; i < 3; i++) {
                this.controlInertia_[i] = json_["controlInertia"][i];
            }
        }
    }
};

Melown.CoreConfig.prototype.clone = function() {
    var json_ = {};
    json_["cacheSize"] =            this.cacheSize_;
    json_["gpuCacheSize"] =         this.gpuCacheSize_;
    json_["numThreads"] =           this.numThreads_;
    json_["cameraFOV"] =            this.cameraFOV_;
    json_["cameraVisibility"] =     this.cameraVisibility_;
    json_["cameraMinDistance"] =    this.cameraMinDistance_;
    json_["cameraMaxDistance"] =    this.cameraMaxDistance_;
    json_["cameraMinTilt"] =        this.cameraMinTilt_;
    json_["cameraMaxTilt"] =        this.cameraMaxTilt_;
    json_["cameraConstrainMode"] =  this.cameraConstrainMode_;
    json_["gridEmbeddingFactor"] =  this.gridEmbeddingFactor_;
    json_["gridMinTileSize"] =      this.gridMinTileSize_;
    json_["skydomeTexture"] =       this.skydomeTexture_;
    json_["hitTextureSize"] =       this.hitTextureSize_;
    json_["heightLod"] =            this.heightLod_;
    json_["controlMode"] =          this.controlMode_;
    json_["controlInertia"] =       [this.controlInertia_[0], this.controlInertia_[1], this.controlInertia_[2]];
    return json_;
};




