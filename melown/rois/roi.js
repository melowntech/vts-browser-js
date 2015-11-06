/**
 * A ROI instance constructor
 * @constructor
 */
Melown.Roi = function(config_, renderer_) {
    this.config_ = config_;
    this.renderer_ = renderer_;

    // runtime modules
    this.loader_ = null;

    // state properties
    this.state_ = Melown.Roi.State.Created;

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

Melown.Roi.delve = function() {

}

Melown.Roi.leave = function() {

}

// Accessor methods

Melown.Roi.prototype.state = function() {
    return this.state_;
}

Melown.Roi.prototype.config = function() {

}

Melown.Roi.observerPosition = function() {

}

Melown.Roi.orientation = function(yaw, pitch) {

}

// Private methods

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