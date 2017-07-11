
import {vec3 as vec3_} from '../utils/matrix';
/*import {math as math_} from '../utils/math';*/

//get rid of compiler mess
var vec3 = vec3_;
/*var math = math_;*/


var MapGeodataGeometry = function(map, data) {
    this.map = map;
    this.data = data;
    this.camera = map.camera;

    switch (data.type) {
        case 'point-geometry':   
            this.type = 1;
            this.vertexBuffer = this.data.geometryBuffer;
            break;
        case 'line-geometry':
            this.type = 2;
            this.vertexBuffer = this.data.geometryBuffer;
            this.indicesBuffer = this.data.indicesBuffer;
            break;
        case 'polygon-geometry':
            this.type = 3;
            break;
    }
};

MapGeodataGeometry.prototype.getType = function(id) {
    return this.data.type;
};

MapGeodataGeometry.prototype.getElement = function(index) {
    var v = this.vertexBuffer, i = index * 3;
    switch(this.type) {
        case 1: return [v[i], v[i+1], v[i+2]]; //point
        case 2: return [[v[i], v[i+1], v[i+2]],  [v[i+3], v[i+4], v[i+5]]]; //line
    }
};

MapGeodataGeometry.prototype.getRelationToCanvasPoint = function(index, screenX, screenY) {
    var v = this.vertexBuffer, i = index * 3;
    var c1, c2, cv, p, r = [0,0,0];
    var a, b, c, d, e, D, sc, tc, u, v, w;

    c1 = this.camera.position;
    cv = this.camera.vector;

    switch(this.type) {
        case 1: 

            //get point
            p = [v[i], v[i+1], v[i+2]];

            cp = [p[0] - c[0], p[0] - c[0],]

            //distance = vec3.coss(ray.direction, point - ray.origin).magnitude;
            vec3.cross(cv, cp, r)
            d = vec3.length(p);

            return {
                'distance' : d,
                'point' : p
            }

        case 2: 

            //line points
            p1 = [v[i], v[i+1], v[i+2]];
            p2 = [v[i+3], v[i+4], v[i+5]]; 

            //distance = http://geomalgorithms.com/a07-_distance.html

            u = cv;
            v = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
            w = [c1[0] - p1[0], c1[1] - p1[1], c1[2] - p1[2]];
            a = vec3.dot(u,u);    // always >= 0
            b = vec3.dot(u,v);
            c = vec3.dot(v,v);    // always >= 0
            d = vec3.dot(u,w);
            e = vec3.dot(v,w);
            D = a*c - b*b;        // always >= 0

            // compute the line parameters of the two closest points
            if (D < 0.0000001) {          // the lines are almost parallel
                sc = 0.0;
                tc = (b>c ? d/b : e/c);    // use the largest denominator
            }
            else {
                sc = (b*e - c*d) / D;
                tc = (a*e - b*d) / D;
            }

            // get the difference of the two closest points
            var dP = [ w[0] + (u[0] * sc) - (v[0] * tc),
                       w[1] + (u[1] * sc) - (v[1] * tc),
                       w[2] + (u[2] * sc) - (v[2] * tc) ];

            return {
                'closest' : [ p1[0] + (v[0] * tc), p1[1] + (v[1] * tc), p1[2] + (v[2] * tc) ],
                'line-distance' : vec3.length(dP),
                'distance' : tc,
                'line' : [p1, p2]
            }
    }
};

MapGeodataGeometry.prototype.getPathElement = function(index, pathIndex) {
    if (this.type != 2) {
        return null;
    }

    var i = (this.indicesBuffer[pathIndex] + index) * 3, v = this.vertexBuffer;
    return [[v[i], v[i+1], v[i+2]],  [v[i+3], v[i+4], v[i+5]]];
};

MapGeodataGeometry.prototype.getPathPoint = function(distance, pathIndex) {
    pathIndex = pathIndex || 0;

    var si = (this.indicesBuffer[pathIndex]) * 3, v = this.vertexBuffer;
    var ei = ((pathIndex >= this.indicesBuffer.length) ? this.indicesBuffer.length : this.indicesBuffer[pathIndex]) * 3;

    var totalLength = 0, v = this.vertexBuffer;

    for (var i = si; i < (ei-3); i++) {
        var delta = [v[i+4] - v[i], v[i+5] - v[i+1], v[i+6] - v[i+2]];
        var length = vec3.length(delta);

        if (totalLength + length > distance) {
            var factor = (totalLength + length) / distance;
            return [v[i] + d[0] * factor, v[i+1] + d[1] * factor, v[i+2] + d[2] * factor];
        }

        totalLength += length;    
    }

    return [v[ei-3], v[ei-2], v[ei-1]];
};

MapGeodataGeometry.prototype.getPathNED = function(distance, withoutSlope, pathIndex) {
    pathIndex = pathIndex || 0;

    var si = (this.indicesBuffer[pathIndex]) * 3, v = this.vertexBuffer;
    var ei = ((pathIndex >= this.indicesBuffer.length) ? this.indicesBuffer.length : this.indicesBuffer[pathIndex]) * 3;

    var totalLength = 0, p, delta, length, v = this.vertexBuffer;

    for (var i = si; i < (ei-3); i++) {
        delta = [v[i+4] - v[i], v[i+5] - v[i+1], v[i+6] - v[i+2]];
        length = vec3.length(delta);

        if (totalLength + length > distance) {
            var factor = (totalLength + length) / distance;
            p = [v[i] + d[0] * factor, v[i+1] + d[1] * factor, v[i+2] + d[2] * factor];
            break;
        }

        totalLength += length;    
    }

    if (!p) {
        p = [v[ei-3], v[ei-2], v[ei-1]];
    }

    var vv = [0, 0, 0];
    var nn = [0, 0, 0];
    var pp = [0, 0, 0];

    vec3.nomalize(delta, vv);
    vec3.nomalize(p, pp);
    vec3.cross(pp, vv, nn);    

    if (withoutSlope) {
        vec3.cross(pp, nn, vv);    
    }

    var east = nn;
    var direction = vv;
    var north = pp;

    return {
        'east'  : east, 
        'direction' : direction,
        'north' : north,
        'position' : p,
        'matrix' : [
            east[0], east[1], east[2], 0,
            north[0], north[1], north[2], 0,
            direction[0], direction[1], direction[2], 0,
            0, 0, 0, 1
        ] 
    };    
};

MapGeodataGeometry.prototype.getPathLength = function(pathIndex) {
    pathIndex = pathIndex || 0;

    var si = (this.indicesBuffer[pathIndex]) * 3, v = this.vertexBuffer;
    var ei = ((pathIndex >= this.indicesBuffer.length) ? this.indicesBuffer.length : this.indicesBuffer[pathIndex]) * 3;

    var totalLength = 0;

    for (var i = si; i < (ei-3); i++) {
        totalLength += length;    
    }

    return totalLength;
};

MapGeodataGeometry.prototype.getPathsCount = function(distance) {
    if (this.type != 2) {
        return 0;
    }

    return this.indicesBuffer.length;
};



export default MapGeodataGeometry;


