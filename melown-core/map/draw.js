

Melown.Map.prototype.draw = function() {
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;
    this.updateFogDensity();

    //loop map trees
    for (var i = 0, li = this.mapTrees_.length; i < li; i++) {
        this.mapTrees_[i].draw();
    }

    //loop currently used free layers
    for (var i = 0, li = this.freeLayers_.length; i < li; i++) {
        this.freeLayers_[i].draw();
    }

};

Melown.Map.prototype.areDrawCommandsReady = function(commands_, doNotLoad_) {
    for (var i = 0, li = commands_.length; i < li; i++) {
        var command_ = commands_[i];
        
        switch (command_.type_) {
            case "submesh":
                
                var mesh_ = command_.mesh_; 
                var texture_ = command_.texture_; 
                
                if (!(mesh_ && mesh_.isReady(doNotLoad_) &&
                      (!texture_  || (texture_ && texture_.isReady(doNotLoad_)))) ) {
                     return false;   
                }
                
                break;
        }
    }
    
    return true;
};

Melown.Map.prototype.applyCredits = function(tile_) {
    for (var key_ in tile_.credits_) {
        this.visibleCredits_.imagery_[key_] = true;
    }
};

Melown.Map.prototype.processDrawCommands = function(cameraPos_, commands_, doNotLoad_) {
    //var commands_ = tile_.drawCommands_;
    
    for (var i = 0, li = commands_.length; i < li; i++) {
        var command_ = commands_[i];
        
        switch (command_.type_) {
            case "state":
                this.renderer_.gpu_.setState(command_.state_);
                break;

            case "submesh":
                
                var mesh_ = command_.mesh_; 
                var texture_ = command_.texture_; 
                
                if (mesh_ && mesh_.isReady(doNotLoad_) &&
                    (!texture_  || (texture_ && texture_.isReady(doNotLoad_))) ) {
                    mesh_.drawSubmesh(cameraPos_, command_.submesh_, texture_, command_.material_, command_.alpha_);
                }
                
                break;
        }
    }
};

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_, pixelSize_, preventRedener_, preventLoad_) {
    //free tile resources when map view changed
    //if (this.viewCounter_ != tile_.viewCoutner_) {
      //  tile_.kill();
    //}

    tile_.renderReady_ = false;

    if (tile_.surface_ != null) {

        if (node_.hasGeometry()) {

            if (tile_.surfaceMesh_ == null) {
                var path_ = tile_.surface_.getMeshUrl(tile_.id_);
                tile_.surfaceMesh_ = new Melown.MapMesh(this, path_);
            }

            if (this.drawBBoxes_ && !preventRedener_) {
                this.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
            }
            
            this.stats_.drawnTiles_++;


            //var drawLastRenderState_ = false;

            if (tile_.drawCommands_.length > 0 && this.areDrawCommandsReady(tile_.drawCommands_, preventLoad_)) {
                if (!preventRedener_) {
                    this.processDrawCommands(cameraPos_, tile_.drawCommands_);
                    this.applyCredits(tile_);
                }
                tile_.lastRenderState_ = null;
                return;
            } else if (tile_.lastRenderState_){
                //drawLastRenderState_ = true;

                if (tile_.surfaceMesh_.isReady(true) == true) {
                    if (tile_.drawCommands_.length > 0) {
                        if (!preventRedener_) {
                            this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_, true);
                            this.applyCredits(tile_);
                        }
                        return;
                    }
                } else {
                    if (!preventRedener_) {
                        this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_, true);
                        this.applyCredits(tile_);
                    }
                }
            }


            if (tile_.surfaceMesh_.isReady(preventLoad_) && !preventLoad_) {
                var submeshes_ = tile_.surfaceMesh_.submeshes_;

                //tile_.drawCommands_ = [];
                //tile_.credits_ = {};

/*
                if (tile_.drawCommands_.length > 0) {
                    this.processDrawCommands(cameraPos_, tile_.drawCommands_);
                    this.applyCredits(tile_);
                    return;
                }
*/
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
                                                    var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                                                    tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                                                }

                                                //set credits
                                                for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                                                    tile_.credits_[node_.credits_[k]] = true;  
                                                }
                                                        
                                                tile_.drawCommands_.push({
                                                    type_ : "submesh",
                                                    mesh_ : tile_.surfaceMesh_,
                                                    submesh_ : i,
                                                    texture_ : tile_.surfaceTextures_[i],
                                                    material_ : "internal-nofog"
                                                });
                                            }
            
                                            tile_.drawCommands_.push({
                                                type_ : "state",
                                                state_ : this.drawBlendedTileState_
                                            });            
                                            
                                            var layers_ = bounds_.sequence_;
                                            for (var j = 0, lj = layers_.length; j < lj; j++) {
                                                var texture_ = tile_.boundTextures_[layers_[j]];
                                                if (texture_) {
                                                    //tile_.renderReady_ = true;

                                                    //set credits
                                                    var credits_ = tile_.boundLayers_[layers_[j]].creditsNumbers_;
                                                    for (var k = 0, lk = credits_.length; k < lk; k++) {
                                                        tile_.credits_[credits_[k]] = true;  
                                                    }

                                                    tile_.drawCommands_.push({
                                                        type_ : "submesh",
                                                        mesh_ : tile_.surfaceMesh_,
                                                        submesh_ : i,
                                                        texture_ : texture_,
                                                        material_ : "external-nofog",
                                                        alpha_ : bounds_.alpha_[layers_[j]][1]
                                                    });
                                                }
                                            }
                                            
                                            tile_.drawCommands_.push({
                                                type_ : "submesh",
                                                mesh_ : tile_.surfaceMesh_,
                                                submesh_ : i,
                                                texture_ : null,
                                                material_ : "fog"
                                            });                                                

                                            tile_.drawCommands_.push({
                                                type_ : "state",
                                                state_ : this.drawTileState_
                                            });  
                                        } else {
                                            var layerId_ = bounds_.sequence_[bounds_.sequence_.length-1];
                                            var texture_ = tile_.boundTextures_[layerId_];
                                            if (texture_) {
                                                //tile_.renderReady_ = true;
                                                //set credits
                                                var credits_ = tile_.boundLayers_[layerId_].creditsNumbers_;
                                                for (var k = 0, lk = credits_.length; k < lk; k++) {
                                                    tile_.credits_[credits_[k]] = true;  
                                                }
                                                
                                                tile_.drawCommands_.push({
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
                                            
                                            var texture_ = tile_.boundTextures_[submesh_.textureLayer_];
                                            
                                            if (texture_) {
                                                //tile_.renderReady_ = true;
                                                var layer_ = tile_.boundLayers_[submesh_.textureLayer_];
                                                
                                                if (layer_) {
                                                    //set credits
                                                    var credits_ = tile_.boundLayers_[submesh_.textureLayer_].creditsNumbers_;
                                                    for (var k = 0, lk = credits_.length; k < lk; k++) {
                                                        tile_.credits_[credits_[k]] = true;  
                                                    }
                                                } else {
                                                    //debugger;
                                                }
                                                
                                                //draw mesh
                                                tile_.drawCommands_.push({
                                                    type_ : "submesh",
                                                    mesh_ : tile_.surfaceMesh_,
                                                    submesh_ : i,
                                                    texture_ : texture_,
                                                    material_ : "external"
                                                });
                                            }
                                        } else {
            
                                            if (submesh_.internalUVs_) {  //draw surface
                                                if (tile_.surfaceTextures_[i] == null) {
                                                    var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                                                    tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                                                }
                                                
                                                //set credits
                                                for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                                                    tile_.credits_[node_.credits_[k]] = true;  
                                                }
    
                                                //draw mesh
                                                tile_.drawCommands_.push({
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
                                        var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                                        tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                                    } else {
                                        //set credits
                                        for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                                            tile_.credits_[node_.credits_[k]] = true;  
                                        }
                                        
                                        tile_.drawCommands_.push({
                                            type_ : "submesh",
                                            mesh_ : tile_.surfaceMesh_,
                                            submesh_ : i,
                                            texture_ : tile_.surfaceTextures_[i],
                                            material_ : "internal"
                                        });                                                
                                    }
                                }
                            }                            
                        }
                    }
                }

                if (this.areDrawCommandsReady(tile_.drawCommands_, preventLoad_)) {
                    if (!preventRedener_) {
                        this.processDrawCommands(cameraPos_, tile_.drawCommands_);
                        this.applyCredits(tile_);
                    }
                    
                    tile_.lastRenderState_ = null;
                } else if (tile_.lastRenderState_) {
                    if (!preventRedener_) {
                        this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_, true);
                        this.applyCredits(tile_);
                    }
                }
                
                
            }
        }
    } else {
        if (!preventRedener_ && tile_.lastRenderState_) {
            this.processDrawCommands(cameraPos_, tile_.lastRenderState_.drawCommands_, true);
            this.applyCredits(tile_);
        }
    }

};

