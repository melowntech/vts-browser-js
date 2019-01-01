
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
RendererGeometry.buildHeightmap = function(size, use16bit) {
    size--;

    var g = RendererGeometry;
    var numFaces = (size* size) * 2;
    var vertices = new Float32Array(numFaces * 3 * 3);//[];
    var uvs = new Float32Array(numFaces * 3 * 2);//[];

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

    if (use16bit) {
        return { bbox:bbox, vertices:this.covnetTo16Bit(vertices), uvs: this.covnetTo16Bit(uvs)};
    } else {
        return { bbox:bbox, vertices:vertices, uvs: uvs};
    }
};


RendererGeometry.buildPlane = function(size, use16bit) {
    size--;

    var g = RendererGeometry;
    var numFaces = (size* size) * 2;
    var vertices = (use16bit) ? (new Uint16Array(numFaces * 3 * 3)) : (new Float32Array(numFaces * 3 * 3));
    var uvs = new Float32Array(numFaces * 3 * 2);//[];

    var factor = 1.0 / (size);
    var index = 0, index2 = 0;
    var x1, y1, x2, y2, xx1, xx2, yy1, yy2;

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            x1 = j;
            x2 = j+1;
            y1 = i;
            y2 = i+1;

            xx1 = j * factor;
            xx2 = (j+1) * factor;
            yy1 = (i) * factor;
            yy2 = (i+1) * factor;

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

    if (use16bit) {
        return { bbox:bbox, vertices:vertices, uvs: this.covnetTo16Bit(uvs)};
    } else {
        return { bbox:bbox, vertices:vertices, uvs: uvs};
    }
};

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
RendererGeometry.buildSkydome = function(latitudeBands, longitudeBands, use16bit, useIndices) {
    var g = RendererGeometry;
    var numFaces = (latitudeBands * longitudeBands) * 2;
    var numVertices = (latitudeBands * longitudeBands) * (useIndices ? 1 : 3);
    var vertices = new Float32Array(numVertices * 3);
    var uvs = new Float32Array(numVertices * 2);
    var indices = useIndices ? (new Uint16Array(numFaces * 3)) : null;
    var index = 0, index2 = 0;
    var g = RendererGeometry, lat, lon, lon2, lat2, v, flon, flat;

    if (useIndices) {

        for (lat = 0; lat < latitudeBands; lat++) {
            for (lon = 0; lon < longitudeBands; lon++) {

                flon = lon / longitudeBands;
                flat = lat / latitudeBands;
                v = g.spherePos(flon, flat);

                vertices[index] = v[0];
                vertices[index+1] = v[1];
                vertices[index+2] = v[2];

                uvs[index2] = flon;
                uvs[index2+1] = flat;

                index += 3;
                index2 += 2;
            }
        }

        index = 0;

        for (lat = 0; lat < (latitudeBands - 1); lat++) {
            for (lon = 0; lon < longitudeBands; lon++) {

                lat2 = lat + 1;
                lon2 = lon + 1;

                if (lon2 >= longitudeBands) {
                    lon2 = 0;
                }

                indices[index] = (lat2 * longitudeBands) + lon;
                indices[index+1] = (lat * longitudeBands) + lon;
                indices[index+2] = (lat * longitudeBands) + lon2;

                indices[index+3] = (lat * longitudeBands) + lon2;
                indices[index+4] = (lat2 * longitudeBands) + lon2;
                indices[index+5] = (lat2 * longitudeBands) + lon;

                index += 6;
            }
        }

    } else {

        for (var lat = 0; lat < latitudeBands; lat++) {
            for (var lon = 0; lon < longitudeBands; lon++) {

                var lon1 = ((lon) / longitudeBands);
                var lon2 = ((lon+1) / longitudeBands);

                var lat1 = ((lat) / latitudeBands);
                var lat2 = ((lat+1) / latitudeBands);

                g.makeQuad(lon1, lat1, lon2, lat2, vertices, index, uvs, index2);
                index += 9*2;
                index2 += 6*2;
            }
        }

    }

    var bbox = new BBox(0,0,0,1,1,1);

    if (use16bit) {
        return { bbox:bbox, vertices:this.covnetTo16Bit(vertices), uvs: this.covnetTo16Bit(uvs), indices:indices};
    } else {
        return { bbox:bbox, vertices:vertices, uvs: uvs, indices:indices};
    }
};

RendererGeometry.covnetTo16Bit = function(array) {
    var t, array2 = new Uint16Array(array.length);

    for (var i = 0, li = array.length; i < li; i++) {
        t = array[i] * 65535;
        if (t < 0) t = 0; if (t > 65535) t = 65535;
        array2[i] = t;
    }

    return array2;
}


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


