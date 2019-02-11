
import {vec3 as vec3_} from '../utils/matrix';

//get rid of compiler mess
var vec3 = vec3_;


var GpuLine = function(gpu, core) {
    this.bbox = null;
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.core = core;

    var timer = performance.now();
    var gl = this.gl;

    if (gl == null) {
        return;
    }

    this.vertices = [];
    this.vertexPositionBuffer = null;
};

//destructor
GpuLine.prototype.kill = function() {
    this.gl.deleteBuffer(this.vertexPositionBuffer);
};

//add line to vertices buffer
GpuLine.prototype.addLine = function(p1, p2, size) {
    //get direction vector
    var v = [p2[0] - p1[0], p2[1] - p1[1], 0];

    //normalize vector
    var n = [0,0,0];
    vec3.normalize(v, n);
    n = [-n[1],n[0],0];

    n[0] *= size;
    n[1] *= size;
    n[2] *= size;

    var index = this.vertices.length;

    //first polygon
    this.vertices[index] = p1[0] + n[0];
    this.vertices[index+1] = p1[1] + n[1];
    this.vertices[index+2] = p1[2] + n[2];

    this.vertices[index+3] = p1[0] - n[0];
    this.vertices[index+4] = p1[1] - n[1];
    this.vertices[index+5] = p1[2] - n[2];

    this.vertices[index+6] = p2[0] + n[0];
    this.vertices[index+7] = p2[1] + n[1];
    this.vertices[index+8] = p2[2] + n[2];


    //next polygon
    this.vertices[index+9] = p1[0] - n[0];
    this.vertices[index+10] = p1[1] - n[1];
    this.vertices[index+11] = p1[2] - n[2];

    this.vertices[index+12] = p2[0] - n[0];
    this.vertices[index+13] = p2[1] - n[1];
    this.vertices[index+14] = p2[2] - n[2];

    this.vertices[index+15] = p2[0] + n[0];
    this.vertices[index+16] = p2[1] + n[1];
    this.vertices[index+17] = p2[2] + n[2];

    this.polygons += 2;
};

//add circle to vertices buffer
GpuLine.prototype.addCircle = function(p1, size, sides) {
    var i;

    if (this.circleBuffer == null) {

        this.circleBuffer = [];
        var buffer = this.circleBuffer;

        var angle = 0, step = (2.0*Math.PI) / sides;

        for (i = 0; i < sides; i++) {
            buffer[i] = [-Math.sin(angle), Math.cos(angle)];
            angle += step;
        }

        buffer[sides] = [0, 1.0];
    }

    var buffer = this.circleBuffer;
    var index = this.vertices.length;

    for (i = 0; i < sides; i++) {

        this.vertices[index] = p1[0];
        this.vertices[index+1] = p1[1];
        this.vertices[index+2] = p1[2];

        this.vertices[index+3] = p1[0] + buffer[i][0] * size;
        this.vertices[index+4] = p1[1] + buffer[i][1] * size;
        this.vertices[index+5] = p1[2];

        this.vertices[index+6] = p1[0] + buffer[i+1][0] * size;
        this.vertices[index+7] = p1[1] + buffer[i+1][1] * size;
        this.vertices[index+8] = p1[2];

        index += 9;
    }

    this.polygons += sides;
};

//compile content of vertices buffer into gpu buffer
GpuLine.prototype.compile = function() {
    var gl = this.gl;

    //create vertex buffer
    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = this.vertices.length / 3;

    this.size = this.vertexPositionBuffer.numItems * 3 * 4;
    this.polygons = this.vertexPositionBuffer.numItems / 3;
};

// Draws the mesh, given the two vertex shader attributes locations.
GpuLine.prototype.draw = function(program, attrPosition, attrTexCoord, attrBarycenteric) {
    var gl = this.gl;
    if (gl == null || this.vertexPositionBuffer == null){
        return;
    }

    var vertexPositionAttribute = program.getAttribute(attrPosition);

    //bind vetex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //draw polygons
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositionBuffer.numItems);
};

// Returns GPU RAM used, in bytes.
GpuLine.prototype.getSize = function(){ return this.size; };


GpuLine.prototype.getBBox = function(){ return this.bbox; };


GpuLine.prototype.getPolygons = function(){ return this.polygons; };


export default GpuLine;
