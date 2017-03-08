
// !!!!   NOT USED - NOT WORKING - NOT NEEDED - NOT COMPLETE   !!!!!!!!!!!!

//3D Line, line width is defined in pixels
//with sharp joints
//not used

/**
 * @constructor
 */
Melown.GpuPixelLine2 = function(gpu_, core_)
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
    this.normals2_ = [];
    this.normals3_ = [];
    this.vertexPositionBuffer_ = null;
    this.vertexNormalBuffer_ = null;
    this.vertexNormal2Buffer_ = null;
    this.vertexNormal3Buffer_ = null;
};

//destructor
Melown.GpuPixelLine2.prototype.kill = function()
{
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexNormalBuffer_);
    this.gl_.deleteBuffer(this.vertexNormal2Buffer_);
    this.gl_.deleteBuffer(this.vertexNormal3Buffer_);
/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add line to vertices buffer
Melown.GpuPixelLine2.prototype.addLine = function(p1, p2, p3, p4, size_)
{
    size_ *= 0.5;

    var index_ = this.vertices_.length;
    var index2_ = this.normals_.length;
    var index3_ = this.normals2_.length;
    var index4_ = this.normals3_.length;

    //first polygon
    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index2_] = p2[0];
    this.normals_[index2_+1] = p2[1];
    this.normals_[index2_+2] = p2[2];
    this.normals_[index2_+3] = size_;
    this.normals2_[index3_] = p4[0];
    this.normals2_[index3_+1] = p4[1];
    this.normals2_[index3_+2] = p4[2];
    this.normals2_[index3_+3] = 0;
    this.normals3_[index4_] = 0;
    this.normals3_[index4_+1] = 0;
    this.normals3_[index4_+2] = 0;
    this.normals3_[index4_+3] = 0;

    this.vertices_[index_+3] = p1[0];
    this.vertices_[index_+4] = p1[1];
    this.vertices_[index_+5] = p1[2];
    this.normals_[index2_+4] = p2[0];
    this.normals_[index2_+5] = p2[1];
    this.normals_[index2_+6] = p2[2];
    this.normals_[index2_+7] = -size_;
    this.normals2_[index3_+4] = p4[0];
    this.normals2_[index3_+5] = p4[1];
    this.normals2_[index3_+6] = p4[2];
    this.normals2_[index3_+7] = 0;
    this.normals3_[index4_+4] = 0;
    this.normals3_[index4_+5] = 0;
    this.normals3_[index4_+6] = 0;
    this.normals3_[index4_+7] = 0;

    this.vertices_[index_+6] = p2[0];
    this.vertices_[index_+7] = p2[1];
    this.vertices_[index_+8] = p2[2];
    this.normals_[index2_+8] = p3[0];
    this.normals_[index2_+9] = p3[1];
    this.normals_[index2_+10] = p3[2];
    this.normals_[index2_+11] = size_;
    this.normals2_[index3_+8] = p1[0];
    this.normals2_[index3_+9] = p1[1];
    this.normals2_[index3_+10] = p1[2];
    this.normals2_[index3_+11] = 1;
    this.normals3_[index4_+8] = 0;
    this.normals3_[index4_+9] = 0;
    this.normals3_[index4_+10] = 0;
    this.normals3_[index4_+11] = 1;

    //next polygon
    this.vertices_[index_+9] = p1[0];
    this.vertices_[index_+10] = p1[1];
    this.vertices_[index_+11] = p1[2];
    this.normals_[index2_+12] = p2[0];
    this.normals_[index2_+13] = p2[1];
    this.normals_[index2_+14] = p2[2];
    this.normals_[index2_+15] = -size_;
    this.normals2_[index3_+12] = p4[0];
    this.normals2_[index3_+13] = p4[1];
    this.normals2_[index3_+14] = p4[2];
    this.normals2_[index3_+15] = 0;
    this.normals3_[index4_+12] = 0;
    this.normals3_[index4_+13] = 0;
    this.normals3_[index4_+14] = 0;
    this.normals3_[index4_+15] = 0;

    this.vertices_[index_+12] = p2[0];
    this.vertices_[index_+13] = p2[1];
    this.vertices_[index_+14] = p2[2];
    this.normals_[index2_+16] = p3[0];
    this.normals_[index2_+17] = p3[1];
    this.normals_[index2_+18] = p3[2];
    this.normals_[index2_+19] = -size_;
    this.normals2_[index3_+16] = p1[0];
    this.normals2_[index3_+17] = p1[1];
    this.normals2_[index3_+18] = p1[2];
    this.normals2_[index3_+19] = 1;
    this.normals3_[index4_+16] = 0;
    this.normals3_[index4_+17] = 0;
    this.normals3_[index4_+18] = 0;
    this.normals3_[index4_+19] = 1;

    this.vertices_[index_+15] = p2[0];
    this.vertices_[index_+16] = p2[1];
    this.vertices_[index_+17] = p2[2];
    this.normals_[index2_+20] = p3[0];
    this.normals_[index2_+21] = p3[1];
    this.normals_[index2_+22] = p3[2];
    this.normals_[index2_+23] = size_;
    this.normals2_[index3_+20] = p1[0];
    this.normals2_[index3_+21] = p1[1];
    this.normals2_[index3_+22] = p1[2];
    this.normals2_[index3_+23] = 1;
    this.normals3_[index4_+20] = 0;
    this.normals3_[index4_+21] = 0;
    this.normals3_[index4_+22] = 0;
    this.normals3_[index4_+23] = 1;

    this.polygons_ += 2;
};

//add circle to vertices buffer
Melown.GpuPixelLine2.prototype.addCircle = function(p1, size_, sides_)
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
Melown.GpuPixelLine2.prototype.compile = function()
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

    //create normal2 buffer
    this.vertexNormal2Buffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormal2Buffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.normals2_), gl_.STATIC_DRAW);
    this.vertexNormal2Buffer_.itemSize = 4;
    this.vertexNormal2Buffer_.numItems = this.normals2_.length / 4;

    //create normal3 buffer
    this.vertexNormal3Buffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormal3Buffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.normals3_), gl_.STATIC_DRAW);
    this.vertexNormal3Buffer_.itemSize = 4;
    this.vertexNormal3Buffer_.numItems = this.normals3_.length / 4;


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
Melown.GpuPixelLine2.prototype.draw = function(program_, attrPosition_, attrNormal_, attrNormal2_, attrNormal3_, attrTexCoord_, attrBarycenteric_)
{
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexPositionBuffer_ == null || this.vertexNormalBuffer_ == null){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var vertexNormalAttribute_ = program_.getAttribute(attrNormal_);
    var vertexNormal2Attribute_ = program_.getAttribute(attrNormal2_);
    var vertexNormal3Attribute_ = program_.getAttribute(attrNormal3_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind vetex normals
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormalBuffer_);
    gl_.vertexAttribPointer(vertexNormalAttribute_, this.vertexNormalBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind vetex normals2
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormal2Buffer_);
    gl_.vertexAttribPointer(vertexNormal2Attribute_, this.vertexNormal2Buffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind vetex normals3
    //gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexNormal3Buffer_);
    //gl_.vertexAttribPointer(vertexNormal3Attribute_, this.vertexNormal3Buffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuPixelLine2.prototype.size = function(){ return this.size_; };

Melown.GpuPixelLine2.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuPixelLine2.prototype.getPolygons = function(){ return this.polygons_; };

