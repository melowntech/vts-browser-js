/**
 * @constructor
 */
Melown.MapSurface = function(map_, json_, type_) {
    this.map_ = map_;
    this.id_ = json_["id"] || null;
    this.type_ = json_["type"] || "basic";
    this.metaBinaryOrder_ = json_["metaBinaryOrder"] || 1;
    this.metaUrl_ = json_["metaUrl"] || "";
    this.navUrl_ = json_["navUrl"] || "";
    this.navDelta_ = json_["navDelta"] || 1;
    this.meshUrl_ = json_["meshUrl"] || "";
    this.textureUrl_ = json_["textureUrl"] || "";
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.tileRange_ = json_["tileRange"] || [[0,0],[0,0]];
    this.textureLayer_ = json_["textureLayer"] || null;
    this.boundLayerSequence_ = [];
    this.glue_ = (type_ == "glue");
    this.free_ = (type_ == "free");
    
    if (this.free_) { //each free layer has its own data tree
        this.tree_ = new Melown.MapSurfaceTree(this.map_, true, this);
    } else {
        this.tree_ = null;
    }

    this.surfaceReference_ = [];
    if (this.glue_) {
        for (var i = 0, li = this.id_.length; i < li; i++) {
            this.surfaceReference_.push(this.map_.getSurface(this.id_[i]));
        }
    }
};

Melown.MapSurface.prototype.getInfo = function() {
    return {
        "metaUrl" : this.metaUrl_,
        "navUrl" : this.navUrl_,
        "meshUrl" : this.meshUrl_,
        "textureUrl" : this.textureUrl_,
        "lodRange" : this.lodRange_,
        "tileRange" : this.tileRange_,
        "textureLayer" : this.textureLayer_
    };
};

Melown.MapSurface.prototype.hasTile = function(id_) {
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

Melown.MapSurface.prototype.hasTile2 = function(id_) {
    var shift_ = id_[0] - this.lodRange_[0];
    var above_ = (shift_ < 0);

    if (id_[0] < this.lodRange_[0]) {
        shift_ = -shift_;
        var x1 = this.tileRange_[0][0] >> shift_;
        var y1 = this.tileRange_[0][1] >> shift_;
        var x2 = this.tileRange_[1][0] >> shift_;
        var y2 = this.tileRange_[1][1] >> shift_;
    
        if (id_[0] > this.lodRange_[1] ||
            id_[1] < x1 || id_[1] > x2 ||
            id_[2] < y1 || id_[2] > y2 ) {
            return [false , false];
        }
    } else {
        var x = id_[1] >> shift_;
        var y = id_[2] >> shift_;
    
        if (id_[0] > this.lodRange_[1] ||
            x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
            y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
            return [false , false];
        }
    }

    return [true, above_];
};


Melown.MapSurface.prototype.hasMetatile = function(id_) {
    if (id_[0] > this.lodRange_[1]) {
        return false;
    }

    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ >= 0) {
        var x = id_[1] >> shift_;
        var y = id_[2] >> shift_;

        if (x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
            y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
            return false;
        }

    } else {
        shift_ = -shift_;

        if (id_[1] < (this.tileRange_[0][0]>>shift_) || id_[1] > (this.tileRange_[1][0]>>shift_) ||
            id_[2] < (this.tileRange_[0][1]>>shift_) || id_[2] > (this.tileRange_[1][1]>>shift_) ) {
            return false;
        }
    }

    return true;
};

//used only for glues
Melown.MapSurface.prototype.getSurfaceReference = function(index_) {
    return this.surfaceReference_[index_ - 1];
};

Melown.MapSurface.prototype.getMetaUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.metaUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getNavUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.navUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getMeshUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.meshUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getTextureUrl = function(id_, subId_, skipBaseUrl_) {
    return this.map_.makeUrl(this.textureUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, subId_, skipBaseUrl_);
};








