
var MapStats = function(map) {
    this.map = map;
    this.core = map.core;
    this.inspector = map.core.inspector;
    this.drawnTiles = 0;
    this.drawnGeodataTiles = 0;
    this.drawnGeodataTilesFactor = 0;
    this.drawnGeodataTilesPerLayer = 0;
    this.drawnFaces = 0;
    this.drawCalls = 0;    
    this.usedNodes = 0;    
    this.processedNodes = 0;    
    this.processedMetatiles = 0;    
    this.counter = 0;
    this.statsCycle = 0;
    this.fps = 0;
    this.frameTime = 0;
    this.renderTime = 0;
    this.renderTimeTmp = 0;
    this.renderTimeBegin = 0;
    this.renderBuild = 0;
    this.lastRenderTime = 0;
    this.lastFrameTime = 0;
    this.renderedLods = new Array(32);
    this.debugIds = {};

    this.recordGraphs = false;
    this.graphsTimeIndex = 0;
    this.graphsLastTimeIndex = 0;
    this.graphsTimeSamples = 900;
    this.graphsRenderTimes = new Array(this.graphsTimeSamples);
    this.graphsCreateMeshTimes = new Array(this.graphsTimeSamples);
    this.graphsCreateGpuMeshTimes = new Array(this.graphsTimeSamples);
    this.graphsCreateTextureTimes = new Array(this.graphsTimeSamples);
    this.graphsFrameTimes = new Array(this.graphsTimeSamples);
    this.graphsCpuMemoryMetatiles = new Array(this.graphsTimeSamples);
    this.graphsCpuMemoryUsed = new Array(this.graphsTimeSamples);
    this.graphsGpuMemoryTextures = new Array(this.graphsTimeSamples);
    this.graphsGpuMemoryMeshes = new Array(this.graphsTimeSamples);
    this.graphsGpuMemoryGeodata = new Array(this.graphsTimeSamples);
    this.graphsGpuMemoryRender = new Array(this.graphsTimeSamples);
    this.graphsPolygons = new Array(this.graphsTimeSamples);
    this.graphsLODs = new Array(this.graphsTimeSamples);
    this.graphsBuild = new Array(this.graphsTimeSamples);
    this.graphsFluxTextures = new Array(this.graphsTimeSamples);
    this.graphsFluxMeshes = new Array(this.graphsTimeSamples);
    this.graphsFluxGeodatas = new Array(this.graphsTimeSamples);
    this.graphsFluxTexture = [[0,0],[0,0]];
    this.graphsFluxMesh = [[0,0],[0,0]];
    this.graphsFluxGeodata = [[0,0],[0,0]];
    this.graphsCreateTextureTime = 0;
    this.graphsCreateGpuMeshTime = 0;
    this.graphsCreateMeshTime = 0;
    this.resetGraphs();

    this.meshesFaces = 0;
    this.meshesUVArea = 0;
    this.gpuMeshes = 0;
    this.gpuTextures = 0;
    this.gpuGeodata = 0;
    this.gpuUsed = 0;
    this.resourcesUsed = 0;
    this.metaUsed = 0;
    this.gpuRenderUsed = 0;
    this.loadedCount = 0;
    this.loadErrorCount = 0;
    this.loadFirst = 0;
    this.loadLast = 0;
    this.gpuNeeded = 0;
    this.gpuNeeded2 = 0;
    this.octoNodes = 0;
    this.octoNodesMemSize = 0;

    this.heightClass = 0;
    this.heightLod = 0;
    this.heightNode = 0;
    this.heightTerrain = 0;
    this.heightDelta = 0;
    this.debugStr = null;
};

//Object.defineProperty(MapStats.prototype, 'gpuNeeded', {
    //get: function() { return this.gpuNeeded2; /*console.log(""+this.gpuNeeded);*/ },
    //set: function(value) { 
        //this.gpuNeeded2 = value; console.log(""+this.gpuNeeded);
    //}
//});


MapStats.prototype.resetGraphs = function() {
    this.graphsTimeIndex = 0;

    for (var i = 0; i < this.graphsTimeSamples; i++) {
        this.graphsRenderTimes[i] = 0;
        this.graphsCreateMeshTimes[i] = 0;
        this.graphsCreateGpuMeshTimes[i] = 0;
        this.graphsCreateTextureTimes[i] = 0;
        this.graphsFrameTimes[i] = 0;
        this.graphsCpuMemoryUsed[i] = 0;
        this.graphsCpuMemoryMetatiles[i] = 0;
        this.graphsGpuMemoryTextures[i] = 0;
        this.graphsGpuMemoryMeshes[i] = 0;
        this.graphsGpuMemoryGeodata[i] = 0;
        this.graphsGpuMemoryRender[i] = 0;
        this.graphsPolygons[i] = 0;
        this.graphsLODs[i] = [0,[]];
        this.graphsBuild[i] = 0;
        this.graphsFluxTextures[i] = [[0,0],[0,0]];
        this.graphsFluxMeshes[i] = [[0,0],[0,0]];
        this.graphsFluxGeodatas[i] = [[0,0],[0,0]];
    }
};


