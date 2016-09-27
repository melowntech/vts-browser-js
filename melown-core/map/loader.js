/**
 * @constructor
 */
Melown.MapLoader = function(map_, maxThreads_) {
    this.map_ = map_;

    this.maxThreads_ = maxThreads_ || 1;
    this.usedThreads_ = 0;
    this.maxPending_ = this.maxThreads_ * 2;
    this.fadeout_ = 19 / 20;

    this.pending_ = [[],[]];
    //this.pendingPath_ = [];
    //this.pendingPriority_ = [];

    this.channel_ = 0;

    this.downloading_ = [];
    this.downloadingTime_ = [];
    this.lastDownloadTime_ = 0;
    this.downloaded_ = 0;
    this.updateThreadCount();
};

Melown.MapLoader.prototype.updateThreadCount = function(channel_) {
    this.maxThreads_ = this.map_.config_.mapDownloadThreads_;
    this.maxPending_ = Math.max(20, this.maxThreads_ * 2);
    this.fadeout_ = (this.maxPending_-1) / this.maxPending_;
};

Melown.MapLoader.prototype.setChannel = function(channel_) {
    this.channel_ = channel_;
};

Melown.MapLoader.prototype.load = function(path_, downloadFunction_, priority_) {
    var index_ = this.downloading_.indexOf(path_);

    if (index_ != -1) {
        return;
    }

    // update the pending list
    var pending_ = this.pending_[this.channel_];

   // put the request to the beginning of the pending list
    var index_ = this.map_.searchArrayIndexById(pending_, path_);
    if (index_ != -1) {
        pending_[index_].priority_ = priority_; 
    } else {
        pending_.unshift({id_:path_, call_: downloadFunction_, priority_ : (priority_ || 0) });
    }

    //sort pending list by priority
    do {
        var sorted_ = true;
        
        for (var i = 0, li = pending_.length - 1; i < li; i++) {
            if (pending_[i].priority_ > pending_[i+1].priority_) {
                var t = pending_[i];
                pending_[i] = pending_[i+1];
                pending_[i+1] = t;
    
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);

    // keep the pending list at reasonable length
    if (pending_.length > this.maxPending_) {
        pending_.pop();
    }
};



Melown.MapLoader.prototype.remove = function(path_) {
    var index_ = this.map_.searchArrayIndexById(this.pending_[this.channel_], path_);
    if (index_ != -1) {
        this.pending_[this.channel_].splice(index_, 1);
    }
};

Melown.MapLoader.prototype.updateChannel = function(channel_) {
    var pending_ = this.pending_[channel_];
    this.updateThreadCount();

    //reduce priority for pending stuff
    for (var i = 0, li = pending_.length; i < li; i++) {
        pending_[i].priority_ *= this.fadeout_;
    }

    var timer_ = performance.now();

    //this.downloadingTime_.push(item_.id_);
    /*
    if (this.map_.config_.mapLowresBackground_) {
        for (var i = 0; i < this.downloading_.length; i++) {
            if ((timer_ - this.downloadingTime_[i]) > 3000) {
                this.downloading_.splice(i, 1);
                this.downloadingTime_.splice(i, 1);
                this.usedThreads_--;
                i--;

                this.map_.markDirty();
            }
        }
    }*/
    
    //if (this.pending_.length > 0) {
        //if (this.usedThreads_ < this.maxThreads_) {
        while (pending_.length > 0 && this.usedThreads_ < this.maxThreads_) {

            //console.log("used: " + this.usedThreads_ + " pending:" + this.pendingPath_.length + " max:" + this.maxThreads_);

            var item_ = pending_.shift();

            if (this.downloading_.indexOf(item_.id_) == -1 && item_.call_ != null) {

                //console.log("MapLoader.prototype.download:" + hashId_);

                this.downloading_.push(item_.id_);
                this.downloadingTime_.push(timer_);
                this.usedThreads_++;
                this.downloaded_++;

                var onLoaded_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadDONE:" + this.cache_.hash(originalID_));
                    
                    var index_ = this.downloading_.indexOf(item_.id_);
                    this.downloading_.splice(index_, 1);
                    this.downloadingTime_.splice(index_, 1);
                    this.lastDownloadTime_ = Date.now();
                    this.usedThreads_--;
                    this.map_.markDirty();
                    this.update();

                }).bind(this);

                var onError_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadERROR:" + this.cache_.hash(originalID_));

                    var index_ = this.downloading_.indexOf(item_.id_);
                    this.downloading_.splice(index_, 1);
                    this.downloadingTime_.splice(index_, 1);
                    this.lastDownloadTime_ = Date.now();
                    this.usedThreads_--;
                    this.map_.markDirty();
                    this.update();

                }).bind(this);

                //downloadFunction_(this.map_, id_, onLoaded_, onError_);
                item_.call_(item_.id_, onLoaded_, onError_);
            }
        }
    //}
};

Melown.MapLoader.prototype.update = function() {
    for (var i = this.pending_.length - 1; i >= 0; i--) {
        if (this.pending_[i].length > 0) {
            this.updateChannel(i);
            break;
        }
    }
};

