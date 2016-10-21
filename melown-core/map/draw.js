

Melown.Map.prototype.draw = function(skipFreeLayers_) {
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;
    this.updateFogDensity();
    this.maxGpuUsed_ = this.gpuCache_.getMaxCost() * 0.9; 
    this.cameraCenter_ = this.position_.getCoords();
    this.stats_.renderBuild_ = 0;
    this.drawTileCounter_ = 0;
    
    for (var i = 0, li = this.tileBuffer_.length; i < li; i++) {
        this.tileBuffer_[i] = null;    
    }

    if (this.tree_.surfaceSequence_.length > 0) {
        this.tree_.draw();
    }

    //draw free layers    
    for (var i = 0, li = this.freeLayerSequence_.length; i < li; i++) {
        var layer_ = this.freeLayerSequence_[i];
        if (layer_.ready_ && layer_.tree_ && 
            (!layer_.geodata_ || (layer_.stylesheet_ && layer_.stylesheet_.isReady())) ) {
            
            if (layer_.type_ == "geodata") {
                this.drawMonoliticGeodata(layer_);
            } else {
                layer_.tree_.draw();
            }
        }
    }
    
    var cameraPos_ = this.cameraPosition_;
    
    //draw surface tiles stored in buffer
    for (var i = 0, li = this.tileBuffer_.length; i < li; i++) {
        var tiles_ = this.tileBuffer_[i];
        
        if (tiles_) {
            for (var j = 0, lj = tiles_.length; j < lj; j++) {
                var tile_ = tiles_[j];
                var surface_ = tile_.tile_.surface_;
                
                if (surface_ && !surface_.free_) { //do no draw free layers
                    //var tmp_ = this.zFactor_;
                    //this.zFactor_ += (surface_) ? surface_.zFactor_ : 0;
                    this.drawSurfaceTile(tile_.tile_, tile_.node_, cameraPos_, tile_.pixelSize_, tile_.priority_, false, false);
                    //this.zFactor_ = tmp_;
                }
            }
        } 
    }

    if (!skipFreeLayers_) {
        //draw free layers tiles stored in buffer
        if (this.freeLayerSequence_.length > 0) {
            for (var i = 0, li = this.tileBuffer_.length; i < li; i++) {
                var tiles_ = this.tileBuffer_[i];
                
                if (tiles_) {
                    for (var j = 0, lj = tiles_.length; j < lj; j++) {
                        var tile_ = tiles_[j];
                        var surface_ = tile_.tile_.surface_;
                        
                        if (surface_ && surface_.free_) { //draw only free layers
                            var tmp_ = this.zFactor_;
                            this.zFactor_ += (surface_) ? surface_.zFactor_ : 0;
                            this.drawSurfaceTile(tile_.tile_, tile_.node_, cameraPos_, tile_.pixelSize_, tile_.priority_, false, false);
                            this.zFactor_ = tmp_;
                        }
                    }
                } 
            }
        }
    
        if (this.freeLayersHaveGeodata_) {
            this.renderer_.drawGpuJobs();
            this.renderer_.clearJobBuffer();
        }
    }
};

Melown.Map.prototype.areDrawCommandsReady = function(commands_, priority_, doNotLoad_) {
    var ready_ = true;
    
    for (var i = 0, li = commands_.length; i < li; i++) {
        var command_ = commands_[i];
        
        switch (command_.type_) {
            case "submesh":
                
                var mesh_ = command_.mesh_; 
                var texture_ = command_.texture_; 
                
                var meshReady_ = (mesh_ && mesh_.isReady(doNotLoad_, priority_, true));
                var textureReady_ = (!texture_  || (texture_ && texture_.isReady(doNotLoad_, priority_, true)));
                
                if (!(meshReady_ && textureReady_) ) {
                     ready_ = false;   
                }
                
                break;

            case "geodata":
                
                var geodataView_ = command_.geodataView_; 
                
                if (!(geodataView_ && geodataView_.isReady(doNotLoad_, priority_, true))) {
                     ready_ = false;   
                }
                
                break;
        }
    }
    
    return ready_;
};

Melown.Map.prototype.applyCredits = function(tile_) {
    for (var key_ in tile_.imageryCredits_) {
        var value_ = tile_.imageryCredits_[key_];
        var value2_ = this.visibleCredits_.imagery_[key_];

        if (value2_) {
            this.visibleCredits_.imagery_[key_] = value_ > value2_ ? value_ : value2_;
        } else {
            this.visibleCredits_.imagery_[key_] = value_;
        }
    }
    for (var key_ in tile_.glueImageryCredits_) {
        var value_ = tile_.glueImageryCredits_[key_];
        var value2_ = this.visibleCredits_.imagery_[key_];

        if (value2_) {
            this.visibleCredits_.glueImagery_[key_] = value_ > value2_ ? value_ : value2_;
        } else {
            this.visibleCredits_.glueImagery_[key_] = value_;
        }
    }
    for (var key_ in tile_.mapdataCredits_) {
        var value_ = tile_.mapdataCredits_[key_];
        var value2_ = this.visibleCredits_.mapdata_[key_];

        if (value2_) {
            this.visibleCredits_.mapdata_[key_] = value_ > value2_ ? value_ : value2_;
        } else {
            this.visibleCredits_.mapdata_[key_] = value_;
        }
    }
    
    /*if (this.drawBBoxes_) {
        console.log(JSON.stringify(tile_.id_) + " " + JSON.stringify(this.visibleCredits_));
    }*/
};

