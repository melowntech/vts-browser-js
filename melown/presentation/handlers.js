// Presentation handlers of events

Melown.Presentation.prototype.Utils.handleArticle = function(node) {
    var rightPanel = document.getElementsByClassName('toolboxContainer')[0];
    var articleClass = function(a) {
        document.getElementsByClassName('toolboxContainer')[0].querySelectorAll('article')[0].setAttribute('class',a);
    }
    
    var actualHeight = this.maxHeight * this.actualNode * -1;
    
    document.getElementById('btnUp').setAttribute('class','');
    document.getElementById('btnDw').setAttribute('class','');

    if(node === 0)
        document.getElementById('btnUp').setAttribute('class','hidden');
    else if(node === this.maxNodes-1)
        document.getElementById('btnDw').setAttribute('class','hidden');
        
    document.getElementsByTagName('article')[0].setAttribute('style','top: '+actualHeight+'px');
    
    if(this.actualNode === 0){
        /* handle right panel stuff */
        rightPanel.style.height = (this.maxHeight + this.swipeOffset) + 'px';
        rightPanel.style.top = 0;
        articleClass('');
        /* done - now add some cosmetic attributes */
        document.getElementsByClassName('swipeControl')[0].style.height = 0;
        document.getElementsByTagName('article')[0].style.top = 0;
        document.getElementsByTagName('section')[0].style.height = (this.maxHeight + (this.swipeOffset - this.firstTitleMargin)) + 'px';
    }
    else {
        /* handle right panel stuff */
        rightPanel.style.height = this.maxHeight + 'px';
        rightPanel.style.top = this.swipeOffset + 'px';
        articleClass('nonFirst');
        /* done - now add some cosmetic attributes */
        document.getElementsByClassName('swipeControl')[0].style.height = this.swipeOffset + 'px';
        document.getElementsByTagName('section')[0].style.height = (this.maxHeight + this.swipeOffset) + 'px';
    }
    
    return true;
}

Melown.Presentation.prototype.Utils.handleSubtitlesPosition = function(node, init) {
    if(typeof node === 'undefined') node = 0;
    
    var obj = this;
    var subtitlesContainer = document.getElementsByClassName('subtitlesContainer')[0];
    var leftButton = subtitlesContainer.childNodes[0];
    var rightButton = subtitlesContainer.childNodes[1];
    var sections = subtitlesContainer.childNodes[4].querySelectorAll('article')[0].querySelectorAll('section');
    var swipeSubtitles = document.getElementsByClassName('swipeSubtitles');
    
    this.linksDecode(sections[node]);
    
    // clean all previous states
    sections[node].removeAttribute('style');
    subtitlesContainer.setAttribute('class','subtitlesContainer');
    subtitlesContainer.removeAttribute('onclick');
    swipeSubtitles[0].removeAttribute('onclick');
    swipeSubtitles[1].removeAttribute('onclick');
    swipeSubtitles[0].removeAttribute('style');
    swipeSubtitles[1].removeAttribute('style');
    leftButton.removeAttribute('onclick');
    rightButton.removeAttribute('onclick');
    leftButton.setAttribute('class', 'hidden');
    rightButton.setAttribute('class', 'hidden');
    
    for(var i = 0; i < sections.length; i++) {
        sections[i].style.opacity = 0;
        if(this.subtitlesHeights[i] === undefined) {
            sections[i].style.display = 'block';
            this.subtitlesHeights[i] = sections[i].offsetHeight;
            sections[i].style.display = 'none';
        }
        if(i !== node)
            this.hideSections(sections[i]);
    }
    this.showSections(sections[node]);
    
    var sectionType = sections[node].getAttribute('data-mln-style')
    if(sectionType == undefined)
        sectionType = 'full';
    
    if(sectionType == 'full') {
        swipeSubtitles[0].style.opacity = 0;
        swipeSubtitles[1].style.opacity = 0;
        swipeSubtitles[0].style.cursor = 'default';
        swipeSubtitles[1].style.cursor = 'default';
        
        
        if(node === 0) {
            leftButton.setAttribute('class', 'hidden');
            rightButton.setAttribute('class', '');
            rightButton.onclick = function() {
                obj.nextArticle(1);
            }
            //('onclick','nextArticle(1);');
            rightButton.innerHTML = 'Continue';
        }
        else if(node === sections.length - 2) { // One more before end
            leftButton.setAttribute('class', '');
            leftButton.onclick = function () {
                
                obj.nextArticle('-1');
            }
            //leftButton.setAttribute('onclick','nextArticle(\'-1\');');
            leftButton.innerHTML = 'Back';
            rightButton.setAttribute('class', '');
            rightButton.onclick = function () {
                
                obj.nextArticle('+1');
            }
            //rightButton.setAttribute('onclick','nextArticle(\'+1\');');
            rightButton.innerHTML = 'Explore';
        }
        if(typeof init === 'undefined')
            subtitlesContainer.setAttribute('style', 'display: block;');
        subtitlesContainer.setAttribute('class','subtitlesContainer full');
    }
    else if(sectionType == 'title') {
        swipeSubtitles[0].style.opacity = 1;
        swipeSubtitles[1].style.opacity = 1;
        swipeSubtitles[0].onclick = function() {
            obj.nextArticle('-1');
        }
        swipeSubtitles[1].onclick = function() {
            obj.nextArticle('+1');
        }
        //swipeSubtitles[0].setAttribute('onclick','nextArticle(\'-1\');');
        //swipeSubtitles[1].setAttribute('onclick','nextArticle(\'+1\');');
        leftButton.setAttribute('class', 'hidden');
        rightButton.setAttribute('class', 'hidden');
        //subtitlesContainer.setAttribute('style', 'display: block;');
        subtitlesContainer.style.height = this.subtitlesHeights[node] + 'px';
        subtitlesContainer.setAttribute('class','subtitlesContainer title');
       
    }
    else if(sectionType == 'mini') {
        subtitlesContainer.setAttribute('style', 'display: block;');
        subtitlesContainer.setAttribute('class','subtitlesContainer mini');
        leftButton.setAttribute('class', 'hidden');
        rightButton.setAttribute('class', 'hidden');
    }
}


Melown.Presentation.prototype.Utils.hideSections = function(elem) {
    setTimeout(function() {
        elem.style.display = 'none';
    }, this.animTime);
}

Melown.Presentation.prototype.Utils.showSections = function(elem) {
    setTimeout(function() {
        elem.style.display = 'block';
        setTimeout(function() {
            elem.style.opacity = 1;
        }, 50);    
    }, this.animTime);
}

