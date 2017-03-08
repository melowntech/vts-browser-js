
/**
 * @constructor
 */
Melown.GpuDevice = function(div_, size_, keepFrameBuffer_, antialias_) {
    this.div_ = div_;
    this.canvas_ =  null;
    this.curSize_ = size_;
    this.currentProgram_ = null;
    this.maxAttributesCount_ = 8;
    this.newAttributes_ = new Uint8Array(this.maxAttributesCount_);
    this.enabledAttributes_ = new Uint8Array(this.maxAttributesCount_);

    this.defaultState_ = this.createState({});
    this.currentState_ = this.defaultState_;
    this.currentOffset_ = 0; //used fot direct offset

    this.keepFrameBuffer_ = (keepFrameBuffer_ == null) ? false : keepFrameBuffer_;
    this.antialias_ = antialias_ ? true : false;
};

Melown.GpuDevice.prototype.init = function() {
    this.canvas_ = document.createElement("canvas");

    if (this.canvas_ == null) {
        //canvas not supported
        return;
    }

    this.canvas_.width = this.curSize_[0];
    this.canvas_.height = this.curSize_[1];
    this.canvas_.style.display = "block";

    if (this.canvas_.getContext == null) {
        //canvas not supported
        return;
    }

    try {
        this.gl_ = this.canvas_.getContext("webgl", {preserveDrawingBuffer: this.keepFrameBuffer_, antialias: this.antialias_, stencil: true}) || this.canvas_.getContext("experimental-webgl", {preserveDrawingBuffer: this.keepFrameBuffer_});
    } catch(e) {
        //webgl not supported
    }

    if (!this.gl_) {
        //webgl not supported
        return;
    }

    this.gl_.getExtension('OES_standard_derivatives');

    this.div_.appendChild(this.canvas_);

    this.gl_.viewportWidth = this.canvas_.width;
    this.gl_.viewportHeight = this.canvas_.height;

    this.gl_.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl_.enable(this.gl_.DEPTH_TEST);

    //clear screen
    this.gl_.viewport(0, 0, this.gl_.viewportWidth, this.gl_.viewportHeight);
    this.gl_.clear(this.gl_.COLOR_BUFFER_BIT | this.gl_.DEPTH_BUFFER_BIT);
};

Melown.GpuDevice.prototype.kill = function() {
    this.div_.removeChild(this.canvas_);
    delete this.canvas_;
    this.canvas_ = null;
};

Melown.GpuDevice.prototype.resize = function(size_, skipCanvas_) {
    this.curSize_ = size_;

    if (this.canvas_ != null && skipCanvas_ != true) {
        this.canvas_.width = this.curSize_[0];
        this.canvas_.height = this.curSize_[1];
    }

    if (this.gl_ != null) {
        this.gl_.viewportWidth = this.canvas_.width;
        this.gl_.viewportHeight = this.canvas_.height;
    }
};

Melown.GpuDevice.prototype.getCanvas = function() {
    return this.canvas_;
};

Melown.GpuDevice.prototype.setViewport = function() {
    this.gl_.viewport(0, 0, this.gl_.viewportWidth, this.gl_.viewportHeight);
};

Melown.GpuDevice.prototype.clear = function(clearDepth_, clearColor_, color_) {
    if (color_ != null) {
        this.gl_.clearColor(color_[0]/255, color_[1]/255, color_[2]/255, color_[3]/255);
    }
    
//    if (this.keepFrameBuffer_) {
//        this.gl_.clear(this.gl_.COLOR_BUFFER_BIT | this.gl_.DEPTH_BUFFER_BIT );
//    } else {
        this.gl_.clear((clearColor_ ? this.gl_.COLOR_BUFFER_BIT : 0) |
                       (clearDepth_ ? this.gl_.DEPTH_BUFFER_BIT : 0) );
//    }
};

//aPosition_, attrTexCoord_, attrTexCoord2_, attrBarycentric_, attrNormal_, attrNormal2_, attrNormal3_

Melown.GpuDevice.prototype.useProgram = function(program_, attributes_, nextSampler_) {
    if (this.currentProgram_ != program_) {
        this.gl_.useProgram(program_.program_);
        this.currentProgram_ = program_;

        program_.setSampler("uSampler", 0);
        
        if (nextSampler_) {
            program_.setSampler("uSampler2", 1);
        }

        var newAttributes_ = this.newAttributes_;
        var enabledAttributes_ = this.enabledAttributes_; 
       
        //reset new attributes list
        for (var i = 0, li = newAttributes_.length; i < li; i++){
            newAttributes_[i] = 0;
        }
        
        //
        for (var i = 0, li = attributes_.length; i < li; i++){
            var index_ = program_.getAttribute(attributes_[i]);
            
            if (index_ != -1){
                newAttributes_[index_] = 1;
            }
        }

        //enable or disable current attributes according to new attributes list
        for (var i = 0, li = newAttributes_.length; i < li; i++){
            if (enabledAttributes_[i] != newAttributes_[i]) {
                if (newAttributes_[i]) {
                    this.gl_.enableVertexAttribArray(i);
                    enabledAttributes_[i] = 1;
                } else {
                    this.gl_.disableVertexAttribArray(i);
                    enabledAttributes_[i] = 0;
                }
            }
        }


    }
};

