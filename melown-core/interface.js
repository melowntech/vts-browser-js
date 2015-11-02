
Melown.MapCore = function(element_, config_) {
    element_ = (typeof divId_ !== "string") ? element_ : document.getElementById(divId_);

    if (Melown.checkSupport()) {
        return new Melown.CoreInterface(element_, config_);
    } else {
        return null;
    }
};

/**
 * @constructor
 */
Melown.CoreInterface = function(element_, config_) {
    this.core_ = new Melown.Core(element_, config_);
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






