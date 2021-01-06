
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


MapGeodataImport3DTiles2.prototype.processNodeOctants = function(node, parent, skipRoot) {
    var content = node['content'];
    node.parent = parent;

    if (content && content['uri']) {
        var path = content['uri'];

        var tmp = path.split(".");
        if (tmp.length > 1) {
            
            var ext = tmp[tmp.length - 1];
            tmp.pop();
            var stmp = tmp.join('.');

            if (ext == "json") {
                /*
                tmp = stmp.split("-");
                
                var node2 = node;
                
                for (var i = 1, li = tmp.length; i < li; i++ ) {
                    
                    node2.octant = parseInt(tmp[tmp.length - i]);
                    
                    if (node2.parent) {
                        node2 = node2.parent;
                    } else {
                        break;
                    }
                }
                */
            } else if (ext == "mesh") {

                tmp = stmp.split("/");
                tmp = tmp[tmp.length - 1];
                tmp = tmp.split("-");

                var ix = parseInt(tmp[tmp.length - 3]);
                var iy = parseInt(tmp[tmp.length - 2]);
                var iz = parseInt(tmp[tmp.length - 1]);

                node.octant = (ix % 2) + (iy % 2)*2 + ((iz+1) % 2)*4;

                var node2 = node;
                
                while (node2.parent) {
                    node2 = node2.parent;
                    
                    ix >>= 1;
                    iy >>= 1;
                    iz >>= 1;
                    
                    var octant = (ix % 2) + (iy % 2)*2 + ((iz+1) % 2)*4;
                    
                    if (typeof node2.octant != 'undefined' && node2.octant != octant) {
                        debugger;
                    }
                    
                    if (!node2.parent) {
                        if (!skipRoot)
                            node2.octant = octant;
                    } else 
                        node2.octant = octant;
                }

            }
        }
    }
    
    var children = node['children'];

    if (children) {
        
        if (children.length > 8) {
            debugger
        }

        for (var i = 0, li = children.length; i < li; i++) {
            var child = children[i];
            this.processNodeOctants(child, node, skipRoot);
        }
    }    
};


