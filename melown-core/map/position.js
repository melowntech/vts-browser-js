
/**
 * @constructor
 */
Melown.MapPosition = function(map_, pos_) {
    this.map_ = map_;
    if (this.pos_ instanceof Melown.MapPosition) {
        this.pos_ = pos_.pos_.slice();
    } else {
        if (!(pos_ != null && (pos_ instanceof Array))) {
            this.pos_ = [];
        } else {
            this.pos_ = pos_.slice();
        }

        this.validate();
    }
};

Melown.MapPosition.prototype.clone = function() {
    return new Melown.MapPosition(this.map_, this.pos_);
};

Melown.MapPosition.prototype.getCoords = function() {
    return [this.pos_[1], this.pos_[2], this.pos_[4]];
};

Melown.MapPosition.prototype.getCoords2 = function() {
    return [this.pos_[1], this.pos_[2]];
};

Melown.MapPosition.prototype.setCoords = function(coords_) {
    this.pos_[1] = coords_[0];
    this.pos_[2] = coords_[1];
    this.pos_[3] = coords_[2];
    return this;
};

Melown.MapPosition.prototype.setCoords2 = function(coords_) {
    this.pos_[1] = coords_[0];
    this.pos_[2] = coords_[1];
    return this;
};

Melown.MapPosition.prototype.getHeight = function() {
    return this.pos_[4];
};

Melown.MapPosition.prototype.setHeight = function(height_) {
    this.pos_[4] = height_;
    return this;
};

Melown.MapPosition.prototype.getOrientation = function() {
    return [this.pos_[5], this.pos_[6], this.pos_[7]];
};

Melown.MapPosition.prototype.setOrientation = function(orientation_) {
    this.pos_[5] = orientation_[0];
    this.pos_[6] = orientation_[1];
    this.pos_[7] = orientation_[2];
    return this;
};

Melown.MapPosition.prototype.getFov = function() {
    return this.pos_[9];
};

Melown.MapPosition.prototype.setFov = function(fov_) {
    this.pos_[9] = fov_;
    return this;
};

Melown.MapPosition.prototype.getViewExtent = function() {
    return this.pos_[8];
};

Melown.MapPosition.prototype.setViewExtent = function(extent_) {
    this.pos_[8] = extent_;
    return this;
};

Melown.MapPosition.prototype.getViewMode = function() {
    return this.pos_[0];
};

Melown.MapPosition.prototype.setViewMode = function(mode_) {
    //TODO: convert
    this.pos_[0] = mode_;
    return this;
};

Melown.MapPosition.prototype.getHeightMode = function() {
    return this.pos_[3];
};

Melown.MapPosition.prototype.setHeightMode = function(mode_) {
    //TODO: convert
    this.pos_[3] = mode_;
    return this;
};

Melown.MapPosition.prototype.convertViewMode = function(mode_) {
    if (mode_ == this.pos_[0]) {
        return this;
    }

    if (mode_ == "obj") {

    } else if (mode_ == "subj") {
        var coords_ = this.cameraCoords(this.getHeightMode());
        this.setCoords(coords_);
    }

    return this;
};

Melown.MapPosition.prototype.convertHeightMode = function(mode_) {
    if (this.pos_[3] == mode_) {
        return this;
    }

    var lod_ =  this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
    var height_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);

    if (height_[1] == false) {
        return null;
    }

    //set new height
    if (mode_ == "float") {
        this.pos_[3] = mode_;
        this.pos_[4] = this.pos_[4] - height_[0];
    } else if (mode_ == "fix") {
        this.pos_[3] = mode_;
        this.pos_[4] = this.pos_[4] + height_[0];
    }

    return this;
};


Melown.MapPosition.prototype.convertSrs = function(sourceSrs_, destinationSrs_) {
};

Melown.MapPosition.prototype.convertSrs2 = function(sourceSrs_, destinationSrs_) {
};

