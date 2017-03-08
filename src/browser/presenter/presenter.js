// Presenter module goes here
/**
 * @constructor
 */
Melown.Presenter = function(browser_, config_) {
    this.container_ = null;
    this.aTags_ = null;
    this.sectionTags_ = null;
    this.defaultHeight_ = 0; // Changes based on presentation"s height
    this.maxHeight_ = 0; // Height of inner container to be set
    this.subtitlesHeights_ = []; // Set of heights after init() for subtitles

    this.firstTitleMargin_ = 20; // First slide of presentation has some css margin-top, so here we use it
    this.swipeOffset_ = 60; // Height of swipeControl

    this.actualNode_ = 0;
    this.maxNodes_ = 1;
    this.animTime_ = 600; // Default css transition time
    this.currentToolbox_ = "right"; // Default toolbox (right | wide)

    this.browser_ = browser_;
    this.id_ = [];
    this.current_ = null;

    this.presenter_ = (typeof config_["presenter"] !== "undefined") ? JSON.parse(JSON.stringify(config_["presenter"])) : {};
    this.presenterAutoplay_ = config_["presenterAutoplay"];

    if (typeof this.presenter_ !== "undefined") {
        this.playPresentation();
    }
};

Melown.Presenter.prototype.addPresentation = function(id_, source_) {
    if (Object.keys(this.presenter_).length !== 0) {
        this.presenter_[id_] = source_;
    } else if (typeof id_ !== "undefined") {
        this.presenter_ = {};
        this.presenter_[id_] = source_;
    }
};

Melown.Presenter.prototype.removePresentation = function(id_) {
    if (typeof id_ !== "undefined") {
        if (this.getCurrentPresentation() == id_) {
            this.stopPresentation();
            this.current_ = null;
        }
        delete this.presenter_[id_];
        return("Removed presentation id: "+id_);            
    } else {
        if (this.getCurrentPresentation() !== null) {
            this.stopPresentation();
        }
        this.presenter_ = {}; // Remove all presentations
        this.presenterAutoplay_ = "";
        this.current_ = null;
        return("All presentations removed.");
    }
};

Melown.Presenter.prototype.getCurrentPresentation = function() {
    return this.current_;
};

Melown.Presenter.prototype.getCurrentPresentationType = function() {
    return this.currentToolbox_;
};

Melown.Presenter.prototype.playPresentation = function(id_) {
    this.stopPresentation();
    if (this.presenterAutoplay_ !== undefined && typeof id_ === "undefined") {
        id_ = this.presenterAutoplay_;
    } else if (typeof id_ === "undefined" && this.presenter_ !== undefined && Object.keys(this.presenter_).length > 0) {
        for (var key in this.presenter_) {
            id_ = key;
            break;
        }
    }
    
    if (typeof id_ !== "undefined" && Object.keys(this.presenter_).indexOf(id_) != -1) {
        this.current_ = id_;
        this.readTextInput(id_);
        return true;
    } else {
        return false;
    }
};

Melown.Presenter.prototype.stopPresentation = function() {
    var current_ = this.getCurrentPresentation();
    this.currentToolbox_ = "right";
    if (current_ !== null) {
        this.current_ = null;
        this.browser_.ui_.removeControl(current_);
        this.container_.getElementsByTagName("article")[0].parentNode.parentNode.parentNode.remove();
        return true;
    }
    return false;    
};

Melown.Presenter.prototype.listPresentations = function(id_) {
    if (Object.keys(this.presenter_).length === 0) {
        return [];
    }
    if (typeof id_ !== "undefined") {
        if (this.presenter_[id_] !== "undefined") {
            return this.presenter_[id_];
        } else {
            return null;
        }
    } else {
        var tmp_ = [];
        for (var key_ in this.presenter_) {
            tmp_.push(key_);
        }
        return tmp_;
    }
};

//prevent minification
Melown.Presenter.prototype["addPresentation"] = Melown.Presenter.prototype.addPresentation;
Melown.Presenter.prototype["removePresentation"] = Melown.Presenter.prototype.removePresentation;
Melown.Presenter.prototype["getCurrentPresentation"] = Melown.Presenter.prototype.getCurrentPresentation;
Melown.Presenter.prototype["getCurrentPresentationType"] = Melown.Presenter.prototype.getCurrentPresentationType;
Melown.Presenter.prototype["playPresentation"] = Melown.Presenter.prototype.playPresentation;
Melown.Presenter.prototype["stopPresentation"] = Melown.Presenter.prototype.stopPresentation;
Melown.Presenter.prototype["listPresentations"] = Melown.Presenter.prototype.listPresentations;

