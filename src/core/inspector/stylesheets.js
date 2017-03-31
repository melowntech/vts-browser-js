
Melown.Inspector.prototype.initStylesheetsPanel = function() {

    this.addStyle(
        "#melown-stylesheets-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 1200px;"
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

        + "#melown-stylesheets-panel-header {"
            + "width: 100%;"
            + "height: 28px;"
        + "}"

        + "#melown-stylesheets-panel-combo {"
            + "width: 1115px;"
            + "height: 21px;"
        + "}"

        + "#melown-stylesheets-panel-button {"
            + "float: right;"
        + "}"

        + "#melown-stylesheets-panel-text {"
            + "width: 100%;"
            + "height: 300px;"
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

    //this.inspectorElement_.appendChild(this.stylesheetsElement_);
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
    this.stylesheetsTextElement_.value = this.niceStyleFormat(stylesheet_);
};

Melown.Inspector.prototype.onStylesheetsUpdate = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    map_.setStylesheetData(this.stylesheetsOptionsElement_.value, JSON.parse(this.stylesheetsTextElement_.value));
};

Melown.Inspector.prototype.niceStyleFormat = function(data_) {
    if (!data_) {
        return "";
    }
    
    data_ = data_.data_;

    //return JSON.stringify(data_, null, "  ");
    
    var tmp_ = "";
    tmp_ += "{\n";

    var elements_ = [];

    if (data_["constants"]) {
        elements_.push("constants");
    } 

    if (data_["bitmaps"]) {
        elements_.push("bitmaps");
    } 

    if (data_["layers"]) {
        elements_.push("layers");
    } 
    
    for (var j = 0, lj = elements_.length; j < lj; j++) {
        var type_ = elements_[j];
        tmp_ += '  "' + type_ + '": {\n';

        var element_ = data_[type_];

        var buff_ = [];
        for (var key_ in element_) {
            buff_.push(key_);
        }

        for (var i = 0, li = buff_.length; i < li; i++) {
            if (type_ == "layers") {
                
                var element2_ = element_[buff_[i]];
                
                var buff2_ = [];
                for (var key2_ in element2_) {
                    buff2_.push(key2_);
                }

                tmp_ += '    "' + buff_[i] + '": {\n';

                for (var k = 0, lk = buff2_.length; k < lk; k++) {
                    tmp_ += '      "' + buff2_[k] + '": ' + JSON.stringify(element2_[buff2_[k]]) + (k == (lk - 1) ? "" : ",") + "\n";
                }
                
                tmp_ += "    }"  + (i == (li - 1) ? "" : ",\n");
            } else {
                tmp_ += '    "' + buff_[i] + '": ' + JSON.stringify(element_[buff_[i]]) + (i == (li - 1) ? "" : ",") + "\n";
            }
        }
        
        tmp_ += "\n  }" + (j == (lj - 1) ? "" : ",\n");
    }
    
    tmp_ += "\n}";
    
    return tmp_;
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
    this.stylesheetsTextElement_.value = this.niceStyleFormat(stylesheet_);
};

