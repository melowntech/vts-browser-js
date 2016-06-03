// All Utilities needed for proper presentation working

Melown.Presentation.prototype.Utils.init = function(id_, HTMLtemplate_) {
    var localThis = this;
    console.log('Starting init of presentation...');
    console.log(localThis);
    var templateSwitcher = '<div id="templateSwitcher"><p onclick="useToolbox(\'panel\')">Use right panel</p><p onclick="useToolbox(\'subtitles\')">Use subtitles</p></div>';
    var templatePanelPrefix = '<div class="panelContainer"><div class="swipeControl top"></div><div class="toolboxContainer">';
    var templatePanelSuffix = '</div><div class="swipeControl"></div></div>';
    var templatePanel = templatePanelPrefix + HTMLtemplate_ + templatePanelSuffix;
    var templateSubtitlesPrefix = '<div class="subtitlesContainer"><button type="button"></button><button type="button"></button>'
                                    + '<div class="swipeSubtitles"></div><div class="swipeSubtitles"></div><div class="innerContainer">';
    var templateSubtitlesSuffix = '</div></div>';
    var templateSubtitles = templateSubtitlesPrefix + document.getElementById('HTMLtemplate').innerHTML + templateSubtitlesSuffix;
    var template = templateSwitcher + templatePanel + templateSubtitles;
    var ctrlDelve = this.browser_.addControl(id_, template);
    this.id_.push(id_);

    // Set all <a> tags to have onclick
    this.aTags = document.getElementsByTagName('a');
    for(var i = 0; i < this.aTags.length; i++){
        this.aTags[i].setAttribute('onclick','linksDecode(this)');
    }        
    console.log('Init done. Running render...');
    var obj = this;
    setTimeout(function(){
        console.log(obj);
        obj.renderControl();
    }, 200);
}

Melown.Presentation.prototype.Utils.readTextInput = function(id_) {
    var presentation = {
        htmlDataStorage : this.config_.presentation[id_],
        id : id_,
        checkID : function() {
            var url = /^(ftp|http|https):\/\/[^ "]+$/;
            var hash = /^#.*$/;
            if(url.test(this.htmlDataStorage))
                return 'url';
            else if(hash.test(this.htmlDataStorage))
                return 'hash';
            else
                return 'string';
        }
    }
    
    var mode = presentation.checkID();
    
    if(mode == 'url') {
        var rawFile = new XMLHttpRequest();
        var obj = this;
        rawFile.open("GET", presentation.htmlDataStorage, false);
        rawFile.onreadystatechange = function ()
        {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    var allText = rawFile.responseText;
                    obj.html = allText;
                    obj.init(presentation.id, obj.html);
                }
                else {
                    obj.file = 'undefined';
                }
            }
        }
        rawFile.send(null); 
    }
    else if(mode == 'hash') {
        var obj = document.getElementById(presentation.htmlDataStorage).innerHTML;
        this.init(presentation.id, obj);
    }
    else if(mode == 'string') {
        this.init(presentation.id, presentation.htmlDataStorage);
    }
}

Melown.Presentation.prototype.Utils.linksDecode = function(obj) {
    var position = null;
    var autorotate = null;
    var transition = null;
    var navigate = null;
    
    if(obj.getAttribute('data-mln-navigate') !== null) {
        navigate = obj.getAttribute('data-mln-navigate');
        if(navigate !== null) {
            if(navigate == 'prev') this.nextArticle('-1');
            else if(navigate == 'next') this.nextArticle('+1');
            else if(navigate == 'first') this.nextArticle(0);
            else if(navigate == 'last') this.nextArticle(this.maxNodes-1)
            else this.nextArticle(navigate);        
            return;
        }
    }
    
    if(obj.getAttribute('data-mln-position') === null){
        console.log('This article has no default flyTo data.');
        return false;
    }
    
    

    position = this.getNumbers(obj.getAttribute('data-mln-position').split(','));
    
    if(obj.getAttribute('data-mln-autorotate') !== null) {
        autorotate = this.getNumbers(obj.getAttribute('data-mln-autorotate').split(','));
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
        this.browser_.flyTo(position);
    }
    else if(transition == 'teleport') {
        this.browser_.setPosition(position);
    }
    else {
        this.browser_.flyTo(position);
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
        this.actualNode = node;
        node = 0;
    }
    this.actualNode = this.actualNode + node;
    console.log('Actual node:' + this.actualNode);
    
    if(this.actualNode >= 0 && this.actualNode < this.maxNodes) {
     
        if(!init) {
            if(this.activeToolbox == 'panel')
                this.handleArticle(this.actualNode);
            else if(this.activeToolbox == 'subtitles')
                this.handleSubtitlesPosition(this.actualNode);
        }
        if(typeof lastNode !== 'undefined') this.maxNodes = lastNode;
        this.linksDecode(document.getElementsByTagName('section')[this.actualNode]);
        return true;
    
    }
    else this.actualNode = this.actualNode - node;
    return false;
}

Melown.Presentation.prototype.Utils.useToolbox = function(which) {
    
    var rightPanel = document.getElementsByClassName('panelContainer')[0];
    var toolboxContainer = document.getElementsByClassName('toolboxContainer')[0];
    var subtitles = document.getElementsByClassName('subtitlesContainer')[0];
    var swipeControl = document.getElementsByClassName('swipeControl');
    this.activeToolbox = which;
    
    if(which == 'panel') {
        subtitles.style.display = 'none';
        subtitles.style.opacity = 0;
        rightPanel.style.display = 'block';
        setTimeout(function() {
            rightPanel.style.opacity = 1;
        }, 20);
        swipeControl[0].style.display = 'block';
        swipeControl[1].style.display = 'block';
        for(var i = 0; i < this.sectionTags.length; i++){ // Set maxHeight back as there is no dynamic rescaling of rightPanel
            this.sectionTags[i].style.height = this.maxHeight + 'px';
        }
        this.nextArticle(0); //, false, sectionTags.length);
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
        for(var i = 0; i < this.sectionTags.length; i++){ // Set height to auto so we can dynamicaly adjust subtitles height
            this.sectionTags[i].style.height = 'auto';
        }
        this.handleSubtitlesPosition(0);
    }
}

