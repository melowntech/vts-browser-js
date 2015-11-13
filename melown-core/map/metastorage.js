/**
 * @constructor
 */
Melown.MapMetastorage = function(map_, parent_, id_) {
    this.id_ = id_;
    this.map_ = map_;
    this.parent_ = parent_;
    this.metatiles_ = [];
    this.children_ = [null, null, null, null];
};

Melown.MapMetastorage.prototype.kill = function() {
    for (var i = 0, li = this.metatiles_.length; i < li; i++) {
        this.metatiles_[i].kill();
    }

    this.metatiles_ = [];

    for (var i = 0; i < 4; i++) {
        if (this.children_[i] != null) {
            this.children_[i].kill();
        }
    }

    this.children_ = [null, null, null, null];

    var parent_ = this.parent_;
    this.parent_ = null;

    if (parent_ != null) {
        parent_.removeChild(this);
    }
};

Melown.MapMetastorage.prototype.validate = function() {

    if (this.metatiles_.length == 0) {
        this.kill();
        return false;
    }

    return true;
};

Melown.MapMetastorage.prototype.getMetatile = function(surface_) {
    var metatiles_ = this.metatiles_;
    for (var i = 0, li = metatiles_.length; i < li; i++) {
        if (metatiles_[i].surface_ == surface_) {
            return metatiles_[i];
        }
    }

    return null;
};

Melown.MapMetastorage.prototype.addMetatile = function(metatile_) {
    this.metatiles_.push(metatile_);
};

Melown.MapMetastorage.prototype.removeMetatile = function(metatile_) {
    for (var i = 0, li = this.metatiles_.length; i < li; i++) {
        if (this.metatiles_[i] == metatile_) {
            this.metatiles_.splice(i, 1);
            break;
        }
    }
};

Melown.MapMetastorage.prototype.addChild = function(index_) {
    var id_ = this.id_;
    var childId_ = [id_[0] + 1, id_[1] << 1, id_[2] << 1];

    switch (index_) {
        case 1: childId_[1]++; break;
        case 2: childId_[2]++; break;
        case 3: childId_[1]++; childId_[2]++; break;
    }

    this.children_[index_] = new Melown.MapMetastorage(this.map_, this, childId_);
};

Melown.MapMetastorage.prototype.removeChild = function(metastorageTile_) {
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] == metastorageTile_) {
            this.children_[i].kill();
            this.children_[i] = null;
        }
    }
};

Melown.FindMetastorage = function(map_, metastorageTree_, rootId_, tile_, agregation_) {
    var id_ = tile_.id_;
    var rootLod_ = rootId_[0];
    var metastorage_ = metastorageTree_;
    var ix_ = ((id_[1] >> agregation_) << agregation_);
    var iy_ = ((id_[2] >> agregation_) << agregation_);


    for (var lod_ = id_[0]; lod_ > rootLod_; lod_--) {
        var i = lod_ - rootLod_;
        var index_ = 0;
        var mask_ = 1 << (i-1);
        if ((ix_ & mask_) != 0) {
            index_ += 1;
        }

        if ((iy_ & mask_) != 0) {
            index_ += 2;
        }

        if (metastorage_.children_[index_] == null) {
            metastorage_.addChild(index_);
        }

        metastorage_ = metastorage_.children_[index_];
    }

    return metastorage_;
};











