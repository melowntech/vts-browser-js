/** @const */ MelownMetanodeFlags_GeometryPresent =  1;
/** @const */ MelownMetanodeFlags_NavtilePresent =  3;
/** @const */ MelownMetanodeFlags_InternalTexturePresent =  7;
/** @const */ MelownMetanodeFlags_CoarsenessControl =  15;
/** @const */ MelownMetanodeFlags_ChildShift =  3;

/**
 * @constructor
 */
Melown.MapMetanode = function(metatile_, id_, stream_)
{
    this.metatile_ = metatile_;
    this.map_ = metatile_.map_;
    this.id_ = id_;
    //this.metadata_ = null;
    //this.nodes_ = [];
    //this.children_ = [null, null, null, null];

    this.parseMetanode(stream_);
};

Melown.MapMetanode.prototype.kill = function() {
};

Melown.MapMetanode.prototype.hasChild = function(index_) {
    return ((this.flags_ & (1<<(index_+4))) != 0);
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

Melown.MapMetanode.prototype.parseMetanode = function(stream_) {

/*
struct Metanode {
    char flags;                   // #0 - geometry present, #1 - navtile present, #2 - internal texture present
                                  // #3 - coarseness control (0 - displaySize / 1 - texelSize), #4,5,6,7 - ul,ur,ll,lr child exists
    char geomExtents[];           // a packed array of 6 bit sequences, each lod+2 long, in the following order:
                                  // minx,maxx,miny,maxy,minz,maxz, undefined if no geometry present
    union {
       ushort displaySize;        // desired display size, if coarsness control is displaySize
       hfloat meshArea;           // meshArea, if coarseness control is texelSize and geometry present
    };
    hfloat textureArea;           // internal texture area, if coarsness control is texelSize and internal texture present
    short minHeight, maxHeight;   // navigation tile value range, undef if no navtile present !!!FIXED to short
}
*/

    var streamData_ = stream_.data_;

    var lastIndex_ = stream_.index_;

    this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    //if (this.id_[0] == 17) {
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

    this.bbox_ = new Melown.BBox(minExtents_[0], minExtents_[1], minExtents_[2], maxExtents_[0], maxExtents_[1], maxExtents_[2]);

    this.pixelSize_ = Number.POSITIVE_INFINITY;

    if (this.flags_ & (1 << 3)) {

        //if (this.flags_ & (1)) {
            this.meshArea_ = Melown.decodeFloat16( streamData_.getUint16(stream_.index_, true) ); stream_.index_ += 2;
        //}

        //if (this.flags_ & (1<<2)) {
            //this.textureArea_ = Melown.decodeFloat16( streamData_.getUint16(stream_.index_, true) ); stream_.index_ += 2;
        //}

        //this.pixelSize_ = this.meshArea_ / this.textureArea_;

    } else {
        this.displaySize_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    }

    this.textureArea_ = Melown.decodeFloat16( streamData_.getUint16(stream_.index_, true) ); stream_.index_ += 2;

    if (this.flags_ & (1 << 3)) {
        if (this.textureArea_ != 0 && this.meshArea_ != 0) {
            this.pixelSize_ = this.meshArea_ / this.textureArea_;
        }
    } else {
        if (this.textureArea_ != 0 && this.displaySize_ != 0) {
            //this.pixelSize_ = this.displaySize_ / this.textureArea_;
        }
    }


    //if (this.flags_ & (1<<1)) {
        this.minHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
        this.maxHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
    //}

    var nodeSize2_ = stream_.index_ - lastIndex_;

//    console.log("node size: " + JSON.stringify(this.id_) + "  " + nodeSize2_ + "  " + this.metatile_.nodeSize_ + "  " + this.flags_.toString(2));
    //console.log("node size: " + JSON.stringify(this.id_) + "  " + this.pixelSize_);

/*
    if (this.metatile_.nodeSize_ != nodeSize2_) {
        //nodeSize_ = nodeSize_;
        console.log("node parser error: " + JSON.stringify(this.id_));
    }
*/
};


Melown.MapMetanode.prototype.getWorldMatrix = function(geoPos_, matrix_)
{
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



