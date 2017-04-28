
import {vec3 as vec3_} from '../utils/matrix';
import {utils as utils_} from '../utils/utils';
import {platform as platform_} from '../utils/platform';
import MapView_ from './view';
import MapVirtualSurface_ from './virtual-surface';
import MapSurfaceTree_ from './surface-tree';
import MapResourceTree_ from './resource-tree';
import MapSrs_ from './srs';
import MapCache_ from './cache';
import MapCamera_ from './camera';
import MapConfig_ from './config';
import MapConvert_ from './convert';
import MapMeasure_ from './measure';
import MapDraw_ from './draw';
import MapLoader_ from './loader';
import MapPosition_ from './position';
import MapRenderSlots_ from './render-slots';
import MapStats_ from './stats';
import MapSurfaceSequence_ from './surface-sequence';
import MapUrl_ from './url';

//get rid of compiler mess
var vec3 = vec3_;
var utils = utils_;
var platform = platform_;
var MapView = MapView_;
var MapVirtualSurface = MapVirtualSurface_;
var MapSurfaceTree = MapSurfaceTree_;
var MapResourceTree = MapResourceTree_;
var MapSrs = MapSrs_;
var MapCache = MapCache_;
var MapCamera = MapCamera_;
var MapConfig = MapConfig_;
var MapConvert = MapConvert_;
var MapMeasure = MapMeasure_;
var MapDraw = MapDraw_;
var MapLoader = MapLoader_;
var MapPosition = MapPosition_;
var MapRenderSlots = MapRenderSlots_;
var MapStats = MapStats_;
var MapSurfaceSequence = MapSurfaceSequence_;
var MapUrl = MapUrl_;


var Map = function(core, mapConfig, path, config) {
    this.config = config || {};
    this.setConfigParams(config);
    this.core = core;
    this.proj4 = this.core.getProj4();
    this.coreConfig = core.coreConfig;
    this.killed = false;
    this.config = config || {};
    this.loaderSuspended = false;

    this.url = new MapUrl(this, path);

    this.position = new MapPosition(['obj', 0, 0, 'fix', 0,  0, 0, 0,  0, 0]);
    this.lastPosition = this.position.clone();

    this.srses = {};
    this.referenceFrame = {};
    this.credits = {};
    this.creditsByNumber = {};
    this.surfaces = [];
    this.virtualSurfaces = {};
    this.glues = {};
    this.freeLayers = [];
    this.boundLayers = [];
    this.dynamicLayers = [];
    this.stylesheets = [];
    this.processingTasks = [];
    this.geodataProcessors = [];

    this.surfaceSequence = new MapSurfaceSequence(this);

    this.initialView = null;
    this.currentView = new MapView(this, {});
    this.currentViewString = '';
    this.namedViews = [];
    this.viewCounter = 0;

    this.freeLayerSequence = [];
    this.freeLayersHaveGeodata = false;

    this.visibleCredits = {
        imagery : {},
        glueImagery : {},
        mapdata : {}
    };
    
    this.mobile = false;
    this.metanodeBuffer = new Uint8Array(1024);
   
    this.gpuCache = new MapCache(this, this.config.mapGPUCache*1024*1024);
    this.resourcesCache = new MapCache(this, this.config.mapCache*1024*1024);
    this.metatileCache = new MapCache(this, this.config.mapMetatileCache*1024*1024);

    this.setupMobileMode(this.config.mapMobileMode);
    this.setupCache();

    this.loader = new MapLoader(this, this.config.mapDownloadThreads);

    this.renderer = this.core.renderer;
    this.camera = new MapCamera(this);

    this.stats = new MapStats(this);
    this.resourcesTree = new MapResourceTree(this);
   
    this.mapConfig = new MapConfig(this, mapConfig);
    this.convert = new MapConvert(this);
    this.measure = new MapMeasure(this);
    this.convert.measure = this.measure;

    this.isGeocent = !this.getNavigationSrs().isProjected();

    this.tree = new MapSurfaceTree(this, false);
    this.mapConfig.afterConfigParsed();

    this.updateCoutner = 0;

    this.dirty = true;
    this.hitMapDirty = true;
    this.geoHitMapDirty = true;

    this.clickEvent = null;
    this.hoverEvent = null;
    this.hoverFeature = null;
    this.hoverFeatureId = null;
    this.lastHoverFeature = null;
    this.lastHoverFeatureId = null;
    this.hoverFeatureCounter = 0;
    this.hoverFeatureList = [];
    
    this.draw = new MapDraw(this);
    this.draw.setupDetailDegradation();

    this.renderSlots = new MapRenderSlots(this);
    this.renderSlots.addRenderSlot('map', this.drawMap.bind(this), true);
};


