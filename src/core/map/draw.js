
import {vec3 as vec3_} from '../utils/matrix';
import {math as math_} from '../utils/math';
import MapGeodata_ from './geodata';
import MapGeodataView_ from './geodata-view';
import MapDrawTiles_ from './draw-tiles';

//get rid of compiler mess
var vec3 = vec3_;
var math = math_;
var MapDrawTiles = MapDrawTiles_;
var MapGeodataView = MapGeodataView_;
var MapGeodata = MapGeodata_;

var MapDraw = function(map) {
    this.map = map;
    this.config = map.config;
    this.isProjected = map.getNavigationSrs().isProjected();
    this.isGeocent = map.isGeocent;

    this.renderer = map.renderer;
    this.stats = map.stats;
    this.camera = map.camera;
    this.tree = map.tree;

    this.ndcToScreenPixel = this.renderer.curSize[0] * 0.5;

    this.debug = {
        heightmapOnly : false,
        blendHeightmap : true,
        drawBBoxes : false,
        drawNBBoxes : false,
        drawSpaceBBox : false,        
        drawMeshBBox : false,
        drawLods : false,
        drawPositions : false,
        drawTexelSize : false,
        drawWireframe : 0,
        drawTestMode : 0,
        drawTestData : 0,
        drawFaceCount : false,
        drawDistance : false,
        drawMaxLod : false,
        drawGeodataOnly : false,
        drawTextureSize : false,
        drawNodeInfo : false,
        drawLayers : true,
        drawBoundLayers : false,
        drawSurfaces : false,
        drawCredits : false,
        drawOrder : false,
        drawOctants : false,
        drawLabelBoxes : false,
        drawAllLabels : false,
        drawHiddenLabels : false,
        drawEarth : true, 
        drawGridCells : false,
        drawTileCounter : 0,
        drawPolyWires : false,
        drawFog : this.config.mapFog,
        drawGPixelSize : false,
        debugTextSize : 2.0,
        ignoreTexelSize : false,
        maxZoom : false
    };

    this.gridFlat = false;
    this.gridGlues = false;
    this.gridSkipped = false;

    this.atmoColor = [216.0/255.0, 232.0/255.0, 243.0/255.0, 1.0];
    this.atmoColor2 = [72.0/255.0, 154.0/255.0, 255.0/255.0, 1.0];
    this.atmoHeight = 50000;
    this.atmoHeightFactor = 1; //this.atmoHeight / 50000;
    this.atmoDensity = 1; //this.atmoHeight / 50000;

    this.fogDensity = 0;
    this.zFactor = 0;
    //this.zFactor2 = 0.000012;
    this.zFactor2 = 0.003;
    this.zbufferOffset = null;    
    this.zShift = 0;
    this.zLastShift = 0;
    this.bestMeshTexelSize = 1;
    this.bestGeodataTexelSize = 1;
    this.log8 = Math.log(8);
    this.log2 = Math.log(2);

    this.geodataTilesPerLayer = 0;

    this.drawCounter = 0;
    this.drawChannel = 0;
    this.drawChannelNames = ['base', 'hit'];

    this.planetRadius = this.isGeocent ? map.getNavigationSrs().getSrsInfo()['a'] : 100;
    this.tileBuffer = new Array(500);
    this.processBuffer = new Array(60000);
    this.processBuffer2 = new Array(60000);
    this.drawBuffer = new Array(60000);
    this.drawBuffer2 = new Array(60000);
    this.tmpVec3 = new Array(3);
    this.tmpVec5 = new Array(5);
    this.bboxBuffer = new Float32Array(8*3);
    this.planeBuffer = new Float32Array(9*3);
    //this.drawBufferIndex = 0;

    var gpu = this.renderer.gpu;
    this.drawTileState = gpu.createState({});
    this.drawStardomeState = gpu.createState({zwrite:false, ztest:false});
    this.drawBlendedTileState = gpu.createState({zequal:true, blend:true});
    this.drawAuraState = gpu.createState({zwrite:false, blend:true});
    this.drawAtmoState = gpu.createState({zwrite:false, ztest:false, blend:true});
    this.drawAtmoState2 = gpu.createState({zwrite:false, ztest:true, blend:false});

    this.degradeHorizonFactor = 0;
    this.degradeHorizonTiltFactor = 0;

    this.replay = {
        camera : null,
        drawnTiles : null,
        drawnFreeTiles : null,
        nodeBuffer : null,
        tracedNodes : null,
        tracedFreeNodes : null,
        storeTiles : false,
        storeFreeTiles : false,
        storeNodes : false,
        storeFreeNodes : false,
        storeLoaded : this.config.mapStoreLoadStats,
        drawGlobe : false,
        drawTiles : false,
        drawNodes : false,
        drawFreeTiles : false,
        drawFreeNodes : false,
        drawLoaded : false,
        lod : 30,
        singleLod : false,
        loadedIndex : 0,
        singleLodedIndex : 0,
        loaded : [],
        loadFirst : 0,
        loadLast : 0
    };

    this.drawTiles = new MapDrawTiles(map, this);
};


