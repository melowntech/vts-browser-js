// Rendering of DOM elements for presentations

Melown.Presentation.prototype.Utils.renderControl = function() {
    // Set every <section> tag excluding the first one to not to be displayed
    this.sectionTags = document.getElementsByClassName('toolboxContainer')[0].querySelectorAll('section');
    
    var swipeControlUp = document.getElementsByClassName('swipeControl')[0];
    var swipeControlDw = document.getElementsByClassName('swipeControl')[1];
    var templateSwitcher = document.getElementById('templateSwitcher');
    var obj = this;

    var nextButton = document.createElement('button');
        nextButton.innerHTML = '';
        nextButton.setAttribute('type','button');
        nextButton.setAttribute('id','btnDw');
        nextButton.onclick = function(){ obj.nextArticle('+1'); };
        
    var prevButton = document.createElement('button');
        prevButton.innerHTML = '';
        prevButton.setAttribute('type','button');
        prevButton.setAttribute('id','btnUp');
        prevButton.onclick = function(){ obj.nextArticle('-1'); };

    /*
    for(var i = 0; i < Object.keys(this.core_.list()).length; i++) {
        var nameOfPres = Object.keys(this.core_.list())[i];
        var usePanel = document.createElement('p');
            usePanel.innerHTML = nameOfPres;
            usePanel.onclick = function() { obj.core_.stop(); obj.core_.play(this.innerHTML); };
            templateSwitcher.appendChild(usePanel);
    }
    */
    // End of all buttons and other controllers
    
    swipeControlUp.appendChild(prevButton);
    swipeControlDw.appendChild(nextButton);

    this.getElementsTrueHeight(this.sectionTags);

    var offsetTop = this.maxHeight + this.swipeOffset;

    document.getElementsByClassName('panelContainer')[0].style.height = (offsetTop + this.swipeOffset) + 'px';
    document.getElementsByClassName('swipeControl')[1].style.top = offsetTop +'px';
    document.getElementsByClassName('swipeControl')[0].style.opacity = '1';
    document.getElementsByClassName('swipeControl')[1].style.opacity = '1';
    
    // init now
    setTimeout(function() {
        obj.useToolbox();
    }, this.animTime)
    this.nextArticle(0, false, this.sectionTags.length);
}

Melown.Presentation.prototype.Utils.getElementsTrueHeight = function(elems) {
    for(var i = 0; i < elems.length; i++){
        if(elems[i].offsetHeight > this.maxHeight)
            this.maxHeight = elems[i].offsetHeight;
    }
    
    for(var i = 0; i < elems.length; i++){
        elems[i].style.height = this.maxHeight + 'px';
    }
}

