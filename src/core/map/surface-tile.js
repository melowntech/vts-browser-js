
import {vec3 as vec3_} from '../utils/matrix';
import GpuTexture_ from '../renderer/gpu/texture';
import {math as math_} from '../utils/math';

//get rid of compiler mess
var vec3 = vec3_;
var GpuTexture = GpuTexture_;
var math = math_;

 var tileBorderTable = [
    [-1, -1, 0, 0],
    [0, -1, 0.5, 1], //
    [1, -1, 1, 0],

    [-1, 0, 0, 0.5],
    [0, 0, 0.5, 0.5],
    [1, 0, 1, 0.5],

    [-1, 1, 0, 1],
    [0, 1, 0.5, 0], //
    [1, 1, 1, 1]
];

var tileCornerTable = [
    [0,1,3],
    [2,1,5],
    [6,3,7],
    [8,7,5]
];


var MapSurfaceTile = function(map, parent, id) {
    this.map = map;
    this.id = id;
    this.parent = parent;
    this.viewCounter = map.viewCounter;
    this.drawCounter = 0;
    this.childrenReadyCount = 0;
    this.renderReady = false;
    this.geodataCounter = 0;
    this.gridRenderCounter = 0; //draw grid only once
    this.texelSize = 1;
    this.texelSize2 = 1;
    this.distance = 1;
    this.tiltAngle = 1;
    this.seCounter = 0;

    this.metanode = null;  //[metanode, cacheItem]
    this.lastMetanode = null;
    this.boundmetaresources = null; //link to bound layers metatile storage

    this.surface = null; //surface or glue
    this.surfaceMesh = null;
    this.surfaceGeodata = null;     //probably only used in free layers
    this.surfaceGeodataView = null; //probably only used in free layers
    this.surfaceTextures = [];
    this.resourceSurface = null; //surface directing to resources

    this.virtual = false;
    this.virtualReady = false;
    this.virtualSurfaces = [];
    
    this.resetDrawCommands = false;
    this.drawCommands = [[], [], []];

    this.bounds = {};
    this.boundLayers = {};
    this.boundTextures = {};
    this.updateBounds = true;

    this.hmap = null;
    this.heightMap = null;
    this.drawCommands = [[], [], []];
    this.imageryCredits = {};
    this.glueImageryCredits = {};
    this.mapdataCredits = {};
    
    this.resources = this.map.resourcesTree.findNode(id, true);   // link to resource tree
    this.metaresources = this.map.resourcesTree.findAgregatedNode(id, 5, true); //link to meta resource tree
    this.boundresources = this.map.resourcesTree.findAgregatedNode(id, 8, true); //link to meta resource tree
    
    this.children = [null, null, null, null];
};


MapSurfaceTile.prototype.kill = function() {
    //kill children
    for (var i = 0; i < 4; i++) {
        if (this.children[i] != null) {
            this.children[i].kill();
        }
    }
/*
    if (this.surfaceMesh != null) {
        this.surfaceMesh.kill();
    }

    for (var key in this.surfaceTextures) {
        if (this.surfaceTextures[key] != null) {
            this.surfaceTextures[key].kill();
        }
    }

    if (this.surfaceGeodata != null) {
        this.surfaceGeodata.kill();
    }

    if (this.surfaceGeodataView != null) {
        this.surfaceGeodataView.kill();
    }

    if (this.heightMap != null) {
        this.heightMap.kill();
    }

    for (var key in this.boundTextures) {
        if (this.boundTextures[key] != null) {
            this.boundTextures[key].kill();
        }
    }
*/
    this.resources = null;
    this.metaresources = null;
    this.metanode = null;

    this.surface = null;
    this.surfaceMesh = null;
    this.surfaceTextures = [];
    this.surfaceGeodata = null;
    this.surfaceGeodataView = null;
    this.resourceSurface = null;

    this.bounds = {};
    this.boundLayers = {};
    this.boundTextures = {};
    this.updateBounds = true;

    this.virtual = false;
    this.virtualReady = false;
    this.virtualSurfaces = [];

    this.renderReady = false;
    this.lastSurface = null;
    this.lastState = null;
    this.lastRenderState = null;
        
    this.hmap = null;
    this.heightMap = null;
    this.drawCommands = [[], [], []];
    this.imageryCredits = {};
    this.glueImageryCredits = {};
    this.mapdataCredits = {};

    this.verifyChildren = false;
    this.children = [null, null, null, null];

    var parent = this.parent;
    this.parent = null;

    if (parent != null) {
        parent.removeChild(this);
    }
};


MapSurfaceTile.prototype.validate = function() {
    //is tile empty?
    if (this.metaresources == null || !this.metaresources.getMetatile(this.surface, null, this)) {
        //this.kill();
    }
};


MapSurfaceTile.prototype.viewSwitched = function() {
    //store last state for view switching
    this.lastSurface = this.surface;
    this.lastState = {
        surfaceMesh : this.surfaceMesh,
        surfaceTextures : this.surfaceTextures,
        boundTextures : this.boundTextures,
        surfaceGeodata : this.surfaceGeodata,
        surfaceGeodataView : this.surfaceGeodataView,
        resourceSurface : this.resourceSurface 
    };    

    if (this.drawCommands[0].length > 0) {  // check only visible chanel
        this.lastRenderState = {
            drawCommands : this.drawCommands,
            imageryCredits : this.imageryCredits,
            mapdataCredits : this.mapdataCredits
        };
    } else {
        this.lastRenderState = null;
    }
    
    //zero surface related data    
    this.verifyChildren = true;
    this.renderReady = false;
    this.lastMetanode = this.metanode;
    this.metanode = null; //quick hack for switching virtual surfaeces //keep old value for smart switching

    if (!this.map.config.mapSoftViewSwitch) {

        if (this.metanode) {
            this.metanode.border = null;
            this.metanode.border2 = null;
            this.metanode.border3 = null;
            this.metanode.borderNodes = null;
            this.metanode.borderReady = null;
        }

        this.lastState = null;
        this.lastRenderState = null;
        this.lastMetanode = null;
        this.metanode = null;
        this.gridPoints = null;
    }

    //this.lastMetanode = null;
    //this.metanode = null;

    for (var key in this.bounds) {
        this.bounds[key] = {
            sequence : [],
            alpha : [],
            transparent : false,
            viewCoutner : 0
        };
    }

    this.boundLayers = {};
    this.boundTextures = {};
    this.updateBounds = true;
    this.transparentBounds = false;

    this.surface = null;
    this.surfaceMesh = null;
    this.surfaceTextures = [];
    this.surfaceGeodata = null;
    this.surfaceGeodataView = null;
    this.resourceSurface = null;
    
    this.virtual = false;
    this.virtualReady = false;
    this.virtualSurfaces = [];
    this.virtualSurfacesUncomplete = false;
    
    this.drawCommands = [[], [], []];
    this.imageryCredits = {};
    this.glueImageryCredits = {};
    this.mapdataCredits = {};
};


MapSurfaceTile.prototype.restoreLastState = function() {
    if (!this.lastState) {
        return;
    }
    this.surfaceMesh = this.lastState.surfaceMesh;
    this.surfaceTextures = this.lastState.surfaceTextures; 
    this.boundTextures = this.lastState.boundTextures;
    this.surfaceGeodata = this.lastState.surfaceGeodata;
    this.surfaceGeodataView = this.lastState.surfaceGeodataView;
    this.resourceSurface = this.lastState.resourceSurface; 
    this.lastSurface = null;
    this.lastState = null;
    this.lastResourceSurface = null;
};


MapSurfaceTile.prototype.addChild = function(index) {
    if (this.children[index]) {
        return;
    }
    
    var id = this.id;
    var childId = [id[0] + 1, id[1] << 1, id[2] << 1];

    switch (index) {
    case 1: childId[1]++; break;
    case 2: childId[2]++; break;
    case 3: childId[1]++; childId[2]++; break;
    }

    this.children[index] = new MapSurfaceTile(this.map, this, childId);
};


