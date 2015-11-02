
//STATS PANEL
Melown.Interface.prototype.showStatsPanel = function() {
    this.setElementStyle("Melown-engine-stats-panel", "display", "block");
    this.statsPanelVisible_ = true;
};

Melown.Interface.prototype.hideStatsPanel = function() {
    this.setElementStyle("Melown-engine-stats-panel", "display", "none");
    this.statsPanelVisible_ = false;
};

Melown.Interface.prototype.updateStatsPanel = function() {
    if (this.statsElement_ == null) {
        this.statsElement_ = document.getElementById("Melown-engine-render-stats");
    }

    var stats_ = this.core_.getData("map-stats");

    var text2_ =
            "FPS: " + Math.round(stats_.fps_) + "<br/>" +
            "Render time: " + Math.round(stats_.renderTime_*1000) + "<br/>" +
            "- used: " + Math.round(stats_.gpuMemoryUsed_/(1024*1024)) + "MB<br/>" +
            "- used textures: " + Math.round(stats_.gpuMemoryTextures_/(1024*1024)) + "MB<br/>" +
            "- used meshes: " + Math.round(stats_.gpuMemoryMeshes_/(1024*1024)) + "MB<br/>" +
            "FOV: " + Math.round(this.core_.getOption("fov")) + " deg<br/>" +
            "viewHeight: " + Math.round(this.core_.getOption("viewHeight")) + " m<br/>" +
            "distance: " + Math.round(this.core_.renderer_.cameraDistance_) + " m<br/>" +
            "Polygons: " + (stats_.renderedPolygons_) + "<br/>";

    var text3_ = "Tiles: " + (stats_.drawnTiles_) +"<br/>";

    var text_ = "<table style='width:305px'><tr><td>" + text2_ + "</td><td>" + text3_ + "</td></tr></table>";

    this.statsElement_.innerHTML = text_;

};

//ADAVANCED STATS
Melown.Interface.prototype.showStatsGraphsPanel = function() {
    this.statsGraphsVisible_ = true;
    this.core_.setOption("recordStats", true);
    this.setElementStyle("Melown-engine-stats-graphs", "display", "block");
};

Melown.Interface.prototype.hideStatsGraphsPanel = function() {
    this.statsGraphsVisible_ = false;
    this.setElementStyle("Melown-engine-stats-graphs", "display", "none");
};

Melown.Interface.prototype.switchStatsGraphsPanel = function() {
    if (this.statsGraphsVisible_ == true) {
        this.hideStatsGraphsPanel();
    } else {
        this.showStatsGraphsPanel();
    }
};

Melown.Interface.prototype.statsRecordingPressed = function() {
    if (this.core_ == null) {
        return;
    }

    this.core_.setOption("recordStats", !this.core_.getOption("recordStats"));

    this.updateStatsGraphsPanel();
};

Melown.Interface.prototype.statsRefreshPressed = function() {

    this.statsRefresh_ = !this.statsRefresh_;

    this.updateStatsGraphsPanel();
    this.updateStatsGraphs();
};

Melown.Interface.prototype.statsResetPressed = function() {
    if (this.core_ == null) {
        return;
    }

    var stats_ = this.core_.getData("statsSamples");

    var samples_ = stats_["samples"];
    var valuesFrame_ = stats_["frame"];
    var valuesRender_ = stats_["render"];
    var valuesTextures_ = stats_["textures"];
    var valuesMeshes_ = stats_["meshes"];
    var valuesGpuMeshes_ = stats_["gpumeshes"];
    var valuesTotal_ = stats_["cache"];
    var valuesUsed_ = stats_["cache-used"];
    var valuesMemTextures_ = stats_["cache-textures"];
    var valuesMemMeshes_ = stats_["cache-meshes"];
    var valuesPolygons_ = stats_["polygons"];
    var valuesLODs_ = stats_["lods"];
    var valuesFluxTextures_ = stats_["flux-textures"];
    var valuesFluxMeshes_ = stats_["flux-meshes"];

    for (var i = 0; i < samples_; i++) {
        valuesFrame_[i] = 0;
        valuesRender_[i] = 0;
        valuesTextures_[i] = 0;
        valuesMeshes_[i] = 0;
        valuesGpuMeshes_[i] = 0;
        valuesTotal_[i] = 0;
        valuesUsed_[i] = 0;
        valuesMemTextures_[i] = 0;
        valuesMemMeshes_[i] = 0;
        valuesPolygons_ = 0;
        valuesLODs_ = [0,[]];
        valuesFluxTextures_[i] = [[0,0],[0,0]];
        valuesFluxMeshes_[i] = [[0,0],[0,0]];
    }
};

