/**
 * @constructor
 */
Melown.Roi.ProcessQueue = function(options_) {
    this.options_ = options_;

    // queue
    this.enqueued_ = [];

    // options properties
    this.opsPerTick_ = 1;

    if (typeof this.options_ === 'object' && this.options_ !== null) {
        this.opsPerTick_ = this.options_.opsPerTick_ || 1;
    }
};

Melown.Roi.ProcessQueue.prototype.tick = function() {
    for (var i = 0; i < this.opsPerTick_; i++) {
        if (this.enqueued_.length) {
            var task_ = this.enqueued_.pop();
            task_();
        } else {
            break;
        }
    }
};

Melown.Roi.ProcessQueue.prototype.enqueue = function(task_) {
    if (typeof task_ !== 'function') {
        return;
    }
    for (var i in this.enqueued_) {
        if (this.enqueued_[i] === task_) {
            this.enqueued_.splice(i, 1);
            break;
        }
    }
    this.enqueued_.push(task_);
};

Melown.Roi.ProcessQueue.prototype.enqueued = function() {
    this.enqueued_;
};

Melown.Roi.ProcessQueue.prototype.denqueue = function(task_) {
    if (typeof task_ !== 'function') {
        return;
    }

    for (var i in this.enqueued_) {
        if (this.enqueued_[i] === task_) {
            this.enqueued_.splice(i, 1);
            break;
        }
    }
};
