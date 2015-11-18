/**
 * Pano class - specific Roi type class for rendering panorama.
 * @constructor
 * @final
 * @extends {Melown.Roi}
 */
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
    this.cubeOrientationMatrix_ = null;
    this.faceMatrices_ = [];

    // runtime
    this.activeTiles_ = [];

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);
}

// Inheritance from Roi
Melown.Roi.Pano.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Pano.prototype.constructor = Melown.Roi.Pano;

// Register class to Roi type dictionary (used by Roi.Fetch function)
Melown.Roi.Type['pano'] = Melown.Roi.Pano;

// Cube face index constants
/** @const */ Melown_Roi_Pano_Cube_Front = 0;
/** @const */ Melown_Roi_Pano_Cube_Right = 1;
/** @const */ Melown_Roi_Pano_Cube_Back = 2;
/** @const */ Melown_Roi_Pano_Cube_Left = 3;
/** @const */ Melown_Roi_Pano_Cube_Up = 4;
/** @const */ Melown_Roi_Pano_Cube_Down = 5;

// Translates face constant int to face string
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
        index_ = [0,0];
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

    // orient cube
    this.cubeOrientationMatrix_ = Melown.mat4.create();
    var rotateZ = Melown.rotationMatrix(2, Melown.radians(-this.cubeOrientation_[2]));
    var rotateY = Melown.rotationMatrix(1, Melown.radians(-this.cubeOrientation_[1]));
    var rotateX = Melown.rotationMatrix(0, Melown.radians(-this.cubeOrientation_[0]));
    Melown.mat4.multiply(this.cubeOrientationMatrix_, rotateZ, this.cubeOrientationMatrix_);
    Melown.mat4.multiply(this.cubeOrientationMatrix_, rotateY, this.cubeOrientationMatrix_);
    Melown.mat4.multiply(this.cubeOrientationMatrix_, rotateX, this.cubeOrientationMatrix_);

    // prepare face matrices
    for (var i = 0; i < 6; i++) {
        this.faceMatrices_.push(this._faceMatrix(i));
    }
}

Melown.Roi.Pano.prototype._tick = function() {
    this.super_._tick.call(this);

}

Melown.Roi.Pano.prototype._update = function() {
    this.super_._update.call(this);

    if (this.map_ === null) {
        return;
    }

    // get view projection matric
    var vpMat_ = this.map_.getCameraInfo()['view-projection-matrix'];
    // calc zoom (suitable lod)
    var useLod_ = this._suitableLod();
    // find visible tiles
    var newTiles = this._visibleTiles(vpMat_, 0);

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

    // nothing change? No need to load
    if (!changed) {
        return;
    }

    this.activeTiles_ = newTiles;
    this._loadActiveTiles();

    // set draw dirty flag (cube will be redraw in next tick)
    this.needsRedraw_ = true;
}

Melown.Roi.Pano.prototype._draw = function() {
    
    if (!this.map_) {
        return;
    }

    var pv_ = this.map_.getCameraInfo()['view-projection-matrix'];
    var m_ = Melown.mat4.create();
    m_ = Melown.scaleMatrix(1000,1000,10);
    //Melown.mat4.multiply(m_, Melown.translationMatrix(), m_)
    var mvp_ = Melown.mat4.multiply(pv_, m_);

    var opts_ = {};
    opts_["mvp"] = mvp_;

    var tex_ = null;
    for (var i in this.activeTiles_) {
        if (this.activeTiles_[i].texture() !== null) {
            tex_ = this.activeTiles_[i].texture();
            break;
        }
    }
    opts_["texture"] = tex_;

    this.renderer_.drawBillboard(opts_);

    // this.activeTiles_.forEach(function(item_) {
    //     this._drawTile(item_);
    // }.bind(this));
}

