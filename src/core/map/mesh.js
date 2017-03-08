/**
 * @constructor
 */
Melown.MapMesh = function(map_, url_, tile_) {
    this.generateLines_ = true;
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.mapLoaderUrl_  = url_;
    this.tile_ = tile_; // used only for stats

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.fileSize_ = 0;
    this.faces_ = 0;

    this.cacheItem_ = null;  //store killSubmeshes
    this.gpuCacheItem_ = null; //store killGpuSubmeshes

    this.loadState_ = 0;
    this.loadErrorTime_ = null;
    this.loadErrorCounter_ = 0;

    this.mBuffer_ = Melown.mat4.create();
    this.mBuffer2_ = Melown.mat4.create();

    this.submeshes_ = [];
    this.gpuSubmeshes_ = [];
    this.submeshesKilled_ = false;
};

Melown.MapMesh.prototype.kill = function() {
    this.bbox_ = null;
    this.killSubmeshes();
    this.killGpuSubmeshes();
};

Melown.MapMesh.prototype.killSubmeshes = function(killedByCache_) {
    for (var i = 0, li = this.submeshes_.length; i < li; i++) {
        this.submeshes_[i].kill();
    }
    //this.submeshes_ = [];
    this.submeshesKilled_ = true;

    if (killedByCache_ != true && this.cacheItem_) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        //this.tile_.validate();
    }

    if (this.gpuSubmeshes_.length == 0) {
        this.loadState_ = 0;
    }

    this.cacheItem_ = null;
};

Melown.MapMesh.prototype.killGpuSubmeshes = function(killedByCache_) {
    var size_ = 0;
    for (var i = 0, li = this.gpuSubmeshes_.length; i < li; i++) {
        this.gpuSubmeshes_[i].kill();
        size_ += this.gpuSubmeshes_[i].size_;
    }

    if (li > 0) {
        this.stats_.gpuMeshes_ -= size_;
        this.stats_.graphsFluxMesh_[1][0]++;
        this.stats_.graphsFluxMesh_[1][1] += size_;
    }

    this.gpuSubmeshes_ = [];

    if (killedByCache_ != true && this.gpuCacheItem_) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        //this.tile_.validate();
    }

    //console.log("kill: " + this.stats_.counter_ + "   " + this.mapLoaderUrl_);

//    if (this.submeshes_.length == 0) {
    if (this.submeshesKilled_) {
        this.loadState_ = 0;
    }

    this.gpuCacheItem_ = null;
};

Melown.MapMesh.prototype.isReady = function(doNotLoad_, priority_, doNotCheckGpu_) {
    var doNotUseGpu_ = (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_);
    doNotLoad_ = doNotLoad_ || doNotUseGpu_;
    
    //if (doNotUseGpu_) {
      //  doNotUseGpu_ = doNotUseGpu_;
    //}
    
    if (this.mapLoaderUrl_ == "https://cdn.melown.com/mario/proxy/melown2015/surface/melown/cz10/12-1107-688.bin?0") {
        this.mapLoaderUrl_ = this.mapLoaderUrl_;
    }    

    if (this.loadState_ == 2) { //loaded
        if (this.cacheItem_) {
            this.map_.resourcesCache_.updateItem(this.cacheItem_);
        }
        
        if (doNotCheckGpu_) {
            return true;
        }

        if (this.gpuSubmeshes_.length == 0) {
            if (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_) {
                return false;
            }

            if (this.stats_.renderBuild_ > this.map_.config_.mapMaxProcessingTime_) {
                this.map_.markDirty();
                return false;
            }

            if (doNotUseGpu_) {
                return false;
            }

            var t = performance.now();
            this.buildGpuSubmeshes();
            this.stats_.renderBuild_ += performance.now() - t; 
        }

        if (!doNotLoad_ && this.gpuCacheItem_) {
            this.map_.gpuCache_.updateItem(this.gpuCacheItem_);
        }
        return true;
    } else {
        if (this.loadState_ == 0) { 
            if (doNotLoad_) {
                //remove from queue
                //if (this.mapLoaderUrl_) {
                  //  this.map_.loader_.remove(this.mapLoaderUrl_);
                //}
            } else {
                //not loaded
                //add to loading queue or top position in queue
                this.scheduleLoad(priority_);
            }
        } else if (this.loadState_ == 3) { //loadError
            if (this.loadErrorCounter_ <= this.map_.config_.mapLoadErrorMaxRetryCount_ &&
                performance.now() > this.loadErrorTime_ + this.map_.config_.mapLoadErrorRetryTime_) {
    
                this.scheduleLoad(priority_);                    
            }
        } //else load in progress
    }

    return false;
};

Melown.MapMesh.prototype.scheduleLoad = function(priority_) {
    if (!this.mapLoaderUrl_) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.tile_.resourceSurface_.meshUrl_, {lod_:this.tile_.id_[0], ix_:this.tile_.id_[1], iy_:this.tile_.id_[2] });
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this), priority_, this.tile_, "mesh");
};

