
import {mat4 as mat4_} from '../utils/matrix';
import {utils as utils_} from '../utils/utils';
import MapSubmesh_ from './submesh';
import BBox_ from '../renderer/bbox';
import GpuProgram_ from '../renderer/gpu/program';
import GpuShaders_ from '../renderer/gpu/shaders';

//get rid of compiler mess
var mat4 = mat4_;
var BBox = BBox_;
var MapSubmesh = MapSubmesh_;
var utils = utils_;
var GpuProgram = GpuProgram_;
var GpuShaders = GpuShaders_;

var MapMesh = function(map, url, tile) {
    this.generateLines = true;
    this.map = map;
    this.stats = map.stats;
    this.mapLoaderUrl  = url;
    this.tile = tile; // used only for stats
    this.use16bit = map.config.map16bitMeshes;

    this.bbox = new BBox();
    this.size = 0;
    this.gpuSize = 0;
    this.fileSize = 0;
    this.faces = 0;

    this.cacheItem = null;  //store killSubmeshes
    this.gpuCacheItem = null; //store killGpuSubmeshes

    this.loadState = 0;
    this.loadErrorTime = null;
    this.loadErrorCounter = 0;

    this.mBuffer = new Float32Array(16);
    this.mBuffer2 = new Float32Array(16);
    this.vBuffer = new Float32Array(4);

    this.submeshes = [];
    this.gpuSubmeshes = [];
    this.submeshesKilled = false;
};


MapMesh.prototype.kill = function() {
    this.bbox = null;
    this.killSubmeshes();
    this.killGpuSubmeshes();
};


MapMesh.prototype.killSubmeshes = function(killedByCache) {
    for (var i = 0, li = this.submeshes.length; i < li; i++) {
        this.submeshes[i].kill();
    }
    //this.submeshes = [];
    this.submeshesKilled = true;

    if (killedByCache !== true && this.cacheItem) {
        this.map.resourcesCache.remove(this.cacheItem);
        //this.tile.validate();
    }

    if (this.gpuSubmeshes.length == 0) {
        this.loadState = 0;
    }

    this.cacheItem = null;
};


MapMesh.prototype.killGpuSubmeshes = function(killedByCache) {
    var size = 0;
    for (var i = 0, li = this.gpuSubmeshes.length; i < li; i++) {
        this.gpuSubmeshes[i].kill();
        size += this.gpuSubmeshes[i].size;
    }

    if (li > 0) {
        this.stats.gpuMeshes -= size;
        this.stats.graphsFluxMesh[1][0]++;
        this.stats.graphsFluxMesh[1][1] += size;
    }

    this.gpuSubmeshes = [];

    if (killedByCache !== true && this.gpuCacheItem) {
        this.map.gpuCache.remove(this.gpuCacheItem);
        //this.tile.validate();
    }

    //console.log("kill: " + this.stats.counter + "   " + this.mapLoaderUrl);

//    if (this.submeshes.length == 0) {
    if (this.submeshesKilled) {
        this.loadState = 0;
    }

    this.gpuCacheItem = null;
};


MapMesh.prototype.isReady = function(doNotLoad, priority, doNotCheckGpu) {
    var doNotUseGpu = (this.map.stats.gpuRenderUsed >= this.map.draw.maxGpuUsed);
    doNotLoad = doNotLoad || doNotUseGpu;
    
    //if (doNotUseGpu) {
      //  doNotUseGpu = doNotUseGpu;
    //}
    
    //if (this.mapLoaderUrl == "https://cdn.vts.com/mario/proxy/melown2015/surface/vts/cz10/12-1107-688.bin?0") {
      //  this.mapLoaderUrl = this.mapLoaderUrl;
    //}    

    if (this.loadState == 2) { //loaded
        if (this.cacheItem) {
            this.map.resourcesCache.updateItem(this.cacheItem);
        }
        
        if (doNotCheckGpu) {
            return true;
        }

        if (this.gpuSubmeshes.length == 0) {
            if (this.map.stats.gpuRenderUsed >= this.map.draw.maxGpuUsed) {
                return false;
            }

            /*if (this.stats.renderBuild > this.map.config.mapMaxProcessingTime) {
                this.map.markDirty();
                return false;
            }*/

            if (doNotUseGpu) {
                return false;
            }

            var t = performance.now();
            this.buildGpuSubmeshes();
            this.stats.renderBuild += performance.now() - t; 
        }

        if (!doNotLoad && this.gpuCacheItem) {
            this.map.gpuCache.updateItem(this.gpuCacheItem);
        }
        return true;
    } else {
        if (this.loadState == 0) { 
            if (doNotLoad) {
                //remove from queue
                //if (this.mapLoaderUrl) {
                  //  this.map.loader.remove(this.mapLoaderUrl);
                //}
            } else {
                //not loaded
                //add to loading queue or top position in queue
                this.scheduleLoad(priority);
            }
        } else if (this.loadState == 3) { //loadError
            if (this.loadErrorCounter <= this.map.config.mapLoadErrorMaxRetryCount &&
                performance.now() > this.loadErrorTime + this.map.config.mapLoadErrorRetryTime) {
    
                this.scheduleLoad(priority);                    
            }
        } //else load in progress
    }

    return false;
};


