
/**
 * @constructor
 */
Melown.GpuTexture = function(gpu_, path_, core_, fileSize_, direct_, repeat_, filter_) {
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.texture_ = null;
    this.framebuffer_ = null;
    this.size_ = 0;
    this.fileSize_ = fileSize_; //used for stats
    this.width_ = 0;
    this.height_ = 0;
    this.repeat_ = repeat_ || false;
    this.filter_ = filter_ || "linear";

    this.image_ = null;
    this.loaded_ = false;
    this.trilinear_ = false;//true;
    this.core_ = core_;

    if (path_ != null) {
        this.load(path_, null, null, direct_);
    }
};

//destructor
Melown.GpuTexture.prototype.kill = function() {
    this.gl_.deleteTexture(this.texture_);
    
    this.texture_ = null;

    /*
    if (this.core_ != null && this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxTexture_[1][0] ++;
        this.core_.renderer_.statsFluxTexture_[1][1] += this.size_;
    }
    */
};

//! Returns GPU RAM used, in bytes.
Melown.GpuTexture.prototype.size = function() {
    return this.size_;
};

Melown.GpuTexture.prototype.createFromData = function(lx_, ly_, data_, filter_, repeat_) {
    var gl_ = this.gl_;

    this.texture_ = gl_.createTexture();
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture_);

    if (repeat_ == true){
        repeat_ = gl_.REPEAT;
        this.repeat_ = true;
    } else {
        repeat_ = gl_.CLAMP_TO_EDGE;
    }

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, repeat_);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, repeat_);
    var mipmaps_ = false;

    switch (filter_)
    {
    case "linear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        break;
    case "trilinear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR_MIPMAP_LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        mipmaps_ = true;
        break;
    default:
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.NEAREST);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.NEAREST);
        break;
    }

    gl_.pixelStorei(gl_.UNPACK_ALIGNMENT, 1);
    //gl_.pixelStorei(gl_.UNPACK_FLIP_Y_WEBGL, true);

    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, lx_, ly_, 0, gl_.RGBA, gl_.UNSIGNED_BYTE, data_);

    if (mipmaps_ == true) {
        gl_.generateMipmap(gl_.TEXTURE_2D);
    }

    gl_.bindTexture(gl_.TEXTURE_2D, null);

    this.width_ = lx_;
    this.height_ = ly_;
    this.size_ = lx_ * ly_ * 4;
    this.loaded_ = true;
};

Melown.GpuTexture.prototype.createFromImage = function(image_, filter_, repeat_) {
    var gl_ = this.gl_;

    var timer_ = performance.now();

    this.texture_ = gl_.createTexture();
    gl_.bindTexture(gl_.TEXTURE_2D, this.texture_);

    if (repeat_ == true) {
        repeat_ = gl_.REPEAT;
        this.repeat_ = true;
    } else {
        repeat_ = gl_.CLAMP_TO_EDGE;
    }

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, repeat_);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, repeat_);
    var mipmaps_ = false;
    this.filter_ = filter_;

    switch (filter_)
    {
    case "linear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        break;
    case "trilinear":
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.LINEAR_MIPMAP_LINEAR);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.LINEAR);
        mipmaps_ = true;
        break;
    default:
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.NEAREST);
        gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.NEAREST);
        break;
    }

    //gl_.pixelStorei(gl_.UNPACK_ALIGNMENT, 1);
    //gl_.pixelStorei(gl_.UNPACK_FLIP_Y_WEBGL, true);

    if (Melown.noTextures_ != true) {
        gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, gl_.RGBA, gl_.UNSIGNED_BYTE, image_);
        //if (gl_.getError() == 1281) {
          //  gl_ = gl_;
        //}
        //console.log(gl_.getError());

        if (mipmaps_ == true) {
            gl_.generateMipmap(gl_.TEXTURE_2D);
        }
    }

    gl_.bindTexture(gl_.TEXTURE_2D, null);

    this.width_ = image_.naturalWidth;
    this.height_ = image_.naturalHeight;
    this.size_ = image_.naturalWidth * image_.naturalHeight * 4;
    this.loaded_ = true;

    /*
    if (this.core_ != null && this.core_.renderer_!= null) {
        this.core_.renderer_.dirty_ = true;
        this.core_.renderer_.statsCreateTextureTime_ += performance.now() - timer_;
        this.core_.renderer_.statsFluxTexture_[0][0] ++;
        this.core_.renderer_.statsFluxTexture_[0][1] += this.size_;
    }*/
};

Melown.GpuTexture.prototype.load = function(path_, onLoaded_, onError_, direct_) {
    this.image_ = Melown.Http.imageFactory(path_, (function () {
        if (this.core_ != null && this.core_.killed_ == true) {
            return;
        }

        this.createFromImage(this.image_, this.filter_, this.repeat_);
        this.image_ = null;

        if (onLoaded_) {
            onLoaded_();
        }

    }).bind(this), (function () {

        if (this.core_ != null && this.core_.killed_ == true) {
            return;
        }

        if (onError_) {
            onError_();
        }
    }).bind(this),
     
     null, direct_
     
     );

};

