/**
 * @constructor
 */
Melown.MapSurfaceTree = function(map_, freeLayer_, freeLayerSurface_) {
    this.map_ = map_;
    this.camera_ = map_.camera_;
    this.rootId_ = [0,0,0];
    this.freeLayer_ = freeLayer_;
    this.freeLayerSurface_ = freeLayerSurface_;
    this.metaBinaryOrder_ = this.map_.referenceFrame_.params_.metaBinaryOrder_;
    this.initialized_ = false;
    //this.geocent_ = !this.map_.getNavigationSrs().isProjected();

    this.surfaceTree_ = new Melown.MapSurfaceTile(this.map_, null, this.rootId_);

    if (freeLayer_ != true) {
        //this.heightTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceTileHeight.bind(this), this.traceHeightChild.bind(this));
        //this.heightTracerNodeOnly_ = new Melown.MapMetanodeTracer(this, null, this.traceTileHeightNodeOnly.bind(this), this.traceHeightChild.bind(this));
    }

    this.surfaceSequence_ = [];
    this.surfaceOnlySequence_ = [];

    this.config_ = this.map_.config_;
    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = 1.0;
    this.counter_ = 0;
};

Melown.MapSurfaceTree.prototype.kill = function() {
    this.surfaceTree_ = null;
    this.metastorageTree_ = null;
    this.surfaceTracer_ = null;
    this.heightTracer_ = null;
};

Melown.MapSurfaceTree.prototype.init = function() {
    var url_ = this.map_.makeUrl(surface.metaUrl_, {lod_:result_[0], ix_:result_[1], iy_:result_[2] });  //result???
    map_.loader_.load(url_, metatile_.load_.bind(metatile_, url_));

    this.metatileTree_.load();
    this.surfaceTree_.metatile_ = 1;

    this.initialized_ = true;
};

Melown.MapSurfaceTree.prototype.findSurfaceTile = function(id_) {
    var tile_ = this.surfaceTree_;

//    for (var lod_ = 1; lod_ <= id_[0]; lod_++) {
//        var mask_ = 1 << (lod_-1);
//        var index_ = 0;

    for (var lod_ = id_[0]; lod_ > 0; lod_--) {
        var mask_ = 1 << (lod_-1);
        var index_ = 0;
        
        if ((id_[1] & mask_) != 0) {
            index_ += 1;
        }

        if ((id_[2] & mask_) != 0) {
            index_ += 2;
        }
        
        tile_ = tile_.children_[index_];

        if (!tile_) {
            return null;
        }
    }
    
    return tile_;
};

Melown.MapSurfaceTree.prototype.findNavTile = function(id_) {
    var tile_ = this.surfaceTree_;
    
    if (id_[0] == 0) {
        if (tile_.metanode_ && tile_.metanode_.hasNavtile()) {
            return tile_;
        } else {
            return null;
        }
    }
    
    var navtile_ = null;

//    for (var lod_ = 1; lod_ <= id_[0]; lod_++) {
//        var mask_ = 1 << (id_[0] - lod_);
//        var index_ = 0;
    for (var lod_ = id_[0]; lod_ > 0; lod_--) {
        var mask_ = 1 << (lod_-1);
        var index_ = 0;

        if ((id_[1] & mask_) != 0) {
            index_ += 1;
        }

        if ((id_[2] & mask_) != 0) {
            index_ += 2;
        }
        
        tile_ = tile_.children_[index_];

        if (!tile_) {
            return navtile_;
        } else {
            if (tile_.metanode_ && tile_.metanode_.hasNavtile()) {
                navtile_ = tile_;
            }
        }
    }
    
    return navtile_;
};


Melown.MapSurfaceTree.prototype.draw = function() {
    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = this.map_.ndcToScreenPixel_;
    
    var srs_ = this.map_.getPhysicalSrs();

    var divisionNode_ = this.divisionNode_;
    var periodicity_ = srs_.periodicity_;

    //if (this.map_.config_.mapBasicTileSequence_) {
        //this.surfaceTracer_ = this.surfaceTracerBasic_;
    //}

    if (periodicity_ != null) {
        this.drawSurface([0,0,0]);

        if (periodicity_.type_ == "X") {
            this.drawSurface([periodicity_.period_,0,0]);
            this.drawSurface([-periodicity_.period_,0,0]);
        }

    } else {
        var mode_;

        if (this.freeLayerSurface_ && this.freeLayerSurface_.geodata_) {
            mode_ = this.map_.config_.mapGeodataLoadMode_; 
        } else {
            mode_ = this.map_.config_.mapLoadMode_; 
        }

        switch(mode_) {
            case "topdown": this.drawSurface([0,0,0]); break;
            case "fit":     this.drawGeodataSurface([0,0,0]); break;
            case "fitonly": this.drawGeodataSurface2([0,0,0]); break;
        }
    }
};

