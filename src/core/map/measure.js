
Melown.Map.prototype.getSurfaceHeight = function(coords_, lod_, storeStats_, node_, nodeCoords_, coordsArray_) {
    if (!node_) {
        var result_ = this.getSpatialDivisionNode(coords_);
        var node_ = result_[0];
        var nodeCoords_ = result_[1];
    }
    
    if (!this.config_.mapHeightLodBlend_) {
        lod_ = Math.floor(lod_);
    }

    if (this.config_.mapIgnoreNavtiles_) {
        return this.getSurfaceHeightNodeOnly(null, lod_ + 8, storeStats_, lod_, null, node_, nodeCoords_, coordsArray_);        
    }

    var tree_ = this.tree_;

    if (node_ != null && lod_ !== null) {
        var root_ = tree_.findSurfaceTile(node_.id_);

        var extents_ = {
            ll_ : node_.extents_.ll_.slice(),
            ur_ : node_.extents_.ur_.slice()
        };
        var params_ = {
            coords_ : nodeCoords_,
            desiredLod_ : Math.ceil(lod_),
            extents_ : extents_,
            metanode_ : null,
            heightMap_ : null,
            heightMapExtents_ : null,
            traceHeight_ : true
        };

        tree_.traceHeight(root_, params_, false);

        var heightMap_ = params_.heightMap_;
        var metanode_ = params_.metanode_;

        if (params_.heightMap_ != null) {
            if (storeStats_) {
                this.stats_.heightClass_ = 2;
                this.stats_.heightLod_ = lod_;
                this.stats_.heightNode_ = metanode_.id_[0];                        
            }
            
            var res_ = metanode_.id_[0] >= Math.ceil(lod_);
            var arrayRes_;
           
            if (this.config_.mapHeightLodBlend_ && metanode_.id_[0] > 0 &&
                params_.parent_ && params_.parent_.heightMap_ && lod_ <= metanode_.id_[0]) {
                var height1_ = this.getHeightmapValue(nodeCoords_, params_.parent_.metanode_, params_.parent_);  
                var height2_ = this.getHeightmapValue(nodeCoords_, metanode_, params_);  
                var factor_ = lod_ - Math.floor(lod_);
                var height_ = height1_ + (height2_ - height1_) * factor_;
                
                if (coordsArray_) {
                    arrayRes_ = new Array(coordsArray_.length);
                    
                    for (var i = 0, li = coordsArray_.length; i < li; i++) {
                        var nodeCoords2_ = coordsArray_[i];//node_.getInnerCoords(coordsArray_[i]);
                        var height1_ = this.getHeightmapValue(nodeCoords2_, params_.parent_.metanode_, params_.parent_);  
                        var height2_ = this.getHeightmapValue(nodeCoords2_, metanode_, params_);  

                        arrayRes_[i] = [height1_ + (height2_ - height1_) * factor_, res_, true];
                    }
                }
                
                //console.log("lod: " + lod_ + " h1: " + height1_ + " h2: " + height2_ + " h: " + height_);  
            } else {
                var height_ = this.getHeightmapValue(nodeCoords_, metanode_, params_);  

                if (coordsArray_) {
                    arrayRes_ = new Array(coordsArray_.length);
                    
                    for (var i = 0, li = coordsArray_.length; i < li; i++) {
                        var height2_ = this.getHeightmapValue(coordsArray_[i], metanode_, params_);  

                        arrayRes_[i] = [height2_, res_, true];
                    }
                }
            }

            return [height_, res_, true, null, null, arrayRes_];

        } else if (metanode_ != null /*&& metanode_.id_[0] == lod_ && !metanode_.hasNavtile()*/){
            var res_ = this.getSurfaceHeightNodeOnly(coords_, lod_ + 8, storeStats_, lod_, null, node_, nodeCoords_, coordsArray_);

            //console.log("lod2: " + lod_ + " h: " + height_[0]);  
            return [res_[0], res_[1], true, null, null, res_[5]];
        }

        /*
        if (metanode_ != null) {
            var height_ = metanode_.minHeight_ + (metanode_.maxHeight_ - metanode_.minHeight_) * 0.5;
            return [height_, metanode_.id_[0] >= lod_, true];
        }*/
    }

    //coords_
    //console.log("lod3: " + lod_ + " h: 0");  

    return [0, false, false, null, null, null];
};


