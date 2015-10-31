'use strict'

Melown.Pano.LoadingQueue = function() {
    this.queue_ = [];
    this.listeners_ = {};
}

Melown.Pano.LoadingQueue.Status = {
    Enqueued : 'enqueued',
    Downloading : 'downloading',
    Finished : 'finished'
}

Melown.Pano.LoadingQueue.Event = {
    Downloaded : 'downloaded',
    Failed : 'failed'
}

// Public methods

Melown.Pano.LoadingQueue.prototype.enqueue = function(resourceUrl_, clb_) {

}

Melown.Pano.LoadingQueue.prototype.dequeue = function(resourceUrl_) {
    
}

Melown.Pano.LoadingQueue.prototype.on = function(event_, action_) {
    
}

Melown.Pano.LoadingQueue.prototype.removeListener = function(event_, action_) {
    
}

// Accessor methods

Melown.Pano.LoadingQueue.prototype.enqueued = function() {

}

Melown.Pano.LoadingQueue.prototype.downloading = function() {

}

Melown.Pano.LoadingQueue.prototype.status = function(resourceUrl_) {

}

// Private methods

Melown.Pano.LoadingQueue.prototype._next = function() {

}