Melown.Roi.Pano.prototype._drawTile = function(tile_) {
    if (!tile_.texture()) {
        return;
    }

    //  projection-view matrix from map.getCamera()
    var pv_ = this.map_.getCameraInfo()['view-projection-matrix'];
    //  tile (model) matrix
    var t_ = tile_.mat_;
    if (t_ === null) {
        t_ = this._orientedTileMatrix(tile_);
        tile_.mat_ = t_;
    }
    // multiply to mvp matrix
    Melown.mat4.multiply(t_, pv_, t_);

    // draw tile
    this.renderer_.drawBillboard(t_, texture_, [0, 0, 1, 1]);
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
            tile_.applendChild(this._prepareTile(face_, newPosition_, newIndex_, lod_));
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

Melown.Roi.Pano.prototype._loadActiveTiles = function() {
    for (var i in this.activeTiles_) {
        var tile_ = this.activeTiles_[i];
        if (tile_.texture() instanceof Melown.GpuTexture) {
            continue;
        }

        var processClb_ = function(tile_) {
            tile_.texture(this.renderer_.createTexture({source : tile_.image()}));
            tile_.image(null);
            this.setNeedsRedraw();
        };

        // we have an image object already - enqueue texture creation
        if (tile_.image() instanceof Image) {
            this.processQueue_.enqueue(processClb_);
            continue;
        }

        // we have only tile URL - download image and enqueue texture creation
        this.loadingQueue_.enqueue(tile_.url(), Melown.Roi.LoadingQueue.Type.Image,
        function(tile_, processclb_, err_, image_) {
            if (err_) {
                return;
            }
            tile_.image(image_);
            this.processQueue_.enqueue(processClb_.bind(this, tile_));
        }.bind(this, tile_, processClb_));

    }
}

Melown.Roi.Pano.prototype._suitableLod = function() {
    var loc_ = this.map_.getPosition();
    var fov_ = loc_[8];
    var angle_ = fov_ * 0.5;
    var screenHeight_ = 768; // TODO get it from Core API
    var identityTileHeight_ = this.tileRelSize_ * screenHeight_;
    var visibleRaito_ = 1;
    if (angle_ <= 45) {
        visibleRaito_ = Math.tan(Melown.radians(angle_));
    } else if (angle_ <= 90) {
        visibleRaito_ = 1 + Math.tan(Melown.radians(45 - (angle_ - 45)));
    }
    var tileHeight_ = identityTileHeight_ * (1 / visibleRaito_);
    var suitableLod_ = 0;
    while (suitableLod_ < this.lodCount_) {
        if (tileHeight_ <= this.tileHeight_) {
            break;
        }
        tileHeight_ /= 2;
        suitableLod_++;
    }
    return suitableLod_;
}

Melown.Roi.Pano.prototype._visibleTiles = function(vpMat_, lod_) {
    var tiles_ = [];

    var recurs = function(tile_) {
        if (tile_.lod_ === lod_ || tile_.childs_.length === 0) {
            tiles_.push(tile_);
        }

        for (var i in tile_.childs_) {
            recurs(tile_.childs_[i]);
        }
    };

    for (var i in this.cubeTree_) {
        for (var j in this.cubeTree_[i]) {
            recurs(this.cubeTree_[i][j]);
        }
    }

    return tiles_;
}

Melown.Roi.Pano.prototype._faceMatrix = function(face_) {
    var pos_ = [-1, 1, 1];
    var rot_ = [0, 0, 0];
    var scale_ = [1, 1, 1];
    switch (face_) {
        case Melown_Roi_Pano_Cube_Front:
            pos_ = [-1, 1, 1];
            rot_ = [90, 0, 0];
            break;
        case Melown_Roi_Pano_Cube_Right:
            pos_ = [1, 1, 1];
            rot_ = [90, 90, 0];
            break;
        case Melown_Roi_Pano_Cube_Back:
            pos_ = [1, -1, 1];
            rot_ = [90, 180, 0];
            break;
        case Melown_Roi_Pano_Cube_Left:
            pos_ = [-1, -1, 1];
            rot_ = [90, 270, 0];
            break;
        case Melown_Roi_Pano_Cube_Up:
            pos_ = [-1, -1, 1];
            rot_ = [0, 0, 0];
            break;
        case Melown_Roi_Pano_Cube_Down:
            pos_ = [-1, 1, -1];
            rot_ = [180, 0, 0];
            break;
    }
    var trn_ = Melown.translationMatrix(pos_[0], pos_[1], pos_[2]);
    var rotX_ = Melown.rotationMatrix(0, Melown.radians(-rot_[0]));
    var rotY_ = Melown.rotationMatrix(1, Melown.radians(-rot_[1]));
    var rotZ_ = Melown.rotationMatrix(2, Melown.radians(-rot_[2]));

    var mat_ = Melown.mat4.create();
    Melown.mat4.multiply(trn_, rotX_, mat_);
    Melown.mat4.multiply(mat_, rotY_, mat_);
    Melown.mat4.multiply(mat_, rotZ_, mat_);
    Melown.mat4.multiply(mat_, Melown.scaleMatrix(scale_[0], scale_[1], scale_[2]), mat_);
    return mat_;
}

Melown.Roi.Pano.prototype._tileMatrix = function(tile_) {
    var t_ = this.faceMatrices_[tile_.face_];
    var trn_ = Melown.translationMatrix(tile_.pos_[0], tile_.pos_[1], 0);
    var s = Math.pow(2, -tile_.lod_) * this.tileRelSize_;
    var scale_ = Melown.scaleMatrix(s, s, 1);
    
    Melown.mat4.multiply(t_, trn_, t_);
    Melown.mat4.multiply(t_, scale_, t_);
    return t_;
}

Melown.Roi.Pano.prototype._orientedTileMatrix = function(tile_) {
    var ot_ = this._tileMatrix(tile_);
    Melown.mat4.multiply(ot_, this.cubeOrientationMatrix_, ot_);
    return ot_;
}
