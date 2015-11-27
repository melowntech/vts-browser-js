
/**
 * @constructor
 */
Melown.GpuPolygon = function(gpu_, core_) {
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
Melown.GpuPolygon.prototype.kill = function() {
    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexNormalBuffer_);
/*
    if (this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
*/
};

//add face
Melown.GpuPolygon.prototype.addFace = function(p1, p2, p3, n) {
    var index_ = this.vertices_.length;

    if (n == null) {
        var n = [0,0,0];
        Melown.vec3.cross([p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]], [p3[0]-p1[0], p3[1]-p1[1], p3[2]-p1[2]], n);
    }

    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index_] = n[0];
    this.normals_[index_+1] = n[1];
    this.normals_[index_+2] = n[2];

    this.vertices_[index_+3] = p2[0];
    this.vertices_[index_+4] = p2[1];
    this.vertices_[index_+5] = p2[2];
    this.normals_[index_+3] = n[0];
    this.normals_[index_+4] = n[1];
    this.normals_[index_+5] = n[2];

    this.vertices_[index_+6] = p3[0];
    this.vertices_[index_+7] = p3[1];
    this.vertices_[index_+8] = p3[2];
    this.normals_[index_+6] = n[0];
    this.normals_[index_+7] = n[1];
    this.normals_[index_+8] = n[2];

    this.polygons_++;
};

//add quad
Melown.GpuPolygon.prototype.addQuad = function(p1, p2, p3, p4, n) {
    var index_ = this.vertices_.length;

    if (n == null) {
        var n = [0,0,0];
        Melown.vec3.cross([p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2]], [p3[0]-p1[0], p3[1]-p1[1], p3[2]-p1[2]], n);
        Melown.vec3.normalize(n);
    }

    //first polygon
    this.vertices_[index_] = p1[0];
    this.vertices_[index_+1] = p1[1];
    this.vertices_[index_+2] = p1[2];
    this.normals_[index_] = n[0];
    this.normals_[index_+1] = n[1];
    this.normals_[index_+2] = n[2];

    this.vertices_[index_+3] = p2[0];
    this.vertices_[index_+4] = p2[1];
    this.vertices_[index_+5] = p2[2];
    this.normals_[index_+3] = n[0];
    this.normals_[index_+4] = n[1];
    this.normals_[index_+5] = n[2];

    this.vertices_[index_+6] = p3[0];
    this.vertices_[index_+7] = p3[1];
    this.vertices_[index_+8] = p3[2];
    this.normals_[index_+6] = n[0];
    this.normals_[index_+7] = n[1];
    this.normals_[index_+8] = n[2];


    //next polygon
    this.vertices_[index_+9] = p1[0];
    this.vertices_[index_+10] = p1[1];
    this.vertices_[index_+11] = p1[2];
    this.normals_[index_+9] = n[0];
    this.normals_[index_+10] = n[1];
    this.normals_[index_+11] = n[2];

    this.vertices_[index_+12] = p3[0];
    this.vertices_[index_+13] = p3[1];
    this.vertices_[index_+14] = p3[2];
    this.normals_[index_+12] = n[0];
    this.normals_[index_+13] = n[1];
    this.normals_[index_+14] = n[2];

    this.vertices_[index_+15] = p4[0];
    this.vertices_[index_+16] = p4[1];
    this.vertices_[index_+17] = p4[2];
    this.normals_[index_+15] = n[0];
    this.normals_[index_+16] = n[1];
    this.normals_[index_+17] = n[2];

    this.polygons_ += 2;
};

Melown.GpuPolygon.prototype.addPolygon = function(outerRing_, innerRings_) {
    var contour_ = [];

    for (var i = 0, li = outerRing_.length; i < li; i++) {
        contour_.push({x: outerRing_[i][0], y: outerRing_[i][1]});
    }

    var swctx_ = new poly2tri.SweepContext(contour_);


    for (var j = 0, lj = outerRing_.length; j < lj; j++) {
        var hole_ = [];

        for (var i = 0, li = outerRing_.length; i < li; i++) {
            contour_.push({x: innerRings_[j][i][0], y: innerRings_[j][i][1]});
        }

        swctx_.addHole(hole_);
    }

    swctx_.triangulate();
    var triangles_ = swctx_.getTriangles();

    var height_ = 0;

    for (var i = 0, li = triangles_.length; i < li; i++) {
        var points_ = triangles_[i].getPoints();
        this.addFace([points_[0].x, points_[0].y, height_], [points_[1].x, points_[1].y, height_], [points_[2].x, points_[2].y, height_]);
    }
};


Melown.GpuPolygon.prototype.addWall = function(points_, points2_, closed_) {
    for (var i = 0, li = points_.length - 1; i < li; i++) {
        this.addQuad(points_[i], points_[i+1], points2_[i+1], points2_[i]);
    }

    if (closed_ && points_.length > 2) {
        this.addQuad(points_[points_.length-1], points_[0], points2_[0], points2_[points_.length-1]);
    }
};


//compile content of vertices buffer into gpu buffer
Melown.GpuPolygon.prototype.compile = function() {
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
    this.vertexNormalBuffer_.itemSize = 3;
    this.vertexNormalBuffer_.numItems = this.normals_.length / 3;

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
Melown.GpuPolygon.prototype.draw = function(program_, attrPosition_, attrNormal_, attrTexCoord_, attrBarycenteric_) {
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
Melown.GpuPolygon.prototype.size = function(){ return this.size_; };

Melown.GpuPolygon.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuPolygon.prototype.getPolygons = function(){ return this.polygons_; };

