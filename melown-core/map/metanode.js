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
    this.ready_ = false;
    this.heightReady_ = false;

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
    this.displaySize_ = 1024;
    if ((this.flags_ & (1 << 2)) == 0) {
        this.pixelSize_ = Number.POSITIVE_INFINITY;
    }

    if ((this.flags_ & (1 << 3)) == 0) {
        this.displaySize_ = 256;
    }

    this.minHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
    this.maxHeight_ = streamData_.getInt16(stream_.index_, true); stream_.index_ += 2;
    
    if (this.metatile_.version_ >= 3) {
        if (this.metatile_.flags_ & (1<<7)) {
            this.sourceReference_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
        } else if (this.metatile_.flags_ & (1<<6)) {
            this.sourceReference_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        }
    }

    this.heightReady_ = this.hasNavtile();
    
    this.alien_ = false;

    var nodeSize2_ = stream_.index_ - lastIndex_;

    //if (this.map_.config_.mapSmartNodeParsing_) {
        this.generateCullingHelpers();
    //}    
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
    node_.ready_ = this.ready_;
    node_.stream_ = this.stream_;
    node_.heightReady_ = this.heightReady_;
    
    //copy credits
    node_.credits_ = new Array(this.credits_.length);
    
    for (var i = 0, li = this.credits_.length; i < li; i++) {
        node_.credits_[i] = this.credits_[i];
    }

//    if (this.map_.config_.mapGeocentCulling_) {
        node_.diskPos_ = this.diskPos_;
        node_.diskNormal_ = this.diskNormal_; 
        node_.diskAngle_ = this.diskAngle_;
        node_.diskAngle2_ = this.diskAngle2_;
        node_.diskDistance_ = this.diskDistance_; 
        node_.bbox2_ = this.bbox2_;  
 //   }

    if (this.plane_) {
        node_.plane_ = this.plane_.slice();
    }

    return node_;
};

