/**
 * A ROI instance constructor (Protected constructor. Don't use this constructor)
 * directly. Use Fetch method of Melown.Roi class or constructor of specific
 * Roi type.
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

Melown.Roi.Fetch = function(config_, core_, clb_) {
    var done = function(json_) {
        if (typeof json_ === 'object' && json_ !== null && json_ !== undefined) {
            if (typeof json_.type === 'string' 
                && typeof Melown.Roi.Type[json_.type] === 'function') {
                clb_(null, new Melown.Roi.Type[json_.type](json_, core_));
            } else {
                var err = new Error('Downloaded configuration JSON does not contain registered ROI type');
                console.error(err);
                clb(err);
                return;
            }
        }
        var err = new Error('Downloaded configuration is not JSON object');
        console.error(err);
        clb(err);
        return;
    }

    if (typeof config_ === 'string') {
        // async load of config at URL and call processConfig again (with object)
        // TODO - Vadstena.loadJSON should be replaced by Melown.*
        Vadstena.loadJSON(config_, done, function(error_) {
            var err = new Error('Unable to download configuration JSON');
            console.error(err);
            clb(err);
            return;
        });
    } else if (typeof config_ !== 'object' 
        || config_ === null 
        || config_ === undefined) {
        var err = new Error('Unknown configuration format passed to Pano browser')
        console.error(err);
        clb(err);
        return;
    }

    done(config_);
}

/**
 * To be fullfilled by specific roi types [type : class]
 */
Melown.Roi.Type = {}

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
    // Used mostly for subclassing
    this._loadConfig();
}

Melown.Roi.prototype._finalizeInit = function() {

}

Melown.Roi._deinit = function() {
    // Used mostly for subclassing
}

// Private methods

Melown.Roi.prototype._loadConfig = function() {
    if (typeof config_ === 'string') {
        // async load of config at URL and call processConfig again (with object)
        // TODO - Vadstena.loadJSON should be replaced by Melown.*
        Vadstena.loadJSON(config_, function(json_) {
            this.config_ = json_;
            this._processConfig();
        }, function(error_) {
            this.state_ = Melown.Roi.State.Error;
            console.error('Unable to download configuration JSON');
        });
    } else if (typeof config_ !== 'object' 
        || config_ === null 
        || config_ === undefined) {
        this.state_ = Melown.Roi.State.Error;
        console.error('Unknown configuration format passed to Pano browser');
    }

    // it's object - just process it
    this._processConfig();
}

Melown.Roi.prototype._processConfig = function() {
    if (this.config_.)
}



Melown.Roi.prototype._processConfig = function(config_) {
    if (typeof config_ === 'string') {
        // async load of config at URL and call processConfig again (with object)
        // TODO - Vadstena.loadJSON should be replaced by Melown.*
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