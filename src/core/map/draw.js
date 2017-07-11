
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
        drawBBoxes :  false,
        drawMeshBBox : false,
        drawLods : false,
        drawPositions : false,
        drawTexelSize : false,
        drawWireframe : 0,
        drawFaceCount : false,
        drawDistance : false,
        drawMaxLod : false,
        drawTextureSize : false,
        drawNodeInfo : false,
        drawLayers : true,
        drawBoundLayers : false,
        drawSurfaces : false,
        drawCredits : false,
        drawOrder : false,
        drawLabelBoxes : false,
        drawEarth : true,   
        drawTileCounter : 0,
        drawFog : this.config.mapFog,
        debugTextSize : 2.0,
        ignoreTexelSize : false,
        maxZoom : false
    };

    this.gridFlat = false;
    this.gridGlues = false;
    this.gridSkipped = false;

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

    this.drawCounter = 0;
    this.drawChannel = 0;
    this.drawChannelNames = ['base', 'hit'];

    this.planetRadius = this.isGeocent ? map.getNavigationSrs().getSrsInfo()['a'] : 100;
    this.tileBuffer = new Array(500);
    this.processBuffer = new Array(60000);
    this.processBuffer2 = new Array(60000);
    this.drawBuffer = new Array(60000);
    this.tmpVec3 = new Array(3);
    this.tmpVec5 = new Array(5);
    this.bboxBuffer = new Float32Array(8*3);
    this.planeBuffer = new Float32Array(9*3);

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
    this.renderer.dirty = true;
    this.renderer.drawFog = this.debug.drawFog;

    this.renderer.hoverFeatureCounter = 0;
    this.renderer.hoverFeatureList = map.hoverFeatureList;
    this.renderer.hoverFeature = map.hoverFeature;

    this.renderer.cameraPosition = camera.position;
    this.renderer.cameraOrientation = map.position.getOrientation();
    this.renderer.cameraTiltFator = Math.cos(math.radians(renderer.cameraOrientation[1]));
    this.renderer.cameraVector = camera.vector; 
    this.renderer.cameraViewExtent = map.position.getViewExtent();
    this.renderer.cameraViewExtent2 = Math.pow(2.0, Math.max(1.0, Math.floor(Math.log(map.position.getViewExtent()) / Math.log(2))));
    this.renderer.drawLabelBoxes = this.debug.drawLabelBoxes;

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
        gpu.clear(true, false);
    } else { //dender depth map
        gpu.clear(true, true, [255,255,255,255]);
    }

    gpu.setState(this.drawStardomeState);

    if (this.drawChannel != 1) {
        if (this.config.mapLowresBackground < 0.8) {
            if (debug.drawWireframe == 2) {
                renderer.draw.drawSkydome(renderer.whiteTexture, renderer.progStardome);
            } else {
                renderer.draw.drawSkydome(renderer.blackTexture, renderer.progStardome);
            }
        }
    }

    gpu.setState(this.drawTileState);

    this.setupDetailDegradation();

    map.loader.setChannel(0); //0 = hires channel
    this.zFactor = 0;

    this.ndcToScreenPixel = this.renderer.curSize[0] * 0.5;
    this.updateFogDensity();
    this.updateGridFactors();
    this.maxGpuUsed = map.gpuCache.getMaxCost() * 0.9; 
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
                    this.renderer.draw.drawGpuJobs();
                }
            }
    
            return;
        }    
        
        for (i = 0, li = this.tileBuffer.length; i < li; i++) {  //todo remove this
            this.tileBuffer[i] = null;    
        }
    
        if (this.tree.surfaceSequence.length > 0) {
            this.tree.draw(camInfo);
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
                    layer.tree.draw(camInfo);
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

    //draw skydome before geodata
    if (this.drawChannel != 1 && !projected && debug.drawFog && map.referenceFrame.id == 'melown2015') {    

        var navigationSrsInfo = map.getNavigationSrs().getSrsInfo();
        var earthRadius =  navigationSrsInfo['a'];
        var atmoSize = 50000;
        
        var cameraPosToEarthCenter = [0,0,0,0];
        vec3.normalize(camera.position, cameraPosToEarthCenter);

        var pos = map.getPosition();
        var orientation = pos.getOrientation();
        var tiltFactor = (Math.max(5,-orientation[1])/90);

        var heightFactor = 1-Math.max(0,Math.min(1.0, camera.height / (atmoSize*(10+20*tiltFactor))));
        heightFactor = heightFactor * heightFactor;

        var params = [Math.max(2,heightFactor*128),0,0,0], params2, params3;
        
        if (camera.height > earthRadius*2) { //prevent foggy earth from larger distance
            params[0] = 2-Math.min(1.0, (camera.height - earthRadius*2) / (earthRadius*2));
        }

        gpu.setState(this.drawAtmoState);
        renderer.draw.drawBall([-camera.position[0], -camera.position[1], -camera.position[2]],
                                  earthRadius, renderer.progAtmo2, params,  cameraPosToEarthCenter, null, true);// this.cameraHeight > atmoSize ? 1 : -1);
        
        var safetyFactor = 2.0; 
        params = [safetyFactor, safetyFactor * ((earthRadius + atmoSize) / earthRadius), 0.25, safetyFactor* ((earthRadius + atmoSize) / earthRadius)];
        var factor = (1 / (earthRadius) ) * safetyFactor;  
        params2 = [camera.position[0] * factor, camera.position[1] * factor, camera.position[2] * factor, 1];
        
        
        var t1 = 1.4, t2 = 1.6; //previous value t1=1.1

        if (camera.height > 45000) { //don render ground color in aura
            t1 = 1.4, t2 = 1.8;
            params3 = [t2,1.0,t2,0];
        } else {
            if (camera.height < 5000) { 
                t1 = 1.05, t2 = 1.12;
            }
            
            params3 = [t1,5.2 / (t2-t1),t2,0];
        } 

        gpu.setState(this.drawAuraState);
        renderer.draw.drawBall([-camera.position[0], -camera.position[1], -camera.position[2]],
                                  earthRadius + atmoSize, renderer.progAtmo, params,  params2, params3);// this.camera.height > atmoSize ? 1 : -1);

        gpu.setState(this.drawTileState);
    }

    if (debug.drawEarth) {
        if (!skipFreeLayers) {
            if (map.freeLayersHaveGeodata && this.drawChannel == 0) {
                renderer.draw.drawGpuJobs();
            }
        }
    }
};