Map.prototype.kill = function() {
    this.killed = true;
    
    this.tree.kill();

    for (var key in this.freeLayers) {
        this.getFreeLayer(key).tree.kill();
    }

    this.gpuCache.clear();
    this.resourcesCache.clear();
    this.metatileCache.clear();

    if (this.renderer != null) {
        this.renderer.kill();
        this.renderer = null;
    }
};


Map.prototype.setupMobileMode = function() {
    this.mobile = this.config.mapMobileMode;

    if (!this.mobile && this.config.mapMobileModeAutodect) {
        this.mobile = platform.isMobile();        
    }

    this.setupCache();
};


Map.prototype.setupCache = function() {
    if (!this.resourcesCache) {
        return;
    }

    var factor = 1 / (this.mobile ? Math.pow(2, Math.max(0,this.config.mapMobileDetailDegradation-1)) : 1);
    var factor2 = 1 / (this.mobile ? Math.pow(2, this.config.mapMobileDetailDegradation) : 1);
    factor = (factor + factor2) * 0.5;
    this.resourcesCache.setMaxCost(this.config.mapCache*1024*1024*factor);
    this.gpuCache.setMaxCost(this.config.mapGPUCache*1024*1024*factor);
    this.metatileCache.setMaxCost(this.config.mapMetatileCache*1024*1024*(factor < 0.8 ? 0.5 : 1));
};


Map.prototype.getCoreInterface = function() {
    return this.core.interface;
};


Map.prototype.getRendererInterface = function() {
    return this.core.interface.getRendererInterface();
};


Map.prototype.setOption = function(key, value) {
};


Map.prototype.getOption = function(key) {
};


Map.prototype.addSrs = function(id, srs) {
    this.srses[id] = srs;
};


Map.prototype.getSrs = function(srsId) {
    return this.srses[srsId];
};


Map.prototype.getSrses = function() {
    return this.getMapKeys(this.srses);
};


Map.prototype.setReferenceFrame = function(referenceFrame) {
    this.referenceFrame = referenceFrame;
};


Map.prototype.addCredit = function(id, credit) {
    this.credits[id] = credit;
    this.creditsByNumber[credit.id] = credit;
    credit.key = id;
};


Map.prototype.getCreditByNumber = function(id) {
    return this.creditsByNumber[id];
};


Map.prototype.getCreditById = function(id) {
    return this.credits[id];
};


Map.prototype.getCredits = function() {
    return this.getMapKeys(this.credits);
};


Map.prototype.getVisibleCredits = function() {
    var imagery = this.visibleCredits.imagery;
    var glueImagery = this.visibleCredits.glueImagery;
    var imageryArray = []; 
    var imagerySpecificity = []; 

    for (var key in glueImagery) {
        if (!imagery[key]) {
            imagery[key] = glueImagery[key];
        }
    }
    
    this.visibleCredits.glueImagery = {};
    
    for (var key in imagery) {
        imageryArray.push(key);
        imagerySpecificity.push(imagery[key]); 
    }

    //sort imagery
    do {
        var sorted = true;
        
        for (var i = 0, li = imagerySpecificity.length - 1; i < li; i++) {
            if (imagerySpecificity[i] < imagerySpecificity[i+1]) {
                var t = imagerySpecificity[i];
                imagerySpecificity[i] = imagerySpecificity[i+1];
                imagerySpecificity[i+1] = t;
                t = imageryArray[i];
                imageryArray[i] = imageryArray[i+1];
                imageryArray[i+1] = t;
                sorted = false;
            } 
        }
        
    } while(!sorted);

    var mapdata = this.visibleCredits.mapdata;
    var mapdataArray = []; 
    var mapdataSpecificity = []; 

    for (var key in mapdata) {
        mapdataArray.push(key);
        mapdataSpecificity.push(mapdata[key]); 
    }
    
    //sort imagery
    do {
        var sorted = true;
        
        for (var i = 0, li = mapdataSpecificity.length - 1; i < li; i++) {
            if (mapdataSpecificity[i] < mapdataSpecificity[i+1]) {
                var t = mapdataSpecificity[i];
                mapdataSpecificity[i] = mapdataSpecificity[i+1];
                mapdataSpecificity[i+1] = t;
                t = mapdataArray[i];
                mapdataArray[i] = mapdataArray[i+1];
                mapdataArray[i+1] = t;
                sorted = false;
            } 
        }
        
    } while(!sorted);

    return {
        '3D' : [], 
        'imagery' : imageryArray, 
        'mapdata' : mapdataArray 
    };
};


Map.prototype.addSurface = function(id, surface) {
    this.surfaces.push(surface);
    surface.index = this.surfaces.length - 1; 
};


