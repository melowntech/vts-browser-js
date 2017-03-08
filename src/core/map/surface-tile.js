/**
 * @constructor
 */
Melown.MapSurfaceTile = function(map_, parent_, id_) {
    this.map_ = map_;
    this.id_ = id_;
    this.parent_ = parent_;
    this.viewCounter_ = map_.viewCounter_;
    this.renderCounter_ = 0;
    this.renderReady_ = false;
    this.geodataCounter_ = 0;
    this.texelSize_ = 1;
    this.texelSize2_ = 1;
    this.distance_ = 1;

    this.metanode_ = null;  //[metanode, cacheItem]
    this.lastMetanode_ = null;
    this.boundmetaresources_ = null; //link to bound layers metatile storage

    this.surface_ = null; //surface or glue
    this.surfaceMesh_ = null;
    this.surfaceGeodata_ = null;     //probably only used in free layers
    this.surfaceGeodataView_ = null; //probably only used in free layers
    this.surfaceTextures_ = [];
    this.resourceSurface_ = null; //surface directing to resources

    this.virtual_ = false;
    this.virtualReady_ = false;
    this.virtualSurfaces_ = [];
    
    this.resetDrawCommands_ = false;
    this.drawCommands_ = [[], [], []];
    
    this.bounds_ = {};
    this.boundLayers_ = {};
    this.boundTextures_ = {};
    this.updateBounds_ = true;

    this.heightMap_ = null;
    this.drawCommands_ = [[], [], []];
    this.imageryCredits_ = {};
    this.glueImageryCredits_ = {};
    this.mapdataCredits_ = {};
    
    this.resources_ = this.map_.resourcesTree_.findNode(id_, true);   // link to resource tree
    this.metaresources_ = this.map_.resourcesTree_.findAgregatedNode(id_, 5, true); //link to meta resource tree
    this.boundresources_ = this.map_.resourcesTree_.findAgregatedNode(id_, 8, true); //link to meta resource tree
    
    /*if (!this.resources_) {
        debugger;
    }*/

    this.children_ = [null, null, null, null];
};

Melown.MapSurfaceTile.prototype.kill = function() {
    //kill children
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] != null) {
            this.children_[i].kill();
        }
    }
/*
    if (this.surfaceMesh_ != null) {
        this.surfaceMesh_.kill();
    }

    for (var key in this.surfaceTextures_) {
        if (this.surfaceTextures_[key_] != null) {
            this.surfaceTextures_[key_].kill();
        }
    }

    if (this.surfaceGeodata_ != null) {
        this.surfaceGeodata_.kill();
    }

    if (this.surfaceGeodataView_ != null) {
        this.surfaceGeodataView_.kill();
    }

    if (this.heightMap_ != null) {
        this.heightMap_.kill();
    }

    for (var key_ in this.boundTextures_) {
        if (this.boundTextures_[key_] != null) {
            this.boundTextures_[key_].kill();
        }
    }
*/
    this.resources_ = null;
    this.metaresources_ = null;
    this.metanode_ = null;

    this.surface_ = null;
    this.surfaceMesh_ = null;
    this.surfaceTextures_ = [];
    this.surfaceGeodata_ = null;
    this.surfaceGeodataView_ = null;
    this.resourceSurface_ = null;

    this.bounds_ = {};
    this.boundLayers_ = {};
    this.boundTextures_ = {};
    this.updateBounds_ = true;

    this.virtual_ = false;
    this.virtualReady_ = false;
    this.virtualSurfaces_ = [];

    this.renderReady_ = false;
    this.lastSurface_ = null;
    this.lastState_ = null;
    this.lastRenderState_ = null;
        
    this.heightMap_ = null;
    this.drawCommands_ = [[], [], []];
    this.imageryCredits_ = {};
    this.glueImageryCredits_ = {};
    this.mapdataCredits_ = {};

    this.verifyChildren_ = false;
    this.children_ = [null, null, null, null];

    var parent_ = this.parent_;
    this.parent_ = null;

    if (parent_ != null) {
        parent_.removeChild(this);
    }
};

Melown.MapSurfaceTile.prototype.validate = function() {
    //is tile empty?
    if (this.metaresources_ == null || !this.metaresources_.getMetatile(this.surface_, null, this)) {
        //this.kill();
    }
};