Melown.Map.prototype.processDrawCommands = function(cameraPos_, commands_, priority_, doNotLoad_) {
    //var commands_ = tile_.drawCommands_;

    if (commands_.length > 0) {
        this.drawTileCounter_++;
    }
    
    for (var i = 0, li = commands_.length; i < li; i++) {
        var command_ = commands_[i];
        
        switch (command_.type_) {
            case "state":
                this.renderer_.gpu_.setState(command_.state_);
                break;

            case "submesh":
                //this.renderer_.gpu_.setState(this.drawBlendedTileState_);
                
                var mesh_ = command_.mesh_; 
                var texture_ = command_.texture_;

                var meshReady_ = (mesh_ && mesh_.isReady(doNotLoad_, priority_));
                var textureReady_ = (!texture_  || (texture_ && texture_.isReady(doNotLoad_, priority_)));
                
                if (meshReady_ && textureReady_) {
                    //debug bbox
                    if (this.drawBBoxes_ && this.drawMeshBBox_) {
                        mesh_.submeshes_[command_.submesh_].drawBBox(cameraPos_);
                    }

                    mesh_.drawSubmesh(cameraPos_, command_.submesh_, texture_, command_.material_, command_.alpha_);
                } else {
                    i = i;
                    //this should not happen
                }
                
                break;
                
            case "geodata":
                
                var geodataView_ = command_.geodataView_; 
                
                if (geodataView_ && geodataView_.isReady(doNotLoad_, priority_, true)) {
                     geodataView_.draw(cameraPos_);
                }
                
                break;
        }
    }
};

Melown.debugId_ = [144, 8880, 5492];

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_) {
    /*if (tile_.id_[0] == Melown.debugId_[0] && //debuf stufff
        tile_.id_[1] == Melown.debugId_[1] &&
        tile_.id_[2] == Melown.debugId_[2]) {
            tile_ = tile_;
    }*/

    /*if (tile_.id_[0] == 22 &&
        tile_.id_[1] == 1862678 &&
        tile_.id_[2] == 826010) {
        tile_ = tile_;
        //return true;
    }*/


    if (this.stats_.gpuRenderUsed_ >= this.maxGpuUsed_) {
        if (tile_.surface_) {
            if (!tile_.surface_.geodata_) {
                tile_ = tile_;
            }
        }

        return false;
    }

    tile_.renderReady_ = false;
    
    if (tile_.surface_) {
        if (node_.hasGeometry()) {

            if (this.drawBBoxes_ && !preventRedener_) {
                this.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
            }
            
            if (!preventRedener_) {
                this.stats_.renderedLods_[tile_.id_[0]]++;
                this.stats_.drawnTiles_++;
            }
           
            if (tile_.resetDrawCommands_) {
                tile_.drawCommands_ = [[], [], []];
                tile_.updateBounds_ = true;
        
                if (tile_.bounds_) {
                    for (var key_ in tile_.bounds_) {
                        tile_.bounds_[key_].viewCoutner_ = 0; 
                    }
                }
                
                tile_.resetDrawCommands_ = false;
            }


            if (!tile_.surface_.geodata_) {
                return this.drawMeshTile(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_);
            } else {
                return this.drawGeodataTile(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_);
            }
        } else {
            return true;
        }
    } else {
        if (!preventRedener_ && tile_.lastRenderState_) {
            var channel_ = this.drawChannel_;
            this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_[channel_], priority_, true);
            this.applyCredits(tile_);
            return true;
        }
    }
};