Map.prototype.getSurface = function(id) {
    return this.searchArrayById(this.surfaces, id);
};


Map.prototype.getSurfaces = function() {
    var keys = [];
    for (var i = 0, li = this.surfaces.length; i < li; i++) {
        keys.push(this.surfaces[i].id);
    }
    return keys;
};


Map.prototype.addGlue = function(id, glue) {
    this.glues[id] = glue;
};


Map.prototype.getGlue = function(id) {
    return this.glues[id];
};


Map.prototype.addBoundLayer = function(id, layer) {
    this.boundLayers[id] = layer;
};


Map.prototype.setBoundLayerOptions = function(id, options) {
    if (this.boundLayers[id]) {
        this.boundLayers[id].setOptions(options);
    }
};


Map.prototype.getBoundLayerOptions = function(id) {
    if (this.boundLayers[id]) {
        return this.boundLayers[id].getOptions();
    }
    
    return null;
};


Map.prototype.removeBoundLayer = function(id, layer) {
    if (this.boundLayers[id]) {
        this.boundLayers[id].kill();
        this.boundLayers[id] = null;
    }
};


Map.prototype.getBoundLayerByNumber = function(number) {
    var layers = this.boundLayers;
    for (var key in layers) {
        if (layers[key].numberId == number) {
            return layers[key];
        }
    }

    return null;
};


Map.prototype.getBoundLayerById = function(id) {
    return this.boundLayers[id];
};


Map.prototype.getBoundLayers = function() {
    return this.getMapKeys(this.boundLayers);
};


Map.prototype.addFreeLayer = function(id, layer) {
    this.freeLayers[id] = layer;
    this.setView(this.getView());
    this.markDirty();
};


Map.prototype.removeFreeLayer = function(id) {
    if (this.freeLayers[id]) {
        this.freeLayers[id].kill();
        this.freeLayers[id] = null;
        this.setView(this.getView());
        this.markDirty();
    }
};


Map.prototype.setFreeLayerOptions = function(id, options) {
    if (this.freeLayers[id]) {
        this.freeLayers[id].setOptions(options);
    }
};


Map.prototype.getFreeLayerOptions = function(id) {
    if (this.freeLayers[id]) {
        return this.freeLayers[id].getOptions();
    }
    
    return null;
};


Map.prototype.getFreeLayer = function(id) {
    return this.freeLayers[id];
    //return this.searchArrayById(this.freeLayers, id);
};


Map.prototype.getFreeLayers = function() {
    var keys = [];
    for (var key in this.freeLayers) {
        keys.push(key);
    }
    return keys;    
};


Map.prototype.getMapsSrs = function(srs) {
    if (srs == null) {
        return null;
    }

    //is it proj4 string?
    if (srs.indexOf('+proj') != -1) {
        return new MapSrs(this, {'srsDef':srs});
    }

    //search existing srs
    return this.srses[srs];
};


Map.prototype.addNamedView = function(id, view) {
    this.namedViews[id] = view;
};


Map.prototype.getNamedView = function(id) {
    return this.namedViews[id];
};


Map.prototype.getNamedViews = function() {
    return this.getMapKeys(this.namedViews);
};


Map.prototype.setView = function(view, forceRefresh) {
    if (view == null) {
        return;
    }
    
    if (typeof view === 'string') {
        view = view.trim();
        
        if (view.charAt(0) == '{') {
            try {
                view = JSON.parse(view);
            } catch(e){
                return;            
            }
        } else {
            view = this.getNamedView(view);

            if (!view) {
                return;
            }
            
            //view = JSON.parse(JSON.stringify(view));
            view = view.getInfo();
        }
    }

    var string = JSON.stringify(view);
    if (string != this.currentViewString || forceRefresh) {
        this.currentView.parse(view);
        this.currentViewString = string;
        this.viewCounter++;
    }

    this.surfaceSequence.generateSurfaceSequence();
    this.surfaceSequence.generateBoundLayerSequence();

    var freeLayers = this.currentView.freeLayers;
    this.freeLayerSequence = [];

    for (var key in freeLayers) {
        var freeLayer = this.getFreeLayer(key);
        
        if (freeLayer) {
            
            freeLayer.zFactor = freeLayers[key]['depthShift'] || 0;
            
            this.freeLayerSequence.push(freeLayer);
            
            if (freeLayers[key]['style']) {
                freeLayer.setStyle(freeLayers[key]['style']);
            } else {
                freeLayer.setStyle(freeLayer.originalStyle);
            }
            
            //TODO: generate bound layer seqence for      
        }
    }

    this.markDirty();
};


Map.prototype.addStylesheet = function(id, style) {
    this.stylesheets[id] = style;
};