MapGeodataImport3DTiles2.prototype.processNode = function(node, index, nodePoints, nodeCenter, lod, onlyChildren) {

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

    /*
    var boundingVolume = node['boundingVolume'];
    var nodePoints;

    if (boundingVolume) {
        if (boundingVolume['region']) {
            var v = boundingVolume['region'];
            var min = [math.degrees(v[0]), math.degrees(v[1]), v[4]];
            var max = [math.degrees(v[2]), math.degrees(v[3]), v[5]];
            var p = [];

            p[0] = this.convertWGSToGeocent([min[0], max[1], max[2]]);
            p[1] = this.convertWGSToGeocent([max[0], max[1], max[2]]);
            p[2] = this.convertWGSToGeocent([max[0], min[1], max[2]]);
            p[3] = this.convertWGSToGeocent([min[0], min[1], max[2]]);

            p[4] = this.convertWGSToGeocent([min[0], max[1], min[2]]);
            p[5] = this.convertWGSToGeocent([max[0], max[1], min[2]]);
            p[6] = this.convertWGSToGeocent([max[0], min[1], min[2]]);
            p[7] = this.convertWGSToGeocent([min[0], min[1], min[2]]);
            nodePoints = p;
        }
    }*/

    var xv = [(nodePoints[1][0] - nodePoints[0][0])*0.5, (nodePoints[1][1] - nodePoints[0][1])*0.5, (nodePoints[1][2] - nodePoints[0][2])*0.5];
    var yv = [(nodePoints[1][0] - nodePoints[2][0])*0.5, (nodePoints[1][1] - nodePoints[2][1])*0.5, (nodePoints[1][2] - nodePoints[2][2])*0.5];
    var zv = [(nodePoints[0][0] - nodePoints[4][0])*0.5, (nodePoints[0][1] - nodePoints[4][1])*0.5, (nodePoints[0][2] - nodePoints[4][2])*0.5];
    var xf, yf, zf;

    var children = node['children'];

    if (children && nodePoints) {
        console.log('o: ---');
        
        if (children.length > 8) {
            debugger
        }

        for (var i = 0, li = children.length; i < li; i++) {
            var child = children[i];
            var boundingVolume = child['boundingVolume'];

            if (boundingVolume) {
                if (boundingVolume['region']) {
                    var v = boundingVolume['region'];
                    var min = [math.degrees(v[0]), math.degrees(v[1]), v[4]];
                    var max = [math.degrees(v[2]), math.degrees(v[3]), v[5]];
                    var p = [];

                    p[0] = this.physSrs.convertCoordsFrom([min[0], max[1], max[2]], this.srs);
                    p[1] = this.physSrs.convertCoordsFrom([max[0], max[1], max[2]], this.srs);
                    p[2] = this.physSrs.convertCoordsFrom([max[0], min[1], max[2]], this.srs);
                    p[3] = this.physSrs.convertCoordsFrom([min[0], min[1], max[2]], this.srs);

                    p[4] = this.physSrs.convertCoordsFrom([min[0], max[1], min[2]], this.srs);
                    p[5] = this.physSrs.convertCoordsFrom([max[0], max[1], min[2]], this.srs);
                    p[6] = this.physSrs.convertCoordsFrom([max[0], min[1], min[2]], this.srs);
                    p[7] = this.physSrs.convertCoordsFrom([min[0], min[1], min[2]], this.srs);

                    /*
                    p[0] = this.convertWGSToGeocent([min[0], max[1], max[2]]);
                    p[1] = this.convertWGSToGeocent([max[0], max[1], max[2]]);
                    p[2] = this.convertWGSToGeocent([max[0], min[1], max[2]]);
                    p[3] = this.convertWGSToGeocent([min[0], min[1], max[2]]);

                    p[4] = this.convertWGSToGeocent([min[0], max[1], min[2]]);
                    p[5] = this.convertWGSToGeocent([max[0], max[1], min[2]]);
                    p[6] = this.convertWGSToGeocent([max[0], min[1], min[2]]);
                    p[7] = this.convertWGSToGeocent([min[0], min[1], min[2]]);
                    */

                    var center = [ (p[0][0]+p[1][0]+p[2][0]+p[3][0]+p[4][0]+p[5][0]+p[6][0]+p[7][0])/8,
                                   (p[0][1]+p[1][1]+p[2][1]+p[3][1]+p[4][1]+p[5][1]+p[6][1]+p[7][1])/8,
                                   (p[0][2]+p[1][2]+p[2][2]+p[3][2]+p[4][2]+p[5][2]+p[6][2]+p[7][2])/8 ];

                    var octant = this.getOctant(center, nodePoints);
                    //var octant2 = this.getOctantat2(child);
                    
                    console.log('o-o-' + i + ': ' + octant + ' ' + child.octant + ' ' + ((child['content'] && child['content']['uri']) ? child['content']['uri'] : ''));
                    
                    this.totalNodes++;
                    var childIndex = this.totalNodes;
                    
                    this.bintree[index2 + 1 + octant] = childIndex;

                    switch(octant) {
                        case 0: xf = -1, yf = -1, zf = -1; break;
                        case 1: xf = 0, yf = -1, zf = -1; break;
                        case 2: xf = -1, yf = 0, zf = -1; break;
                        case 3: xf = 0, yf = 0, zf = -1; break;
                        case 4: xf = -1, yf = -1, zf = 0; break;
                        case 5: xf = 0, yf = -1, zf = 0; break;
                        case 6: xf = -1, yf = 0, zf = 0; break;
                        case 7: xf = 0, yf = 0, zf = 0; break;
                    }

                    var p = [nodeCenter[0] + xv[0] * xf + yv[0] * yf + zv[0] * zf,
                             nodeCenter[1] + xv[1] * xf + yv[1] * yf + zv[1] * zf,
                             nodeCenter[2] + xv[2] * xf + yv[2] * yf + zv[2] * zf];

                    var childPoints = [

                        [p[0],
                         p[1],
                         p[2]],

                        [p[0] + xv[0],
                         p[1] + xv[1],
                         p[2] + xv[2]],

                        [p[0] + xv[0] + yv[0],
                         p[1] + xv[1] + yv[1],
                         p[2] + xv[2] + yv[2]],

                        [p[0] + yv[0],
                         p[1] + yv[1],
                         p[2] + yv[2]],

                        [p[0] + zv[0],
                         p[1] + zv[1],
                         p[2] + zv[2]],

                        [p[0] + xv[0] + zv[0],
                         p[1] + xv[1] + zv[1],
                         p[2] + xv[2] + zv[2]],

                        [p[0] + xv[0] + yv[0] + zv[0],
                         p[1] + xv[1] + yv[1] + zv[1],
                         p[2] + xv[2] + yv[2] + zv[2]],

                        [p[0] + yv[0] + zv[0],
                         p[1] + yv[1] + zv[1],
                         p[2] + yv[2] + zv[2]]

                    ];

                    var childCenter = [ (childPoints[0][0]+childPoints[1][0]+childPoints[2][0]+childPoints[3][0]+childPoints[4][0]+childPoints[5][0]+childPoints[6][0]+childPoints[7][0])/8,
                                   (childPoints[0][1]+childPoints[1][1]+childPoints[2][1]+childPoints[3][1]+childPoints[4][1]+childPoints[5][1]+childPoints[6][1]+childPoints[7][1])/8,
                                   (childPoints[0][2]+childPoints[1][2]+childPoints[2][2]+childPoints[3][2]+childPoints[4][2]+childPoints[5][2]+childPoints[6][2]+childPoints[7][2])/8 ];

                    this.processNode(child, childIndex, childPoints, childCenter, lod + 1);
                }
            }
        }

        
        var testCount = 0;
        for (var i = 0, li = 8; i < li; i++) {
            if (this.bintree[index2 + 1 + i]) {
                testCount++;
            }
        }
        
        if (testCount != children.length && lod < 4) {
            console.log('octant error');

            for (var i = 0, li = children.length; i < li; i++) {
                var child = children[i];
                var boundingVolume = child['boundingVolume'];

                var boundingVolume = child['boundingVolume'];

                if (boundingVolume) {
                    if (boundingVolume['region']) {
                        var v = boundingVolume['region'];
                        var min = [math.degrees(v[0]), math.degrees(v[1]), v[4]];
                        var max = [math.degrees(v[2]), math.degrees(v[3]), v[5]];
                        var p = [];

                        p[0] = this.physSrs.convertCoordsFrom([min[0], max[1], max[2]], this.srs);
                        p[1] = this.physSrs.convertCoordsFrom([max[0], max[1], max[2]], this.srs);
                        p[2] = this.physSrs.convertCoordsFrom([max[0], min[1], max[2]], this.srs);
                        p[3] = this.physSrs.convertCoordsFrom([min[0], min[1], max[2]], this.srs);

                        p[4] = this.physSrs.convertCoordsFrom([min[0], max[1], min[2]], this.srs);
                        p[5] = this.physSrs.convertCoordsFrom([max[0], max[1], min[2]], this.srs);
                        p[6] = this.physSrs.convertCoordsFrom([max[0], min[1], min[2]], this.srs);
                        p[7] = this.physSrs.convertCoordsFrom([min[0], min[1], min[2]], this.srs);
                        
                        //console.log(JSON.stringify(p));
                    }
                }
            }
            
            //console.log(JSON.stringify(nodePoints));

            //debugger
        }

    }
};


