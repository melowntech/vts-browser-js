/**
 * @constructor
 */
Melown.MapTexture = function(map_, tile_, submeshIndex_, external_) {
    this.map_ = map_;
    this.tile_ = tile_;
    this.submeshIndex_ = submeshIndex_;
    this.external_ = external_ || false;
    this.image_ = null;
    this.gpuTexture_ = null;
    this.loadState_ = 0;

    this.cacheItem_ = null; //store killImage
    this.gpuCacheItem_ = null; //store killGpuTexture
};

Melown.MapTexture.prototype.kill = function() {
    this.texture_ = null;
    this.killImage();
    this.killGpuTexture();
    this.tile_.validate();
};

Melown.MapTexture.prototype.killImage = function(killedByCache_) {
    this.image_ = null;

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        this.tile_.validate();
    }

    this.cacheItem_ = null;
};

Melown.MapTexture.prototype.killGpuTexture = function(killedByCache_) {
    this.gpuTexture_ = null;

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        this.tile_.validate();
    }

    this.gpuCacheItem_ = null;
};

Melown.MapTexture.prototype.isReady = function() {
    if (this.loadState_ == 2) { //loaded

        if (this.gpuTexture_ == null) {
            this.buildGpuTexture();
        }

        this.map_.resourcesCache_.updateItem(this.cacheItem_);
        this.map_.gpuCache_.updateItem(this.gpuCacheItem_);

        return true;
    } else {

        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress

        return;
    }
};

Melown.MapTexture.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.tile_.surface_.textureUrl_, {lod_:this.tile_.id_[0], ix_:this.tile_.id_[1], iy_:this.tile_.id_[2] }, this.submeshIndex_);
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
};

Melown.MapTexture.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    var image_ = new Image();
    image_.onerror = this.onLoadError.bind(this);
    image_.onload = this.onLoaded.bind(this);
    image_.src = url_;

    this.image_ = image_;

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

    var size_ = this.image_.naturalWidth * this.image_.naturalHeight * 3;

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killImage.bind(this, true), size_);

    this.loadState_ = 2;
    this.mapLoaderCallLoaded_();
};

Melown.MapTexture.prototype.buildGpuTexture = function () {
    this.gpuTexture_ = new Melown.GpuTexture(this.map_.renderer_.gpu_, null, this.map_.core_);
    this.gpuTexture_.createFromImage(this.image_, "linear", false);

    this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGpuTexture.bind(this, true), this.gpuTexture_.size_);
};

