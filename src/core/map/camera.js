
Melown.Map.prototype.updateCamera = function() {
    var controlMode_ = "observer";
    var position_ = [0,0,0];
    var orientation_ = this.position_.getOrientation();

    this.updateCameraMatrix_ = Melown.mat4.create();

    //check position orientaion ...
    this.position_.check();

    //var height_ = 227;
    var height_ = this.position_.getHeight();

    var lod_ =  this.getOptimalHeightLod(this.position_.getCoords(), this.position_.getViewExtent(), this.config_.mapNavSamplesPerViewExtent_);
    //var surfaceHeight_ = [226,true,true]; //this.getSurfaceHeight(this.position_.getCoords(), lod_, true);
    var surfaceHeight_ = this.getSurfaceHeight(this.position_.getCoords(), lod_, true);
    
    this.stats_.heightTerrain_ = surfaceHeight_[0];
    this.stats_.heightDelta_ = height_;

    //console.log("terrain height:" + surfaceHeight_[0] + "  pos height:" + this.position_.getHeight());

    if (this.position_.getHeightMode() == "float") {
        height_ += surfaceHeight_[0];
    }

    var camInfo_ = this.position_.getCameraInfo(this.getNavigationSrs().isProjected());

    this.camera_.setPosition(camInfo_.orbitCoords_);
    this.camera_.setRotationMatrix(camInfo_.rotMatrix_);
    this.cameraVector_ = camInfo_.vector_;
    this.cameraVector2_ = camInfo_.vector2_;
    this.cameraPosition_ = camInfo_.orbitCoords_;
    this.cameraHeight_ = camInfo_.orbitHeight_ + height_;
    this.cameraTerrainHeight_ = this.cameraHeight_ - surfaceHeight_[0];

    //get camera distance
    this.cameraDistance2_ = this.position_.getViewDistance();
    this.cameraDistance_ = Math.max(this.cameraTerrainHeight_, this.cameraDistance2_);
    this.cameraDistance_ = Melown.clamp(this.cameraDistance_, 0.1, this.camera_.getFar());
    
    //this.renderer_.cameraDistance_ = camInfo_.distance_; //needed for fog
    this.renderer_.cameraDistance_ = this.cameraDistance_; //needed for fog

    if (!this.getNavigationSrs().isProjected()) { //HACK!!!!!!!!
        //this.position_.setHeight(0);
    }

    this.camera_.setViewHeight(this.position_.getViewExtent());
    //this.camera_.setOrtho(true);

    //convert public coords to physical
    var worldPos_ = this.convertCoords([this.position_.getCoords()[0], this.position_.getCoords()[1], height_], "navigation", "physical");
    this.cameraCenter_ = [worldPos_[0], worldPos_[1], worldPos_[2]];
	worldPos_[0] += camInfo_.orbitCoords_[0];
	worldPos_[1] += camInfo_.orbitCoords_[1];
	worldPos_[2] += camInfo_.orbitCoords_[2];
    this.camera_.setPosition([0,0,0]); //always zeros
    this.cameraPosition_ = worldPos_;
    
    //console.log("word-pos: " + JSON.stringify(worldPos_));

    //set near and far of camera by distance of orbit
    var factor_ = Math.max(this.cameraHeight_, this.cameraDistance_) / 600000;

    var near_ = Math.max(2, 2 * (factor_ * 20));
    factor_ = Math.max(1.0, factor_);
    var far_ = 600000 * (factor_ * 10);

    //console.log("near: " + near_ + "  far: " + far_);

    this.camera_.setParams(this.position_.getFov()*0.5, near_, far_ * 2.0);
    
    return camInfo_;
};

Melown.Map.prototype.cameraHeight = function() {
    //TODO: get camera height
    //var cameraPos_ = this.camera_.position_;
    //return (this.camera_.getPosition()[2] - this.planet_.surfaceHeight([this.position_[0] + cameraPos_[0], this.position_[1] + cameraPos_[1]])[0]);

    //hack - distance intead of height
    //return this.cameraDistance_;
    return this.cameraHeight_;
};




