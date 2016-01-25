
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
    this.undulationDeltas_ = null;
    this.mesh_ = mesh_;

    this.bbox_ = new Melown.BBox();
    this.size_ = 0;
    this.faces_ = 0;

    if (stream_ != null) {
        this.parseSubmesh(stream_);
    }
};

Melown.MapSubmesh.prototype.kill = function () {
    this.vertices_ = null;
    this.internalUVs_ = null;
    this.externalUVs_ = null;
    this.undulationDeltas_ = null;
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
    this.parseVertices(stream_);

    if (this.flags_ & MelownSubmeshFlags_InternalTexcoords) {
        this.parseTexcoords(stream_);
    }

    this.parseFaces(stream_);
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
};

Melown.MapSubmesh.prototype.parseVertices = function (stream_) {
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

    var numVertices_ = data_.getUint16(stream_.index_, true); index_ += 2;

    var externalUVs_ = null;
    var undulationDeltas_ = null;

    var vertices_ = new Float32Array(numVertices_ * 3);//[];

    if (this.flags_ & MelownSubmeshFlags_ExternalTexcoords) {
        externalUVs_ = new Float32Array(numVertices_ * 2);//[];
    }

    if (this.flags_ & MelownSubmeshFlags_PerVertexUndulation) {
        undulationDeltas_ = new Float32Array(numVertices_);//[];
    }

    var uvfactor_ = 1.0 / 65535;
    var vfactor_ = uvfactor_;
    var ufactor_ = uvfactor_;

    for (var i = 0; i < numVertices_; i++) {
        var vindex_ = i * 3;
        vertices_[vindex_] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        vertices_[vindex_+1] = data_.getUint16(index_, true) * vfactor_; index_ += 2;
        vertices_[vindex_+2] = data_.getUint16(index_, true) * vfactor_; index_ += 2;

        if (externalUVs_ != null) {
            var uvindex_ = i * 2;
            externalUVs_[uvindex_] = data_.getUint16(index_, true) * uvfactor_; index_ += 2;
            externalUVs_[uvindex_+1] = (65535 - data_.getUint16(index_, true)) * uvfactor_; index_ += 2;
        }

        if (undulationDeltas_ != null) {
            undulationDeltas_[i] = data_.getUint16(index_, true) * ufactor_; index_ += 2;
        }
    }


    this.tmpVertices_ = vertices_;
    this.tmpExternalUVs_ = externalUVs_;
    this.undulationDeltas_ = undulationDeltas_;

    stream_.index_ = index_;

};

Melown.MapSubmesh.prototype.parseTexcoords = function (stream_) {
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

    var data_ = stream_.data_;
    var index_ = stream_.index_;

    var numUVs_ = data_.getUint16(stream_.index_, true); index_ += 2;

    var internalUVs_ = new Float32Array(numUVs_ * 2);//[];
    var uvfactor_ = 1.0 / 65535;

    for (var i = 0, li = numUVs_ * 2; i < li; i+=2) {
        internalUVs_[i] = data_.getUint16(index_, true) * uvfactor_; index_ += 2;
        internalUVs_[i+1] = (65535 - data_.getUint16(index_, true)) * uvfactor_; index_ += 2;
    }

    this.tmpInternalUVs_ = internalUVs_;

    stream_.index_ = index_;
};

Melown.MapSubmesh.prototype.parseFaces = function (stream_) {
/*
struct FacesBlock {
    ushort numFaces;              // number of faces

    struct Face {                 // array of faces, size of array is defined by numFaces property

        ushort v[3]; // array of indices to stored vertices
        ushort t[3]; // if header.flags & ( 1 << 0 ): array of indices to stored internal texture coords

    } faces[];
};
*/

    var data_ = stream_.data_;
    var index_ = stream_.index_;

    var numFaces_ = data_.getUint16(stream_.index_, true); index_ += 2;

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
    //var uds = this.undulationDeltas_;

    for (var i = 0; i < numFaces_; i++) {
        var vindex_ = i * (3 * 3);
        var v1 = data_.getUint16(index_, true); index_ += 2;
        var v2 = data_.getUint16(index_, true); index_ += 2;
        var v3 = data_.getUint16(index_, true); index_ += 2;

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
            v1 = data_.getUint16(index_, true); index_ += 2;
            v2 = data_.getUint16(index_, true); index_ += 2;
            v3 = data_.getUint16(index_, true); index_ += 2;

            vindex_ = i * (3 * 2);
            internalUVs_[vindex_] = iUVs_[v1*2];
            internalUVs_[vindex_+1] = iUVs_[v1*2+1];
            internalUVs_[vindex_+2] = iUVs_[v2*2];
            internalUVs_[vindex_+3] = iUVs_[v2*2+1];
            internalUVs_[vindex_+4] = iUVs_[v3*2];
            internalUVs_[vindex_+5] = iUVs_[v3*2+1];
        }
    }

    this.vertices_ = vertices_;
    this.internalUVs_ = internalUVs_;
    this.externalUVs_ = externalUVs_;
    //this.undulationDeltas_ = undulationDeltas_;

    this.tmpVertices_ = null;
    this.tmpInternalUVs_ = null;
    this.tmpExternalUVs_ = null;

    stream_.index_ = index_;

    this.size_ = this.vertices_.length;
    if (this.internalUVs_) this.size_ += this.internalUVs_.length;
    if (this.externalUVs_) this.size_ += this.externalUVs_.length;
    if (this.undulationDeltas_) this.size_ += this.undulationDeltas_.length;
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

