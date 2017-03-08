
//! An index-less mesh. Each triangle has three items in the array 'vertices'.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

/** @const */ MelownSubmeshFlags_InternalTexcoords =  1;
/** @const */ MelownSubmeshFlags_ExternalTexcoords =  2;
/** @const */ MelownSubmeshFlags_PerVertexUndulation =  4;
/** @const */ MelownSubmeshFlags_TextureMode =  8;

/**
 * @constructor
 */
Melown.MapSubmesh = function(mesh_, stream_) {
    this.generateLines_ = true;
    this.map_ = mesh_.map_;
    this.vertices_ = null;
    this.internalUVs_ = null;
    this.externalUVs_ = null;
    this.mesh_ = mesh_;
    this.statsCounter_ = 0;
    this.valid_ = true;
    this.killed_ = false;

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.faces_ = 0;

    if (stream_ != null) {
        this.parseSubmesh(stream_);
    }
};

Melown.MapSubmesh.prototype.kill = function () {
    this.killed_ = true;
    this.vertices_ = null;
    this.internalUVs_ = null;
    this.externalUVs_ = null;
};

//! Reads the mesh from the binary representation.
Melown.MapSubmesh.prototype.parseSubmesh = function (stream_) {

/*
struct MapSubmesh {
    struct MapSubmeshHeader header;
    struct VerticesBlock vertices;
    struct TexcoordsBlock internalTexcoords;   // if header.flags & ( 1 << 0 )
    struct FacesBlock faces;
};
*/
    this.parseHeader(stream_);
    if (this.mesh_.version_ >= 3) {
        this.parseVerticesAndFaces2(stream_);
    } else {
        this.parseVerticesAndFaces(stream_);
    }
};

Melown.MapSubmesh.prototype.parseHeader = function (stream_) {

/*
struct MapSubmeshHeader {
    char flags;                    // bit 0 - contains internal texture coords
                                   // bit 1 - contains external texture coords
                                   // bit 2 - contains per vertex undulation
                                   // bit 3 - texture mode (0 - internal, 1 - external)
    
    uchar surfaceReference;        // reference to the surface of origin, see bellow
    ushort textureLayer;           // applicable if texture mode is external: texture layer numeric id
    double boundingBox[2][3];      // read more about bounding box bellow
};
*/

    var streamData_ = stream_.data_;

    this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    if (this.mesh_.version_ > 1) {
        this.surfaceReference_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
    } else {
        this.surfaceReference_ = 0;
    }

    this.textureLayer_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.textureLayer2_ = this.textureLayer_; //hack for presentation

    var bboxMin_ = this.bbox_.min_;
    var bboxMax_ = this.bbox_.max_;

    bboxMin_[0] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMin_[1] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMin_[2] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;

    bboxMax_[0] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMax_[1] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    bboxMax_[2] = streamData_.getFloat64(stream_.index_, true); stream_.index_ += 8;
    
    this.bbox_.updateMaxSize();
};

