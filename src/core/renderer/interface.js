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
                        ((options_["depth"] != null) ? options_["depth"] : 1.0) );
    }
    return this;    
};

Melown.RendererInterface.prototype.createState = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return this;    
    }
    
    var stateOptions_ = {
        blend_ : (options_["blend"] != null) ? options_["blend"] : false,
        stencil_ : (options_["stencil"] != null) ? options_["stencil"] : false,
        zoffset_ : (options_["zoffset"] != null) ? options_["zoffset"] : 0,
        zwrite_ : (options_["zwrite"] != null) ? options_["zwrite"] : true,
        ztest_ : (options_["ztest"] != null) ? options_["ztest"] : true,
        zequal_ : (options_["zequal"] != null) ? options_["zequal"] : true,
        culling_ : (options_["culling"] != null) ? options_["culling"] : true
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
            texture_.createFromData(width_, height_, source_, filter_, repeat_);
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
        uvs2_ : options_["normals"],
        vertexSize_ : options_["vertex-size"],
        uvSize_ : options_["uv-size"],
        uv2Size_ : options_["normal-size"] || 3,
        vertexAttr_ : options_["vertex-attr"],
        uvAttr_ : options_["uv-attr"],
        uv2Attr_ : options_["normal-attr"],
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

Melown.RendererInterface.prototype.createShader = function(options_) {
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

    if (!options_["mesh"] == null || !options_["shader-variables"]) {
        return this;    
    }

    var shaderAttributes_ = options_["shader-attributes"];
    var vertexAttr_ = options_["vertex"] || "aPosition";
    var uvAttr_ = options_["uv"] || "aTexCoord";
    var uv2Attr_ = options_["normal"] || "aNormal";

    var shaderVariables_ = options_["shader-variables"];
    var shader_ = options_["shader"] || "textured";

   
    var renderer_ = this.renderer_; 
    var mesh_ = options_["mesh"];
    var texture_ = options_["texture"];
    var mv_ = renderer_.camera_.getModelviewMatrix();
    var proj_ = renderer_.camera_.getProjectionMatrix();
    var fogDensity_ = renderer_.fogDensity_;
    
    if (typeof shader_ === "string") {
        switch(shader_) {
            case "hit":

                if (!shaderVariables_["uMV"]) {
                    shaderVariables_["uMV"] = ["mat4", mv_];
                } 

                if (!shaderVariables_["uProj"]) {
                    shaderVariables_["uProj"] = ["mat4", proj_];
                } 

                uvAttr_ = null;
                uv2Attr_ = null;
                texture_ = null;
                shader_ = renderer_.progDepthTile_;;
                break;

            case "shaded":
                uvAttr_ = null;

            case "textured":
            case "textured-and-shaded":

                if (!shaderVariables_["uMV"]) {
                    shaderVariables_["uMV"] = ["mat4", mv_];
                } 

                if (!shaderVariables_["uProj"]) {
                    shaderVariables_["uProj"] = ["mat4", proj_];
                } 

                if (!shaderVariables_["uFogDensity"]) {
                    shaderVariables_["uFogDensity"] = ["float", fogDensity_];
                } 
            
                uv2Attr_ = (shader_ == "textured") ? null : "aNormal";
                shader_ = (shader_ == "textured") ? renderer_.progTile_ : ((shader_ == "shaded") ? renderer_.progShadedTile_ : renderer_.progTShadedTile_);
                break;
        }
    }

    var attributes_ = [vertexAttr_];
    if (uvAttr_){
        attributes_.push(uvAttr_);        
    } 
    if (uv2Attr_){
        attributes_.push(uv2Attr_);        
    } 

    renderer_.gpu_.useProgram(shader_, attributes_);

    for (var key_ in shaderVariables_) {
        var item_ = shaderVariables_[key_];
        
        if (item_.length == 2) {
            switch(item_[0]){
                case "floatArray":
                    shader_.setFloatArray(key_, item_[1]);
                    break;
                case "float":
                    shader_.setFloat(key_, item_[1]);
                    break;
                case "mat3":
                    shader_.setMat3(key_, item_[1]);
                    break;
                case "mat4":
                    shader_.setMat4(key_, item_[1]);
                    break;
                case "vec2":
                    shader_.setVec2(key_, item_[1]);
                    break;
                case "vec3":
                    shader_.setVec3(key_, item_[1]);
                    break;
                case "vec4":
                    shader_.setVec4(key_, item_[1]);
                    break;
                case "sampler":
                    shader_.setSampler(key_, item_[1]);
                    break;
            } 
        }
    }

    if (texture_) {
        renderer_.gpu_.bindTexture(texture_);
    }
    
    //mesh_.draw(shader_, vertexAttr_, texture_ ? uvAttr_ : null, uv2Attr_, null);
    mesh_.draw(shader_, vertexAttr_, uvAttr_, uv2Attr_, null);
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
    var depth_ = (options_["depth"] != null) ? options_["depth"] : 0;
    var depthTest_ = (options_["depth-test"] != null) ? options_["depth-test"] : false;
    var blend_ = (options_["blend"] != null) ? options_["blend"] : false;
    var writeDepth_ = (options_["write-depth"] != null) ? options_["write-depth"] : false;
    var useState_ = (options_["use-state"] != null) ? options_["use-state"] : false;
    color_[0] *= 1.0/255;
    color_[1] *= 1.0/255;
    color_[2] *= 1.0/255;
    color_[3] *= 1.0/255;

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
    var depthTest_ = (options_["depth-test"] != null) ? options_["depth-test"] : false;
    var blend_ = (options_["blend"] != null) ? options_["blend"] : false;
    var writeDepth_ = (options_["write-depth"] != null) ? options_["write-depth"] : false;
    var useState_ = (options_["use-state"] != null) ? options_["use-state"] : false;
    color_[0] *= 1.0/255;
    color_[1] *= 1.0/255;
    color_[2] *= 1.0/255;
    color_[3] *= 1.0/255;

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
    var depthTest_ = (options_["depth-test"] != null) ? options_["depth-test"] : false;
    var blend_ = (options_["blend"] != null) ? options_["blend"] : false;
    var writeDepth_ = (options_["write-depth"] != null) ? options_["write-depth"] : false;
    var useState_ = (options_["use-state"] != null) ? options_["use-state"] : false;
    color_[0] *= 1.0/255;
    color_[1] *= 1.0/255;
    color_[2] *= 1.0/255;
    color_[3] *= 1.0/255;

    this.renderer_.drawLineString(points_, size_, color_, depthTest_, blend_, writeDepth_, useState_);
    return this;    
};

Melown.RendererInterface.prototype.drawJobs = function(options_) {
    return this;    
};


Melown.RendererInterface.prototype.drawBBox = function(options_) {
    return this;    
};

Melown.RendererInterface.prototype.drawDebugText = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return this;    
    }

    var text_ = options_["text"];
    var coords_ = options_["coords"];

    if (!text_ || !coords_) {
        return this;    
    }
    
    var color_ = options_["color"] || [255,255,255,255];
    var size_ = options_["size"] || 16;
    var depth_ = options_["depth"];
    var useState_ = options_["use-state"] || false;
    color_[0] *= 1.0/255;
    color_[1] *= 1.0/255;
    color_[2] *= 1.0/255;
    color_[3] *= 1.0/255;

    var lx_ = this.renderer_.getTextSize(size_, text_);

    this.renderer_.drawText(coords_[0] - (lx_ * 0.5), coords_[1], size_, text_, color_, depth_, useState_);

    /*
    var depthTest_ = options_["depth-test"] || false;
    var blend_ = options_["blend"] || false;
    var writeDepth_ = options_["write-depth"] || false;
    */

    return this;    
};

Melown.RendererInterface.prototype.saveScreenshot = function(output_, filename_, filetype_) {
    return this.renderer_.saveScreenshot(output_, filename_, filetype_);
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
Melown.RendererInterface.prototype["createshader"] = Melown.RendererInterface.prototype.createshader; 
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
Melown.RendererInterface.prototype["saveScreenshot"] = Melown.RendererInterface.prototype.saveScreenshot;