Melown.Map.prototype.drawMeshTile = function(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_) {
    if (tile_.surfaceMesh_ == null) {
        var path_ = tile_.surface_.getMeshUrl(tile_.id_);
        tile_.surfaceMesh_ = tile_.resources_.getMesh(path_);
    }

    var channel_ = this.drawChannel_;
    var ret_ = false;

    if (tile_.drawCommands_[channel_].length > 0 && this.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_)) {
        if (!preventRedener_) {
            this.processDrawCommands(cameraPos_, tile_.drawCommands_[channel_], priority_);
            this.applyCredits(tile_);
        }
        tile_.lastRenderState_ = null;
        return true;
    } else if (tile_.lastRenderState_){

        if (tile_.surfaceMesh_.isReady(true, priority_) == true) {
            if (tile_.drawCommands_[channel_].length > 0) {
                if (!preventRedener_) {
                    this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_[channel_], priority_, true);
                    this.applyCredits(tile_);
                }
                return true;
            }
        } else {
            if (!preventRedener_) {
                this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_[channel_], priority_, true);
                this.applyCredits(tile_);
            }
            ret_ = true;
        }
    }
    
    if (tile_.drawCommands_[channel_].length > 0) { //this is new but probably harmless
        //return false;
    } 

    if (tile_.surfaceMesh_.isReady(preventLoad_, priority_) && !preventLoad_) {
        var submeshes_ = tile_.surfaceMesh_.submeshes_;

        if (tile_.id_[0] == 22 &&
            tile_.id_[1] == 1862678 &&
            tile_.id_[2] == 826010) {
            tile_ = tile_;
        }    

        tile_.drawCommands_ = [[], [], []]; //??
        tile_.imageryCredits_ = {};
        tile_.boundsDebug_ = {}; //used for inspector

        var specificity_ = 0;
        
        if (tile_.surface_.glue_) {
            var surfaces_ = tile_.surface_.id_; 
            for (var i = 0, li = surfaces_.length; i < li; i++) {
                var surface_ = this.getSurface(surfaces_[i]);
                if (surface_) {
                    specificity_ = Math.max(specificity_, surface_.specificity_);
                }
            }

            //set credits
            for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                tile_.glueImageryCredits_[node_.credits_[k]] = specificity_;  
            }

        } else {
            specificity_ = tile_.surface_.specificity_;

            //set credits
            for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                tile_.imageryCredits_[node_.credits_[k]] = specificity_;  
            }
        }

        for (var i = 0, li = submeshes_.length; i < li; i++) {
            var submesh_ = submeshes_[i];
            
            //debug bbox
            if (this.drawBBoxes_ && this.drawMeshBBox_ && !preventRedener_) {
                submesh_.drawBBox(cameraPos_);
            }

            if (submesh_.externalUVs_) {
                if (tile_.updateBounds_) {
                    tile_.updateBounds_ = false;
                    
                    this.updateTileBounds(tile_, submeshes_);
                }
                
                var surface_ = tile_.surface_;
                if (surface_.glue_ /*&& submesh_.surfaceReference_ != 0*/) { //glue have multiple surfaces per tile
                    surface_ = tile_.surface_.getSurfaceReference(submesh_.surfaceReference_);
                }

                if (surface_ != null) {
                    var bounds_ = tile_.bounds_[surface_.id_];
                    
                    if (bounds_) {
                        if (submesh_.externalUVs_) {

                            //draw bound layers
                            if (bounds_.sequence_.length > 0) {
                                if (bounds_.transparent_) {
                                    if (submesh_.internalUVs_) {  //draw surface
                                        if (tile_.surfaceTextures_[i] == null) {
                                            var path_ = tile_.surface_.getTextureUrl(tile_.id_, i);
                                            tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_);
                                        }
                                                
                                        tile_.drawCommands_[0].push({
                                            type_ : "submesh",
                                            mesh_ : tile_.surfaceMesh_,
                                            submesh_ : i,
                                            texture_ : tile_.surfaceTextures_[i],
                                            material_ : "internal-nofog"
                                        });
                                    }
    
                                    tile_.drawCommands_[0].push({
                                        type_ : "state",
                                        state_ : this.drawBlendedTileState_
                                    });            
                                    
                                    var layers_ = bounds_.sequence_;
                                    for (var j = 0, lj = layers_.length; j < lj; j++) {
                                        var texture_ = tile_.boundTextures_[layers_[j]];
                                        if (texture_) {

                                            //debug stuff
                                            if (!tile_.boundsDebug_[surface_.id_]) {
                                                tile_.boundsDebug_[surface_.id_] = [];
                                            }
                                            tile_.boundsDebug_[surface_.id_].push(layers_[j]);

                                            //set credits
                                            var layer_ = tile_.boundLayers_[layers_[j]];
                                            var credits_ = layer_.credits_;
                                            for (var k = 0, lk = credits_.length; k < lk; k++) {
                                                tile_.imageryCredits_[credits_[k]] = layer_.specificity_;  
                                            }

                                            tile_.drawCommands_[0].push({
                                                type_ : "submesh",
                                                mesh_ : tile_.surfaceMesh_,
                                                submesh_ : i,
                                                texture_ : texture_,
                                                material_ : "external-nofog",
                                                alpha_ : bounds_.alpha_[layers_[j]][1]
                                            });
                                        }
                                    }
                                    
                                    tile_.drawCommands_[0].push({
                                        type_ : "submesh",
                                        mesh_ : tile_.surfaceMesh_,
                                        submesh_ : i,
                                        texture_ : null,
                                        material_ : "fog"
                                    });                                                

                                    tile_.drawCommands_[0].push({
                                        type_ : "state",
                                        state_ : this.drawTileState_
                                    });  
                                } else {
                                    var layerId_ = bounds_.sequence_[bounds_.sequence_.length-1];
                                    var texture_ = tile_.boundTextures_[layerId_];
                                    if (texture_) {

                                        //debug stuff
                                        if (!tile_.boundsDebug_[surface_.id_]) {
                                            tile_.boundsDebug_[surface_.id_] = [];
                                        }
                                        tile_.boundsDebug_[surface_.id_].push(layerId_);
                                        
                                        //set credits
                                        var layer_ = tile_.boundLayers_[layerId_];
                                        var credits_ = layer_.credits_;
                                        for (var k = 0, lk = credits_.length; k < lk; k++) {
                                            tile_.imageryCredits_[credits_[k]] = layer_.specificity_;  
                                        }
                                        
                                        tile_.drawCommands_[0].push({
                                            type_ : "submesh",
                                            mesh_ : tile_.surfaceMesh_,
                                            submesh_ : i,
                                            texture_ : texture_,
                                            material_ : "external"
                                        });
                                    }
                                }
                               
                            } else {
                                if (submesh_.textureLayer_) {
                                    
                                    var layer_ = this.getBoundLayerByNumber(submesh_.textureLayer_);
                                    
                                    if (layer_) {
                                        var texture_ = tile_.boundTextures_[layer_.id_];
                                        
                                        if (texture_) {
                                            
                                            //debug stuff
                                            if (!tile_.boundsDebug_[surface_.id_]) {
                                                tile_.boundsDebug_[surface_.id_] = [];
                                            }
                                            tile_.boundsDebug_[surface_.id_].push(layer_.id_);
                                            
                                            //set credits
                                            var layer_ = tile_.boundLayers_[layer_.id_];
                                            var credits_ = layer_.credits_;
                                            for (var k = 0, lk = credits_.length; k < lk; k++) {
                                                tile_.imageryCredits_[credits_[k]] = layer_.specificity_;  
                                            }
                                            
                                            //draw mesh
                                            tile_.drawCommands_[0].push({
                                                type_ : "submesh",
                                                mesh_ : tile_.surfaceMesh_,
                                                submesh_ : i,
                                                texture_ : texture_,
                                                material_ : "external"
                                            });
                                        }
                                    }
                                   
                                } else {
    
                                    if (submesh_.internalUVs_) {  //draw surface
                                        if (tile_.surfaceTextures_[i] == null) {
                                            var path_ = tile_.surface_.getTextureUrl(tile_.id_, i);
                                            tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_);
                                        }

                                        //draw mesh
                                        tile_.drawCommands_[0].push({
                                            type_ : "submesh",
                                            mesh_ : tile_.surfaceMesh_,
                                            submesh_ : i,
                                            texture_ : tile_.surfaceTextures_[i],
                                            material_ : "internal"
                                        });
                                    }
    
                                }
                            }
    
                        } else if (submesh_.internalUVs_) {
    
                            if (tile_.surfaceTextures_[i] == null) {
                                var path_ = tile_.surface_.getTextureUrl(tile_.id_, i);
                                tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_);
                            } //else {
                                tile_.drawCommands_[0].push({
                                    type_ : "submesh",
                                    mesh_ : tile_.surfaceMesh_,
                                    submesh_ : i,
                                    texture_ : tile_.surfaceTextures_[i],
                                    material_ : "internal"
                                });                                                
                            //}
                        }
                    }                            
                }
            } else if (submesh_.internalUVs_) {

                if (tile_.surfaceTextures_[i] == null) {
                    var path_ = tile_.surface_.getTextureUrl(tile_.id_, i);
                    tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_);
                } //else {
                    tile_.drawCommands_[0].push({
                        type_ : "submesh",
                        mesh_ : tile_.surfaceMesh_,
                        submesh_ : i,
                        texture_ : tile_.surfaceTextures_[i],
                        material_ : "internal"
                    });                                                
                //}
            }
            
            //depth path
            tile_.drawCommands_[1].push({
                type_ : "submesh",
                mesh_ : tile_.surfaceMesh_,
                submesh_ : i,
                material_ : "depth"
            });
            
        }

        if (this.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_)) {
            if (!preventRedener_) {
                this.processDrawCommands(cameraPos_, tile_.drawCommands_[channel_], priority_);
                this.applyCredits(tile_);
            }
            
            tile_.lastRenderState_ = null;
            ret_ = true;
        } else if (tile_.lastRenderState_) {
            if (!preventRedener_) {
                this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_[channel_], priority_, true);
                this.applyCredits(tile_);
            }
            ret_ = true;
        }
    }
    
    return ret_;
};

