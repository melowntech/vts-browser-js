
Melown.MapBrowser = function(element_, config_) {
    var interface_ = new Melown.BrowserInterface(element_, config_);
    return interface_.core_ ? interface_ : null;
};

/**
 * @constructor
 */
Melown.BrowserInterface = function(element_, config_) {
    this.browser_ = new Melown.Browser(element_, config_);
    this.core_ = this.browser_.getCore();
    this.map_ = this.core_.getMap();
    this.ui_ = this.browser_.ui_;
    this.autopilot_ = this.browser_.autopilot_;
};

Melown.BrowserInterface.prototype.getCore = function(position_) {
    return this.core_;
};

Melown.BrowserInterface.prototype.setControlMode = function(mode_) {
    this.browser_.controlMode_ = mode_;
};

Melown.BrowserInterface.prototype.getControlMode = function() {
    return this.browser_.controlMode_;
};

Melown.BrowserInterface.prototype.setPosition = function(position_) {
    this.map_.setPosition(position_);
};

Melown.BrowserInterface.prototype.getPosition = function() {
    return this.map_.getPosition();
};

Melown.BrowserInterface.prototype.getPositionCredits = function() {
    return this.map_.getCurrentCredits();
};

Melown.BrowserInterface.prototype.setView = function(view_) {
    this.map_.setMapView();
};

Melown.BrowserInterface.prototype.getView = function() {
    return this.map_.getMapView();
};

Melown.BrowserInterface.prototype.getCredits = function() {
    return this.map_.getCredits();
};

