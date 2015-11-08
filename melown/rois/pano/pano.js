Melown.Roi.Pano = function(config_, core_, options_) {
    this.cubeTree_ = [];

    // config properties
    this.cubeOrientation_ = null;
    this.navExtents_ = null;
    this.imageSize_ null;
    this.lodCount_ = null;
    this.tileSize_ = null;
    this.tileTemplate_ = null;

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);
}

// inheritance from Roi
Melown.Roi.Pano.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Pano.prototype.constructor = Melown.Roi.Pano;

// Cube face index constants
Melown_Roi_Pano_Cube_Front = 0;
Melown_Roi_Pano_Cube_Right = 1;
Melown_Roi_Pano_Cube_Back = 2;
Melown_Roi_Pano_Cube_Left = 3;
Melown_Roi_Pano_Cube_Top = 4;
Melown_Roi_Pano_Cube_Down = 5;

// Tile childs index constants
Melown_Roi_Pano_Child_TopLeft = 0;
Melown_Roi_Pano_Child_TopRight = 1;
Melown_Roi_Pano_Child_BottomLeft = 2;
Melown_Roi_Pano_Child_BottomRight = 3;

// Protected methods

Melown.Roi.Pano.prototype._init = function() {
    // check browser instance
    // load and parse configuration file
    // prepare UI

    this.super_._init();
}

Melown.Roi.Pano.prototype._processConfig = function() {
    this.super_._processConfig();

    if (this.state_ === Melown.Roi.State.Error) {
        return;
    }

    var err = null;
    if (typeof this.config_['pano'] !== ' object' 
        || this.config_['pano'] === null) {
        err = new Error('Missing (or type error) pano key in config JSON');
    } else if (!this.config_['pano']['orientation'] instanceof Array 
        || this.config_['pano']['orientation'].length !== 3) {
        err = new Error('Missing (or type error) pano.orientation in config JSON');
    } else if (!this.config_['pano']['navExtents'] instanceof Array 
        || this.config_['pano']['navExtents'].length !== 4) {
        err = new Error('Missing (or type error) pano.navExtents in config JSON');
    } else if (!this.config_['pano']['imageSize'] instanceof Array 
        || this.config_['pano']['imageSize'].length !== 2) {
        err = new Error('Missing (or type error) pano.imageSize in config JSON');
    } else if (!this.config_['pano']['tileSize'] instanceof Array 
        || this.config_['pano']['tileSize'].length !== 2) {
        err = new Error('Missing (or type error) pano.tileSize in config JSON');
    } else if (typeof this.config_['pano']['lodCount'] !== 'number'
               || this.config_['pano']['lodCount'] < 1) {
        err = new Error('Missing (or type error) pano.lodCount in config JSON');
    } else if (typeof this.config_['pano']['tileUrl'] !== 'string'
        || !Melown.Utils.urlSanity(this.config_['pano']['tileUrl'])) {
        err = new Error('Missing (or type error) pano.tileUrl in config JSON');
    }

    if (err) {
        this.state_ = Melown.Roi.State.Error;
        console.error(err);
    } else {
        this.cubeOrientation_ = this.config_['pano']['orientation'];
        this.navExtents_ = this.config_['pano']['navExtents'];
        this.imageSize_ = this.config_['pano']['imageSize'];
        this.lodCount_ = this.config_['pano']['lodCount'];
        this.tileSize_ = this.config_['pano']['tileSize'][0];
        this.tileTemplate_ = this.config_['pano']['tileUrl'];
    }
}

Melown.Roi.Pano.prototype._initFinalize = function() {
    this.super_._initFinalize();

    // Prepare tile tree
    var tile = {
        face : Melown_Roi_Pano_Cube_Front,
        position : Melown_Roi_Pano_Child_TopLeft,
        lod : 1,
        children : [],
        resources : {
            url : "",
            image : null,
            texture : null
        }
    }
}

Melown.Roi.Pano.prototype._update = function() {
    this.super_.update();

    // calc visible area
    // zoom
    // prepare reasources

    // render
    this._draw();
}

Melown.Pano.prototype._draw = function() {
    // prepare all billboards and draw them seqs.
    this.browser_.drawBillboard(/* TODO */);


}
