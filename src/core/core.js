import Proj4 from 'proj4';
import Map_ from './map/map';
import Inspector_ from './inspector/inspector';
import Renderer_ from './renderer/renderer';
import RendererInterface_ from './renderer/interface';
import MapPosition_ from './map/position';
import MapInterface_ from './map/interface';
import {utils as utils_} from './utils/utils';
import {utilsUrl as utilsUrl_} from './utils/url';
import {platform as platform_} from './utils/platform';

//get rid of compiler mess
var Map = Map_;
var Inspector = Inspector_;
var Renderer = Renderer_;
var RendererInterface = RendererInterface_;
var MapPosition = MapPosition_;
var MapInterface = MapInterface_;
var utils = utils_;
var utilsUrl = utilsUrl_;
var platform = platform_;


var Core = function(element, config, coreInterface) {
    this.killed = false;
    this.config = {
        map : null,
        mapCache : 900,
        mapGPUCache : 360,
        mapMetatileCache : 60,
        mapTexelSizeFit : 1.1,
        mapMaxHiresLodLevels : 2,
        mapLowresBackground : 0,
        mapDownloadThreads : 20,
        mapMaxProcessingTime : 1000*20,
        mapMobileMode : false,
        mapMobileModeAutodect : true,
        mapMobileDetailDegradation : 1,
        mapNavSamplesPerViewExtent : 4,
        mapIgnoreNavtiles : false,
        mapVirtualSurfaces : true,
        mapAllowHires : true,
        mapAllowLowres : true,
        mapAllowSmartSwitching : true,
        mapDisableCulling : false,
        mapPreciseCulling : true,
        mapHeightLodBlend : true,
        mapHeightNodeBlend : true,
        mapBasicTileSequence : false,
        mapPreciseBBoxTest : false,
        mapPreciseDistanceTest : false,
        mapHeightfiledWhenUnloaded : true,
        mapForceMetatileV3 : false,
        mapFastHeightfiled : true,
        mapSmartNodeParsing : true,
        mapLoadErrorRetryTime : 3000,
        mapLoadErrorMaxRetryCount : 3,
        mapLoadMode : 'topdown', // "topdown", "downtop", "fit", "fitonly"
        mapGeodataLoadMode : 'fit', //"fitonly"
        mapXhrImageLoad : false,
        mapStoreLoadStats : false,
        mapDegradeHorizon : false,
        mapDegradeHorizonParams : [1, 1500, 97500, 3500], //[1, 3000, 15000, 7000],
        mapFog : true,
        rendererAntialiasing : true,
        rendererAllowScreenshots : false,
        inspector : true, 
        authorization : null, 
        mario : false
    };

    this.configStorage = {}; 
    this.setConfigParams(config);
    this.element = element;
    this.coreInterface = coreInterface;
    //this.options = options;
    this.ready = false;
    this.listeners = [];
    this.listenerCounter = 0;
    this.tokenCookieHost = null;
    this.tokenIFrame = null;
    this.xhrParams = {};
    this.inspector = (Inspector != null) ? (new Inspector(this)) : null;

    this.map = null;
    this.mapInterface = null;
    this.renderer = new Renderer(this, this.element, null, this.onResize.bind(this), this.config);
    this.rendererInterface = new RendererInterface(this.renderer);
    this.proj4 = Proj4;

    //platform detection
    platform.init();
    this.requestAnimFrame = (
               window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback, element) {
                   window.setTimeout(callback, 1000/60);
               });

    window.performance = window.performance || {};
    performance.now = (function() {
        return performance.now       ||
               performance.mozNow    ||
               performance.msNow     ||
               performance.oNow      ||
               performance.webkitNow ||
               function() { return new Date().getTime(); };
    })();

    this.loadMap(this.config.map);

    this.requestAnimFrame.call(window, this.onUpdate.bind(this));
};


Core.prototype.onResize = function() {
    if (this.map != null) {
        this.map.markDirty();
    }
};


