
Melown.Browser.prototype.initConfig = function(data_) {
    this.config_ = {
        panAllowed_ : true,
        rotationAllowed_ : true,
        zoomAllowed_ : true,
        inertia_ : 1.1,
        controlCompass_ : true,
        controlZoom_ : true,
        controlMeasure_ : false,
        controlScale_ : true,
        controlLayers_ : false
    };
};

Melown.Browser.prototype.setConfigParams = function(params_, ignoreCore_) {
    if (typeof params_ === "object" && params_ !== null) {
        for (var key_ in params_) {
            this.setConfigParam(key_, params_[key_]);
        }
    }
};

Melown.Browser.prototype.updateUI = function(key_) {
    if (this.ui_ == null) {
        return;
    }

    this.ui_.setParam(key_);
};

Melown.Browser.prototype.setConfigParam = function(key_, value_, ignoreCore_) {
    switch (key_) {
        case "pos":                
        case "position":           this.config_.position_ = value_;                                           break;
        case "view":               this.config_.view_ = value_;                                               break;
        case "panAllowed":         this.config_.panAllowed_ = Melown.Utils.validateBool(value_, true);        break;
        case "rotationAllowed":    this.config_.rotationAllowed_ = Melown.Utils.validateBool(value_, true);   break;
        case "zoomAllowed":        this.config_.zoomAllowed_ = Melown.Utils.validateBool(value_, true);       break;
        case "inertia":            this.config_.inertia_ = Melown.Utils.validateNumber(value_, 0, 0.99, 0.9); break;
        case "controlCompass":     this.config_.controlCompass_ = Melown.Utils.validateBool(value_, true); this.updateUI(key_);   break;
        case "controlZoom":        this.config_.controlZoom_ = Melown.Utils.validateBool(value_, true); this.updateUI(key_);      break;
        case "controlMeasure":     this.config_.controlMeasure_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);  break;
        case "controlScale":       this.config_.controlScale_ = Melown.Utils.validateBool(value_, true); this.updateUI(key_);     break;
        case "controlLayers":      this.config_.controlLayers_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);   break;
    }

    if (ignoreCore_ == true) {
        if (key_.indexOf("map") == 0 && this.core_.getMap()) {
            this.core_.getMap().setConfigParam(key_, value_);
        }

        if (key_.indexOf("renderer") == 0) {
            this.core_.getRenderer().setConfigParam(key_, value_);
        }
    }
};

Melown.Browser.prototype.getConfigParam = function(key_) {
    switch (key_) {
        case "position":           return this.config_.position_;
        case "view":               return this.config_.view_;
        case "panAllowed":         return this.config_.panAllowed_;
        case "rotationAllowed":    return this.config_.rotationAllowed_;
        case "zoomAllowed":        return this.config_.zoomAllowed_;
        case "inertia":            return this.config_.inertia_;
        case "controlCompass":     return this.config_.controlCompass_;
        case "controlZoom":        return this.config_.controlZoom_;
        case "controlMeasure":     return this.config_.controlMeasure_;
        case "controlScale":       return this.config_.controlScale_;
        case "controlLayers":      return this.config_.controlLayers_;
    }

    if (ignoreCore_ == true) {
        if (key_.indexOf("map") == 0 && this.core_.getMap()) {
            return this.core_.getMap().getConfigParam(key_, value_);
        }

        if (key_.indexOf("renderer") == 0) {
            return this.core_.getRenderer().getConfigParam(key_, value_);
        }
    }
};


