
var GpuProgram = function(gpu, vertex, fragment, variants) {
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.vertex = vertex;
    this.fragment = fragment;
    this.program = null;
    this.uniformLocationCache = [];
    this.attributeLocationCache = [];
    this.m = new Float32Array(16);
    this.ready = false;
    this.createProgram(vertex, fragment);
    this.variants = variants || [];
    this.programs = {};
};


GpuProgram.prototype.createShader = function(source, vertexShader) {
    var gl = this.gl;

    if (!source || !gl) {
        return null;
    }

    var shader;

    if (vertexShader !== true) {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(shader);
        console.log('An error occurred compiling the ' + ((vertexShader !== true) ? 'fragment' : 'vertex') + ' shaders: ' + info);
        this.gpu.renderer.core.callListener('renderer-shader-error', { 'where':'compilation', 'info' : info });
        return null;
    }

    return shader;
};


GpuProgram.prototype.createProgram = function(vertex, fragment) {
    var gl = this.gl;
    if (gl == null) return;

    var vertexShader = this.createShader(vertex, true);
    var fragmentShader = this.createShader(fragment, false);

    if (!vertexShader ||  !fragmentShader) {
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program.');
        this.gpu.renderer.core.callListener('renderer-shader-error', { 'where':'linking' });
    }

    gl.useProgram(program);

    this.program = program;
    this.ready = true;
};


GpuProgram.prototype.setSampler = function(name, index) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniform1i(key, index);
    }
};

GpuProgram.prototype.isReady = function(name, index) {
    return this.ready;
};

GpuProgram.prototype.setMat4 = function(name, m, zoffset) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        if (zoffset) {
            zoffset = ((1+zoffset)*2)-1;
           
            var m3 = this.m;
            
            m3[0] = m[0];  
            m3[1] = m[1];  
            m3[2] = m[2] * zoffset;  
            m3[3] = m[3];  

            m3[4] = m[4];  
            m3[5] = m[5];  
            m3[6] = m[6] * zoffset;  
            m3[7] = m[7];  

            m3[8] = m[8];
            m3[9] = m[9];
            m3[10] = m[10] * zoffset;  
            m3[11] = m[11];

            m3[12] = m[12];  
            m3[13] = m[13];  
            m3[14] = m[14] * zoffset;  
            m3[15] = m[15];  

            gl.uniformMatrix4fv(key, false, m3);
            
        } else {
            gl.uniformMatrix4fv(key, false, m);
        }
    }
};


GpuProgram.prototype.setMat3 = function(name, m) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniformMatrix3fv(key, false, m);
    }
};


GpuProgram.prototype.setVec2 = function(name, m) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniform2fv(key, m);
    }
};


GpuProgram.prototype.setVec3 = function(name, m) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniform3fv(key, m);
    }
};


GpuProgram.prototype.setVec4 = function(name, m) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniform4fv(key, m);
    }
};


GpuProgram.prototype.setFloat = function(name, value) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniform1f(key, value);
    }
};


GpuProgram.prototype.setFloatArray = function(name, array) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var key = this.getUniform(name);
    if (key != null) {
        gl.uniform1fv(key, array);
    }
};


GpuProgram.prototype.getAttribute = function(name) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var location = this.attributeLocationCache[name];

    if (location == null) {
        location = gl.getAttribLocation(this.program, name);
        this.attributeLocationCache[name] = location;
    }

    return location;
};


GpuProgram.prototype.getUniform = function(name) {
    var gl = this.gl;
    if (gl == null || this.program == null) return;

    var location = this.uniformLocationCache[name];

    if (location == null) {
        location = gl.getUniformLocation(this.program, name);
        this.uniformLocationCache[name] = location;
    }
    
    return location;
};


export default GpuProgram;
