/** @const */ MelownMetanodeFlags_GeometryPresent =  1;
/** @const */ MelownMetanodeFlags_NavtilePresent =  3;
/** @const */ MelownMetanodeFlags_InternalTexturePresent =  7;
/** @const */ MelownMetanodeFlags_CoarsenessControl =  15;
/** @const */ MelownMetanodeFlags_ChildShift =  3;

/**
 * @constructor
 */
Melown.MapMetanode = function(metatile_, id_, stream_) {
    this.metatile_ = metatile_;
    this.map_ = metatile_.map_;
    this.id_ = id_;
    this.credits_ = [];
    this.alien_ = false;
    //this.metadata_ = null;
    //this.nodes_ = [];
    //this.children_ = [null, null, null, null];

    if (stream_) {
        this.parseMetanode(stream_);
    }
};

Melown.MapMetanode.prototype.kill = function() {
};

Melown.MapMetanode.prototype.hasChild = function(index_) {
    return ((this.flags_ & (1<<(index_+4))) != 0);
};

Melown.MapMetanode.prototype.hasChildById = function(id_) {
    var ix_ = id_[1] - (this.id_[1]<<1); 
    var iy_ = id_[2] - (this.id_[2]<<1);
    
    //ul,ur,ll,lr
    return this.hasChild((iy_<<1) + ix_); 
};

Melown.MapMetanode.prototype.hasChildren = function() {
    return ((this.flags_ & ((15)<<4)) != 0);
};

Melown.MapMetanode.prototype.parseExtentBits = function(extentBytes_, extentBits_, index_, maxExtent_) {
    var value_ = 0;

    for (var i = 0, li = extentBits_; i < li; i++) {
        var byteIndex_ = index_ >> 3;
        var bitIndex_ = index_ & 0x7;

        if (extentBytes_[byteIndex_] & (1 << (7-bitIndex_))) {
            value_ = value_ | (1 << (li - i - 1));
        }

        index_ ++;
    }

    value_ /= (1 << li) - 1;
//    value_ *= maxExtent_;

    return value_;
};

Melown.MapMetanode.prototype.hasGeometry = function() {
    return ((this.flags_ & 1) != 0);
};

Melown.MapMetanode.prototype.hasNavtile = function() {
    return ((this.flags_ & (1 << 1)) != 0);
};

Melown.MapMetanode.prototype.usedTexelSize = function() {
    return ((this.flags_ & (1 << 2)) != 0);
};

Melown.MapMetanode.prototype.usedDisplaySize = function() {
    return ((this.flags_ & (1 << 3)) != 0);
};


