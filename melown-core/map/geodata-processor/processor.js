
Melown.MapGeodataProcessor = function(surface_, listener_) {
    this.layer_ = surface_;
    this.map_ = surface_.map_;
    this.killed_ = false;
    this.listener_ = listener_;
    this.ready_ = true;

    if (Melown_MERGE == true){

        //strigify function
        var windowURL_ = window.URL || window.webkitURL;
        var blob_;
        var stringified_ = Melown.stringifyFunction(Melown.MapGeodataProcessorWorker);

        //convert string to blob
        try {
            blob_ = new Blob([stringified_], {type: 'application/javascript'});
        } catch (e) { // Backwards-compatibility
            window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
            blob_ = new BlobBuilder();
            blob_.append(stringified_);
            blob_ = blob.getBlob();
        }

        //create worker from blob
        this.processWorker_ = new Worker(windowURL_.createObjectURL(blob_));
    } else {

        //debug worker
        this.processWorker_ = new Worker("./geodata-processor/worker-debug.js");
    }

    this.processWorker_.onmessage = this.onMessage.bind(this);
};

Melown.MapGeodataProcessor.prototype.kill = function() {
    if (this.killed_ == true) {
        return;
    }

    this.killed_ = true;

    if (this.processWorker_ != null) {
        this.processWorker_.terminate();
    }
};

Melown.MapGeodataProcessor.prototype.isReady = function(listener_) {
    return this.ready_ || this.killed_;
};

Melown.MapGeodataProcessor.prototype.onMessage = function(message_) {
    if (this.killed_ == true) {
        return;
    }

    message_ = message_.data;

    //console.log("onmessage");

    if (message_ == "ready") {
        this.ready_ = true;
        //console.log("ready");
    }

    if (this.listener_ != null) {
        this.listener_(message_);
    }
};

Melown.MapGeodataProcessor.prototype.setListener = function(listener_) {
    this.listener_ = listener_;
};

Melown.MapGeodataProcessor.prototype.sendCommand = function(command_, data_, id_, autoLod_) {
    if (this.killed_ == true) {
        return;
    }

    this.ready_ = false;

    if (id_ == null) {
        id_ = [0,0,0];//new Melown.TileId(this.core_, 0, 0, 0);
    }

    var worldParams_ = id_.getWorldParams();
    var tileSize_ = worldParams_[2];
    //console.log("command: " + command_ + " data: " + data_);

    this.processWorker_.postMessage({"command": command_, "data":data_, "x":worldParams_[0], "y":worldParams_[1], "lod": id_[2], "autoLod":autoLod_});
};