Core.prototype.loadMap = function(path) {
    if (this.map != null) {
        this.destroyMap();
    }

    if (path == null) {
        return;
    }
    
    path = utilsUrl_.getProcessUrl(path, window.location.href);

    this.tokenCookieLoaded = true;
    this.mapConfigData = null;
    this.tokenExpiration = null;
    this.tokenExpirationCallback = null;
    this.tokenExpirationLoop = false;
    this.tokenCanBeSkiped = true;
    this.mapRunnig = false;
    
    var onLoaded = (function() {
        if (!(this.tokenCookieLoaded || this.tokenCanBeSkiped) || !this.mapConfigData || this.mapRunnig) {
            return;
        }

        this.mapRunnig = true;
        var data = this.mapConfigData; 
    
        this.callListener('map-mapconfig-loaded', data);

        this.map = new Map(this, data, path, this.config);
        this.mapInterface = new MapInterface(this.map);
        this.setConfigParams(this.map.browserOptions);
        this.setConfigParams(this.configStorage);

        if (this.config.position) {
            this.map.setPosition(this.config.position);
            this.config.position = null;
        }
    
        if (this.config.view) {
            this.map.setView(this.config.view);
            this.config.view = null;
        }
    
        this.callListener('map-loaded', { 'browserOptions':this.map.browserOptions});
    }).bind(this);

    var onMapConfigLoaded = (function(data) {
        this.mapConfigData = data; 
        onLoaded();
    }).bind(this);

    var onMapConfigError = (function() {
    }).bind(this);

    //this.tokenLoaded = true;

    var onAutorizationLoaded = (function(data) {
        this.tokenLoaded = true;
        this.xhrParams['token'] = data['token'];
        this.xhrParams['tokenHeader'] = data['header'];
        this.tokenExpiration = data['expires'] * 1000;
        this.tokenExpirationCallback = (function(){
            //this.tokenLoaded = false;
            //this.tokenCookieLoaded = false;
            this.tokenExpiration = null;
            this.tokenExpirationLoop = true;
            if (typeof this.config.authorization === 'string') {
                utils.loadJSON(this.config.authorization, onAutorizationLoaded, onAutorizationError, null, utils.useCredentials, this.xhrParams);
            } else {
                this.config.authorization(onAutorizationLoaded);
            }
        }).bind(this);
        
        if (!this.tokenExpirationLoop) {
            onLoadMapconfig(path);
        }
        
        if (typeof this.config.authorization === 'string') {
            onLoadImageCookie(data['cookieInjector'], this.config.authorization);
        } else {
            onLoadImageCookie(data['cookieInjector'], path);
        }

    }).bind(this);

    var onAutorizationError = (function() {
        console.log('auth token not loaded');
        
        if (this.tokenCanBeSkiped) {
            onLoadMapconfig(path);
        }
    }).bind(this);

    var onImageCookieLoaded = (function(data) {
        document.body.removeChild(this.tokenIFrame);
        this.tokenIFrame = null;   
        this.tokenCookieLoaded = true;
        onLoaded();
    }).bind(this);

    var onImageCookieError = (function() {
        console.log('auth cookie not loaded');
    }).bind(this);

    //var baseUrl = path.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    var onLoadMapconfig = (function(path) {
        utils.loadJSON(path, onMapConfigLoaded, onMapConfigError, null, utils.useCredentials, this.xhrParams);
    }).bind(this);

    var onLoadImageCookie = (function(url, originUrl) {
        url = utilsUrl_.getProcessUrl(url, originUrl);
        this.tokenCookieHost = utilsUrl_.getHost(url);
        //utils.loadImage(url, onImageCookieLoaded, onImageCookieError);
        var iframe = document.createElement('iframe');
        this.tokenIFrame = iframe;
        iframe.onload = onImageCookieLoaded;
        iframe.src = url;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);   
    }).bind(this);

    //if (false && this.config.authorization) {
    if (this.config.authorization) {
        this.tokenCookieLoaded = false;

        if (typeof this.config.authorization === 'string') {
            utils.loadJSON(this.config.authorization, onAutorizationLoaded, onAutorizationError, null, utils.useCredentials, this.xhrParams);
        } else {
            this.config.authorization(onAutorizationLoaded);
        }
    } else {
        onLoadMapconfig(path);
    }
};


Core.prototype.destroy = function() {
    if (this.killed) {
        return;
    }

    this.destroyMap();
    if (this.renderer) {
        this.renderer.kill();
    }
    this.element = null;
    this.killed = true;
};


Core.prototype.destroyMap = function() {
    if (this.map) {
        this.map.kill();
        this.map = null;
        this.mapInterface = null;
        this.callListener('map-unloaded', {});
    }
};


Core.prototype.getMap = function() {
    return this.map;
};


Core.prototype.getMapInterface = function() {
    return this.mapInterface;
};


Core.prototype.getRenderer = function() {
    return this.renderer;
};


Core.prototype.getRendererInterface = function() {
    return this.rendererInterface;
};


Core.prototype.getProj4 = function() {
    return this.proj4;
};


Core.prototype.getOption = function(key, value) {
};


