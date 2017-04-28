
import MapSurfaceTile_ from './surface-tile';

//get rid of compiler mess
var MapSurfaceTile = MapSurfaceTile_;


var MapSurfaceTree = function(map, freeLayer, freeLayerSurface) {
    this.map = map;
    this.camera = map.camera;
    this.rootId = [0,0,0];
    this.freeLayer = freeLayer;
    this.freeLayerSurface = freeLayerSurface;
    this.metaBinaryOrder = this.map.referenceFrame.params.metaBinaryOrder;
    //this.initialized = false;
    //this.geocent = !this.map.getNavigationSrs().isProjected();

    this.surfaceTree = new MapSurfaceTile(this.map, null, this.rootId);

    if (freeLayer !== true) {
        //this.heightTracer = new MapMetanodeTracer(this, null, this.traceTileHeight.bind(this), this.traceHeightChild.bind(this));
        //this.heightTracerNodeOnly = new MapMetanodeTracer(this, null, this.traceTileHeightNodeOnly.bind(this), this.traceHeightChild.bind(this));
    }

    this.surfaceSequence = [];
    this.surfaceOnlySequence = [];

    this.config = this.map.config;
    this.cameraPos = [0,0,0];
    this.worldPos = [0,0,0];
    this.ndcToScreenPixel = 1.0;
    this.counter = 0;
};


MapSurfaceTree.prototype.kill = function() {
    this.surfaceTree = null;
    this.metastorageTree = null;
    this.surfaceTracer = null;
    this.heightTracer = null;
};


/*MapSurfaceTree.prototype.init = function() {
    var url = this.map.url.makeUrl(surface.metaUrl, {lod:result[0], ix:result[1], iy:result[2] });  //result???
    map.loader.load(url, metatile.load.bind(metatile, url));

    this.metatileTree.load();
    this.surfaceTree.metatile = 1;

    this.initialized = true;
};*/


MapSurfaceTree.prototype.findSurfaceTile = function(id) {
    var tile = this.surfaceTree;

//    for (var lod = 1; lod <= id[0]; lod++) {
//        var mask = 1 << (lod-1);
//        var index = 0;

    for (var lod = id[0]; lod > 0; lod--) {
        var mask = 1 << (lod-1);
        var index = 0;
        
        if ((id[1] & mask) != 0) {
            index += 1;
        }

        if ((id[2] & mask) != 0) {
            index += 2;
        }
        
        tile = tile.children[index];

        if (!tile) {
            return null;
        }
    }
    
    return tile;
};


MapSurfaceTree.prototype.findNavTile = function(id) {
    var tile = this.surfaceTree;
    
    if (id[0] == 0) {
        if (tile.metanode && tile.metanode.hasNavtile()) {
            return tile;
        } else {
            return null;
        }
    }
    
    var navtile = null;

//    for (var lod = 1; lod <= id[0]; lod++) {
//        var mask = 1 << (id[0] - lod);
//        var index = 0;
    for (var lod = id[0]; lod > 0; lod--) {
        var mask = 1 << (lod-1);
        var index = 0;

        if ((id[1] & mask) != 0) {
            index += 1;
        }

        if ((id[2] & mask) != 0) {
            index += 2;
        }
        
        tile = tile.children[index];

        if (!tile) {
            return navtile;
        } else {
            if (tile.metanode && tile.metanode.hasNavtile()) {
                navtile = tile;
            }
        }
    }
    
    return navtile;
};


MapSurfaceTree.prototype.draw = function() {
    this.cameraPos = [0,0,0];
    this.worldPos = [0,0,0];

    var map = this.map;
    var draw = map.draw;
    this.ndcToScreenPixel = draw.ndcToScreenPixel;
    
    var srs = map.getPhysicalSrs();

    var divisionNode = this.divisionNode;
    var periodicity = srs.periodicity;

    //if (this.map.config.mapBasicTileSequence) {
        //this.surfaceTracer = this.surfaceTracerBasic;
    //}
    
    if (this.freeLayerSurface && this.freeLayerSurface.geodata && draw.drawChannel != 0) {
        return;
    }

    if (periodicity != null) {
        this.drawSurface([0,0,0]);

        if (periodicity.type == 'X') {
            this.drawSurface([periodicity.period,0,0]);
            this.drawSurface([-periodicity.period,0,0]);
        }

    } else {
        var mode;

        if (this.freeLayerSurface && this.freeLayerSurface.geodata) {
            mode = map.config.mapGeodataLoadMode; 
        } else {
            mode = map.config.mapLoadMode; 
        }

        switch(mode) {
        case 'topdown': this.drawSurface([0,0,0]); break;
        case 'fit':     this.drawSurfaceFit([0,0,0]); break;
        case 'fitonly': this.drawSurfaceFitOnly([0,0,0]); break;
        }
    }
};


