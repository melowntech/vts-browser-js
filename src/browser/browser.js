
import {checkSupport as checkSupport_} from '../core/core';
import {CoreInterface as CoreInterface_} from '../core/interface';
import {utils as utils_} from '../core/utils/utils';
import UI_ from './ui/ui';
import Autopilot_ from './autopilot/autopilot';
import ControlMode_ from './control-mode/control-mode';
import Presenter_ from './presenter/presenter';
import Rois_ from './rois/rois';

//get rid of compiler mess
var CoreInterface = CoreInterface_;
var utils = utils_;
var UI = UI_;
var Autopilot = Autopilot_;
var ControlMode = ControlMode_;
var Presenter = Presenter_;
var Rois = Rois_;
var checkSupport = checkSupport_;


var Browser = function(element, config) {
    this.killed = false;
    this.configStorage = {};
    this.initConfig();
    this.setConfigParams(config, true);
    this.originalConfig = JSON.parse(JSON.stringify(config));
    
    this.element = (typeof element === 'string') ? document.getElementById(element) : element; 
    this.ui = new UI(this, this.element);

    element = (typeof element !== 'string') ? element : document.getElementById(element);

    if (!checkSupport()) {
        this.ui.setControlVisible('fallback', true);
        return;
    }

    this.core = new CoreInterface(this.ui.getMapControl().getMapElement().getElement(), config);

    if (this.core == null) {
        this.ui.setControlVisible('fallback', true);
        return;
    }
    
    this.updatePosInUrl = false;
    this.lastUrlUpdateTime = false;
    this.mapLoaded = false;
    this.mapInteracted = false;

    this.autopilot = new Autopilot(this);
    this.rois = new Rois(this);
    this.controlMode = new ControlMode(this, this.ui);
    this.presenter = new Presenter(this, config);

    this.on('map-loaded', this.onMapLoaded.bind(this));
    this.on('map-unloaded', this.onMapUnloaded.bind(this));
    this.on('map-update', this.onMapUpdate.bind(this));
    this.on('map-position-changed', this.onMapPositionChanged.bind(this));
    this.on('map-position-fixed-height-changed', this.onMapPositionFixedHeightChanged.bind(this));
    this.on('map-position-panned', this.onMapPositionPanned.bind(this));
    this.on('map-position-rotated', this.onMapPositionRotated.bind(this));
    this.on('map-position-zoomed', this.onMapPositionZoomed.bind(this));
        
    this.on('tick', this.onTick.bind(this));
};


Browser.prototype.kill = function() {
    this.ui.kill();
    this.killed = true;
};


Browser.prototype.getCore = function() {
    return this.core;
};


Browser.prototype.getMap = function() {
    return this.core ? this.core.map : null;
};


Browser.prototype.getRenderer = function() {
    return this.core ? this.core.renderer : null;
};


Browser.prototype.getProj4 = function() {
    return this.core ? this.core.proj4 : null;
};


Browser.prototype.getUI = function() {
    return this.ui;
};


Browser.prototype.setControlMode = function(mode) {
    this.controlMode = mode;
};


Browser.prototype.getControlMode = function() {
    return this.controlMode;
};


Browser.prototype.on = function(name, listener) {
    return this.core.on(name, listener);
};


Browser.prototype.callListener = function(name, event) {
    this.core.callListener(name, event);
};