Map.prototype.getStylesheet = function(id) {
    return this.stylesheets[id];
    //return this.searchArrayById(this.stylesheets, id);
};


Map.prototype.getStylesheets = function() {
    var keys = [];

    for (var key in this.stylesheets) {
        keys.push(key);
    }
    return keys;
};


Map.prototype.getStylesheetData = function(id, data) {
    var stylesheet = this.getStylesheet(id);

    if (stylesheet) {
        return {'url':stylesheet.url, 'data': stylesheet.data};
    }
    
    return {'url':null, 'data':{}};
};


Map.prototype.setStylesheetData = function(id, data) {
    var stylesheet = this.getStylesheet(id);
    
    if (stylesheet) {
        stylesheet.data = data;
    }

    if (stylesheet) {
        stylesheet.setData(data);

        for (var key in this.freeLayers) {
            var freeLayer = this.getFreeLayer(key);
            if (freeLayer && freeLayer.geodata && freeLayer.stylesheet == stylesheet) {
                
                if (freeLayer.geodataProcessor) {
                    freeLayer.geodataProcessor.sendCommand('setStylesheet', { 'data' : freeLayer.stylesheet.data, 'geocent' : (!this.getNavigationSrs().isProjected()) });
                }

                freeLayer.geodataCounter++;
            }
        }
    }

    this.markDirty();
        
    //TODO: reset geodatview in free layers
};


Map.prototype.getView = function() {
    return this.currentView.getInfo();
};


Map.prototype.refreshView = function() {
    this.viewCounter++;
    this.surfaceSequence.generateSurfaceSequence();
    this.surfaceSequence.generateBoundLayerSequence();
    this.markDirty();
};


Map.prototype.searchArrayIndexById = function(array, id) {
    for (var i = 0, li = array.length; i < li; i++) {
        if (array[i].id == id) {
            return i;
        }
    }

    return -1;
};


Map.prototype.searchArrayById = function(array, id) {
    for (var i = 0, li = array.length; i < li; i++) {
        if (array[i].id == id) {
            return array[i];
        }
    }

    return null;
};


Map.prototype.searchMapByInnerId = function(map, id) {
    for (var key in map) {
        if (map[key].id == id) {
            return map[key];
        }
    }

    return null;
};


Map.prototype.getMapKeys = function(map) {
    var keys = [];
    for (var key in map) {
        keys.push(key);
    }

    return keys;
};


Map.prototype.getMapIds = function(map) {
    var keys = [];
    for (var key in map) {
        keys.push(key.id);
    }

    return keys;
};


Map.prototype.setPosition = function(pos) {
    this.position = new MapPosition(pos);
    this.markDirty();
};


Map.prototype.getPhysicalSrs = function(coords, source, destination) {
    return this.referenceFrame.model.physicalSrs;
};


Map.prototype.getPublicSrs = function() {
    return this.referenceFrame.model.publicSrs;
};


Map.prototype.getNavigationSrs = function() {
    return this.referenceFrame.model.navigationSrs;
};


Map.prototype.getPosition = function() {
    return this.position.clone();
};


Map.prototype.setConfigParams = function(params) {
    if (typeof params === 'object' && params !== null) {
        for (var key in params) {
            this.setConfigParam(key, params[key]);
        }
    }
};


