
Melown.Inspector.prototype.initStatsPanel = function() {

    this.addStyle(
        "#melown-stats-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 305px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "top: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 4;"
            + "padding: 10px;"
        + "}"

        + "#melown-stats-panel-info {"
            + "margin-top: 5px;"
            + "margin-bottom: 3px;"
        + "}"

        + "#melown-stats-panel-info table {"
            + "color:#000000;"
            + "text-align: left;"
            + "font-size: 12px;"
        + "}"

        + "#melown-stats-panel-info table td {"
            + "vertical-align: top;"
        + "}"

        + "#melown-stats-panel-pos {"
            + "width: 100%;"
        + "}"
    );

    this.statsElement_ = document.createElement("div");
    this.statsElement_.id = "melown-stats-panel";
    this.statsElement_.innerHTML =
        '<span id="melown-stats-panel-title">Render statistics</h3>'+
        '<p id="melown-stats-panel-info"></p>'+
        '<input id="melown-stats-panel-pos" type="text">';

    this.core_.element_.appendChild(this.statsElement_);
    this.statsInfoElement_ = document.getElementById("melown-stats-panel-info");
    this.statsPosElement_ = document.getElementById("melown-stats-panel-pos");
    this.statsPanelVisible_ = false;
};

Melown.Inspector.prototype.showStatsPanel = function() {
    this.statsElement_.style.display = "block";
    this.statsPanelVisible_ = true;
};

Melown.Inspector.prototype.hideStatsPanel = function() {
    this.statsElement_.style.display = "none";
    this.statsPanelVisible_ = false;
};

Melown.Inspector.prototype.switchStatsPanel = function() {
    if (this.statsPanelVisible_) {
        this.hideStatsPanel();
    } else {
        this.showStatsPanel();
    }
};

Melown.Inspector.prototype.updateStatsPanel = function(stats_) {
    var text2_ =
            "FPS: " + Math.round(stats_.fps_) + "<br/>" +
            "Render time: " + Math.round(stats_.renderTime_*1000) + "<br/>" +
            "- gpu total: " + Math.round(stats_.gpuUsed_/(1024*1024)) + "MB<br/>" +
            "- gpu textures: " + Math.round(stats_.gpuTexturesUsed_/(1024*1024)) + "MB<br/>" +
            "- gpu meshes: " + Math.round(stats_.gpuMeshesUsed_/(1024*1024)) + "MB<br/>" +
            "- cpu cache: " + Math.round(stats_.resourcesUsed_/(1024*1024)) + "MB<br/>" +
            "- metailes: " + Math.round(stats_.metaUsed_/(1024*1024)) + "MB<br/>" +
//            "FOV: " + Math.round(this.core_.getOption("fov")) + " deg<br/>" +
//            "viewHeight: " + Math.round(this.core_.getOption("viewHeight")) + " m<br/>" +
//            "distance: " + Math.round(this.core_.renderer_.cameraDistance_) + " m<br/>" +
            "Polygons: " + (stats_.drawnFaces_) + "<br/>";

    var text3_ = "Tiles: " + (stats_.drawnTiles_) +"<br/>";

    var text_ = "<table style='width:305px'><tr><td>" + text2_ + "</td><td>" + text3_ + "</td></tr></table>";

    this.statsInfoElement_.innerHTML = text_;

    var map_ = this.core_.getMap();

    if (map_ != null) {
        var p = map_.getPosition();
        var value_ = JSON.stringify(p.pos_);

        if (this.statsPosElement_.value != value_) {
            this.statsPosElement_.value = value_;
        }
    }

};

