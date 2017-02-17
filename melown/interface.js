
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
    this.map_ = null;//this.core_.getMap();
    this.ui_ = this.browser_.ui_;
    this.autopilot_ = this.browser_.autopilot_;
    this.presenter_ = this.browser_.presenter_;
    this.killed_ = false;
    this.core_.on("map-loaded", (function(){ this.map_ = this.core_.getMap(); }).bind(this));
    this.core_.on("map-unloaded", (function(){ this.map_ = null; }).bind(this));    
};

Melown.BrowserInterface.prototype.getPresenter = function() {
    if (this.killed_) return;
    return this.presenter_;
};

Melown.BrowserInterface.prototype.getRenderer = function() {
    if (this.killed_) return;
    return this.core_.getRenderer();
};

Melown.BrowserInterface.prototype.getProj4 = function() {
    if (this.killed_) return;
    return this.core_.getProj4();
};

Melown.BrowserInterface.prototype.getUI = function() {
    if (this.killed_) return;
    return this.ui_;
};

Melown.BrowserInterface.prototype.destroy = function() {
    if (this.killed_) return;
    this.core_.destroy();
    this.map_ = null;
    this.browser_.killed_ = true;
    this.ui_.kill();
    this.ui_ = null;
    this.core_ = null;
    this.killed_ = true;
    return null;    
};

Melown.BrowserInterface.prototype.setControlMode = function(mode_) {
    if (this.killed_) return;
    this.browser_.controlMode_ = mode_;
    return this;    
};

Melown.BrowserInterface.prototype.getControlMode = function() {
    if (this.killed_) return;
    return this.browser_.controlMode_;
};

Melown.BrowserInterface.prototype.loadMap = function(path_) {
    if (this.killed_) return;
    this.core_.loadMap(path_);
    return this;    
};

Melown.BrowserInterface.prototype.destroyMap = function() {
    if (this.killed_) return;
    this.core_.destroyMap();
    this.map_ = null;
    return this;    
};

Melown.BrowserInterface.prototype.setPosition = function(position_) {
    if(!this.map_) return;
    this.map_.setPosition(position_);
    return this;    
};

Melown.BrowserInterface.prototype.getPosition = function() {
    if(!this.map_) return;
    return this.map_.getPosition();
};

Melown.BrowserInterface.prototype.getCurrentCredits = function() {
    if(!this.map_) return;
    return this.map_.getCurrentCredits();
};

Melown.BrowserInterface.prototype.setView = function(view_) {
    if(!this.map_) return;
    this.map_.setView(view_);
    return this;    
};

Melown.BrowserInterface.prototype.getView = function() {
    if(!this.map_) return;
    return this.map_.getView();
};

Melown.BrowserInterface.prototype.getCredits = function() {
    if(!this.map_) return;
    return this.map_.getCredits();
};

