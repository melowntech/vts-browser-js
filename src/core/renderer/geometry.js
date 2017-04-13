
import BBox_ from './bbox';

//get rid of compiler mess
var BBox = BBox_;


var RendererGeometry = {};


RendererGeometry.setFaceVertices = function(vertices, a, b, c, index) {
    vertices[index] = a[0];
    vertices[index+1] = a[1];
    vertices[index+2] = a[2];

    vertices[index+3] = b[0];
    vertices[index+4] = b[1];
    vertices[index+5] = b[2];

    vertices[index+6] = c[0];
    vertices[index+7] = c[1];
    vertices[index+8] = c[2];
};


RendererGeometry.setFaceUVs = function(uvs, a, b, c, index) {
    uvs[index] = a[0];
    uvs[index+1] = a[1];

    uvs[index+2] = b[0];
    uvs[index+3] = b[1];

    uvs[index+4] = c[0];
    uvs[index+5] = c[1];
};


// Procedural mesh representing a heightmap block
// Creates a grid of size x size vertices, all coords are [0..1].
RendererGeometry.buildHeightmap = function(size) {
    size--;

    var g = RendererGeometry;
    var numFaces = (size* size) * 2;
    var vertices = new Float32Array(numFaces * 3 * 3);//[];
    var uvs = new Float32Array(numFaces * 3 * 2);//[];

    var USHRTMAX = 65535;
    var factor = 1.0 * size;
    var index = 0;
    var index2 = 0;

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var x1 = (j) * factor;
            var x2 = (j+1) * factor;

            var y1 = (i) * factor;
            var y2 = (i+1) * factor;

            g.setFaceVertices(vertices, [x1, y1, 0], [x2, y1, 0], [x2, y2, 0], index);
            g.setFaceUVs(uvs, [x1, y1], [x2, y1], [x2, y2], index2);
            index += 9;
            index2 += 6;

            g.setFaceVertices(vertices, [x2, y2, 0], [x1, y2, 0], [x1, y1, 0], index);
            g.setFaceUVs(uvs, [x2, y2], [x1, y2], [x1, y1], index2);
            index += 9;
            index2 += 6;
        }
    }

    var bbox = new BBox(0,0,0,1,1,1);

    return { bbox:bbox, vertices:vertices, uvs: uvs};
};


RendererGeometry.buildPlane = function(size) {
    size--;

    var g = RendererGeometry;
    var numFaces = (size* size) * 2;
    var vertices = new Float32Array(numFaces * 3 * 3);//[];
    var uvs = new Float32Array(numFaces * 3 * 2);//[];

    var USHRTMAX = 65535;
    var factor = 1.0 / (size);
    var index = 0;
    var index2 = 0;

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var x1 = j;
            var x2 = j+1;
            var y1 = i;
            var y2 = i+1;

            var xx1 = j * factor;
            var xx2 = (j+1) * factor;
            var yy1 = (i) * factor;
            var yy2 = (i+1) * factor;

            g.setFaceVertices(vertices, [x1, y1, 0], [x1, y2, 0], [x2, y2, 0], index);
            g.setFaceUVs(uvs, [xx1, yy1], [xx1, yy2], [xx2, yy2], index2);
            index += 9;
            index2 += 6;

            g.setFaceVertices(vertices, [x2, y2, 0], [x2, y1, 0], [x1, y1, 0], index);
            g.setFaceUVs(uvs, [xx2, yy2], [xx2, yy1], [xx1, yy1], index2);
            index += 9;
            index2 += 6;
        }
    }

    var bbox = new BBox(0,0,0,1,1,1);

    return { bbox:bbox, vertices:vertices, uvs: uvs};
};

/*
var v = document.getElementById("canv");
v.width = 250;v.height = 250;
var c = v.getContext("2d"); 

function getQuadPoint(p1,p2,p3,t) {
  var t2 = (1-t);
  var px = 2*p2[0]-p1[0]*0.5-p3[0]*0.5;
  var py = 2*p2[1]-p1[1]*0.5-p3[1]*0.5;
  return [t2*t2*p1[0]+2*t2*t*px+t*t*p3[0],
          t2*t2*p1[1]+2*t2*t*py+t*t*p3[1]];
}

var plane = [
  [[50,50], [100,10], [150,50]],
  [[10,100], [100,100], [190,100]],
  [[50,150], [100,190], [150,150]]
];

var size = 16;

c.fillStyle = "rgb(200,0,0)";
for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
     var t = j / (size-1);
     var p1 = getQuadPoint(plane[0][0],plane[0][1],plane[0][2],t);
     var p2 = getQuadPoint(plane[1][0],plane[1][1],plane[1][2],t);
     var p3 = getQuadPoint(plane[2][0],plane[2][1],plane[2][2],t);
     var t2 = i / (size-1);
     var p = getQuadPoint(p1,p2,p3,t2);
         c.fillRect(p[0], p[1], 5, 5);
   }
}
 */

RendererGeometry.spherePos = function(lon, lat) {
    lat *= Math.PI;
    lon *= 2*Math.PI;

    return [Math.cos(lon)*Math.sin(lat)*0.5 + 0.5,
                Math.sin(lon)*Math.sin(lat)*0.5 + 0.5,
                Math.cos(lat) * 0.5 + 0.5];
};


// Creates an approximation of a unit sphere, note that all coords are
// in the range [0..1] and the center is in (0.5, 0.5). Triangle "normals"
// are oriented inwards.
RendererGeometry.buildSkydome = function(latitudeBands, longitudeBands) {
    var g = RendererGeometry;
    var numFaces = (latitudeBands * longitudeBands) * 2;
    var vertices = new Float32Array(numFaces * 3 * 3);
    var uvs = new Float32Array(numFaces * 3 * 2);
    var index = 0;
    var index2 = 0;

    for (var lat = 0; lat < latitudeBands; lat++) {
        for (var lon = 0; lon < longitudeBands; lon++)
        {
            var lon1 = ((lon) / longitudeBands);
            var lon2 = ((lon+1) / longitudeBands);

            var lat1 = ((lat) / latitudeBands);
            var lat2 = ((lat+1) / latitudeBands);

            g.makeQuad(lon1, lat1, lon2, lat2, vertices, index, uvs, index2);
            index += 9*2;
            index2 += 6*2;
        }
    }

    var bbox = new BBox(0,0,0,1,1,1);

    return { bbox:bbox, vertices:vertices, uvs: uvs};
};


RendererGeometry.makeQuad = function(lon1, lat1, lon2, lat2, vertices, index, uvs, index2) {
    var g = RendererGeometry;
    var a = g.spherePos(lon1, lat1), ta = [lon1, lat1];
    var b = g.spherePos(lon1, lat2), tb = [lon1, lat2];
    var c = g.spherePos(lon2, lat1), tc = [lon2, lat1];
    var d = g.spherePos(lon2, lat2), td = [lon2, lat2];
    g.setFaceVertices(vertices, b, a, c, index);
    g.setFaceUVs(uvs, tb, ta, tc, index2);
    g.setFaceVertices(vertices, c, d, b, index+9);
    g.setFaceUVs(uvs, tc, td, tb, index2+6);
};


export default RendererGeometry;