Browser.prototype.onMapLoaded = function(event) {
    this.mapLoaded = true;

    //overwrite browser options
    var options = event['browserOptions'] || {};
    var originalOptions = this.originalConfig;
    for (var key in originalOptions) {
        if (typeof options[key] !== 'undefined') {
            options[key] = originalOptions[key]; 
        } 
    }    
    
    this.setConfigParams(options);

    if (this.config.geojson || this.config.geodata) {
        var data = this.config.geojson || this.config.geodata;

        if (typeof data === 'string') {
            data = data.trim();
           
            if (data.charAt(0) == '{') {
                try {
                    data = JSON.parse(data);
                    this.onGeoJsonLoaded(data);
                } catch(e){ }
            } else {
                utils.loadJSON(data, this.onGeoJsonLoaded.bind(this));
            }
        }
    }

    var map = this.getMap();

    if (this.config.tiles3d && map) {
        this.tiles3d = map.createGeodata();
        this.tiles3d.load3DTiles(this.config.tiles3d, {}, this.on3DTilesLoaded.bind(this));
    }

    if (this.autopilot) {
        this.autopilot.setAutorotate(this.config.autoRotate);
        this.autopilot.setAutopan(this.config.autoPan[0], this.config.autoPan[1]);
    }
};


Browser.prototype.getLinkWithCurrentPos = function() {
    var map = this.getMap();
    if (!map) {
        return '';
    }

    //get url params
    var params = utils.getParamsFromUrl(window.location.href);
    
    //get position string
    var p = map.getPosition();
    p = map.convertPositionHeightMode(p, 'fix', true);
    
    var s = '';
    s += p.getViewMode() + ',';
    var c = p.getCoords();
    s += c[0].toFixed(6) + ',' + c[1].toFixed(6) + ',' + p.getHeightMode() + ',' + c[2].toFixed(2) + ',';
    var o = p.getOrientation();
    s += o[0].toFixed(2) + ',' + o[1].toFixed(2) + ',' + o[2].toFixed(2) + ',';
    s += p.getViewExtent().toFixed(2) + ',' + p.getFov().toFixed(2);

    //replace old value with new one    
    params['pos'] = s;

    if (this.mapInteracted) {
        if (params['rotate'] || this.getConfigParam('rotate')) {
            params['rotate'] = '0';
        }
        
        var pan = this.getConfigParam('pan');
        if (params['pan'] || (pan && (pan[0] || pan[1]))) {
            params['pan'] = '0,0';
        }
    }
    
    //convert prameters to url parameters string
    s = '';
    for (var key in params) {
        s += ((s.length > 0) ? '&' : '') + key + '=' + params[key];
    }

    //separete base url and url params
    var urlParts = window.location.href.split('?');
    
    if (urlParts.length > 1) {
        var extraParts = urlParts[1].split('#'); //is there anchor?
        return urlParts[0] + '?' + s + (extraParts[1] || ''); 
    } else {
        return urlParts[0] + '?' + s; 
    }
};


Browser.prototype.onMapPositionChanged = function() {
    if (this.config.positionInUrl) {
        this.updatePosInUrl = true;
    }
};


Browser.prototype.onMapPositionPanned = function() {
    this.mapInteracted = true;
};


Browser.prototype.onMapPositionRotated = function() {
    this.mapInteracted = true;
};


Browser.prototype.onMapPositionZoomed = function() {
    this.mapInteracted = true;
};


Browser.prototype.onMapPositionFixedHeightChanged = function() {
    if (this.config.positionInUrl) {
        this.updatePosInUrl = true;
    }
};


Browser.prototype.onMapUnloaded = function() {
};


Browser.prototype.onMapUpdate = function() {
    this.dirty = true;
};


Browser.prototype.onGeoJsonLoaded = function(data) {
    var map = this.getMap();
    var geodata = map.createGeodata();

    var addFreeLayer = (function(){
        var freeLayer = geodata.makeFreeLayer(this.config.geojsonStyle);
        map.addFreeLayer('geojson', freeLayer);
        var view = map.getView();
        view.freeLayers.geojson = {};
        map.setView(view);
    }).bind(this)

    if (this.config.geodata) {
        geodata.importVTSGeodata(data);
        addFreeLayer();
    } else {
        geodata.importGeoJson(data);
        geodata.processHeights('node-by-precision', 62, addFreeLayer);
    }
};


Browser.prototype.on3DTilesLoaded = function() {
    var map = this.getMap();
    var freeLayer = this.tiles3d.makeFreeLayer({});
    map.addFreeLayer('tiles3d', freeLayer);
    var view = map.getView();
    view.freeLayers.tiles3d = { options: { fastParse: true }};
    map.setView(view);
}


