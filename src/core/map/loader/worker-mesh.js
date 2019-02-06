
import {globals as globals_} from './worker-globals.js';

//get rid of compiler mess
var globals = globals_;

var flagsInternalTexcoords =  1;
var flagsExternalTexcoords =  2;
var flagsPerVertexUndulation =  4;
var flagsTextureMode =  8;


function parseMesh(stream) {
    /*
    struct MapMesh {
        struct MapMeshHeader {
            char magic[2];                // letters "ME"
            ushort version;               // currently 1
            double meanUndulation;        // read more about undulation below
            ushort numSubmeshes;          // number of submeshes
        } header;
        struct Submesh submeshes [];      // array of submeshes, size of array is defined by numSubmeshes property
    };
    */

    var mesh = {}, i, li, submesh;

    //parase header
    var streamData = stream.data;
    var magic = '';

    if (streamData.length < 2) {
        return false;
    }

    magic += String.fromCharCode(streamData.getUint8(stream.index, true)); stream.index += 1;
    magic += String.fromCharCode(streamData.getUint8(stream.index, true)); stream.index += 1;

    if (magic != 'ME') {
        return false;
    }

    mesh.version = streamData.getUint16(stream.index, true); stream.index += 2;

    if (mesh.version > 3) {
        return false;
    }
    
    stream.uint8Data = new Uint8Array(stream.data.buffer);

    mesh.meanUndulation = streamData.getFloat64(stream.index, true); stream.index += 8;
    mesh.numSubmeshes = streamData.getUint16(stream.index, true); stream.index += 2;

    mesh.submeshes = [];
    mesh.gpuSize = 0; 
    mesh.faces = 0;
    mesh.size = 0;

    var use16bit = globals.config.map16bitMeshes;

    for (i = 0, li = mesh.numSubmeshes; i < li; i++) {
        var submesh = parseSubmesh(mesh, stream);
        if (submesh.valid) {
            mesh.submeshes.push(submesh); 
            mesh.size += submesh.size;
            mesh.faces += submesh.faces;

            //aproximate size
            mesh.gpuSize += submesh.size;
        }
    }
    
    mesh.numSubmeshes = mesh.submeshes.length;

    //prevent minification

    var submeshes = [];
    var transferables = [];

    for (i = 0, li = mesh.numSubmeshes; i < li; i++) {
        submesh = mesh.submeshes[i];
        submeshes.push({

            'bboxMax': submesh.bboxMax,
            'bboxMin': submesh.bboxMin,
            'externalUVs': (submesh.externalUVs) ? submesh.externalUVs.buffer : null,
            'faces': submesh.faces,
            'flags': submesh.flags,
            'gpuSize': submesh.gpuSize,
            'indices': (submesh.indices) ? submesh.indices.buffer : null,
            'internalUVs': (submesh.internalUVs) ? submesh.internalUVs.buffer : null,
            'size': submesh.size,
            'surfaceReference': submesh.surfaceReference,
            'textureLayer': submesh.textureLayer,
            'textureLayer2': submesh.textureLayer2,
            //'valid': submesh.valid
            'vertices': submesh.vertices.buffer

        });

        if (submesh.externalUVs) transferables.push(submesh.externalUVs.buffer);
        if (submesh.internalUVs) transferables.push(submesh.internalUVs.buffer);
        if (submesh.vertices) transferables.push(submesh.vertices.buffer);
        if (submesh.indices) transferables.push(submesh.indices.buffer);
    }

    return { mesh:{
               'faces': mesh.faces,
               'gpuSize': mesh.gpuSize,
               'meanUndulation': mesh.meanUndulation,
               'numSubmeshes': mesh.numSubmeshes,
               'size': mesh.size,
               'submeshes': mesh.submeshes,
               'version': mesh.version
             },
             transferables:transferables
           };
};


function parseSubmesh(mesh, stream) {
    /*
    struct MapSubmesh {
        struct MapSubmeshHeader header;
        struct VerticesBlock vertices;
        struct TexcoordsBlock internalTexcoords;   // if header.flags & ( 1 << 0 )
        struct FacesBlock faces;
    };
    */

    var submesh = { valid:true };

    parseHeader(mesh, submesh, stream);
    if (mesh.version >= 3) {
        parseVerticesAndFaces2(mesh, submesh, stream);
    } else {
        parseVerticesAndFaces(mesh, submesh, stream);
    }

    return submesh;
};


