Melown.ExploreBar = function(browser_) {
    this.browser_ = browser_;

    // state properties
    this._position = null;

    this._init();
};

// Accessor methods

Melown.ExploreBar.prototype.position = function(position) {
    if (position === undefined) {
        return this.position_;
    }
};

Melown.ExploreBar.prototype.rois = function() {

};

// Private methods

Melown.ExploreBar.prototype._init = function() {
    // check browser
    // read config
    // prepare UI
    // hook on
    this.browser_.on('positionchanged', this._positionChanged.bind(this));
};

Melown.ExploreBar.prototype._positionChanged = function(event) {

};
