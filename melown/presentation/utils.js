// All Utilities needed for proper presentation working

Melown.Presentation.prototype.Utils.init = function(HTMLtemplate) {
    var templateSwitcher = '<div id="templateSwitcher"><p onclick="useToolbox(\'panel\')">Use right panel</p><p onclick="useToolbox(\'subtitles\')">Use subtitles</p></div>';
    var templatePanelPrefix = '<div class="panelContainer"><div class="swipeControl top"></div><div class="toolboxContainer">';
    var templatePanelSuffix = '</div><div class="swipeControl"></div></div>';
    var templatePanel = templatePanelPrefix + HTMLtemplate + templatePanelSuffix;
    var templateSubtitlesPrefix = '<div class="subtitlesContainer"><button type="button"></button><button type="button"></button>'
                                    + '<div class="swipeSubtitles"></div><div class="swipeSubtitles"></div><div class="innerContainer">';
    var templateSubtitlesSuffix = '</div></div>';
    var templateSubtitles = templateSubtitlesPrefix + document.getElementById('HTMLtemplate').innerHTML + templateSubtitlesSuffix;
    var template = templateSwitcher + templatePanel + templateSubtitles;
    var ctrlDelve = browser.addControl('article', template);

    // Set all <a> tags to have onclick
    aTags = document.getElementsByTagName('a');
    for(var i = 0; i < aTags.length; i++){
        aTags[i].setAttribute('onclick','linksDecode(this)');
    }        
    
    setTimeout(renderControl,200);
}

Melown.Presentation.prototype.Utils.readTextFile = function(file) {
    var rawFile = new XMLHttpRequest();
    var obj = this;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                obj.file = allText;
            }
            else {
                obj.file = 'undefined';
            }
        }
    }
    rawFile.send(null);    
}

Melown.Presentation.prototype.Utils.linksDecode = function(obj) {
    
    if(obj.getAttribute('data-mln-navigate') !== null) {
        navigate = obj.getAttribute('data-mln-navigate');
        if(navigate !== null) {
            if(navigate == 'prev') nextArticle('-1');
            else if(navigate == 'next') nextArticle('+1');
            else if(navigate == 'first') nextArticle(0);
            else if(navigate == 'last') nextArticle(maxNodes-1)
            else nextArticle(navigate);        
            return;
        }
    }
    
    if(obj.getAttribute('data-mln-position') === null){
        console.log('This article has no default flyTo data.');
        return false;
    }
    
    var position = null;
    var autorotate = null;
    var transition = null;
    var navigate = null;

    position = getNumbers(obj.getAttribute('data-mln-position').split(','));
    
    if(obj.getAttribute('data-mln-autorotate') !== null) {
        autorotate = getNumbers(obj.getAttribute('data-mln-autorotate').split(','));
    }
    if(obj.getAttribute('data-mln-transition') !== null) {
        transition = obj.getAttribute('data-mln-transition');
    }
    
    console.log('position: ' + position);
    console.log('autorotate: ' + autorotate);
    console.log('transition type: ' + transition); 
    console.log('navigate: ' + navigate)   
    
    // For testing purposes, I put return here so the map doesn't fly all the time
    //return;

    if(transition === null) {
        browser.flyTo(position);
    }
    else if(transition == 'teleport') {
        browser.setPosition(position);
    }
    else {
        browser.flyTo(position);
        // Feature to be considered
        // browser.flyTo(position, {mode : transition});
    }
    return position;
}

// parseFloat here
Melown.Presentation.prototype.Utils.getNumbers = function(obj) {
    var obj = obj;
    for(var i = 0; i < obj.length; i++){
        if (parseFloat(obj[i]))
            obj[i] = parseFloat(obj[i]);
    }
    return obj;
}

Melown.Presentation.prototype.Utils.nextArticle = function(node, init, lastNode) {
    // fly to whatever node we wish
    if(node === '+1') node = 1;
    else if(node === '-1') node = -1;
    else {
        actualNode = node;
        node = 0;
    }
    actualNode = actualNode + node;
    console.log('Actual node:' + actualNode);
    
    if(actualNode >= 0 && actualNode < maxNodes) {
     
        if(!init) {
            if(activeToolbox == 'panel')
                handleArticle(actualNode);
            else if(activeToolbox == 'subtitles')
                handleSubtitlesPosition(actualNode);
        }
        if(typeof lastNode !== 'undefined') maxNodes = lastNode;
        linksDecode(document.getElementsByTagName('section')[actualNode]);
        return true;
    
    }
    else actualNode = actualNode - node;
    return false;
}

Melown.Presentation.prototype.Utils.useToolbox = function(which) {
    
    var rightPanel = document.getElementsByClassName('panelContainer')[0];
    var toolboxContainer = document.getElementsByClassName('toolboxContainer')[0];
    var subtitles = document.getElementsByClassName('subtitlesContainer')[0];
    var swipeControl = document.getElementsByClassName('swipeControl');
    activeToolbox = which;
    if(which == 'panel') {
        subtitles.style.display = 'none';
        subtitles.style.opacity = 0;
        rightPanel.style.display = 'block';
        setTimeout(function() {
            rightPanel.style.opacity = 1;
        }, 20);
        swipeControl[0].style.display = 'block';
        swipeControl[1].style.display = 'block';
        for(var i = 0; i < sectionTags.length; i++){ // Set maxHeight back as there is no dynamic rescaling of rightPanel
            sectionTags[i].style.height = maxHeight + 'px';
        }
        nextArticle(0); //, false, sectionTags.length);
    }
    else if(which == 'subtitles') {
        subtitles.style.display = 'block';
        setTimeout(function() {
            subtitles.style.opacity = 1;
        }, 20);
        rightPanel.style.display = 'none';
        rightPanel.style.opacity = 0;
        swipeControl[0].style.display = 'none';
        swipeControl[1].style.display = 'none';
        for(var i = 0; i < sectionTags.length; i++){ // Set height to auto so we can dynamicaly adjust subtitles height
            sectionTags[i].style.height = 'auto';
        }
        handleSubtitlesPosition(0);
    }
}

