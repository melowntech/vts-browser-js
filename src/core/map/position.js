
import {math as math_} from '../utils/math';

//get rid of compiler mess
var math = math_;

var MapPosition = function(pos) {
    if (pos instanceof MapPosition) {
        this.pos = pos.pos.slice();
    } else {
        if (!(pos != null && (pos instanceof Array))) {
            this.pos = [];
        } else {
            this.pos = pos.slice();
        }

        this.validate();
    }
};


MapPosition.prototype.clone = function() {
    return new MapPosition(this.pos);
};


MapPosition.prototype.getCoords = function() {
    return [this.pos[1], this.pos[2], this.pos[4]];
};


MapPosition.prototype.getCoords2 = function() {
    return [this.pos[1], this.pos[2]];
};


MapPosition.prototype.setCoords = function(coords) {
    this.pos[1] = coords[0];
    this.pos[2] = coords[1];
    this.pos[4] = coords[2];
    return this;
};


MapPosition.prototype.setCoords2 = function(coords) {
    this.pos[1] = coords[0];
    this.pos[2] = coords[1];
    return this;
};


MapPosition.prototype.getHeight = function() {
    return this.pos[4];
};


MapPosition.prototype.setHeight = function(height) {
    this.pos[4] = height;
    return this;
};


MapPosition.prototype.getOrientation = function() {
    return [this.pos[5], this.pos[6], this.pos[7]];
};


MapPosition.prototype.setOrientation = function(orientation) {
    this.pos[5] = orientation[0];
    this.pos[6] = orientation[1];
    this.pos[7] = orientation[2];
    return this;
};


MapPosition.prototype.getFov = function() {
    return this.pos[9];
};


MapPosition.prototype.setFov = function(fov) {
    this.pos[9] = fov;
    return this;
};


MapPosition.prototype.getViewExtent = function() {
    return this.pos[8];
};


MapPosition.prototype.setViewExtent = function(extent) {
    this.pos[8] = extent;
    return this;
};


MapPosition.prototype.getViewDistance = function() {
    return (this.getViewExtent()*0.5) / Math.tan(math.radians(this.getFov()*0.5));
};


MapPosition.prototype.getViewMode = function() {
    return this.pos[0];
};


MapPosition.prototype.getHeightMode = function() {
    return this.pos[3];
};


MapPosition.prototype.check = function() {
    //check pich
    if (this.getViewMode() == 'obj') {
        this.pos[6] = math.clamp(this.pos[6], -90.0, 90.0);
    } else {
        this.pos[6] = math.clamp(this.pos[6], -90.0, 90.0);
    }

    this.pos[5] = this.pos[5] % 360;
    this.pos[7] = this.pos[7] % 360;
};


MapPosition.prototype.isSame = function(pos) {
    pos = pos.pos;
    return (this.pos[0] == pos[0] &&
             math.isEqual(this.pos[1], pos[1], 0.0000001) &&
             math.isEqual(this.pos[2], pos[2], 0.0000001) &&
             this.pos[3] == pos[3] &&
             math.isEqual(this.pos[4], pos[4], 0.001) &&
             math.isEqual(this.pos[5], pos[5], 0.001) &&
             math.isEqual(this.pos[6], pos[6], 0.001) &&
             math.isEqual(this.pos[7], pos[7], 0.001) &&
             math.isEqual(this.pos[8], pos[8], 0.001) &&
             math.isEqual(this.pos[9], pos[9], 0.001));
};


MapPosition.prototype.validate = function() {
    var pos = this.pos;
    if (pos[0] == 'fixed') { //old format
        pos[0] = 'obj';
        pos[9] = pos[8];
        pos[8] = pos[7];
        pos[7] = pos[6];
        pos[6] = pos[5];
        pos[5] = pos[4];
        pos[4] = pos[3];
        pos[3] = 'fix';
    }

    pos[0] = (pos[0] == 'obj' || pos[0] == 'subj') ? pos[0] : 'obj';
    pos[1] = (pos[1] != null) ? pos[1] : 0;
    pos[2] = (pos[2] != null) ? pos[2] : 0;
    pos[3] = (pos[3] == 'fix' || pos[3] == 'fixed' || pos[3] == 'float') ? pos[3] : 'float';
    pos[4] = (pos[4] != null) ? pos[4] : 0;
    pos[5] = (pos[5] != null) ? pos[5] : 0;
    pos[6] = (pos[6] != null) ? pos[6] : -90;
    pos[7] = (pos[7] != null) ? pos[7] : 0;
    pos[8] = (pos[8] != null) ? pos[8] : 900;
    pos[9] = (pos[9] != null) ? pos[9] : 45;

    pos[3] = (pos[3] == 'fixed') ? 'fix' : pos[3];
};


MapPosition.prototype.toString = function() {
    var p = this.pos;
    return p[0] + ', ' + p[1].toFixed(0) + ', ' + p[2].toFixed(0) + ', ' + p[3] + ', ' + p[4].toFixed(0)
           + ', ' + p[5].toFixed(0) + ', ' + p[6].toFixed(0) + ', ' + p[7].toFixed(0) + ', ' 
           + ', ' + p[8].toFixed(0) + ', ' + p[9].toFixed(0); 
};


MapPosition.prototype.toArray = function() {
    return this.pos.slice();
};


export default MapPosition;
