/**
 * @constructor
 */
Melown.Roi.LoadingQueue = function(options_) {
    this.options_ = options_;

    // queues
    this.enqueued_ = [];
    this.inProgress_ = [];
    this.finished_ = [];

    // event listeners
    this.listeners_ = {
        Melown_Pano_LQ_Downloaded : [],
        Melown_Pano_LQ_Failed : [],
        Melown_Pano_LQ_Begin : []
    };

    // options properties
    this.slots_ = 1;
    this.finishedSlots_ = 5;

    if (typeof this.options_ === 'object' && this.options_ !== null) {
        this.slots_ = this.options_.slots_ || 1;
        this.finishedSlots_ = this.options_.finishedSlots_ || 5;
    }
};

/**
 * @enum {int}
 */
Melown.Roi.LoadingQueue.Status = {
    Enqueued : 0,
    Downloading : 1,
    Finished : 2,
    Error : -1
};

/**
 * @enum {int}
 */
Melown.Roi.LoadingQueue.Type = {
    Binary : 0,
    JSON : 1,
    Image : 2
}
Melown.Roi.LoadingQueue.TypeCheck = function(type_) {
    var keys_ = Object.keys(Melown.Roi.LoadingQueue.Type);
    var valid_ = false;
    for (var i in keys_) {
        if (Melown.Roi.LoadingQueue.Type[keys_[i]] === type_) {
            valid_ = true;
            break;
        }
    }
    return valid_;
};

Melown_Roi_LQ_Downloaded = 'downloaded';
Melown_Roi_LQ_Failed = 'failed';
Melown_Roi_LQ_Begin = 'begin';

// Public methods

// Type is required hint for queue
Melown.Roi.LoadingQueue.prototype.enqueue = function(resourceUrl_, type_, clb_) {
    var clb_ = clb_ || function(){};

    if (typeof resourceUrl_ !== 'string'
        ) {// TODO: || !Melown.Utils.URLSanity(resourceUrl_)) {
        var err = new Error('Loading Queue: URL given to enqueue is not valid URL');
        console.error(err);
        clb(err);
        return null;
    }

    if (!Melown.Roi.LoadingQueue.TypeCheck(type_)) {
        var err = new Error('Loading Queue: Given hint type is not valid type');
        console.error(err);
        clb(err);
        return null;
    }

    // find item and update (or create if doesnt exists yet)
    var item_ = this._pickItem(resourceUrl_);
    if (item_ === null) {
        item_ = {
            url_ : resourceUrl_,
            type_ : type_,
            state_ : Melown.Roi.LoadingQueue.Status.Enqueued,
            clb_ : [clb_],
            data_ : null
        }
    } else {
        if (item_.state_ === Melown.Pano.LoadingQueue.Status.Enqueued) {
            item_.type_ = type_;

            var insertCallback_ = true;
            for (var i in item_.clb_) {
                if (item_.clb_[i] === clb_) {
                    insertCallback_ = false;
                    break;
                }
            }
            if (insertCallback_) {
                item_.clb_ = clb_;
            }
        }
    }

    // enqueue item to proper queue
    if (item_.state_ === Melown.Roi.LoadingQueue.Status.Enqueued) {
        this.enqueued_.push(item_);
    } else if (item_.state_ === Melown.Roi.LoadingQueue.Status.Downloading) {
        this.inProgress_.push(item_);
    } else if (item_.state_ === Melown.Roi.LoadingQueue.Status.Finished) {
        this.finished_.push(item_);
        clb_(null, item_);
    }

    this._next();

    return item_;
};

Melown.Roi.LoadingQueue.prototype.dequeue = function(resourceUrl_) {
    var item_ = this._pickItem(resourceUrl_);
    if (item_.state_ === Melown.Roi.LoadingQueue.Status.Downloading) {
        this._cancel(item_);
    }
    return item_;
};

Melown.Roi.LoadingQueue.prototype.on = function(event_, action_) {
    if (typeof action_ !== 'function'
        || (event_ !== Melown_Roi_LQ_Downloaded
            && event_ !== Melown_Roi_LQ_Failed
            && event_ !== Melown_Roi_LQ_Begin)) {
        return;
    }
    for (var i in this.listeners_[event_]) {
        if (this.listeners_[event_][i] === action_) {
            this.listeners_[event_].push(action_);
        }
    }
};