MapSurfaceTile.prototype.removeChildByIndex = function(index) {
    if (this.children[index] != null) {
        this.children[index].kill();
        this.children[index] = null;
    }
    
    //remove resrource node?
};


MapSurfaceTile.prototype.removeChild = function(tile) {
    for (var i = 0; i < 4; i++) {
        if (this.children[i] == tile) {
            this.children[i].kill();
            this.children[i] = null;
        }
    }
};


MapSurfaceTile.prototype.isMetanodeReady = function(tree, priority, preventLoad) {

    //has map view changed?
    if (this.map.viewCounter != this.viewCoutner) {
        this.viewSwitched();
        this.viewCoutner = this.map.viewCounter;
        this.map.markDirty(); 
    }
        
    if (!preventLoad) {
   
        //provide surface for tile
        if (this.virtualSurfacesUncomplete || (this.surface == null && this.virtualSurfaces.length == 0) ) { //|| this.virtualSurfacesUncomplete) {
            this.checkSurface(tree, priority);
        }
   
        //provide metanode for tile
        if (this.metanode == null || this.lastMetanode) {
            
            if (!this.virtualSurfacesUncomplete) {
                var ret = this.checkMetanode(tree, priority);
                
                if (!ret && !(this.metanode != null && this.lastMetanode)) { //metanode is not ready yet
                    return false;
                }
            }
            
            /*if (this.lastMetanode) {
                processFlag2 = true;
            }*/
        }
        
    }

    if (this.metanode == null) { // || processFlag3) { //only for wrong data
        return false;
    }

    this.metanode.metatile.used();

    if (this.lastSurface && this.lastSurface == this.surface) {
        this.lastSurface = null;
        this.restoreLastState();
        //return;
    }

    if (this.surface) {
        if (this.surface.virtual) {
            this.resourceSurface = this.surface.getSurface(this.metanode.sourceReference);
            if (!this.resourceSurface) {
                this.resourceSurface = this.surface;
            }
        } else {
            this.resourceSurface = this.surface;
        }
    }

    if (this.seCounter != this.map.renderer.seCounter) {
        var renderer = this.map.renderer;
        this.seCounter = renderer.seCounter;
        var node = this.metanode;

        if (renderer.useSuperElevation) {
            node.minZ = renderer.getSuperElevatedHeight(node.minZ2);
            node.maxZ = renderer.getSuperElevatedHeight(node.maxZ2);
        } else {
            node.minZ = node.minZ2;
            node.maxZ = node.maxZ2;
        }

        if (renderer.seCounter > 0) {
            this.gridPoints = null;
            node.border = null;
            node.border2 = null;
            node.border3 = null;
            node.borderReady = false;
     
            node.generateCullingHelpers();
        }
    }

    return true;
};


MapSurfaceTile.prototype.checkSurface = function(tree, priority) {
    this.surface = null;
    this.virtual = false;
    this.virtualReady = false;
    this.virtualSurfaces = [];
    this.virtualSurfacesUncomplete = false;
    
    if (tree.freeLayerSurface) {  //free layer has only one surface
        this.surface = tree.freeLayerSurface;
        return; 
    }

    var sequence = tree.surfaceSequence;

    //multiple surfaces
    //build virtual surfaces array
    //find surfaces with content
    for (var i = 0, li = sequence.length; i < li; i++) {
        var surface = sequence[i][0];
        var alien = sequence[i][1];

        var res = surface.hasTile2(this.id);
        if (res[0]) {
            
            //check if tile exist
            if (this.id[0] > 0) { //surface.lodRange[0]) {
                // removed for debug !!!!!
                // ????????
                var parent = this.parent;
                if (parent) { 
                    
                    if (parent.virtualSurfacesUncomplete) {
                        this.virtualSurfacesUncomplete = true;
                        this.virtualSurfaces = [];
                        return;
                    }
                    
                    var metatile = parent.metaresources.getMetatile(surface, null, this);
                    if (metatile) {
                        
                        if (!metatile.isReady(priority)) {
                            this.virtualSurfacesUncomplete = true;
                            continue;
                        }
                        
                        var node = metatile.getNode(parent.id);
                        if (node) {
                            if (!node.hasChildById(this.id)) {
                                continue;
                            }
                        } else {
                            continue;
                        }
                    } else {
                        continue;
                    }
                }
            }
    
            //store surface
            this.virtualSurfaces.push([surface, alien]);        
        }
    }

    if (this.virtualSurfaces.length > 1) {
        this.virtual = true;
    } else {
        this.surface = (this.virtualSurfaces[0]) ? this.virtualSurfaces[0][0] : null;
    }
};


MapSurfaceTile.prototype.checkMetanode = function(tree, priority) {
    if (this.virtual) {
        if (this.isVirtualMetanodeReady(tree, priority)) {
            this.metanode = this.createVirtualMetanode(tree, priority);
            this.lastMetanode = null;
            this.map.markDirty();
        } else {
            return false;
        }
    }

    var surface = this.surface;

    if (surface == null) {
        return false;
    }

    var metatile = this.metaresources.getMetatile(surface, true, this);

    if (metatile.isReady(priority)) {

        if (!this.virtual) {
            this.metanode = metatile.getNode(this.id);
            this.lastMetanode = null;
            this.map.markDirty(); 
        }

        if (this.metanode != null) {
            this.metanode.tile = this; //used only for validate
            this.lastMetanode = null;
            this.map.markDirty(); 

            for (var i = 0; i < 4; i++) {
                if (this.metanode.hasChild(i)) {
                    this.addChild(i);
                } else {
                    this.removeChildByIndex(i);
                }
            }
        }

    } else {
        return false;
    }
    
    return true;
};


MapSurfaceTile.prototype.isVirtualMetanodeReady = function(tree, priority) {
    var surfaces = this.virtualSurfaces;
    var readyCount = 0;

    for (var i = 0, li = surfaces.length; i < li; i++) {
        var surface = surfaces[i][0];
        var metatile = this.metaresources.getMetatile(surface, true, this);

        if (metatile.isReady(priority)) {
            readyCount++;
        }
    }
    
    if (readyCount == li) {
        return true;        
    } else {
        return false;
    }
};


MapSurfaceTile.prototype.createVirtualMetanode = function(tree, priority) {
    var surfaces = this.virtualSurfaces;
    var node = null, i, li, surface, metatile, metanode;

    //get top most existing surface
    for (i = 0, li = surfaces.length; i < li; i++) {
        surface = surfaces[i][0];
        var alien = surfaces[i][1];
        metatile = this.metaresources.getMetatile(surface, null, this);

        if (metatile.isReady(priority)) {
            metanode = metatile.getNode(this.id);

            if (metanode != null) {
                if (alien != metanode.alien) {
                    continue;
                }

                //does metanode have surface reference?
                //internalTextureCount is reference to surface
                if (!alien && surface.glue && !metanode.hasGeometry() &&
                    metanode.internalTextureCount > 0) {
                    
                    var desiredSurfaceIndex = metanode.internalTextureCount - 1;
                    desiredSurfaceIndex = this.map.getSurface(surface.id[desiredSurfaceIndex]).viewSurfaceIndex;
                    
                    var jump = false; 
                        
                    for (var j = i; j < li; j++) {
                        if (surfaces[j].viewSurfaceIndex <= desiredSurfaceIndex) {
                            jump = (j > i);
                            i = j - 1;
                            break;
                        }
                    }
                    
                    if (jump) {
                        continue;
                    }                         
                }
                
                if (metanode.hasGeometry()) {
                    node = metanode.clone();
                    this.surface = surface;
                    break;
                }
            }
        }
    }

    //extend bbox, credits and children flags by other surfaces
    for (i = 0, li = surfaces.length; i < li; i++) {
        surface = surfaces[i][0];
        metatile = this.metaresources.getMetatile(surface, null, this);

        if (metatile.isReady(priority)) {
            metanode = metatile.getNode(this.id);

            if (metanode != null) {
                //does metanode have surface reference?
                //internalTextureCount is reference to surface
                /*
                if (surface.glue && !metanode.hasGeometry() &&
                    metanode.internalTextureCount > 0) {
                    i = this.map.surfaceSequenceIndices[metanode.internalTextureCount - 1] - 1;
                    continue;
                }*/

                if (!node) { //just in case all surfaces are without geometry
                    node = metanode.clone();
                    this.surface = surface;
                } else {
                    node.flags |= metanode.flags & ((15)<<4); 

                    /*
                    for (var j = 0, lj = metanode.credits.length; j <lj; j++) {
                        if (node.credits.indexOf(metanode.credits[j]) == -1) {
                            node.credits.push(metanode.credits[j]);
                        } 
                    }*/
                   
                    if (metatile.useVersion < 4) {
                        // removed for debug !!!!!
                        node.bbox.min[0] = Math.min(node.bbox.min[0], metanode.bbox.min[0]); 
                        node.bbox.min[1] = Math.min(node.bbox.min[1], metanode.bbox.min[1]); 
                        node.bbox.min[2] = Math.min(node.bbox.min[2], metanode.bbox.min[2]); 
                        node.bbox.max[0] = Math.max(node.bbox.max[0], metanode.bbox.max[0]); 
                        node.bbox.max[1] = Math.max(node.bbox.max[1], metanode.bbox.max[1]); 
                        node.bbox.max[2] = Math.max(node.bbox.max[2], metanode.bbox.max[2]);
                    }
                }
            }
        }
    }
    
    if (node) {
        node.generateCullingHelpers(true);
    }
    
    return node;
};


