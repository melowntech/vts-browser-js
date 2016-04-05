Melown.debugId_ = [14, 8880, 5492];

/**
 * @constructor
 */
Melown.MapTexture = function(map_, path_, heightMap_, extraBound_, extraInfo_) {
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.image_ = null;
    this.imageData_ = null;
    this.imageExtents_ = null;
    this.gpuTexture_ = null;
    this.loadState_ = 0;
    this.mapLoaderUrl_ = path_;
    this.heightMap_ = heightMap_ || false;
    this.extraBound_ = extraBound_;
    this.extraInfo_ = extraInfo_;
    this.statsCounter_ = 0;
    this.checkStatus_ = 0;
    this.checkType_ = null;
    this.checkValue_ = null;

    if (extraInfo_ && extraInfo_.layer_) {
        var layer_ = extraInfo_.layer_;
        
        if (layer_.availability_) {
            this.checkType_ = layer_.availability_.type_;
            switch (this.checkType_) {
                case "negative-type": this.checkValue_ = layer_.availability_.mime_; break;
                //case "negative-code": this.checkValue_ = layer_.availability_.codes_; break;
            }
        }       
    }

    this.cacheItem_ = null; //store killImage
    this.gpuCacheItem_ = null; //store killGpuTexture
    
    //if (path_ == "http://t0.tiles.virtualearth.net/tiles/a12021212330200.jpeg?g=854&mkt=en-US&token=Ahu6LJpWaKRj0Fzngk4d58AQFI9jKLsnvovS3ReEVcfOf6rBDCxiLDq-ycxakgOi") {
        //path_ = path_;
    //}    
};

Melown.MapTexture.prototype.kill = function() {
    this.texture_ = null;
    this.killImage();
    this.killGpuTexture();
    //this.tile_.validate();
};

Melown.MapTexture.prototype.killImage = function(killedByCache_) {
    this.image_ = null;
    this.imageData_ = null;

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        //this.tile_.validate();
    }

    this.loadState_ = 0;
    this.cacheItem_ = null;
};

Melown.MapTexture.prototype.killGpuTexture = function(killedByCache_) {
    if (this.gpuTexture_ != null) {
        this.stats_.gpuTextures_ -= this.gpuTexture_.size_;
        this.gpuTexture_.kill();

        this.stats_.graphsFluxTexture_[1][0]++;
        this.stats_.graphsFluxTexture_[1][1] += this.gpuTexture_.size_;
    }

    this.gpuTexture_ = null;

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        //this.tile_.validate();
    }

    this.gpuCacheItem_ = null;
};

Melown.MapTexture.prototype.setBoundTexture = function(tile_, layer_) {
    if (tile_ && layer_) {
        this.extraBound_.sourceTile_ = tile_;
        this.extraBound_.layer_ = layer_;
        
        if (!tile_.boundTextures_[layer_.id_]) {
            tile_.boundLayers_[layer_.id_] = layer_;
            var path_ = layer_.getUrl(tile_.id_);
            tile_.boundTextures_[layer_.id_] = new Melown.MapTexture(this.map_, path_, null, null, {tile_: tile_, layer_: layer_});
        }

        this.extraBound_.texture_ = tile_.boundTextures_[layer_.id_]; 
        this.extraBound_.transform_ = this.map_.getTileTextureTransform(tile_, this.extraBound_.tile_);
        
        this.map_.dirty_ = true;
    }
};

Melown.MapTexture.prototype.isReady = function(doNotLoad_, priority_) {
    /*
    if (this.extraInfo_) {
        if (this.extraInfo_.tile_.id_[0] == Melown.debugId_[0] &&
            this.extraInfo_.tile_.id_[1] == Melown.debugId_[1] &&
            this.extraInfo_.tile_.id_[2] == Melown.debugId_[2]) {
                this.extraInfo_ = this.extraInfo_;
        }
    }*/

    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            while (this.extraBound_.texture_.checkStatus_ == -1) {
                this.setBoundTexture(this.extraBound_.sourceTile_.parent_, this.extraBound_.layer_);        
            }

            return this.extraBound_.texture_.isReady(doNotLoad_, priority_);
        } else {
            this.setBoundTexture(this.extraBound_.sourceTile_, this.extraBound_.layer_);        
        }
        
        return false;
    }

    switch (this.checkType_) {
        case "negative-type":
        case "negative-code":
        
            if (this.checkStatus_ != 2) {
                if (this.checkStatus_ == 0) {
                    this.scheduleHeadRequest(priority_);
                } else if (this.checkStatus_ == -1) {
            
                    if (this.extraInfo_) {
                        /*
                        if (this.extraInfo_.tile_.id_[0] == Melown.debugId_[0] &&
                            this.extraInfo_.tile_.id_[1] == Melown.debugId_[1] &&
                            this.extraInfo_.tile_.id_[2] == Melown.debugId_[2]) {
                                this.extraInfo_ = this.extraInfo_;
                        }*/
    
                        if (!this.extraBound_) {
                            this.extraBound_ = { tile_: this.extraInfo_.tile_, layer_: this.extraInfo_.layer_};
                            this.setBoundTexture(this.extraBound_.tile_.parent_, this.extraBound_.layer_);        
                        }
        
                        while (this.extraBound_.texture_.checkStatus_ == -1) {
                            this.setBoundTexture(this.extraBound_.sourceTile_.parent_, this.extraBound_.layer_);        
                        }
                    }
                }
    
                return false;
            }
            
            break;
    }

    if (this.loadState_ == 2) { //loaded
        this.map_.resourcesCache_.updateItem(this.cacheItem_);

        if (this.heightMap_) {
            if (this.imageData_ == null) {
                this.buildHeightMap();
            }
        } else {
            if (this.gpuTexture_ == null) {
                if (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_) {
                    return false;
                }

                if (this.stats_.renderBuild_ > 1000 / 20) {
                    //console.log("testure resource build overflow");
                    return false;
                }

                //if (this.stats_.graphsFluxTexture_ [0][0] > 2) {
                   // return false;
                //}

                var t = performance.now();
                this.buildGpuTexture();
                this.stats_.renderBuild_ += performance.now() - t; 
            }

            this.map_.gpuCache_.updateItem(this.gpuCacheItem_);
        }
        return true;
    } else {
        if (this.loadState_ == 0) { 
            if (doNotLoad_) {
                //remove from queue
                //if (this.mapLoaderUrl_) {
                    //this.map_.loader_.remove(this.mapLoaderUrl_);
                //}
            } else {
                //not loaded
                //add to loading queue or top position in queue
                this.scheduleLoad(priority_);
            }
        } //else load in progress
    }

    return false;
};

