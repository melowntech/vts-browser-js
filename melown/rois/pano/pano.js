Melown.Roi.Pano = function(config_, core_, options_) {
    this.cubeTree_ = [];

    // config properties
    this.cubeOrientation_ = null;
    this.navExtents_ = null;
    this.imageSize_ = null;
    this.lodCount_ = null;
    this.tileSize_ = null;
    this.tileTemplate_ = null;

    // claculated config properties
    this.tilesOnLod0_ = null;
    this.tileRelSize_ = null;

    // runtime
    this.activeTiles_ = [];

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);
}

Melown.Roi.Type['pano'] = Melown.Roi.Pano;

// inheritance from Roi
Melown.Roi.Pano.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Pano.prototype.constructor = Melown.Roi.Pano;

// Cube face index constants
Melown_Roi_Pano_Cube_Front = 0;
Melown_Roi_Pano_Cube_Right = 1;
Melown_Roi_Pano_Cube_Back = 2;
Melown_Roi_Pano_Cube_Left = 3;
Melown_Roi_Pano_Cube_Up = 4;
Melown_Roi_Pano_Cube_Down = 5;

Melown.Roi.Pano.faceTitle = function(index_) {
    var title = '';
    switch (index_) {
        default:
        case 0: title = 'front'; break;
        case 1: title = 'right'; break;
        case 2: title = 'back'; break;
        case 3: title = 'left'; break;
        case 4: title = 'up'; break;
        case 5: title = 'down'; break;
    }
    return title;
}

// Tile childs index constants
Melown_Roi_Pano_Child_TopLeft = 0;
Melown_Roi_Pano_Child_TopRight = 1;
Melown_Roi_Pano_Child_BottomLeft = 2;
Melown_Roi_Pano_Child_BottomRight = 3;

Melown.Roi.Pano.prototype.tick = function() {
    this.super_.tick.call(this);

}

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
    if (typeof this.config_['pano'] !== 'object' 
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
        ) { //|| !Melown.Utils.urlSanity(this.config_['pano']['tileUrl'])) {
        err = new Error('Missing (or type error) pano.tileUrl in config JSON');
    }

    if (err) {
        this.state_ = Melown.Roi.State.Error;
        console.error(err);
    } else {
        this.cubeOrientation_ = this.config_['pano']['orientation'];
        this.navExtents_ = this.config_['pano']['navExtents'];
        this.imageSize_ = this.config_['pano']['imageSize'][0];
        this.lodCount_ = this.config_['pano']['lodCount'];
        this.tileSize_ = this.config_['pano']['tileSize'][0];
        this.tileTemplate_ = this.config_['pano']['tileUrl'];
    }
}

Melown.Roi.Pano.prototype._initFinalize = function() {
    this.super_._initFinalize.call(this);

    // Prepare tile tree
    this.tilesOnLod0_ = Math.ceil(this.imageSize_ / this.tileSize_);
    this.tileRelSize_ = this.tileSize_ / this.imageSize_; 
    this.cubeTree_ = [[], [], [], [], [], []];  // Cube array
    var index_ = [0,0];
    for (var i = 0; i < 6; i++) {
        var position_ = [0.0, 0.0];
        var arr_ = this.cubeTree_[i];
        for (var j = 0; j < this.tilesOnLod0_; j++) {
            for (var k = 0; k < this.tilesOnLod0_; k++) {
                arr_.push(this._prepareTile(i, position_, index_, 0));
                position_[1] += this.tileRelSize_;    
            }

            position_[1] = 0.0;
            position_[0] += this.tileRelSize_;

            index_[1] = 0;
            index_[0]++;
        }
    }
}

Melown.Roi.Pano.prototype._update = function() {
    this.super_.update.call(this);

    // calc visible area
    // calc zoom (lod)
    // find visible tiles
    var newTiles = [];

    // check if active tiles changed
    var changed = false;
    if (this.activeTiles_.length !== newTiles.length) {
        changed = true;
    }
    if (!changed) {
        for (var i in this.activeTiles_) {
            if (this.activeTiles_[i] !== newTiles[i]) {
                changed = false;
                break;
            }
        }
    }

    if (!changed) {
        return;
    }

    this.activeTiles_ = newTiles;
    

    // set dirty render flag if needed
}

Melown.Roi.Pano.prototype._draw = function() {
    // TODO clear zbuffer.

    this.activeTiles_.forEach(function(item_) {
        this._drawTile(item_);
    }.bind(this));
}

Melown.Roi.Pano.prototype._drawTile = function(tile_) {
    if (!tile_.texture_) {
        return;
    }
    // TODO calculate mvp matrix

    // TODO draw billboard
}

Melown.Roi.Pano.prototype._prepareTile = function(face_, position_, index_, lod_) {
    var url_ = this.tileTemplate_.replace('{lod}', lod_.toString());
    url_ = url_.replace('{face}', Melown.Roi.Pano.faceTitle(face_));
    url_ = url_.replace('{row}', index_[0]);
    url_ = url_.replace('{column}', index_[1]);
    var tile_ = new Melown.Roi.Pano.Tile(face_, position_, index_, lod_, url_);

    var newIndex_ = [index_[0] * 2, index_[1] * 2];
    var newPosition_ = [position_[0], position_[1]];
    lod_++;
    var childrenTs_ = this.tileRelSize_ / Math.pow(2, lod_);
    if (lod_ < this.lodCount_) {
        for (var i = 0; i < 4; i++) {
            tile_.applendChild(this._prepareTile(face_, position_, newIndex_, lod_));
            if (i % 2 == 0) {
                newIndex_[1]++;
                newPosition_[1] += childrenTs_ ;
            } else {
                newIndex_[1]--;
                newPosition_[1] -= childrenTs_;
                newIndex_[0]++;
                newPosition_[0] += childrenTs_;
            }
        }
    }
    return tile_;
}

Melown.Roi.Pano.prototype._loadTiles = function(tiles_) {
    for (var i in tiles_) {
        var tile_ = tiles_[i];
        tile_.image(this.loadingQueue_, function(err_, img_) {
            if (err_ === null && img_ instanceof Image) {

            }
        }.bind(this));
    }
}