Browser.prototype.onTick = function() {
    if (this.killed) {
        return;
    }

    this.autopilot.tick();
    this.ui.tick(this.dirty);
    this.dirty = false;
    
    if (this.updatePosInUrl) {
        var timer = performance.now(); 
        if ((timer - this.lastUrlUpdateTime) > 1000) {
            if (window.history.replaceState) {
                window.history.replaceState({}, null, this.getLinkWithCurrentPos());
            }        
            this.updatePosInUrl = false;
            this.lastUrlUpdateTime = timer;
        }
    }
};


Browser.prototype.initConfig = function() {
    this.config = {
        panAllowed : true,
        rotationAllowed : true,
        zoomAllowed : true,
        jumpAllowed : false,
        sensitivity : [1, 0.06, 0.05],
        inertia : [0.81, 0.9, 0.7],
        timeNormalizedInertia : false, // legacy inertia [0.8,0.8,0.8] sensitivity [0.5,0.4]
        legacyInertia : false, // legacy inertia [0.8,0.8,0.8] sensitivity [0.5,0.4]
        positionInUrl : false,
        positionUrlHistory : false,
        constrainCamera : true,
        navigationMode : 'azimuthal',
        controlCompass : true,
        controlZoom : true,
        controlSpace : true,
        controlSearch : true,
        controlSearchSrs : null,
        controlSearchUrl : null,
        controlSearchFilter : false,
        controlMeasure : false,
        controlMeasureLite : false,
        controlLink : false,
        controlGithub : false,
        controlScale : true,
        controlLayers : false,
        controlCredits : true,
        controlFullscreen : false,
        controlLoading : true,
        searchElement : null,
        searchValue : null,
        walkMode : false,
        fixedHeight : 0,
        geojson : null,
        tiltConstrainThreshold : [0.5,1],
        bigScreenMargins : false, //75,
        minViewExtent : 20, //75,
        maxViewExtent : Number.MAXINTEGER,
        autoRotate : 0,
        autoPan : [0,0]
    };
};


Browser.prototype.setConfigParams = function(params, ignoreCore) {
    if (typeof params === 'object' && params !== null) {
        for (var key in params) {
            this.setConfigParam(key, params[key], ignoreCore);

            /*if (!(key == "pos" || key == "position" || key == "view" ||
                key.indexOf("map") == 0 || key.indexOf("renderer") == 0)) {
                this.configStorage[key] = params[key];
            }*/
        }
    }
};


Browser.prototype.updateUI = function(key) {
    if (this.ui == null) {
        return;
    }

    this.ui.setParam(key);
};


