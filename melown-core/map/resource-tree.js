/**
 * @constructor
 */
Melown.MapResourceTree = function(map_) {
    this.map_ = map_;
    this.tree_ = new Melown.MapResourceNode(map_, null, [0,0,0]); 
};

Melown.MapResourceTree.prototype.kill = function() {
    this.tree_.kill();
};

Melown.MapResourceTree.prototype.findNode = function(id_, createNonexisted_) {
    var node_ = this.tree_;

    for (var lod_ = 1; lod_ <= id_[0]; lod_++) {
        var mask_ = 1 << (lod_-1);
        var index_ = 0;

        if ((id_[1] & mask_) != 0) {
            index_ += 1;
        }

        if ((id_[2] & mask_) != 0) {
            index_ += 2;
        }
        
        if (!node_.children_[index_]) {
            if (createNonexisted_) {
                node_.addChild(index_);
            } else {
                return null;
            }
        } 

        node_ = node_.children_[index_];
    }
    
    return node_;
};

Melown.MapResourceTree.prototype.findAgregatedNode = function(id_, agregation_, createNonexisted_) {
    var rootLod_ = 0;
    var node_ = this.tree_;
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

        if (!node_.children_[index_]) {
            if (createNonexisted_) {
                node_.addChild(index_);
            } else {
                return null;
            }
        } 

        node_ = node_.children_[index_];
    }

    return node_;
};



