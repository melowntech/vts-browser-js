/**
 * @constructor
 */
Melown.MapStylesheet = function(map_, url_) {
    this.generateLines_ = true;
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.url_  = url_;
    this.data_ = null;

    this.size_ = 0;
    this.fileSize_ = 0;

    this.loadState_ = 0;
};

Melown.MapStylesheet.prototype.kill = function() {
};


Melown.MapStylesheet.prototype.isReady = function(doNotLoad_, priority_) {
    if (this.loadState_ == 2) { //loaded
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

Melown.MapStylesheet.prototype.scheduleLoad = function(priority_) {
    this.map_.loader_.load(this.url_, this.onLoad.bind(this), priority_);
};

Melown.MapStylesheet.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadJSON(url_, this.onLoaded.bind(this), this.onLoadError.bind(this), (Melown["useCredentials"] ? (this.mapLoaderUrl_.indexOf(this.map_.baseURL_) != -1) : false));
    this.loadState_ = 1;
};

Melown.MapStylesheet.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapStylesheet.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }
    
    this.data_ = data_;

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
};

//! Returns RAM usage in bytes.
Melown.MapStylesheet.prototype.size = function () {
    return this.size_;
};

Melown.MapStylesheet.prototype.fileSize = function () {
    return this.fileSize_;
};