Melown.MapSurfaceTree.prototype.updateNodeHeightExtents = function(tile_, node_) {
    //debugger
    
    if (!node_.heightReady_ && node_.metatile_.useVersion_ < 4) {
        var parent_ = tile_.parent_;

        if (node_.hasNavtile()) {
            node_ = node_;
        }
        
        while (parent_) {
            var parentNode_ = parent_.metanode_;  
            if (parentNode_.hasNavtile()) {

                if (node_.hasNavtile()) {
                    node_ = node_;
                }

                node_.minHeight_ = parentNode_.minHeight_;
                node_.maxHeight_ = parentNode_.maxHeight_;
                node_.minZ_ = parentNode_.minZ_;
                node_.maxZ_ = parentNode_.maxZ_;
                node_.generateCullingHelpers();
                break;
            }
            
            parent_ = parent_.parent_;
        }

        node_.heightReady_ = true;
    }
};

Melown.MapSurfaceTree.prototype.logTileInfo = function(tile_, node_, cameraPos_) {
    if (!tile_ || !node_) {
        return;
    }
    
    var visible_ = tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_);
    tile_.updateTexelSize();
    
//    console.log("tile: " + JSON.stringify(tile_.id_) + " visible: " + visible_ + " texelsize: " +  tile_.texelSize_);
    console.log("tile: " + JSON.stringify(tile_.id_) + " visible: " + visible_ + " texelsize: " +  tile_.texelSize_ + " center: "  + JSON.stringify(node_.diskPos_) + " vec: " + node_.diskNormal_ + "ang: " + node_.diskAngle_ + " dist: " + node_.diskDistance_);
};

