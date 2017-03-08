/**
 * A ROI instance constructor (Protected constructor. Don't use this constructor)
 * directly. Use Fetch method of Melown.Roi class or constructor of specific
 * Roi type.
 * @constructor
 */
Melown.Roi = function(config_, browser_, options_) {
    this.config_ = config_;
    this.browser_ = browser_;
    this.options_ = options_;

    // config properties
    this.title_ = null;
    this.id_ = null;
    this.type_ = null;

    // state properties
    this.state_ = Melown.Roi.State.Created;
    this.develAtFinishRequested_ = false;
    this.leaveAtFinishRequested_ = false;
    this.enterPosition_ = null;             // filled by devel function
    this.refPosition_ = null;               // filled from config JSON 
    this.needsRedraw_ = false;              // dirty flag for drawing
    this.alpha_ = 1.0;
    this.defaultControlMode_ = 'pano';
    this.defaultControlModeConfig_ = null;

    // binded callbacks
    this.tickClb_ = null;
    this.updateClb_ = null;

    Object.defineProperty(this, 'currentPosition_', {
        get : function() {
            return this.map_.getPosition();
        },
        set : function(val_) {
            this.map_.setPosition(val_);
        }
    });

    // modules
    this.core_ = this.browser_.getCore();
    this.renderer_ = this.core_.getRenderer();
    Object.defineProperty(this, 'map_', {
        get : function() {
            return this.core_.getMap();
        },
        set : function(val_) {}
    });
    this.controlMode_ = this.browser_.getControlMode();
    this.loadingQueue_ = null;
    this.processQueue_ = null;

    // inti roi point
    this._init();
}