MapSurfaceTree.prototype.updateNodeHeightExtents = function(tile, node) {
    //debugger
    
    if (!node.heightReady && node.metatile.useVersion < 4) {
        var parent = tile.parent;

        if (node.hasNavtile()) {
            node = node;
        }
        
        while (parent) {
            var parentNode = parent.metanode;  
            if (parentNode.hasNavtile()) {

                if (node.hasNavtile()) {
                    node = node;
                }

                node.minHeight = parentNode.minHeight;
                node.maxHeight = parentNode.maxHeight;
                node.minZ = parentNode.minZ;
                node.maxZ = parentNode.maxZ;
                node.generateCullingHelpers();
                break;
            }
            
            parent = parent.parent;
        }

        node.heightReady = true;
    }
};


MapSurfaceTree.prototype.logTileInfo = function(tile, node, cameraPos) {
    if (!tile || !node) {
        return;
    }
    
    var visible = tile.bboxVisible(tile.id, node.bbox, cameraPos, node);
    tile.updateTexelSize();
    
//    console.log("tile: " + JSON.stringify(tile.id) + " visible: " + visible + " texelsize: " +  tile.texelSize);
    console.log('tile: ' + JSON.stringify(tile.id) + ' visible: ' + visible + ' texelsize: ' +  tile.texelSize + ' center: '  + JSON.stringify(node.diskPos) + ' vec: ' + node.diskNormal + 'ang: ' + node.diskAngle + ' dist: ' + node.diskDistance);
};


