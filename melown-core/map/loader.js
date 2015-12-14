/**
 * @constructor
 */
Melown.MapLoader = function(map_, numThreads_) {
    this.map_ = map_;

    this.numThreads_ = numThreads_ || 1;
    this.usedThreads_ = 0;

    this.pending_ = [];
    this.pendingPath_ = [];
    this.downloading_ = [];
};


Melown.MapLoader.prototype.load = function(path_, downloadFunction_) {
    var index_ = this.downloading_.indexOf(path_);

    if (index_ != -1) {
        return;
    }

    //console.log("MapLoader.prototype.newRequest:" + hashId_);

    // update the pending list

   // put the request to the beginning of the pending list
    var index_ = this.pendingPath_.indexOf(path_);
    if (index_ != -1) {
        this.pending_.splice(index_, 1);
        this.pendingPath_.splice(index_, 1);
    }

    this.pending_.unshift(downloadFunction_);
    this.pendingPath_.unshift(path_);

    // keep the pending list at reasonable length
    if (this.pending_.length > 20) {
        this.pending_.pop();
        this.pendingPath_.pop();
    }
};


Melown.MapLoader.prototype.update = function() {
    if (this.pending_.length > 0) {
        if (this.usedThreads_ < this.numThreads_) {

            var downloadFunction_ = this.pending_.shift();
            var path_ = this.pendingPath_.shift();

            if (this.downloading_.indexOf(path_) == -1 && downloadFunction_ != null) {

                //console.log("MapLoader.prototype.download:" + hashId_);

                this.downloading_.push(path_);
                this.usedThreads_++;

                var onLoaded_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadDONE:" + this.cache_.hash(originalID_));

                    this.downloading_.splice(this.downloading_.indexOf(path_), 1);
                    this.usedThreads_--;

                    this.map_.dirty_ = true;

                }).bind(this);

                var onError_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadERROR:" + this.cache_.hash(originalID_));

                    this.downloading_.splice(this.downloading_.indexOf(path_), 1);
                    this.usedThreads_--;

                }).bind(this);

                //downloadFunction_(this.map_, id_, onLoaded_, onError_);
                downloadFunction_(path_, onLoaded_, onError_);
            }
        }
    }
};
