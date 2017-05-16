
import {vec3 as vec3_} from '../utils/matrix';

//get rid of compiler mess
var vec3 = vec3_;


var GpuText = function(gpu, core, font, withNormals) {
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.core = core;
    this.font = font;
    this.withNormals = withNormals;

    this.vertices = [];
    this.tvertices = [];

    this.vertexPositionBuffer = null;
    this.vertexTextureCoordBuffer = null;

    this.size = 0;
    this.polygons = 0;
};

//destructor
GpuText.prototype.kill = function() {
    if (this.vertexPositionBuffer == null) {
        return;
    }

    this.gl.deleteBuffer(this.vertexPositionBuffer);
    this.gl.deleteBuffer(this.vertexTextureCoordBuffer);

    if (this.core != null && this.core.renderer != null) {
        this.core.renderer.statsFluxMesh[1][0] ++;
        this.core.renderer.statsFluxMesh[1][1] += this.size;
    }
};


GpuText.prototype.addChar = function(pos, dir, verticalShift, char, factor, index, index2, textVector) {
    //normal to dir
    var n = [-dir[1],dir[0],0];

    var p1 = [pos[0], pos[1], pos[2]];
    var p2 = [p1[0], p1[1], p1[2]];

    var chars = this.font.chars;

    var fc = chars[char];
    var l = 0;
    var nx = textVector[0];
    var ny = textVector[1];

    if (char == 9 || char == 32) {  //tab or space
        fc = chars[32]; //space

        if (fc != null) {
            p1[0] += dir[0] * (fc.step) * factor;
            p1[1] += dir[1] * (fc.step) * factor;
            l = fc.lx * factor;
        }
    } else {
        if (fc != null) {
            var factorX = fc.lx * factor;
            var factorY = fc.ly * factor;

            var n2 = [n[0] * verticalShift, n[1] * verticalShift, n[2] * verticalShift];
            var n3 = [n2[0] + n[0] * factorY, n2[1] + n[1] * factorY, n2[2] + n[2] * factorY];

            p2[0] = p1[0] + dir[0] * factorX;
            p2[1] = p1[1] + dir[1] * factorX;
            p2[2] = p1[2] + dir[2] * factorX;

            //first polygon
            this.vertices[index] = p1[0] - n2[0];
            this.vertices[index+1] = p1[1] - n2[1];
            this.vertices[index+2] = p1[2] - n2[2];

            this.tvertices[index2] = fc.u1;
            this.tvertices[index2+1] = fc.v1;
            this.tvertices[index2+2] = nx;
            this.tvertices[index2+3] = ny;

            this.vertices[index+3] = p1[0] - n3[0];
            this.vertices[index+4] = p1[1] - n3[1];
            this.vertices[index+5] = p1[2] - n3[2];

            this.tvertices[index2+4] = fc.u1;
            this.tvertices[index2+5] = fc.v2;
            this.tvertices[index2+6] = nx;
            this.tvertices[index2+7] = ny;

            this.vertices[index+6] = p2[0] - n2[0];
            this.vertices[index+7] = p2[1] - n2[1];
            this.vertices[index+8] = p2[2] - n2[2];

            this.tvertices[index2+8] = fc.u2;
            this.tvertices[index2+9] = fc.v1;
            this.tvertices[index2+10] = nx;
            this.tvertices[index2+11] = ny;


            //next polygon
            this.vertices[index+9] = p1[0] - n3[0];
            this.vertices[index+10] = p1[1] - n3[1];
            this.vertices[index+11] = p1[2] - n3[2];

            this.tvertices[index2+12] = fc.u1;
            this.tvertices[index2+13] = fc.v2;
            this.tvertices[index2+14] = nx;
            this.tvertices[index2+15] = ny;

            this.vertices[index+12] = p2[0] - n3[0];
            this.vertices[index+13] = p2[1] - n3[1];
            this.vertices[index+14] = p2[2] - n3[2];

            this.tvertices[index2+16] = fc.u2;
            this.tvertices[index2+17] = fc.v2;
            this.tvertices[index2+18] = nx;
            this.tvertices[index2+19] = ny;

            this.vertices[index+15] = p2[0] - n2[0];
            this.vertices[index+16] = p2[1] - n2[1];
            this.vertices[index+17] = p2[2] - n2[2];

            this.tvertices[index2+20] = fc.u2;
            this.tvertices[index2+21] = fc.v1;
            this.tvertices[index2+22] = nx;
            this.tvertices[index2+23] = ny;

            index += 18;
            index2 += 24;
            this.polygons += 2;

            p1[0] = p1[0] + dir[0] * fc.step * factor;
            p1[1] = p1[1] + dir[1] * fc.step * factor;
            l = fc.lx * factor;
        } else {
            //unknown char
        }
    }

    return [p1, index, index2, l];
};


GpuText.prototype.addText = function(pos, dir, text, size) {
    var textVector = [0,1];
    var index = this.vertices.length;
    var index2 = this.tvertices.length;

    var factor = size / this.font.size;
    var newLineSpace = this.font.space * factor;

    var s = [pos[0], pos[1], pos[2]];
    var p1 = [pos[0], pos[1], pos[2]];

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10) { //new line
            s[0] += -dir[1] * newLineSpace;
            s[1] += dir[0] * newLineSpace;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        var shift = this.addChar(p1, dir, 0, char, factor, index, index2, textVector);

        p1 = shift[0];
        index = shift[1];
        index2 = shift[2];
    }

};


