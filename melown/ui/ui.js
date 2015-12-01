/**
 * @constructor
 */
Melown.UI = function(browser_, element_) {
    this.browser_ = browser_;
    this.element_ = element_;
    this.controls_ = [];
    this.init();
    this.instanceId_ = Melown.InstanceCounter++;
};

Melown.UI.prototype.init = function() {
    this.map_ = new Melown.UIControlMap(this);
    this.compass_ = new Melown.UIControlCompass(this);
    this.credits_ = new Melown.UIControlCredits(this);
    this.logo_ = new Melown.UIControlLogo(this);
    this.zoom_ = new Melown.UIControlZoom(this);
    this.fallback_ = new Melown.UIControlFallback(this);
    Melown.Utils.disableContexMenu(this.element_);
};

Melown.UI.prototype.addControl = function(id_, html_, visible_) {
    var control_ = new Melown.UIControlHolder(this, html_, visible_);
    this.controls_[id_] = control_;
    return control_;
};

Melown.UI.prototype.removeControl = function(id_) {
    if (this.controls_[id_] != null) {
        delete this.controls_[id_];
    }
};

Melown.UI.prototype.setControlDisplayState = function(id_, state_) {
    if (this.controls_[id_] != null) {
        this.controls_[id_];
    }
};

Melown.UI.prototype.getControlDisplayState = function(id_) {
    if (this.controls_[id_] != null) {
        delete this.controls_[id_];
    }
};

Melown.UI.prototype.tick = function() {
    this.compass_.update();
};

Melown.UI.getMapControl = function() {
    return this.map_;
}


