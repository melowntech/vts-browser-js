
var GpuMesh = function(gpu, meshData, fileSize, core) {
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.bbox = meshData.bbox; //< bbox copy from Mesh
    this.fileSize = fileSize; //used for stats
    this.core = core;
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.uv2Buffer = null;

    var timer = performance.now();

    var vertices = meshData.vertices;
    var uvs = meshData.uvs;
    var uvs2 = meshData.uvs2;
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

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.vertexBuffer.itemSize = vertexSize;
    this.vertexBuffer.numItems = vertices.length / vertexSize;

    if (uvs != null) {
        //create texture coords buffer
        this.uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
        this.uvBuffer.itemSize = uvSize;
        this.uvBuffer.numItems = uvs.length / uvSize;
    }

    if (uvs2 != null) {
        //create texture coords buffer
        this.uv2Buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.uv2Buffer);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs2), gl.STATIC_DRAW);
        this.uv2Buffer.itemSize = uv2Size;
        this.uv2Buffer.numItems = uvs2.length / uv2Size;
    }

    this.size = this.vertexBuffer.numItems * vertexSize * 4;
    this.size += (uvs == null) ? 0 : this.uvBuffer.numItems * uvSize * 4;
    this.size += (uvs2 == null) ? 0 : this.uv2Buffer.numItems * uv2Size * 4;
    this.polygons = this.vertexBuffer.numItems / 3;

    /*
    if (this.core.renderer != null) {
        this.core.renderer.statsCreateGpuMeshTime += performance.now() - timer;
        this.core.renderer.statsFluxMesh[0][0] ++;
        this.core.renderer.statsFluxMesh[0][1] += this.size;
    }*/

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
    
    this.vertexBuffer = null;
    this.uvBuffer = null;
    this.uv2Buffer = null;

    /*
    if (this.core.renderer != null) {
        this.core.renderer.statsFluxMesh[1][0] ++;
        this.core.renderer.statsFluxMesh[1][1] += this.size;
    }*/
};

// Draws the mesh, given the two vertex shader attributes locations.
GpuMesh.prototype.draw = function(program, attrVertex, attrUV, attrUV2, attrBarycenteric) {
    var gl = this.gl;
    if (gl == null || !this.valid) {
        return;
    }
    
    if (!this.vertexBuffer) {
        gl = gl;
    }

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

    if (attrBarycenteric && attrBarycenteric) {
        var barycentericAttribute = program.getAttribute(attrBarycenteric);
        
        if (barycentericAttribute != -1) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.gpu.barycentricBuffer);
            gl.vertexAttribPointer(barycentericAttribute, this.gpu.barycentricBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }
    }

    //draw polygons
    //try {
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexBuffer.numItems);
    //} catch(e) {
      //  e = e;
    //}
};
/*
window.onerror = (function(e,d,c){
  var a = 0, b =1;
  a += b; 
});*/

// Returns GPU RAM used, in bytes.
GpuMesh.prototype.size = function(){ return this.size; };


GpuMesh.prototype.bbox = function(){ return this.bbox; };


GpuMesh.prototype.getPolygons = function(){ return this.polygons; };


export default GpuMesh;