Melown.Map.prototype.drawGeodataTile = function(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_) {
    if (tile_.id_[0] <= 1) {
        return true;
    }

    /*if (tile_.id_[0] == 21 && 
        tile_.id_[1] == 566376 &&
        tile_.id_[2] == 355252 ){ 
//        return true;        
    }*/

    if (tile_.surfaceGeodata_ == null) {
        var path_;
        
        if (tile_.surface_.geodataNavtileInfo_) {
            var navtile_ = this.tree_.findNavTile(tile_.id_);
            
            if (navtile_ && navtile_.surface_) {
                var navtileStr_ = navtile_.surface_.getNavUrl(navtile_.id_) + ";"
                                  + navtile_.id_[0] + "-" + navtile_.id_[1] + "-" + navtile_.id_[2] + ";"      
                                  + navtile_.metanode_.minHeight_ + ";" + navtile_.metanode_.maxHeight_;     
                path_ = tile_.surface_.getGeodataUrl(tile_.id_, encodeURIComponent(navtileStr_));
            }
        }
        
        if (!path_) {
            path_ = tile_.surface_.getGeodataUrl(tile_.id_, "");
        }

        tile_.surfaceGeodata_ = tile_.resources_.getGeodata(path_, {tile_:tile_, surface_:tile_.surface_});
    }

    var channel_ = this.drawChannel_;
    
    if (tile_.geodataCounter_ != tile_.surface_.geodataCounter_) {
        tile_.drawCommands_ = [[],[],[]];

        if (tile_.surfaceGeodataView_ != null) {
            tile_.surfaceGeodataView_.kill();
        }
        
        tile_.surfaceGeodataView_ = null;
        tile_.geodataCounter_ = tile_.surface_.geodataCounter_;
    }

    if (tile_.drawCommands_[channel_].length > 0 && this.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_)) {
        if (!preventRedener_) {
            this.processDrawCommands(cameraPos_, tile_.drawCommands_[channel_], priority_);
            this.applyCredits(tile_);
        }
        tile_.lastRenderState_ = null;
        return true;
    }
