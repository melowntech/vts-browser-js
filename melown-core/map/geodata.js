/**
 * @constructor
 */
Melown.MapGeodata = function(map_, url_, extraInfo_) {
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.mapLoaderUrl_  = url_;
    this.extraInfo_ = extraInfo_;

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.fileSize_ = 0;
    this.faces_ = 0;

    this.cacheItem_ = null;  //store killSubmeshes
    this.gpuCacheItem_ = null; //store killGpuSubmeshes

    this.loadState_ = 0;
};

Melown.MapGeodata.prototype.kill = function() {
    this.bbox_ = null;
};

Melown.MapGeodata.prototype.isReady = function(doNotLoad_, priority_, doNotCheckGpu_) {
    var doNotUseGpu_ = (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_);
    doNotLoad_ = doNotLoad_ || doNotUseGpu_;
    
    if (doNotUseGpu_) {
        doNotUseGpu_ = doNotUseGpu_;
    }

    if (this.loadState_ == 2) { //loaded
        this.map_.resourcesCache_.updateItem(this.cacheItem_);
        
        if (doNotCheckGpu_) {
            return true;
        }

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

        if (!doNotLoad_) {
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
        } //else load in progress
    }

    return false;
};

Melown.MapGeodata.prototype.scheduleLoad = function(priority_) {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.map_.makeUrl(this.tile_.surface_.meshUrl_, {lod_:this.tile_.id_[0], ix_:this.tile_.id_[1], iy_:this.tile_.id_[2] });
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this), priority_);
};

Melown.MapGeodata.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    //Melown.MapGeodataProcessor = function(surface_, listener_)

    Melown.loadJSON(url_, this.onLoaded.bind(this), this.onLoadError.bind(this), (Melown["useCredentials"] ? (this.mapLoaderUrl_.indexOf(this.map_.baseURL_) != -1) : false));

    this.loadState_ = 1;
    
    return;

    var tile_ = this.extraInfo_.tile_;    

    if (tile_ && tile_.metanode_) {
        var bbox_ = tile_.metanode_.bbox_;

        this.onLoaded({
            
            "version": 1,
            "groups": [{
                "bbox": [
                    bbox_.min_,
                    bbox_.max_
                ],
                "resolution": 4096,
    
                "points": [{
                    "points": [
                        [0, 0, 0],
                        [4096, 0, 0],
                        [4096, 4096, 0],
                        [0, 4096, 0],

                        [0, 0, 4096],
                        [4096, 0, 4096],
                        [4096, 4096, 4096],
                        [0, 4096, 4096]
                    ],
        
                    "properties": {
                        "kind": "restaurant",
                        "name": "U Bílého Lva"
                    }   
                }],
        
                "lines": [{
                    "lines" : [
                        [
                            [0, 0, 0],
                            [4096, 0, 0],
                            [4096, 4096, 0],
                            [0, 4096, 0]
                        ],
                        
                        [
                            [0, 0, 4096],
                            [4096, 0, 4096],
                            [4096, 4096, 4096],
                            [0, 4096, 4096]
                        ]
                    ],
        
                    "properties": {
                        "kind": "road",
                        "name": "Na Bělidle"
                    }   
                }]
        
            }]
            
        });
        
    }

};

Melown.MapGeodata.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapGeodata.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    /*
    this.fileSize_= data_.byteLength;

    var stream_ = {data_:data_, index_:0};
    this.parseMapMesh(stream_);

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killSubmeshes.bind(this, true), this.size_);
    */

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
};

//! Returns RAM usage in bytes.
Melown.MapGeodata.prototype.size = function () {
    return this.size_;
};

Melown.MapGeodata.prototype.fileSize = function () {
    return this.fileSize_;
};

Melown.MapGeodata.prototype.draw = function () {
    //TODO:
};



