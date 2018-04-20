
import MapGeodataView_ from './geodata-view';

//get rid of compiler mess
var MapGeodataView = MapGeodataView_;


var MapDrawTiles = function(map, draw) {
    this.map = map;
    this.config = map.config;
    this.isProjected = this.map.getNavigationSrs().isProjected();
    this.stats = map.stats;
    this.draw = draw;
    this.debug = draw.debug;
    this.core = map.core;
    this.camera = map.camera;

    this.renderer = map.renderer;

    this.getTextSize = this.renderer.draw.getTextSize.bind(this.renderer.draw);
    this.drawText = this.renderer.draw.drawText.bind(this.renderer.draw);
};


MapDrawTiles.prototype.drawSurfaceTile = function(tile, node, cameraPos, pixelSize, priority, preventRedener, preventLoad, doNotCheckGpu) {
    /*if (!(tile.id[0] == 14 &&
        tile.id[1] == 4450 &&
        tile.id[2] == 2749)) {
        //tile = tile;
        return true;
    }*/

    if (this.stats.gpuRenderUsed >= this.draw.maxGpuUsed) {
        return false;
    }

    tile.renderReady = false;
    
    if (tile.surface) {
        if (node.hasGeometry()) {

            if (this.debug.drawBBoxes && !preventRedener) {
                if (tile.surface.geodata || !this.debug.drawGeodataOnly) {
                    this.drawTileInfo(tile, node, cameraPos, tile.surfaceMesh, pixelSize);
                }
            }

            if (this.debug.heightmapOnly && !preventRedener) {
                if (!tile.surface.geodata) {
                    //node.drawPlane(cameraPos, tile);
                    tile.drawGrid(cameraPos);
                }
                return true;
            }
            
            if (!preventRedener) {
                this.stats.renderedLods[tile.id[0]]++;
                this.stats.drawnTiles++;

                if (tile.surface.geodata) {
                    this.stats.drawnGeodataTiles++;
                    this.stats.drawnGeodataTilesFactor += Math.abs(tile.tiltAngle * tile.texelSize);
                }
            }

            var count = 0;
           
            do {

                if (tile.resetDrawCommands) {
                    tile.drawCommands = [[], [], []];
                    tile.updateBounds = true;
            
                    if (tile.bounds) {
                        for (var key in tile.bounds) {
                            tile.bounds[key].viewCoutner = 0; 
                        }
                    }
                    
                    tile.resetDrawCommands = false;
                }

                var ret;

                if (!tile.surface.geodata) {
                    ret = this.drawMeshTile(tile, node, cameraPos, pixelSize, priority, preventRedener, preventLoad, doNotCheckGpu);
                } else {
                    ret = this.drawGeodataTile(tile, node, cameraPos, pixelSize, priority, preventRedener, preventLoad, doNotCheckGpu);
                }

                //if (count > 0) console.log('loop: ' + count);

                count++;

                if (count > 10) {
                    break; //prevent infinite loop
                }

            } while(tile.resetDrawCommands);

            return ret;
        } else {
            return true;
        }
    } else {
        if (!preventRedener && tile.lastRenderState) {
            var channel = this.draw.drawChannel;
            this.draw.processDrawCommands(cameraPos, tile.lastRenderState.drawCommands[channel], priority, true);
            this.map.applyCredits(tile);
            return true;
        }
    }
};