Melown.MapSubmesh.prototype.parseVerticesAndFaces = function (stream_) {
/*
struct VerticesBlock {
    ushort numVertices;              // number of vertices

    struct Vertex {                  // array of vertices, size of array is defined by numVertices property
        // vertex coordinates
        ushort x;
        ushort y;
        ushort z;

        // if header.flags & ( 1 << 1 ): external texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort eu;
        ushort ev;

        // if header.flags & ( 1 << 2 ): undulation delta
        float16 undulationDelta;
    } vertices[];
};
*/

    var data_ = stream_.data_;
    var index_ = stream_.index_;
    var uint8Data_ = stream_.uint8Data_;

    var numVertices_ = data_.getUint16(index_, true); index_ += 2;

    if (!numVertices_) {
        this.valid_ = false;
    }

    var externalUVs_ = null;

    var vertices_ = new Float32Array(numVertices_ * 3);//[];

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        externalUVs_ = new Float32Array(numVertices_ * 2);//[];
    }

    var uvfactor_ = 1.0 / 65535;
    var vfactor_ = uvfactor_;
    var ufactor_ = uvfactor_;
    var vindex_ = 0;
    var uvindex_ = 0;

    for (var i = 0; i < numVertices_; i++) {
        //vertices_[vindex_] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        //vertices_[vindex_+1] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        //vertices_[vindex_+2] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        vertices_[vindex_] = (uint8Data_[index_] + (uint8Data_[index_ + 1]<<8)) * vfactor_;
        vertices_[vindex_+1] = (uint8Data_[index_+2] + (uint8Data_[index_ + 3]<<8)) * vfactor_;
        vertices_[vindex_+2] = (uint8Data_[index_+4] + (uint8Data_[index_ + 5]<<8)) * vfactor_;
        vindex_ += 3;

        if (externalUVs_ != null) {
            //externalUVs_[uvindex_] = data_.getUint16(index_, true) * uvfactor_; index_ += 2;
            //externalUVs_[uvindex_+1] = (65535 - data_.getUint16(index_, true)) * uvfactor_; index_ += 2;
            externalUVs_[uvindex_] = (uint8Data_[index_+6] + (uint8Data_[index_ + 7]<<8)) * uvfactor_;
            externalUVs_[uvindex_+1] = (65535 - (uint8Data_[index_+8] + (uint8Data_[index_ + 9]<<8))) * uvfactor_;
            uvindex_ += 2;
            index_ += 10;
        } else {
            index_ += 6;
        }
    }


    this.tmpVertices_ = vertices_;
    this.tmpExternalUVs_ = externalUVs_;
   
/*
struct TexcoorsBlock {
    ushort numTexcoords;              // number of texture coordinates

    struct TextureCoords {            // array of texture coordinates, size of array is defined by numTexcoords property

        // internal texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort u;
        ushort v;
    } texcoords[];
};
*/

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        var numUVs_ = data_.getUint16(index_, true); index_ += 2;
    
        var internalUVs_ = new Float32Array(numUVs_ * 2);//[];
        var uvfactor_ = 1.0 / 65535;
    
        for (var i = 0, li = numUVs_ * 2; i < li; i+=2) {
            internalUVs_[i] = (uint8Data_[index_] + (uint8Data_[index_ + 1]<<8)) * uvfactor_;
            internalUVs_[i+1] = (65535 - (uint8Data_[index_+2] + (uint8Data_[index_ + 3]<<8))) * uvfactor_;
            index_ += 4;
        }
    
        this.tmpInternalUVs_ = internalUVs_;
    }

