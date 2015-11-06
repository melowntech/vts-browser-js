/**
 * A ROI instance constructor
 * @constructor
 */
Melown.Roi = function(config_, core_) {
    this.config_ = config_;
    this.core_ = core_;
    
    this.renderer_ = this.core_.renderer_;
    this.map_ = this.core_.map_;

    // state properties
    this.state_ = Melown.Roi.State.Created;
    this.develAtFinishRequested_ = false;
    this.leaveAtFinishRequested_ = false;
    this.enterPosition_ = null;             // filled by devel function
    this.refPosition_ = null;               // filled from config JSON 
    this.currendPosition_ = null;           // changing by orientation accesor etc.

    // inti roi point
    this._init();
}

/**
 * Roi object states.
 * @enum {number}
 */
Melown.Roi.State = {
    Created : 0,
    Ready : 1,
    FadingIn : 2,
    Presenting : 3,
    FadingOut : 4,
    Error : -1
}

// Public methods

Melown.Roi.delve = function(enterPosition_) {
    if (this.state_ === Melown.Roi.State.Created 
        || this.state_ === Melown.Roi.State.FadingOut) {
        this.develAtFinishRequested_ = true;
    } else if (this.state_ === Melown.Roi.State.FadingIn) {
        this.leaveAtFinishRequested_ = false;
    } else if (this.state_ !== Melown.Roi.State.Ready) {
        return;
    }

    // TODO flight into roi position and blend with custom render
}

Melown.Roi.leave = function() {
    if (this.state_ === Melown.Roi.State.Created 
        || this.state_ === Melown.Roi.State.FadingOut) {
        this.develAtFinishRequested_ = false;
    } else if (this.state_ === Melown.Roi.State.FadingIn) {
        this.leaveAtFinishRequested_ = true;
    } else if (this.state_ !== Melown.Roi.State.Ready) {
        return;
    }

    // TODO flight into roi position and blend with custom render
}

// Accessor methods

Melown.Roi.prototype.state = function() {
    return this.state_;
}

Melown.Roi.prototype.config = function() {
    return this.config_;
}

Melown.Roi.currentPosition = function(type_ = 'obj') {
    if (type_ === 'obj') {
        return this.currendPosition_;
    }
    return this.map_.convert(this.currendPosition_, type);
}

Melown.Roi.orientation = function(yaw, pitch) {
    if (yaw === undefined) {
        // TODO get current yaw and pitch
        return [0, 0];
    } else if (pitch === undefined) {
        if (yaw instanceof Array && yaw.length >= 2) {
            pitch = yaw[1]; 
            yaw = yaw[0];
        } else {
            pitch = this.orientation[1];
        }
    }
    // TODO set current position from given yaw and pitch
}

// Protected methods

Melown.Roi.prototype._init = function() {
    this._processConfig(this.config_);
}

Melown.Roi.prototype._processConfig = function(config_) {
    if (typeof config_ === 'string') {
        // async load of config at URL and call processConfig again (with object)
        Vadstena.loadJSON(config_, function(json_) {
            this._processConfig(json_);
        }, function(error_) {
            this.state_ = Melown.Roi.State.Error;
        });
    } else if (typeof config_ !== 'object' 
        || config_ === null 
        || config_ === undefined) {
        this.state_ = Melown.Roi.State.Error;
        console.error('Unknown configuration format passed to Pano browser');
    }

    this.config_ = config_;
}