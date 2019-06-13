import MapCredit_ from './credit';
import MapStylesheet_ from './stylesheet';
import MapSurfaceTree_ from './surface-tree';
import BBox_ from '../renderer/bbox';
import {utils as utils_} from '../utils/utils';
import {utilsUrl as utilsUrl_} from '../utils/url';

//get rid of compiler mess
var MapCredit = MapCredit_;
var MapStylesheet = MapStylesheet_;
var MapSurfaceTree = MapSurfaceTree_;
var BBox = BBox_;
var utils = utils_;
var utilsUrl = utilsUrl_;


var MapSurface = function(map, json, type) {
    this.map = map;
    this.id = null;
    this.type = 'basic';
    this.metaBinaryOrder = 1;
    this.metaUrl = '';
    this.navUrl = '';
    this.navDelta = 1;
    this.meshUrl = '';
    this.textureUrl = '';
    this.baseUrl = this.map.url.baseUrl;
    this.baseUrlSchema = this.map.url.baseUrlSchema;
    this.baseUrlOrigin = this.map.url.baseUrlOrigin;
    this.lodRange = [0,0];
    this.tileRange = [[0,0],[0,0]];
    this.textureLayer = null;
    this.boundLayerSequence = [];
    this.glue = (type == 'glue');
    this.free = (type == 'free');
    this.virtual = false;
    this.zFactor = 0;
    this.ready = false;
    this.geodataProcessor = null;
    this.geodataCounter = 0;
    this.geodataNavtileInfo = false;
    this.monoGeodata = null;
    this.monoGeodataView = null;
    this.monoGeodataCounter = -1;
    this.creditsNumbers = [];
    this.surfaceCounter = map.surfaceCounter;
    map.surfaceCounter++;

    this.style = null;
    this.stylesheet = null;
    this.originalStyle = null;
    this.originalStylesheet = null;
    this.styleChanged = true;
    
    if (this.free) { //each free layer has its own data tree
        this.tree = new MapSurfaceTree(this.map, true, this);
    } else {
        this.tree = null;
    }
    
    if (typeof json === 'string') {
        this.jsonUrl = this.map.url.processUrl(json);
        this.baseUrl = utilsUrl.getBase(this.jsonUrl);
        this.baseUrlSchema = utilsUrl.getSchema(this.jsonUrl);
        this.baseUrlOrigin = utilsUrl.getOrigin(this.jsonUrl);
        
        var onLoaded = (function(data){
            this.parseJson(data);            
            this.ready = true;
            this.map.refreshView();
        }).bind(this);
        
        var onError = (function(){ }).bind(this);

        utils.loadJSON(this.jsonUrl, onLoaded, onError, null,(utils.useCredentials ? (this.jsonUrl.indexOf(this.map.url.baseUrl) != -1) : false), this.map.core.xhrParams);
        //utils.loadJSON(this.url, onLoaded, onError, null, utils.useCredentials);
    } else {
        this.parseJson(json);
        this.ready = true;
    }
};


