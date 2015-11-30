
/**
 * @constructor
 */
Melown.MapPosition = function(pos_) {
    this.pos_ = pos_;
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
};

Melown.MapPosition.prototype.setCoords2 = function(coords_) {
    this.pos_[1] = coords_[0];
    this.pos_[2] = coords_[1];
};

Melown.MapPosition.prototype.getOrientation = function() {
    return [this.pos_[5], this.pos_[6], this.pos_[7]];
};

Melown.MapPosition.prototype.setOrientation = function(orientation_) {
    this.pos_[5] = orientation_[0];
    this.pos_[6] = orientation_[1];
    this.pos_[7] = orientation_[2];
};

Melown.MapPosition.prototype.convertViewMode = function(mode_) {
};

Melown.MapPosition.prototype.convertHeightMode = function(mode_) {
};