MapMesh.prototype.scheduleLoad = function(priority) {
    if (!this.mapLoaderUrl) {
        this.mapLoaderUrl = this.map.url.makeUrl(this.tile.resourceSurface.meshUrl, {lod:this.tile.id[0], ix:this.tile.id[1], iy:this.tile.id[2] });
    }

    this.map.loader.load(this.mapLoaderUrl, this.onLoad.bind(this), priority, this.tile, 'mesh');
};


MapMesh.prototype.onLoad = function(url, onLoaded, onError) {
    this.mapLoaderCallLoaded = onLoaded;
    this.mapLoaderCallError = onError;

    this.map.loader.processLoadBinary(url, this.onLoaded.bind(this), this.onLoadError.bind(this), null, 'mesh');
    this.loadState = 1;
};


MapMesh.prototype.onLoadError = function() {
    if (this.map.killed){
        return;
    }

    this.loadState = 3;
    this.loadErrorTime = performance.now();
    this.loadErrorCounter ++;
    
    //make sure we try to load it again
    if (this.loadErrorCounter <= this.map.config.mapLoadErrorMaxRetryCount) { 
        setTimeout((function(){ if (!this.map.killed) { this.map.markDirty(); } }).bind(this), this.map.config.mapLoadErrorRetryTime);
    }    
    
    this.mapLoaderCallError();
};


MapMesh.prototype.onLoaded = function(data, task, direct) {
    if (this.map.killed){
        return;
    }

    if (!task) {
        //this.map.stats.renderBuild > this.map.config.mapMaxProcessingTime) {
        this.map.markDirty();
        this.map.addProcessingTask(this.onLoaded.bind(this, data, true, direct));
        return;
    }

    var t = performance.now();

    if (direct) {
        this.parseWorkerData(data);
    } else {
        this.fileSize = data.byteLength;
        var stream = {data: new DataView(data), buffer:data, index:0};
        this.parseMapMesh(stream);
    }

    this.map.stats.renderBuild += performance.now() - t; 
    
    this.submeshesKilled = false;

    this.cacheItem = this.map.resourcesCache.insert(this.killSubmeshes.bind(this, true), this.size);

    this.map.markDirty();
    this.loadState = 2;
    this.loadErrorTime = null;
    this.loadErrorCounter = 0;
    this.mapLoaderCallLoaded();
};


// Returns RAM usage in bytes.
//MapMesh.prototype.size = function () {
  //  return this.size;
//};

//MapMesh.prototype.fileSize = function () {
    //return this.fileSize;
//};


MapMesh.prototype.parseWorkerData = function (data) {
    this.faces = data['faces'];
    this.gpuSize = data['gpuSize'];
    this.meanUndulation = data['meanUndulation'];
    this.numSubmeshes = data['numSubmeshes'];
    this.size = data['size'];
    this.version = data['version'];

    var submeshes = data['submeshes'];

    for (var i = 0, li = submeshes.length; i < li; i++) {
        var submesh = new MapSubmesh(this);
        var submeshData = submeshes[i];

        submesh.bbox.min = submeshData['bboxMin'];
        submesh.bbox.max = submeshData['bboxMax'];
        submesh.externalUVs = submeshData['externalUVs'];
        submesh.faces = submeshData['faces'];
        submesh.flags = submeshData['flags'];
        submesh.gpuSize = submeshData['gpuSize'];
        submesh.indices = submeshData['indices'];
        submesh.internalUVs = submeshData['internalUVs'];
        submesh.size = submeshData['size'];
        submesh.surfaceReference = submeshData['surfaceReference'];
        submesh.textureLayer = submeshData['textureLayer'];
        submesh.textureLayer2 = submeshData['textureLayer2'];
        submesh.vertices = submeshData['vertices'];

        this.submeshes.push(submesh); 
    }

    this.bbox.updateMaxSize();
};