Map.prototype.setConfigParam = function(key, value) {
    switch (key) {
    case 'map':                           this.config.map = utils.validateString(value, null); break;
    case 'mapCache':                      this.config.mapCache = utils.validateNumber(value, 10, Number.MAXINTEGER, 900); this.setupCache(); break;
    case 'mapGPUCache':                   this.config.mapGPUCache = utils.validateNumber(value, 10, Number.MAXINTEGER, 360); this.setupCache(); break;
    case 'mapMetatileCache':              this.config.mapMetatileCache = utils.validateNumber(value, 10, Number.MAXINTEGER, 60); this.setupCache(); break;
    case 'mapTexelSizeFit':               this.config.mapTexelSizeFit = utils.validateNumber(value, 0.0001, Number.MAXINTEGER, 1.1); break;
    case 'mapLowresBackground':           this.config.mapLowresBackground = utils.validateNumber(value, 0, Number.MAXINTEGER, 0); break;
    case 'mapDownloadThreads':            this.config.mapDownloadThreads = utils.validateNumber(value, 1, Number.MAXINTEGER, 6); break;
    case 'mapMaxProcessingTime':          this.config.mapMaxProcessingTime = utils.validateNumber(value, 1, Number.MAXINTEGER, 1000/20); break;
    case 'mapMobileMode':                 this.config.mapMobileMode = utils.validateBool(value, false); this.setupMobileMode(); break;
    case 'mapMobileModeAutodect':         this.config.mapMobileModeAutodect = utils.validateBool(value, false); break;
    case 'mapMobileDetailDegradation':    this.config.mapMobileDetailDegradation = utils.validateNumber(value, 1, Number.MAXINTEGER, 2); break;
    case 'mapNavSamplesPerViewExtent':    this.config.mapNavSamplesPerViewExtent = utils.validateNumber(value, 0.00000000001, Number.MAXINTEGER, 4); break;
    case 'mapFog':                        this.config.mapFog = utils.validateBool(value, false); break;
    case 'mapIgnoreNavtiles':             this.config.mapIgnoreNavtiles = utils.validateBool(value, false); break;
    case 'mapAllowHires':                 this.config.mapAllowHires = utils.validateBool(value, true); break;
    case 'mapAllowLowres':                this.config.mapAllowLowres = utils.validateBool(value, true); break;
    case 'mapAllowSmartSwitching':        this.config.mapAllowSmartSwitching = utils.validateBool(value, true); break;
    case 'mapDisableCulling':             this.config.mapDisableCulling = utils.validateBool(value, false); break;
    case 'mapPreciseCulling':             this.config.mapPreciseCulling = utils.validateBool(value, false); break;
    case 'mapHeightLodBlend':             this.config.mapHeightLodBlend = utils.validateBool(value, true); break;
    case 'mapHeightNodeBlend':            this.config.mapHeightNodeBlend = utils.validateBool(value, true); break;
    case 'mapBasicTileSequence':          this.config.mapBasicTileSequence = utils.validateBool(value, true); break;
    case 'mapSmartNodeParsing':           this.config.mapSmartNodeParsing = utils.validateBool(value, true); break;
    case 'mapStoreLoadStats':             this.config.mapStoreLoadStats = utils.validateBool(value, true);  if (this.draw && this.draw.replay) this.draw.replay.storeLoaded = this.config.mapStoreLoadStats; break;
    case 'mapXhrImageLoad':               this.config.mapXhrImageLoad = utils.validateBool(value, false); break;
    case 'mapLoadMode':                   this.config.mapLoadMode = utils.validateString(value, 'topdown'); break;
    case 'mapGeodataLoadMode':            this.config.mapGeodataLoadMode = utils.validateString(value, 'fit'); break;
    case 'mapPreciseBBoxTest':            this.config.mapPreciseBBoxTest = utils.validateBool(value, true); break;
    case 'mapPreciseDistanceTest':        this.config.mapPreciseDistanceTest = utils.validateBool(value, false); break;
    case 'mapHeightfiledWhenUnloaded':    this.config.mapHeightfiledWhenUnloaded= utils.validateBool(value, false); break;
    case 'mapForceMetatileV3':            this.config.mapForceMetatileV3= utils.validateBool(value, false); break;
    case 'mapVirtualSurfaces':            this.config.mapVirtualSurfaces = utils.validateBool(value, true); break;
    case 'mapDegradeHorizon':             this.config.mapDegradeHorizon = utils.validateBool(value, true); break;
    case 'mapDegradeHorizonParams':       this.config.mapDegradeHorizonParams = utils.validateNumberArray(value, 4, [0,1,1,1], [Number.MAXVALUE, Number.MAXVALUE, Number.MAXVALUE], [1, 3000, 15000, 7000]); break;
    case 'mario':                         this.config.mario = utils.validateBool(value, true); break;
    }
};


