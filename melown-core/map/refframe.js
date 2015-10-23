/**
 * @constructor
 */
Melown.MapRefFrame = function(map_, id_, srs_, extents_, heightRange_, partitioning_)
{
    this.map_ = map_;
    this.id_ = id_;
    this.srs_ = this.map_.getMapsSrs(srs_);
    this.extents_ = extents_;
    this.heightRange_ =  heightRange_;
    this.partitioning_ = partitioning_;
};


