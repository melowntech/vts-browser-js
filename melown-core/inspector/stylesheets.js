
Melown.Inspector.prototype.initStylesheetsPanel = function() {

    this.addStyle(
        "#melown-stylesheets-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 550px;"
            + "height: 450px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "bottom: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 4;"
            + "padding: 10px;"
        + "}"

        + "#melown-stylesheets-panel-header {"
            + "width: 100%;"
            + "height: 30px;"
        + "}"

        + "#melown-stylesheets-panel-combo {"
            + "width: 480px;"
            + "height: 21px;"
        + "}"

        + "#melown-stylesheets-panel-button {"
            + "float: right;"
        + "}"

        + "#melown-stylesheets-panel-text {"
            + "width: 100%;"
            + "height: 420px;"
            + "resize: none;"
            + "white-space: nowrap;"
        + "}"
    );

    this.stylesheetsElement_ = document.createElement("div");
    this.stylesheetsElement_.id = "melown-stylesheets-panel";
    this.stylesheetsElement_.innerHTML =
            '<div id="melown-stylesheets-panel-header">'
            + '<select id="melown-stylesheets-panel-combo"></select>'
            + '<button id="melown-stylesheets-panel-button" type="button" title="Update">Update</button>'
          + '</div>'
          + '<textarea id="melown-stylesheets-panel-text" cols="50"></textarea>';

    this.core_.element_.appendChild(this.stylesheetsElement_);

    this.stylesheetsOptionsElement_ = document.getElementById("melown-stylesheets-panel-combo");
    this.stylesheetsOptionsElement_.onchange = this.onStylesheetsComboSwitched.bind(this);

    this.stylesheetsTextElement_ = document.getElementById("melown-stylesheets-panel-text");
    
    document.getElementById("melown-stylesheets-panel-button").onclick = this.onStylesheetsUpdate.bind(this);

    this.stylesheetsElement_.addEventListener("mouseup", this.doNothing.bind(this), true);
    this.stylesheetsElement_.addEventListener("mousedown", this.doNothing.bind(this), true);
    this.stylesheetsElement_.addEventListener("mousewheel", this.doNothing.bind(this), false);
    this.stylesheetsElement_.addEventListener("dblclick", this.doNothing.bind(this), false);

    this.stylesheetsPanelVisible_ = false;
};

Melown.Inspector.prototype.showStylesheetsPanel = function() {
    this.buildStylesheetsCombo();
    this.stylesheetsElement_.style.display = "block";
    this.stylesheetsPanelVisible_ = true;
};

Melown.Inspector.prototype.hideStylesheetsPanel = function() {
    this.stylesheetsElement_.style.display = "none";
    this.stylesheetsPanelVisible_ = false;
};

Melown.Inspector.prototype.switchStylesheetsPanel = function() {
    if (this.stylesheetsPanelVisible_) {
        this.hideStylesheetsPanel();
    } else {
        this.showStylesheetsPanel();
    }
};

Melown.Inspector.prototype.onStylesheetsComboSwitched = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var stylesheet_ = map_.getStylesheet(this.stylesheetsOptionsElement_.value);
    this.stylesheetsTextElement_.value = stylesheet_ ? JSON.stringify(stylesheet_.data_, null, "  ") : "";
};

Melown.Inspector.prototype.onStylesheetsUpdate = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    map_.setStylesheetData(this.stylesheetsOptionsElement_.value, JSON.parse(this.stylesheetsTextElement_.value));
};

Melown.Inspector.prototype.buildStylesheetsCombo = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var html_ = "";

    var styles_ = map_.getStylesheets();
    
    for (var i = 0, li = styles_.length; i < li; i++) {
        html_ += '<option value="' + styles_[i] + '">' + styles_[i] + '</option>';
    }    
    
    this.stylesheetsOptionsElement_.innerHTML = html_;
    
    var stylesheet_ = map_.getStylesheet(styles_[0]);
    this.stylesheetsTextElement_.value = stylesheet_ ? JSON.stringify(stylesheet_.data_, null, "  ") : "";
};