MapSurfaceTile.prototype.bboxVisible = function(id, bbox, cameraPos, node) {
    var map = this.map;
    var camera = map.camera;
    if (id[0] < map.measure.minDivisionNodeDepth) {
        return true;
    }
    
    var skipGeoTest = map.config.mapDisableCulling;
    if (!skipGeoTest && map.isGeocent) {
        if (node) {
            //if (true) {  //version with perspektive
            var p2 = node.diskPos;
            var p1 = camera.position;
            var rayVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
            var distance = vec3.normalize4(rayVec) * camera.distanceFactor;
                //vec3.normalize(camVec);
                
            var a = vec3.dot(rayVec, node.diskNormal);
            //} else { //version without perspektive
            //    var a = vec3.dot(camera.vector, node.diskNormal);
            //}
            this.tiltAngle = a;
            
            if (distance > 150000 && a > node.diskAngle) {
                return false;
            }
        }
    }

    if (node.metatile.useVersion >= 4) {
        return camera.camera.pointsVisible(node.bbox2, cameraPos);
    } else {
        if (!(map.isGeocent && (map.config.mapPreciseBBoxTest)) || id[0] < 4) {
            return camera.camera.bboxVisible(bbox, cameraPos);
        } else {
            return camera.camera.pointsVisible(node.bbox2, cameraPos);
        }
    }
};

MapSurfaceTile.prototype.insideCone = function(coneVec, angle, node) {

    if (this.map.isGeocent) { // && node.diskPos && node.diskNormal) {
        var a = Math.acos(vec3.dot(coneVec, node.diskNormal));

        return (a < angle + node.diskAngle2A);
    }

    return false;
};


MapSurfaceTile.prototype.getPixelSize = function(bbox, screenPixelSize, cameraPos, worldPos, returnDistance) {
    var min = bbox.min;
    var max = bbox.max;
    var tilePos1x = min[0] - cameraPos[0];
    var tilePos1y = min[1] - cameraPos[1];
    var tilePos2x = max[0] - cameraPos[0];
    var tilePos2y = min[1] - cameraPos[1];
    var tilePos3x = max[0] - cameraPos[0];
    var tilePos3y = max[1] - cameraPos[1];
    var tilePos4x = min[0] - cameraPos[0];
    var tilePos4y = max[1] - cameraPos[1];
    var h1 = min[2] - cameraPos[2];
    var h2 = max[2] - cameraPos[2];
    
    //camera inside bbox
    if (cameraPos[0] > min[0] && cameraPos[0] < max[0] &&
        cameraPos[1] > min[1] && cameraPos[1] < max[1] &&
        cameraPos[2] > min[2] && cameraPos[2] < max[2]) {

        if (returnDistance) {
            return [Number.POSITIVE_INFINITY, 0.1];
        }
    
        return Number.POSITIVE_INFINITY;
    }

    var factor = 0;
    var camera = this.map.camera.camera;

    //find bbox sector
    if (0 < tilePos1y) { //top row - zero means camera position in y
        if (0 < tilePos1x) { // left top corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos1x, tilePos1y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos1x, tilePos1y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos1x, tilePos1y, (h1 + h2)*0.5], returnDistance);
            }
        } else if (0 > tilePos2x) { // right top corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos2x, tilePos2y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos2x, tilePos2y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos2x, tilePos2y, (h1 + h2)*0.5], returnDistance);
            }
        } else { //top side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, tilePos2y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, tilePos2y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, tilePos2y, (h1 + h2)*0.5], returnDistance);
            }
        }
    } else if (0 > tilePos4y) { //bottom row
        if (0 < tilePos4x) { // left bottom corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos4x, tilePos4y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos4x, tilePos4y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos4x, tilePos4y, (h1 + h2)*0.5], returnDistance);
            }
        } else if (0 > tilePos3x) { // right bottom corner
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos3x, tilePos3y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos3x, tilePos3y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos3x, tilePos3y, (h1 + h2)*0.5], returnDistance);
            }
        } else { //bottom side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([(tilePos4x + tilePos3x)*0.5, tilePos3y, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([(tilePos4x + tilePos3x)*0.5, tilePos3y, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([(tilePos4x + tilePos3x)*0.5, tilePos3y, (h1 + h2)*0.5], returnDistance);
            }
        }
    } else { //middle row
        if (0 < tilePos4x) { // left side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos1x, (tilePos2y + tilePos3y)*0.5, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos1x, (tilePos2y + tilePos3y)*0.5, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos1x, (tilePos2y + tilePos3y)*0.5, (h1 + h2)*0.5], returnDistance);
            }
        } else if (0 > tilePos3x) { // right side
            if (0 > h2) { // hi
                factor = camera.scaleFactor([tilePos2x, (tilePos2y + tilePos3y)*0.5, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([tilePos2x, (tilePos2y + tilePos3y)*0.5, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([tilePos2x, (tilePos2y + tilePos3y)*0.5, (h1 + h2)*0.5], returnDistance);
            }
        } else { //center
            if (0 > h2) { // hi
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, (tilePos2y + tilePos3y)*0.5, h2], returnDistance);
            } else if (0 < h1) { // low
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, (tilePos2y + tilePos3y)*0.5, h1], returnDistance);
            } else { // middle
                factor = camera.scaleFactor([(tilePos1x + tilePos2x)*0.5, (tilePos2y + tilePos3y)*0.5, (h1 + h2)*0.5], returnDistance);
            }
        }
    }

    //console.log("new: " + (factor * screenPixelSize) + " old:" + this.tilePixelSize2(node) );

    if (returnDistance) {
        return [(factor[0] * screenPixelSize), factor[1]];
    }

    return (factor * screenPixelSize);
};


MapSurfaceTile.prototype.getPixelSize3Old = function(node, screenPixelSize, factor) {
    var camera = this.map.camera;
    var d = (camera.geocentDistance*factor) - node.diskDistance;
    if (d < 0) {
        d = -d;
        //return [Number.POSITIVE_INFINITY, 0.1];
    } 

    var a = vec3.dot(camera.geocentNormal, node.diskNormal);
    
    if (a < node.diskAngle2) {
        var a2 = Math.acos(a); 
        var a3 = Math.acos(node.diskAngle2);
        a2 = a2 - a3; 

        var l1 = Math.tan(a2) * node.diskDistance;
        d = Math.sqrt(l1*l1 + d*d);
    }

    factor = camera.camera.scaleFactor2(d);
    return [factor * screenPixelSize, d];
};