//loadmode = topdown
MapSurfaceTree.prototype.drawSurface = function(shift) {
    this.counter++;
//    this.surfaceTracer.trace(this.surfaceTree);//this.rootId);

    var tile = this.surfaceTree;
    
    if (!tile.isMetanodeReady(this, 0)) {
        return;
    }
    
    var map = this.map;
    var node = tile.metanode;
    var cameraPos = map.camera.position;

    if (!tile.bboxVisible(tile.id, node.bbox, cameraPos, node)) {
        return;
    }

    tile.updateTexelSize();
    
    var typeFactor = this.freeLayerSurface ? 1 : 1;

    var draw = map.draw;
    var drawTiles = draw.drawTiles;
    var drawBuffer = draw.drawBuffer;
    var processBuffer = draw.processBuffer;
    var newProcessBuffer = draw.processBuffer2;
    var drawBufferIndex = 0;
    var processBufferIndex = 0;
    var newProcessBufferIndex = 0;
    
    processBuffer[0] = tile;
    processBufferIndex = 1;

    /*    
    if (this.mapstats.gpuRenderUsed >= this.map.maxGpuUsed) {
        return false;
    }*/
    
    var texelSizeFit = draw.texelSizeFit;

    var best2 = 0;
    var replay = draw.replay;
    var storeNodes = replay.storeNodes || replay.storeFreeNodes;
    var storeNodesBuffer = replay.nodeBuffer; 
    
    //var more = 0;
    //var more2 = 1;
    
    draw.drawCounter++;
    
    var pocessedNodes = 1;
    var pocessedMetatiles = 1;  
    var usedNodes = 1;
    var usedMetatiles = 1;  
    var drawCounter = draw.drawCounter;


    do {
        var best = 0;
        newProcessBufferIndex = 0;
        
        for (var i = processBufferIndex - 1; i >= 0; i--) {
            tile = processBuffer[i];
            node = tile.metanode;

            if (node) {
                pocessedNodes++;
                if (node.metatile.drawCounter != drawCounter) {
                    node.metatile.drawCounter = drawCounter;
                    pocessedMetatiles++;
                }
            }
            
            //if (this.map.drawIndices) {
              //  this.logTileInfo(tile, node, cameraPos);
            //}

            if (tile.bboxVisible(tile.id, node.bbox, cameraPos, node)) {

                usedNodes++;

                if (tile.texelSize != Number.POSITIVEINFINITY){
                    if (tile.texelSize > best) {
                        best = tile.texelSize;
                    }
                }
                
                if (storeNodes) { //used only for inspector
                    storeNodesBuffer.push(tile);
                }
                
                /*var n = childrenBuffer[j].metanode;
                if ((n.id[0] == 2 && n.id[1] == 3 && n.id[2] == 1)) {
                    n = n;
                }*/
                
                
                if (/*node.hasGeometry() && */tile.texelSize <= texelSizeFit) {
                    
                    drawBuffer[drawBufferIndex] = tile;
                    drawBufferIndex++;
                    
                } else { //go deeper

                    var childrenCount = 0;
                    var readyCount = 0;
                    var childrenBuffer = [];
                    
                    var more3 = 0;
        
                    for (var j = 0; j < 4; j++) {
                        var child = tile.children[j];
                        if (child) {
                            childrenCount++;
                            
                            //if (child.id[0] == 2 && child.id[1] == 3 && child.id[2] == 0) {
                              //  child = child;
                            //}
       
                            if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority
                                
                               /*if (!child.bboxVisible(child.id, child.metanode.bbox, cameraPos, child.metanode)) {
                                    more++;
                                    more3++;
                               } else {
                                    more2++;
                               }*/

                                this.updateNodeHeightExtents(child, child.metanode);
                                child.updateTexelSize();
                                
                                var priority = child.id[0] * typeFactor * child.distance;
                                
                                if (!tile.surface || !child.metanode.hasGeometry()) {

                                    readyCount++;
                                    //child.updateTexelSize();
                                    childrenBuffer.push(child);
                                    
                                } else {

                                    //are draw buffers ready? preventRender=true, preventLoad=false
                                    if (drawTiles.drawSurfaceTile(child, child.metanode, cameraPos, child.texelSize, priority, true, false)) {
                                        readyCount++;
                                        //child.updateTexelSize();
                                        childrenBuffer.push(child);
                                    }
                                    
                                }
                            }
                        }
                    }
                    
                    /*if (childrenCount == more3) {
                        //console.log("more3!!!!");
                        more -= more3;
                    }*/
        
                    if (childrenCount > 0 && childrenCount == readyCount && childrenCount != more3) {
                        //sort childern by distance
    
                        do {
                            var sorted = true;
                            
                            for (var j = 0, lj = childrenBuffer.length - 1; j < lj; j++) {
                                if (childrenBuffer[j].distance > childrenBuffer[j+1].distance) {
                                    var t = childrenBuffer[j];
                                    childrenBuffer[j] = childrenBuffer[j+1];
                                    childrenBuffer[j+1] = t;
                                    sorted = false;
                                } 
                            }
                            
                        } while(!sorted);
    
    
                        //add childern to new process buffer 
                        for (var j = 0, lj = childrenBuffer.length; j < lj; j++) {
                            
                            /*var n = childrenBuffer[j].metanode.divisionNode;
                            if ((n.id[0] == 1 && n.id[1] == 1 && n.id[2] == 0)) {*/
                            newProcessBuffer[newProcessBufferIndex] = childrenBuffer[j];
                            newProcessBufferIndex++;
                            /*}*/
                            
                        }
                    } else {
                        drawBuffer[drawBufferIndex] = tile;
                        drawBufferIndex++;
                    }
                    
                }
            }
        }
        
        var tmp = processBuffer;
        processBuffer = newProcessBuffer;
        newProcessBuffer = tmp;
        processBufferIndex = newProcessBufferIndex;

        //if (tile) {
          //  console.log("texel: "+ (best / 1) + "   " + JSON.stringify(tile.id));
        //}
        
        if (best != 0) {
            best2 = best;
        }

    } while(processBufferIndex > 0);
    
    if (best2 > draw.bestMeshTexelSize) {
        draw.bestMeshTexelSize = best2;
    }

    map.stats.usedNodes = usedNodes;    
    map.stats.processedNodes = pocessedNodes;    
    map.stats.processedMetatiles = pocessedMetatiles;    
    
    //console.log("texel: "+ this.map.bestMeshTexelSize);
    //console.log("more: "+ more + "more2: " + more2);


    if (replay.storeTiles || replay.storeFreeTiles) { //used only in inspectors
        if (!this.map.tileBuffer[0]) {
            this.map.tileBuffer[0] = [];
        }
        
        var tiles = draw.tileBuffer[0];
        for (var i = drawBufferIndex - 1; i >= 0; i--) {
            tiles.push(drawBuffer[i]);
        }
    }

    for (var i = drawBufferIndex - 1; i >= 0; i--) {
        tile = drawBuffer[i];
        //draw tile,  preventRender=false, preventLoad=false
        drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.texelSize, 0, false, false);
    }
};


