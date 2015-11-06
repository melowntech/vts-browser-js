/** @const */ var Melown_STILE_METADATA = 0;
/** @const */ var Melown_STILE_MESH = 1;
/** @const */ var Melown_STILE_TEXTURE = 2;
/** @const */ var Melown_STILE_HEIGHT = 3;

/**
 * @constructor
 */
Melown.Map = function(core_, mapConfig_, path_)
{
    this.core_ = core_;
    this.mapConfig_ = mapConfig_;
    this.coreConfig_ = core_.coreConfig_;
    this.killed_ = false;
    this.urlCounter_ = 0;

    this.baseURL_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    //this.mapConfig_["view"] = { "surfaces": ["ppspace"], "boundLayers": [], "freeLayers": [] };

    this.navFov_ = 45;
    this.navPos_ = [0,0];
    this.navHeight_ = 0;
    this.navTerrainHeight_ = 0;
    this.navTerrainHeightUnknown_ = true;
    this.navCameraViewHeight_ = 1;
    this.navCameraDistance_ = 0;
    this.navCameraRotation_ = [0,0,0];
    this.navCameraPosition_ = [0,0,0];
    this.navHeightMode_ = "fixed";

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

    //this.mesh_ = new Melown.MapMesh(this);
    //this.mesh_.load("http://pomerol.internal:8889/vasek-output/vts/jenstejn.ppspace/18-130382-129149.bin");

    this.proj4_ = this.core_.getProj4();
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

Melown.Map.prototype.setPosition = function(pos_) {
    this.navPos_ = [pos_[0], pos_[1]];
    this.navTerrainHeightUnknown_ = true;
    this.dirty_ = true;
};

Melown.Map.prototype.getPosition = function() {
    return [ this.navPos_[0], this.navPos_[1], this.navCameraDistance_ ];
};

Melown.Map.prototype.pan = function(pos_, dx_ ,dy_) {
    var pos2_ = pos_.slice();

    var zoomFactor_ = (this.getViewHeight() * Math.tan(Melown.radians(this.camera_.getFov()))) / 800;

    dx_ *= zoomFactor_;
    dy_ *= zoomFactor_;

    var yaw_ = Melown.radians(this.getOrientation()[0]);

    var forward_ = [-Math.sin(yaw_), Math.cos(yaw_)];
    var aside_ = [Math.cos(yaw_), Math.sin(yaw_)];

    pos2_[1] += forward_[0]*dy_ - aside_[0]*dx_;
    pos2_[2] += forward_[1]*dy_ - aside_[1]*dx_;

    return pos2_;
};

Melown.Map.prototype.setOrientation = function(orientation_) {
    this.navCameraRotation_ = orientation_.slice();
    this.dirty_ = true;
};

Melown.Map.prototype.getOrientation = function() {
    return this.navCameraRotation_.slice();
};

Melown.Map.prototype.setFov = function(fov_) {
    this.navFov_ = fov_;
    this.dirty_ = true;
};

Melown.Map.prototype.getFov = function() {
    return this.navFov_;
};

Melown.Map.prototype.setViewHeight = function(height_) {
    this.navCameraViewHeight_ = height_;
    this.dirty_ = true;
};

Melown.Map.prototype.getViewHeight = function() {
    return this.navCameraViewHeight_;
};

/*
Melown.Map.prototype.setDistance = function(distance_) {
    this.navCameraDistance_ = distance_;
    this.dirty_ = true;
};

Melown.Map.prototype.getDistance = function() {
    return this.navCameraDistance_;
};
*/

Melown.Map.prototype.setHeight = function(height_) {
    this.navHeight_ = height_;
    this.dirty_ = true;
};

Melown.Map.prototype.getHeight = function() {
    return this.navHeight_;
};

Melown.Map.prototype.setHeightMode = function(height_) {
    this.navHeight_ = height_;
    this.dirty_ = true;
};

Melown.Map.prototype.getHeightMode = function() {
    return this.navHeight_;
};


Melown.Map.prototype.setCameraView = function(cameraView_) {
    if (cameraView_[0] == "float") {
        //TODO: conver public SRS pos to nav SRS pos
        //this.proj4_
    }

    this.navMode_ = cameraView_[0];
    this.setFov((cameraView_[8] || 90) * 0.5);
    this.setPosition([cameraView_[1], cameraView_[2]]);
    this.setHeight(cameraView_[3]);
    this.setOrientation([cameraView_[4], cameraView_[5], cameraView_[6]]);
    this.setViewHeight(cameraView_[7]);
    //this.setDistance((cameraView_[7] * 0.5) / Math.tan(Melown.radians(this.navFov_)));
    this.navTerrainHeight_ = 0;
};

Melown.Map.prototype.getCameraView = function(cameraViewType_) {
    var view_ = [];

    switch (cameraViewType_) {
        case "fixed":
        case "float":
        case "look":
    }

    return ["fixed",
            this.navPos_[0],
            this.navPos_[1],
            this.navHeight_,
            this.navCameraRotation_[0],
            this.navCameraRotation_[1],
            this.navCameraRotation_[2],
            this.navCameraViewHeight_,
            this.navFov_ = 45
            ];
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
