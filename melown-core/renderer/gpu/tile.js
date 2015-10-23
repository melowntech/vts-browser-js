
if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

//! Holds the GPU data for a tile.
/**
 * @constructor
 */
Melown.GpuTile = function(gpu_, browser_, tile_)
{
    this.gpu_ = gpu_;
    this.type_ = tile_.type_;
    this.ready_ = false;

    switch(this.type_){
        case "terrain":
            this.mesh_ = new Melown.GpuMesh(gpu_, tile_.mesh_, null, browser_);
            this.texture_ = new Melown.GpuTexture(gpu_, null, browser_);
            this.texture_.createFromImage(tile_.image_, "linear");
            this.meshFileSize_ = tile_.meshFileSize_;
            this.imageFileSize_ = tile_.imageFileSize_;
            this.ready_ = true;
            break;

        case "geodata":

            this.geodata_ = new Melown.GpuGeodata(gpu_, tile_, tile_.layer_);
            this.geodataFileSize_ += tile_.size();
            //this.ready_ = true;
            break;
    }

};

Melown.GpuTile.prototype.kill = function() {

    switch(this.type_){
        case "terrain":
            this.mesh_.kill();
            this.texture_.kill();
            break;

        case "geodata":
            this.geodata_.kill();
            break;
    }
};

Melown.GpuTile.prototype.isReady = function() {

    if (this.ready_ == false) {
        switch(this.type_){
            case "geodata":
                this.ready_ = this.geodata_.isReady();
                break;
        }
    }

    return this.ready_;
};

Melown.GpuTile.prototype.draw = function(mv_, mvp_, applyOrigin_) {

    if (this.ready_ == true) {
        switch(this.type_){
            case "geodata":
                this.geodata_.draw(mv_, mvp_, applyOrigin_);
                break;
        }
    }

    return this.ready_;
};

Melown.GpuTile.prototype.size = function() {

    switch(this.type_){
        case "terrain": return this.mesh_.size() + this.texture_.size();
        case "geodata": this.geodata_.size();
    }

};


//! Manages GPU memory -- uploads/releases GpuTiles
/**
 * @constructor
 */
Melown.GpuCache = function(gpu_, browser_, size_)
{
    //QCache<TileId, GpuTile> cache; cache(size)
    //this.cache_ = [];
    this.gpu_ = gpu_;
    this.browser_ = browser_;
    this.cache_ = new Melown.QCache(size_);
};

Melown.GpuCache.prototype.get = function(id_, tile_)
{
    if (tile_ == null){
        id_ = id_;
    }

    if (tile_.layer_ != null) {
        id_.layerId_ = tile_.layer_.innerId_;
    }

    if (tile_.type_ == "geodata") {
        tile_ = tile_;
        //return null;
    }

    var gpuTile_ = this.cache_.find(id_);
    if (gpuTile_) return gpuTile_;

    var gpuTile_ = new Melown.GpuTile(this.gpu_, this.browser_, tile_); // upload the tile to GPU RAM
    this.cache_.insert(id_, gpuTile_, gpuTile_.size());

    return gpuTile_;
};

Melown.GpuCache.prototype.size = function()
{
    return this.cache_.totalCost_;
};

Melown.GpuCache.prototype.reset = function()
{
    return this.cache_.clear();
};

