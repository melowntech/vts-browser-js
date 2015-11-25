/**
 * @constructor
 */
Melown.MapTree = function(map_, rootId_, refFrame_, freeLayer_) {
    this.map_ = map_;
    this.camera_ = map_.camera_;
    this.rootId_ = rootId_;
    this.refFrame_ = refFrame_;
    this.freeLayer_ = freeLayer_;
    this.metaBinaryOrder_ = this.map_.referenceFrames_.params_.metaBinaryOrder_;
    this.initialized_ = false;

    this.surfaceTree_ = new Melown.MapTile(this.map_, null, rootId_);
    this.metastorageTree_ = new Melown.MapMetastorage(this.map_, null, rootId_);

    this.surfaceTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceSurfaceTile.bind(this));

    if (freeLayer_ != true) {
        this.heightTracer_ = new Melown.MapMetanodeTracer(this, null, this.traceSurfaceTileHeight.bind(this));
    }

    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = 1.0;
};

Melown.MapTree.prototype.kill = function() {
    this.surfaceTree_ = null;
    this.metastorageTree_ = null;
    this.surfaceTracer_ = null;
    this.heightTracer_ = null;
};

Melown.MapTree.prototype.init = function() {
    var url_ = this.map_.makeUrl(surface.metaUrl_, {lod_:result_[0], ix_:result_[1], iy_:result_[2] });
    map_.loader_.load(url_, metatile_.load_.bind(metatile_, url_));

    this.metatileTree_.load();
    this.surfaceTree_.metatile_ = 1;

    this.initialized_ = true;
};

Melown.MapTree.prototype.draw = function() {
    this.cameraPos_ = [0,0,0];
    this.worldPos_ = [0,0,0];
    this.ndcToScreenPixel_ = this.map_.ndcToScreenPixel_;

    var refFrame_ = this.refFrame_;
    var periodicity_ = this.refFrame_.srs_.periodicity_;

    if (periodicity_ != null) {
        this.drawSurface([0,0,0]);

        if (periodicity_.type_ == "X") {
            this.drawSurface([periodicity_.period_,0,0]);
            this.drawSurface([-periodicity_.period_,0,0]);
        }

    } else {
        this.drawSurface([0,0,0]);
    }
};

Melown.MapTree.prototype.drawSurface = function(shift_) {
    this.surfaceTracer_.trace(this.rootId_);
};

Melown.MapTree.prototype.traceSurfaceTile = function(tile_, pos_, lod_) {

    var node_ = tile_.metanode_;

    if (node_ == null) {
        return false;
    }

    var cameraPos_ = this.map_.navCameraPosition_;

    if (this.camera_.bboxVisible(node_.bbox_, cameraPos_) != true) {
        return false;
        //return true;
    }

    var screenPixelSize_ = this.ndcToScreenPixel_ * node_.pixelSize_;

    if (this.camera_.ortho_ == true) {
        var height_ = this.camera_.getViewHeight();
        var pixelSize_ = [(screenPixelSize_*2.0) / height_, height_];
    } else {
        var pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, cameraPos_, cameraPos_, true);
    }

//    var pixelSize_ = this.tilePixelSize(node_.bbox_, screenPixelSize_, cameraPos_, cameraPos_, false);

    if (node_.hasChildren() == false || pixelSize_[0] < 1.1) {

        this.map_.drawSurfaceTile(tile_, node_, cameraPos_, pixelSize_);

        return false;
    }



    //node_.drawBBox(cameraPos_);

/*
    if (this.camera_.bboxVisible(node_.bbox_) != true) {
        return false;
    }
*/

    //if (node_.id_[0] <= 11) {
    //    return true;
        //node_.drawBBox(cameraPos_);
    //}


//    if (true && node_.id_[0] == 19 && tile_.surface_ != null) {


    //if (tile_.metanode_.bbox_)

    return true;
};

Melown.MapTree.prototype.traceSurfaceTileHeight = function(tile_, pos_, lod_) {
    if (lod_ >= tile_.lod_) {

        //get height from height map

        if (tile_.heightMap_ == null) {
            //load height map
        }

        //compute height map coords
        //get height form height map

        this.measurements_.height_ = height_;
        return false;

    } else {

        //get needed child

    }

    return true;
};


Melown.MapTree.prototype.tilePixelSize = function(bbox_, screenPixelSize_, cameraPos_, worldPos_, returnDistance_) {
    var min_ = bbox_.min_;
    var max_ = bbox_.max_;
    /*
    var tileSize_ = max_[0]-min_[0]; //get tile size
    var tilePos_ = [min_[0]-worldPos_[0], min_[1]-worldPos_[1], min_[2]-worldPos_[2]]; //get global pos
    var tilePos2_ = [tilePos_[0] + tileSize_, tilePos_[1], tilePos_[2]];
    var tilePos3_ = [tilePos_[0] + tileSize_, tilePos_[1] + tileSize_, tilePos_[2]];
    var tilePos4_ = [tilePos_[0], tilePos_[1] + tileSize_, tilePos_[2]];
    */

    var tilePos_ = [min_[0] - cameraPos_[0], min_[1] - cameraPos_[1]];
    var tilePos2_ = [max_[0] - cameraPos_[0], min_[1] - cameraPos_[1]];
    var tilePos3_ = [max_[0] - cameraPos_[0], max_[1] - cameraPos_[1]];
    var tilePos4_ = [min_[0] - cameraPos_[0], max_[1] - cameraPos_[1]];

    var h1_ = min_[2] - cameraPos_[2];
    var h2_ = max_[2] - cameraPos_[2];

    var factor_ = 0;

    //find bbox sector
    if (0 < tilePos_[1]) { //top row
        if (0 < tilePos_[0]) { // left top corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos_[0], tilePos_[1], 0], returnDistance_);
            }
        } else if (0 > tilePos2_[0]) { // right top corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos2_[0], tilePos2_[1], 0], returnDistance_);
            }
        } else { //top side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, tilePos2_[1], 0], returnDistance_);
            }
        }
    } else if (0 > tilePos4_[1]) { //bottom row
        if (0 < tilePos4_[0]) { // left bottom corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos4_[0], tilePos4_[1], 0], returnDistance_);
            }
        } else if (0 > tilePos3_[0]) { // right bottom corner
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos3_[0], tilePos3_[1], 0], returnDistance_);
            }
        } else { //bottom side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, tilePos3_[1], 0], returnDistance_);
            }
        }
    } else { //middle row
        if (0 < tilePos4_[0]) { // left side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos_[0], 0, 0], returnDistance_);
            }
        } else if (0 > tilePos3_[0]) { // right side
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([tilePos2_[0], 0, 0], returnDistance_);
            }
        } else { //center
            if (0 > h2_) { // hi
                factor_ = this.camera_.scaleFactor([0, 0, h2_], returnDistance_);
            } else if (0 < h1_) { // low
                factor_ = this.camera_.scaleFactor([0, 0, h1_], returnDistance_);
            } else { // middle
                factor_ = this.camera_.scaleFactor([0, 0, 0], returnDistance_);
            }
        }
    }

    //console.log("new: " + (factor_ * screenPixelSize_) + " old:" + this.tilePixelSize2(node_) );

    if (returnDistance_ == true) {
        return [(factor_[0] * screenPixelSize_), factor_[1]];
    }

    return (factor_ * screenPixelSize_);
};
