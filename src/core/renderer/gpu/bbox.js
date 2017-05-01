

var GpuBBox = function(gpu, free) {
    this.gl = gpu.gl;

    var gl = this.gl;

    if (gl == null)
        return;

    this.free = free;
    this.vertexPositionBuffer = null;

    //create vertex buffer
    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);

    var vertices;

    if (free) {
        vertices = [0,0,0, 0,0,1,
            0,0,1, 0,0,2,
            0,0,2, 0,0,3,
            0,0,3, 0,0,0,

            0,0,4, 0,0,5,
            0,0,5, 0,0,6,
            0,0,6, 0,0,7,
            0,0,7, 0,0,4,

            0,0,0, 0,0,4,
            0,0,1, 0,0,5,
            0,0,2, 0,0,6,
            0,0,3, 0,0,7 ];
    } else {
        vertices = [0,0,0, 1,0,0,
            1,0,0, 1,1,0,
            1,1,0, 0,1,0,
            0,1,0, 0,0,0,

            0,0,1, 1,0,1,
            1,0,1, 1,1,1,
            1,1,1, 0,1,1,
            0,1,1, 0,0,1,

            0,0,0, 0,0,1,
            1,0,0, 1,0,1,
            1,1,0, 1,1,1,
            0,1,0, 0,1,1 ];
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = vertices.length / 3;

    this.size = 4 + 4 * 8;
    this.lines = this.vertexPositionBuffer.numItems / 3;
};

//destructor
GpuBBox.prototype.kill = function() {
    this.gl.deleteBuffer(this.vertexPositionBuffer);
};

// Draws the mesh, given the two vertex shader attributes locations.
GpuBBox.prototype.draw = function(program, attrPosition) {
    var gl = this.gl;
    if (gl == null)
        return;

    var vertexPositionAttribute = program.getAttribute(attrPosition);

    //bind vetex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //draw lines
    gl.drawArrays(gl.LINES, 0, this.vertexPositionBuffer.numItems);

};


export default GpuBBox;