//loadmode = topdown
Melown.MapSurfaceTree.prototype.drawSurface = function(shift_) {
    this.counter_++;
//    this.surfaceTracer_.trace(this.surfaceTree_);//this.rootId_);

    var tile_ = this.surfaceTree_;
    
    if (!tile_.isMetanodeReady(this, 0)) {
        return;
    }
    
    var map_ = this.map_;
    var node_ = tile_.metanode_;
    var cameraPos_ = map_.cameraPosition_;

    if (!tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {
        return;
    }

    tile_.updateTexelSize();
    
    var typeFactor_ = this.freeLayerSurface_ ? 1 : 1;

    var drawBuffer_ = map_.drawBuffer_;
    var processBuffer_ = map_.processBuffer_;
    var newProcessBuffer_ = map_.processBuffer2_;
    var drawBufferIndex_ = 0;
    var processBufferIndex_ = 0;
    var newProcessBufferIndex_ = 0;
    
    processBuffer_[0] = tile_;
    processBufferIndex_ = 1;

    /*    
    if (this.map_stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_) {
        return false;
    }*/
    
    var texelSizeFit_ = map_.texelSizeFit_;

    var best2_ = 0;
    var storeNodes_ = map_.replay_.storeNodes_ || map_.replay_.storeFreeNodes_;
    var storeNodesBuffer_ = map_.replay_.nodeBuffer_; 
    
    //var more_ = 0;
    //var more2_ = 1;
    
    map_.drawCounter_++;
    
    var pocessedNodes_ = 1;
    var pocessedMetatiles_ = 1;  
    var usedNodes_ = 1;
    var usedMetatiles_ = 1;  
    var drawCounter_ = map_.drawCounter_;


    do {
        var best_ = 0;
        newProcessBufferIndex_ = 0;
        
        for (var i = processBufferIndex_ - 1; i >= 0; i--) {
            tile_ = processBuffer_[i];
            node_ = tile_.metanode_;

            if (node_) {
                pocessedNodes_++;
                if (node_.metatile_.drawCounter_ != drawCounter_) {
                    node_.metatile_.drawCounter_ = drawCounter_;
                    pocessedMetatiles_++;
                }
            }
            
            //if (this.map_.drawIndices_) {
              //  this.logTileInfo(tile_, node_, cameraPos_);
            //}

            if (tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {

                usedNodes_++;

                if (tile_.texelSize_ != Number.POSITIVE_INFINITY){
                    if (tile_.texelSize_ > best_) {
                        best_ = tile_.texelSize_;
                    }
                }
                
                if (storeNodes_) { //used only for inspector_
                    storeNodesBuffer_.push(tile_);
                }
                
                /*var n = childrenBuffer_[j].metanode_;
                if ((n.id_[0] == 2 && n.id_[1] == 3 && n.id_[2] == 1)) {
                    n = n;
                }*/
                
                
                if (/*node_.hasGeometry() && */tile_.texelSize_ <= texelSizeFit_) {
                    
                    drawBuffer_[drawBufferIndex_] = tile_;
                    drawBufferIndex_++;
                    
                } else { //go deeper

                    var childrenCount_ = 0;
                    var readyCount_ = 0;
                    var childrenBuffer_ = [];
                    
                    var more3_ = 0;
        
                    for (var j = 0; j < 4; j++) {
                        var child_ = tile_.children_[j];
                        if (child_) {
                            childrenCount_++;
                            
                            //if (child_.id_[0] == 2 && child_.id_[1] == 3 && child_.id_[2] == 0) {
                              //  child_ = child_;
                            //}
       
                            if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority
                                
                               /*if (!child_.bboxVisible(child_.id_, child_.metanode_.bbox_, cameraPos_, child_.metanode_)) {
                                    more_++;
                                    more3_++;
                               } else {
                                    more2_++;
                               }*/

                                this.updateNodeHeightExtents(child_, child_.metanode_);
                                child_.updateTexelSize();
                                
                                var priority_ = child_.id_[0] * typeFactor_ * child_.distance_;
                                
                                if (!tile_.surface_ || !child_.metanode_.hasGeometry()) {

                                    readyCount_++;
                                    //child_.updateTexelSize();
                                    childrenBuffer_.push(child_);
                                    
                                } else {

                                    //are draw buffers ready? preventRender=true, preventLoad_=false
                                    if (map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, false)) {
                                        readyCount_++;
                                        //child_.updateTexelSize();
                                        childrenBuffer_.push(child_);
                                    }
                                    
                                }
                            }
                        }
                    }
                    
                    /*if (childrenCount_ == more3_) {
                        //console.log("more3!!!!");
                        more_ -= more3_;
                    }*/
        
                    if (childrenCount_ > 0 && childrenCount_ == readyCount_ && childrenCount_ != more3_) {
                        //sort childern by distance
    
                        do {
                            var sorted_ = true;
                            
                            for (var j = 0, lj = childrenBuffer_.length - 1; j < lj; j++) {
                                if (childrenBuffer_[j].distance_ > childrenBuffer_[j+1].distance_) {
                                    var t = childrenBuffer_[j];
                                    childrenBuffer_[j] = childrenBuffer_[j+1];
                                    childrenBuffer_[j+1] = t;
                                    sorted_ = false;
                                } 
                            }
                            
                        } while(!sorted_);
    
    
                        //add childern to new process buffer 
                        for (var j = 0, lj = childrenBuffer_.length; j < lj; j++) {
                            
                            /*var n = childrenBuffer_[j].metanode_.divisionNode_;
                            if ((n.id_[0] == 1 && n.id_[1] == 1 && n.id_[2] == 0)) {*/
                                newProcessBuffer_[newProcessBufferIndex_] = childrenBuffer_[j];
                                newProcessBufferIndex_++;
                            /*}*/
                            
                        }
                    } else {
                        drawBuffer_[drawBufferIndex_] = tile_;
                        drawBufferIndex_++;
                    }
                    
                }
            }
        }
        
        var tmp_ = processBuffer_;
        processBuffer_ = newProcessBuffer_;
        newProcessBuffer_ = tmp_;
        processBufferIndex_ = newProcessBufferIndex_;

        //if (tile_) {
          //  console.log("texel: "+ (best_ / 1) + "   " + JSON.stringify(tile_.id_));
        //}
        
        if (best_ != 0) {
            best2_ = best_;
        }

    } while(processBufferIndex_ > 0);
    
    if (best2_ > this.map_.bestMeshTexelSize_) {
        this.map_.bestMeshTexelSize_ = best2_;
    }

    map_.stats_.usedNodes_ = usedNodes_;    
    map_.stats_.processedNodes_ = pocessedNodes_;    
    map_.stats_.processedMetatiles_ = pocessedMetatiles_;    
    
    //console.log("texel: "+ this.map_.bestMeshTexelSize_);
    //console.log("more: "+ more_ + "more2: " + more2_);


    if (this.map_.replay_.storeTiles_ || this.map_.replay_.storeFreeTiles_) { //used only in inspectors
        if (!this.map_.tileBuffer_[0]) {
            this.map_.tileBuffer_[0] = [];
        }
        
        var tiles_ = this.map_.tileBuffer_[0];
        for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
            tiles_.push(drawBuffer_[i]);
        }
    }

    for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
        tile_ = drawBuffer_[i];
        //draw tile,  preventRender=false, preventLoad_=false
        map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, 0, false, false);
    }
};


