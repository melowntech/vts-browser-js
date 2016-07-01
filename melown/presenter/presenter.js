// Presenter module goes here
/**
 * @constructor
 */
Melown.Presenter = function(browser_, config_) {
    this.Utils.browser_ = browser_;
    this.Utils.id_ = [];
    this.Utils.active_ = null;

    for (var key_ in config_) {
        if(key_ != 'presenter' && key_ != 'presenterAutoplay') {
            delete config_[key_];
        };
    };
    this.Utils.config_ = config_ || {};

    if(typeof config_ !== 'undefined') {
        this.playPresentation();
    };
    this.Utils.core_ = this;
};

Melown.Presenter.prototype.addPresentation = function(id_, source_) {
    if(Object.keys(this.Utils.config_).length !== 0) {
        this.Utils.config_.presenter[id_] = source_;
    }
    else if(typeof id_ !== 'undefined') {
        this.Utils.config_['presenter'] = {};
        this.Utils.config_.presenter[id_] = source_;
    };
};

Melown.Presenter.prototype.removePresentation = function(id_) {
    if(typeof id_ !== 'undefined') {
        if(this.activePresentation() == id_) {
            this.stopPresentation();
            this.Utils.active_ = null;
        };
        delete this.Utils.config_.presenter[id_];
        return('Removed presentation id: '+id_);            
    }
    else {
        if(this.activePresentation() !== null) {
            this.stopPresentation();
        };
        this.Utils.config_ = {}; // Remove all presentations
        this.Utils.active_ = null;
        return('All presentations removed.');
    };
};

Melown.Presenter.prototype.activePresentation = function() {
    return this.Utils.active_;
};

Melown.Presenter.prototype.activePresentationType = function() {
    return this.Utils.activeToolbox_;
};

Melown.Presenter.prototype.playPresentation = function(id_) {
    this.stopPresentation();
    if(this.Utils.config_.presenterAutoplay !== undefined && typeof id_ === 'undefined') {
        id_ = this.Utils.config_.presenterAutoplay;
    }
    else if(typeof id_ === 'undefined' && this.Utils.config_.presenter !== undefined && Object.keys(this.Utils.config_.presenter).length > 0) {
        for(var key in this.Utils.config_.presenter) {
            id_ = key;
            break;
        };
    };
    
    if(typeof id_ !== 'undefined') {
        this.Utils.active_ = id_;
        this.Utils.readTextInput(id_);
        return true;
    }
    else {
        return false;
    };
};

Melown.Presenter.prototype.stopPresentation = function() {
    var active_ = this.activePresentation();
    this.Utils.activeToolbox_ = 'right';
    if(active_ !== null) {
        this.Utils.active_ = null;
        this.Utils.browser_.removeControl(active_);
        this.Utils.container_.getElementsByTagName('article')[0].parentNode.parentNode.parentNode.remove();
        return true;
    };
    return false;    
};

Melown.Presenter.prototype.listPresentation = function(id_) {
    if(Object.keys(this.Utils.config_).length === 0 || Object.keys(this.Utils.config_.presenter).length === 0) {
        return 'No presentations present';
    };
    if(typeof id_ !== 'undefined') {
        for(var key in this.Utils.config_.presenter) {
            if(id_ == key) return this.Utils.config_.presenter[key];
        };
    }
    else {
        return this.Utils.config_.presenter;
    };
};

Melown.Presenter.prototype.Utils = {
    container_ : null,
    setContainer : function(c) {
        this.container_ = c.element_;
    },
    aTags_ : null,
    sectionTags_ : null,
    defaultHeight_ : 0, // Changes based on presentation's height
    maxHeight_ : 0, // Height of inner container to be set
    subtitlesHeights_ : [], // Set of heights after init() for subtitles

    firstTitleMargin_ : 20, // First slide of presentation has some css margin-top, so here we use it
    swipeOffset_ : 60, // Height of swipeControl

    actualNode_ : 0,
    maxNodes_ : 1,
    animTime_ : 600, // Default css transition time
    activeToolbox_ : 'right' // Default active toolbox (right | wide)
};

