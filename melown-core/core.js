
window["MelownMobile_"] = true;
window["MelownScreenScaleFactor_"] = 1.0;
Melown.mobileScaleFactor_ = 0.5;

/**
 * @constructor
 */
Melown.Core = function(divId_, mapConfig_, browserConfig_)
{
    this.panDeltas_ = [];
    this.orbitDeltas_ = [];
    this.distanceDeltas_ = [];
    this.renderer_ = null;
    this.mapConfig_ = null;
    this.browserConfig_ = null;
    this.updateCallback_ = null;
    this.ready_ = false;
    this.killed_ = false;
    this.div_ = null;
    this.keepFrameBuffer_ = null; //TODO: use browser config
    this.currentLayer_ = null;
    this.oldViewHeight_ = null;
    this.listeners_ = [];
    this.listenerCounter_ = 0;

    this.lastPosition_ = [0,0,0];
    this.lastOrientation_ = [0,0,0];
    this.lastFov_ = 45.0;

    //mobile
    Melown.Platform.init();
    window["MelownMobile_"] = Melown.Platform.isMobile();

    //this.logGA('WebGL', "0");
    //this.logGA('OperatingSystem', Melown.Platform.OS);
    //this.logGA('WebBrowser', Melown.Platform.browser + " " + Melown.Platform.version);

    /*
    if (window["MelownMobile_"] == true) {
        window["MelownScreenScaleFactor_"] = Melown.mobileScaleFactor_;
        document.getElementById("Melown-engine-canvas-3d").style.width = "100%";
        document.getElementById("Melown-engine-canvas-3d").style.height = "100%";
    }*/

    //get div element
    if (typeof divId_ === "string") {
        this.div_ = document.getElementById(divId_);
    } else if (typeof divId_ === "object") {
        this.div_ = divId_;
    }

    if (this.div_ == null) {
        //div does not exist
        this.callListener("initialized", { "ready": false, "message": "DOM element does not exist" });

        return;
    }

    var callLoadMap_ = (function(){
        this.loadMap(mapConfig_, browserConfig_);
    }).bind(this);

    if (mapConfig_ != null) {
        window.setTimeout(callLoadMap_, 1);
    }
};

/*
function on(string eventName, funtion listener)

    Creates listener for the engine events.
    name: name of listened event
    listener: function which will be called when event occur. Function will be called with these parameters: function(event).
    Returns: deregistration function for this listener

* */

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

Melown.getVersion = function() {
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