MapDrawTiles.prototype.drawMeshTile = function(tile, node, cameraPos, pixelSize, priority, preventRedener, preventLoad, doNotCheckGpu) {
    var path;

    if (!tile.surfaceMesh) {
        if (tile.resourceSurface.virtual) {
            return true;
        }
        
        path = tile.resourceSurface.getMeshUrl(tile.id);
        tile.surfaceMesh = tile.resources.getMesh(path, tile);
    }

    var draw = this.draw, texture, layer, credits;
    var channel = draw.drawChannel;
    var ret = false;

    if (tile.drawCommands[channel].length > 0 && this.draw.areDrawCommandsReady(tile.drawCommands[channel], priority, preventLoad, doNotCheckGpu)) {
        if (!preventRedener) {
            draw.processDrawCommands(cameraPos, tile.drawCommands[channel], priority);
            this.map.applyCredits(tile);
        }
        tile.lastRenderState = null;
        return true;
    } else if (tile.lastRenderState){

        if (tile.surfaceMesh.isReady(true, priority, doNotCheckGpu)) {
            if (tile.drawCommands[channel].length > 0) {
                if (!preventRedener) {
                    draw.processDrawCommands(cameraPos, tile.lastRenderState.drawCommands[channel], priority, true);
                    this.map.applyCredits(tile);
                }
                return true;
            }
        } else {
            if (!preventRedener) {
                draw.processDrawCommands(cameraPos, tile.lastRenderState.drawCommands[channel], priority, true);
                this.map.applyCredits(tile);
            }
            ret = true;
        }
    }
    
    if (tile.drawCommands[channel].length > 0) { 
        if (this.config.mapHeightfiledWhenUnloaded && !preventRedener) {
            //node.drawPlane(cameraPos, tile);
            tile.drawGrid(cameraPos);
            return false;
        } else {
            return false;
        }
    } 

    if (tile.surfaceMesh.isReady(preventLoad, priority, doNotCheckGpu) && !preventLoad) {
        var submeshes = tile.surfaceMesh.submeshes;

        /*if (tile.id[0] == 14 &&
            tile.id[1] == 4421 &&
            tile.id[2] == 2804) {
            tile = tile;
        }*/

        tile.drawCommands = [[], [], []]; //??
        tile.imageryCredits = {};
        tile.boundsDebug = {}; //used for inspector

        var specificity = 0;
        var i, li, j, lj, k, lk, surface;
        
        if (tile.surface.glue) {
            var surfaces = tile.surface.id; 
            for (i = 0, li = surfaces.length; i < li; i++) {
                surface = this.map.getSurface(surfaces[i]);
                if (surface) {
                    specificity = Math.max(specificity, surface.specificity);
                }
            }

            //set credits
            for (k = 0, lk = node.credits.length; k < lk; k++) {
                tile.glueImageryCredits[node.credits[k]] = specificity;  
            }

        } else {
            specificity = tile.surface.specificity;

            //set credits
            for (k = 0, lk = node.credits.length; k < lk; k++) {
                tile.imageryCredits[node.credits[k]] = specificity;  
            }
        }

        for (i = 0, li = submeshes.length; i < li; i++) {
            var submesh = submeshes[i];
            
            //debug bbox
            if (this.debug.drawBBoxes && this.debug.drawMeshBBox && !preventRedener) {
                submesh.drawBBox(cameraPos);
            }

            if (submesh.externalUVs) {
                if (tile.updateBounds) {
                    tile.updateBounds = false;
                    
                    this.updateTileBounds(tile, submeshes);
                }
                
                surface = tile.resourceSurface;
                if (tile.resourceSurface.glue /*&& submesh.surfaceReference != 0*/) { //glue have multiple surfaces per tile
                    surface = tile.resourceSurface.getSurfaceReference(submesh.surfaceReference);
                }

                if (surface != null) {
                    var bounds = tile.bounds[surface.id];
                    
                    if (bounds) {
                        if (submesh.externalUVs) {

                            //draw bound layers
                            if (bounds.sequence.length > 0) {
                                if (bounds.transparent) {
                                    if (submesh.internalUVs) {  //draw surface
                                        if (tile.surfaceTextures[i] == null) {
                                            path = tile.resourceSurface.getTextureUrl(tile.id, i);
                                            tile.surfaceTextures[i] = tile.resources.getTexture(path, null, null, null, tile, true);
                                        }
                                                
                                        tile.drawCommands[0].push({
                                            type : VTS_DRAWCOMMAND_SUBMESH,
                                            mesh : tile.surfaceMesh,
                                            submesh : i,
                                            texture : tile.surfaceTextures[i],
                                            material : VTS_MATERIAL_INTERNAL_NOFOG
                                        });
                                    }
    
                                    tile.drawCommands[0].push({
                                        type : VTS_DRAWCOMMAND_STATE,
                                        state : draw.drawBlendedTileState
                                    });            
                                    
                                    var layers = bounds.sequence;
                                    for (j = 0, lj = layers.length; j < lj; j++) {
                                        texture = tile.boundTextures[layers[j]];
                                        if (texture) {

                                            //debug stuff
                                            if (!tile.boundsDebug[surface.id]) {
                                                tile.boundsDebug[surface.id] = [];
                                            }
                                            tile.boundsDebug[surface.id].push(layers[j]);

                                            //set credits
                                            layer = tile.boundLayers[layers[j]];
                                            credits = layer.credits;
                                            for (k = 0, lk = credits.length; k < lk; k++) {
                                                tile.imageryCredits[credits[k]] = layer.specificity;  
                                            }

                                            tile.drawCommands[0].push({
                                                type : VTS_DRAWCOMMAND_SUBMESH,
                                                mesh : tile.surfaceMesh,
                                                submesh : i,
                                                texture : texture,
                                                material : VTS_MATERIAL_EXTERNAL_NOFOG,
                                                alpha : bounds.alpha[layers[j]][1]
                                            });
                                        }
                                    }
                                    
                                    tile.drawCommands[0].push({
                                        type : VTS_DRAWCOMMAND_SUBMESH,
                                        mesh : tile.surfaceMesh,
                                        submesh : i,
                                        texture : null,
                                        material : VTS_MATERIAL_FOG
                                    });                                                

                                    tile.drawCommands[0].push({
                                        type : VTS_DRAWCOMMAND_STATE,
                                        state : draw.drawTileState
                                    });  
                                } else {
                                    var layerId = bounds.sequence[bounds.sequence.length-1];
                                    texture = tile.boundTextures[layerId];
                                    if (texture) {

                                        //debug stuff
                                        if (!tile.boundsDebug[surface.id]) {
                                            tile.boundsDebug[surface.id] = [];
                                        }
                                        tile.boundsDebug[surface.id].push(layerId);
                                        
                                        //set credits
                                        layer = tile.boundLayers[layerId];
                                        credits = layer.credits;
                                        for (k = 0, lk = credits.length; k < lk; k++) {
                                            tile.imageryCredits[credits[k]] = layer.specificity;  
                                        }
                                        
                                        tile.drawCommands[0].push({
                                            type : VTS_DRAWCOMMAND_SUBMESH,
                                            mesh : tile.surfaceMesh,
                                            submesh : i,
                                            texture : texture,
                                            material : VTS_MATERIAL_EXTERNAL
                                        });
                                    }
                                }
                               
                            } else {
                                if (submesh.textureLayer) {
                                    
                                    layer = this.map.getBoundLayerByNumber(submesh.textureLayer);
                                    
                                    if (layer) {
                                        texture = tile.boundTextures[layer.id];
                                        
                                        if (texture) {
                                            
                                            //debug stuff
                                            if (!tile.boundsDebug[surface.id]) {
                                                tile.boundsDebug[surface.id] = [];
                                            }
                                            tile.boundsDebug[surface.id].push(layer.id);
                                            
                                            //set credits
                                            layer = tile.boundLayers[layer.id];
                                            credits = layer.credits;
                                            for (k = 0, lk = credits.length; k < lk; k++) {
                                                tile.imageryCredits[credits[k]] = layer.specificity;  
                                            }
                                            
                                            //draw mesh
                                            tile.drawCommands[0].push({
                                                type : VTS_DRAWCOMMAND_SUBMESH,
                                                mesh : tile.surfaceMesh,
                                                submesh : i,
                                                texture : texture,
                                                material : VTS_MATERIAL_EXTERNAL
                                            });
                                        }
                                    }
                                   
                                } else {
    
                                    if (submesh.internalUVs) {  //draw surface
                                        if (tile.surfaceTextures[i] == null) {
                                            path = tile.resourceSurface.getTextureUrl(tile.id, i);
                                            tile.surfaceTextures[i] = tile.resources.getTexture(path, null, null, null, tile, true);
                                        }

                                        //draw mesh
                                        tile.drawCommands[0].push({
                                            type : VTS_DRAWCOMMAND_SUBMESH,
                                            mesh : tile.surfaceMesh,
                                            submesh : i,
                                            texture : tile.surfaceTextures[i],
                                            material : VTS_MATERIAL_INTERNAL
                                        });
                                    } else {
                                        tile.drawCommands[0].push({
                                            type : VTS_DRAWCOMMAND_SUBMESH,
                                            mesh : tile.surfaceMesh,
                                            submesh : i,
                                            texture : null,
                                            material : VTS_MATERIAL_FLAT
                                        });
                                    }
    
                                }
                            }
    
                        } else if (submesh.internalUVs) {
    
                            if (tile.surfaceTextures[i] == null) {
                                path = tile.resourceSurface.getTextureUrl(tile.id, i);
                                tile.surfaceTextures[i] = tile.resources.getTexture(path, null, null, null, tile, true);
                            } //else {
                            tile.drawCommands[0].push({
                                type : VTS_DRAWCOMMAND_SUBMESH,
                                mesh : tile.surfaceMesh,
                                submesh : i,
                                texture : tile.surfaceTextures[i],
                                material : VTS_MATERIAL_INTERNAL
                            });                                                
                            //}
                        }
                    }                            
                }
            } else if (submesh.internalUVs) {

                if (tile.surfaceTextures[i] == null) {
                    path = tile.resourceSurface.getTextureUrl(tile.id, i);
                    tile.surfaceTextures[i] = tile.resources.getTexture(path, null, null, null, tile, true);
                } //else {
                tile.drawCommands[0].push({
                    type : VTS_DRAWCOMMAND_SUBMESH,
                    mesh : tile.surfaceMesh,
                    submesh : i,
                    texture : tile.surfaceTextures[i],
                    material : VTS_MATERIAL_INTERNAL
                });                                                
                //}
            }
            
            //depth path
            tile.drawCommands[1].push({
                type : VTS_DRAWCOMMAND_SUBMESH,
                mesh : tile.surfaceMesh,
                submesh : i,
                material : VTS_MATERIAL_DEPTH
            });
            
        }

        if (tile.resetDrawCommands) {
            return false;
        }

        if (draw.areDrawCommandsReady(tile.drawCommands[channel], priority, preventLoad, doNotCheckGpu)) {

            if (tile.resetDrawCommands) {
                return false;
            }

            if (!preventRedener) {
                draw.processDrawCommands(cameraPos, tile.drawCommands[channel], priority);
                this.map.applyCredits(tile);
            }
            
            tile.lastRenderState = null;
            ret = true;
        } else if (tile.lastRenderState) {
            if (!preventRedener) {
                draw.processDrawCommands(cameraPos, tile.lastRenderState.drawCommands[channel], priority, true);
                this.map.applyCredits(tile);
            }
            ret = true;
        } else {
            if (this.config.mapHeightfiledWhenUnloaded && !preventRedener) {
                //node.drawPlane(cameraPos, tile);
                tile.drawGrid(cameraPos);
                ret = !(tile.drawCommands[channel].length > 0);
            }
        }
        
    } else {
        
        if (this.config.mapHeightfiledWhenUnloaded && !preventRedener) {
            //node.drawPlane(cameraPos, tile);
            tile.drawGrid(cameraPos);
            ret = !(tile.drawCommands[channel].length > 0);
        }
        
    }
    
    return ret;
};


