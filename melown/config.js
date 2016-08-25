
Melown.Browser.prototype.initConfig = function(data_) {
    this.config_ = {
        panAllowed_ : true,
        rotationAllowed_ : true,
        zoomAllowed_ : true,
        jumpAllowed_ : false,
        inertia_ : 1.1,
        positionInUrl_ : false,
        positionUrlHistory_ : false,
        navigationMode_ : "free",
        controlCompass_ : true,
        controlZoom_ : true,
        controlSpace_ : true,
        controlMeasure_ : false,
        controlLink_ : false,
        controlScale_ : true,
        controlLayers_ : false,
        autoRotate_ : 0,
        autoPan_ : [0,0]
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
        case "position":           this.config_.position_ = value_;                                              break;
        case "view":               this.config_.view_ = value_;                                                  break;
        case "panAllowed":         this.config_.panAllowed_ = Melown.Utils.validateBool(value_, true);           break;
        case "rotationAllowed":    this.config_.rotationAllowed_ = Melown.Utils.validateBool(value_, true);      break;
        case "zoomAllowed":        this.config_.zoomAllowed_ = Melown.Utils.validateBool(value_, true);          break;
        case "jumpAllowed":        this.config_.jumpAllowed_ = Melown.Utils.validateBool(value_, false);         break;
        case "inertia":            this.config_.inertia_ = Melown.Utils.validateNumber(value_, 0, 0.99, 0.9);    break;
        case "navigationMode":     this.config_.navigationMode_ = value_;                                        break;
        case "positionInUrl":      this.config_.positionInUrl_ = Melown.Utils.validateBool(value_, false);       break;
        case "positionUrlHistory": this.config_.positionUrlHistory_ = Melown.Utils.validateBool(value_, false);  break;
        case "controlCompass":     this.config_.controlCompass_ = Melown.Utils.validateBool(value_, true); this.updateUI(key_);   break;
        case "controlZoom":        this.config_.controlZoom_ = Melown.Utils.validateBool(value_, true); this.updateUI(key_);      break;
        case "controlMeasure":     this.config_.controlMeasure_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);  break;
        case "controlScale":       this.config_.controlScale_ = Melown.Utils.validateBool(value_, true); this.updateUI(key_);     break;
        case "controlLayers":      this.config_.controlLayers_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);   break;
        case "controlSpace":       this.config_.controlSpace_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);    break;
        case "controlLink":        this.config_.controlLink_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);     break;
        case "controlLogo":        this.config_.controlLogo_ = Melown.Utils.validateBool(value_, false); this.updateUI(key_);     break;
        case "rotate":             this.config_.autoRotate_ = Melown.Utils.validateNumber(value_, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0); break;
        case "pan":
        
                if (Array.isArray(value_) && value_.length == 2){
                    this.config_.autoPan_ = [
                        Melown.Utils.validateNumber(value_[0], Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, 0),
                        Melown.Utils.validateNumber(value_[1], -360, 360, 0)
                    ];
                }
        
            break;

    }

    if (ignoreCore_ == true) {
        if ((key_.indexOf("map") == 0 || key_.indexOf("mario") == 0) && this.core_.getMap()) {
            this.core_.getMap().setConfigParam(key_, value_);
        }

        if (key_.indexOf("renderer") == 0) {
            this.core_.getRenderer().setConfigParam(key_, value_);
        }
    }
};

Melown.Browser.prototype.getConfigParam = function(key_) {
    switch (key_) {
        case "pos":
        case "position":           return this.config_.position_;
        case "view":               return this.config_.view_;
        case "panAllowed":         return this.config_.panAllowed_;
        case "rotationAllowed":    return this.config_.rotationAllowed_;
        case "zoomAllowed":        return this.config_.zoomAllowed_;
        case "jumpAllowed":        return this.config_.jumpAllowed_;
        case "inertia":            return this.config_.inertia_;
        case "navigationMode":     return this.config_.navigationMode_;
        case "positionInUrl":      return this.config_.positionInUrl_;
        case "positionUrlHistory": return this.config_.positionUrlHistory_;
        case "controlCompass":     return this.config_.controlCompass_;
        case "controlZoom":        return this.config_.controlZoom_;
        case "controlMeasure":     return this.config_.controlMeasure_;
        case "controlScale":       return this.config_.controlScale_;
        case "controlLayers":      return this.config_.controlLayers_;
        case "controlSpace":       return this.config_.controlSpace_;
        case "controlLink":        return this.config_.controlLink_;
        case "controlLogo":        return this.config_.controlLogo_;
        case "rotate":             return this.config_.autoRotate_;
        case "pan":                return this.config_.autoPan_;
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


