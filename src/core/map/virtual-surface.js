
import {utils as utils_} from '../utils/utils';
import BBox_ from '../renderer/bbox';

//get rid of compiler mess
var BBox = BBox_;
var utils = utils_;


var MapVirtualSurface = function(map, json) {
    this.map = map;
    this.id = null;
    this.metaUrl = '';
    this.mappingUrl = '';
    this.baseUrl = this.map.url.baseUrl;
    this.baseUrlSchema = this.map.url.baseUrlSchema;
    this.baseUrlOrigin = this.map.url.baseUrlOrigin;
    this.lodRange = [0,0];
    this.tileRange = [[0,0],[0,0]];
    this.surfaces = [];
    this.parseJson(json);
    this.virtual = true;
    this.ready = false;
};


MapVirtualSurface.prototype.parseJson = function(json) {
    this.id = json['id'] || null;
    this.metaUrl = this.processUrl(json['metaUrl'], '');
    this.mappingUrl = this.processUrl(json['mapping'], '');
    this.lodRange = json['lodRange'] || [0,0];
    this.tileRange = json['tileRange'] || [[0,0],[0,0]];
    this.strId = this.id ? this.id.join(';') : null;

    if (this.id) {
        var tmp = this.id.slice();
        tmp.sort(); 
        this.strId = tmp.join(';');
    }

    if (json['extents']) {
        var ll = json['extents']['ll'];
        var ur = json['extents']['ur'];
        this.extents = new BBox(ll[0], ll[1], ll[2], ur[0], ur[1], ur[2]);
    } else {
        this.extents = new BBox(0,0,0,1,1,1);
    }

    this.specificity = Math.pow(2,this.lodRange[0]) / ((this.tileRange[1][0] - this.tileRange[1][0]+1)*(this.tileRange[1][1] - this.tileRange[1][1]+1));    

    utils.loadBinary(this.mappingUrl, this.onMappingFileLoaded.bind(this), this.onMappingFileLoadError.bind(this), (utils.useCredentials ? (this.jsonUrl.indexOf(this.map.url.baseUrl) != -1) : false), this.map.core.xhrParams);
};


MapVirtualSurface.prototype.onMappingFileLoaded = function(data) {
    this.parseMappingFile(new DataView(data));            
    this.ready = true;
    this.map.refreshView();
};


MapVirtualSurface.prototype.onMappingFileLoadError = function() {
};


MapVirtualSurface.prototype.parseMappingFile = function(data) {
    var index = 0;

    var magic = '';
    magic += String.fromCharCode(data.getUint8(index, true)); index += 1;
    magic += String.fromCharCode(data.getUint8(index, true)); index += 1;

    if (magic != 'TM') {
        return false;
    }

    var count = data.getUint16(index, true); index += 2;

    for (var i = 0; i < count; i++) {
        var size = data.getUint8(index, true); index += 1;
        var id = [];

        for (var j = 0; j < size; j++) {
            var s = data.getUint16(index, true); index += 2;
            s = this.id[s];
            
            if (s) {
                id.push(s);
            }
        }
        
        if (id.length == 1) { //get surface
            this.surfaces.push(this.map.getSurface(id[0]));
        } else { //get glue
            this.surfaces.push(this.map.getGlue(id.join(';')));
        }
    }

    return true;    
};


MapVirtualSurface.prototype.getInfo = function() {
    return {
        'metaUrl' : this.metaUrl,
        'mapping' : this.mappingUrl,
        'lodRange' : this.lodRange,
        'tileRange' : this.tileRange
    };
};


MapVirtualSurface.prototype.processUrl = function(url, fallback) {
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


MapVirtualSurface.prototype.hasTile = function(id) {
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


MapVirtualSurface.prototype.hasTile2 = function(id) {
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


MapVirtualSurface.prototype.hasMetatile = function(id) {
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


//used only for glues
MapVirtualSurface.prototype.getSurface = function(index) {
    return this.surfaces[index - 1];
};


MapVirtualSurface.prototype.getMetaUrl = function(id, skipBaseUrl) {
    return this.map.url.makeUrl(this.metaUrl, {lod:id[0], ix:id[1], iy:id[2] }, null, skipBaseUrl);
};


export default MapVirtualSurface;

