/**
 * @constructor
 */
Melown.MapStats = function(map_) {
    this.map_ = map_;
    this.core_ = map_.core_;
    this.inspector_ = map_.core_.inspector_;
    this.drawnTiles_ = 0;
    this.drawnFaces_ = 0;
    this.drawCalls_ = 0;    
    this.usedNodes_ = 0;    
    this.processedNodes_ = 0;    
    this.processedMetatiles_ = 0;    
    this.counter_ = 0;
    this.statsCycle_ = 0;
    this.fps_ = 0;
    this.frameTime_ = 0;
    this.renderTime_ = 0;
    this.renderTimeTmp_ = 0;
    this.renderTimeBegin_ = 0;
    this.renderBuild_ = 0;
    this.lastRenderTime_ = 0;
    this.renderedLods_ = new Array(32);
    this.debugIds_ = {};

    this.recordGraphs_ = false;
    this.graphsTimeIndex_ = 0;
    this.graphsLastTimeIndex_ = 0;
    this.graphsTimeSamples_ = 900;
    this.graphsRenderTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCreateMeshTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCreateGpuMeshTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCreateTextureTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsFrameTimes_ = new Array(this.graphsTimeSamples_);
    this.graphsCpuMemoryMetatiles_ = new Array(this.graphsTimeSamples_);
    this.graphsCpuMemoryUsed_ = new Array(this.graphsTimeSamples_);
    this.graphsGpuMemoryTextures_ = new Array(this.graphsTimeSamples_);
    this.graphsGpuMemoryMeshes_ = new Array(this.graphsTimeSamples_);
    this.graphsGpuMemoryGeodata_ = new Array(this.graphsTimeSamples_);
    this.graphsGpuMemoryRender_ = new Array(this.graphsTimeSamples_);
    this.graphsPolygons_ = new Array(this.graphsTimeSamples_);
    this.graphsLODs_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxTextures_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxMeshes_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxGeodatas_ = new Array(this.graphsTimeSamples_);
    this.graphsFluxTexture_ = [[0,0],[0,0]];
    this.graphsFluxMesh_ = [[0,0],[0,0]];
    this.graphsFluxGeodata_ = [[0,0],[0,0]];
    this.graphsCreateTextureTime_ = 0;
    this.graphsCreateGpuMeshTime_ = 0;
    this.graphsCreateMeshTime_ = 0;
    this.resetGraphs();

    this.gpuMeshes_ = 0;
    this.gpuTextures_ = 0;
    this.gpuGeodata_ = 0;
    this.gpuUsed_ = 0;
    this.resourcesUsed_ = 0;
    this.metaUsed_ = 0;
    this.gpuRenderUsed_ = 0;
    this.loadedCount_ = 0;
    this.loadErrorCount_ = 0;
    this.loadFirst_ = 0;
    this.loadLast_ = 0;

    this.heightClass_ = 0;
    this.heightLod_ = 0;
    this.heightNode_ = 0;
    this.heightTerrain_ = 0;
    this.heightDelta_ = 0;
};

Melown.MapStats.prototype.resetGraphs = function() {
    this.graphsTimeIndex_ = 0;

    for (var i = 0; i < this.graphsTimeSamples_; i++) {
        this.graphsRenderTimes_[i] = 0;
        this.graphsCreateMeshTimes_[i] = 0;
        this.graphsCreateGpuMeshTimes_[i] = 0;
        this.graphsCreateTextureTimes_[i] = 0;
        this.graphsFrameTimes_[i] = 0;
        this.graphsCpuMemoryUsed_[i] = 0;
        this.graphsCpuMemoryMetatiles_[i] = 0;
        this.graphsGpuMemoryTextures_[i] = 0;
        this.graphsGpuMemoryMeshes_[i] = 0;
        this.graphsGpuMemoryGeodata_[i] = 0;
        this.graphsGpuMemoryRender_[i] = 0;
        this.graphsPolygons_[i] = 0;
        this.graphsLODs_[i] = [0,[]];
        this.graphsFluxTextures_[i] = [[0,0],[0,0]];
        this.graphsFluxMeshes_[i] = [[0,0],[0,0]];
        this.graphsFluxGeodatas_[i] = [[0,0],[0,0]];
    }
};

