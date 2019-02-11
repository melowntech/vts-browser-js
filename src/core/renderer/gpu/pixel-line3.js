
var GpuPixelLine3 = function(gpu, core, lines, maxLines, joins, joinSides) {
    this.bbox = null;
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.core = core;

    var gl = this.gl;

    if (gl == null){
        return;
    }

    this.vertices = [];
    this.normals = [];
    this.vertexBuffer = null;
    this.lines = lines;
    this.joins = joins;
    this.joinSides = joinSides;
    this.maxLines = maxLines;

    this.init();
};

//destructor
GpuPixelLine3.prototype.kill = function() {
    this.gl.deleteBuffer(this.vertexBuffer);
};


GpuPixelLine3.prototype.init = function() {
    var i;
    if (this.lines) {
        if (this.joins) {
            this.addCircle(0, this.joinSides);
        }

        for (i = 0; i < this.maxLines; i++) {
            this.addLine(i, i+1);

            if (this.joins) {
                this.addCircle(i+1, this.joinSides);
            }
        }
    } else if (this.joins) {
        for (i = 0; i <= this.maxLines; i++) {
            this.addCircle(i, this.joinSides);
        }
    }

    this.compile();
};

//add line to vertices buffer
GpuPixelLine3.prototype.addLine = function(i1, i2) {
    var index = this.vertices.length;

    //first polygon
    this.vertices[index] = i1;
    this.vertices[index+1] = i2;
    this.vertices[index+2] = 1;

    this.vertices[index+3] = i1;
    this.vertices[index+4] = i2;
    this.vertices[index+5] = -1;

    this.vertices[index+6] = i2;
    this.vertices[index+7] = i1;
    this.vertices[index+8] = 1;

    //next polygon
    this.vertices[index+9] = i1;
    this.vertices[index+10] = i2;
    this.vertices[index+11] = 1;

    this.vertices[index+12] = i2;
    this.vertices[index+13] = i1;
    this.vertices[index+14] = 1;

    this.vertices[index+15] = i2;
    this.vertices[index+16] = i1;
    this.vertices[index+17] = -1;

    this.polygons += 2;
};

//add circle to vertices buffer
GpuPixelLine3.prototype.addCircle = function(i1, sides) {
    var index = this.vertices.length;
    var step = (2.0*Math.PI) / sides;

    for (var i = 0; i < sides; i++) {
        this.vertices[index] = i1;
        this.vertices[index+1] = -1;
        this.vertices[index+2] = 0;

        this.vertices[index+3] = i1;
        this.vertices[index+4] = -2;
        this.vertices[index+5] = step * i;

        this.vertices[index+6] = i1;
        this.vertices[index+7] = -2;
        this.vertices[index+8] = step * (i+1);

        index += 9;
    }

    this.polygons += sides;
};

//compile content of vertices buffer into gpu buffer
GpuPixelLine3.prototype.compile = function() {
    var gl = this.gl;

    //create vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = 3;
    this.vertexBuffer.numItems = this.vertices.length / 3;

    this.size = this.vertexBuffer.numItems * 3 * 4 * 2;
    this.polygons = this.vertexBuffer.numItems / 3;
};

// Draws the mesh, given the two vertex shader attributes locations.
GpuPixelLine3.prototype.draw = function(program, attrPosition, points) {
    var gl = this.gl;
    if (gl == null || this.vertexBuffer == null || points > this.maxLines){
        return;
    }

    var vertexPositionAttribute = program.getAttribute(attrPosition);

    //bind vetex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    var size = 0;

    if (this.lines) {
        size += ((points-1) * 3 * 2);
    }

    if (this.joins) {
        size += points * (this.joinSides * 3);
    }

    //draw polygons
    gl.drawArrays(gl.TRIANGLES, 0, size);
};

// Returns GPU RAM used, in bytes.
GpuPixelLine3.prototype.getSize = function(){ return this.size; };


GpuPixelLine3.prototype.getBbox = function(){ return this.bbox; };


GpuPixelLine3.prototype.getPolygons = function(){ return this.polygons; };


export default GpuPixelLine3;