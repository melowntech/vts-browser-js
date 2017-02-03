/**
 * @constructor
 */
Melown.UIControlLoading = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("loading",
      '<div id="melown-loading" class="melown-loading">'

        + '<div class="melown-loading-progress">'
            + '<div id="melown-loading-dot1" class="melown-loading-dot"></div>'
            + '<div id="melown-loading-dot2" class="melown-loading-dot"></div>'
            + '<div id="melown-loading-dot3" class="melown-loading-dot"></div>'
            + '<div id="melown-loading-dot4" class="melown-loading-dot"></div>'
            + '<div id="melown-loading-dot5" class="melown-loading-dot"></div>'
        + '</div>'

      + ' </div>', visible_);

    this.loading_ = this.control_.getElement("melown-loading");
    this.dots_ = [
        this.control_.getElement("melown-loading-dot1"),
        this.control_.getElement("melown-loading-dot2"),
        this.control_.getElement("melown-loading-dot3"),
        this.control_.getElement("melown-loading-dot4"),
        this.control_.getElement("melown-loading-dot5")
    ];
    
    this.time_ = Date.now();
    this.hiding_ = null;
    
    //setTimeout(this.hide.bind(this), 5000);
};

Melown.UIControlLoading.prototype.show = function() {
    this.hiding_ = null;
    this.ui_.setControlVisible("compass", false);
    this.ui_.setControlVisible("zoom", false);
    this.ui_.setControlVisible("space", false);
    this.ui_.setControlVisible("search", false);
    this.ui_.setControlVisible("link", false);
    this.ui_.setControlVisible("fullscreen", false);
    this.ui_.setControlVisible("credits", false);
    this.ui_.setControlVisible("loading", true);
};

Melown.UIControlLoading.prototype.hide = function() {
    this.hiding_ = Date.now();
    
    var search_ = this.ui_.config_.controlSearch_;
    if (search_) { //enable search for melown2015 reference frame only
        var map_ = this.ui_.browser_.getMap();
        if (map_) {
            search_ = (map_.getReferenceFrame()["id"] == "melown2015");
        }
    } 
    
    this.ui_.setControlVisible("compass", this.ui_.config_.controlCompass_);
    this.ui_.setControlVisible("zoom", this.ui_.config_.controlZoom_);
    this.ui_.setControlVisible("space", this.ui_.config_.controlSpace_);
    this.ui_.setControlVisible("search", search_);
    this.ui_.setControlVisible("link", this.ui_.config_.controlLink_);
    this.ui_.setControlVisible("fullscreen", this.ui_.config_.controlFullscreen_);
    this.ui_.setControlVisible("credits", this.ui_.config_.controlCredits_);
    this.ui_.setControlVisible("loading", false);
};

Melown.UIControlLoading.prototype.update = function() {
    var timer_ = Date.now();

    if (this.hiding_) { 
        var timeDelta_ = (timer_ - this.hiding_) * 0.001;
        this.loading_.setStyle("opacity", (1-Math.min(1.0, timeDelta_*2)) + "" );
        
        if (timeDelta_ > 0.5) {
            this.control_.setVisible(false);
        }
    }


    var timeDelta_ = (timer_ - this.time_) * 0.001;

    //sine wave
    /*
    for (var i = 0; i < 5; i++) {
        this.dots_[i].setStyle("top", (Math.sin(((Math.PI*1.5)/5)*i+timeDelta_*Math.PI*2)*10)+"%");
    }*/

    //opacity    
    for (var i = 0; i < 5; i++) {
        //this.dots_[i].setStyle("opacity", (Math.sin(((Math.PI*1.5)/5)*i+timeDelta_*Math.PI*2)*60+20)+"%");
        this.dots_[i].setStyle("opacity", (Math.sin(((Math.PI*1.5)/5)*i-timeDelta_*Math.PI*2)*0.6+0.2));
    }

    var map_ = this.ui_.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var stats_ = map_.getStats();
    
    //"bestMeshTexelSize" : this.map_.bestMeshTexelSize_,
    //"bestGeodataTexelSize" : this.map_.bestGeodataTexelSize_, 
    //console.log("drawnTiles: " + stats_["drawnTiles"] + "  geodata: " + stats_["drawnGeodataTiles"]);

    if ((stats_["surfaces"] == 0 && stats_["freeLayers"] == 0) ||  //nothing to load 
        (stats_["downloading"] == 0 && stats_["lastDownload"] > 0 && (timer_ - stats_["lastDownload"]) > 1000) || //or everything loaded
        (stats_["bestMeshTexelSize"] != 0 && stats_["bestMeshTexelSize"] <= (stats_["texelSizeFit"] * 3) || //or resolution is good enough
        (stats_["loadMode"] == "fit" || stats_["loadMode"] == "fitonly") && (stats_["drawnTiles"] - stats_["drawnGeodataTiles"]) > 1) ) { //or at leas some tiles are loaded
        this.hide();
    }

};
