// Presentation module goes here
/**
 * @constructor
 */

Melown.Presentation = function(browser_, config_) {
    this.Utils.browser_ = browser_;
    this.Utils.id_ = [];
    this.Utils.config_ = config_ || {};
    this.Utils.active_ = null;
    if(typeof config_ !== 'undefined')
        this.play();
};

Melown.Presentation.prototype.add = function(id_, source_) {
    if(Object.keys(this.Utils.config_).length !== 0) {
        this.Utils.config_.presentation[id_] = source_;
    }
    else if(typeof id_ !== 'undefined') {
        this.Utils.config_['presentation'] = {}
        this.Utils.config_.presentation[id_] = source_;
    }
};

Melown.Presentation.prototype.remove = function(id_) {
    if(typeof id_ !== 'undefined') {
        if(this.active() == id_)
            this.stop();
        delete this.Utils.config_.presentation[id_]
        if(this.active() === id_)
            this.Utils.active_ = null;
    }
    else {
        if(this.active() !== null)
            this.stop();
        this.Utils.config_ = {}; // Remove all presentations
        this.Utils.active_ = null;
    }
    return true;
};

Melown.Presentation.prototype.active = function() {
    return this.Utils.active_;
};

Melown.Presentation.prototype.play = function(id_) {
    if(this.Utils.config_.presentation_autoplay !== undefined && typeof id_ === 'undefined')
        id_ = this.Utils.config_.presentation_autoplay;
    else if(typeof id_ === 'undefined' && this.Utils.config_.presentation !== undefined && Object.keys(this.Utils.config_.presentation).length > 0) {
        for(var key in this.Utils.config_.presentation) {
            id_ = key;
            break;
        }
    }
    
    if(typeof id_ !== 'undefined') {
        this.Utils.active_ = id_;
        this.Utils.readTextInput(id_);
        return true;
    }
    else
        return false;
};

Melown.Presentation.prototype.stop = function() {
    var active = this.active();
    if(active !== null) {
        //this.remove(id_);
        this.Utils.active_ = null;
        this.Utils.browser_.removeControl(active);
        document.getElementsByTagName('article')[0].parentNode.parentNode.parentNode.remove();
        return true;
    }
    return false;    
};

Melown.Presentation.prototype.list = function(id_) {
    if(Object.keys(this.Utils.config_).length === 0 || Object.keys(this.Utils.config_.presentation).length === 0)
        return 'No presentations present';
    if(typeof id_ !== 'undefined') {
        var list = [];
        for(var key in this.Utils.config_.presentation) {
            if(id_ == key) return this.Utils.config_.presentation[key];
        }
    }
    else
        return this.Utils.config_.presentation;
};

Melown.Presentation.prototype.Utils = {
    aTags : null,
    sectionTags : null,
    defaultHeight : 0, // Changes based on presentation's height
    maxHeight : 0, // Height of inner container to be set
    subtitlesHeights : [], // Set of heights after init() for subtitles

    firstTitleMargin : 20, // First slide of presentation has some css margin-top, so here we use it
    swipeOffset : 60, // Height of swipeControl

    actualNode : 0,
    maxNodes : 1,
    animTime : 600, // Default css transition time
    activeToolbox : 'panel' // Default active toolbox (panel | subtitles)
};

