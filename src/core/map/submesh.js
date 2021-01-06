// An index-less mesh. Each triangle has three items in the array 'vertices'.

import {mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';
import GpuMesh_ from '../renderer/gpu/mesh';
import BBox_ from '../renderer/bbox';

//get rid of compiler mess
var mat4 = mat4_;
var math = math_;
var GpuMesh = GpuMesh_;
var BBox = BBox_;


var MapSubmesh = function(mesh, stream) {
    this.generateLines = true;
    this.map = mesh.map;
    this.vertices = null;
    this.internalUVs = null;
    this.externalUVs = null;
    this.indices = null;
    this.mesh = mesh;
    this.statsCounter = 0;
    this.valid = true;
    this.killed = false;
    this.use16bit = mesh.use16bit;
    this.texture = null;

    this.bbox = new BBox();
    this.size = 0;    
    this.faces = 0;
    this.uvArea = 0;
    this.uvAreaComputed = false;

    this.flagsInternalTexcoords =  1;
    this.flagsExternalTexcoords =  2;
    this.flagsPerVertexUndulation =  4;
    this.flagsTextureMode =  8;

    if (stream) {
        this.parseSubmesh(stream);
    }
};


MapSubmesh.prototype.kill = function () {
    this.killed = true;
    this.vertices = null;
    this.internalUVs = null;
    this.externalUVs = null;
    this.indices = null;
    
    if (this.texture) {
        this.texture.kill();
        this.texture = null;
    }
};


// Reads the mesh from the binary representation.
MapSubmesh.prototype.parseSubmesh = function (stream) {

/*
struct MapSubmesh {
    struct MapSubmeshHeader header;
    struct VerticesBlock vertices;
    struct TexcoordsBlock internalTexcoords;   // if header.flags & ( 1 << 0 )
    struct FacesBlock faces;
};
*/
    this.parseHeader(stream);
    if (this.mesh.version >= 3) {
        this.parseVerticesAndFaces2(stream);
    } else {
        this.parseVerticesAndFaces(stream);
    }
};


MapSubmesh.prototype.parseHeader = function (stream) {

/*
struct MapSubmeshHeader {
    char flags;                    // bit 0 - contains internal texture coords
                                   // bit 1 - contains external texture coords
                                   // bit 2 - contains per vertex undulation
                                   // bit 3 - texture mode (0 - internal, 1 - external)
    
    uchar surfaceReference;        // reference to the surface of origin, see bellow
    ushort textureLayer;           // applicable if texture mode is external: texture layer numeric id
    double boundingBox[2][3];      // read more about bounding box bellow
};
*/

    var streamData = stream.data;

    this.flags = streamData.getUint8(stream.index, true); stream.index += 1;

    if (this.mesh.version > 1) {
        this.surfaceReference = streamData.getUint8(stream.index, true); stream.index += 1;
    } else {
        this.surfaceReference = 0;
    }

    this.textureLayer = streamData.getUint16(stream.index, true); stream.index += 2;
    this.textureLayer2 = this.textureLayer; //hack for presentation

    var bboxMin = this.bbox.min;
    var bboxMax = this.bbox.max;

    bboxMin[0] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMin[1] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMin[2] = streamData.getFloat64(stream.index, true); stream.index += 8;

    bboxMax[0] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMax[1] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMax[2] = streamData.getFloat64(stream.index, true); stream.index += 8;
    
    this.bbox.updateMaxSize();
};


MapSubmesh.prototype.parseVerticesAndFaces = function (stream) {
/*
struct VerticesBlock {
    ushort numVertices;              // number of vertices

    struct Vertex {                  // array of vertices, size of array is defined by numVertices property
        // vertex coordinates
        ushort x;
        ushort y;
        ushort z;

        // if header.flags & ( 1 << 1 ): external texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort eu;
        ushort ev;

        // if header.flags & ( 1 << 2 ): undulation delta
        float16 undulationDelta;
    } vertices[];
};
*/

    var data = stream.data;
    var index = stream.index;
    var uint8Data = stream.uint8Data;

    var numVertices = data.getUint16(index, true); index += 2;

    if (!numVertices) {
        this.valid = false;
    }

    var internalUVs = null;
    var externalUVs = null;
    var onlyOneUVs = this.map.config.mapOnlyOneUVs && (this.flags & this.flagsInternalTexcoords);

    var vertices = this.use16bit ? (new Uint16Array(numVertices * 3)) : (new Float32Array(numVertices * 3));

    if (this.flags & this.flagsExternalTexcoords) {
        if (onlyOneUVs) {
            externalUVs = true;
        } else {
            externalUVs = this.use16bit ? (new Uint16Array(numVertices * 2)) : (new Float32Array(numVertices * 2));
        }
    }

    var uvfactor = this.use16bit ? 1.0 : (1.0 / 65535);
    var vindex = 0;
    var uvindex = 0;
    var i, li;

    for (i = 0; i < numVertices; i++) {
        vertices[vindex] = (uint8Data[index] + (uint8Data[index + 1]<<8)) * uvfactor;
        vertices[vindex+1] = (uint8Data[index+2] + (uint8Data[index + 3]<<8)) * uvfactor;
        vertices[vindex+2] = (uint8Data[index+4] + (uint8Data[index + 5]<<8)) * uvfactor;
        vindex += 3;

        if (externalUVs) {
            if (!onlyOneUVs) {
                externalUVs[uvindex] = (uint8Data[index+6] + (uint8Data[index + 7]<<8)) * uvfactor;
                externalUVs[uvindex+1] = (65535 - (uint8Data[index+8] + (uint8Data[index + 9]<<8))) * uvfactor;
                uvindex += 2;
            }
            index += 10;
        } else {
            index += 6;
        }
    }


    this.tmpVertices = vertices;
    this.tmpExternalUVs = externalUVs;
   
/*
struct TexcoorsBlock {
    ushort numTexcoords;              // number of texture coordinates

    struct TextureCoords {            // array of texture coordinates, size of array is defined by numTexcoords property

        // internal texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort u;
        ushort v;
    } texcoords[];
};
*/

    if (this.flags & this.flagsInternalTexcoords) {
        var numUVs = data.getUint16(index, true); index += 2;
    
        internalUVs = this.use16bit ? (new Uint16Array(numUVs * 2)) : (new Float32Array(numUVs * 2));
        //var uvfactor = 1.0 / 65535;
    
        for (i = 0, li = numUVs * 2; i < li; i+=2) {
            internalUVs[i] = (uint8Data[index] + (uint8Data[index + 1]<<8)) * uvfactor;
            internalUVs[i+1] = (65535 - (uint8Data[index+2] + (uint8Data[index + 3]<<8))) * uvfactor;
            index += 4;
        }
    
        this.tmpInternalUVs = internalUVs;
    }

/*
struct FacesBlock {
    ushort numFaces;              // number of faces

    struct Face {                 // array of faces, size of array is defined by numFaces property

        ushort v[3]; // array of indices to stored vertices
        ushort t[3]; // if header.flags & ( 1 << 0 ): array of indices to stored internal texture coords

    } faces[];
};
*/

    var numFaces = data.getUint16(index, true); index += 2;
    var indices = null;

    internalUVs = null;
    externalUVs = null;

    var onlyExternalIndices = (this.map.config.mapIndexBuffers && this.map.config.mapOnlyOneUVs && !(this.flags & this.flagsInternalTexcoords));
    var onlyInternalIndices = (this.map.config.mapIndexBuffers && this.map.config.mapOnlyOneUVs && (this.flags & this.flagsInternalTexcoords));
    var onlyIndices = onlyExternalIndices || onlyInternalIndices;

    if (onlyIndices) {
        indices = new Uint16Array(numFaces * 3);
    } else {
        vertices = this.use16bit ? (new Uint16Array(numFaces * 3 * 3)) : (new Float32Array(numFaces * 3 * 3));

        if (this.flags & this.flagsInternalTexcoords) {
            internalUVs = this.use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }

        if (!onlyOneUVs && (this.flags & this.flagsExternalTexcoords)) {
            externalUVs = this.use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }
    }

    var vtmp = this.tmpVertices;
    var eUVs = this.tmpExternalUVs;
    var iUVs = this.tmpInternalUVs;
    var v1, v2, v3, vv1, vv2, vv3, sindex;

    if (onlyExternalIndices) {
        vertices = this.tmpVertices;
        externalUVs = this.tmpExternalUVs;
    }

    if (onlyInternalIndices) {
        vertices = this.use16bit ? (new Uint16Array((iUVs.length / 2) * 3)) : (new Float32Array((iUVs.length / 2) * 3));
        internalUVs = this.tmpInternalUVs;
    }

    for (i = 0; i < numFaces; i++) {
        v1 = (uint8Data[index] + (uint8Data[index + 1]<<8));
        v2 = (uint8Data[index+2] + (uint8Data[index + 3]<<8));
        v3 = (uint8Data[index+4] + (uint8Data[index + 5]<<8));

        if (onlyIndices) {
            vindex = i * 3;

            if (internalUVs != null) {
                vv1 = (uint8Data[index+6] + (uint8Data[index + 7]<<8));
                vv2 = (uint8Data[index+8] + (uint8Data[index + 9]<<8));
                vv3 = (uint8Data[index+10] + (uint8Data[index + 11]<<8));

                vertices[vv1*3] = vtmp[v1*3];
                vertices[vv1*3+1] = vtmp[v1*3+1];
                vertices[vv1*3+2] = vtmp[v1*3+2];

                vertices[vv2*3] = vtmp[v2*3];
                vertices[vv2*3+1] = vtmp[v2*3+1];
                vertices[vv2*3+2] = vtmp[v2*3+2];

                vertices[vv3*3] = vtmp[v3*3];
                vertices[vv3*3+1] = vtmp[v3*3+1];
                vertices[vv3*3+2] = vtmp[v3*3+2];

                indices[vindex] = vv1;
                indices[vindex+1] = vv2;
                indices[vindex+2] = vv3;

                index += 12;
            } else {
                indices[vindex] = v1;
                indices[vindex+1] = v2;
                indices[vindex+2] = v3;

                index += 6;
            }

        } else {
            vindex = i * (3 * 3);

            sindex = v1 * 3;
            vertices[vindex] = vtmp[sindex];
            vertices[vindex+1] = vtmp[sindex+1];
            vertices[vindex+2] = vtmp[sindex+2];

            sindex = v2 * 3;
            vertices[vindex+3] = vtmp[sindex];
            vertices[vindex+4] = vtmp[sindex+1];
            vertices[vindex+5] = vtmp[sindex+2];

            sindex = v3 * 3;
            vertices[vindex+6] = vtmp[sindex];
            vertices[vindex+7] = vtmp[sindex+1];
            vertices[vindex+8] = vtmp[sindex+2];

            if (externalUVs != null) {
                vindex = i * (3 * 2);
                externalUVs[vindex] = eUVs[v1*2];
                externalUVs[vindex+1] = eUVs[v1*2+1];
                externalUVs[vindex+2] = eUVs[v2*2];
                externalUVs[vindex+3] = eUVs[v2*2+1];
                externalUVs[vindex+4] = eUVs[v3*2];
                externalUVs[vindex+5] = eUVs[v3*2+1];
            }

            if (internalUVs != null) {
                v1 = (uint8Data[index+6] + (uint8Data[index + 7]<<8));
                v2 = (uint8Data[index+8] + (uint8Data[index + 9]<<8));
                v3 = (uint8Data[index+10] + (uint8Data[index + 11]<<8));
                index += 12;

                vindex = i * (3 * 2);
                internalUVs[vindex] = iUVs[v1*2];
                internalUVs[vindex+1] = iUVs[v1*2+1];
                internalUVs[vindex+2] = iUVs[v2*2];
                internalUVs[vindex+3] = iUVs[v2*2+1];
                internalUVs[vindex+4] = iUVs[v3*2];
                internalUVs[vindex+5] = iUVs[v3*2+1];
            } else {
                index += 6;
            }
        }
    }

    this.vertices = vertices;
    this.internalUVs = internalUVs;
    this.externalUVs = externalUVs;
    this.indices = indices;

    this.tmpVertices = null;
    this.tmpInternalUVs = null;
    this.tmpExternalUVs = null;

    stream.index = index;

    this.size = this.vertices.byteLength;
    if (this.internalUVs) this.size += this.internalUVs.byteLength;
    if (this.externalUVs) this.size += this.externalUVs.byteLength;
    if (this.indices) this.size += this.indices.byteLength;
    this.faces = numFaces;
};


MapSubmesh.prototype.parseWord = function (data, res) {
    var value = data[res[1]];
    
    if (value & 0x80) {
        res[0] = (value & 0x7f) | (data[res[1]+1] << 7);
        res[1] += 2;
    } else {
        res[0] = value;
        res[1] ++;
    }
};


MapSubmesh.prototype.parseDelta = function (data, res) {
    var value = data[res[1]];
    
    if (value & 0x80) {
        value = (value & 0x7f) | (data[res[1]+1] << 7);

        if (value & 1) {
            res[0] = -((value >> 1)+1); 
            res[1] += 2;
        } else {
            res[0] = (value >> 1); 
            res[1] += 2;
        }
    } else {
        if (value & 1) {
            res[0] = -((value >> 1)+1); 
            res[1] ++;
        } else {
            res[0] = (value >> 1); 
            res[1] ++;
        }
    }
};


MapSubmesh.prototype.parseVerticesAndFaces2 = function (stream) {
/*
struct VerticesBlock {
    ushort numVertices;              // number of vertices
    ushort geomQuantCoef;            // geometry quantization coefficient

    struct Vertex {                  // array of vertices, size of array is defined by numVertices property
        // vertex coordinates
        delta x;
        delta y;
        delta z;
    } vertices[];
};
*/

    var data = stream.data;
    var index = stream.index;
    var uint8Data = stream.uint8Data;
    var onlyOneUVs = this.map.config.mapOnlyOneUVs && (this.flags & this.flagsInternalTexcoords);

    var numVertices = data.getUint16(index, true); index += 2;
    var quant = data.getUint16(index, true); index += 2;

    if (!numVertices) {
        this.valid = false;
    }

    var center = this.bbox.center();
    var scale = this.bbox.maxSize;

    var multiplier = 1.0 / quant;
    var externalUVs = null;

    var vertices = this.use16bit ? (new Uint16Array(numVertices * 3)) : (new Float32Array(numVertices * 3));
    var vindex;
    
    var x = 0, y = 0,z = 0;
    var cx = center[0], cy = center[1], cz = center[2];
    var mx = this.bbox.min[0];
    var my = this.bbox.min[1];
    var mz = this.bbox.min[2];
    var sx = 1.0 / (this.bbox.max[0] - this.bbox.min[0]);
    var sy = 1.0 / (this.bbox.max[1] - this.bbox.min[1]);
    var sz = 1.0 / (this.bbox.max[2] - this.bbox.min[2]);
    
    var res = [0, index];
    var i, li, t;

    if (this.use16bit) {
        for (i = 0; i < numVertices; i++) {
            this.parseDelta(uint8Data, res);
            x += res[0];
            this.parseDelta(uint8Data, res);
            y += res[0];
            this.parseDelta(uint8Data, res);
            z += res[0];
            
            vindex = i * 3;
            t = ((x * multiplier * scale + cx) - mx) * sx;
            if (t < 0) t = 0; if (t > 1.0) t = 1.0;
            vertices[vindex] = t * 65535;
            t = ((y * multiplier * scale + cy) - my) * sy;
            if (t < 0) t = 0; if (t > 1.0) t = 1.0;
            vertices[vindex+1] = t * 65535;
            t = ((z * multiplier * scale + cz) - mz) * sz;
            if (t < 0) t = 0; if (t > 1.0) t = 1.0;
            vertices[vindex+2] = t * 65535;
        }
    } else {
        for (i = 0; i < numVertices; i++) {
            this.parseDelta(uint8Data, res);
            x += res[0];
            this.parseDelta(uint8Data, res);
            y += res[0];
            this.parseDelta(uint8Data, res);
            z += res[0];
            
            vindex = i * 3;
            vertices[vindex] = ((x * multiplier * scale + cx) - mx) * sx;
            vertices[vindex+1] = ((y * multiplier * scale + cy) - my) * sy;
            vertices[vindex+2] = ((z * multiplier * scale + cz) - mz) * sz;
        }
    }
    
    index = res[1];

    if (this.flags & this.flagsExternalTexcoords) {
        quant = data.getUint16(index, true); index += 2;
        res[1] = index;

        if (onlyOneUVs) {

            for (i = 0; i < numVertices; i++) {
                this.parseDelta(uint8Data, res);
                this.parseDelta(uint8Data, res);
            }

        } else {
            multiplier = (this.use16bit) ? (65535 / quant) : (1.0 / quant);
            externalUVs = this.use16bit ? (new Uint16Array(numVertices * 2)) : (new Float32Array(numVertices * 2));
            x = 0, y = 0;

            if (this.use16bit) {
                for (i = 0; i < numVertices; i++) {
                    this.parseDelta(uint8Data, res);
                    x += res[0];
                    this.parseDelta(uint8Data, res);
                    y += res[0];

                    var uvindex = i * 2;
                    t = x * multiplier;
                    if (t < 0) t = 0; if (t > 65535) t = 65535;
                    externalUVs[uvindex] = t;
                    t = y * multiplier;
                    if (t < 0) t = 0; if (t > 65535) t = 65535;
                    externalUVs[uvindex+1] = 65535 - t;
                }
            } else {
                for (i = 0; i < numVertices; i++) {
                    this.parseDelta(uint8Data, res);
                    x += res[0];
                    this.parseDelta(uint8Data, res);
                    y += res[0];

                    var uvindex = i * 2;
                    externalUVs[uvindex] = x * multiplier;
                    externalUVs[uvindex+1] = 1 - (y * multiplier);
                }
            }
        }
    }

    index = res[1];

    this.tmpVertices = vertices;
    this.tmpExternalUVs = externalUVs;
    
/*
struct TexcoorsBlock {
    ushort numTexcoords;              // number of texture coordinates

    struct TextureCoords {            // array of texture coordinates, size of array is defined by numTexcoords property

        // internal texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort u;
        ushort v;
    } texcoords[];
};
*/

    if (this.flags & this.flagsInternalTexcoords) {
        var numUVs = data.getUint16(index, true); index += 2;
        var quantU = data.getUint16(index, true); index += 2;
        var quantV = data.getUint16(index, true); index += 2;
        var multiplierU = (this.use16bit) ? (65536.0 / quantU) : (1.0 / quantU);
        var multiplierV = (this.use16bit) ? (65536.0 / quantV) : (1.0 / quantV);
        x = 0, y = 0;
    
        var internalUVs = this.use16bit ? (new Uint16Array(numUVs * 2)) : (new Float32Array(numUVs * 2));
        res[1] = index;7

        if (this.use16bit) {
            for (i = 0, li = numUVs * 2; i < li; i+=2) {
                this.parseDelta(uint8Data, res);
                x += res[0];
                this.parseDelta(uint8Data, res);
                y += res[0];

                t = x * multiplierU;
                if (t < 0) t = 0; if (t > 65535) t = 65535;
                internalUVs[i] = t;
                t = y * multiplierV;
                if (t < 0) t = 0; if (t > 65535) t = 65535;
                internalUVs[i+1] = 65535 - t;
            }
        } else {
            for (i = 0, li = numUVs * 2; i < li; i+=2) {
                this.parseDelta(uint8Data, res);
                x += res[0];
                this.parseDelta(uint8Data, res);
                y += res[0];

                internalUVs[i] = x * multiplierU;
                internalUVs[i+1] = 1 - (y * multiplierV);
            }
        }

        index = res[1];
    
        this.tmpInternalUVs = internalUVs;
    }

/*
struct FacesBlock {
    ushort numFaces;              // number of faces

    struct Face {                 // array of faces, size of array is defined by numFaces property

        ushort v[3]; // array of indices to stored vertices
        ushort t[3]; // if header.flags & ( 1 << 0 ): array of indices to stored internal texture coords

    } faces[];
};
*/

    var numFaces = data.getUint16(index, true); index += 2;
    var indices = null;

    internalUVs = null;
    externalUVs = null;

    var onlyExternalIndices = (this.map.config.mapIndexBuffers && this.map.config.mapOnlyOneUVs && !(this.flags & this.flagsInternalTexcoords));
    var onlyInternalIndices = (this.map.config.mapIndexBuffers && this.map.config.mapOnlyOneUVs && (this.flags & this.flagsInternalTexcoords));
    var onlyIndices = onlyExternalIndices || onlyInternalIndices;

    if (onlyIndices) {
        indices = new Uint16Array(numFaces * 3);
    } else {
        vertices = this.use16bit ? (new Uint16Array(numFaces * 3 * 3)) : (new Float32Array(numFaces * 3 * 3));

        if (this.flags & this.flagsInternalTexcoords) {
            internalUVs = this.use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }

        if (!onlyOneUVs && (this.flags & this.flagsExternalTexcoords)) {
            externalUVs = this.use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }
    }

    var vtmp = this.tmpVertices;
    var eUVs = this.tmpExternalUVs;
    var iUVs = this.tmpInternalUVs;
    var high = 0;
    var v1, v2, v3, vv1, vv2, vv3;
    res[1] = index;

    for (i = 0; i < numFaces; i++) {
        this.parseWord(uint8Data, res);
        v1 = high - res[0];
        if (!res[0]) { high++; }

        this.parseWord(uint8Data, res);
        v2 = high - res[0];
        if (!res[0]) { high++; }

        this.parseWord(uint8Data, res);
        v3 = high - res[0];
        if (!res[0]) { high++; }

        if (onlyIndices) {
            vindex = i * 3;
            indices[vindex] = v1;
            indices[vindex+1] = v2;
            indices[vindex+2] = v3;
        } else {
            vindex = i * (3 * 3);
            var sindex = v1 * 3;
            vertices[vindex] = vtmp[sindex];
            vertices[vindex+1] = vtmp[sindex+1];
            vertices[vindex+2] = vtmp[sindex+2];

            sindex = v2 * 3;
            vertices[vindex+3] = vtmp[sindex];
            vertices[vindex+4] = vtmp[sindex+1];
            vertices[vindex+5] = vtmp[sindex+2];

            sindex = v3 * 3;
            vertices[vindex+6] = vtmp[sindex];
            vertices[vindex+7] = vtmp[sindex+1];
            vertices[vindex+8] = vtmp[sindex+2];

            if (externalUVs != null) {
                vindex = i * (3 * 2);
                externalUVs[vindex] = eUVs[v1*2];
                externalUVs[vindex+1] = eUVs[v1*2+1];
                externalUVs[vindex+2] = eUVs[v2*2];
                externalUVs[vindex+3] = eUVs[v2*2+1];
                externalUVs[vindex+4] = eUVs[v3*2];
                externalUVs[vindex+5] = eUVs[v3*2+1];
            }
        }
    }

    if (onlyExternalIndices) {
        vertices = this.tmpVertices;
        externalUVs = this.tmpExternalUVs;
    }

    if (onlyInternalIndices) {
        vertices = this.use16bit ? (new Uint16Array((iUVs.length / 2) * 3)) : (new Float32Array((iUVs.length / 2) * 3));
        internalUVs = this.tmpInternalUVs;
    }

    high = 0;

    if (internalUVs != null) {
        for (i = 0; i < numFaces; i++) {
            this.parseWord(uint8Data, res);
            v1 = high - res[0];
            if (!res[0]) { high++; }
    
            this.parseWord(uint8Data, res);
            v2 = high - res[0];
            if (!res[0]) { high++; }
    
            this.parseWord(uint8Data, res);
            v3 = high - res[0];
            if (!res[0]) { high++; }

            if (onlyInternalIndices) {
                vindex = i * 3;

                vv1 = indices[vindex] * 3;
                vv2 = indices[vindex+1] * 3;
                vv3 = indices[vindex+2] * 3;

                vertices[v1*3] = vtmp[vv1];
                vertices[v1*3+1] = vtmp[vv1+1];
                vertices[v1*3+2] = vtmp[vv1+2];

                vertices[v2*3] = vtmp[vv2];
                vertices[v2*3+1] = vtmp[vv2+1];
                vertices[v2*3+2] = vtmp[vv2+2];

                vertices[v3*3] = vtmp[vv3];
                vertices[v3*3+1] = vtmp[vv3+1];
                vertices[v3*3+2] = vtmp[vv3+2];

                indices[vindex] = v1;
                indices[vindex+1] = v2;
                indices[vindex+2] = v3;
            } else {
                vindex = i * (3 * 2);
                internalUVs[vindex] = iUVs[v1*2];
                internalUVs[vindex+1] = iUVs[v1*2+1];
                internalUVs[vindex+2] = iUVs[v2*2];
                internalUVs[vindex+3] = iUVs[v2*2+1];
                internalUVs[vindex+4] = iUVs[v3*2];
                internalUVs[vindex+5] = iUVs[v3*2+1];
            }
        }
    }

    index = res[1];

    this.vertices = vertices;
    this.internalUVs = internalUVs;
    this.externalUVs = externalUVs;
    this.indices = indices;

    this.tmpVertices = null;
    this.tmpInternalUVs = null;
    this.tmpExternalUVs = null;

    stream.index = index;

    this.size = this.vertices.byteLength;
    if (this.internalUVs) this.size += this.internalUVs.byteLength;
    if (this.externalUVs) this.size += this.externalUVs.byteLength;
    if (this.indices) this.size += this.indices.byteLength;
    this.faces = numFaces;
};


// Returns RAM usage in bytes.
MapSubmesh.prototype.getSize = function () {
    return this.size;
};


MapSubmesh.prototype.getFileSize = function () {
    return this.fileSize;
};


MapSubmesh.prototype.buildGpuMesh = function () {
    return new GpuMesh(this.map.renderer.gpu, {
        bbox: this.bbox,
        vertices: this.vertices,
        uvs: this.internalUVs,
        uvs2: this.externalUVs,
        indices: this.indices
    }, 1, this.map.core, true, this.use16bit);
};


MapSubmesh.prototype.computeUVArea = function (texture) {
    var uvs = this.internalUVs || this.externalUVs;
    var area = 0;
    var fx = texture.width / 65535;
    var fy = texture.height / 65535;

    var faceArea = function(i1, i2, i3) {
        var dx = (uvs[i2] - uvs[i1])*fx, dy = (uvs[i2+1] - uvs[i1+1])*fy;
        var l1 = Math.sqrt(dx*dx+dy*dy);
        dx = (uvs[i3] - uvs[i2])*fx, dy = (uvs[i3+1] - uvs[i2+1])*fy;
        var l2 = Math.sqrt(dx*dx+dy*dy);
        dx = (uvs[i1] - uvs[i3])*fy, dy = (uvs[i1+1] - uvs[i3+1])*fy;
        var l3 = Math.sqrt(dx*dx+dy*dy);

        var sp = (l1+l2+l3)*0.5; //semi perimeter

        return Math.sqrt(Math.max(0.0,sp*(sp-l1)*(sp-l2)*(sp-l3)));
    }

    if (uvs) {
        var indices = this.indices;

        if (indices) {
            for (var i = 0, ii = 0, li = this.faces; i < li; i++, ii+=3) {
                area += faceArea(indices[i*3]*2, indices[i*3+1]*2, indices[i*3+2]*2);
            }
        } else {
            for (var i = 0, ii = 0, li = this.faces; i < li; i++, ii+=3) {
                area += faceArea(i*3*2, i*3*2 + 1, i*3*2 +2);
            }
        }
    }

    this.uvAreaComputed = true;
    this.uvArea = area;
};


MapSubmesh.prototype.getWorldMatrix = function(geoPos, matrix) {
    // Note: the current camera geographic position (geoPos) is not necessary
    // here, in theory, but for numerical stability (OpenGL ES is float only)
    // we get rid of the large UTM numbers in the following subtractions. The
    // camera effectively stays in the position [0,0] and the tiles travel
    // around it. (The Z coordinate is fine and is not handled in this way.)

    var m = matrix;

    if (m) {
        m[0] = this.bbox.side(0); m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = this.bbox.side(1); m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = this.bbox.side(2); m[11] = 0;
        m[12] = this.bbox.min[0] - geoPos[0]; m[13] = this.bbox.min[1] - geoPos[1]; m[14] = this.bbox.min[2] - geoPos[2]; m[15] = 1;
    } else {
        m = mat4.create();

        mat4.multiply( math.translationMatrix(this.bbox.min[0] - geoPos[0], this.bbox.min[1] - geoPos[1], this.bbox.min[2] - geoPos[2]),
                       math.scaleMatrix(this.bbox.side(0), this.bbox.side(1), this.bbox.side(2)), m);
    }

    return m;
};


MapSubmesh.prototype.getWorldMatrixSE = function(geoPos, matrix) {
    var m = matrix;

    if (m) {
        m[0] = 1; m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = 1; m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
        m[12] = this.bbox.min[0] - geoPos[0]; m[13] = this.bbox.min[1] - geoPos[1]; m[14] = this.bbox.min[2] - geoPos[2]; m[15] = 1;
    } else {
        m = math.translationMatrix(this.bbox.min[0] - geoPos[0], this.bbox.min[1] - geoPos[1], this.bbox.min[2] - geoPos[2]);
    }

    return m;
};


MapSubmesh.prototype.drawBBox = function(cameraPos) {
    var renderer = this.map.renderer;

    renderer.gpu.useProgram(renderer.progBBox, ['aPosition']);

    var mvp = mat4.create();
    var mv = mat4.create();

    mat4.multiply(renderer.camera.getModelviewMatrix(), this.getWorldMatrix(cameraPos), mv);

    var proj = renderer.camera.getProjectionMatrix();
    mat4.multiply(proj, mv, mvp);

    renderer.progBBox.setMat4('uMVP', mvp);

    //draw bbox
    renderer.bboxMesh.draw(renderer.progBBox, 'aPosition');
};


export default MapSubmesh;
