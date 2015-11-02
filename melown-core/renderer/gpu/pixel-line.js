//! Holds a GPU vertex buffer.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

//3D Line, line width is defined in pixels

/**
 * @constructor
 */
Melown.GpuPixelLine = function(gpu_, core_)
{
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;

    var timer_ = performance.now();

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertices_ = [];
    this.normals_ = [];
    this.vertexPositionBuffer_ = null;
    this.vertexNormalBuffer_ = null;
};

//destructor
Melown.GpuPixelLine.prototype.kill = function()
{
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexNormalBuffer_);
/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add line to vertices buffer
Melown.GpuPixelLine.prototype.addLine = function(p1, p2, size_)
{
    //get direction vector
    var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

    //normalize vector
    var n = [0,0,0];
    Melown.vec3.normalize(v, n);
    n = [-n[1],n[0],0];

    n[0] *= size_;
    n[1] *= size_;
    n[2] *= size_;

    size_ *= 0.5;

    var index_ = this.vertices_.length;
    var index2_ = this.normals_.length;

    //first polygon
    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index2_] = p2[0];
    this.normals_[index2_+1] = p2[1];
    this.normals_[index2_+2] = p2[2];
    this.normals_[index2_+3] = size_;

    this.vertices_[index_+3] = p1[0];
    this.vertices_[index_+4] = p1[1];
    this.vertices_[index_+5] = p1[2];
    this.normals_[index2_+4] = p2[0];
    this.normals_[index2_+5] = p2[1];
    this.normals_[index2_+6] = p2[2];
    this.normals_[index2_+7] = -size_;

    this.vertices_[index_+6] = p2[0];
    this.vertices_[index_+7] = p2[1];
    this.vertices_[index_+8] = p2[2];
    this.normals_[index2_+8] = p1[0];
    this.normals_[index2_+9] = p1[1];
    this.normals_[index2_+10] = p1[2];
    this.normals_[index2_+11] = size_;

    //next polygon
    this.vertices_[index_+9] = p1[0];
    this.vertices_[index_+10] = p1[1];
    this.vertices_[index_+11] = p1[2];
    this.normals_[index2_+12] = p2[0];
    this.normals_[index2_+13] = p2[1];
    this.normals_[index2_+14] = p2[2];
    this.normals_[index2_+15] = size_;

    this.vertices_[index_+12] = p2[0];
    this.vertices_[index_+13] = p2[1];
    this.vertices_[index_+14] = p2[2];
    this.normals_[index2_+16] = p1[0];
    this.normals_[index2_+17] = p1[1];
    this.normals_[index2_+18] = p1[2];
    this.normals_[index2_+19] = size_;

    this.vertices_[index_+15] = p2[0];
    this.vertices_[index_+16] = p2[1];
    this.vertices_[index_+17] = p2[2];
    this.normals_[index2_+20] = p1[0];
    this.normals_[index2_+21] = p1[1];
    this.normals_[index2_+22] = p1[2];
    this.normals_[index2_+23] = -size_;

    this.polygons_ += 2;
};

//add circle to vertices buffer
Melown.GpuPixelLine.prototype.addCircle = function(p1, size_, sides_)
{
    //return;

    size_ *= 0.5;

    var i;

    if (this.circleBuffer_ == null) {

        this.circleBuffer_ = [];
        var buffer_ = this.circleBuffer_;

        var angle_ = 0, step_ = (2.0*Math.PI) / sides_;

        for (i = 0; i < sides_; i++) {
            buffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
            angle_ += step_;
        }

        buffer_[sides_] = [0, 1.0];
    }

    var buffer_ = this.circleBuffer_;
    var index_ = this.vertices_.length;
    var index2_ = this.normals_.length;

    for (i = 0; i < sides_; i++) {

        this.vertices_[index_] = p1[0];
        this.vertices_[index_+1] = p1[1];
        this.vertices_[index_+2] = p1[2];
        this.normals_[index2_] = 0;
        this.normals_[index2_+1] = 0;
        this.normals_[index2_+2] = 0;
        this.normals_[index2_+3] = 0;

        this.vertices_[index_+3] = p1[0];
        this.vertices_[index_+4] = p1[1];
        this.vertices_[index_+5] = p1[2];
        this.normals_[index2_+4] = buffer_[i][0] * size_;
        this.normals_[index2_+5] = buffer_[i][1] * size_;
        this.normals_[index2_+6] = 0;
        this.normals_[index2_+7] = 0;

        this.vertices_[index_+6] = p1[0];
        this.vertices_[index_+7] = p1[1];
        this.vertices_[index_+8] = p1[2];
        this.normals_[index2_+8] = buffer_[i+1][0] * size_;
        this.normals_[index2_+9] = buffer_[i+1][1] * size_;
        this.normals_[index2_+10] = 0;
        this.normals_[index2_+11] = 0;

        index_ += 9;
        index2_ += 12;
    }

    this.polygons_ += sides_;
};

//compile content of vertices buffer into gpu buffer
Melown.GpuPixelLine.prototype.compile = function()
{
    var gl_ = this.gl_;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    //create normal buffer
    this.vertexNormalBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.normals_), gl_.STATIC_DRAW);
    this.vertexNormalBuffer_.itemSize = 4;
    this.vertexNormalBuffer_.numItems = this.normals_.length / 4;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4 * 2;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxMesh_[0][0] ++;
        this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }
*/

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuPixelLine.prototype.draw = function(program_, attrPosition_, attrNormal_, attrTexCoord_, attrBarycenteric_)
{
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexPositionBuffer_ == null || this.vertexNormalBuffer_ == null){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var vertexNormalAttribute_ = program_.getAttribute(attrNormal_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind vetex normals
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);
    gl_.vertexAttribPointer(vertexNormalAttribute_, this.vertexNormalBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuPixelLine.prototype.size = function(){ return this.size_; };

Melown.GpuPixelLine.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuPixelLine.prototype.getPolygons = function(){ return this.polygons_; };

