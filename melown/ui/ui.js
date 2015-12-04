/**
 * @constructor
 */
Melown.UI = function(browser_, element_) {
    this.browser_ = browser_;
    this.config_ = browser_.config_;
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
    this.layers_ = new Melown.UIControlLayers(this);
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

Melown.UI.prototype.setControlHtml = function(id_, html_) {
    if (this.controls_[id_] != null) {
        this.controls_[id_].updateHTML(html_);
    }
};

Melown.UI.prototype.setControlDisplayState = function(id_, state_) {
    if (this.controls_[id_] != null) {
        this.controls_[id_].setDisplayState(state_);
    }
};

Melown.UI.prototype.getControlDisplayState = function(id_) {
    if (this.controls_[id_] != null) {
        this.controls_[id_].getDisplayState(state_);
    }
};

Melown.UI.prototype.getControlById = function(id_) {
    return this.controls_[id_];
};

Melown.UI.prototype.getMapControl = function() {
    return this.map_;
};

Melown.UI.prototype.setParam = function(key_) {
    switch (key_) {
        case "controlCompass":     this.compass_.setDisplayState(this.config_.controlCompass_); break;
        case "controlZoom":        this.zoom_.setDisplayState(this.config_.controlZoom_); break;
        //case "controlMeasure":     this.layers_.setDisplayState(this.config_.controlCompass_); break;
        case "controlScale":       this.scale_.setDisplayState(this.config_.controlScale_); break;
        case "controlLayers":      this.layers_.setDisplayState(this.config_.controlLayers_); break;
    }
};

Melown.UI.prototype.tick = function() {
    this.compass_.update();
};

