
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
        this.processWorker_ = new Worker("../src/core/map/geodata-processor/worker-debug.js");
        
        this.processWorker_.onerror = function(event){
            throw new Error(event.message + " (" + event.filename + ":" + event.lineno + ")");
        };
        
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
    
    var command_ = message_["command"];

    //console.log("onmessage");

    //if (typeof message_ === "string" && message_ == "ready") {
    if (command_ == "ready") {
        this.ready_ = true;
        //console.log("ready");
    }

    if (this.listener_ != null) {
        this.listener_(command_, message_);
    }
};

Melown.MapGeodataProcessor.prototype.setListener = function(listener_) {
    this.listener_ = listener_;
};

Melown.MapGeodataProcessor.prototype.sendCommand = function(command_, data_, tile_) {
    if (this.killed_ == true) {
        return;
    }

    this.ready_ = false;
    
    var message_ = {"command": command_, "data":data_};
    
    if (tile_ && tile_.id_) { 
        message_["lod"] = tile_.id_[0];
    }

    this.processWorker_.postMessage(message_);
};