Melown.MapMetanode.prototype.parseMetanode = function(stream_) {

/*
struct Metanode {
    char flags;                   // #0 - geometry present, #1 - navtile present #2 - applyTexelSize,
                                  // #3 - applyPixelSize, #4,5,6,7 - ul,ur,ll,lr child exists
    char geomExtents[];           // a packed array of 6 bit sequences, each lod+2 long, in the following order:
                                  // minx,maxx,miny,maxy,minz,maxz, undefined if no geometry present
    uchar internalTextureCount;   // number of internal textures in geometry
    hfloat texelSize;             // internal texel size in physical srs units, undef unless applyTexelSize is set
    ushort displaySize;           // desired display size, undef unless applyDisplay size is set
    short minHeight, maxHeight;   // navigation tile value range, undef if no navtile present
}
*/

    var streamData_ = stream_.data_;

    var lastIndex_ = stream_.index_;

    this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    //if (this.id_[0] == 9) {
        //stream_ = stream_;
    //}

    var extentsSize_ = (((this.id_[0] + 2) * 6 + 7) >> 3);
    var extentsBytes_ = new Uint8Array(extentsSize_);

    for (var i = 0, li = extentsSize_; i < li; i++) {
        extentsBytes_[i] = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
    }

    var extentBits_ = this.id_[0] + 2;

    var minExtents_ = [0,0,0];
    var maxExtents_ = [0,0,0];

    var index_ = 0;
    var spaceExtentSize_ = this.map_.spaceExtentSize_;
    var spaceExtentOffset_ = this.map_.spaceExtentOffset_;

    for (var i = 0; i < 3; i++) {
        minExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_) * spaceExtentSize_[i] + spaceExtentOffset_[i];
        //minExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_, 1.0);
        index_ += extentBits_;
        maxExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_) * spaceExtentSize_[i] + spaceExtentOffset_[i];
        //maxExtents_[i] = this.parseExtentBits(extentsBytes_, extentBits_, index_, 1.0);
        index_ += extentBits_;
    }

    //check zero bbox
    var extentsBytesSum_ = 0;
    for (var i = 0, li = extentsBytes_.length; i < li; i++) {
        extentsBytesSum_ += extentsBytes_[i];
    }
    
    //extent bytes are empty and therefore bbox is empty also
    if (extentsBytesSum_ == 0 ) {
        //console.log("empty-node: id: " + JSON.stringify(this.id_));
        //console.log("empty-node: surafce: " + this.metatile_.surface_.id_);

        minExtents_[0] = Number.POSITIVE_INFINITY;
        minExtents_[1] = Number.POSITIVE_INFINITY;
        minExtents_[2] = Number.POSITIVE_INFINITY;
        maxExtents_[0] = Number.NEGATIVE_INFINITY;
        maxExtents_[1] = Number.NEGATIVE_INFINITY;
        maxExtents_[2] = Number.NEGATIVE_INFINITY;
    }

    this.bbox_ = new Melown.BBox(minExtents_[0], minExtents_[1], minExtents_[2], maxExtents_[0], maxExtents_[1], maxExtents_[2]);

    this.internalTextureCount_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.pixelSize_ = Melown.decodeFloat16( streamData_.getUint16(stream_.index_, true) ); stream_.index_ += 2;
    this.displaySize_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.displaySize_ = 2048;
    if ((this.flags_ & (1 << 2)) == 0) {
        this.pixelSize_ = Number.POSITIVE_INFINITY;
    }

    if ((this.flags_ & (1 << 3)) == 0) {
        this.displaySize_ = 256;
    }

    this.minHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
    this.maxHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
    
    this.alien_ = false;

    var nodeSize2_ = stream_.index_ - lastIndex_;
    
    if (this.map_.config_.mapGeocentCulling_) {
        var res_ = this.map_.getSpatialDivisionNodeAndExtents(this.id_);
        var node_ = res_[0]; 
        var ll_ = res_[1][0];
        var ur_ = res_[1][1];
        
        var minddle_ = [(ur_[0] + ll_[0])* 0.5, (ur_[1] + ll_[1])* 0.5, 0];
        var normal_ = [0,0,0];
        
        this.diskPos_ = node_.getPhysicalCoords(minddle_);
        this.diskNormal_ = Melown.vec3.length(this.diskPos_); 
        Melown.vec3.normalize(this.diskPos_, normal_);
        this.diskNormal_ = normal_;   

        var p1_ = [ur_[0], ur_[1], 0];
        var p2_ = [ur_[0], ll_[1], 0];
        var p3_ = [ll_[0], ll_[1], 0];
        var p4_ = [ll_[0], ur_[1], 0];

        p1_ = node_.getPhysicalCoords(p1_);
        p2_ = node_.getPhysicalCoords(p2_);
        p3_ = node_.getPhysicalCoords(p3_);
        p4_ = node_.getPhysicalCoords(p4_);

        this.diskP1_ = p1_;
        this.diskP2_ = p2_;
        this.diskP3_ = p3_;
        this.diskP4_ = p4_;

        var v1_ = [0,0,0];
        var v2_ = [0,0,0];
        var v3_ = [0,0,0];
        var v4_ = [0,0,0];

        Melown.vec3.normalize(p1_, v1_);
        Melown.vec3.normalize(p2_, v2_);
        Melown.vec3.normalize(p3_, v3_);
        Melown.vec3.normalize(p4_, v4_);

        /*
        var d1_ = 2 - (Melown.vec3.dot(normal_, v1_) + 1);
        var d2_ = 2 - (Melown.vec3.dot(normal_, v2_) + 1);
        var d3_ = 2 - (Melown.vec3.dot(normal_, v3_) + 1);
        var d4_ = 2 - (Melown.vec3.dot(normal_, v4_) + 1);

        var maxDelta_ = Math.max(d1_, d2_);
        maxDelta_ = Math.max(maxDelta_, d3_);
        maxDelta_ = Math.max(maxDelta_, d4_);
        */

        var d1_ = Melown.vec3.dot(normal_, v1_);
        var d2_ = Melown.vec3.dot(normal_, v2_);
        var d3_ = Melown.vec3.dot(normal_, v3_);
        var d4_ = Melown.vec3.dot(normal_, v4_);

        var maxDelta_ = Math.min(d1_, d2_);
        maxDelta_ = Math.min(maxDelta_, d3_);
        maxDelta_ = Math.min(maxDelta_, d4_);

        maxDelta_ = Math.cos(Math.max(0,(Math.PI * 0.5) - Math.acos(maxDelta_)));


        if (this.id_[0] >= 5) {
            this.diskAngle_ = maxDelta_;   
        }

        this.diskAngle_ = maxDelta_;
        this.diskP1_ = p1_;
        this.diskP2_ = p2_;
        this.diskP3_ = p3_;
        this.diskP4_ = p4_;

        this.diskV1_ = v1_;
        this.diskV2_ = v2_;
        this.diskV3_ = v3_;
        this.diskV4_ = v4_;
        
        //this.diskNormal_[2] = -this.diskNormal_[2];    

        //this.diskAngle_ =   
    }

