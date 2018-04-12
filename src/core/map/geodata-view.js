
import {mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';
import GpuGroup_ from '../renderer/gpu/group';
import MapGeodataProcessor_ from './geodata-processor/processor';

//get rid of compiler mess
var mat4 = mat4_;
var math = math_;
var GpuGroup = GpuGroup_;
var MapGeodataProcessor = MapGeodataProcessor_;


var MapGeodataView = function(map, geodata, extraInfo) {
    this.map = map;
    this.stats = map.stats;
    this.geodata = geodata;
    this.gpu = this.map.renderer.gpu;
    this.renderer = this.map.renderer;
    this.gpuGroups = [];
    this.currentGpuGroup = null;
    this.tile = extraInfo.tile;
    this.surface = extraInfo.surface;

    if (!this.surface.geodataProcessor) {
        var processor = new MapGeodataProcessor(this, this.onGeodataProcessorMessage.bind(this));
        processor.setStylesheet(this.surface.stylesheet);
        this.surface.geodataProcessor = processor;
        this.map.geodataProcessors.push(processor);
    } else {
        if (this.surface.styleChanged) {
            this.surface.geodataProcessor.setStylesheet(this.surface.stylesheet);
            this.surface.styleChanged = false;
        }
    }

    this.geodataProcessor = this.surface.geodataProcessor;
    this.statsCounter = 0;
    this.size = 0;
    this.killed = false;
    this.killedByCache = false;
    this.ready = false;
    this.isReady();
};


MapGeodataView.prototype.kill = function() {
    this.killed = true;
    this.geodata = null;
    this.killGeodataView(false);
};


MapGeodataView.prototype.killGeodataView = function(killedByCache) {
    this.killedByCache = killedByCache;

    for (var i = 0, li = this.gpuGroups.length; i < li; i++) {
        this.gpuGroups[i].kill();
    }

    this.gpuGroups = [];

    if (killedByCache !== true && this.gpuCacheItem != null) {
        this.map.gpuCache.remove(this.gpuCacheItem);
    }

    this.stats.gpuGeodata -= this.size;
    this.stats.graphsFluxGeodata[1][0]++;
    this.stats.graphsFluxGeodata[1][1] += this.size;
    
    this.ready = false;
    this.size = 0;
    this.gpuCacheItem = null;
};


MapGeodataView.prototype.onGeodataProcessorMessage = function(command, message, task) {
    if (this.killed || this.killedByCache){
        return;
    }

    switch (command) {

    case 'beginGroup':
        
        if (task) {
            this.currentGpuGroup = new GpuGroup(message['id'], message['bbox'], message['origin'], this.gpu, this.renderer);
            this.gpuGroups.push(this.currentGpuGroup);
        } else {
            this.map.markDirty();
            this.map.addProcessingTask(this.onGeodataProcessorMessage.bind(this, command, message, true));
        }
            
        break;

    case 'addRenderJob':

        if (task) {
            if (this.currentGpuGroup) {
                var t = performance.now();
                this.currentGpuGroup.addRenderJob(message);
                this.stats.renderBuild += performance.now() - t; 
            } //else {
                    //message = message;
                //}
        } else {
            this.map.markDirty();
            this.map.addProcessingTask(this.onGeodataProcessorMessage.bind(this, command, message, true));
        }

        break;

    case 'endGroup':

        if (task) {
            if (this.currentGpuGroup) {
                    //this.currentGpuGroup.optimize();
                this.size += this.currentGpuGroup.size;
            } //else {
        } else {
            this.map.markDirty();
            this.map.addProcessingTask(this.onGeodataProcessorMessage.bind(this, command, message, true));
        }

        break;

    case 'allProcessed':
        this.geodataProcessor.busy = false;

        if (task) {
            this.map.markDirty();
            this.gpuCacheItem = this.map.gpuCache.insert(this.killGeodataView.bind(this, true), this.size);

            this.stats.gpuGeodata += this.size;
            this.stats.graphsFluxGeodata[0][0]++;
            this.stats.graphsFluxGeodata[0][1] += this.size;
            this.ready = true;
        } else {
            this.map.markDirty();
            this.map.addProcessingTask(this.onGeodataProcessorMessage.bind(this, command, message, true));
        }

        break;

    case 'ready':
        this.map.markDirty();
            //this.ready = true;
        break;
    }
};


MapGeodataView.prototype.isReady = function(doNotLoad, priority, doNotCheckGpu) {
    if (this.killed) {
        return false;
    }

    //if (!(this.tile.id[0] == 21 && this.tile.id[1] == 566459 && this.tile.id[2] == 355240)) {
      //  return false;
    //}

    var doNotUseGpu = (this.map.stats.gpuRenderUsed >= this.map.draw.maxGpuUsed);
    doNotLoad = doNotLoad || doNotUseGpu;
    
    //if (!this.ready && !doNotUseGpu && this.geodataProcessor.isReady()) {
    if (!this.ready && !doNotLoad && this.surface.stylesheet.isReady()) {
        if (this.geodata.isReady(doNotLoad, priority, doNotCheckGpu) && this.geodataProcessor.isReady()) {
            this.killedByCache = false;
            this.geodataProcessor.setListener(this.onGeodataProcessorMessage.bind(this));
            this.geodataProcessor.sendCommand('processGeodata', this.geodata.geodata, this.tile);
            this.geodataProcessor.busy = true;
        }
    }

    if (!doNotLoad && this.gpuCacheItem) {
        this.map.gpuCache.updateItem(this.gpuCacheItem);
    }

    return this.ready;
};


MapGeodataView.prototype.getWorldMatrix = function(bbox, geoPos, matrix) {
    var m = matrix;

    if (m != null) {/*
        m[0] = bbox.side(0); m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = bbox.side(1); m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = bbox.side(2); m[11] = 0;
        m[12] = this.bbox.min[0] - geoPos[0]; m[13] = this.bbox.min[1] - geoPos[1]; m[14] = this.bbox.min[2] - geoPos[2]; m[15] = 1;*/
    } else {
        m = mat4.create();

        mat4.multiply( math.translationMatrix(bbox.min[0] - geoPos[0], bbox.min[1] - geoPos[1], bbox.min[2] - geoPos[2]),
                       math.scaleMatrix(1, 1, 1), m);
    }

    return m;
};


MapGeodataView.prototype.draw = function(cameraPos) {
    if (this.ready) {

        var renderer = this.renderer;
        var tiltAngle = this.tile ? Math.abs(this.tile.tiltAngle) : renderer.cameraTiltFator;

        for (var i = 0, li = this.gpuGroups.length; i < li; i++) {
            var group = this.gpuGroups[i]; 

            if (!group.jobs.length) {
                continue; //TODO: remove empty groups
            }

            var mvp = mat4.create();
            var mv = mat4.create();
        
            mat4.multiply(renderer.camera.getModelviewMatrix(), this.getWorldMatrix(group.bbox, cameraPos), mv);
        
            var proj = renderer.camera.getProjectionMatrix();
            mat4.multiply(proj, mv, mvp);
            
            group.draw(mv, mvp, null, tiltAngle);

            this.stats.drawnFaces += group.polygons;
            this.stats.drawCalls += group.jobs.length;
        }
        
        if (this.statsCoutner != this.stats.counter) {
            this.statsCoutner = this.stats.counter;
            this.stats.gpuRenderUsed += this.size;
        }
    }
    return this.ready;
};

//MapGeodataView.prototype.size = function() {
    //return this.size;
//};

export default MapGeodataView;
