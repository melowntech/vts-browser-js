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
    this.neverReady_ = false;
    this.mask_ = null;
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
                case "negative-code": this.checkValue_ = layer_.availability_.codes_; break;
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
    
    if (this.mask_) {
        this.mask_.killImage(); 
        this.mask_.killGpuTexture(); 
    }
    
    //this.tile_.validate();
};

Melown.MapTexture.prototype.killImage = function(killedByCache_) {
    this.image_ = null;
    this.imageData_ = null;

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        //this.tile_.validate();
    }

    if (this.mask_) {
        this.mask_.killImage(); 
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

        if (this.mask_) {
            this.mask_.killGpuTexture(); 
        }
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
        
        this.map_.markDirty();
    }
};

Melown.MapTexture.prototype.isReady = function(doNotLoad_, priority_, doNotCheckGpu_) {
    var doNotUseGpu_ = (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_);
    doNotLoad_ = doNotLoad_ || doNotUseGpu_;
    
    if (this.extraInfo_) {
        if (this.extraInfo_.tile_.id_[0] == Melown.debugId_[0] &&
            this.extraInfo_.tile_.id_[1] == Melown.debugId_[1] &&
            this.extraInfo_.tile_.id_[2] == Melown.debugId_[2]) {
                this.extraInfo_ = this.extraInfo_;
        }
    }
   
   if (this.neverReady_) {
       return false;
   }
   
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            while (this.extraBound_.texture_.checkStatus_ == -1) {
                var parent_ = this.extraBound_.sourceTile_.parent_;
                if (parent_.id_[0] < this.extraBound_.layer_.lodRange_[0]) {
                    this.neverReady_ = true;
                    this.extraBound_.tile_.resetDrawCommands_ = true;
                    this.map_.markDirty();
                    return false;
                }
 
                this.setBoundTexture(parent_, this.extraBound_.layer_);
            }
            
            var ready_ = this.extraBound_.texture_.isReady(doNotLoad_, priority_, doNotCheckGpu_);
            
            if (ready_ && this.checkMask_) {
                this.extraBound_.tile_.resetDrawCommands_ = (this.extraBound_.texture_.getMaskTexture() != null);
                this.checkMask_ = false;
            }

            return ready_;
            
        } else {
            this.setBoundTexture(this.extraBound_.sourceTile_, this.extraBound_.layer_);        
        }
        
        return false;
    }

    switch (this.checkType_) {
        case "metatile":

            if (this.checkStatus_ != 2) {
                if (this.checkStatus_ == 0) {
                    if (this.extraInfo_ && this.extraInfo_.tile_) {
                        var metastorage_ = this.extraInfo_.tile_.boundMetastorage_;
                        if (!metastorage_) {
                            metastorage_ = Melown.FindMetastorage(this.map_, this.map_.tree_.metastorageTree_,
                                                                  this.map_.tree_.rootId_, this.extraInfo_.tile_, 8);
                            this.extraInfo_.tile_.boundMetastorage_ = metastorage_;
                        }
                        
                        var layer_ = this.extraInfo_.layer_;
                        var texture_ = metastorage_.metatiles_[layer_.id_];
                        
                        if (!metastorage_.metatiles_[layer_.id_]) {
                            var path_ = layer_.getMetatileUrl(metastorage_.id_);
                            texture_ = new Melown.MapTexture(this.map_, path_, true, null, null);
                            metastorage_.metatiles_[layer_.id_] = texture_;
                        }
                        
                        if (this.mask_) {
                            if (this.mask_.isReady(doNotLoad_, priority_, doNotCheckGpu_)) {
                                this.checkStatus_ = 2;
                            }
                        } else {
                            if (texture_.isReady(doNotLoad_, priority_, doNotCheckGpu_)) {
                                var tile_ = this.extraInfo_.tile_;
                                var value_ = texture_.getHeightMapValue(tile_.id_[1] & 255, tile_.id_[2] & 255);
                                this.checkStatus_ = (value_ & 128) ? 2 : -1;
                                
                                
                                if (this.checkStatus_ == 2) {
                                    if (!(value_ & 64)) { //load mask
                                        var path_ = layer_.getMaskUrl(tile_.id_);
                                        this.mask_ = new Melown.MapTexture(this.map_, path_, null, null, null);
                                        this.checkStatus_ = 0;
                                        tile_.resetDrawCommands_ = true;
                                        this.map_.markDirty();
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (this.checkStatus_ == -1) {
                    if (!this.extraBound_) {
                        var parent_ = this.extraInfo_.tile_.parent_;
                        if (parent_.id_[0] < this.extraInfo_.layer_.lodRange_[0]) {
                            this.neverReady_ = true;
                            this.extraInfo_.tile_.resetDrawCommands_ = true;
                            this.map_.markDirty();
                            return false;
                        }

                        this.extraBound_ = { tile_: this.extraInfo_.tile_, layer_: this.extraInfo_.layer_};
                        this.setBoundTexture(this.extraBound_.tile_.parent_, this.extraBound_.layer_);
                        this.checkMask_ = true;
                    }
    
                    while (this.extraBound_.texture_.checkStatus_ == -1) {
                        var parent_ = this.extraBound_.sourceTile_.parent_;
                        if (parent_.id_[0] < this.extraBound_.layer_.lodRange_[0]) {
                            this.neverReady_ = true;
                            this.extraBound_.tile_.resetDrawCommands_ = true;
                            this.map_.markDirty();
                            return false;
                        }
                        
                        this.setBoundTexture(parent_, this.extraBound_.layer_);        
                    }
                }

                return false;
            }
        
            break;

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
        if (!doNotLoad_) {
            this.map_.resourcesCache_.updateItem(this.cacheItem_);
        }

        if (doNotCheckGpu_) {
            if (this.heightMap_) {
                if (this.imageData_ == null) {
                    this.buildHeightMap();
                }
            }

            if (this.mask_) {
                return this.mask_.isReady(doNotLoad_, priority_, doNotCheckGpu_);
            }
        
            return true;
        }

        if (this.heightMap_) {
            if (this.imageData_ == null) {
                this.buildHeightMap();
            }
        } else {
            if (this.gpuTexture_ == null) {
                if (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_) {
                    return false;
                }

                if (this.stats_.renderBuild_ > this.map_.config_.mapMaxProcessingTime_) {
                    //console.log("testure resource build overflow");
                    this.map_.markDirty();
                    return false;
                }
                
                if (doNotUseGpu_) {
                    return false;
                }

                //if (this.stats_.graphsFluxTexture_ [0][0] > 2) {
                   // return false;
                //}

                var t = performance.now();
                this.buildGpuTexture();
                this.stats_.renderBuild_ += performance.now() - t; 
            }

            if (!doNotLoad_) {
                this.map_.gpuCache_.updateItem(this.gpuCacheItem_);
            }
        }
        
        if (this.mask_) {
            return this.mask_.isReady(doNotLoad_, priority_, doNotCheckGpu_);
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
    this.image_ = Melown.Http.imageFactory(url_, onload_, onerror_, (Melown["useCredentials"] ? (this.mapLoaderUrl_.indexOf(this.map_.baseURL_) != -1) : false));

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
            
        case "negative-code":
            if (status_) {
                if (this.checkValue_.indexOf(status_) != -1) {
                    this.checkStatus_ = -1;
                }
            }
            break;
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

Melown.MapTexture.prototype.getMaskTexture = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            return this.extraBound_.texture_.mask_;
        }
    } 

    return this.mask_;
};

Melown.MapTexture.prototype.getGpuMaskTexture = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_ && this.extraBound_.texture_.mask_) {
            return this.extraBound_.texture_.mask_.gpuTexture_;
        }
        return null;
    } 

    if (this.mask_) {
        return this.mask_.gpuTexture_;
    }
    
    return null;
};

Melown.MapTexture.prototype.getHeightMapValue = function(x, y) {
    if (this.imageData_) {
        return this.imageData_[(y * this.imageExtents_[0] + x)*4];
    }
    
    return 0;
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

