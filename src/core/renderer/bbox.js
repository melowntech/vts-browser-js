
var BBox = function(xmin, ymin, zmin, xmax, ymax, zmax) {
    this.min = [];
    this.max = [];

    this.min[0] = (xmin != null) ? xmin : Number.POSITIVEINFINITY;
    this.min[1] = (ymin != null) ? ymin : Number.POSITIVEINFINITY;
    this.min[2] = (zmin != null) ? zmin : Number.POSITIVEINFINITY;

    this.max[0] = (xmax != null) ? xmax : Number.NEGATIVEINFINITY;
    this.max[1] = (ymax != null) ? ymax : Number.NEGATIVEINFINITY;
    this.max[2] = (zmax != null) ? zmax : Number.NEGATIVEINFINITY;

    /*
    this.maxSize = Math.max(this.max[0] - this.min[0],
                             this.max[1] - this.min[1],
                             this.max[2] - this.min[2]);*/
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
        return [(this.min[0] + this.max[0])*0.5, (this.min[1] + this.max[1])*0.5, (this.min[2] + this.max[2])*0.5];
    }
};


BBox.prototype.translateXY = function(delta) {
    return new BBox(this.min[0] - delta[0], this.min[1] - delta[1], this.min[2],
                    this.max[0] - delta[0], this.max[1] - delta[1], this.max[2]);
};


export default BBox;

