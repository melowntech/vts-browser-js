
import RoiLoadingQueue_ from '../loader';
import {math as math_} from '../../../core/utils/math';
import {mat4 as mat4_} from '../../../core/utils/matrix';

//get rid of compiler mess
var RoiLoadingQueue = RoiLoadingQueue_;
var math = math_;
var mat4 = mat4_;


/**
 * Pano class - specific Roi type class for rendering panorama.
 * @constructor
 * @final
 * @extends {Roi}
 */
var RoiPano = function(config, core, options) {
    this.cubeTree = [];

    // Cube face index constants
    this.cubeFront = 0;
    this.cubeRight = 1;
    this.cubeBack = 2;
    this.cubeLeft = 3;
    this.cubeUp = 4;
    this.cubeDown = 5;

    // Tile childs index constants
    this.childTopLeft = 0;
    this.childTopRight = 1;
    this.childBottomLeft = 2;
    this.childBottomRight = 3;

    // config properties
    this.cubeOrientation = null;
    this.navExtents = null;
    this.imageSize = null;
    this.lodCount = null;
    this.tileSize = null;
    this.tileTemplate = null;

    // claculated config properties
    this.tilesOnLod0 = null;
    this.tileRelSize = null;
    this.cubeOrientationMatrix = null;
    this.faceMatrices = [];

    // runtime
    this.activeTiles = [];

    this.super = Roi.prototype;
    Roi.call(this, config, core, options);
};


// Inheritance from Roi
RoiPano.prototype = Object.create(Roi.prototype);
RoiPano.prototype.constructor = RoiPano;


// Translates face constant int to face string
RoiPano.faceTitle = function(index) {
    var title = '';
    switch (index) {
        default:
        case 0: title = 'front'; break;
        case 1: title = 'right'; break;
        case 2: title = 'back'; break;
        case 3: title = 'left'; break;
        case 4: title = 'up'; break;
        case 5: title = 'down'; break;
    }
    return title;
};

// Protected methods

RoiPano.prototype.init = function() {
    // check browser instance
    // prepare UI

    this.super.init.call(this);
};


RoiPano.prototype.processConfig = function() {
    this.super.processConfig.call(this);

    if (this.state === Roi.State.Error) {
        return;
    }

    var err = null;
    if (typeof this.config['pano'] !== 'object'
        || this.config['pano'] === null) {
        err = new Error('Missing (or type error) pano key in config JSON');
    } else if (!this.config['pano']['orientation'] instanceof Array
        || this.config['pano']['orientation'].length !== 3) {
        err = new Error('Missing (or type error) pano.orientation in config JSON');
    } else if (!this.config['pano']['navExtents'] instanceof Array
        || this.config['pano']['navExtents'].length !== 4) {
        err = new Error('Missing (or type error) pano.navExtents in config JSON');
    } else if (!this.config['pano']['imageSize'] instanceof Array
        || this.config['pano']['imageSize'].length !== 2) {
        err = new Error('Missing (or type error) pano.imageSize in config JSON');
    } else if (!this.config['pano']['tileSize'] instanceof Array
        || this.config['pano']['tileSize'].length !== 2) {
        err = new Error('Missing (or type error) pano.tileSize in config JSON');
    } else if (typeof this.config['pano']['lodCount'] !== 'number'
               || this.config['pano']['lodCount'] < 1) {
        err = new Error('Missing (or type error) pano.lodCount in config JSON');
    } else if (typeof this.config['pano']['tileUrl'] !== 'string'
        ) { //|| !urlSanity(this.config['pano']['tileUrl'])) {
        err = new Error('Missing (or type error) pano.tileUrl in config JSON');
    }

    if (err) {
        this.state = Roi.State.Error;
        console.error(err);
    } else {
        this.cubeOrientation = this.config['pano']['orientation'];
        this.navExtents = this.config['pano']['navExtents'];
        this.imageSize = this.config['pano']['imageSize'][0];
        this.lodCount = this.config['pano']['lodCount'];
        this.tileSize = this.config['pano']['tileSize'][0];
        this.tileTemplate = this.config['pano']['tileUrl'];
    }
};


