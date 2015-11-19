/**
 * Photo class - specific Roi type class for rendering simple photo.
 * @constructor
 * @final
 * @extends {Melown.Roi}
 */
Melown.Roi.Photo = function(config_, core_, options_) {
    this.cubeTree_ = [];

    // config properties
    this.photoOrientation_ = null;
    this.imageSize_ = null;
    this.imageUrl_ = null;

    // claculated config properties
    this.photoMatrices_ = [];
    this.orientationMatrix_ = null;

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);
}

// Inheritance from Roi
Melown.Roi.Photo.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Photo.prototype.constructor = Melown.Roi.Photo;

// Register class to Roi type dictionary (used by Roi.Fetch function)
Melown.Roi.Type['photo'] = Melown.Roi.Photo;

// Protected methods

Melown.Roi.Pano.prototype._init = function() {
    // check browser instance
    // prepare UI

    this.super_._init.call(this);
}

Melown.Roi.Pano.prototype._processConfig = function() {
    this.super_._processConfig.call(this);

    if (this.state_ === Melown.Roi.State.Error) {
        return;
    }

    var err = null;
    if (typeof this.config_['photo'] !== 'object' 
        || this.config_['photo'] === null) {
        err = new Error('Missing (or type error) photo key in config JSON');
    } else if (!this.config_['photo']['orientation'] instanceof Array 
        || this.config_['photo']['orientation'].length !== 3) {
        err = new Error('Missing (or type error) photo.orientation in config JSON');
    } else if (!this.config_['photo']['imageSize'] instanceof Array 
        || this.config_['photo']['imageSize'].length !== 2) {
        err = new Error('Missing (or type error) photo.imageSize in config JSON');
    } else if (typeof this.config_['photo']['imageUrl'] !== 'string'
        ) { //|| !Melown.Utils.urlSanity(this.config_['photo']['imageUrl'])) {
        err = new Error('Missing (or type error) photo.imageUrl in config JSON');
    }

    if (err) {
        this.state_ = Melown.Roi.State.Error;
        console.error(err);
    } else {
        this.photoOrientation_ = this.config_['photo']['orientation'];
        this.imageSize_ = this.config_['photo']['imageSize'][0];
        this.tileTemplate_ = this.config_['photo']['imageUrl'];
    }
}

Melown.Roi.Pano.prototype._initFinalize = function() {
    this.super_._initFinalize.call(this);

    // orient photo
    this.orientationMatrix_ = Melown.mat4.create();
    var rotateZ = Melown.rotationMatrix(2, Melown.radians(-this.photoOrientation_[2]));
    var rotateY = Melown.rotationMatrix(1, Melown.radians(-this.photoOrientation_[1]));
    var rotateX = Melown.rotationMatrix(0, Melown.radians(-this.photoOrientation_[0]));
    Melown.mat4.multiply(this.orientationMatrix_, rotateZ, this.orientationMatrix_);
    Melown.mat4.multiply(this.orientationMatrix_, rotateY, this.orientationMatrix_);
    Melown.mat4.multiply(this.orientationMatrix_, rotateX, this.orientationMatrix_);
}

Melown.Roi.Pano.prototype._tick = function() {
    this.super_._tick.call(this);

}

Melown.Roi.Pano.prototype._update = function() {
    this.super_._update.call(this);

    // TODO

    // set draw dirty flag (cube will be redraw in next tick)
    this.needsRedraw_ = true;
}

Melown.Roi.Pano.prototype._draw = function() {
    
    if (!this.map_) {
        return;
    }

    // TODO
}
