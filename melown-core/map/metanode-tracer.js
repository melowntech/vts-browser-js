/**
 * @constructor
 */
Melown.MapMetanodeTracer = function(mapTree_, surface_, nodeProcessingFunction_, childSelectingFunction_) {
    this.map_ = mapTree_.map_;
    this.surfaceTree_ = mapTree_.surfaceTree_;
    this.metastorageTree_ = mapTree_.metastorageTree_;
    this.metaBinaryOrder_ = mapTree_.metaBinaryOrder_;
    this.rootId_ = mapTree_.rootId_;
    this.surface_ = surface_; //????
    this.nodeProcessingFunction_ = nodeProcessingFunction_;
    this.childSelectingFunction_ = childSelectingFunction_;
    this.params_ = null;
};

Melown.MapMetanodeTracer.prototype.trace = function(tile_, params_) {
    this.params_ = params_;
    //this.traceTile(this.surfaceTree_, 0);
    this.traceTile(tile_, 0);
};

Melown.MapMetanodeTracer.prototype.traceTile = function(tile_, priority_, processFlag_, processFlag2_) {
    if (tile_ == null) {
        return;
    }

    if (tile_.metastorage_ == null) {  //metastorage stores metatiles
        tile_.metastorage_ = Melown.FindMetastorage(this.map_, this.metastorageTree_, this.rootId_, tile_, this.metaBinaryOrder_);
    }

    //has map view changed?
    if (this.map_.viewCounter_ != tile_.viewCoutner_) {
        tile_.viewSwitched();
        tile_.viewCoutner_ = this.map_.viewCounter_;
        this.map_.markDirty(); 

        if (tile_.lastRenderState_) {
            tile_.lastRenderState_ = tile_.lastRenderState_; //debug
        }
    }
        
    if (!processFlag2_) {
    
        //provide surface for tile
        if (tile_.surface_ == null && tile_.virtualSurfaces_.length == 0) {
            this.checkTileSurface(tile_, priority_);
        }
   
        //provide metanode for tile
        if (tile_.metanode_ == null || tile_.lastMetanode_) {
            var ret_ = this.checkTileMetanode(tile_, priority_);
            
            if (!ret_ && !(tile_.metanode_ != null && tile_.lastMetanode_)) { //metanode is not ready yet
                return;
            }
            
            if (tile_.lastMetanode_) {
                processFlag2_ = true;
            }
        }
        
    }


    if (tile_.metanode_ == null) { //only for wrong data
        return;
    }

//6,16,11
//5,8,5
    if (tile_.id_[0] == 6 &&
        tile_.id_[1] == 16 &&
        tile_.id_[2] == 11) {
        tile_ = tile_;
        //debugger;
    }

    if (tile_.id_[0] == 5 &&
        tile_.id_[1] == 8 &&
        tile_.id_[2] == 5) {
        tile_ = tile_;
        //debugger;
    }

    tile_.metanode_.metatile_.used();

    if (tile_.lastSurface_ && tile_.lastSurface_ == tile_.surface_) {
        tile_.lastSurface_ = null;
        tile_.restoreLastState();
        //return;
    }
        
    //if (tile_.id_[0] == 17) {
        //tile_ = tile_;
    //}

    //if (tile_.id_[0] == 16 && tile_.id_[1] == 32592 && tile_.id_[2] == 32288) {
      //  tile_ = tile_;
    //}

    var childrenSequence_ = null;

    //get children sequence (render path only)
    if (!(this.params_ && this.params_.traceHeight_)) {
        childrenSequence_ = this.childSelectingFunction_(tile_, this.params_);
    }
    
    //process tile e.g. draw or get height
    var res_ = this.nodeProcessingFunction_(tile_, this.params_, childrenSequence_, priority_, processFlag_, processFlag2_); 
    
    if (res_[0] == true) { //we need to go deeper
        if (!childrenSequence_) { //get height path only
            childrenSequence_ = this.childSelectingFunction_(tile_, this.params_);
        }

        for (var i = 0, li = childrenSequence_.length; i < li; i++) {
            this.traceTile(tile_.children_[childrenSequence_[i][0]], childrenSequence_[i][1], res_[1], res_[2]);
        }
    }
};