/*    
     else if (tile_.lastRenderState_){

        if (tile_.surfaceGeodata_.isReady(true, priority_) == true) {
            if (tile_.drawCommands_[channel_].length > 0) {
                if (!preventRedener_) {
                    this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_[channel_], priority_, true);
                    this.applyCredits(tile_);
                }
                return;
            }
        } else {
            if (!preventRedener_) {
                this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_[channel_], priority_, true);
                this.applyCredits(tile_);
            }
        }
    }
*/

    if (!tile_.surfaceGeodataView_) {
        if (tile_.surfaceGeodata_.isReady(preventLoad_, priority_) && !preventLoad_) {
            tile_.surfaceGeodataView_ = new Melown.MapGeodataView(this, tile_.surfaceGeodata_, {tile_:tile_, surface_:tile_.surface_});
        }
    }

    if (tile_.surfaceGeodataView_) {
        tile_.mapdataCredits_ = {};
        
        var specificity_ = (tile_.surface_) ? tile_.surface_.specificity_ : 0;

        //set credits
        for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
            tile_.mapdataCredits_[node_.credits_[k]] = specificity_;  
        }

        //if (tile_.drawCommands_[channel_].length == 0) {
            tile_.drawCommands_[channel_][0] = {
                type_ : "geodata",
                geodataView_ : tile_.surfaceGeodataView_ 
            };
        //}
        return tile_.surfaceGeodataView_.isReady();
    }

    return false;
};

Melown.Map.prototype.drawMonoliticGeodata = function(surface_) {
    if (!surface_) {
        return;
    }

    if (!this.camera_.bboxVisible(surface_.extents_, this.cameraPosition_)) {
        return;
    }

    if (surface_.monoGeodata_ == null) {
        var path_ = surface_.getMonoGeodataUrl(surface_.id_);
        surface_.monoGeodata_ = new Melown.MapGeodata(this, path_, {tile_:null, surface_:surface_});
    }

    var channel_ = this.drawChannel_;
    
    if (surface_.monoGeodataCounter_ != surface_.geodataCounter_) {
        surface_.monoGeodataView_ = null;
        surface_.monoGeodataCounter_ = surface_.geodataCounter_;
    }

    if (surface_.monoGeodata_.isReady()) {

        if (!surface_.monoGeodataView_) {
            surface_.monoGeodataView_ = new Melown.MapGeodataView(this, surface_.monoGeodata_, {tile_:null, surface_:surface_});
        }
        
        if (surface_.monoGeodataView_.isReady()) {
            surface_.monoGeodataView_.draw(this.cameraPosition_);
        }

        /*
        surface_.credits_ = {};

        //set credits
        for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
            surface_.credits_[node_.credits_[k]] = true;  
        }

        this.applyCredits(surface_);
        */
    }
};

Melown.Map.prototype.updateTileRenderCommands = function(tile_, submeshes_) {

};

