

var GpuDevice = function(renderer, div, size, keepFrameBuffer, antialias, aniso) {
    this.renderer = renderer;
    this.div = div;
    this.canvas =  null;
    this.curSize = size;
    this.currentProgram = null;
    this.maxAttributesCount = 8;
    this.newAttributes = new Uint8Array(this.maxAttributesCount);
    this.enabledAttributes = new Uint8Array(this.maxAttributesCount);
    this.noTextures = false;
    this.barycentricBuffer = null;
   
    //state of device when first initialized
    this.defaultState = this.createState({blend:false, stencil:false, zequal: false, ztest:false, zwrite: false, culling:false}); 
    this.currentState = this.defaultState;
    this.currentOffset = 0; //used fot direct offset

    this.keepFrameBuffer = (keepFrameBuffer == null) ? false : keepFrameBuffer;
    this.antialias = antialias ? true : false;
    this.anisoLevel = aniso;
};


GpuDevice.prototype.init = function() {
    var canvas = document.createElement('canvas');

    if (canvas == null) {
        //canvas not supported
        return;
    }

    this.canvas = canvas;

    canvas.width = this.curSize[0];
    canvas.height = this.curSize[1];
    canvas.style.display = 'block';

    if (canvas.getContext == null) {
        //canvas not supported
        return;
    }

    canvas.addEventListener("webglcontextlost", this.contextLost.bind(this), false);
    canvas.addEventListener("webglcontextrestored", this.contextRestored.bind(this), false);

    var gl;

    try {
        gl = canvas.getContext('webgl', {preserveDrawingBuffer: this.keepFrameBuffer, antialias: this.antialias, stencil: true}) || canvas.getContext('experimental-webgl', {preserveDrawingBuffer: this.keepFrameBuffer});
    } catch(e) {
        //webgl not supported
    }

    if (!gl) {
        //webgl not supported
        return;
    }

    this.gl = gl;

    if (!gl.getExtension('OES_standard_derivatives')) {
    }

    this.anisoExt = (
      gl.getExtension('EXT_texture_filter_anisotropic') ||
      gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
      gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic')
    );

    if (this.anisoExt) {
        this.maxAniso = gl.getParameter(this.anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

        if (this.anisoLevel) {
            if (this.anisoLevel == -1) {
                this.anisoLevel = this.maxAniso;
            } else {
                this.anisoLevel = Math.min(this.anisoLevel, this.maxAniso);
            }
        }
    } else {
        this.maxAniso = 0;
        this.anisoLevel = 0;
    }

    this.div.appendChild(canvas);

    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //gl.enable(gl.DEPTH_TEST);

    //initial state
    gl.disable(gl.BLEND);

    gl.disable(gl.STENCIL_TEST);
    gl.depthMask(false);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.disable(gl.CULL_FACE);

    //clear screen
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};


GpuDevice.prototype.kill = function() {
    this.div.removeChild(this.canvas);
    delete this.canvas;
    this.canvas = null;
};


GpuDevice.prototype.contextLost = function(event) {
    event.preventDefault();
    this.renderer.core.contextLost = true;
    this.renderer.core.callListener('gpu-context-lost', {});
};


GpuDevice.prototype.contextRestored = function() {
    this.renderer.core.callListener('gpu-context-restored', {});
};


GpuDevice.prototype.resize = function(size, skipCanvas) {
    this.curSize = size;
    var canvas = this.canvas, gl = this.gl;

    if (canvas != null && skipCanvas !== true) {
        canvas.width = this.curSize[0];
        canvas.height = this.curSize[1];
    }

    if (gl != null) {
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
};


GpuDevice.prototype.setAniso = function(aniso) {
    if (this.anisoExt) {
        if (this.anisoLevel) {
            if (aniso == -1) {
                this.anisoLevel = this.maxAniso;
            } else {
                this.anisoLevel = Math.min(aniso, this.maxAniso);
            }
        }
    }
};


GpuDevice.prototype.getCanvas = function() {
    return this.canvas;
};


GpuDevice.prototype.setViewport = function() {
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
};


GpuDevice.prototype.clear = function(clearDepth, clearColor, color) {
    if (color != null) {
        this.gl.clearColor(color[0]/255, color[1]/255, color[2]/255, color[3]/255);
    }
    
    this.gl.clear((clearColor ? this.gl.COLOR_BUFFER_BIT : 0) |
                  (clearDepth ? this.gl.DEPTH_BUFFER_BIT : 0) );
};


GpuDevice.prototype.useProgram = function(program, attributes, nextSampler) {
    if (this.currentProgram != program) {
        this.gl.useProgram(program.program);
        this.currentProgram = program;

        program.setSampler('uSampler', 0);
        
        if (nextSampler) {
            program.setSampler('uSampler2', 1);
        }

        var newAttributes = this.newAttributes;
        var enabledAttributes = this.enabledAttributes; 
       
        //reset new attributes list
        for (var i = 0, li = newAttributes.length; i < li; i++){
            newAttributes[i] = 0;
        }
        
        for (i = 0, li = attributes.length; i < li; i++){
            var index = program.getAttribute(attributes[i]);
            
            if (index != -1){
                newAttributes[index] = 1;
            }
        }

        //enable or disable current attributes according to new attributes list
        for (i = 0, li = newAttributes.length; i < li; i++){
            if (enabledAttributes[i] != newAttributes[i]) {
                if (newAttributes[i]) {
                    this.gl.enableVertexAttribArray(i);
                    enabledAttributes[i] = 1;
                } else {
                    this.gl.disableVertexAttribArray(i);
                    enabledAttributes[i] = 0;
                }
            }
        }
    }
};


GpuDevice.prototype.bindTexture = function(texture, id) {
    if (!texture.loaded) {
        return;
    }

    this.gl.activeTexture(id ? this.gl.TEXTURE1 : this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
};


GpuDevice.prototype.setFramebuffer = function(texture) {
    if (texture != null) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, texture.framebuffer);
    } else {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
};


GpuDevice.prototype.createState = function(state) {
    if (state.blend == null) { state.blend = false; }
    if (state.stencil == null) { state.stencil = false; }
    if (state.zwrite == null) { state.zwrite = true; }
    if (state.ztest == null) { state.ztest = true; }
    if (state.zequal == null) { state.zequal = false; }
    if (state.culling == null) { state.culling = true; }

    return state;
};


GpuDevice.prototype.setState = function(state) {
    if (!state) {
        return;
    }

    var gl = this.gl;
    var currentState = this.currentState;

    if (currentState.blend != state.blend) {
        if (state.blend) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }
    }

    if (currentState.stencil != state.stencil) {
        if (state.stencil) {
            gl.enable(gl.STENCIL_TEST);
        } else {
            gl.disable(gl.STENCIL_TEST);
        }
    }

    if (currentState.zwrite != state.zwrite) {
        if (state.zwrite) {
            gl.depthMask(true);
        } else {
            gl.depthMask(false);
        }
    }

    if (currentState.ztest != state.ztest) {
        if (state.ztest != 0) {
            gl.enable(gl.DEPTH_TEST);
        } else {
            gl.disable(gl.DEPTH_TEST);
        }
    }

    if (currentState.zequal != state.zequal) {
        if (state.zequal != 0) {
            gl.depthFunc(gl.LEQUAL);
        } else {
            gl.depthFunc(gl.LESS);
        }
    }

    if (currentState.culling != state.culling) {
        if (state.culling) {
            gl.enable(gl.CULL_FACE);
        } else {
            gl.disable(gl.CULL_FACE);
        }
    }

    this.currentState = state;
};


export default GpuDevice;