MapDrawTiles.prototype.drawGeodataTile = function(tile, node, cameraPos, pixelSize, priority, preventRedener, preventLoad, doNotCheckGpu) {
    if (tile.id[0] <= 1) {
        return true;
    }

    /*if (tile.id[0] == 21 && 
        tile.id[1] == 566376 &&
        tile.id[2] == 355252 ){ 
//        return true;        
    }*/

    if (tile.surfaceGeodata == null) {
        var path;
        
        if (tile.surface.geodataNavtileInfo) {  //remove this code??? no longer used
            var navtile = this.tree.findNavTile(tile.id);
            
            if (navtile && navtile.surface) {
                var navtileStr = navtile.surface.getNavUrl(navtile.id) + ';'
                                  + navtile.id[0] + '-' + navtile.id[1] + '-' + navtile.id[2] + ';'      
                                  + navtile.metanode.minHeight + ';' + navtile.metanode.maxHeight;     
                path = tile.surface.getGeodataUrl(tile.id, encodeURIComponent(navtileStr));
            }
        }
        
        if (!path) {
            path = tile.resourceSurface.getGeodataUrl(tile.id, '');
        }

        tile.surfaceGeodata = tile.resources.getGeodata(path, {tile:tile, surface:tile.surface});
    }

    var channel = this.draw.drawChannel;
    
    if (tile.geodataCounter != tile.surface.geodataCounter) {
        tile.drawCommands = [[],[],[]];

        if (tile.surfaceGeodataView != null) {
            tile.surfaceGeodataView.kill();
        }
        
        tile.surfaceGeodataView = null;
        tile.geodataCounter = tile.surface.geodataCounter;
    }

    if (tile.drawCommands[channel].length > 0 && this.draw.areDrawCommandsReady(tile.drawCommands[channel], priority, preventLoad, doNotCheckGpu)) {
        if (!preventRedener) {
            this.draw.processDrawCommands(cameraPos, tile.drawCommands[channel], priority);
            this.map.applyCredits(tile);
        }
        tile.lastRenderState = null;
        return true;
    }
/*    
     else if (tile.lastRenderState){

        if (tile.surfaceGeodata.isReady(true, priority, doNotCheckGpu) {
            if (tile.drawCommands[channel].length > 0) {
                if (!preventRedener) {
                    this.draw.processDrawCommands(cameraPos, tile.lastRenderState.drawCommands[channel], priority, true);
                    this.applyCredits(tile);
                }
                return;
            }
        } else {
            if (!preventRedener) {
                this.draw.processDrawCommands(cameraPos, tile.lastRenderState.drawCommands[channel], priority, true);
                this.applyCredits(tile);
            }
        }
    }
*/

    if (!tile.surfaceGeodataView) {
        if (tile.surfaceGeodata.isReady(preventLoad, priority, doNotCheckGpu) && !preventLoad) {
            tile.surfaceGeodataView = new MapGeodataView(this.map, tile.surfaceGeodata, {tile:tile, surface:tile.surface});
        }
    }

    if (tile.surfaceGeodataView) {
        tile.mapdataCredits = {};
        
        var specificity = (tile.surface) ? tile.surface.specificity : 0;

        //set credits
        for (var k = 0, lk = node.credits.length; k < lk; k++) {
            tile.mapdataCredits[node.credits[k]] = specificity;  
        }

        //if (tile.drawCommands[channel].length == 0) {
        tile.drawCommands[channel][0] = {
            type : VTS_DRAWCOMMAND_GEODATA,
            geodataView : tile.surfaceGeodataView 
        };
        //}
        return tile.surfaceGeodataView.isReady();
    }

    return false;
};