Map.prototype.getConfigParam = function(key) {
    switch (key) {
    case 'map':                           return this.config.map;
    case 'mapCache':                      return this.config.mapCache;
    case 'mapGPUCache':                   return this.config.mapGPUCache;
    case 'mapMetatileCache':              return this.config.mapMetatileCache;
    case 'mapTexelSizeFit':               return this.config.mapTexelSizeFit;
    case 'mapLowresBackground':           return this.config.mapLowresBackground;
    case 'mapDownloadThreads':            return this.config.mapDownloadThreads;
    case 'mapMaxProcessingTime':          return this.config.mapMaxProcessingTime;
    case 'mapMobileMode':                 return this.config.mapMobileMode;
    case 'mapMobileModeAutodect':         return this.config.mapMobileModeAutodect;
    case 'mapMobileDetailDegradation':    return this.config.mapMobileDetailDegradation;
    case 'mapNavSamplesPerViewExtent':    return this.config.mapNavSamplesPerViewExtent;
    case 'mapFog':                        return this.config.mapFog;
    case 'mapIgnoreNavtiles':             return this.config.mapIgnoreNavtiles;
    case 'mapAllowHires':                 return this.config.mapAllowHires;
    case 'mapAllowLowres':                return this.config.mapAllowLowres;
    case 'mapAllowSmartSwitching':        return this.config.mapAllowSmartSwitching;
    case 'mapDisableCulling':             return this.config.mapDisableCulling;
    case 'mapPreciseCulling':             return this.config.mapPreciseCulling;
    case 'mapHeightLodBlend':             return this.config.mapHeightLodBlend;
    case 'mapHeightNodeBlend':            return this.config.mapHeightNodeBlend;
    case 'mapBasicTileSequence':          return this.config.mapBasicTileSequence;
    case 'mapSmartNodeParsing':           return this.config.mapSmartNodeParsing;
    case 'mapStoreLoadStats':             return this.config.mapStoreLoadStats;
    case 'mapXhrImageLoad':               return this.config.mapXhrImageLoad;
    case 'mapLoadMode':                   return this.config.mapLoadMode;
    case 'mapGeodataLoadMode':            return this.config.mapGeodataLoadMode;
    case 'mapPreciseBBoxTest':            return this.config.mapPreciseBBoxTest;
    case 'mapPreciseDistanceTest':        return this.config.mapPreciseDistanceTest;
    case 'mapHeightfiledWhenUnloaded':    return this.config.mapHeightfiledWhenUnloaded;
    case 'mapForceMetatileV3':            return this.config.mapForceMetatileV3;
    case 'mapVirtualSurfaces':            return this.config.mapVirtualSurfaces;
    case 'mapDegradeHorizon':             return this.config.mapDegradeHorizon;
    case 'mapDegradeHorizonParams':       return this.config.mapDegradeHorizonParams;
    case 'mario':                         return this.config.mario;
    }
};

Map.prototype.click = function(screenX, screenY, state) {
    this.clickEvent = [screenX, screenY, state];
};


Map.prototype.hover = function(screenX, screenY, persistent, state) {
    this.hoverEvent = [screenX, screenY, persistent, state];
};


Map.prototype.markDirty = function() {
    this.dirty = true;
    this.hitMapDirty = true;
    this.geoHitMapDirty = true;
};


Map.prototype.getScreenRay = function(screenX, screenY) {
    return this.renderer.getScreenRay(screenX, screenY);
};


Map.prototype.getHitCoords = function(screenX, screenY, mode, lod) {
    if (this.hitMapDirty) {
        this.draw.drawHitmap();
    }

    var cameraSpaceCoords = this.renderer.hitTest(screenX, screenY);
    
    var fallbackUsed = false; 
    var cameraPos = this.camera.position;
    var worldPos;

    var ray = cameraSpaceCoords[4];

    if (this.getNavigationSrs().isProjected()) { //plane fallback
        var planePos = [0,0,Math.min(-1000,this.referenceFrame.getGlobalHeightRange()[0])];
        var planeNormal = [0,0,1];

        var d = vec3.dot(planeNormal, ray); //minification is wrong there
        //if (d > 1e-6) {
        var a = [planePos[0] - cameraPos[0], planePos[1] - cameraPos[1], planePos[2] - cameraPos[2]];
        t = vec3.dot(a, planeNormal) / d;
            
            //var t = (vec3.dot(cameraPos, planeNormal) + (-500)) / d;            
        if (t >= 0) {
            if (!cameraSpaceCoords[3] || t < cameraSpaceCoords[5]) {
                worldPos = [ (ray[0] * t) + cameraPos[0],
                    (ray[1] * t) + cameraPos[1],
                    (ray[2] * t) + cameraPos[2] ];
    
                fallbackUsed = true;
            }
        }
        //}

    } else /*if (false)*/ { //elipsoid fallback
        var navigationSrsInfo = this.getNavigationSrs().getSrsInfo();
        var planetRadius = navigationSrsInfo['b'] + this.referenceFrame.getGlobalHeightRange()[0];
    
        var offset = [cameraPos[0], cameraPos[1], cameraPos[2]];
        var a = vec3.dot(ray, ray); //minification is wrong there
        var b = 2 * vec3.dot(ray, offset);
        var c = vec3.dot(offset, offset) - planetRadius * planetRadius;
        var d = b * b - 4 * a * c;
        
        if (d > 0) {
            d = Math.sqrt(d);
            var t1 = (-b - d) / (2*a);
            var t2 = (-b + d) / (2*a);
            var t = (t1 < t2) ? t1 : t2;
            
            if (!cameraSpaceCoords[3] || t < cameraSpaceCoords[5]) {
                worldPos = [ (ray[0] * t) + cameraPos[0],
                    (ray[1] * t) + cameraPos[1],
                    (ray[2] * t) + cameraPos[2] ];

                fallbackUsed = true;
            }
        }   
    }
    
    if (!cameraSpaceCoords[3] && !fallbackUsed) {
        return null;
    }
    
    if (!fallbackUsed) {
        worldPos = [ cameraSpaceCoords[0] + cameraPos[0],
            cameraSpaceCoords[1] + cameraPos[1],
            cameraSpaceCoords[2] + cameraPos[2] ];
    }

    var navCoords = this.convert.convertCoords(worldPos, 'physical', 'navigation');

    if (mode == 'float') {
        var lod =  (lod != null) ? lod : this.measure.getOptimalHeightLod(navCoords, 100, this.config.mapNavSamplesPerViewExtent);
        var surfaceHeight = this.measure.getSurfaceHeight(navCoords, lod);
        navCoords[2] -= surfaceHeight[0]; 
    }

    return navCoords;
};


