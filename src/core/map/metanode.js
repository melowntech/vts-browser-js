/** @const */ MelownMetanodeFlags_GeometryPresent =  1;
/** @const */ MelownMetanodeFlags_NavtilePresent =  3;
/** @const */ MelownMetanodeFlags_InternalTexturePresent =  7;
/** @const */ MelownMetanodeFlags_CoarsenessControl =  15;
/** @const */ MelownMetanodeFlags_ChildShift =  3;

Melown.MapMetanodeBuffer_ = new Uint8Array(1024);

/**
 * @constructor
 */
Melown.MapMetanode = function(metatile_, id_, stream_, divisionNode_) {
    this.metatile_ = metatile_;
    this.map_ = metatile_.map_;
    this.id_ = id_;
    this.credits_ = [];
    this.alien_ = false;
    this.ready_ = false;
    this.heightReady_ = false;
    this.divisionNode_ = divisionNode_;

    this.diskPos_ = new Array(3);
    this.diskDistance_ = 1; 
    this.diskNormal_ = new Array(3); 
    this.diskAngle_ = 1;
    this.diskAngle2_ = 1;
    //this.bboxHeight_ = 1;
    this.bbox2_ = new Array(24);

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
    var version_ = this.metatile_.version_;

    this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    if (version_ < 5) {
        var extentsSize_ = (((this.id_[0] + 2) * 6 + 7) >> 3);
        var extentsBytes_ = Melown.MapMetanodeBuffer_;//new Uint8Array(extentsSize_);
    
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
    }    

    if (version_ >= 4) {
        this.minZ_ = streamData_.getFloat32(stream_.index_, true); stream_.index_ += 4;
        this.maxZ_ = streamData_.getFloat32(stream_.index_, true); stream_.index_ += 4;
        this.surrogatez_ = streamData_.getFloat32(stream_.index_, true); stream_.index_ += 4;
    }

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

    if (version_ < 4) {
        this.minZ_ = this.minHeight_;
        this.maxZ_ = this.maxHeight_;
        this.surrogatez_ =this.minHeight_;
    }
    
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

    //if (!this.map_.config_.mapSmartNodeParsing_) {
        this.generateCullingHelpers();
    //}    
};

Melown.MapMetanode.prototype.clone = function() {
    var node_ = new  Melown.MapMetanode(this.metatile_, this.id_);
    node_.flags_ = this.flags_;
    node_.minHeight_ = this.minHeight_;
    node_.maxHeight_ = this.maxHeight_;
    node_.minZ_ = this.minZ_;
    node_.maxZ_ = this.maxZ_;
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

    if (this.bbox_) {
        node_.bbox_ = this.bbox_.clone();
    }


//    if (this.map_.config_.mapGeocentCulling_) {
        node_.diskPos_ = this.diskPos_;
        node_.diskNormal_ = this.diskNormal_; 
        node_.diskAngle_ = this.diskAngle_;
        node_.diskAngle2_ = this.diskAngle2_;
        node_.diskDistance_ = this.diskDistance_; 
        node_.bbox2_ = this.bbox2_;  

        node_.divisionNode_ = this.divisionNode_;

 //   }

    if (this.plane_) {
        node_.plane_ = this.plane_.slice();
    }

    return node_;
};