Melown.Interface.prototype.statsZoomPressed = function() {

    switch (this.statsZoom_) {
        case "max":     this.statsZoom_ = "120avrg"; break;
        case "120avrg": this.statsZoom_ = "180avrg"; break;
        case "180avrg": this.statsZoom_ = "max"; break;
    }

    this.updateStatsGraphsPanel();
    this.updateStatsGraphs();
};

Melown.Interface.prototype.statsGraphPressed = function() {

    switch (this.statsGraph_) {
        case "Cache":     this.statsGraph_ = "Polygons"; break;
        case "Polygons":  this.statsGraph_ = "LODs"; break;
        case "LODs":      this.statsGraph_ = "Flux"; break;
        case "Flux":      this.statsGraph_ = "Cache"; break;
    }

    this.updateStatsGraphsPanel();
    this.updateStatsGraphs();
};


Melown.Interface.prototype.statsMagnifyPressed = function() {

    this.statsMagnify_ = !this.statsMagnify_;

    if (this.statsMagnify_ == true) {
        this.setElementStyle("Melown-engine-stats-render", "width", "900px");
        this.setElementStyle("Melown-engine-stats-render", "height", "150px");
        this.setElementStyle("Melown-engine-stats-cache", "width", "900px");
        this.setElementStyle("Melown-engine-stats-cache", "height", "150px");
        this.setElementProperty("Melown-engine-stats-magnify", "innerHTML", "Magnify On");
    } else {
        this.setElementStyle("Melown-engine-stats-render", "width", "500px");
        this.setElementStyle("Melown-engine-stats-render", "height", "100px");
        this.setElementStyle("Melown-engine-stats-cache", "width", "500px");
        this.setElementStyle("Melown-engine-stats-cache", "height", "100px");
        this.setElementProperty("Melown-engine-stats-magnify", "innerHTML", "Magnify Off");
    }

    this.updateStatsGraphsPanel();
    this.updateStatsGraphs();
};

Melown.Interface.prototype.updateStatsGraphsPanel = function() {

    if (this.core_.getOption("recordStats") == true) {
        this.setElementProperty("Melown-engine-stats-rec", "innerHTML", "Recording On");
    } else {
        this.setElementProperty("Melown-engine-stats-rec", "innerHTML", "Recording Off");
    }

    if (this.statsRefresh_ == true) {
        this.setElementProperty("Melown-engine-stats-ref", "innerHTML", "Refresh On");
    } else {
        this.setElementProperty("Melown-engine-stats-ref", "innerHTML", "Refresh Off");
    }

    switch (this.statsZoom_) {
        case "max":
            this.setElementProperty("Melown-engine-stats-zoom", "innerHTML", "Scale: Max value");
            break;

        case "120avrg":
            this.setElementProperty("Melown-engine-stats-zoom", "innerHTML", "Scale: 100% Avrg");
            break;

        case "180avrg":
            this.setElementProperty("Melown-engine-stats-zoom", "innerHTML", "Scale: 50% Avrg");
            break;
    }

    this.setElementProperty("Melown-engine-stats-graph", "innerHTML", "Graph: " + this.statsGraph_);
};

Melown.Interface.prototype.onStatsMouseMove = function(event_) {

    var x = event_.clientX;
    this.statsShowCursor_ = true;

    if (this.statsCanvasRender_ != null) {
        x -= this.statsCanvasRender_.getBoundingClientRect().left;
    }

    if (this.statsMagnify_ == true) {
        x = Math.floor(x * 500/900);
    }

    this.statsCursorIndex_ = x;

    if (this.core_.getOption("recordStats") != true) {
        this.updateStatsGraphs();
    }

};

Melown.Interface.prototype.onStatsMouseOut = function() {
    this.statsShowCursor_ = false;
    this.updateStatsGraphs();
};