Melown.MapMesh.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadBinary(url_, this.onLoaded.bind(this), this.onLoadError.bind(this), (Melown["useCredentials"] ? (this.mapLoaderUrl_.indexOf(this.map_.baseUrl_) != -1) : false), this.map_.core_.xhrParams_);
    this.loadState_ = 1;
};

Melown.MapMesh.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.loadState_ = 3;
    this.loadErrorTime_ = performance.now();
    this.loadErrorCounter_ ++;
    
    //make sure we try to load it again
    if (this.loadErrorCounter_ <= this.map_.config_.mapLoadErrorMaxRetryCount_) { 
        setTimeout((function(){ if (!this.map_.killed_) { this.map_.markDirty(); } }).bind(this), this.map_.config_.mapLoadErrorRetryTime_);
    }    
    
    this.mapLoaderCallError_();
};

Melown.MapMesh.prototype.onLoaded = function(data_, task_) {
    if (this.map_.killed_ == true){
        return;
    }

    if (!task_) {
        //this.map_.stats_.renderBuild_ > this.map_.config_.mapMaxProcessingTime_) {
        this.map_.markDirty();
        this.map_.addProcessingTask(this.onLoaded.bind(this, data_, true));
        return;
    }

    this.fileSize_= data_.byteLength;

    var stream_ = {data_: new DataView(data_), buffer_:data_, index_:0};

    var t = performance.now();
    this.parseMapMesh(stream_);
    this.map_.stats_.renderBuild_ += performance.now() - t; 
    
    this.submeshesKilled_ = false;

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killSubmeshes.bind(this, true), this.size_);

    this.map_.markDirty();
    this.loadState_ = 2;
    this.loadErrorTime_ = null;
    this.loadErrorCounter_ = 0;
    this.mapLoaderCallLoaded_();
};

//! Returns RAM usage in bytes.
Melown.MapMesh.prototype.size = function () {
    return this.size_;
};

Melown.MapMesh.prototype.fileSize = function () {
    return this.fileSize_;
};

//! Returns RAM usage in bytes.
Melown.MapMesh.prototype.parseMapMesh = function (stream_) {
/*
    struct MapMesh {
        struct MapMeshHeader_ {
            char magic[2];                // letters "ME"
            ushort version;               // currently 1
            double meanUndulation;        // read more about undulation below
            ushort numSubmeshes;          // number of submeshes
        } header;
        struct Submesh submeshes [];      // array of submeshes, size of array is defined by numSubmeshes property
    };
*/
    this.killSubmeshes(); //just in case

    //parase header
    var streamData_ = stream_.data_;
    var magic_ = "";

    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;
    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;

    if (magic_ != "ME") {
        return false;
    }

    this.version_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (this.version_ > 3) {
        return false;
    }
    
    //if (this.version_ >= 3) {
        stream_.uint8Data_ = new Uint8Array(stream_.buffer_);
    //}

    this.meanUndulation_ = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    this.numSubmeshes_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    this.submeshes_ = [];

    for (var i = 0, li = this.numSubmeshes_; i < li; i++) {
        var submesh_ = new Melown.MapSubmesh(this, stream_);
        if (submesh_.valid_) {
            this.submeshes_.push(submesh_); 
            this.size_ += this.submeshes_[i].size_;
            this.faces_ += this.submeshes_[i].faces_;
        }
    }
    
    this.numSubmeshes_ = this.submeshes_.length;
};

Melown.MapMesh.prototype.addSubmesh = function(submesh_) {
    this.submeshes_.push(submesh_);
    this.size_ += submesh_.size_;
    this.faces_ += submesh_.faces_;
};

Melown.MapMesh.prototype.buildGpuSubmeshes = function() {
    var size_ = 0;
    this.gpuSubmeshes_ = new Array(this.submeshes_.length);

    for (var i = 0, li = this.submeshes_.length; i < li; i++) {
        this.gpuSubmeshes_[i] = this.submeshes_[i].buildGpuMesh();
        size_ += this.gpuSubmeshes_[i].size_;
    }

    this.stats_.gpuMeshes_ += size_;
    this.stats_.graphsFluxMesh_[0][0]++;
    this.stats_.graphsFluxMesh_[0][1] += size_;

    this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGpuSubmeshes.bind(this, true), size_);

    //console.log("build: " + this.stats_.counter_ + "   " + this.mapLoaderUrl_);
};