//loadmode = fitonly
MapSurfaceTree.prototype.drawSurfaceFitOnly = function(shift) {
    this.counter++;
//    this.surfaceTracer.trace(this.surfaceTree);//this.rootId);

    var tile = this.surfaceTree;
    
    if (!tile.isMetanodeReady(this, 0)) {
        return;
    }
    
    var map = this.map;
    var node = tile.metanode;
    var cameraPos = map.camera.position;

    if (!tile.bboxVisible(tile.id, node.bbox, cameraPos, node)) {
        return;
    }

    tile.updateTexelSize();
    
    var typeFactor = this.freeLayerSurface ? 1 : 1;
    
    var draw = map.draw;
    var drawTiles = draw.drawTiles;
    var drawBuffer = draw.drawBuffer;
    var processBuffer = draw.processBuffer;
    var newProcessBuffer = draw.processBuffer2;
    var drawBufferIndex = 0;
    var processBufferIndex = 0;
    var newProcessBufferIndex = 0;
    var checkGpu = true;
    
    processBuffer[0] = tile;
    processBufferIndex = 1;

    var texelSizeFit = draw.texelSizeFit;

    var best2 = 0;
    var replay = map.draw.replay;
    var storeNodes = replay.storeNodes || replay.storeFreeNodes;
    var storeNodesBuffer = replay.nodeBuffer; 

    draw.drawCounter++;
    
    var usedNodes = 1;
    var pocessedNodes = 1;
    var pocessedMetatiles = 1;  
    var drawCounter = map.drawCounter;
    
    do {
        var best = 0;
        newProcessBufferIndex = 0;
        
        for (var i = processBufferIndex - 1; i >= 0; i--) {
            tile = processBuffer[i];
            node = tile.metanode;

            if (node) {
                pocessedNodes++;
                if (node.metatile.drawCounter != drawCounter) {
                    node.metatile.drawCounter = drawCounter;
                    pocessedMetatiles++;
                }
            }

            if (tile.bboxVisible(tile.id, node.bbox, cameraPos, node)) {

                usedNodes++;

                if (storeNodes) { //used only for inspaector
                    storeNodesBuffer.push(tile);
                }

                if (tile.texelSize  != Number.POSITIVEINFINITY){
                    if (tile.texelSize > best) {
                        best = tile.texelSize;
                    }
                }
                
                if (/*node.hasGeometry() && */tile.texelSize <= texelSizeFit) {
                    
                    drawBuffer[drawBufferIndex] = tile;
                    drawBufferIndex++;
                    
                } else { //go deeper

                    var childrenCount = 0;
                    var readyCount = 0;
                    var childrenBuffer = [];
        
                    for (var j = 0; j < 4; j++) {
                        var child = tile.children[j];
                        if (child) {
                            childrenCount++;
       
                            if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority

                                this.updateNodeHeightExtents(child, child.metanode);
                                child.updateTexelSize();
                                
                                var priority = child.id[0] * typeFactor * child.distance; 
                                
                                //are draw buffers ready? preventRender=true, preventLoad=false
                                //if (this.map.drawSurfaceTile(child, child.metanode, cameraPos, child.texelSize, priority, true, false)) {
                                    //readyCount++;
                                    //child.updateTexelSize();
                                childrenBuffer.push(child);
                                //} else {
                                    
                                    //check children
                                    /*
                                    for (var k = 0; k < 4; k++) {
                                        var subchild = child.children[k];
                                        if (subchild) {
                                            childrenCount++;
                       
                                            if (subchild.isMetanodeReady(this, subchild.id[0])) { //lod is used as priority
                                                
                                            }
                                        }
                                    }*/
                                    
                                    
                                //}
                            }
                        }
                    }
        
                    if (childrenCount > 0/* && childrenCount == readyCount*/) {
                        //sort childern by distance
    
                        do {
                            var sorted = true;
                            
                            for (var j = 0, lj = childrenBuffer.length - 1; j < lj; j++) {
                                if (childrenBuffer[j].distance > childrenBuffer[j+1].distance) {
                                    var t = childrenBuffer[j];
                                    childrenBuffer[j] = childrenBuffer[j+1];
                                    childrenBuffer[j+1] = t;
                                    sorted = false;
                                } 
                            }
                            
                        } while(!sorted);
    
                        //add childern to new process buffer 
                        for (var j = 0, lj = childrenBuffer.length; j < lj; j++) {

                            //var n = childrenBuffer[j].metanode.divisionNode;
                            //if ((n.id[0] == 1 && n.id[1] == 1 && n.id[2] == 0)) {
                            newProcessBuffer[newProcessBufferIndex] = childrenBuffer[j];
                            newProcessBufferIndex++;
                            //}
                        }
                    } else {
                        drawBuffer[drawBufferIndex] = tile;
                        drawBufferIndex++;
                    }
                    
                }
            }
        }
        
        var tmp = processBuffer;
        processBuffer = newProcessBuffer;
        newProcessBuffer = tmp;
        processBufferIndex = newProcessBufferIndex;

        if (best != 0) {
            best2 = best;
        }
        
    } while(processBufferIndex > 0);

    map.stats.usedNodes = usedNodes;    
    map.stats.processedNodes = pocessedNodes;    
    map.stats.processedMetatiles = pocessedMetatiles;    

    if (replay.storeTiles || replay.storeFreeTiles) { //used only in inspectors
        if (!draw.tileBuffer[0]) {
            draw.tileBuffer[0] = [];
        }
        
        var tiles = draw.tileBuffer[0];
        for (var i = drawBufferIndex - 1; i >= 0; i--) {
            tiles.push(drawBuffer[i]);
        }
    }

    for (var i = drawBufferIndex - 1; i >= 0; i--) {
        tile = drawBuffer[i];
        //draw tile,  preventRender=false, preventLoad=false
        drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.texelSize, 0, false, false);
    }
};