function parseHeader(mesh, submesh, stream) {
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

    //debugger
    var streamData = stream.data;

    submesh.flags = streamData.getUint8(stream.index, true); stream.index += 1;

    if (mesh.version > 1) {
        submesh.surfaceReference = streamData.getUint8(stream.index, true); stream.index += 1;
    } else {
        submesh.surfaceReference = 0;
    }

    submesh.textureLayer = streamData.getUint16(stream.index, true); stream.index += 2;
    submesh.textureLayer2 = submesh.textureLayer; //hack for presentation

    var bboxMin = [];
    var bboxMax = [];

    bboxMin[0] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMin[1] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMin[2] = streamData.getFloat64(stream.index, true); stream.index += 8;

    bboxMax[0] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMax[1] = streamData.getFloat64(stream.index, true); stream.index += 8;
    bboxMax[2] = streamData.getFloat64(stream.index, true); stream.index += 8;
    
    submesh.bboxMin = bboxMin;
    submesh.bboxMax = bboxMax;
};


function parseVerticesAndFaces(mesh, submesh, stream) {
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

    var use16bit = globals.config.map16bitMeshes;

    var numVertices = data.getUint16(index, true); index += 2;

    if (!numVertices) {
        submesh.valid = false;
    }

    var internalUVs = null;
    var externalUVs = null;
    var onlyOneUVs = globals.config.mapOnlyOneUVs && (submesh.flags & flagsInternalTexcoords);
    var tmpVertices, tmpExternalUVs, tmpInternalUVs;

    var vertices = use16bit ? (new Uint16Array(numVertices * 3)) : (new Float32Array(numVertices * 3));

    if (submesh.flags & flagsExternalTexcoords) {
        if (onlyOneUVs) {
            externalUVs = true;
        } else {
            externalUVs = use16bit ? (new Uint16Array(numVertices * 2)) : (new Float32Array(numVertices * 2));
        }
    }

    var uvfactor = use16bit ? 1.0 : (1.0 / 65535);
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


    tmpVertices = vertices;
    tmpExternalUVs = externalUVs;
   
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

    if (submesh.flags & flagsInternalTexcoords) {
        var numUVs = data.getUint16(index, true); index += 2;
    
        internalUVs = use16bit ? (new Uint16Array(numUVs * 2)) : (new Float32Array(numUVs * 2));
        //var uvfactor = 1.0 / 65535;
    
        for (i = 0, li = numUVs * 2; i < li; i+=2) {
            internalUVs[i] = (uint8Data[index] + (uint8Data[index + 1]<<8)) * uvfactor;
            internalUVs[i+1] = (65535 - (uint8Data[index+2] + (uint8Data[index + 3]<<8))) * uvfactor;
            index += 4;
        }
    
        tmpInternalUVs = internalUVs;
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

    var onlyExternalIndices = (globals.config.mapIndexBuffers && globals.config.mapOnlyOneUVs && !(submesh.flags & flagsInternalTexcoords));
    var onlyInternalIndices = (globals.config.mapIndexBuffers && globals.config.mapOnlyOneUVs && (submesh.flags & flagsInternalTexcoords));
    var onlyIndices = onlyExternalIndices || onlyInternalIndices;

    if (onlyIndices) {
        indices = new Uint16Array(numFaces * 3);
    } else {
        vertices = use16bit ? (new Uint16Array(numFaces * 3 * 3)) : (new Float32Array(numFaces * 3 * 3));

        if (submesh.flags & flagsInternalTexcoords) {
            internalUVs = use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }

        if (!onlyOneUVs && (submesh.flags & flagsExternalTexcoords)) {
            externalUVs = use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }
    }

    var vtmp = tmpVertices;
    var eUVs = tmpExternalUVs;
    var iUVs = tmpInternalUVs;
    var v1, v2, v3, vv1, vv2, vv3, sindex;

    if (onlyExternalIndices) {
        vertices = tmpVertices;
        externalUVs = tmpExternalUVs;
    }

    if (onlyInternalIndices) {
        vertices = use16bit ? (new Uint16Array((iUVs.length / 2) * 3)) : (new Float32Array((iUVs.length / 2) * 3));
        internalUVs = tmpInternalUVs;
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

    submesh.vertices = vertices;
    submesh.internalUVs = internalUVs;
    submesh.externalUVs = externalUVs;
    submesh.indices = indices;

    tmpVertices = null;
    tmpInternalUVs = null;
    tmpExternalUVs = null;

    stream.index = index;

    submesh.size = submesh.vertices.byteLength;
    if (submesh.internalUVs) submesh.size += submesh.internalUVs.byteLength;
    if (submesh.externalUVs) submesh.size += submesh.externalUVs.byteLength;
    if (submesh.indices) submesh.size += submesh.indices.byteLength;
    submesh.faces = numFaces;
};


function parseWord(data, res) {
    var value = data[res[1]];
    
    if (value & 0x80) {
        res[0] = (value & 0x7f) | (data[res[1]+1] << 7);
        res[1] += 2;
    } else {
        res[0] = value;
        res[1] ++;
    }
};


function parseDelta(data, res) {
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


function parseVerticesAndFaces2(mesh, submesh, stream) {
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

    var use16bit = globals.config.map16bitMeshes;
    var onlyOneUVs = globals.config.mapOnlyOneUVs && (submesh.flags & flagsInternalTexcoords);
    var tmpVertices, tmpExternalUVs, tmpInternalUVs;

    var numVertices = data.getUint16(index, true); index += 2;
    var quant = data.getUint16(index, true); index += 2;

    if (!numVertices) {
        submesh.valid = false;
    }

    var bmin = submesh.bboxMin;
    var bmax = submesh.bboxMax;

    var center = [(bmin[0] + bmax[0])*0.5, (bmin[1] + bmax[1])*0.5, (bmin[2] + bmax[2])*0.5];
    var scale = Math.abs(Math.max(bmax[0] - bmin[0], bmax[1] - bmin[1], bmax[2] - bmin[2]));

    var multiplier = 1.0 / quant;
    var externalUVs = null;

    var vertices = use16bit ? (new Uint16Array(numVertices * 3)) : (new Float32Array(numVertices * 3));
    var vindex;
    
    var x = 0, y = 0,z = 0;
    var cx = center[0], cy = center[1], cz = center[2];
    var mx = bmin[0];
    var my = bmin[1];
    var mz = bmin[2];
    var sx = 1.0 / (bmax[0] - bmin[0]);
    var sy = 1.0 / (bmax[1] - bmin[1]);
    var sz = 1.0 / (bmax[2] - bmin[2]);
    
    var res = [0, index];
    var i, li, t;

    if (use16bit) {
        for (i = 0; i < numVertices; i++) {
            parseDelta(uint8Data, res);
            x += res[0];
            parseDelta(uint8Data, res);
            y += res[0];
            parseDelta(uint8Data, res);
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
            parseDelta(uint8Data, res);
            x += res[0];
            parseDelta(uint8Data, res);
            y += res[0];
            parseDelta(uint8Data, res);
            z += res[0];
            
            vindex = i * 3;
            vertices[vindex] = ((x * multiplier * scale + cx) - mx) * sx;
            vertices[vindex+1] = ((y * multiplier * scale + cy) - my) * sy;
            vertices[vindex+2] = ((z * multiplier * scale + cz) - mz) * sz;
        }
    }
    
    index = res[1];

    if (submesh.flags & flagsExternalTexcoords) {
        quant = data.getUint16(index, true); index += 2;
        res[1] = index;

        if (onlyOneUVs) {

            for (i = 0; i < numVertices; i++) {
                parseDelta(uint8Data, res);
                parseDelta(uint8Data, res);
            }

        } else {
            multiplier = (use16bit) ? (65535 / quant) : (1.0 / quant);
            externalUVs = use16bit ? (new Uint16Array(numVertices * 2)) : (new Float32Array(numVertices * 2));
            x = 0, y = 0;

            if (use16bit) {
                for (i = 0; i < numVertices; i++) {
                    parseDelta(uint8Data, res);
                    x += res[0];
                    parseDelta(uint8Data, res);
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
                    parseDelta(uint8Data, res);
                    x += res[0];
                    parseDelta(uint8Data, res);
                    y += res[0];

                    var uvindex = i * 2;
                    externalUVs[uvindex] = x * multiplier;
                    externalUVs[uvindex+1] = 1 - (y * multiplier);
                }
            }
        }
    }

    index = res[1];

    tmpVertices = vertices;
    tmpExternalUVs = externalUVs;
    
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

    if (submesh.flags & flagsInternalTexcoords) {
        var numUVs = data.getUint16(index, true); index += 2;
        var quantU = data.getUint16(index, true); index += 2;
        var quantV = data.getUint16(index, true); index += 2;
        var multiplierU = (use16bit) ? (65536.0 / quantU) : (1.0 / quantU);
        var multiplierV = (use16bit) ? (65536.0 / quantV) : (1.0 / quantV);
        x = 0, y = 0;
    
        var internalUVs = use16bit ? (new Uint16Array(numUVs * 2)) : (new Float32Array(numUVs * 2));
        res[1] = index;7

        if (use16bit) {
            for (i = 0, li = numUVs * 2; i < li; i+=2) {
                parseDelta(uint8Data, res);
                x += res[0];
                parseDelta(uint8Data, res);
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
                parseDelta(uint8Data, res);
                x += res[0];
                parseDelta(uint8Data, res);
                y += res[0];

                internalUVs[i] = x * multiplierU;
                internalUVs[i+1] = 1 - (y * multiplierV);
            }
        }

        index = res[1];
    
        tmpInternalUVs = internalUVs;
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

    var onlyExternalIndices = (globals.config.mapIndexBuffers && globals.config.mapOnlyOneUVs && !(submesh.flags & flagsInternalTexcoords));
    var onlyInternalIndices = (globals.config.mapIndexBuffers && globals.config.mapOnlyOneUVs && (submesh.flags & flagsInternalTexcoords));
    var onlyIndices = onlyExternalIndices || onlyInternalIndices;

    if (onlyIndices) {
        indices = new Uint16Array(numFaces * 3);
    } else {
        vertices = use16bit ? (new Uint16Array(numFaces * 3 * 3)) : (new Float32Array(numFaces * 3 * 3));

        if (submesh.flags & flagsInternalTexcoords) {
            internalUVs = use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }

        if (!onlyOneUVs && (submesh.flags & flagsExternalTexcoords)) {
            externalUVs = use16bit ? (new Uint16Array(numFaces * 3 * 2)) : (new Float32Array(numFaces * 3 * 2));
        }
    }

    var vtmp = tmpVertices;
    var eUVs = tmpExternalUVs;
    var iUVs = tmpInternalUVs;
    var high = 0;
    var v1, v2, v3, vv1, vv2, vv3;
    res[1] = index;

    for (i = 0; i < numFaces; i++) {
        parseWord(uint8Data, res);
        v1 = high - res[0];
        if (!res[0]) { high++; }

        parseWord(uint8Data, res);
        v2 = high - res[0];
        if (!res[0]) { high++; }

        parseWord(uint8Data, res);
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
        vertices = tmpVertices;
        externalUVs = tmpExternalUVs;
    }

    if (onlyInternalIndices) {
        vertices = use16bit ? (new Uint16Array((iUVs.length / 2) * 3)) : (new Float32Array((iUVs.length / 2) * 3));
        internalUVs = tmpInternalUVs;
    }

    high = 0;

    if (internalUVs != null) {
        for (i = 0; i < numFaces; i++) {
            parseWord(uint8Data, res);
            v1 = high - res[0];
            if (!res[0]) { high++; }
    
            parseWord(uint8Data, res);
            v2 = high - res[0];
            if (!res[0]) { high++; }
    
            parseWord(uint8Data, res);
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

    submesh.vertices = vertices;
    submesh.internalUVs = internalUVs;
    submesh.externalUVs = externalUVs;
    submesh.indices = indices;

    //tmpVertices = null;
    //tmpInternalUVs = null;
    //tmpExternalUVs = null;

    stream.index = index;

    submesh.size = submesh.vertices.byteLength;
    if (submesh.internalUVs) submesh.size += submesh.internalUVs.byteLength;
    if (submesh.externalUVs) submesh.size += submesh.externalUVs.byteLength;
    if (submesh.indices) submesh.size += submesh.indices.byteLength;
    submesh.faces = numFaces;
};

export {parseMesh};

