/** @const */ var Melown_STILE_METADATA = 0;
/** @const */ var Melown_STILE_MESH = 1;
/** @const */ var Melown_STILE_TEXTURE = 2;
/** @const */ var Melown_STILE_HEIGHT = 3;

/**
 * @constructor
 */
Melown.Map = function(core_, mapConfig_, path_) {
    this.core_ = core_;
    this.proj4_ = this.core_.getProj4();
    this.mapConfig_ = mapConfig_;
    this.coreConfig_ = core_.coreConfig_;
    this.killed_ = false;
    this.urlCounter_ = 0;

    this.baseURL_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    //this.mapConfig_["view"] = { "surfaces": ["ppspace"], "boundLayers": [], "freeLayers": [] };

    this.navMode_ = "obj";
    this.navFov_ = 45;
    this.navCenter_ = [0,0];
    this.navHeight_ = 0;
    this.navTerrainHeight_ = 0;
    this.navTerrainHeightUnknown_ = true;
    this.navViewExtent_ = 1;
    this.navOrientation_ = [0,0,0];
    this.navCameraDistance_ = 0;
    this.navCameraPosition_ = [0,0,0];
    this.navHeightMode_ = "abs";

    this.navCurrentPos_ = ["obj", 0, 0, "abs", 0,  0, 0, 0,  0, 0];
    this.navLastPos_ = this.navCenter_.slice();

    this.srses_ = {};
    this.referenceFrames_ = {};
    this.credits_ = {};
    this.surfaces_ = [];
    this.glues_ = [];
    this.freeLayers_ = [];
    this.boundLayers_ = [];
    this.dynamicLayers_ = [];

    this.initialView_ = null;
    this.currentView_ = null;
    this.namedViews_ = [];
    this.viewCounter_ = 0;

    this.surfaceSequence_ = [];

    this.mapTrees_ = [];

    this.gpuCache_ = new Melown.MapCache(this, 380*1024*1024);
    this.resourcesCache_ = new Melown.MapCache(this, 380*1024*1024);
    this.metatileCache_ = new Melown.MapCache(this, 60*1024*1024);

    this.loader_ = new Melown.MapLoader(this);

    this.renderer_ = this.core_.renderer_;//new Melown.Renderer(this.core_, this.core_.div_);
    this.camera_ = this.renderer_.camera_;

    this.stats_ = new Melown.MapStats(this);

    this.parseConfig(this.mapConfig_);

    this.initMapTrees();

    this.updateCoutner_ = 0;
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    this.heightmapOnly_ = false;
    this.blendHeightmap_ = true;
    this.drawBBoxes_ = false;
    this.drawLods_ = false;
    this.drawPositions_ = false;
    this.drawTexelSize_ = false;
    this.drawWireframe_ = 0;
    this.drawFaceCount_ = false;
    this.drawDistance_ = false;
    this.drawMaxLod_ = false;
    this.drawTextureSize_ = false;
    this.drawLayers_ = true;
    this.ignoreTexelSize_ = false;
    this.drawFog_ = true;
    this.debugTextSize_ = 1.0;

    //this.mesh_ = new Melown.MapMesh(this);
    //this.mesh_.load("http://pomerol.internal:8889/vasek-output/vts/jenstejn.ppspace/18-130382-129149.bin");

};

Melown.Map.prototype.kill = function() {
    this.killed_ = true;

    if (this.renderer_ != null) {
        this.renderer_.kill();
        this.renderer_ = null;
    }
};

Melown.Map.prototype.initMapTrees = function() {

    var nodes_ = this.referenceFrames_.division_.nodes_;

    for (var i = 0, li = nodes_.length; i < li; i++) {
        var node_ = nodes_[i];
        var id_ = [node_.id_.lod_, node_.id_.position_[0], node_.id_.position_[1]];
        this.mapTrees_.push(new Melown.MapTree(this, id_, node_.refFrame_, false));
    }
};

Melown.Map.prototype.setOption = function(key_, value_) {
};

Melown.Map.prototype.getOption = function(key_) {
};

Melown.Map.prototype.addSrs = function(id_, srs_) {
    this.srses_[id_] = srs_;
};

Melown.Map.prototype.setReferenceFrames = function(referenceFrames_) {
    this.referenceFrames_ = referenceFrames_;
};

Melown.Map.prototype.addCredit = function(id_, credit_) {
    this.credits_[id_] = credit_;
};

Melown.Map.prototype.addSurface = function(id_, surface_) {
    this.surfaces_.push(surface_);
};

Melown.Map.prototype.getSurface = function(id_) {
    return this.searchArrayById(this.surfaces_, id_);
};

Melown.Map.prototype.addGlue = function(id_, glue_) {
    this.glues_[id_] = glue_;
};

Melown.Map.prototype.getGlue = function(id_) {
    return this.searchArrayById(this.glues_, id_);
};

Melown.Map.prototype.addBoundLayer = function(id_, layer_) {
    this.boundLayers_[id_] = layer_;
};

