
Melown.Inspector.prototype.initReplayPanel = function() {

    this.addStyle(
        "#melown-replay-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 600px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "top: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 7;"
            + "padding: 10px;"
        + "}"

        + "#melown-replay-panel-left {"
            + "width: 200px;"
            + "height: 100%;"
            + "float: left;"
        + "}"

        + "#melown-replay-panel-right {"
            + "width: 340px;"
            + "height: 100%;"
            + "float: right;"
        + "}"

        + "#melown-replay-items {"
            + "width: 240px;"
            + "overflow-x: hidden;"
            + "border: 1px solid #ddd;"
            + "padding-right: 5px;"
        + "}"

        + ".melown-replay-item {"
            + "width: 100%;"
            + "overflow: hidden;"
            + "text-overflow: ellipsis;"
            + "white-space: nowrap;"    
        + "}" 

        + "#melown-replay-lod-slider {"
            + "width: 330px;"
        + "}"

        + "#melown-replay-lod-text {"
            + "width: 60px;"
            + "margin-left: 10px;"
            + "margin-right: 10px;"
        + "}"

        + "#melown-replay-lod-single {"
            + "margin-left: 10px;"
        + "}"
    
        + "#melown-replay-time-slider {"
            + "width: 330px;"
        + "}"

        + "#melown-replay-time-text {"
            + "width: 60px;"
            + "margin-left: 10px;"
            + "margin-right: 10px;"
        + "}"

        + "#melown-replay-time-single {"
            + "margin-left: 10px;"
        + "}"
        
    );

    this.replayElement_ = document.createElement("div");
    this.replayElement_.id = "melown-replay-panel";
    this.replayElement_.innerHTML =
            '<div id="melown-replay-panel-left">'
            + '<div id="melown-replay-items"></div>'
          + '</div>'
          + '<div id="melown-replay-panel-right">'
            + '<div id="melown-replay-panel-lod">'  
                + '<input id="melown-replay-lod-slider" type="range" min="0" max="30" step="1" value="30" /><br/>'
                + '<span>LOD:</span>'
                + '<input id="melown-replay-lod-text" type="text" value="30"/>'
                + '<input id="melown-replay-lod-up" type="button" value="<"/>'
                + '<input id="melown-replay-lod-down" type="button" value=">"/>'
                + '<input id="melown-replay-lod-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div><br/>'
            + '<div id="melown-replay-panel-time">'  
                + '<input id="melown-replay-time-slider" type="range" min="0" max="50000" value="0" /><br/>'
                + '<span>Time:</span>'
                + '<input id="melown-replay-time-text" type="text" value="0"/>'
                + '<input id="melown-replay-time-up" type="button" value="<"/>'
                + '<input id="melown-replay-time-down" type="button" value=">"/>'
                + '<input id="melown-replay-time-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div>'
          + '</div>';

    this.core_.element_.appendChild(this.replayElement_);

    this.replayItems_ = document.getElementById("melown-replay-items");

    this.replayLodSlider_ = document.getElementById("melown-replay-lod-slider");
    this.replayLodSlider_.onchange = this.onReplaySliderChange.bind(this, "lod");
    this.replayLodSlider_.oninput = this.onReplaySliderChange.bind(this, "lod");

    this.replayLodText_ = document.getElementById("melown-replay-lod-text");
    this.replayLodText_.onchange = this.onReplayTextChange.bind(this, "lod");
    
    document.getElementById("melown-replay-lod-up").onclick = this.onReplaySliderChange.bind(this, "lod", "down");
    document.getElementById("melown-replay-lod-down").onclick = this.onReplaySliderChange.bind(this, "lod", "up");
    
    this.replayTimeSlider_ = document.getElementById("melown-replay-time-slider");
    this.replayTimeSlider_.onchange = this.onReplaySliderChange.bind(this, "time");
    this.replayTimeSlider_.oninput = this.onReplaySliderChange.bind(this, "time");

    this.replayTimeText_ = document.getElementById("melown-replay-time-text");
    this.replayTimeText_.onchange = this.onReplayTextChange.bind(this, "time");

    document.getElementById("melown-replay-time-up").onclick = this.onReplaySliderChange.bind(this, "time", "down");
    document.getElementById("melown-replay-time-down").onclick = this.onReplaySliderChange.bind(this, "time", "up");

    this.replayElement_.addEventListener("mouseup", this.doNothing.bind(this), true);
    this.replayElement_.addEventListener("mousedown", this.doNothing.bind(this), true);
    this.replayElement_.addEventListener("mousewheel", this.doNothing.bind(this), false);
    this.replayElement_.addEventListener("dblclick", this.doNothing.bind(this), false);

    this.replayPanelVisible_ = false;
};

