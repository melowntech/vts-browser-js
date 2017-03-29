
/**
 * @constructor
 */
Melown.Core = function(element_, config_, interface_) {
    this.killed_ = false;
    this.initConfig();
    this.configStorage_ = {}; 
    this.setConfigParams(config_);
    this.element_ = element_;
    this.interface_ = interface_;
    //this.options_ = options_;
    this.ready_ = false;
    this.listeners_ = [];
    this.listenerCounter_ = 0;
    this.tokenCookieHost_ = null;
    this.tokenIFrame_ = null;
    this.xhrParams_ = {};
    this.inspector_ = (Melown.Inspector != null) ? (new Melown.Inspector(this)) : null;

    this.map_ = null;
    this.mapInterface_ = null;
    this.renderer_ = new Melown.Renderer(this, this.element_, null, this.onResize.bind(this), this.config_);
    this.rendererInterface_ = new Melown.RendererInterface(this.renderer_);
    this.proj4_ = window["_mproj4_"];

    //platform detection
    Melown.Platform.init();

    this.loadMap(this.config_.map_);

    window.requestAnimFrame(this.onUpdate.bind(this));
};

Melown.Core.prototype.onResize = function() {
    if (this.map_ != null) {
        this.map_.markDirty();
    }
};

Melown.Core.prototype.loadMap = function(path_) {
    if (this.map_ != null) {
        this.destroyMap();
    }

    if (path_ == null) {
        return;
    }
    
    path_ = Melown.Url.getProcessUrl(path_, window.location.href);

    this.tokenCookieLoaded_ = true;
    this.mapConfigData_ = null;
    this.tokenExpiration_ = null;
    this.tokenExpirationCallback_ = null;
    this.tokenExpirationLoop_ = false;
    this.tokenCanBeSkiped_ = true;
    this.mapRunnig_ = false;
    
    var onLoaded_ = (function() {
        if (!(this.tokenCookieLoaded_ || this.tokenCanBeSkiped_) || !this.mapConfigData_ || this.mapRunnig_) {
            return;
        }

        this.mapRunnig_ = true;
        var data_ = this.mapConfigData_; 
    
        this.callListener("map-mapconfig-loaded", data_);

        this.map_ = new Melown.Map(this, data_, path_, this.config_);
        this.mapInterface_ = new Melown.MapInterface(this.map_);
        this.setConfigParams(this.map_.browserOptions_);
        this.setConfigParams(this.configStorage_);

        if (this.config_.position_) {
            this.map_.setPosition(this.config_.position_);
            this.config_.position_ = null;
        }
    
        if (this.config_.view_) {
            this.map_.setView(this.config_.view_);
            this.config_.view_ = null;
        }
    
        this.callListener("map-loaded", { "browserOptions":this.map_.browserOptions_});
    }).bind(this);

    var onMapConfigLoaded_ = (function(data_) {
        this.mapConfigData_ = data_; 
        onLoaded_();
    }).bind(this);

    var onMapConfigError_ = (function() {
    }).bind(this);

    //this.tokenLoaded_ = true;

    var onAutorizationLoaded_ = (function(data_) {
        this.tokenLoaded_ = true;
        this.xhrParams_["token"] = data_["token"];
        this.xhrParams_["tokenHeader"] = data_["header"];
        this.tokenExpiration_ = data_["expires"] * 1000;
        this.tokenExpirationCallback_ = (function(){
            //this.tokenLoaded_ = false;
            //this.tokenCookieLoaded_ = false;
            this.tokenExpiration_ = null;
            this.tokenExpirationLoop_ = true;
            if (typeof this.config_.authorization_ === "string") {
                Melown.loadJSON(this.config_.authorization_, onAutorizationLoaded_, onAutorizationError_, null, Melown["useCredentials"], this.xhrParams_);
            } else {
                this.config_.authorization_(onAutorizationLoaded_);
            }
        }).bind(this);
        
        if (!this.tokenExpirationLoop_) {
            onLoadMapconfig(path_);
        }
        
        if (typeof this.config_.authorization_ === "string") {
            onLoadImageCookie(data_["cookieInjector"], this.config_.authorization_);
        } else {
            onLoadImageCookie(data_["cookieInjector"], path_);
        }

    }).bind(this);

    var onAutorizationError_ = (function() {
        console.log("auth token not loaded");
        
        if (this.tokenCanBeSkiped_) {
            onLoadMapconfig(path_);
        }
    }).bind(this);

    var onImageCookieLoaded_ = (function(data_) {
        document.body.removeChild(this.tokenIFrame_);
        this.tokenIFrame_ = null;   
        this.tokenCookieLoaded_ = true;
        onLoaded_();
    }).bind(this);

    var onImageCookieError_ = (function() {
        console.log("auth cookie not loaded");
    }).bind(this);

    //var baseUrl_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    var onLoadMapconfig = (function(path_) {
        Melown.loadJSON(path_, onMapConfigLoaded_, onMapConfigError_, null, Melown["useCredentials"], this.xhrParams_);
    }).bind(this);

    var onLoadImageCookie = (function(url_, originUrl_) {
        url_ = Melown.Url.getProcessUrl(url_, originUrl_);
        this.tokenCookieHost_ = Melown.Url.getHost(url_);
        //Melown.Http.imageFactory(url_, onImageCookieLoaded_, onImageCookieError_);
        var iframe_ = document.createElement('iframe');
        this.tokenIFrame_ = iframe_;
        iframe_.onload = onImageCookieLoaded_;
        iframe_.src = url_;
        iframe_.style.display = "none";
        document.body.appendChild(iframe_);   
    }).bind(this);

    //if (false && this.config_.authorization_) {
    if (this.config_.authorization_) {
        this.tokenCookieLoaded_ = false;

        if (typeof this.config_.authorization_ === "string") {
            Melown.loadJSON(this.config_.authorization_, onAutorizationLoaded_, onAutorizationError_, null, Melown["useCredentials"], this.xhrParams_);
        } else {
            this.config_.authorization_(onAutorizationLoaded_);
        }
    } else {
        onLoadMapconfig(path_);
    }

};

