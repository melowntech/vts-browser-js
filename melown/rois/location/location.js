/**
 * Photo class - specific Roi type class for rendering simple photo.
 * @constructor
 * @final
 * @extends {Melown.Roi}
 */
Melown.Roi.Location = function(config_, core_, options_) {
    this.navExtents_ = null;
    this.navControl_ = null;

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);
};

// Inheritance from Roi
Melown.Roi.Location.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Location.prototype.constructor = Melown.Roi.Location;

// Register class to Roi type dictionary (used by Roi.Fetch function)
Melown.Roi.Type['location'] = Melown.Roi.Location;

// Protected methods

Melown.Roi.Location.prototype._init = function() {
    // prepare UI

    this.super_._init.call(this);
};

Melown.Roi.Location.prototype._processConfig = function() {
    this.super_._processConfig.call(this);

    if (this.state_ === Melown.Roi.State.Error) {
        return;
    }

    var err = null;
    if (typeof this.config_['location'] !== 'object'
        || this.config_['location'] === null) {
        err = new Error('Missing (or type error) location key in config JSON');
    } else if (!this.config_['location']['navControl'] instanceof Array
        || this.config_['location']['navExtents'].length !== 4) {
        err = new Error('Missing (or type error) location.navExtents in config JSON');
    } else if (typeof this.config_['location']['navControl'] !== 'string') {
        err = new Error('Missing (or type error) location.navControl in config JSON');
    }

    if (err) {
        this.state_ = Melown.Roi.State.Error;
        console.error(err);
    } else {
        this.navControl_ = this.config_['location']['navControl'];
        this.navExtents_ = this.config_['location']['navExtents'];
    }
};

// Public accessors

Melown.Roi.Location.prototype.alpha = function(alpha_) {
    if (typeof alpha_ !== "number") {
        return this.alpha_;
    }

    // Location roi is allways transparent
    alpha_ = 0.0;

    this.super_.alpha.call(this, alpha_);
};