//loadmode = fitonly
Melown.MapSurfaceTree.prototype.drawGeodataSurface2 = function(shift_) {
    this.counter_++;
//    this.surfaceTracer_.trace(this.surfaceTree_);//this.rootId_);

    var tile_ = this.surfaceTree_;
    
    if (!tile_.isMetanodeReady(this, 0)) {
        return;
    }
    
    var map_ = this.map_;
    var node_ = tile_.metanode_;
    var cameraPos_ = map_.cameraPosition_;

    if (!tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {
        return;
    }

    tile_.updateTexelSize();
    
    var typeFactor_ = this.freeLayerSurface_ ? 1 : 1;
    
    var drawBuffer_ = map_.drawBuffer_;
    var processBuffer_ = map_.processBuffer_;
    var newProcessBuffer_ = map_.processBuffer2_;
    var drawBufferIndex_ = 0;
    var processBufferIndex_ = 0;
    var newProcessBufferIndex_ = 0;
    var checkGpu_ = true;
    
    processBuffer_[0] = tile_;
    processBufferIndex_ = 1;

    var texelSizeFit_ = map_.texelSizeFit_;

    var best2_ = 0;
    var storeNodes_ = map_.replay_.storeNodes_ || map_.replay_.storeFreeNodes_;
    var storeNodesBuffer_ = map_.replay_.nodeBuffer_; 

    map_.drawCounter_++;
    
    var usedNodes_ = 1;
    var pocessedNodes_ = 1;
    var pocessedMetatiles_ = 1;  
    var drawCounter_ = map_.drawCounter_;
    
    do {
        var best_ = 0;
        newProcessBufferIndex_ = 0;
        
        for (var i = processBufferIndex_ - 1; i >= 0; i--) {
            tile_ = processBuffer_[i];
            node_ = tile_.metanode_;

            if (node_) {
                pocessedNodes_++;
                if (node_.metatile_.drawCounter_ != drawCounter_) {
                    node_.metatile_.drawCounter_ = drawCounter_;
                    pocessedMetatiles_++;
                }
            }

            if (tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {

                usedNodes_++;

                if (storeNodes_) { //used only for inspaector_
                    storeNodesBuffer_.push(tile_);
                }

                if (tile_.texelSize_  != Number.POSITIVE_INFINITY){
                    if (tile_.texelSize_ > best_) {
                        best_ = tile_.texelSize_;
                    }
                }
                
                if (/*node_.hasGeometry() && */tile_.texelSize_ <= texelSizeFit_) {
                    
                    drawBuffer_[drawBufferIndex_] = tile_;
                    drawBufferIndex_++;
                    
                } else { //go deeper

                    var childrenCount_ = 0;
                    var readyCount_ = 0;
                    var childrenBuffer_ = [];
        
                    for (var j = 0; j < 4; j++) {
                        var child_ = tile_.children_[j];
                        if (child_) {
                            childrenCount_++;
       
                            if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority

                                this.updateNodeHeightExtents(child_, child_.metanode_);
                                child_.updateTexelSize();
                                
                                var priority_ = child_.id_[0] * typeFactor_ * child_.distance_; 
                                
                                //are draw buffers ready? preventRender=true, preventLoad_=false
                                //if (this.map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, false)) {
                                    //readyCount_++;
                                    //child_.updateTexelSize();
                                    childrenBuffer_.push(child_);
                                //} else {
                                    
                                    //check children
                                    /*
                                    for (var k = 0; k < 4; k++) {
                                        var subchild_ = child_.children_[k];
                                        if (subchild_) {
                                            childrenCount_++;
                       
                                            if (subchild_.isMetanodeReady(this, subchild_.id_[0])) { //lod is used as priority
                                                
                                            }
                                        }
                                    }*/
                                    
                                    
                                //}
                            }
                        }
                    }
        
                    if (childrenCount_ > 0/* && childrenCount_ == readyCount_*/) {
                        //sort childern by distance
    
                        do {
                            var sorted_ = true;
                            
                            for (var j = 0, lj = childrenBuffer_.length - 1; j < lj; j++) {
                                if (childrenBuffer_[j].distance_ > childrenBuffer_[j+1].distance_) {
                                    var t = childrenBuffer_[j];
                                    childrenBuffer_[j] = childrenBuffer_[j+1];
                                    childrenBuffer_[j+1] = t;
                                    sorted_ = false;
                                } 
                            }
                            
                        } while(!sorted_);
    
                        //add childern to new process buffer 
                        for (var j = 0, lj = childrenBuffer_.length; j < lj; j++) {

                            //var n = childrenBuffer_[j].metanode_.divisionNode_;
                            //if ((n.id_[0] == 1 && n.id_[1] == 1 && n.id_[2] == 0)) {
                                newProcessBuffer_[newProcessBufferIndex_] = childrenBuffer_[j];
                                newProcessBufferIndex_++;
                            //}
                        }
                    } else {
                        drawBuffer_[drawBufferIndex_] = tile_;
                        drawBufferIndex_++;
                    }
                    
                }
            }
        }
        
        var tmp_ = processBuffer_;
        processBuffer_ = newProcessBuffer_;
        newProcessBuffer_ = tmp_;
        processBufferIndex_ = newProcessBufferIndex_;

        if (best_ != 0) {
            best2_ = best_;
        }
        
    } while(processBufferIndex_ > 0);

    map_.stats_.usedNodes_ = usedNodes_;    
    map_.stats_.processedNodes_ = pocessedNodes_;    
    map_.stats_.processedMetatiles_ = pocessedMetatiles_;    

    if (this.map_.replay_.storeTiles_ || this.map_.replay_.storeFreeTiles_) { //used only in inspectors
        if (!this.map_.tileBuffer_[0]) {
            this.map_.tileBuffer_[0] = [];
        }
        
        var tiles_ = this.map_.tileBuffer_[0];
        for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
            tiles_.push(drawBuffer_[i]);
        }
    }

    for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
        tile_ = drawBuffer_[i];
        //draw tile,  preventRender=false, preventLoad_=false
        map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, 0, false, false);
    }
};


