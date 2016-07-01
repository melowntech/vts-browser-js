// Presentation module goes here
/**
 * @constructor
 */
Melown.Presenter = function(browser_, config_) {
    this.Utils.browser_ = browser_;
    this.Utils.id_ = [];
    this.Utils.active_ = null;

    for (var key_ in config_) {
        if(key_ != 'presentation' && key_ != 'presentationAutoplay') {
            delete config_[key_];
        };
    };
    this.Utils.config_ = config_ || {};

    if(typeof config_ !== 'undefined') {
        this.presentationPlay();
    };
    this.Utils.core_ = this;
};

Melown.Presenter.prototype.presentationAdd = function(id_, source_) {
    if(Object.keys(this.Utils.config_).length !== 0) {
        this.Utils.config_.presentation[id_] = source_;
    }
    else if(typeof id_ !== 'undefined') {
        this.Utils.config_['presentation'] = {};
        this.Utils.config_.presentation[id_] = source_;
    };
};

Melown.Presenter.prototype.presentationRemove = function(id_) {
    if(typeof id_ !== 'undefined') {
        if(this.presentationActive() == id_) {
            this.presentationStop();
            this.Utils.active_ = null;
        };
        delete this.Utils.config_.presentation[id_];
        return('Removed presentation id: '+id_);            
    }
    else {
        if(this.presentationActive() !== null) {
            this.presentationStop();
        };
        this.Utils.config_ = {}; // Remove all presentations
        this.Utils.active_ = null;
        return('All presentations removed.');
    };
};

Melown.Presenter.prototype.presentationActive = function() {
    return this.Utils.active_;
};

Melown.Presenter.prototype.presentationActiveType = function() {
    return this.Utils.activeToolbox_;
};

Melown.Presenter.prototype.presentationPlay = function(id_) {
    this.presentationStop();
    if(this.Utils.config_.presentationAutoplay !== undefined && typeof id_ === 'undefined') {
        id_ = this.Utils.config_.presentationAutoplay;
    }
    else if(typeof id_ === 'undefined' && this.Utils.config_.presentation !== undefined && Object.keys(this.Utils.config_.presentation).length > 0) {
        for(var key in this.Utils.config_.presentation) {
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

Melown.Presenter.prototype.presentationStop = function() {
    var active_ = this.presentationActive();
    this.Utils.activeToolbox_ = 'right';
    if(active_ !== null) {
        //this.remove(id_);
        this.Utils.active_ = null;
        this.Utils.browser_.removeControl(active_);
        this.Utils.container_.getElementsByTagName('article')[0].parentNode.parentNode.parentNode.remove();
        return true;
    };
    return false;    
};

Melown.Presenter.prototype.presentationList = function(id_) {
    if(Object.keys(this.Utils.config_).length === 0 || Object.keys(this.Utils.config_.presentation).length === 0) {
        return 'No presentations present';
    };
    if(typeof id_ !== 'undefined') {
        for(var key in this.Utils.config_.presentation) {
            if(id_ == key) return this.Utils.config_.presentation[key];
        };
    }
    else {
        return this.Utils.config_.presentation;
    };
};

// Delete this function if it has no more use...
Melown.Presenter.prototype.getContainer = function() {
    this.Utils.container_ = this.Utils.browser_.ui_.controls_[this.presentationActive()].element_.childNodes[this.presentationActiveType() === 'right' ? 0 : 1];
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