//loadmode = fit
MapSurfaceTree.prototype.drawSurfaceFit = function(shift) {
    this.counter++;
//    this.surfaceTracer.trace(this.surfaceTree);//this.rootId);

    var tile = this.surfaceTree;
    
    if (!tile.isMetanodeReady(this, 0)) {
        return;
    }
    
    var map = this.map;
    var node = tile.metanode;
    var cameraPos = map.camera.position;

    if (!tile.bboxVisible(tile.id, node.bbox, cameraPos, node)) {
        return;
    }

    tile.updateTexelSize();

    var geodata = tile.surface.geodata;
    var free = tile.surface.free;
    var drawGrid = (!geodata && !free && map.config.mapHeightfiledWhenUnloaded);
    var checkGpu = true;
    
    var lodShift = 4;//this.freeLayerSurface ? 1 : 1;
    var typeFactor = 2000;//this.freeLayerSurface ? 1 : 1;
    
    var draw = map.draw;
    var drawTiles = draw.drawTiles;
    var replay = draw.replay;
    var drawBuffer = draw.drawBuffer;
    var processBuffer = draw.processBuffer;
    var newProcessBuffer = draw.processBuffer2;
    var drawBufferIndex = 0;
    var processBufferIndex = 0;
    var newProcessBufferIndex = 0;
    
    processBuffer[0] = [tile, 0];
    processBufferIndex = 1;

    var texelSizeFit = draw.texelSizeFit;

    var best2 = 0;
    var storeNodes = replay.storeNodes || replay.storeFreeNodes;
    var storeNodesBuffer = replay.nodeBuffer; 

    draw.drawCounter++;
    
    var usedNodes = 1;
    var pocessedNodes = 1;
    var pocessedMetatiles = 1;  
    var drawCounter = draw.drawCounter;
    var maxHiresLodLevels = map.config.mapMaxHiresLodLevels; 
    
    do {
        var best = 0;
        newProcessBufferIndex = 0;

        /*if (this.map.drawIndices) {
            console.log("processed begin==============================================");
        }*/            
       
        for (var i = processBufferIndex - 1; i >= 0; i--) {
            var pack = processBuffer[i];
            tile = pack[0];
            var depth = pack[1];
            
            /*if (this.map.drawIndices) {
                console.log(JSON.stringify(tile.id));
            }*/
            
            if (depth >= maxHiresLodLevels) {
                if (drawGrid) {
                    drawBuffer[drawBufferIndex] = [tile, true]; //draw grid
                    drawBufferIndex++;
                }

                continue;
            }
            /*
            if (tile.id[0] >= 16) { 
                tile = tile;    
            }*/ 

            /*
            if (tile.id[0] == 12 &&
                tile.id[1] == 1107 &&
                tile.id[2] == 688) {
                tile = tile;
            }*/
            
            node = tile.metanode;

            if (node) {
                pocessedNodes++;
                if (node.metatile.drawCounter != drawCounter) {
                    node.metatile.drawCounter = drawCounter;
                    pocessedMetatiles++;
                }
            }


            if (tile.bboxVisible(tile.id, node.bbox, cameraPos, node)) {

                usedNodes++;

                if (tile.texelSize  != Number.POSITIVEINFINITY){
                    if (tile.texelSize > best) {
                        best = tile.texelSize;
                    }
                }

                if (storeNodes) { //used only for inspaector
                    storeNodesBuffer.push(tile);
                }
                
                var lastProcessBufferIndex = newProcessBufferIndex;
                var lastDrawBufferIndex = drawBufferIndex;

                if (node.hasChildren() == false || tile.texelSize <= texelSizeFit) {

                    var priority = ((tile.id[0] + lodShift) * typeFactor) * tile.distance; 
            
                    if (node.hasChildren() && !drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.texelSize, priority, true, (depth > 0), checkGpu)) {

                        depth++; //we dont have tile ready, so we try to draw more detailed tiles
            
                        for (var j = 0; j < 4; j++) {
                            var child = tile.children[j];
                            if (child) {
           
                                if (child.isMetanodeReady(this, child.id[0], true)) { //lod is used as priority

                                    this.updateNodeHeightExtents(child, child.metanode);
                                    child.updateTexelSize();
                                    
                                    var priority = ((child.id[0] + lodShift) * typeFactor) * child.distance; 

                                    /*if (child.id[0] == 18 && 
                                    child.id[1] == 20982 &&
                                    child.id[2] == 50643){
                                        child = child;    
                                    }*/
                                    
                                    //are draw buffers ready? preventRender=true, preventLoad=false
                                    if (drawTiles.drawSurfaceTile(child, child.metanode, cameraPos, child.texelSize, priority, true, (depth > 0), checkGpu)) {
                                        drawBuffer[drawBufferIndex] = [child, false];
                                        drawBufferIndex++;
                                    } else {
                                        newProcessBuffer[newProcessBufferIndex] = [child, depth];
                                        newProcessBufferIndex++;
                                    }
                                } //if (drawGrid) {
                                 //   child.drawGrid(cameraPos);
                                //}
                            }
                        }

                    } else {
                        drawBuffer[drawBufferIndex] = [tile, false];
                        drawBufferIndex++;
                    }
                    
                } else if (depth == 0 && node.hasGeometry() && tile.texelSize <= (texelSizeFit * 2)) {
                    
                    //are all children ready? if not then draw carser lod
                    var childrenCount = 0;
                    var readyCount = 0;
                    var childrenBuffer = [];
        
                    for (var j = 0; j < 4; j++) {
                        var child = tile.children[j];
                        if (child) {
                            childrenCount++;
       
                            if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority

                                this.updateNodeHeightExtents(child, child.metanode);
                                child.updateTexelSize();
                                
                                var priority = ((child.id[0] + lodShift) * typeFactor) * child.distance; 
                               
                                //are draw buffers ready? preventRender=true, preventLoad=false
                                if (drawTiles.drawSurfaceTile(child, child.metanode, cameraPos, child.texelSize, priority, true, true, checkGpu)) {
                                    readyCount++;
                                    childrenBuffer.push(child);
                                }
                            } //if (drawGrid) {
                             //   child.drawGrid(cameraPos);
                            //}
                        }
                    }
        
                    if (childrenCount > 0 && childrenCount == readyCount) {
                        //sort childern by distance
    
                        do {
                            var sorted = true;
                            
                            for (var j = 0, lj = childrenBuffer.length - 1; j < lj; j++) {
                                if (childrenBuffer[j].distance > childrenBuffer[j+1].distance) {
                                    var t = childrenBuffer[j];
                                    childrenBuffer[j] = childrenBuffer[j+1];
                                    childrenBuffer[j+1] = t;
                                    sorted = false;
                                } 
                            }
                            
                        } while(!sorted);
    
                        //add childern to new process buffer 
                        for (var j = 0, lj = childrenBuffer.length; j < lj; j++) {
                            newProcessBuffer[newProcessBufferIndex] = [childrenBuffer[j], depth];
                            newProcessBufferIndex++;
                        }
                    } else {
                        
                        //can i use coarser lod
                        //if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority

                        var priority = ((tile.id[0] + lodShift) * typeFactor) * tile.distance; 

                        if (drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.texelSize, priority, true, true, checkGpu)) {
                            drawBuffer[drawBufferIndex] = [tile, false];
                            drawBufferIndex++;

                            for (var j = 0; j < 4; j++) {
                                var child = tile.children[j];
                                if (child) {
                                    if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority
                                        priority = ((child.id[0] + lodShift) * typeFactor) * child.distance; 
                                        drawTiles.drawSurfaceTile(child, child.metanode, cameraPos, child.texelSize, priority, true, false, checkGpu);
                                    }
                                }
                            }

                        } else {

                            //add childern to new process buffer 
                            /*
                            for (var j = 0, lj = childrenBuffer.length; j < lj; j++) {
                                newProcessBuffer[newProcessBufferIndex] = [childrenBuffer[j], depth];
                                newProcessBufferIndex++;
                            }*/

                            for (var j = 0; j < 4; j++) {
                                var child = tile.children[j];
                                if (child) {
                                    if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority
                                        this.updateNodeHeightExtents(child, child.metanode);
                                        child.updateTexelSize();

                                        newProcessBuffer[newProcessBufferIndex] = [child, depth];
                                        newProcessBufferIndex++;
                                    }
                                }
                            }

                        } 
                    }

                }  else  {  //go deeper
                    
                    
                    for (var j = 0; j < 4; j++) {
                        var child = tile.children[j];
                        if (child) {

                            /*if (child.id[0] == 18 && 
                            child.id[1] == 20982 &&
                            child.id[2] == 50643){
                                child = child;    
                            }*/

                            if (child.isMetanodeReady(this, child.id[0])) { //lod is used as priority
                                this.updateNodeHeightExtents(child, child.metanode);
                                child.updateTexelSize();
                                
                                //var priority = child.id[0] * typeFactor * child.distance; 

                                newProcessBuffer[newProcessBufferIndex] = [child, depth];
                                newProcessBufferIndex++;
                            } //if (drawGrid) {
                            //    child.drawGrid(cameraPos);
                            //}
                        }
                    }                    
                }
            }


            if (drawGrid && lastProcessBufferIndex == newProcessBufferIndex && lastDrawBufferIndex == drawBufferIndex) {
                drawBuffer[drawBufferIndex] = [tile, true]; //draw grid
                drawBufferIndex++;
            }

        }

        /*if (this.map.drawIndices) {
            console.log("processed end==============================================");
        }*/
        
        var tmp = processBuffer;
        processBuffer = newProcessBuffer;
        newProcessBuffer = tmp;
        processBufferIndex = newProcessBufferIndex;

        if (best != 0) {
            best2 = best;
        }
        
    } while(processBufferIndex > 0);

    map.stats.usedNodes = usedNodes;    
    map.stats.processedNodes = pocessedNodes;    
    map.stats.processedMetatiles = pocessedMetatiles;    

    if (replay.storeTiles || replay.storeFreeTiles) { //used only in inspectors
        if (!draw.tileBuffer[0]) {
            draw.tileBuffer[0] = [];
        }
        
        var tiles = draw.tileBuffer[0];
        for (var i = drawBufferIndex - 1; i >= 0; i--) {
            tiles.push(drawBuffer[i]);
        }
    }

    for (var i = drawBufferIndex - 1; i >= 0; i--) {
        var item = drawBuffer[i];
        tile = drawBuffer[i];
/*
            if (tile.id[0] == 10 && 
                tile.id[1] == 304 &&
                tile.id[2] == 193){
                tile = tile;    
            }
*/            
        //draw tile,  preventRender=false, preventLoad=false
        
        var tile = item[0];
        if (drawGrid && item[1]) {
            tile.drawGrid(cameraPos); 
        } else if (!item[1]) {
            drawTiles.drawSurfaceTile(tile, tile.metanode, cameraPos, tile.texelSize, 0, false, false, checkGpu);
        }
    }
};


