
var MapGeodataProcessor = function(surface, listener) {
    this.layer = surface;
    this.map = surface.map;
    this.renderer = this.map.renderer;
    this.killed = false;
    this.listener = listener;
    this.busy = false;
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

    return ((this.ready && !this.busy) || this.killed) && !this.waitingForStylesheet;
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
    } else if (command == 'styleDone') {
        this.busy = false;
    }

    if (this.listener != null) {
        this.listener(command, message);
    }
};


MapGeodataProcessor.prototype.setListener = function(listener) {
    this.listener = listener;
};


MapGeodataProcessor.prototype.sendCommand = function(command, data, tile, dpr) {
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

    if (dpr) {
        message['dpr'] = dpr;
    }

    this.processWorker.postMessage(message);
};

MapGeodataProcessor.prototype.setStylesheet = function(stylesheet, fontsOnly) {
    this.stylesheet = stylesheet;

    if (!stylesheet.isReady()) {
        this.waitingForStylesheet = true;
        return;
    }

    this.busy = true;

    var config = this.map.config;
    var params = config.mapFeaturesReduceParams;
    var isDef = (function(val){ return (typeof val !== 'undefinde') });

    switch (config.mapFeaturesReduceMode) {
        case 'scr-count2':
            if (!params) {
                params = [1,50,0];
            } else {
                params[0] = isDef(params[0]) ? params[0] : 1;
                params[1] = isDef(params[1]) ? params[1] : 50;
                params[2] = isDef(params[2]) ? params[2] : 0;
                config.mapFeaturesSortByTop = true;
            }
        case 'scr-count4':
            if (!params) {
                params = [0.18,0,0];
            } else {
                params[0] = isDef(params[0]) ? params[0] : 0.18;
                params[1] = isDef(params[1]) ? params[1] : 0;
                params[2] = isDef(params[2]) ? params[2] : 0;
                config.mapFeaturesSortByTop = true;
            }
            break;

        case 'scr-count5':
            if (!params) {
                params = [2,1,0];
            } else {
                params[0] = isDef(params[0]) ? params[0] : 2;
                params[1] = isDef(params[1]) ? params[1] : 1;
                params[2] = isDef(params[2]) ? params[2] : 0;
                config.mapFeaturesSortByTop = true;
            }
            break;
    }

    config.mapFeaturesReduceFactor = params[2];

    //this.setFont('#default', this.renderer.font);
    this.sendCommand('setStylesheet', { 'data' : stylesheet.data,
                                        'geocent' : (!this.map.getNavigationSrs().isProjected()), 'metric': config.mapMetricUnits,
                                        'reduceMode': config.mapFeaturesReduceMode,
                                        'reduceParams': config.mapFeaturesReduceParams } );

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