MapDraw.prototype.drawHitmap = function() {
    this.drawChannel = 1;
    this.renderer.switchToFramebuffer('depth');
    this.map.renderSlots.processRenderSlots();    
    this.renderer.switchToFramebuffer('base');
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


MapDraw.prototype.areDrawCommandsReady = function(commands, priority, doNotLoad, checkGpu) {
    var ready = true;
    checkGpu = checkGpu ? false : true;
    
    for (var i = 0, li = commands.length; i < li; i++) {
        var command = commands[i];
        
        switch (command.type) {
        case 'submesh':
                
            var mesh = command.mesh; 
            var texture = command.texture; 
                
            var meshReady = (mesh && mesh.isReady(doNotLoad, priority, checkGpu));
            var textureReady = (!texture  || (texture && texture.isReady(doNotLoad, priority, checkGpu)));
                
            if (!(meshReady && textureReady) ) {
                ready = false;   
            }
                
            break;

        case 'geodata':
                
            var geodataView = command.geodataView; 
                
            if (!(geodataView && geodataView.isReady(doNotLoad, priority, checkGpu))) {
                ready = false;   
            }
                
            break;
        }
    }
    
    return ready;
};


MapDraw.prototype.processDrawCommands = function(cameraPos, commands, priority, doNotLoad) {
    if (commands.length > 0) {
        this.drawTileCounter++;
    }
    
    for (var i = 0, li = commands.length; i < li; i++) {
        var command = commands[i];
        
        switch (command.type) {
        case 'state':
            this.renderer.gpu.setState(command.state);
            break;

        case 'submesh':
            var mesh = command.mesh; 
            var texture = command.texture;

            var meshReady = (mesh && mesh.isReady(doNotLoad, priority));
            var textureReady = (!texture  || (texture && texture.isReady(doNotLoad, priority)));
                
            if (meshReady && textureReady) {
                    //debug bbox
                if (this.debug.drawBBoxes && this.debug.drawMeshBBox) {
                    mesh.submeshes[command.submesh].drawBBox(cameraPos);
                }
                    
                if (!texture) {
                    var material = command.material;
                    switch (material) {
                            //case "fog":
                    case 'external':
                    case 'internal':
                        material = 'flat';
                        break; 
                    }
                    mesh.drawSubmesh(cameraPos, command.submesh, texture, material, command.alpha);
                } else {
                    mesh.drawSubmesh(cameraPos, command.submesh, texture, command.material, command.alpha);
                }

            } else {
                //i = i;
                //this should not happen
            }
                
            break;
                
        case 'geodata':
                
            var geodataView = command.geodataView; 
                
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

    if (surface.monoGeodata.isReady()) {

        if (!surface.monoGeodataView) {
            surface.monoGeodataView = new MapGeodataView(this.map, surface.monoGeodata, {tile:null, surface:surface});
        }
        
        if (surface.monoGeodataView.isReady()) {
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
    var density = Math.log(0.05) / ((cameraVisibility * Math.max(1,this.camera.height*0.0001))* tiltFactor);
    density *= (5.0) / (Math.min(50000, Math.max(this.camera.distance, 1000)) /5000);

    if (!this.debug.drawFog) {
        density = 0;
    }
    
    //reduce fog when camera is facing down
    //density *= 1.0 - (-this.orientation[0]/90)
    
    this.fogDensity = density;
    this.renderer.fogDensity = density; 

    //console.log("fden: " + density);
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

    this.texelSizeFit = this.config.mapTexelSizeFit * Math.pow(2,factor);      
};


export default MapDraw;

