
var BBox = function(xmin, ymin, zmin, xmax, ymax, zmax) {
    this.min = [];
    this.max = [];

    this.min[0] = (xmin != null) ? xmin : Number.POSITIVE_INFINITY;
    this.min[1] = (ymin != null) ? ymin : Number.POSITIVE_INFINITY;
    this.min[2] = (zmin != null) ? zmin : Number.POSITIVE_INFINITY;

    this.max[0] = (xmax != null) ? xmax : Number.NEGATIVE_INFINITY;
    this.max[1] = (ymax != null) ? ymax : Number.NEGATIVE_INFINITY;
    this.max[2] = (zmax != null) ? zmax : Number.NEGATIVE_INFINITY;

    this.updateMaxSize();
};


BBox.prototype.clone = function() {
    return new BBox(this.min[0], this.min[1], this.min[2],
                    this.max[0], this.max[1], this.max[2]);
};


BBox.prototype.side = function(index) {
    return this.max[index] - this.min[index];
};


BBox.prototype.updateMaxSize = function() {
    this.maxSize = Math.abs(Math.max(this.max[0] - this.min[0],
                                     this.max[1] - this.min[1],
                                     this.max[2] - this.min[2]));
};


BBox.prototype.center = function(vec) {
    if (vec != null) {
        vec[0] = (this.min[0] + this.max[0])*0.5;
        vec[1] = (this.min[1] + this.max[1])*0.5;
        return vec;
    } else {
        if (!this.middle) {
            this.middle = [(this.min[0] + this.max[0])*0.5, (this.min[1] + this.max[1])*0.5, (this.min[2] + this.max[2])*0.5];

            if (isNaN(this.middle[0])) {
                this.middle[0] = 0;
            }

            if (isNaN(this.middle[1])) {
                this.middle[1] = 0;
            }

            if (isNaN(this.middle[2])) {
                this.middle[2] = 0;
            }
        } 

        return this.middle;
    }
};


BBox.prototype.translateXY = function(delta) {
    return new BBox(this.min[0] - delta[0], this.min[1] - delta[1], this.min[2],
                    this.max[0] - delta[0], this.max[1] - delta[1], this.max[2]);
};


export default BBox;