MapMesh.prototype.parseMapMesh = function (stream) {
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
    this.killSubmeshes(); //just in case

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

    this.version = streamData.getUint16(stream.index, true); stream.index += 2;

    if (this.version > 3) {
        return false;
    }
    
    //if (this.version >= 3) {
    stream.uint8Data = new Uint8Array(stream.buffer);
    //}

    this.meanUndulation = streamData.getFloat64(stream.index, true); stream.index += 8;
    this.numSubmeshes = streamData.getUint16(stream.index, true); stream.index += 2;

    this.submeshes = [];
    this.gpuSize = 0; 
    this.faces = 0;

    for (var i = 0, li = this.numSubmeshes; i < li; i++) {
        var submesh = new MapSubmesh(this, stream);
        if (submesh.valid) {
            this.submeshes.push(submesh); 
            this.size += submesh.size;
            this.faces += submesh.faces;

            //aproximate size
            this.gpuSize += submesh.size;
        }
    }
    
    this.numSubmeshes = this.submeshes.length;
};


MapMesh.prototype.addSubmesh = function(submesh) {
    this.submeshes.push(submesh);
    this.size += submesh.size;
    this.faces += submesh.faces;
};


MapMesh.prototype.buildGpuSubmeshes = function() {
    var size = 0;
    this.gpuSubmeshes = new Array(this.submeshes.length);

    for (var i = 0, li = this.submeshes.length; i < li; i++) {
        this.gpuSubmeshes[i] = this.submeshes[i].buildGpuMesh();
        size += this.gpuSubmeshes[i].size;
    }

    this.stats.gpuMeshes += size;
    this.stats.graphsFluxMesh[0][0]++;
    this.stats.graphsFluxMesh[0][1] += size;

    this.gpuCacheItem = this.map.gpuCache.insert(this.killGpuSubmeshes.bind(this, true), size);
    this.gpuSize = size;

    //console.log("build: " + this.stats.counter + "   " + this.mapLoaderUrl);
};


