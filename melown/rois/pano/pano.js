'use strict'

Melown.Pano = function(browser_, config_) {
    this.browser_ = browser_;
    this.config_ = config_;

    // state properties
    this.state_ = Melown.Pano.State.Created;

    this._init();
}

Melown.Pano.State = {
    Created = 'created',
    Ready = 'ready',
    FadingIn = 'fadingin',
    Presenting = 'presenting',
    FadingOut = 'fadingout',
    Error = 'error'
}

// Public methods

Melown.Pano.devle = function() {

}

Melown.Pano.leave = function() {

}

// Accessor methods

Melown.Pano.prototype.state = function() {
    return this.state_;
}

Melown.Pano.prototype.config = function() {

}

Melown.Pano.observerPosition = function() {

}

Melown.Pano.orientation = function(yaw, pitch) {

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
