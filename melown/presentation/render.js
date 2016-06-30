// Rendering of DOM elements for Presenter

Melown.Presenter.prototype.Utils.renderControl = function() {
    // Set every <section> tag excluding the first one to not to be displayed
    this.sectionTags_ = document.getElementsByClassName('melown-presentations toolboxContainer')[0].querySelectorAll('section');
    
    var swipeControlUp_ = document.getElementsByClassName('melown-presentations swipeControl')[0];
    var swipeControlDw_ = document.getElementsByClassName('melown-presentations swipeControl')[1];
    var templateSwitcher_ = document.getElementById('melown-presentations-templateSwitcher');
    var obj_ = this;

    var nextButton_ = document.createElement('button');
        nextButton_.innerHTML = '';
        nextButton_.setAttribute('type','button');
        nextButton_.setAttribute('id','melown-presentations-btnDw');
        nextButton_.onclick = function(){ obj_.nextArticle('+1'); };
        
    var prevButton_ = document.createElement('button');
        prevButton_.innerHTML = '';
        prevButton_.setAttribute('type','button');
        prevButton_.setAttribute('id','melown-presentations-btnUp');
        prevButton_.onclick = function(){ obj_.nextArticle('-1'); };

    // End of all buttons and other controllers
    
    swipeControlUp_.appendChild(prevButton_);
    swipeControlDw_.appendChild(nextButton_);

    this.getElementsTrueHeight(this.sectionTags_);

    var offsetTop_ = this.maxHeight_ + this.swipeOffset_;

    document.getElementsByClassName('melown-presentations panelContainer')[0].style.height = (offsetTop_ + this.swipeOffset_) + 'px';
    document.getElementsByClassName('melown-presentations swipeControl')[1].style.top = offsetTop_ +'px';
    document.getElementsByClassName('melown-presentations swipeControl')[0].style.opacity = '1';
    document.getElementsByClassName('melown-presentations swipeControl')[1].style.opacity = '1';
    
    // init now
    setTimeout(function() {
        obj_.useToolbox();
    }, this.animTime_);
    this.nextArticle(0, false, this.sectionTags_.length);
};

Melown.Presenter.prototype.Utils.getElementsTrueHeight = function(elems_) {
    for(var i = 0; i < elems_.length; i++){
        if(elems_[i].offsetHeight > this.maxHeight_) {
            this.maxHeight_ = elems_[i].offsetHeight;
        };
    };
    
    for(var i = 0; i < elems_.length; i++){
        elems_[i].style.height = this.maxHeight_ + 'px';
    };
};

