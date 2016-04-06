/**
 * @constructor
 */
Melown.RendererInterface = function(renderer_) {
    this.renderer_ = renderer_;
    this.gpu_ = renderer_.gpu_;
};

Melown.RendererInterface.prototype.clear = function(options_) {
    if (options_ != null) {
        this.gpu_.clear((options_["clearDepth"] || true),
                        (options_["clearColor"] || false),
                        (options_["color"] || [255,255,255,255]),
                        (options_["depth"] || 1.0) );
    }
    return this;    
};

Melown.RendererInterface.prototype.createState = function(options_) {
    if (options_ != null) {
        return null;
    }

    var stateOptions_ = {
        blend_ : options_["blend"] || false,
        stencil_ : options_["stencil"] || false,
        zoffset_ : options_["zoffset"] || 0,
        zwrite_ : options_["zwrite"] || true,
        ztest_ : options_["ztest"] || true,
        zequal_ : options_["zequal"] || true,
        culling_ : options_["culling"] || true
    };

    return this.gpu_.createState(stateOptions_);
};

Melown.RendererInterface.prototype.setState = function(state_) {
    if (state_ != null) {
        this.gpu_.setState(state_);
    }
    return this;    
};

Melown.RendererInterface.prototype.createTexture = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var source_ = options_["source"];
    if (source_ == null) {
        return null;
    }

    var filter_ = options_["filter"] || "linear";
    var repeat_ = options_["repeat"] || false;

    if (source_ instanceof Uint8Array) {
        var width_ = options_["width"];
        var height_ = options_["height"];

        if (width_ && height_) {
            var texture_ = new Melown.GpuTexture(this.gpu_);
            texture_.createFromData(width_, height_, source_, filter, repeat_);
            return texture_;
        }
    }

    if (source_ instanceof Image) {
        var texture_ = new Melown.GpuTexture(this.gpu_);
        texture_.createFromImage(source_, filter_, repeat_);
        return texture_;
    }

    return null;
};

Melown.RendererInterface.prototype.removeTexture = function(texture_) {
    if (texture_) {
        texture_.kill();
    }
    return this;    
};

Melown.RendererInterface.prototype.createMesh = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var data_ = {
        vertices_ : options_["vertices"],
        uvs_ : options_["uvs"],
        vertexSize_ : options_["vertex-size"],
        uvSize_ : options_["uv-size"],
        bbox_ : options_["bbox"]
    };

    return new Melown.GpuMesh(this.gpu_, data_, 0, this.renderer_.core_);
};

Melown.RendererInterface.prototype.removeMesh = function(mesh_) {
    if (mesh_) {
        mesh_.kill();
    }
    return this;    
};

Melown.RendererInterface.prototype.createProgram = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var vertexShader_ = options_["vertex-shader"];
    var fragmentShader_ = options_["fragment-shader"];

    if (vertexShader_ != null && fragmentShader_) {
        return new Melown.GpuProgram(this.gpu_, vertexShader_, fragmentShader_);
    }
};

Melown.RendererInterface.prototype.removeResource = function(resource_) {
    if (resource_ != null && resource_.kill != null) {
        resource.kill();
    }
    return this;    
};

Melown.RendererInterface.prototype.addJob = function(options_) {
    return this;    
};

Melown.RendererInterface.prototype.clearJobs = function(options_) {
    return this;    
};

Melown.RendererInterface.prototype.drawMesh = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return this;    
    }

    if (!options_["mesh"] == null || !options_["program-options"]) {
        return this;    
    }

    var programOptions_ = options_["program-options"];
    var program_ = options_["program"] || "textured";
    
    var renderer_ = this.renderer_; 
    var mesh_ = options_["mesh"];
    var texture_ = options_["texture"];
    var mv_ = renderer_.camera_.getModelviewMatrix();
    var proj_ = renderer_.camera_.getProjectionMatrix();
    var fogDensity_ = renderer_.fogDensity_;
    
    if (typeof program_ === "string") {
        switch(program_) {
            case "textured":

                if (!programOptions_["uMV"]) {
                    programOptions_["uMV"] = ["mat4", mv_];
                } 

                if (!programOptions_["uProj"]) {
                    programOptions_["uProj"] = ["mat4", proj_];
                } 

                if (!programOptions_["uFogDensity"]) {
                    programOptions_["uFogDensity"] = ["float", fogDensity_];
                } 
            
                program_ = renderer_.progTile_;
                break;
        }
    }

    renderer_.gpu_.useProgram(program_, "aPosition", texture_ ? "aTexCoord" : null, null, null);

    for (var key_ in programOptions_) {
        var item_ = programOptions_[key_];
        
        if (item_.length == 2) {
            switch(item_[0]){
                case "floatArray":
                    program_.setFloatArray(key_, item_[1]);
                    break;
                case "float":
                    program_.setFloat(key_, item_[1]);
                    break;
                case "mat4":
                    program_.setMat4(key_, item_[1]);
                    break;
                case "vec2":
                    program_.setVec2(key_, item_[1]);
                    break;
                case "vec3":
                    program_.setVec3(key_, item_[1]);
                    break;
                case "vec4":
                    program_.setVec4(key_, item_[1]);
                    break;
                case "sampler":
                    program_.setSampler(key_, item_[1]);
                    break;
            } 
        }
    }

    if (texture_ != null) {
        renderer_.gpu_.bindTexture(texture_);
    }
    
    mesh_.draw(program_, "aPosition", texture_ ? "aTexCoord" : null, null, null);
    return this;    
};