Melown.Map.prototype.getBoundLayer = function(id_) {
    return this.boundLayers_[id_];
};

Melown.Map.prototype.addFreeLayer = function(id_, layer_) {
    this.freeLayers_[id_] = layer_;
};

Melown.Map.prototype.getFreeLayer = function(id_) {
    return this.freeLayers_[id_];
};

Melown.Map.prototype.getMapsSrs = function(srs_) {
    if (srs_ == null) {
        return null;
    }

    //is it proj4 string?
    if (srs_.indexOf("+proj") != -1) {
        return new Melown.MapSrs(this, {"srsDef":srs_});
    }

    //search existing srs
    return this.srses_[srs_];
};

Melown.Map.prototype.setMapView = function(view_) {
    if (view_ == null) {
        return;
    }

    if (view_ != this.currentView_) {
        this.currentView_ = view_;
        this.freeLayers_ = this.currentView_.freeLayers_;
        this.viewCounter_++;
    }

    this.generateSurfaceSequence();
};

Melown.Map.prototype.searchArrayById = function(array_, id_) {
    for (var i = 0, li = array_.length; i < li; i++) {
        if (array_[i].id_ == id_) {
            return array_[i];
        }
    }

    return null;
};

Melown.Map.prototype.generateSurfaceSequence = function() {
    var view_ = this.currentView_;
    var surfaces_ = view_.surfaces_;

    for (var i = 0, li = surfaces_.length; i < li; i++) {

        //check for glue
        if (i + 1 < li) {
            var guleId_ = surfaces_[i].id_ + ";" + surfaces_[i+1].id_;
            var glue_ = this.glues_[glueId_];

            if (glue_ != null) {
                this.surfaceSequence_.push(glue_);
            }
        }

        this.surfaceSequence_.push(this.getSurface(surfaces_[i]));
    }
};

//! Returns the size of tiles at the given LOD.
Melown.Map.prototype.tileSize = function(lod_) { //int
    if (lod_ > this.foat_.lod_) {
        return this.foatSize_ >> (lod_ - this.foat_.lod_);
    } else {
        return this.foatSize_ << (this.foat_.lod_ - lod_);
    }
};

Melown.Map.prototype.setCenter = function(pos_) {
    this.navCenter_ = [pos_[0], pos_[1]];
    this.navTerrainHeightUnknown_ = true;
    this.dirty_ = true;
};

Melown.Map.prototype.getCenter = function() {
    return [ this.navCenter_[0], this.navCenter_[1] ];
};

Melown.Map.prototype.setOrientation = function(orientation_) {
    this.navOrientation_ = orientation_.slice();
    this.dirty_ = true;
};

Melown.Map.prototype.getOrientation = function() {
    return this.navOrientation_.slice();
};

Melown.Map.prototype.setFov = function(fov_) {
    this.navFov_ = fov_;
    this.dirty_ = true;
};

Melown.Map.prototype.getFov = function() {
    return this.navFov_;
};

Melown.Map.prototype.setViewExtent = function(extent_) {
    this.navViewExtent_ = extent_;
    this.dirty_ = true;
};

Melown.Map.prototype.getViewExtent = function() {
    return this.navViewExtent_;
};

Melown.Map.prototype.setHeight = function(height_) {
    this.navHeight_ = height_;
    this.dirty_ = true;
};

Melown.Map.prototype.getHeight = function() {
    return this.navHeight_;
};

Melown.Map.prototype.setHeightMode = function(mode_) {
    this.navHeightMode_ = mode_;
    this.dirty_ = true;
};

Melown.Map.prototype.getHeightMode = function() {
    return this.navHeightMode_;
};

Melown.Map.prototype.setCameraMode = function(mode_) {
    this.navCameraMode_ = mode_;
    this.dirty_ = true;
};

Melown.Map.prototype.getCameraMode = function() {
    return this.navCameraMode_;
};

Melown.Map.prototype.checkViewChange = function(pos_) {
    return !(Melown.isEqual(this.navCenter_[0], pos_[1], 0.0000001) &&
             Melown.isEqual(this.navCenter_[1], pos_[2], 0.0000001) &&
             Melown.isEqual(this.navHeight_, pos_[4], 0.001) &&
             Melown.isEqual(this.navOrientation_[0], pos_[5], 0.001) &&
             Melown.isEqual(this.navOrientation_[1], pos_[6], 0.001) &&
             Melown.isEqual(this.navOrientation_[2], pos_[7], 0.001) &&
             Melown.isEqual(this.navViewExtent_, pos_[8], 0.001) &&
             Melown.isEqual(this.navFov_, (pos_[9] || 90) * 0.5, 0.001));
};

