import Proj4 from 'melowntech-proj4';
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
    var lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
    this.killed = false;
    this.config = {
        map : null,
        mapCache : 1100, //old value 900
        mapGPUCache : 600, //old value 500, 360
        mapMetatileCache : 60,
        mapTexelSizeFit : 1.1,
        mapMaxHiresLodLevels : 2,
        mapDownloadThreads : 20,
        mapMaxProcessingTime : 10, //1000*20,
        mapMaxGeodataProcessingTime : 10,
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
        mapSmartNodeParsing : true,
        mapLoadErrorRetryTime : 3000,
        mapLoadErrorMaxRetryCount : 3,
        mapLoadMode : 'topdown', // 'topdown', 'downtop', 'fit', 'fitonly'
        mapGeodataLoadMode : 'fit', // 'fitonly'
        mapSplitMeshes : true, // used for topdown load mode
        mapSplitMargin : 0.0025, // used for topdown load mode
        mapSplitSpace : null, // used octant spliting demo
        mapSplitLods : false, // used octant spliting demo
        mapGridMode : 'linear', // 'flat'
        mapGridSurrogatez : false,
        mapGridUnderSurface: 0,
        mapGridTextureLevel: -1,
        mapGridTextureLayer: null, // 'bing",
        mapXhrImageLoad : true,
        mapStoreLoadStats : false,
        mapRefreshCycles : 3,
        mapSoftViewSwitch : true,
        mapSortHysteresis : true,
        mapHysteresisWait : 0,
        mapSeparateLoader : true,
        mapGeodataBinaryLoad : true,
        mapPackLoaderEvents : true,
        mapParseMeshInWorker : true,
        mapPackGeodataEvents : true,
        mapCheckTextureSize : false,
        mapTraverseToMeshNode : true,
        mapNormalizeOctantTexelSize : true,

        mapFeatureStickMode : [1,1],

        map16bitMeshes : true,
        //mapOnlyOneUVs : true,
        mapOnlyOneUVs : false,
        mapIndexBuffers : true,
        mapAsyncImageDecode : true,

        mapFeatureGridCells : 31,
        mapFeaturesPerSquareInch : 0.25, //0.6614,
        mapFeaturesSortByTop : false,

        mapFeaturesReduceMode : 'scr-count1', //have to be 'scr-count1' because of legacy https://rigel.mlwn.se/store/map-config/high-terrain/
        mapFeaturesReduceParams : null,
        mapFeaturesReduceFactor : 1,
        mapFeaturesReduceFactor2 : 1,

        mapDMapSize : 1024,
        mapDMapMode : 1,

        mapDegradeHorizon : false,
        mapDegradeHorizonParams : [1, 1500, 97500, 3500], //[1, 3000, 15000, 7000],
        mapDefaultFont : '//cdn.melown.com/libs/vtsjs/fonts/noto-basic/1.0.0/noto.fnt',
        //mapDefaultFont : '../fonts/basic.fnt',
        mapFog : true,
        mapNoTextures: false,
        mapMetricUnits : !(lang == 'en' || lang.indexOf('en-') == 0),
        mapLanguage : lang,
        mapForceFrameTime: 0,
        mapForcePipeline: 0,
        mapLogGeodataStyles: true,
        mapBenevolentMargins: false,

        rendererAnisotropic : 0,
        rendererAntialiasing : true,
        rendererAllowScreenshots : false,
        inspector : true,
        authorization : null,
        mario : false
    };

    this.configStorage = {};
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
    this.setConfigParams(config);

    this.map = null;
    this.mapInterface = null;
    this.renderer = new Renderer(this, this.element, null, this.onResize.bind(this), this.config);
    this.rendererInterface = new RendererInterface(this.renderer);
    this.proj4 = Proj4;
    this.contextLost = false;

    //platform detection
    platform.init();
    this.requestAnimFrame = (
               window.requestAnimationFrame ||
               window.webkitRequestAnimationFrame ||
               window.mozRequestAnimationFrame ||
               window.oRequestAnimationFrame ||
               window.msRequestAnimationFrame ||
               function(callback) {
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

    path = utilsUrl.getProcessUrl(path, window.location.href);

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

        this.map = new Map(this, data, path, this.config, this.configStorage);
        this.mapInterface = new MapInterface(this.map);
        this.setConfigParams(this.map.browserOptions, true);
        this.setConfigParams(this.configStorage);

        if (this.config.position) {
            this.map.setPosition(this.config.position);
            this.config.position = null;
        }

        if (this.config.view) {
            this.map.setView(this.config.view);
            this.config.view = null;
        }

    }).bind(this);

    var onMapConfigLoaded = (function(data) {
        this.mapConfigData = data;
        onLoaded();
    }).bind(this);

    var onMapConfigError = (function() {
    }).bind(this);

    //this.tokenLoaded = true;

    var onAutorizationLoaded = (function(data) {
        if (!data || (data && data['status'])) {
            if (this.tokenCanBeSkiped) {
                onLoadMapconfig(path);
            }
            return;
        }

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
        // eslint-disable-next-line
        console.log('auth token not loaded');

        if (this.tokenCanBeSkiped) {
            onLoadMapconfig(path);
        }
    }).bind(this);

    var onImageCookieLoaded = (function() {
        document.body.removeChild(this.tokenIFrame);
        this.tokenIFrame = null;
        this.tokenCookieLoaded = true;
        onLoaded();
    }).bind(this);

    /*var onImageCookieError = (function() {
        // eslint-disable-next-line
        console.log('auth cookie not loaded');
    }).bind(this);*/

    //var baseUrl = path.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    var onLoadMapconfig = (function(path) {
        utils.loadJSON(path, onMapConfigLoaded, onMapConfigError, null, utils.useCredentials, this.xhrParams);
    }).bind(this);

    var onLoadImageCookie = (function(url, originUrl) {
        url = utilsUrl.getProcessUrl(url, originUrl);
        this.tokenCookieHost = utilsUrl.getHost(url);
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


Core.prototype.getOption = function(/*key, value*/) {
};


Core.prototype.setOption = function(/*key, value*/) {
};


Core.prototype.on = function(name, listener, wait, once) {
    if (this.killed) { // || this.renderer == null) {
        return;
    }

    if (listener == null) {
        return;
    }

    this.listenerCounter++;
    this.listeners.push({ name : name, listener : listener, id : this.listenerCounter, once: once, wait: wait ? wait : 0 });

    return (function(id){ this.removeListener(id); }).bind(this, this.listenerCounter);
};


Core.prototype.once = function(name, listener, wait) {
    this.on(name, listener, wait, true);
};


// private
Core.prototype.callListener = function(name, event, log) {
    for (var i = 0; i < this.listeners.length; i++) {
        if (this.listeners[i].name == name) {
            var listener = this.listeners[i];

            if (listener.wait > 0) {
                listener.wait--;
            } else {
                listener.listener(event);
                if (listener.once) {
                    this.listeners.splice(i, 1);
                    i--;
                }
            }
        }
    }

    if (log) {
        // eslint-disable-next-line
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

Core.prototype.markDirty = function() {
    if (this.map != null) {
        this.map.markDirty();
    }
};

Core.prototype.onUpdate = function() {
    if (this.killed || this.contextLost) {
        return;
    }

    if (this.map != null) {
        if (!this.map.srsReady && this.map.isReferenceFrameReady()) {
            this.map.srsReady = true;
            this.callListener('map-loaded', { 'browserOptions':this.map.browserOptions});
        }

        this.map.update();
    }

    //TODO: detect view change
    //this.callListener("view-update", {"position": position, "orientaion":orientation,
    //                                  "fov": renderer.camera.getFov()});

    //this.callListener("render-update", { "dirty": true, "message": "DOM element does not exist" });

    this.callListener('tick', {});

    this.requestAnimFrame.call(window, this.onUpdate.bind(this));
};


Core.prototype.setConfigParams = function(params, solveStorage) {
    if (typeof params === 'object' && params !== null) {
        for (var key in params) {
            this.setConfigParam(key, params[key], solveStorage);
        }
    }
};


Core.prototype.setConfigParam = function(key, value, solveStorage) {
    switch(key) {
    case 'pos':
    case 'position':
    case 'view':

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
        break;

    case 'map':
        this.config.map = utils.validateString(value, null); break;
    case 'mapVirtualSurfaces':
        this.config.mapVirtualSurfaces = utils.validateBool(value, true); break;
    case 'mapForcePipeline':
        this.config.mapForcePipeline = utils.validateNumber(value, -1, Number.MAXINTEGER, 0); break;
    case 'mapDMapSize':
        this.config.mapDMapSize = utils.validateNumber(value, 16, Number.MAXINTEGER, 512); break;
    case 'mapDMapMode':
        this.config.mapDMapMode = utils.validateNumber(value, 1, Number.MAXINTEGER, 1); break;
    case 'map16bitMeshes':
        this.config.map16bitMeshes = utils.validateBool(value, false); break;
    case 'inspector':
        this.config.inspector = utils.validateBool(value, true); break;
    case 'authorization':
        this.config.authorization = ((typeof value === 'string') || (typeof value === 'function')) ? value : null;
         break;
    default:
        if (key.indexOf('map') == 0 || key == 'mario') {

            if (!solveStorage || (typeof this.configStorage[key] === 'undefined')) {
                this.configStorage[key] = value;
            }

            if (this.getMap() != null) {
                this.getMap().setConfigParam(key, value);
            }
        }

        if (key.indexOf('renderer') == 0) {
            if (!solveStorage || (typeof this.configStorage[key] === 'undefined')) {
                this.configStorage[key] = value;
            }

            this.setRendererConfigParam(key, value);
        }

        if (key.indexOf('debug') == 0) {
            this.configStorage[key] = value;
            if (this.getMap() != null) {
                this.inspector.setParameter(key, value);
            }
        }

        break;
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
    case 'rendererAnisotropic':        this.config.rendererAnisotropic = utils.validateNumber(value, -1, 2048, 0); if (this.rederer) this.rederer.gpu.setAniso(this.config.rendererAnisotropic); break;
    case 'rendererAntialiasing':       this.config.rendererAntialiasing = utils.validateBool(value, true); break;
    case 'rendererAllowScreenshots':   this.config.rendererAllowScreenshots = utils.validateBool(value, false); break;
    }
};


Core.prototype.getRendererConfigParam = function(key) {
    switch (key) {
    case 'rendererAnisotropic':        return this.config.rendererAnisotropic;
    case 'rendererAntialiasing':       return this.config.rendererAntialiasing;
    case 'rendererAllowScreenshots':   return this.config.rendererAllowScreenshots;
    }
};

/*
string getCoreVersion()

    Returns string with VTS version
*/

function getCoreVersion(full) {
    return (full ? 'Core: ' : '') + '2.23.11';
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