Melown.Inspector.prototype.showReplayPanel = function() {
    this.buildReplayCombo();
    this.replayElement_.style.display = "block";
    this.replayPanelVisible_ = true;
};

Melown.Inspector.prototype.hideReplayPanel = function() {
    this.replayElement_.style.display = "none";
    this.replayPanelVisible_ = false;
};

Melown.Inspector.prototype.switchReplayPanel = function() {
    if (this.replayPanelVisible_) {
        this.hideReplayPanel();
    } else {
        this.showReplayPanel();
    }
};

Melown.Inspector.prototype.onReplaySliderChange = function(type_, button_) {
    if (type_ == "lod") {
        switch (button_) {
            case "up":
                this.replayLodSlider_.stepUp();
                this.replayLodText_.value = this.replayLodSlider_.value;    
                break;
            
            case "down":
                this.replayLodSlider_.stepDown();
                this.replayLodText_.value = this.replayLodSlider_.value;    
                break;

            default:
                this.replayLodText_.value = this.replayLodSlider_.value;    
        } 
    } else {
        this.replayTimeText_.value = this.replayTimeSlider_.value;    
    }

    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }
};

Melown.Inspector.prototype.onReplayTextChange = function(type_) {
    if (type_ == "lod") {
        this.replayLodSlider_.value = this.replayLodText_.value;    
    } else {
        this.replayTimeSlider_.value = this.replayTimeText_.value;    
    }

    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }
};


Melown.Inspector.prototype.switchReplayItem = function(item_, htmlId_) {
    var element_ = document.getElementById(htmlId_);
    //element_.checked;
    //this.applyMapView();
};

Melown.Inspector.prototype.replayItemButton = function(item_, button_) {
    item_ = item_;
};

Melown.Inspector.prototype.buildReplayCombo = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var items_ = [
        ["Drawn Tiles",1],
        ["Drawn Tiles - Free Layers",1],
        ["Traced Nodes",1],
        ["Traced Nodes - Free Layers",1],
        ["Load Sequence",2],
        ["Camera",1],
        ["Globe",0]
    ];

    var keys_ = [
        "DrawnTiles",
        "DrawnTilesFreeLayers",
        "TracedNodes",
        "TracedNodesFreeLayers",
        "LoadSequence",
        "Camera",
        "Globe"
    ];

    var html_ = "";

    for (var i = 0, li = items_.length; i < li; i++) {
        html_ += '<div id="melown-replay-item-' + keys_[i] + '" class="melown-replay-item">'
                 + '<input id="melown-replay-checkbox-' + keys_[i] + '" type="checkbox"/>'
                 + '<span title=' + items_[i][0] + '>' + items_[i][0] + '&nbsp;&nbsp;</span>';
                 
        if (items_[i][1] > 0) {
            html_ += '<input id="melown-replay-sbutton-' + keys_[i] + '" type="button" value="S"/>';
        }
        
        if (items_[i][1] > 1) {
            html_ += '<input id="melown-replay-fbutton-' + keys_[i] + '" type="button" value="F"/>';
        }
        
        html_ += '</div>';
    }

    this.replayItems_.innerHTML = html_;
    //this.replayCurrentItem_ = keys_[0];

    for (var i = 0, li = items_.length; i < li; i++) {
        var htmlId_ = "melown-replay-checkbox-" + keys_[i];
        document.getElementById(htmlId_).onchange = this.switchReplayItem.bind(this, keys_[i], htmlId_);
        //var htmlId_ = "melown-replay-item-" + keys_[i];
        //document.getElementById(htmlId_).onclick = this.selectReplayItem.bind(this, keys_[i]);

        if (items_[i][1] > 0) {
            var htmlId_ = "melown-replay-sbutton-" + keys_[i];
            document.getElementById(htmlId_).onclick = this.replayItemButton.bind(this, keys_[i], "S");
        }

        if (items_[i][1] > 1) {
            var htmlId_ = "melown-replay-fbutton-" + keys_[i];
            document.getElementById(htmlId_).onclick = this.replayItemButton.bind(this, keys_[i], "F");
        }

    }
};



