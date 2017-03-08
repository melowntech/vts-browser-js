

Melown.Map.prototype.draw = function(skipFreeLayers_, projected_, camInfo_) {
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;
    this.updateFogDensity();
    this.updateGridFactors();
    this.maxGpuUsed_ = this.gpuCache_.getMaxCost() * 0.9; 
    //this.cameraCenter_ = this.position_.getCoords();
    this.stats_.renderBuild_ = 0;
    this.drawTileCounter_ = 0;
    var cameraPos_ = this.cameraPosition_;

    if (this.drawEarth_) {
        if (this.replay_.storeNodes_ || this.replay_.storeFreeNodes_) {
            this.replay_.nodeBuffer_ = [];
        }
        
        if (this.replay_.drawGlobe_ || this.replay_.drawTiles_ || this.replay_.drawFreeTiles_||
            this.replay_.drawNodes_ || this.replay_.drawFreeNodes_ || this.replay_.drawLoaded_) { //used only in inspector
    
            var lod_ = this.replay_.lod_; 
            var single_ = this.replay_.singleLod_; 
    
            if (this.replay_.drawTiles_ && this.replay_.drawnTiles_) {
                var  tiles_ = this.replay_.drawnTiles_;
                for (var i = 0, li = tiles_.length; i < li; i++) {
                    var tile_ = tiles_[i];
                    if ((single_ && tile_.id_[0] == lod_) || (!single_ && tile_.id_[0] <= lod_)) {
                        this.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.pixelSize_, tile_.priority_, false, false);
                    }
                }
            }
            
            if (this.replay_.drawFreeTiles_ && this.replay_.drawnFreeTiles_) {
                var  tiles_ = this.replay_.drawnFreeTiles_;
                for (var i = 0, li = tiles_.length; i < li; i++) {
                    var tile_ = tiles_[i];
                    if ((single_ && tile_.id_[0] == lod_) || (!single_ && tile_.id_[0] <= lod_)) {
                        this.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.pixelSize_, tile_.priority_, false, false);
                    }
                }
            }
    
            if (this.replay_.drawNodes_ && this.replay_.tracedNodes_) {
                var  tiles_ = this.replay_.tracedNodes_;
                var tmp_ = this.drawBBoxes_;
                this.drawBBoxes_ = true;  
                for (var i = 0, li = tiles_.length; i < li; i++) {
                    var tile_ = tiles_[i];
                    if ((single_ && tile_.id_[0] == lod_) || (!single_ && tile_.id_[0] <= lod_)) {
                        this.drawTileInfo(tile_, tile_.metanode_, cameraPos_, tile_.surfaceMesh_, tile_.pixelSize_);
                    }
                }
                this.drawBBoxes_ = tmp_;
            }
    
            if (this.replay_.drawFreeNodes_ && this.replay_.tracedFreeNodes_) {
                var  tiles_ = this.replay_.tracedFreeNodes_;
                var tmp_ = this.drawBBoxes_;
                this.drawBBoxes_ = true;  
                for (var i = 0, li = tiles_.length; i < li; i++) {
                    var tile_ = tiles_[i];
                    if ((single_ && tile_.id_[0] == lod_) || (!single_ && tile_.id_[0] <= lod_)) {
                        this.drawTileInfo(tile_, tile_.metanode_, cameraPos_, tile_.surfaceMesh_, tile_.pixelSize_);
                    }
                }
                this.drawBBoxes_ = tmp_;
            }
    
            var index_ = this.replay_.loadedIndex_; 
            var singleIndex_ = this.replay_.singleLodedIndex_; 
    
            if (this.replay_.drawLoaded_ && this.replay_.loaded_) {
                var  loaded_ = this.replay_.loaded_;
                this.drawBBoxes_ = true;  
                for (var i = 0, li = loaded_.length; i < li; i++) {
                    var file_ = loaded_[i];
                    if (file_ && file_.tile_ && file_.tile_.id_) {
                        var tile_ = file_.tile_;
                        if (((singleIndex_ && i == index_) || (!singleIndex_ && i <= index_)) &&
                             ((single_ && tile_.id_[0] == lod_) || (!single_ && tile_.id_[0] <= lod_)) ) {
                            if (tile_.metanode_) {
                                if (tile_.metanode_.hasGeometry()) {
                                    this.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.pixelSize_, tile_.priority_, false, false);
                                } else {
                                    this.drawTileInfo(tile_, tile_.metanode_, cameraPos_, tile_.surfaceMesh_, tile_.pixelSize_);
                                }
                            }
                        }
                    }
                }
                this.drawBBoxes_ = tmp_;
            }
    
            if ((this.replay_.drawFreeTiles_ && this.replay_.drawnFreeTiles_) ||
                (this.replay_.drawLoaded_ && this.replay_.loaded_)) {
                    
                if (this.freeLayersHaveGeodata_) {
                    this.renderer_.drawGpuJobs();
                    this.renderer_.clearJobBuffer();
                }
            }
    
            return;
        }    
        
        for (var i = 0, li = this.tileBuffer_.length; i < li; i++) {  //todo remove this
            this.tileBuffer_[i] = null;    
        }
    
        if (this.tree_.surfaceSequence_.length > 0) {
            this.tree_.draw(camInfo_);
        }
    
        if (this.replay_.storeTiles_) { //used only in inspectors
            var drawnTiles_ = [];
    
            for (var i = 0, li = this.tileBuffer_.length; i < li; i++) {
                var tiles_ = this.tileBuffer_[i];
               
                if (tiles_) {
                    for (var j = 0, lj = tiles_.length; j < lj; j++) {
                        drawnTiles_.push(tiles_[j]);
                    }
                }
            }
            
            this.replay_.cameraPos_ = cameraPos_; 
            this.replay_.drawnTiles_ = drawnTiles_;
            this.replay_.storeTiles_ = false; 
        }
    
        if (this.replay_.storeNodes_) { //used only in inspector
            var nodeBuffer_ = []; 
    
            for (var i = 0, li = this.replay_.nodeBuffer_.length; i < li; i++) {
                var tile_ = this.replay_.nodeBuffer_[i];
                nodeBuffer_.push(tile_);
            }
    
            this.replay_.cameraPos_ = cameraPos_; 
            this.replay_.tracedNodes_ = nodeBuffer_;
            this.replay_.storeNodes_ = false; 
        }
    
        //draw free layers    
        for (var i = 0, li = this.freeLayerSequence_.length; i < li; i++) {
            var layer_ = this.freeLayerSequence_[i];
            if (layer_.ready_ && layer_.tree_ && 
                (!layer_.geodata_ || (layer_.stylesheet_ && layer_.stylesheet_.isReady())) ) {
                
                if (layer_.type_ == "geodata") {
                    this.drawMonoliticGeodata(layer_);
                } else {
                    layer_.tree_.draw(camInfo_);
                }
            }
        }
    
        if (this.replay_.storeFreeTiles_) { //used only in inspector
            var drawnTiles_ = [];
    
            for (var i = 0, li = this.tileBuffer_.length; i < li; i++) {
                var tiles_ = this.tileBuffer_[i];
               
                if (tiles_) {
                    for (var j = 0, lj = tiles_.length; j < lj; j++) {
                        var tile_ = tiles_[j];
                        if (tile_.surface_ && tile_.surface_.free_) { //do no draw free layers
                            drawnTiles_.push(tile_);
                        }
                    }
                }
            }
            
            this.replay_.cameraPos_ = cameraPos_; 
            this.replay_.drawnFreeTiles_ = drawnTiles_;
            this.replay_.storeFreeTiles_ = false; 
        }
    
        if (this.replay_.storeFreeNodes_) { //used only in inspector
            var nodeBuffer_ = []; 
    
            for (var i = 0, li = this.replay_.nodeBuffer_.length; i < li; i++) {
                var tile_ = this.replay_.nodeBuffer_[i];
                if (tile_.surface_ && tile_.surface_.free_) { //do no draw free layers
                    nodeBuffer_.push(tile_);
                }
            }
    
            this.replay_.cameraPos_ = cameraPos_; 
            this.replay_.tracedFreeNodes_ = nodeBuffer_;
            this.replay_.storeFreeNodes_ = false; 
        }
        
        //draw surface tiles stored in buffer
        /*
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
        }*/
    }

    //draw skydome before geodata
    if (!projected_ && this.drawFog_ && this.referenceFrame_.id_ == "melown2015") {    

        //var camInfo_ = this.position_.getCameraInfo(true);
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

        var earthRadius_ =  navigationSrsInfo_["a"];
        var atmoSize_ = 50000;
        
        var cameraPosToEarthCenter_ = [0,0,0,0];
        Melown.vec3.normalize(this.cameraPosition_, cameraPosToEarthCenter_);
        
        var horizAngle_ = Math.atan(1.0/(Melown.vec3.length(this.cameraPosition_) / navigationSrsInfo_["a"]));  //cotan = cameraDistFromCenter / earthRadius
        var horizAngle2_ = (horizAngle_ / Math.PI * 180)*0.5;

        var pos_ = this.getPosition();
        var orientation_ = pos_.getOrientation();
        var tiltFactor_ = (Math.max(5,-orientation_[1])/90);

        var heightFactor_ = 1-Math.max(0,Math.min(1.0,this.cameraHeight_ / (atmoSize_*(10+20*tiltFactor_))));
        heightFactor_ = heightFactor_ * heightFactor_;

        var params_ = [Math.max(2,heightFactor_*128),0,0,0];
        
        if (this.cameraHeight_ > earthRadius_*2) { //prevent foggy earth from larger distance
            params_[0] = 2-Math.min(1.0, (this.cameraHeight_ - earthRadius_*2) / (earthRadius_*2));
        }

        this.renderer_.gpu_.setState(this.drawAtmoState_);
        this.renderer_.drawBall([-this.cameraPosition_[0], -this.cameraPosition_[1], -this.cameraPosition_[2]],
                                  earthRadius_, this.renderer_.progAtmo2_, params_,  cameraPosToEarthCenter_, null, true);// this.cameraHeight_ > atmoSize_ ? 1 : -1);
        
        var safetyFactor_ = 2.0; 
        var params_ = [safetyFactor_, safetyFactor_ * ((earthRadius_ + atmoSize_) / earthRadius_), 0.25, safetyFactor_* ((earthRadius_ + atmoSize_) / earthRadius_)];
        var factor_ = (1 / (earthRadius_) ) * safetyFactor_;  
        var params2_ = [this.cameraPosition_[0] * factor_, this.cameraPosition_[1] * factor_, this.cameraPosition_[2] * factor_, 1];
        
        
        var t1_ = 1.4, t2_ = 1.6; //previous value t1=1.1

        if (this.cameraHeight_ > 60000) { //don render ground color in aura
            t1_ = 1.4, t2_ = 1.8;

            var params3_ = [t2_,1.0,t2_,0];
        } else {

            if (this.cameraHeight_ < 5000) { 
                t1_ = 1.05, t2_ = 1.12;
            }
            
            var params3_ = [t1_,5.2 / (t2_-t1_),t2_,0];
        } 

        this.renderer_.gpu_.setState(this.drawAuraState_);
        this.renderer_.drawBall([-this.cameraPosition_[0], -this.cameraPosition_[1], -this.cameraPosition_[2]],
                                  earthRadius_ + atmoSize_, this.renderer_.progAtmo_, params_,  params2_, params3_);// this.cameraHeight_ > atmoSize_ ? 1 : -1);

        this.renderer_.gpu_.setState(this.drawTileState_);

    }


    if (this.drawEarth_) {
        if (!skipFreeLayers_) {
            //draw free layers tiles stored in buffer
            /*
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
            }*/
        
            if (this.freeLayersHaveGeodata_) {
                this.renderer_.drawGpuJobs();
                this.renderer_.clearJobBuffer();
            }
        }
    }
};

