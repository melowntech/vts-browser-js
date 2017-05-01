
import {utils as utils_} from '../../utils/utils';

//get rid of compiler mess
var utils = utils_;

var GpuTexture = function(gpu, path, core, fileSize, direct, repeat, filter) {
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
        this.load(path, null, null, direct);
    }
};

//destructor
GpuTexture.prototype.kill = function() {
    this.gl.deleteTexture(this.texture);
    
    this.texture = null;

    /*
    if (this.core != null && this.core.renderer != null) {
        this.core.renderer.statsFluxTexture[1][0] ++;
        this.core.renderer.statsFluxTexture[1][1] += this.size;
    }
    */
};

// Returns GPU RAM used, in bytes.
GpuTexture.prototype.size = function() {
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
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

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

GpuTexture.prototype.createFromImage = function(image, filter, repeat) {
    var gl = this.gl;

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

    //gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (this.gpu.noTextures !== true) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        //if (gl.getError() == 1281) {
          //  gl = gl;
        //}
        //console.log(gl.getError());

        if (mipmaps) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
    }

    gl.bindTexture(gl.TEXTURE_2D, null);

    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
    this.size = image.naturalWidth * image.naturalHeight * 4;
    this.loaded = true;

    /*
    if (this.core != null && this.core.renderer!= null) {
        this.core.renderer.dirty = true;
        this.core.renderer.statsCreateTextureTime += performance.now() - timer;
        this.core.renderer.statsFluxTexture[0][0] ++;
        this.core.renderer.statsFluxTexture[0][1] += this.size;
    }*/
};

GpuTexture.prototype.load = function(path, onLoaded, onError, direct) {
    this.image = utils.loadImage(path, (function () {
        if (this.core != null && this.core.killed) {
            return;
        }

        this.createFromImage(this.image, this.filter, this.repeat);
        this.image = null;

        if (onLoaded) {
            onLoaded();
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

    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture.texture, 0);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);

    this.width = lx;
    this.height = ly;
    this.size = lx * ly * 4;

    this.texture = texture;
    this.renderbuffer = renderbuffer;
    this.framebuffer = framebuffer;

    //gl.generateMipmap(gl.TEXTURE_2D);
/*
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    //gl.enable(gl.DEPTH_TEST);

    //clear screen
    gl.viewport(0, 0, lx, ly);
    gl.clear(gl.COLOR_BUFFER_BIT);// | gl.DEPTH_BUFFER_BIT);
*/
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

/*
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    //gl.enable(gl.DEPTH_TEST);

    //clear screen
    gl.viewport(0, 0, lx, ly);
//    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);
*/

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    this.framebuffer = framebuffer;
    this.renderbuffer = renderbuffer;

};


GpuTexture.prototype.readFramebufferPixels = function(x, y, lx, ly) {
    if (this.texture == null) {
        return;
    }

    this.gpu.bindTexture(this);
    this.gpu.setFramebuffer(this);

    var gl = this.gl;

    // Read the contents of the framebuffer (data stores the pixel data)
    var data = new Uint8Array(lx * ly * 4);
    gl.readPixels(x, y, lx, ly, gl.RGBA, gl.UNSIGNED_BYTE, data);

    this.gpu.setFramebuffer(null);

    return data;
};

export default GpuTexture;


