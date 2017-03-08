/**
 * @constructor
 */
Melown.MapRefFrame = function(map_, json_) {
    this.map_ = map_;
    this.proj4_ = map_.proj4_;
    this.valid_ = false;
    this.id_ = json_["id"] || null;
    this.description_ = json_["description"] || "";
    this.nodesMap_ = [];

    var model_ = json_["model"];

    if (model_ == null) {
        return;
    }

    this.model_ = {
        physicalSrs_ : map_.getMapsSrs(model_["physicalSrs"]),
        navigationSrs_ : map_.getMapsSrs(model_["navigationSrs"]),
        publicSrs_ : map_.getMapsSrs(model_["publicSrs"])
    };

    this.params_ = {};

    if (json_["parameters"] != null) {
        var params_ = json_["parameters"];
        this.params_.metaBinaryOrder_ = params_["metaBinaryOrder"] || 1;
        this.params_.navDelta_ = params_["navDelta"] || 8;
    }

    var division_ = json_["division"];

    if (division_ == null) {
        return;
    }

    this.division_ = {
        rootLod_ : division_["rootLod"] || 0,
        arity_ : division_["arity"] || null,
        heightRange_ : division_["heightRange"] || [0,1]
    };

    var extents_ = this.parseSpaceExtents(division_["extents"]);
    this.division_.extents_ = extents_;

    map_.spaceExtentSize_ = [extents_.ur_[0] - extents_.ll_[0], extents_.ur_[1] - extents_.ll_[1], extents_.ur_[2] - extents_.ll_[2]];
    map_.spaceExtentOffset_ = extents_.ll_;

    var divisionNodes_ = division_["nodes"];
    this.division_.nodes_ = [];

    if (divisionNodes_ == null) {
        return;
    }

    this.hasPoles_ = (divisionNodes_.length == 4); 

    for (var i = 0, li = divisionNodes_.length; i < li; i++) {
        var node_ = this.parseNode(divisionNodes_[i]);
        this.nodesMap_["" + node_.id_[0] + "."  + node_.id_[1] + "." + node_.id_[2]] = node_;
        this.division_.nodes_.push(node_);
    }

    this.valid_ = true;
};

Melown.MapRefFrame.prototype.getInfo = function() {
    return {
        "id" : this.id_,
        "physicalSrs" : this.model_.physicalSrs_.id_,
        "navigationSrs" : this.model_.navigationSrs_.id_,
        "publicSrs" : this.model_.publicSrs_.id_
    };
};

Melown.MapRefFrame.prototype.getGlobalHeightRange = function() {
    return this.division_.heightRange_;     
};

Melown.MapRefFrame.prototype.parseNode = function(nodeData_) {
    var node_ = {
        srs_ : nodeData_["srs"],
        partitioning_ : nodeData_["partitioning"]
    };

    node_.extents_ = this.parseExtents(nodeData_["extents"]);

    var nodeId_ = nodeData_["id"];

    if (nodeId_ == null) {
        return;
    }

    node_.id_ = {
        lod_ : nodeId_["lod"] || 0,
        position_ : nodeId_["position"] || [0,0]
    };

    //node_.divisionNode_ =
    //node_.refFrame_.loadResources();

    return new Melown.MapDivisionNode(this.map_, [node_.id_.lod_, node_.id_.position_[0], node_.id_.position_[1]],
                                                  node_.srs_, node_.extents_, this.heightRange_, node_.partitioning_);
};

Melown.MapRefFrame.prototype.parseExtents = function(extentsData_) {
    if (extentsData_ == null) {
        return { ll_ : [0,0], ur_ : [1,1] };
    }

    return {
        ll_ : extentsData_["ll"] || [0,0],
        ur_ : extentsData_["ur"] || [1,1]
    };
};

Melown.MapRefFrame.prototype.parseSpaceExtents = function(extentsData_) {
    if (extentsData_ == null) {
        return { ll_ : [0,0,0], ur_ : [1,1,1] };
    }

    return {
        ll_ : extentsData_["ll"] || [0,0,0],
        ur_ : extentsData_["ur"] || [1,1,1]
    };
};

Melown.MapRefFrame.prototype.getSpatialDivisionNodes = function() {
    return this.division_.nodes_;
};

/*
Melown.MapRefFrame.prototype.getRefFrame = function(id_) {
    var lod_ = id_[0];

    var refFrame_ = null;
    var nodes_ = this.division_.nodes_;
    var rootLod_ = this.division_.rootLod_;

    if (lod_ < rootLod_) {
        return null;
    }

    //find root node
    for (var i = 0, li = nodes_.length_; i < li; i++) {
        var nodeId_ = nodes_[i].id_;

        if (rootLod_ == nodeId_.lod_) {
            refFrame_ = nodes_[i].refFrame_;
        }
    }

    //find nearest node
    for (var i = 0, li = nodes_.length_; i < li; i++) {
        var nodeId_ = nodes_[i].id_;

        if (lod_ >= nodeId_.lod_) {
            //TODO: reduce nodeId_ to id_
            var shift_ = (nodeId_.lod_ - lod_);
            var x = id_[1] >> shift_;
            var y = id_[2] >> shift_;

            if (nodeId_.position_[0] == x && nodeId_.position_[1] == y) {
                return nodes_[i].refFrame_;
            }
        }
    }

    return refFrame_;
};
*/

Melown.MapRefFrame.prototype.convertCoords = function(coords_, source_, destination_) {
    var sourceSrs_, destinationSrs_;

    switch(source_) {
        case "public":     sourceSrs_ = this.model_.publicSrs_;     break;
        case "physical":   sourceSrs_ = this.model_.physicalSrs_;   break;
        case "navigation": sourceSrs_ = this.model_.navigationSrs_; break;
    }

    switch(destination_) {
        case "public":     destinationSrs_ = this.model_.publicSrs_;     break;
        case "physical":   destinationSrs_ = this.model_.physicalSrs_;   break;
        case "navigation": destinationSrs_ = this.model_.navigationSrs_; break;
    }

    return sourceSrs_.convertCoordsTo(coords_, destinationSrs_);
};