//loadmode = fit
Melown.MapSurfaceTree.prototype.drawGeodataSurface = function(shift_) {
    this.counter_++;
//    this.surfaceTracer_.trace(this.surfaceTree_);//this.rootId_);

    var tile_ = this.surfaceTree_;
    
    if (!tile_.isMetanodeReady(this, 0)) {
        return;
    }
    
    var map_ = this.map_;
    var node_ = tile_.metanode_;
    var cameraPos_ = map_.cameraPosition_;

    if (!tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {
        return;
    }

    tile_.updateTexelSize();

    var geodata_ = tile_.surface_.geodata_;
    var free_ = tile_.surface_.free_;
    var drawGrid_ = (!geodata_ && !free_ && map_.config_.mapHeightfiledWhenUnloaded_);
    var checkGpu_ = true;
    
    var lodShift_ = 4;//this.freeLayerSurface_ ? 1 : 1;
    var typeFactor_ = 2000;//this.freeLayerSurface_ ? 1 : 1;
    
    var drawBuffer_ = map_.drawBuffer_;
    var processBuffer_ = map_.processBuffer_;
    var newProcessBuffer_ = map_.processBuffer2_;
    var drawBufferIndex_ = 0;
    var processBufferIndex_ = 0;
    var newProcessBufferIndex_ = 0;
    
    processBuffer_[0] = [tile_, 0];
    processBufferIndex_ = 1;

    var texelSizeFit_ = map_.texelSizeFit_;

    var best2_ = 0;
    var storeNodes_ = map_.replay_.storeNodes_ || map_.replay_.storeFreeNodes_;
    var storeNodesBuffer_ = map_.replay_.nodeBuffer_; 

    map_.drawCounter_++;
    
    var usedNodes_ = 1;
    var pocessedNodes_ = 1;
    var pocessedMetatiles_ = 1;  
    var drawCounter_ = map_.drawCounter_;
    var maxHiresLodLevels_ = map_.config_.mapMaxHiresLodLevels_; 
    
    do {
        var best_ = 0;
        newProcessBufferIndex_ = 0;

        /*if (this.map_.drawIndices_) {
            console.log("processed begin==============================================");
        }*/            
       
        for (var i = processBufferIndex_ - 1; i >= 0; i--) {
            var pack_ = processBuffer_[i];
            tile_ = pack_[0];
            depth_ = pack_[1];
            
            /*if (this.map_.drawIndices_) {
                console.log(JSON.stringify(tile_.id_));
            }*/
            
            if (depth_ >= maxHiresLodLevels_) {
                if (drawGrid_) {
                    drawBuffer_[drawBufferIndex_] = [tile_, true]; //draw grid
                    drawBufferIndex_++;
                }

                continue;
            }
            /*
            if (tile_.id_[0] >= 16) { 
                tile_ = tile_;    
            }*/ 

            /*
            if (tile_.id_[0] == 12 &&
                tile_.id_[1] == 1107 &&
                tile_.id_[2] == 688) {
                tile_ = tile_;
            }*/
            
            node_ = tile_.metanode_;

            if (node_) {
                pocessedNodes_++;
                if (node_.metatile_.drawCounter_ != drawCounter_) {
                    node_.metatile_.drawCounter_ = drawCounter_;
                    pocessedMetatiles_++;
                }
            }


            if (tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {

                usedNodes_++;

                if (tile_.texelSize_  != Number.POSITIVE_INFINITY){
                    if (tile_.texelSize_ > best_) {
                        best_ = tile_.texelSize_;
                    }
                }

                if (storeNodes_) { //used only for inspaector_
                    storeNodesBuffer_.push(tile_);
                }
                
                var lastProcessBufferIndex_ = newProcessBufferIndex_;
                var lastDrawBufferIndex_ = drawBufferIndex_;

                if (node_.hasChildren() == false || tile_.texelSize_ <= texelSizeFit_) {

                    var priority_ = ((tile_.id_[0] + lodShift_) * typeFactor_) * tile_.distance_; 
            
                    if (node_.hasChildren() && !map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, priority_, true, (depth_ > 0), checkGpu_)) {

                        depth_++; //we dont have tile ready, so we try to draw more detailed tiles
            
                        for (var j = 0; j < 4; j++) {
                            var child_ = tile_.children_[j];
                            if (child_) {
           
                                if (child_.isMetanodeReady(this, child_.id_[0], true)) { //lod is used as priority

                                    this.updateNodeHeightExtents(child_, child_.metanode_);
                                    child_.updateTexelSize();
                                    
                                    var priority_ = ((child_.id_[0] + lodShift_) * typeFactor_) * child_.distance_; 

                                    /*if (child_.id_[0] == 18 && 
                                    child_.id_[1] == 20982 &&
                                    child_.id_[2] == 50643){
                                        child_ = child_;    
                                    }*/
                                    
                                    //are draw buffers ready? preventRender=true, preventLoad_=false
                                    if (map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, (depth_ > 0), checkGpu_)) {
                                        drawBuffer_[drawBufferIndex_] = [child_, false];
                                        drawBufferIndex_++;
                                    } else {
                                        newProcessBuffer_[newProcessBufferIndex_] = [child_, depth_];
                                        newProcessBufferIndex_++;
                                    }
                                } //if (drawGrid_) {
                                 //   child_.drawGrid(cameraPos_);
                                //}
                            }
                        }

                    } else {
                        drawBuffer_[drawBufferIndex_] = [tile_, false];
                        drawBufferIndex_++;
                    }
                    
                } else if (depth_ == 0 && node_.hasGeometry() && tile_.texelSize_ <= (texelSizeFit_ * 2)) {
                    
                    //are all children ready? if not then draw carser lod
                    var childrenCount_ = 0;
                    var readyCount_ = 0;
                    var childrenBuffer_ = [];
        
                    for (var j = 0; j < 4; j++) {
                        var child_ = tile_.children_[j];
                        if (child_) {
                            childrenCount_++;
       
                            if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority

                                this.updateNodeHeightExtents(child_, child_.metanode_);
                                child_.updateTexelSize();
                                
                                var priority_ = ((child_.id_[0] + lodShift_) * typeFactor_) * child_.distance_; 
                               
                                //are draw buffers ready? preventRender=true, preventLoad_=false
                                if (map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, true, checkGpu_)) {
                                    readyCount_++;
                                    childrenBuffer_.push(child_);
                                }
                            } //if (drawGrid_) {
                             //   child_.drawGrid(cameraPos_);
                            //}
                        }
                    }
        
                    if (childrenCount_ > 0 && childrenCount_ == readyCount_) {
                        //sort childern by distance
    
                        do {
                            var sorted_ = true;
                            
                            for (var j = 0, lj = childrenBuffer_.length - 1; j < lj; j++) {
                                if (childrenBuffer_[j].distance_ > childrenBuffer_[j+1].distance_) {
                                    var t = childrenBuffer_[j];
                                    childrenBuffer_[j] = childrenBuffer_[j+1];
                                    childrenBuffer_[j+1] = t;
                                    sorted_ = false;
                                } 
                            }
                            
                        } while(!sorted_);
    
                        //add childern to new process buffer 
                        for (var j = 0, lj = childrenBuffer_.length; j < lj; j++) {
                            newProcessBuffer_[newProcessBufferIndex_] = [childrenBuffer_[j], depth_];
                            newProcessBufferIndex_++;
                        }
                    } else {
                        
                        //can i use coarser lod
                        //if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority

                        var priority_ = ((tile_.id_[0] + lodShift_) * typeFactor_) * tile_.distance_; 

                        if (map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, priority_, true, true, checkGpu_)) {
                            drawBuffer_[drawBufferIndex_] = [tile_, false];
                            drawBufferIndex_++;

                            for (var j = 0; j < 4; j++) {
                                var child_ = tile_.children_[j];
                                if (child_) {
                                    if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority
                                        priority_ = ((child_.id_[0] + lodShift_) * typeFactor_) * child_.distance_; 
                                        map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, false, checkGpu_);
                                    }
                                }
                            }

                        } else {

                            //add childern to new process buffer 
                            /*
                            for (var j = 0, lj = childrenBuffer_.length; j < lj; j++) {
                                newProcessBuffer_[newProcessBufferIndex_] = [childrenBuffer_[j], depth_];
                                newProcessBufferIndex_++;
                            }*/

                            for (var j = 0; j < 4; j++) {
                                var child_ = tile_.children_[j];
                                if (child_) {
                                    if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority
                                        this.updateNodeHeightExtents(child_, child_.metanode_);
                                        child_.updateTexelSize();

                                        newProcessBuffer_[newProcessBufferIndex_] = [child_, depth_];
                                        newProcessBufferIndex_++;
                                    }
                                }
                            }

                        } 
                    }

                }  else  {  //go deeper
                    
                    
                    for (var j = 0; j < 4; j++) {
                        var child_ = tile_.children_[j];
                        if (child_) {

                            /*if (child_.id_[0] == 18 && 
                            child_.id_[1] == 20982 &&
                            child_.id_[2] == 50643){
                                child_ = child_;    
                            }*/

                            if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority
                                this.updateNodeHeightExtents(child_, child_.metanode_);
                                child_.updateTexelSize();
                                
                                //var priority_ = child_.id_[0] * typeFactor_ * child_.distance_; 

                                newProcessBuffer_[newProcessBufferIndex_] = [child_, depth_];
                                newProcessBufferIndex_++;
                            } //if (drawGrid_) {
                            //    child_.drawGrid(cameraPos_);
                            //}
                        }
                    }                    
                }
            }


            if (drawGrid_ && lastProcessBufferIndex_ == newProcessBufferIndex_ && lastDrawBufferIndex_ == drawBufferIndex_) {
                drawBuffer_[drawBufferIndex_] = [tile_, true]; //draw grid
                drawBufferIndex_++;
            }

        }

        /*if (this.map_.drawIndices_) {
            console.log("processed end==============================================");
        }*/
        
        var tmp_ = processBuffer_;
        processBuffer_ = newProcessBuffer_;
        newProcessBuffer_ = tmp_;
        processBufferIndex_ = newProcessBufferIndex_;

        if (best_ != 0) {
            best2_ = best_;
        }
        
    } while(processBufferIndex_ > 0);

    map_.stats_.usedNodes_ = usedNodes_;    
    map_.stats_.processedNodes_ = pocessedNodes_;    
    map_.stats_.processedMetatiles_ = pocessedMetatiles_;    

    if (this.map_.replay_.storeTiles_ || this.map_.replay_.storeFreeTiles_) { //used only in inspectors
        if (!this.map_.tileBuffer_[0]) {
            this.map_.tileBuffer_[0] = [];
        }
        
        var tiles_ = this.map_.tileBuffer_[0];
        for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
            tiles_.push(drawBuffer_[i]);
        }
    }

    for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
        var item_ = drawBuffer_[i];
        tile_ = drawBuffer_[i];