Melown.GpuTexture.prototype.createFramebufferFromData = function(lx_, ly_, data_) {
    var gl_ = this.gl_;

    var framebuffer_ = gl_.createFramebuffer();
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, framebuffer_);
    framebuffer_.width = lx_;
    framebuffer_.height = ly_;

    var texture_ = gl_.createTexture();
    gl_.bindTexture(gl_.TEXTURE_2D, texture_);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_S, gl_.CLAMP_TO_EDGE);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_WRAP_T, gl_.CLAMP_TO_EDGE);

    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MIN_FILTER, gl_.NEAREST);
    gl_.texParameteri(gl_.TEXTURE_2D, gl_.TEXTURE_MAG_FILTER, gl_.NEAREST);

    gl_.pixelStorei(gl_.UNPACK_ALIGNMENT, 1);

    gl_.texImage2D(gl_.TEXTURE_2D, 0, gl_.RGBA, lx_, ly_, 0, gl_.RGBA, gl_.UNSIGNED_BYTE, data_);



    var renderbuffer_ = gl_.createRenderbuffer();
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, renderbuffer_);
    gl_.renderbufferStorage(gl_.RENDERBUFFER, gl_.DEPTH_COMPONENT16, lx_, ly_);

    //gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, this.texture_.texture_, 0);
    gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, texture_, 0);

    gl_.framebufferRenderbuffer(gl_.FRAMEBUFFER, gl_.DEPTH_ATTACHMENT, gl_.RENDERBUFFER, renderbuffer_);

    this.width_ = lx_;
    this.height_ = ly_;
    this.size_ = lx_ * ly_ * 4;

    this.texture_ = texture_;
    this.renderbuffer_ = renderbuffer_;
    this.framebuffer_ = framebuffer_;

    //gl_.generateMipmap(gl_.TEXTURE_2D);
/*
    gl_.clearColor(0.0, 1.0, 0.0, 1.0);
    //gl_.enable(gl_.DEPTH_TEST);

    //clear screen
    gl_.viewport(0, 0, lx_, ly_);
    gl_.clear(gl_.COLOR_BUFFER_BIT);// | gl_.DEPTH_BUFFER_BIT);
*/
    gl_.bindTexture(gl_.TEXTURE_2D, null);
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, null);
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, null);
};

Melown.GpuTexture.prototype.createFramebuffer = function(lx_, ly_) {
    if (this.texture_ == null){
        return;
    }

    var gl_ = this.gl_;

    var framebuffer_ = gl_.createFramebuffer();
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, framebuffer_);
    framebuffer_.width = lx_;
    framebuffer_.height = ly_;

    gl_.bindTexture(gl_.TEXTURE_2D, this.texture_);

    var renderbuffer_ = gl_.createRenderbuffer();
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, renderbuffer_);
    gl_.renderbufferStorage(gl_.RENDERBUFFER, gl_.DEPTH_COMPONENT16, lx_, ly_);

    gl_.framebufferTexture2D(gl_.FRAMEBUFFER, gl_.COLOR_ATTACHMENT0, gl_.TEXTURE_2D, this.texture_, 0);
    gl_.framebufferRenderbuffer(gl_.FRAMEBUFFER, gl_.DEPTH_ATTACHMENT, gl_.RENDERBUFFER, renderbuffer_);

/*
    gl_.clearColor(0.0, 1.0, 0.0, 1.0);
    //gl_.enable(gl_.DEPTH_TEST);

    //clear screen
    gl_.viewport(0, 0, lx_, ly_);
//    gl_.clear(gl_.COLOR_BUFFER_BIT | gl_.DEPTH_BUFFER_BIT);
    gl_.clear(gl_.COLOR_BUFFER_BIT);
*/

    gl_.bindTexture(gl_.TEXTURE_2D, null);
    gl_.bindRenderbuffer(gl_.RENDERBUFFER, null);
    gl_.bindFramebuffer(gl_.FRAMEBUFFER, null);

    this.framebuffer_ = framebuffer_;
    this.renderbuffer_ = renderbuffer_;

};


Melown.GpuTexture.prototype.readFramebufferPixels = function(x_, y_, lx_, ly_) {
    if (this.texture_ == null) {
        return;
    }

    this.gpu_.bindTexture(this);
    this.gpu_.setFramebuffer(this);

    var gl_ = this.gl_;

    // Read the contents of the framebuffer (data stores the pixel data)
    var data_ = new Uint8Array(lx_ * ly_ * 4);
    gl_.readPixels(x_, y_, lx_, ly_, gl_.RGBA, gl_.UNSIGNED_BYTE, data_);

    this.gpu_.setFramebuffer(null);

    return data_;
};



