
var GpuMesh = function(gpu, meshData, fileSize, core, direct, use16bit, verticesUnnormalized) {
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.bbox = meshData.bbox; //< bbox copy from Mesh
    this.fileSize = fileSize; //used for stats
    this.core = core;
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.uv2Buffer = null;
    this.use16bit = use16bit ? true : false;
    this.verticesUnnormalized = verticesUnnormalized ? true : false;
    this.size = 0;

    var vertices = meshData.vertices;
    var uvs = meshData.uvs;
    var uvs2 = meshData.uvs2;
    var indices = meshData.indices;
    var vertexSize = meshData.vertexSize || 3;
    var uvSize = meshData.uvSize || 2;
    var uv2Size = meshData.uv2Size || 2;

    var gl = this.gl;

    if (!vertices || !gl) {
        return;
    }

    //create vertex buffer
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    //when direct mode is used vertices can be also unit16
    gl.bufferData(gl.ARRAY_BUFFER, direct ? vertices : (new Float32Array(vertices)), gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = vertexSize;
    this.vertexBuffer.numItems = vertices.length / vertexSize;

    if (uvs != null) {
        //create texture coords buffer
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, direct ? uvs : (new Float32Array(uvs)), gl.STATIC_DRAW);
        this.uvBuffer.itemSize = uvSize;
        this.uvBuffer.numItems = uvs.length / uvSize;
    }

    if (uvs2 != null) {
        //create texture coords buffer
        this.uv2Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uv2Buffer);

        gl.bufferData(gl.ARRAY_BUFFER, direct ? uvs2 : (new Float32Array(uvs2)), gl.STATIC_DRAW);
        this.uv2Buffer.itemSize = uv2Size;
        this.uv2Buffer.numItems = uvs2.length / uv2Size;
    }

    if (indices != null) {
        //create index buffer
        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, direct ? indices : (new Uint16Array(indices)), gl.STATIC_DRAW);
        this.indexBuffer.itemSize = 1;
        this.indexBuffer.numItems = indices.length;
    }

    var varSize = this.use16bit ? 2 : 4;
    this.size = this.vertexBuffer.numItems * vertexSize * varSize;
    this.size += (uvs) ? this.uvBuffer.numItems * uvSize * varSize : 0;
    this.size += (uvs2) ? this.uv2Buffer.numItems * uv2Size * varSize : 0;
    this.size += (indices) ? indices.length * 2 : 0;
    this.polygons = (indices) ? indices.length / 3 : this.vertexBuffer.numItems / 3;

    this.valid = true;
};

//destructor
GpuMesh.prototype.kill = function() {
    if (!this.gl || !this.valid) {
        return;
    }

    if (this.vertexBuffer) {
        this.gl.deleteBuffer(this.vertexBuffer);
    }
    
    if (this.uvBuffer) {
        this.gl.deleteBuffer(this.uvBuffer);
    }

    if (this.uv2Buffer) {
        this.gl.deleteBuffer(this.uv2Buffer);
    }

    if (this.indexBuffer) {
        this.gl.deleteBuffer(this.indexBuffer);
    }
    
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.uv2Buffer = null;
    this.indexBuffer = null;
};

// Draws the mesh, given the two vertex shader attributes locations.
GpuMesh.prototype.draw = function(program, attrVertex, attrUV, attrUV2, attrBarycenteric, skipDraw) {
    var gl = this.gl;
    if (gl == null || !this.valid) {
        return;
    }

    if (this.use16bit) {
        //bind vetex positions
        var vertexAttribute = program.getAttribute(attrVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(vertexAttribute, this.vertexBuffer.itemSize, gl.UNSIGNED_SHORT, !this.verticesUnnormalized, 0, 0);

        //bind texture coords
        if (this.uvBuffer && attrUV) {
            var uvAttribute = program.getAttribute(attrUV);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(uvAttribute, this.uvBuffer.itemSize, gl.UNSIGNED_SHORT, true, 0, 0);
        }

        if (this.uv2Buffer && attrUV2) {
            var uv2Attribute = program.getAttribute(attrUV2);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uv2Buffer);
            gl.vertexAttribPointer(uv2Attribute, this.uv2Buffer.itemSize, gl.UNSIGNED_SHORT, true, 0, 0);
        }
    } else {
        //bind vetex positions
        var vertexAttribute = program.getAttribute(attrVertex);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(vertexAttribute, this.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //bind texture coords
        if (this.uvBuffer && attrUV) {
            var uvAttribute = program.getAttribute(attrUV);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            gl.vertexAttribPointer(uvAttribute, this.uvBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        if (this.uv2Buffer && attrUV2) {
            var uv2Attribute = program.getAttribute(attrUV2);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uv2Buffer);
            gl.vertexAttribPointer(uv2Attribute, this.uv2Buffer.itemSize, gl.FLOAT, false, 0, 0);
        }
    }

    if (attrBarycenteric && attrBarycenteric) {
        var barycentericAttribute = program.getAttribute(attrBarycenteric);
        
        if (barycentericAttribute != -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.gpu.barycentricBuffer);
            gl.vertexAttribPointer(barycentericAttribute, this.gpu.barycentricBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }
    }

    //draw polygons
    if (this.indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        if (!skipDraw) gl.drawElements(gl.TRIANGLES, this.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    }  else {
        if (!skipDraw) gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
    }
};


// Returns GPU RAM used, in bytes.
GpuMesh.prototype.getSize = function(){ return this.size; };


GpuMesh.prototype.getBBox = function(){ return this.bbox; };


GpuMesh.prototype.getPolygons = function(){ return this.polygons; };


export default GpuMesh;

