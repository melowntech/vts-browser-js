/**
 * @constructor
 */
Melown.MapDivisionNode = function(map_, id_, srs_, extents_, heightRange_, partitioning_) {
    this.map_ = map_;
    this.id_ = id_;
    this.srs_ = this.map_.getMapsSrs(srs_);
    this.extents_ = extents_;
    this.heightRange_ =  heightRange_;
    this.partitioning_ = partitioning_;
    this.isPole_ = (id_[0] == 1 && ((id_[1] == 0 && id_[2] == 1)||(id_[1] == 1 && id_[2] == 0)));
};

Melown.MapDivisionNode.prototype.getInnerCoords = function (coords_) {
    return this.srs_.convertCoordsFrom(coords_, this.map_.getNavigationSrs());
};

Melown.MapDivisionNode.prototype.getOuterCoords = function (coords_) {
    return this.srs_.convertCoordsTo(coords_, this.map_.getNavigationSrs());
};

Melown.MapDivisionNode.prototype.getPhysicalCoords = function (coords_, skipVerticalAdjust_) {
    return this.srs_.convertCoordsTo(coords_, this.map_.getPhysicalSrs(), skipVerticalAdjust_);
};

Melown.MapDivisionNode.prototype.getPhysicalCoordsFast = function (coords_, skipVerticalAdjust_, coords2_, index_, index2_) {
    return this.srs_.convertCoordsToFast(coords_, this.map_.getPhysicalSrs(), skipVerticalAdjust_, coords2_, index_, index2_);
};

Melown.MapDivisionNode.prototype.getExtents = function (coords_) {
    return this.srs_.convertCoordsFrom(coords_, this.map_.getNavigationSrs());
};