MapSurfaceTile.prototype.getPixelSize3 = function(node, screenPixelSize) {
    //if (this.map.drawIndices) {
      //  return this.getPixelSize3Old(node, screenPixelSize, factor);
    //}
    var camera = this.map.camera;
    var cameraDistance = camera.geocentDistance;// * factor;

    var a = vec3.dot(camera.geocentNormal, node.diskNormal); //get angle between tile normal and cameraGeocentNormal
    var d = cameraDistance - (node.diskDistance + (node.maxZ - node.minZ)), d2; //vertical distance from top bbox level

    if (a < node.diskAngle2) { //is camera inside tile conus?
        
        //get horizontal distance
        var a2 = Math.acos(a); 
        var a3 = node.diskAngle2A;
        a2 = a2 - a3; 
        var l1 = Math.tan(a2) * node.diskDistance;// * factor;

        if (d < 0) { //is camera is belown top bbox level?
            d2 = cameraDistance - node.diskDistance;
            if (d2 < 0) { //is camera is belown bottom bbox level?
                d = -d2;
                d = Math.sqrt(l1*l1 + d*d);
            } else { //is camera inside bbox
                d = l1;
            }
        } else {
            d = Math.sqrt(l1*l1 + d*d);
        }

    } else {
        if (d < 0) { //is camera is belown top bbox level?
            d2 = cameraDistance - node.diskDistance;
            if (d2 < 0) { //is camera is belown bottom bbox level?
                d = -d2;
            } else { //is camera inside bbox
                return [Number.POSITIVE_INFINITY, 0.1];
            }
        } 
    }

    return [camera.camera.scaleFactor2(d) * screenPixelSize, d];
};

/*

MapSurfaceTile.prototype.getPixelSize22 = function(bbox, screenPixelSize, cameraPos, worldPos, returnDistance) {
    var min = bbox.min;
    var max = bbox.max;
    var p1 = bbox.center();
    bbox.updateMaxSize();
    var d = bbox.maxSize * 0.5; 
    
    var dd = [cameraPos[0]-p1[0],
               cameraPos[1]-p1[1],
               cameraPos[2]-p1[2]]; 

    var d2 = vec3.length(dd) - (bbox.maxSize * 0.5);

    var factor = this.camera.scaleFactor2(d2);

    if (returnDistance) {
        return [(factor[0] * screenPixelSize), factor[1]];
    }

    return (factor * screenPixelSize);
};
*/

MapSurfaceTile.prototype.updateTexelSize = function() {
    var pixelSize, factor, v, p;
    var map = this.map;
    var draw = map.draw;
    var camera = map.camera;
    var texelSizeFit = draw.texelSizeFit;
    var node = this.metanode;
    var cameraPos = map.camera.position;
    var preciseDistance = (map.isGeocent && (map.config.mapPreciseDistanceTest || node.metatile.useVersion >= 4));  

    if (node.hasGeometry()) {
        var screenPixelSize = Number.POSITIVE_INFINITY;

        if (node.usedTexelSize()) {
            screenPixelSize = draw.ndcToScreenPixel * node.pixelSize;
        } else if (node.usedDisplaySize()) {
            screenPixelSize = draw.ndcToScreenPixel * ((node.bbox ? node.bbox.maxSize : node.bboxMaxSize) / node.displaySize);
        }

        if (camera.camera.ortho) {
            var height = camera.camera.getViewHeight();
            pixelSize = [(screenPixelSize*2.0) / height, height];
        } else {
            
            if (node.usedDisplaySize()) { 
               
                if (!preciseDistance) {
                    screenPixelSize = draw.ndcToScreenPixel * ((node.bbox ? node.bbox.maxSize : node.bboxMaxSize) / 256);

                    factor = (node.displaySize / 256) * camera.distance;
                    
                    v = camera.vector; //move camera away hack
                    p = [cameraPos[0] - v[0] * factor, cameraPos[1] - v[1] * factor, cameraPos[2] - v[2] * factor];

                    pixelSize = this.getPixelSize(node.bbox, screenPixelSize, p, p, true);
                } else {
                    if (draw.isGeocent) {
                        screenPixelSize = draw.ndcToScreenPixel * ((node.diskAngle2A * draw.planetRadius * 1.41421356236) / node.displaySize);
                    } else {
                        screenPixelSize = draw.ndcToScreenPixel * ((node.bbox ? node.bbox.maxSize : node.bboxMaxSize) / node.displaySize);
                    }

                    pixelSize = this.getPixelSize3(node, screenPixelSize);
                }
            } else {
                
                if (!preciseDistance && texelSizeFit > 1.1) {
                    screenPixelSize = draw.ndcToScreenPixel * node.pixelSize * (texelSizeFit / 1.1);
                    factor = (texelSizeFit / 1.1) * camera.distance;
                    
                    v = camera.vector; //move camera away hack
                    p = [cameraPos[0] - v[0] * factor, cameraPos[1] - v[1] * factor, cameraPos[2] - v[2] * factor];
                    
                    pixelSize = this.getPixelSize(node.bbox, screenPixelSize, p, p, true);
                } else {
                    if (preciseDistance) {
                        pixelSize = this.getPixelSize3(node, screenPixelSize);
                    } else {
                        pixelSize = this.getPixelSize(node.bbox, screenPixelSize, cameraPos, cameraPos, true);
                    }
                }
            }
        }
    } else {
        if (preciseDistance) {
            pixelSize = this.getPixelSize3(node, 1, 1);
        } else {
            pixelSize = this.getPixelSize(node.bbox, 1, cameraPos, cameraPos, true);
        }

        //pixelSize = this.getPixelSize(node.bbox, 1, cameraPos, cameraPos, true);
        pixelSize[0] = Number.POSITIVE_INFINITY;
    }

    this.texelSize = pixelSize[0];
    this.distance = pixelSize[1];

    //degrade horizont
    if (!map.config.mapDegradeHorizon || draw.degradeHorizonFactor < 1.0) {
        return;
    }

    var degradeHorizon = map.config.mapDegradeHorizonParams;
    var degradeFadeStart = degradeHorizon[1];
    var degradeFadeEnd = degradeHorizon[2];

    //reduce degrade factor by tilt
    var degradeFactor = draw.degradeHorizonFactor * draw.degradeHorizonTiltFactor; 
    var distance = this.distance * camera.distanceFactor;

    //apply degrade factor smoothly from specified tile distance
    if (distance < degradeFadeStart) {
        degradeFactor = 1.0;
    } else if (distance > degradeFadeStart && distance < degradeFadeEnd) {
        degradeFactor = 1.0 + (degradeFactor-1.0) * ((distance - degradeFadeStart) / (degradeFadeEnd - degradeFadeStart));
    }

    degradeFactor = Math.max(degradeFactor, 1.0);

    //reduce degrade factor by observed distance
    var observerDistance = camera.perceivedDistance;
    var distanceFade = degradeHorizon[3];

    if (observerDistance > distanceFade) {
        degradeFactor = 1.0;
    } else if (observerDistance < distanceFade && degradeFactor > 1.0) {
        degradeFactor = 1.0 + ((degradeFactor - 1.0) * (1.0-(observerDistance / distanceFade)));
    }

    //console.log("degrade: " + degradeFactor);

    this.texelSize /= degradeFactor;
};