/*
            if (tile_.id_[0] == 10 && 
                tile_.id_[1] == 304 &&
                tile_.id_[2] == 193){
                tile_ = tile_;    
            }
*/            
        //draw tile,  preventRender=false, preventLoad_=false
        
        var tile_ = item_[0];
        if (drawGrid_ && item_[1]) {
            tile_.drawGrid(cameraPos_); 
        } else if (!item_[1]) {
            map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, 0, false, false, checkGpu_);
        }
    }
};


Melown.MapSurfaceTree.prototype.traceHeight = function(tile_, params_, nodeOnly_) {
    if (!tile_) {
        return;
    }

    this.params_ = params_;

    var heightFunction_ = nodeOnly_ ? this.traceHeightTileByNodeOnly : this.traceHeightTileByMap;  

    if (tile_.id_[0] == 1) { //update root, get height in VTS2015 starts in division node which has lod 1
        this.traceHeightTile(tile_.parent_, 0, true);
        if (!tile_.parent_.metanode_) {
            return;
        }
    }
    
    this.traceHeightTile(tile_, 0, false, heightFunction_);
};

Melown.MapSurfaceTree.prototype.traceHeightTile = function(tile_, priority_, nodeReadyOnly_, heightFunction_) {
    if (tile_ == null) {
        return;
    }

    if (!tile_.isMetanodeReady(this, 0) || nodeReadyOnly_) {
        return;
    }

    tile_.metanode_.metatile_.used();

    if (tile_.lastSurface_ && tile_.lastSurface_ == tile_.surface_) {
        tile_.lastSurface_ = null;
        tile_.restoreLastState();
        //return;
    }
    
    //process tile e.g. draw or get height
    var res_ = heightFunction_(tile_, this.params_, priority_); 
    
    if (res_ == true) { //we need to go deeper
        var childIndex_ = this.traceHeightChild(tile_, this.params_);
        this.traceHeightTile(tile_.children_[childIndex_], 0, false, heightFunction_);
    }
};