Melown.BrowserInterface.prototype.getCreditsInfo = function(creditId_) {
    var credit_ = this.map_.getCredit(creditId_);
    return (credit_ != null) ? credit_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getViews = function() {
    return this.map_.getMapViews();
};

Melown.BrowserInterface.prototype.getViewInfo = function(viewId_) {
    var view_ = this.map_.getMapView(viewId_);
    return (view_ != null) ? view_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getBoundLayers = function() {
    return this.map_.getBoundLayers();
};

Melown.BrowserInterface.prototype.getBoundLayerInfo = function(layerId_) {
    var layer_ = this.map_.getBoundLayer(layerId_);
    return (layer_ != null) ? layer_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getFreeLayers = function() {
    return this.map_.getFreeLayers();
};

Melown.BrowserInterface.prototype.getFreeLayerInfo = function(layerId_) {
    var layer_ = this.map_.getFreeLayer(layerId_);
    return (layer_ != null) ? layer_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getSurfaces = function() {
    return this.map_.getSurfaces();
};

Melown.BrowserInterface.prototype.getSurfaceInfo = function(surfaceId_) {
    var surface_ = this.map_.getFreeLayer(surfaceId_);
    return (surface_ != null) ? surface_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getSrses = function() {
    return this.map_.getSrses();
};

Melown.BrowserInterface.prototype.getSrsInfo = function(srsId_) {
    var srs_ = this.map_.getSrs(srsId_);
    return (srs_ != null) ? srs_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getReferenceFrame = function() {
    return this.referenceFrame_.getInfo();
};

Melown.BrowserInterface.prototype.convertPositionViewMode = function(position_, mode_) {
    return this.map_.convertPositionViewMode(position_, mode_);
};

Melown.BrowserInterface.prototype.convertPositionHeightMode = function(position_, mode_) {
    return this.map_.convertPositionHeightMode(position_, mode_);
};

Melown.BrowserInterface.prototype.convertCoords = function(sourceSrs_, destinationSrs_, coords_) {
    return this.map_.convertCoords(sourceSrs_, destinationSrs_, coords_);
};

Melown.BrowserInterface.prototype.setPositionCoords = function(position_, coords_) {
    return this.map_.setPositionCoords(position_, coords_);
};

Melown.BrowserInterface.prototype.getPositionCoords = function(position_) {
    return this.map_.getPositionCoords(position_);
};

Melown.BrowserInterface.prototype.setPositionHeight = function(position_, height_) {
    return this.map_.setPositionHeight(position_, height_);
};

Melown.BrowserInterface.prototype.getPositionHeight = function(position_) {
    return this.map_.getPositionHeight(position_);
};

Melown.BrowserInterface.prototype.setPositionOrientation = function(position_, orientation_) {
    return this.map_.setPositionOrientation(position_);
};

Melown.BrowserInterface.prototype.getPositionOrientation = function(position_) {
    return this.map_.getPositionOrientation(position_);
};

Melown.BrowserInterface.prototype.setPositionViewExtent = function(position_, extent_) {
    return this.map_.setPositionViewExtent(position_, extent_);
};

Melown.BrowserInterface.prototype.getPositionViewExtent = function(position_) {
    return this.map_.getPositionViewExtent(position_);
};

Melown.BrowserInterface.prototype.setPositionFov = function(position_, fov_) {
    return this.map_.setPositionFov(position_, fov_);
};

Melown.BrowserInterface.prototype.getPositionFov = function(position_) {
    return this.map_.getPositionFov(position_);
};

Melown.BrowserInterface.prototype.getPositionViewMode = function(position_) {
    return this.map_.getPositionViewMode(position_);
};

Melown.BrowserInterface.prototype.getPositionHeigthMode = function(position_) {
    return this.map_.getPositionHeightMode(position_);
};

Melown.BrowserInterface.prototype.getPositionCanvasCoords = function(position_) {
    return this.map_.getPositionCanvasCoords(position_);
};

Melown.BrowserInterface.prototype.pan = function(position_, dx_, dy_) {
    return this.map_.pan(position_, dx_, dy_);
};

Melown.BrowserInterface.prototype.flyTo = function(position_, options_) {
    return this.autopilot_.flyTo(position_, options_); 
};

Melown.BrowserInterface.prototype.on = function(eventName_, call_) {
    this.core_.on(eventName_, call_);
};

Melown.BrowserInterface.prototype.getControl = function(id_) {
    return this.ui_.getControlById(id_);
};

Melown.BrowserInterface.prototype.addControl = function(id_, html_, visible_) {
    return this.ui_.addControl(id_, html_, visible_);
};

Melown.BrowserInterface.prototype.removeControl = function(id_) {
    return this.ui_.removeControl(id_);
};

Melown.BrowserInterface.prototype.setParams = function(params_) {
    this.setConfigParams(params_);
    return this;
};

Melown.BrowserInterface.prototype.setParam = function(key_, value_) {
    this.setConfigParam(key_, value_);
    return this;
};

Melown.BrowserInterface.prototype.getParam = function(key_) {
    return this.getConfigParam(key_, value_);
};


Melown.getBrowserVersion = function() {
    return "0.1";
};

//prevent minification
Melown["MapBrowser"] = Melown.MapBrowser;
Melown.BrowserInterface.prototype["setPosition"] = Melown.BrowserInterface.prototype.setPosition;
Melown.BrowserInterface.prototype["getPosition"] = Melown.BrowserInterface.prototype.getPosition;
Melown.BrowserInterface.prototype["setView"] = Melown.BrowserInterface.prototype.setView;
Melown.BrowserInterface.prototype["getView"] = Melown.BrowserInterface.prototype.getView;
Melown.BrowserInterface.prototype["getCredits"] = Melown.BrowserInterface.prototype.getCredits;
Melown.BrowserInterface.prototype["getViews"] = Melown.BrowserInterface.prototype.getViews;
Melown.BrowserInterface.prototype["getViewInfo"] = Melown.BrowserInterface.prototype.getViewInfo;
Melown.BrowserInterface.prototype["getBoundLayers"] = Melown.BrowserInterface.prototype.getBoundLayers;
Melown.BrowserInterface.prototype["getBoundLayerInfo"] = Melown.BrowserInterface.prototype.getBoundLayerInfo;
Melown.BrowserInterface.prototype["getFreeLayers"] = Melown.BrowserInterface.prototype.getFreeLayers;
Melown.BrowserInterface.prototype["getFreeLayerInfo"] = Melown.BrowserInterface.prototype.getFreeLayerInfo;
Melown.BrowserInterface.prototype["getSurfaces"] = Melown.BrowserInterface.prototype.getSurfaces;
Melown.BrowserInterface.prototype["getSurfaceInfo"] = Melown.BrowserInterface.prototype.getSurfaceInfo;
Melown.BrowserInterface.prototype["getSrses"] = Melown.BrowserInterface.prototype.getSrses;
Melown.BrowserInterface.prototype["getReferenceFrame"] = Melown.BrowserInterface.prototype.getReferenceFrame;
Melown.BrowserInterface.prototype["pan"] = Melown.BrowserInterface.prototype.pan;
Melown.BrowserInterface.prototype["flyTo"] = Melown.BrowserInterface.prototype.flyTo;
Melown.BrowserInterface.prototype["on"] = Melown.BrowserInterface.prototype.on;