Melown.BrowserInterface.prototype.getCreditsInfo = function(creditId_) {
    if(!this.map_) return;
    var credit_ = this.map_.getCredit(creditId_);
    return (credit_ != null) ? credit_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getViews = function() {
    if(!this.map_) return;
    return this.map_.getMapViews();
};

Melown.BrowserInterface.prototype.getViewInfo = function(viewId_) {
    if(!this.map_) return;
    var view_ = this.map_.getMapView(viewId_);
    return (view_ != null) ? view_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getBoundLayers = function() {
    if(!this.map_) return;
    return this.map_.getBoundLayers();
};

Melown.BrowserInterface.prototype.getBoundLayerInfo = function(layerId_) {
    if(!this.map_) return;
    var layer_ = this.map_.getBoundLayer(layerId_);
    return (layer_ != null) ? layer_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getFreeLayers = function() {
    if(!this.map_) return;
    return this.map_.getFreeLayers();
};

Melown.BrowserInterface.prototype.getFreeLayerInfo = function(layerId_) {
    if(!this.map_) return;
    var layer_ = this.map_.getFreeLayer(layerId_);
    return (layer_ != null) ? layer_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getSurfaces = function() {
    if(!this.map_) return;
    return this.map_.getSurfaces();
};

Melown.BrowserInterface.prototype.getSurfaceInfo = function(surfaceId_) {
    if(!this.map_) return;
    var surface_ = this.map_.getFreeLayer(surfaceId_);
    return (surface_ != null) ? surface_.getInfo() : null;
};

Melown.BrowserInterface.prototype.getSrses = function() {
    if(!this.map_) return;
    return this.map_.getSrses();
};

Melown.BrowserInterface.prototype.getSrsInfo = function(srsId_) {
    if(!this.map_) return;
    return this.map_.getSrsInfo(srsId_);
};

Melown.BrowserInterface.prototype.getReferenceFrame = function() {
    if(!this.map_) return;
    return this.map_.getReferenceFrame();
};

Melown.BrowserInterface.prototype.convertPositionViewMode = function(position_, mode_) {
    if(!this.map_) return;
    return this.map_.convertPositionViewMode(position_, mode_);
};

Melown.BrowserInterface.prototype.convertPositionHeightMode = function(position_, mode_) {
    if(!this.map_) return;
    return this.map_.convertPositionHeightMode(position_, mode_);
};

Melown.BrowserInterface.prototype.convertCoords = function(sourceSrs_, destinationSrs_, coords_) {
    if(!this.map_) return;
    return this.map_.convertCoords(sourceSrs_, destinationSrs_, coords_);
};

Melown.BrowserInterface.prototype.convertCoordsFromNavToPhys = function(coords_, heightMode_, lod_) {
    if(!this.map_) return;
    return this.map_.convertCoordsFromNavToPhys(coords_, heightMode_, lod_);
};

Melown.BrowserInterface.prototype.convertCoordsFromNavToCanvas = function(coords_, heightMode_, lod_) {
    if(!this.map_) return;
    return this.map_.convertCoordsFromNavToCanvas(coords_, heightMode_, lod_);
};

Melown.BrowserInterface.prototype.convertCoordsFromPhysToCanvas = function(coords_) {
    if(!this.map_) return;
    return this.map_.convertCoordsFromPhysToCanvas(coords_);
};

Melown.BrowserInterface.prototype.convertCoordsFromNavToCameraSpace = function(coords_, heightMode_, lod_) {
    if(!this.map_) return;
    return this.map_.convertCoordsFromNavToCameraSpace(coords_, heightMode_, lod_);
};

Melown.BrowserInterface.prototype.convertCoordsFromPhysToCameraSpace = function(coords_, heightMode_, lod_) {
    if(!this.map_) return;
    return this.map_.convertCoordsFromPhysToCameraSpace(coords_, heightMode_, lod_);
};

Melown.BrowserInterface.prototype.clonePosition = function(position_) {
    if(!this.map_) return;
    return this.map_.clonePosition(position_);
};

Melown.BrowserInterface.prototype.arePositionsSame = function(position_, position2_) {
    if(!this.map_) return;
    return this.map_.arePositionsSame(position_, position2_);
};

Melown.BrowserInterface.prototype.setPositionCoords = function(position_, coords_) {
    if(!this.map_) return;
    return this.map_.setPositionCoords(position_, coords_);
};

Melown.BrowserInterface.prototype.getPositionCoords = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionCoords(position_);
};

Melown.BrowserInterface.prototype.setPositionHeight = function(position_, height_) {
    if(!this.map_) return;
    return this.map_.setPositionHeight(position_, height_);
};

Melown.BrowserInterface.prototype.getPositionHeight = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionHeight(position_);
};

Melown.BrowserInterface.prototype.setPositionOrientation = function(position_, orientation_) {
    if(!this.map_) return;
    return this.map_.setPositionOrientation(position_);
};

Melown.BrowserInterface.prototype.getPositionOrientation = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionOrientation(position_);
};

Melown.BrowserInterface.prototype.setPositionViewExtent = function(position_, extent_) {
    if(!this.map_) return;
    return this.map_.setPositionViewExtent(position_, extent_);
};

Melown.BrowserInterface.prototype.getPositionViewExtent = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionViewExtent(position_);
};

Melown.BrowserInterface.prototype.setPositionFov = function(position_, fov_) {
    if(!this.map_) return;
    return this.map_.setPositionFov(position_, fov_);
};

Melown.BrowserInterface.prototype.getPositionFov = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionFov(position_);
};

Melown.BrowserInterface.prototype.getPositionViewMode = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionViewMode(position_);
};

Melown.BrowserInterface.prototype.getPositionHeigthMode = function(position_) {
    if(!this.map_) return;
    return this.map_.getPositionHeightMode(position_);
};

Melown.BrowserInterface.prototype.getPositionCanvasCoords = function(position_, lod_) {
    if(!this.map_) return;
    return this.map_.getPositionCanvasCoords(position_, lod_);
};

Melown.BrowserInterface.prototype.getPositionCameraCoords = function(position_, mode_) {
    if(!this.map_) return;
    return this.map_.getPositionCameraCoords(position_, mode_);
};