Melown.MapPosition.prototype.isDifferent = function(pos_) {
    var pos_ = pos_.pos_;
    return !(this.pos_[0] == pos_[0] &&
             Melown.isEqual(this.pos_[1], pos_[1], 0.0000001) &&
             Melown.isEqual(this.pos_[2], pos_[2], 0.0000001) &&
             this.pos_[3] == pos_[3] &&
             Melown.isEqual(this.pos_[4], pos_[4], 0.001) &&
             Melown.isEqual(this.pos_[5], pos_[5], 0.001) &&
             Melown.isEqual(this.pos_[6], pos_[6], 0.001) &&
             Melown.isEqual(this.pos_[7], pos_[7], 0.001) &&
             Melown.isEqual(this.pos_[8], pos_[8], 0.001) &&
             Melown.isEqual(this.pos_[9], pos_[9], 0.001));
};

Melown.MapPosition.prototype.validate = function() {
    var pos_ = this.pos_;
    if (pos_[0] == "fixed") { //old format
        pos_[0] = "obj";
        pos_[9] = pos_[8];
        pos_[8] = pos_[7];
        pos_[7] = pos_[6];
        pos_[6] = pos_[5];
        pos_[5] = pos_[4];
        pos_[4] = pos_[3];
        pos_[3] = "fix";
    }

    pos_[0] = (pos_[0] == "obj" || pos_[0] == "subj") ? pos_[0] : "obj";
    pos_[1] = pos_[1] || 0;
    pos_[2] = pos_[2] || 0;
    pos_[3] = (pos_[3] == "fix" || pos_[3] == "fixed" || pos_[3] == "float") ? pos_[3] : "float";
    pos_[4] = pos_[4] || 0;
    pos_[5] = pos_[5] || 0;
    pos_[6] = pos_[6] || 0;
    pos_[7] = pos_[7] || 0;
    pos_[8] = pos_[8] || 300;
    pos_[9] = pos_[9] || 90;

    pos_[3] = (pos_[3] == "fixed") ? "fix" : pos_[3];
};

Melown.MapPosition.prototype.cameraCoords = function(heightMode_) {
    var rotMatrix_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(orientation_[0])), Melown.rotationMatrix(0, Melown.radians(orientation_[1])), rotMatrix_);

    if (this.getViewMode() == "obj") {
        var distance_ = (this.getViewExtent()) / Math.tan(Melown.radians(this.getFov()*0.5));
        var orbitPos_ = [0, -distance_, 0];

        if (this.map_.getNavigationSrs().isProjected()) {
            Melown.mat4.multiplyVec3(rotMatrix_, orbitPos_);
        } else {

        }

        var coords_ = this.getCoords();
        coords_[0] += orbitPos_[0];
        coords_[1] += orbitPos_[1];
        coords_[2] += orbitPos_[2];

        //convert height to fix
        if (this.getHeightMode() == "float") {
            var lod_ =  this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
            var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
            coords_[2] += surfaceHeight_[0];
        }

        if (heightMode_ == "fix") {
            return coords_;
        } else {
            //get float height for new coords
            var lod_ =  this.map_.getOptimalHeightLod(coords_, this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
            var surfaceHeight_ = this.map_.getSurfaceHeight(coords_, lod_);
            coords_[2] -= surfaceHeight_[0];

            return coords_;
        }

    } else {

        if (this.getHeightMode() == heightMode_) {
            return this.getCoords();
        } else {
            var height_ = this.getHeight();

            if (heightMode_ == "fix") {
                var lod_ =  this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
                var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
                height_ += surfaceHeight_[0];

                var coords_ = this.getCoords();
                coords_[2] += surfaceHeight_[0];
            }

            return coords_;
        }
    }
};

Melown.MapPosition.prototype.getCanvasCoords = function() {
	var coords_ = this.getCoords();

    if (this.getHeightMode() == "float") {
        var lod_ =  this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
        var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
    	coords_[2] += surfaceHeight_[0]; 
	}

    var worldPos_ = this.map_.convertCoords(coords_, "navigation", "physical");
    var camPos_ = this.map_.cameraPosition_;
	worldPos_[0] -= camPos_[0];
	worldPos_[1] -= camPos_[1];
	worldPos_[2] -= camPos_[2];

	return this.map_.renderer_.project2(worldPos_, this.map_.camera_.getMvpMatrix());
};