MapSurfaceTree.prototype.traceHeight = function(tile, params, nodeOnly) {
    if (!tile) {
        return;
    }

    this.params = params;

    var heightFunction = nodeOnly ? this.traceHeightTileByNodeOnly : this.traceHeightTileByMap;  

    if (tile.id[0] == 1) { //update root, get height in VTS2015 starts in division node which has lod 1
        this.traceHeightTile(tile.parent, 0, true);
        if (!tile.parent.metanode) {
            return;
        }
    }
    
    this.traceHeightTile(tile, 0, false, heightFunction);
};


MapSurfaceTree.prototype.traceHeightTile = function(tile, priority, nodeReadyOnly, heightFunction) {
    if (tile == null) {
        return;
    }

    if (!tile.isMetanodeReady(this, 0) || nodeReadyOnly) {
        return;
    }

    tile.metanode.metatile.used();

    if (tile.lastSurface && tile.lastSurface == tile.surface) {
        tile.lastSurface = null;
        tile.restoreLastState();
        //return;
    }
    
    //process tile e.g. draw or get height
    var res = heightFunction(tile, this.params, priority); 
    
    if (res) { //we need to go deeper
        var childIndex = this.traceHeightChild(tile, this.params);
        this.traceHeightTile(tile.children[childIndex], 0, false, heightFunction);
    }
};