/*
struct FacesBlock {
    ushort numFaces;              // number of faces

    struct Face {                 // array of faces, size of array is defined by numFaces property

        ushort v[3]; // array of indices to stored vertices
        ushort t[3]; // if header.flags & ( 1 << 0 ): array of indices to stored internal texture coords

    } faces[];
};
*/

    var numFaces_ = data_.getUint16(index_, true); index_ += 2;

    var internalUVs_ = null;
    var externalUVs_ = null;

    var vertices_ = new Float32Array(numFaces_ * 3 * 3);//[];

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        internalUVs_ = new Float32Array(numFaces_ * 3 * 2);//[];
    }

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        externalUVs_ = new Float32Array(numFaces_ * 3 * 2);//[];
    }

    var vtmp_ = this.tmpVertices_;
    var eUVs_ = this.tmpExternalUVs_;
    var iUVs_ = this.tmpInternalUVs_;

    for (var i = 0; i < numFaces_; i++) {
        var vindex_ = i * (3 * 3);
        var v1 = (uint8Data_[index_] + (uint8Data_[index_ + 1]<<8));
        var v2 = (uint8Data_[index_+2] + (uint8Data_[index_ + 3]<<8));
        var v3 = (uint8Data_[index_+4] + (uint8Data_[index_ + 5]<<8));

        //var dindex_ = i * (3 * 3);
        var sindex_ = v1 * 3;
        vertices_[vindex_] = vtmp_[sindex_];
        vertices_[vindex_+1] = vtmp_[sindex_+1];
        vertices_[vindex_+2] = vtmp_[sindex_+2];

        sindex_ = v2 * 3;
        vertices_[vindex_+3] = vtmp_[sindex_];
        vertices_[vindex_+4] = vtmp_[sindex_+1];
        vertices_[vindex_+5] = vtmp_[sindex_+2];

        sindex_ = v3 * 3;
        vertices_[vindex_+6] = vtmp_[sindex_];
        vertices_[vindex_+7] = vtmp_[sindex_+1];
        vertices_[vindex_+8] = vtmp_[sindex_+2];

        if (externalUVs_ != null) {
            vindex_ = i * (3 * 2);
            externalUVs_[vindex_] = eUVs_[v1*2];
            externalUVs_[vindex_+1] = eUVs_[v1*2+1];
            externalUVs_[vindex_+2] = eUVs_[v2*2];
            externalUVs_[vindex_+3] = eUVs_[v2*2+1];
            externalUVs_[vindex_+4] = eUVs_[v3*2];
            externalUVs_[vindex_+5] = eUVs_[v3*2+1];
        }

        if (internalUVs_ != null) {
            v1 = (uint8Data_[index_+6] + (uint8Data_[index_ + 7]<<8));
            v2 = (uint8Data_[index_+8] + (uint8Data_[index_ + 9]<<8));
            v3 = (uint8Data_[index_+10] + (uint8Data_[index_ + 11]<<8));
            index_ += 12;

            vindex_ = i * (3 * 2);
            internalUVs_[vindex_] = iUVs_[v1*2];
            internalUVs_[vindex_+1] = iUVs_[v1*2+1];
            internalUVs_[vindex_+2] = iUVs_[v2*2];
            internalUVs_[vindex_+3] = iUVs_[v2*2+1];
            internalUVs_[vindex_+4] = iUVs_[v3*2];
            internalUVs_[vindex_+5] = iUVs_[v3*2+1];
        } else {
            index_ += 6;
        }
    }

    this.vertices_ = vertices_;
    this.internalUVs_ = internalUVs_;
    this.externalUVs_ = externalUVs_;

    this.tmpVertices_ = null;
    this.tmpInternalUVs_ = null;
    this.tmpExternalUVs_ = null;

    stream_.index_ = index_;

    this.size_ = this.vertices_.length;
    if (this.internalUVs_) this.size_ += this.internalUVs_.length;
    if (this.externalUVs_) this.size_ += this.externalUVs_.length;
    this.size_ *= 4;
    this.faces_ = numFaces_;
};

Melown.MapSubmesh.prototype.parseWord = function (data_, res_) {
    var value_ = data_[res_[1]];
    
    if (value_ & 0x80) {
        res_[0] = (value_ & 0x7f) | (data_[res_[1]+1] << 7);
        res_[1] += 2;
    } else {
        res_[0] = value_;
        res_[1] ++;
    }
};

Melown.MapSubmesh.prototype.parseDelta = function (data_, res_) {
    var value_ = data_[res_[1]];
    
    if (value_ & 0x80) {
        value_ = (value_ & 0x7f) | (data_[res_[1]+1] << 7);

        if (value_ & 1) {
            res_[0] = -((value_ >> 1)+1); 
            res_[1] += 2;
        } else {
            res_[0] = (value_ >> 1); 
            res_[1] += 2;
        }
    } else {
        if (value_ & 1) {
            res_[0] = -((value_ >> 1)+1); 
            res_[1] ++;
        } else {
            res_[0] = (value_ >> 1); 
            res_[1] ++;
        }
    }
};


