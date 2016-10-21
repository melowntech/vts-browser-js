
Melown.Inspector.prototype.initReplayPanel = function() {

    this.addStyle(
        "#melown-replay-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 600px;"
            + "height: 350px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "bottom: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 7;"
            + "padding: 10px;"
        + "}"

        + "#melown-replay-panel-header {"
            + "width: 100%;"
            + "height: 30px;"
        + "}"

        + "#melown-replay-panel-combo {"
            + "width: 530px;"
            + "height: 21px;"
        + "}"

        + "#melown-replay-panel-button {"
            + "float: right;"
        + "}"

        + "#melown-replay-panel-text {"
            + "width: 100%;"
            + "height: 320px;"
            + "resize: none;"
            + "white-space: nowrap;"
        + "}"
    );

    this.replayElement_ = document.createElement("div");
    this.replayElement_.id = "melown-replay-panel";
    this.replayElement_.innerHTML =
            '<div id="melown-replay-panel-header">'
            + '<select id="melown-replay-panel-combo">'
              + '<option value="DrawnTiles">Drawn Tiles</option>'
              + '<option value="DrawnTilesFree">Drawn Tiles - Free Layers</option>'
              + '<option value="TracedNodes">Traced Nodes</option>'
              + '<option value="TracedNodesFree">Traced Nodes - Free Layers</option>'
              + '<option value="LoadSequence">Load Sequence</option>'
              + '<option value="Camera">Camera</option>'
              + '<option value="Globe">Globe</option>'
            + '</select>'
            + '<button id="melown-replay-panel-button" type="button" title="Update">Update</button>'
          + '</div>'
          + '<textarea id="melown-replay-panel-text" cols="50"></textarea>';

    this.core_.element_.appendChild(this.replayElement_);

    this.replayOptionsElement_ = document.getElementById("melown-replay-panel-combo");
    this.replayOptionsElement_.onchange = this.onReplayComboSwitched.bind(this);

    this.replayTextElement_ = document.getElementById("melown-replay-panel-text");
    
    //document.getElementById("melown-replay-panel-button").onclick = this.onReplayUpdate.bind(this);

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

Melown.Inspector.prototype.onReplayComboSwitched = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    //var stylesheet_ = map_.getStylesheet(this.replayOptionsElement_.value);
    //this.replayTextElement_.value = this.niceStyleFormat(stylesheet_);
};

Melown.Inspector.prototype.onReplayUpdate = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    //map_.setStylesheetData(this.replayOptionsElement_.value, JSON.parse(this.replayTextElement_.value));
};


Melown.Inspector.prototype.buildReplayCombo = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var html_ = "";
/*
    var styles_ = map_.getreplay();
    
    for (var i = 0, li = styles_.length; i < li; i++) {
        html_ += '<option value="' + styles_[i] + '">' + styles_[i] + '</option>';
    }    
    
    this.replayOptionsElement_.innerHTML = html_;
    
    var stylesheet_ = map_.getStylesheet(styles_[0]);
    this.replayTextElement_.value = this.niceStyleFormat(stylesheet_);
*/    
};