MapGeodataImport3DTiles2.prototype.convertWGSToGeocent = function(coords) {
    var HALFPI = Math.PI*0.5;
    var DEG2RAD = Math.PI / 180;
    var Longitude = coords[0] * DEG2RAD;
    var Latitude = coords[1] * DEG2RAD;
    var Height = coords[2];

    if (Latitude < -HALFPI) {
        Latitude = -HALFPI;
    }
    else if (Latitude > HALFPI) {
        Latitude = HALFPI;
    }

    if (Longitude > Math.PI) {
        Longitude -= (2 * Math.PI);
    }

    //datum wgs84
    var a = 6378137;
    var es = 0.006694379990141316;

    var SinLat = Math.sin(Latitude);
    var CosLat = Math.cos(Latitude);
    var Sin2Lat = SinLat * SinLat;
    var Rn = a / (Math.sqrt(1.0e0 - es * Sin2Lat)); //Earth radius at location
    
    return [
        (Rn + Height) * CosLat * Math.cos(Longitude),
        (Rn + Height) * CosLat * Math.sin(Longitude),
        ((Rn * (1 - es)) + Height) * SinLat ];
};


MapGeodataImport3DTiles2.prototype.getLinePointParametricDist = function(p0, p1, p) {

     var v = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
     var w = [p[0] - p0[0], p[1] - p0[1], p[2] - p0[2]];

     var c1 = vec3.dot(w,v);
     if (c1 <= 0)
          return 0;

     var c2 = vec3.dot(v,v);
     if (c2 <= c1)
          return 1;

     var b = c1 / c2;

     return b;
};


MapGeodataImport3DTiles2.prototype.getOctant = function(point, points) {
    var fx = this.getLinePointParametricDist(points[0], points[1], point);
    var fy = this.getLinePointParametricDist(points[1], points[2], point);
    var fz = this.getLinePointParametricDist(points[4], points[0], point);

    //console.log('' + fx + ' ' + fy + ' ' + fz);

    if (fz > 0.5) {
        if (fy > 0.5) {
            if (fx > 0.5) {
                return 5;
            } else {
                return 4;
            }
        } else {
            if (fx > 0.5) {
                return 7;
            } else {
                return 6;
            }
        }
    } else {
        if (fy > 0.5) {
            if (fx > 0.5) {
                return 1;
            } else {
                return 0;
            }
        } else {
            if (fx > 0.5) {
                return 3;
            } else {
                return 2;
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

    /*var boundingVolume = json['root']['boundingVolume'];

    if (boundingVolume) {
        if (boundingVolume['region']) {
            var v = boundingVolume['region'];
            var min = [math.degrees(v[0]), math.degrees(v[1]), v[4]];
            var max = [math.degrees(v[2]), math.degrees(v[3]), v[5]];

            var p0 = this.convertWGSToGeocent([min[0], max[1], max[2]]);
            var p1 = this.convertWGSToGeocent([max[0], max[1], max[2]]);
            var p3 = this.convertWGSToGeocent([min[0], min[1], max[2]]);
            var p4 = this.convertWGSToGeocent([min[0], max[1], min[2]]);

            this.rootSize = Math.max(vec3.distance(p0, p1),
                                     vec3.distance(p0, p3),
                                     vec3.distance(p0, p4));
        }
    }*/

    debugger
    this.processNodeOctants(json['root'], null, options.skipRoot);

    this.processNode(json['root'], 0, options.points, options.center, 0);
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
                   'rootSize': this.rootSize
               });
    }
}

export default MapGeodataImport3DTiles2;