Core.prototype.setOption = function(key, value) {
};


Core.prototype.on = function(name, listener) {
    if (this.killed) { // || this.renderer == null) {
        return;
    }

    if (listener == null) {
        return;
    }

    this.listenerCounter++;
    this.listeners.push({ name : name, listener : listener, id : this.listenerCounter });

    return (function(id){ this.removeListener(id); }).bind(this, this.listenerCounter);
};


// private
Core.prototype.callListener = function(name, event, log) {
    for (var i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i].name == name) {
            this.listeners[i].listener(event);
        }
    }
    
    if (log) {
        console.log('event ' + name + ': ' + JSON.stringify(event));
    }
};

// private
Core.prototype.removeListener = function(id) {
    for (var i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i].id == id) {
            //this.listeners[i].splice(i, 1);
            this.listeners.splice(i, 1);
            return;
        }
    }
};


Core.prototype.onUpdate = function() {
    if (this.killed) {
        return;
    }

    if (this.map != null) {
        this.map.update();
    }

    //TODO: detect view change
    //this.callListener("view-update", {"position": position, "orientaion":orientation,
    //                                  "fov": renderer.camera.getFov()});

    //this.callListener("render-update", { "dirty": true, "message": "DOM element does not exist" });

    this.callListener('tick', {});

    this.requestAnimFrame.call(window, this.onUpdate.bind(this));
};


Core.prototype.setConfigParams = function(params, onlyMapRelated) {
    if (typeof params === 'object' && params !== null) {
        for (var key in params) {
            this.setConfigParam(key, params[key]);
        }
    }
};


Core.prototype.setConfigParam = function(key, value) {
    if (key == 'pos' || key == 'position' || key == 'view') {
        if (this.getMap()) {
            if (key == 'view') {
                this.getMap().setView(value);
            } else {
                this.getMap().setPosition(new MapPosition(value));
            }
            if (this.configStorage[key]) {
                delete this.configStorage[key];
            }
        } else {
            this.configStorage[key] = value;
        }
    } else if (key == 'map') {
        this.config.map = utils.validateString(value, null);
    } else if (key == 'mapVirtualSurfaces') {
        this.config.mapVirtualSurfaces = utils.validateBool(value, true);
    } else if (key == 'inspector') {
        this.config.inspector = utils.validateBool(value, true);
    } else if (key == 'authorization') {
        this.config.authorization = ((typeof value === 'string') || (typeof value === 'function')) ? value : null;   
    } else {
        if (key.indexOf('map') == 0 || key == 'mario') {
            this.configStorage[key] = value;
            if (this.getMap() != null) {
                this.getMap().setConfigParam(key, value);
            }
        }

        if (key.indexOf('renderer') == 0) {
            this.setRendererConfigParam(key, value);
        }
    }
};


Core.prototype.getConfigParam = function(key) {
    if (key == 'map') {
        return this.config.map;
    } else if (key == 'inspector') {
        return this.config.inspector;
    } else {
        if (key.indexOf('map') == 0 && this.getMap() != null) {
            return this.getMap().getConfigParam(key);
        }

        if (key.indexOf('renderer') == 0) {
            return this.getRendererConfigParam(key);
        }
    }
};


Core.prototype.setRendererConfigParam = function(key, value) {
    switch (key) {
    case 'rendererAntialiasing':       this.config.rendererAntialiasing = utils.validateBool(value, true); break;
    case 'rendererAllowScreenshots':   this.config.rendererAllowScreenshots = utils.validateBool(value, false); break;
    }
};


Core.prototype.getRendererConfigParam = function(key) {
    switch (key) {
    case 'rendererAntialiasing':       return this.config.rendererAntialiasing;
    case 'rendererAllowScreenshots':   return this.config.rendererAllowScreenshots;
    }
};

/*
string getCoreVersion()

    Returns string with VTS version
*/

function getCoreVersion(full) {
    return (full ? 'Core: ' : '') + '2.1.5';
}


/*
bool checkSupport()

    Returns true if the environment is capable of running the WebGL browser, false otherwise.
*/

function checkSupport() {
    platform.init();

    //is webgl supported
    var canvas = document.createElement('canvas');

    if (canvas == null) {
        return false;
    }

    canvas.width = 1024;
    canvas.height = 768;

    if (canvas.getContext == null) {
        return false;
    }

    var gl = null;

    try {
        gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    } catch(e) {
        return false;
    }

    if (!gl) {
        return false;
    }

    return true;
}


export {Core,getCoreVersion,checkSupport};