Melown.Map.prototype.getSurfaceHeightNodeOnly = function(coords_, lod_, storeStats_, statsLod_, deltaSample_, node_, nodeCoords_, coordsArray_) {
    var arrayRes_; 
    
    if (!deltaSample_) {
        if (!node_) {
            var result_ = this.getSpatialDivisionNode(coords_);
            var node_ = result_[0];
            var nodeCoords_ = result_[1];
        }
        
        if (coordsArray_) {
            arrayRes_ = new Array(coordsArray_.length);
            
            for (var i = 0, li = coordsArray_.length; i < li; i++) {
                arrayRes_[i] = this.getSurfaceHeightNodeOnly(null, lod_, storeStats_, statsLod_, deltaSample_, node_, coordsArray_[i]);
            }
        }
        
    } else {
        var node_ = deltaSample_[0];
        var nodeCoords_ = deltaSample_[1];
    }

    if (!this.config_.mapHeightLodBlend_) {
        lod_ = Math.floor(lod_);
    }

    if (!deltaSample_ && this.config_.mapHeightNodeBlend_) {
        var res1_ = this.getSurfaceHeightNodeOnly(null, lod_, storeStats_, statsLod_, [node_, [nodeCoords_[0], nodeCoords_[1], nodeCoords_[2]]]);
        
        if (res1_[2]) {
            var sx_ = res1_[3].ur_[0] - res1_[3].ll_[0];
            var sy_ = res1_[3].ur_[1] - res1_[3].ll_[1];
            
            var fx_ = (nodeCoords_[0] - res1_[3].ll_[0]) / sx_;
            var fy_ = (nodeCoords_[1] - res1_[3].ll_[1]) / sy_;
            
            /*
            var c2_ = node_.getOuterCoords([nodeCoords_[0] + sx_, nodeCoords_[1], nodeCoords_[2]]);
            var c3_ = node_.getOuterCoords([nodeCoords_[0], nodeCoords_[1] + sy_, nodeCoords_[2]]);
            var c4_ = node_.getOuterCoords([nodeCoords_[0] + sx_, nodeCoords_[1] + sy_, nodeCoords_[2]]);
    
            var res2_ = this.getSurfaceHeightNodeOnly(c2_, lod_, storeStats_, statsLod_, true);
            var res3_ = this.getSurfaceHeightNodeOnly(c3_, lod_, storeStats_, statsLod_, true);
            var res4_ = this.getSurfaceHeightNodeOnly(c4_, lod_, storeStats_, statsLod_, true);
            */
            
            var res2_ = this.getSurfaceHeightNodeOnly(null, lod_, storeStats_, statsLod_, [node_, [nodeCoords_[0] + sx_, nodeCoords_[1], nodeCoords_[2]]]);
            var res3_ = this.getSurfaceHeightNodeOnly(null, lod_, storeStats_, statsLod_, [node_, [nodeCoords_[0], nodeCoords_[1] + sy_, nodeCoords_[2]]]);
            var res4_ = this.getSurfaceHeightNodeOnly(null, lod_, storeStats_, statsLod_, [node_, [nodeCoords_[0] + sx_, nodeCoords_[1] + sy_, nodeCoords_[2]]]);

            var w0_ = (res1_[0] + (res2_[0] - res1_[0])*fx_);
            var w1_ = (res3_[0] + (res4_[0] - res3_[0])*fx_);
            var height_ = (w0_ + (w1_ - w0_)*fy_);
            
            //console.log("h: " + height_ + "fx: " + fx_ + "fy: " + fy_ + "s1234: " + res1_[0] + " "  + res2_[0] + " "  + res3_[0] + " "  + res4_[0]);            
            /*
            if (res1_[4] && res2_[4] && res3_[4] && res4_[4]){
                console.log("h: " + height_ + "fx: " + fx_ + "fy: " + fy_ + "s1234: " + JSON.stringify(res1_[4].id_) + " "  + JSON.stringify(res2_[4].id_) + " "  + JSON.stringify(res3_[4].id_) + " "  + JSON.stringify(res4_[4].id_));            
            }*/

            return [height_, res1_[1], res1_[2], res1_[3], null, arrayRes_];                
        } else {
            return [res1_[0], res1_[1], res1_[2], res1_[3], null, arrayRes_];                
        }
        //convert new coords to nav coords
        //blend values
    }

    var tree_ = this.tree_;

    if (node_ != null && lod_ !== null) {
        var root_ = tree_.findSurfaceTile(node_.id_);

        var extents_ = {
            ll_ : node_.extents_.ll_.slice(),
            ur_ : node_.extents_.ur_.slice()
        };
        var params_ = {
            coords_ : nodeCoords_,
            desiredLod_ : Math.ceil(lod_),
            extents_ : extents_,
            metanode_ : null,
            heightMap_ : null,
            heightMapExtents_ : null,
            traceHeight_ : true
        };

        tree_.traceHeight(root_, params_, true);

        var metanode_ = params_.metanode_;

        if (metanode_ != null) { // && metanode_.id_[0] == lod_){
            var center_ = metanode_.bbox_.center();
            center_ = this.convertCoords(center_, "physical", "navigation");

            //console.log("lod2: " + lod_ + " nodelod: " + metanode_.id_[0] + " h: " + center_[2]/1.55);  

            if (storeStats_) {
                this.stats_.heightClass_ = 1;
                this.stats_.heightLod_ = statsLod_;
                this.stats_.heightNode_ = metanode_.id_[0];                        
            }

            if (this.config_.mapHeightLodBlend_ && metanode_.id_[0] > 0 &&
                params_.parent_ && params_.parent_.metanode_) {
                var center2_ = this.convertCoords(params_.parent_.metanode_.bbox_.center(), "physical", "navigation");

                var factor_ = lod_ - Math.floor(lod_);
                var height_ = center_[2] + (center2_[2] - center_[2]) * factor_;
               
                var extetnts_ = params_.extents_;
                return [height_, true, true, params_.extents_, metanode_, arrayRes_];
                //console.log("lod: " + lod_ + " h1: " + center_[2] + " h2: " + center2_[2] + " h: " + height_);  
            } else {
                return [center_[2], true, true, params_.extents_, metanode_, arrayRes_];
            }
        }

        /*
        if (metanode_ != null) {
            var height_ = metanode_.minHeight_ + (metanode_.maxHeight_ - metanode_.minHeight_) * 0.5;
            return [height_, metanode_.id_[0] >= lod_, true];
        }*/
    }

    //coords_
    //console.log("lod3: " + lod_ + " h: 0");  

    if (storeStats_) {
        this.stats_.heightClass_ = 0;
        this.stats_.heightLod_ = statsLod_;
        this.stats_.heightNode_ = 0;                        
    }


    return [0, false, false, null, null, arrayRes_];
};

