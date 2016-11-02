/**
 * @constructor
 */
Melown.UI = function(browser_, element_) {
    this.browser_ = browser_;
    this.config_ = browser_.config_;
    this.rootElement_ = element_;
    this.element_ = null;
    this.controls_ = [];
    this.killed_ = false;
    this.init();
    this.instanceId_ = Melown.InstanceCounter++;
};

Melown.UI.prototype.init = function() {
    //create browser wrapper
    this.element_ = document.createElement('div');
    this.element_.className = "melown-browser";
    this.rootElement_.appendChild(this.element_);

    //create map cotrol
    this.map_ = new Melown.UIControlMap(this);
   
    //create other ui controls
    var loading_ = true;
    this.compass_ = new Melown.UIControlCompass(this, (!loading_ && this.config_.controlCompass_));
    this.credits_ = new Melown.UIControlCredits(this, (!loading_ && this.config_.controlCredits_));
    //this.logo_ = new Melown.UIControlLogo(this, this.config_.controlLogo_);
    this.zoom_ = new Melown.UIControlZoom(this, (!loading_ && this.config_.controlZoom_));
    this.space_ = new Melown.UIControlSpace(this, (!loading_ && this.config_.controlSpace_));
    this.link_ = new Melown.UIControlLink(this, (!loading_ && this.config_.controlLink_));
    //this.navigator_ = new Melown.UIControlNavigation(this, this.config_.controlNavigator_);
    this.layers_ = new Melown.UIControlLayers(this, (!loading_ && this.config_.controlLayers_));
    this.fallback_ = new Melown.UIControlFallback(this);
    this.popup_ = new Melown.UIControlPopup(this, false);
    this.loading_ = new Melown.UIControlLoading(this, this.config_.controlLoading_);

    Melown.Utils.disableContexMenu(this.element_);
};

Melown.UI.prototype.kill = function() {
    this.killed_ = true;

    for (var key_ in this.controls_) {
        delete this.controls_[key_];
    }

    this.rootElement_.removeChild(this.element_);
    delete this.element_;
    this.element_ = null;
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
        this.controls_[id_].setHTML(html_);
    }
};

Melown.UI.prototype.setControlVisible = function(id_, state_) {
    if (this.controls_[id_] != null) {
        this.controls_[id_].setVisible(state_);
    }
};

Melown.UI.prototype.getControlVisible = function(id_) {
    if (this.controls_[id_] != null) {
        this.controls_[id_].getVisible(state_);
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
        case "controlCompass":     this.setControlVisible("comapss", this.config_.controlCompass_); break;
        case "controlZoom":        this.setControlVisible("zoom", this.config_.controlZoom_); break;
        //case "controlMeasure":     this.setControlVisible(this.config_.controlCompass_); break;
        case "controlScale":       this.setControlVisible("scale", this.config_.controlScale_); break;
        case "controlLayers":      this.setControlVisible("layers", this.config_.controlLayers_); break;
        case "controlSpace":       this.setControlVisible("space", this.config_.controlSpace_); break;
        case "controlLink":        this.setControlVisible("link", this.config_.controlLink_); break;
        case "controlLogo":        this.setControlVisible("logo", this.config_.controlLogo_); break;
        case "controlCredits":     this.setControlVisible("credits", this.config_.controlCredits_); break;
        //case "controlLoading":     this.setControlVisible("loading", this.config_.controlLogo_); break;
    }
};

Melown.UI.prototype.tick = function(dirty_) {
    if (dirty_) {
        this.compass_.update();
        this.space_.update();
        this.credits_.update();
        this.link_.updateLink();                
    }

    if (this.loading_.control_.getVisible()) {
        this.loading_.update();
    }
};

Melown.UI.prototype["addControl"] = Melown.UI.prototype.addControl;
Melown.UI.prototype["removeControl"] = Melown.UI.prototype.removeControl;
Melown.UI.prototype["setControlHtml"] = Melown.UI.prototype.setControlHtml;
Melown.UI.prototype["setControlVisible"] = Melown.UI.prototype.setControlVisible;
Melown.UI.prototype["getControlVisible"] = Melown.UI.prototype.getControlVisible;
Melown.UI.prototype["getControlById"] = Melown.UI.prototype.getControlById;


