// Presentation module goes here
/**
 * @constructor
 */

Melown.Presentation = function(browser_) {
    this.browser_ = browser_;
};

Melown.Presentation.prototype.add = function(id_, source_) {
        
};

Melown.Presentation.prototype.remove = function(id_) {
        
};

Melown.Presentation.prototype.active = function() {
        
};

Melown.Presentation.prototype.play = function(id_) {
        
};

Melown.Presentation.prototype.stop = function() {
        
};

Melown.Presentation.prototype.list = function(id_) {
     
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