Melown.Map.prototype.updateTileBoundsDirectly = function(preventLoad_, priority_) {
    if (tile_.surfaceMesh_.isReady(preventLoad_, priority_) && !preventLoad_) {
        this.updateTileBounds(tile_, tile_.surfaceMesh_.submeshes_);
    }
};

Melown.Map.prototype.updateTileBounds = function(tile_, submeshes_) {
    for (var i = 0, li = submeshes_.length; i < li; i++) {
        var submesh_ = submeshes_[i];
        
        if (submesh_.externalUVs_) {
            var submeshSurface_ = tile_.surface_;

            if (tile_.surface_.glue_) { //glue have multiple surfaces per tile
                submeshSurface_ = tile_.surface_.getSurfaceReference(submesh_.surfaceReference_);
            }
            
            if (submeshSurface_) {
                var bounds_ = tile_.bounds_[submeshSurface_.id_];
                
                if (!bounds_) {
                    bounds_ = {
                        sequence_ : [],
                        alpha_ : [],
                        transparent_ : false,
                        viewCoutner_ : 0
                    };
                    
                    tile_.bounds_[submeshSurface_.id_] = bounds_;
                } 
                
                if (bounds_.viewCoutner_ != tile_.viewCoutner_) {
                    this.updateTileSurfaceBounds(tile_, submesh_, submeshSurface_, bounds_, bounds_.viewCoutner_ != tile_.viewCoutner_);
                    //bounds_.viewCoutner_ = tile_.viewCoutner_;
                }  
            }
        }
    }

    for (var key_ in tile_.bounds_) {
        tile_.bounds_[key_].viewCoutner_ = tile_.viewCoutner_;
    }
};

Melown.Map.prototype.getParentTile = function(tile_, lod_) {
    while(tile_ && tile_.id_[0] > lod_) {
        tile_ = tile_.parent_;
    }
    
    return tile_;
};

Melown.Map.prototype.getTileTextureTransform = function(sourceTile_, targetTile_) {
    var shift_ = targetTile_.id_[0] - sourceTile_.id_[0];
    var x = sourceTile_.id_[1] << shift_;
    var y = sourceTile_.id_[2] << shift_;
    var s = 1.0 / Math.pow(2.0, shift_);
    return [ s, s, (targetTile_.id_[1] - x) * s, (targetTile_.id_[2] - y) * s ];
};