Melown.BrowserInterface.prototype.movePositionCoordsTo = function(position_, azimuth_, distance_) {
    if(!this.map_) return;
    return this.map_.movePositionCoordsTo(position_, azimuth_, distance_);
};

Melown.BrowserInterface.prototype.getSurfaceHeight = function(coords_, precision_) {
    if(!this.map_) return;
    return this.map_.getSurfaceHeight(coords_, precision_);
};

Melown.BrowserInterface.prototype.getDistance = function(coords_, coords2_, includingHeight_) {
    if(!this.map_) return;
    return this.map_.getDistance(coords_, coords2_, includingHeight_);
};

Melown.BrowserInterface.prototype.getAzimuthCorrection = function(coords_, coords2_) {
    if(!this.map_) return;
    return this.map_.getAzimuthCorrection(coords_, coords2_);
};

Melown.BrowserInterface.prototype.getCameraInfo = function() {
    if(!this.map_) return;
    return this.map_.getCameraInfo();
};

Melown.BrowserInterface.prototype.getMapStats = function() {
    if(!this.map_) return;
    return this.map_.getStats();
};

Melown.BrowserInterface.prototype.isPointInsideCameraFrustum = function(point_) {
    if(!this.map_) return;
    return this.map_.isPointInsideCameraFrustum(point_);
};

Melown.BrowserInterface.prototype.isBBoxInsideCameraFrustum = function(bbox_) {
    if(!this.map_) return;
    return this.map_.isBBoxInsideCameraFrustum(bbox_);
};

Melown.BrowserInterface.prototype.generateTrajectory = function(position_, position2_, options_) {
    if(!this.map_) return;
    return this.map_.generateTrajectory(position_, position2_, options_);
};

Melown.BrowserInterface.prototype.redraw = function() {
    if(!this.map_) return;
    this.map_.redraw();
    return this;    
};

Melown.BrowserInterface.prototype.addRenderSlot = function(id_, callback_, enabled_) {
    if(!this.map_) return;
    return this.map_.addRenderSlot(id_, callback_, enabled_);
};
 
Melown.BrowserInterface.prototype.moveRenderSlotBefore = function(whichId_, whereId_) {
    if(!this.map_) return;
    this.map_.moveRenderSlotBefore(whichId_, whereId_);
    return this;    
};
 
Melown.BrowserInterface.prototype.moveRenderSlotAfter = function(whichId_, whereId_) {
    if(!this.map_) return;
    this.map_.moveRenderSlotAfter(whichId_, whereId_);
    return this;    
};

Melown.BrowserInterface.prototype.removeRenderSlot = function(id_) {
    if(!this.map_) return;
    this.map_.removeRenderSlot(id_);
    return this;    
};

Melown.BrowserInterface.prototype.setRenderSlotEnabled = function(id_, state_) {
    if(!this.map_) return;
    this.map_.setRenderSlotEnabled(id_, state_);
    return this;    
};
 
Melown.BrowserInterface.prototype.getRenderSlotEnabled = function(id_) {
    if(!this.map_) return;
    return this.map_.getRenderSlotEnabled(id_);
};
 
Melown.BrowserInterface.prototype.setLoaderSuspended = function(state_) {
    if(!this.map_) return;
    this.map_.setLoaderSuspended(state_);
    return this;    
};

Melown.BrowserInterface.prototype.getLoaderSuspended = function() {
    if(!this.map_) return;
    return this.map_.getLoaderSuspended();
};
 
Melown.BrowserInterface.prototype.getGpuCache = function() {
    if(!this.map_) return;
    return this.map_.getGpuCache();
};

Melown.BrowserInterface.prototype.getHitCoords = function(screenX_, screenY_, mode_, lod_) {
    if(!this.map_) return;
    return this.map_.getHitCoords(screenX_, screenY_, mode_, lod_);
};

Melown.BrowserInterface.prototype.flyTo = function(position_, options_) {
    if(!this.map_) return;
    this.autopilot_.flyTo(position_, options_); 
    return this;    
};

Melown.BrowserInterface.prototype.generateTrajectory = function(p1_, p2_, options_) {
    if(!this.map_) return;
    return this.map_.generateTrajectory(p1_, p2_, options_);
};

Melown.BrowserInterface.prototype.generatePIHTrajectory = function(position_, azimuth_, distance_, options_) {
    if(!this.map_) return;
    return this.map_.generatePIHTrajectory(position_, azimuth_, distance_, options_);
};

