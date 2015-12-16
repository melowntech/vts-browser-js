
/**
 * @constructor
 */
Melown.GpuPixelLine3 = function(gpu_, core_, lines_, maxLines_, joins_, joinSides_) {
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
    this.vertexBuffer_ = null;
    this.lines_ = lines_;
    this.joins_ = joins_;
    this.joinSides_ = joinSides_;
    this.maxLines_ = maxLines_;

    this.init();
};

//destructor
Melown.GpuPixelLine3.prototype.kill = function() {
    this.gl_.deleteBuffer(this.vertexBuffer_);
};

Melown.GpuPixelLine3.prototype.init = function() {
    if (this.lines_) {
    	if (this.joins_) {
            this.addCircle(0, this.joinSides_);
    	}
    	
        for (var i = 0; i < this.maxLines_; i++) {
            this.addLine(i, i+1);

			if (this.joins_) {
		        this.addCircle(i+1, this.joinSides_);
			}
        }
    } else if (this.joins_) {
        for (var i = 0; i <= this.maxLines_; i++) {
            this.addCircle(i, this.joinSides_);
        }
    }

    this.compile();
};

//add line to vertices buffer
Melown.GpuPixelLine3.prototype.addLine = function(i1, i2) {
    var index_ = this.vertices_.length;

    //first polygon
    this.vertices_[index_] = i1;
    this.vertices_[index_+1] = i2;
    this.vertices_[index_+2] = 1;

    this.vertices_[index_+3] = i1;
    this.vertices_[index_+4] = i2;
    this.vertices_[index_+5] = -1;

    this.vertices_[index_+6] = i2;
    this.vertices_[index_+7] = i1;
    this.vertices_[index_+8] = 1;

    //next polygon
    this.vertices_[index_+9] = i1;
    this.vertices_[index_+10] = i2;
    this.vertices_[index_+11] = 1;

    this.vertices_[index_+12] = i2;
    this.vertices_[index_+13] = i1;
    this.vertices_[index_+14] = 1;

    this.vertices_[index_+15] = i2;
    this.vertices_[index_+16] = i1;
    this.vertices_[index_+17] = -1;

    this.polygons_ += 2;
};

//add circle to vertices buffer
Melown.GpuPixelLine3.prototype.addCircle = function(i1, sides_) {
    var index_ = this.vertices_.length;
    var step_ = (2.0*Math.PI) / sides_;

    for (i = 0; i < sides_; i++) {
        this.vertices_[index_] = i1;
        this.vertices_[index_+1] = -1;
        this.vertices_[index_+2] = 0;

        this.vertices_[index_+3] = i1;
        this.vertices_[index_+4] = -2;
        this.vertices_[index_+5] = step_ * i;

        this.vertices_[index_+6] = i1;
        this.vertices_[index_+7] = -2;
        this.vertices_[index_+8] = step_ * (i+1);

        index_ += 9;
    }

    this.polygons_ += sides_;
};

//compile content of vertices buffer into gpu buffer
Melown.GpuPixelLine3.prototype.compile = function() {
    var gl_ = this.gl_;

    //create vertex buffer
    this.vertexBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexBuffer_.itemSize = 3;
    this.vertexBuffer_.numItems = this.vertices_.length / 3;

    this.size_ = this.vertexBuffer_.numItems * 3 * 4 * 2;
    this.polygons_ = this.vertexBuffer_.numItems / 3;
};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuPixelLine3.prototype.draw = function(program_, attrPosition_, points_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.vertexBuffer_ == null || points_ > this.maxLines_){
        return;
    }

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    var size_ = 0;

    if (this.lines_) {
        size_ += ((points_-1) * 3 * 2);
    }

    if (this.joins_) {
        size_ += points_ * (this.joinSides_ * 3);
    }

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, size_);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuPixelLine3.prototype.size = function(){ return this.size_; };

Melown.GpuPixelLine3.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuPixelLine3.prototype.getPolygons = function(){ return this.polygons_; };

