
import {mat4 as mat4_} from '../utils/matrix';
import {utils as utils_} from '../utils/utils';
import MapSubmesh_ from './submesh';
import BBox_ from '../renderer/bbox';

//get rid of compiler mess
var mat4 = mat4_;
var BBox = BBox_;
var MapSubmesh = MapSubmesh_;
var utils = utils_;


var MapMesh = function(map, url, tile) {
    this.generateLines = true;
    this.map = map;
    this.stats = map.stats;
    this.mapLoaderUrl  = url;
    this.tile = tile; // used only for stats

    this.bbox = new BBox();
    this.size = 0;
    this.fileSize = 0;
    this.faces = 0;

    this.cacheItem = null;  //store killSubmeshes
    this.gpuCacheItem = null; //store killGpuSubmeshes

    this.loadState = 0;
    this.loadErrorTime = null;
    this.loadErrorCounter = 0;

    this.mBuffer = mat4.create();
    this.mBuffer2 = mat4.create();

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
    var doNotUseGpu = (this.map.stats.gpuRenderUsed >= this.map.maxGpuUsed);
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
            if (this.map.stats.gpuRenderUsed >= this.map.maxGpuUsed) {
                return false;
            }

            if (this.stats.renderBuild > this.map.config.mapMaxProcessingTime) {
                this.map.markDirty();
                return false;
            }

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

    this.map.loader.load(this.mapLoaderUrl, this.onLoad.bind(this), priority, this.tile, "mesh");
};


MapMesh.prototype.onLoad = function(url, onLoaded, onError) {
    this.mapLoaderCallLoaded = onLoaded;
    this.mapLoaderCallError = onError;

    utils.loadBinary(url, this.onLoaded.bind(this), this.onLoadError.bind(this), (utils.useCredentials ? (this.mapLoaderUrl.indexOf(this.map.url.baseUrl) != -1) : false), this.map.core.xhrParams);
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


MapMesh.prototype.onLoaded = function(data, task) {
    if (this.map.killed == true){
        return;
    }

    if (!task) {
        //this.map.stats.renderBuild > this.map.config.mapMaxProcessingTime) {
        this.map.markDirty();
        this.map.addProcessingTask(this.onLoaded.bind(this, data, true));
        return;
    }

    this.fileSize= data.byteLength;

    var stream = {data: new DataView(data), buffer:data, index:0};

    var t = performance.now();
    this.parseMapMesh(stream);
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

// Returns RAM usage in bytes.
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
    var magic = "";

    magic += String.fromCharCode(streamData.getUint8(stream.index, true)); stream.index += 1;
    magic += String.fromCharCode(streamData.getUint8(stream.index, true)); stream.index += 1;

    if (magic != "ME") {
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

    for (var i = 0, li = this.numSubmeshes; i < li; i++) {
        var submesh = new MapSubmesh(this, stream);
        if (submesh.valid) {
            this.submeshes.push(submesh); 
            this.size += this.submeshes[i].size;
            this.faces += this.submeshes[i].faces;
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

    //console.log("build: " + this.stats.counter + "   " + this.mapLoaderUrl);
};


MapMesh.prototype.drawSubmesh = function (cameraPos, index, texture, type, alpha) {
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
    var attributes = (drawWireframe != 0) ?  ["aPosition", "aBarycentric"] : ["aPosition"];

    if (type == "depth") {
        program = renderer.progDepthTile;
        //texcoordsAttr = "aTexCoord";
    } else if (type == "flat") {
        program = renderer.progFlatShadeTile;
    } else {
        if (drawWireframe > 0) {
            switch (drawWireframe) {
                case 2: program = renderer.progWireframeTile2;  break;
                case 3: program = renderer.progFlatShadeTile;  break;
                case 1:
    
                    switch(type) {
                        case "internal":
                        case "internal-nofog":
                            program = renderer.progWireframeTile;
                            texcoordsAttr = "aTexCoord";
                            attributes.push("aTexCoord");
                            break;
    
                        case "external":
                        case "external-nofog":
                            program = renderer.progWireframeTile3;
                            texcoords2Attr = "aTexCoord2";
                            attributes.push("aTexCoord2");
                            break;
    
                        case "fog":
                            return;
                    }
    
                break;
            }
        } else {
            switch(type) {
                case "internal":
                case "internal-nofog":
                    program = renderer.progTile;
                    texcoordsAttr = "aTexCoord";
                    attributes.push("aTexCoord");
                    break;
    
                case "external":
                case "external-nofog":
                    program = renderer.progTile2;
                    
                    if (texture) {
                        gpuMask = texture.getGpuMaskTexture();
                        if (gpuMask) {
                            program = renderer.progTile3;
                        }
                    } 
                    
                    texcoords2Attr = "aTexCoord2";
                    attributes.push("aTexCoord2");
                    break;
    
                case "fog":
                    program = renderer.progFogTile;
                    break;
            }
        }
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
    } else if (type != "fog" && type != "depth" && type != "flat") {
        return;
    }

    var mv = this.mBuffer;
    mat4.multiply(renderer.camera.getModelviewMatrix(), submesh.getWorldMatrix(cameraPos, this.mBuffer2), mv);
    var proj = renderer.camera.getProjectionMatrix();

    program.setMat4("uMV", mv);
    program.setMat4("uProj", proj);

    if (drawWireframe == 0) {
        switch(type) {
            case "internal":
            case "fog":
                //program.setFloat("uFogDensity", this.map.fogDensity);
                program.setVec4("uParams", [draw.zFactor, draw.fogDensity, 0, 0]);
                break;

            case "internal-nofog":
                //program.setFloat("uFogDensity", 0);
                program.setVec4("uParams", [draw.zFactor, 0, 0, 0]);
                break;

            case "external":
                program.setFloat("uAlpha", 1);
                //program.setFloat("uFogDensity", this.map.fogDensity);
                program.setVec4("uParams", [draw.zFactor, draw.fogDensity, 0, 0]);
                program.setVec4("uTransform", texture.getTransform());
                break;

            case "external-nofog":
                program.setFloat("uAlpha", alpha);
                //program.setFloat("uFogDensity", 0);
                program.setVec4("uParams", [draw.zFactor, 0, 0, 0]);
                program.setVec4("uTransform", texture.getTransform());
                break;
        }
    }

    if (submesh.statsCoutner != this.stats.counter) {
        submesh.statsCoutner = this.stats.counter;
        this.stats.gpuRenderUsed += gpuSubmesh.size;
    } //else {
        //this.stats.gpuRenderUsed ++;
    //}

    //this.map.renderer.gpu.gl.polygonOffset(-1.0, this.map.zShift);
    //this.map.renderer.gpu.gl.enable(this.map.renderer.gpu.gl.POLYGON_OFFSET_FILL);

    gpuSubmesh.draw(program, "aPosition", texcoordsAttr, texcoords2Attr, drawWireframe != 0 ? "aBarycentric" : null);

    //this.map.renderer.gpu.gl.disable(this.map.renderer.gpu.gl.POLYGON_OFFSET_FILL);

    this.stats.drawnFaces += this.faces;
    this.stats.drawCalls ++;
};


export default MapMesh;