Melown.MapSubmesh.prototype.parseVerticesAndFaces2 = function (stream_) {
/*
struct VerticesBlock {
    ushort numVertices;              // number of vertices
    ushort geomQuantCoef;            // geometry quantization coefficient

    struct Vertex {                  // array of vertices, size of array is defined by numVertices property
        // vertex coordinates
        delta x;
        delta y;
        delta z;
    } vertices[];
};
*/

    var data_ = stream_.data_;
    var index_ = stream_.index_;
    var uint8Data_ = stream_.uint8Data_;

    var numVertices_ = data_.getUint16(index_, true); index_ += 2;
    var quant_ = data_.getUint16(index_, true); index_ += 2;

    if (!numVertices_) {
        this.valid_ = false;
    }

    var center_ = this.bbox_.center();
    var scale_ = this.bbox_.maxSize_;

    var multiplier_ = 1.0 / quant_;
    var externalUVs_ = null;

    var vertices_ = new Float32Array(numVertices_ * 3);//[];
    
    var x = 0, y = 0,z = 0;
    var cx = center_[0], cy = center_[1], cz = center_[2];
    var mx_ = this.bbox_.min_[0];
    var my_ = this.bbox_.min_[1];
    var mz_ = this.bbox_.min_[2];
    var sx_ = 1.0 / (this.bbox_.max_[0] - this.bbox_.min_[0]);
    var sy_ = 1.0 / (this.bbox_.max_[1] - this.bbox_.min_[1]);
    var sz_ = 1.0 / (this.bbox_.max_[2] - this.bbox_.min_[2]);
    
    var res_ = [0, index_];

    for (var i = 0; i < numVertices_; i++) {
        this.parseDelta(uint8Data_, res_);
        x += res_[0];
        this.parseDelta(uint8Data_, res_);
        y += res_[0];
        this.parseDelta(uint8Data_, res_);
        z += res_[0];
        
        var vindex_ = i * 3;
        vertices_[vindex_] = ((x * multiplier_ * scale_ + cx) - mx_) * sx_;
        vertices_[vindex_+1] = ((y * multiplier_ * scale_ + cy) - my_) * sy_;
        vertices_[vindex_+2] = ((z * multiplier_ * scale_ + cz) - mz_) * sz_;
    }
    
    index_ = res_[1];

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        quant_ = data_.getUint16(index_, true); index_ += 2;
        multiplier_ = 1.0 / quant_;

        externalUVs_ = new Float32Array(numVertices_ * 2);
        x = 0, y = 0;
        res_[1] = index_;

        for (var i = 0; i < numVertices_; i++) {
            var d = this.parseDelta(uint8Data_, res_);
            x += res_[0];
            d = this.parseDelta(uint8Data_, res_);
            y += res_[0];

            var uvindex_ = i * 2;
            externalUVs_[uvindex_] = x * multiplier_;
            externalUVs_[uvindex_+1] = 1 - (y * multiplier_);
        }
    }

    index_ = res_[1];

    this.tmpVertices_ = vertices_;
    this.tmpExternalUVs_ = externalUVs_;
    
/*
struct TexcoorsBlock {
    ushort numTexcoords;              // number of texture coordinates

    struct TextureCoords {            // array of texture coordinates, size of array is defined by numTexcoords property

        // internal texture coordinates
        // values in 2^16^ range represents the 0..1 normalized texture space
        ushort u;
        ushort v;
    } texcoords[];
};
*/

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        var numUVs_ = data_.getUint16(index_, true); index_ += 2;
        var quantU_ = data_.getUint16(index_, true); index_ += 2;
        var quantV_ = data_.getUint16(index_, true); index_ += 2;
        var multiplierU_ = 1.0 / quantU_;
        var multiplierV_ = 1.0 / quantV_;
        x = 0, y = 0;
    
        var internalUVs_ = new Float32Array(numUVs_ * 2);//[];
        res_[1] = index_;

        for (var i = 0, li = numUVs_ * 2; i < li; i+=2) {
            this.parseDelta(uint8Data_, res_);
            x += res_[0];
            this.parseDelta(uint8Data_, res_);
            y += res_[0];

            internalUVs_[i] = x * multiplierU_;
            internalUVs_[i+1] = 1 - (y * multiplierV_);
        }

        index_ = res_[1];
    
        this.tmpInternalUVs_ = internalUVs_;
    }

