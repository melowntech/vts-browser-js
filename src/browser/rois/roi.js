
import RoiLoadingQueue_ from './loader';
import RoiProcessQueue_ from './processor';
import RoiPhoto_ from './photo/photo';
import RoiPano_ from './pano/pano';
import RoiLocation_ from './location/location';
import {utils as utils_} from '../../core/utils/utils';

//get rid of compiler mess
var RoiLoadingQueue = RoiLoadingQueue_;
var RoiProcessQueue = RoiProcessQueue_;
var RoiPhoto = RoiPhoto_;
var RoiPano = RoiPano_;
var RoiLocation = RoiLocation_;
var utils = utils_;


/**
 * A ROI instance constructor (Protected constructor. Don't use this constructor)
 * directly. Use Fetch method of Roi class or constructor of specific
 * Roi type.
 * @constructor
 */
var Roi = function(config, browser, options) {
    this.config = config;
    this.browser = browser;
    this.options = options;

    // config properties
    this.title = null;
    this.id = null;
    this.type = null;

    // state properties
    this.state = Roi.State.Created;
    this.develAtFinishRequested = false;
    this.leaveAtFinishRequested = false;
    this.enterPosition = null;             // filled by devel function
    this.refPosition = null;               // filled from config JSON 
    this.needsRedraw = false;              // dirty flag for drawing
    this.alpha = 1.0;
    this.defaultControlMode = 'pano';
    this.defaultControlModeConfig = null;

    // binded callbacks
    this.tickClb = null;
    this.updateClb = null;

    Object.defineProperty(this, 'currentPosition', {
        get : function() {
            return this.map.getPosition();
        },
        set : function(val) {
            this.map.setPosition(val);
        }
    });

    // modules
    this.core = this.browser.getCore();
    this.renderer = this.core.getRenderer();
    Object.defineProperty(this, 'map', {
        get : function() {
            return this.core.getMap();
        },
        set : function(val) {}
    });
    this.controlMode = this.browser.getControlMode();
    this.loadingQueue = null;
    this.processQueue = null;

    // inti roi point
    this.init();
};


