/**
 * @constructor
 */
Melown.Core = function(element_, options_) {
    this.element_ = element_;
    this.options_ = options_;
    this.coreConfig_ = new Melown.CoreConfig(options_);
    this.ready_ = false;
    this.killed_ = false;
    this.listeners_ = [];
    this.listenerCounter_ = 0;

    this.map_ = null;
    this.mapInterface_ = null;
    this.renderer_ = new Melown.Renderer(this, this.element_, null, false);
    this.rendererInterface_ = new Melown.RendererInterface(this.renderer_);
    this.proj4_ = window["_mproj4_"];


    //platform detection
    Melown.Platform.init();

    this.loadMap(this.coreConfig_.map_);

    window.requestAnimFrame(this.onUpdate.bind(this));
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
        this.map_ = new Melown.Map(this, data_, path_);
        this.mapInterface_ = new Melown.MapInterface(this.map_);
        this.callListener("map-loaded", {});
    }).bind(this);

    var onError_ = (function() {
    }).bind(this);


    Melown.loadJSON(path_, onLoaded_, onError_);
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






