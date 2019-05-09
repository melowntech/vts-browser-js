
import {utils as utils_} from '../../utils/utils';

//get rid of compiler mess
var utils = utils_;

var GpuTexture = function(gpu, path, core, fileSize, direct, repeat, filter, keepImage, onLoaded, onError) {
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.texture = null;
    this.framebuffer = null;
    this.size = 0;
    this.fileSize = fileSize; //used for stats
    this.width = 0;
    this.height = 0;
    this.repeat = repeat || false;
    this.filter = filter || 'linear';

    this.image = null;
    this.loaded = false;
    this.trilinear = false;//true;
    this.core = core;

    if (path != null) {
        this.load(path, onLoaded, onError, direct, keepImage);
    }
};

//destructor
GpuTexture.prototype.kill = function() {
    this.gl.deleteTexture(this.texture);
    
    this.texture = null;
};

// Returns GPU RAM used, in bytes.
GpuTexture.prototype.getSize = function() {
    return this.size;
};

GpuTexture.prototype.createFromData = function(lx, ly, data, filter, repeat) {
    var gl = this.gl;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (repeat){
        repeat = gl.REPEAT;
        this.repeat = true;
    } else {
        repeat = gl.CLAMP_TO_EDGE;
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat);
    var mipmaps = false;

    switch (filter) {
    case 'linear':
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        break;
    case 'trilinear':
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        mipmaps = true;
        break;
    default:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        break;
    }

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lx, ly, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    if (mipmaps) {
        gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.width = lx;
    this.height = ly;
    this.size = lx * ly * 4;
    this.loaded = true;
};

GpuTexture.prototype.createFromImage = function(image, filter, repeat, aniso) {
    var gl = this.gl;

    //filter = 'trilinear'; aniso = null; this.gpu.anisoLevel = 0;
    var width = image.naturalWidth;
    var height = image.naturalHeight;
    var data = image;

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    if (repeat) {
        repeat = gl.REPEAT;
        this.repeat = true;
    } else {
        repeat = gl.CLAMP_TO_EDGE;
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, repeat);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, repeat);
    var mipmaps = false;
    this.filter = filter;

    switch (filter) {
    case 'linear':
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        break;
    case 'trilinear':
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        mipmaps = true;
        break;
    default:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        break;
    }

    //resize image to nearest power of two
    if ((this.repeat || mipmaps) && (!utils.isPowerOfTwo(width) || !utils.isPowerOfTwo(height))) {
        width = utils.nearestPowerOfTwo(width);
        height = utils.nearestPowerOfTwo(height);
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, width, height); 
        data = canvas;
    }

    var gpu = this.gpu;

    if (gpu.anisoLevel) {
        gl.texParameterf(gl.TEXTURE_2D, gpu.anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, gpu.anisoLevel);
    }

    if (gpu.noTextures !== true) { //why is it here and not at the beginig of the code?
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);

        if (mipmaps) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.width = width;
    this.height = height;
    this.size = width * height * 4;
    this.loaded = true;
};

GpuTexture.prototype.load = function(path, onLoaded, onError, direct, keepImage) {
    this.image = utils.loadImage(path, (function () {
        if (this.core != null && this.core.killed) {
            return;
        }

        this.createFromImage(this.image, this.filter, this.repeat);
        if (!keepImage) {
            this.image = null;
        }

        if (onLoaded) {
            onLoaded();
        } else {
            if (this.core.map && this.core.map.markDirty) {
                this.core.map.markDirty();
            }
        }

    }).bind(this), (function () {

        if (this.core != null && this.core.killed) {
            return;
        }

        if (onError) {
            onError();
        }
    }).bind(this),
     
     null, direct
     
     );

};


GpuTexture.prototype.createFramebufferFromData = function(lx, ly, data) {
    var gl = this.gl;

    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = lx;
    framebuffer.height = ly;

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, lx, ly, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);



    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, lx, ly);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    this.width = lx;
    this.height = ly;
    this.size = lx * ly * 4;

    this.texture = texture;
    this.renderbuffer = renderbuffer;
    this.framebuffer = framebuffer;

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};


GpuTexture.prototype.createFramebuffer = function(lx, ly) {
    if (this.texture == null){
        return;
    }

    var gl = this.gl;

    var framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    framebuffer.width = lx;
    framebuffer.height = ly;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, lx, ly);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.framebuffer = framebuffer;
    this.renderbuffer = renderbuffer;
};


GpuTexture.prototype.readFramebufferPixels = function(x, y, lx, ly, fastMode, data) {
    if (this.texture == null) {
        return;
    }

    this.gpu.bindTexture(this);

    if (!fastMode) {
        this.gpu.setFramebuffer(this);
    }

    var gl = this.gl;

    // Read the contents of the framebuffer (data stores the pixel data)
    if (!data) {
        data = new Uint8Array(lx * ly * 4);        
    }
    gl.readPixels(x, y, lx, ly, gl.RGBA, gl.UNSIGNED_BYTE, data);

    if (!fastMode) {
        this.gpu.setFramebuffer(null);
    }

    return data;
};

export default GpuTexture;


