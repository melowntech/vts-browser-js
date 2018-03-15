
var MapGeodataProcessor = function(surface, listener) {
    this.layer = surface;
    this.map = surface.map;
    this.renderer = this.map.renderer;
    this.killed = false;
    this.listener = listener;
    this.ready = true;
    this.waitingForStylesheet = false;
    this.stylesheet = null;
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
    if (this.waitingForStylesheet) {
        this.waitingForStylesheet = !(this.stylesheet.isReady());
    }

    return (this.ready || this.killed) && !this.waitingForStylesheet;
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

        if (tile.metanode) {
            message['tileSize'] = tile.metanode.diskAngle * tile.metanode.diskDistance;
        }
    }

    this.processWorker.postMessage(message);
};

MapGeodataProcessor.prototype.setStylesheet = function(stylesheet, fontsOnly) {
    this.stylesheet = stylesheet;

    if (!stylesheet.isReady()) {
        this.waitingForStylesheet = true;
        return;
    }

    //this.setFont('#default', this.renderer.font);
    this.sendCommand('setStylesheet', { 'data' : stylesheet.data, 'geocent' : (!this.map.getNavigationSrs().isProjected()) } );

    var fonts = stylesheet.fonts;
    var fontMap = {}; //'#default' : '#default' };

    for (var key in fonts) {
        var fontUrl = fonts[key];
        var font = this.renderer.fonts[fontUrl];
        fontMap[key] = fontUrl;

        if (font) {
            this.setFont(fontUrl, font);
        }
    }

    this.sendCommand('setFontMap', { 'map' : fontMap });
};

MapGeodataProcessor.prototype.setFont = function(url, font) {
    if (!this.fonts[url]) {
        this.fonts[url] = font;
        this.sendCommand('setFont', {'url' : url, 'data': font.data}, [font.data]);
    }
};


export default MapGeodataProcessor;