Melown.MapMetanode.prototype.generateCullingHelpers = function(virtual_) {
    this.ready_ = true;
    
    var map_ = this.map_;
    var geocent_ = map_.geocent_;
    var version_ = this.metatile_.useVersion_;

    if (!geocent_ && version_ < 4) {
        return;
    }

    if (map_.config_.mapPreciseCulling_ || version_ >= 4) { //use division node srs
        if (virtual_) {
            return; //result is same for each tile id
        }

        var pos_ = map_.tmpVec3_;
        
        if (this.id_[0] > map_.maxDivisionNodeDepth_) {
            var pos2_ = map_.tmpVec5_;
            
            var divisionNode_ = this.map_.getSpatialDivisionNodeFromId(this.id_);

            this.map_.getSpatialDivisionNodeAndExtents2(this.id_, pos2_, divisionNode_);
            var node_ = pos2_[0]; 
            var llx_ = pos2_[1];
            var lly_ = pos2_[2];
            var urx_ = pos2_[3];
            var ury_ = pos2_[4];

            this.divisionNode_ = divisionNode_;

            /*if (this.id_[0] == 2 && this.id_[1] == 0 && this.id_[2] == 2) {
                var res_ = this.map_.getSpatialDivisionNodeAndExtents(this.id_);
                res_ = res_;
            }*/
            
        } else {
            var res_ = this.map_.getSpatialDivisionNodeAndExtents(this.id_);
            var divisionNode_ = res_[0]; 
            var llx_ = res_[1][0][0];
            var lly_ = res_[1][0][1];
            var urx_ = res_[1][1][0];
            var ury_ = res_[1][1][1];
            this.divisionNode_ = divisionNode_;
        }
        
        var h = this.minZ_;
        //var middle_ = [(ur_[0] + ll_[0])* 0.5, (ur_[1] + ll_[1])* 0.5, h];
        //var normal_ = [0,0,0];
        
        pos_[0] = (urx_ + llx_)* 0.5; 
        pos_[1] = (ury_ + lly_)* 0.5; 
        pos_[2] = h; 
        
        divisionNode_.getPhysicalCoordsFast(pos_, true, this.diskPos_, 0, 0);
        
        if (geocent_) {
            this.diskDistance_ = Melown.vec3.length(this.diskPos_); 
            Melown.vec3.normalize(this.diskPos_, this.diskNormal_);
        } else {
            this.diskNormal_[0] = 0;
            this.diskNormal_[1] = 0;
            this.diskNormal_[2] = 1;
        }
        //this.diskNormal_ = normal_;   
        var normal_ = this.diskNormal_;
        
        
        //if (divisionNode_.id_[0] == 1 && divisionNode_.id_[1] ==  1 && divisionNode_.id_[2] == 0) {   //???? debug?????
          //  var res_ = this.map_.getSpatialDivisionNodeAndExtents(this.id_);
          //  node_ = node_;
        //}
       
        pos_[0] = urx_; 
        pos_[1] = ury_; 
        pos_[2] = h; 
        
        var bbox_ = this.bbox2_;

        divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 0);

        pos_[1] = lly_; 
        divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 3);
        
        pos_[0] = llx_; 
        divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 6);
        
        pos_[1] = ury_; 
        divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 9);

        if (!geocent_) {
            var height_ = this.maxZ_ - h;
            
            bbox_[12] = bbox_[0];
            bbox_[13] = bbox_[1];
            bbox_[14] = bbox_[2] + height_;
            
            bbox_[15] = bbox_[3];
            bbox_[16] = bbox_[4];
            bbox_[17] = bbox_[5] + height_;
        
            bbox_[18] = bbox_[6];
            bbox_[19] = bbox_[7];
            bbox_[20] = bbox_[8] + height_;
        
            bbox_[21] = bbox_[9];
            bbox_[22] = bbox_[10];
            bbox_[23] = bbox_[11] + height_;
            return;        
        }

        var dot_ = Melown.vec3.dot; 

        if (map_.config_.mapPreciseBBoxTest_ || version_ >= 4) { 
        //if (true) { 
            var height_ = this.maxZ_ - h;

            if (this.id_[0] <= 3) { //get aabbox for low lods
                var normalize_ = Melown.vec3.normalize2; 

                normalize_(bbox_, 0, pos_);
                var d1_ = dot_(normal_, pos_);
                
                normalize_(bbox_, 3, pos_);
                var d2_ = dot_(normal_, pos_);
        
                normalize_(bbox_, 6, pos_);
                var d3_ = dot_(normal_, pos_);
        
                normalize_(bbox_, 9, pos_);
                var d4_ = dot_(normal_, pos_);

                var maxDelta_ = Math.min(d1_, d2_, d3_, d4_);

                pos_[0] = (urx_ + llx_)* 0.5; 
                pos_[1] = ury_; 
                pos_[2] = h; 
                
                divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 12);

                pos_[1] = lly_; 
                divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 15);

                pos_[0] = urx_; 
                pos_[1] = (ury_ + lly_)* 0.5; 
                divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 18);

                pos_[0] = llx_; 
                divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 21);

                var mpos_ = this.diskPos_;
                var maxX_ =  Math.max(bbox_[0], bbox_[3], bbox_[6], bbox_[9], bbox_[12], bbox_[15], bbox_[18], bbox_[21], mpos_[0]);
                var minX_ =  Math.min(bbox_[0], bbox_[3], bbox_[6], bbox_[9], bbox_[12], bbox_[15], bbox_[18], bbox_[21], mpos_[0]);
                
                var maxY_ =  Math.max(bbox_[1], bbox_[4], bbox_[7], bbox_[10], bbox_[13], bbox_[16], bbox_[19], bbox_[22], mpos_[1]);
                var minY_ =  Math.min(bbox_[1], bbox_[4], bbox_[7], bbox_[10], bbox_[13], bbox_[16], bbox_[19], bbox_[22], mpos_[1]);
                
                var maxZ_ =  Math.max(bbox_[2], bbox_[5], bbox_[8], bbox_[11], bbox_[14], bbox_[17], bbox_[20], bbox_[23], mpos_[2]);
                var minZ_ =  Math.min(bbox_[2], bbox_[5], bbox_[8], bbox_[11], bbox_[14], bbox_[17], bbox_[20], bbox_[23], mpos_[2]);
                
                if (this.id_[0] <= 1) {
                    pos_[0] = urx_ + (llx_-urx_ )* 0.25; 
                    pos_[1] = (ury_ + lly_)* 0.5; 
                    
                    divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 12);
    
                    pos_[0] = urx_ + (llx_-urx_ )* 0.75; 
                    divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 15);
    
                    pos_[0] = (urx_ + llx_)* 0.5; 
                    pos_[1] = ury_ + (lly_-ury_ )* 0.25; 
                    divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 18);
    
                    pos_[1] = ury_ + (lly_-ury_ )* 0.75; 
                    divisionNode_.getPhysicalCoordsFast(pos_, true, bbox_, 0, 21);

                    maxX_ =  Math.max(maxX_, bbox_[12], bbox_[15], bbox_[18], bbox_[21]);
                    minX_ =  Math.min(minX_, bbox_[12], bbox_[15], bbox_[18], bbox_[21]);
                    
                    maxY_ =  Math.max(maxY_, bbox_[13], bbox_[16], bbox_[19], bbox_[22]);
                    minY_ =  Math.min(minY_, bbox_[13], bbox_[16], bbox_[19], bbox_[22]);
                    
                    maxZ_ =  Math.max(maxZ_, bbox_[14], bbox_[17], bbox_[20], bbox_[23]);
                    minZ_ =  Math.min(minZ_, bbox_[14], bbox_[17], bbox_[20], bbox_[23]);
                }

                bbox_[0] = minX_; bbox_[1] = minY_; bbox_[2] = minZ_;
                bbox_[3] = maxX_; bbox_[4] = minY_; bbox_[5] = minZ_;
                bbox_[6] = maxX_; bbox_[7] = maxY_; bbox_[8] = minZ_;
                bbox_[9] = minX_; bbox_[10] = maxY_; bbox_[11] = minZ_;

                bbox_[12] = minX_; bbox_[13] = minY_; bbox_[14] = maxZ_;
                bbox_[15] = maxX_; bbox_[16] = minY_; bbox_[17] = maxZ_;
                bbox_[18] = maxX_; bbox_[19] = maxY_; bbox_[20] = maxZ_;
                bbox_[21] = minX_; bbox_[22] = maxY_; bbox_[23] = maxZ_;
            } else {
                var normalize_ = Melown.vec3.normalize3; 
                var dot_ = Melown.vec3.dot2;

                normalize_(bbox_, 0, bbox_, 12);
                var d1_ = dot_(normal_, bbox_, 12);
                
                normalize_(bbox_, 3, bbox_, 15);
                var d2_ = dot_(normal_, bbox_, 15);
        
                normalize_(bbox_, 6, bbox_, 18);
                var d3_ = dot_(normal_, bbox_, 18);
        
                normalize_(bbox_, 9, bbox_, 21);
                var d4_ = dot_(normal_, bbox_, 21);
    
                var maxDelta_ = Math.min(d1_, d2_, d3_, d4_);

                //extend bbox height by tile curvature 
                height_ += map_.planetRadius_ - (map_.planetRadius_ * maxDelta_);  
                
                bbox_[12] = bbox_[0] + bbox_[12] * height_;
                bbox_[13] = bbox_[1] + bbox_[13] * height_;
                bbox_[14] = bbox_[2] + bbox_[14] * height_;
                
                bbox_[15] = bbox_[3] + bbox_[15] * height_;
                bbox_[16] = bbox_[4] + bbox_[16] * height_;
                bbox_[17] = bbox_[5] + bbox_[17] * height_;
            
                bbox_[18] = bbox_[6] + bbox_[18] * height_;
                bbox_[19] = bbox_[7] + bbox_[19] * height_;
                bbox_[20] = bbox_[8] + bbox_[20] * height_;
            
                bbox_[21] = bbox_[9] + bbox_[21] * height_;
                bbox_[22] = bbox_[10] + bbox_[22] * height_;
                bbox_[23] = bbox_[11] + bbox_[23] * height_;
            }
        
        } else {
            var normalize_ = Melown.vec3.normalize2; 

            normalize_(bbox_, 0, pos_);
            var d1_ = dot_(normal_, pos_);
            
            normalize_(bbox_, 3, pos_);
            var d2_ = dot_(normal_, pos_);
    
            normalize_(bbox_, 6, pos_);
            var d3_ = dot_(normal_, pos_);
    
            normalize_(bbox_, 9, pos_);
            var d4_ = dot_(normal_, pos_);

            var maxDelta_ = Math.min(d1_, d2_, d3_, d4_);
        }

        //get cos angle based at 90deg
        this.diskAngle_ = Math.cos(Math.max(0,(Math.PI * 0.5) - Math.acos(maxDelta_)));
        this.diskAngle2_ = maxDelta_;

        //shift center closer to earth
        //var factor_ = this.bbox_.maxSize_ * 0.2; 
        //this.diskPos_ = [this.diskPos_[0] - normal_[0] * factor_, this.diskPos_[1]  - normal_[1] * factor_, this.diskPos_[2] - normal_[2] * factor_];   
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
    if (this.metatile_.useVersion_ >= 4) {
        return this.drawBBox2(cameraPos_);
    }

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
    //for (var i = 0, li = this.bbox2_.length; i < li; i++) {
        //var pos_ = this.bbox2_[i];
        //pos_ = ["obj", pos_[0], pos_[1], "fix", pos_[2], 0, 0, 0, 10, 90 ];
        
    var bbox_ = this.bbox2_;

    for (var i = 0, li = 8*3; i < li; i+=3) {
        var pos_ = ["obj", bbox_[i], bbox_[i+1], "fix", bbox_[i+2], 0, 0, 0, 10, 90 ];

        spoints_.push((new Melown.MapPosition(this.map_, pos_)).getCanvasCoords(null, true));
    }
    
    var renderer_ = this.map_.renderer_;
    renderer_.drawLineString([spoints_[0], spoints_[1], spoints_[2], spoints_[3], spoints_[0] ], 2, [0,1,0.5,255], false, false, true);
    renderer_.drawLineString([spoints_[4], spoints_[5], spoints_[6], spoints_[7], spoints_[4] ], 2, [0,1,0.5,255], false, false, true);

    renderer_.drawLineString([spoints_[0], spoints_[4]], 2, [0,1,0.5,255], false, false, true);
    renderer_.drawLineString([spoints_[1], spoints_[5]], 2, [0,1,0.5,255], false, false, true);
    renderer_.drawLineString([spoints_[2], spoints_[6]], 2, [0,1,0.5,255], false, false, true);
    renderer_.drawLineString([spoints_[3], spoints_[7]], 2, [0,1,0.5,255], false, false, true);

};

