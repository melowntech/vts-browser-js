
Melown.Map.prototype.updateCamera = function() {
    var controlMode_ = "observer";
    var position_ = [0,0,0];
    var orientation_ = this.position_.getOrientation();

    this.updateCameraMatrix_ = Melown.mat4.create();

    //check orietation extents
    if (this.position_.getViewMode() == "obj") {
        orientation_[1] = Melown.clamp(orientation_[1], -90.0, 10.0);
    } else {
        orientation_[1] = Melown.clamp(orientation_[1], -90.0, 90.0);
    }

    this.position_.setOrientation(orientation_);

    this.cameraDistance_ = Melown.clamp(this.cameraDistance_, 5, this.camera_.getFar());
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(orientation_[0])), Melown.rotationMatrix(0, Melown.radians(orientation_[1])), this.updateCameraMatrix_);

    //do not divide height by 2, probably because of screen has range from -1 to 1
    this.cameraDistance_ = (this.position_.getViewExtent()) / Math.tan(Melown.radians(this.position_.getFov()*0.5));

    var orbitPos_ = [0, -this.cameraDistance_, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, orbitPos_);

    this.cameraVector_ = [0, 1, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, this.cameraVector_);

    this.camera_.setPosition(orbitPos_);
    this.camera_.setOrientation(orientation_);
    this.renderer_.cameraDistance_ = this.cameraDistance_;

    this.camera_.setViewHeight(this.position_.getViewExtent());
    //this.camera_.setOrtho(true);

    this.camera_.setParams(this.position_.getFov()*0.5, this.renderer_.camera_.getNear(), this.renderer_.camera_.getFar());

    //var height_ = 227;
    var height_ = this.position_.getHeight();//232.2;
    var height2_ = this.getSurfaceHeight(this.position_.getCoords(), 11);

    //convert public coords to physical
    var worldPos_ = this.convertCoords([this.position_.getCoords()[0], this.position_.getCoords()[1], height_], "navigation", "physical");

    //var worldPos_ = [this.position_.getCoords()[0], this.position_.getCoords()[1], height_];

    console.log("height: " + JSON.stringify(height2_));

    this.cameraPosition_ = worldPos_;

    //auto far plane
    /*
    var far_ = this.camera_.getFar();

    var maxDistance_ = this.cameraDistance_ * (Math.tan(this.camera_.getFov()*0.5) / this.camera_.getAspect());

    maxDistance_ *= Math.tan(Melown.radians(90+this.orientation_[1]*0.10));
    maxDistance_ = maxDistance_ > 9000000.0 ? 9000000.0 : maxDistance_;
    maxDistance_ = maxDistance_ < this.core_.coreConfig_.cameraVisibility_ ? this.core_.coreConfig_.cameraVisibility_ : maxDistance_;

    if (Math.abs(maxDistance_- far_) > 1.0) {
        this.camera_.setParams(this.camera_.getFov(), this.camera_.getNear(), maxDistance_);
    }
    */

    this.dirty_ = true;
};

Melown.Map.prototype.cameraHeight = function() {
    //TODO: get camera height
    //var cameraPos_ = this.camera_.position_;
    //return (this.camera_.getPosition()[2] - this.planet_.surfaceHeight([this.position_[0] + cameraPos_[0], this.position_[1] + cameraPos_[1]])[0]);

    //hack - distance intead of height
    return this.cameraDistance_;
};
