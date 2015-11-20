

Melown.Map.prototype.draw = function() {

    //loop map trees
    for (var i = 0, li = this.mapTrees_.length; i < li; i++) {
        this.mapTrees_[i].draw();
    }

    //loop currently used free layers
    for (var i = 0, li = this.freeLayers_.length; i < li; i++) {
        this.freeLayers_[i].draw();
    }

};

Melown.Map.prototype.drawSurfaceTile = function(tile_, node_, cameraPos_) {

    if (tile_.surface_ != null) {

        if ((node_.flags_ & MelownMetanodeFlags_GeometryPresent) != 0) {

            if (tile_.surfaceMesh_ == null) {
                tile_.surfaceMesh_ = new Melown.MapMesh(this, tile_);
            }

            if (this.drawBBoxes_ && !this.drawMeshBBox_) {
                node_.drawBBox(cameraPos_);
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


