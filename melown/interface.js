
Melown.MapBrowser = function(element_, config_) {
    return new Melown.BrowserInterface(element_, config_);
};

/**
 * @constructor
 */
Melown.BrowserInterface = function(element_, config_) {
    this.browser_ = new Melown.Browser(element_, config_);
    this.core_ = this.browser_.getCore();
    this.map_ = this.core_.getMap();
};

Melown.BrowserInterface.prototype.setPosition = function(position_) {
    this.map_.setPosition(position_);
};

Melown.BrowserInterface.prototype.getPosition = function() {
    return this.map_.getPosition();
};

Melown.BrowserInterface.prototype.setView = function(view_) {
    this.map_.setView();
};

Melown.BrowserInterface.prototype.getView = function() {
    return this.map_.getView();
};

Melown.BrowserInterface.prototype.getCredits = function() {
    return this.map_.getCredits();
};

Melown.BrowserInterface.prototype.getViews = function() {
    return this.map_.getViews();
};

Melown.BrowserInterface.prototype.getViewInfo = function(viewId_) {
    return this.map_.getViewInfo(viewId_);
};

Melown.BrowserInterface.prototype.getBoundLayers = function() {
    return this.map_.getBoundLayers();
};

Melown.BrowserInterface.prototype.getBoundLayerInfo = function(layerId_) {
    return this.map_.getBoundLayerInfo(layerId_);
};

Melown.BrowserInterface.prototype.getFreeLayers = function() {
    return this.map_.getFreeLayers();
};

Melown.BrowserInterface.prototype.getFreeLayerInfo = function(layerId_) {
    return this.map_.getFreeLayers(layerId_);
};

Melown.BrowserInterface.prototype.getSurfaces = function() {
    return this.map_.getSurfaces();
};

Melown.BrowserInterface.prototype.getSurfaceInfo = function(surfaceId_) {
    return this.map_.getSurfacesInfo(surfaceId_);
};

Melown.BrowserInterface.prototype.getSrses = function() {
    return this.map_.getSrses();
};

Melown.BrowserInterface.prototype.getReferenceFrame = function() {
    return this.map_.getReferenceFrame();
};

Melown.BrowserInterface.prototype.pan = function(position_, dx_, dy_) {
    return this.map_.pan(position_, dx_, dy_);
};

Melown.BrowserInterface.prototype.flyTo = function(position_, options_) {
    this.map_.getSrses();
};

Melown.BrowserInterface.prototype.on = function(eventName_, call_) {
    this.core_.on(eventName_, call_);
};