RoiPano.prototype.initFinalize = function() {
    this.super.initFinalize.call(this);

    // Prepare tile tree
    this.tilesOnLod0 = Math.ceil(this.imageSize / this.tileSize);
    this.tileRelSize = this.tileSize / this.imageSize;
    this.cubeTree = [[], [], [], [], [], []];  // Cube array
    var index = [0,0];
    for (var i = 0; i < 6; i++) {
        index = [0,0];
        var position = [0.0, 0.0];
        var arr = this.cubeTree[i];
        for (var j = 0; j < this.tilesOnLod0; j++) {
            for (var k = 0; k < this.tilesOnLod0; k++) {
                arr.push(this.prepareTile(i, position, index, 0));
                position[1] += this.tileRelSize;
                index[1]++;
            }

            position[1] = 0.0;
            position[0] += this.tileRelSize;

            index[1] = 0;
            index[0]++;
        }
    }

    // orient cube
    this.cubeOrientationMatrix = math.rotationMatrix(2, math.radians(-this.cubeOrientation[2]));
    var rotateY = math.rotationMatrix(1, math.radians(-this.cubeOrientation[1]));
    var rotateX = math.rotationMatrix(0, math.radians(-this.cubeOrientation[0]));
    mat4.multiply(this.cubeOrientationMatrix, rotateY, this.cubeOrientationMatrix);
    mat4.multiply(this.cubeOrientationMatrix, rotateX, this.cubeOrientationMatrix);

    // prepare face matrices
    for (var i = 0; i < 6; i++) {
        this.faceMatrices.push(this.faceMatrix(i));
    }
};


RoiPano.prototype.tick = function() {
    this.super.tick.call(this);
};


RoiPano.prototype.update = function() {
    this.super.update.call(this);

    if (this.map === null) {
        return;
    }

    // get view projection matric
    var vpMat = this.map.getCameraInfo().viewProjectionMatrix;
    // calc zoom (suitable lod)
    var useLod = this.suitableLod();
    // console.log('Using lod: ' + useLod);
    // find visible tiles
    var newTiles = this.visibleTiles(vpMat, useLod);

    // check if active tiles changed
    var changed = false;
    if (this.activeTiles.length !== newTiles.length) {
        changed = true;
    }
    if (!changed) {
        for (var i in this.activeTiles) {
            if (this.activeTiles[i] !== newTiles[i]) {
                changed = false;
                break;
            }
        }
    }

    // nothing change? No need to load
    if (!changed) {
        return;
    }

    this.activeTiles = newTiles;
    this.loadActiveTiles();

    // set draw dirty flag (cube will be redraw in next tick)
    this.needsRedraw = true;
};


RoiPano.prototype.draw = function() {
    if (this.state !== Roi.State.FadingIn
        && this.state !== Roi.State.FadingOut
        && this.state !== Roi.State.Presenting) {
        return;
    }

    if (!this.map) {
        return;
    }

    this.activeTiles.forEach(function(item) {
        this.drawTile(item);
    }.bind(this));
};


RoiPano.prototype.drawTile = function(tile) {
    if (!tile.texture() || this.alpha === 0.0) {
        return;
    }

    //  projection-view matrix from map.getCamera()
    var cam = this.map.getCameraInfo();
    var pv = cam.viewProjectionMatrix;
    //  tile (model) matrix
    if (tile.mat === null) {
        this.perepareTileMatrix(tile);
    }

    var mvp = mat4.create();
    mat4.identity(mvp);

    var scl = math.scaleMatrix(100,100,100);
    mat4.multiply(tile.mat, mvp, mvp);
    mat4.multiply(scl, mvp, mvp);

    // multiply to mvp matrix
    mat4.multiply(pv, mvp, mvp);

    // draw tile
    opts = {};
    opts["mvp"] = mvp;
    opts["texture"] = tile.texture();
    opts["color"] = [255, 255, 255, this.alpha*255];
    opts["blend"] = (this.alpha < 1.0);
    this.renderer.drawBillboard(opts);
};


RoiPano.prototype.prepareTile = function(face, position, index, lod) {
    var url = this.tileTemplate.replace('{lod}', lod.toString());
    url = url.replace('{face}', RoiPano.faceTitle(face));
    url = url.replace('{row}', index[0]);
    url = url.replace('{column}', index[1]);

    // if tile is fully over the face box - don't create
    if (position[0] >= 1 || position[1] >= 1) {
        return null;
    }

    // tile scale (if its not regular tile size (last tile in row/col))
    var tileSize = this.tileRelSize / Math.pow(2, lod);
    var scale = [tileSize, tileSize];
    if (position[0] + tileSize > 1) {
        scale[0] = (position[0] + tileSize) - 1;
    }
    if (position[1] + tileSize > 1) {
        scale[1] = (position[1] + tileSize) - 1;
    }

    var tile = new RoiPanoTile(face, position, index, lod, scale, url);

    var newIndex = [index[0] * 2, index[1] * 2];
    var newPosition = [position[0], position[1]];
    lod++;
    var childrenTs = this.tileRelSize / Math.pow(2, lod);
    if (lod < this.lodCount) {
        for (var i = 0; i < 4; i++) {
            var ct = this.prepareTile(face, newPosition, newIndex, lod);
            if (ct !== null) {
                tile.applendChild(ct);
            }
            if (i % 2 == 0) {
                newIndex[1]++;
                newPosition[1] += childrenTs;
            } else {
                newIndex[1]--;
                newPosition[1] -= childrenTs;
                newIndex[0]++;
                newPosition[0] += childrenTs;
            }
        }
    }
    return tile;
};


