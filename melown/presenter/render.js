// Rendering of DOM elements for Presenter

Melown.Presenter.prototype.renderControl = function() {
    // Set every <section> tag excluding the first one to not to be displayed
    this.sectionTags_ = this.container_.getElementsByClassName("melown-presenter toolboxContainer")[0].querySelectorAll("section");
    
    var swipeControlUp_ = this.container_.getElementsByClassName("melown-presenter swipeControl")[0];
    var swipeControlDw_ = this.container_.getElementsByClassName("melown-presenter swipeControl")[1];

    var nextButton_ = document.createElement("button");
    nextButton_.innerHTML = "<div><div></div></div>";
    nextButton_.setAttribute("type","button");
    nextButton_.setAttribute("class","melown-presenter-btnDw");
    nextButton_.onclick = (function(){
        this.nextArticle("+1");
    }).bind(this);
        
    var prevButton_ = document.createElement("button");
    prevButton_.innerHTML = "<div><div></div></div>";
    prevButton_.setAttribute("type","button");
    prevButton_.setAttribute("class","melown-presenter-btnUp");
    prevButton_.onclick = (function(){
        this.nextArticle("-1");
    }).bind(this);

    // End of all buttons and other controllers
    
    swipeControlUp_.appendChild(prevButton_);
    swipeControlDw_.appendChild(nextButton_);

    this.getElementsTrueHeight(this.sectionTags_);

    var offsetTop_ = this.maxHeight_ + this.swipeOffset_;

    this.container_.getElementsByClassName("melown-presenter panelContainer")[0].style.height = (offsetTop_ + this.swipeOffset_) + "px";
    swipeControlDw_.style.top = offsetTop_ +"px";
    swipeControlUp_.style.opacity = "1";
    swipeControlDw_.style.opacity = "1";
    
    // init now
    setTimeout((function() {
        this.useToolbox();
    }).bind(this), this.animTime_);
    this.nextArticle(0, false, this.sectionTags_.length);
};

Melown.Presenter.prototype.getElementsTrueHeight = function(elems_) {
    for (var i = 0; i < elems_.length; i++) {
        if (elems_[i].offsetHeight > this.maxHeight_) {
            this.maxHeight_ = elems_[i].offsetHeight;
        }
    }
    
    for (var i = 0; i < elems_.length; i++) {
        elems_[i].style.height = this.maxHeight_ + "px";
    }
};