Roi.Fetch = function(config, browser, options, clb) {
    if (typeof options === 'function') {
        clb = options;
        options = null;
    }
    var done = function(json) {
        if (typeof json === 'object' && json !== null) {
            if (typeof json['type'] === 'string' 
                && typeof Roi.Type[json['type']] === 'function') {
                clb(null, new Roi.Type[json['type']](json, browser, options));
                return;
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

    if (typeof config === 'string') {
        // async load of config at URL and call processConfig again (with object)
        utils.loadJSON(config, done, function(error) {
            var err = new Error('Unable to download configuration JSON');
            console.error(err);
            clb(err);
            return;
        });
        return;
    } else if (typeof config !== 'object' 
        || config === null) {
        var err = new Error('Unknown configuration format passed to Pano browser')
        console.error(err);
        clb(err);
        return;
    }

    done(config);
};


/**
 * To be fullfilled by specific roi types [type : class]
 */
Roi.Type = {
    'photo': RoiPhoto,
    'pano': RoiPano,
    'location': RoiLocation
};


/**
 * Roi object states.
 * @enum {number}
 */
Roi.State = {
    Created : 0,
    Ready : 1,
    FadingIn : 2,
    Presenting : 3,
    FadingOut : 4,
    Error : -1
};


// Public methods

Roi.prototype.delve = function(enterPosition) {
    if (this.state === Roi.State.Created 
        || this.state === Roi.State.FadingOut) {
        this.develAtFinishRequested = true;
        return;
    } else if (this.state === Roi.State.FadingIn) {
        this.leaveAtFinishRequested = false;
        return;
    } else if (this.state !== Roi.State.Ready) {
        return;
    }

    this.state = Roi.State.FadingIn;

    this.enterPosition = this.core.getMap().getPosition();

    this.core.getMap().setPosition(this.refPosition);
    this.controlMode.setCurrentControlMode(this.defaultControlMode
                                            , this.defaultControlModeConfig);

    this.state = Roi.State.Presenting;

    // TODO flight into roi position and blend with custom render
}


Roi.prototype.leave = function() {
    if (this.state === Roi.State.Created 
        || this.state === Roi.State.FadingOut) {
        this.develAtFinishRequested = false;
        return;
    } else if (this.state === Roi.State.FadingIn) {
        this.leaveAtFinishRequested = true;
        return;
    } else if (this.state !== Roi.State.Presenting) {
        return;
    }

    this.state = Roi.State.FadingOut;

    this.core.getMap().setPosition(this.enterPosition);
    this.controlMode.setDefaultControlMode();

    this.state = Roi.State.Ready;

    // TODO flight into roi position and blend with custom render
};


Roi.prototype.deinit = function() {
    // remove tick listener
    this.browser.off('tick', this.tickClb); 
    this.tickClb = null;

    this.core.off('map-position-changed', this.updateClb); 
    this.updateClb = null;
};


Roi.prototype.setNeedsRedraw = function() {
    this.needsRedraw = true;
};


// Accessor methods

Roi.prototype.state = function() {
    return this.state;
}


Roi.prototype.config = function() {
    return this.config;
};


// Public accessors

Roi.prototype.alpha = function(alpha) {
    if (typeof alpha !== "number") {
        return this.alpha;
    }
    if (alpha < 0.0) {
        alpha = 0.0;
    }
    if (alpha > 1.0) {
        alpha = 1.0;
    }
    if (alpha === this.alpha) {
        return;
    }
    this.alpha = alpha;
    this.update();
    this.setNeedsRedraw();
};

// Protected methods

/**
 * Parent class (this class) init method MUST be caled from overidden method. 
 */
Roi.prototype.init = function() {
    // Process options
    if (typeof this.options === 'object' && this.options !== null) {
        if (this.options.loadingQueue instanceof RoiLoadingQueue) {
            this.loadingQueue = this.options.loadingQueue;
        } else {
            var opts = this.options.loadingQueueOptions;
            this.loadingQueue = new RoiLoadingQueue(opts);    
        }

        if (this.options.processQueue instanceof RoiProcessQueue) {
            this.processQueue = this.options.processQueue;
        } else {
            var opts = this.options.processQueueOptions;
            this.processQueue = new RoiProcessQueue(opts);
        }
    } else {
        this.loadingQueue = new RoiLoadingQueue();
        this.processQueue = new RoiProcessQueue();
    }

    // Process configuration file
    if (typeof this.config !== 'object' || this.config === null) {
        this.state = Roi.State.Error;
        var err = new Error('Config passed to ROI constructor is not object');
        console.error(err);
        return;
    }
    this.processConfig();
    
    // If processing of configuration is successfull 
    // (configuration JSON is valid) proceed to finalize initialization
    if (this.state != Roi.State.Error) {
        this.initFinalize();
    }
};


/**
 * Parent class (this class) init method MUST be caled from overidden method. 
 */
Roi.prototype.processConfig = function() {
    var err = null;
    if (typeof this.config['id'] !== 'string') {
        err = new Error('Missing (or type error) ROI id in config JSON');
    } else if (!this instanceof Roi.Type[this.config['type']]) {
        err = new Error('ROI type in config JSON missing or is not registered');
    } else if (!this.config['position'] instanceof Array
// TODO!! check position sanity
               ) {//|| !this.core.map.positionSanity(this.config['position'])) {
        err = new Error('ROI position in config JSON missing or is not valid');
    } else if (typeof this.config['title'] !== 'string') {
        err = new Error('Missing (or type error) ROI title in config JSON');
    }

    if (err !== null) {
        this.state = Roi.State.Error;
        console.error(err);
    } else {
        this.id = this.config['id'];
        this.title = this.config['title'];
        this.type = this.config['type'];
        this.refPosition = this.config['position'];
    }
};


/**
 * Parent class (this class) init method MUST be caled from overidden method. 
 */
Roi.prototype.initFinalize = function() {
    // Change state and go ...
    this.state = Roi.State.Ready;

    // TODO hook up on map.position changed event (this.update method)
    this.updateClb = function() {
        this.update();
    }.bind(this);
    this.core.on('map-position-changed', this.updateClb);

    // hook up on browser tick method
    this.tickClb = function() {
        this.tick();
    }.bind(this);
    this.browser.on('tick', this.tickClb);

    // Devel in if requested
    if (this.develAtFinishRequested) {
        this.develAtFinishRequested = false;
        this.devel();
    }
};


// Private methods

Roi.prototype.tick = function() {
    this.processQueue.tick();

    //if (this.needsRedraw) {
        this.needsRedraw = false;
        this.draw();
};


Roi.prototype.draw = function() {
    // nop
};


Roi.prototype.update = function() {
    // nop   
};


export default Roi;
