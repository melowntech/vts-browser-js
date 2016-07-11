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

Melown.MapResourceTree.prototype.findSurfaceTile = function(id_) {
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
        
        node_ = node_.children_[index_];

        if (!node_) {
            return null;
        }
    }
    
    return node_;
};