MapDraw.prototype.drawMap = function(skipFreeLayers) {
    var map = this.map;
    var renderer = this.renderer;
    var camera = this.camera;
    var replay = this.replay;
    var gpu = renderer.gpu;
    var debug = this.debug;

    if (this.drawChannel != 1) {
        gpu.setViewport();

        map.visibleCredits = {
            imagery : {},
            glueImagery : {},
            mapdata : {}
        };
    }

    var projected = this.isProjected;

    switch (this.config.mapGridMode) {
        case 'none':       this.gridSkipped = true; this.gridFlat = false; this.gridGlues = false;  break;
        case 'flat':       this.gridSkipped = false; this.gridFlat = true; this.gridGlues = false;  break;
        case 'linear':     this.gridSkipped = false; this.gridFlat = false; this.gridGlues = true;  break;
        case 'fastlinear': this.gridSkipped = false; this.gridFlat = false; this.gridGlues = false; break;
    }

    var drawTiles = this.drawTiles;
    var camInfo = camera.update();
    var renderer = this.renderer;

    renderer.debugStr = 'AsyncImageDecode: ' + this.config.mapAsyncImageDecode;
    renderer.dirty = true;
    renderer.drawFog = this.debug.drawFog;
    renderer.debug = this.debug; 
    renderer.mapHack = map;
    renderer.benevolentMargins = this.config.mapBenevolentMargins;

    if (this.config.mapForceFrameTime) {
        if (this.config.mapForceFrameTime != -1) {
            renderer.frameTime = this.config.mapForceFrameTime;
        } else {
            renderer.frameTime = 0;
        }
    } else {
        renderer.frameTime = this.stats.frameTime;        
    }

    renderer.hoverFeatureCounter = 0;
    renderer.hoverFeatureList = map.hoverFeatureList;
    renderer.hoverFeature = map.hoverFeature;

    renderer.cameraPosition = camera.position;
    renderer.cameraOrientation = map.position.getOrientation();
    renderer.cameraTiltFator = Math.cos(math.radians(renderer.cameraOrientation[1]));
    renderer.cameraVector = camera.vector; 
    renderer.cameraViewExtent = map.position.getViewExtent();
    renderer.cameraViewExtent2 = Math.pow(2.0, Math.max(1.0, Math.floor(Math.log(map.position.getViewExtent()) / Math.log(2))));
    renderer.drawLabelBoxes = this.debug.drawLabelBoxes;
    renderer.drawGridCells = this.debug.drawGridCells;
    renderer.drawAllLabels = this.debug.drawAllLabels;
    renderer.drawHiddenLabels = this.debug.drawHiddenLabels;
    renderer.debug = this.debug;
    renderer.fmaxDist = Number.NEGATIVE_INFINITY;
    renderer.fminDist = Number.POSITIVE_INFINITY;


    if (projected) {
        var yaw = math.radians(renderer.cameraOrientation[0]);
        renderer.labelVector = [-Math.sin(yaw), Math.cos(yaw), 0, 0, 0];
    } else {
        var v = camInfo.vector;
        renderer.labelVector = [v[0], v[1], v[2], 0]; 
    }

    renderer.distanceFactor = 1 / Math.max(1,Math.log(camera.distance) / Math.log(1.04));
    renderer.tiltFactor = (Math.abs(renderer.cameraOrientation[1]/-90));
    renderer.localViewExtentFactor = 2 * Math.tan(math.radians(map.position.getFov()*0.5));

    this.degradeHorizonFactor = 200.0 * this.config.mapDegradeHorizonParams[0];
    this.degradeHorizonTiltFactor = 0.5*(1.0+Math.cos(math.radians(Math.min(180,Math.abs(renderer.cameraOrientation[1]*2*3)))));
   
    if (this.drawChannel != 1) {
        if (debug.drawWireframe == 2) {
            gpu.clear(true, true, [255,255,255,255]);
        } else {
            gpu.clear(true, true, [0,0,0,255]);
        }
    } else { //render depth map
        gpu.clear(true, true, [255,255,255,255]);
    }

    gpu.setState(this.drawStardomeState);

    /*
    if (this.drawChannel != 1) {
        if (debug.drawWireframe == 2) {
            renderer.draw.drawSkydome(renderer.whiteTexture, renderer.progStardome);
        } else {
            renderer.draw.drawSkydome(renderer.blackTexture, renderer.progStardome);
        }
    }*/

    gpu.setState(this.drawTileState);

    this.setupDetailDegradation();

    map.loader.setChannel(0); //0 = hires channel
    this.zFactor = 0;

    this.ndcToScreenPixel = renderer.curSize[0] * 0.5;
    this.updateFogDensity();
    this.updateGridFactors();
    this.maxGpuUsed = Math.max(32*102*1204, map.gpuCache.getMaxCost() - 32*102*1204); 
    //this.cameraCenter = this.position.getCoords();
    this.stats.renderBuild = 0;
    this.drawTileCounter = 0;
    var cameraPos = camera.position;
    var i, li, j, lj, tile, tiles, tmp, layer, drawnTiles, nodeBuffer;

    if (map.freeLayersHaveGeodata && this.drawChannel == 0) {
        renderer.draw.clearJobBuffer();
    }

    if (this.debug.drawEarth) {
        if (replay.storeNodes || replay.storeFreeNodes) {
            replay.nodeBuffer = [];
        }
        
        if (replay.drawGlobe || replay.drawTiles || replay.drawFreeTiles||
            replay.drawNodes || replay.drawFreeNodes || replay.drawLoaded) { //used only in inspector
    
            var lod = replay.lod; 
            var single = replay.singleLod; 
    
            if (replay.drawTiles && replay.drawnTiles) {
                tiles = replay.drawnTiles;
                for (i = 0, li = tiles.length; i < li; i++) {
                    if (!tiles[i][1]) { //skip grids
                        tile = tiles[i][0];
                        if (tile && ((single && tile.id[0] == lod) || (!single && tile.id[0] <= lod))) {
                            drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.pixelSize, tile.priority, false, false);
                        }
                    } else {
                        tile = tiles[i][0];
                        if (drawTiles.debug.drawBBoxes) {
                            drawTiles.drawTileInfo(tile, tile.metanode, cameraPos);
                        }

                        tile.drawGrid(cameraPos); 
                    }
                }
            }
            
            if (replay.drawFreeTiles && replay.drawnFreeTiles) {
                tiles = replay.drawnFreeTiles;
                for (i = 0, li = tiles.length; i < li; i++) {
                    if (!tiles[i][1]) { //skip grids
                        tile = tiles[i][0];
                        if (tile && ((single && tile.id[0] == lod) || (!single && tile.id[0] <= lod))) {
                            drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.pixelSize, tile.priority, false, false);
                        }
                    }
                }
            }
    
            if (replay.drawNodes && replay.tracedNodes) {
                tiles = replay.tracedNodes;
                tmp = debug.drawBBoxes;
                debug.drawBBoxes = true;  
                for (i = 0, li = tiles.length; i < li; i++) {
                    tile = tiles[i];
                    if (tile && ((single && tile.id[0] == lod) || (!single && tile.id[0] <= lod))) {
                        drawTiles.drawTileInfo(tile, tile.metanode, cameraPos, tile.surfaceMesh, tile.pixelSize);
                    }
                }
                debug.drawBBoxes = tmp;
            }
    
            if (replay.drawFreeNodes && replay.tracedFreeNodes) {
                tiles = replay.tracedFreeNodes;
                tmp = debug.drawBBoxes;
                debug.drawBBoxes = true;  
                for (i = 0, li = tiles.length; i < li; i++) {
                    tile = tiles[i];
                    if ((single && tile.id[0] == lod) || (!single && tile.id[0] <= lod)) {
                        drawTiles.drawTileInfo(tile, tile.metanode, cameraPos, tile.surfaceMesh, tile.pixelSize);
                    }
                }
                debug.drawBBoxes = tmp;
            }
    
            var index = replay.loadedIndex; 
            var singleIndex = replay.singleLodedIndex; 
    
            if (replay.drawLoaded && replay.loaded) {
                var  loaded = replay.loaded;
                debug.drawBBoxes = true;  
                for (i = 0, li = loaded.length; i < li; i++) {
                    var file = loaded[i];
                    if (file && file.tile && file.tile.id) {
                        tile = file.tile;
                        if (((singleIndex && i == index) || (!singleIndex && i <= index)) &&
                             ((single && tile.id[0] == lod) || (!single && tile.id[0] <= lod)) ) {
                            if (tile.metanode) {
                                if (tile.metanode.hasGeometry()) {
                                    drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.pixelSize, tile.priority, false, false);
                                } else {
                                    drawTiles.drawTileInfo(tile, tile.metanode, cameraPos, tile.surfaceMesh, tile.pixelSize);
                                }
                            }
                        }
                    }
                }
                debug.drawBBoxes = tmp;
            }
    
            if ((replay.drawFreeTiles && replay.drawnFreeTiles) ||
                (replay.drawLoaded && replay.loaded)) {
                    
                if (this.freeLayersHaveGeodata && this.drawChannel == 0) {
                    renderer.drawnGeodataTiles = this.stats.drawnGeodataTilesPerLayer; //drawnGeodataTiles;
                    renderer.drawnGeodataTilesFactor = this.stats.drawnGeodataTilesFactor;
                    renderer.draw.drawGpuJobs();
                }
            }
    
            return;
        }    
        
        for (i = 0, li = this.tileBuffer.length; i < li; i++) {  //todo remove this
            this.tileBuffer[i] = null;    
        }
    
        if (this.tree.surfaceSequence.length > 0) {
            this.tree.draw();
        }
    
        if (replay.storeTiles) { //used only in inspectors
            drawnTiles = [];
    
            for (i = 0, li = this.tileBuffer.length; i < li; i++) {
                tiles = this.tileBuffer[i];
               
                if (tiles) {
                    for (j = 0, lj = tiles.length; j < lj; j++) {
                        drawnTiles.push(tiles[j]);
                    }
                }
            }
            
            replay.cameraPos = cameraPos; 
            replay.drawnTiles = drawnTiles;
            replay.storeTiles = false; 
        }
    
        if (replay.storeNodes) { //used only in inspector
            nodeBuffer = []; 
    
            for (i = 0, li = replay.nodeBuffer.length; i < li; i++) {
                tile = replay.nodeBuffer[i];
                nodeBuffer.push(tile);
            }
    
            replay.cameraPos = cameraPos; 
            replay.tracedNodes = nodeBuffer;
            replay.storeNodes = false; 
        }
    
        //draw free layers    
        for (i = 0, li = map.freeLayerSequence.length; i < li; i++) {
            layer = map.freeLayerSequence[i];
            if (layer.ready && layer.tree && 
                (!layer.geodata || (layer.stylesheet && layer.stylesheet.isReady())) && this.drawChannel == 0) {
                
                if (layer.zFactor) {
                    this.zbufferOffset = layer.zFactor;
                }

                if (layer.type == 'geodata') {
                    this.drawMonoliticGeodata(layer);
                } else {
                    layer.tree.draw();
                }

                this.zbufferOffset = null;
            }
        }
    
        if (replay.storeFreeTiles) { //used only in inspector
            drawnTiles = [];
    
            for (i = 0, li = this.tileBuffer.length; i < li; i++) {
                tiles = this.tileBuffer[i];
               
                if (tiles) {
                    for (j = 0, lj = tiles.length; j < lj; j++) {
                        tile = tiles[j];
                        if (tile.surface && tile.surface.free) { //do no draw free layers
                            drawnTiles.push(tile);
                        }
                    }
                }
            }
            
            replay.cameraPos = cameraPos; 
            replay.drawnFreeTiles = drawnTiles;
            replay.storeFreeTiles = false; 
        }
    
        if (replay.storeFreeNodes) { //used only in inspector
            nodeBuffer = []; 
    
            for (i = 0, li = replay.nodeBuffer.length; i < li; i++) {
                tile = replay.nodeBuffer[i];
                if (tile.surface && tile.surface.free) { //do no draw free layers
                    nodeBuffer.push(tile);
                }
            }
    
            replay.cameraPos = cameraPos; 
            replay.tracedFreeNodes = nodeBuffer;
            replay.storeFreeNodes = false; 
        }
    }

    var body = map.referenceFrame.body;

    //draw skydome before geodata
    if (this.drawChannel != 1 && !projected && debug.drawFog &&
        ((body && body.atmosphere) || map.referenceFrame.id == 'melown2015' || map.referenceFrame.id == 'mars-qsc' || map.referenceFrame.id == 'earth-qsc') &&
        renderer.progAtmo.isReady() && renderer.progAtmo2.isReady()) {    

        var navigationSrsInfo = map.getNavigationSrs().getSrsInfo();
        var earthRadius =  navigationSrsInfo['a'];
        var earthRadius2 =  navigationSrsInfo['b'];
        var atmoSize = this.atmoHeight;
        renderer.earthRadius = earthRadius;
        renderer.earthRadius2 = earthRadius2;
        renderer.earthERatio = earthRadius / earthRadius2;

        var cameraPosToEarthCenter = [0,0,0,0];
        vec3.normalize(camera.position, cameraPosToEarthCenter);

        var pos = map.getPosition();
        //var orientation = pos.getOrientation();
        //var tiltFactor = (Math.max(5,-orientation[1])/90);

        //var cameraHeight = Math.max(atmoSize * 0.1, camera.geocentDistance - earthRadius);
        var heightFactor = 1-math.clamp(Math.max(atmoSize * 0.1, camera.geocentDistance - earthRadius) / (atmoSize*(10)), 0, 1);

        var params = [Math.max(2,heightFactor*128),0,0,0], params2, params3;
        
        /*
        if (cameraHeight > earthRadius*2) { //prevent foggy earth from larger distance
            params[0] = 2-Math.min(1.0, (camera.height - earthRadius*2) / (earthRadius*2));
        }*/

        //gpu.setState(this.drawAtmoState);
        //renderer.draw.drawBall([-camera.position[0], -camera.position[1], -camera.position[2]],
          //                       earthRadius + 3000, earthRadius2 + 3000, renderer.progAtmo2, params,  cameraPosToEarthCenter, null, this.atmoColor3, this.atmoColor2, true);// this.cameraHeight > atmoSize ? 1 : -1);
        
        var safetyFactor = 2.0; 
        params = [safetyFactor, safetyFactor * ((earthRadius + atmoSize) / earthRadius), 0.25, safetyFactor* ((earthRadius + atmoSize) / earthRadius)];
        var factor = (1 / (earthRadius) ) * safetyFactor;  
        params2 = [camera.position[0] * factor, camera.position[1] * factor, camera.position[2] * factor, 1];
        
        var distance = (pos.getViewExtent()*0.5) / Math.tan(math.radians(pos.getFov()*0.5));
        var a1 = (earthRadius / (distance + earthRadius)); //get angle to horion

        //var n2 = 10.05;
        var n2 = 5.00;

        var t1 = math.mix(4.4, 1.01, a1);
        var t2 = math.mix(n2, 1.05, a1); // * 1.0176;

        params3 = [t1, 1 ,t2,0];

        //console.log("a1: " + a1 + " t2: " + t2);

        gpu.setState(this.drawAuraState);
        renderer.draw.drawBall([-camera.position[0], -camera.position[1], -camera.position[2]],
                                 earthRadius + atmoSize, earthRadius2 + atmoSize, renderer.progAtmo, params,  params2, params3, this.atmoColor, this.atmoColor2);// this.camera.height > atmoSize ? 1 : -1);

        gpu.setState(this.drawTileState);
    }

    if (debug.drawEarth) {
        if (!skipFreeLayers) {
            if (map.freeLayersHaveGeodata && this.drawChannel == 0) {
                renderer.drawnGeodataTiles = this.stats.drawnGeodataTilesPerLayer; //drawnGeodataTiles;
                renderer.drawnGeodataTilesFactor = this.stats.drawnGeodataTilesFactor;
                renderer.draw.drawGpuJobs();
            }
        }
    }

    if (this.config.mapForceFrameTime) {
        if (this.config.mapForceFrameTime != -1) {
            renderer.frameTime = 0;
            this.config.mapForceFrameTime = -1;
        }
    }
};

