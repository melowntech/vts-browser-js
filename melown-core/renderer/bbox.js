/**
 * @constructor
 */
Melown.BBox = function(xmin_, ymin_, zmin_, xmax_, ymax_, zmax_) {
    this.min_ = [];
    this.max_ = [];

    this.min_[0] = (xmin_ != null) ? xmin_ : Number.POSITIVE_INFINITY;
    this.min_[1] = (ymin_ != null) ? ymin_ : Number.POSITIVE_INFINITY;
    this.min_[2] = (zmin_ != null) ? zmin_ : Number.POSITIVE_INFINITY;

    this.max_[0] = (xmax_ != null) ? xmax_ : Number.NEGATIVE_INFINITY;
    this.max_[1] = (ymax_ != null) ? ymax_ : Number.NEGATIVE_INFINITY;
    this.max_[2] = (zmax_ != null) ? zmax_ : Number.NEGATIVE_INFINITY;

    /*
    this.maxSize_ = Math.max(this.max_[0] - this.min_[0],
                             this.max_[1] - this.min_[1],
                             this.max_[2] - this.min_[2]);*/
    this.updateMaxSize();
};

Melown.BBox.prototype.clone = function() {
    return new Melown.BBox(this.min_[0], this.min_[1], this.min_[2],
                           this.max_[0], this.max_[1], this.max_[2]);
};

Melown.BBox.prototype.side = function(index_) {
    return this.max_[index_] - this.min_[index_];
};

Melown.BBox.prototype.updateMaxSize = function(index_) {
    this.maxSize_ = Math.abs(Math.max(this.max_[0] - this.min_[0],
                                      this.max_[1] - this.min_[1],
                                      this.max_[2] - this.min_[2]));
};

Melown.BBox.prototype.center = function(vec_) {
    if (vec_ != null) {
        vec_[0] = (this.min_[0] + this.max_[0])*0.5;
        vec_[1] = (this.min_[1] + this.max_[1])*0.5;
        return vec_;
    } else {
        return [(this.min_[0] + this.max_[0])*0.5, (this.min_[1] + this.max_[1])*0.5, (this.min_[2] + this.max_[2])*0.5];
    }
};

Melown.BBox.prototype.translateXY = function(delta_) {
    return new Melown.BBox(this.min_[0] - delta_[0], this.min_[1] - delta_[1], this.min_[2],
                           this.max_[0] - delta_[0], this.max_[1] - delta_[1], this.max_[2]);
};