Melown.BrowserInterface.prototype.flyTrajectory = function(trajectory_, sampleDuration_) {
    if(!this.map_ || !this.autopilot_) return;
    this.autopilot_.flyTrajectory(trajectory_, sampleDuration_); 
    return this;    
};

Melown.BrowserInterface.prototype.cancelFlight = function() {
    if(!this.map_ || !this.autopilot_) return;
    this.autopilot_.cancelFlight(); 
    return this;    
}; 

Melown.BrowserInterface.prototype.setAutorotate = function(speed_) {
    if(!this.map_ || !this.autopilot_) return;
    this.autopilot_.setAutorotate(speed_);
    return this;
};

Melown.BrowserInterface.prototype.getAutorotate = function() {
    if(!this.map_ || !this.autopilot_) return 0;
    return this.autopilot_.getAutorotate();
};

Melown.BrowserInterface.prototype.setAutopan = function(speed_, azimuth_) {
    if(!this.map_ || !this.autopilot_) return;
    this.autopilot_.setAutopan(speed_, azimuth_);
    return this;
};

Melown.BrowserInterface.prototype.getAutopan = function() {
    if(!this.map_ || !this.autopilot_) return;
    return this.autopilot_.getAutopan();
};

Melown.BrowserInterface.prototype.on = function(eventName_, call_) {
    this.core_.on(eventName_, call_);
    return this;    
};

Melown.BrowserInterface.prototype.getMapElement = function() {
    return this.ui_.getMapControl().getMapElement();
};

Melown.BrowserInterface.prototype.getControl = function(id_) {
    return this.ui_.getControlById(id_);
};

Melown.BrowserInterface.prototype.addControl = function(id_, html_, visible_) {
    return this.ui_.addControl(id_, html_, visible_);
};

Melown.BrowserInterface.prototype.removeControl = function(id_) {
    this.ui_.removeControl(id_);
    return this;    
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
    return "Browser: 1.15, Core: " + Melown.getCoreVersion();
};

