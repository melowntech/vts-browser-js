// All Utilities needed for proper presentation working

Melown.Presentation.prototype.Utils.init = function(id_, HTMLtemplate_) {
    var obj = this;    
    var templateSwitcher = '<div id="melown-presentations-templateSwitcher"></div>';
    var templatePanelPrefix = '<div class="melown-presentations panelContainer"><div class="melown-presentations swipeControl top"></div><div class="melown-presentations toolboxContainer">';
    var templatePanelSuffix = '</div><div class="melown-presentations swipeControl"></div></div>';
    var templatePanel = templatePanelPrefix + HTMLtemplate_ + templatePanelSuffix;
    var templateSubtitlesPrefix = '<div class="melown-presentations subtitlesContainer"><button type="button"></button><button type="button"></button>'
                                    + '<div class="melown-presentations swipeSubtitles"></div><div class="melown-presentations swipeSubtitles"></div><div class="melown-presentations innerContainer">';
    var templateSubtitlesSuffix = '</div></div>';
    var templateSubtitles = templateSubtitlesPrefix + HTMLtemplate_ + templateSubtitlesSuffix;
    var template = templateSwitcher + templatePanel + templateSubtitles;
    var ctrlDelve = this.browser_.addControl(id_, template);
    this.id_.push(id_);

    // Set all <a> tags to have onclick
    this.aTags = document.getElementsByTagName('a');
    for(var i = 0; i < this.aTags.length; i++){
        this.aTags[i].onclick = function() { obj.linksDecode(this); }
    }        
    
    setTimeout(function(){
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
        return false;
    }
    
    

    position = this.getNumbers(obj.getAttribute('data-mln-position').split(','));
    
    if(obj.getAttribute('data-mln-autorotate') !== null) {
        autorotate = this.getNumbers(obj.getAttribute('data-mln-autorotate'));
    }
    if(obj.getAttribute('data-mln-transition') !== null) {
        transition = obj.getAttribute('data-mln-transition');
    }
    
    /*
    console.log('position: ' + position);
    console.log('autorotate: ' + autorotate);
    console.log('transition type: ' + transition); 
    console.log('navigate: ' + navigate)
    */

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
    if(autorotate !== null)
        this.browser_.setAutorotate(autorotate);
        
    return position;
}

// parseFloat here
Melown.Presentation.prototype.Utils.getNumbers = function(obj) {
    var obj = obj;
    for(var i = 0; i < obj.length; i++){
        if(typeof obj == 'string' && parseFloat(obj)) {
            obj = parseFloat(obj);
            break;
        }
        if (parseFloat(obj[i]))
            obj[i] = parseFloat(obj[i]); // toFixed might be added here
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
    
    if(this.actualNode >= 0 && this.actualNode < this.maxNodes) {
     
        if(!init) {
            if(this.activeToolbox == 'right')
                this.handleArticle(this.actualNode);
            else if(this.activeToolbox == 'wide')
                this.handleSubtitlesPosition(this.actualNode);
        }
        if(typeof lastNode !== 'undefined') this.maxNodes = lastNode;
        this.linksDecode(document.getElementsByTagName('section')[this.actualNode]);
        return true;
    
    }
    else this.actualNode = this.actualNode - node;
    return false;
}

Melown.Presentation.prototype.Utils.useToolbox = function() {
    
    var templSwitch = document.getElementById('melown-presentations-templateSwitcher');
    var type = document.getElementsByTagName('article')[0].getAttribute('data-mln-style');

    if(templSwitch !== null)
        templSwitch.remove();
    
    if(type === null)
        type = 'right';
    
    var rightPanel = document.getElementsByClassName('melown-presentations panelContainer')[0];
    var toolboxContainer = document.getElementsByClassName('melown-presentations toolboxContainer')[0];
    var subtitles = document.getElementsByClassName('melown-presentations subtitlesContainer')[0];
    var swipeControl = document.getElementsByClassName('melown-presentations swipeControl');
    this.activeToolbox = type;
    
    subtitles.setAttribute('style', 'opacity: 0;');
    subtitles.setAttribute('class', 'melown-presentations subtitlesContainer');
    if(type == 'right') {
        rightPanel.style.display = 'block';
        setTimeout(function() {
            rightPanel.style.opacity = 1;
        }, 20);
        swipeControl[0].style.display = 'block';
        swipeControl[1].style.display = 'block';
        for(var i = 0; i < this.sectionTags.length; i++){ // Set maxHeight back as there is no dynamic rescaling of rightPanel
            this.sectionTags[i].style.height = this.maxHeight + 'px';
        }
        this.nextArticle(0);
    }
    else if(type == 'wide') {
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
        this.handleSubtitlesPosition(0, true);
    }
}

