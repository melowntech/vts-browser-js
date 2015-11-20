//! Holds a GPU vertex buffer.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

Melown.GpuBarycentricVertexBuffer_ = null;

/**
 * @constructor
 */
Melown.GpuMesh = function(gpu_, meshData_, fileSize_, core_) {
    this.bbox_ = meshData_.bbox_; //!< bbox copy from Mesh
    this.gl_ = gpu_.gl_;
    this.fileSize_ = fileSize_; //used for stats
    this.core_ = core_;

    var timer_ = performance.now();

    var gl_ = this.gl_;
    if (gl_ == null) {
        return;
    }

    this.vertexPositionBuffer_ = null;
    this.vertexTextureCoordBuffer_ = null;

    var vertices_ = meshData_.vertices_;
    var uvs_ = meshData_.uvs_;

    if (!vertices_ || !uvs_) {
        return;
    }

    var vertexSize_ = meshData_.vertexSize_ || 3;
    var uvSize_ = meshData_.uvSize_ || 2;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = vertexSize_;
    this.vertexPositionBuffer_.numItems = vertices_.length / vertexSize_;

    //create texture coords buffer
    this.vertexTextureCoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(uvs_), gl_.STATIC_DRAW);
    this.vertexTextureCoordBuffer_.itemSize = uvSize_;
    this.vertexTextureCoordBuffer_.numItems = uvs_.length / uvSize_;

    this.size_ = this.vertexPositionBuffer_.numItems * vertexSize_ * 4
                 + this.vertexTextureCoordBuffer_.numItems * uvSize_ * 4;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;


    if (Melown.GpuBarycentricVertexBuffer_ == null) {
        var buffer_ = new Array(65535*3);

        for (var i = 0; i < 65535*3; i+=9) {
            buffer_[i] = 1.0;
            buffer_[i+1] = 0;
            buffer_[i+2] = 0;

            buffer_[i+3] = 0;
            buffer_[i+4] = 1.0;
            buffer_[i+5] = 0;

            buffer_[i+6] = 0;
            buffer_[i+7] = 0;
            buffer_[i+8] = 1.0;
        }

        Melown.GpuBarycentricVertexBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, Melown.GpuBarycentricVertexBuffer_);

        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(buffer_), gl_.STATIC_DRAW);
        Melown.GpuBarycentricVertexBuffer_.itemSize = 3;
        Melown.GpuBarycentricVertexBuffer_.numItems = buffer_.length / 3;
    }

    /*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxMesh_[0][0] ++;
        this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }*/

    this.valid_ = true;
};

//destructor
Melown.GpuMesh.prototype.kill = function() {
    if (!this.gl_ || !this.valid_) {
        return;
    }

    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexTextureCoordBuffer_);

    /*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }*/
};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuMesh.prototype.draw = function(program_, attrPosition_, attrTexCoord_, attrBarycenteric_) {
    var gl_ = this.gl_;
    if (gl_ == null || !this.valid_) {
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var textureCoordAttribute_ = program_.getAttribute(attrTexCoord_);

    if (attrBarycenteric_ != null) {
        var barycentericAttribute_ = program_.getAttribute(attrBarycenteric_);
    }

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind texture coords
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);
    gl_.vertexAttribPointer(textureCoordAttribute_, this.vertexTextureCoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    if (attrBarycenteric_ != null) {
        gl_.bindBuffer(gl_.ARRAY_BUFFER, Melown.GpuBarycentricVertexBuffer_);
        gl_.vertexAttribPointer(barycentericAttribute_, Melown.GpuBarycentricVertexBuffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuMesh.prototype.size = function(){ return this.size_; };

Melown.GpuMesh.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuMesh.prototype.getPolygons = function(){ return this.polygons_; };