MapDraw.prototype.drawToTexture = function(texture) {
    this.renderer.switchToFramebuffer('texture', texture);
    this.drawChannel = 0;
    this.map.renderSlots.processRenderSlots();
    this.renderer.switchToFramebuffer('base');
};


MapDraw.prototype.drawHitmap = function() {
    this.drawChannel = 1;
    this.renderer.switchToFramebuffer('depth');
    this.map.renderSlots.processRenderSlots();
    this.renderer.switchToFramebuffer('base');

    if (this.renderer.hitmapMode > 2) {
        this.renderer.copyHitmap();
    }

    this.drawChannel = 0;
    this.map.hitMapDirty = false;
};


MapDraw.prototype.drawGeodataHitmap = function() {
    this.renderer.gpu.setState(this.drawTileState);
    this.renderer.switchToFramebuffer('geo');
    this.renderer.draw.drawGpuJobs();

    if (this.renderer.advancedPassNeeded) {
        this.renderer.switchToFramebuffer('geo2');
        this.renderer.draw.drawGpuJobs();
    }

    this.renderer.switchToFramebuffer('base');
    this.map.geoHitMapDirty = false;
};

MapDraw.prototype.getDrawCommandsGpuSize = function(commands) {
    var gpuNeeded = 0;
    
    for (var i = 0, li = commands.length; i < li; i++) {
        var command = commands[i];
        
        switch (command.type) {
        case VTS_DRAWCOMMAND_SUBMESH:
               
            var mesh = command.mesh; 
            var texture = this.config.mapNoTextures ? 0 : command.texture; 

            if (mesh) {
                gpuNeeded += mesh.gpuSize;
            }

            if (texture) {
                gpuNeeded += texture.getGpuSize();
            }
                
            break;

        case VTS_DRAWCOMMAND_GEODATA:
                
            var geodataView = command.geodataView; 
                
            if (geodataView) {
                gpuNeeded += geodataView.size;
            }
                
            break;
        }
    }
    
    return gpuNeeded;
};


