/**
 * @constructor
 */
Melown.MapTexture = function(map_, path_, heightMap_, extraBound_, extraInfo_, tile_, internal_) {
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.tile_ = tile_; // used only for stats
    this.internal_ = internal_; // used only for stats
    
    if (tile_) {
        this.mainTexture_ = tile_.resources_.getSubtexture(this, path_, heightMap_, tile_, internal_); 
    } else {
        this.mainTexture_ = new Melown.MapSubtexture(map_, path_, heightMap_, tile_, internal_); 
    }

    this.maskTexture_ = null; 

    this.loadState_ = 0;
    this.loadErrorTime_ = null;
    this.loadErrorCounter_ = 0;
    this.neverReady_ = false;
    this.maskTexture_ = null;
    this.mapLoaderUrl_ = path_;
    this.heightMap_ = heightMap_ || false;
    this.extraBound_ = extraBound_;
    this.extraInfo_ = extraInfo_;
    this.statsCounter_ = 0;
    this.checkStatus_ = 0;
    this.checkType_ = null;
    this.checkValue_ = null;
    this.fastHeaderCheck_ = false;
    this.fileSize_ = 0;

    if (extraInfo_ && extraInfo_.layer_) {
        var layer_ = extraInfo_.layer_;
        
        if (layer_.availability_) {
            this.checkType_ = layer_.availability_.type_;
            switch (this.checkType_) {
                case "negative-type": this.checkValue_ = layer_.availability_.mime_; break;
                case "negative-code": this.checkValue_ = layer_.availability_.codes_; break;
                case "negative-size": this.checkValue_ = layer_.availability_.size_; break;
            }
        }       
    }
};

Melown.MapTexture.prototype.kill = function() {
    this.mainTexture_.killImage();
    this.mainTexture_.killGpuTexture();
    this.mainTexture_ = null;
    
    if (this.maskTexture_) {
        this.maskTexture_.killImage(); 
        this.maskTexture_.killGpuTexture(); 
    }
};

Melown.MapTexture.prototype.killImage = function(killedByCache_) {
    this.mainTexture_.killImage();

    if (this.maskTexture_) {
        this.maskTexture_.killImage(); 
    }
};

Melown.MapTexture.prototype.killGpuTexture = function(killedByCache_) {
    this.mainTexture_.killGpuTexture();

    if (this.maskTexture_) {
        this.maskTexture_.killGpuTexture(); 
    }
};

Melown.MapTexture.prototype.setBoundTexture = function(tile_, layer_) {
    if (tile_ && layer_) {
        this.extraBound_.sourceTile_ = tile_;
        this.extraBound_.layer_ = layer_;
        
        if (!tile_.boundTextures_[layer_.id_]) {
            tile_.boundLayers_[layer_.id_] = layer_;
            var path_ = layer_.getUrl(tile_.id_);
            tile_.boundTextures_[layer_.id_] = tile_.resources_.getTexture(path_, null, null, {tile_: tile_, layer_: layer_}, this.tile_, this.internal_);
        }

        this.extraBound_.texture_ = tile_.boundTextures_[layer_.id_]; 
        this.extraBound_.transform_ = this.map_.getTileTextureTransform(tile_, this.extraBound_.tile_);
        
        this.map_.markDirty();
    }
};