Melown.MapMetanodeTracer.prototype.checkTileSurface = function(tile_, priority_) {
    tile_.surface_ = null;
    tile_.virtual_ = false;
    tile_.virtualReady_ = false;
    tile_.virtualSurfaces_ = [];

    var sequence_ = this.map_.surfaceSequence_;
    
    //only one surface
    if (sequence_.length == 1000000) {  //1000000 is hack old value is 1
        if (sequence_[0].hasMetatile(tile_.id_) == true) {
            var surface_ = sequence_[0];

            //reset tile data
            /*
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }*/

            tile_.surface_ = surface_;
        }
        
        return;        
    }

    //if (tile_.id_[0] == 13) {
       // tile_ = tile_;
       // debugger;
    //}

    //multiple surfaces
    //build virtual surfaces array
    //find surfaces with content
    for (var i = 0, li = sequence_.length; i < li; i++) {
        var res_ = sequence_[i].hasTile2(tile_.id_);
        if (res_[0] == true) {

            var surface_ = sequence_[i];
            
            //check if tile exist
            if (tile_.id_[0] > surface_.lodRange_[0]) {
                //!!!!!!removed for debug
                ///* ????????
                var parent_ = tile_.parent_;
                if (parent_ != null && parent_.metastorage_ != null) {
                    var metatile_ = parent_.metastorage_.getMetatile(surface_);
                    if (metatile_ && metatile_.isReady(priority_)) {
                        var node_ = metatile_.getNode(parent_.id_);
                        if (node_) {
                            if (!node_.hasChildById(tile_.id_)) {
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
            tile_.virtualSurfaces_.push(surface_);        
        }
    }

    //
    if (tile_.virtualSurfaces_.length > 1) {
        tile_.virtual_ = true;
    } else {
        tile_.surface_ = tile_.virtualSurfaces_[0];
    }

};

Melown.MapMetanodeTracer.prototype.checkTileMetanode = function(tile_, priority_) {
    if (tile_.virtual_) {
        if (this.isVirtualMetanodeReady(tile_, priority_)) {
            tile_.metanode_ = this.createVirtualMetanode(tile_, priority_);
            tile_.lastMetanode_ = null;
            this.map_.markDirty();
        } else {
            return false;
        }
    }

    //var surface_ = this.surface_ || tile_.surface_; ?????
    var surface_ = tile_.surface_;

    if (surface_ == null) {
        return false;
    }

    var metatile_ = tile_.metastorage_.getMetatile(surface_);

    if (metatile_ == null) {
        metatile_ = new Melown.MapMetatile(tile_.metastorage_, surface_);
        tile_.metastorage_.addMetatile(metatile_);
    }

    if (metatile_.isReady(priority_) == true) {

        if (!tile_.virtual_) {
            tile_.metanode_ = metatile_.getNode(tile_.id_);
            tile_.lastMetanode_ = null;
            this.map_.markDirty(); 
        }

        if (tile_.metanode_ != null) {
            /*
            if (tile_.id_[0] == 15) {
                tile_ = tile_;
            }*/

            tile_.metanode_.tile_ = tile_; //used only for validate
            tile_.lastMetanode_ = null;
            this.map_.markDirty(); 

            for (var i = 0; i < 4; i++) {
                if (tile_.metanode_.hasChild(i) == true) {
                    tile_.addChild(i);
                } else {
                    tile_.removeChildByIndex(i);
                }
            }
        }

    } else {
        return false;
    }
    
    return true;
};

Melown.MapMetanodeTracer.prototype.isVirtualMetanodeReady = function(tile_, priority_) {
    var surfaces_ = tile_.virtualSurfaces_;
    var readyCount_ = 0;

//    if (tile_.id_[0] == 18 &&
//        tile_.id_[1] == 130400 &&
//        tile_.id_[2] == 129088) {
//        debugger;
//    }

    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = surfaces_[i];
        var metatile_ = tile_.metastorage_.getMetatile(surface_);

        if (metatile_ == null) {
            metatile_ = new Melown.MapMetatile(tile_.metastorage_, surface_);
            tile_.metastorage_.addMetatile(metatile_);
        }

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

Melown.MapMetanodeTracer.prototype.createVirtualMetanode = function(tile_, priority_) {
    var surfaces_ = tile_.virtualSurfaces_;
    var first_ = false;
    var node_ = null;
    
    //if (tile_.id_[0] == 15 &&
      //  tile_.id_[1] == 16297 &&
      //  tile_.id_[2] == 16143) {
        //tile_ = tile_;
      //  debugger;
    //}

    //if (tile_.id_[0] == 20) {
        //debugger;
    //}


    //get top most existing surface
    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = surfaces_[i];
        var metatile_ = tile_.metastorage_.getMetatile(surface_);

        if (metatile_.isReady(priority_) == true) {
            var metanode_ = metatile_.getNode(tile_.id_);

            if (metanode_ != null) {
                //does metanode have surface reference?
                //internalTextureCount is reference to surface
                if (surface_.glue_ && !metanode_.hasGeometry() &&
                    metanode_.internalTextureCount_ > 0) {
                    var desiredSurfaceIndex_ = metanode_.internalTextureCount_ - 1;
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
                    tile_.surface_ = surface_;
                    break;
                }
            }
        }
    }

    //if (tile_.id_[0] == 13 &&
      //  tile_.id_[1] == 4075 &&
      //  tile_.id_[2] == 4034) {
        //debugger;
    //}

    //extend bbox and children flags by other surfaces
    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var surface_ = surfaces_[i];
        var metatile_ = tile_.metastorage_.getMetatile(surface_);

        if (metatile_.isReady(priority_) == true) {
            var metanode_ = metatile_.getNode(tile_.id_);

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
                    tile_.surface_ = surface_;
                } else {
                    node_.flags_ |= metanode_.flags_ & ((15)<<4); 

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
    
    return node_;
};







