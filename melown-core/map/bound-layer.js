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
    this.tileRange_ = json_["tileRange"] || [[0,0],[0,0]];
    this.currentAlpha_ = 1.0;
    this.creditsNumbers_ = [];

    for (var i = 0, li = this.credits_.length; i < li; i++) {
        var credit_ = map_.getCreditById(this.credits_[i]);
        if (credit_) {
            this.creditsNumbers_.push(credit_.id_); 
        }
    }
};

Melown.MapBoundLayer.prototype.getInfo = function() {
    return {
        "type" : this.type_,
        "url" : this.url_,
        "tileSize" : this.tileSize_,
        "credits" : this.credits_,
        "lodRange" : this.lodRange_,
        "tileRange" : this.tileRange_
    };
};

Melown.MapBoundLayer.prototype.hasTile = function(id_) {
    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ < 0) {
        return false;
    }

    var x = id_[1] >> shift_;
    var y = id_[2] >> shift_;

    if (id_[0] < this.lodRange_[0] || id_[0] > this.lodRange_[1] ||
        x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
        y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
        return false;
    }

    return true;
};

Melown.MapBoundLayer.prototype.getUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.url_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};