MapStats.prototype.begin = function(dirty) {
    if (dirty) {
        this.drawnTiles = 0;
        this.drawnGeodataTiles = 0;
        this.drawnGeodataTilesFactor = 0;
        this.drawnGeodataTilesPerLayer = 0;
        this.drawCalls = 0;        
        this.drawnFaces = 0;
        this.gpuRenderUsed = 0;
        this.gpuNeeded = 0;
        this.usedNodes = 0;    
        this.processedNodes = 0;    
        this.processedMetatiles = 0;    
        this.meshesFaces = 0;
        this.meshesUVArea = 0;

        for (var i = 0, li = this.renderedLods.length; i < li; i++) {
            this.renderedLods[i] = 0;
        } 
    }

    this.debugIds = {};

    this.counter++;
    this.statsCycle++;

    this.renderTimeBegin = performance.now();

    if (dirty) {
        if (this.lastFrameTime) {
            this.frameTime = this.renderTimeBegin - this.lastFrameTime;
        }

        this.lastFrameTime = this.renderTimeBegin;
    }
};


MapStats.prototype.end = function(dirty) {
    var timer = performance.now();

    var renderTime = timer - this.renderTimeBegin;
    //var frameTime = timer - this.frameTime;
    //this.frameTime = timer;
    if (dirty) { 
        this.renderTimeTmp += renderTime;
        this.lastRenderTime = renderTime;
    } else {
        this.renderTimeTmp += this.lastRenderTime;
    }

    if (this.recordGraphs) {
        var i = this.graphsTimeIndex;

        this.graphsRenderTimes[i] = renderTime;
        this.graphsCreateMeshTimes[i] = 0;
        this.graphsCreateGpuMeshTimes[i] = 0;
        this.graphsCreateTextureTimes[i] = 0;
        this.graphsFrameTimes[i] = this.frameTime;
        this.graphsCpuMemoryUsed[i] = this.map.resourcesCache.totalCost;
        this.graphsCpuMemoryMetatiles[i] = this.map.metatileCache.totalCost;
        this.graphsGpuMemoryTextures[i] = this.gpuTextures;
        this.graphsGpuMemoryMeshes[i] = this.gpuMeshes;
        this.graphsGpuMemoryGeodata[i] = this.gpuGeodata;
        this.graphsGpuMemoryRender[i] = this.gpuRenderUsed;
        this.graphsPolygons[i] = this.drawnFaces;
        this.graphsFluxTextures[i] = [[this.graphsFluxTexture[0][0], this.graphsFluxTexture[0][1]], [this.graphsFluxTexture[1][0], this.graphsFluxTexture[1][1]] ];
        this.graphsFluxMeshes[i] = [[this.graphsFluxMesh[0][0], this.graphsFluxMesh[0][1]], [this.graphsFluxMesh[1][0], this.graphsFluxMesh[1][1]] ];
        this.graphsFluxGeodatas[i] = [[this.graphsFluxGeodata[0][0], this.graphsFluxGeodata[0][1]], [this.graphsFluxGeodata[1][0], this.graphsFluxGeodata[1][1]] ];
        this.graphsLODs[i] = [this.drawnTiles, this.renderedLods.slice()];
        this.graphsBuild[i] = this.renderBuild;

        this.graphsTimeIndex = (this.graphsTimeIndex + 1) % this.graphsTimeSamples;
        
        if (this.inspector && this.inspector.graphs) {
            this.inspector.graphs.updateGraphs(this);
        }
    }


    if ((this.statsCycle % 50) == 0) {
        this.renderTime = this.renderTimeTmp / 100;
        this.fps = 1000 / this.renderTime;
        this.renderTimeTmp = 0;

        if (this.inspector && this.inspector.stats) {
            this.gpuUsed = this.map.gpuCache.totalCost;
            this.resourcesUsed = this.map.resourcesCache.totalCost;
            this.metaUsed = this.map.metatileCache.totalCost;

            this.inspector.stats.updateStatsPanel(this);
        }
    }
    
    //do not reset flux data in begin function, because we to collect data from events which     
    this.graphsFluxTexture = [[0,0],[0,0]];
    this.graphsFluxMesh = [[0,0],[0,0]];
    this.graphsFluxGeodata = [[0,0],[0,0]];
    this.debugStr = this.map.renderer.debugStr;
};


export default MapStats;

