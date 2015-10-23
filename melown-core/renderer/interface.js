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
};

Melown.RendererInterface.prototype.createMesh = function(options_) {
};

Melown.RendererInterface.prototype.createProgram = function(options_) {
};



Melown.RendererInterface.prototype.addJob = function(options_) {
};

Melown.RendererInterface.prototype.clearJobs = function(options_) {
};



Melown.RendererInterface.prototype.drawMesh = function(options_) {
};

Melown.RendererInterface.prototype.drawImage = function(options_) {
};

Melown.RendererInterface.prototype.drawBillboard = function(options_) {
};

Melown.RendererInterface.prototype.drawLinestring = function(options_) {
};

Melown.RendererInterface.prototype.drawJobs = function(options_) {
};



//prevent minification
Melown.RendererInterface.prototype["clear"] = Melown.RendererInterface.prototype.clear;
Melown.RendererInterface.prototype["createState"] = Melown.RendererInterface.prototype.createState;
Melown.RendererInterface.prototype["setState"] = Melown.RendererInterface.prototype.setState;


Melown["getVersion"] = Melown.getVersion;
Melown["checkSupport"] = Melown.checkSupport;