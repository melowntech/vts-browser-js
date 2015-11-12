
/**
 * @constructor
 */
Melown.MapPosition = function(map_, pos_) {
    this.pos_ = new Array(9);
};

Melown.MapPosition.prototype.set = function(pos_) {
    this.pos_ = pos_;
    this.validate();
};

Melown.MapPosition.prototype.get = function() {
    return this.pos_;
};

Melown.MapPosition.prototype.getCenter = function() {
    return [this.pos_[1], this.pos_[2]];
};

Melown.MapPosition.prototype.setCenter = function(x ,y, z) {
    this.pos_[1] = x;
    this.pos_[2] = y;
};

Melown.MapPosition.prototype.setHeightMode = function(mode_) {
    this.pos_[4] = z;
};

Melown.MapPosition.prototype.getHeightMode = function() {
    return this.pos_[4];
};

Melown.MapPosition.prototype.getOrientation = function() {
    return [this.pos_[4], this.pos_[5], this.pos_[6]];
};

Melown.MapPosition.prototype.setOrientation = function(x, y, z) {
    this.pos_[5] = x;
    this.pos_[6] = y;
    this.pos_[7] = z;
};

Melown.MapPosition.prototype.getViewExtent = function() {
    return this.pos_[8];
};

Melown.MapPosition.prototype.setViewExtent = function() {
    this.pos_[8] = ;
};

Melown.MapPosition.prototype.getFov = function() {

};

Melown.MapPosition.prototype.setFov = function() {

};

Melown.MapPosition.prototype.convert = function(type_, height_) {

};

Melown.MapPosition.prototype.validate = function() {

    if (this.pos_[0] == "fixed") {
        this.pos_[0] = "obj";
        this.pos_[9] = this.pos_[8];
        this.pos_[8] = this.pos_[7];
        this.pos_[7] = this.pos_[6];
        this.pos_[6] = this.pos_[5];
        this.pos_[5] = this.pos_[4];
        this.pos_[4] = this.pos_[3];
        this.pos_[3] = "abs";
    }

};