MapDraw.prototype.areDrawCommandsReady = function(commands, priority, doNotLoad, doNotCheckGpu) {
    var ready = true;
    var checkGpu = doNotCheckGpu ? true : false;
    
    for (var i = 0, li = commands.length; i < li; i++) {
        var command = commands[i];
        
        switch (command.type) {
        case VTS_DRAWCOMMAND_SUBMESH:

            var pipeline = command.pipeline;
            if (pipeline) {
                var hmap = command.hmap;
    
                if (!(hmap && hmap.isReady(doNotLoad, priority))) {
                    ready = false;
                }

                if (this.debug.drawTestMode == 9) {
                    var texture = command.texture; 
                    var textureReady = this.config.mapNoTextures ? true : (!texture  || (texture && texture.isReady(doNotLoad, priority, checkGpu)));
                        
                    if (!textureReady) {
                        ready = false;   
                    }
                }

                break;
            }
                
            var mesh = command.mesh; 
            var texture = command.texture; 
                
            var meshReady = (mesh && mesh.isReady(doNotLoad, priority, checkGpu));
            var textureReady = this.config.mapNoTextures ? true : (!texture  || (texture && texture.isReady(doNotLoad, priority, checkGpu)));
                
            if (!(meshReady && textureReady) ) {
                ready = false;   
            }
               
            break;

        case VTS_DRAWCOMMAND_GEODATA:
                
            var geodataView = command.geodataView; 
                
            if (!(geodataView && geodataView.isReady(doNotLoad, priority, checkGpu))) {
                ready = false;   
            }
                
            break;
        }
    }
    
    return ready;
};


