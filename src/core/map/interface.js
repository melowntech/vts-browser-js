
import MapTrajectory_ from './trajectory';
import MapBoundLayer_ from './bound-layer';
import MapSurface_ from './surface';
import MapPosition_ from './position';

//get rid of compiler mess
var MapTrajectory = MapTrajectory_;
var MapBoundLayer = MapBoundLayer_;
var MapSurface = MapSurface_;
var MapPosition = MapPosition_;


var MapInterface = function(map) {
    this.map = map;
    this.config = map.config;
};


MapInterface.prototype.setPosition = function(position) {
    this.map.setPosition(position);
    return this;    
};


MapInterface.prototype.getPosition = function(type) {
    return this.map.getPosition();
};


MapInterface.prototype.setView = function(view) {
    this.map.setView(view);
    return this;    
};


MapInterface.prototype.getView = function() {
    return this.map.getView();
};


MapInterface.prototype.getCredits = function() {
    return this.map.getCredits();
};


MapInterface.prototype.getCurrentCredits = function() {
    return this.map.getVisibleCredits();
};


MapInterface.prototype.getCreditInfo = function(creditId) {
    var credit = this.map.getCreditById(creditId);
    return credit ? credit.getInfo() : {};
};


MapInterface.prototype.getViews = function() {
    return this.map.getNamedViews();
};


MapInterface.prototype.getViewInfo = function(viewId) {
    var view = this.map.getNamedView(viewId);
    return view ? view.getInfo() : {};
};


MapInterface.prototype.getBoundLayers = function() {
    return this.map.getBoundLayers();
};


MapInterface.prototype.getBoundLayerInfo = function(layerId) {
    return this.map.getBoundLayerInfo(layerId);
};


MapInterface.prototype.getFreeLayers = function() {
    return this.map.getFreeLayers();
};


MapInterface.prototype.getFreeLayerInfo = function(layerId) {
    var layer = this.map.getFreeLayer(layerId);
    return layer ? layer.getInfo() : {};
};


MapInterface.prototype.getSurfaces = function() {
    return this.map.getSurfaces();
};


MapInterface.prototype.getSurfaceInfo = function(surfaceId) {
    var surface = this.map.getFreeLayer(surfaceId);
    return surface ? surface.getInfo() : {};
};


MapInterface.prototype.getSrses = function() {
    return this.map.getSrses();
};


MapInterface.prototype.getSrsInfo = function(srsId) {
    var srs = this.map.getSrs(srsId);
    return srs ? srs.getInfo() : {};
};


MapInterface.prototype.getReferenceFrame = function() {
    return this.map.referenceFrame.getInfo();
};


MapInterface.prototype.addFreeLayer = function(id, options) {
    var layer = new MapSurface(this.map, options, 'free');
    this.map.addFreeLayer(id, layer);
};


MapInterface.prototype.removeFreeLayer = function(id) {
    this.map.removeFreeLayer(id); 
};


/* MapInterface.prototype.setFreeLayerOptions = function(id, options) {
    this.map.setFreeLayerOptions(id, options); 
};


MapInterface.prototype.getFreeLayerOptions = function(id) {
    return this.map.getFreeLayerOptions(id); 
}; */


MapInterface.prototype.addBoundLayer = function(id, options) {
    var layer = new MapBoundLayer(this.map, options, id);
    this.map.addBoundLayer(id, layer); 
};


MapInterface.prototype.removeBoundLayer = function(id) {
    this.map.removeBoundLayer(id); 
};


/* MapInterface.prototype.setBoundLayerOptions = function(id, options) {
    this.map.setBoundLayerOptions(id, options); 
};


MapInterface.prototype.getBoundLayerOptions = function(id) {
    return this.map.setBoundLayerOptions(id); 
};*/

MapInterface.prototype.convertPositionViewMode = function(position, mode) {
    return this.map.convert.convertPositionViewMode((new MapPosition(position)), mode);
};


