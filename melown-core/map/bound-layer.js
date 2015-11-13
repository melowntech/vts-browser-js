/**
 * @constructor
 */
Melown.MapBoundLayer = function(map_, json_) {
    this.map_ = map_;
    this.id_ = json_["id"] || null;
    this.type_ = json_["type"] || "raster";
    this.url_ = json_["url"] || "";
    this.tileSize_ = json_["tileSize"] || [256,256];
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.credits_ = json_["credits"] || [];
};

Melown.MapBoundLayer.prototype.hasTile = function(id_) {
    if (id_[0] < this.lodRange_[0] || id_[0] > this.lodRange_[1] ||
        id_[1] < this.tileRange_[0][0] || id_[1] > this.tileRange_[1][0] ||
        id_[2] < this.tileRange_[0][1] || id_[2] > this.tileRange_[1][1] ) {
        return false;
    }

    return true;
};

Melown.MapBoundLayer.prototype.getUrl = function(id_, skipBaseUrl_) {
    this.map_.makeUrl(this.url_, id_, null, skipBaseUrl_);
};
