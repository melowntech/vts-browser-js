
Melown.Map.prototype.getSurfaceHeight = function(pos_) {
    this.surfaceHeightTracer_.trace(this.surfaceTree_, pos_, lod_);
    return this.measurements_.height_;
};