Melown.MapMetanode.prototype.generateCullingHelpers = function(virtual_) {
    this.ready_ = true;

    if (this.geocent_) {
        return;
    }

    if (this.map_.config_.mapPreciseCulling_) { //use division node srs
        if (virtual_) {
            return; //result is same for each tile id
        }

        var res_ = this.map_.getSpatialDivisionNodeAndExtents(this.id_);
        var node_ = res_[0]; 
        var ll_ = res_[1][0];
        var ur_ = res_[1][1];
        
        var h = this.minHeight_;
        var middle_ = [(ur_[0] + ll_[0])* 0.5, (ur_[1] + ll_[1])* 0.5, h];
        var normal_ = [0,0,0];
        
        this.diskPos_ = node_.getPhysicalCoords(middle_);
        this.diskDistance_ = Melown.vec3.length(this.diskPos_); 
        Melown.vec3.normalize(this.diskPos_, normal_);
        this.diskNormal_ = normal_;   
        
        if (node_.id_[0] == 1 && node_.id_[1] ==  1 && node_.id_[2] == 0) {   //???? debug?????
            var res_ = this.map_.getSpatialDivisionNodeAndExtents(this.id_);

            node_ = node_;
        }

        var n1_ = node_.getPhysicalCoords([ur_[0], ur_[1], h]);
        var n2_ = node_.getPhysicalCoords([ur_[0], ll_[1], h]);
        var n3_ = node_.getPhysicalCoords([ll_[0], ll_[1], h]);
        var n4_ = node_.getPhysicalCoords([ll_[0], ur_[1], h]);

        var mtop_ = node_.getPhysicalCoords([(ur_[0] + ll_[0])* 0.5, ur_[1], h]);
        var mbottom_ = node_.getPhysicalCoords([(ur_[0] + ll_[0])* 0.5, ll_[1], h]);
        var mleft_ = node_.getPhysicalCoords([ll_[0], (ur_[1] + ll_[1])* 0.5, h]);
        var mright_ = node_.getPhysicalCoords([ur_[0], (ur_[1] + ll_[1])* 0.5, h]);
        middle_ = this.diskPos_;

        this.plane_ = [
            n4_[0], n4_[1], n4_[2],
            mtop_[0], mtop_[1], mtop_[2],
            n1_[0], n1_[1], n1_[2],

            mleft_[0], mleft_[1], mleft_[2],
            middle_[0], middle_[1], middle_[2],
            mright_[0], mright_[1], mright_[2],
            
            n3_[0], n3_[1], n3_[2],
            mbottom_[0], mbottom_[1], mbottom_[2],
            n2_[0], n2_[1], n2_[2]
        ];

        h = this.maxHeight_;
        var n5_ = node_.getPhysicalCoords([ur_[0], ur_[1], h]);
        var n6_ = node_.getPhysicalCoords([ur_[0], ll_[1], h]);
        var n7_ = node_.getPhysicalCoords([ll_[0], ll_[1], h]);
        var n8_ = node_.getPhysicalCoords([ll_[0], ur_[1], h]);
        
        this.bbox2_ = [
            [n1_[0], n1_[1], n1_[2]],
            [n2_[0], n2_[1], n2_[2]],
            [n3_[0], n3_[1], n3_[2]],
            [n4_[0], n4_[1], n4_[2]],

            n5_, n6_, n7_, n8_
        ];

        Melown.vec3.normalize(n1_);
        Melown.vec3.normalize(n2_);
        Melown.vec3.normalize(n3_);
        Melown.vec3.normalize(n4_);

        var d1_ = Melown.vec3.dot(normal_, n1_);
        var d2_ = Melown.vec3.dot(normal_, n2_);
        var d3_ = Melown.vec3.dot(normal_, n3_);
        var d4_ = Melown.vec3.dot(normal_, n4_);

        var maxDelta_ = Math.min(d1_, d2_, d3_, d4_);

        //get cos angle based at 90deg
        this.diskAngle_ = Math.cos(Math.max(0,(Math.PI * 0.5) - Math.acos(maxDelta_)));
        this.diskAngle2_ = maxDelta_;

        //shift center closer to earth
        //var factor_ = this.bbox_.maxSize_ * 0.2; 
        //this.diskPos_ = [this.diskPos_[0] - normal_[0] * factor_, this.diskPos_[1]  - normal_[1] * factor_, this.diskPos_[2] - normal_[2] * factor_];   

    } else {
        var min_ = this.bbox_.min_;
        var max_ = this.bbox_.max_;
        var normal_ = this.bbox_.center();
        this.diskPos_ = [normal_[0],normal_[1],normal_[2]];   
        Melown.vec3.normalize(normal_);
        this.diskNormal_ = normal_;   

        var n1_ = [min_[0], min_[1], min_[2]];
        var n2_ = [max_[0], min_[1], min_[2]];
        var n3_ = [max_[0], max_[1], min_[2]];
        var n4_ = [min_[0], max_[1], min_[2]];
        var n5_ = [min_[0], min_[1], max_[2]];
        var n6_ = [max_[0], min_[1], max_[2]];
        var n7_ = [max_[0], max_[1], max_[2]];
        var n8_ = [min_[0], max_[1], max_[2]];

        Melown.vec3.normalize(n1_);
        Melown.vec3.normalize(n2_);
        Melown.vec3.normalize(n3_);
        Melown.vec3.normalize(n4_);
        Melown.vec3.normalize(n5_);
        Melown.vec3.normalize(n6_);
        Melown.vec3.normalize(n7_);
        Melown.vec3.normalize(n8_);

        var d1_ = Melown.vec3.dot(normal_, n1_);
        var d2_ = Melown.vec3.dot(normal_, n2_);
        var d3_ = Melown.vec3.dot(normal_, n3_);
        var d4_ = Melown.vec3.dot(normal_, n4_);
        var d5_ = Melown.vec3.dot(normal_, n5_);
        var d6_ = Melown.vec3.dot(normal_, n6_);
        var d7_ = Melown.vec3.dot(normal_, n7_);
        var d8_ = Melown.vec3.dot(normal_, n8_);

        var maxDelta_ = Math.min(d1_, d2_, d3_, d4_, d5_, d6_, d7_, d8_);
                    
        //get cos angle based at 90deg
        this.diskAngle_ = Math.cos(Math.max(0,(Math.PI * 0.5) - Math.acos(maxDelta_)));
        this.diskAngle2_ = maxDelta_;
        
        //shift center closer to earth
        this.bbox_.updateMaxSize();
        var factor_ = this.bbox_.maxSize_ * 0.2; 
        this.diskPos_ = [this.diskPos_[0] - normal_[0] * factor_, this.diskPos_[1]  - normal_[1] * factor_, this.diskPos_[2] - normal_[2] * factor_];   
    }
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

    renderer_.gpu_.useProgram(renderer_.progBBox_, ["aPosition"]);

    var mvp_ = Melown.mat4.create();
    var mv_ = Melown.mat4.create();

    Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), this.getWorldMatrix(cameraPos_), mv_);

    var proj_ = renderer_.camera_.getProjectionMatrix();
    Melown.mat4.multiply(proj_, mv_, mvp_);

    renderer_.progBBox_.setMat4("uMVP", mvp_);

    //draw bbox
    renderer_.bboxMesh_.draw(renderer_.progBBox_, "aPosition");

};

