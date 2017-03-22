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
    this.geodata_ = null;

    this.cacheItem_ = null;

    this.loadState_ = 0;
    this.loadErrorTime_ = null;
    this.loadErrorCounter_ = 0;

    this.map_.markDirty();
};

Melown.MapGeodata.prototype.kill = function() {
    this.bbox_ = null;
    this.killGeodata();
};

Melown.MapGeodata.prototype.killGeodata = function(killedByCache_) {
    if (this.geodata_) {
        this.geodata_ = null;
    }
    
    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.resourcesCache_.remove(this.cacheItem_);
    }

    //if (this.gpuSubmeshes_.length == 0) {
        this.loadState_ = 0;
    //}

    this.size_ = 0;
    this.fileSize_ = 0;
    this.cacheItem_ = null;
};

Melown.MapGeodata.prototype.isReady = function(doNotLoad_, priority_, doNotCheckGpu_) {
    var doNotUseGpu_ = (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_);
    doNotLoad_ = doNotLoad_ || doNotUseGpu_;

    if (this.loadState_ == 2) { //loaded
        this.map_.resourcesCache_.updateItem(this.cacheItem_);
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


                if (typeof this.mapLoaderUrl_ === "object") { //use geodata directly
                    this.geodata_ = JSON.stringify(this.mapLoaderUrl_);
                    this.loadState_ = 2;
                    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killGeodata.bind(this, true), this.geodata_.length);
                    this.map_.resourcesCache_.updateItem(this.cacheItem_);
                    return true;
                } else {
                    this.scheduleLoad(priority_);
                }
            }
        } else if (this.loadState_ == 3) { //loadError
            if (this.loadErrorCounter_ <= this.map_.config_.mapLoadErrorMaxRetryCount_ &&
                performance.now() > this.loadErrorTime_ + this.map_.config_.mapLoadErrorRetryTime_) {

                this.scheduleLoad(priority_);                    
            }
        }  //else load in progress
    }

    return false;
};

Melown.MapGeodata.prototype.scheduleLoad = function(priority_) {
    //if (this.mapLoaderUrl_ == null) {
        //this.mapLoaderUrl_ = this.map_.makeUrl(this.tile_.surface_.meshUrl_, {lod_:this.tile_.id_[0], ix_:this.tile_.id_[1], iy_:this.tile_.id_[2] });
    //}

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this), priority_, this.extraInfo_.tile_, "geodata");
};

Melown.MapGeodata.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    //Melown.MapGeodataProcessor = function(surface_, listener_)

    this.loadState_ = 1;
    
    Melown.loadJSON(url_, this.onLoaded.bind(this), this.onLoadError.bind(this), true, (Melown["useCredentials"] ? (this.mapLoaderUrl_.indexOf(this.map_.baseUrl_) != -1) : false), this.map_.core_.xhrParams_);
    return;
/*
    var tile_ = this.extraInfo_.tile_;    

    if (tile_) {

        if (tile_.metanode_) {
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
                            ]
                        ]
            
                        "properties": {
                            "kind": "road",
                            "name": "Na Bělidle"
                        }   
                    }]
            
                }]
                
            });
            
        }
        
    } else {
        
        //monolitic

        this.onLoaded({
            
            "version": 1,
            "groups": [{
                "bbox": [
                    [472143,5555696,225],
                    [472303,5555760,245]
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
*/
};

Melown.MapGeodata.prototype.onLoadError = function() {
    if (this.map_.killed_){
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

Melown.MapGeodata.prototype.onLoaded = function(data_) {
    if (this.map_.killed_){
        return;
    }

    var size_ = data_.length;
    this.size_ = size_;
    this.fileSize_ = size_;

    this.geodata_ = data_;

    this.cacheItem_ = this.map_.resourcesCache_.insert(this.killGeodata.bind(this, true), size_);

    this.map_.markDirty();
    this.loadState_ = 2;
    this.loadErrorTime_ = null;
    this.loadErrorCounter_ = 0;
    this.mapLoaderCallLoaded_();
};

//! Returns RAM usage in bytes.
Melown.MapGeodata.prototype.size = function () {
    return this.size_;
};

Melown.MapGeodata.prototype.fileSize = function () {
    return this.fileSize_;
};



