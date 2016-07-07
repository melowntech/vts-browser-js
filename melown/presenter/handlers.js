// Presentation handlers of events

Melown.Presenter.prototype.handleArticle = function(node_) {
    var rightPanel_ = this.container_.getElementsByClassName("melown-presenter toolboxContainer")[0];
    var btnUp_ = this.container_.getElementsByClassName("melown-presenter-btnUp")[0];
    var btnDw_ = this.container_.getElementsByClassName("melown-presenter-btnDw")[0];

    var articleClass_ = (function(a) {
        this.container_.getElementsByClassName("melown-presenter toolboxContainer")[0].querySelectorAll("article")[0].setAttribute("class",a);
    }).bind(this);
    
    var actualHeight_ = this.maxHeight_ * this.actualNode_ * -1;
    
    btnUp_.setAttribute("class","melown-presenter-btnUp");
    btnDw_.setAttribute("class","melown-presenter-btnDw");

    if (node_ === 0) {
        btnUp_.setAttribute("class","melown-presenter-btnUp melown-presenter hidden");
    } else if (node_ === this.maxNodes_-1) {
        btnDw_.setAttribute("class","melown-presenter-btnDw melown-presenter hidden");
    }
        
    this.container_.getElementsByTagName("article")[0].setAttribute("style","top: "+actualHeight_+"px");
    
    if (this.actualNode_ === 0) {
        /* handle right panel stuff */
        rightPanel_.style.height = (this.maxHeight_ + this.swipeOffset_) + "px";
        rightPanel_.style.top = 0;
        articleClass_("melown-presenter");
        /* done - now add some cosmetic attributes */
        this.container_.getElementsByClassName("melown-presenter swipeControl")[0].style.height = 0;
        this.container_.getElementsByTagName("article")[0].style.top = 0;
        this.container_.getElementsByTagName("section")[0].style.height = (this.maxHeight_ + (this.swipeOffset_ - this.firstTitleMargin_)) + "px";
    } else {
        /* handle right panel stuff */
        rightPanel_.style.height = this.maxHeight_ + "px";
        rightPanel_.style.top = this.swipeOffset_ + "px";
        articleClass_("melown-presenter nonFirst");
        /* done - now add some cosmetic attributes */
        this.container_.getElementsByClassName("melown-presenter swipeControl")[0].style.height = this.swipeOffset_ + "px";
        this.container_.getElementsByTagName("section")[0].style.height = (this.maxHeight_ + this.swipeOffset_) + "px";
    }
    return true;
};

Melown.Presenter.prototype.handleSubtitlesPosition = function(node_, init_) {
    if (typeof node_ === "undefined") {
        node_ = 0;
    }
    
    var subtitlesContainer_ = this.container_.getElementsByClassName("melown-presenter subtitlesContainer")[0];
    var leftButton_ = subtitlesContainer_.childNodes[0];
    var rightButton_ = subtitlesContainer_.childNodes[1];
    var sections_ = subtitlesContainer_.childNodes[4].querySelectorAll("article")[0].querySelectorAll("section");
    var swipeSubtitles_ = this.container_.getElementsByClassName("melown-presenter swipeSubtitles");
    
    this.linksDecode(sections_[node_]);
    
    // clean all previous states
    sections_[node_].removeAttribute("style");
    subtitlesContainer_.setAttribute("class","melown-presenter subtitlesContainer");
    subtitlesContainer_.removeAttribute("onclick");
    swipeSubtitles_[0].removeAttribute("onclick");
    swipeSubtitles_[1].removeAttribute("onclick");
    swipeSubtitles_[0].removeAttribute("style");
    swipeSubtitles_[1].removeAttribute("style");
    leftButton_.removeAttribute("onclick");
    rightButton_.removeAttribute("onclick");
    leftButton_.setAttribute("class", "melown-presenter hidden");
    rightButton_.setAttribute("class", "melown-presenter hidden");
    
    for (var i = 0; i < sections_.length; i++) {
        sections_[i].style.opacity = 0;
        if (this.subtitlesHeights_[i] === undefined) {
            sections_[i].style.display = "block";
            this.subtitlesHeights_[i] = sections_[i].offsetHeight;
            sections_[i].style.display = "none";
        }
        if (i !== node_) {
            this.hideSections(sections_[i]);
        }
    }
    this.showSections(sections_[node_]);
    
    var sectionType_ = sections_[node_].getAttribute("data-mln-style");
    if (sectionType_ == undefined) {
        sectionType_ = "full";
    }
    
    if (sectionType_ == "full") {
        swipeSubtitles_[0].style.opacity = 0;
        swipeSubtitles_[1].style.opacity = 0;
        swipeSubtitles_[0].style.cursor = "default";
        swipeSubtitles_[1].style.cursor = "default";
        
        if (node_ === 0) {
            leftButton_.setAttribute("class", "melown-presenter hidden");
            rightButton_.setAttribute("class", "melown-presenter");
            rightButton_.onclick = (function() {
                this.nextArticle(1);
            }).bind(this);
            rightButton_.innerHTML = "Continue";
        } else if (node_ === sections_.length - 2) { // One more before end
            leftButton_.setAttribute("class", "melown-presenter");
            leftButton_.onclick = (function() {  
                this.nextArticle("-1");
            }).bind(this);
            leftButton_.innerHTML = "Back";
            rightButton_.setAttribute("class", "melown-presenter");
            rightButton_.onclick = (function() {  
                this.nextArticle("+1");
            }).bind(this);
            rightButton_.innerHTML = "Explore";
        }
        if (typeof init_ === "undefined") {
            subtitlesContainer_.setAttribute("style", "display: block;");
        }
        subtitlesContainer_.setAttribute("class","melown-presenter subtitlesContainer full");
    } else if (sectionType_ == "title") {
        swipeSubtitles_[0].style.opacity = 1;
        swipeSubtitles_[1].style.opacity = 1;
        swipeSubtitles_[0].onclick = (function() {
            this.nextArticle("-1");
        }).bind(this);
        swipeSubtitles_[1].onclick = (function() {
            this.nextArticle("+1");
        }).bind(this);
        leftButton_.setAttribute("class", "melown-presenter hidden");
        rightButton_.setAttribute("class", "melown-presenter hidden");
        subtitlesContainer_.style.height = this.subtitlesHeights_[node_] + "px";
        subtitlesContainer_.setAttribute("class","melown-presenter subtitlesContainer title");
       
    } else if (sectionType_ == "mini") {
        subtitlesContainer_.setAttribute("style", "display: block;");
        subtitlesContainer_.setAttribute("class","melown-presenter subtitlesContainer mini");
        leftButton_.setAttribute("class", "melown-presenter hidden");
        rightButton_.setAttribute("class", "melown-presenter hidden");
    }
};


Melown.Presenter.prototype.hideSections = function(elem_) {
    setTimeout(function() {
        elem_.style.display = "none";
    }, this.animTime_);
};

Melown.Presenter.prototype.showSections = function(elem_) {
    setTimeout(function() {
        elem_.style.display = "block";
        setTimeout(function() {
            elem_.style.opacity = 1;
        }, 50);    
    }, this.animTime_);
};

