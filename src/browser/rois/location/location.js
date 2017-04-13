/**
 * Photo class - specific Roi type class for rendering simple photo.
 * @constructor
 * @final
 * @extends {Roi}
 */
var RoiLocation = function(config, core, options) {
    this.navExtents = null;
    this.navControl = null;

    this.super = Roi.prototype;
    Roi.call(this, config, core, options);
};


// Inheritance from Roi
RoiLocation.prototype = Object.create(Roi.prototype);
RoiLocation.prototype.constructor = RoiLocation;

// Protected methods

RoiLocation.prototype.init = function() {
    // prepare UI

    this.super.init.call(this);
};


RoiLocation.prototype.processConfig = function() {
    this.super.processConfig.call(this);

    if (this.state === Roi.State.Error) {
        return;
    }

    var err = null;
    if (typeof this.config['location'] !== 'object'
        || this.config['location'] === null) {
        err = new Error('Missing (or type error) location key in config JSON');
    } else if (!this.config['location']['navControl'] instanceof Array
        || this.config['location']['navExtents'].length !== 4) {
        err = new Error('Missing (or type error) location.navExtents in config JSON');
    } else if (typeof this.config['location']['navControl'] !== 'string') {
        err = new Error('Missing (or type error) location.navControl in config JSON');
    }

    if (err) {
        this.state = Roi.State.Error;
        console.error(err);
    } else {
        this.navControl = this.config['location']['navControl'];
        this.navExtents = this.config['location']['navExtents'];
    }
};

// Public accessors

RoiLocation.prototype.alpha = function(alpha) {
    if (typeof alpha !== "number") {
        return this.alpha;
    }

    // Location roi is allways transparent
    alpha = 0.0;

    this.super.alpha.call(this, alpha);
};


export default RoiLocation;