/*
struct FacesBlock {
    ushort numFaces;              // number of faces

    struct Face {                 // array of faces, size of array is defined by numFaces property

        ushort v[3]; // array of indices to stored vertices
        ushort t[3]; // if header.flags & ( 1 << 0 ): array of indices to stored internal texture coords

    } faces[];
};
*/

    var numFaces_ = data_.getUint16(index_, true); index_ += 2;

    var internalUVs_ = null;
    var externalUVs_ = null;

    var vertices_ = new Float32Array(numFaces_ * 3 * 3);//[];

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        internalUVs_ = new Float32Array(numFaces_ * 3 * 2);//[];
    }

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        externalUVs_ = new Float32Array(numFaces_ * 3 * 2);//[];
    }

    var vtmp_ = this.tmpVertices_;
    var eUVs_ = this.tmpExternalUVs_;
    var iUVs_ = this.tmpInternalUVs_;
    var high_ = 0;
    res_[1] = index_;

    for (var i = 0; i < numFaces_; i++) {
        var vindex_ = i * (3 * 3);
       
        this.parseWord(uint8Data_, res_);
        var v1 = high_ - res_[0];
        if (!res_[0]) { high_++; }

        this.parseWord(uint8Data_, res_);
        var v2 = high_ - res_[0];
        if (!res_[0]) { high_++; }

        this.parseWord(uint8Data_, res_);
        var v3 = high_ - res_[0];
        if (!res_[0]) { high_++; }
        
        //var dindex_ = i * (3 * 3);
        var sindex_ = v1 * 3;
        vertices_[vindex_] = vtmp_[sindex_];
        vertices_[vindex_+1] = vtmp_[sindex_+1];
        vertices_[vindex_+2] = vtmp_[sindex_+2];

        sindex_ = v2 * 3;
        vertices_[vindex_+3] = vtmp_[sindex_];
        vertices_[vindex_+4] = vtmp_[sindex_+1];
        vertices_[vindex_+5] = vtmp_[sindex_+2];

        sindex_ = v3 * 3;
        vertices_[vindex_+6] = vtmp_[sindex_];
        vertices_[vindex_+7] = vtmp_[sindex_+1];
        vertices_[vindex_+8] = vtmp_[sindex_+2];

        if (externalUVs_ != null) {
            vindex_ = i * (3 * 2);
            externalUVs_[vindex_] = eUVs_[v1*2];
            externalUVs_[vindex_+1] = eUVs_[v1*2+1];
            externalUVs_[vindex_+2] = eUVs_[v2*2];
            externalUVs_[vindex_+3] = eUVs_[v2*2+1];
            externalUVs_[vindex_+4] = eUVs_[v3*2];
            externalUVs_[vindex_+5] = eUVs_[v3*2+1];
        }
    }

    high_ = 0;

    if (internalUVs_ != null) {
        for (var i = 0; i < numFaces_; i++) {
            this.parseWord(uint8Data_, res_);
            var v1 = high_ - res_[0];
            if (!res_[0]) { high_++; }
    
            this.parseWord(uint8Data_, res_);
            var v2 = high_ - res_[0];
            if (!res_[0]) { high_++; }
    
            this.parseWord(uint8Data_, res_);
            var v3 = high_ - res_[0];
            if (!res_[0]) { high_++; }

            vindex_ = i * (3 * 2);
            internalUVs_[vindex_] = iUVs_[v1*2];
            internalUVs_[vindex_+1] = iUVs_[v1*2+1];
            internalUVs_[vindex_+2] = iUVs_[v2*2];
            internalUVs_[vindex_+3] = iUVs_[v2*2+1];
            internalUVs_[vindex_+4] = iUVs_[v3*2];
            internalUVs_[vindex_+5] = iUVs_[v3*2+1];
        }
    }

    index_ = res_[1];

    this.vertices_ = vertices_;
    this.internalUVs_ = internalUVs_;
    this.externalUVs_ = externalUVs_;

    this.tmpVertices_ = null;
    this.tmpInternalUVs_ = null;
    this.tmpExternalUVs_ = null;

    stream_.index_ = index_;

    this.size_ = this.vertices_.length;
    if (this.internalUVs_) this.size_ += this.internalUVs_.length;
    if (this.externalUVs_) this.size_ += this.externalUVs_.length;
    this.size_ *= 4;
    this.faces_ = numFaces_;
};


//! Returns RAM usage in bytes.
Melown.MapSubmesh.prototype.size = function () {
    return this.size_;
};

Melown.MapSubmesh.prototype.fileSize = function () {
    return this.fileSize_;
};

Melown.MapSubmesh.prototype.buildGpuMesh = function () {
    return new Melown.GpuMesh(this.map_.renderer_.gpu_, {
            bbox_: this.bbox_,
            vertices_: this.vertices_,
            uvs_: this.internalUVs_,
            uvs2_: this.externalUVs_
        }, 1, this.map_.core_);
};

Melown.MapSubmesh.prototype.getWorldMatrix = function(geoPos_, matrix_) {
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

Melown.MapSubmesh.prototype.drawBBox = function(cameraPos_) {
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

