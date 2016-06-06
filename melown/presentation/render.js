// Rendering of DOM elements for presentations

Melown.Presentation.prototype.Utils.renderControl = function() {
    // Set every <section> tag excluding the first one to not to be displayed
    this.sectionTags = document.getElementsByClassName('toolboxContainer')[0].querySelectorAll('section');
    
    var obj = this;
    var nextButton = document.createElement('button');
        nextButton.innerHTML = '';
        nextButton.setAttribute('type','button');
        nextButton.setAttribute('id','btnDw');
        nextButton.onclick = function(){ obj.nextArticle('+1'); };
        
    //var nextButton = '<button type="button" onclick="nextArticle(\'+1\')" id="btnDw"></button>';
    var prevButton = document.createElement('button');
        prevButton.innerHTML = '';
        prevButton.setAttribute('type','button');
        prevButton.setAttribute('id','btnUp');
        prevButton.onclick = function(){ obj.nextArticle('-1'); };
    //var prevButton = '<button type="button" onclick="nextArticle(\'-1\')" class="hidden" id="btnUp"></button>';;
    var usePanel = document.createElement('p');
        usePanel.innerHTML = 'Use right panel';
        usePanel.onclick = function() { obj.useToolbox('panel'); };
    var useSubtitles = document.createElement('p');
        useSubtitles.innerHTML = 'Use subtitles';
        useSubtitles.onclick = function() { obj.useToolbox('subtitles'); };
    // End of all buttons and other controllers
    var swipeControlUp = document.getElementsByClassName('swipeControl')[0];
    var swipeControlDw = document.getElementsByClassName('swipeControl')[1];
    var templateSwitcher = document.getElementById('templateSwitcher');
    
    //swipeControlUp.innerHTML = swipeControlUp.innerHTML + prevButton;
    swipeControlUp.appendChild(prevButton);
    //swipeControlDw.innerHTML = swipeControlDw.innerHTML + nextButton;
    swipeControlDw.appendChild(nextButton);
    templateSwitcher.appendChild(usePanel);
    templateSwitcher.appendChild(useSubtitles);

    this.getElementsTrueHeight(this.sectionTags);
    
    //document.getElementsByClassName('toolboxContainer')[0].style.height = maxHeight + 'px';
    var offsetTop = this.maxHeight + this.swipeOffset;
    document.getElementsByClassName('panelContainer')[0].style.height = (offsetTop + this.swipeOffset) + 'px';
    document.getElementsByClassName('swipeControl')[1].style.top = offsetTop +'px';
    document.getElementsByClassName('swipeControl')[0].style.opacity = '1';
    document.getElementsByClassName('swipeControl')[1].style.opacity = '1';
    
    // init now
    setTimeout(function() {
        document.getElementsByClassName('panelContainer')[0].style.opacity = '1';
        document.getElementsByClassName('subtitlesContainer')[0].style.opacity = '0';
    }, this.animTime)
    this.nextArticle(0, false, this.sectionTags.length);
    //useToolbox('subtitles');
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

