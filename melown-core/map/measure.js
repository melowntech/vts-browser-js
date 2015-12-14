
Melown.Map.prototype.getSurfaceHeight = function(coords_, lod_) {
    var result_ = this.getSpatialDivisionNode(coords_);
    var node_ = result_[0];
    var nodeCoords_ = result_[1];

    if (node_ != null && lod_ !== null) {

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
                } else if (metanode_ != null && metanode_.id_[0] == lod_ && !metanode_.hasNavtile()){
                    var center_ = metanode_.bbox_.center();
                    center_ = this.convertCoords(center_, "physical", "navigation");
                    return [center_[2], true, true];
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

Melown.Map.prototype.getOptimalHeightLodBySampleSize = function(coords_, desiredSamplesSize_) {
    var result_ = this.getSpatialDivisionNode(coords_);
    var node_ = result_[0];
    var nodeCoords_ = result_[1];

    if (node_ != null) {
        var nodeLod_ = node_.id_[0];
        var nodeExtent_ = node_.extents_.ur_[1] - node_.extents_.ll_[1];

        var lod_ = Math.log(nodeExtent_ / desiredSamplesSize_) / Math.log(2);
        lod_ = Math.round(lod_) - 8 + nodeLod_;

        return Math.max(0, lod_);
    }

    return null;
};

Melown.Map.prototype.getOptimalHeightLod = function(coords_, viewExtent_, desiredSamplesPerViewExtent_) {
    var result_ = this.getSpatialDivisionNode(coords_);
    var node_ = result_[0];
    var nodeCoords_ = result_[1];

    if (node_ != null) {
        var nodeLod_ = node_.id_[0];
        var nodeExtent_ = node_.extents_.ur_[1] - node_.extents_.ll_[1];

        var lod_ = Math.log((desiredSamplesPerViewExtent_ * nodeExtent_) / viewExtent_) / Math.log(2);
        lod_ = Math.round(lod_) - 8 + nodeLod_;

        return Math.max(0, lod_);
    }

    return null;
};

Melown.Map.prototype.getDistance = function(coords_, coords2_, includingHeight_) {
    var p1_ = this.getPhysicalSrs().convertCoordsFrom(coords_, this.getNavigationSrs());
    var p2_ = this.getPhysicalSrs().convertCoordsFrom(coords2_, this.getNavigationSrs());
    var d = 0;

    var dx_ = p2_[0] - p1_[0];
    var dy_ = p2_[1] - p1_[1];
    var dz_ = p2_[2] - p1_[2];

    if (includingHeight_) {
        d = Math.sqrt(dx_*dx_ + dy_*dy_ + dz_*dz_);
    } else {
        d = Math.sqrt(dx_*dx_ + dy_*dy_);
    }

    var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

    if (!this.getNavigationSrs().isProjected()) {
        var geod = new GeographicLib.Geodesic.Geodesic(navigationSrsInfo_["a"],
                                                       (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

        var r = geod.Inverse(coords_[1], coords_[0], coords2_[0], coords2_[0]);

        if (d > (navigationSrsInfo_["a"] * 2 * Math.PI) / 4007.5) { //aprox 10km for earth
            if (includingHeight_) {
                return [Math.sqrt(r.s12*r.s12 + dz_*dz_), r.az1];
            } else {
                return [r.s12, r.az1];
            }
        } else {
            return [d, r.az1];
        }

    } else {
        return [d, Melown.degrees(Math.atan2(dx_, dy_))];
    }
};




