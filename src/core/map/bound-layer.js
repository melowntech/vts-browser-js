
import MapCredit_ from './credit';
import {utils as utils_} from '../utils/utils';
import {utilsUrl as utilsUrl_} from '../utils/url';

//get rid of compiler mess
var utils = utils_;
var utilsUrl = utilsUrl_;
var MapCredit = MapCredit_;


var MapBoundLayer = function(map, json, id) {
    this.map = map;
    this.id = id;
    this.currentAlpha = 1.0;

    this.tileSize = [256,256];
    this.lodRange = [0,100];
    this.credits = [];
    this.tileRange = [[0,0],[0,0]];
    this.jsonUrl = null;
    this.baseUrl = this.map.url.baseUrl;
    this.baseUrlSchema = this.map.url.baseUrlSchema;
    this.baseUrlOrigin = this.map.url.baseUrlOrigin;
    this.ready = false;
    this.dataType = VTS_TEXTURETYPE_COLOR;
    this.shaderFilters = null;

    //hack
    if (id == 'esri-world-imagery') {
        json['availability'] = {
             // "type" : "negative-type",
             // "mime": "image/png"
             // "type" : "negative-code",
             // "codes": [301, 302, 404]
            'type' : 'negative-size',
            'size': 2521
        };  
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

        utils.loadJSON(this.jsonUrl, onLoaded, onError, null, (utils.useCredentials ? (this.jsonUrl.indexOf(this.map.url.baseUrl) != -1) : false), this.map.core.xhrParams);
        //utils.loadJSON(this.url, onLoaded, onError, null, utils.useCredentials);
    } else {
        this.parseJson(json);
        this.ready = true;
    }
    
};


MapBoundLayer.prototype.parseJson = function(json) {
    this.numberId = json['id'] || null;
    this.type = json['type'] || 'raster';
    this.url = this.processUrl(json['url'], '');
    this.tileSize = json['tileSize'] || [256,256];
    this.lodRange = json['lodRange'] || [0,0];
    this.tileRange = json['tileRange'] || [[0,0],[0,0]];
    this.metaUrl = this.processUrl(json['metaUrl']);
    this.maskUrl = this.processUrl(json['maskUrl']);
    this.isTransparent = json['isTransparent'] || false;
    this.options = json['options'] || {};
    this.credits = json['credits'] || [];
    this.creditsUrl = null;

    this.shaderFilter = this.options['shaderFilter'] || null;

    switch(json['dataType']) {
        default:
        case 'color':          this.dataType = VTS_TEXTURETYPE_COLOR;  break;
        case 'height':         this.dataType = VTS_TEXTURETYPE_HEIGHT; break;
        case 'classification': this.dataType = VTS_TEXTURETYPE_CLASS;  break;
    }

    this.specificity = Math.pow(2,this.lodRange[0]) / ((this.tileRange[1][0] - this.tileRange[1][0]+1)*(this.tileRange[1][1] - this.tileRange[1][1]+1));    

    this.availability = json['availability'] ? {} : null;

    if (this.availability) {
        var p = json['availability'];

        switch(p['type']) {
            case 'negative-type': this.availability.type = VTS_TEXTURECHECK_TYPE; break;
            case 'negative-code': this.availability.type = VTS_TEXTURECHECK_CODE; break;
            case 'negative-size': this.availability.type = VTS_TEXTURECHECK_SIZE; break;
        }

        this.availability.mime = p['mime'];
        this.availability.codes = p['codes'];
        this.availability.size = p['size'];
        //this.availability.coverageUrl = p["coverageUrl"];
    }

    if (this.metaUrl && this.maskUrl) {
        this.availability = {
            type : VTS_TEXTURECHECK_MEATATILE
        };
    }

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

        /*
        for (var i = 0, li = this.credits.length; i < li; i++) {
            var credit = this.map.getCreditById(this.credits[i]);
                //this.creditsNumbers.push(credit ? credit.id : null); 
        }*/
        
        break;
    }
};


MapBoundLayer.prototype.kill = function() {
};


MapBoundLayer.prototype.setOptions = function() {
};


MapBoundLayer.prototype.getOptions = function() {
    return this.getInfo();
};


MapBoundLayer.prototype.getInfo = function() {
    return {
        'type' : this.type,
        'url' : this.url,
        'tileSize' : this.tileSize,
        'credits' : this.credits,
        'lodRange' : this.lodRange,
        'tileRange' : this.tileRange,
        'mataUrl' : this.metaUrl,
        'maskUrl' : this.maskUrl,
        'isTransparent' : this.isTransparent
    };
};


MapBoundLayer.prototype.processUrl = function(url, fallback) {
    if (!url) {
        return fallback;
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


MapBoundLayer.prototype.hasTile = function(id) {
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


MapBoundLayer.prototype.hasTileOrInfluence = function(id) {
    var shift = id[0] - this.lodRange[0];

    if (shift < 0) {
        return false;
    }

    var x = id[1] >> shift;
    var y = id[2] >> shift;

    if (x < this.tileRange[0][0] || x > this.tileRange[1][0] ||
        y < this.tileRange[0][1] || y > this.tileRange[1][1] ) {
        return 0;
    }

    return (id[0] > this.lodRange[1]) ? 1 : 2;
};


MapBoundLayer.prototype.getUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.url, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


MapBoundLayer.prototype.getMetatileUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.metaUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


MapBoundLayer.prototype.getMaskUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.maskUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


export default MapBoundLayer;