Melown.MapSurfaceTile.prototype.viewSwitched = function() {
    //store last state for view switching
    this.lastSurface_ = this.surface_;
    this.lastState_ = {
        surfaceMesh_ : this.surfaceMesh_,
        surfaceTextures_ : this.surfaceTextures_,
        boundTextures_ : this.boundTextures_,
        surfaceGeodata_ : this.surfaceGeodata_,
        surfaceGeodataView_ : this.surfaceGeodataView_,
        resourceSurface_ : this.resourceSurface_ 
    };    

    if (this.drawCommands_[0].length > 0) {  // check only visible chanel
        this.lastRenderState_ = {
            drawCommands_ : this.drawCommands_,
            imageryCredits_ : this.imageryCredits_,
            mapdataCredits_ : this.mapdataCredits_
        };
    } else {
        this.lastRenderState_ = null;
    }

    
    //zero surface related data    
    this.verifyChildren_ = true;
    this.renderReady_ = false;
    this.lastMetanode_ = this.metanode_;
    //this.metanode_ = null; //keep old value for smart switching


    //this.lastMetanode_ = null;
    //this.metanode_ = null;

    for (var key_ in this.bounds_) {
        this.bounds_[key_] = {
            sequence_ : [],
            alpha_ : [],
            transparent_ : false,
            viewCoutner_ : 0
        };
    }

    this.boundLayers_ = {};
    this.boundTextures_ = {};
    this.updateBounds_ = true;
    this.transparentBounds_ = false;

    this.surface_ = null;
    this.surfaceMesh_ = null;
    this.surfaceTextures_ = [];
    this.surfaceGeodata_ = null;
    this.surfaceGeodataView_ = null;
    this.resourceSurface_ = null;
    
    this.virtual_ = false;
    this.virtualReady_ = false;
    this.virtualSurfaces_ = [];
    
    this.drawCommands_ = [[], [], []];
    this.imageryCredits_ = {};
    this.glueImageryCredits_ = {};
    this.mapdataCredits_ = {};
};

Melown.MapSurfaceTile.prototype.restoreLastState = function() {
    if (!this.lastState_) {
        return;
    }
    this.surfaceMesh_ = this.lastState_.surfaceMesh_;
    this.surfaceTextures_ = this.lastState_.surfaceTextures_; 
    this.boundTextures_ = this.lastState_.boundTextures_;
    this.surfaceGeodata_ = this.lastState_.surfaceGeodata_;
    this.surfaceGeodataView_ = this.lastState_.surfaceGeodataView_;
    this.resourceSurface_ = this.lastState_.resourceSurface_; 
    this.lastSurface_ = null;
    this.lastState_ = null;
    this.lastResourceSurface_ = null;
};

Melown.MapSurfaceTile.prototype.addChild = function(index_) {
    if (this.children_[index_]) {
        return;
    }
    
    var id_ = this.id_;
    var childId_ = [id_[0] + 1, id_[1] << 1, id_[2] << 1];

    switch (index_) {
        case 1: childId_[1]++; break;
        case 2: childId_[2]++; break;
        case 3: childId_[1]++; childId_[2]++; break;
    }

    this.children_[index_] = new Melown.MapSurfaceTile(this.map_, this, childId_);
};

Melown.MapSurfaceTile.prototype.removeChildByIndex = function(index_) {
    if (this.children_[index_] != null) {
        this.children_[index_].kill();
        this.children_[index_] = null;
    }
    
    //remove resrource node?
};

Melown.MapSurfaceTile.prototype.removeChild = function(tile_) {
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] == tile_) {
            this.children_[i].kill();
            this.children_[i] = null;
        }
    }
};

Melown.MapSurfaceTile.prototype.isMetanodeReady = function(tree_, priority_, preventLoad_) {
    //has map view changed?
    if (this.map_.viewCounter_ != this.viewCoutner_) {
        this.viewSwitched();
        this.viewCoutner_ = this.map_.viewCounter_;
        this.map_.markDirty(); 

        if (this.lastRenderState_) {
            this.lastRenderState_ = this.lastRenderState_; //debug
        }
    }
        
    if (!preventLoad_) {
   
        //provide surface for tile
        if (this.virtualSurfacesUncomplete_ || (this.surface_ == null && this.virtualSurfaces_.length == 0) ) { //|| this.virtualSurfacesUncomplete_) {
            this.checkSurface(tree_, priority_);
        }
   
        //provide metanode for tile
        if (this.metanode_ == null || this.lastMetanode_) {
            
            if (!this.virtualSurfacesUncomplete_) {
                var ret_ = this.checkMetanode(tree_, priority_);
                
                if (!ret_ && !(this.metanode_ != null && this.lastMetanode_)) { //metanode is not ready yet
                    return;
                }
            }
            
            if (this.lastMetanode_) {
                processFlag2_ = true;
            }
        }
        
    }

    if (this.metanode_ == null) { // || processFlag3_) { //only for wrong data
        return false;
    }

    this.metanode_.metatile_.used();

    if (this.lastSurface_ && this.lastSurface_ == this.surface_) {
        this.lastSurface_ = null;
        this.restoreLastState();
        //return;
    }

    if (this.surface_) {
        if (this.surface_.virtual_) {
            this.resourceSurface_ = this.surface_.getSurface(this.metanode_.sourceReference_);
            if (!this.resourceSurface_) {
                this.resourceSurface_ = this.surface_;
            }
        } else {
            this.resourceSurface_ = this.surface_;
        }
    }


    return true;
};

