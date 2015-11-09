/**
 * A ROI instance constructor (Protected constructor. Don't use this constructor)
 * directly. Use Fetch method of Melown.Roi class or constructor of specific
 * Roi type.
 * @constructor
 */
Melown.Roi = function(config_, core_, options_) {
    this.config_ = config_;
    this.core_ = core_;
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

    Object.defineProperty(this, 'currentPosition_', {
        get : function() {
            return this.map_.getPosition();
        }.
        set : function(val_) {
            this.map_.setPosition(val_);
        }
    });

    // modules
    this.renderer_ = this.core_.renderer_;
    this.map_ = this.core_.map_;
    this.loadingQueue_ = null;
    this.processingQueue_ = null;

    // inti roi point
    this._init();
}

Melown.Roi.Fetch = function(config_, core_, clb_) {
    var done = function(json_) {
        if (typeof json_ === 'object' && json_ !== null) {
            if (typeof json_['type'] === 'string' 
                && typeof Melown.Roi.Type[json_.type] === 'function') {
                clb_(null, new Melown.Roi.Type[json_['type']](json_, core_));
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

Melown.Roi.prototype.tick = function() {
    if (this.needsRedraw_) {
        this.needsRedraw_ = false;
        this._draw();
    }
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

        if (this.options_.processingQueue_ instanceof Melown.Roi.ProcessingQueue) {
            this.processingQueue_ = this.options_.processingQueue_;
        } else {
            var opts_ = this.options_.processingQueueOptions_;
            this.processingQueue_ = new Melown.Roi.ProcessingQueue(opts_);
        }
    } else {
        this.loadingQueue_ = new Melown.Roi.LoadingQueue();
        this.processingQueue_ = new Melown.Roi.ProcessingQueue();
    }

    // Process configuration file
    if (typeof this.config_ !== 'object' || type.config_ === null) {
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
    } else if (this instanceof Melown.Roi.Type[this.config_['type']]) {
        err = new Error('ROI type in config JSON missing or is not registered');
    } else if (!this.config_['position'] instanceof Array
               || !this.core_.map_.positionSanity(this.config_['position'])) {
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
    }
}

/**
 * Parent class (this class) _init method MUST be caled from overidden method. 
 */
Melown.Roi.prototype._initFinalize = function() {
    // Change state and go ...
    this.state_ = Melown.Roi.State.Ready;

    // TODO hook up on map.position changed event (this._update method)

    // Devel in if requested
    if (this.develAtFinishRequested_) {
        this.develAtFinishRequested_ = false;
        this.devel();
    }
}

// Private methods

Melown.Roi.prototype._draw = function() {

}

Melown.Roi.prototype._update = function() {
    
}
