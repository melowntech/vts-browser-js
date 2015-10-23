/**
 * @constructor
 */
Melown.UI = function(browser_) {
    this.browser_ = browser_;

    //this.mapElement_ =

    this.engine_.on("location-changed", this.locationChanged.bind(this));
};


Melown.UI.prototype.showNoWebGLScreen = function() {
    this.setElementStyle("Melown-engine-nowebgl", "display", "block");
};


Melown.Interface.prototype.init = function() {
};

//called when map is updated
Melown.Interface.prototype.onBrowserUpdate = function() {
    this.compassUpdate();
};




