
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

Melown.MapPosition.prototype.getViewMode = function(mode_) {
    return this.pos_[0];
};

Melown.MapPosition.prototype.setViewMode = function(mode_) {
    //TODO: convert
    this.pos_[0] = mode_;
    return this;
};

Melown.MapPosition.prototype.getHeightMode = function(mode_) {
    return this.pos_[3];
};

Melown.MapPosition.prototype.setHeightMode = function(mode_) {
    //TODO: convert
    this.pos_[3] = mode_;
    return this;
};

Melown.MapPosition.prototype.convertHeightMode = function(mode_) {
    //TODO: convert
    this.pos_[3] = mode_;
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
    pos_[3] = (pos_[3] == "fix" || pos_[3] == "float") ? pos_[3] : "float";
    pos_[4] = pos_[4] || 0;
    pos_[5] = pos_[5] || 0;
    pos_[6] = pos_[6] || 0;
    pos_[7] = pos_[7] || 0;
    pos_[8] = pos_[8] || 300;
    pos_[9] = pos_[9] || 90;
};





