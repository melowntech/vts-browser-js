/**
 * @constructor
 */
Melown.MapLoader = function(map_, numThreads_) {
    this.map_ = map_;

    this.numThreads_ = numThreads_ || 1;
    this.usedThreads_ = 0;

    this.pending_ = [];
    //this.pendingPath_ = [];
    //this.pendingPriority_ = [];


    this.downloading_ = [];
};

Melown.MapLoader.prototype.load = function(path_, downloadFunction_, priority_) {
    var index_ = this.downloading_.indexOf(path_);

    if (index_ != -1) {
        return;
    }

    // update the pending list

   // put the request to the beginning of the pending list
    var index_ = this.map_.searchArrayIndexById(this.pending_, path_);
    if (index_ != -1) {
        this.pending_[index_].priority_ = priority_; 
    } else {
        this.pending_.unshift({id_:path_, call_: downloadFunction_, priority_ : (priority_ || 0) });
    }

    // keep the pending list at reasonable length
    if (this.pending_.length > 20) {
        this.pending_.pop();
    }
    
    //sort pending list by priority
    do {
        var sorted_ = true;
        
        for (var i = 0, li = this.pending_.length - 1; i < li; i++) {
            if (this.pending_[i].priority_ > this.pending_[i+1].priority_) {
                var t = this.pending_[i];
                this.pending_[i] = this.pending_[i+1];
                this.pending_[i+1] = t;
    
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);
    
};



Melown.MapLoader.prototype.remove = function(path_) {
    var index_ = this.map_.searchArrayIndexById(this.pending_, path_);
    if (index_ != -1) {
        this.pending_.splice(index_, 1);
    }
};

Melown.MapLoader.prototype.update = function() {
    //if (this.pending_.length > 0) {
        //if (this.usedThreads_ < this.numThreads_) {
        while (this.pending_.length > 0 && this.usedThreads_ < this.numThreads_) {

            //console.log("used: " + this.usedThreads_ + " pending:" + this.pendingPath_.length + " max:" + this.numThreads_);

            var item_ = this.pending_.shift();

            if (this.downloading_.indexOf(item_.id_) == -1 && item_.call_ != null) {

                //console.log("MapLoader.prototype.download:" + hashId_);

                this.downloading_.push(item_.id_);
                this.usedThreads_++;

                var onLoaded_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadDONE:" + this.cache_.hash(originalID_));

                    this.downloading_.splice(this.downloading_.indexOf(item_.id_), 1);
                    this.usedThreads_--;

                    this.map_.dirty_ = true;

                }).bind(this);

                var onError_ = (function(path_){

                    //console.log("MapLoader.prototype.downloadERROR:" + this.cache_.hash(originalID_));

                    this.downloading_.splice(this.downloading_.indexOf(item_.id_), 1);
                    this.usedThreads_--;

                }).bind(this);

                //downloadFunction_(this.map_, id_, onLoaded_, onError_);
                item_.call_(item_.id_, onLoaded_, onError_);
            }
        }
    //}
};
