
/**
 * @constructor
 */
Melown.Core = function(element_, config_, interface_) {
    this.initConfig();
    this.configStorage_ = {}; 
    this.setConfigParams(config_);
    this.element_ = element_;
    this.interface_ = interface_;
    //this.options_ = options_;
    this.ready_ = false;
    this.killed_ = false;
    this.listeners_ = [];
    this.listenerCounter_ = 0;
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
        this.map_.kill();
        this.map_ = null;
        this.mapInterface_ = null;
        this.callListener("map-unloaded", {});
    }

    if (path_ == null) {
        return;
    }

    var onLoaded_ = (function(data_) {
        this.callListener("map-mapconfig-loaded", data_);

        this.map_ = new Melown.Map(this, data_, path_, this.config_);
        this.mapInterface_ = new Melown.MapInterface(this.map_);
        this.setConfigParams(this.map_.browserOptions_);
        this.setConfigParams(this.configStorage_);

        //MEGA HACK!!!!
        /*
        if (this.map_.config_.mario_) {
            if (!(
                this.map_.getSurface("egm96-geoid") ||
                this.map_.getSurface("srtm-arc-sec-world") ||
                this.map_.getSurface("aster-world") ||
                this.map_.getSurface("viewfinder-world") ||
                
                this.map_.getSurface("melown-egm96-geoid") ||
                this.map_.getSurface("melown-srtm-arc-sec-world") ||
                this.map_.getSurface("melown-aster-world") ||
                this.map_.getSurface("melown-viewfinder-world")

                )) {

                this.map_.config_.mapDisableCulling_ = true;
            }            
        }*/

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

    var onError_ = (function() {
    }).bind(this);

    var onAutorizationLoaded_ = (function(data_) {
        this.config_.token_ = "?token=" + data_["token"];
        this.tokenExpiration_ = data_["expires"] * 1000;
        this.tokenExpirationCallback_ = (function(){
            this.tokenExpiration_ = null;
            this.tokenExpirationLoop_ = true;
            Melown.loadJSON(this.config_.authorization_, onAutorizationLoaded_, onAutorizationError_, null, Melown["useCredentials"]);
        }).bind(this);
        if (!this.tokenExpirationLoop_) {
            onLoadMapconfig(this.config_.token_);
        } else {
            Melown.loadJSON(path_ + this.config_.token_, null, null, null, Melown["useCredentials"]);
        }
    }).bind(this);

    var onAutorizationError_ = (function() {
        console.log("auth token not loaded");
    }).bind(this);

    this.tokenExpirationLoop_ = false;

    var baseUrl_ = path_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    var onLoadMapconfig = function(token_) {
        Melown.loadJSON(path_ + token_, onLoaded_, onError_, null, Melown["useCredentials"]);
    };

    if (false && this.config_.authorization_) {
    //if (this.config_.authorization_) {
        if (typeof this.config_.authorization_ === "string") {
            Melown.loadJSON(this.config_.authorization_, onAutorizationLoaded_, onAutorizationError_, null, Melown["useCredentials"]);
        } else {
            this.config_.authorization_(onAutorizationLoaded_);
        }
    } else {
        onLoadMapconfig("");
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
Melown.Core.prototype.callListener = function(name_, event_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].name_ == name_) {
            this.listeners_[i].listener_(event_);
        }
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
string getVersion()

    Returns string with Melown version
*/

Melown.getCoreVersion = function() {
    return "1.65";
};


/*
bool checkSupport()

    Returns true if the environment is capable of running the WebGL browser, false otherwise.
*/

Melown.checkSupport = function()
{
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