MapSurfaceTree.prototype.traceHeightChild = function(tile, params, res) {
    var coords = params.coords;
    var extents = params.extents;
    var center = [(extents.ll[0] + extents.ur[0]) *0.5,
        (extents.ll[1] + extents.ur[1]) *0.5];

    //ul,ur,ll,lr
    //deside in which quadrant are provided coodinates
    var right = (coords[0] >= center[0]);
    var bottom = (coords[1] >= center[1]);

    if (right) {
        extents.ll[0] = center[0];
        if (bottom) {
            extents.ll[1] = center[1];
        } else {
            extents.ur[1] = center[1];
        }
    } else {
        extents.ur[0] = center[0];
        if (bottom) {
            extents.ll[1] = center[1];
        } else {
            extents.ur[1] = center[1];
        }
    }

    /*
    if (extents.ll[0] > extents.ur[0]) {
        right = !right;
    }

    if (extents.ll[1] < extents.ur[1]) {
        bottom = !bottom;
    }*/

    //trace only resulting quadrant 
    if (right) {
        return bottom ? 1 : 3;
    } else {
        return bottom ? 0 : 2;
    }
};


MapSurfaceTree.prototype.traceHeightTileByMap = function(tile, params, priority) {
    if (!tile || (tile.id[0] > params.desiredLod && params.heightMap)) {
        return false;
    }

    var node = tile.metanode;

    if (!node) {
        return false;
    }

    if (node.hasNavtile()) {
        if (!tile.heightMap) {
            //if (!preventLoad) {
                //if (!tile.surface || tile.surface.virtual) {
            if (!tile.surface || !tile.resourceSurface) { //surface.virtual) {
                return false; //is it best way how to do it?
            }
                
            if (!tile.resourceSurface.getNavUrl) { //virtual surface is as resource surface. Is it bug??!!
                return false; //is it best way how to do it?
            }
                
            var path = tile.resourceSurface.getNavUrl(tile.id);
            tile.heightMap = tile.resources.getTexture(path, true);
            //}
        } else {
            if (tile.heightMap.isReady() == true) {
                params.parent = {
                    metanode : params.metanode,
                    heightMap : params.heightMap,
                    heightMapExtents : params.heightMapExtents
                };
                
                params.metanode =  node;
                params.heightMap = tile.heightMap;
                params.heightMapExtents = {
                    ll : params.extents.ll.slice(),
                    ur : params.extents.ur.slice()
                };
                return (tile.id[0] != params.desiredLod);
            }
        }
    } else {
        if (!params.heightMap) {
            params.metanode =  node;
        }
        
        return true;
    }

    return false;
};