Melown.Map.prototype.getHeightmapValue = function(coords_, node_, params_) {
    var heightMap_ = params_.heightMap_;
    var data_ = heightMap_.imageData_;
    var dataExtents_ = heightMap_.imageExtents_;
    var mapExtents_ = params_.heightMapExtents_;

    //relative tile coords
    var x = coords_[0] - mapExtents_.ll_[0];
    //var y = nodeCoords_[1] - mapExtents_.ll_[1];
    var y = mapExtents_.ur_[1] - coords_[1];

    var maxX_ = (dataExtents_[0]-1);
    var maxY_ = (dataExtents_[1]-1);
    
    //data coords
    x = (maxX_) * (x / (mapExtents_.ur_[0] - mapExtents_.ll_[0]));
    y = (maxY_) * (y / (mapExtents_.ur_[1] - mapExtents_.ll_[1]));

    if (x < 0) { x = 0; }
    if (y < 0) { y = 0; }
    if (x > maxX_) { x = maxX_; }
    if (y > maxY_) { y = maxY_; }

    var ix_ = Math.floor(x);
    var iy_ = Math.floor(y);
    var fx_ = x - ix_;
    var fy_ = y - iy_;

    var index_ = iy_ * dataExtents_[0];
    var index2_ = (iy_ == maxY_) ? index_ : index_ + dataExtents_[0];
    var ix2_ = (ix_ == maxX_) ? ix_ : ix_ + 1; 
    var h00_ = data_[(index_ + ix_)*4];
    var h01_ = data_[(index_ + ix2_)*4];
    var h10_ = data_[(index2_ + ix_)*4];
    var h11_ = data_[(index2_ + ix2_)*4];
    var w0_ = (h00_ + (h01_ - h00_)*fx_);
    var w1_ = (h10_ + (h11_ - h10_)*fx_);
    var height_ = (w0_ + (w1_ - w0_)*fy_);

    height_ = node_.minHeight_ + (node_.maxHeight_ - node_.minHeight_) * (height_/255);
    
    return height_;
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

Melown.Map.prototype.getSpatialDivisionNodeAndExtents = function(id_) {
    var nodes_ = this.referenceFrame_.getSpatialDivisionNodes();

    var bestNode_ = null;
    var bestLod_ = -1;
    var bestNodeCoords_ = [0,0];
    var bestExtents_ = {ll_:[0,0], ur_:[1,1]};

    for (var i = 0, li = nodes_.length; i < li; i++) {
        var node_ = nodes_[i];
        
        //has division node this tile node 
        //var shift_ = node_.id_[0] - this.lodRange_[0];
        var shift_ = id_[0] - node_.id_[0];

        if (shift_ >= 0) {
            var x = id_[1] >> shift_;
            var y = id_[2] >> shift_;
            
            if (node_.id_[1] == x && node_.id_[2] == y) {
                bestNode_ = node_;
                bestLod_ = node_.id_[0];
                bestExtents_ = node_.extents_;
                bestNodeCoords_ = [node_.id_[1] << shift_, node_.id_[2] << shift_];                
            }
        }
    }
    
    var shift_ = id_[0] - bestNode_.id_[0];
    
    var factor_ = 1.0 / Math.pow(2, shift_);
    var ur_ = bestNode_.extents_.ur_;
    var ll_ = bestNode_.extents_.ll_;
    
    //extents ll ur but tiles are ul lr!!!! 
    
    var dx_ = (ur_[0] - ll_[0]) * factor_; 
    var dy_ = (ll_[1] - ur_[1]) * factor_;
    
    var nx_ = id_[1] - bestNodeCoords_[0];
    var ny_ = id_[2] - bestNodeCoords_[1];

    return [bestNode_, [[ll_[0] + dx_ * nx_, ur_[1] + dy_ * ny_], [ll_[0] + dx_ * (nx_+1), ur_[1] + dy_ * (ny_+1)] ]];
};

Melown.Map.prototype.getSpatialDivisionNodeFromId = function(id_) {
    var nodes_ = this.referenceFrame_.getSpatialDivisionNodes();

    var shift_ = id_[0] - this.maxDivisionNodeDepth_;
    var nx_ = id_[1] >> shift_;
    var ny_ = id_[2] >> shift_;
    
    return this.referenceFrame_.nodesMap_["" + this.maxDivisionNodeDepth_ + "."  + nx_ + "." + ny_];
};

Melown.Map.prototype.getSpatialDivisionNodeAndExtents2 = function(id_, res_, divisionNode_) {
    //if (!divisionNode_) {
      //  debugger
    //}
    
    var shift_ = id_[0] - divisionNode_.id_[0];
    var factor_ = 1.0 / Math.pow(2, shift_);
    var ur_ = divisionNode_.extents_.ur_;
    var ll_ = divisionNode_.extents_.ll_;
    
    //extents ll ur but tiles are ul lr!!!! 
    
    var dx_ = (ur_[0] - ll_[0]) * factor_; 
    var dy_ = (ll_[1] - ur_[1]) * factor_;
    
    var nx_ = id_[1] - (divisionNode_.id_[1] << shift_);
    var ny_ = id_[2] - (divisionNode_.id_[2] << shift_);
    
    res_[0] = divisionNode_;
    res_[1] = ll_[0] + dx_ * nx_;
    res_[2] = ur_[1] + dy_ * ny_;
    res_[3] = ll_[0] + dx_ * (nx_+1);
    res_[4] = ur_[1] + dy_ * (ny_+1);
};


Melown.Map.prototype.getMaxSpatialDivisionNodeDepth = function() {
    var nodes_ = this.referenceFrame_.getSpatialDivisionNodes();
    var maxLod_ = -1;

    for (var i = 0, li = nodes_.length; i < li; i++) {
        var node_ = nodes_[i];
        
        if (node_.id_[0] > maxLod_) {
            maxLod_ = node_.id_[0];
        } 
    }

    return maxLod_;
};

Melown.Map.prototype.getOptimalHeightLodBySampleSize = function(coords_, desiredSamplesSize_) {
    var result_ = this.getSpatialDivisionNode(coords_);
    var node_ = result_[0];
    var nodeCoords_ = result_[1];

    if (node_ != null) {
        var nodeLod_ = node_.id_[0];
        var nodeExtent_ = node_.extents_.ur_[1] - node_.extents_.ll_[1];

        var lod_ = Math.log(nodeExtent_ / desiredSamplesSize_) / Math.log(2);
        //lod_ = Math.round(lod_) - 8 + nodeLod_;
        lod_ = lod_ - 8 + nodeLod_;

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
        //lod_ = Math.round(lod_) - 8 + nodeLod_;
        lod_ = lod_ - 8 + nodeLod_;

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
        var geod = this.getGeodesic(); //new GeographicLib["Geodesic"]["Geodesic"](navigationSrsInfo_["a"],
                                       //                   (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

        var r = geod["Inverse"](coords_[1], coords_[0], coords2_[1], coords2_[0]);

        if (d > (navigationSrsInfo_["a"] * 2 * Math.PI) / 4007.5) { //aprox 10km for earth
            if (includingHeight_) {
                return [Math.sqrt(r["s12"]*r["s12"] + dz_*dz_), r.az1];
            } else {
                return [r["s12"], r["azi1"]];
            }
        } else {
            return [d, r["azi1"]];
        }

    } else {
        return [d, Melown.degrees(Math.atan2(dy_, dx_))];
    }
};

Melown.Map.prototype.getGeodesic = function() {
    var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

    var geodesic_ = new GeographicLib["Geodesic"]["Geodesic"](navigationSrsInfo_["a"],
                                                       (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

    return geodesic_;
};



