Melown.Pano = function(browser_, config_) {
    this.browser_ = browser_;
    this.config_ = config_;

    // state properties
    this.state_ = Melown.Pano.State.Created;
    this.orientation_ = {
        yaw_ : 0,
        pitch_ : 0,
    }
    this.fov_ = 1;

    this._init();
}

Melown.Pano.State = {
    Created : 'created',
    Ready : 'ready',
    FadingIn : 'fadingin',
    Presenting : 'presenting',
    FadingOut : 'fadingout',
    Error : 'error'
}

// Public methods

Melown.Pano.devle = function() {
    // devlve from map to Pano (to be implemented with browser)
}

Melown.Pano.leave = function() {
    // leave from pano to map (to be implemented with browser)
}

// Accessor methods

Melown.Pano.prototype.state = function() {
    return this.state_;
}

Melown.Pano.prototype.config = function() {
    return this.config_;
}

Melown.Pano.observerPosition = function() {
    // TODO must be implemented browser function to convert positions
}

Melown.Pano.orientation = function(yaw, pitch) {
    if (yaw === undefined) {
        return this.orientation_;
    }

    // TODO check orientation bounds

    this.orientation_.yaw_ = yaw;
    this.orientation_.pitch_ = pitch;

    this.update_();
}

// TODO zoom methods

// Private methods

Melown.Pano.prototype._init = function() {
    // check browser instance
    // load and parse configuration file
    // prepare UI
}

Melown.Pano.prototype._processConfig = function(config_) {
    if (typeof config_ === 'string') {
        // TODO async load of config at URL and call processConfig again (with object)
    } else if (typeof config_ !== 'object' 
        || config_ === null 
        || config_ === undefined) {
        throw new Error('Unknown configuration format passed to Pano browser');
    }

    // TODO process config
    // save processed config to this.config_
}

Melown.Pano.prototype._update = function() {
    // calc visible area
    // zoom
    // prepare reasources

    // render
    this._draw();
}

Melown.Pano.prototype._draw = function() {
    // prepare all billboards and draw them seqs.
    this.browser_.drawBillboard(/* TODO */);
}
