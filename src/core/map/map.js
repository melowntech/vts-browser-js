
import {vec3 as vec3_} from '../utils/matrix';
import {utils as utils_} from '../utils/utils';
import {platform as platform_} from '../utils/platform';
import MapView_ from './view';
import MapSurfaceTree_ from './surface-tree';
import MapResourceTree_ from './resource-tree';
import MapSrs_ from './srs';
import MapCache_ from './cache';
import MapCamera_ from './camera';
import MapConfig_ from './config';
import MapConvert_ from './convert';
import MapMeasure_ from './measure';
import MapDraw_ from './draw';
import MapLoader_ from './loader/loader';
import MapPosition_ from './position';
import MapRenderSlots_ from './render-slots';
import MapStats_ from './stats';
import MapSurfaceSequence_ from './surface-sequence';
import MapUrl_ from './url';
import GpuTexture_ from '../renderer/gpu/texture';

//get rid of compiler mess
var vec3 = vec3_;
var utils = utils_;
var platform = platform_;
var MapView = MapView_;
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
var GpuTexture = GpuTexture_;


var Map = function(core, mapConfig, path, config, configStorage) {
    this.config = config || {};
    this.setConfigParams(config);
    this.setLoaderParams(mapConfig, configStorage);
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
    this.bodies = {};
    this.referenceFrame = {};
    this.credits = {};
    this.creditsByNumber = {};
    this.surfaces = {};
    this.virtualSurfaces = {};
    this.glues = {};
    this.freeLayers = {};
    this.boundLayers = {};
    this.stylesheets = {};
    this.processingTasks = [];
    this.processingTasks2 = [];
    this.geodataProcessors = [];

    this.surfaceSequence = new MapSurfaceSequence(this);

    this.initialView = null;
    this.currentView = new MapView(this, {});
    this.currentViewString = '';
    this.namedViews = {};
    this.viewCounter = 0;
    this.srsReady = false;
    this.surfaceCounter = 0;

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
    this.dirtyCountdown = 0;
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

    var body = this.referenceFrame.body, c;

    if (body && body.atmosphere) {
        c = body.atmosphere.colorHorizon;
        this.draw.atmoColor = [c[0]/255.0, c[1]/255.0, c[2]/255.0, c[3]/255.0];
        c = body.atmosphere.colorZenith;
        this.draw.atmoColor2 = [c[0]/255.0, c[1]/255.0, c[2]/255.0, c[3]/255.0];
        this.draw.atmoHeight = 50000 * (body.atmosphere.thickness / 100000);
        this.draw.atmoDensity = (body.atmosphere.visibility / 100000) * (100000 / body.atmosphere.thickness);
    } else {
        switch(this.referenceFrame.id) {
            case 'melown2015':
            case 'earth-qsc':
                this.draw.atmoColor = [216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0];
                this.draw.atmoColor2 = [72.0/255.0, 154.0/255.0, 255.0/255.0, 1.0];
                //this.draw.atmoColor3 = [216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0];
                this.draw.atmoHeight = 50000;
                break;

            case 'mars-qsc':
                this.draw.atmoColor = [255.0/255.0, 187.0/255.0, 157.0/255.0, 1.0];
                this.draw.atmoColor2 = [255.0/255.0, 155.0/255.0, 113.0/255.0, 1.0];
                //this.draw.atmoColor3 = [255.0/255.0, 187.0/255.0, 157.0/255.0, 0.5];
                this.draw.atmoHeight = 25000;
                this.draw.atmoDensity = 1.0 / 0.25;
                break;
        }
    }

    this.draw.atmoHeightFactor = this.draw.atmoHeight / 50000;

    this.renderSlots = new MapRenderSlots(this);
    this.renderSlots.addRenderSlot('map', this.drawMap.bind(this), true);
};


