
if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

window["MelownInterfaceCommand_"] = function(){};
window["MelownShareLink_"] = false;
Melown.HomepageUrl = "https://www.melown.com/maps/";

//GOOGLE ANALYTICS STUFF
if (window["_gaq"] ==  null) {
    window["_gaq"] = [];
}

//---------------------------
// PUBLIC METHODS
//---------------------------


/**
 * @constructor
 */
Melown.Browser = function(config_)
{
    this.params_ = {};
    this.params_.urlParams_ = this.getParamsFromURL();

    Melown.InterfaceBuilder();

    //check Melown support (webgl)
    if (Melown.checkSupport() == false) {

    } else {
        this.core_ = new Melown.Core('melown-engine-canvas-3d', null, this.browserConfig_, null, null, this.params_.urlParams_["screenshots"] == "1");
    }

    this.autopilot_ = new Melown.Autopilot(this, this.onAutopilotFlightFinished.bind(this), this.onAutopilotUpdate.bind(this));
    this.interface_ = new Melown.Interface(this);

    if (this.core_ == null) {
        this.interface_.showNoWebGLScreen();
    } else {
        this.core_.loadMap(this.currentMapUrl_, this.browserConfig_, this.onBrowserInitialized.bind(this), this.onBrowserUpdate.bind(this));
    }

    this.setConfiguration(config_);
};


//SET CONFIG
Melown.Browser.prototype.setConfiguration = function(config_) {

    var urlParams_ = this.params_.urlParams_;
    this.params_.config_ = (config_ != null) ? config_ : {};
    this.params_.urlParams_ = urlParams_;

    this.applyUrlParams();
    this.applyConfigParams();
};


//ON
Melown.Browser.prototype.on = function(name_, listener_) {
    if (listener_ == null) {
        return;
    }

    this.listenerCounter_++;
    this.listeners_.push({ name_ : name_, listener_ : listener_, id_ : this.listenerCounter_ });

    return (function(id_){ this.removeListener(id_); }).bind(this, this.listenerCounter_);
};

//---------------------------
// PRIVATE METHODS
//---------------------------


Melown.Browser.prototype.onBrowserUpdate = function(dirty_) {
    this.frameTime_ = (new Date()).getTime();

    this.autorotateUpdate();

    if (dirty_ == true) {
        this.interface_.onBrowserUpdate();
    }

    if (this.interface_.statsGraphsVisible_ == true) {
        this.interface_.updateStatsGraphs();
    }

    this.lastFrameTime_ = this.frameTime_;

    this.callListener("tick", {});

    if (dirty_ == true) {
        this.callListener("update", {});
    }
};



//LISTENERS
Melown.Browser.prototype.callListener = function(name_, event_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].name_ == name_) {
            this.listeners_[i].listener_(event_);
        }
    }
};

Melown.Browser.prototype.removeListener = function(id_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].id_ == id_) {
            //this.listeners_[i].splice(i, 1);
            this.listeners_.splice(i, 1);
            return;
        }
    }
};


//prevent minification
Melown["Engine"] = Melown.Browser;
Melown.Browser.prototype["on"] = Melown.Browser.prototype.on;