MapSurface.prototype.parseJson = function(json) {
    this.id = json['id'] || null;
    this.type = json['type'] || 'basic';
    this.metaBinaryOrder = json['metaBinaryOrder'] || 1;
    this.metaUrl = this.processUrl(json['metaUrl'], '');
    this.navUrl = this.processUrl(json['navUrl'], '');
    this.hmapUrl = this.processUrl(json['hmapUrl'], json['navUrl'] + '00');
    //this.cmapUrl = this.processUrl(json['cmapUrl'], '');
    this.pipeline = this.map.config.mapForcePipeline ? this.map.config.mapForcePipeline : (json['pipeline']); // || VTS_PIPELINE_HMAP);//VTS_PIPELINE_BASIC);
    //this.pipeline = json['pipeline'] || VTS_PIPELINE_BASIC;
    this.navDelta = json['navDelta'] || 1;
    this.meshUrl = this.processUrl(json['meshUrl'], '');
    this.textureUrl = this.processUrl(json['textureUrl'], '');
    this.geodataUrl = this.processUrl(json['geodataUrl'] || json['geodata'], '');
    this.lodRange = json['lodRange'] || [0,0];
    this.tileRange = json['tileRange'] || [[0,0],[0,0]];
    this.textureLayer = json['textureLayer'] || null;
    this.geodata = (this.type == 'geodata' || this.type == 'geodata-tiles');
    this.credits = json['credits'] || [];
    this.creditsUrl = null;
    this.displaySize = json['displaySize'] || 1024;

    var i, li;
    
    if (json['extents']) {
        var ll = json['extents']['ll'];
        var ur = json['extents']['ur'];
        this.extents = new BBox(ll[0], ll[1], ll[2], ur[0], ur[1], ur[2]);
    } else {
        this.extents = new BBox(0,0,0,1,1,1);
    }

    this.specificity = Math.pow(2,this.lodRange[0]) / ((this.tileRange[1][0] - this.tileRange[1][0]+1)*(this.tileRange[1][1] - this.tileRange[1][1]+1));    
    
    switch(typeof this.credits) {
    case 'string':
        this.creditsUrl = this.credits;
        this.credits = [];
        break;

    case 'object':
        
        if (!Array.isArray(this.credits)) {
            var credits = this.credits;
            this.credits = [];
                
            for (var key in credits){
                this.map.addCredit(key, new MapCredit(this.map, credits[key]));
                this.credits.push(key);
            }
        }

        for (i = 0, li = this.credits.length; i < li; i++) {
            var credit = this.map.getCreditById(this.credits[i]);
            this.creditsNumbers.push(credit ? credit.id : null); 
        }
        
        break;
    }    


    if (this.geodataUrl && (typeof this.geodataUrl === 'string') && this.geodataUrl.indexOf('{geonavtile}') != -1) {
        //this.geodataNavtileInfo = true;
        this.geodataNavtileInfo = false;
    }

    //load stylesheet
    if (this.geodata) {
        var style = json['style'];

        if (typeof this.credits === 'string') {
            style = this.processUrl(style, '');
        }

        this.originalStyle = style;
        
        if (style) {
            this.setStyle(style);
            this.originalStylesheet = this.stylesheet;
        }
    }

    this.surfaceReference = [];
    if (this.glue) {
        for (i = 0, li = this.id.length; i < li; i++) {
            this.surfaceReference.push(this.map.getSurface(this.id[i]));
        }
    }
};


MapSurface.prototype.kill = function() {
    if (this.geodataProcessor) {
        this.geodataProcessor.kill();
        this.geodataProcessor = null;
    }

    this.geodataUrl = null;
    this.style = null;
    this.stylesheet = null;
    this.originalStyle = null;
    this.originalStylesheet = null;
};


MapSurface.prototype.setOptions = function() {
};


MapSurface.prototype.getOptions = function() {
    return this.getInfo();
};


MapSurface.prototype.getInfo = function() {
    if (this.geodata) {
        return {
            'type' : this.type,
            'metaUrl' : this.metaUrl,
            'geodataUrl' : this.geodataUrl,
            'lodRange' : this.lodRange,
            'tileRange' : this.tileRange,
            'style' : this.originalStyle
        };
    } else {
        return {
            'type' : this.type,
            'metaUrl' : this.metaUrl,
            'navUrl' : this.navUrl,
            'meshUrl' : this.meshUrl,
            'textureUrl' : this.textureUrl,
            'lodRange' : this.lodRange,
            'tileRange' : this.tileRange,
            'textureLayer' : this.textureLayer
        };
    }
};


MapSurface.prototype.processUrl = function(url, fallback) {
    if (!url) {
        return fallback;
    }

    if (typeof url !== 'string') {
        return url;
    }

    url = url.trim();
    
    if (url.indexOf('://') != -1) { //absolute
        return url;
    } else if (url.indexOf('//') == 0) {  //absolute without schema
        return this.baseUrlSchema + url;
    } else if (url.indexOf('/') == 0) {  //absolute without host
        return this.baseUrlOrigin + url;
    } else {  //relative
        return this.baseUrl + url; 
    }
};