//prevent minification
Melown["MapBrowser"] = Melown.MapBrowser;
Melown["mapBrowser"] = Melown.MapBrowser;
Melown.BrowserInterface.prototype["getRenderer"] = Melown.BrowserInterface.prototype.getRenderer; 
Melown.BrowserInterface.prototype["getPresenter"] = Melown.BrowserInterface.prototype.getPresenter; 
Melown.BrowserInterface.prototype["getProj4"] = Melown.BrowserInterface.prototype.getProj4; 
Melown.BrowserInterface.prototype["getUI"] = Melown.BrowserInterface.prototype.getUI; 
Melown.BrowserInterface.prototype["destroy"] = Melown.BrowserInterface.prototype.destroy; 
Melown.BrowserInterface.prototype["setControlMode"] = Melown.BrowserInterface.prototype.setControlMode;
Melown.BrowserInterface.prototype["getControlMode"] = Melown.BrowserInterface.prototype.getControlMode;
Melown.BrowserInterface.prototype["loadMap"] = Melown.BrowserInterface.prototype.loadMap;
Melown.BrowserInterface.prototype["destroyMap"] = Melown.BrowserInterface.prototype.destroyMap;
Melown.BrowserInterface.prototype["setPosition"] = Melown.BrowserInterface.prototype.setPosition;
Melown.BrowserInterface.prototype["getPosition"] = Melown.BrowserInterface.prototype.getPosition;
Melown.BrowserInterface.prototype["getCurrentCredits"] = Melown.BrowserInterface.prototype.getCurrentCredits; 
Melown.BrowserInterface.prototype["setView"] = Melown.BrowserInterface.prototype.setView; 
Melown.BrowserInterface.prototype["getView"] = Melown.BrowserInterface.prototype.getView; 
Melown.BrowserInterface.prototype["getCredits"] = Melown.BrowserInterface.prototype.getCredits; 
Melown.BrowserInterface.prototype["getCreditsInfo"] = Melown.BrowserInterface.prototype.getCreditsInfo; 
Melown.BrowserInterface.prototype["getViews"] = Melown.BrowserInterface.prototype.getViews; 
Melown.BrowserInterface.prototype["getViewInfo"] = Melown.BrowserInterface.prototype.getViewInfo; 
Melown.BrowserInterface.prototype["getBoundLayers"] = Melown.BrowserInterface.prototype.getBoundLayers; 
Melown.BrowserInterface.prototype["getBoundLayerInfo"] = Melown.BrowserInterface.prototype.getBoundLayerInfo; 
Melown.BrowserInterface.prototype["getFreeLayers"] = Melown.BrowserInterface.prototype.getFreeLayers; 
Melown.BrowserInterface.prototype["getFreeLayerInfo"] = Melown.BrowserInterface.prototype.getFreeLayerInfo; 
Melown.BrowserInterface.prototype["getSurfaces"] = Melown.BrowserInterface.prototype.getSurfaces; 
Melown.BrowserInterface.prototype["getSurfaceInfo"] = Melown.BrowserInterface.prototype.getSurfaceInfo; 
Melown.BrowserInterface.prototype["getSrses"] = Melown.BrowserInterface.prototype.getSrses; 
Melown.BrowserInterface.prototype["getSrsInfo"] = Melown.BrowserInterface.prototype.getSrsInfo; 
Melown.BrowserInterface.prototype["getReferenceFrame"] = Melown.BrowserInterface.prototype.getReferenceFrame; 
Melown.BrowserInterface.prototype["convertPositionViewMode"] = Melown.BrowserInterface.prototype.convertPositionViewMode; 
Melown.BrowserInterface.prototype["convertPositionHeightMode"] = Melown.BrowserInterface.prototype.convertPositionHeightMode; 
Melown.BrowserInterface.prototype["convertCoords"] = Melown.BrowserInterface.prototype.convertCoords; 
Melown.BrowserInterface.prototype["convertCoordsFromNavToPhys"] = Melown.BrowserInterface.prototype.convertCoordsFromNavToPhys; 
Melown.BrowserInterface.prototype["convertCoordsFromNavToCanvas"] = Melown.BrowserInterface.prototype.convertCoordsFromNavToCanvas; 
Melown.BrowserInterface.prototype["convertCoordsFromPhysToCanvas"] = Melown.BrowserInterface.prototype.convertCoordsFromPhysToCanvas; 
Melown.BrowserInterface.prototype["convertCoordsFromNavToCameraSpace"] = Melown.BrowserInterface.prototype.convertCoordsFromNavToCameraSpace;
Melown.BrowserInterface.prototype["convertCoordsFromPhysToCameraSpace"] = Melown.BrowserInterface.prototype.convertCoordsFromPhysToCameraSpace;
Melown.BrowserInterface.prototype["clonePosition"] = Melown.BrowserInterface.prototype.clonePosition; 
Melown.BrowserInterface.prototype["arePositionsSame"] = Melown.BrowserInterface.prototype.arePositionsSame; 
Melown.BrowserInterface.prototype["setPositionCoords"] = Melown.BrowserInterface.prototype.setPositionCoords; 
Melown.BrowserInterface.prototype["getPositionCoords"] = Melown.BrowserInterface.prototype.getPositionCoords; 
Melown.BrowserInterface.prototype["setPositionHeight"] = Melown.BrowserInterface.prototype.setPositionHeight; 
Melown.BrowserInterface.prototype["getPositionHeight"] = Melown.BrowserInterface.prototype.getPositionHeight; 
Melown.BrowserInterface.prototype["setPositionOrientation"] = Melown.BrowserInterface.prototype.setPositionOrientation; 
Melown.BrowserInterface.prototype["getPositionOrientation"] = Melown.BrowserInterface.prototype.getPositionOrientation; 
Melown.BrowserInterface.prototype["setPositionViewExtent"] = Melown.BrowserInterface.prototype.setPositionViewExtent; 
Melown.BrowserInterface.prototype["getPositionViewExtent"] = Melown.BrowserInterface.prototype.getPositionViewExtent;
Melown.BrowserInterface.prototype["setPositionFov"] = Melown.BrowserInterface.prototype.setPositionFov; 
Melown.BrowserInterface.prototype["getPositionFov"] = Melown.BrowserInterface.prototype.getPositionFov; 
Melown.BrowserInterface.prototype["getPositionViewMode"] = Melown.BrowserInterface.prototype.getPositionViewMode; 
Melown.BrowserInterface.prototype["getPositionHeigthMode"] = Melown.BrowserInterface.prototype.getPositionHeigthMode; 
Melown.BrowserInterface.prototype["getPositionCanvasCoords"] = Melown.BrowserInterface.prototype.getPositionCanvasCoords; 
Melown.BrowserInterface.prototype["getPositionCameraCoords"] = Melown.BrowserInterface.prototype.getPositionCameraCoords; 
Melown.BrowserInterface.prototype["movePositionCoordsTo"] = Melown.BrowserInterface.prototype.movePositionCoordsTo; 
Melown.BrowserInterface.prototype["getSurfaceHeight"] = Melown.BrowserInterface.prototype.getSurfaceHeight;
Melown.BrowserInterface.prototype["getDistance"] = Melown.BrowserInterface.prototype.getDistance;
Melown.BrowserInterface.prototype["getAzimuthCorrection"] = Melown.BrowserInterface.prototype.getAzimuthCorrection; 
Melown.BrowserInterface.prototype["getCameraInfo"] = Melown.BrowserInterface.prototype.getCameraInfo;
Melown.BrowserInterface.prototype["getMapStats"] = Melown.BrowserInterface.prototype.getMapStats;
Melown.BrowserInterface.prototype["isPointInsideCameraFrustum"] = Melown.BrowserInterface.prototype.isPointInsideCameraFrustum;
Melown.BrowserInterface.prototype["isBBoxInsideCameraFrustum"] = Melown.BrowserInterface.prototype.isBBoxInsideCameraFrustum;
Melown.BrowserInterface.prototype["generateTrajectory"] = Melown.BrowserInterface.prototype.generateTrajectory; 
Melown.BrowserInterface.prototype["redraw"] = Melown.BrowserInterface.prototype.redraw;
Melown.BrowserInterface.prototype["addRenderSlot"] = Melown.BrowserInterface.prototype.addRenderSlot; 
Melown.BrowserInterface.prototype["moveRenderSlotBefore"] = Melown.BrowserInterface.prototype.moveRenderSlotBefore; 
Melown.BrowserInterface.prototype["moveRenderSlotAfter"] = Melown.BrowserInterface.prototype.moveRenderSlotAfter;
Melown.BrowserInterface.prototype["removeRenderSlot"] = Melown.BrowserInterface.prototype.removeRenderSlot;
Melown.BrowserInterface.prototype["setRenderSlotEnabled"] = Melown.BrowserInterface.prototype.setRenderSlotEnabled; 
Melown.BrowserInterface.prototype["getRenderSlotEnabled"] = Melown.BrowserInterface.prototype.getRenderSlotEnabled; 
Melown.BrowserInterface.prototype["setLoaderSuspended"] = Melown.BrowserInterface.prototype.setLoaderSuspended;
Melown.BrowserInterface.prototype["getLoaderSuspended"] = Melown.BrowserInterface.prototype.getLoaderSuspended; 
Melown.BrowserInterface.prototype["getGpuCache"] = Melown.BrowserInterface.prototype.getGpuCache;
Melown.BrowserInterface.prototype["getHitCoords"] = Melown.BrowserInterface.prototype.getHitCoords;
Melown.BrowserInterface.prototype["flyTo"] = Melown.BrowserInterface.prototype.flyTo; 
Melown.BrowserInterface.prototype["flyTrajectory"] = Melown.BrowserInterface.prototype.flyTrajectory; 
Melown.BrowserInterface.prototype["setAutorotate"] = Melown.BrowserInterface.prototype.setAutorotate; 
Melown.BrowserInterface.prototype["getAutorotate"] = Melown.BrowserInterface.prototype.getAutorotate; 
Melown.BrowserInterface.prototype["setAutopan"] = Melown.BrowserInterface.prototype.setAutopan; 
Melown.BrowserInterface.prototype["getAutopan"] = Melown.BrowserInterface.prototype.getAutopan; 
Melown.BrowserInterface.prototype["cancelFlight"] = Melown.BrowserInterface.prototype.cancelFlight; 
Melown.BrowserInterface.prototype["on"] = Melown.BrowserInterface.prototype.on; 
Melown.BrowserInterface.prototype["getMapElement"] = Melown.BrowserInterface.prototype.getMapElement; 
Melown.BrowserInterface.prototype["getControl"] = Melown.BrowserInterface.prototype.getControl; 
Melown.BrowserInterface.prototype["addControl"] = Melown.BrowserInterface.prototype.addControl; 
Melown.BrowserInterface.prototype["removeControl"] = Melown.BrowserInterface.prototype.removeControl; 
Melown.BrowserInterface.prototype["setParams"] = Melown.BrowserInterface.prototype.setParams; 
Melown.BrowserInterface.prototype["setParam"] = Melown.BrowserInterface.prototype.setParam; 
Melown.BrowserInterface.prototype["getParam"] = Melown.BrowserInterface.prototype.getParam; 
Melown["getBrowserVersion"] = Melown.getBrowserVersion; 