Browser.prototype.setConfigParam = function(key, value, ignoreCore) {
    var map = this.getMap();

    switch (key) {
    case 'pos':                
    case 'position':
        this.config.position = value;
        if (map) {
            map.setPosition(this.config.position);
        }
        break;
            
    case 'view':
        this.config.view = value;
        if (map) {
            map.setView(this.config.view);
        }
        break;

    case 'panAllowed':             this.config.panAllowed = utils.validateBool(value, true);           break;
    case 'rotationAllowed':        this.config.rotationAllowed = utils.validateBool(value, true);      break;
    case 'zoomAllowed':            this.config.zoomAllowed = utils.validateBool(value, true);          break;
    case 'jumpAllowed':            this.config.jumpAllowed = utils.validateBool(value, false);         break;
    case 'constrainCamera':        this.config.constrainCamera = utils.validateBool(value, true);      break;
    case 'navigationMode':         this.config.navigationMode = value;                                 break;
    case 'positionInUrl':          this.config.positionInUrl = utils.validateBool(value, false);       break;
    case 'positionUrlHistory':     this.config.positionUrlHistory = utils.validateBool(value, false);  break;
    case 'controlCompass':         this.config.controlCompass = utils.validateBool(value, true); this.updateUI(key);    break;
    case 'controlZoom':            this.config.controlZoom = utils.validateBool(value, true); this.updateUI(key);       break;
    case 'controlMeasure':         this.config.controlMeasure = utils.validateBool(value, false); this.updateUI(key);   break;
    case 'controlScale':           this.config.controlScale = utils.validateBool(value, true); this.updateUI(key);      break;
    case 'controlLayers':          this.config.controlLayers = utils.validateBool(value, false); this.updateUI(key);    break;
    case 'controlSpace':           this.config.controlSpace = utils.validateBool(value, false); this.updateUI(key);     break;
    case 'controlSearch':          this.config.controlSearch = utils.validateBool(value, false); this.updateUI(key);    break;
    case 'controlSearchUrl':       this.config.controlSearchUrl = value;    break;
    case 'controlSearchSrs':       this.config.controlSearchSrs = value;    break;
    case 'controlSearchFilter':    this.config.controlSearchFilter = utils.validateBool(value, true);  break;
    case 'controlSearchElement':   this.config.controlSearchElement = value; this.updateUI(key);  break;
    case 'controlSearchValue':     this.config.controlSearchValue = /*utils.validateString(*/value/*, null)*/; this.updateUI(key); break;
    case 'controlLink':            this.config.controlLink = utils.validateBool(value, false); this.updateUI(key);        break;
    case 'controlGithub':          this.config.controlGithub = utils.validateBool(value, false); this.updateUI(key);      break;
    case 'controlMeasure':         this.config.controlMeasure = utils.validateBool(value, false); this.updateUI(key);     break;
    case 'controlMeasureLite':     this.config.controlMeasureLite = utils.validateBool(value, false); this.updateUI(key); break;
    case 'controlLogo':            this.config.controlLogo = utils.validateBool(value, false); this.updateUI(key);        break;
    case 'controlFullscreen':      this.config.controlFullscreen = utils.validateBool(value, true); this.updateUI(key);   break;
    case 'controlCredits':         this.config.controlCredits = utils.validateBool(value, true); this.updateUI(key);      break;
    case 'controlLoading':         this.config.controlLoading = utils.validateBool(value, true); this.updateUI(key);      break;
    case 'minViewExtent':          this.config.minViewExtent = utils.validateNumber(value, 0.01, Number.MAXINTEGER, 100); break;
    case 'maxViewExtent':          this.config.maxViewExtent = utils.validateNumber(value, 0.01, Number.MAXINTEGER, Number.MAXINTEGER); break;
    case 'sensitivity':            this.config.sensitivity = utils.validateNumberArray(value, 3, [0,0,0], [10, 10, 10], [1, 0.12, 0.05]); break;
    case 'inertia':                this.config.inertia = utils.validateNumberArray(value, 3, [0,0,0], [0.99, 0.99, 0.99], [0.85, 0.9, 0.7]); break;
    case 'legacyInertia':          this.config.legacyInertia = utils.validateBool(value, false); break;
    case 'timeNormalizedInertia':  this.config.timeNormalizedInertia = utils.validateBool(value, false); break;
    case 'bigScreenMargins':       this.config.bigScreenMargins = utils.validateBool(value, false); break;
    case 'tiltConstrainThreshold': this.config.tiltConstrainThreshold = utils.validateNumberArray(value, 2, [0.5,1], [-Number.MAXINTEGER, -Number.MAXINTEGER], [Number.MAXINTEGER, Number.MAXINTEGER]); break;
    case 'walkMode':               this.config.walkMode = utils.validateBool(value, false); break;
    case 'fixedHeight':            this.config.fixedHeight = utils.validateNumber(value, -Number.MAXINTEGER, Number.MAXINTEGER, 0); break;
    case 'geodata':                this.config.geodata = value; break;
    case 'tiles3d':                this.config.tiles3d = value; break;
    case 'geojson':                this.config.geojson = value; break;
    case 'geojsonStyle':           this.config.geojsonStyle =  JSON.parse(value); break;
    case 'rotate':             
        this.config.autoRotate = utils.validateNumber(value, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0);
        if (map && this.autopilot) {
            this.autopilot.setAutorotate(this.config.autoRotate);
        }
        break;
    case 'pan':
        if (Array.isArray(value) && value.length == 2){
            this.config.autoPan = [
                utils.validateNumber(value[0], Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0),
                utils.validateNumber(value[1], -360, 360, 0)
            ];
        }

        if (map && this.autopilot) {
            this.autopilot.setAutorotate(this.config.autoRotate);
        }
        break;
    }

    if (ignoreCore) {
        if ((key.indexOf('map') == 0 || key.indexOf('mario') == 0 || key.indexOf('authorization') == 0) && map) {
            map.setConfigParam(key, value);
        }

        if (key.indexOf('renderer') == 0 && this.getRenderer()) {
            this.getRenderer().setConfigParam(key, value);
        }

        if (key.indexOf('debug') == 0 && this.core) {
            this.core.setConfigParam(key, value);
        }

    }
};


