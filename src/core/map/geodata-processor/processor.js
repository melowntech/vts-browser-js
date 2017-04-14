
var MapGeodataProcessor = function(surface, listener) {
    this.layer = surface;
    this.map = surface.map;
    this.killed = false;
    this.listener = listener;
    this.ready = true;

    var worker = require("worker-loader?inline&fallback=false!./worker-main");
//    var worker = require("worker-loader?inline!./worker-main");

    //debug worker
    this.processWorker = new worker;
    
    this.processWorker.onerror = function(event){
        throw new Error(event.message + " (" + event.filename + ":" + event.lineno + ")");
    };

    this.processWorker.onmessage = this.onMessage.bind(this);
};


MapGeodataProcessor.prototype.kill = function() {
    if (this.killed == true) {
        return;
    }

    this.killed = true;

    if (this.processWorker != null) {
        this.processWorker.terminate();
    }
};


MapGeodataProcessor.prototype.isReady = function(listener) {
    return this.ready || this.killed;
};


MapGeodataProcessor.prototype.onMessage = function(message) {
    if (this.killed) {
        return;
    }

    message = message.data;
    
    var command = message["command"];

    //console.log("onmessage");

    //if (typeof message === "string" && message == "ready") {
    if (command == "ready") {
        this.ready = true;
        //console.log("ready");
    }

    if (this.listener != null) {
        this.listener(command, message);
    }
};


MapGeodataProcessor.prototype.setListener = function(listener) {
    this.listener = listener;
};


MapGeodataProcessor.prototype.sendCommand = function(command, data, tile) {
    if (this.killed == true) {
        return;
    }

    this.ready = false;
    
    var message = {"command": command, "data":data};
    
    if (tile && tile.id) { 
        message["lod"] = tile.id[0];
    }

    this.processWorker.postMessage(message);
};


export default MapGeodataProcessor;
