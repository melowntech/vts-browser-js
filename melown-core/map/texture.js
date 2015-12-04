/**
 * @constructor
 */
Melown.MapTexture = function(map_, path_, heightMap_) {
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.image_ = null;
    this.imageData_ = null;
    this.imageExtents_ = null;
    this.gpuTexture_ = null;
    this.loadState_ = 0;
    this.mapLoaderUrl_ = path_;
    this.heightMap_ = heightMap_ || false;

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
    this.imageData_ = null;

    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
        this.tile_.validate();
    }

    this.loadState_ = 0;
    this.cacheItem_ = null;
};

Melown.MapTexture.prototype.killGpuTexture = function(killedByCache_) {
    if (this.gpuTexture_ != null) {
        this.stats_.gpuTexturesUsed_ -= this.gpuTexture_.size_;
        this.gpuTexture_.kill();
    }

    this.gpuTexture_ = null;

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
        this.tile_.validate();
    }

    this.gpuCacheItem_ = null;
};

Melown.MapTexture.prototype.isReady = function() {
    if (this.loadState_ == 2) { //loaded
        if (this.heightMap_) {
            if (this.imageData_ == null) {
                this.buildHeightMap();
            }
        } else {
            if (this.gpuTexture_ == null) {
                this.buildGpuTexture();
            }

            this.map_.resourcesCache_.updateItem(this.cacheItem_);
            this.map_.gpuCache_.updateItem(this.gpuCacheItem_);
        }
        return true;
    } else {
        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress
    }

    return false;
};

Melown.MapTexture.prototype.scheduleLoad = function() {
    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this));
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

    var size_ = this.image_.naturalWidth * this.image_.naturalHeight * (this.heightMap_ ? 3 : 3);

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killImage.bind(this, true), size_);

    this.loadState_ = 2;
    this.mapLoaderCallLoaded_();
};

Melown.MapTexture.prototype.buildGpuTexture = function () {
    this.gpuTexture_ = new Melown.GpuTexture(this.map_.renderer_.gpu_, null, this.map_.core_);
    this.gpuTexture_.createFromImage(this.image_, "linear", false);
    this.stats_.gpuTexturesUsed_ += this.gpuTexture_.size_;

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