Melown.Interface.prototype.updateStatsGraphs = function() {

    if (this.core_ == null || this.statsRefresh_ == false || this.statsGraphsVisible_ == false) {
        return;
    }

    if (this.statsCanvasRender_ == null) {
        this.statsCanvasRender_ = document.getElementById("Melown-engine-stats-render");
    }

    var stats_ = this.core_.getData("statsSamples");


    if (this.statsCanvasRender_ != null) {

        if (this.statsCanvasRenderCtx_ == null) {
            this.statsCanvasRenderCtx_ = this.statsCanvasRender_.getContext("2d");
        }

        var width_ = this.statsCanvasRender_.width;
        var height_ = this.statsCanvasRender_.height;
        var ctx_ = this.statsCanvasRenderCtx_;

        var samples_ = stats_["samples"];
        var samplesIndex_ = stats_["index"];

        var factorX_ = width_ / samples_;

        ctx_.clearRect(0, 0, width_, height_);

        var maxValue_ = 0;
        var totalFrame_ = 0;
        var totalRender_ = 0;
        var totalTexture_ = 0;
        var totalMeshes_ = 0;
        var totalGpuMeshes_ = 0;
        var realCount_ = 0;

        var valuesFrame_ = stats_["frame"];
        var valuesRender_ = stats_["render"];
        var valuesTextures_ = stats_["textures"];
        var valuesMeshes_ = stats_["meshes"];
        var valuesGpuMeshes_ = stats_["gpumeshes"];

        for (var i = 0; i < samples_; i++) {
            totalFrame_ += valuesFrame_[i];
            totalRender_ += valuesRender_[i];
            totalTexture_ += valuesTextures_[i];
            totalMeshes_ += valuesMeshes_[i];
            totalGpuMeshes_ += valuesGpuMeshes_[i];

            var v = valuesFrame_[i];

            if (v > maxValue_) {
                maxValue_ = v;
            }

            if (v > 0) {
                realCount_++;
            }
        }

        if (this.statsZoom_ == "120avrg") {
            maxValue_ = (totalFrame_ / realCount_) * 1.0;
        }

        if (this.statsZoom_ == "180avrg") {
            maxValue_ = (totalFrame_ / realCount_) * 0.5;
        }

        var factorY_ = height_ / maxValue_;

        for (var i = 0; i < samples_; i++) {
            var index_ = samplesIndex_ + i;
            index_ %= samples_;

            ctx_.fillStyle="#000000";
            ctx_.fillRect(i*factorX_, height_, 1, -(valuesFrame_[index_])*factorY_);
            ctx_.fillStyle="#ff0000";
            ctx_.fillRect(i*factorX_, height_, 1, -(valuesRender_[index_])*factorY_);

            ctx_.fillStyle="#0000ff";
            ctx_.fillRect(i*factorX_, height_, 1, -(valuesTextures_[index_])*factorY_);

            var y = height_ -(valuesTextures_[index_])*factorY_;

            ctx_.fillStyle="#007700";
            ctx_.fillRect(i*factorX_, y, 1, -(valuesMeshes_[index_])*factorY_);

            y -= (valuesMeshes_[index_])*factorY_;

            ctx_.fillStyle="#00ff00";
            ctx_.fillRect(i*factorX_, y, 1, -(valuesGpuMeshes_[index_])*factorY_);

        }

        if (this.statsShowCursor_ == true) {
            ctx_.fillStyle="#aa00aa";
            var index_ = (this.statsCursorIndex_) % samples_;
            ctx_.fillRect(Math.floor(index_*factorX_)-1, 0, 1, height_);
            ctx_.fillRect(Math.floor(index_*factorX_)+1, 0, 1, height_);
            index_ = (this.statsCursorIndex_ + samplesIndex_) % samples_;

            var str_ = '&FilledSmallSquare; Frame: ' + valuesFrame_[index_].toFixed(2) +
                       ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: ' + valuesRender_[index_].toFixed(2) +
                       ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + valuesTextures_[index_].toFixed(2) +
                       ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + valuesMeshes_[index_].toFixed(2) +
                       ' &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMeshes: ' + valuesGpuMeshes_[index_].toFixed(2) + '</div>';
        } else {
            var str_ = '&FilledSmallSquare; Frame: ' + Math.round(totalFrame_) +
                       ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: ' + Math.round(totalRender_) +
                       ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.round(totalTexture_) +
                       ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.round(totalMeshes_) +
                       ' &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMeshes: ' + Math.round(totalGpuMeshes_) +'</div>';
        }

        this.setElementProperty("Melown-engine-stats-info", "innerHTML", str_);

    }

   if (this.statsCanvasCache_ == null) {
        this.statsCanvasCache_ = document.getElementById("Melown-engine-stats-cache");
    }


    if (this.statsCanvasCache_ != null) {

        if (this.statsCanvasCacheCtx_ == null) {
            this.statsCanvasCacheCtx_ = this.statsCanvasCache_.getContext("2d");
        }

        var width_ = this.statsCanvasCache_.width;
        var height_ = this.statsCanvasCache_.height;
        var ctx_ = this.statsCanvasCacheCtx_;

        var samples_ = stats_["samples"];
        var samplesIndex_ = stats_["index"];

        var factorX_ = width_ / samples_;

        ctx_.clearRect(0, 0, width_, height_);

        switch (this.statsGraph_) {
        case "Cache":
            {
                var factorY_ = height_ / (stats_["cache-size"]/1024/1024);

                var maxTotal_ = 0;
                var maxUsed_ = 0;
                var maxTextures_ = 0;
                var maxMeshes_ = 0;

                var valuesTotal_ = stats_["cache"];
                var valuesUsed_ = stats_["cache-used"];
                var valuesTextures_ = stats_["cache-textures"];
                var valuesMeshes_ = stats_["cache-meshes"];

                for (var i = 0; i < samples_; i++) {
                    maxTotal_ = valuesTotal_[i] > maxTotal_ ? valuesTotal_[i] : maxTotal_;
                    maxUsed_ = valuesUsed_[i] > maxUsed_ ? valuesUsed_[i] : maxUsed_;
                    maxTextures_ = valuesTextures_[i] > maxTextures_ ? valuesTextures_[i] : maxTextures_;
                    maxMeshes_ = valuesMeshes_[i] > maxMeshes_ ? valuesMeshes_[i] : maxMeshes_;
                }

                for (var i = 0; i < samples_; i++) {
                    var index_ = samplesIndex_ + i;
                    index_ %= samples_;

                    ctx_.fillStyle="#000000";
                    ctx_.fillRect(i*factorX_, height_, 1, -(valuesTotal_[index_])*factorY_);
                    ctx_.fillStyle="#ff0000";
                    ctx_.fillRect(i*factorX_, height_, 1, -(valuesUsed_[index_])*factorY_);
                    ctx_.fillStyle="#0000ff";
                    ctx_.fillRect(i*factorX_, height_, 1, -(valuesTextures_[index_])*factorY_);
                    ctx_.fillStyle="#00bb00";
                    ctx_.fillRect(i*factorX_, height_, 1, -(valuesMeshes_[index_])*factorY_);
                }

                if (this.statsShowCursor_ == true) {
                    var index_ = (this.statsCursorIndex_ + samplesIndex_) % samples_;
                    var str_ = '&FilledSmallSquare; Cache: ' + Math.round(valuesTotal_[index_]) +
                               ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Used: ' + Math.round(valuesUsed_[index_]) +
                               ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.round(valuesTextures_[index_]) +
                               ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.round(valuesMeshes_[index_]) +'</div>';
                } else {
                    var str_ = '&FilledSmallSquare; Cache: ' + Math.round(maxTotal_) +
                               ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Used: ' + Math.round(maxUsed_) +
                               ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.round(maxTextures_) +
                               ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.round(maxMeshes_) +'</div>';
                }

            }
            break;


        case "Polygons":
            {
                var max_ = 0;
                var min_ = 99999999999;
                var total_ = 0;
                var realCount_ = 0;
                var values_ = stats_["polygons"];

                for (var i = 0; i < samples_; i++) {
                    max_ = values_[i] > max_ ? values_[i] : max_;

                    if (values_[i] > 0) {
                        min_ = values_[i] < min_ ? values_[i] : min_;
                        total_ += values_[i];
                        realCount_++;
                    }
                }

                var factorY_ = height_ / max_;

                for (var i = 0; i < samples_; i++) {
                    var index_ = samplesIndex_ + i;
                    index_ %= samples_;

                    ctx_.fillStyle="#007700";
                    ctx_.fillRect(i*factorX_, height_, 1, -(values_[index_])*factorY_);
                }

                if (this.statsShowCursor_ == true) {
                    var index_ = (this.statsCursorIndex_ + samplesIndex_) % samples_;
                    var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Polygons: ' + Math.round(values_[index_]) +'</div>';
                } else {
                    var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Polygons Max: ' + max_ +'</div>';
                    str_ += ' &nbsp Min: ' + min_;
                    str_ += ' &nbsp Avrg: ' + Math.round(total_ / realCount_) +'</div>';
                }
            }
            break;

        case "LODs":
            {
                var max_ = 0;
                var values_ = stats_["lods"];

                for (var i = 0; i < samples_; i++) {
                    max_ = values_[i][0] > max_ ? values_[i][0] : max_;
                }

                var factorY_ = height_ / max_;

                ctx_.fillStyle="#000000";
                ctx_.fillRect(0, 0, width_, height_);

                for (var i = 0; i < samples_; i++) {
                    var index_ = samplesIndex_ + i;
                    index_ %= samples_;

                    //ctx_.fillStyle="#000000";
                    //ctx_.fillRect(i*factorX_, height_, 1, -(values_[index_][0])*factorY_);

                    var y = height_;

                    for (var j in values_[index_][1]) {
                        ctx_.fillStyle="hsl("+((j*23)%360)+",100%,50%)";
                        var value_ = Math.round((values_[index_][1][j])*factorY_);
                        ctx_.fillRect(i*factorX_, y, 1, -value_);
                        y -= value_;
                    }

                }

                if (this.statsShowCursor_ == true) {
                    var index_ = (this.statsCursorIndex_ + samplesIndex_) % samples_;

                    var str_ = "LODs:" + values_[index_][0];

                    for (var j in values_[index_][1]) {
                        str_ += '<span style="color:hsl('+((j*23)%360)+',100%,50%)">&FilledSmallSquare;</span>'+j+':'+values_[index_][1][j];
                    }

                } else {
                    var str_ = "LODs:" + values_[index_][0];
                }

                str_ += '</div>';
            }
            break;

        case "Flux":
            {
                var maxCount_ = 0;
                var maxSize_ = 0;

                var maxTexPlusCount_ = 0;
                var maxTexPlusSize_ = 0;
                var maxTexMinusCount_ = 0;
                var maxTexMinusSize_ = 0;

                var maxMeshPlusCount_ = 0;
                var maxMeshPlusSize_ = 0;
                var maxMeshMinusCount_ = 0;
                var maxMeshMinusSize_ = 0;

                var valuesTextures_ = stats_["flux-textures"];
                var valuesMeshes_ = stats_["flux-meshes"];

                for (var i = 0; i < samples_; i++) {
                    var tmp_ = valuesTextures_[i][0][0] + valuesMeshes_[i][0][0];
                    maxCount_ = tmp_ > maxCount_ ? tmp_ : maxCount_;
                    tmp_ = valuesTextures_[i][1][0] + valuesMeshes_[i][1][0];
                    maxCount_ = tmp_ > maxCount_ ? tmp_ : maxCount_;

                    tmp_ = valuesTextures_[i][0][1] + valuesMeshes_[i][0][1];
                    maxSize_ = tmp_ > maxSize_ ? tmp_ : maxSize_;
                    tmp_ = valuesTextures_[i][1][1] + valuesMeshes_[i][1][1];
                    maxSize_ = tmp_ > maxSize_ ? tmp_ : maxSize_;

                    maxTexPlusCount_ = valuesTextures_[i][0][0] > maxTexPlusCount_ ? valuesTextures_[i][0][0] : maxTexPlusCount_;
                    maxTexPlusSize_ = valuesTextures_[i][0][1] > maxTexPlusSize_ ? valuesTextures_[i][0][1] : maxTexPlusSize_;
                    maxTexMinusCount_ = valuesTextures_[i][1][0] > maxTexMinusCount_ ? valuesTextures_[i][1][0] : maxTexMinusCount_;
                    maxTexMinusSize_ = valuesTextures_[i][1][1] ? valuesTextures_[i][1][1] : maxTexMinusSize_;

                    maxMeshPlusCount_ = valuesMeshes_[i][0][0] > maxMeshPlusCount_ ? valuesMeshes_[i][0][0] : maxMeshPlusCount_;
                    maxMeshPlusSize_ = valuesMeshes_[i][0][1] > maxMeshPlusSize_ ? valuesMeshes_[i][0][1] : maxMeshPlusSize_;
                    maxMeshMinusCount_ = valuesMeshes_[i][1][0] > maxMeshMinusCount_ ? valuesMeshes_[i][1][0] : maxMeshMinusCount_;
                    maxMeshMinusSize_ = valuesMeshes_[i][1][1] > maxMeshMinusSize_ ? valuesMeshes_[i][1][1] : maxMeshMinusSize_;
                }

                var factorY_ = (height_*0.25-2) / maxCount_;
                var factorY2_ = (height_*0.25-2) / maxSize_;

                var base_ = Math.floor(height_*0.25);
                var base2_ = Math.floor(height_*0.75);

                for (var i = 0; i < samples_; i++) {
                    var index_ = samplesIndex_ + i;
                    index_ %= samples_;

                    ctx_.fillStyle="#0000aa";
                    ctx_.fillRect(i*factorX_, base_, 1, -(valuesTextures_[index_][0][0])*factorY_);
                    ctx_.fillRect(i*factorX_, base_+1, 1, (valuesTextures_[index_][1][0])*factorY_);

                    ctx_.fillRect(i*factorX_, base2_, 1, -(valuesTextures_[index_][0][1])*factorY2_);
                    ctx_.fillRect(i*factorX_, base2_+1, 1, (valuesTextures_[index_][1][1])*factorY2_);

                    ctx_.fillStyle="#007700";

                    ctx_.fillRect(i*factorX_, base_-(valuesTextures_[index_][0][0])*factorY_, 1, -(valuesMeshes_[index_][0][0])*factorY_);
                    ctx_.fillRect(i*factorX_, base_+1+(valuesTextures_[index_][1][0])*factorY_, 1, (valuesMeshes_[index_][1][0])*factorY_);

                    ctx_.fillRect(i*factorX_, base2_-(valuesTextures_[index_][0][1])*factorY2_, 1, -(valuesMeshes_[index_][0][1])*factorY2_);
                    ctx_.fillRect(i*factorX_, base2_+1+(valuesTextures_[index_][1][0])*factorY2_, 1, (valuesMeshes_[index_][1][1])*factorY2_);

                    ctx_.fillStyle="#aaaaaa";
                    ctx_.fillRect(0, Math.floor(height_*0.5), width_, 1);
                    ctx_.fillStyle="#dddddd";
                    ctx_.fillRect(0, base_, width_, 1);
                    ctx_.fillRect(0, base2_, width_, 1);
                }


                if (this.statsShowCursor_ == true) {
                    var index_ = (this.statsCursorIndex_ + samplesIndex_) % samples_;
                    var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Textures Count +/-: ' + valuesTextures_[index_][0][0] + "/" + valuesTextures_[index_][1][0];
                    str_ += ' &nbsp Size +/-: ' + (valuesTextures_[index_][0][1]/1024/1024).toFixed(2) + "/" + (valuesTextures_[index_][1][1]/1024/1024).toFixed(2);
                    str_ += ' &nbsp <span style="color:#0000aa">&FilledSmallSquare;</span> Meshes Count +/-: ' + valuesMeshes_[index_][0][0] + "/" + valuesMeshes_[index_][1][0];
                    str_ += ' &nbsp Size +/-: ' + (valuesMeshes_[index_][0][1]/1024/1024).toFixed(2) + "/" + (valuesMeshes_[index_][1][1]/1024/1024).toFixed(2);
                    str_ += '</div>';
                } else {
                    var str_ = '<span style="color:#007700">&FilledSmallSquare;</span> Textures Count +/-: ' + maxTexPlusCount_ + "/" + maxTexMinusCount_;
                    str_ += ' &nbsp Size +/-: ' + (maxTexPlusSize_/1024/1024).toFixed(2) + "/" + (maxTexMinusSize_/1024/1024).toFixed(2);
                    str_ += ' &nbsp <span style="color:#0000aa">&FilledSmallSquare;</span> Meshes Count +/-: ' + maxMeshPlusCount_ + "/" + maxMeshMinusCount_;
                    str_ += ' &nbsp Size +/-: ' + (maxMeshPlusSize_/1024/1024).toFixed(2) + "/" + (maxMeshMinusSize_/1024/1024).toFixed(2);
                    str_ += '</div>';
                }

            }
            break;

        }

        if (this.statsShowCursor_ == true) {
            ctx_.fillStyle="#aa00aa";
            var index_ = (this.statsCursorIndex_) % samples_;
            ctx_.fillRect(Math.floor(index_*factorX_)-1, 0, 1, height_);
            ctx_.fillRect(Math.floor(index_*factorX_)+1, 0, 1, height_);
        }

        this.setElementProperty("Melown-engine-stats-info2", "innerHTML", str_);

    }

};