Melown.MapSurfaceTree.prototype.traceHeightChild = function(tile_, params_, res_) {
    var coords_ = params_.coords_;
    var extents_ = params_.extents_;
    var center_ = [(extents_.ll_[0] + extents_.ur_[0]) *0.5,
                   (extents_.ll_[1] + extents_.ur_[1]) *0.5];

    //ul,ur,ll,lr
    //deside in which quadrant are provided coodinates
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

    //trace only resulting quadrant 
    if (right_) {
        return bottom_ ? 1 : 3;
    } else {
        return bottom_ ? 0 : 2;
    }
};

Melown.MapSurfaceTree.prototype.traceHeightTileByMap = function(tile_, params_, priority_) {
    if (!tile_ || (tile_.id_[0] > params_.desiredLod_ && params_.heightMap_)) {
        return false;
    }

    var node_ = tile_.metanode_;

    if (!node_) {
        return false;
    }

    if (node_.hasNavtile()) {
        if (!tile_.heightMap_) {
            //if (!preventLoad_) {
                //if (!tile_.surface_ || tile_.surface_.virtual_) {
                if (!tile_.surface_ || !tile_.resourceSurface_) { //surface_.virtual_) {
                    return false; //is it best way how to do it?
                }
                
                if (!tile_.resourceSurface_.getNavUrl) { //virtual surface is as resource surface. Is it bug??!!
                    return false; //is it best way how to do it?
                }
                
                var path_ = tile_.resourceSurface_.getNavUrl(tile_.id_);
                tile_.heightMap_ = tile_.resources_.getTexture(path_, true);
            //}
        } else {
            if (tile_.heightMap_.isReady() == true) {
                params_.parent_ = {
                    metanode_ : params_.metanode_,
                    heightMap_ : params_.heightMap_,
                    heightMapExtents_ : params_.heightMapExtents_
                };
                
                params_.metanode_ =  node_;
                params_.heightMap_ = tile_.heightMap_;
                params_.heightMapExtents_ = {
                    ll_ : params_.extents_.ll_.slice(),
                    ur_ : params_.extents_.ur_.slice()
                };
                return (tile_.id_[0] != params_.desiredLod_);
            }
        }
    } else {
        if (!params_.heightMap_) {
            params_.metanode_ =  node_;
        }
        
        return true;
    }

    return false;
};

Melown.MapSurfaceTree.prototype.traceHeightTileByNodeOnly = function(tile_, params_, priority_) {
    if (!tile_ || tile_.id_[0] > params_.desiredLod_) {
        return false;
    }

    var node_ = tile_.metanode_;

    if (!node_) {
        return false;
    }

    params_.parent_ = {
        metanode_ : params_.metanode_
    };

    params_.metanode_ =  node_;
    return (tile_.id_[0] != params_.desiredLod_);
};