/*MapDrawTiles.prototype.updateTileBoundsDirectly = function(preventLoad, priority) {
    if (tile.surfaceMesh.isReady(preventLoad, priority) && !preventLoad) {
        this.updateTileBounds(tile, tile.surfaceMesh.submeshes);
    }
};*/


MapDrawTiles.prototype.updateTileBounds = function(tile, submeshes) {
    for (var i = 0, li = submeshes.length; i < li; i++) {
        var submesh = submeshes[i];
        
        if (submesh.externalUVs) {
            var submeshSurface = tile.resourceSurface;

            //if (tile.resourceSurface.glue) { //glue have multiple surfaces per tile
              //  submeshSurface = tile.resourceSurface.getSurfaceReference(submesh.surfaceReference);
            //}

            if (tile.resourceSurface.glue) { //glue have multiple surfaces per tile
                submeshSurface = tile.resourceSurface.getSurfaceReference(submesh.surfaceReference);
            }

            
            if (submeshSurface) {
                var bounds = tile.bounds[submeshSurface.id];
                
                if (!bounds) {
                    bounds = {
                        sequence : [],
                        alpha : [],
                        transparent : false,
                        viewCoutner : 0
                    };
                    
                    tile.bounds[submeshSurface.id] = bounds;
                } 
                
                if (bounds.viewCoutner != tile.viewCoutner) {
                    this.updateTileSurfaceBounds(tile, submesh, submeshSurface, bounds, bounds.viewCoutner != tile.viewCoutner);
                    //bounds.viewCoutner = tile.viewCoutner;
                }  
            }
        }
    }

    for (var key in tile.bounds) {
        tile.bounds[key].viewCoutner = tile.viewCoutner;
    }
};


