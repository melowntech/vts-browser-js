

Melown.Core.prototype.initConfig = function() {
    this.config_ = {
        map_ : null,
        mapCache_ : 900,
        mapGPUCache_ : 360,
        mapMetatileCache_ : 60,
        mapTexelSizeFit_ : 1.1,
        mapMaxHiresLodLevels_ : 2,
        mapLowresBackground_ : 0,
        mapDownloadThreads_ : 20,
        mapMaxProcessingTime_ : 1000*20,
        mapMobileMode_ : false,
        mapMobileModeAutodect_ : true,
        mapMobileDetailDegradation_ : 1,
        mapNavSamplesPerViewExtent_ : 4,
        mapIgnoreNavtiles_ : false,
        mapVirtualSurfaces_ : true,
        mapAllowHires_ : true,
        mapAllowLowres_ : true,
        mapAllowSmartSwitching_ : true,
        mapDisableCulling_ : false,
        mapPreciseCulling_ : true,
        mapHeightLodBlend_ : true,
        mapHeightNodeBlend_ : true,
        mapBasicTileSequence_ : false,
        mapPreciseBBoxTest_ : false,
        mapPreciseDistanceTest_ : false,
        mapHeightfiledWhenUnloaded_ : true,
        mapFastHeightfiled_ : true,
        mapSmartNodeParsing_ : true,
        mapLoadErrorRetryTime_ : 3000,
        mapLoadErrorMaxRetryCount_ : 3,
        mapLoadMode_ : "topdown", // "topdown", "downtop", "fit", "fitonly"
        mapGeodataLoadMode_ : "fit", //"fitonly"
        mapXhrImageLoad_ : false,
        mapStoreLoadStats_ : true,
        mapFog_ : true,
        rendererAntialiasing_ : true,
        rendererAllowScreenshots_ : false,
        authorization_ : null, 
        mario_ : false
    };
};

Melown.Core.prototype.setConfigParams = function(params_, onlyMapRelated_) {
    if (typeof params_ === "object" && params_ !== null) {
        for (var key_ in params_) {
            this.setConfigParam(key_, params_[key_]);
        }
    }
};

Melown.Core.prototype.setConfigParam = function(key_, value_) {
    if (key_ == "pos" || key_ == "position" || key_ == "view") {
        if (this.getMap()) {
            if (key_ == "view") {
                this.getMap().setView(value_);
            } else {
                this.getMap().setPosition(new Melown.MapPosition(this, value_));
            }
            if (this.configStorage_[key_]) {
                delete this.configStorage_[key_];
            }
        } else {
            this.configStorage_[key_] = value_;
        }
    } else if (key_ == "map") {
        this.config_.map_ = Melown.validateString(value_, null);
    } else if (key_ == "mapVirtualSurfaces") {
        this.config_.mapVirtualSurfaces_ = Melown.validateBool(value_, true);
    } else if (key_ == "authorization") {
        this.config_.authorization_ = ((typeof value_ === "string") || (typeof value_ === "function")) ? value_ : null;   
    } else {
        if (key_.indexOf("map") == 0 || key_ == "mario") {
            this.configStorage_[key_] = value_;
            if (this.getMap() != null) {
                this.getMap().setConfigParam(key_, value_);
            }
        }

        if (key_.indexOf("renderer") == 0) {
            this.setRendererConfigParam(key_, value_);
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
            return this.getRendererConfigParam(key_);
        }
    }
};

Melown.Core.prototype.setRendererConfigParam = function(key_, value_) {
    switch (key_) {
        case "rendererAntialiasing":       this.config_.rendererAntialiasing_ = Melown.validateBool(value_, true); break;
        case "rendererAllowScreenshots":   this.config_.rendererAllowScreenshots_ = Melown.validateBool(value_, false); break;
    }
};

Melown.Core.prototype.getRendererConfigParam = function(key_) {
    switch (key_) {
        case "rendererAntialiasing":       return this.config_.rendererAntialiasing_;
        case "rendererAllowScreenshots":   return this.config_.rendererAllowScreenshots_;
    }
};