MapSurfaceTile.prototype.drawGrid = function(cameraPos, divNode, angle, onlySetBorderData, subdiv) {
    /* if (!(subdiv || onlySetBorderData)) {
        if (this.gridRenderCounter != this.map.draw.drawCounter) {
            this.gridRenderCounter = this.map.draw.drawCounter;
        } else {
            return; //prevent rendering same grid more then on time
        }
    } */

    if ((this.texelSize == Number.POSITIVE_INFINITY || this.texelSize > 4.4) && this.metanode && this.metanode.hasChildren()) {
        return;
    }
    
    if (!this.metanode) {
        return;
    }

    var map = this.map, node, ll, ur, res;

    if (map.draw.gridSkipped) {
        return;
    }


    if (divNode) {
        node = divNode[0]; 
        ll = divNode[1][0];
        ur = divNode[1][1];
    } else {
        res = map.measure.getSpatialDivisionNodeAndExtents(this.id);
        node = res[0]; 
        ll = res[1][0];
        ur = res[1][1];
    }
   
    var middle = [(ur[0] + ll[0])* 0.5, (ur[1] + ll[1])* 0.5];

    var hasPoles = map.referenceFrame.hasPoles;

    angle = angle || this.metanode.diskAngle2;
    
    if ((hasPoles && !node.isPole) &&  Math.acos(angle) > Math.PI*0.1) {
        angle = Math.cos(Math.acos(angle) * 0.5); 
        
        this.drawGrid(cameraPos, [node, [ [ll[0], ll[1]],  [middle[0], middle[1]] ] ], angle, false, true);
        this.drawGrid(cameraPos, [node, [ [middle[0], ll[1]],  [ur[0], middle[1]] ] ], angle, false, true);

        this.drawGrid(cameraPos, [node, [ [ll[0], middle[1]],  [middle[0], ur[1]] ] ], angle, false, true);
        this.drawGrid(cameraPos, [node, [ [middle[0], middle[1]],  [ur[0], ur[1]] ] ], angle, false, true);
       
        return;
    }
     
    var desiredSamplesPerViewExtent = 5;
    var nodeExtent = node.extents.ur[1] - node.extents.ll[1];
    var viewExtent = this.distance ;//* 0.1;
    var lod = Math.log((desiredSamplesPerViewExtent * nodeExtent) / viewExtent) / map.log2;
    lod = Math.max(0,lod - 8 + node.id[0]);
   
    var h, factor, prog, draw = map.draw; 

    var sx = cameraPos[0];
    var sx = cameraPos[0];
    var sy = cameraPos[1];
    var sz = cameraPos[2];
    var buffer = draw.planeBuffer;
    var flatGrid = draw.gridFlat;
    var joinGrids = draw.gridGlues; //this.map.draw.debug.drawFog;
    var gridPoints = this.gridPoints;
    var useSurrogatez = map.config.mapGridSurrogatez;

    if (!gridPoints) {

        h = useSurrogatez ? this.metanode.surrogatez : this.metanode.minZ;
        var n1 = node.getPhysicalCoords([ur[0], ur[1], h], true);
        var n2 = node.getPhysicalCoords([ur[0], ll[1], h], true);
        var n3 = node.getPhysicalCoords([ll[0], ll[1], h], true);
        var n4 = node.getPhysicalCoords([ll[0], ur[1], h], true);
        var mtop = node.getPhysicalCoords([middle[0], ur[1], h], true);
        var mbottom = node.getPhysicalCoords([middle[0], ll[1], h], true);
        var mleft = node.getPhysicalCoords([ll[0], middle[1], h], true);
        var mright = node.getPhysicalCoords([ur[0], middle[1], h], true);

        middle[2] = h;
        middle = node.getPhysicalCoords(middle, true);

        if (!divNode) {

            var gridPoints = [
                n4[0], n4[1], n4[2],
                mtop[0], mtop[1], mtop[2],
                n1[0], n1[1], n1[2],

                mleft[0], mleft[1], mleft[2],
                middle[0], middle[1], middle[2],
                mright[0], mright[1], mright[2],
                
                n3[0], n3[1], n3[2],
                mbottom[0], mbottom[1], mbottom[2],
                n2[0], n2[1], n2[2]
            ];

            this.gridPoints = gridPoints;

        } else {
            buffer[0] = n4[0] - sx;
            buffer[1] = n4[1] - sy;
            buffer[2] = n4[2] - sz;
            
            buffer[3] = mtop[0] - sx;
            buffer[4] = mtop[1] - sy;
            buffer[5] = mtop[2] - sz;

            buffer[6] = n1[0] - sx;
            buffer[7] = n1[1] - sy;
            buffer[8] = n1[2] - sz;

            buffer[9] = mleft[0] - sx;
            buffer[10] = mleft[1] - sy;
            buffer[11] = mleft[2] - sz;
                    
            buffer[12] = middle[0] - sx;
            buffer[13] = middle[1] - sy;
            buffer[14] = middle[2] - sz;
                    
            buffer[15] = mright[0] - sx;
            buffer[16] = mright[1] - sy;
            buffer[17] = mright[2] - sz;
                
            buffer[18] = n3[0] - sx;
            buffer[19] = n3[1] - sy;
            buffer[20] = n3[2] - sz;
            
            buffer[21] = mbottom[0] - sx;
            buffer[22] = mbottom[1] - sy;
            buffer[23] = mbottom[2] - sz;
            
            buffer[24] = n2[0] - sx;
            buffer[25] = n2[1] - sy;
            buffer[26] = n2[2] - sz;
        }
     }


    if (!flatGrid) {

        var mnode = this.metanode; 
           
        var border = mnode.border, borderNodes = mnode.borderNodes;
        var i, li, n, tree = map.tree, id = this.id;
        
        if (!border) {
            mnode.border = new Array(9);
            mnode.borderNodes = new Array(9);
            border = mnode.border, borderNodes = mnode.borderNodes;
            border[4] = useSurrogatez ? mnode.surrogatez : mnode.minZ;
        }
        

        var borderTable = tileBorderTable;
        var skip = false;

        if (!mnode.borderReady) {
            
            for (i = 0; i < 9; i++) {
                if (i != 4 && !borderNodes[i]) {
                    n = tree.getNodeById([id[0], id[1] + borderTable[i][0], id[2] + borderTable[i][1]], true);

                    if (n) {
                        borderNodes[i] = n;
                        border[i] = (useSurrogatez ? n.surrogatez : n.minZ);
                    } else {
                        border[i] = border[4];
                        skip = true;
                    }
                }
            }
           
        }

        var border2 = mnode.border2;
        h = useSurrogatez ? mnode.surrogatez : mnode.minZ

        if (!border2 || !mnode.borderReady) {
            border2 = [
                ((border[0] + border[1] + border[3] + border[4]) * 0.25) - h, 
                ((border[1] + border[4]) * 0.5) - h,
                ((border[2] + border[1] + border[5] + border[4]) * 0.25) - h,

                ((border[3] + border[4]) * 0.5) - h,
                border[4] - h,
                ((border[5] + border[4]) * 0.5) - h,

                ((border[6] + border[7] + border[3] + border[4]) * 0.25) - h,
                ((border[7] + border[4]) * 0.5) - h,
                ((border[8] + border[7] + border[5] + border[4]) * 0.25) - h
            ];

            mnode.border2 = border2;
        }

        if (!skip) {
            mnode.borderReady = true;
        }

        if (onlySetBorderData) {
            return;
        }

        if (joinGrids) {
            var cornerTable = tileCornerTable;
            var nodeTable = this.nodeTable;

            if (!nodeTable) {
                nodeTable = new Array(9);
                this.nodeTable = nodeTable;
            }

            //get bodrer nodes
            for (i = 0, li = borderTable.length; i < li; i++) {
                if (i != 4) {
                    nodeTable[i] = tree.getRenderedNodeById([id[0], id[1] + borderTable[i][0], id[2] + borderTable[i][1]], draw.drawCounter);
                }
            }

            var border3 = mnode.border3;

            if (!border3) {
                border3 = new Array(9);
                mnode.border3 = border3;
            }

            //solve corners
            for (i = 0, li = cornerTable.length; i < li; i++) {
                var lowestNode = nodeTable[cornerTable[i][0]];

                for (var j = 1; j < 3; j++) {
                    n = nodeTable[cornerTable[i][j]];

                    if (n) {
                        if (lowestNode) {
                            if (n.id[0] < lowestNode.id[0]) {
                                lowestNode = n;
                            } 
                        } else {
                            lowestNode = n;
                        }
                    }
                }

                nodeTable[cornerTable[i][0]] = lowestNode;
            }

            for (i = 0, li = borderTable.length; i < li; i++) {
                n = nodeTable[i];

                if (i != 4 && (n && n.id[0] < id[0])) {
                    var bcoords;

                    switch(i) {
                        case 0:  bcoords = [mnode.llx, mnode.lly]; break;
                        case 1:  bcoords = [(mnode.urx+mnode.llx)*0.5, mnode.lly]; break;
                        case 2:  bcoords = [mnode.urx, mnode.lly]; break;
                        
                        case 3:  bcoords = [mnode.llx, (mnode.ury+mnode.lly)*0.5]; break;
                        case 5:  bcoords = [mnode.urx, (mnode.ury+mnode.lly)*0.5]; break;

                        case 6:  bcoords = [mnode.llx, mnode.ury]; break;
                        case 7:  bcoords = [(mnode.urx+mnode.llx)*0.5, mnode.ury]; break;
                        case 8:  bcoords = [mnode.urx, mnode.ury]; break;
                    }

                    if (!n.border2) {
                        n.tile.drawGrid(cameraPos, divNode, angle, true);
                    }

                    if (n.border2) {
                        mnode.border3[i] = (n.getGridHeight(bcoords, n.border2, 3) + (useSurrogatez ? n.surrogatez : n.minZ))  - h; 
                    } else {
                        border2[i];
                    }
                } else {
                    mnode.border3[i] = border2[i];
                }
            }
        }                     
    }

    var renderer = map.renderer;
    var mv = renderer.camera.getModelviewMatrix();
    var proj = renderer.camera.getProjectionMatrix();

    if (gridPoints) {
        buffer[0] = gridPoints[0] - sx;
        buffer[1] = gridPoints[1] - sy;
        buffer[2] = gridPoints[2] - sz;
        
        buffer[3] = gridPoints[3] - sx;
        buffer[4] = gridPoints[4] - sy;
        buffer[5] = gridPoints[5] - sz;

        buffer[6] = gridPoints[6] - sx;
        buffer[7] = gridPoints[7] - sy;
        buffer[8] = gridPoints[8] - sz;

        buffer[9] = gridPoints[9] - sx;
        buffer[10] = gridPoints[10] - sy;
        buffer[11] = gridPoints[11] - sz;
                
        buffer[12] = gridPoints[12] - sx;
        buffer[13] = gridPoints[13] - sy;
        buffer[14] = gridPoints[14] - sz;
                
        buffer[15] = gridPoints[15] - sx;
        buffer[16] = gridPoints[16] - sy;
        buffer[17] = gridPoints[17] - sz;
            
        buffer[18] = gridPoints[18] - sx;
        buffer[19] = gridPoints[19] - sy;
        buffer[20] = gridPoints[20] - sz;
        
        buffer[21] = gridPoints[21] - sx;
        buffer[22] = gridPoints[22] - sy;
        buffer[23] = gridPoints[23] - sz;
        
        buffer[24] = gridPoints[24] - sx;
        buffer[25] = gridPoints[25] - sy;
        buffer[26] = gridPoints[26] - sz;
    }

    if (hasPoles && !map.poleRadius && node.id[0] == 1 && !node.isPole) {
        var p = node.getPhysicalCoords([node.extents.ur[0], node.extents.ur[1], 0]);
        map.poleRadius = Math.sqrt(p[0]*p[0]+p[1]*p[1]); 
        map.poleRadiusFactor = 8 * Math.pow(2.0, 552058 / map.poleRadius); 
    }

    factor = 1;

    var useTexture = (map.config.mapGridTextureLayer != '');

    if (useTexture) {
        if (!this.gridTexture) {

            var layer = map.boundLayers[map.config.mapGridTextureLayer];
            var sourceTile = this;

            if (!layer || sourceTile < layer.lodRange[0]) {
                useTexture = false;
            } else {
                var sourceLod = math.clamp(sourceTile.id[0] - map.config.mapGridTextureLevel, layer.lodRange[0], layer.lodRange[3]);

                while (sourceTile.id[0] > sourceLod) {
                    sourceTile = sourceTile.parent;
                }

                //(path, type, extraBound, extraInfo, tile, internal)
                this.gridTexture = this.resources.getTexture("gmap#"+map.config.mapGridTextureLayer, null, {sourceTile: sourceTile, layer:layer, tile: this }, null, null, null);
                //this.gridTexture.isReady(false, 0, false);
            }

        }

        if (useTexture && !this.gridTexture.isReady(false, 0, false)) {  //TODO: set params with max priority
            useTexture = false;       
        }     
    }

    var hitmapRender = renderer.onlyDepth;

    if (hasPoles && node.isPole) {
        factor = map.poleRadiusFactor; 
        prog = hitmapRender ? renderer.progPlane2D :renderer.progPlane2; 
        renderer.gpu.useProgram(prog, ['aPosition', 'aTexCoord']);
        prog.setVec4('uParams4', [-sx, -sy, map.poleRadius, 0]);
    } else {

        if (!flatGrid) {
            prog = hitmapRender ? renderer.progPlane3D : renderer.progPlane3; 
            renderer.gpu.useProgram(prog, ['aPosition', 'aTexCoord']);

            var border;

            if (joinGrids) {
                border =  mnode.border3;
            } else {
                border = mnode.border2;
            }

            prog.setFloatArray('uHeights', border);
            prog.setVec3('uVector', mnode.diskNormal);

        } else {
            prog = hitmapRender ? renderer.progPlane : renderer.progPlane; 
            renderer.gpu.useProgram(prog, ['aPosition', 'aTexCoord']);
        }
    }

    prog.setMat4('uMV', mv);
    prog.setMat4('uProj', proj);
    prog.setFloatArray('uPoints', buffer);
    
    /*
    var lx = (ur[0] - ll[0]);
    var ly = (ll[1] - ur[1]);
    var px = (ll[0] - node.extents.ll[0]) / lx;
    var py = (ur[1] - node.extents.ll[1]) / ly;
    
    var llx = (node.extents.ur[0] - node.extents.ll[0]) / lx;
    var lly = (node.extents.ur[1] - node.extents.ll[1]) / ly;

    px = px / llx;
    py = py / lly;
    llx = 1.0/llx;
    lly = 1.0/lly;
    
    llx *= step1;
    lly *= step1;
    px *= step1;
    py *= step1;
    */

    var step1 = node.gridStep1 * factor;

    var lx = 1.0 / (ur[0] - ll[0]);
    var ly = 1.0 / (ll[1] - ur[1]);
    var llx = step1 / ((node.extents.ur[0] - node.extents.ll[0]) * lx);
    var lly = step1 / ((node.extents.ur[1] - node.extents.ll[1]) * ly);
    var px = (ll[0] - node.extents.ll[0]) * lx * llx;
    var py = (ur[1] - node.extents.ll[1]) * ly * lly;


    if (useTexture) {
        renderer.gpu.bindTexture(this.gridTexture.getGpuTexture());
        prog.setVec4('uParams', [step1 * factor, draw.fogDensity, 1/15, node.gridStep2 * factor]);

        var tt = this.gridTexture.getTransform();

//        prog.setVec4('uParams3', [tt[2], tt[3]+tt[1], tt[0], tt[1]]);
        prog.setVec4('uParams3', [tt[2], tt[3], tt[0], tt[1]]);

        //prog.setVec4('uParams3', [(py - Math.floor(py)), (px - Math.floor(px)), lly*0.5, llx*0.5]);
        prog.setVec4('uParams2', [0, 0, 0, 0]);
    } else {
        renderer.gpu.bindTexture(renderer.heightmapTexture);       
        prog.setVec4('uParams', [step1 * factor, draw.fogDensity, 1/15, node.gridStep2 * factor]);
        prog.setVec4('uParams3', [(py - Math.floor(py)), (px - Math.floor(px)), lly, llx]);
        prog.setVec4('uParams2', [0, 0, node.gridBlend, 0]);
    }
    
    prog.setVec4('uFogColor', draw.atmoColor);

    //draw bbox
    renderer.planeMesh.draw(prog, 'aPosition', 'aTexCoord');    

    this.map.stats.drawnFaces += renderer.planeMesh.polygons;
}; 