MapSurfaceTree.prototype.traceHeightTileByNodeOnly = function(tile, params, priority) {
    if (!tile || tile.id[0] > params.desiredLod) {
        return false;
    }

    var node = tile.metanode;

    if (!node) {
        return false;
    }

    params.parent = {
        metanode : params.metanode
    };

    params.metanode =  node;
    return (tile.id[0] != params.desiredLod);
};


MapSurfaceTree.prototype.getNodeById = function(id) {
    var tile = this.surfaceTree;
    var createNonexisted = true;

    if (tile == null) {
        return;
    }

    for (var lod = id[0]; lod > 0; lod--) {
        var mask = 1 << (lod-1);
        var index = 0;

        if ((id[1] & mask) != 0) {
            index += 1;
        }

        if ((id[2] & mask) != 0) {
            index += 2;
        }
        
        if (!tile.children[index]) {

            if (!tile.isMetanodeReady(this, 0)) {
                return null;
            }

            if (!tile.metanode.hasChild(index)) {
                return null;
            }

            tile.addChild(index);
        } 

        tile = tile.children[index];
    }

    if (!tile) {
        return;
    }

    if (!tile.isMetanodeReady(this, 0)) {
        return;
    }
	
    var node = tile.metanode;
    tile.metanode.metatile.used();

    return node;

	/*
    if (tile.lastSurface && tile.lastSurface == tile.surface) {
        tile.lastSurface = null;
        tile.restoreLastState();
        //return;
    }*/
};


export default MapSurfaceTree;
