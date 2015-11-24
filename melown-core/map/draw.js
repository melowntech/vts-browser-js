

Melown.Map.prototype.draw = function() {
    this.ndcToScreenPixel_ = this.renderer_.curSize_[0] * 0.5;

    //loop map trees
    for (var i = 0, li = this.mapTrees_.length; i < li; i++) {
        this.mapTrees_[i].draw();
    }

    //loop currently used free layers
    for (var i = 0, li = this.freeLayers_.length; i < li; i++) {
        this.freeLayers_[i].draw();
    }

};

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_, pixelSize_) {

    if (tile_.surface_ != null) {

        if ((node_.flags_ & MelownMetanodeFlags_GeometryPresent) != 0) {

            if (tile_.surfaceMesh_ == null) {
                tile_.surfaceMesh_ = new Melown.MapMesh(this, tile_);
            }

            if (this.drawBBoxes_) {
                this.drawTileInfo(tile_, node_, cameraPos_, tile_.surfaceMesh_, pixelSize_);
            }

            if (tile_.surfaceMesh_.isReady() == true) {

                var submeshes_ = tile_.surfaceMesh_.submeshes_;

                for (var i = 0, li = submeshes_.length; i < li; i++) {

                    //TODO: check internal texture flag

                    if (this.drawBBoxes_ && this.drawMeshBBox_) {
                        submeshes_[i].drawBBox(cameraPos_);
                    }

                    if (tile_.surfaceTextures_[i] == null) {
                        tile_.surfaceTextures_[i] = new Melown.MapTexture(this, tile_, i, false);
                    } else {
                        if (tile_.surfaceTextures_[i].isReady() == true) {
                            tile_.surfaceMesh_.drawSubmesh(cameraPos_, i, tile_.surfaceTextures_[i]);
                            this.stats_.drawnTiles_++;
                        }
                    }
                }
            }
        }
    }


};

Melown.Map.prototype.drawTileInfo = function(tile_, node_, cameraPos_, mesh_, pixelSize_) {
    var mvp_;

    if (!this.drawMeshBBox_) {
        node_.drawBBox(cameraPos_);
    }

    //get screen pos of node
    var min_ = node_.bbox_.min_;
    var max_ = node_.bbox_.max_;

    var pos_ =  this.core_.getRendererInterface().getScreenCoords(
                    [(min_[0] + (max_[0] - min_[0])*0.5) - cameraPos_[0],
                     (min_[1] + (max_[1] - min_[1])*0.5) - cameraPos_[1],
                     (max_[2]) - cameraPos_[2]],
                     this.camera_.getMvpMatrix());

    pos_[2] = pos_[2] * 0.9992;

    var factor_ = this.debugTextSize_;

    //draw lods
    if (this.drawLods_ == true) {
        text_ = "" + tile_.id_[0];
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]-4*factor_), 4*factor_, text_, [255,0,0,255], pos_[2]);
    }

    //draw indices
    if (this.drawIndices_ == true) {
        var text_ = "" + tile_.id_[1] + " " + tile_.id_[2];
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]-11*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw positions
    if (this.drawPositions_ == true) {
        var text_ = "" + min_[0].toFixed(1) + " " + min_[1].toFixed(1) + " " + min_[2].toFixed(1);
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+3*factor_), 4*factor_, text_, [0,255,255,255], pos_[2]);
    }

    //draw face count
    if (this.drawFaceCount_ == true && mesh_ != null) {
        var text_ = "" + mesh_.faces_ + " - " + mesh_.submeshes_.length;
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+10*factor_), 4*factor_, text_, [0,255,0,255], pos_[2]);
    }

    //draw distance
    if (this.drawDistance_ == true) {
        var text_ = "" + pixelSize_[1].toFixed(2) + "  " + pixelSize_[0].toFixed(2) + "  " + node_.pixelSize_.toFixed(2);
        this.renderer_.drawText(Math.round(pos_[0]-(text_.length*4*factor_)*0.5), Math.round(pos_[1]+17*factor_), 4*factor_, text_, [255,0,255,255], pos_[2]);
    }

/*
    //draw texture size
    if (this.drawTextureSize_ == true && gpuTile_ != null) {
        var text_ = "" + gpuTile_.texture_.width_ + " x " + gpuTile_.texture_.height_;
        this.drawText(Math.round(pos_[0]-(text_.length*4)*0.5), Math.round(pos_[1]-18), 4, text_, [255,255,255,255], pos_[2]);
    }

    //draw texel size
    if (this.drawTexelSize_ == true) {
*/


};