MapInterface.prototype.convertPositionHeightMode = function(position, mode, noPrecisionCheck) {
    return this.map.convert.convertPositionHeightMode((new MapPosition(position)), mode, noPrecisionCheck);
};


MapInterface.prototype.convertCoords = function(sourceSrs, destinationSrs, coords) {
    var srs = this.map.getSrs(sourceSrs);
    var srs2 = this.map.getSrs(destinationSrs);
    if (!srs || !srs2) {
        return null;
    }

    return srs2.convertCoordsFrom(coords, srs);
};


MapInterface.prototype.convertCoordsFromNavToPhys = function(pos, mode, lod) {
    var p = ['obj', pos[0], pos[1], mode, pos[2], 0, 0, 0, 10, 55 ];
    return this.map.convert.getPositionPhysCoords((new MapPosition(p)), lod);
};


MapInterface.prototype.convertCoordsFromNavToCanvas = function(pos, mode, lod) {
    var p = ['obj', pos[0], pos[1], mode, pos[2], 0, 0, 0, 10, 55 ];
    return this.map.convert.getPositionCanvasCoords((new MapPosition(p)), lod);
};


MapInterface.prototype.convertCoordsFromPhysToCanvas = function(pos) {
    var p = ['obj', pos[0], pos[1], 'fix', pos[2], 0, 0, 0, 10, 55 ];
    return this.map.convert.getPositionCanvasCoords((new MapPosition(p)), null, true);
};


MapInterface.prototype.convertCoordsFromNavToCameraSpace = function(pos, mode, lod) {
    var p = ['obj', pos[0], pos[1], mode, pos[2], 0, 0, 0, 10, 55 ];
    return this.map.convert.getPositionCameraSpaceCoords((new MapPosition(p)), lod);
};


MapInterface.prototype.convertCoordsFromPhysToCameraSpace = function(pos) {
    var p = this.map.camera.position;
    return [pos[0] - p[0], pos[1] - p[1], pos[2] - p[2]];
};


MapInterface.prototype.getPositionCanvasCoords = function(position, lod) {
    return this.map.convert.getPositionCanvasCoords(new MapPosition(position), lod);
};


MapInterface.prototype.getPositionCameraCoords = function(position, mode) {
    return this.map.convert.getPositionCameraCoords(new MapPosition(position), mode);
};


MapInterface.prototype.movePositionCoordsTo = function(position, azimuth, distance, skipOrientation) {
    return this.map.convert.movePositionCoordsTo(new MapPosition(position), azimuth, distance, skipOrientation);
};


MapInterface.prototype.getSurfaceHeight = function(coords, precision) {
    return this.map.measure.getSurfaceHeight(coords, this.map.measure.getOptimalHeightLodBySampleSize(coords, precision));
};


MapInterface.prototype.getDistance = function(coords, coords2, includingHeight) {
    return this.map.measure.getDistancet(coords, coords2, includingHeight);
};


MapInterface.prototype.getAzimuthCorrection = function(coords, coords2) {
    return this.map.measure.getAzimuthCorrection(coords, coords2);
};


MapInterface.prototype.getNED = function(coords) {
    return this.map.measure.getNewNED(coords, true);
};


MapInterface.prototype.getCameraInfo = function() {
    var camera = this.map.camera;
    return {
        'projectionMatrix' : camera.camera.projection.slice(),
        'viewMatrix' : camera.camera.modelview.slice(),
        'view-projectionMatrix' : camera.camera.mvp.slice(),
        'rotationMatrix' : camera.camera.rotationview.slice(),
        'position' : this.map.camera.position.slice(),
        'vector' : this.map.camera.vector.slice(),
        'distance' : this.map.camera.distance
    };
};


MapInterface.prototype.isPointInsideCameraFrustum = function(point) {
    return this.map.camera.camera.pointVisible(point, this.map.camera.position);
};


MapInterface.prototype.isBBoxInsideCameraFrustum = function(bbox) {
    return this.map.camera.camera.bboxVisible({min:bbox[0], max:bbox[1]}, this.map.camera.position);
};