Melown.Map.prototype.updateTileRenderCommands = function(tile_, submeshes_) {

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

Melown.Map.prototype.updateTileSurfaceBounds = function(tile_, submesh_, surface_, bound_, fullUpdate_) {

    //search map view
    if (surface_.boundLayerSequence_.length > 0) {
        if (fullUpdate_) {
            bound_.sequence_ = [];
            for (var j = 0, lj = surface_.boundLayerSequence_.length; j < lj; j++) {
                var layer_ = surface_.boundLayerSequence_[j][0];
                if (layer_ && layer_.hasTile(tile_.id_) && surface_.boundLayerSequence_[j][1] > 0) {
                    bound_.sequence_.push(layer_.id_);
                    bound_.alpha_[layer_.id_] = surface_.boundLayerSequence_[j];
                    tile_.boundLayers_[layer_.id_] = layer_;
                    if (!tile_.boundTextures_[layer_.id_]) {
                        var path_ = layer_.getUrl(tile_.id_);
                        if (!tile_.boundTextures_[layer_.id_]) {
                            tile_.boundTextures_[layer_.id_] = new Melown.MapTexture(this, path_);
                        }
                    }
                    if (bound_.alpha_[layer_.id_][1] < 1.0) {
                        bound_.transparent_ = true;
                    }
                }
            }
        }
    } else if (surface_.textureLayer_ != null) { //search surface
        if (fullUpdate_) {
            var layer_ = this.getBoundLayerById(surface_.textureLayer_);
            if (layer_ && layer_.hasTile(tile_.id_)) {
                bound_.sequence_.push(layer_.id_);
                tile_.boundLayers_[layer_.id_] = layer_;
                if (!tile_.boundTextures_[layer_.id_]) {
                    var path_ = layer_.getUrl(tile_.id_);
                    if (!tile_.boundTextures_[layer_.id_]) {
                        tile_.boundTextures_[layer_.id_] = new Melown.MapTexture(this, path_);
                    }
                }
            }
        }
    } else { //search submeshes
        if (submesh_.textureLayer_ != 0) {
            var layer_ = this.getBoundLayerByNumber(submesh_.textureLayer_);

            if (layer_ && layer_.hasTile(tile_.id_)) {
                //submeshes_[j].textureLayerId_ = tile_.id_;
                tile_.boundLayers_[layer_.id_] = layer_;
                if (!tile_.boundTextures_[layer_.id_]) {
                    var path_ = layer_.getUrl(tile_.id_);
                    if (!tile_.boundTextures_[layer_.id_]) {
                        tile_.boundTextures_[layer_.id_] = new Melown.MapTexture(this, path_);
                    }
                }
            }
        }
    }

};


Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    var mvp_;

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
    if (this.drawLods_ == true) {
        text_ = "" + tile_.id_[0];
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]-4*factor_), 4*factor_, text_, [255,0,0,255], pos_[2]);
    }

    //draw indices
    if (this.drawIndices_ == true) {
        var text_ = "" + tile_.id_[1] + " " + tile_.id_[2];
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]-11*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw positions
    if (this.drawPositions_ == true) {
        var text_ = "" + min_[0].toFixed(1) + " " + min_[1].toFixed(1) + " " + min_[2].toFixed(1);
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+3*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw face count
    if (this.drawFaceCount_ == true && mesh_ != null) {
        var text_ = "" + mesh_.faces_ + " - " + mesh_.submeshes_.length + ((tile_.surface_ && tile_.surface_.glue_) ? " - 1" : " - 0");
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,255,0,255], pos_[2]);
    }

    //draw distance
    if (this.drawDistance_ == true) {
        var text_ = "" + pixelSize_[1].toFixed(2) + "  " + pixelSize_[0].toFixed(2) + "  " + node_.pixelSize_.toFixed(2);
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [255,0,255,255], pos_[2]);
    }

/*
    //draw texture size
    if (this.drawTextureSize_ == true && gpuTile_ != null) {
        var text_ = "" + gpuTile_.texture_.width_ + " x " + gpuTile_.texture_.height_;
        this.drawText(Math.round(pos_[0]-(text_.length*4)*0.5), Math.round(pos_[1]-18), 4, text_, [255,255,255,255], pos_[2]);
    }

    //draw texel size
    if (this.drawTexelSize_ == true) {
*/


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
    var density_ = Math.log(0.05) / (cameraVisibility_ * 10*(Math.max(5,-orientation_[1])/90));
    density_ *= (5.0) / (Math.min(50000, Math.max(this.cameraDistance_, 1000)) /5000);

    if (this.drawFog_ == false) {
        density_ = 0;
    }
    
    //reduce fog when camera is facing down
    //density_ *= 1.0 - (-this.orientation_[0]/90)
    
    this.fogDensity_ = density_;
    this.renderer_.fogDensity_ = density_; 

    //console.log("fden: " + density_);
};

