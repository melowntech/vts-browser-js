/**
 * @constructor
 */
Melown.MapInterface = function(map_) {
    this.map_ = map_;
    this.config_ = map_.config_;
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

Melown.MapInterface.prototype.convertPositionViewMode = function(position_, mode_) {
    var pos_ = (new Melown.MapPosition(this.map_, position_)).convertViewMode(mode_);
    return (pos_ != null) ? pos_.pos_ : pos_;
};

Melown.MapInterface.prototype.convertPositionHeightMode = function(position_, mode_) {
    var pos_ = (new Melown.MapPosition(this.map_, position_)).convertHeightMode(mode_);
    return (pos_ != null) ? pos_.pos_ : pos_;
};

Melown.MapInterface.prototype.convertCoords = function(sourceSrs_, destinationSrs_, coords_) {
    var srs_ = this.map_.getSrs(sourceSrs_);
    var srs2_ = this.map_.getSrs(destinationSrs_);
    if (!srs_ || !srs2_) {
        return null;
    }

    return srs2_.convertCoordsFrom(coords_, srs_);
};

Melown.MapInterface.prototype.setPositionCoords = function(position_, coords_) {
    return (new Melown.MapPosition(this.map_, position_)).setCoords(coords_).pos_;
};

Melown.MapInterface.prototype.getPositionCoords = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getCoords();
};

Melown.MapInterface.prototype.setPositionHeight = function(position_, height_) {
    return (new Melown.MapPosition(this.map_, position_)).setHeight(height_).pos_;
};

Melown.MapInterface.prototype.getPositionHeight = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getHeight();
};

Melown.MapInterface.prototype.setPositionOrientation = function(position_, orientation_) {
    return (new Melown.MapPosition(this.map_, position_)).setOrientation(orientation_).pos_;
};

Melown.MapInterface.prototype.getPositionOrientation = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getOrientation();
};

Melown.MapInterface.prototype.setPositionViewExtent = function(position_, extent_) {
    return (new Melown.MapPosition(this.map_, position_)).setViewExtent(extent_).pos_;
};

Melown.MapInterface.prototype.getPositionViewExtent = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getViewExtent();
};

Melown.MapInterface.prototype.setPositionFov = function(position_, fov_) {
    return (new Melown.MapPosition(this.map_, position_)).setFov(fov_);
};

Melown.MapInterface.prototype.getPositionFov = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getFov();
};

Melown.MapInterface.prototype.getPositionViewMode = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getViewMode();
};

Melown.MapInterface.prototype.getPositionHeightMode = function(position_) {
    return (new Melown.MapPosition(this.map_, position_)).getHeightMode();
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

Melown.MapInterface.prototype.setConfigParam = function(key_, value_) {
    switch (key_) {
        case "mapCache":                      this.config_.mapCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 900); break;
        case "mapGPUCache":                   this.config_.mapGPUCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 360); break;
        case "mapMetatileCache":              this.config_.mapMetatileCache_ = Melown.validateNumber(value_, 10, Number.MAX_INTEGER, 60); break;
        case "mapTexelSizeFit":               this.config_.mapTexelSizeFit_ = Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 1.1); break;
        case "mapTexelSizeTolerance":         this.config_.mapTexelSizeTolerance_= Melown.validateNumber(value_, 0.0001, Number.MAX_INTEGER, 1.1); break;
        case "mapDownloadThreads":            this.config_.mapDownloadThreads_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 6); break;
        case "mapMaxProcessedMeshes":         this.config_.mapMaxProcessedMeshes_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 1); break;
        case "mapMaxProcessedTextures":       this.config_.mapMaxProcessedTextures_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 1); break;
        case "mapMaxProcessedMetatiles":      this.config_.mapMaxProcessedMetatiles_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 2); break;
        case "mapMobileMode":                 this.config_.mapMobileMode_ = Melown.validateBool(value_, false); break;
        case "mapMobileTexelDegradation":     this.config_.mapMobileTexelDegradation_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 2); break;
        case "mapNavSamplesPerViewExtent":    this.config_.mapNavSamplesPerViewExtent_ = Melown.validateNumber(value_, 1, Number.MAX_INTEGER, 10); break;
    }
};

Melown.MapInterface.prototype.getConfigParam = function(key_) {
    switch (key_) {
        case "mapCache":                      return this.config_.mapCache_;
        case "mapGPUCache":                   return this.config_.mapGPUCache_;
        case "mapMetatileCache":              return this.config_.mapMetatileCache_;
        case "mapTexelSizeFit":               return this.config_.mapTexelSizeFit_;
        case "mapTexelSizeTolerance":         return this.config_.mapTexelSizeTolerance_;
        case "mapDownloadThreads":            return this.config_.mapDownloadThreads_;
        case "mapMaxProcessedMeshes":         return this.config_.mapMaxProcessedMeshes_;
        case "mapMaxProcessedTextures":       return this.config_.mapMaxProcessedTextures_;
        case "mapMaxProcessedMetatiles":      return this.config_.mapMaxProcessedMetatiles_;
        case "mapMobileMode":                 return this.config_.mapMobileMode_;
        case "mapMobileTexelDegradation":     return this.config_.mapMobileTexelDegradation_;
        case "mapNavSamplesPerViewExtent":    return this.config_.mapNavSamplesPerViewExtent_;
    }
};


Melown.MapPositionInterface = Melown.MapPosition;


