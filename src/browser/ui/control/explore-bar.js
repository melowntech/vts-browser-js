
var ExploreBar = function(browser) {
    this.browser = browser;

    // state properties
    this.position = null;

    this.init();
};

// Accessor methods

ExploreBar.prototype.position = function(position) {
    if (position === undefined) {
        return this.position;
    }
};


ExploreBar.prototype.rois = function() {

};

// Private methods

ExploreBar.prototype.init = function() {
    // check browser
    // read config
    // prepare UI
    // hook on
    this.browser.on('positionchanged', this.positionChanged.bind(this));
};


ExploreBar.prototype.positionChanged = function(event) {

};


export default ExploreBar;