RoiPano.prototype.loadActiveTiles = function() {
    for (var i in this.activeTiles) {
        var tile = this.activeTiles[i];
        if (tile.texture() instanceof GpuTexture) { //TODO: fix instanceof GpuTexture
            continue;
        }

        var processClb = function(tile) {
            tile.texture(this.renderer.createTexture({source : tile.image()}));
            tile.image(null);
            this.setNeedsRedraw();
        };

        // we have an image object already - enqueue texture creation
        if (tile.image() instanceof Image) {
            this.processQueue.enqueue(processClb);
            continue;
        }

        // we have only tile URL - download image and enqueue texture creation
        this.loadingQueue.enqueue(tile.url(), RoiLoadingQueue.Type.Image,
        function(tile, processclb, err, image) {
            if (err) {
                return;
            }
            tile.image(image);
            this.processQueue.enqueue(processClb.bind(this, tile));
        }.bind(this, tile, processClb));

    }
};


RoiPano.prototype.suitableLod = function() {
    var loc = this.map.getPosition();
    var fov = loc[9];
    var angle = fov * 0.5;
    var screenHeight = 768; // TODO get it from Core API
    var identityTileHeight = this.tileRelSize * screenHeight;
    var visibleRaito = 1;
    if (angle <= 45) {
        visibleRaito = Math.tan(math.radians(angle));
    } else if (angle <= 90) {
        visibleRaito = 1 + Math.tan(math.radians(45 - (angle - 45)));
    }
    var tileHeight = identityTileHeight * (1 / visibleRaito);
    var suitableLod = 0;
    while (suitableLod < this.lodCount) {
        if (tileHeight <= this.tileSize) {
            break;
        }
        tileHeight /= 2;
        suitableLod++;
    }
    return suitableLod;
};


RoiPano.prototype.visibleTiles = function(vpMat, lod) {
    var tiles = [];

    var recurs = function(tile) {
        if (tile.lod === lod || tile.children.length === 0) {
            tiles.push(tile);
            return;
        }

        for (var i in tile.children) {
            recurs(tile.children[i]);
        }
    };

    for (var i in this.cubeTree) {
        for (var j in this.cubeTree[i]) {
            recurs(this.cubeTree[i][j]);
        }
    }

    return tiles;
};


RoiPano.prototype.faceMatrix = function(face) {
    var ang = [0, 0, 0];
    var trn = [0, 0, 0];
    if (face === this.cubeFront) {
        ang = [90, 180, 180];
        trn = [0, 0, 0.5];
    } else if (face === this.cubeDown) {
        ang = [0, 180, 180];
        trn = [0, 0, 0.5];
    } else if (face === this.cubeLeft) {
        ang = [90, 180, -90];
        trn = [0, 0, 0.5];
    } else if (face === this.cubeRight) {
        ang = [90, 180, 90];
        trn = [0, 0, 0.5];
    } else if (face === this.cubeUp) {
        ang = [0, 0, 0];
        trn = [0, 0, 0.5];
    } else if (face === this.cubeBack) {
        ang = [-90, 0, 180];
        trn = [0, 0, 0.5];
    }

    var rotX = math.rotationMatrix(0, math.radians(ang[0]));
    var rotY = math.rotationMatrix(1, math.radians(ang[1]));
    var rotZ = math.rotationMatrix(2, math.radians(ang[2]));
    var rot = mat4.create();
    mat4.identity(rot);
    mat4.multiply(rotX, rot, rot);
    mat4.multiply(rotY, rot, rot);
    mat4.multiply(rotZ, rot, rot);
    var trn = math.translationMatrix(trn[0], trn[1], trn[2]);
    mat4.multiply(rot, trn, trn);
    mat4.multiply(this.cubeOrientationMatrix, trn, trn);
    return trn;
};


RoiPano.prototype.perepareTileMatrix = function(tile) {
    tile.mat = mat4.create();
    mat4.identity(tile.mat);

    // 1. tile scale
    var tscl = math.scaleMatrix(tile.scale[1], tile.scale[0], 1);
    mat4.multiply(tscl, tile.mat, tile.mat);

    // 2. trnaslate to center
    var ttc = math.translationMatrix(-0.5, -0.5, 0);
    mat4.multiply(ttc, tile.mat, tile.mat);

    // 3. position tile in face
    var tttf = math.translationMatrix(tile.position[1]
                                         , tile.position[0]
                                         , 0);
    mat4.multiply(tttf, tile.mat, tile.mat);

    // 4. apply face matrix
    mat4.multiply(this.faceMatrices[tile.face], tile.mat, tile.mat);
};


export default RoiPano;
