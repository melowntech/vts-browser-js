
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
    this.processCounter = 0;


    // eslint-disable-next-line
    var worker = require('worker-loader?inline&fallback=false!./worker-main');
    //var worker = require('worker-loader?!./worker-main');

    //debug worker
    this.processWorker = new worker;
    
    this.processWorker.onerror = function(event){
        throw new Error(event.message + ' (' + event.filename + ':' + event.lineno + ')');
    };

    this.processWorker.onmessage = this.onMessage.bind(this);

    this.processWorker.postMessage({'command':'config', 'data': this.map.config});
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


MapGeodataProcessor.prototype.onMessage = function(message, direct) {
    if (this.killed) {
        return;
    }

    if (!direct) {
        message = message.data;
    }
    
    var command = message['command'];

    //console.log('onmessage ' + command);

    //if (typeof message === "string" && message == "ready") {
    if (command == 'ready') {
        this.ready = true;
        //console.log("ready");
    } else if (command == 'styleDone') {
        this.busy = false;
    } else if (command == 'loadBitmaps') {
        var bitmaps = message['bitmaps'];

        for (var key in bitmaps) {
            var bitmap = bitmaps[key];
            this.renderer.getBitmap(bitmap['url'], bitmap['filter'] || 'linear', bitmap['tiled'] || false, bitmap['hash'], true);
        }
    }

    if (this.listener != null) {
        if (command == 'packed-events') {
            var messages = message['messages'];

            for (var i = 0, li = messages.length; i < li; i++) {
                this.onMessage(messages[i], true);
            }

            return;
        } else {
            this.listener(command, message);
        }
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

    //console.log('sendCommand ' + command);
    
    if (tile && tile.id) { 
        message['lod'] = tile.id[0];
        message['ix'] = tile.id[1];
        message['iy'] = tile.id[2];

        if (tile.metanode) {
            message['tileSize'] = Math.tan(tile.metanode.diskAngle2A) * tile.metanode.diskDistance;
            message['pixelSize'] =  (message['tileSize'] * 0.70710678118) / tile.metanode.displaySize;
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

    var ppi = 96 * (window.devicePixelRatio || 1);
    var config = this.map.config;
    var params = config.mapFeaturesReduceParams;
    var isDef = (function(val){ return (typeof val !== 'undefined') });
    var rmode = config.mapFeaturesReduceMode;


    switch (rmode) {
        case 'scr-count1':
        case 'scr-count2':
            if (!params) {
                params = [1,50,0];
            } else {
                params[0] = isDef(params[0]) ? params[0] : 1;
                params[1] = isDef(params[1]) ? params[1] : 50;
                params[2] = isDef(params[2]) ? params[2] : 0;
            }
            config.mapFeaturesSortByTop = (rmode == 'scr-count2') ? true : false;
            break;

        case 'scr-count4':
            if (!params) {
                params = [0.18,0,0];
            } else {
                params[0] = isDef(params[0]) ? params[0] : 0.18;
                params[1] = isDef(params[1]) ? params[1] : 0;
                params[2] = isDef(params[2]) ? params[2] : 1;
            }
            config.mapFeaturesSortByTop = true;
            break;

        case 'scr-count5':
            if (!params) {
                params = [2,1,0];
            } else {
                params[0] = isDef(params[0]) ? params[0] : 2;
                params[1] = isDef(params[1]) ? params[1] : 1;
                params[2] = isDef(params[2]) ? params[2] : 1;
            }
            config.mapFeaturesSortByTop = true;
            break;

        case 'scr-count6':
        case 'scr-count7':
            if (!params) {
                params = [0.2,0,((rmode == 'scr-count6') ? 1 : 2), 1, 1];
            } else {
                params[0] = (isDef(params[0]) ? params[0] : 0.2);
                params[1] = isDef(params[1]) ? params[1] : 0;
                params[2] = isDef(params[2]) ? params[2] : ((rmode == 'scr-count6') ? 1 : 2);
                params[3] = isDef(params[3]) ? params[3] : 1;
                params[4] = isDef(params[4]) ? params[4] : 1;
                params[5] = ppi;
                config.mapFeaturesSortByTop = true;
            }
            break;

        case 'scr-count8':
            if (!params) {
                params = [0.2, 0.6, 11, 1, 1000, 5];
            } else {
                params[0] = (isDef(params[0]) ? params[0] : 0.2);
                params[1] = isDef(params[1]) ? params[1] : 0.6;
                params[2] = isDef(params[2]) ? params[2] : 11;
                params[3] = isDef(params[3]) ? params[3] : 1;
                params[4] = isDef(params[4]) ? params[4] : 1000;
                params[5] = isDef(params[5]) ? params[5] : 5;
                params[6] = ppi;
                config.mapFeaturesSortByTop = true;
            }
            break;

    }
    
    config.mapFeaturesReduceParams = params;
    config.mapFeaturesReduceFactor = params[2];
    config.mapFeaturesReduceFactor2 = params[3];
    config.mapFeaturesReduceFactor3 = params[4];

    //this.setFont('#default', this.renderer.font);
    this.sendCommand('setStylesheet', { 'data' : stylesheet.data,
                                        'geocent' : (!this.map.getNavigationSrs().isProjected()),
                                        'metric': config.mapMetricUnits,
                                        'language': config.mapLanguage,
                                        'reduceMode': rmode,
                                        'reduceParams': config.mapFeaturesReduceParams,
                                        'log': config.mapLogGeodataStyles } );

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

    this.processCounter++;
    this.sendCommand('setFontMap', { 'map' : fontMap });
};


MapGeodataProcessor.prototype.setFont = function(url, font) {
    if (!this.fonts[url]) {
        this.fonts[url] = font;
        this.sendCommand('setFont', {'url' : url, 'data': font.data}, [font.data]);
    }
};


export default MapGeodataProcessor;