Melown.RendererInterface.prototype.drawImage = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return this;    
    }

    if (options_["texture"] == null || options_["rect"] == null) {
        return this;    
    }

    var rect_ = options_["rect"];
    var color_ = options_["color"] || [255,255,255,255];
    var depth_ = options_["depth"] || 0;
    var depthTest_ = options_["depth-test"] || false;
    var blend_ = options_["blend"] || false;
    var writeDepth_ = options_["write-depth"] || false;
    var useState_ = options_["use-state"] || false;

    this.renderer_.drawImage(rect_[0], rect_[1], rect_[2], rect_[3], options_["texture"], color_, depth_, depthTest_, blend_, writeDepth_, useState_);
    return this;    
};

Melown.RendererInterface.prototype.drawBillboard = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return this;    
    }

    if (options_["texture"] == null || options_["mvp"] == null) {
        return this;    
    }

    var mvp_ = options_["mvp"];
    var color_ = options_["color"] || [255,255,255,255];
    var depthTest_ = options_["depth-test"] || false;
    var blend_ = options_["blend"] || false;
    var writeDepth_ = options_["write-depth"] || false;
    var useState_ = options_["use-state"] || false;

    this.renderer_.drawBillboard(mvp_, options_["texture"], color_, depthTest_, blend_, writeDepth_, useState_);
    return this;    
};

Melown.RendererInterface.prototype.drawLineString = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return this;    
    }

    if (options_["points"] == null) {
        return this;    
    }

    var points_ = options_["points"];
    var color_ = options_["color"] || [255,255,255,255];
    var size_ = options_["size"] || 2;
    var depthTest_ = options_["depth-test"] || false;
    var blend_ = options_["blend"] || false;
    var writeDepth_ = options_["write-depth"] || false;
    var useState_ = options_["use-state"] || false;

    this.renderer_.drawLineString(points_, size_, color_, depthTest_, blend_, useState_);
    return this;    
};

Melown.RendererInterface.prototype.drawJobs = function(options_) {
    return this;    
};


Melown.RendererInterface.prototype.drawBBox = function(options_) {
    return this;    
};

Melown.RendererInterface.prototype.drawDebugText = function(options_) {
    return this;    
};

Melown.RendererInterface.prototype.getCanvasCoords = function(point_, mvp_) {
    return this.renderer_.project2(point_, mvp_);
};

Melown.RendererInterface.prototype.getCanvasSize = function(point_, mvp_) {
    return this.renderer_.curSize_.slice();
};

Melown.RendererInterface.prototype.setConfigParams = function(params_) {
    this.renderer_.setConfigParams(params_);
    return this;
};

Melown.RendererInterface.prototype.setConfigParam = function(key_, value_) {
    this.renderer_.setConfigParam(key_, value_);
    return this;
};

Melown.RendererInterface.prototype.getConfigParam = function(key_) {
    return this.renderer_.getConfigParam(key_, value_);
};

Melown.RendererInterface.prototype["clear"] = Melown.RendererInterface.prototype.clear;
Melown.RendererInterface.prototype["createState"] = Melown.RendererInterface.prototype.createState; 
Melown.RendererInterface.prototype["setState"] = Melown.RendererInterface.prototype.setState;
Melown.RendererInterface.prototype["createTexture"] = Melown.RendererInterface.prototype.createTexture; 
Melown.RendererInterface.prototype["removeTexture"] = Melown.RendererInterface.prototype.removeTexture; 
Melown.RendererInterface.prototype["createMesh"] = Melown.RendererInterface.prototype.createMesh;
Melown.RendererInterface.prototype["removeMesh"] = Melown.RendererInterface.prototype.removeMesh; 
Melown.RendererInterface.prototype["createProgram"] = Melown.RendererInterface.prototype.createProgram; 
Melown.RendererInterface.prototype["removeResource"] = Melown.RendererInterface.prototype.removeResource; 
Melown.RendererInterface.prototype["addJob"] = Melown.RendererInterface.prototype.addJob;
Melown.RendererInterface.prototype["clearJobs"] = Melown.RendererInterface.prototype.clearJobs; 
Melown.RendererInterface.prototype["drawMesh"] = Melown.RendererInterface.prototype.drawMesh;
Melown.RendererInterface.prototype["drawImage"] = Melown.RendererInterface.prototype.drawImage; 
Melown.RendererInterface.prototype["drawBillboard"] = Melown.RendererInterface.prototype.drawBillboard; 
Melown.RendererInterface.prototype["drawLineString"] = Melown.RendererInterface.prototype.drawLineString; 
Melown.RendererInterface.prototype["drawJobs"] = Melown.RendererInterface.prototype.drawJobs;
Melown.RendererInterface.prototype["drawBBox"] = Melown.RendererInterface.prototype.drawBBox; 
Melown.RendererInterface.prototype["drawDebugText"] = Melown.RendererInterface.prototype.drawDebugText; 
Melown.RendererInterface.prototype["getCanvasCoords"] = Melown.RendererInterface.prototype.getCanvasCoords; 
Melown.RendererInterface.prototype["getCanvasSize"] = Melown.RendererInterface.prototype.getCanvasSize;
Melown.RendererInterface.prototype["setConfigParams"] = Melown.RendererInterface.prototype.setConfigParams; 
Melown.RendererInterface.prototype["setConfigParam"] = Melown.RendererInterface.prototype.setConfigParam;
Melown.RendererInterface.prototype["getConfigParam"] = Melown.RendererInterface.prototype.getConfigParam; 