MapSurface.prototype.hasTile = function(id) {
    var shift = id[0] - this.lodRange[0];

    if (shift < 0) {
        return false;
    }

    var x = id[1] >> shift;
    var y = id[2] >> shift;

    if (id[0] < this.lodRange[0] || id[0] > this.lodRange[1] ||
        x < this.tileRange[0][0] || x > this.tileRange[1][0] ||
        y < this.tileRange[0][1] || y > this.tileRange[1][1] ) {
        return false;
    }

    return true;
};


MapSurface.prototype.hasTile2 = function(id) {
    var shift = id[0] - this.lodRange[0];
    var above = (shift < 0);

    if (id[0] < this.lodRange[0]) {
        shift = -shift;
        var x1 = this.tileRange[0][0] >> shift;
        var y1 = this.tileRange[0][1] >> shift;
        var x2 = this.tileRange[1][0] >> shift;
        var y2 = this.tileRange[1][1] >> shift;
    
        if (id[0] > this.lodRange[1] ||
            id[1] < x1 || id[1] > x2 ||
            id[2] < y1 || id[2] > y2 ) {
            return [false , false];
        }
    } else {
        var x = id[1] >> shift;
        var y = id[2] >> shift;
    
        if (id[0] > this.lodRange[1] ||
            x < this.tileRange[0][0] || x > this.tileRange[1][0] ||
            y < this.tileRange[0][1] || y > this.tileRange[1][1] ) {
            return [false , false];
        }
    }

    return [true, above];
};


MapSurface.prototype.hasMetatile = function(id) {
    if (id[0] > this.lodRange[1]) {
        return false;
    }

    var shift = id[0] - this.lodRange[0];

    if (shift >= 0) {
        var x = id[1] >> shift;
        var y = id[2] >> shift;

        if (x < this.tileRange[0][0] || x > this.tileRange[1][0] ||
            y < this.tileRange[0][1] || y > this.tileRange[1][1] ) {
            return false;
        }
    } else {
        shift = -shift;

        if (id[1] < (this.tileRange[0][0]>>shift) || id[1] > (this.tileRange[1][0]>>shift) ||
            id[2] < (this.tileRange[0][1]>>shift) || id[2] > (this.tileRange[1][1]>>shift) ) {
            return false;
        }
    }

    return true;
};


MapSurface.prototype.setStyle = function(style) {
    if (this.style == style) {
        return;
    }

    var id = style;

    if (typeof id !== 'object') {
        id = this.processUrl(id, '');
    } else {
        id = JSON.stringify(id);
        id = utils.getHash(id);
        id = "#obj#" + id.toString(16); 
    }
    
    this.stylesheet = this.map.getStylesheet(id);
    
    if (!this.stylesheet) {
        this.stylesheet = new MapStylesheet(this.map, id, style, this);
        this.map.addStylesheet(id, this.stylesheet); 
    } 

    this.style = style;
    this.styleChanged = true;
    this.geodataCounter++;

    //this.map.setStylesheetData(id); //force update
    
    this.map.markDirty();
};


//used only for glues
MapSurface.prototype.getSurfaceReference = function(index) {
    return this.surfaceReference[index - 1];
};


MapSurface.prototype.getMetaUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.metaUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


MapSurface.prototype.getNavUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.navUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


MapSurface.prototype.getHMapUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.hmapUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};

MapSurface.prototype.getMeshUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.meshUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


MapSurface.prototype.getTextureUrl = function(id, subId, skipBaseUrl) {
    return this.map.url.makeUrl(this.textureUrl, {lod:id[0], ix:id[1], iy:id[2] }, subId, skipBaseUrl);
};


MapSurface.prototype.getGeodataUrl = function(id, navtileStr, skipBaseUrl) {
//    return this.map.makeUrl(this.geodataUrl + "&v=1", {lod:id[0], ix:id[1], iy:id[2] }, navtileStr, skipBaseUrl);
    return this.map.url.makeUrl(this.geodataUrl, {lod:id[0], ix:id[1], iy:id[2] }, navtileStr, skipBaseUrl);
};


MapSurface.prototype.getMonoGeodataUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.geodataUrl, {}, null, skipBaseUrl);
};


export default MapSurface;



  