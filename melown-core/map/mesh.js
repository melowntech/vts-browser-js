/**
 * @constructor
 */
Melown.MapMesh = function(map_, url_) {
    this.generateLines_ = true;
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.mapLoaderUrl_  = url_;

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.fileSize_ = 0;
    this.faces_ = 0;

    this.cacheItem_ = null;  //store killSubmeshes
    this.gpuCacheItem_ = null; //store killGpuSubmeshes

    this.loadState_ = 0;

    this.submeshes_ = [];
    this.gpuSubmeshes_ = [];
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
    this.submeshes_ = [];

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        this.tile_.validate();
    }

    this.loadState_ = 0;
    this.cacheItem_ = null;
};

Melown.MapMesh.prototype.killGpuSubmeshes = function(killedByCache_) {
    for (var i = 0, li = this.gpuSubmeshes_.length; i < li; i++) {
        this.stats_.gpuMeshesUsed_ -= this.gpuSubmeshes_[i].size_;
        this.gpuSubmeshes_[i].kill();
    }

    this.gpuSubmeshes_ = [];

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        this.tile_.validate();
    }

    this.gpuCacheItem_ = null;
};

Melown.MapMesh.prototype.isReady = function () {
    if (this.loadState_ == 2) { //loaded

        if (this.gpuSubmeshes_.length == 0) {
            this.buildGpuSubmeshes();
        }

        this.map_.resourcesCache_.updateItem(this.cacheItem_);
        this.map_.gpuCache_.updateItem(this.gpuCacheItem_);

        return true;
    } else {
        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress
    }

    return false;
};

Melown.MapMesh.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.tile_.surface_.meshUrl_, {lod_:this.tile_.id_[0], ix_:this.tile_.id_[1], iy_:this.tile_.id_[2] });
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
};

Melown.MapMesh.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadBinary(url_, this.onLoaded.bind(this), this.onLoadError.bind(this));
    this.loadState_ = 1;
};

Melown.MapMesh.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapMesh.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    this.fileSize_= data_.byteLength;

    var stream_ = {data_:data_, index_:0};
    this.parseMapMesh(stream_);

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killSubmeshes.bind(this, true), this.size_);

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
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

    this.parseMeshHeader(stream_);

    this.submeshes_ = new Array(this.numSubmeshes_);

    for (var i = 0, li = this.numSubmeshes_; i < li; i++) {
        this.submeshes_[i] = new Melown.MapSubmesh(this, stream_);
        this.size_ += this.submeshes_[i].size_;
        this.faces_ += this.submeshes_[i].faces_;
    }

};

Melown.MapMesh.prototype.parseMeshHeader = function (stream_) {
    var streamData_ = stream_.data_;
    var magic_ = "";

    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;
    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;

    if (magic_ != "ME") {
        return;
    }

    var version_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (version_ > 1) {
        return;
    }

    this.meanUndulation_ = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    this.numSubmeshes_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
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

    this.stats_.gpuMeshesUsed_ += size_;

    this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGpuSubmeshes.bind(this, true), size_);
};

Melown.MapMesh.prototype.drawSubmesh = function (cameraPos_, index_, texture_, type_, alpha_) {
    if (this.gpuSubmeshes_[index_] == null && this.submeshes_[index_] != null) {
        this.gpuSubmeshes_[index_] = this.submeshes_[index_].buildGpuMesh();
    }

    var submesh_ = this.submeshes_[index_];
    var gpuSubmesh_ = this.gpuSubmeshes_[index_];

    if (gpuSubmesh_ == null) {
        return;
    }
/*
    if (renderer_.onlyDepth_ == true) {
        program_ = this.progDepthTile_; //for hit test use different program
    } else {
        switch (renderer_.drawWireframe_) {
            case 0:
            default: program_ = renderer_.progTile_; break;
            case 1: program_ = renderer_.progWireframeTile_; break;
            case 2: program_ = renderer_.progWireframeTile2_; break;
            case 3: program_ = renderer_.progFlatShadeTile_; break;
        }
    }
*/

    var renderer_ = this.map_.renderer_;
    var program_ = null;

    var texcoordsAttr_ = null;
    var texcoords2Attr_ = null;
    var drawWireframe_ = this.map_.drawWireframe_;

    if (drawWireframe_ > 0) {
        switch (drawWireframe_) {
            case 2: program_ = renderer_.progWireframeTile2_;  break;
            case 3: program_ = renderer_.progFlatShadeTile_;  break;
            case 1:

                switch(type_) {
                    case "internal":
                        program_ = renderer_.progWireframeTile_;
                        texcoordsAttr_ = "aTexCoord";
                        break;

                    case "external":
                    case "external-nofog":
                        program_ = renderer_.progWireframeTile3_;
                        texcoords2Attr_ = "aTexCoord2";
                        break;

                    case "fog":
                        return;
                }

            break;
        }
    } else {
        switch(type_) {
            case "internal":
                program_ = renderer_.progTile_;
                texcoordsAttr_ = "aTexCoord";
                break;

            case "external":
            case "external-nofog":
                program_ = renderer_.progTile2_;
                texcoords2Attr_ = "aTexCoord2";
                break;

            case "fog":
                program_ = renderer_.progFogTile_;
                break;
        }
    }

    renderer_.gpu_.useProgram(program_, "aPosition", texcoordsAttr_, texcoords2Attr_, drawWireframe_ != 0 ? "aBarycentric" : null);

    var mv_ = Melown.mat4.create();
    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), submesh_.getWorldMatrix(cameraPos_), mv_);
    var proj_ = renderer_.camera_.getProjectionMatrix();

    program_.setMat4("uMV", mv_);
    program_.setMat4("uProj", proj_);

    if (drawWireframe_ == 0) {
        switch(type_) {
            case "internal":
            case "fog":
                renderer_.fogSetup(program_, "uFogDensity");
                break;

            case "external":
                program_.setFloat("uAlpha", 1);
                program_.setFloat("uFogDensity", 0);
                break;

            case "external-nofog":
                program_.setFloat("uAlpha", alpha_);
                renderer_.fogSetup(program_, "uFogDensity");
                break;
        }
    }

    if (texture_ != null && texture_.gpuTexture_ != null) {
        renderer_.gpu_.bindTexture(texture_.gpuTexture_);
    } else if (type_ != "fog") {
        return;
    }

    gpuSubmesh_.draw(program_, "aPosition", texcoordsAttr_, texcoords2Attr_, drawWireframe_ != 0 ? "aBarycentric" : null);
    this.stats_.drawnFaces_ += this.faces_;
};


