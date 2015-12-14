/**
 * @constructor
 */
Melown.GpuMesh = function(gpu_, meshData_, fileSize_, core_) {
    this.gl_ = gpu_.gl_;
    this.bbox_ = meshData_.bbox_; //!< bbox copy from Mesh
    this.fileSize_ = fileSize_; //used for stats
    this.core_ = core_;
    this.vertexBuffer_ = null;
    this.uvBuffer_ = null;
    this.uv2Buffer_ = null;

    var timer_ = performance.now();

    var vertices_ = meshData_.vertices_;
    var uvs_ = meshData_.uvs_;
    var uvs2_ = meshData_.uvs2_;
    var vertexSize_ = meshData_.vertexSize_ || 3;
    var uvSize_ = meshData_.uvSize_ || 2;
    var uv2Size_ = meshData_.uv2Size_ || 2;
    var gl_ = this.gl_;

    if (!vertices_ || !gl_) {
        return;
    }

    //create vertex buffer
    this.vertexBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.vertexBuffer_.itemSize = vertexSize_;
    this.vertexBuffer_.numItems = vertices_.length / vertexSize_;

    if (uvs_ != null) {
        //create texture coords buffer
        this.uvBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uvBuffer_);

        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(uvs_), gl_.STATIC_DRAW);
        this.uvBuffer_.itemSize = uvSize_;
        this.uvBuffer_.numItems = uvs_.length / uvSize_;
    }

    if (uvs2_ != null) {
        //create texture coords buffer
        this.uv2Buffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uv2Buffer_);

        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(uvs2_), gl_.STATIC_DRAW);
        this.uv2Buffer_.itemSize = uv2Size_;
        this.uv2Buffer_.numItems = uvs2_.length / uv2Size_;
    }

    this.size_ = this.vertexBuffer_.numItems * vertexSize_ * 4;
    this.size_ += (uvs_ == null) ? 0 : this.uvBuffer_.numItems * uvSize_ * 4;
    this.size_ += (uvs2_ == null) ? 0 : this.uv2Buffer_.numItems * uv2Size_ * 4;
    this.polygons_ = this.vertexBuffer_.numItems / 3;

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

    this.gl_.deleteBuffer(this.vertexBuffer_);
    this.gl_.deleteBuffer(this.uvBuffer_);

    /*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }*/
};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuMesh.prototype.draw = function(program_, attrVertex_, attrUV_, attrUV2_, attrBarycenteric_) {
    var gl_ = this.gl_;
    if (gl_ == null || !this.valid_) {
        return;
    }

    //bind vetex positions
    var vertexAttribute_ = program_.getAttribute(attrVertex_);
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer_);
    gl_.vertexAttribPointer(vertexAttribute_, this.vertexBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind texture coords
    if (this.uvBuffer_ && attrUV_) {
        var uvAttribute_ = program_.getAttribute(attrUV_);
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uvBuffer_);
        gl_.vertexAttribPointer(uvAttribute_, this.uvBuffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    if (this.uv2Buffer_ && attrUV2_) {
        var uv2Attribute_ = program_.getAttribute(attrUV2_);
        gl_.bindBuffer(gl_.ARRAY_BUFFER, this.uv2Buffer_);
        gl_.vertexAttribPointer(uv2Attribute_, this.uv2Buffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    if (attrBarycenteric_ && attrBarycenteric_) {
        var barycentericAttribute_ = program_.getAttribute(attrBarycenteric_);
        gl_.bindBuffer(gl_.ARRAY_BUFFER, Melown.GpuBarycentricBuffer_);
        gl_.vertexAttribPointer(barycentericAttribute_, Melown.GpuBarycentricBuffer_.itemSize, gl_.FLOAT, false, 0, 0);
    }

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuMesh.prototype.size = function(){ return this.size_; };

Melown.GpuMesh.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuMesh.prototype.getPolygons = function(){ return this.polygons_; };