MapDraw.prototype.processDrawCommands = function(cameraPos, commands, priority, doNotLoad, tile) {
    if (commands.length > 0) {
        this.drawTileCounter++;
    }

    for (var i = 0, li = commands.length; i < li; i++) {
        var command = commands[i];
        
        switch (command.type) {
        case VTS_DRAWCOMMAND_STATE:
            this.renderer.gpu.setState(command.state);
            break;

        case VTS_DRAWCOMMAND_SUBMESH:

            var pipeline = command.pipeline;
            if (pipeline) {
                var hmap = command.hmap;
    
                if (this.debug.drawTestMode == 9) {
                    var texture = command.texture; 
                    var textureReady = this.config.mapNoTextures ? true : (!texture  || (texture && texture.isReady(doNotLoad, priority)));
                        
                    if (textureReady) {
                        if (hmap && hmap.isReady(doNotLoad, priority)) {
                            tile.drawHmapTile(cameraPos, null, null, pipeline, texture);
                        }
                    }
                } else {
                    if (hmap && hmap.isReady(doNotLoad, priority)) {
                        tile.drawHmapTile(cameraPos, null, null, pipeline);
                    }
                }

                return;
            }

            var mesh = command.mesh; 
            var texture = command.texture;

            var meshReady = (mesh && mesh.isReady(doNotLoad, priority)), textureReady;

            if (this.config.mapNoTextures) {
                textureReady = true;
                texture = null;
            } else {
                textureReady = (!texture || (texture && texture.isReady(doNotLoad, priority)));
            }
                
            if (meshReady && textureReady) {
                    //debug bbox
                if (this.debug.drawBBoxes && this.debug.drawMeshBBox) {
                    mesh.submeshes[command.submesh].drawBBox(cameraPos);
                }
                    
                if (!texture) {
                    var material = command.material;
                    switch (material) {
                            //case "fog":
                    case VTS_MATERIAL_EXTERNAL:
                    case VTS_MATERIAL_INTERNAL:
                        material = VTS_MATERIAL_FLAT;
                        break; 
                    }
                    mesh.drawSubmesh(cameraPos, command.submesh, texture, material, command.alpha, command.layer, command.surface, tile.splitMask);
                } else {
                    //tile.renderHappen = true;
                    mesh.drawSubmesh(cameraPos, command.submesh, texture, command.material, command.alpha, command.layer, command.surface, tile.splitMask);
                }

            }
                
            break;
                
        case VTS_DRAWCOMMAND_GEODATA:
                
            var geodataView = command.geodataView; 
            //tile.renderHappen = true;
                
            if (geodataView && geodataView.isReady(doNotLoad, priority, true)) {
                geodataView.draw(cameraPos);
            }
                
            break;
        }
    }
};