GpuText.prototype.addTextOnPath = function(points, distance, text, size, textVector) {
    if (textVector == null) {
        textVector = [0,1];
    }

    var p1 = points[0];
    var p2 = points[1];

    var index = this.vertices.length;
    var index2 = this.tvertices.length;

    var chars = this.font.chars;

    var factor = size / this.font.size;
    var newLineSpace = this.font.space * factor;

    var s = [p1[0], p1[1], p1[2]];
    var p1 = [p1[0], p1[1], p1[2]];
    var l = distance;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10) { //new line
            s[0] += -dir[1] * newLineSpace;
            s[1] += dir[0] * newLineSpace;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        if (char == 9) { //tab
            char = 32;
        }

        var fc = chars[char];
        var ll = 1;
        if (fc != null) {
            ll = fc.step * factor;
        }

        var posAndDir = this.getPathPositionAndDirection(points, l);
        var posAndDir2 = this.getPathPositionAndDirection(points, l+ll);

        //average dir
        var dir = [(posAndDir2[1][0] + posAndDir[1][0])*0.5,
                    (posAndDir2[1][1] + posAndDir[1][1])*0.5,
                    (posAndDir2[1][2] + posAndDir[1][2])*0.5];

        vec3.normalize(dir);

        var shift = this.addChar(posAndDir[0], dir, -factor*this.font.size*0.7, char, factor, index, index2, textVector);

        p1 = shift[0];
        index = shift[1];
        index2 = shift[2];
        l += ll;
    }
};


GpuText.prototype.addStreetTextOnPath = function(points, text, size) {
    var factor = size / this.font.size;
    var textLength = this.getTextLength(text, factor);
    var pathLength = this.getPathLength(points);
    var shift = (pathLength -  textLength)*0.5;
    if (shift < 0) {
        shift = 0;
    }

    if (textLength > pathLength) {
        return;
    }

    var textVector = this.getPathTextVector(points, shift, text, factor);

    this.addTextOnPath(points, shift, text, size, textVector);
};


GpuText.prototype.getFontFactor = function(size) {
    return size / this.font.size;
};


GpuText.prototype.getTextLength = function(text, factor) {
    var l = 0;
    var chars = this.font.chars;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10) { //new line
            continue;
        }

        if (char == 9) {  //tab or space
            char = 32;
        }

        var fc = chars[char];

        if (fc != null) {
            l += fc.step * factor;
        }
    }

    return l;
};


GpuText.prototype.getPathLength = function(points) {
    var l = 0;

    for (var i = 0, li = points.length-1; i < li; i++) {
        var p1 = points[i];
        var p2 = points[i+1];
        var dir = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3.length(dir);
    }

    return l;
};


GpuText.prototype.getPathPositionAndDirection = function(points, distance) {
    var l = 0;
    var p1 = [0,0,0];
    var dir = [1,0,0];

    for (var i = 0, li = points.length-1; i < li; i++) {
        p1 = points[i];
        var p2 = points[i+1];
        dir = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        var ll = vec3.length(dir);

        if ((l + ll) > distance) {
            var factor = (distance - l) / (ll);
            var p = [p1[0] + dir[0] * factor,
                     p1[1] + dir[1] * factor,
                     p1[2] + dir[2] * factor];

            vec3.normalize(dir);

            return [p, dir];
        }

        l += ll;
    }

    return [p1, dir];
};


GpuText.prototype.getPathTextVector = function(points, shift, text, factor) {
    var l = 0;
    var p1 = [0,0,0];
    var dir = [1,0,0];
    var textDir = [0,0,0];
    var textStart = shift;
    var textEnd = shift + this.getTextLength(text, factor);

    for (var i = 0, li = points.length-1; i < li; i++) {
        p1 = points[i];
        var p2 = points[i+1];
        dir = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3.length(dir);

        if (l > textStart) {
            vec3.normalize(dir);
            textDir[0] += dir[0];
            textDir[1] += dir[1];
            textDir[2] += dir[2];
        }

        if (l > textEnd) {
            vec3.normalize(textDir);
            return [-textDir[1], textDir[0],0];
        }
    }

    return textDir;
};


GpuText.prototype.compile = function() {
    var gl = this.gl;
    if (gl == null)
        return;

    this.kill();

    this.vertexPositionBuffer = null;
    this.vertexTextureCoordBuffer = null;
    this.vertexNormalBuffer = null;

    //create vertex buffer
    this.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
    this.vertexPositionBuffer.itemSize = 3;
    this.vertexPositionBuffer.numItems = this.vertices.length / 3;

    //create texture coords buffer
    this.vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.tvertices), gl.STATIC_DRAW);
    this.vertexTextureCoordBuffer.itemSize = 4;
    this.vertexTextureCoordBuffer.numItems = this.tvertices.length / 4;

    this.size = this.vertexPositionBuffer.numItems * 3 * 4 + this.vertexTextureCoordBuffer.numItems * 4 * 4;
    this.polygons = this.vertexPositionBuffer.numItems / 3;

    if (this.withNormals) {
        this.normals = [];
    }
};


// Draws the mesh, given the two vertex shader attributes locations.
GpuText.prototype.draw = function(program, attrPosition, attrTexCoord) {
    var gl = this.gl;
    if (gl == null)
        return;

    var vertexPositionAttribute = program.getAttribute(attrPosition);
    var textureCoordAttribute = program.getAttribute(attrTexCoord);

    //bind vetex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
    gl.vertexAttribPointer(vertexPositionAttribute, this.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //bind texture coords
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(textureCoordAttribute, this.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //draw polygons
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexPositionBuffer.numItems);
};


// Returns GPU RAM used, in bytes.
GpuText.prototype.size = function(){ return this.size; };


GpuText.prototype.bbox = function(){ return this.bbox; };


GpuText.prototype.getPolygons = function(){ return this.polygons; };


export default GpuText;