Browser.prototype.getConfigParam = function(key) {
    var map = this.getMap();

    switch (key) {
    case 'pos':
    case 'position':
        
        if (map) {
            map.getPosition();
        } else {
            return this.config.position;
        }
            
        break;
        
    case 'view':               

        if (map) {
            return map.getView();
        } else {
            return this.config.view;
        }
            
    case 'panAllowed':             return this.config.panAllowed;
    case 'rotationAllowed':        return this.config.rotationAllowed;
    case 'zoomAllowed':            return this.config.zoomAllowed;
    case 'jumpAllowed':            return this.config.jumpAllowed;
    case 'sensitivity':            return this.config.sensitivity;
    case 'inertia':                return this.config.inertia;
    case 'legacyInertia':          return this.config.legacyInertia;
    case 'timeNormalizedInertia':  return this.config.timeNormalizedInertia;
    case 'bigScreenMargins':       return this.config.bigScreenMargins;
    case 'navigationMode':         return this.config.navigationMode;
    case 'constrainCamera':        return this.config.constrainCamera;
    case 'positionInUrl':          return this.config.positionInUrl;
    case 'positionUrlHistory':     return this.config.positionUrlHistory;
    case 'controlCompass':         return this.config.controlCompass;
    case 'controlZoom':            return this.config.controlZoom;
    case 'controlMeasure':         return this.config.controlMeasure;
    case 'controlScale':           return this.config.controlScale;
    case 'controlLayers':          return this.config.controlLayers;
    case 'controlSpace':           return this.config.controlSpace;
    case 'controlSearch':          return this.config.controlSearch;
    case 'controlLink':            return this.config.controlLink;
    case 'controlGithub':          return this.config.controlGithub;
    case 'controlMeasure':         return this.config.controlMeasure;
    case 'controlMeasureLite':     return this.config.controlMeasureLite;
    case 'controlLogo':            return this.config.controlLogo;
    case 'controlFullscreen':      return this.config.controlFullscreen;
    case 'controlCredits':         return this.config.controlCredits;
    case 'controlLoading':         return this.config.controlLoading;
    case 'controlSearchElement':   return this.config.controlSearchElement;
    case 'controlSearchValue':     return this.config.controlSearchValue;
    case 'controlSearchUrl':       return this.config.controlSearchUrl;
    case 'controlSearchSrs':       return this.config.controlSearchSrs;
    case 'controlSearchFilter':    return this.config.controlSearchFilter;
    case 'minViewExtent':          return this.config.minViewExtent;
    case 'maxViewExtent':          return this.config.maxViewExtent;
    case 'rotate':                 return this.config.autoRotate;
    case 'pan':                    return this.config.autoPan;
    }

    //if (ignoreCore) {
    if (key.indexOf('map') == 0 && map) {
        return map.getConfigParam(key);
    }

    if (key.indexOf('renderer') == 0) {
        return map.getConfigParam(key);
    }
    //}
};


export default Browser;
