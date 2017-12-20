
var MapGeodataProcessor = function(surface, listener) {
    this.layer = surface;
    this.map = surface.map;
    this.renderer = this.map.renderer;
    this.killed = false;
    this.listener = listener;
    this.ready = true;
    this.fonts = {};

    // eslint-disable-next-line
    var worker = require('worker-loader?inline&fallback=false!./worker-main');
    //var worker = require('worker-loader?!./worker-main');

    //debug worker
    this.processWorker = new worker;
    
    this.processWorker.onerror = function(event){
        throw new Error(event.message + ' (' + event.filename + ':' + event.lineno + ')');
    };

    this.processWorker.onmessage = this.onMessage.bind(this);
};


MapGeodataProcessor.prototype.kill = function() {
    if (this.killed) {
        return;
    }

    this.killed = true;

    if (this.processWorker != null) {
        this.processWorker.terminate();
    }
};


MapGeodataProcessor.prototype.isReady = function() {
    return this.ready || this.killed;
};


MapGeodataProcessor.prototype.onMessage = function(message) {
    if (this.killed) {
        return;
    }

    message = message.data;
    
    var command = message['command'];

    //console.log("onmessage");

    //if (typeof message === "string" && message == "ready") {
    if (command == 'ready') {
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
    if (this.killed) {
        return;
    }

    this.ready = false;
    
    var message = {'command': command, 'data':data};
    
    if (tile && tile.id) { 
        message['lod'] = tile.id[0];
    }

    this.processWorker.postMessage(message);
};

MapGeodataProcessor.prototype.setStylesheet = function(stylesheet) {
    this.setFont('@system', this.renderer.font);
    this.sendCommand('setStylesheet', { 'data' : stylesheet.data, 'geocent' : (!this.map.getNavigationSrs().isProjected()) } );
};

MapGeodataProcessor.prototype.setFont = function(id, font) {
    if (!this.fonts[id]) {
        this.fonts[id] = font;
        this.sendCommand('setFont', {'id' : 'id', 'chars' : font.chars, 'space' : font.space, 'cly' : font.cly, 
                                     'size' : font.size, 'version':font.version});
    }
};


export default MapGeodataProcessor;