Melown.Map.prototype.updateTileSurfaceBounds = function(tile_, submesh_, surface_, bound_, fullUpdate_) {
    /*if (tile_.id_[0] == Melown.debugId_[0] &&
        tile_.id_[1] == Melown.debugId_[1] &&
        tile_.id_[2] == Melown.debugId_[2]) {
            tile_ = tile_;
    }*/
        
    //search map view
    if (surface_.boundLayerSequence_.length > 0) {
        if (fullUpdate_) {
            bound_.sequence_ = [];
            var sequenceFullAndOpaque_ = [];
            var fullAndOpaqueCounter_ = 0;
            
            for (var j = 0, lj = surface_.boundLayerSequence_.length; j < lj; j++) {
                var layer_ = surface_.boundLayerSequence_[j][0];
                
                if (layer_ && layer_.ready_ && layer_.hasTileOrInfluence(tile_.id_) && surface_.boundLayerSequence_[j][1] > 0) {
                    var extraBound_ = null; 
                    
                    if (tile_.id_[0] > layer_.lodRange_[1]) {
                        extraBound_ = {
                            sourceTile_ : this.getParentTile(tile_, layer_.lodRange_[1]),
                            sourceTexture_ : null,
                            layer_ : layer_,
                            tile_ : tile_ 
                        };
                    }

                    if (!tile_.boundTextures_[layer_.id_]) {
                        var path_ = layer_.getUrl(tile_.id_);
                        tile_.boundTextures_[layer_.id_] = tile_.resources_.getTexture(path_, null, extraBound_, {tile_: tile_, layer_: layer_});
                    } else {
                        var texture_ = tile_.boundTextures_[layer_.id_];

                        if (tile_.boundTextures_[layer_.id_].neverReady_) {
                            continue; //do not use this layer
                        }

                        if (texture_.getMaskTexture()) {
                            bound_.transparent_ = true;
                        }
                    }
                    
                    var texture_ = tile_.boundTextures_[layer_.id_];
                    
                    var fullAndOpaque_ = !((surface_.boundLayerSequence_[j][1] < 1.0) || texture_.extraBound_ || texture_.getMaskTexture() || layer_.isTransparent_);
                    if (fullAndOpaque_) {
                        fullAndOpaqueCounter_++;
                    }
                            
                    sequenceFullAndOpaque_.push(fullAndOpaque_);
                    
                    bound_.sequence_.push(layer_.id_);
                    bound_.alpha_[layer_.id_] = surface_.boundLayerSequence_[j];
                    tile_.boundLayers_[layer_.id_] = layer_;
                    if (bound_.alpha_[layer_.id_][1] < 1.0 || layer_.isTransparent_) {
                        bound_.transparent_ = true;
                    }
                }
            }

            //filter out extra bounds if they are not needed
            //and remove all layer after first FullAndOpaque 
            if (fullAndOpaqueCounter_ > 0) {
                var newSequence_ = [];
                var firstFull_ = false; 
                
                for (var i = bound_.sequence_.length - 1; i >= 0; i--) {
                    var layerId_ = bound_.sequence_[i];
                    
                    if (sequenceFullAndOpaque_[i]) {
                        newSequence_.unshift(layerId_);    
                        break;
                    } else {
                        var texture_ = tile_.boundTextures_[layerId_];

                        if (bound_.alpha_[layerId_][1] < 1.0 ||
                            tile_.boundLayers_[layerId_].isTransparent_ ||
                            (texture_.getMaskTexture() && !texture_.extraBound_)) {
                            newSequence_.unshift(layerId_);    
                        }
                    }
                }
                
                bound_.sequence_ = newSequence_; 
            }
            
        }
    } else if (surface_.textureLayer_ != null) { //search surface
        if (fullUpdate_) {
            var layer_ = this.getBoundLayerById(surface_.textureLayer_);
            if (layer_ && layer_.hasTileOrInfluence(tile_.id_)) {
                var extraBound_ = null; 
                
                if (tile_.id_[0] > layer_.lodRange_[1]) {
                    extraBound_ = {
                        sourceTile_ : this.getParentTile(tile_, layer_.lodRange_[1]),
                        sourceTexture_ : null,
                        layer_ : layer_,
                        tile_ : tile_ 
                    };
                }

                bound_.sequence_.push(layer_.id_);
                tile_.boundLayers_[layer_.id_] = layer_;
                if (!tile_.boundTextures_[layer_.id_]) {
                    var path_ = layer_.getUrl(tile_.id_);
                    tile_.boundTextures_[layer_.id_] = tile_.resources_.getTexture(path_, null, extraBound_, {tile_: tile_, layer_: layer_});
                }
            }
        }
    } else { //search submeshes
        if (submesh_.textureLayer_ != 0) {
            var layer_ = this.getBoundLayerByNumber(submesh_.textureLayer_);

            if (layer_ && layer_.hasTileOrInfluence(tile_.id_)) {
                var extraBound_ = null; 
                
                if (tile_.id_[0] > layer_.lodRange_[1]) {
                    extraBound_ = {
                        sourceTile_ : this.getParentTile(tile_, layer_.lodRange_[1]),
                        sourceTexture_ : null,
                        layer_ : layer_,
                        tile_ : tile_ 
                    };
                }

                //submeshes_[j].textureLayerId_ = tile_.id_;
                tile_.boundLayers_[layer_.id_] = layer_;
                if (!tile_.boundTextures_[layer_.id_]) {
                    var path_ = layer_.getUrl(tile_.id_);
                    tile_.boundTextures_[layer_.id_] = tile_.resources_.getTexture(path_, null, extraBound_, {tile_: tile_, layer_: layer_});
                }
            }
        }
    }

};


Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    if (!this.drawMeshBBox_) {
        node_.drawBBox(cameraPos_);
    }

    //get screen pos of node
    var min_ = node_.bbox_.min_;
    var max_ = node_.bbox_.max_;

    var pos_ =  this.core_.getRendererInterface().getCanvasCoords(
                    [(min_[0] + (max_[0] - min_[0])*0.5) - cameraPos_[0],
                     (min_[1] + (max_[1] - min_[1])*0.5) - cameraPos_[1],
                     (max_[2]) - cameraPos_[2]],
                     this.camera_.getMvpMatrix());

    pos_[2] = pos_[2] * 0.9992;

    var factor_ = this.debugTextSize_;

    //draw lods
    if (this.drawLods_) {
        text_ = "" + tile_.id_[0];
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]-4*factor_), 4*factor_, text_, [255,0,0,255], pos_[2]);
    }

    //draw indices
    if (this.drawIndices_) {
        var text_ = "" + tile_.id_[1] + " " + tile_.id_[2];
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]-11*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw positions
    if (this.drawPositions_) {
        var text_ = "" + min_[0].toFixed(1) + " " + min_[1].toFixed(1) + " " + min_[2].toFixed(1);
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+3*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw face count
    if (this.drawFaceCount_ && mesh_) {
        var text_ = "" + mesh_.faces_ + " - " + mesh_.submeshes_.length + ((tile_.surface_ && tile_.surface_.glue_) ? " - 1" : " - 0");
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,255,0,255], pos_[2]);
    }

    //draw order
    if (this.drawOrder_) {
        var text_ = "" + this.drawTileCounter_;
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,255,0,255], pos_[2]);
    }

    if (this.drawSurfaces_) {
        var text_ = JSON.stringify(tile_.surface_.id_);
        if (node_.alien_) {
            text_ = "[A]" + text_;
        }
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
    }

    if (this.drawBoundLayers_) {
        if (tile_.boundsDebug_) {
            var surface_ = tile_.surface_;
            if (surface_.glue_) { 
              
                for (var i = 0, li = surface_.id_.length; i < li; i++) {
                    if (tile_.boundsDebug_[surface_.id_[i]]) {
                        var text_ = "< " + surface_.id_[i] + " >";
                        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+(10+i*7*2)*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
                        text_ = JSON.stringify(tile_.boundsDebug_[surface_.id_[i]]);
                        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+(17+i*7*2)*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
                    }
                }
                
            } else if (tile_.boundsDebug_[surface_.id_]) {
                var text_ = "< " + surface_.id_ + " >";
                this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
    
                text_ = JSON.stringify(tile_.boundsDebug_[surface_.id_]);
                this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
            }
        }
    }

    if (this.drawCredits_) {
        var text_ = "{ ";
       
        for (var key_ in tile_.imageryCredits_) {
            if (tile_.imageryCredits_[key_]) {
                text_ += key_ + ":" + tile_.imageryCredits_[key_] + ", ";
            }
        }

        for (var key_ in tile_.glueImageryCredits_) {
            if (!tile_.imageryCredits_[key_]) {
                text_ += key_ + ":" + tile_.glueImageryCredits_[key_] + ", ";
                //text_ += key_ + ", ";
            }
        }

        text_ += "}";

        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
    }

    //draw distance
    if (this.drawDistance_) {
        var text_ = "" + tile_.distance_.toFixed(2) + "  " + tile_.texelSize_.toFixed(3) + "  " + node_.pixelSize_.toFixed(3);
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [255,0,255,255], pos_[2]);
    }

    //draw node info
    if (this.drawNodeInfo_) {
        var children_ = ((node_.flags_ & ((15)<<4))>>4);
        var text_ = "" + node_.flags_.toString(2) + "-" + ((children_ & 1) ? "1" : "0") + ((children_ & 2) ? "1" : "0") + ((children_ & 4) ? "1" : "0") + ((children_ & 8) ? "1" : "0");
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]-18*factor_), 4*factor_, text_, [255,0,255,255], pos_[2]);
    }
    
    //draw texture size
    if (this.drawTextureSize_ && mesh_) {
        var submeshes_ = mesh_.submeshes_;
        for (var i = 0, li = submeshes_.length; i < li; i++) {

            if (submeshes_[i].internalUVs_) {
                var texture_ = tile_.surfaceTextures_[i];

                if (texture_ && texture_.gpuTexture_) {
                    var text_ = "[" + i + "]: " + texture_.gpuTexture_.width_ + " x " + texture_.gpuTexture_.height_;
                    this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+(17+i*7*2)*factor_), 4*factor_, text_, [255,255,255,255], pos_[2]);
                }
            }
        }
    }

};