Melown.MapTexture.prototype.scheduleLoad = function(priority_) {
    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this), priority_);
};

Melown.MapTexture.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    var onerror_ = this.onLoadError.bind(this);
    var onload_ = this.onLoaded.bind(this);
    this.image_ = Melown.Http.imageFactory(url_, onload_, onerror_);

    this.loadState_ = 1;
};

Melown.MapTexture.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapTexture.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    //if (this.mapLoaderUrl_ == "http://t4.tiles.virtualearth.net/tiles/a120212123213310.jpeg?g=854&mkt=en-US&token=Ahu6LJpWaKRj0Fzngk4d58AQFI9jKLsnvovS3ReEVcfOf6rBDCxiLDq-ycxakgOi") {
      //  this.checkStatus_ = this.checkStatus_;
    //}

    var size_ = this.image_.naturalWidth * this.image_.naturalHeight * (this.heightMap_ ? 3 : 3);

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killImage.bind(this, true), size_);

    this.loadState_ = 2;
    this.mapLoaderCallLoaded_();
};

Melown.MapTexture.prototype.scheduleHeadRequest = function(priority_) {
    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoadHead.bind(this), priority_);
};

//Melown.onlyOneHead_ = false;

Melown.MapTexture.prototype.onLoadHead = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    var onerror_ = this.onLoadHeadError.bind(this);
    var onload_ = this.onHeadLoaded.bind(this);

    this.checkStatus_ = 1;
/*
    if (!Melown.onlyOneHead_) {
        Melown.onlyOneHead_ = true;        
    } else {
        return;
    }

    //url_ = "http://m2.mapserver.mapy.cz/ophoto0203-m/20-568396-351581";
*/
    Melown.Http.headRequest(url_, onload_, onerror_);
};

Melown.MapTexture.prototype.onLoadHeadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
};

Melown.MapTexture.prototype.onHeadLoaded = function(data_, status_) {
    if (this.map_.killed_ == true){
        return;
    }

    this.checkStatus_ = 2;

    //if (this.mapLoaderUrl_ == "http://t4.tiles.virtualearth.net/tiles/a120212123213310.jpeg?g=854&mkt=en-US&token=Ahu6LJpWaKRj0Fzngk4d58AQFI9jKLsnvovS3ReEVcfOf6rBDCxiLDq-ycxakgOi") {
        //this.checkStatus_ = this.checkStatus_;
    //}

    /*
    if (this.extraInfo_) {
        if (this.extraInfo_.tile_.id_[0] == Melown.debugId_[0] &&
            this.extraInfo_.tile_.id_[1] == Melown.debugId_[1] &&
            this.extraInfo_.tile_.id_[2] == Melown.debugId_[2]) {
                this.extraInfo_ = this.extraInfo_;
        }
    }*/
    
    switch (this.checkType_) {
        case "negative-type":
            if (data_) {
                if (data_.indexOf(this.checkValue_) != -1) {
                    this.checkStatus_ = -1;
                }
            }
            break;
/*            
        case "negative-code":
            if (status_) {
                if (this.checkValue_.indexOf(status_) != -1) {
                    this.checkStatus_ = -1;
                }
            }
            break;*/
    }

    this.mapLoaderCallLoaded_();
};


Melown.MapTexture.prototype.buildGpuTexture = function () {
    this.gpuTexture_ = new Melown.GpuTexture(this.map_.renderer_.gpu_, null, this.map_.core_);
    this.gpuTexture_.createFromImage(this.image_, "linear", false);
    this.stats_.gpuTextures_ += this.gpuTexture_.size_;

    this.stats_.graphsFluxTexture_[0][0]++;
    this.stats_.graphsFluxTexture_[0][1] += this.gpuTexture_.size_;

    this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGpuTexture.bind(this, true), this.gpuTexture_.size_);
};

Melown.MapTexture.prototype.buildHeightMap = function () {
    var canvas_ = document.createElement("canvas");
    canvas_.width = this.image_.naturalWidth;
    canvas_.height = this.image_.naturalHeight;
    var ctx_ = canvas_.getContext("2d");
    ctx_.drawImage(this.image_, 0, 0);
    this.imageData_ = ctx_.getImageData(0, 0, this.image_.naturalWidth, this.image_.naturalHeight).data;
    this.imageExtents_ = [this.image_.naturalWidth, this.image_.naturalHeight];
    this.image_ = null;
};

Melown.MapTexture.prototype.getGpuTexture = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            return this.extraBound_.texture_.gpuTexture_;
        }
        return null;
    } 

    return this.gpuTexture_;
};

Melown.MapTexture.prototype.getTransform = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            return this.extraBound_.transform_;
        }
        return null;
    } 

    return [1,1,0,0];
};