Map.prototype.hitTestGeoLayers = function(screenX, screenY, mode) {
    if (this.geoHitMapDirty) {
        if (this.freeLayersHaveGeodata) {
            this.draw.drawGeodataHitmap();
        }
    }

    if (!this.freeLayersHaveGeodata) {
        this.lastHoverFeature = null;
        this.lastHoverFeatureId = null;
        this.hoverFeature = null;
        this.hoverFeatureId = null;

        return [null, false, []];
    }

    var res = this.renderer.hitTestGeoLayers(screenX, screenY, mode);

    if (res[0]) { //do we hit something?
        //console.log(JSON.stringify([id, JSON.stringify(this.hoverFeatureList[id])]));
        
        var id = (res[1]) + (res[2]<<8);
        var elementId = (res[3]) + (res[4]<<8);
		
        var feature = this.hoverFeatureList[id];

        if (mode == 'hover') {
            this.lastHoverFeature = this.hoverFeature;
            this.lastHoverFeatureId = this.hoverFeatureId;
            
            if (feature && feature[3]) {
                this.hoverFeature = feature;
                this.hoverFeatureId = (feature != null) ? feature[0]['#id'] : null;
            } else {
                this.hoverFeature = null;
                this.hoverFeatureId = null;
            }

            var relatedEvents = [];

            if (this.hoverFeatureId != this.lastHoverFeatureId) {
                if (this.lastHoverFeatureId != null) {
                    relatedEvents.push(['leave', this.lastHoverFeature, this.lastHoverFeatureId]);
                }

                if (this.hoverFeatureId != null) {
                    relatedEvents.push(['enter', this.hoverFeature, this.hoverFeatureId]);
                }

                this.dirty = true;
            }

            if (this.hoverFeature != null && this.hoverFeature[3] == true) {
                return [this.hoverFeature, true, relatedEvents];
            } else {
                return [null, false, relatedEvents];
            }
        }

        if (mode == 'click') {
            //this.hoverFeatureId = (this.hoverFeature != null) ? this.hoverFeature["id"] : null;

            if (feature != null && feature[2]) {
                return [feature, true, []];
            } else {
                return [null, false, []];
            }
        }
    } else {
        var relatedEvents = [];

        if (mode == 'hover') {
            this.lastHoverFeature = this.hoverFeature;
            this.lastHoverFeatureId = this.hoverFeatureId;
            this.hoverFeature = null;
            this.hoverFeatureId = null;

            if (this.lastHoverFeatureId != null) {
                if (this.lastHoverFeatureId != null) {
                    relatedEvents.push(['leave', this.lastHoverFeature, this.lastHoverFeatureId]);
                }

                this.dirty = true;
            }
        }

        return [null, false, relatedEvents];
    }
};


Map.prototype.applyCredits = function(tile) {
    for (var key in tile.imageryCredits) {
        var value = tile.imageryCredits[key];
        var value2 = this.visibleCredits.imagery[key];

        if (value2) {
            this.visibleCredits.imagery[key] = value > value2 ? value : value2;
        } else {
            this.visibleCredits.imagery[key] = value;
        }
    }
    for (var key in tile.glueImageryCredits) {
        var value = tile.glueImageryCredits[key];
        var value2 = this.visibleCredits.imagery[key];

        if (value2) {
            this.visibleCredits.glueImagery[key] = value > value2 ? value : value2;
        } else {
            this.visibleCredits.glueImagery[key] = value;
        }
    }
    for (var key in tile.mapdataCredits) {
        var value = tile.mapdataCredits[key];
        var value2 = this.visibleCredits.mapdata[key];

        if (value2) {
            this.visibleCredits.mapdata[key] = value > value2 ? value : value2;
        } else {
            this.visibleCredits.mapdata[key] = value;
        }
    }
    
    /*if (this.drawBBoxes) {
        console.log(JSON.stringify(tile.id) + " " + JSON.stringify(this.visibleCredits));
    }*/
};