Melown.Map.prototype.areDrawCommandsReady = function(commands_, priority_, doNotLoad_, checkGpu_) {
    var ready_ = true;
    checkGpu_ = checkGpu_ ? false : true;
    
    for (var i = 0, li = commands_.length; i < li; i++) {
        var command_ = commands_[i];
        
        switch (command_.type_) {
            case "submesh":
                
                var mesh_ = command_.mesh_; 
                var texture_ = command_.texture_; 
                
                var meshReady_ = (mesh_ && mesh_.isReady(doNotLoad_, priority_, checkGpu_));
                var textureReady_ = (!texture_  || (texture_ && texture_.isReady(doNotLoad_, priority_, checkGpu_)));
                
                if (!(meshReady_ && textureReady_) ) {
                     ready_ = false;   
                }
                
                break;

            case "geodata":
                
                var geodataView_ = command_.geodataView_; 
                
                if (!(geodataView_ && geodataView_.isReady(doNotLoad_, priority_, checkGpu_))) {
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
                    
                    if (!texture_) {
                        var material_ = command_.material_;
                        switch (material_) {
                            //case "fog":
                            case "external":
                            case "internal":
                                material_ = "flat";
                                break; 
                        }
                        mesh_.drawSubmesh(cameraPos_, command_.submesh_, texture_, material_, command_.alpha_);
                    } else {
                        mesh_.drawSubmesh(cameraPos_, command_.submesh_, texture_, command_.material_, command_.alpha_);
                    }

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

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_, checkGpu_) {
    /*if (tile_.id_[0] == Melown.debugId_[0] && //debuf stufff
        tile_.id_[1] == Melown.debugId_[1] &&
        tile_.id_[2] == Melown.debugId_[2]) {
            tile_ = tile_;
    }*/

    /*if (tile_.id_[0] == 12 &&
        tile_.id_[1] == 690 &&
        tile_.id_[2] == 1232) {
        tile_ = tile_;
        //return true;
    }*/

    if (this.stats_.gpuRenderUsed_ >= this.maxGpuUsed_) {
       /*
        if (tile_.surface_) {
            if (!tile_.surface_.geodata_) {
                tile_ = tile_;
            }
        }*/

        return false;
    }

    tile_.renderReady_ = false;
    
    if (tile_.surface_) {
        if (node_.hasGeometry()) {

            if (this.drawBBoxes_ && !preventRedener_) {
                this.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
            }

            if (this.heightmapOnly_ && !preventRedener_) {
                if (!tile_.surface_.geodata_) {
                    //node_.drawPlane(cameraPos_, tile_);
                    tile_.drawGrid(cameraPos_);
                }
                return true;
            }
            
            if (!preventRedener_) {
                this.stats_.renderedLods_[tile_.id_[0]]++;
                this.stats_.drawnTiles_++;

                if (tile_.surface_.geodata_) {
                    this.stats_.drawnGeodataTiles_++;
                }
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
                return this.drawMeshTile(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_, checkGpu_);
            } else {
                return this.drawGeodataTile(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_, checkGpu_);
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

Melown.Map.prototype.drawMeshTile = function(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_, checkGpu_) {
    if (!tile_.surfaceMesh_) {
        if (tile_.resourceSurface_.virtual_) {
            return true;
            //debugger;
        }
        
        var path_ = tile_.resourceSurface_.getMeshUrl(tile_.id_);
        tile_.surfaceMesh_ = tile_.resources_.getMesh(path_, tile_);
    }

    var channel_ = this.drawChannel_;
    var ret_ = false;

    if (tile_.drawCommands_[channel_].length > 0 && this.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_, checkGpu_)) {
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
        
        if (this.config_.mapHeightfiledWhenUnloaded_ && !preventRedener_) {
            //node_.drawPlane(cameraPos_, tile_);
            tile_.drawGrid(cameraPos_);
            ret_ = true;
        }
        
    } 

    if (tile_.surfaceMesh_.isReady(preventLoad_, priority_) && !preventLoad_) {
        var submeshes_ = tile_.surfaceMesh_.submeshes_;

        /*if (tile_.id_[0] == 14 &&
            tile_.id_[1] == 4421 &&
            tile_.id_[2] == 2804) {
            tile_ = tile_;
        }*/

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
                
                var surface_ = tile_.resourceSurface_;
                if (tile_.resourceSurface_.glue_ /*&& submesh_.surfaceReference_ != 0*/) { //glue have multiple surfaces per tile
                    surface_ = tile_.resourceSurface_.getSurfaceReference(submesh_.surfaceReference_);
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
                                            var path_ = tile_.resourceSurface_.getTextureUrl(tile_.id_, i);
                                            tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_, null, null, null, tile_, true);
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
                                            var path_ = tile_.resourceSurface_.getTextureUrl(tile_.id_, i);
                                            tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_, null, null, null, tile_, true);
                                        }

                                        //draw mesh
                                        tile_.drawCommands_[0].push({
                                            type_ : "submesh",
                                            mesh_ : tile_.surfaceMesh_,
                                            submesh_ : i,
                                            texture_ : tile_.surfaceTextures_[i],
                                            material_ : "internal"
                                        });
                                    } else {
                                        tile_.drawCommands_[0].push({
                                            type_ : "submesh",
                                            mesh_ : tile_.surfaceMesh_,
                                            submesh_ : i,
                                            texture_ : null,
                                            material_ : "flat"
                                        });
                                    }
    
                                }
                            }
    
                        } else if (submesh_.internalUVs_) {
    
                            if (tile_.surfaceTextures_[i] == null) {
                                var path_ = tile_.resourceSurface_.getTextureUrl(tile_.id_, i);
                                tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_, null, null, null, tile_, true);
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
                    var path_ = tile_.resourceSurface_.getTextureUrl(tile_.id_, i);
                    tile_.surfaceTextures_[i] = tile_.resources_.getTexture(path_, null, null, null, tile_, true);
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

        if (this.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_, checkGpu_)) {
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
        } else {
            if (this.config_.mapHeightfiledWhenUnloaded_ && !preventRedener_) {
                //node_.drawPlane(cameraPos_, tile_);
                tile_.drawGrid(cameraPos_);
                ret_ = true;
            }
        }
        
    } else {
        
        if (this.config_.mapHeightfiledWhenUnloaded_ && !preventRedener_) {
            //node_.drawPlane(cameraPos_, tile_);
            tile_.drawGrid(cameraPos_);
            ret_ = true;
        }
        
    }
    
    return ret_;
};

