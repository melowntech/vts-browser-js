/**
 * @constructor
 */
Melown.MapInterface = function(map_) {
    this.map_ = map_;
};

Melown.MapInterface.prototype.setPosition = function(position_) {
    this.map_.setPosition(position_);
};

Melown.MapInterface.prototype.getPosition = function(type_) {
    return this.map_.getPosition().pos_;
};

Melown.MapInterface.prototype.setView = function(view_) {
    this.map_.setView();
};

Melown.MapInterface.prototype.getView = function() {
    return this.map_.getView();
};

Melown.MapInterface.prototype.getCredits = function() {
    return this.map_.getCredits();
};

Melown.MapInterface.prototype.getViews = function() {
    return this.map_.getViews();
};

Melown.MapInterface.prototype.getViewInfo = function(viewId_) {
    return this.map_.getViewInfo(viewId_);
};

Melown.MapInterface.prototype.getBoundLayers = function() {
    return this.map_.getBoundLayers();
};

Melown.MapInterface.prototype.getBoundLayerInfo = function(layerId_) {
    return this.map_.getBoundLayerInfo(layerId_);
};

Melown.MapInterface.prototype.getFreeLayers = function() {
    return this.map_.getFreeLayers();
};

Melown.MapInterface.prototype.getFreeLayerInfo = function(layerId_) {
    return this.map_.getFreeLayers(layerId_);
};

Melown.MapInterface.prototype.getSurfaces = function() {
    return this.map_.getSurfaces();
};

Melown.MapInterface.prototype.getSurfaceInfo = function(surfaceId_) {
    return this.map_.getSurfacesInfo(srsId_);
};

Melown.MapInterface.prototype.getSrses = function() {
    return this.map_.getSrses(surfaceId_);
};

Melown.MapInterface.prototype.getSrsInfo = function(srsId_) {
    return this.map_.getSrsInfo(surfaceId_);
};

Melown.MapInterface.prototype.getReferenceFrame = function() {
    return this.map_.getReferenceFrame();
};

Melown.MapInterface.prototype.pan = function(position_, dx_, dy_) {
    return this.map_.pan(new Melown.MapPosition(this.map_, position_), dx_, dy_).pos_.slice();
};

Melown.MapInterface.prototype.getCameraInfo = function() {
    var camera_ = this.map_.camera_;
    return {
        "projection-matrix" : camera_.projection_,
        "view-matrix" : camera_.modelview_,
        "view-projection-matrix" : camera_.mvp_,
        "position" : camera_.getPosition(),
        "vector" : [0,0,1]
    };
};

Melown.MapPositionInterface = Melown.MapPosition;


