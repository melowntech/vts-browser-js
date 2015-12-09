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
};

Melown.RendererInterface.prototype.createState = function(options_) {
};

Melown.RendererInterface.prototype.setState = function(options_) {
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

Melown.RendererInterface.prototype.createMesh = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return null;
    }

    var data_ = {
        vertices_ : options_["vertices"],
        uvs_ : options_["vertices"],
        vertexSize_ : options_["vertex-size"],
        uvSize_ : options_["uv-size"],
        bbox_ : options_["bbox"]
    };

    return new Melown.GpuMesh(this.gpu_, data_, 0, this.renderer_.core_);
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
};

Melown.RendererInterface.prototype.addJob = function(options_) {
};

Melown.RendererInterface.prototype.clearJobs = function(options_) {
};



Melown.RendererInterface.prototype.drawMesh = function(options_) {
};

Melown.RendererInterface.prototype.drawImage = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return;
    }

    if (options["texture"] == null || options["rect"] == null) {
        return;
    }

    var rect_ = options["rect"];
    var color_ = options["color"] || [255,255,255,255];
    var depth_ = options["depth"] || 0;
    var depthTest_ = options["depth-test"] || false;
    var blend_ = options["blend"] || false;

    this.renderer_.drawImage(rect_[0], rect_[1], rect_[2], rect_[3], options["texture"], color_, depth_, depthTest_, blend_);
};

Melown.RendererInterface.prototype.drawBillboard = function(options_) {
    if (options_ == null || typeof options_ !== "object") {
        return;
    }

    if (options_["texture"] == null || options_["mvp"] == null) {
        return;
    }

    var mvp_ = options_["mvp"];
    var color_ = options_["color"] || [255,255,255,255];
    var depthTest_ = options_["depth-test"] || false;
    var blend_ = options_["blend"] || false;

    this.renderer_.drawBillboard(mvp_, options_["texture"], color_, depthTest_, blend_);
};

Melown.RendererInterface.prototype.drawLinestring = function(options_) {
};

Melown.RendererInterface.prototype.drawJobs = function(options_) {
};


Melown.RendererInterface.prototype.drawBBox = function(options_) {
};

Melown.RendererInterface.prototype.drawDebugText = function(options_) {
};

Melown.RendererInterface.prototype.getScreenCoords = function(point_, mvp_) {
    return this.renderer_.project2(point_, mvp_);
};

Melown.RendererInterface.prototype.getScreenSize = function(point_, mvp_) {
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


//prevent minification
Melown.RendererInterface.prototype["clear"] = Melown.RendererInterface.prototype.clear;
Melown.RendererInterface.prototype["createState"] = Melown.RendererInterface.prototype.createState;
Melown.RendererInterface.prototype["setState"] = Melown.RendererInterface.prototype.setState;

Melown.RendererInterface.prototype["createTexture"] = Melown.RendererInterface.prototype.createTexture;
Melown.RendererInterface.prototype["createMesh"] = Melown.RendererInterface.prototype.createMesh;
Melown.RendererInterface.prototype["createProgram"] = Melown.RendererInterface.prototype.createProgram;

Melown.RendererInterface.prototype["addJob"] = Melown.RendererInterface.prototype.addJob;
Melown.RendererInterface.prototype["clearJobs"] = Melown.RendererInterface.prototype.clearJobs;

Melown.RendererInterface.prototype["drawMesh"] = Melown.RendererInterface.prototype.drawMesh;
Melown.RendererInterface.prototype["drawImage"] = Melown.RendererInterface.prototype.drawImage;
Melown.RendererInterface.prototype["drawBillboard"] = Melown.RendererInterface.prototype.drawBillboard;
Melown.RendererInterface.prototype["drawLineString"] = Melown.RendererInterface.prototype.drawLineString;
Melown.RendererInterface.prototype["drawJobs"] = Melown.RendererInterface.prototype.drawJobs;


Melown["getVersion"] = Melown.getVersion;
Melown["checkSupport"] = Melown.checkSupport;