MapMesh.prototype.drawSubmesh = function (cameraPos, index, texture, type, alpha, layer) {
    if (this.gpuSubmeshes[index] == null && this.submeshes[index] != null && !this.submeshes[index].killed) {
        this.gpuSubmeshes[index] = this.submeshes[index].buildGpuMesh();
    }

    var submesh = this.submeshes[index];
    var gpuSubmesh = this.gpuSubmeshes[index];

    if (!gpuSubmesh) {
        return;
    }

    var renderer = this.map.renderer;
    var draw = this.map.draw;
    var program = null;
    var gpuMask = null; 

    var texcoordsAttr = null;
    var texcoords2Attr = null;
    var drawWireframe = draw.debug.drawWireframe;
    var attributes = (drawWireframe != 0) ?  ['aPosition', 'aBarycentric'] : ['aPosition'];

    if (type == VTS_MATERIAL_DEPTH) {
        program = renderer.progDepthTile;
        //texcoordsAttr = "aTexCoord";
    } else if (type == VTS_MATERIAL_FLAT) {
        program = renderer.progFlatShadeTile;
    } else {
        if (drawWireframe > 0) {
            switch (drawWireframe) {
            case 2: program = renderer.progWireframeTile2;  break;
            case 3: program = renderer.progFlatShadeTile;  break;
            case 1:
    
                switch(type) {
                case VTS_MATERIAL_INTERNAL:
                case VTS_MATERIAL_INTERNAL_NOFOG:
                    program = renderer.progWireframeTile;
                    texcoordsAttr = 'aTexCoord';
                    attributes.push('aTexCoord');
                    break;
    
                case VTS_MATERIAL_EXTERNAL:
                case VTS_MATERIAL_EXTERNAL_NOFOG:
                    program = renderer.progWireframeTile3;
                    texcoords2Attr = 'aTexCoord2';
                    attributes.push('aTexCoord2');
                    break;
    
                case VTS_MATERIAL_FOG:
                    return;
                }
    
                break;
            }
        } else {
            switch(type) {
            case VTS_MATERIAL_INTERNAL:
            case VTS_MATERIAL_INTERNAL_NOFOG:
                program = renderer.progTile;
                texcoordsAttr = 'aTexCoord';
                attributes.push('aTexCoord');
                break;
    
            case VTS_MATERIAL_EXTERNAL:
            case VTS_MATERIAL_EXTERNAL_NOFOG:

                program = renderer.progTile2;
                    
                if (texture) {
                    gpuMask = texture.getGpuMaskTexture();
                    if (gpuMask) {
                        program = renderer.progTile3;
                    }
                } 
                
                if (layer && layer.shaderFilter) {
                    var id = (gpuMask) ? 'progTile3' : 'progTile2';
                    var renderer = this.map.renderer;
                    id += layer.shaderFilter;

                    program = renderer.progMap[id];

                    if (!program) {
                        var gpu = renderer.gpu, pixelShader = gpuMask ? GpuShaders.tile3FragmentShader : GpuShaders.tile2FragmentShader;
                        program = new GpuProgram(gpu, GpuShaders.tile2VertexShader, pixelShader.replace('__FILTER__', layer.shaderFilter));
                        renderer.progMap[id] = program;
                    }
                }
                    
                texcoords2Attr = 'aTexCoord2';  
                attributes.push('aTexCoord2');
                break;
    
            case VTS_MATERIAL_FOG:
                program = renderer.progFogTile;
                break;
            }
        }
    }

    if (!program || !program.isReady()) {
        return;
    }

    renderer.gpu.useProgram(program, attributes, gpuMask);

    if (texture) {
        var gpuTexture = texture.getGpuTexture();
        
        if (gpuTexture) {
            if (texture.statsCoutner != this.stats.counter) {
                texture.statsCoutner = this.stats.counter;
                this.stats.gpuRenderUsed += gpuTexture.size;
            }
            
            renderer.gpu.bindTexture(gpuTexture);

            if (gpuMask) {
                renderer.gpu.bindTexture(gpuMask, 1);
            }
            
        } else {
            return;
        }
    } else if (type != VTS_MATERIAL_FOG && type != VTS_MATERIAL_DEPTH && type != VTS_MATERIAL_FLAT) {
        return;
    }

    var mv = this.mBuffer, m = this.mBuffer2, v = this.vBuffer;
    mat4.multiply(renderer.camera.getModelviewFMatrix(), submesh.getWorldMatrix(cameraPos, m), mv);
    var proj = renderer.camera.getProjectionFMatrix();

    program.setMat4('uMV', mv);

    if (draw.zbufferOffset) {
        program.setMat4('uProj', proj, renderer.getZoffsetFactor(draw.zbufferOffset));
    } else {
        program.setMat4('uProj', proj);
    }

    if (drawWireframe == 0) {
        var cv = this.map.camera.vector2, c = draw.atmoColor, t, bmin = submesh.bbox.min, bmax = submesh.bbox.max;

        switch(type) {
        case VTS_MATERIAL_INTERNAL:
        case VTS_MATERIAL_FOG:
        case VTS_MATERIAL_INTERNAL_NOFOG:

            m[0] = draw.zFactor, m[1] = (type == VTS_MATERIAL_INTERNAL_NOFOG) ? 0 : draw.fogDensity;
            m[2] = bmax[0] - bmin[0], m[3] = bmax[1] - bmin[1],
            m[4] = cv[0], m[5] = cv[1], m[6] = cv[2], m[7] = cv[3],
            m[12] = bmax[2] - bmin[2], m[13] = bmin[0], m[14] = bmin[1], m[15] = bmin[2];

            program.setMat4('uParams', m);
                                /*[draw.zFactor, (type == VTS_MATERIAL_INTERNAL_NOFOG) ? 0 : draw.fogDensity, bmax[0] - bmin[0], bmax[1] - bmin[1],
                                        v[0], v[1], v[2], v[3],
                                        0,0,0,0,
                                        bmax[2] - bmin[2], bmin[0], bmin[1], bmin[2]]);*/

            v[0] = c[0], v[1] = c[1], v[2] = c[2];
            program.setVec4('uParams2', v);
            break;

        case VTS_MATERIAL_EXTERNAL:
        case VTS_MATERIAL_EXTERNAL_NOFOG:

            t = texture.getTransform();

            m[0] = draw.zFactor, m[1] = (type == VTS_MATERIAL_EXTERNAL) ? draw.fogDensity : 0;
            m[2] = bmax[0] - bmin[0], m[3] = bmax[1] - bmin[1],
            m[4] = cv[0], m[5] = cv[1], m[6] = cv[2], m[7] = cv[3],
            m[8] = t[0], m[9] = t[1], m[10] = t[2], m[11] = t[3],
            m[12] = bmax[2] - bmin[2], m[13] = bmin[0], m[14] = bmin[1], m[15] = bmin[2];

            program.setMat4('uParams', m);

            /* [draw.zFactor, (type == VTS_MATERIAL_EXTERNAL) ? draw.fogDensity : 0, bmax[0] - bmin[0], bmax[1] - bmin[1],
                                        v[0], v[1], v[2], v[3],
                                        t[0], t[1], t[2], t[3],
                                        bmax[2] - bmin[2], bmin[0], bmin[1], bmin[2]]);*/

            v[0] = c[0], v[1] = c[1], v[2] = c[2]; v[3] = (type == VTS_MATERIAL_EXTERNAL) ? 1 : alpha;
            program.setVec4('uParams2', v);
            break;
        }
    }

    if (submesh.statsCoutner != this.stats.counter) {
        submesh.statsCoutner = this.stats.counter;
        this.stats.gpuRenderUsed += gpuSubmesh.size;
    } 

    gpuSubmesh.draw(program, 'aPosition', texcoordsAttr, texcoords2Attr, drawWireframe != 0 ? 'aBarycentric' : null);

    this.stats.drawnFaces += this.faces;
    this.stats.drawCalls ++;
};


export default MapMesh;