Melown.Roi.Fetch = function(config_, browser_, options_, clb_) {
    if (typeof options_ === 'function') {
        clb_ = options_;
        options_ = null;
    }
    var done = function(json_) {
        if (typeof json_ === 'object' && json_ !== null) {
            if (typeof json_['type'] === 'string' 
                && typeof Melown.Roi.Type[json_['type']] === 'function') {
                clb_(null, new Melown.Roi.Type[json_['type']](json_, browser_, options_));
                return;
            } else {
                var err = new Error('Downloaded configuration JSON does not contain registered ROI type');
                console.error(err);
                clb_(err);
                return;
            }
        }
        var err = new Error('Downloaded configuration is not JSON object');
        console.error(err);
        clb_(err);
        return;
    }

    if (typeof config_ === 'string') {
        // async load of config at URL and call processConfig again (with object)
        // TODO - Vadstena.loadJSON should be replaced by Melown.*
        Melown.loadJSON(config_, done, function(error_) {
            var err = new Error('Unable to download configuration JSON');
            console.error(err);
            clb(err);
            return;
        });
        return;
    } else if (typeof config_ !== 'object' 
        || config_ === null) {
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

Melown.Roi.prototype.delve = function(enterPosition_) {
    if (this.state_ === Melown.Roi.State.Created 
        || this.state_ === Melown.Roi.State.FadingOut) {
        this.develAtFinishRequested_ = true;
        return;
    } else if (this.state_ === Melown.Roi.State.FadingIn) {
        this.leaveAtFinishRequested_ = false;
        return;
    } else if (this.state_ !== Melown.Roi.State.Ready) {
        return;
    }

    this.state_ = Melown.Roi.State.FadingIn;

    this.enterPosition_ = this.core_.getMap().getPosition();

    this.core_.getMap().setPosition(this.refPosition_);
    this.controlMode_.setCurrentControlMode(this.defaultControlMode_
                                            , this.defaultControlModeConfig_);

    this.state_ = Melown.Roi.State.Presenting;

    // TODO flight into roi position and blend with custom render
}

Melown.Roi.prototype.leave = function() {
    if (this.state_ === Melown.Roi.State.Created 
        || this.state_ === Melown.Roi.State.FadingOut) {
        this.develAtFinishRequested_ = false;
        return;
    } else if (this.state_ === Melown.Roi.State.FadingIn) {
        this.leaveAtFinishRequested_ = true;
        return;
    } else if (this.state_ !== Melown.Roi.State.Presenting) {
        return;
    }

    this.state_ = Melown.Roi.State.FadingOut;

    this.core_.getMap().setPosition(this.enterPosition_);
    this.controlMode_.setDefaultControlMode();

    this.state_ = Melown.Roi.State.Ready;

    // TODO flight into roi position and blend with custom render
}

Melown.Roi.prototype.deinit = function() {
    // remove tick listener
    this.browser_.off('tick', this.tickClb_); 
    this.tickClb_ = null;

    this.core_.off('map-position-changed', this.updateClb_); 
    this.updateClb_ = null;
}

Melown.Roi.prototype.setNeedsRedraw = function() {
    this.needsRedraw_ = true;
}

// Accessor methods

Melown.Roi.prototype.state = function() {
    return this.state_;
}

Melown.Roi.prototype.config = function() {
    return this.config_;
}

// Public accessors

Melown.Roi.prototype.alpha = function(alpha_) {
    if (typeof alpha_ !== "number") {
        return this.alpha_;
    }
    if (alpha_ < 0.0) {
        alpha_ = 0.0;
    }
    if (alpha_ > 1.0) {
        alpha_ = 1.0;
    }
    if (alpha_ === this.alpha_) {
        return;
    }
    this.alpha_ = alpha_;
    this._update();
    this.setNeedsRedraw();
}

// Protected methods

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._init = function() {
    // Process options
    if (typeof this.options_ === 'object' && this.options_ !== null) {
        if (this.options_.loadingQueue_ instanceof Melown.Roi.LoadingQueue) {
            this.loadingQueue_ = this.options_.loadingQueue_;
        } else {
            var opts_ = this.options_.loadingQueueOptions_;
            this.loadingQueue_ = new Melown.Roi.LoadingQueue(opts_);    
        }

        if (this.options_.processQueue_ instanceof Melown.Roi.ProcessQueue) {
            this.processQueue_ = this.options_.processQueue_;
        } else {
            var opts_ = this.options_.processQueueOptions_;
            this.processQueue_ = new Melown.Roi.ProcessQueue(opts_);
        }
    } else {
        this.loadingQueue_ = new Melown.Roi.LoadingQueue();
        this.processQueue_ = new Melown.Roi.ProcessQueue();
    }

    // Process configuration file
    if (typeof this.config_ !== 'object' || this.config_ === null) {
        this.state_ = Melown.Roi.State.Error;
        var err = new Error('Config passed to ROI constructor is not object');
        console.error(err);
        return;
    }
    this._processConfig();
    
    // If processing of configuration is successfull 
    // (configuration JSON is valid) proceed to finalize initialization
    if (this.state_ != Melown.Roi.State.Error) {
        this._initFinalize();
    }
}

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._processConfig = function() {
    var err = null;
    if (typeof this.config_['id'] !== 'string') {
        err = new Error('Missing (or type error) ROI id in config JSON');
    } else if (!this instanceof Melown.Roi.Type[this.config_['type']]) {
        err = new Error('ROI type in config JSON missing or is not registered');
    } else if (!this.config_['position'] instanceof Array
// TODO!! check position sanity
               ) {//|| !this.core_.map_.positionSanity(this.config_['position'])) {
        err = new Error('ROI position in config JSON missing or is not valid');
    } else if (typeof this.config_['title'] !== 'string') {
        err = new Error('Missing (or type error) ROI title in config JSON');
    }

    if (err !== null) {
        this.state_ = Melown.Roi.State.Error;
        console.error(err);
    } else {
        this.id_ = this.config_['id'];
        this.title_ = this.config_['title'];
        this.type_ = this.config_['type'];
        this.refPosition_ = this.config_['position'];
    }
}

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._initFinalize = function() {
    // Change state and go ...
    this.state_ = Melown.Roi.State.Ready;

    // TODO hook up on map.position changed event (this._update method)
    this.updateClb_ = function() {
        this._update();
    }.bind(this);
    this.core_.on('map-position-changed', this.updateClb_);

    // hook up on browser tick method
    this.tickClb_ = function() {
        this._tick();
    }.bind(this);
    this.browser_.on('tick', this.tickClb_);

    // Devel in if requested
    if (this.develAtFinishRequested_) {
        this.develAtFinishRequested_ = false;
        this.devel();
    }
}

// Private methods

Melown.Roi.prototype._tick = function() {
    this.processQueue_.tick();

    //if (this.needsRedraw_) {
        this.needsRedraw_ = false;
        this._draw();
    //}
}

Melown.Roi.prototype._draw = function() {
    // nop
}

Melown.Roi.prototype._update = function() {
    // nop   
}