MapDrawTiles.prototype.getParentTile = function(tile, lod) {
    while(tile && tile.id[0] > lod) {
        tile = tile.parent;
    }
    
    return tile;
};


MapDrawTiles.prototype.getTileTextureTransform = function(sourceTile, targetTile) {
    var shift = targetTile.id[0] - sourceTile.id[0];
    var x = sourceTile.id[1] << shift;
    var y = sourceTile.id[2] << shift;
    var s = 1.0 / Math.pow(2.0, shift);
    return [ s, s, (targetTile.id[1] - x) * s, (targetTile.id[2] - y) * s ];
};


MapDrawTiles.prototype.updateTileSurfaceBounds = function(tile, submesh, surface, bound, fullUpdate) {
    var path, extraBound, layer, texture;

    //if (tile.id[0] == 10 && tile.id[1] == 273 && tile.id[2] == 171) {
      //  tile = tile;
    //}

    //search map view
    if (surface.boundLayerSequence.length > 0) {
        if (fullUpdate) {
            bound.sequence = [];
            var sequenceFullAndOpaque = [];
            var sequenceMaskPosible = [];
            var fullAndOpaqueCounter = 0;
            
            for (var j = 0, lj = surface.boundLayerSequence.length; j < lj; j++) {
                layer = surface.boundLayerSequence[j][0];
                
                if (layer && layer.ready && layer.hasTileOrInfluence(tile.id) && surface.boundLayerSequence[j][1] > 0) {
                    extraBound = null; 
                    
                    if (tile.id[0] > layer.lodRange[1]) {
                        extraBound = {
                            sourceTile : this.getParentTile(tile, layer.lodRange[1]),
                            sourceTexture : null,
                            layer : layer,
                            tile : tile 
                        };
                    }

                    texture = tile.boundTextures[layer.id];

                    if (!texture) { //TODO: make sure that we load only textures which we need  
                        path = layer.getUrl(tile.id);
                        texture = tile.resources.getTexture(path, null, extraBound, {tile: tile, layer: layer}, tile, false);

                        if (texture.checkType == VTS_TEXTURECHECK_MEATATILE) {
                            texture.checkMask = true;
                        }

                        texture.isReady(true); //check for mask but do not load
                        tile.boundTextures[layer.id] = texture; 
                    } 

                    if (texture.neverReady) {
                        continue; //do not use this layer
                    }

                    var maskPosible = false;
                    var skipOther = false;

                    if (texture.isMaskPosible()) {
                        if (texture.isMaskInfoReady()) {
                            if (texture.getMaskTexture()) {
                                bound.transparent = true;
                                maskPosible = true;
                            }
                        } else {
                            skipOther = true;
                            maskPosible = true;
                        }
                    }

                    sequenceMaskPosible.push(maskPosible);
                    
                    //var fullAndOpaque = !((surface.boundLayerSequence[j][1] < 1.0) || texture.extraBound || texture.getMaskTexture() || layer.isTransparent);
                    var fullAndOpaque = !((surface.boundLayerSequence[j][1] < 1.0) || maskPosible || layer.isTransparent);
                    if (fullAndOpaque) {
                        fullAndOpaqueCounter++;
                    }
                            
                    sequenceFullAndOpaque.push(fullAndOpaque);
                    
                    bound.sequence.push(layer.id);
                    bound.alpha[layer.id] = surface.boundLayerSequence[j];
                    tile.boundLayers[layer.id] = layer;
                    if (bound.alpha[layer.id][1] < 1.0 || layer.isTransparent) {
                        bound.transparent = true;
                    }

                    if (skipOther) {
                        break; //wait until mask info is loaded
                    }
                }
            }

            //filter out extra bounds if they are not needed
            //and remove all layer after first FullAndOpaque 
            if (fullAndOpaqueCounter > 0) {
                var newSequence = [];
                
                for (var i = bound.sequence.length - 1; i >= 0; i--) {
                    var layerId = bound.sequence[i];
                    
                    if (sequenceFullAndOpaque[i]) {
                        newSequence.unshift(layerId);   
                        break;
                    } else {
                        texture = tile.boundTextures[layerId];

                        if (bound.alpha[layerId][1] < 1.0 ||
                            tile.boundLayers[layerId].isTransparent ||
                            (sequenceMaskPosible[i] /*texture.getMaskTexture() /*&& !texture.extraBound*/)) {
                            newSequence.unshift(layerId);    
                        }
                    }
                }
                
                bound.sequence = newSequence; 
            }
            
        }
    } else if (surface.textureLayer != null) { //search surface
        if (fullUpdate) {
            layer = this.map.getBoundLayerById(surface.textureLayer);
            if (layer && layer.hasTileOrInfluence(tile.id)) {
                extraBound = null; 
                
                if (tile.id[0] > layer.lodRange[1]) {
                    extraBound = {
                        sourceTile : this.getParentTile(tile, layer.lodRange[1]),
                        sourceTexture : null,
                        layer : layer,
                        tile : tile 
                    };
                }

                bound.sequence.push(layer.id);
                tile.boundLayers[layer.id] = layer;
                if (!tile.boundTextures[layer.id]) {
                    path = layer.getUrl(tile.id);
                    tile.boundTextures[layer.id] = tile.resources.getTexture(path, null, extraBound, {tile: tile, layer: layer}, tile, false);
                }
            }
        }
    } else { //search submeshes
        if (submesh.textureLayer != 0) {
            layer = this.map.getBoundLayerByNumber(submesh.textureLayer);

            if (layer && layer.hasTileOrInfluence(tile.id)) {
                extraBound = null; 
                
                if (tile.id[0] > layer.lodRange[1]) {
                    extraBound = {
                        sourceTile : this.getParentTile(tile, layer.lodRange[1]),
                        sourceTexture : null,
                        layer : layer,
                        tile : tile 
                    };
                }

                //submeshes[j].textureLayerId = tile.id;
                tile.boundLayers[layer.id] = layer;
                if (!tile.boundTextures[layer.id]) {
                    path = layer.getUrl(tile.id);
                    tile.boundTextures[layer.id] = tile.resources.getTexture(path, null, extraBound, {tile: tile, layer: layer}, tile, false);
                }
            }
        }
    }

    //if (tile.id[0] == 10 && tile.id[1] == 273 && tile.id[2] == 171) {
      //  console.log(JSON.stringify(bound.sequence))
    //}
};


