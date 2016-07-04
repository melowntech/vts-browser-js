// All Utilities needed for proper Presenter working

Melown.Presenter.prototype.Utils.init = function(id_, HTMLtemplate_) {
    var obj_ = this;    
    var templatePanelPrefix_ = '<div class="melown-presentations panelContainer"><div class="melown-presentations swipeControl top"></div><div class="melown-presentations toolboxContainer">';
    var templatePanelSuffix_ = '</div><div class="melown-presentations swipeControl"></div></div>';
    var templatePanel_ = templatePanelPrefix_ + HTMLtemplate_ + templatePanelSuffix_;
    var templateSubtitlesPrefix_ = '<div class="melown-presentations subtitlesContainer"><button type="button"></button><button type="button"></button>'
                                    + '<div class="melown-presentations swipeSubtitles"><div><div></div></div></div><div class="melown-presentations swipeSubtitles"><div><div></div></div></div><div class="melown-presentations innerContainer">';
    var templateSubtitlesSuffix_ = '</div></div>';
    var templateSubtitles_ = templateSubtitlesPrefix_ + HTMLtemplate_ + templateSubtitlesSuffix_;
    var template_ = templatePanel_ + templateSubtitles_;
    var ctrlDelve_ = this.browser_.ui_.addControl(id_, template_);
    this.id_.push(id_);
    this.setContainer(ctrlDelve_);

    // Set all <a> tags to have onclick
    this.aTags_ = this.container_.getElementsByTagName('a');
    for(var i = 0; i < this.aTags_.length; i++){
        this.aTags_[i].onclick = function() { obj_.linksDecode(this); };
    };
    
    setTimeout(function(){
        obj_.renderControl();
    }, 200);
};

