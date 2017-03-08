
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
            + "z-index: 7;"
            + "padding: 10px;"
        + "}"

        + "#melown-stats-panel-info {"
            + "margin-top: 5px;"
            + "margin-bottom: 3px;"
            + "overflow: hidden;"
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

    this.statsElement_.addEventListener("mouseup", this.doNothing.bind(this), true);
    this.statsElement_.addEventListener("mousedown", this.doNothing.bind(this), true);
    this.statsElement_.addEventListener("mousewheel", this.doNothing.bind(this), false);
    this.statsElement_.addEventListener("dblclick", this.doNothing.bind(this), false);

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
            " - resources: " + Math.round(stats_.gpuRenderUsed_/(1024*1024)) + "MB<br/>" +
            //" - resources: " + (stats_.gpuRenderUsed_) + " --- " + (stats_.gpuRenderUsed_ / stats_.drawnTiles_) + "<br/>" +
            "GPU Cache: " + Math.round(stats_.gpuUsed_/(1024*1024)) + "MB<br/>" +
            " - textures: " + Math.round(stats_.gpuTextures_/(1024*1024)) + "MB<br/>" +
            " - meshes: " + Math.round(stats_.gpuMeshes_/(1024*1024)) + "MB<br/>" +
            " - geodata: " + Math.round(stats_.gpuGeodata_/(1024*1024)) + "MB<br/>" +
            "CPU Cache: " + Math.round(stats_.resourcesUsed_/(1024*1024)) + "MB<br/>" +
            "Metaile Cache: " + Math.round(stats_.metaUsed_/(1024*1024)) + "MB<br/>" +
//            "FOV: " + Math.round(this.core_.getOption("fov")) + " deg<br/>" +
//            "viewHeight: " + Math.round(this.core_.getOption("viewHeight")) + " m<br/>" +
//            "distance: " + Math.round(this.core_.renderer_.cameraDistance_) + " m<br/>" +
            "Draw calls: " + (stats_.drawCalls_) + "<br/>" +
            "Polygons: " + (stats_.drawnFaces_) + "<br/><br/>" +
            "Terrain Height: " + (stats_.heightTerrain_.toFixed(2)) + "<br/>" +
            "- float: " + (stats_.heightDelta_.toFixed(2)) + "<br/>" +
            "- desired lod: " + (stats_.heightLod_.toFixed(2)) + "<br/>" +
            "- used lod: " + (stats_.heightNode_.toFixed(2)) + "<br/>" +
            "- used source: " + ((stats_.heightClass_ == 2 ? "navtile" : stats_.heightClass_ == 1 ? "node": "---") ) + "<br/>" +
            "Terrain Radar Lod: " + (this.radarLod_) + "<br/><br/>" + 
            "Loaded/Errors: " + (stats_.loadedCount_) + " / " + (stats_.loadErrorCount_) + "<br/>" +
            "Load time: " + ((stats_.loadLast_ - stats_.loadFirst_)*0.001).toFixed(2) + "s <br/>";

    var text3_ = "Metatiles: " + (stats_.processedMetatiles_) +"<br/>"+
                 "Metanodes: " + (stats_.processedNodes_) + " / " + (stats_.usedNodes_) + "<br/>"+
                 "GeodataTiles: " + (stats_.drawnGeodataTiles_) +"<br/><br/>" +
                 
                 "Tiles: " + (stats_.drawnTiles_) +"<br/>";

    for (var i =0, li = stats_.renderedLods_.length; i < li; i++) {
        if (stats_.renderedLods_[i]) {
            text3_ += "LOD " + i + ": " + (stats_.renderedLods_[i]) +"<br/>";
        }
    }

    var text_ = "<table style='width:305px'><tr><td>" + text2_ + "</td><td>" + text3_ + "</td></tr></table>";

    this.statsInfoElement_.innerHTML = text_;

    var map_ = this.core_.getMap();

    if (map_ != null) {
        var p = map_.getPosition();
        var s = "";
        s += p.getViewMode() + ",";
        var c = p.getCoords();
        s += c[0] + "," + c[1] + "," + p.getHeightMode() + "," + c[2].toFixed(2) + ",";
        var o = p.getOrientation();
        s += o[0].toFixed(2) + "," + o[1].toFixed(2) + "," + o[2].toFixed(2) + ",";
        s += p.getViewExtent().toFixed(2) + "," + p.getFov().toFixed(2);
        
        //var value_ = JSON.stringify(p.pos_);

        if (this.statsPosElement_.value != s) {
            this.statsPosElement_.value = s;
        }
    }

};

