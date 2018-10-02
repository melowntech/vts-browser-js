
var UIControlLoading = function(ui, visible) {
    this.ui = ui;
    this.control = this.ui.addControl('loading',
      '<div id="vts-loading" class="vts-loading">'

        + '<div class="vts-loading-progress">'
            + '<div id="vts-loading-dot1" class="vts-loading-dot"></div>'
            + '<div id="vts-loading-dot2" class="vts-loading-dot"></div>'
            + '<div id="vts-loading-dot3" class="vts-loading-dot"></div>'
            + '<div id="vts-loading-dot4" class="vts-loading-dot"></div>'
            + '<div id="vts-loading-dot5" class="vts-loading-dot"></div>'
        + '</div>'

      + ' </div>', visible);

    this.loading = this.control.getElement('vts-loading');
    this.dots = [
        this.control.getElement('vts-loading-dot1'),
        this.control.getElement('vts-loading-dot2'),
        this.control.getElement('vts-loading-dot3'),
        this.control.getElement('vts-loading-dot4'),
        this.control.getElement('vts-loading-dot5')
    ];
    
    this.time = Date.now();
    this.hiding = null;
    
    //setTimeout(this.hide.bind(this), 5000);
};


UIControlLoading.prototype.show = function() {
    this.hiding = null;
    this.ui.setControlVisible('compass', false);
    this.ui.setControlVisible('zoom', false);
    this.ui.setControlVisible('space', false);
    this.ui.setControlVisible('search', false);
    this.ui.setControlVisible('link', false);
    this.ui.setControlVisible('github', false);
    this.ui.setControlVisible('measure', false);
    this.ui.setControlVisible('measure2', false);
    this.ui.setControlVisible('fullscreen', false);
    this.ui.setControlVisible('credits', false);
    this.ui.setControlVisible('loading', true);
    this.time = Date.now();
};


UIControlLoading.prototype.hide = function() {
    this.hiding = Date.now();
    
    var search = this.ui.config.controlSearch;
    if (search && !this.ui.browser.config.controlSearchUrl) { //enable search for melown2015 reference frame only
        var map = this.ui.browser.getMap();
        if (map) {
            //search = (map.getReferenceFrame()["id"] == "melown2015");
            
            var radius = map.getSrsInfo(map.getReferenceFrame()['physicalSrs'])['a'];
            
            if (radius < (6378137 + 50000) && radius > (6378137 - 50000)) { //is it earth
                search = true;  
            } else {
                search = false;  
            }
            //search = (map.getSrsInfo(map.getReferenceFrame()["physical"]) == "melown2015");
        }
    } 
   
    this.ui.setControlVisible('compass', this.ui.config.controlCompass, false);
    this.ui.setControlVisible('zoom', this.ui.config.controlZoom, false);
    this.ui.setControlVisible('space', this.ui.config.controlSpace, false);
    this.ui.setControlVisible('search', search, false);
    this.ui.setControlVisible('link', this.ui.config.controlLink, false);
    this.ui.setControlVisible('github', this.ui.config.controlGithub, false);
    this.ui.setControlVisible('measure', this.ui.config.controlMeasure, false);
    this.ui.setControlVisible('measure2', this.ui.config.controlMeasureLite, false);
    this.ui.setControlVisible('fullscreen', this.ui.config.controlFullscreen, false);
    this.ui.setControlVisible('credits', this.ui.config.controlCredits, false);
    this.ui.setControlVisible('loading', false);
};


UIControlLoading.prototype.update = function() {
    var timer = Date.now();
    var timeDelta;

    if (this.hiding) { 
        timeDelta = (timer - this.hiding) * 0.001;
        this.loading.setStyle('opacity', (1-Math.min(1.0, timeDelta*2)) + '' );
        
        if (timeDelta > 0.5) {
            this.control.setVisible(false);
        }
    }


    timeDelta = (timer - this.time) * 0.001;

    //sine wave
    /*
    for (var i = 0; i < 5; i++) {
        this.dots[i].setStyle("top", (Math.sin(((Math.PI*1.5)/5)*i+timeDelta*Math.PI*2)*10)+"%");
    }*/

    //opacity    
    for (var i = 0; i < 5; i++) {
        //this.dots[i].setStyle("opacity", (Math.sin(((Math.PI*1.5)/5)*i+timeDelta*Math.PI*2)*60+20)+"%");
        this.dots[i].setStyle('opacity', (Math.sin(((Math.PI*1.5)/5)*i-timeDelta*Math.PI*2)*0.6+0.2));
    }

    var map = this.ui.browser.getMap();
    if (!map) {
        return;
    }

    var stats = map.getStats();

    if ((stats['surfaces'] == 0 && stats['freeLayers'] == 0) ||  //nothing to load 
        ((timer - this.time) > 7000) || //loading takes too long
        (stats['downloading'] == 0 && stats['lastDownload'] > 0 && (timer - stats['lastDownload']) > 1000) || //or everything loaded
        (stats['bestMeshTexelSize'] != 0 && stats['bestMeshTexelSize'] <= (stats['texelSizeFit'] * 3) || //or resolution is good enough
        (stats['loadMode'] == 'fit' || stats['loadMode'] == 'fitonly') && (stats['drawnTiles'] - stats['drawnGeodataTiles']) > 1) ) { //or at leas some tiles are loaded
        this.hide();
        this.ui.browser.callListener('loading-screen-hidden', {});
    }
};


export default UIControlLoading;