MapDrawTiles.prototype.drawTileInfo = function(tile, node, cameraPos, mesh) {
    var debug = this.debug, pos;

    if (!debug.drawMeshBBox) {
        //if (this.drawCredits) {
          //  node.drawBBox2(cameraPos);
        //} else {
        node.drawBBox(cameraPos);
        //}
    }

    //get screen pos of node
    if (node.metatile.useVersion < 4) {
        var min = node.bbox.min;
        var max = node.bbox.max;
    
        pos =  this.core.getRendererInterface().getCanvasCoords(
            [(min[0] + (max[0] - min[0])*0.5) - cameraPos[0],
                (min[1] + (max[1] - min[1])*0.5) - cameraPos[1],
                (max[2]) - cameraPos[2]],
             this.camera.getMvpMatrix());
    
        pos[2] = pos[2] * 0.9992;
    } else {
        var dx = node.bbox2[3] - node.bbox2[0]; 
        var dy = node.bbox2[4] - node.bbox2[1]; 
        var dz = node.bbox2[5] - node.bbox2[2]; 
    
        var d = Math.sqrt(dx*dx + dy*dy + dz*dz);
    
        pos =  this.core.getRendererInterface().getCanvasCoords(
            [(node.bbox2[12] + node.bbox2[15] + node.bbox2[18] + node.bbox2[21])*0.25 + node.diskNormal[0] * d*0.1 - cameraPos[0],
                (node.bbox2[13] + node.bbox2[16] + node.bbox2[19] + node.bbox2[22])*0.25 + node.diskNormal[1] * d*0.1 - cameraPos[1],
                (node.bbox2[14] + node.bbox2[17] + node.bbox2[20] + node.bbox2[23])*0.25 + node.diskNormal[2] * d*0.1 - cameraPos[2]],
             this.camera.getMvpMatrix());
        
        /*
            var pos =  this.core.getRendererInterface().getCanvasCoords(
                            [(node.diskPos[0] + node.diskNormal[0] * node.bboxHeight) - cameraPos[0],
                             (node.diskPos[1] + node.diskNormal[1] * node.bboxHeight) - cameraPos[1],
                             (node.diskPos[2] + node.diskNormal[2] * node.bboxHeight) - cameraPos[2]],
                             this.camera.getMvpMatrix());
        */
    }

    var factor = debug.debugTextSize, text, i, li;

    //draw lods
    if (debug.drawLods) {
        //text = '' + tile.id[0]; // + ' ta:' + Math.abs(tile.tiltAngle).toFixed(3);
        text = '' + tile.id[0] + ' l:' + Math.abs(tile.tiltAngle * tile.texelSize).toFixed(3) + '  g:' + this.renderer.drawnGeodataTilesFactor.toFixed(3);
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]-4*factor), 4*factor, text, [1,0,0,1], pos[2]);
    }

    //draw indices
    if (debug.drawIndices) {
        text = '' + tile.id[1] + ' ' + tile.id[2];
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]-11*factor), 4*factor, text, [0,1,1,1], pos[2]);
    }

    //draw positions
    if (debug.drawPositions) {
        //text = "" + min[0].toFixed(1) + " " + min[1].toFixed(1) + " " + min[2].toFixed(1);
        //text = "" + Math.floor(node.corners[0]) + " " + Math.floor(node.corners[1]) + " " + Math.floor(node.corners[2]) + " " + Math.floor(node.corners[3]);
        /*
        var b = node.border2;
        if (b) {
            text = '' + Math.floor(b[0]) + ' ' + Math.floor(b[1]) + ' ' + Math.floor(b[2]) + ' ' + Math.floor(b[3]) + ' ' + Math.floor(b[4]) + ' ' + Math.floor(b[5]) + ' ' + Math.floor(b[6]) + ' ' + Math.floor(b[7]) + ' ' + Math.floor(b[8]);
            this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+3*factor), 4*factor, text, [0,1,1,1], pos[2]);
        }

        b = node.border;
        if (b) {
            text = '' + Math.floor(b[0]) + ' ' + Math.floor(b[1]) + ' ' + Math.floor(b[2]) + ' ' + Math.floor(b[3]) + ' ' + Math.floor(b[4]) + ' ' + Math.floor(b[5]) + ' ' + Math.floor(b[6]) + ' ' + Math.floor(b[7]) + ' ' + Math.floor(b[8]);
            this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [0,1,1,1], pos[2]);
        }*/

        text = 'llx:' + Math.floor(node.llx) + ' lly:' + Math.floor(node.lly) + ' urx:' + Math.floor(node.urx) + ' ury:' + Math.floor(node.ury);
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+3*factor), 4*factor, text, [0,1,1,1], pos[2]);
    }

    //draw face count
    if (debug.drawFaceCount && mesh) {
        text = '' + mesh.faces + ' - ' + mesh.submeshes.length + ((tile.surface && tile.surface.glue) ? ' - 1' : ' - 0');
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [0,1,0,1], pos[2]);
    }

    //draw order
    if (debug.drawOrder) {
        text = '' + this.drawTileCounter + ' cmds: ' + (tile.drawCommands[0].length);
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [0,1,0,1], pos[2]);
    }

    if (debug.drawSurfaces) {
        text = JSON.stringify(tile.surface.id);
        if (node.alien) {
            text = '[A]' + text;
        }
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [1,1,1,1], pos[2]);
    }

    if (debug.drawBoundLayers) {
        if (tile.boundsDebug) {
            var surface = tile.resourceSurface;
            if (surface.glue) { 
              
                for (i = 0, li = surface.id.length; i < li; i++) {
                    if (tile.boundsDebug[surface.id[i]]) {
                        text = '< ' + surface.id[i] + ' >';
                        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+(10+i*7*2)*factor), 4*factor, text, [1,1,1,1], pos[2]);
                        text = JSON.stringify(tile.boundsDebug[surface.id[i]]);
                        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+(17+i*7*2)*factor), 4*factor, text, [1,1,1,1], pos[2]);
                    }
                }
                
            } else if (tile.boundsDebug[surface.id]) {
                text = '< ' + surface.id + ' >';
                this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [1,1,1,1], pos[2]);
    
                text = JSON.stringify(tile.boundsDebug[surface.id]);
                this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+17*factor), 4*factor, text, [1,1,1,1], pos[2]);
            }
        }
    }

    if (debug.drawCredits) {
        text = '{ ';
       
        for (var key in tile.imageryCredits) {
            if (tile.imageryCredits[key]) {
                text += key + ':' + tile.imageryCredits[key] + ', ';
            }
        }

        for (key in tile.glueImageryCredits) {
            if (!tile.imageryCredits[key]) {
                text += key + ':' + tile.glueImageryCredits[key] + ', ';
                //text += key + ", ";
            }
        }

        text += '}';

        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+10*factor), 4*factor, text, [1,1,1,1], pos[2]);
    }

    //draw distance
    if (debug.drawDistance) {
        text = '' + tile.distance.toFixed(2) + '  ' + tile.texelSize.toFixed(3) + '  ' + node.pixelSize.toFixed(3);
        text += '--' + tile.texelSize2.toFixed(3); 
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+17*factor), 4*factor, text, [1,0,1,1], pos[2]);
    }

    //draw node info
    if (debug.drawNodeInfo) {
        var children = ((node.flags & ((15)<<4))>>4);
        text = 'v' + node.metatile.version + '-' + node.flags.toString(2) + '-' + ((children & 1) ? '1' : '0') + ((children & 2) ? '1' : '0') + ((children & 4) ? '1' : '0') + ((children & 8) ? '1' : '0');
        text += '-' + node.minHeight + '/' + node.maxHeight+ '-' + Math.floor(node.minZ) + '/' + Math.floor(node.maxZ)+ '-' + Math.floor(node.surrogatez);
        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]-18*factor), 4*factor, text, [1,0,1,1], pos[2]);
    }
    
    //draw texture size
    if (debug.drawTextureSize && mesh) {
        var submeshes = mesh.submeshes;
        for (i = 0, li = submeshes.length; i < li; i++) {

            if (submeshes[i].internalUVs) {
                var texture = tile.surfaceTextures[i];
                if (texture) {
                    var gpuTexture = texture.getGpuTexture();
                    if (gpuTexture) {
                        text = '[' + i + ']: ' + gpuTexture.width + ' x ' + gpuTexture.height;
                        this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+(17+i*4*2)*factor), 4*factor, text, [1,1,1,1], pos[2]);
                    }
                }
            } else {
                text = '[' + i + ']: 256 x 256';
                this.drawText(Math.round(pos[0]-this.getTextSize(4*factor, text)*0.5), Math.round(pos[1]+(17+i*4*2)*factor), 4*factor, text, [1,1,1,1], pos[2]);
            }
        }
    }

};


export default MapDrawTiles;