Melown.MapSurfaceTile.prototype.checkSurface = function(tree_, priority_) {
    this.surface_ = null;
    this.virtual_ = false;
    this.virtualReady_ = false;
    this.virtualSurfaces_ = [];
    this.virtualSurfacesUncomplete_ = false;
    
    if (tree_.freeLayerSurface_) {  //free layer has only one surface
        this.surface_ = tree_.freeLayerSurface_;
        return; 
    }

    /*
    if (this.id_[0] == 0 && this.id_[1] == 0 && this.id_[2] == 0) {
        tree_ = tree_;
    }

    if (this.id_[0] == 1 && this.id_[1] == 0 && this.id_[2] == 0) {
        tree_ = tree_;
    }

    if (this.id_[0] == 2 && this.id_[1] == 1 && this.id_[2] == 1) {
        tree_ = tree_;
    }

    if (this.id_[0] == 3 && this.id_[1] == 3 && this.id_[2] == 3) {
        tree_ = tree_;
    }

    if (this.id_[0] == 4 && this.id_[1] == 7 && this.id_[2] == 7) {
        tree_ = tree_;
    }

    if (this.id_[0] == 15 && this.id_[1] == 16297 && this.id_[2] == 16143) {
        tree_ = tree_;
    }

    if (this.id_[0] == 16 && this.id_[1] == 32595 && this.id_[2] == 32287) {
        tree_ = tree_;
    }*/

    var sequence_ = tree_.surfaceSequence_;

    //multiple surfaces
    //build virtual surfaces array
    //find surfaces with content
    for (var i = 0, li = sequence_.length; i < li; i++) {
        var surface_ = sequence_[i][0];
        var alien_ = sequence_[i][1];

        var res_ = surface_.hasTile2(this.id_);
        if (res_[0] == true) {
            
            //check if tile exist
            if (this.id_[0] > 0) { //surface_.lodRange_[0]) {
                //!!!!!!removed for debug
                ///* ????????
                var parent_ = this.parent_;
                if (parent_) { 
                    
                    if (parent_.virtualSurfacesUncomplete_) {
                        this.virtualSurfacesUncomplete_ = true;
                        this.virtualSurfaces_ = [];
                        return;
                    }
                    
                    var metatile_ = parent_.metaresources_.getMetatile(surface_, null, this);
                    if (metatile_) {
                        
                        if (!metatile_.isReady(priority_)) {
                            this.virtualSurfacesUncomplete_ = true;
                            continue;
                        }
                        
                        var node_ = metatile_.getNode(parent_.id_);
                        if (node_) {
                            if (!node_.hasChildById(this.id_)) {
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
            this.virtualSurfaces_.push([surface_, alien_]);        
        }
    }

  //  if (this.virtualSurfacesUncomplete_) {
  //      this.metanode_ = null;
  //  }

    //
    if (this.virtualSurfaces_.length > 1) {
        this.virtual_ = true;
    } else {
        this.surface_ = (this.virtualSurfaces_[0]) ? this.virtualSurfaces_[0][0] : null;
    }
};

Melown.MapSurfaceTile.prototype.checkMetanode = function(tree_, priority_) {
    if (this.virtual_) {
        if (this.isVirtualMetanodeReady(tree_, priority_)) {
            this.metanode_ = this.createVirtualMetanode(tree_, priority_);
            this.lastMetanode_ = null;
            this.map_.markDirty();
        } else {
            return false;
        }
    }

    //var surface_ = this.surface_ || this.surface_; ?????
    var surface_ = this.surface_;

    if (surface_ == null) {
        return false;
    }

    var metatile_ = this.metaresources_.getMetatile(surface_, true, this);

    if (metatile_.isReady(priority_) == true) {

        if (!this.virtual_) {
            this.metanode_ = metatile_.getNode(this.id_);
            this.lastMetanode_ = null;
            this.map_.markDirty(); 
        }

        if (this.metanode_ != null) {
            this.metanode_.tile_ = this; //used only for validate
            this.lastMetanode_ = null;
            this.map_.markDirty(); 

            for (var i = 0; i < 4; i++) {
                if (this.metanode_.hasChild(i) == true) {
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

Melown.MapSurfaceTile.prototype.isVirtualMetanodeReady = function(tree_, priority_) {
    var surfaces_ = this.virtualSurfaces_;
    var readyCount_ = 0;

    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = surfaces_[i][0];
        var metatile_ = this.metaresources_.getMetatile(surface_, true, this);

        if (metatile_.isReady(priority_) == true) {
            readyCount_++;
        }
    }
    
    if (readyCount_ == li) {
        return true;        
    } else {
        return false;
    }
};

Melown.MapSurfaceTile.prototype.createVirtualMetanode = function(tree_, priority_) {
    var surfaces_ = this.virtualSurfaces_;
    var first_ = false;
    var node_ = null;

    //get top most existing surface
    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = surfaces_[i][0];
        var alien_ = surfaces_[i][1];
        var metatile_ = this.metaresources_.getMetatile(surface_, null, this);

        if (metatile_.isReady(priority_) == true) {
            var metanode_ = metatile_.getNode(this.id_);

            if (metanode_ != null) {
                if (alien_ != metanode_.alien_) {
                    continue;
                }

                //does metanode have surface reference?
                //internalTextureCount is reference to surface
                if (!alien_ && surface_.glue_ && !metanode_.hasGeometry() &&
                    metanode_.internalTextureCount_ > 0) {
                    
                    var desiredSurfaceIndex_ = metanode_.internalTextureCount_ - 1;
                    desiredSurfaceIndex_ = this.map_.getSurface(surface_.id_[desiredSurfaceIndex_]).viewSurfaceIndex_;
                    
                    var jump_ = false; 
                        
                    for (var j = i; j < li; j++) {
                        if (surfaces_[j].viewSurfaceIndex_ <= desiredSurfaceIndex_) {
                            jump_ = (j > i);
                            i = j - 1;
                            break;
                        }
                    }
                    
                    if (jump_) {
                        continue;
                    }                         
                }
                
                if (metanode_.hasGeometry()) {
                    node_ = metanode_.clone();
                    this.surface_ = surface_;
                    break;
                }
            }
        }
    }

    //extend bbox, credits and children flags by other surfaces
    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = surfaces_[i][0];
        var metatile_ = this.metaresources_.getMetatile(surface_, null, this);

        if (metatile_.isReady(priority_) == true) {
            var metanode_ = metatile_.getNode(this.id_);

            if (metanode_ != null) {
                //does metanode have surface reference?
                //internalTextureCount is reference to surface
                /*
                if (surface_.glue_ && !metanode_.hasGeometry() &&
                    metanode_.internalTextureCount_ > 0) {
                    i = this.map_.surfaceSequenceIndices_[metanode_.internalTextureCount_ - 1] - 1;
                    continue;
                }*/

                if (!node_) { //just in case all surfaces are without geometry
                    node_ = metanode_.clone();
                    this.surface_ = surface_;
                } else {
                    node_.flags_ |= metanode_.flags_ & ((15)<<4); 

                    /*
                    for (var j = 0, lj = metanode_.credits_.length; j <lj; j++) {
                        if (node_.credits_.indexOf(metanode_.credits_[j]) == -1) {
                            node_.credits_.push(metanode_.credits_[j]);
                        } 
                    }*/
                   
                    if (metatile_.useVersion_ < 4) {
                        //!!!!!!removed for debug
                        node_.bbox_.min_[0] = Math.min(node_.bbox_.min_[0], metanode_.bbox_.min_[0]); 
                        node_.bbox_.min_[1] = Math.min(node_.bbox_.min_[1], metanode_.bbox_.min_[1]); 
                        node_.bbox_.min_[2] = Math.min(node_.bbox_.min_[2], metanode_.bbox_.min_[2]); 
                        node_.bbox_.max_[0] = Math.max(node_.bbox_.max_[0], metanode_.bbox_.max_[0]); 
                        node_.bbox_.max_[1] = Math.max(node_.bbox_.max_[1], metanode_.bbox_.max_[1]); 
                        node_.bbox_.max_[2] = Math.max(node_.bbox_.max_[2], metanode_.bbox_.max_[2]);
                    }
                }
            }
        }
    }
    
    if (node_) {
        node_.generateCullingHelpers(true);
    }
    
    return node_;
};

Melown.MapSurfaceTile.prototype.bboxVisible = function(id_, bbox_, cameraPos_, node_) {
    var map_ = this.map_;
    var skipGeoTest_ = map_.config_.mapDisableCulling_;
    /*
    if (!skipGeoTest_ && id_[0] >= 6 && this.geocent_) {
        id_ = id_;
        
        if (!node_.hasGeometry()) {
            return false;
        }
    }*/

    if (!skipGeoTest_ && map_.geocent_) {
        if (node_) {
            if (true) {  //version with perspektive
                var p2_ = node_.diskPos_;
                var p1_ = map_.cameraPosition_;
                var camVec_ = [p2_[0] - p1_[0], p2_[1] - p1_[1], p2_[2] - p1_[2]];
                Melown.vec3.normalize(camVec_);
                
                var a = Melown.vec3.dot(camVec_, node_.diskNormal_);
            } else {
                var a = Melown.vec3.dot(map_.cameraVector_, node_.diskNormal_);
            }
            
            if (a > node_.diskAngle_) {
                return false;
            }
        }
    }

    if (node_.metatile_.useVersion_ >= 4) {
        return map_.camera_.pointsVisible(node_.bbox2_, cameraPos_);
    } else {
        if (!(map_.geocent_ && (map_.config_.mapPreciseBBoxTest_)) || id_[0] < 4) {
            return map_.camera_.bboxVisible(bbox_, cameraPos_);
        } else {
            return map_.camera_.pointsVisible(node_.bbox2_, cameraPos_);
        }
    }
};

Melown.MapSurfaceTile.prototype.getPixelSize = function(bbox_, screenPixelSize_, cameraPos_, worldPos_, returnDistance_) {
    var min_ = bbox_.min_;
    var max_ = bbox_.max_;
    var tilePos1x_ = min_[0] - cameraPos_[0];
    var tilePos1y_ = min_[1] - cameraPos_[1];
    var tilePos2x_ = max_[0] - cameraPos_[0];
    var tilePos2y_ = min_[1] - cameraPos_[1];
    var tilePos3x_ = max_[0] - cameraPos_[0];
    var tilePos3y_ = max_[1] - cameraPos_[1];
    var tilePos4x_ = min_[0] - cameraPos_[0];
    var tilePos4y_ = max_[1] - cameraPos_[1];
    var h1_ = min_[2] - cameraPos_[2];
    var h2_ = max_[2] - cameraPos_[2];
    
    //camera inside bbox
    if (!this.map_.config_.mapLowresBackground_) {
        if (cameraPos_[0] > min_[0] && cameraPos_[0] < max_[0] &&
            cameraPos_[1] > min_[1] && cameraPos_[1] < max_[1] &&
            cameraPos_[2] > min_[2] && cameraPos_[2] < max_[2]) {
    
            if (returnDistance_ == true) {
                return [Number.POSITIVE_INFINITY, 0.1];
            }
        
            return Number.POSITIVE_INFINITY;
        }
    }

    var factor_ = 0;
    var camera_ = this.map_.camera_;

    //find bbox sector
    if (0 < tilePos1y_) { //top row - zero means camera position in y
        if (0 < tilePos1x_) { // left top corner
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([tilePos1x_, tilePos1y_, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([tilePos1x_, tilePos1y_, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([tilePos1x_, tilePos1y_, (h1_ + h2_)*0.5], returnDistance_);
            }
        } else if (0 > tilePos2x_) { // right top corner
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([tilePos2x_, tilePos2y_, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([tilePos2x_, tilePos2y_, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([tilePos2x_, tilePos2y_, (h1_ + h2_)*0.5], returnDistance_);
            }
        } else { //top side
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([(tilePos1x_ + tilePos2x_)*0.5, tilePos2y_, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([(tilePos1x_ + tilePos2x_)*0.5, tilePos2y_, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([(tilePos1x_ + tilePos2x_)*0.5, tilePos2y_, (h1_ + h2_)*0.5], returnDistance_);
            }
        }
    } else if (0 > tilePos4y_) { //bottom row
        if (0 < tilePos4x_) { // left bottom corner
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([tilePos4x_, tilePos4y_, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([tilePos4x_, tilePos4y_, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([tilePos4x_, tilePos4y_, (h1_ + h2_)*0.5], returnDistance_);
            }
        } else if (0 > tilePos3x_) { // right bottom corner
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([tilePos3x_, tilePos3y_, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([tilePos3x_, tilePos3y_, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([tilePos3x_, tilePos3y_, (h1_ + h2_)*0.5], returnDistance_);
            }
        } else { //bottom side
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([(tilePos4x_ + tilePos3x_)*0.5, tilePos3y_, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([(tilePos4x_ + tilePos3x_)*0.5, tilePos3y_, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([(tilePos4x_ + tilePos3x_)*0.5, tilePos3y_, (h1_ + h2_)*0.5], returnDistance_);
            }
        }
    } else { //middle row
        if (0 < tilePos4x_) { // left side
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([tilePos1x_, (tilePos2y_ + tilePos3y_)*0.5, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([tilePos1x_, (tilePos2y_ + tilePos3y_)*0.5, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([tilePos1x_, (tilePos2y_ + tilePos3y_)*0.5, (h1_ + h2_)*0.5], returnDistance_);
            }
        } else if (0 > tilePos3x_) { // right side
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([tilePos2x_, (tilePos2y_ + tilePos3y_)*0.5, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([tilePos2x_, (tilePos2y_ + tilePos3y_)*0.5, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([tilePos2x_, (tilePos2y_ + tilePos3y_)*0.5, (h1_ + h2_)*0.5], returnDistance_);
            }
        } else { //center
            if (0 > h2_) { // hi
                factor_ = camera_.scaleFactor([(tilePos1x_ + tilePos2x_)*0.5, (tilePos2y_ + tilePos3y_)*0.5, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = camera_.scaleFactor([(tilePos1x_ + tilePos2x_)*0.5, (tilePos2y_ + tilePos3y_)*0.5, h1_], returnDistance_);
            } else { // middle
                factor_ = camera_.scaleFactor([(tilePos1x_ + tilePos2x_)*0.5, (tilePos2y_ + tilePos3y_)*0.5, (h1_ + h2_)*0.5], returnDistance_);
            }
        }
    }

    //console.log("new: " + (factor_ * screenPixelSize_) + " old:" + this.tilePixelSize2(node_) );

    if (returnDistance_ == true) {
        return [(factor_[0] * screenPixelSize_), factor_[1]];
    }

    return (factor_ * screenPixelSize_);
};


Melown.MapSurfaceTile.prototype.getPixelSize3 = function(node_, screenPixelSize_, factor_) {
    var d = (this.map_.cameraGeocentDistance_*factor_) - node_.diskDistance_;
    if (d < 0) {
        return [Number.POSITIVE_INFINITY, 0.1];
    } 

    var a = Melown.vec3.dot(this.map_.cameraGeocentNormal_, node_.diskNormal_);
    
    if (a < node_.diskAngle2_) {
        var a2 = Math.acos(a); 
        var a3 = Math.acos(node_.diskAngle2_);
        a2 = a2 - a3; 

        var l1 = Math.tan(a2) * node_.diskDistance_;
        d = Math.sqrt(l1*l1 + d*d);
    }

    var factor_ = this.map_.camera_.scaleFactor2(d);
    return [factor_ * screenPixelSize_, d];
};

/*

Melown.MapSurfaceTile.prototype.getPixelSize22 = function(bbox_, screenPixelSize_, cameraPos_, worldPos_, returnDistance_) {
    var min_ = bbox_.min_;
    var max_ = bbox_.max_;
    var p1_ = bbox_.center();
    bbox_.updateMaxSize();
    var d = bbox_.maxSize_ * 0.5; 
    
    var dd_ = [cameraPos_[0]-p1_[0],
               cameraPos_[1]-p1_[1],
               cameraPos_[2]-p1_[2]]; 

    var d2_ = Melown.vec3.length(dd_) - (bbox_.maxSize_ * 0.5);

    var factor_ = this.camera_.scaleFactor2(d2_);

    if (returnDistance_ == true) {
        return [(factor_[0] * screenPixelSize_), factor_[1]];
    }

    return (factor_ * screenPixelSize_);
};
*/


Melown.MapSurfaceTile.prototype.updateTexelSize = function() {
    var pixelSize_;
    var pixelSize2_;
    var map_ = this.map_;
    var texelSizeFit_ = map_.texelSizeFit_;
    var node_ = this.metanode_;
    var cameraPos_ = map_.cameraPosition_;
    var preciseDistance_ = (map_.geocent_ && (map_.config_.mapPreciseDistanceTest_ || node_.metatile_.useVersion_ >= 4));  

    if (node_.hasGeometry()) {
        var screenPixelSize_ = Number.POSITIVE_INFINITY;

        if (node_.usedTexelSize()) {
            screenPixelSize_ = map_.ndcToScreenPixel_ * node_.pixelSize_;
        } else if (node_.usedDisplaySize()) {
            screenPixelSize_ = map_.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / node_.displaySize_);
        }

        if (map_.camera_.ortho_ == true) {
            var height_ = map_.camera_.getViewHeight();
            pixelSize_ = [(screenPixelSize_*2.0) / height_, height_];
        } else {
            
            if (node_.usedDisplaySize()) { 
               
                if (!preciseDistance_) {
                    screenPixelSize_ = map_.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / 256);

                    var factor_ = (node_.displaySize_ / 256) * map_.cameraDistance_;
                    //var factor_ = (256 / 256) * this.map_.cameraDistance_;
                    
                    var v = map_.cameraVector_; //move camera away hack
                    var p = [cameraPos_[0] - v[0] * factor_, cameraPos_[1] - v[1] * factor_, cameraPos_[2] - v[2] * factor_];

                    pixelSize_ = this.getPixelSize(node_.bbox_, screenPixelSize_, p, p, true);
                } else {
                    screenPixelSize_ = map_.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / 256) * (256 / node_.displaySize_);

                    pixelSize_ = this.getPixelSize3(node_, screenPixelSize_, 1);
                }
            } else {
                
                if (!preciseDistance_ && texelSizeFit_ > 1.1) {
                    screenPixelSize_ = map_.ndcToScreenPixel_ * node_.pixelSize_ * (texelSizeFit_ / 1.1);
                    var factor_ = (texelSizeFit_ / 1.1) * map_.cameraDistance_;
                    
                    var v = map_.cameraVector_; //move camera away hack
                    var p = [cameraPos_[0] - v[0] * factor_, cameraPos_[1] - v[1] * factor_, cameraPos_[2] - v[2] * factor_];
                    
                    pixelSize_ = this.getPixelSize(node_.bbox_, screenPixelSize_, p, p, true);
                } else {
                    if (preciseDistance_) {
                        pixelSize_ = this.getPixelSize3(node_, screenPixelSize_, 1);
                    } else {
                        pixelSize_ = this.getPixelSize(node_.bbox_, screenPixelSize_, cameraPos_, cameraPos_, true);
                    }
                }
            }
        }
    } else {
        if (preciseDistance_) {
            pixelSize_ = this.getPixelSize3(node_, 1, 1);
        } else {
            pixelSize_ = this.getPixelSize(node_.bbox_, 1, cameraPos_, cameraPos_, true);
        }

        //pixelSize_ = this.getPixelSize(node_.bbox_, 1, cameraPos_, cameraPos_, true);
        pixelSize_[0] = Number.POSITIVE_INFINITY;
    }

    this.texelSize_ = pixelSize_[0];
    this.distance_ = pixelSize_[1];
};

Melown.MapSurfaceTile.prototype.drawGrid = function(cameraPos_, divNode_, angle_) {
    if ((this.texelSize_ == Number.POSITIVE_INFINITY || this.texelSize_ > 4.4) && this.metanode_ && this.metanode_.hasChildren()) {
        return;
    }
    
    var fastGrid_ = this.map_.config_.mapFastHeightfiled_;
    
    //if (!(this.id_[0] == 18 && this.id_[1] == 130381 && this.id_[2] == 129151)) {
      //  return;
    //}

    var map_ = this.map_;
    
    if (divNode_) {
        var node_ = divNode_[0]; 
        var ll_ = divNode_[1][0];
        var ur_ = divNode_[1][1];
    } else {
        var res_ = map_.getSpatialDivisionNodeAndExtents(this.id_);
        var node_ = res_[0]; 
        var ll_ = res_[1][0];
        var ur_ = res_[1][1];
    }
   
    var middle_ = [(ur_[0] + ll_[0])* 0.5, (ur_[1] + ll_[1])* 0.5];
    var normal_ = [0,0,0];

    var hasPoles_ = map_.referenceFrame_.hasPoles_;

    //var pseudomerc_ = (node_.srs_.id_ == "pseudomerc");
    var subdivision_ = angle_; 
    var angle_ = angle_ || this.metanode_.diskAngle2_;
    
    if ((hasPoles_ && !node_.isPole_) &&  Math.acos(angle_) > Math.PI*0.1) {
        angle_ = Math.cos(Math.acos(angle_) * 0.5); 
        
        this.drawGrid(cameraPos_, [node_, [ [ll_[0], ll_[1]],  [middle_[0], middle_[1]] ] ], angle_);
        this.drawGrid(cameraPos_, [node_, [ [middle_[0], ll_[1]],  [ur_[0], middle_[1]] ] ], angle_);

        this.drawGrid(cameraPos_, [node_, [ [ll_[0], middle_[1]],  [middle_[0], ur_[1]] ] ], angle_);
        this.drawGrid(cameraPos_, [node_, [ [middle_[0], middle_[1]],  [ur_[0], ur_[1]] ] ], angle_);
       
        return;
    }
     
    var desiredSamplesPerViewExtent_ = 5;
    var nodeExtent_ = node_.extents_.ur_[1] - node_.extents_.ll_[1];
    var viewExtent_ = this.distance_ ;//* 0.1;
    var lod_ = Math.log((desiredSamplesPerViewExtent_ * nodeExtent_) / viewExtent_) / map_.log2_;
    lod_ = Math.max(0,lod_ - 8 + node_.id_[0]);
    
    //var lod_ = map_.getOptimalHeightLod(middle_, this.distance_, 5);
    
    var coords_ = [
        [ur_[0], ur_[1]],
        [ur_[0], ll_[1]],
        [ll_[0], ll_[1]],
        [ll_[0], ur_[1]],

        [middle_[0], ur_[1]],
        [middle_[0], ll_[1]],
    
        [ll_[0], middle_[1]],
        [ur_[0], middle_[1]]
    ];    

    if (fastGrid_) {
        if (!this.metanode_) {
            return;
        }
        
        var h = this.metanode_.minHeight_;      
        var coordsRes_ = [[h],[h],[h],[h],[h],[h],[h],[h]];
        middle_[2] = h;
        middle_ = node_.getPhysicalCoords(middle_, true);
        
    } else {
        var res_ = map_.getSurfaceHeight(null, lod_, null, node_, middle_, coords_);
        middle_[2] = res_[0];
        middle_ = node_.getPhysicalCoords(middle_, true);
        var coordsRes_ = res_[5];
        
        if (!coordsRes_) {
            coordsRes_ = [[0],[0],[0],[0],[0],[0],[0],[0]];
        }
    }

    var renderer_ = map_.renderer_;
    var buffer_ = map_.planeBuffer_;
    //var mvp_ = Melown.mat4.create();
    var mv_ = renderer_.camera_.getModelviewMatrix();
    var proj_ = renderer_.camera_.getProjectionMatrix();
    //Melown.mat4.multiply(proj_, mv_, mvp_);

    var sx_ = cameraPos_[0];
    var sy_ = cameraPos_[1];
    var sz_ = cameraPos_[2];
    
    coords_[0][2] = coordsRes_[0][0];
    var n1_ = node_.getPhysicalCoords(coords_[0], true);

    coords_[1][2] = coordsRes_[1][0];
    var n2_ = node_.getPhysicalCoords(coords_[1], true);

    coords_[2][2] = coordsRes_[2][0];
    var n3_ = node_.getPhysicalCoords(coords_[2], true);

    coords_[3][2] = coordsRes_[3][0];
    var n4_ = node_.getPhysicalCoords(coords_[3], true);

    coords_[4][2] = coordsRes_[4][0];
    var mtop_ = node_.getPhysicalCoords(coords_[4], true);

    coords_[5][2] = coordsRes_[5][0];
    var mbottom_ = node_.getPhysicalCoords(coords_[5], true);

    coords_[6][2] = coordsRes_[6][0];
    var mleft_ = node_.getPhysicalCoords(coords_[6], true);

    coords_[7][2] = coordsRes_[7][0];
    var mright_ = node_.getPhysicalCoords(coords_[7], true);

    buffer_[0] = n4_[0] - sx_;
    buffer_[1] = n4_[1] - sy_;
    buffer_[2] = n4_[2] - sz_;
    
    buffer_[3] = mtop_[0] - sx_;
    buffer_[4] = mtop_[1] - sy_;
    buffer_[5] = mtop_[2] - sz_;

    buffer_[6] = n1_[0] - sx_;
    buffer_[7] = n1_[1] - sy_;
    buffer_[8] = n1_[2] - sz_;

    buffer_[9] = mleft_[0] - sx_;
    buffer_[10] = mleft_[1] - sy_;
    buffer_[11] = mleft_[2] - sz_;
            
    buffer_[12] = middle_[0] - sx_;
    buffer_[13] = middle_[1] - sy_;
    buffer_[14] = middle_[2] - sz_;
            
    buffer_[15] = mright_[0] - sx_;
    buffer_[16] = mright_[1] - sy_;
    buffer_[17] = mright_[2] - sz_;
        
    buffer_[18] = n3_[0] - sx_;
    buffer_[19] = n3_[1] - sy_;
    buffer_[20] = n3_[2] - sz_;
    
    buffer_[21] = mbottom_[0] - sx_;
    buffer_[22] = mbottom_[1] - sy_;
    buffer_[23] = mbottom_[2] - sz_;
    
    buffer_[24] = n2_[0] - sx_;
    buffer_[25] = n2_[1] - sy_;
    buffer_[26] = n2_[2] - sz_;


    if (hasPoles_ && !map_.poleRadius_ && node_.id_[0] == 1 && !node_.isPole_) {
        var p = node_.getPhysicalCoords([node_.extents_.ur_[0], node_.extents_.ur_[1], 0]);
        map_.poleRadius_ = Math.sqrt(p[0]*p[0]+p[1]*p[1]); 
        map_.poleRadiusFactor_ = 8 * Math.pow(2.0, 552058 / map_.poleRadius_); 
    }

    var factor_ = 1;

    if (hasPoles_ && node_.isPole_) {
        var factor_ = map_.poleRadiusFactor_; 
        var prog_ = renderer_.progPlane2_; 
        renderer_.gpu_.useProgram(prog_, ["aPosition", "aTexCoord"]);
        prog_.setVec4("uParams4", [-sx_, -sy_, map_.poleRadius_, 0]);
    } else {
        var prog_ = renderer_.progPlane_; 
        renderer_.gpu_.useProgram(prog_, ["aPosition", "aTexCoord"]);
    }

    prog_.setMat4("uMV", mv_);
    prog_.setMat4("uProj", proj_);
    prog_.setFloatArray("uPoints", buffer_);
    
    /*
    var lx_ = (ur_[0] - ll_[0]);
    var ly_ = (ll_[1] - ur_[1]);
    var px_ = (ll_[0] - node_.extents_.ll_[0]) / lx_;
    var py_ = (ur_[1] - node_.extents_.ll_[1]) / ly_;
    
    var llx_ = (node_.extents_.ur_[0] - node_.extents_.ll_[0]) / lx_;
    var lly_ = (node_.extents_.ur_[1] - node_.extents_.ll_[1]) / ly_;

    px_ = px_ / llx_;
    py_ = py_ / lly_;
    llx_ = 1.0/llx_;
    lly_ = 1.0/lly_;
    
    llx_ *= step1_;
    lly_ *= step1_;
    px_ *= step1_;
    py_ *= step1_;
    */

    var step1_ = node_.gridStep1_ * factor_;

    var lx_ = 1.0 / (ur_[0] - ll_[0]);
    var ly_ = 1.0 / (ll_[1] - ur_[1]);
    var llx_ = step1_ / ((node_.extents_.ur_[0] - node_.extents_.ll_[0]) * lx_);
    var lly_ = step1_ / ((node_.extents_.ur_[1] - node_.extents_.ll_[1]) * ly_);
    var px_ = (ll_[0] - node_.extents_.ll_[0]) * lx_ * llx_;
    var py_ = (ur_[1] - node_.extents_.ll_[1]) * ly_ * lly_;

    prog_.setVec4("uParams", [step1_ * factor_, this.map_.fogDensity_, 1/15, node_.gridStep2_ * factor_]);
    prog_.setVec4("uParams3", [(py_ - Math.floor(py_)), (px_ - Math.floor(px_)), lly_, llx_]);
    prog_.setVec4("uParams2", [0, 0, node_.gridBlend_, 0]);

    renderer_.gpu_.bindTexture(renderer_.heightmapTexture_);
    
    //draw bbox
    renderer_.planeMesh_.draw(prog_, "aPosition", "aTexCoord");    

};  