Melown.GpuDevice.prototype.bindTexture = function(texture_, id_) {
    if (texture_.loaded_ == false) {
        return;
    }

    this.gl_.activeTexture(id_ ? this.gl_.TEXTURE1 : this.gl_.TEXTURE0);
    this.gl_.bindTexture(this.gl_.TEXTURE_2D, texture_.texture_);
};

Melown.GpuDeviceSupported = function() {
    return true;
};

Melown.GpuDevice.prototype.setFramebuffer = function(texture_) {
    if (texture_ != null) {
        this.gl_.bindFramebuffer(this.gl_.FRAMEBUFFER, texture_.framebuffer_);
        //utResizeViewport(texture_.framebuffer_.width, texture_.framebuffer_.height, true);
    } else {
        this.gl_.bindTexture(this.gl_.TEXTURE_2D, null);
        this.gl_.bindRenderbuffer(this.gl_.RENDERBUFFER, null);
        this.gl_.bindFramebuffer(this.gl_.FRAMEBUFFER, null);
    }

};

Melown.GpuDevice.prototype.createState = function(state_) {
    if (state_.blend_ == null) { state_.blend_ = false; }
    if (state_.stencil_ == null) { state_.stencil_ = false; }
    //if (state_.zoffset_ == null) { state_.zoffset_ = 0; }
    if (state_.zwrite_ == null) { state_.zwrite_ = true; }
    if (state_.ztest_ == null) { state_.ztest_ = true; }
    if (state_.zequal_ == null) { state_.zequal_ = false; }
    if (state_.culling_ == null) { state_.culling_ = true; }

    return state_;
};

Melown.GpuDevice.prototype.setState = function(state_, directOffset_) {
    /*
    if (this.currentState_ == state_) {

        if (directOffset_ != null) {
            //if (directOffset_ != this.currentOffset_) {
                this.currentOffset_ = directOffset_;
                this.gl_.polygonOffset(-1.0, directOffset_);
            //}
        }

        return;
    }

    //this.gl_.polygonOffset(-1.0, 0);
    */

    var gl_ = this.gl_;
    var currentState_ = this.currentState_;
    //directOffset_ = directOffset_ || state_.zoffset_;

    if (currentState_.blend_ != state_.blend_) {
        if (state_.blend_ == true) {
            gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
            gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
            gl_.enable(gl_.BLEND);
        } else {
            gl_.disable(gl_.BLEND);
        }
    }

    if (currentState_.stencil_ != state_.stencil_) {
        if (state_.stencil_ == true) {
            gl_.enable(gl_.STENCIL_TEST);
        } else {
            gl_.disable(gl_.STENCIL_TEST);
        }
    }
/*
    if (currentState_.zoffset_ != directOffset_) {
        if (directOffset_ != 0) {
            gl_.polygonOffset(-1.0, directOffset_);
            gl_.enable(gl_.POLYGON_OFFSET_FILL);
        } else {
            gl_.disable(gl_.POLYGON_OFFSET_FILL);
        }
        this.currentOffset_ = directOffset_;
    }
*/
    if (currentState_.zwrite_ != state_.zwrite_) {
        if (state_.zwrite_ == true) {
            gl_.depthMask(true);
        } else {
            gl_.depthMask(false);
        }
    }

    if (currentState_.ztest_ != state_.ztest_) {
        if (state_.ztest_ != 0) {
            gl_.enable(gl_.DEPTH_TEST);
        } else {
            gl_.disable(gl_.DEPTH_TEST);
        }
    }

    if (currentState_.zequal_ != state_.zequal_) {
        if (state_.zequal_ != 0) {
            gl_.depthFunc(gl_.LEQUAL);
        } else {
            gl_.depthFunc(gl_.LESS);
        }
    }

    if (currentState_.culling_ != state_.culling_) {
        if (state_.culling_ == true) {
            gl_.enable(gl_.CULL_FACE);
        } else {
            gl_.disable(gl_.CULL_FACE);
        }
    }

    this.currentState_ = state_;
};





