
var MapDivisionNode = function(map, id, srs, extents, heightRange, partitioning) {
    this.map = map;
    this.id = id;
    this.srs = this.map.getMapsSrs(srs);
    this.extents = extents;
    this.heightRange =  heightRange;
    this.partitioning = partitioning;
    this.isPole = (id[0] == 1 && ((id[1] == 0 && id[2] == 1)||(id[1] == 1 && id[2] == 0)));
};


MapDivisionNode.prototype.getInnerCoords = function (coords) {
    return this.srs.convertCoordsFrom(coords, this.map.getNavigationSrs());
};


MapDivisionNode.prototype.getOuterCoords = function (coords) {
    return this.srs.convertCoordsTo(coords, this.map.getNavigationSrs());
};


MapDivisionNode.prototype.getPhysicalCoords = function (coords, skipVerticalAdjust) {
    return this.srs.convertCoordsTo(coords, this.map.getPhysicalSrs(), skipVerticalAdjust);
};


MapDivisionNode.prototype.getPhysicalCoordsFast = function (coords, skipVerticalAdjust, coords2, index, index2) {
    return this.srs.convertCoordsToFast(coords, this.map.getPhysicalSrs(), skipVerticalAdjust, coords2, index, index2);
};


MapDivisionNode.prototype.getExtents = function (coords) {
    return this.srs.convertCoordsFrom(coords, this.map.getNavigationSrs());
};


export default MapDivisionNode;
