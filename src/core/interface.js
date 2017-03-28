require('./_minify.js');
require('core/core');
require('core/config');
require('core/update');

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
    this.core_.destroy();
    this.core_ = null;
};

Melown.CoreInterface.prototype.getMap = function() {
    if (!this.core_) { return null; }
    return this.core_.getMapInterface();
};

Melown.CoreInterface.prototype.loadMap = function(path_) {
    if (!this.core_) { return null; }
    return this.core_.loadMap(path_);
};

Melown.CoreInterface.prototype.destroyMap = function() {
    if (!this.core_) { return null; }
    return this.core_.destroyMap();
};

Melown.CoreInterface.prototype.getRenderer = function() {
    if (!this.core_) { return null; }
    return this.core_.getRendererInterface();
};

Melown.CoreInterface.prototype.getProj4 = function() {
    if (!this.core_) { return null; }
    return this.core_.getProj4();
};

Melown.CoreInterface.prototype.on = function(eventName_, call_) {
    if (!this.core_) { return null; }
    this.core_.on(eventName_, call_);
};

Melown.CoreInterface.prototype.callListener = function(name_, event_) {
    if (!this.core_) { return null; }
    this.core_.callListener(name_, event_);
};