MapSurfaceTile.prototype.drawHmapTile = function(cameraPos, divNode, angle, pipeline, texture) {
    //if ((this.texelSize == Number.POSITIVE_INFINITY || this.texelSize > 4.4) && this.metanode && this.metanode.hasChildren()) {
      //  return;
    //}
    
    if (!this.metanode) {
        return;
    }

    var map = this.map, node, ll, ur, res;
    var renderer = map.renderer;

    if (!renderer.progHmapPlane) {
        renderer.initProceduralShaders();
    }

    if (divNode) {
        node = divNode[0]; 
        ll = divNode[1][0];
        ur = divNode[1][1];
    } else {
        res = map.measure.getSpatialDivisionNodeAndExtents(this.id);
        node = res[0]; 
        ll = res[1][0];
        ur = res[1][1];
    }
   
    var middle = [(ur[0] + ll[0])* 0.5, (ur[1] + ll[1])* 0.5];
    var hasPoles = map.referenceFrame.hasPoles;
    angle = angle || this.metanode.diskAngle2;
    
    if ((hasPoles && !node.isPole) &&  Math.acos(angle) > Math.PI*0.1) {
        angle = Math.cos(Math.acos(angle) * 0.5); 
        
        this.drawHmapTile(cameraPos, [node, [ [ll[0], ll[1]],  [middle[0], middle[1]] ] ], angle);
        this.drawHmapTile(cameraPos, [node, [ [middle[0], ll[1]],  [ur[0], middle[1]] ] ], angle);

        this.drawHmapTile(cameraPos, [node, [ [ll[0], middle[1]],  [middle[0], ur[1]] ] ], angle);
        this.drawHmapTile(cameraPos, [node, [ [middle[0], middle[1]],  [ur[0], ur[1]] ] ], angle);
       
        return;
    }
     
    var desiredSamplesPerViewExtent = 5;
    var nodeExtent = node.extents.ur[1] - node.extents.ll[1];
    var viewExtent = this.distance ;//* 0.1;
    var lod = Math.log((desiredSamplesPerViewExtent * nodeExtent) / viewExtent) / map.log2;
    lod = Math.max(0,lod - 8 + node.id[0]);
   
    var h, factor, prog, draw = map.draw; 

    var sx = cameraPos[0];
    var sx = cameraPos[0];
    var sy = cameraPos[1];
    var sz = cameraPos[2];
    var buffer = draw.planeBuffer;
    var gridPoints = this.gridPoints;
    var useSurrogatez = map.config.mapGridSurrogatez;

    if (!gridPoints) {

//        h = this.metanode.minZ;
        h = 0;//this.metanode.minHeight;
        var n1 = node.getPhysicalCoords([ur[0], ur[1], h], true);
        var n2 = node.getPhysicalCoords([ur[0], ll[1], h], true);
        var n3 = node.getPhysicalCoords([ll[0], ll[1], h], true);
        var n4 = node.getPhysicalCoords([ll[0], ur[1], h], true);
        var mtop = node.getPhysicalCoords([middle[0], ur[1], h], true);
        var mbottom = node.getPhysicalCoords([middle[0], ll[1], h], true);
        var mleft = node.getPhysicalCoords([ll[0], middle[1], h], true);
        var mright = node.getPhysicalCoords([ur[0], middle[1], h], true);

        middle[2] = h;
        middle = node.getPhysicalCoords(middle, true);

        if (!divNode) {

            var gridPoints = [
                n4[0], n4[1], n4[2],
                mtop[0], mtop[1], mtop[2],
                n1[0], n1[1], n1[2],

                mleft[0], mleft[1], mleft[2],
                middle[0], middle[1], middle[2],
                mright[0], mright[1], mright[2],
                
                n3[0], n3[1], n3[2],
                mbottom[0], mbottom[1], mbottom[2],
                n2[0], n2[1], n2[2]
            ];

            this.gridPoints = gridPoints;

        } else {
            buffer[0] = n4[0] - sx;
            buffer[1] = n4[1] - sy;
            buffer[2] = n4[2] - sz;
            
            buffer[3] = mtop[0] - sx;
            buffer[4] = mtop[1] - sy;
            buffer[5] = mtop[2] - sz;

            buffer[6] = n1[0] - sx;
            buffer[7] = n1[1] - sy;
            buffer[8] = n1[2] - sz;

            buffer[9] = mleft[0] - sx;
            buffer[10] = mleft[1] - sy;
            buffer[11] = mleft[2] - sz;
                    
            buffer[12] = middle[0] - sx;
            buffer[13] = middle[1] - sy;
            buffer[14] = middle[2] - sz;
                    
            buffer[15] = mright[0] - sx;
            buffer[16] = mright[1] - sy;
            buffer[17] = mright[2] - sz;
                
            buffer[18] = n3[0] - sx;
            buffer[19] = n3[1] - sy;
            buffer[20] = n3[2] - sz;
            
            buffer[21] = mbottom[0] - sx;
            buffer[22] = mbottom[1] - sy;
            buffer[23] = mbottom[2] - sz;
            
            buffer[24] = n2[0] - sx;
            buffer[25] = n2[1] - sy;
            buffer[26] = n2[2] - sz;
        }
     }

    var mv = renderer.camera.getModelviewMatrix();
    var proj = renderer.camera.getProjectionMatrix();

    if (gridPoints) {
        buffer[0] = gridPoints[0] - sx;
        buffer[1] = gridPoints[1] - sy;
        buffer[2] = gridPoints[2] - sz;
        
        buffer[3] = gridPoints[3] - sx;
        buffer[4] = gridPoints[4] - sy;
        buffer[5] = gridPoints[5] - sz;

        buffer[6] = gridPoints[6] - sx;
        buffer[7] = gridPoints[7] - sy;
        buffer[8] = gridPoints[8] - sz;

        buffer[9] = gridPoints[9] - sx;
        buffer[10] = gridPoints[10] - sy;
        buffer[11] = gridPoints[11] - sz;
                
        buffer[12] = gridPoints[12] - sx;
        buffer[13] = gridPoints[13] - sy;
        buffer[14] = gridPoints[14] - sz;
                
        buffer[15] = gridPoints[15] - sx;
        buffer[16] = gridPoints[16] - sy;
        buffer[17] = gridPoints[17] - sz;
            
        buffer[18] = gridPoints[18] - sx;
        buffer[19] = gridPoints[19] - sy;
        buffer[20] = gridPoints[20] - sz;
        
        buffer[21] = gridPoints[21] - sx;
        buffer[22] = gridPoints[22] - sy;
        buffer[23] = gridPoints[23] - sz;
        
        buffer[24] = gridPoints[24] - sx;
        buffer[25] = gridPoints[25] - sy;
        buffer[26] = gridPoints[26] - sz;
    }

    if (hasPoles && !map.poleRadius && node.id[0] == 1 && !node.isPole) {
        var p = node.getPhysicalCoords([node.extents.ur[0], node.extents.ur[1], 0]);
        map.poleRadius = Math.sqrt(p[0]*p[0]+p[1]*p[1]); 
        map.poleRadiusFactor = 8 * Math.pow(2.0, 552058 / map.poleRadius); 
    }

    var mnode = this.metanode; 
    var testMode = draw.debug.drawTestMode;

    factor = 1;

    if (hasPoles && node.isPole) {
        factor = map.poleRadiusFactor; 
        prog = renderer.progPlane2; 
        renderer.gpu.useProgram(prog, ['aPosition', 'aTexCoord']);
        prog.setVec4('uParams4', [-sx, -sy, map.poleRadius, 0]);
    } else {

        switch(testMode) {
            default:
            case 0: prog = renderer.progHmapPlane; break;
            case 1: prog = renderer.progHmapPlane2; break;
            case 2: prog = renderer.progHmapPlane5; break;
            case 3: prog = renderer.progHmapPlane6; break;
            case 4: prog = renderer.progHmapPlane7; break;

            case 8: prog = renderer.progHmapPlane4; break;
            case 9: prog = pipeline == 1 ? renderer.progHmapPlane3 : renderer.progHmapPlane8; break;
        }


        if (testMode == 3 || testMode == 4) {
            if (!renderer.ntextures) {
                renderer.ntextures = [ 
                    new GpuTexture(renderer.gpu, './textures/test/test001.png', renderer.core, null), //0
                    new GpuTexture(renderer.gpu, './textures/test/test002.png', renderer.core, null), //1
                    new GpuTexture(renderer.gpu, './textures/test003.jpg', renderer.core, null),      //2
                    new GpuTexture(renderer.gpu, './textures/download.png', renderer.core, null),     //3
                    new GpuTexture(renderer.gpu, './textures/test009.jpg', renderer.core, null),      //4
                    new GpuTexture(renderer.gpu, './textures/test004.jpg', renderer.core, null),      //5
                    new GpuTexture(renderer.gpu, './textures/test005.jpg', renderer.core, null),      //6
                    new GpuTexture(renderer.gpu, './textures/nor_sand.jpg', renderer.core, null),     //7
                    new GpuTexture(renderer.gpu, './textures/test007.jpg', renderer.core, null),      //8
                    new GpuTexture(renderer.gpu, './textures/test008.jpg', renderer.core, null),      //9

                    new GpuTexture(renderer.gpu, './textures/download (1).png', renderer.core, null),  //10
                    new GpuTexture(renderer.gpu, './textures/test010.jpg', renderer.core, null),      //11
                    new GpuTexture(renderer.gpu, './textures/test011.jpg', renderer.core, null),      //12
                    new GpuTexture(renderer.gpu, './textures/test012.jpg', renderer.core, null),      //13
                    new GpuTexture(renderer.gpu, './textures/test013.jpg', renderer.core, null),      //14
                    new GpuTexture(renderer.gpu, './textures/test014.jpg', renderer.core, null),      //15
                    new GpuTexture(renderer.gpu, './textures/test015.jpg', renderer.core, null),      //16
                    new GpuTexture(renderer.gpu, './textures/test016.jpg', renderer.core, null),      //17
                    new GpuTexture(renderer.gpu, './textures/test017.jpg', renderer.core, null),      //18
                    new GpuTexture(renderer.gpu, './textures/test018.jpg', renderer.core, null)      //18

                    ];
            }
        }

//        renderer.gpu.useProgram(prog, ['aPosition', 'aTexCoord', 'aBarycentric']);
        //renderer.gpu.useProgram(prog, ['aPosition', 'aTexCoord']);
        renderer.gpu.useProgram(prog, ['aPosition']);
        prog.setVec3('uVector', mnode.diskNormal);

        //prog.setVec3('uRight', mnode.diskNormal);

        if (gridPoints) {
            var vecRight = [gridPoints[15] - gridPoints[12], gridPoints[16] - gridPoints[13], gridPoints[17] - gridPoints[14]];
            var vecTop = [gridPoints[21] - gridPoints[12], gridPoints[22] - gridPoints[13], gridPoints[23] - gridPoints[14]];

            vec3.normalize(vecRight);
            vec3.normalize(vecTop);

            var vecDir = mnode.diskNormal.slice();
            //vecDir = [-vecDir[0], -vecDir[1], -vecDir[2]];

            //prog.setVec3('uRight', vecRight);
            //prog.setVec3('uTop', vecTop);


            var mv = map.camera.camera.modelview;
            var mv2 = vts.mat3.create();

            vts.mat4.toInverseMat3(mv, mv2);

            //vts.mat4.toMat3(mv, mv2);
            vts.mat3.transpose(mv2);

            vts.mat3.multiplyVec3(mv2, vecTop);
            vts.mat3.multiplyVec3(mv2, vecDir);
            vts.mat3.multiplyVec3(mv2, vecRight);

            var space = [
                vecRight[0], vecRight[1], vecRight[2],
                vecTop[0], vecTop[1], vecTop[2],
                vecDir[0], vecDir[1], vecDir[2],
            ];

            /*
            var mv3 = vts.mat3.toMat4(mv2);
            vts.mat4.multiply(mv3, vts.mat3.toMat4(space), mv3);
            prog.setMat3('uSpace', vts.mat4.toMat3(mv3));
            */
            
            prog.setMat3('uSpace', space);
        }
    }

    prog.setMat4('uMV', mv);
    prog.setMat4('uProj', proj);
    prog.setFloatArray('uPoints', buffer);
    

    var step1 = node.gridStep1 * factor;
    prog.setVec4('uParams', [step1 * factor, draw.fogDensity, 1/127, node.gridStep2 * factor]);

    if (testMode >= 3 && testMode <= 4) {
        prog.setVec4('uParams3', [1,1,0,0]);
    } else {
        if (texture) {
            prog.setVec4('uParams3', texture.getTransform());
        } else {
            var lx = 1.0 / (ur[0] - ll[0]);
            var ly = 1.0 / (ll[1] - ur[1]);
            var llx = step1 / ((node.extents.ur[0] - node.extents.ll[0]) * lx);
            var lly = step1 / ((node.extents.ur[1] - node.extents.ll[1]) * ly);
            var px = (ll[0] - node.extents.ll[0]) * lx * llx;
            var py = (ur[1] - node.extents.ll[1]) * ly * lly;

            prog.setVec4('uParams3', [lly, llx, (py - Math.floor(py)), (px - Math.floor(px))]);
        }
    }

    prog.setVec4('uParams2', [0, 0, node.gridBlend, 0]);
    prog.setVec4('uFogColor', draw.atmoColor);


    if (this.hmap.extraBound) {
        //get height form parent
        mnode = this.hmap.extraBound.sourceTile.metanode;
        prog.setVec3('uHeights', [mnode.minHeight, mnode.maxHeight, (1.0/mnode.pixelSize)]);
        prog.setVec4('uTransform', this.hmap.getTransform());
    } else {
        prog.setVec3('uHeights', [mnode.minHeight, mnode.maxHeight, (1.0/mnode.pixelSize)]);
        prog.setVec4('uTransform', [1,1,0,0]);
    }

    if (testMode >= 3 && testMode <= 4) {
        if (!renderer.ntextures[draw.debug.drawTestData].loaded) {
            return;
        }
        renderer.gpu.bindTexture(renderer.ntextures[draw.debug.drawTestData]);
    } else {
        if (texture) {
            renderer.gpu.bindTexture(texture.getGpuTexture());
        } else {
            renderer.gpu.bindTexture(renderer.heightmapTexture);
        }
    }

    prog.setSampler('uSampler', 0);    

//    if(this.hmap) {
        renderer.gpu.bindTexture(this.hmap.getGpuTexture(), 1);
  //  } else {
        //renderer.gpu.bindTexture(renderer.blackTexture, 1);
  //      renderer.gpu.bindTexture(renderer.blackTexture2, 1);
   // }

    prog.setSampler('uSampler2', 1);    

    //draw bbox
    //renderer.planeMesh2.draw(prog, 'aPosition', 'aTexCoord');    
    renderer.planeMesh2.draw(prog, 'aPosition');    

    /*
    if (vecRight && gridPoints) {
        //renderer.draw.drawLineString(points, screenSpace, size, color, depthOffset, depthTest, transparent, writeDepth, useState);
        renderer.draw.drawLineString([[gridPoints[12], gridPoints[13], gridPoints[14]], [gridPoints[15], gridPoints[16], gridPoints[17]]], false, 4, [1,0,0,1], null, false, false, false, false);
        renderer.draw.drawLineString([[gridPoints[12], gridPoints[13], gridPoints[14]], [gridPoints[21], gridPoints[22], gridPoints[23]]], false, 4, [0,0,1,1], null, false, false, false, false);

        renderer.draw.drawLineString([[0, 0, 0], [9000000, 0, 0]], false, 4, [1,0,0,1], null, false, false, false, false);
        renderer.draw.drawLineString([[0, 0, 0], [0, 9000000, 0, 0]], false, 4, [0,1,0,1], null, false, false, false, false);
        renderer.draw.drawLineString([[0, 0, 0], [0, 0, 9000000]], false, 4, [0,0,1,1], null, false, false, false, false);
    }*/


    this.map.stats.drawnFaces += renderer.planeMesh2.polygons;
}; 


export default MapSurfaceTile;