Melown.Map.prototype.drawGeodataTile = function(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_, checkGpu_) {
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
        
        if (tile_.surface_.geodataNavtileInfo_) {  //remove this code??? no longer used
            var navtile_ = this.tree_.findNavTile(tile_.id_);
            
            if (navtile_ && navtile_.surface_) {
                var navtileStr_ = navtile_.surface_.getNavUrl(navtile_.id_) + ";"
                                  + navtile_.id_[0] + "-" + navtile_.id_[1] + "-" + navtile_.id_[2] + ";"      
                                  + navtile_.metanode_.minHeight_ + ";" + navtile_.metanode_.maxHeight_;     
                path_ = tile_.surface_.getGeodataUrl(tile_.id_, encodeURIComponent(navtileStr_));
            }
        }
        
        if (!path_) {
            path_ = tile_.resourceSurface_.getGeodataUrl(tile_.id_, "");
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

    if (tile_.drawCommands_[channel_].length > 0 && this.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_, checkGpu_)) {
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
            var submeshSurface_ = tile_.resourceSurface_;

            //if (tile_.resourceSurface_.glue_) { //glue have multiple surfaces per tile
              //  submeshSurface_ = tile_.resourceSurface_.getSurfaceReference(submesh_.surfaceReference_);
            //}

            if (tile_.resourceSurface_.glue_) { //glue have multiple surfaces per tile
                submeshSurface_ = tile_.resourceSurface_.getSurfaceReference(submesh_.surfaceReference_);
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

                    var texture_ = tile_.boundTextures_[layer_.id_];

                    if (!texture_) {
                        var path_ = layer_.getUrl(tile_.id_);
                        texture_ = tile_.resources_.getTexture(path_, null, extraBound_, {tile_: tile_, layer_: layer_}, tile_, false);
                        texture_.isReady(true); //check for mask but do not load
                        tile_.boundTextures_[layer_.id_] = texture_; 
                    } 

                    if (texture_.neverReady_) {
                        continue; //do not use this layer
                    }

                    if (texture_.getMaskTexture()) {
                        bound_.transparent_ = true;
                    }
                    
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
                    tile_.boundTextures_[layer_.id_] = tile_.resources_.getTexture(path_, null, extraBound_, {tile_: tile_, layer_: layer_}, tile_, false);
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
                    tile_.boundTextures_[layer_.id_] = tile_.resources_.getTexture(path_, null, extraBound_, {tile_: tile_, layer_: layer_}, tile_, false);
                }
            }
        }
    }

};


Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    if (!this.drawMeshBBox_) {
        //if (this.drawCredits_) {
          //  node_.drawBBox2(cameraPos_);
        //} else {
            node_.drawBBox(cameraPos_);
        //}
    }

    //get screen pos of node
    if (node_.metatile_.useVersion_ < 4) {
        var min_ = node_.bbox_.min_;
        var max_ = node_.bbox_.max_;
    
        var pos_ =  this.core_.getRendererInterface().getCanvasCoords(
                        [(min_[0] + (max_[0] - min_[0])*0.5) - cameraPos_[0],
                         (min_[1] + (max_[1] - min_[1])*0.5) - cameraPos_[1],
                         (max_[2]) - cameraPos_[2]],
                         this.camera_.getMvpMatrix());
    
        pos_[2] = pos_[2] * 0.9992;
    } else {
        var dx_ = node_.bbox2_[3] - node_.bbox2_[0]; 
        var dy_ = node_.bbox2_[4] - node_.bbox2_[1]; 
        var dz_ = node_.bbox2_[5] - node_.bbox2_[2]; 
    
        var d = Math.sqrt(dx_*dx_ + dy_*dy_ + dz_*dz_);
    
        var pos_ =  this.core_.getRendererInterface().getCanvasCoords(
                        [(node_.bbox2_[12] + node_.bbox2_[15] + node_.bbox2_[18] + node_.bbox2_[21])*0.25 + node_.diskNormal_[0] * d*0.2 - cameraPos_[0],
                         (node_.bbox2_[13] + node_.bbox2_[16] + node_.bbox2_[19] + node_.bbox2_[22])*0.25 + node_.diskNormal_[1] * d*0.2 - cameraPos_[1],
                         (node_.bbox2_[14] + node_.bbox2_[17] + node_.bbox2_[20] + node_.bbox2_[23])*0.25 + node_.diskNormal_[2] * d*0.2 - cameraPos_[2]],
                         this.camera_.getMvpMatrix());
        
        /*
            var pos_ =  this.core_.getRendererInterface().getCanvasCoords(
                            [(node_.diskPos_[0] + node_.diskNormal_[0] * node_.bboxHeight_) - cameraPos_[0],
                             (node_.diskPos_[1] + node_.diskNormal_[1] * node_.bboxHeight_) - cameraPos_[1],
                             (node_.diskPos_[2] + node_.diskNormal_[2] * node_.bboxHeight_) - cameraPos_[2]],
                             this.camera_.getMvpMatrix());
        */
    }

    var factor_ = this.debugTextSize_;

    //draw lods
    if (this.drawLods_) {
        text_ = "" + tile_.id_[0];
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]-4*factor_), 4*factor_, text_, [1,0,0,1], pos_[2]);
    }

    //draw indices
    if (this.drawIndices_) {
        var text_ = "" + tile_.id_[1] + " " + tile_.id_[2];
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]-11*factor_), 4*factor_, text_, [0,1,1,1], pos_[2]);
    }

    //draw positions
    if (this.drawPositions_) {
        var text_ = "" + min_[0].toFixed(1) + " " + min_[1].toFixed(1) + " " + min_[2].toFixed(1);
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+3*factor_), 4*factor_, text_, [0,1,1,1], pos_[2]);
    }

    //draw face count
    if (this.drawFaceCount_ && mesh_) {
        var text_ = "" + mesh_.faces_ + " - " + mesh_.submeshes_.length + ((tile_.surface_ && tile_.surface_.glue_) ? " - 1" : " - 0");
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,1,0,1], pos_[2]);
    }

    //draw order
    if (this.drawOrder_) {
        var text_ = "" + this.drawTileCounter_;
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,1,0,1], pos_[2]);
    }

    if (this.drawSurfaces_) {
        var text_ = JSON.stringify(tile_.surface_.id_);
        if (node_.alien_) {
            text_ = "[A]" + text_;
        }
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
    }

    if (this.drawBoundLayers_) {
        if (tile_.boundsDebug_) {
            var surface_ = tile_.resourceSurface_;
            if (surface_.glue_) { 
              
                for (var i = 0, li = surface_.id_.length; i < li; i++) {
                    if (tile_.boundsDebug_[surface_.id_[i]]) {
                        var text_ = "< " + surface_.id_[i] + " >";
                        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+(10+i*7*2)*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
                        text_ = JSON.stringify(tile_.boundsDebug_[surface_.id_[i]]);
                        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+(17+i*7*2)*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
                    }
                }
                
            } else if (tile_.boundsDebug_[surface_.id_]) {
                var text_ = "< " + surface_.id_ + " >";
                this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
    
                text_ = JSON.stringify(tile_.boundsDebug_[surface_.id_]);
                this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
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

        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
    }

    //draw distance
    if (this.drawDistance_) {
        var text_ = "" + tile_.distance_.toFixed(2) + "  " + tile_.texelSize_.toFixed(3) + "  " + node_.pixelSize_.toFixed(3);
        text_ += "--" + tile_.texelSize2_.toFixed(3); 
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [1,0,1,1], pos_[2]);
    }

    //draw node info
    if (this.drawNodeInfo_) {
        var children_ = ((node_.flags_ & ((15)<<4))>>4);
        var text_ = "v" + node_.metatile_.version_ + "-" + node_.flags_.toString(2) + "-" + ((children_ & 1) ? "1" : "0") + ((children_ & 2) ? "1" : "0") + ((children_ & 4) ? "1" : "0") + ((children_ & 8) ? "1" : "0");
        text_ += "-" + node_.minHeight_ + "/" + node_.maxHeight_+ "-" + Math.floor(node_.minZ_) + "/" + Math.floor(node_.maxZ_); 
        this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]-18*factor_), 4*factor_, text_, [1,0,1,1], pos_[2]);
    }
    
    //draw texture size
    if (this.drawTextureSize_ && mesh_) {
        var submeshes_ = mesh_.submeshes_;
        for (var i = 0, li = submeshes_.length; i < li; i++) {

            if (submeshes_[i].internalUVs_) {
                var texture_ = tile_.surfaceTextures_[i];

                if (texture_ && texture_.gpuTexture_) {
                    var text_ = "[" + i + "]: " + texture_.gpuTexture_.width_ + " x " + texture_.gpuTexture_.height_;
                    this.renderer_.drawText(Math.round(pos_[0]-this.renderer_.getTextSize(4*factor_, text_)*0.5), Math.round(pos_[1]+(17+i*7*2)*factor_), 4*factor_, text_, [1,1,1,1], pos_[2]);
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
    
//    var density_ = ((Math.log(0.05) / (cameraVisibility_)) * tiltFactor_ * heightFactor_);
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


Melown.Map.prototype.updateGridFactors = function() {
    var nodes_ = this.referenceFrame_.getSpatialDivisionNodes();

    for (var i = 0, li = nodes_.length; i < li; i++) {
        var node_ = nodes_[i]; 
        var embed_ = 8;

        var altitude_ = Math.max(10, this.cameraDistance_ + 20);
        //var altitude_ = Math.max(1.1, this.cameraDistance_);
        var maxDistance_ = (node_.extents_.ur_[0] - node_.extents_.ll_[0])*2;
        var gridSelect_ = Math.log(Math.min(maxDistance_,altitude_)) / this.log8_;
        var gridMax_ = Math.log(maxDistance_) / this.log8_;
    
        gridSelect_ = gridMax_ - gridSelect_;
    
        node_.gridBlend_ = (gridSelect_ - Math.floor(gridSelect_));
        
        gridSelect_ = Math.floor(Math.floor(gridSelect_))+1;
        node_.gridStep1_ = Math.pow(embed_, gridSelect_);
        node_.gridStep2_ = node_.gridStep1_ * 8; 
    }
};


