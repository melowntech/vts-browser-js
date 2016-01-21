/**
 * @constructor
 */
Melown.MapMetanodeTracer = function(mapTree_, surface_, nodeProcessingFunction_) {
    this.map_ = mapTree_.map_;
    this.surfaceTree_ = mapTree_.surfaceTree_;
    this.metastorageTree_ = mapTree_.metastorageTree_;
    this.metaBinaryOrder_ = mapTree_.metaBinaryOrder_;
    this.rootId_ = mapTree_.rootId_;
    this.surface_ = surface_; //????
    this.nodeProcessingFunction_ = nodeProcessingFunction_;
    this.params_ = null;
};

Melown.MapMetanodeTracer.prototype.trace = function(tile_, params_) {
    this.params_ = params_;
    this.traceTile(this.surfaceTree_);
};

Melown.MapMetanodeTracer.prototype.traceTile = function(tile_, reducedProcessing_) {
    if (tile_ == null) {
        return;
    }

    //if (tile_.id_[0] == 18 &&
    //    tile_.id_[1] == 130430 &&
    //    tile_.id_[2] == 129088) {
    //    debugger;
    //}

    if (tile_.metastorage_ == null) {
        tile_.metastorage_ = Melown.FindMetastorage(this.map_, this.metastorageTree_, this.rootId_, tile_, this.metaBinaryOrder_);
    }

    if (this.map_.viewCounter_ != tile_.viewCoutner_) {
        tile_.viewSwitched();
        tile_.viewCoutner_ = this.map_.viewCounter_; 
    }

    if (tile_.surface_ == null && tile_.virtualSurfaces_.length == 0) {
        this.checkTileSurface(tile_);
    }

    if (tile_.metanode_ == null) {
        if (tile_.virtual_) {
            if (!this.isVirtualMetanodeReady(tile_)) {
                return;
            }
        }

        //var surface_ = this.surface_ || tile_.surface_; ?????
        var surface_ = tile_.surface_;

        if (surface_ == null) {
            return;
        }

        var metatile_ = tile_.metastorage_.getMetatile(surface_);

        if (metatile_ == null) {
            metatile_ = new Melown.MapMetatile(tile_.metastorage_, surface_);
            tile_.metastorage_.addMetatile(metatile_);
        }
    
        if (metatile_.isReady() == true) {

            if (!tile_.virtual_) {
                tile_.metanode_ = metatile_.getNode(tile_.id_);
            }

            if (tile_.metanode_ != null) {
                /*
                if (tile_.id_[0] == 15) {
                    tile_ = tile_;
                }*/

                tile_.metanode_.tile_ = tile_; //used only for validate

                for (var i = 0; i < 4; i++) {
                    if (tile_.metanode_.hasChild(i) == true) {
                        tile_.addChild(i);
                    } else {
                        tile_.removeChildByIndex(i);
                    }
                }
            }

        } else {
            return;
        }
    }

    if (tile_.metanode_ == null) { //only for wrong data
        return;
    }

    if (tile_.lastSurface_ && tile_.lastSurface_ == tile_.surface_) {
        tile_.lastSurface_ = null;
        tile_.restoreLastState();
        //return;
    }


    tile_.metanode_.metatile_.used();

    //if (tile_.id_[0] == 17) {
        //tile_ = tile_;
    //}
    
    var res_ = this.nodeProcessingFunction_(tile_, this.params_, reducedProcessing_); 

    if (res_[0] == true) {

        if (this.params_ && this.params_.traceHeight_) {
            var coords_ = this.params_.coords_;
            var extents_ = this.params_.extents_;
            var center_ = [(extents_.ll_[0] + extents_.ur_[0]) *0.5,
                           (extents_.ll_[1] + extents_.ur_[1]) *0.5];

            //ul,ur,ll,lr

            var right_ = (coords_[0] >= center_[0]);
            var bottom_ = (coords_[1] >= center_[1]);

            if (right_) {
                extents_.ll_[0] = center_[0];
                if (bottom_) {
                    extents_.ll_[1] = center_[1];
                } else {
                    extents_.ur_[1] = center_[1];
                }
            } else {
                extents_.ur_[0] = center_[0];
                if (bottom_) {
                    extents_.ll_[1] = center_[1];
                } else {
                    extents_.ur_[1] = center_[1];
                }
            }

            /*
            if (extents_.ll_[0] > extents_.ur_[0]) {
                right_ = !right_;
            }

            if (extents_.ll_[1] < extents_.ur_[1]) {
                bottom_ = !bottom_;
            }*/

            if (right_) {
                if (bottom_) {
                    this.traceTile(tile_.children_[1]);
                } else {
                    this.traceTile(tile_.children_[3]);
                }

            } else {
                if (bottom_) {
                    this.traceTile(tile_.children_[0]);
                } else {
                    this.traceTile(tile_.children_[2]);
                }
            }


        } else {
            //trace children
            for (var i = 0; i < 4; i++) {
                this.traceTile(tile_.children_[i], res_[1]);
            }
        }
    }
};

Melown.MapMetanodeTracer.prototype.checkTileSurface = function(tile_) {
    tile_.surface_ = null;
    tile_.virtual_ = false;
    tile_.virtualReady_ = false;
    tile_.virtualSurfaces_ = [];

    var sequence_ = this.map_.surfaceSequence_;
    
    //only one surface
    if (sequence_.length == 1) {
        if (sequence_[0].hasMetatile(tile_.id_) == true) {
            var surface_ = sequence_[0];

            //reset tile data
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }

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
                    if (metatile_ && metatile_.isReady()) {
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
            
            /*
            //set top most surface
            if (tile_.surface_ == null) { // && res_[1] == false) {
                //reset tile data
                if (tile_.surface_ != surface_) {
                    tile_.surfaceMesh_ = null;
                    tile_.surfaceTexture_ = null;
                    tile_.surfaceGeodata_ = null;
                    tile_.heightMap_ = null;
                }
    
                tile_.surface_ = surface_;
                //tile_.empty_ = false;
            }*/
    
            //store surface
            tile_.virtualSurfaces_.push(surface_);        
        }

        //!!!!!!debug hack
        //tile_.virtualSurfaces_.push(sequence_[i]);        
    }

    //if (tile_.surface_ != null) {
        if (tile_.virtualSurfaces_.length > 1) {
            tile_.virtual_ = true;
        } else {
            tile_.surface_ = tile_.virtualSurfaces_[0];
        }
        
        return;
    //}
/*
    //find surfaces with metatile
    for (var i = sequence_.length - 1; i >= 0; i--) {
        if (sequence_[i].hasMetatile(tile_.id_) == true) {

            var surface_ = sequence_[i];

            //reset tile data
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }

            tile_.surface_ = surface_;
            //tile_.empty_ = true;

            return;
        }
    }
*/
};

Melown.MapMetanodeTracer.prototype.isVirtualMetanodeReady = function(tile_) {
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

        if (metatile_.isReady() == true) {
            readyCount_++;
        }
    }
    
    if (readyCount_ == li) {
        tile_.metanode_ = this.createVirtualMetanode(tile_);
        return true;        
    } else {
        return false;
    }
};

Melown.MapMetanodeTracer.prototype.createVirtualMetanode = function(tile_) {
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

        if (metatile_.isReady() == true) {
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

        if (metatile_.isReady() == true) {
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







