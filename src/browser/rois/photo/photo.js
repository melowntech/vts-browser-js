
import {utils as utils_} from '../../../core/utils/utils';
import {math as math_} from '../../../core/utils/math';
import {mat4 as mat4_} from '../../../core/utils/matrix';

//get rid of compiler mess
var utils = utils_;
var math = math_;
var mat4 = mat4_;


/**
 * Photo class - specific Roi type class for rendering simple photo.
 * @constructor
 * @final
 * @extends {Roi}
 */
var RoiPhoto = function(config, core, options) {
    this.cubeTree = [];

    // config properties
    this.photoOrientation = null;
    this.imageSize = null;
    this.imageUrl = null;

    // claculated config properties
    this.photoMatrices = [];
    this.orientationMatrix = null;
    this.texture = null;
    this.image = null;

    this.super = Roi.prototype;
    Roi.call(this, config, core, options);

    this.defaultControlMode = 'disabled';
};

// Inheritance from Roi
RoiPhoto.prototype = Object.create(Roi.prototype);
RoiPhoto.prototype.constructor = RoiPhoto;

// Protected methods

RoiPhoto.prototype.init = function() {
    // check browser instance
    // prepare UI

    this.super.init.call(this);
};

RoiPhoto.prototype.processConfig = function() {
    this.super.processConfig.call(this);

    if (this.state === Roi.State.Error) {
        return;
    }

    var err = null;
    if (typeof this.config['photo'] !== 'object'
        || this.config['photo'] === null) {
        err = new Error('Missing (or type error) photo key in config JSON');
    } else if (!this.config['photo']['orientation'] instanceof Array
        || this.config['photo']['orientation'].length !== 3) {
        err = new Error('Missing (or type error) photo.orientation in config JSON');
    } else if (!this.config['photo']['imageSize'] instanceof Array
        || this.config['photo']['imageSize'].length !== 2) {
        err = new Error('Missing (or type error) photo.imageSize in config JSON');
    } else if (typeof this.config['photo']['imageUrl'] !== 'string'
        ) { //|| !urlSanity(this.config['photo']['imageUrl'])) {
        err = new Error('Missing (or type error) photo.imageUrl in config JSON');
    }

    if (err) {
        this.state = Roi.State.Error;
        console.error(err);
    } else {
        this.photoOrientation = this.config['photo']['orientation'];
        this.imageSize = this.config['photo']['imageSize'];
        this.imageUrl = this.config['photo']['imageUrl'];
    }
};

RoiPhoto.prototype.initFinalize = function() {
    this.super.initFinalize.call(this);

    // load texture
    this.image = utils.loadImage(this.imageUrl, function(data) {
        this.texture = this.renderer.createTexture({source : this.image});
        this.image = null;
    }.bind(this), function(err) {
        this.image = null;
        this.state = Roi.State.Error;
        console.error(err);
    }.bind(this));

    // orient photo
    this.orientationMatrix = math.rotationMatrix(2, math.radians(-this.photoOrientation[2]));
    var rotateY = math.rotationMatrix(1, math.radians(-this.photoOrientation[1]));
    var rotateX = math.rotationMatrix(0, math.radians(-this.photoOrientation[0]));
    mat4.multiply(this.orientationMatrix, rotateY, this.orientationMatrix);
    mat4.multiply(this.orientationMatrix, rotateX, this.orientationMatrix);
};

RoiPhoto.prototype.tick = function() {
    this.super.tick.call(this);

};

RoiPhoto.prototype.update = function() {
    this.super.update.call(this);

    // TODO

    // set draw dirty flag (cube will be redraw in next tick)
    this.needsRedraw = true;
};

RoiPhoto.prototype.draw = function() {
    if (this.state !== Roi.State.FadingIn
        && this.state !== Roi.State.FadingOut
        && this.state !== Roi.State.Presenting) {
        return;
    }

    if (!this.map || !this.texture) {
        return;
    }

    //  projection-view matrix from map.getCamera()
    var cam = this.map.getCameraInfo();
    var pv = cam.viewProjectionMatrix;

    var mvp = mat4.create();
    mat4.identity(mvp);

    var trn = translationMatrix(-0.5, -0.5, 0);
    mat4.multiply(trn, mvp, mvp);

    var rot = math.rotationMatrix(0, math.radians(180));
    mat4.multiply(rot, mvp, mvp);

    var w = window;
    var d = document;
    var e = d.documentElement;
    var g = d.getElementsByTagName('body')[0];
    var x = w.innerWidth || e.clientWidth || g.clientWidth;
    var y = w.innerHeight|| e.clientHeight|| g.clientHeight;


    var sclFacs = [2.2, 2.2];
    sclFacs[0] = sclFacs[1] * (y/x);
    if (this.imageSize[0] > this.imageSize[1]) {
        sclFacs[0] = sclFacs[0]*(this.imageSize[0]/this.imageSize[1]);
    } else {
        sclFacs[1] = sclFacs[1]*(this.imageSize[1]/this.imageSize[0]);
    }
    var scl = math.scaleMatrix(sclFacs[0],sclFacs[1],1);
    //mat4.multiply(tile.mat, mvp, mvp);
    mat4.multiply(scl, mvp, mvp);

    // draw tile
    opts = {};
    opts["mvp"] = mvp;
    opts["texture"] = this.texture;
    opts["color"] = [255, 255, 255, this.alpha*255];
    opts["blend"] = (this.alpha < 1.0);
    this.renderer.drawBillboard(opts);
};

export default RoiPhoto;
