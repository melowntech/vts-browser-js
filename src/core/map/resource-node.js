/**
 * @constructor
 */
Melown.MapResourceNode = function(map_, parent_, id_) {
    this.map_ = map_;
    this.id_ = id_;
    this.parent_ = parent_;

    this.metatiles_ = {};
    this.meshes_ = {};
    this.textures_ = {};
    this.subtextures_ = {};
    this.geodata_ = {};
    this.credits_ = {};

    this.children_ = [null, null, null, null];
};

Melown.MapResourceNode.prototype.kill = function() {
    //kill children
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
    
    //kill resources?
};

Melown.MapResourceNode.prototype.addChild = function(index_) {
    if (this.children_[index_]) {
        return;
    }
    
    var id_ = this.id_;
    var childId_ = [id_[0] + 1, id_[1] << 1, id_[2] << 1];

    switch (index_) {
        case 1: childId_[1]++; break;
        case 2: childId_[2]++; break;
        case 3: childId_[1]++; childId_[2]++; break;
    }

    this.children_[index_] = new Melown.MapResourceNode(this.map_, this, childId_);
};

Melown.MapResourceNode.prototype.removeChildByIndex = function(index_) {
    if (this.children_[index_] != null) {
        this.children_[index_].kill();
        this.children_[index_] = null;
    }
};

Melown.MapResourceNode.prototype.removeChild = function(tile_) {
    for (var i = 0; i < 4; i++) {
        if (this.children_[i] == tile_) {
            this.children_[i].kill();
            this.children_[i] = null;
        }
    }
};

// Meshes ---------------------------------

Melown.MapResourceNode.prototype.getMesh = function(path_, tile_) {
    var mesh_ = this.meshes_[path_];
    
    if (!mesh_) {
        mesh_ = new Melown.MapMesh(this.map_, path_, tile_);
        this.meshes_[path_] = mesh_;
    }
    
    return mesh_;
};

// GEodata ---------------------------------

Melown.MapResourceNode.prototype.getGeodata = function(path_, extraInfo_) {
    var geodata_ = this.geodata_[path_];
    
    if (!geodata_) {
        geodata_ = new Melown.MapGeodata(this.map_, path_, extraInfo_);
        this.geodata_[path_] = geodata_;
    }
    
    return geodata_;
};

// Textures ---------------------------------

Melown.MapResourceNode.prototype.getTexture = function(path_, heightMap_, extraBound_, extraInfo_, tile_, internal_) {
    if (extraInfo_ && extraInfo_.layer_) {
        var id_ = path_ + extraInfo_.layer_.id_;
        var texture_ = this.textures_[id_];
        
        if (!texture_) {
            texture_ = new Melown.MapTexture(this.map_, path_, heightMap_, extraBound_, extraInfo_, tile_, internal_);
            this.textures_[id_] = texture_;
        }
    } else {
        var texture_ = this.textures_[path_];
        
        if (!texture_) {
            texture_ = new Melown.MapTexture(this.map_, path_, heightMap_, extraBound_, extraInfo_, tile_, internal_);
            this.textures_[path_] = texture_;
        }
    }
    
    return texture_;
};

// SubTextures ---------------------------------

Melown.MapResourceNode.prototype.getSubtexture = function(texture_, path_, heightMap_, extraBound_, extraInfo_, tile_, internal_) {
    var texture_ = this.subtextures_[path_];
    
    if (!texture_) {
        texture_ = new Melown.MapSubtexture(this.map_, path_, heightMap_, extraBound_, extraInfo_, tile_, internal_);
        this.subtextures_[path_] = texture_;
    }
    
    return texture_;
};

// Metatiles ---------------------------------

Melown.MapResourceNode.prototype.addMetatile = function(path_, metatile_) {
    this.metatiles_[path_] = metatile_;
};

Melown.MapResourceNode.prototype.removeMetatile = function(metatile_) {
    for (var key_ in this.metatiles_) {
        if (this.metatiles_[key_] == metatile_) {
            delete this.metatiles_[key_];
        }
    }
};

Melown.MapResourceNode.prototype.getMetatile = function(surface_, allowCreation_, tile_) {
    var metatiles_ = this.metatiles_; 
    for (var key_ in metatiles_) {
        if (metatiles_[key_].surface_ == surface_) {
            return metatiles_[key_];
        } 
    }
    
    var path_ = surface_.getMetaUrl(this.id_);

    if (metatiles_[path_]) {
        var metatile_ = metatiles_[path_].clone(surface_);
        this.addMetatile(path_, metatile_);
        return metatile_;
    }

    if (allowCreation_) {
        var metatile_ = new Melown.MapMetatile(this, surface_, tile_);
        this.addMetatile(path_, metatile_);
        return metatile_; 
    } else {
        return null;
    }
};