MapDraw.prototype.drawMonoliticGeodata = function(surface) {
    if (!surface || this.drawChannel != 0) {
        return;
    }

    if (!this.camera.camera.bboxVisible(surface.extents, this.camera.position)) {
        return;
    }

    var path;

    if (surface.monoGeodata == null) {
        if (typeof surface.geodataUrl === 'object') {
            path = surface.geodataUrl;
        } else {
            path = surface.getMonoGeodataUrl(surface.id);
        }

        surface.monoGeodata = new MapGeodata(this.map, path, {tile:null, surface:surface});
    }

    if (surface.monoGeodataCounter != surface.geodataCounter) {
        surface.monoGeodataView = null;
        surface.monoGeodataCounter = surface.geodataCounter;
    }

    if (surface.monoGeodata.isReady(null, null, null, surface.options.fastParse)) {

        if (!surface.monoGeodataView) {
            surface.monoGeodataView = new MapGeodataView(this.map, surface.monoGeodata, {tile:null, surface:surface});
        }
        
        if (surface.monoGeodataView.isReady()) {
            var mapdataCredits = this.map.visibleCredits.mapdata

            for (var i = 0, li = surface.credits.length; i < li; i++) {
                var key = surface.credits[i]
                var value = 10; //fixed specificity
                var value2 = mapdataCredits[key];

                if (value2) {
                    mapdataCredits[key] = value > value2 ? value : value2;
                } else {
                    mapdataCredits[key] = value;
                }
            }

            surface.monoGeodataView.draw(this.camera.position);
        }
    }
};


