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

    for (var lod_ = 1; lod_ <= id_[0]; lod_++) {
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

    for (var lod_ = 1; lod_ <= id_[0]; lod_++) {
        var mask_ = 1 << (id_[0] - lod_);
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

    if (this.map_.config_.mapBasicTileSequence_) {
        //this.surfaceTracer_ = this.surfaceTracerBasic_;
    }

    if (periodicity_ != null) {
        this.drawSurface([0,0,0]);

        if (periodicity_.type_ == "X") {
            this.drawSurface([periodicity_.period_,0,0]);
            this.drawSurface([-periodicity_.period_,0,0]);
        }

    } else {

        if (this.freeLayerSurface_ && this.freeLayerSurface_.geodata_) {
            this.drawGeodataSurface([0,0,0]);
        } else {
            this.drawSurface([0,0,0]);
        }

        //this.renderSurface([0,0,0]);
    }
};

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
    
    do {
        newProcessBufferIndex_ = 0;
        
        for (var i = processBufferIndex_ - 1; i >= 0; i--) {
            tile_ = processBuffer_[i];
            node_ = tile_.metanode_;

            if (tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {
                
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

                                child_.updateTexelSize();
                                var priority_ = child_.id_[0] * typeFactor_ * child_.distance_; 
                                
                                //are draw buffers ready? preventRender=true, preventLoad_=false
                                if (map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, false)) {
                                    readyCount_++;
                                    //child_.updateTexelSize();
                                    childrenBuffer_.push(child_);
                                }
                            }
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
                            newProcessBuffer_[newProcessBufferIndex_] = childrenBuffer_[j];
                            newProcessBufferIndex_++;
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
        
    } while(processBufferIndex_ > 0);
    

    for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
        tile_ = drawBuffer_[i];
        //draw tile,  preventRender=false, preventLoad_=false
        map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, 0, false, false);
    }
};



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
    
    processBuffer_[0] = tile_;
    processBufferIndex_ = 1;

    var texelSizeFit_ = map_.texelSizeFit_;
    
    do {
        newProcessBufferIndex_ = 0;
        
        for (var i = processBufferIndex_ - 1; i >= 0; i--) {
            tile_ = processBuffer_[i];
            node_ = tile_.metanode_;

            if (tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {
                
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
                            newProcessBuffer_[newProcessBufferIndex_] = childrenBuffer_[j];
                            newProcessBufferIndex_++;
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
        
    } while(processBufferIndex_ > 0);


    for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
        tile_ = drawBuffer_[i];
        //draw tile,  preventRender=false, preventLoad_=false
        map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, 0, false, false);
    }
};



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
    
    var typeFactor_ = this.freeLayerSurface_ ? 1 : 1;
    
    var drawBuffer_ = map_.drawBuffer_;
    var processBuffer_ = map_.processBuffer_;
    var newProcessBuffer_ = map_.processBuffer2_;
    var drawBufferIndex_ = 0;
    var processBufferIndex_ = 0;
    var newProcessBufferIndex_ = 0;
    
    processBuffer_[0] = [tile_, 0];
    processBufferIndex_ = 1;

    var texelSizeFit_ = map_.texelSizeFit_;

    
    do {
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
            
            if (depth_ >= 2) {
                continue;
            }
            /*
            if (tile_.id_[0] >= 16) { 
                tile_ = tile_;    
            } 

            if (tile_.id_[0] == 18 && 
                tile_.id_[1] == 20982 &&
                tile_.id_[2] == 50643){
                tile_ = tile_;    
            }*/
            
            node_ = tile_.metanode_;

            if (tile_.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_)) {

                if (node_.hasChildren() == false || tile_.texelSize_ <= texelSizeFit_) {

                    var priority_ = tile_.id_[0] * typeFactor_ * tile_.distance_; 
            
                    if (node_.hasChildren() && !map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, priority_, true, (depth_ > 0))) {

                        depth_++; //we dont have tile ready, so we try to draw more detailed tiles
            
                        for (var j = 0; j < 4; j++) {
                            var child_ = tile_.children_[j];
                            if (child_) {
           
                                if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority
                                    
                                    child_.updateTexelSize();
                                    var priority_ = child_.id_[0] * typeFactor_ * child_.distance_; 

                                    /*if (child_.id_[0] == 18 && 
                                    child_.id_[1] == 20982 &&
                                    child_.id_[2] == 50643){
                                        child_ = child_;    
                                    }*/
                                    
                                    //are draw buffers ready? preventRender=true, preventLoad_=false
                                    if (map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, (depth_ > 0))) {
                                        drawBuffer_[drawBufferIndex_] = tile_;
                                        drawBufferIndex_++;
                                    } else {
                                        //child_.updateTexelSize();
                                        newProcessBuffer_[newProcessBufferIndex_] = [child_, depth_];
                                        newProcessBufferIndex_++;
                                    }
                                }
                            }
                        }

                    } else {
                        drawBuffer_[drawBufferIndex_] = tile_;
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

                                child_.updateTexelSize();
                                var priority_ = child_.id_[0] * typeFactor_ * child_.distance_; 

                                /*if (child_.id_[0] == 18 && 
                                child_.id_[1] == 20982 &&
                                child_.id_[2] == 50643){
                                    child_ = child_;    
                                }*/
                                
                                //are draw buffers ready? preventRender=true, preventLoad_=false
                                if (map_.drawSurfaceTile(child_, child_.metanode_, cameraPos_, child_.texelSize_, priority_, true, (depth_ > 0))) {
                                    readyCount_++;
                                    childrenBuffer_.push(child_);
                                }
                            }
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
                            
                            /*
                            var child_ = childrenBuffer_[j];
                            if (child_.id_[0] == 18 && 
                            child_.id_[1] == 20982 &&
                            child_.id_[2] == 50643){
                                child_ = child_;    
                            }*/

                        }
                    } else {
                        
                        //can i use coarser lod
                        //if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority

                        var priority_ = tile_.id_[0] * typeFactor_ * tile_.distance_; 

                        if (map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, priority_, true, true)) {
                            drawBuffer_[drawBufferIndex_] = tile_;
                            drawBufferIndex_++;
                        } else {

                            //add childern to new process buffer 
                            for (var j = 0, lj = childrenBuffer_.length; j < lj; j++) {
                                newProcessBuffer_[newProcessBufferIndex_] = [childrenBuffer_[j], depth_];
                                newProcessBufferIndex_++;
                                
                                /*
                                var child_ = childrenBuffer_[j];
                                if (child_.id_[0] == 18 && 
                                child_.id_[1] == 20982 &&
                                child_.id_[2] == 50643){
                                    child_ = child_;    
                                }*/
    
                            }

                        } 
                    }

                } else  {  //go deeper
                    
                    
                    for (var j = 0; j < 4; j++) {
                        var child_ = tile_.children_[j];
                        if (child_) {

                            /*if (child_.id_[0] == 18 && 
                            child_.id_[1] == 20982 &&
                            child_.id_[2] == 50643){
                                child_ = child_;    
                            }*/

                            if (child_.isMetanodeReady(this, child_.id_[0])) { //lod is used as priority
                                child_.updateTexelSize();
                                var priority_ = child_.id_[0] * typeFactor_ * child_.distance_; 

                                newProcessBuffer_[newProcessBufferIndex_] = [child_, depth_];
                                newProcessBufferIndex_++;
                            }
                        }
                    }                    
                }
            }
        }

        /*if (this.map_.drawIndices_) {
            console.log("processed end==============================================");
        }*/
        
        var tmp_ = processBuffer_;
        processBuffer_ = newProcessBuffer_;
        newProcessBuffer_ = tmp_;
        processBufferIndex_ = newProcessBufferIndex_;
        
    } while(processBufferIndex_ > 0);

    for (var i = drawBufferIndex_ - 1; i >= 0; i--) {
        tile_ = drawBuffer_[i];
        //draw tile,  preventRender=false, preventLoad_=false
        map_.drawSurfaceTile(tile_, tile_.metanode_, cameraPos_, tile_.texelSize_, 0, false, false);
    }
};






