//! Holds a GPU vertex buffer.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

Melown.GpuBarycentricVertexBuffer_ = null;

/**
 * @constructor
 */
Melown.GpuMesh = function(gpu_, meshData_, fileSize_, browser_)
{
    this.bbox_ = meshData_["bbox"]; //!< bbox copy from Mesh
    this.gl_ = gpu_.gl_;
    this.fileSize_ = fileSize_; //used for stats
    this.browser_ = browser_;

    var timer_ = performance.now();

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertexPositionBuffer_ = null;
    this.vertexTextureCoordBuffer_ = null;

    var vertices_ = meshData_["vertices"];
    var tvertices_ = meshData_["uvs"];

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = vertices_.length / 3;

    //create texture coords buffer
    this.vertexTextureCoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(tvertices_), gl_.STATIC_DRAW);
    this.vertexTextureCoordBuffer_.itemSize = 2;
    this.vertexTextureCoordBuffer_.numItems = tvertices_.length / 2;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4 + this.vertexTextureCoordBuffer_.numItems * 2 * 4;
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

    if (this.browser_.renderer_ != null) {
        this.browser_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.browser_.renderer_.statsFluxMesh_[0][0] ++;
        this.browser_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }

};

//destructor
Melown.GpuMesh.prototype.kill = function()
{
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexTextureCoordBuffer_);

    if (this.browser_.renderer_ != null) {
        this.browser_.renderer_.statsFluxMesh_[1][0] ++;
        this.browser_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuMesh.prototype.draw = function(program_, attrPosition_, attrTexCoord_, attrBarycenteric_)
{
    var gl_ = this.gl_;
    if (gl_ == null)
        return;

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

