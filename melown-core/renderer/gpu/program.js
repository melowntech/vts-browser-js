
/**
 * @constructor
 */
Melown.GpuProgram = function(gpu_, vertex_, fragment_) {
    this.gl_ = gpu_.gl_;
    this.vertex_ = vertex_;
    this.fragment_ = fragment_;
    this.program_ = null;
    this.uniformLocationCache_ = [];
    this.attributeLocationCache_ = [];
    this.createProgram(vertex_, fragment_);
};


Melown.GpuProgram.prototype.createShader = function(source_, vertexShader_) {
    var gl_ = this.gl_;

    if (!source_ || !gl_) {
        return null;
    }

    var shader_;

    if (vertexShader_ != true) {
        shader_ = gl_.createShader(gl_.FRAGMENT_SHADER);
    } else {
        shader_ = gl_.createShader(gl_.VERTEX_SHADER);
    }

    gl_.shaderSource(shader_, source_);
    gl_.compileShader(shader_);

    if (!gl_.getShaderParameter(shader_, gl_.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: " + gl_.getShaderInfoLog(shader_));
        return null;
    }

    return shader_;
};


Melown.GpuProgram.prototype.createProgram = function(vertex_, fragment_) {
    var gl_ = this.gl_;
    if (gl_ == null) return;

    var vertexShader_ = this.createShader(vertex_, true);
    var fragmentShader_ = this.createShader(fragment_, false);

    var program_ = gl_.createProgram();
    gl_.attachShader(program_, vertexShader_);
    gl_.attachShader(program_, fragmentShader_);
    gl_.linkProgram(program_);

    if (!gl_.getProgramParameter(program_, gl_.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }

    gl_.useProgram(program_);

    this.program_ = program_;
};

Melown.GpuProgram.prototype.setSampler = function(name_, index_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform1i(key_, index_);
    }
};

Melown.GpuProgram.prototype.setMat4 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniformMatrix4fv(key_, false, m_);
    }
};

Melown.GpuProgram.prototype.setVec2 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform2fv(key_, m_);
    }
};

Melown.GpuProgram.prototype.setVec3 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform3fv(key_, m_);
    }
};

Melown.GpuProgram.prototype.setVec4 = function(name_, m_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform4fv(key_, m_);
    }
};

Melown.GpuProgram.prototype.setFloat = function(name_, value_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform1f(key_, value_);
    }
};

Melown.GpuProgram.prototype.setFloatArray = function(name_, array_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    var key_ = this.getUniform(name_);
    if (key_ != null) {
        gl_.uniform1fv(key_, array_);
    }
};


Melown.GpuProgram.prototype.getAttribute = function(name_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    if (this.attributeLocationCache_[name_] == null) {
        var location_ = gl_.getAttribLocation(this.program_, name_);
        this.attributeLocationCache_[name_] = location_;
        return location_;
    } else {
        return this.attributeLocationCache_[name_];
    }
};

Melown.GpuProgram.prototype.getUniform = function(name_) {
    var gl_ = this.gl_;
    if (gl_ == null || this.program_ == null) return;

    if (this.uniformLocationCache_[name_] == null) {
        var location_ = gl_.getUniformLocation(this.program_, name_);
        this.uniformLocationCache_[name_] = location_;
        return location_;
    } else {
        return this.uniformLocationCache_[name_];
    }
};