MapInterface.prototype.generateTrajectory = function(p1, p2, options) {
    p1 = new MapPosition(p1);
    p2 = new MapPosition(p2);
    return (new MapTrajectory(this.map, p1, p2, options)).generate();
};


MapInterface.prototype.generatePIHTrajectory = function(position, azimuth, distance, options) {
    var p = new MapPosition(position);
    options['distance'] = distance;
    options['azimuth'] = azimuth;
    options['distanceAzimuth'] = true;
    return (new MapTrajectory(this.map, p, p, options)).generate();
};


MapInterface.prototype.setConfigParams = function(params) {
    this.map.setConfigParams(params);
    return this;
};


MapInterface.prototype.setConfigParam = function(key, value) {
    this.map.setConfigParam(key, value);
    return this;
};


MapInterface.prototype.getConfigParam = function(key) {
    return this.map.getConfigParam(key);
};


MapInterface.prototype.redraw = function() {
    this.map.markDirty();
    return this;
};


MapInterface.prototype.addRenderSlot = function(id, callback, enabled) {
    this.map.renderSlots.addRenderSlot(id, callback, enabled);
    return this;    
};


MapInterface.prototype.moveRenderSlotBefore = function(whichId, whereId) {
    this.map.renderSlots.moveRenderSlotBefore(whichId, whereId);
    return this;    
};


MapInterface.prototype.moveRenderSlotAfter = function(whichId, whereId) {
    this.map.renderSlots.moveRenderSlotAfter(whichId, whereId);
    return this;    
};


MapInterface.prototype.removeRenderSlot = function(id) {
    this.map.renderSlots.removeRenderSlot(id);
    return this;    
};


MapInterface.prototype.setRenderSlotEnabled = function(id, state) {
    this.map.renderSlots.setRenderSlotEnabled(id, state);
    return this;    
};


MapInterface.prototype.getRenderSlotEnabled = function(id) {
    return this.map.renderSlots.getRenderSlotEnabled(id);
};


MapInterface.prototype.setLoaderSuspended = function(state) {
    this.map.loaderSuspended = state;
    return this;
};


MapInterface.prototype.getLoaderSuspended = function() {
    return this.map.loaderSuspended;
};


MapInterface.prototype.getGpuCache = function() {
    return this.map.gpuCache;
};


MapInterface.prototype.getHitCoords = function(screenX, screenY, mode, lod) {
    return this.map.getHitCoords(screenX, screenY, mode, lod);
};


MapInterface.prototype.getScreenRay = function(screenX, screenY) {
    return this.map.getScreenRay(screenX, screenY);
};


MapInterface.prototype.getStats = function() {
    var busyWorkers = 0;
    for (var i = 0, li = this.map.geodataProcessors; i < li; i++) {
        if (this.map.geodataProcessors[i].busy) {
            busyWorkers++;
        }        
    }

    return {
        'bestMeshTexelSize' : this.map.bestMeshTexelSize,
        'bestGeodataTexelSize' : this.map.bestGeodataTexelSize, 
        'downloading' : this.map.loader.downloading.length,
        'lastDownload' : this.map.loader.lastDownloadTime, 
        'surfaces' : this.map.tree.surfaceSequence.length,
        'freeLayers' : this.map.freeLayerSequence.length,
        'texelSizeFit' : this.map.texelSizeFit,
        'loadMode' : this.map.config.mapLoadMode,
        'processingTasks' : this.map.processingTasks.length,
        'busyWorkers' : busyWorkers,
        'dirty' : this.map.dirty,
        'drawnTiles' : this.map.stats.drawnTiles,
        'drawnGeodataTiles' : this.map.stats.drawnGeodataTiles
    };
};


MapInterface.prototype.click = function(screenX, screenY, state) {
    this.map.click(screenX, screenY, state);
};


MapInterface.prototype.hover = function(screenX, screenY, persistent, state) {
    this.map.hover(screenX, screenY, persistent, state);
};


export default MapInterface;