/*
Melown.MapSurfaceTree.prototype.traceChildSequenceBasic = function(tile_) {
    return [[0,0],[1,0],[2,0],[3,0]];
};

Melown.MapSurfaceTree.prototype.traceChildSequenceViewBased = function(tile_) {
    var angles_ = [];
    //var camPos_ = this.map_.cameraCenter_;//this.map_.cameraPosition_;  
    var camPos_ = this.map_.cameraPosition_;  
    var camVec_ = this.map_.cameraVector_;
    
    if (tile_.id_[0] == 18) {
        tile_ = tile_;
    }
    
    for (var i = 0; i < 4; i++) {
        var child_ = tile_.children_[i];
        
        if (child_) {
            var angle_ = Number.POSITIVE_INFINITY;// 0.0;
            
            if (child_.metanode_) {
                var pos_ = child_.metanode_.bbox_.center();
                var vec_ = [pos_[0] - camPos_[0], pos_[1] - camPos_[1], pos_[2] - camPos_[2]];
                var d = Melown.vec3.length(vec_);
                var res_ = this.tilePixelSize(child_.metanode_.bbox_, 1, camPos_, camPos_, true);
                //vec_ = Melown.vec3.normalize(vec_);
                //angle_ = (2-(Melown.vec3.dot(camVec_, vec_) + 1)) * d;
                //angle_ = (2-(Melown.vec3.dot(camVec_, vec_) + 1));
                angle_ = d;
                angle_ = res_[1];
            }
                        
            angles_.push([i, angle_]);    
        }
    }

    do {
        var sorted_ = true;
        
        for (var i = 0, li = angles_.length - 1; i < li; i++) {
            if (angles_[i][1] > angles_[i+1][1]) {
                var t = angles_[i];
                angles_[i] = angles_[i+1];
                angles_[i+1] = t;
                sorted_ = false;
            } 
        }
        
    } while(!sorted_);

    //console.log(JSON.stringify(tile_.id_) + "   " + JSON.stringify(angles_));

    return angles_;
};


Melown.MapSurfaceTree.prototype.traceTileRender = function(tile_, params_, childrenSequence_, priority_, preventRedener_, preventLoad_) {
    if (tile_ == null || tile_.metanode_ == null) {
        return [false, preventRedener_, preventLoad_];
    }

    
    //if (tile_.id_[0] == Melown.debugId_[0] &&
      //  tile_.id_[1] == Melown.debugId_[1] &&
      //  tile_.id_[2] == Melown.debugId_[2]) {
      //      tile_ = tile_;
    //}

    var node_ = tile_.metanode_;
    var cameraPos_ = this.map_.cameraPosition_;

    var log2_ = false; //this.map_.drawBBoxes_;        

    if (log2_) {
        console.log("--------------------------------------------");
        console.log("draw-tile: id: " + JSON.stringify(node_.id_));
        console.log("surafce: id: " + tile_.surface_.id_);
        
        var vs = tile_.virtualSurfaces_;
        var s = "";
        for (var i = 0, li = vs.length; i < li; i++) {
            s += vs[i][0].id_ + "|";
        }
        
        console.log("bbox: " + JSON.stringify(node_.bbox_));
        console.log("tcount: " + node_.internalTextureCount_);
        console.log("glue: " + tile_.surface_.glue_);
        console.log("geometry: " + node_.hasGeometry());
        console.log("children: " + node_.hasChildren());
        console.log("tsize: " + node_.pixelSize_);
        console.log("virtual: " + tile_.virtual_ + " " + s);
    }
    
    //Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    var log_ = false;        

    if (log_) {
        console.log("--------------------------------------------");
        console.log("draw-tile: id: " + JSON.stringify(node_.id_));
        console.log("surafce: id: " + tile_.surface_.id_);
        console.log("bbox: " + JSON.stringify(node_.bbox_));
        console.log("flags: " + JSON.stringify(node_.flags_));
        console.log("tcount: " + node_.internalTextureCount_);
        console.log("tsize: " + node_.pixelSize_);
    }

    //if (node_.id_[0] == 13) {
      //  this.map_.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
    //}

    if (this.bboxVisible(tile_.id_, node_.bbox_, cameraPos_, node_) != true) {
        return [false, preventRedener_, preventLoad_];
        //return true;
    }

    if (log2_) { console.log("visible"); }

    if (log_) { console.log("draw-tile: visible"); }

    var pixelSize_;
    var texelSizeFit_ = this.map_.texelSizeFit_;

    if (node_.hasGeometry()) {
        var screenPixelSize_ = Number.POSITIVE_INFINITY;

        if (node_.usedTexelSize()) {
            screenPixelSize_ = this.ndcToScreenPixel_ * node_.pixelSize_;
        } else if (node_.usedDisplaySize()) {
            screenPixelSize_ = this.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / node_.displaySize_);
        }

        if (this.camera_.ortho_ == true) {
            var height_ = this.camera_.getViewHeight();
            pixelSize_ = [(screenPixelSize_*2.0) / height_, height_];
        } else {
            
            if (node_.usedDisplaySize()) { 
                screenPixelSize_ = this.ndcToScreenPixel_ * (node_.bbox_.maxSize_ / 256);
                var factor_ = (node_.displaySize_ / 256) * this.map_.cameraDistance_;
                
                var v = this.map_.cameraVector_;
                var p = [cameraPos_[0] - v[0] * factor_, cameraPos_[1] - v[1] * factor_, cameraPos_[2] - v[2] * factor_];
                
                pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, p, p, true);

            } else {
                
                if (texelSizeFit_ > 1.1) {
                    screenPixelSize_ = this.ndcToScreenPixel_ * node_.pixelSize_ * (texelSizeFit_ / 1.1);
                    var factor_ = (texelSizeFit_ / 1.1) * this.map_.cameraDistance_;
                    
                    var v = this.map_.cameraVector_;
                    var p = [cameraPos_[0] - v[0] * factor_, cameraPos_[1] - v[1] * factor_, cameraPos_[2] - v[2] * factor_];
                    
                    pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, p, p, true);
                    
                } else {
                    pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, cameraPos_, cameraPos_, true);
                }
                
            }
        }
    } else {
        pixelSize_ = [Number.POSITIVE_INFINITY, 99999];
    }

    if (log_) {
        console.log("draw-tile: children=="  + node_.hasChildren());
        console.log("draw-tile: psize=="  + pixelSize_[0]);
    }

    var channel_ = this.map_.drawChannel_;

    if (node_.hasChildren() == false || pixelSize_[0] < texelSizeFit_) {

        if (log2_) { console.log("drawn"); }
        if (log_) { console.log("draw-tile: drawn"); }

          
        if (this.config_.mapAllowHires_ && node_.hasChildren() &&
            this.canDrawDetailedLod(tile_, priority_, preventLoad_)) {
            
            //if (tile_.drawCommands_[channel_].length <= 0) {
                this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_, priority_, true, preventLoad_);
            //}
            return [true, preventRedener_, true];
        } else {
            //this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_);
            
            if (!preventRedener_) {
                var d = Math.max(0,Math.min(499, Math.round(Math.log(pixelSize_[1]) / Math.log(1.04))));
                var buffer_ = this.map_.tileBuffer_;
                
                if (!buffer_[d]) { 
                    buffer_[d] = [];
                }
                
                buffer_[d].push({
                    tile_ : tile_,
                    node_ : node_,
                    pixelSize_ : pixelSize_,
                    priority_ : priority_
                });
            }
            
            ///this.drawSurfaceTile(tile_.tile_, tile_.node_, cameraPos_, tile_.pixelSize_, tile_.priority_, false, false);
        }

        return [false, preventRedener_, preventLoad_];
        
    } else if (this.config_.mapAllowLowres_ && node_.hasGeometry() && pixelSize_[0] < (texelSizeFit_ * 2)) {
        //return [true, preventRedener_];
        
        //if children are not ready then draw coarser lod
        if (this.canDrawCoarserLod(tile_, node_, cameraPos_, childrenSequence_, priority_)) {
            //draw coarsed load and continue tracing children but do not draw them
            this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_, priority_, preventRedener_, preventLoad_);            
            return [true, true, preventLoad_];
        }
    }

    //continue to more detailed lods
    return [true, preventRedener_, preventLoad_];
};

Melown.MapSurfaceTree.prototype.canDrawDetailedLod = function(tile_, priority_, preventLoad_) {
    if (tile_.lastRenderState_) {
        //debugger;
    }
	var channel_ = this.map_.drawChannel_;
	
    return !(tile_.drawCommands_[channel_].length > 0  && this.map_.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, preventLoad_)) && !tile_.lastRenderState_;
};

Melown.MapSurfaceTree.prototype.canDrawCoarserLod = function(tile_, node_, cameraPos_, childrenSequence_, priority_) {
	var channel_ = this.map_.drawChannel_;

    if (!node_.hasGeometry() || !(tile_.drawCommands_[channel_].length > 0  && this.map_.areDrawCommandsReady(tile_.drawCommands_[channel_], priority_, true))) {
        return false;
    }  

    var ret_ = false;

    //for (var i = 0; i < 4; i++) {
        //if (tile_.children_[i]) {
            //var childTile_ = tile_.children_[i];

    for (var i = 0, li = childrenSequence_.length; i < li; i++) {
        var childTile_ = tile_.children_[childrenSequence_[i][0]];
        if (childTile_) {
            if (!childTile_.metanode_) {
                ret_ = true;
                continue;
            }

            if (childTile_.metanode_.hasGeometry() ) {

                if (!(childTile_.drawCommands_[channel_].length > 0 && this.map_.areDrawCommandsReady(childTile_.drawCommands_[channel_], priority_))) {
                    //load data for child tile
                    //if (childTile_.drawCommands_[channel_].length >= 0) {
                        this.map_.drawSurfaceTile(childTile_, childTile_.metanode_, cameraPos_, 1, priority_, true, false);            
                    //}
                    ret_ = true;
                    continue;
                }
            }
        }
    }

    return ret_;
};

*/

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
                if (!tile_.surface_) {
                    return false; //is it best way how to do it?
                }
                
                var path_ = tile_.surface_.getNavUrl(tile_.id_);
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

