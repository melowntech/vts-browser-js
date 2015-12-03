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
    this.texture_ = null;
    this.image_ = null;

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);

    this.defaultControlMode_ = 'disabled';
};

// Inheritance from Roi
Melown.Roi.Photo.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Photo.prototype.constructor = Melown.Roi.Photo;

// Register class to Roi type dictionary (used by Roi.Fetch function)
Melown.Roi.Type['photo'] = Melown.Roi.Photo;

// Protected methods

Melown.Roi.Photo.prototype._init = function() {
    // check browser instance
    // prepare UI

    this.super_._init.call(this);
};

Melown.Roi.Photo.prototype._processConfig = function() {
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
        this.imageSize_ = this.config_['photo']['imageSize'];
        this.imageUrl_ = this.config_['photo']['imageUrl'];
    }
};

Melown.Roi.Photo.prototype._initFinalize = function() {
    this.super_._initFinalize.call(this);

    // load texture
    this.image_ = Melown.Http.imageFactory(this.imageUrl_, function(data_) {
        this.texture_ = this.renderer_.createTexture({source : this.image_});
        this.image_ = null;
    }.bind(this), function(err_) {
        this.image_ = null;
        this.state_ = Melown.Roi.State.Error;
        console.error(err_);
    }.bind(this));

    // orient photo
    this.orientationMatrix_ = Melown.rotationMatrix(2, Melown.radians(-this.photoOrientation_[2]));
    var rotateY = Melown.rotationMatrix(1, Melown.radians(-this.photoOrientation_[1]));
    var rotateX = Melown.rotationMatrix(0, Melown.radians(-this.photoOrientation_[0]));
    Melown.mat4.multiply(this.orientationMatrix_, rotateY, this.orientationMatrix_);
    Melown.mat4.multiply(this.orientationMatrix_, rotateX, this.orientationMatrix_);
};

Melown.Roi.Photo.prototype._tick = function() {
    this.super_._tick.call(this);

};

Melown.Roi.Photo.prototype._update = function() {
    this.super_._update.call(this);

    // TODO

    // set draw dirty flag (cube will be redraw in next tick)
    this.needsRedraw_ = true;
};

Melown.Roi.Photo.prototype._draw = function() {
    if (this.state_ !== Melown.Roi.State.FadingIn
        && this.state_ !== Melown.Roi.State.FadingOut
        && this.state_ !== Melown.Roi.State.Presenting) {
        return;
    }

    if (!this.map_ || !this.texture_) {
        return;
    }

    //  projection-view matrix from map.getCamera()
    var cam_ = this.map_.getCameraInfo();
    var pv_ = cam_['view-projection-matrix'];

    var mvp_ = Melown.mat4.create();
    Melown.mat4.identity(mvp_);

    var trn_ = Melown.translationMatrix(-0.5, -0.5, 0);
    Melown.mat4.multiply(trn_, mvp_, mvp_);

    var rot_ = Melown.rotationMatrix(0, Melown.radians(180));
    Melown.mat4.multiply(rot_, mvp_, mvp_);

    var w = window;
    var d = document;
    var e = d.documentElement;
    var g = d.getElementsByTagName('body')[0];
    var x = w.innerWidth || e.clientWidth || g.clientWidth;
    var y = w.innerHeight|| e.clientHeight|| g.clientHeight;


    var sclFacs = [2.2, 2.2];
    sclFacs[0] = sclFacs[1] * (y/x);
    if (this.imageSize_[0] > this.imageSize_[1]) {
        sclFacs[0] = sclFacs[0]*(this.imageSize_[0]/this.imageSize_[1]);
    } else {
        sclFacs[1] = sclFacs[1]*(this.imageSize_[1]/this.imageSize_[0]);
    }
    var scl_ = Melown.scaleMatrix(sclFacs[0],sclFacs[1],1);
    //Melown.mat4.multiply(tile_.mat_, mvp_, mvp_);
    Melown.mat4.multiply(scl_, mvp_, mvp_);

    // draw tile
    opts_ = {};
    opts_["mvp"] = mvp_;
    opts_["texture"] = this.texture_;
    opts_["color"] = [255, 255, 255, this.alpha_*255];
    opts_["blend"] = (this.alpha_ < 1.0);
    this.renderer_.drawBillboard(opts_);
};