Melown.MapStats.prototype.begin = function(dirty_) {
    if (dirty_) {
        this.drawnTiles_ = 0;
        this.drawCalls_ = 0;        
        this.drawnFaces_ = 0;
        this.gpuRenderUsed_ = 0;
        this.usedNodes_ = 0;    
        this.processedNodes_ = 0;    
        this.processedMetatiles_ = 0;    

        for (var i = 0, li = this.renderedLods_.length; i < li; i++) {
            this.renderedLods_[i] = 0;
        } 
    }

    this.debugIds_ = {};

    this.counter_++;
    this.statsCycle_++;

    this.renderTimeBegin_ = performance.now();
};

Melown.MapStats.prototype.end = function(dirty_) {
    var timer_ = performance.now();

    var renderTime_ = timer_ - this.renderTimeBegin_;
    var frameTime_ = timer_ - this.frameTime_;
    this.frameTime_ = timer_;
    if (dirty_) { 
        this.renderTimeTmp_ += renderTime_;
        this.lastRenderTime_ = renderTime_;
    } else {
        this.renderTimeTmp_ += this.lastRenderTime_;
    }

    if (this.recordGraphs_) {
        var i = this.graphsTimeIndex_;

        this.graphsRenderTimes_[i] = renderTime_;
        this.graphsCreateMeshTimes_[i] = 0;
        this.graphsCreateGpuMeshTimes_[i] = 0;
        this.graphsCreateTextureTimes_[i] = 0;
        this.graphsFrameTimes_[i] = frameTime_;
        this.graphsCpuMemoryUsed_[i] = this.map_.resourcesCache_.totalCost_;
        this.graphsCpuMemoryMetatiles_[i] = this.map_.metatileCache_.totalCost_;
        this.graphsGpuMemoryTextures_[i] = this.gpuTextures_;
        this.graphsGpuMemoryMeshes_[i] = this.gpuMeshes_;
        this.graphsGpuMemoryGeodata_[i] = this.gpuGeodata_;
        this.graphsGpuMemoryRender_[i] = this.gpuRenderUsed_;
        this.graphsPolygons_[i] = this.drawnFaces_;
        this.graphsFluxTextures_[i] = [[this.graphsFluxTexture_[0][0], this.graphsFluxTexture_[0][1]], [this.graphsFluxTexture_[1][0], this.graphsFluxTexture_[1][1]] ];
        this.graphsFluxMeshes_[i] = [[this.graphsFluxMesh_[0][0], this.graphsFluxMesh_[0][1]], [this.graphsFluxMesh_[1][0], this.graphsFluxMesh_[1][1]] ];
        this.graphsFluxGeodatas_[i] = [[this.graphsFluxGeodata_[0][0], this.graphsFluxGeodata_[0][1]], [this.graphsFluxGeodata_[1][0], this.graphsFluxGeodata_[1][1]] ];
        this.graphsLODs_[i] = [this.drawnTiles_, this.renderedLods_.slice()];

        this.graphsTimeIndex_ = (this.graphsTimeIndex_ + 1) % this.graphsTimeSamples_;
        this.inspector_.updateGraphs(this);
    }


    if ((this.statsCycle_ % 50) == 0) {
        this.renderTime_ = this.renderTimeTmp_ / 100;
        this.fps_ = 1000 / this.renderTime_;
        this.renderTimeTmp_ = 0;

        if (this.inspector_ != null) {
            this.gpuUsed_ = this.map_.gpuCache_.totalCost_;
            this.resourcesUsed_ = this.map_.resourcesCache_.totalCost_;
            this.metaUsed_ = this.map_.metatileCache_.totalCost_;

            this.inspector_.updateStatsPanel(this);
        }
    }
    
    //do not reset flux data in begin function, because we to collect data from events which     
    this.graphsFluxTexture_ = [[0,0],[0,0]];
    this.graphsFluxMesh_ = [[0,0],[0,0]];
    this.graphsFluxGeodata_ = [[0,0],[0,0]];
    
};


