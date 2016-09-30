
Melown.MapCore = function(element_, config_) {
    element_ = (typeof element_ !== "string") ? element_ : document.getElementById(element_);

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
    this.core_ = new Melown.Core(element_, config_, this);
    this.map_ = this.core_.getMap();
};

Melown.CoreInterface.prototype.destroy = function() {
    return this.core_.destroy();
};

Melown.CoreInterface.prototype.getMap = function() {
    return this.core_.getMapInterface();
};

Melown.CoreInterface.prototype.loadMap = function(path_) {
    return this.core_.loadMap(path_);
};

Melown.CoreInterface.prototype.destroyMap = function() {
    return this.core_.destroyMap();
};

Melown.CoreInterface.prototype.getRenderer = function() {
    return this.core_.getRendererInterface();
};

Melown.CoreInterface.prototype.getProj4 = function() {
    return this.core_.getProj4();
};

Melown.CoreInterface.prototype.on = function(eventName_, call_) {
    this.core_.on(eventName_, call_);
};

Melown.CoreInterface.prototype.callListener = function(name_, event_) {
    this.core_.callListener(name_, event_);
};

//prevent minification
Melown["MapCore"] = Melown.MapCore;
Melown["mapCore"] = Melown.MapCore;
Melown.CoreInterface.prototype["destroy"] = Melown.CoreInterface.prototype.destroy;
Melown.CoreInterface.prototype["loadMap"] = Melown.CoreInterface.prototype.loadMap;
Melown.CoreInterface.prototype["destroyMap"] = Melown.CoreInterface.prototype.destroyMap;
Melown.CoreInterface.prototype["getMap"] = Melown.CoreInterface.prototype.getMap;
Melown.CoreInterface.prototype["getRenderer"] = Melown.CoreInterface.prototype.getRenderer;
Melown.CoreInterface.prototype["on"] = Melown.CoreInterface.prototype.on;
Melown.CoreInterface.prototype["callListener"] = Melown.CoreInterface.prototype.callListener;
Melown["getVersion"] = Melown.getVersion;
Melown["checkSupport"] = Melown.checkSupport;