Melown.Map.prototype.setPosition = function(pos_, public_) {
    pos_ = pos_.slice();

    if (pos_[0] == "fixed") {
        pos_[0] = "obj";
        pos_[9] = pos_[8];
        pos_[8] = pos_[7];
        pos_[7] = pos_[6];
        pos_[6] = pos_[5];
        pos_[5] = pos_[4];
        pos_[4] = pos_[3];
        pos_[3] = "fix";
    }

    pos_[9] = (pos_[9] || 90);

    /*if (public_ === false) { //convert to puclic
        var coords_ = this.referenceFrames_.convertCoords([pos_[1], pos_[2], pos_[4]], "physical", "public");
        pos_[1] = coords_[0];
        pos_[2] = coords_[1];
        pos_[4] = coords_[2];
    }*/

    this.setCameraMode(pos_[0]);
    this.setFov((pos_[9] || 90) * 0.5);
    this.setCenter([pos_[1], pos_[2]]);
    this.setHeightMode(pos_[3]);
    this.setHeight(pos_[4]);
    this.setOrientation([pos_[5], pos_[6], pos_[7]]);
    this.setViewExtent(pos_[8]);
    this.navTerrainHeight_ = 0;

    this.navCurrentPos_ = pos_;
};

Melown.Map.prototype.convertCoords = function(coords_, source_, destination_) {
    return this.referenceFrames_.convertCoords(coords_, source_, destination_);
};

Melown.Map.prototype.getPhysicalSrs = function(coords_, source_, destination_) {
    return this.referenceFrames_.model_.physicalSrs_;
};

Melown.Map.prototype.getPublicSrs = function() {
    return this.referenceFrames_.model_.publicSrs_;
};

Melown.Map.prototype.getNavigationSrs = function() {
    return this.referenceFrames_.model_.navigationSrs_;
};

Melown.Map.prototype.getPosition = function() {
    return this.navCurrentPos_.slice();
};

Melown.Map.prototype.pan = function(pos_, dx_ ,dy_) {
    var pos2_ = pos_.slice();

    var zoomFactor_ = (this.getViewExtent() * Math.tan(Melown.radians(this.camera_.getFov()))) / 800;
    dx_ *= zoomFactor_;
    dy_ *= zoomFactor_;

    var yaw_ = Melown.radians(this.getOrientation()[0]);
    var forward_ = [-Math.sin(yaw_), Math.cos(yaw_)];
    var aside_ = [Math.cos(yaw_), Math.sin(yaw_)];

    var coords_ = this.getCenter();
    var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

    if (navigationSrsInfo_["proj-name"] != "longlat") {
        pos2_[1] += forward_[0]*dy_ - aside_[0]*dx_;
        pos2_[2] += forward_[1]*dy_ - aside_[1]*dx_;
    } else {
        var mx_ = forward_[0]*dy_ - aside_[0]*dx_;
        var my_ = forward_[1]*dy_ - aside_[1]*dx_;

        var azimut_ = Melown.degrees(Math.atan2(mx_, my_));
        var distance_ = Math.sqrt(mx_*mx_ + my_*my_);
        console.log("azimut: " + azimut_ + " distance: " + distance_);

        var coords_ = this.getCenter();
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();

        //build omerc
        /*
        var projString_ = "+proj=omerc +k=1.0" +
                          " +lat_0=" + coords_[1] +
                          " +lonc="  + coords_[0] +
                          " +alpha=" + azimut_ +
                          " +gamma=0 +a=" + navigationSrsInfo_["a"] +
                          " +b=" + navigationSrsInfo_["b"] +
                          " +x_0=0 +y_0=0";

        coords_ = this.getNavigationSrs().convertCoordsFrom([0, distance_], projString_);
        */

        var geod = new GeographicLib.Geodesic.Geodesic(navigationSrsInfo_["a"],
                                                       (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

        var r = geod.Direct(coords_[1], coords_[0], azimut_, distance_);
        pos2_[1] = r.lon2;
        pos2_[2] = r.lat2;

        console.log("oldpos: " + JSON.stringify(pos_));
        console.log("newpos: " + JSON.stringify(pos2_));
    }

    return pos2_;
};

Melown.Map.prototype.update = function() {
    if (this.killed_ == true){
        return;
    }

    if (this.div_ != null && this.div_.style.visibility == "hidden"){
        //loop heartbeat
        window.requestAnimFrame(this.update.bind(this));
        return;
    }

    if (this.checkViewChange(this.navLastPos_)) {
        this.core_.callListener("map-position-changed", {"position":this.navCurrentPos_.slice()});
    }

    this.navLastPos_ = this.navCurrentPos_.slice();

    this.stats_.begin();

    var rect_ = this.renderer_.div_.getBoundingClientRect();

    if (this.renderer_.curSize_[0] != rect_.width || this.renderer_.curSize_[1] != rect_.height) {
        this.renderer_.onResize();
    }

    this.loader_.update();
    this.renderer_.gpu_.setViewport();

    this.updateCamera();
    this.renderer_.dirty_ = true;

    //this.cameraPosition_ = this.renderer_.cameraPosition();

    this.renderer_.paintGL();

    this.draw();

    this.stats_.end();

};