Melown.Core.prototype.destroy = function() {
    if (this.killed_) {
        return;
    }

    this.destroyMap();
    if (this.renderer_) {
        this.renderer_.kill();
    }
    this.element_ = null;
    this.killed_ = true;
};

Melown.Core.prototype.destroyMap = function() {
    if (this.map_) {
        this.map_.kill();
        this.map_ = null;
        this.mapInterface_ = null;
        this.callListener("map-unloaded", {});
    }
};

Melown.Core.prototype.getMap = function() {
    return this.map_;
};

Melown.Core.prototype.getMapInterface = function() {
    return this.mapInterface_;
};

Melown.Core.prototype.getRenderer = function() {
    return this.renderer_;
};

Melown.Core.prototype.getRendererInterface = function() {
    return this.rendererInterface_;
};

Melown.Core.prototype.getProj4 = function() {
    return this.proj4_;
};

Melown.Core.prototype.getOption = function(key_, value_) {
};

Melown.Core.prototype.setOption = function(key_, value_) {
};

Melown.Core.prototype.on = function(name_, listener_) {
    if (this.killed_ == true) { // || this.renderer_ == null) {
        return;
    }

    if (listener_ == null) {
        return;
    }

    this.listenerCounter_++;
    this.listeners_.push({ name_ : name_, listener_ : listener_, id_ : this.listenerCounter_ });

    return (function(id_){ this.removeListener(id_); }).bind(this, this.listenerCounter_);
};


// private
Melown.Core.prototype.callListener = function(name_, event_, log_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].name_ == name_) {
            this.listeners_[i].listener_(event_);
        }
    }
    
    if (log_) {
        console.log("event " + name_ + ": " + JSON.stringify(event_));
    }
};

// private
Melown.Core.prototype.removeListener = function(id_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].id_ == id_) {
            //this.listeners_[i].splice(i, 1);
            this.listeners_.splice(i, 1);
            return;
        }
    }
};


/*
string getCoreVersion()

    Returns string with Melown version
*/

Melown.getCoreVersion = function(full_) {
    return (full_ ? "Core: " : "") + "1.96";
};


/*
bool checkSupport()

    Returns true if the environment is capable of running the WebGL browser, false otherwise.
*/

Melown.checkSupport = function() {
    Melown.Platform.init();

    //is webgl supported
    var canvas_ = document.createElement("canvas");

    if (canvas_ == null) {
        return false;
    }

    canvas_.width = 1024;
    canvas_.height = 768;

    if (canvas_.getContext == null) {
        return false;
    }

    var gl_ = null;

    try {
        gl_ = canvas_.getContext("webgl") || canvas_.getContext("experimental-webgl");
    } catch(e) {
        return false;
    }

    if (!gl_) {
        return false;
    }

    return true;
};






