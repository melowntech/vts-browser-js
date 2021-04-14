
import {math as math_} from '../../utils/math';
import {vec3 as vec3_} from '../../utils/matrix';
import {utils as utils_} from '../../utils/utils';
import {utilsUrl as utilsUrl_} from '../../utils/url';


//get rid of compiler mess
var math = math_;
var vec3 = vec3_;
var utils = utils_;
var utilsUrl = utilsUrl_;

var MapGeodataImportVTSTree = function() {
    this.bintree = null;
    this.pathTable = null;
    this.totalNodes = 0;
    this.pathTableSize = 1;
    this.nodesIndex = 0;
    this.rootSize = 1;
};


MapGeodataImportVTSTree.prototype.processNode = function(nodes, nindex, index, lod, onlyChildren) {

    var index2 = index * 9;

    var flags = nodes[nindex];

    for (var i = 0; i < 8; i++) {

        this.bintree[index2] = nindex;
        
        if (flags & (1 << i))
        {
            this.totalNodes++;
            var childIndex = this.totalNodes;
            var octant = i;
            
            this.bintree[index2 + 1 + octant] = childIndex;

            this.processNode(nodes, childIndex, childIndex, lod + 1);
        }
    }
        
};


MapGeodataImportVTSTree.prototype.processTree = function(data, options) {
    
    var dataView = new DataView(data);
    var index = 0;
    var magic = '';

    if (data.length < 2) {
        return false;
    }

    magic += String.fromCharCode(dataView.getUint8(index, true)); index += 1;
    magic += String.fromCharCode(dataView.getUint8(index, true)); index += 1;

    if (magic != 'tr') {
        return false;
    }

    this.version = dataView.getUint16(index, true); index += 2;
    var jsonSize = dataView.getUint32(index, true); index += 4;

    var json = utils.unint8ArrayToString(new Uint8Array(data, index, jsonSize));
    index += jsonSize;

    try {
        json = JSON.parse(json);
    } catch (e) {
    } 

    var headerSize = jsonSize + 2 + 2 + 4;

    var bboxIndex;

    if (json['bbox'] && json['bbox']['offset']) {
        bboxIndex = json['bbox']['offset'];
    }

    this.texelSize = json['texelSize'];

    var node = json['node'];

    if (!node) {
        return false;
    }

    if (!node['features'] || !node['features'].legnth < 1) {
        return false;
    }

    var treeSize = dataView.getUint32(index, true); index += 4;
    var treeArray = new Uint8Array(data, index, treeSize); index += treeSize;

    var features = node['features'];
    var indicesArray;
    
    this.features = [];
    
    for (var i = 0, li = features.length; i < li; i++) {

        var feature = {
            type : features[i]['type'],
            uri : features[i]['uri']
        };

        if (features[i]['offset']) {
            feature.indices = new Uint32Array(data.slice(features[i]['offset'] + headerSize, features[i]['offset'] + headerSize + (treeSize+1) * 4));
        }
        
        this.features.push(feature);
    }

    if (bboxIndex) {
        this.bbox = new Float64Array(data.slice(headerSize + bboxIndex, headerSize + bboxIndex + 8 * 3 * 8));
    }

    this.bintree = new Uint32Array(treeSize*9);
    this.totalNodes = 0;

    //debugger

    if (options.root) {
        
        var bbox = this.bbox;

        var center = [ (bbox[0]+bbox[3]+bbox[6]+bbox[9]+bbox[12]+bbox[15]+bbox[18]+bbox[21])/8,
                       (bbox[1]+bbox[4]+bbox[7]+bbox[10]+bbox[13]+bbox[16]+bbox[19]+bbox[22])/8,
                       (bbox[2]+bbox[5]+bbox[8]+bbox[11]+bbox[14]+bbox[17]+bbox[20]+bbox[23])/8 ];

        this.rootPoints = [

            [bbox[0],
             bbox[1],
             bbox[2]],

            [bbox[3],
             bbox[4],
             bbox[5]],

             [bbox[9],
              bbox[10],
              bbox[11]],

            [bbox[6],
             bbox[7],
             bbox[8]],


            [bbox[12],
             bbox[13],
             bbox[14]],

            [bbox[15],
             bbox[16],
             bbox[17]],

             [bbox[21],
              bbox[22],
              bbox[23]],

            [bbox[18],
             bbox[19],
             bbox[20]],

        ];

        this.rootCenter = center;
        this.rootRadius = vec3.distance(center, this.rootPoints[0]);
        this.rootTexelSize = this.texelSize ? this.texelSize : vec3.distance(this.rootPoints[0], this.rootPoints[1]) / 256.0;
        
    } else {
        this.rootPoints = [];
        this.rootCenter = [];
        this.rootRadius = 1;
        this.rootTexelSize = 1;
    }

    this.processNode(treeArray, 0, 0, 0);
    this.totalNodes++;

};


MapGeodataImportVTSTree.prototype.load = function(path, options, onLoaded) {
    utils.loadBinary(path, this.onLoaded.bind(this, options, onLoaded), null);
};


MapGeodataImportVTSTree.prototype.onLoaded = function(options, onLoaded, data) {
    this.processTree(data, options);
    
    if (onLoaded) {
        onLoaded(options, {
                   'bintree': this.bintree,
                   'pathTable': this.pathTable,
                   'totalNodes': this.totalNodes,
                   'rootSize': this.rootSize,
                   'points': this.rootPoints,
                   'center': this.rootCenter,
                   'radius': this.rootRadius,
                   'texelSize': this.rootTexelSize,
                   'features': this.features,
                   'vtsFormat': true
               });
    }
}

export default MapGeodataImportVTSTree;