Melown.Roi.LoadingQueue.prototype.removeListener = function(event_, action_) {
    if (typeof action_ !== 'function'
        || (event_ !== Melown_Roi_LQ_Downloaded
            && event_ !== Melown_Roi_LQ_Failed
            && event_ !== Melown_Roi_LQ_Begin)) {
        return;
    }
    for (var i in this.listeners_[event_]) {
        if (this.listeners_[event_][i] === action_) {
            this.listeners_[event_].slice(i, 1);
        }
    }
};

// Accessor methods

Melown.Roi.LoadingQueue.prototype.enqueued = function() {
    return this.enqueued_;
};

Melown.Roi.LoadingQueue.prototype.downloading = function() {
    return this.inProgress_;
};

Melown.Roi.LoadingQueue.prototype.item = function(resourceUrl_) {
    return this._pickItem(resourceUrl_, true);
};

// Private methods

Melown.Roi.LoadingQueue.prototype._next = function() {
    if (this.inProgress_.length === this.slots_) {
        return;
    }
    var its_ = this.enqueued_.splice(0, 1);
    if (its_.length === 0) {
        return;
    }

    var item_ = its_[0];
    this.inProgress_.push(item_);

    if (item_.type_ === Melown.Roi.LoadingQueue.Type.Binary) {
        // TODO
        this._finalizeItem(item_, new Error('Not implemented yet'), null);
    } else if (item_.type_ === Melown.Roi.LoadingQueue.Type.JSON) {
        // TODO
        this._finalizeItem(item_, new Error('Not implemented yet'), null);
    } else if (item_.type_ === Melown.Roi.LoadingQueue.Type.Image) {
        item_.data_ = Melown.Http.imageFactory(item_.url_, function(data_) {
            this._finalizeItem(item_, null, item_.data_);
        }.bind(this), function(data_) {
            this._finalizeItem(item_, new Error(data_), null);
        }.bind(this));

        // item_.data_ = new Image();
        // item_.data_.addEventListener('load', function(data_) {
        //     this._finalizeItem(item_, null, item_.data_);
        // }.bind(this), false);
        // item_.data_.addEventListener('error', function(data_) {
        //     this._finalizeItem(item_, new Error(data_), null);
        // }.bind(this), false);
        // //item_.data_.crossOrigin = "anonymous";
        // item_.data_.src = item_.url_;
    }
};

Melown.Roi.LoadingQueue.prototype._cancel = function(item_) {
    // TODO
};

Melown.Roi.LoadingQueue.prototype._pickItem = function(itemUrl_, nremove_) {
    var item_ = null;
    var resourceUrl_ = itemUrl_.url_;
    for (var i in this.enqueued_) {
        if (this.enqueued_[i].url_ === resourceUrl_) {
            item_ = this.enqueued_[i];
            nremove_ || this.enqueued_.splice(i, 1);
            break;
        }
    }
    if (item_ === null) {
        for (var i in this.inProgress_) {
            if (this.inProgress_[i].url_ === resourceUrl_) {
                item_ = this.inProgress_[i];
                nremove_ || this.inProgress_.splice(i, 1);
                break;
            }
        }
    }
    if (item_ === null) {
        for (var i in this.finished_) {
            if (this.finished_[i].url_ === resourceUrl_) {
                item_ = this.finished_[i];
                nremove_ || this.finished_.splice(i, 1);
                break;
            }
        }
    }
    return item_;
};

Melown.Roi.LoadingQueue.prototype._finalizeItem = function(item_, error_, data_) {
    // remove from progress queue pass it to finished queue
    this.inProgress_.splice(this.inProgress_.indexOf(item_), 1);
    if (!error_) {
        item_.data_ = data_;
        while (this.finished_.length > this.finishedSlots_ - 1) {
            this.finished_.splice(0,1);
        }
        this.finished_.push(item_);
    }

    // pass data to item
    item_.data_ = data_;

    // invoke all callbacks
    for (var i in item_.clb_) {
        item_.clb_[i](error_, data_);
    }

    // try to load next
    this._next();
};