//    console.log("node size: " + JSON.stringify(this.id_) + "  " + nodeSize2_ + "  " + this.metatile_.nodeSize_ + "  " + this.flags_.toString(2));
    //console.log("node size: " + JSON.stringify(this.id_) + "  " + this.pixelSize_);

/*
    if (this.metatile_.nodeSize_ != nodeSize2_) {
        //nodeSize_ = nodeSize_;
        console.log("node parser error: " + JSON.stringify(this.id_));
    }
*/
};

Melown.MapMetanode.prototype.clone = function() {
    var node_ = new  Melown.MapMetanode(this.metatile_, this.id_);
    node_.flags_ = this.flags_;
    node_.minHeight_ = this.minHeight_;
    node_.maxHeight_ = this.maxHeight_;
    node_.bbox_ = this.bbox_.clone();
    node_.internalTextureCount_ = this.internalTextureCount_;
    node_.pixelSize_ = this.pixelSize_;
    node_.displaySize_ = this.displaySize_;

//    if (this.map_.config_.mapGeocentCulling_) {
        node_.diskPos_ = this.diskPos_;
        node_.diskNormal_ = this.diskNormal_; 
        node_.diskAngle_ = this.diskAngle_;   

        node_.diskP1_ = this.diskP1_;
        node_.diskP2_ = this.diskP2_;
        node_.diskP3_ = this.diskP3_;
        node_.diskP4_ = this.diskP4_;

        node_.diskV1_ = this.diskV1_;
        node_.diskV2_ = this.diskV2_;
        node_.diskV3_ = this.diskV3_;
        node_.diskV4_ = this.diskV4_;

 //   }

    return node_;
};

Melown.MapMetanode.prototype.getWorldMatrix = function(geoPos_, matrix_) {
    // Note: the current camera geographic position (geoPos) is not necessary
    // here, in theory, but for numerical stability (OpenGL ES is float only)
    // we get rid of the large UTM numbers in the following subtractions. The
    // camera effectively stays in the position [0,0] and the tiles travel
    // around it. (The Z coordinate is fine and is not handled in this way.)

    var m = matrix_;

    if (m != null) {
        m[0] = this.bbox_.side(0); m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = this.bbox_.side(1); m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = this.bbox_.side(2); m[11] = 0;
        m[12] = this.bbox_.min_[0] - geoPos_[0]; m[13] = this.bbox_.min_[1] - geoPos_[1]; m[14] = this.bbox_.min_[2] - geoPos_[2]; m[15] = 1;
    } else {
        var m = Melown.mat4.create();

        Melown.mat4.multiply( Melown.translationMatrix(this.bbox_.min_[0] - geoPos_[0], this.bbox_.min_[1] - geoPos_[1], this.bbox_.min_[2] - geoPos_[2]),
                       Melown.scaleMatrix(this.bbox_.side(0), this.bbox_.side(1), this.bbox_.side(2)), m);
    }

    return m;
};

Melown.MapMetanode.prototype.drawBBox = function(cameraPos_) {
    var renderer_ = this.map_.renderer_;

    renderer_.gpu_.useProgram(renderer_.progBBox_, "aPosition");

    var mvp_ = Melown.mat4.create();
    var mv_ = Melown.mat4.create();

    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), this.getWorldMatrix(cameraPos_), mv_);

    var proj_ = renderer_.camera_.getProjectionMatrix();
    Melown.mat4.multiply(proj_, mv_, mvp_);

    renderer_.progBBox_.setMat4("uMVP", mvp_);

    //draw bbox
    renderer_.bboxMesh_.draw(renderer_.progBBox_, "aPosition");

};



