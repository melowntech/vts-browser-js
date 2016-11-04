

Melown.Core.prototype.initConfig = function() {
    this.config_ = {
        map_ : null,
        mapCache_ : 900,
        mapGPUCache_ : 360,
        mapMetatileCache_ : 60,
        mapTexelSizeFit_ : 1.1,
        mapLowresBackground_ : 0,
        mapDownloadThreads_ : 20,
        mapMaxProcessingTime_ : 1000*20,
        mapMobileMode_ : false,
        mapMobileModeAutodect_ : true,
        mapMobileDetailDegradation_ : 2,
        mapNavSamplesPerViewExtent_ : 4,
        mapIgnoreNavtiles_ : false,
        mapAllowHires_ : true,
        mapAllowLowres_ : true,
        mapAllowSmartSwitching_ : true,
        mapDisableCulling_ : false,
        mapPreciseCulling_ : true,
        mapHeightLodBlend_ : true,
        mapHeightNodeBlend_ : true,
        mapBasicTileSequence_ : false,
        mapSmartNodeParsing_ : true,
        mapLoadErrorRetryTime_ : 3000,
        mapLoadErrorMaxRetryCount_ : 3,
        mapLoadMode_ : "topdown", //"downtop", "fit", "fitonly"
        mapGeodataLoadMode_ : "fit", //"fitonly"
        mapXhrImageLoad_ : false,
        mapStoreLoadStats_ : true,
        mapFog_ : false,
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