Map.prototype.drawMap = function() {
    this.draw.drawMap(null);
};


Map.prototype.processProcessingTasks = function() {
    while (this.processingTasks.length > 0) {
        if (this.stats.renderBuild > this.config.mapMaxProcessingTime) {
            this.markDirty();
            return;
        }

        this.processingTasks[0]();
        this.processingTasks.shift();
    }
};


Map.prototype.addProcessingTask = function(task) {
    this.processingTasks.push(task);
};


Map.prototype.update = function() {
    if (this.killed) {
        return;
    }

    if (this.core.tokenExpiration) {
        if (Date.now() > (this.core.tokenExpiration - (1000*60))) {
            this.core.tokenExpirationCallback();
        }
    }

    if (this.div != null && this.div.style.visibility == 'hidden'){
        //loop heartbeat
        //window.requestAnimFrame(this.update.bind(this));
        return;
    }

    if (!this.position.isSame(this.lastPosition)) {
        this.core.callListener('map-position-changed', {'position':this.position.toArray(), 'last-position':this.lastPosition.toArray()});
    }

    if (this.camera.lastTerrainHeight != this.camera.terrainHeight) {
        this.core.callListener('map-position-fixed-height-changed', {'height':this.camera.terrainHeight, 'last-height':this.camera.lastTerrainHeight});
    }

    this.lastPosition = this.position.clone();
    this.camera.lastTerrainHeight = this.camera.terrainHeight;
    this.drawFog = this.config.mapFog;

    var rect = this.renderer.div.getBoundingClientRect();

    if (this.renderer.curSize[0] != rect.width || this.renderer.curSize[1] != rect.height) {
        this.renderer.onResize();
        this.dirty = true;
    }

    var dirty = this.dirty;
    this.stats.begin(dirty);

    this.loader.update();

    this.processProcessingTasks();

    if (this.dirty) {
        this.dirty = false;
        this.bestMeshTexelSize = 0;//Number.MAXVALUE;
        this.bestGeodataTexelSize = 0;//Number.MAXVALUE;
        
        this.renderSlots.processRenderSlots();

        this.loader.update();
        
        this.core.callListener('map-update', {});

        //this.renderer.gpu.setState(this.drawTileState);
        //this.renderer.gpu.gl.disable(this.renderer.gpu.gl.BLEND);
        //this.renderer.drawImage(300, 0, 256, 256, this.renderer.hitmapTexture, null, null, null, false);
        //this.renderer.drawImage(558, 0, 256, 256, this.renderer.hitmapTexture, null, null, null, false);

        //console.log("" + this.stats.gpuRenderUsed);
    }

    //hover and click events
    if (this.clickEvent != null || this.hoverEvent != null) {
        //this.updateGeoHitmap = this.dirty;

        if (this.hoverEvent != null) {
            var result = this.hitTestGeoLayers(this.hoverEvent[0], this.hoverEvent[1], 'hover');

            if (result[1] && result[0] != null) {
                this.core.callListener('geo-feature-hover', {'feature': result[0][0], 'canvas-coords':this.renderer.project2(result[0][1], this.camera.getMvpMatrix()),
                    'camera-coords':result[0][1], 'state': this.hoverEvent[3] }, true);
            }

            var relatedEvents = result[2];

            if (relatedEvents != null) {
                for(var i = 0, li = relatedEvents.length; i < li; i++) {
                    var event = relatedEvents[i];

                    switch(event[0]) {
                    case 'enter':
                        this.core.callListener('geo-feature-enter', {'feature': event[1][0], 'canvas-coords':this.renderer.project2(event[1][1], this.camera.getMvpMatrix()),
                            'camera-coords':event[1][1], 'state': this.hoverEvent[3] }, true);
                        break;

                    case 'leave':
                        this.core.callListener('geo-feature-leave', {'feature':event[1][0], 'canvas-coords':this.renderer.project2(event[1][1], this.camera.getMvpMatrix()),
                            'camera-coords':event[1][1], 'state': this.hoverEvent[3] }, true);
                        break;
                    }
                }
            }

            //is it persistent event?
            if (this.hoverEvent[2] !== true) {
                this.hoverEvent = null;
            }
        }

        if (this.clickEvent != null) {
            var result = this.hitTestGeoLayers(this.clickEvent[0], this.clickEvent[1], 'click');

            if (result[1] && result[0] != null) {
                this.core.callListener('geo-feature-click', {'feature': result[0][0], 'canvas-coords':this.renderer.project2(result[0][1], this.camera.getMvpMatrix()),
                    'camera-coords':result[0][1], 'state': this.clickEvent[2] }, true);
            }

            this.clickEvent = null;
        }

    }


    this.stats.end(dirty);
};

export default Map;
