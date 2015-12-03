Melown.Roi.Pano.Tile = function(face_, position_, index_, lod_, scale_, url_) {
    this.face_ = face_;
    this.position_ = [position_[0], position_[1]];
    this.index_ = [index_[0], index_[1]];
    this.lod_ = lod_;
    this.scale_ = scale_;
    this.mat_ = null;
    this.children_ = [];
    this.resources_ = {
        url_ : url_,
        image_ : null,
        texture_ : null
    };
};

Melown.Roi.Pano.Tile.prototype.applendChild = function(tile_) {
    this.children_.push(tile_);
};

Melown.Roi.Pano.Tile.prototype.url = function() {
    return this.resources_.url_;
};

Melown.Roi.Pano.Tile.prototype.image = function(image_) {
    if (image_ === undefined) {
        return this.resources_.image_
    }
    this.resources_.image_ = image_;
};

Melown.Roi.Pano.Tile.prototype.texture = function(texture_) {
    if (texture_ === undefined) {
        return this.resources_.texture_
    }
    this.resources_.texture_ = texture_;
};
