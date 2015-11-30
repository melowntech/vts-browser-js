
Melown.Map.prototype.getSurfaceHeight = function(pos_) {
    this.surfaceHeightTracer_.trace(this.surfaceTree_, pos_, lod_);
    return this.measurements_.height_;
};

Melown.Map.prototype.getSpatialDivisionNode = function(pos_, lod_) {

    var coords_ = pos_

    this.refFrames_.getSpatialDivisionNodes();

};