Melown.MapMetanode.prototype.drawPlane = function(cameraPos_, tile_) {
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
    
    var prog_ = renderer_.progPlane_; 

    prog_.setMat4("uMV", mv_);
    prog_.setMat4("uProj", proj_);
    prog_.setFloatArray("uPoints", buffer_);

    var minTile_ = 32;
    var embed_ = 8;
    var altitude_ = Math.max(10, tile_.distance_ + 20);
    var gridSelect_ = (Math.log(altitude_) / Math.log(embed_));
    var step1_ = 4;//(Math.pow(embed_, Math.floor(gridSelect_)));
    var step2_ = 8;//(Math.pow(embed_, Math.ceil(gridSelect_)));
    var blend_ = (gridSelect_ - Math.floor(gridSelect_));
    //var blend_ = 0;

    //prog_.setVec4("uParams", [0,0,1/15,0]);
    //prog_.setVec4("uParams", [(minTile_ / step1_),0,1/15,(minTile_ / step2_)]);
    prog_.setVec4("uParams", [step1_, 0, 1/15, step2_]);

    //prog_.setVec4("uParams2", [(minTile_ / step1_), (minTile_ / step2_), blend_, 0]);
    prog_.setVec4("uParams2", [0, 0, blend_, 0]);

    renderer_.gpu_.bindTexture(renderer_.heightmapTexture_);
    
    //draw bbox
    renderer_.planeMesh_.draw(renderer_.progPlane_, "aPosition", "aTexCoord");
};