Melown.Presenter.prototype.Utils.readTextInput = function(id_) {
    var presentation_ = {
        htmlDataStorage : this.config_['presenter'][id_],
        id : id_,
        checkID : function() {
            var url_ = /^(ftp|http|https):\/\/[^ "]+$/;
            var hash_ = /^#.*$/;
            if(url_.test(this.htmlDataStorage) || this.htmlDataStorage.indexOf("./") != -1) {
                return 'url';
            }
            else if(hash_.test(this.htmlDataStorage)) {
                return 'hash';
            }
            else {
                return 'string';
            };
        }
    };
    
    var mode_ = presentation_.checkID();
    
    if(mode_ == 'url') {
        var rawFile_ = new XMLHttpRequest();
        var obj_ = this;
        rawFile_.open("GET", presentation_.htmlDataStorage, false);
        rawFile_.onreadystatechange = function() {
            if(rawFile_.readyState === 4) {
                if(rawFile_.status === 200 || rawFile_.status == 0) {
                    var allText_ = rawFile_.responseText;
                    obj_.html = allText_;
                    obj_.init(presentation_.id, obj_.html);
                }
                else {
                    obj_.file = 'undefined';
                };
            };
        };
        rawFile_.send(null); 
    }
    else if(mode_ == 'hash') {
        var obj_ = document.getElementById(presentation_.htmlDataStorage).innerHTML;
        this.init(presentation_.id, obj_);
    }
    else if(mode_ == 'string') {
        this.init(presentation_.id, presentation_.htmlDataStorage);
    };
};

Melown.Presenter.prototype.Utils.linksDecode = function(obj_) {
    var position_ = null;
    var autorotate_ = null;
    var transition_ = null;
    var navigate_ = null;
    
    if(obj_.getAttribute('data-mln-navigate') !== null) {
        navigate_ = obj_.getAttribute('data-mln-navigate');
        if(navigate_ !== null) {
            if(navigate_ == 'prev') { this.nextArticle('-1'); }
            else if(navigate_ == 'next') { this.nextArticle('+1'); }
            else if(navigate_ == 'first') { this.nextArticle(0); }
            else if(navigate_ == 'last') { this.nextArticle(this.maxNodes_-1); }
            else { this.nextArticle(navigate_); };        
            return 'navigation:true';
        };
    };
    
    if(obj_.getAttribute('data-mln-position') === null){
        return 'position:false';
    };

    position_ = this.getNumbers(obj_.getAttribute('data-mln-position').split(','));
    
    if(obj_.getAttribute('data-mln-autorotate') !== null) {
        autorotate_ = this.getNumbers(obj_.getAttribute('data-mln-autorotate'));
    };
    if(obj_.getAttribute('data-mln-transition') !== null) {
        transition_ = obj_.getAttribute('data-mln-transition');
    };
    
    if(transition_ === null) {
        this.browser_.autopilot_.flyTo(position_);
    }
    else if(transition_ == 'teleport') {
        this.browser_.core_.getMap().setPosition(position_);
    }
    else {
        this.browser_.autopilot_.flyTo(position_);
        // Feature to be considered
        // browser.flyTo(position, {mode_ : transition});
    };
    if(autorotate_ !== null) {
        this.browser_.autopilot_.setAutorotate(autorotate_);
    };
        
    return 'Moving to position: ' + position_;
};

// parseFloat here
Melown.Presenter.prototype.Utils.getNumbers = function(obj_) {
    var obj_ = obj_;
    for(var i = 0; i < obj_.length; i++){
        if(typeof obj_ == 'string' && parseFloat(obj_)) {
            obj_ = parseFloat(obj_);
            break;
        }
        if (parseFloat(obj_[i]))
            obj_[i] = parseFloat(obj_[i]); // toFixed might be added here
    }
    return obj_;
};

Melown.Presenter.prototype.Utils.nextArticle = function(node_, init_, lastNode_) {
    // fly to whatever node we wish
    if(node_ === '+1') { node_ = 1; }
    else if(node_ === '-1') { node_ = -1; }
    else {
        this.actualNode_ = node_;
        node_ = 0;
    };
    this.actualNode_ = this.actualNode_ + node_;
    
    if(this.actualNode_ >= 0 && this.actualNode_ < this.maxNodes_) {
        if(!init_) {
            if(this.activeToolbox_ == 'right') { this.handleArticle(this.actualNode_); }
            else if(this.activeToolbox_ == 'wide') { this.handleSubtitlesPosition(this.actualNode_); };
        };
        if(typeof lastNode_ !== 'undefined') { this.maxNodes_ = lastNode_; };
        this.linksDecode(this.container_.getElementsByTagName('section')[this.actualNode_]);
        return true;
    
    }
    else { this.actualNode_ = this.actualNode_ - node_; };
    return false;
};

Melown.Presenter.prototype.Utils.useToolbox = function() {
    
    var type_ = this.container_.getElementsByTagName('article')[0].getAttribute('data-mln-style');
    
    if(type_ === null) { type_ = 'right'; };
    
    var rightPanel_ = this.container_.getElementsByClassName('melown-presentations panelContainer')[0];
    var toolboxContainer_ = this.container_.getElementsByClassName('melown-presentations toolboxContainer')[0];
    var subtitles_ = this.container_.getElementsByClassName('melown-presentations subtitlesContainer')[0];
    var swipeControl_ = this.container_.getElementsByClassName('melown-presentations swipeControl');
    this.activeToolbox_ = type_;
    
    subtitles_.setAttribute('style', 'opacity: 0;');
    subtitles_.setAttribute('class', 'melown-presentations subtitlesContainer');
    if(type_ == 'right') {
        rightPanel_.style.display = 'block';
        setTimeout(function() {
            rightPanel_.style.opacity = 1;
        }, 20);
        swipeControl_[0].style.display = 'block';
        swipeControl_[1].style.display = 'block';
        for(var i = 0; i < this.sectionTags_.length; i++){ // Set maxHeight back as there is no dynamic rescaling of rightPanel_
            this.sectionTags_[i].style.height = this.maxHeight_ + 'px';
        };
        this.nextArticle(0);
    }
    else if(type_ == 'wide') {
        subtitles_.style.display = 'block';
        setTimeout(function() {
            subtitles_.style.opacity = 1;
        }, 20);
        rightPanel_.style.display = 'none';
        rightPanel_.style.opacity = 0;
        swipeControl_[0].style.display = 'none';
        swipeControl_[1].style.display = 'none';
        for(var i = 0; i < this.sectionTags_.length; i++){ // Set height to auto so we can dynamicaly adjust subtitles height
            this.sectionTags_[i].style.height = 'auto';
        };
        this.handleSubtitlesPosition(0, true);
    };
};