MapDraw.prototype.updateFogDensity = function() {
    // the fog equation is: exp(-density*distance), this gives the fraction
    // of the original color that is still visible at some distance

    // we define visibility as a distance where only 5% of the original color
    // is visible; from this it is easy to calculate the correct fog density

    //var density = Math.log(0.05) / this.core.coreConfig.cameraVisibility;
    var pos = this.map.getPosition();
    var orientation = pos.getOrientation();
    
    var cameraVisibility = this.camera.getFar();
    
    var tiltFactor = (Math.max(5,-orientation[1])/90);
    var density = Math.log(0.05) / ((this.atmoDensity * cameraVisibility * this.atmoHeightFactor * Math.max(1,this.camera.height*0.0001))* tiltFactor);
    density *= (5.0) / (Math.min(50000, Math.max(this.camera.distance, 1000)) /5000);

    if (!this.debug.drawFog) {
        density = 0;
    }
    
    //reduce fog when camera is facing down
    //density *= 1.0 - (-this.orientation[0]/90)
    
    this.fogDensity = density;
    this.renderer.fogDensity = density; 
};


MapDraw.prototype.updateGridFactors = function() {
    var nodes = this.map.referenceFrame.getSpatialDivisionNodes();

    for (var i = 0, li = nodes.length; i < li; i++) {
        var node = nodes[i]; 
        var embed = 8;

        var altitude = Math.max(10, this.camera.distance + 20);
        //var altitude = Math.max(1.1, this.cameraDistance);
        var maxDistance = (node.extents.ur[0] - node.extents.ll[0])*2;
        var gridSelect = Math.log(Math.min(maxDistance,altitude)) / this.log8;
        var gridMax = Math.log(maxDistance) / this.log8;
    
        gridSelect = gridMax - gridSelect;
    
        node.gridBlend = (gridSelect - Math.floor(gridSelect));
        
        gridSelect = Math.floor(Math.floor(gridSelect))+1;
        node.gridStep1 = Math.pow(embed, gridSelect);
        node.gridStep2 = node.gridStep1 * 8; 
    }
};


MapDraw.prototype.setupDetailDegradation = function(degradeMore) {
    var factor = 0;
    
    if (this.map.mobile) {
        factor = this.config.mapMobileDetailDegradation;
    }

    if (degradeMore) {
        factor += degradeMore;        
    }

    var dpiRatio = 1; //(window.devicePixelRatio || 1);

    this.texelSizeFit = this.config.mapTexelSizeFit * Math.pow(2,factor) * dpiRatio;      
};


export default MapDraw;

