Melown.Pano.LoadingQueue = function() {
    this.queue_ = [];
    this.listeners_ = {
        Melown_Pano_LQ_Downloaded : [],
        Melown_Pano_LQ_Failed : [],
        Melown_Pano_LQ_Begin : []
    };
}

/**
 * @enum{int}
 */
Melown.Pano.LoadingQueue.Status = {
    Enqueued : 0,
    Downloading : 1,
    Finished : 2,
    Error : -1
}

Melown_Pano_LQ_Downloaded = 'downloaded';
Melown_Pano_LQ_Failed = 'failed';
Melown_Pano_LQ_Begin = 'begin';

// Public methods

Melown.Pano.LoadingQueue.prototype.enqueue = function(resourceUrl_, clb_) {
    var item_ = null;
    for var i in this.queue_ {
        if (this.queue_[i].url_ === resourceUrl_) {
            item_ = this.queue_[i];
            this.queue_.splice(i, 1);
        }
    }
    if (item_ === null) {
        item_ = {
            url_ : resourceUrl_,
            state_ : Melown.Pano.LoadingQueue.Status.Enqueued,
            image_ : null,
        }
        this.queue_.push(item_);
    } else {
        if (item_.state_ === Melown.Pano.LoadingQueue.Status.Finished) {
            // done, TODO - call on downloaded
        } else {
            this.queue_.push(item_);
        }
    }
}

Melown.Pano.LoadingQueue.prototype.dequeue = function(resourceUrl_) {
    var item_ = null;
    for var i in this.queue_ {
        if (this.queue_[i].url_ === resourceUrl_) {
            item_ = this.queue_[i];
            this.queue_.splice(i, 1);
        }
    }
}

Melown.Pano.LoadingQueue.prototype.on = function(event_, action_) {
   if (action_ === undefined) {
    return;
   }
}

Melown.Pano.LoadingQueue.prototype.removeListener = function(event_, action_) {
    // TODO
}

// Accessor methods

Melown.Pano.LoadingQueue.prototype.enqueued = function() {
    return this.queue_.filter(function(item_) {
        item_.state_ === Melown.Pano.LoadingQueue.Status.Enqueued;
    });
}

Melown.Pano.LoadingQueue.prototype.downloading = function() {
    return this.queue_.filter(function(item_) {
        item_.state_ === Melown.Pano.LoadingQueue.Status.Downloading;
    });
}

Melown.Pano.LoadingQueue.prototype.status = function(resourceUrl_) {
    for var i in this.queue_ {
        if (this.queue_[i].url_ === resourceUrl_) {
            return this.queue_[i].status_
        }
    }
    return null;
}

// Private methods

Melown.Pano.LoadingQueue.prototype._next = function() {
    if (this.queue_.length === 0) {
        return;
    }
    var item_ = this.queue_[0];
    item_.image_ = new Image();
    item_.image_.addEventListener('laod', function(data) {
        // image loaded - TODO notify.
    }, false);
    item_.image_.url_ = item_.url_;
}

Melown.Pano.LoadingQueue.prototype._cancel = function(item_) {
    // TODO
}
