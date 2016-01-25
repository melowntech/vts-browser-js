

Melown.Map.prototype.draw = function() {
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    //loop map trees
    for (var i = 0, li = this.mapTrees_.length; i < li; i++) {
        this.mapTrees_[i].draw();
    }

    //loop currently used free layers
    for (var i = 0, li = this.freeLayers_.length; i < li; i++) {
        this.freeLayers_[i].draw();
    }

};

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_, pixelSize_, reducedProcessing_) {
    //free tile resources when map view changed
    if (this.viewCounter_ != tile_.viewCoutner_) {
        tile_.kill();
    }

    tile_.renderReady_ = false;

    if (tile_.surface_ != null) {

        if (node_.hasGeometry()) {

            if (tile_.surfaceMesh_ == null) {
                var path_ = tile_.surface_.getMeshUrl(tile_.id_);
                tile_.surfaceMesh_ = new Melown.MapMesh(this, path_);
            }

            if (this.drawBBoxes_ && !reducedProcessing_) {
                this.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
            }

            if (tile_.surfaceMesh_.isReady() == true) {

                this.stats_.drawnTiles_++;
                var submeshes_ = tile_.surfaceMesh_.submeshes_;


                //hack for presentation
                for (var i = 0, li = submeshes_.length; i < li; i++) {
                    var submesh_ = submeshes_[i];
                    
                    if (!submesh_.textureLayer2_) {
                        submesh_.textureLayer_ = this.hackBounds2_; 
                    } else {
                        if (this.hackBounds_ != null) { // && submesh_.textureLayer2_) {
                            submesh_.textureLayer_ = this.hackBounds_;
                        }
                    }
                }

                for (var i = 0, li = submeshes_.length; i < li; i++) {
                    var submesh_ = submeshes_[i];
                    
                    if (tile_.surface_.glue_ && tile_.updateBounds_) {
                        tile_ = tile_;
                    }

                    //debug bbox
                    if (this.drawBBoxes_ && this.drawMeshBBox_ && !reducedProcessing_) {
                        submesh_.drawBBox(cameraPos_);
                    }

                    if (submesh_.externalUVs_) {

                        if (tile_.updateBounds_) {
                            tile_.updateBounds_ = false;

                            //search map view
                            if (tile_.surface_.boundLayerSequence_.length > 0) {
                                for (var j = 0, lj = tile_.surface_.boundLayerSequence_.length; j < lj; j++) {
                                    var layer_ = tile_.surface_.boundLayerSequence_[j][0];
                                    if (layer_ && layer_.hasTile(tile_.id_) && tile_.surface_.boundLayerSequence_[j][1] > 0) {
                                        tile_.boundSequence_.push(layer_.id_);
                                        tile_.boundLayers_[layer_.id_] = layer_;
                                        tile_.boundAlpha_[layer_.id_] = tile_.surface_.boundLayerSequence_[j];
                                        if (!tile_.boundTextures_[layer_.id_]) {
                                            var path_ = layer_.getUrl(tile_.id_);
                                            if (!tile_.boundTextures_[layer_.id_]) {
                                                tile_.boundTextures_[layer_.id_] = new Melown.MapTexture(this, path_);
                                            }
                                        }
                                        if (tile_.boundAlpha_[layer_.id_][1] < 1.0) {
                                            tile_.transparentBounds_ = true;
                                        }
                                    }
                                }
                            } else if (tile_.surface_.textureLayer_ != null) { //search surface
                                var layer_ = this.getBoundLayerById(tile_.surface_.textureLayer_);
                                if (layer_ && layer_.hasTile(tile_.id_)) {
                                    tile_.boundSequence_.push(layer_.id_);
                                    tile_.boundLayers_[layer_.id_] = layer_;
                                    if (!tile_.boundTextures_[layer_.id_]) {
                                        var path_ = layer_.getUrl(tile_.id_);
                                        if (!tile_.boundTextures_[layer_.id_]) {
                                            tile_.boundTextures_[layer_.id_] = new Melown.MapTexture(this, path_);
                                        }
                                    }
                                }
                            } else { //search submeshes
                                for (var j = 0; j < li; j++) {
                                    if (submeshes_[j].textureLayer_ != 0) {
                                        var layer_ = this.getBoundLayerByNumber(submeshes_[j].textureLayer_);

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
                            }
                        }

                        //draw bound layers
                        if (tile_.boundSequence_.length > 0) {
                            if (tile_.transparentBounds_) {
                                if (submesh_.internalUVs_) {  //draw surface
                                    if (tile_.surfaceTextures_[i] == null) {
                                        var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                                        tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                                    } else {
                                        if (tile_.surfaceTextures_[i].isReady() == true) {
                                            tile_.renderReady_ = true;
                                            if (!reducedProcessing_) {
                                                //set credits
                                                for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                                                    this.visibleCredits_.imagery_[node_.credits_[k]] = true;  
                                                }
                                    
                                                //draw mesh
                                                tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, tile_.surfaceTextures_[i], "internal-nofog");
                                            }
                                        }
                                    }
                                }

                                if (!reducedProcessing_) {
                                    this.renderer_.gpu_.setState(this.drawBlendedTileState_);
                                }
                                var layers_ = tile_.boundSequence_;
                                for (var j = 0, lj = layers_.length; j < lj; j++) {
                                    var texture_ = tile_.boundTextures_[layers_[j]];
                                    if (texture_ && texture_.isReady()) {
                                        tile_.renderReady_ = true;
                                        if (!reducedProcessing_) {
                                            //set credits
                                            var credits_ = tile_.boundLayers_[layers_[j]].creditsNumbers_;
                                            for (var k = 0, lk = credits_.length; k < lk; k++) {
                                                this.visibleCredits_.imagery_[credits_[k]] = true;  
                                            }
                                            
                                            //draw mesh
                                            tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, texture_, "external-nofog", tile_.boundAlpha_[layers_[j]][1]);
                                        }
                                    }
                                }
                                if (!reducedProcessing_) {
                                    tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, null, "fog");
                                    this.renderer_.gpu_.setState(this.drawTileState_);
                                }
                            } else {
                                var layerId_ = tile_.boundSequence_[tile_.boundSequence_.length-1];
                                var texture_ = tile_.boundTextures_[layerId_];
                                if (texture_ && texture_.isReady()) {
                                    tile_.renderReady_ = true;
                                    if (!reducedProcessing_) {
                                        //set credits
                                        var credits_ = tile_.boundLayers_[layerId_].creditsNumbers_;
                                        for (var k = 0, lk = credits_.length; k < lk; k++) {
                                            this.visibleCredits_.imagery_[credits_[k]] = true;  
                                        }
                                        
                                        //draw mesh
                                        tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, texture_, "external");
                                    }
                                }
                            }
                        } else {
                            if (submesh_.textureLayer_) {
                                
                                var texture_ = tile_.boundTextures_[submesh_.textureLayer_];
                                
                                if (texture_ && texture_.isReady() == true && !reducedProcessing_) {

                                    var layer_ = tile_.boundLayers_[submesh_.textureLayer_];
                                    
                                    if (layer_) {
                                        //set credits
                                        var credits_ = tile_.boundLayers_[submesh_.textureLayer_].creditsNumbers_;
                                        for (var k = 0, lk = credits_.length; k < lk; k++) {
                                            this.visibleCredits_.imagery_[credits_[k]] = true;  
                                        }
                                    } else {
                                        //debugger;
                                    }

                                    
                                    //draw mesh
                                    tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, texture_, "external");
                                }
                            } else {

                                if (submesh_.internalUVs_) {  //draw surface
                                    if (tile_.surfaceTextures_[i] == null) {
                                        var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                                        tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                                    } else {
                                        if (tile_.surfaceTextures_[i].isReady() == true) {
                                            tile_.renderReady_ = true;
                                            if (!reducedProcessing_) {
                                                //set credits
                                                for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                                                    this.visibleCredits_.imagery_[node_.credits_[k]] = true;  
                                                }
    
                                                //draw mesh
                                                tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, tile_.surfaceTextures_[i], "internal");
                                            }
                                        }
                                    }
                                }

                            }
                        }

                    } else if (submesh_.internalUVs_) {

                        if (tile_.surfaceTextures_[i] == null) {
                            var path_ = tile_.surface_.getTexureUrl(tile_.id_, i);
                            tile_.surfaceTextures_[i] = new Melown.MapTexture(this, path_);
                        } else {
                            if (tile_.surfaceTextures_[i].isReady() == true) {
                                tile_.renderReady_ = true;
                                if (!reducedProcessing_) {
                                    //set credits
                                    for (var k = 0, lk = node_.credits_.length; k < lk; k++) {
                                        this.visibleCredits_.imagery_[node_.credits_[k]] = true;  
                                    }
                                    
                                    tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, tile_.surfaceTextures_[i], "internal");
                                }
                            }
                        }

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
        var text_ = "" + mesh_.faces_ + " - " + mesh_.submeshes_.length;
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