Map.prototype.kill = function() {
    this.killed = true;
    
    if (this.tree) {
        this.tree.kill();
    }

    for (var key in this.freeLayers) {
        var layer = this.freeLayers[key];
        if (layer && layer.tree) {
            layer.tree.kill();
        }
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


Map.prototype.setOption = function(/*key, value*/) {
};


Map.prototype.getOption = function(/*key*/) {
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


Map.prototype.addBody = function(id, body) {
    this.bodies[id] = body;
};


Map.prototype.getBody = function(id) {
    return this.bodies[id];
};


Map.prototype.getBodies = function() {
    return this.getMapKeys(this.bodies);
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
    var i, li, t, sorted;

    for (var key in glueImagery) {
        if (!imagery[key]) {
            imagery[key] = glueImagery[key];
        }
    }
    
    this.visibleCredits.glueImagery = {};
    
    for (key in imagery) {
        imageryArray.push(key);
        imagerySpecificity.push(imagery[key]); 
    }

    //sort imagery
    do {
        sorted = true;
        
        for (i = 0, li = imagerySpecificity.length - 1; i < li; i++) {
            if (imagerySpecificity[i] < imagerySpecificity[i+1]) {
                t = imagerySpecificity[i];
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

    for (key in mapdata) {
        mapdataArray.push(key);
        mapdataSpecificity.push(mapdata[key]); 
    }
    
    //sort imagery
    do {
        sorted = true;
        
        for (i = 0, li = mapdataSpecificity.length - 1; i < li; i++) {
            if (mapdataSpecificity[i] < mapdataSpecificity[i+1]) {
                t = mapdataSpecificity[i];
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


Map.prototype.removeBoundLayer = function(id) {
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


Map.prototype.setView = function(view, forceRefresh, posToFixed) {
    if (view == null) {
        return;
    }

    if (posToFixed && this.convert) {
        var p = this.getPosition();
        p = this.convert.convertPositionHeightMode(p, 'fix', true);
        this.setPosition(p);
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

    //construct view string without options
    var string = {};

    if (view.surfaces) {
        string.surfaces = view.surfaces;
    }

    if (view.freeLayers) {
        string.freeLayers = view.freeLayers;
    }

    string = JSON.stringify(string);

    var renderer = this.renderer;

    //process options
    if (view.options) {
        var se = view.options.superelevation;

        if (se && se[0] && se[1] && se[0].length >=2 && se[1].length >=2) {
            renderer.setSuperElevationState(true);
            renderer.setSuperElevation(se[0][0], se[1][0], se[0][1], se[1][1]);
        } else {
            renderer.setSuperElevationState(false);
        }
    } else {
        renderer.setSuperElevationState(false);        
    }

    if (string != this.currentViewString || forceRefresh) {
        this.currentView.parse(view);
        this.currentViewString = string;
        this.viewCounter++;  //this also cause rest of geodata
        renderer.draw.clearJobHBuffer(); //hotfix - reset hysteresis buffer
    }

    this.surfaceSequence.generateSurfaceSequence();
    this.surfaceSequence.generateBoundLayerSequence();

    this.refreshFreelayesInView();

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


Map.prototype.getStylesheetData = function(id) {
    var stylesheet = this.getStylesheet(id);

    if (stylesheet) {
        return {'url':stylesheet.url, 'data': stylesheet.data};
    }
    
    return {'url':null, 'data':{}};
};


Map.prototype.setStylesheetData = function(id, data) {
    var stylesheet = this.getStylesheet(id);
    
    //if (stylesheet) {
      //  stylesheet.data = data;
    //}

    this.renderer.draw.clearJobHBuffer();

    if (stylesheet) {
        if (data) {
            stylesheet.setData(data);
        }

        for (var key in this.freeLayers) {
            var freeLayer = this.getFreeLayer(key);
            if (freeLayer && freeLayer.geodata && freeLayer.stylesheet == stylesheet) {
                
                if (freeLayer.geodataProcessor) {
                    freeLayer.geodataProcessor.setStylesheet(freeLayer.stylesheet);
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


Map.prototype.refreshFreelayesInView = function() {
    var freeLayers = this.currentView.freeLayers;
    this.freeLayerSequence = [];

    for (var key in freeLayers) {
        var freeLayer = this.getFreeLayer(key);
        
        if (freeLayer) {
            
            freeLayer.zFactor = freeLayers[key]['depthOffset'];
            freeLayer.maxLod = freeLayers[key]['maxLod'];
            
            this.freeLayerSequence.push(freeLayer);
            
            if (freeLayers[key]['style']) {
                freeLayer.setStyle(freeLayers[key]['style']);
            } else {
                freeLayer.setStyle(freeLayer.originalStyle);
            }
            
            //TODO: generate bound layer seqence for      
        }
    }
};

Map.prototype.refreshView = function() {
    this.viewCounter++;
    this.surfaceSequence.generateSurfaceSequence();
    this.surfaceSequence.generateBoundLayerSequence();
    this.refreshFreelayesInView();
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


Map.prototype.isReferenceFrameReady = function() {
    return this.referenceFrame.model.physicalSrs.isReady() &&
           this.referenceFrame.model.publicSrs.isReady() &&
           this.referenceFrame.model.navigationSrs.isReady();
};


Map.prototype.getPhysicalSrs = function() {
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


Map.prototype.setLoaderParams = function(mapConfig, configStorage) {
    var sources = [];

    if (mapConfig && mapConfig['browserOptions']) {
        sources.push(mapConfig['browserOptions']);
    }

    if (configStorage) {
        sources.push(configStorage);
    }

    for (var i = 0, li = sources.length; i < li; i++) {
        var source = sources[i];
        for (var key in source) {
            switch(key) {
                case 'mapSeparateLoader':
                case 'mapGeodataBinaryLoad':
                case 'mapPackLoaderEvents':
                case 'mapParseMeshInWorker':
                case 'mapPackGeodataEvents':
                    this.setConfigParam(key, source[key]);
                    break;
            }
        }
    }
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
    case 'mapDownloadThreads':            this.config.mapDownloadThreads = utils.validateNumber(value, 1, Number.MAXINTEGER, 6); break;
    case 'mapMaxProcessingTime':          this.config.mapMaxProcessingTime = utils.validateNumber(value, 1, Number.MAXINTEGER, 1000/20); break;
    case 'mapMaxGeodataProcessingTime':   this.config.mapMaxGeodataProcessingTime = utils.validateNumber(value, 1, Number.MAXINTEGER, 10); break;
    case 'mapMobileMode':                 this.config.mapMobileMode = utils.validateBool(value, false); this.setupMobileMode(); break;
    case 'mapMobileModeAutodect':         this.config.mapMobileModeAutodect = utils.validateBool(value, false); break;
    case 'mapMobileDetailDegradation':    this.config.mapMobileDetailDegradation = utils.validateNumber(value, 1, Number.MAXINTEGER, 2); break;
    case 'mapNavSamplesPerViewExtent':    this.config.mapNavSamplesPerViewExtent = utils.validateNumber(value, 0.00000000001, Number.MAXINTEGER, 4); break;
    case 'mapFog':                        this.config.mapFog = utils.validateBool(value, false); if(this.draw){ this.draw.debug.drawFog = this.config.mapFog; this.dirty = true; } break;
    case 'mapFlatshade':                  this.config.mapFlatshade = utils.validateBool(value, false); if(this.draw){ this.draw.debug.drawWireframe = this.config.mapFlatshade ? 3 : 0; this.dirty = true; } break;
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
    case 'mapGridMode':                   this.config.mapGridMode = utils.validateString(value, 'linear'); break;
    case 'mapGridSurrogatez':             this.config.mapGridSurrogatez = utils.validateBool(value, false); break;
    case 'mapGridUnderSurface':           this.config.mapGridUnderSurface = utils.validateNumber(value, -Number.MAXINTEGER, Number.MAXINTEGER, 0); break;
    case 'mapGridTextureLevel':           this.config.mapGridTextureLevel = utils.validateNumber(value, -Number.MAXINTEGER, Number.MAXINTEGER, -1); break;
    case 'mapGridTextureLayer':           this.config.mapGridTextureLayer = utils.validateString(value, ''); break;
    case 'mapPreciseBBoxTest':            this.config.mapPreciseBBoxTest = utils.validateBool(value, true); break;
    case 'mapPreciseDistanceTest':        this.config.mapPreciseDistanceTest = utils.validateBool(value, false); break;
    case 'mapHeightfiledWhenUnloaded':    this.config.mapHeightfiledWhenUnloaded = utils.validateBool(value, false); break;
    case 'mapForceMetatileV3':            this.config.mapForceMetatileV3 = utils.validateBool(value, false); break;
    case 'mapVirtualSurfaces':            this.config.mapVirtualSurfaces = utils.validateBool(value, true); break;
    case 'mapDegradeHorizon':             this.config.mapDegradeHorizon = utils.validateBool(value, true); break;
    case 'mapDegradeHorizonParams':       this.config.mapDegradeHorizonParams = utils.validateNumberArray(value, 4, [0,1,1,1], [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], [1, 3000, 15000, 7000]); break;
    case 'mapRefreshCycles':              this.config.mapRefreshCycles = utils.validateNumber(value, 0, Number.MAXINTEGER, 3); break;
    case 'mapDefaultFont':                this.config.mapDefaultFont = utils.validateString(value, ''); break;
    case 'mapMetricUnits':                this.config.mapMetricUnits = utils.validateBool(value, true); break;
    case 'mapLanguage':                   this.config.mapLanguage = utils.validateString(value, 'en'); break;
    case 'mapNoTextures':                 this.config.mapNoTextures = this.config.mapDisableCulling = utils.validateBool(value, false); break;
    case 'mapForceFrameTime':             this.config.mapForceFrameTime = utils.validateNumber(value, -1, Number.MAXINTEGER, 0); break;
    case 'mapForcePipeline':              this.config.mapForcePipeline = utils.validateNumber(value, 0, Number.MAXINTEGER, 0); break;
    case 'mapFeatureGridCells':           this.config.mapFeatureGridCells = utils.validateNumber(value, -Number.MAXINTEGER, Number.MAXINTEGER, 0); break;
    case 'mapFeaturesPerSquareInch':      this.config.mapFeaturesPerSquareInch = utils.validateNumber(value, 0.000001, Number.MAXINTEGER, 0); break;
    case 'mapFeaturesSortByTop':          this.config.mapFeaturesSortByTop = utils.validateBool(value, false); break;
    case 'mapFeaturesReduceParams':       this.config.mapFeaturesReduceParams = value; break;
    case 'mapLogGeodataStyles':           this.config.mapLogGeodataStyles = utils.validateBool(value, true); break;
    case 'map16bitMeshes':                this.config.map16bitMeshes = utils.validateBool(value, false); break;
    case 'mapOnlyOneUVs':                 this.config.mapOnlyOneUVs = utils.validateBool(value, false); break;
    case 'mapIndexBuffers':               this.config.mapIndexBuffers = utils.validateBool(value, false); break;
    case 'mapSoftViewSwitch':             this.config.mapSoftViewSwitch = utils.validateBool(value, true); break;
    case 'mapAsyncImageDecode':           this.config.mapAsyncImageDecode = (utils.validateBool(value, false) && (typeof createImageBitmap !== 'undefined')) ? true : false; break;
    case 'mapFeatureStickMode':           this.config.mapFeatureStickMode = utils.validateNumberArray(value, 2, [0,1], [Number.MAX_VALUE, Number.MAX_VALUE], [0, 1]); break;
    case 'mapSeparateLoader':             this.config.mapSeparateLoader = utils.validateBool(value, true); break;
    case 'mapGeodataBinaryLoad':          this.config.mapGeodataBinaryLoad = utils.validateBool(value, true); break;
    case 'mapPackLoaderEvents':           this.config.mapPackLoaderEvents = utils.validateBool(value, true); break;
    case 'mapParseMeshInWorker':          this.config.mapParseMeshInWorker = utils.validateBool(value, true); break;
    case 'mapPackGeodataEvents':          this.config.mapPackGeodataEvents = utils.validateBool(value, true); break;
    case 'mapSortHysteresis':             this.config.mapSortHysteresis = utils.validateBool(value, false); break;
    case 'mapHysteresisWait':             this.config.mapHysteresisWait = utils.validateNumber(value, 0, Number.MAXINTEGER, 0); break;
    case 'mapBenevolentMargins':          this.config.mapBenevolentMargins = utils.validateBool(value, false); break;
    case 'mapCheckTextureSize':           this.config.mapCheckTextureSize = utils.validateBool(value, false); break;
    case 'mapTraverseToMeshNode':         this.config.mapTraverseToMeshNode = utils.validateBool(value, true); break;
    case 'mapNormalizeOctantTexelSize':   this.config.mapNormalizeOctantTexelSize = utils.validateBool(value, true); break;
    case 'mapDMapSize':                   this.config.mapDMapSize = utils.validateNumber(value, 16, Number.MAXINTEGER, 512); break; 
    case 'mapDMapMode':                   this.config.mapDMapMode = utils.validateNumber(value, 1, Number.MAXINTEGER, 1); break;
    case 'mapSplitSpace':                 this.config.mapSplitSpace = value; break;
    case 'mario':                         this.config.mario = utils.validateBool(value, true); break;
    case 'mapFeaturesReduceMode':         
        value = utils.validateString(value, 'scr-count4');
        if (value == 'auto') value = 'scr-count2';
        if (value == 'legacy') value = 'scr-count2';
        if (value == 'gridcells') value = 'scr-count4';
        if (value == 'singlepass') value = 'scr-count5';
        if (value == 'margin') value = 'scr-count6';
        //if (value == 'margin') value = 'scr-count7';
        this.config.mapFeaturesReduceMode = value;
        break;

    }
};


Map.prototype.getConfigParam = function(key) {
    switch (key) {
    case 'map':                           return this.config.map;
    case 'mapCache':                      return this.config.mapCache;
    case 'mapGPUCache':                   return this.config.mapGPUCache;
    case 'mapMetatileCache':              return this.config.mapMetatileCache;
    case 'mapTexelSizeFit':               return this.config.mapTexelSizeFit;
    case 'mapDownloadThreads':            return this.config.mapDownloadThreads;
    case 'mapMaxProcessingTime':          return this.config.mapMaxProcessingTime;
    case 'mapMaxGeodataProcessingTime':   return this.config.mapMaxGeodataProcessingTime;
    case 'mapMobileMode':                 return this.config.mapMobileMode;
    case 'mapMobileModeAutodect':         return this.config.mapMobileModeAutodect;
    case 'mapMobileDetailDegradation':    return this.config.mapMobileDetailDegradation;
    case 'mapNavSamplesPerViewExtent':    return this.config.mapNavSamplesPerViewExtent;
    case 'mapFog':                        return this.config.mapFog;
    case 'mapFlatshade':                  return this.config.mapFlatshade;
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
    case 'mapGridMode':                   return this.config.mapGridMode;
    case 'mapGridSurrogatez':             return this.config.mapGridSurrogatez;
    case 'mapGridUnderSurface':           return this.config.mapGridUnderSurface;
    case 'mapGridTextureLevel':           return this.config.mapGridTextureLevel;
    case 'mapGridTextureLayer':           return this.config.mapGridTextureLayer;
    case 'mapPreciseBBoxTest':            return this.config.mapPreciseBBoxTest;
    case 'mapPreciseDistanceTest':        return this.config.mapPreciseDistanceTest;
    case 'mapHeightfiledWhenUnloaded':    return this.config.mapHeightfiledWhenUnloaded;
    case 'mapForceMetatileV3':            return this.config.mapForceMetatileV3;
    case 'mapVirtualSurfaces':            return this.config.mapVirtualSurfaces;
    case 'mapDegradeHorizon':             return this.config.mapDegradeHorizon;
    case 'mapDegradeHorizonParams':       return this.config.mapDegradeHorizonParams;
    case 'mapRefreshCycles':              return this.config.mapRefreshCycles;
    case 'mapDefaultFont':                return this.config.mapDefaultFont;
    case 'mapMetricUnits':                return this.config.mapMetricUnits;
    case 'mapLanguage':                   return this.config.mapLanguage;
    case 'mapNoTextures':                 return this.config.mapNoTextures;
    case 'mapForceFrameTime':             return this.config.mapForceFrameTime;
    case 'mapForcePipeline':              return this.config.mapForcePipeline;
    case 'mapFeatureGridCells':           return this.config.mapFeatureGridCells;
    case 'mapFeaturesPerSquareInch':      return this.config.mapFeaturesPerSquareInch;
    case 'mapFeaturesSortByTop':          return this.config.mapFeaturesSortByTop;
    case 'mapFeaturesReduceMode':         return this.config.mapFeaturesReduceMode;
    case 'mapFeaturesReduceParams':       return this.config.mapFeaturesReduceParams;
    case 'mapLogGeodataStyles':           return this.config.mapLogGeodataStyles;
    case 'map16bitMeshes':                return this.config.map16bitMeshes;
    case 'mapOnlyOneUVs':                 return this.config.mapOnlyOneUVs;
    case 'mapIndexBuffers':               return this.config.mapIndexBuffers;
    case 'mapSoftViewSwitch':             return this.config.mapSoftViewSwitch;
    case 'mapAsyncImageDecode':           return this.config.mapAsyncImageDecode;
    case 'mapFeatureStickMode':           return this.config.mapFeatureStickMode;
    case 'mapSeparateLoader':             return this.config.mapSeparateLoader;
    case 'mapGeodataBinaryLoad':          return this.config.mapGeodataBinaryLoad;
    case 'mapPackLoaderEvents':           return this.config.mapPackLoaderEvents;
    case 'mapParseMeshInWorker':          return this.config.mapParseMeshInWorker;
    case 'mapPackGeodataEvents':          return this.config.mapPackGeodataEvents;
    case 'mapSortHysteresis':             return this.config.mapSortHysteresis;
    case 'mapHysteresisWait':             return this.config.mapHysteresisWait;
    case 'mapBenevolentMargins':          return this.config.mapBenevolentMargins;
    case 'mapDMapSize':                   return this.config.mapDMapSize; 
    case 'mapDMapMode':                   return this.config.mapDMapMode;
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


Map.prototype.renderToImage = function(texture) {
    //var renderer = this.renderer;
    var canvas = this.renderer.gpu.canvas;
    var w = canvas.width;
    var h = canvas.height;
    var w2 = utils.fitToPowerOfTwo(w);
    var h2 = utils.fitToPowerOfTwo(h);

    var data = new Uint8Array( w2 * h2 * 4 );

    var texture = new GpuTexture(this.renderer.gpu);
    texture.createFromData(w2, h2, data);
    texture.createFramebuffer(w2, h2);

    this.draw.drawToTexture(texture);

    data = texture.readFramebufferPixels(0, 0, w, h);

    texture.kill();

    //flip vertically
    var data2 = new Uint8Array( w * h * 4 );
    for (var y = 0; y < h; y++) {
        var index = y * w * 4;
        var index2 = (h - y - 1) * w * 4; 

        for (var x = 0; x < w; x++) {
            data2[index2] = data[index];
            data2[index2+1] = data[index+1];
            data2[index2+2] = data[index+2];
            data2[index2+3] = data[index+3];
            index += 4;
            index2 += 4;
        }
    }

    return { 'width': w, 'height': h, 'data': data2};
};


Map.prototype.getScreenDepth = function(screenX, screenY, useFallback) {

    if (useFallback) {

        var cameraPos = this.camera.position;
        var ray = this.renderer.getScreenRay(screenX, screenY), a, d;

        if (this.getNavigationSrs().isProjected()) { //plane fallback
            var planePos = [0,0,Math.min(-1000,this.referenceFrame.getGlobalHeightRange()[0])];
            var planeNormal = [0,0,1];

            d = vec3.dot(planeNormal, ray); //minification is wrong there
            a = [planePos[0] - cameraPos[0], planePos[1] - cameraPos[1], planePos[2] - cameraPos[2]];
            t = vec3.dot(a, planeNormal) / d;

            if (t >= 0) {
                return [true, t];
            } else {
                return [false, 1];
            }

        } else { //elipsoid fallback
            var navigationSrsInfo = this.getNavigationSrs().getSrsInfo();
            var planetRadius = navigationSrsInfo['b'] + this.referenceFrame.getGlobalHeightRange()[0];
        
            var offset = [cameraPos[0], cameraPos[1], cameraPos[2]];
            a = vec3.dot(ray, ray); //minification is wrong there
            var b = 2 * vec3.dot(ray, offset);
            var c = vec3.dot(offset, offset) - planetRadius * planetRadius;
            d = b * b - 4 * a * c;
            
            if (d > 0) {
                d = Math.sqrt(d);
                var t1 = (-b - d) / (2*a);
                var t2 = (-b + d) / (2*a);
                var t = (t1 < t2) ? t1 : t2;

                return [true, t];
            } else {
                return [false, 1];
            }
        }

    } else {

        if (this.hitMapDirty) {
            var tmp1 = this.draw.ndcToScreenPixel;

            this.draw.drawHitmap();

            this.draw.ndcToScreenPixel = tmp1;

            var width = this.renderer.curSize[0], height = this.renderer.curSize[1];

            var m = new Float32Array(16);
            m[0] = 2.0/width; m[1] = 0; m[2] = 0; m[3] = 0;
            m[4] = 0; m[5] = -2.0/height; m[6] = 0; m[7] = 0;
            m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
            m[12] = -width*0.5*m[0]; m[13] = -height*0.5*m[5]; m[14] = 0; m[15] = 1;

            this.renderer.imageProjectionMatrix = m;
            this.renderer.camera.update();
        }

        var res = this.renderer.getDepth(screenX, screenY);
    }

    return res;
};


Map.prototype.getHitCoords = function(screenX, screenY, mode, lod) {
    if (this.hitMapDirty) {
        this.draw.drawHitmap();
    }

    var cameraSpaceCoords = this.renderer.hitTest(screenX, screenY);
    
    var fallbackUsed = false; 
    var cameraPos = this.camera.position;
    var worldPos;

    var ray = cameraSpaceCoords[4], a, d;

    if (this.getNavigationSrs().isProjected()) { //plane fallback
        var planePos = [0,0,Math.min(-1000,this.referenceFrame.getGlobalHeightRange()[0])];
        var planeNormal = [0,0,1];

        d = vec3.dot(planeNormal, ray); //minification is wrong there
        //if (d > 1e-6) {
        a = [planePos[0] - cameraPos[0], planePos[1] - cameraPos[1], planePos[2] - cameraPos[2]];
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
        a = vec3.dot(ray, ray); //minification is wrong there
        var b = 2 * vec3.dot(ray, offset);
        var c = vec3.dot(offset, offset) - planetRadius * planetRadius;
        d = b * b - 4 * a * c;
        
        if (d > 0) {
            d = Math.sqrt(d);
            var t1 = (-b - d) / (2*a);
            var t2 = (-b + d) / (2*a);
            var t = (t1 < t2) ? t1 : t2;

            //console.log("hit: " + t + ",   " + cameraSpaceCoords[5]);
            
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

    if (this.renderer.useSuperElevation) {
        navCoords[2] = this.renderer.getUnsuperElevatedHeight(navCoords[2]);
    }

    if (mode == 'float') {
        lod =  (lod != null) ? lod : this.measure.getOptimalHeightLod(navCoords, 100, this.config.mapNavSamplesPerViewExtent);
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

    var res = this.renderer.hitTestGeoLayers(screenX, screenY);
    var relatedEvents, elementIndex;

    if (res[0]) { //do we hit something?
        //console.log(JSON.stringify([id, JSON.stringify(this.hoverFeatureList[id])]));
       
        var id = (res[1]) + (res[2]<<8);
		
        var feature = this.hoverFeatureList[id];

        if (!feature) {
            return [null, false, [], elementIndex];
        }

        if (feature[6]) { //advanced hit feature?
            res = this.renderer.hitTestGeoLayers(screenX, screenY, true);
        
            if (res[0]) { //do we hit something?
                elementIndex = (res[1]) + (res[2]<<8);
            }
        }

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

            relatedEvents = [];

            if (this.hoverFeatureId != this.lastHoverFeatureId) {
                if (this.lastHoverFeatureId != null) {
                    relatedEvents.push(['leave', this.lastHoverFeature, this.lastHoverFeatureId]);
                }

                if (this.hoverFeatureId != null) {
                    relatedEvents.push(['enter', this.hoverFeature, this.hoverFeatureId]);
                }

                this.dirty = true;
            }

            if (this.hoverFeature != null && this.hoverFeature[3]) {
                return [this.hoverFeature, true, relatedEvents, elementIndex];
            } else {
                return [null, false, relatedEvents, elementIndex];
            }
        }

        if (mode == 'click') {
            if (feature != null && feature[2]) {
                return [feature, true, [], elementIndex];
            } else {
                return [null, false, [], elementIndex];
            }
        }
    } else {
        relatedEvents = [];

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

        return [null, false, relatedEvents, elementIndex];
    }
};

Map.prototype.getCurrentGeometry = function() {
    if (this.draw.tree.surfaceSequence.length > 0) {
        this.draw.tree.draw(true);
        var res = this.storedTilesRes;
        this.storedTilesRes = [];
        return res;
    }

    return res;
};

Map.prototype.applyCredits = function(tile) {
    var value, value2;
    for (var key in tile.imageryCredits) {
        value = tile.imageryCredits[key];
        value2 = this.visibleCredits.imagery[key];

        if (value2) {
            this.visibleCredits.imagery[key] = value > value2 ? value : value2;
        } else {
            this.visibleCredits.imagery[key] = value;
        }
    }
    for (key in tile.glueImageryCredits) {
        value = tile.glueImageryCredits[key];
        value2 = this.visibleCredits.imagery[key];

        if (value2) {
            this.visibleCredits.glueImagery[key] = value > value2 ? value : value2;
        } else {
            this.visibleCredits.glueImagery[key] = value;
        }
    }
    for (key in tile.mapdataCredits) {
        value = tile.mapdataCredits[key];
        value2 = this.visibleCredits.mapdata[key];

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

    while (this.processingTasks2.length > 0) {
        if (this.processingTasks2[0]() != -123) {
            this.processingTasks2.shift();
        } else {
            break;
        }
    }

};


Map.prototype.addProcessingTask = function(task) {
    this.processingTasks.push(task);
};

Map.prototype.addProcessingTask2 = function(task) {
    this.processingTasks2.push(task);
};

/*
Map.prototype.updateGeodataProcessors = function(task) {
    var processors = this.map.geodataProcessors;
    for (var i = 0, li = processors.length; i < li; i++) {
        var processor = processors[i];

        if (!processor.ready && processor.processing) {
            processor.
        }
    }
};*/


Map.prototype.update = function() {
    if (this.killed) {
        return;
    }

    if (this.core.tokenExpiration) {
        if (Date.now() > (this.core.tokenExpiration - (1000*60))) {
            this.core.tokenExpirationCallback();
        }
    }

    if (!this.srsReady) {
        this.loader.update();
        return;
    }

    if (this.div && this.div.style.visibility == 'hidden'){
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
    var renderer = this.renderer, p;
    var camPos = renderer.cameraPosition;

    if (renderer.curSize[0] != rect.width || renderer.curSize[1] != rect.height) {
        renderer.onResize();
        this.dirty = true;
    }

    var dirty = (this.dirty || this.dirtyCountdown > 0), result;
    this.stats.begin(dirty);

    this.loader.update();

    //this.updateGeodataProcessors();

    this.processProcessingTasks();

    if (dirty) {
        if (this.dirty) {
            this.dirtyCountdown = this.config.mapRefreshCycles;
        } else {
            this.dirtyCountdown--;
        }

        this.dirty = false;
        this.bestMeshTexelSize = 0;//Number.MAX_VALUE;
        this.bestGeodataTexelSize = 0;//Number.MAX_VALUE;
        
        this.renderSlots.processRenderSlots();

        this.loader.update();
        
        this.core.callListener('map-update', {});

        //this.renderer.gpu.setState(this.drawTileState);
        //this.renderer.gpu.gl.disable(this.renderer.gpu.gl.BLEND);
        //this.renderer.drawImage(300, 0, 256, 256, this.renderer.hitmapTexture, null, null, null, null, false);
        //this.renderer.drawImage(558, 0, 256, 256, this.renderer.hitmapTexture, null, null, null, null, false);

        //console.log("" + this.stats.gpuRenderUsed);
    }

    //hover and click events
    if (this.clickEvent != null || this.hoverEvent != null) {
        //this.updateGeoHitmap = this.dirty;

        if (this.hoverEvent != null) {
            result = this.hitTestGeoLayers(this.hoverEvent[0], this.hoverEvent[1], 'hover');

            var relatedEvents = result[2];

            if (relatedEvents != null) {
                for(var i = 0, li = relatedEvents.length; i < li; i++) {
                    var event = relatedEvents[i];

                    switch(event[0]) {
                    case 'enter':
                        p = event[1][1];
                        this.core.callListener('geo-feature-enter', {'feature': event[1][0], 'canvas-coords':renderer.project2(event[1][1], renderer.camera.mvp, camPos),
                            'physical-coords':[p[0] + camPos[0], p[1] + camPos[1], p[2] + camPos[2]], 'state': this.hoverEvent[3], 'element': result[3] });
                        break;

                    case 'leave':
                        p = event[1][1];
                        this.core.callListener('geo-feature-leave', {'feature':event[1][0], 'canvas-coords':renderer.project2(event[1][1], renderer.camera.mvp, camPos),
                            'physical-coords':[p[0] + camPos[0], p[1] + camPos[1], p[2] + camPos[2]], 'state': this.hoverEvent[3], 'element': result[3] });
                        break;
                    }
                }
            }

            if (result[1] && result[0] != null) {
                p = result[0][1];
                this.core.callListener('geo-feature-hover', {'feature': result[0][0], 'canvas-coords':renderer.project2(result[0][1], renderer.camera.mvp, camPos),
                    'physical-coords':[p[0] + camPos[0], p[1] + camPos[1], p[2] + camPos[2]], 'state': this.hoverEvent[3], 'element': result[3]});
            }

            //is it persistent event?
            if (this.hoverEvent[2] !== true) {
                this.hoverEvent = null;
            }
        }

        if (this.clickEvent != null) {
            result = this.hitTestGeoLayers(this.clickEvent[0], this.clickEvent[1], 'click');

            if (result[1] && result[0] != null) {
                p = result[0][1];
                this.core.callListener('geo-feature-click', {'feature': result[0][0], 'canvas-coords':renderer.project2(result[0][1], renderer.camera.mvp, camPos),
                    'physical-coords':[p[0] + camPos[0], p[1] + camPos[1], p[2] + camPos[2]], 'state': this.clickEvent[2], 'element': result[3] });
            }

            this.clickEvent = null;
        }

    }


    this.stats.end(dirty);
};

export default Map;
