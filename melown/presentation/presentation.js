// Presentation module goes here
/**
 * @constructor
 */

Melown.Presentation = function(browser_, config_) {
    this.Utils.browser_ = browser_;
    this.Utils.id_ = [];
    this.Utils.config_ = config_ || {};
    this.Utils.active_ = null;
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
    if(typeof id_ !== 'undefined')
        delete this.Utils.config_.presentation[id_]
    else
        this.Utils.config_ = null; // Remove all presentations
    return true;
};

Melown.Presentation.prototype.active = function() {
    return this.Utils.active_;
};

Melown.Presentation.prototype.play = function(id_) {
    this.Utils.active_ = id_;
    this.Utils.readTextInput(id_);
};

Melown.Presentation.prototype.stop = function() { // To be implemented
        
};

Melown.Presentation.prototype.list = function(id_) {
    //  var list = [];
    //  for(var key in this.Utils.config_.presentation)
    //     list.push(key);
    //  return list;
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