Melown.MapMetanode.prototype.drawBBox2 = function(cameraPos_) {
    var spoints_ = []; 
    for (var i = 0, li = this.bbox2_.length; i < li; i++) {
        var pos_ = this.bbox2_[i];
        pos_ = ["obj", pos_[0], pos_[1], "fix", pos_[2], 0, 0, 0, 10, 90 ];

        spoints_.push((new Melown.MapPosition(this.map_, pos_)).getCanvasCoords(null, true));
    }
    
    var renderer_ = this.map_.renderer_;
    renderer_.drawLineString([spoints_[0], spoints_[1], spoints_[2], spoints_[3], spoints_[0] ], 2, [0,1,0.5,255], false, false, true);
    renderer_.drawLineString([spoints_[4], spoints_[5], spoints_[6], spoints_[7], spoints_[4] ], 2, [0,1,0.5,255], false, false, true);
};

Melown.MapMetanode.prototype.drawPlane = function(cameraPos_) {
    var renderer_ = this.map_.renderer_;
    var buffer_ = this.map_.planeBuffer_;
    var points_ = this.plane_;
    
    if (!points_) {
        return;
    }

    renderer_.gpu_.useProgram(renderer_.progPlane_, ["aPosition", "aTexCoord"]);

    var mvp_ = Melown.mat4.create();
    var mv_ = renderer_.camera_.getModelviewMatrix();
    var proj_ = renderer_.camera_.getProjectionMatrix();
    Melown.mat4.multiply(proj_, mv_, mvp_);
    
    var sx_ = cameraPos_[0];
    var sy_ = cameraPos_[1];
    var sz_ = cameraPos_[2];

    for (var i = 0; i < 9; i++) {
        var index_ = i*3;
        buffer_[index_] = points_[index_] - sx_; 
        buffer_[index_+1] = points_[index_+1] - sy_; 
        buffer_[index_+2] = points_[index_+2] - sz_; 
    }

    renderer_.progPlane_.setVec4("uParams", [0,0,1/15,0]);
    renderer_.progPlane_.setMat4("uMV", mv_);
    renderer_.progPlane_.setMat4("uProj", proj_);
    renderer_.progPlane_.setFloatArray("uPoints", buffer_);

    renderer_.gpu_.bindTexture(renderer_.heightmapTexture_);
    
    //draw bbox
    renderer_.planeMesh_.draw(renderer_.progPlane_, "aPosition", "aTexCoord");
};