Melown.Map.prototype.updateFogDensity = function() {
    // the fog equation is: exp(-density*distance), this gives the fraction
    // of the original color that is still visible at some distance

    // we define visibility as a distance where only 5% of the original color
    // is visible; from this it is easy to calculate the correct fog density

    //var density_ = Math.log(0.05) / this.core_.coreConfig_.cameraVisibility_;
    var pos_ = this.getPosition();
    var orientation_ = pos_.getOrientation();
    
    var cameraVisibility_ = this.camera_.getFar();
//    var density_ = Math.log(0.05) / (cameraVisibility_ * 10*(Math.max(5,-orientation_[1])/90));


    var atmosphereHeight_ = 100000;
    //this.cameraHeight_;

    //var density_ = Math.log(0.05) / (cameraVisibility_ * (Math.max(5,-orientation_[1])/90));
    
    var tiltFactor_ = (Math.max(5,-orientation_[1])/90);
    var heightFactor_ = 1-Math.max(0,Math.min(1.0,this.cameraHeight_ / atmosphereHeight_));
    
    //var density_ = ((Math.log(0.05) / (cameraVisibility_)) * tiltFactor_ * heightFactor_);
    var density_ = Math.log(0.05) / ((cameraVisibility_ * Math.max(1,this.cameraHeight_*0.0001))* tiltFactor_);
    density_ *= (5.0) / (Math.min(50000, Math.max(this.cameraDistance_, 1000)) /5000);

    if (!this.drawFog_) {
        density_ = 0;
    }
    
    //reduce fog when camera is facing down
    //density_ *= 1.0 - (-this.orientation_[0]/90)
    
    this.fogDensity_ = density_;
    this.renderer_.fogDensity_ = density_; 

    //console.log("fden: " + density_);
};

