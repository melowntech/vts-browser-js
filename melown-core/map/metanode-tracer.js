/**
 * @constructor
 */
Melown.MapMetanodeTracer = function(mapTree_, surface_, nodeProcessingFunction_)
{
    this.map_ = mapTree_.map_;
    this.surfaceTree_ = mapTree_.surfaceTree_;
    this.metastorageTree_ = mapTree_.metastorageTree_;
    this.metaBinaryOrder_ = mapTree_.metaBinaryOrder_;
    this.rootId_ = mapTree_.rootId_;
    this.surface_ = surface_; //????
    this.nodeProcessingFunction_ = nodeProcessingFunction_;
};

Melown.MapMetanodeTracer.prototype.trace = function(tile_) {

    this.traceTile(this.surfaceTree_);
};

Melown.MapMetanodeTracer.prototype.traceTile = function(tile_) {
    if (tile_ == null) {
        return;
    }

    if (tile_.surface_ == null) {
        this.checkTileSurface(tile_);
    }

    if (tile_.metastorage_ == null) {
        tile_.metastorage_ = Melown.FindMetastorage(this.map_, this.metastorageTree_, this.rootId_, tile_, this.metaBinaryOrder_);
    }

    if (tile_.metanode_ == null) {

        var surface_ = this.surface_ || tile_.surface_;

        if (surface_ == null) {
            return;
        }

        var metatile_ = tile_.metastorage_.getMetatile(surface_);

        if (metatile_ == null) {
            metatile_ = new Melown.MapMetatile(tile_.metastorage_, surface_);
            tile_.metastorage_.addMetatile(metatile_);
        }

        if (metatile_.isReady() == true) {

            tile_.metanode_ = metatile_.getNode(tile_.id_);

            if (tile_.metanode_ == null) {
                tile_.metanode_ = metatile_.getNode(tile_.id_);
            } else {
                /*
                if (tile_.id_[0] == 15) {
                    tile_ = tile_;
                }*/

                tile_.metanode_.tile_ = tile_; //used only for validate

                for (var i = 0; i < 4; i++) {
                    if (tile_.metanode_.hasChild(i) == true) {
                        tile_.addChild(i);
                    } else {
                        tile_.removeChildByIndex(i);
                    }
                }
            }

        } else {
            return;
        }

    }

    if (tile_.metanode_ == null) { //only for wrong data
        return;
    }

    tile_.metanode_.metatile_.used();

    if (this.nodeProcessingFunction_(tile_) == true) {

        if (tile_.id_[0] == 17) {
            tile_ = tile_;
        }

        //trace children
        for (var i = 0; i < 4; i++) {
            this.traceTile(tile_.children_[i]);
        }
    }

};

Melown.MapMetanodeTracer.prototype.checkTileSurface = function(tile_) {

    tile_.surface_ = null;

    var sequence_ = this.map_.surfaceSequence_;

    //find surfaces with content
    for (var i = sequence_.length - 1; i >= 0; i--) {
        if (sequence_[i].hasTile(tile_.id_) == true) {

            var surface_ = sequence_[i];

            //reset tile data
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }

            tile_.surface_ = surface_;
            tile_.empty_ = false;

            return;
        }
    }

    //find surfaces with metatile
    for (var i = sequence_.length - 1; i >= 0; i--) {
        if (sequence_[i].hasMetatile(tile_.id_) == true) {

            var surface_ = sequence_[i];

            //reset tile data
            if (tile_.surface_ != surface_) {
                tile_.surfaceMesh_ = null;
                tile_.surfaceTexture_ = null;
                tile_.surfaceGeodata_ = null;
                tile_.heightMap_ = null;
            }

            tile_.surface_ = surface_;
            tile_.empty_ = true;

            return;
        }
    }

};
