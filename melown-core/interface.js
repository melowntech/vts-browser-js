
Melown.MapCore = function(element_, config_) {
    return new Melown.CoreInterface(element_, config_);
};

/**
 * @constructor
 */
Melown.CoreInterface = function(element_, config_) {
    this.browser_ = new Melown.Core(element_, config_);
    this.core_ = this.browser_.getCore();
    this.map_ = this.core_.getMap();
};

Melown.CoreInterface.prototype.getMap = function() {
    this.core_.getMap();
};

Melown.CoreInterface.prototype.getRenderer = function() {
    this.core_.getRenderer();
};

Melown.CoreInterface.prototype.on = function(eventName_, call_) {
    this.core_.on(eventName_, call_);
};


//prevent minification
Melown["MapCore"] = Melown.Core;
Melown.CoreInterface.prototype["getMap"] = Melown.CoreInterface.prototype.getMap;
Melown.CoreInterface.prototype["getRenderer"] = Melown.CoreInterface.prototype.getRenderer;
Melown.CoreInterface.prototype["on"] = Melown.CoreInterface.prototype.on;
Melown["getVersion"] = Melown.getVersion;
Melown["checkSupport"] = Melown.checkSupport;






