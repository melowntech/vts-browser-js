
Melown.Map.prototype.updateCamera = function() {

    var controlMode_ = "observer";
    var position_ = [0,0,0];

    this.updateCameraMatrix_ = Melown.mat4.create();
    this.navCameraRotation_[1] = Melown.clamp(this.navCameraRotation_[1], -90.0, 10.0);
    this.navCameraDistance_ = Melown.clamp(this.navCameraDistance_, 5, this.camera_.getFar());
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(this.navCameraRotation_[0])), Melown.rotationMatrix(0, Melown.radians(this.navCameraRotation_[1])), this.updateCameraMatrix_);

    //do not divide height by 2, probably because of screen has range from -1 to 1
    this.navCameraDistance_ = (this.navCameraViewHeight_) / Math.tan(Melown.radians(this.navFov_));

    var orbitPos_ = [0, -this.navCameraDistance_, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, orbitPos_);

    this.cameraVector_ = [0, 1, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, this.cameraVector_);

    this.camera_.setPosition(orbitPos_);
    this.camera_.setOrientation(this.navCameraRotation_);
    this.renderer_.cameraDistance_ = this.navCameraDistance_;

    this.camera_.setViewHeight(this.navCameraViewHeight_);
    //this.camera_.setOrtho(true);

    this.camera_.setParams(this.navFov_, this.renderer_.camera_.getNear(), this.renderer_.camera_.getFar());

    //var height_ = 227;
    var height_ = 232.2;

    //TODO: convert nav to world
    var worldPos_ = [this.navPos_[0], this.navPos_[1], height_];

    this.navCameraPosition_ = worldPos_;

    //auto far plane
    /*
    var far_ = this.camera_.getFar();

    var maxDistance_ = this.navCameraDistance_ * (Math.tan(this.camera_.getFov()*0.5) / this.camera_.getAspect());

    maxDistance_ *= Math.tan(Melown.radians(90+this.orientation_[1]*0.10));
    maxDistance_ = maxDistance_ > 9000000.0 ? 9000000.0 : maxDistance_;
    maxDistance_ = maxDistance_ < this.browser_.browserConfig_.cameraVisibility_ ? this.browser_.browserConfig_.cameraVisibility_ : maxDistance_;

    if (Math.abs(maxDistance_- far_) > 1.0) {
        this.camera_.setParams(this.camera_.getFov(), this.camera_.getNear(), maxDistance_);
    }
    */

    this.dirty_ = true;
};

Melown.Map.prototype.cameraHeight = function()
{
    //TODO: get camera height
    //var cameraPos_ = this.camera_.position_;
    //return (this.camera_.getPosition()[2] - this.planet_.surfaceHeight([this.position_[0] + cameraPos_[0], this.position_[1] + cameraPos_[1]])[0]);

    //hack - distance intead of height
    return this.navCameraDistance_;
};
