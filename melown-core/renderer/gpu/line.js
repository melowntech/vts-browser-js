//! Holds a GPU vertex buffer.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

//3D Line, line width is defined in meters

/**
 * @constructor
 */
Melown.GpuLine = function(gpu_, browser_)
{
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.browser_ = browser_;

    var timer_ = performance.now();

    var gl_ = this.gl_;

    if (gl_ == null)
        return;

    this.vertices_ = [];
    this.vertexPositionBuffer_ = null;

};

//destructor
Melown.GpuLine.prototype.kill = function()
{
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
/*
    if (this.browser_.renderer_ != null) {
        this.browser_.renderer_.statsFluxMesh_[1][0] ++;
        this.browser_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add line to vertices buffer
Melown.GpuLine.prototype.addLine = function(p1, p2, size_)
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

    var index_ = this.vertices_.length;

    //first polygon
    this.vertices_[index_] = p1[0] + n[0];
    this.vertices_[index_+1] = p1[1] + n[1];
    this.vertices_[index_+2] = p1[2] + n[2];

    this.vertices_[index_+3] = p1[0] - n[0];
    this.vertices_[index_+4] = p1[1] - n[1];
    this.vertices_[index_+5] = p1[2] - n[2];

    this.vertices_[index_+6] = p2[0] + n[0];
    this.vertices_[index_+7] = p2[1] + n[1];
    this.vertices_[index_+8] = p2[2] + n[2];


    //next polygon
    this.vertices_[index_+9] = p1[0] - n[0];
    this.vertices_[index_+10] = p1[1] - n[1];
    this.vertices_[index_+11] = p1[2] - n[2];

    this.vertices_[index_+12] = p2[0] - n[0];
    this.vertices_[index_+13] = p2[1] - n[1];
    this.vertices_[index_+14] = p2[2] - n[2];

    this.vertices_[index_+15] = p2[0] + n[0];
    this.vertices_[index_+16] = p2[1] + n[1];
    this.vertices_[index_+17] = p2[2] + n[2];

    this.polygons_ += 2;
};

//add circle to vertices buffer
Melown.GpuLine.prototype.addCircle = function(p1, size_, sides_)
{
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

    for (i = 0; i < sides_; i++) {

        this.vertices_[index_] = p1[0];
        this.vertices_[index_+1] = p1[1];
        this.vertices_[index_+2] = p1[2];

        this.vertices_[index_+3] = p1[0] + buffer_[i][0] * size_;
        this.vertices_[index_+4] = p1[1] + buffer_[i][1] * size_;
        this.vertices_[index_+5] = p1[2];

        this.vertices_[index_+6] = p1[0] + buffer_[i+1][0] * size_;
        this.vertices_[index_+7] = p1[1] + buffer_[i+1][1] * size_;
        this.vertices_[index_+8] = p1[2];

        index_ += 9;
    }

    this.polygons_ += sides_;
};

//compile content of vertices buffer into gpu buffer
Melown.GpuLine.prototype.compile = function()
{
    var gl_ = this.gl_;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

/*
    if (this.browser_.renderer_ != null) {
        this.browser_.renderer_.statsCreateGpuMeshTime_ += performance.now() - timer_;
        this.browser_.renderer_.statsFluxMesh_[0][0] ++;
        this.browser_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }
*/

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuLine.prototype.draw = function(program_, attrPosition_, attrTexCoord_, attrBarycenteric_)
{
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexPositionBuffer_ == null){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuLine.prototype.size = function(){ return this.size_; };

Melown.GpuLine.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuLine.prototype.getPolygons = function(){ return this.polygons_; };

