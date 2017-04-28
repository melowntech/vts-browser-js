
import MapBoundLayer_ from './bound-layer';
import MapCredit_ from './credit';
import MapPosition_ from './position';
import MapRefFrame_ from './refframe';
import MapView_ from './view';
import MapSrs_ from './srs';
import MapSurface_ from './surface';
import MapVirtualSurface_ from './virtual-surface';
import MapStylesheet_ from './stylesheet';

//get rid of compiler mess
var MapPosition = MapPosition_;
var MapCredit = MapCredit_;
var MapBoundLayer = MapBoundLayer_;
var MapRefFrame = MapRefFrame_;
var MapView = MapView_;
var MapSrs = MapSrs_;
var MapSurface = MapSurface_;
var MapVirtualSurface = MapVirtualSurface_;
var MapStylesheet = MapStylesheet_;


var MapConfig = function(map, config) {
    this.map = map;
    this.mapConfig = config;
    this.parseConfig();
};


MapConfig.prototype.parseConfig = function() {
    if (!(this.parseSrses() && this.parseReferenceFrame() &&
          this.parseCredits() && this.parseStylesheets() && 
          this.parseSurfaces() && this.parseGlues() && 
          this.parseVirtualSurfaces() && this.parseBoundLayers() &&
          this.parseFreeLayers() && this.parseViews() &&
          this.parseParams() && this.parseBrowserOptions() )) {
        //wrong config file
    }

    var stats = this.map.stats;
    stats.loadedCount = 0;
    stats.loadErrorCount = 0;
    stats.loadFirst = performance.now();
    stats.loadLast = this.map.loadFirst;
};


MapConfig.prototype.afterConfigParsed = function() {
    if (this.mapConfig['position'] != null) {
        this.map.setPosition(this.mapConfig['position'], false);
    }

    this.map.setView(this.map.initialView);
};


MapConfig.prototype.parseSrses = function() {
    var srses = this.mapConfig['srses'];
    this.map.srses = {};

    if (srses == null) {
        return false;
    }

    for (var key in srses) {
        this.map.addSrs(key, new MapSrs(this.map, key, srses[key]));
    }

    return true;
};


MapConfig.prototype.parseReferenceFrame = function() {
    var rf = this.mapConfig['referenceFrame'];

    if (rf == null) {
        return false;
    }

    this.map.referenceFrame = new MapRefFrame(this.map, rf);

    if (this.map.referenceFrame.valid == false) {
        return false;
    }

    return true;
};


MapConfig.prototype.parseCredits = function() {
    var credits = this.mapConfig['credits'];
    this.map.credits = {};

    if (credits == null) {
        return false;
    }

    for (var key in credits) {
        this.map.addCredit(key, new MapCredit(this.map, credits[key]));
    }

    return true;
};


MapConfig.prototype.parseSurfaces = function() {
    var surfaces = this.mapConfig['surfaces'];
    this.map.surfaces = [];

    if (surfaces == null) {
        return false;
    }

    for (var i = 0, li = surfaces.length; i < li; i++) {
        var surface = new MapSurface(this.map, surfaces[i]);
        this.map.addSurface(surface.id, surface);
    }

    return true;
};


MapConfig.prototype.parseVirtualSurfaces = function() {
    var surfaces = this.mapConfig['virtualSurfaces'];
    this.map.virtualSurfaces = [];

    if (!this.map.config.mapVirtualSurfaces) {
        return true;
    }

    if (surfaces == null) {
        return true;
    }

    for (var i = 0, li = surfaces.length; i < li; i++) {
        var surface = new MapVirtualSurface(this.map, surfaces[i]);
        this.map.virtualSurfaces[surface.strId] = surface;
    }

    return true;
};


MapConfig.prototype.parseViews = function() {
    var views = this.mapConfig['namedViews'];
    this.map.namedViews = [];

    if (views != null) {
        for (var key in views) {
            this.map.addNamedView(key, new MapView(this.map, views[key]));
        }
    }

    var view = this.mapConfig['view'];
    if (view == null) {
        return true;
    }

    this.map.initialView = JSON.parse(JSON.stringify(view));
    return true;
};


MapConfig.prototype.parseGlues = function() {
    var glues = this.mapConfig['glue'];
    this.map.glues = [];

    if (glues == null) {
        return true;
    }

    for (var i = 0, li = glues.length; i < li; i++) {
        var surface = new MapSurface(this.map, glues[i], 'glue');
        this.map.addGlue(surface.id.join(';'), surface);
    }

    return true;
};


MapConfig.prototype.parseBoundLayers = function() {
    var layers = this.mapConfig['boundLayers'];
    this.map.boundLayers = [];

    if (layers == null) {
        return true;
    }

    for (var key in layers) {
        var layer = new MapBoundLayer(this.map, layers[key], key);
        this.map.addBoundLayer(key, layer);
    }

    return true;
};


MapConfig.prototype.parseFreeLayers = function() {
    var layers = this.mapConfig['freeLayers'];
    this.map.freeLayers = [];

    if (layers == null) {
        return true;
    }

    for (var key in layers) {
        var layer = new MapSurface(this.map, layers[key], 'free');
        this.map.addFreeLayer(key, layer);
    }

    return true;
};


MapConfig.prototype.parseStylesheets = function() {
    var styles = this.mapConfig['stylesheets'];
    this.map.stylesheets = [];

    if (styles == null) {
        return true;
    }

    for (var key in styles) {
        var style = new MapStylesheet(this.map, key, styles[key]);
        this.map.addStylesheet(key, style);
    }

    return true;
};


MapConfig.prototype.parseParams = function() {
    return true;
};


MapConfig.prototype.parseBrowserOptions = function() {
    var options = this.mapConfig['browserOptions'];
    this.map.browserOptions = {};
    
    if (options == null) {
        return true;
    }
    
    this.map.browserOptions = JSON.parse(JSON.stringify(options));
    return true;
};


MapConfig.prototype.cloneConfig = function() {
    var json = JSON.parse(JSON.stringify(this.mapConfig));
    return json;
};


export default MapConfig;
