
Melown.Map.prototype.getSurfaceHeight = function(coords_, lod_) {
    var result_ = this.getSpatialDivisionNode(coords_);
    var node_ = result_[0];
    var nodeCoords_ = result_[1];

    if (node_ != null) {

        for (var i = 0, li = this.mapTrees_.length; i < li; i++) {
            var tree_ = this.mapTrees_[i];

            if (tree_.divisionNode_ == node_) {
                var extents_ = {
                    ll_ : node_.extents_.ll_.slice(),
                    ur_ : node_.extents_.ur_.slice()
                };
                var params_ = {
                    coords_ : nodeCoords_,
                    desiredLod_ : lod_,
                    extents_ : extents_,
                    metanode_ : null,
                    heightMap_ : null,
                    heightMapExtents_ : null,
                    traceHeight_ : true
                };

                tree_.heightTracer_.trace(tree_, params_);

                var heightMap_ = params_.heightMap_;
                var metanode_ = params_.metanode_;

                if (params_.heightMap_ != null) {
                    var data_ = heightMap_.imageData_;
                    var dataExtents_ = heightMap_.imageExtents_;
                    var mapExtents_ = params_.heightMapExtents_;

                    //relative tile coords
                    var x = nodeCoords_[0] - mapExtents_.ll_[0];
                    //var y = nodeCoords_[1] - mapExtents_.ll_[1];
                    var y = mapExtents_.ur_[1] - nodeCoords_[1];

                    //data coords
                    x = (dataExtents_[0]-1) * (x / (mapExtents_.ur_[0] - mapExtents_.ll_[0]));
                    y = (dataExtents_[1]-1) * (y / (mapExtents_.ur_[1] - mapExtents_.ll_[1]));

                    var ix_ = Math.floor(x);
                    var iy_ = Math.floor(y);
                    var fx_ = x - ix_;
                    var fy_ = y - iy_;

                    var index_ = iy_ * dataExtents_[0];
                    var index2_ = index_ + dataExtents_[0];
                    var h00_ = data_[(index_ + ix_)*4];
                    var h01_ = data_[(index_ + ix_ + 1)*4];
                    var h10_ = data_[(index2_ + ix_)*4];
                    var h11_ = data_[(index2_ + ix_ + 1)*4];
                    var w0_ = (h00_ + (h01_ - h00_)*fx_);
                    var w1_ = (h10_ + (h11_ - h10_)*fx_);
                    var height_ = (w0_ + (w1_ - w0_)*fy_);

                    height_ = metanode_.minHeight_ + (metanode_.maxHeight_ - metanode_.minHeight_) * (height_/255);

                    return [height_, metanode_.id_[0] >= lod_, true];
                }

                /*
                if (metanode_ != null) {
                    var height_ = metanode_.minHeight_ + (metanode_.maxHeight_ - metanode_.minHeight_) * 0.5;
                    return [height_, metanode_.id_[0] >= lod_, true];
                }*/

                break;
            }
        }
    }

    //coords_

    return [0, false, false];
};

Melown.Map.prototype.getSpatialDivisionNode = function(coords_) {
    var nodes_ = this.referenceFrame_.getSpatialDivisionNodes();

    var bestNode_ = null;
    var bestLod_ = -1;
    var bestCoords_ = [0,0];

    for (var i = 0, li = nodes_.length; i < li; i++) {
        var node_ = nodes_[i];
        var nodeCoords_ = node_.getInnerCoords(coords_);
        var extents_ = node_.extents_;

        if (nodeCoords_[0] >= extents_.ll_[0] && nodeCoords_[0] <= extents_.ur_[0] &&
            nodeCoords_[1] >= extents_.ll_[1] && nodeCoords_[1] <= extents_.ur_[1]) {

            if (node_.id_[0] > bestLod_) {
                bestNode_ = node_;
                bestLod_ = node_.id_[0];
                bestCoords_ = nodeCoords_;
            }
        }
    }

    return [bestNode_, bestCoords_];
};




