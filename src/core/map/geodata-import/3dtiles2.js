
import {math as math_} from '../../utils/math';
import {vec3 as vec3_} from '../../utils/matrix';
import {utils as utils_} from '../../utils/utils';
import {utilsUrl as utilsUrl_} from '../../utils/url';



//get rid of compiler mess
var math = math_;
var vec3 = vec3_;
var utils = utils_;
var utilsUrl = utilsUrl_;

var MapGeodataImport3DTiles2 = function() {
    this.bintree = null;
    this.pathTable = null;
    this.totalNodes = 0;
    this.pathTableSize = 1;
    this.nodesIndex = 0;
    this.rootSize = 1;
};

MapGeodataImport3DTiles2.prototype.countNode = function(node, onlyChildren) {
    this.totalNodes++;


    var content = node['content'];

    if (content && content['uri']) {
        var path = content['uri'];

        var tmp = path.split(".");
        if (tmp.length > 1) {
            
            var ext = tmp[tmp.length - 1];
            tmp.pop();
            var stmp = tmp.join('.');

            if (ext == "json") {
                this.pathTableSize += stmp.length + 1 + 4;
            } else if (ext == "mesh") {
                this.pathTableSize += stmp.length + 1;
            }
        }
    }


    var children = node['children'];

    if (children) {
        for (var i = 0, li = children.length; i < li; i++) {
            this.countNode(children[i]);
        }
    }
};


MapGeodataImport3DTiles2.prototype.processNode = function(node, index, lod, onlyChildren) {

    var index2 = index * 9;

    //debugger
    var content = node['content'];

    if (content && content['uri']) {
        var path = content['uri'];

        var tmp = path.split(".");
        if (tmp.length > 1) {
            
            var ext = tmp[tmp.length - 1];
            tmp.pop();
            var stmp = tmp.join('.');

            if (ext == "json") {
                this.bintree[index2] = this.pathTableSize | (1<<31);
                this.pathTableSize += 4;
            } else if (ext == "mesh") {
                this.bintree[index2] = this.pathTableSize;
            }

            for (var i = 0, li = stmp.length; i < li; i++) {
                this.pathTable[this.pathTableSize++] = stmp.charCodeAt(i);
            }
            
            this.pathTable[this.pathTableSize++] = 0;
        }
    }

    var children = node['children'];

    if (children) {

        for (var i = 0, li = children.length; i < li; i++) {
            var child = children[i];
            var boundingVolume = child['boundingVolume'];

            if (boundingVolume) {
                
                var extras = child['extras'];
                var octant = 0;
                
                if (extras) {
                    octant = extras['ci'];
                }
                
                var ix = octant & 1;
                var iy = (octant & (1<<1)) >> 1;
                var iz = (octant & (1<<2)) >> 2;
                
                iz = 1 - iz;
                
                //octant = (ix<<0) + (iy << 1) + (iz << 2);
                octant = (ix<<0) + (iy << 1) + (iz << 2);
                
                if (boundingVolume['region']) {
                    
                    this.totalNodes++;
                    var childIndex = this.totalNodes;
                    
                    this.bintree[index2 + 1 + octant] = childIndex;

                    this.processNode(child, childIndex, lod + 1);
                }
            }
        }
    }
};


MapGeodataImport3DTiles2.prototype.processJSON = function(json, options) {
    if (!json) {
        return;
    }

    this.rootPath = '';

    this.countNode(json['root']);
    //alloc memory
    this.bintree = new Uint32Array(this.totalNodes*9);
    this.pathTable = new Uint8Array(this.pathTableSize+1);

    this.totalNodes = 0;
    this.pathTableSize = 1;

    //debugger

    if (options.root) {
        
        var extras = json['extras'];
        var points = extras['extents'];

        var center = [ (points[0][0]+points[1][0]+points[2][0]+points[3][0]+points[4][0]+points[5][0]+points[6][0]+points[7][0])/8,
                       (points[0][1]+points[1][1]+points[2][1]+points[3][1]+points[4][1]+points[5][1]+points[6][1]+points[7][1])/8,
                       (points[0][2]+points[1][2]+points[2][2]+points[3][2]+points[4][2]+points[5][2]+points[6][2]+points[7][2])/8 ];

        this.rootPoints = points;
        this.rootCenter = center;
        this.rootRadius = vec3.distance(center, points[0]);
        this.rootTexelSize = extras['nominalResolution'] * Math.pow(2,extras['depth']);
    } else {
        this.rootPoints = [];
        this.rootCenter = [];
        this.rootRadius = 1;
        this.rootTexelSize = 1;
    }

    this.processNode(json['root'], 0, 0);
    this.totalNodes++;
};


MapGeodataImport3DTiles2.prototype.loadJSON = function(path, options, onLoaded) {
    utils.loadJSON(path, this.onLoaded.bind(this, options, onLoaded), null);
};

MapGeodataImport3DTiles2.prototype.onLoaded = function(options, onLoaded, json) {
    this.processJSON(json, options);
    
    if (onLoaded) {
        onLoaded(options, {
                   'bintree': this.bintree,
                   'pathTable': this.pathTable,
                   'totalNodes': this.totalNodes,
                   'rootSize': this.rootSize,
                   'points': this.rootPoints,
                   'center': this.rootCenter,
                   'radius': this.rootRadius,
                   'texelSize': this.rootTexelSize
               });
    }
}

export default MapGeodataImport3DTiles2;