Melown.MapMesh.prototype.drawSubmesh = function (cameraPos_, index_, texture_, type_, alpha_) {
    if (this.gpuSubmeshes_[index_] == null && this.submeshes_[index_] != null && !this.submeshes_[index_].killed_) {
        this.gpuSubmeshes_[index_] = this.submeshes_[index_].buildGpuMesh();
    }

    var submesh_ = this.submeshes_[index_];
    var gpuSubmesh_ = this.gpuSubmeshes_[index_];

    if (!gpuSubmesh_) {
        return;
    }

    var renderer_ = this.map_.renderer_;
    var program_ = null;
    var gpuMask_ = null; 

    var texcoordsAttr_ = null;
    var texcoords2Attr_ = null;
    var drawWireframe_ = this.map_.drawWireframe_;
    var attributes_ = (drawWireframe_ != 0) ?  ["aPosition", "aBarycentric"] : ["aPosition"];

    if (type_ == "depth") {
        program_ = renderer_.progDepthTile_;
        //texcoordsAttr_ = "aTexCoord";
    } else if (type_ == "flat") {
        program_ = renderer_.progFlatShadeTile_;
    } else {
        if (drawWireframe_ > 0) {
            switch (drawWireframe_) {
                case 2: program_ = renderer_.progWireframeTile2_;  break;
                case 3: program_ = renderer_.progFlatShadeTile_;  break;
                case 1:
    
                    switch(type_) {
                        case "internal":
                        case "internal-nofog":
                            program_ = renderer_.progWireframeTile_;
                            texcoordsAttr_ = "aTexCoord";
                            attributes_.push("aTexCoord");
                            break;
    
                        case "external":
                        case "external-nofog":
                            program_ = renderer_.progWireframeTile3_;
                            texcoords2Attr_ = "aTexCoord2";
                            attributes_.push("aTexCoord2");
                            break;
    
                        case "fog":
                            return;
                    }
    
                break;
            }
        } else {
            switch(type_) {
                case "internal":
                case "internal-nofog":
                    program_ = renderer_.progTile_;
                    texcoordsAttr_ = "aTexCoord";
                    attributes_.push("aTexCoord");
                    break;
    
                case "external":
                case "external-nofog":
                    program_ = renderer_.progTile2_;
                    
                    if (texture_) {
                        gpuMask_ = texture_.getGpuMaskTexture();
                        if (gpuMask_) {
                            program_ = renderer_.progTile3_;
                        }
                    } 
                    
                    texcoords2Attr_ = "aTexCoord2";
                    attributes_.push("aTexCoord2");
                    break;
    
                case "fog":
                    program_ = renderer_.progFogTile_;
                    break;
            }
        }
    }

    renderer_.gpu_.useProgram(program_, attributes_, gpuMask_);

    if (texture_) {
        var gpuTexture_ = texture_.getGpuTexture();
        
        if (gpuTexture_) {
            if (texture_.statsCoutner_ != this.stats_.counter_) {
                texture_.statsCoutner_ = this.stats_.counter_;
                this.stats_.gpuRenderUsed_ += gpuTexture_.size_;
            }
            
            renderer_.gpu_.bindTexture(gpuTexture_);

            if (gpuMask_) {
                renderer_.gpu_.bindTexture(gpuMask_, 1);
            }
            
        } else {
            return;
        }
    } else if (type_ != "fog" && type_ != "depth" && type_ != "flat") {
        return;
    }

    var mv_ = this.mBuffer_;
    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), submesh_.getWorldMatrix(cameraPos_, this.mBuffer2_), mv_);
    var proj_ = renderer_.camera_.getProjectionMatrix();

    program_.setMat4("uMV", mv_);
    program_.setMat4("uProj", proj_);

    if (drawWireframe_ == 0) {
        switch(type_) {
            case "internal":
            case "fog":
                //program_.setFloat("uFogDensity", this.map_.fogDensity_);
                program_.setVec4("uParams", [this.map_.zFactor_, this.map_.fogDensity_, 0, 0]);
                break;

            case "internal-nofog":
                //program_.setFloat("uFogDensity", 0);
                program_.setVec4("uParams", [this.map_.zFactor_, 0, 0, 0]);
                break;

            case "external":
                program_.setFloat("uAlpha", 1);
                //program_.setFloat("uFogDensity", this.map_.fogDensity_);
                program_.setVec4("uParams", [this.map_.zFactor_, this.map_.fogDensity_, 0, 0]);
                program_.setVec4("uTransform", texture_.getTransform());
                break;

            case "external-nofog":
                program_.setFloat("uAlpha", alpha_);
                //program_.setFloat("uFogDensity", 0);
                program_.setVec4("uParams", [this.map_.zFactor_, 0, 0, 0]);
                program_.setVec4("uTransform", texture_.getTransform());
                break;
        }
    }

    if (submesh_.statsCoutner_ != this.stats_.counter_) {
        submesh_.statsCoutner_ = this.stats_.counter_;
        this.stats_.gpuRenderUsed_ += gpuSubmesh_.size_;
    } //else {
        //this.stats_.gpuRenderUsed_ ++;
    //}

    //this.map_.renderer_.gpu_.gl_.polygonOffset(-1.0, this.map_.zShift_);
    //this.map_.renderer_.gpu_.gl_.enable(this.map_.renderer_.gpu_.gl_.POLYGON_OFFSET_FILL);

    gpuSubmesh_.draw(program_, "aPosition", texcoordsAttr_, texcoords2Attr_, drawWireframe_ != 0 ? "aBarycentric" : null);

    //this.map_.renderer_.gpu_.gl_.disable(this.map_.renderer_.gpu_.gl_.POLYGON_OFFSET_FILL);

    this.stats_.drawnFaces_ += this.faces_;
    this.stats_.drawCalls_ ++;
};


