// Rendering of DOM elements for presentations

Melown.Presentation.prototype.Utils.renderControl = function() {
    // Set every <section> tag excluding the first one to not to be displayed
    sectionTags = document.getElementsByClassName('toolboxContainer')[0].querySelectorAll('section');
    var nextButton = '<button type="button" onclick="nextArticle(\'+1\')" id="btnDw"></button>';
    var prevButton = '<button type="button" onclick="nextArticle(\'-1\')" class="hidden" id="btnUp"></button>';;
    var swipeControlUp = document.getElementsByClassName('swipeControl')[0];
    var swipeControlDw = document.getElementsByClassName('swipeControl')[1];
    
    swipeControlUp.innerHTML = swipeControlUp.innerHTML + prevButton;
    swipeControlDw.innerHTML = swipeControlDw.innerHTML + nextButton;

    getElementsTrueHeight(sectionTags);
    
    //document.getElementsByClassName('toolboxContainer')[0].style.height = maxHeight + 'px';
    var offsetTop = maxHeight + swipeOffset;
    document.getElementsByClassName('panelContainer')[0].style.height = (offsetTop + swipeOffset) + 'px';
    document.getElementsByClassName('swipeControl')[1].style.top = offsetTop +'px';
    document.getElementsByClassName('swipeControl')[0].style.opacity = '1';
    document.getElementsByClassName('swipeControl')[1].style.opacity = '1';
    
    // init now
    setTimeout(function() {
        document.getElementsByClassName('panelContainer')[0].style.opacity = '1';
        document.getElementsByClassName('subtitlesContainer')[0].style.opacity = '0';
    }, animTime)
    nextArticle(0, false, sectionTags.length);
    
    //useToolbox('subtitles');
}

Melown.Presentation.prototype.Utils.getElementsTrueHeight = function(elems) {
    //console.log(document.getElementsByTagName('article')[0].innerHTML);
    for(var i = 0; i < elems.length; i++){
        console.log('actual height: ' + elems[i].offsetHeight);
        //console.log(document.getElementsByTagName('h3')[0].offsetHeight);
        if(elems[i].offsetHeight > maxHeight)
            maxHeight = elems[i].offsetHeight;
    }
    
    for(var i = 0; i < elems.length; i++){
        elems[i].style.height = maxHeight + 'px';
    }
}