Melown.MapTexture.prototype.isReady = function(doNotLoad_, priority_, doNotCheckGpu_) {
    var doNotUseGpu_ = (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_);
    doNotLoad_ = doNotLoad_ || doNotUseGpu_;
    
    /*if (this.extraInfo_) {
        if (this.extraInfo_.tile_.id_[0] == Melown.debugId_[0] &&
            this.extraInfo_.tile_.id_[1] == Melown.debugId_[1] &&
            this.extraInfo_.tile_.id_[2] == Melown.debugId_[2]) {
                this.extraInfo_ = this.extraInfo_;
        }
    }*/
   
/*   
   if (this.mapLoaderUrl_ == "https://cdn.melown.com/mario/proxy//melown2015/tms/melown/mapycz-ophoto-cz/10-277-172.mask") {
       this.mapLoaderUrl_ = this.mapLoaderUrl_;
   }
*/
/*   
   if (this.mapLoaderUrl_ == "https://ecn.t3.tiles.virtualearth.net/tiles/a1202310323212333.jpeg?g=5549") {
       this.mapLoaderUrl_ = this.mapLoaderUrl_;
   }
*/
   if (this.mapLoaderUrl_ == "https://ecn.t1.tiles.virtualearth.net/tiles/a120231032333003.jpeg?g=5594" ||
       this.mapLoaderUrl_ == "https://ecn.t2.tiles.virtualearth.net/tiles/a120231032333003.jpeg?g=5594" ||
       this.mapLoaderUrl_ == "https://ecn.t3.tiles.virtualearth.net/tiles/a120231032333003.jpeg?g=5594" ||
       this.mapLoaderUrl_ == "https://ecn.t4.tiles.virtualearth.net/tiles/a120231032333003.jpeg?g=5594" ||
       this.mapLoaderUrl_ == "https://ecn.t5.tiles.virtualearth.net/tiles/a120231032333003.jpeg?g=5594") {
       this.mapLoaderUrl_ = this.mapLoaderUrl_;
   }

    if (this.neverReady_) {
        return false;
    }
   
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            while (this.extraBound_.texture_.extraBound_ || this.extraBound_.texture_.checkStatus_ == -1) {
//            while (this.extraBound_.texture_.checkStatus_ == -1) {
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

    /*
    if (!this.extraBound_ && this.extraInfo_ && !this.maskTexture_) {
        var layer_ = this.extraInfo_.layer_;
        
        if (layer_ && layer_.maskUrl_ && this.checkType_ != "metatile") {
            var path_ = layer_.getMaskUrl(this.tile_.id_);
            this.maskTexture_ = this.tile_.resources_.getTexture(path_, null, null, null, this.tile_, this.internal_);
        }
    }*/

    switch (this.checkType_) {
        case "metatile":

            if (this.checkStatus_ != 2) {
                if (this.checkStatus_ == 0) {
                    if (this.extraInfo_ && this.extraInfo_.tile_) {
                        var metaresources_ = this.extraInfo_.tile_.boundmetaresources_;
                        if (!metaresources_) {
							metaresources_ = this.map_.resourcesTree_.findAgregatedNode(this.extraInfo_.tile_.id_, 8);
                            this.extraInfo_.tile_.boundmetaresources_ = metaresources_;
                        }
                        
                        var layer_ = this.extraInfo_.layer_;
						var path_ = this.extraInfo_.metaPath_;
						
						if(!this.extraInfo_.metaPath_) {
							var path_ = layer_.getMetatileUrl(metaresources_.id_);	
							this.extraInfo_.metaPath_ = path_;
						}
						
                        var texture_ = metaresources_.getTexture(path_, true, null, null, this.tile_, this.internal_);
                        
                        if (this.maskTexture_) {
                            if (this.maskTexture_.isReady(doNotLoad_, priority_, doNotCheckGpu_, this)) {
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
                                        this.maskTexture_ = tile_.resources_.getTexture(path_, null, null, null, this.tile_, this.internal_);
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

                    while (this.extraBound_.texture_.extraBound_ || this.extraBound_.texture_.checkStatus_ == -1) {
                    //while (this.extraBound_.texture_.checkStatus_ == -1) {
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
    }

    var maskState_ = true;

    if (this.maskTexture_) {
        maskState_ = this.maskTexture_.isReady(doNotLoad_, priority_, doNotCheckGpu_, this);
    }
    
    return this.mainTexture_.isReady(doNotLoad_, priority_, doNotCheckGpu_, this) && maskState_;
};

Melown.MapTexture.prototype.getGpuTexture = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            return this.extraBound_.texture_.getGpuTexture();
        }
        return null;
    } 

    return this.mainTexture_.getGpuTexture();
};

Melown.MapTexture.prototype.getMaskTexture = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_) {
            return this.extraBound_.texture_.getMaskTexture();
        }
    } 

    return this.maskTexture_;
};

Melown.MapTexture.prototype.getGpuMaskTexture = function() {
    if (this.extraBound_) {
        if (this.extraBound_.texture_ && this.extraBound_.texture_.mask_) {
            return this.extraBound_.texture_.getGpuMaskTexture();
        }
        return null;
    } 

    if (this.maskTexture_) {
        return this.maskTexture_.getGpuTexture();
    }
    
    return null;
};

Melown.MapTexture.prototype.getImageData = function() {
    return this.mainTexture_.imageData_;
};

Melown.MapTexture.prototype.getImageExtents = function() {
    return this.mainTexture_.imageExtents_;
};

Melown.MapTexture.prototype.getHeightMapValue = function(x, y) {
    return this.mainTexture_.getHeightMapValue(x, y);
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

