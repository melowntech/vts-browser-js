

var GpuDevice = function(div, size, keepFrameBuffer, antialias) {
    this.div = div;
    this.canvas =  null;
    this.curSize = size;
    this.currentProgram = null;
    this.maxAttributesCount = 8;
    this.newAttributes = new Uint8Array(this.maxAttributesCount);
    this.enabledAttributes = new Uint8Array(this.maxAttributesCount);
    this.noTextures = false;
    this.barycentricBuffer = null;

    this.defaultState = this.createState({});
    this.currentState = this.defaultState;
    this.currentOffset = 0; //used fot direct offset

    this.keepFrameBuffer = (keepFrameBuffer == null) ? false : keepFrameBuffer;
    this.antialias = antialias ? true : false;
};


GpuDevice.prototype.init = function() {
    this.canvas = document.createElement("canvas");

    if (this.canvas == null) {
        //canvas not supported
        return;
    }

    this.canvas.width = this.curSize[0];
    this.canvas.height = this.curSize[1];
    this.canvas.style.display = "block";

    if (this.canvas.getContext == null) {
        //canvas not supported
        return;
    }

    try {
        this.gl = this.canvas.getContext("webgl", {preserveDrawingBuffer: this.keepFrameBuffer, antialias: this.antialias, stencil: true}) || this.canvas.getContext("experimental-webgl", {preserveDrawingBuffer: this.keepFrameBuffer});
    } catch(e) {
        //webgl not supported
    }

    if (!this.gl) {
        //webgl not supported
        return;
    }

    this.gl.getExtension('OES_standard_derivatives');

    this.div.appendChild(this.canvas);

    this.gl.viewportWidth = this.canvas.width;
    this.gl.viewportHeight = this.canvas.height;

    this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    this.gl.enable(this.gl.DEPTH_TEST);

    //clear screen
    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
};


GpuDevice.prototype.kill = function() {
    this.div.removeChild(this.canvas);
    delete this.canvas;
    this.canvas = null;
};


GpuDevice.prototype.resize = function(size, skipCanvas) {
    this.curSize = size;

    if (this.canvas != null && skipCanvas != true) {
        this.canvas.width = this.curSize[0];
        this.canvas.height = this.curSize[1];
    }

    if (this.gl != null) {
        this.gl.viewportWidth = this.canvas.width;
        this.gl.viewportHeight = this.canvas.height;
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
    
//    if (this.keepFrameBuffer) {
//        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT );
//    } else {
        this.gl.clear((clearColor ? this.gl.COLOR_BUFFER_BIT : 0) |
                       (clearDepth ? this.gl.DEPTH_BUFFER_BIT : 0) );
//    }
};

//aPosition, attrTexCoord, attrTexCoord2, attrBarycentric, attrNormal, attrNormal2, attrNormal3

GpuDevice.prototype.useProgram = function(program, attributes, nextSampler) {
    if (this.currentProgram != program) {
        this.gl.useProgram(program.program);
        this.currentProgram = program;

        program.setSampler("uSampler", 0);
        
        if (nextSampler) {
            program.setSampler("uSampler2", 1);
        }

        var newAttributes = this.newAttributes;
        var enabledAttributes = this.enabledAttributes; 
       
        //reset new attributes list
        for (var i = 0, li = newAttributes.length; i < li; i++){
            newAttributes[i] = 0;
        }
        
        //
        for (var i = 0, li = attributes.length; i < li; i++){
            var index = program.getAttribute(attributes[i]);
            
            if (index != -1){
                newAttributes[index] = 1;
            }
        }

        //enable or disable current attributes according to new attributes list
        for (var i = 0, li = newAttributes.length; i < li; i++){
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
    if (texture.loaded == false) {
        return;
    }

    this.gl.activeTexture(id ? this.gl.TEXTURE1 : this.gl.TEXTURE0);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
};

//GpuDeviceSupported = function() {
//    return true;
//};

GpuDevice.prototype.setFramebuffer = function(texture) {
    if (texture != null) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, texture.framebuffer);
        //utResizeViewport(texture.framebuffer.width, texture.framebuffer.height, true);
    } else {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
};


GpuDevice.prototype.createState = function(state) {
    if (state.blend == null) { state.blend = false; }
    if (state.stencil == null) { state.stencil = false; }
    //if (state.zoffset == null) { state.zoffset = 0; }
    if (state.zwrite == null) { state.zwrite = true; }
    if (state.ztest == null) { state.ztest = true; }
    if (state.zequal == null) { state.zequal = false; }
    if (state.culling == null) { state.culling = true; }

    return state;
};


GpuDevice.prototype.setState = function(state, directOffset) {
    /*
    if (this.currentState == state) {

        if (directOffset != null) {
            //if (directOffset != this.currentOffset) {
                this.currentOffset = directOffset;
                this.gl.polygonOffset(-1.0, directOffset);
            //}
        }

        return;
    }

    //this.gl.polygonOffset(-1.0, 0);
    */

    if (!state) {
        return;
    }

    var gl = this.gl;
    var currentState = this.currentState;
    //directOffset = directOffset || state.zoffset;

    if (currentState.blend != state.blend) {
        if (state.blend == true) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        } else {
            gl.disable(gl.BLEND);
        }
    }

    if (currentState.stencil != state.stencil) {
        if (state.stencil == true) {
            gl.enable(gl.STENCIL_TEST);
        } else {
            gl.disable(gl.STENCIL_TEST);
        }
    }
/*
    if (currentState.zoffset != directOffset) {
        if (directOffset != 0) {
            gl.polygonOffset(-1.0, directOffset);
            gl.enable(gl.POLYGON_OFFSET_FILL);
        } else {
            gl.disable(gl.POLYGON_OFFSET_FILL);
        }
        this.currentOffset = directOffset;
    }
*/
    if (currentState.zwrite != state.zwrite) {
        if (state.zwrite == true) {
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
        if (state.culling == true) {
            gl.enable(gl.CULL_FACE);
        } else {
            gl.disable(gl.CULL_FACE);
        }
    }

    this.currentState = state;
};


export default GpuDevice;




