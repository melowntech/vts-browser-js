
import {vec3 as vec3_, mat3 as mat3_, mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';

//get rid of compiler mess
var vec3 = vec3_, mat3 = mat3_, mat4 = mat4_;
var math = math_;

var RendererDraw = function(renderer) {
    this.renderer = renderer;
    this.core = renderer.core;
    this.gpu = renderer.gpu;
    this.gl = renderer.gpu.gl;
    this.rmap = renderer.rmap;
};


RendererDraw.prototype.drawSkydome = function(texture, shader) {
    if (!texture) {
        return;
    }

    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;
    
    var lower = 400; // put the dome a bit lower
    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var domeMat = mat4.create();

    var pos = renderer.camera.getPosition();
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2] - lower), math.scaleMatrixf(Math.min(renderer.camera.getFar()*0.9,600000)), domeMat);

    var mvp = mat4.create();
    mat4.multiply(renderer.camera.getMvpMatrix(), domeMat, mvp);
    mat4.multiply(mvp, normMat, mvp);


    gpu.useProgram(shader, ['aPosition', 'aTexCoord']);
    gpu.bindTexture(texture);

    shader.setSampler('uSampler', 0);
    shader.setMat4('uMVP', mvp);

    gl.depthMask(false);

    renderer.skydomeMesh.draw(shader, 'aPosition', 'aTexCoord');

    gl.depthMask(true);
    gl.enable(gl.CULL_FACE);

    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();
};


RendererDraw.prototype.drawTBall = function(position, size, shader, texture, size2, nocull) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (nocull) {
        gl.disable(gl.CULL_FACE);
    }

    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var pos = [position[0], position[1], position[2] ];

    size = (size != null) ? size : 1.5;

    var domeMat = mat4.create();
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2]), math.scaleMatrix(size, size, size2 || size), domeMat);

    var mvp = mat4.create();
    mat4.multiply(renderer.camera.getMvpMatrix(), domeMat, mvp);
    mat4.multiply(mvp, normMat, mvp);

    gpu.useProgram(shader, ['aPosition', 'aTexCoord']);
    gpu.bindTexture(texture || renderer.redTexture);

    shader.setSampler('uSampler', 0);
    shader.setMat4('uMVP', mvp);

    renderer.skydomeMesh.draw(shader, 'aPosition', 'aTexCoord');

    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();

    if (nocull) {
        gl.enable(gl.CULL_FACE);
    }
};


RendererDraw.prototype.drawBall = function(position, size, size2, shader, params, params2, params3, color, color2, normals) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var pos = [position[0], position[1], position[2] ];

    var domeMat = mat4.create();
    size = size || 1.5;
    size2 = size2 || 1.5;
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2]), math.scaleMatrix(size, size, size2), domeMat);

    var mv = mat4.create();
    mat4.multiply(renderer.camera.getModelviewMatrix(), domeMat, mv);
    mat4.multiply(mv, normMat, mv);
    var proj = renderer.camera.getProjectionMatrix();

    var norm = [0,0,0, 0,0,0, 0,0,0];
    mat4.toInverseMat3(mv, norm);
    mat3.transpose(norm);
    
    gpu.useProgram(shader, ['aPosition']);
    gpu.bindTexture(renderer.redTexture);

    shader.setSampler('uSampler', 0);
    shader.setMat4('uProj', proj);
    shader.setMat4('uMV', mv);
    
    if (normals) {
        shader.setMat3('uNorm', norm);
        gl.cullFace(gl.FRONT);
        //gl.disable(gl.DEPTH_TEST);
    }
    

    if (params) {
        shader.setVec4('uParams', params);
    }

    if (params2) {
        shader.setVec4('uParams2', params2);
    }

    if (params2) {
        shader.setVec4('uParams3', params3);
    }

    if (color) {
        shader.setVec4('uFogColor', color);
    }

    if (color2) {
        shader.setVec4('uFogColor2', color2);
    }

    renderer.atmoMesh.draw(shader, 'aPosition', null /*"aTexCoord"*/);

    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();

    if (normals) {
        gl.cullFace(gl.BACK);
    }
};


RendererDraw.prototype.drawBall2 = function(position, size, shader, nfactor, dir, radius2) {
    var gpu = this.gpu;
    var renderer = this.renderer;

    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var pos = [position[0], position[1], position[2] ];

    var domeMat = mat4.create();
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2]), math.scaleMatrixf(size != null ? size : 1.5), domeMat);

    var mv = mat4.create();
    mat4.multiply(renderer.camera.getModelviewMatrix(), domeMat, mv);
    mat4.multiply(mv, normMat, mv);
    var proj = renderer.camera.getProjectionMatrix();

    var norm = [0,0,0, 0,0,0, 0,0,0];
    mat4.toInverseMat3(mv, norm);
    mat3.transpose(norm);
    
    gpu.useProgram(shader, ['aPosition']);
    gpu.bindTexture(renderer.redTexture);

    shader.setSampler('uSampler', 0);
    shader.setMat4('uProj', proj);
    shader.setMat4('uMV', mv);
    shader.setMat3('uNorm', norm);
    shader.setFloat('uNFactor', nfactor);
    shader.setVec3('uCenter', position);
    shader.setVec2('uRadius', [size, radius2]);

    renderer.atmoMesh.draw(shader, 'aPosition', null /*"aTexCoord"*/);
    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();
};


RendererDraw.prototype.drawLineString = function(points, screenSpace, size, color, depthOffset, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;
    var index = 0, p, i;

    var totalPoints = points.length; 
   
    if (totalPoints > 32) {
        for (i = 0; i < totalPoints; i += 31) {
            p = points.slice(i, i + 32); 
            this.drawLineString(p, screenSpace, size, color, depthOffset, depthTest, transparent, writeDepth, useState);
        }
        return;
    }

    var plineBuffer = renderer.plineBuffer;


    if (screenSpace) { 

        //fill points
        for (i = 0; i < totalPoints; i++) {
            p = points[i];
            plineBuffer[index] = p[0];
            plineBuffer[index+1] = p[1];
            plineBuffer[index+2] = p[2] || 0;
            index += 3;
        }

    } else { //covert points from physical space

        var mvp = renderer.camera.getMvpMatrix();
        var curSize = renderer.curSize;
        var cameraPos = renderer.cameraPosition;

        for (i = 0; i < totalPoints; i++) {
            p = points[i];
            p = mat4.multiplyVec4(mvp, [point[0] - cameraPos[0], point[1] - cameraPos[1], point[2] - cameraPos[2], 1 ]); 

            //project point coords to screen
            if (p[3] != 0) {
                //x and y are in screen pixels
                plineBuffer[index] = ((p[0]/p[3])+1.0)*0.5*curSize[0];
                plineBuffer[index+1] = (-(p[1]/p[3])+1.0)*0.5*curSize[1]; 
                plineBuffer[index+2] = p[2]/p[3]; //depth in meters
            } else {
                plineBuffer[index] = 0;
                plineBuffer[index+1] = 0;
                plineBuffer[index+2] = 0;
            }

            index += 3;
        }
    }

    if (useState !== true) {
        if (depthTest !== true) {
            gl.disable(gl.DEPTH_TEST);
        }
    
        if (transparent) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }
    
        if (writeDepth === false) {
            gl.depthMask(false); 
        }
    
        gl.disable(gl.CULL_FACE);
    }

    var prog = renderer.progLine4;   

    gpu.useProgram(prog, ['aPosition']);
    prog.setMat4('uMVP', renderer.imageProjectionMatrix, depthOffset ? renderer.getZoffsetFactor(depthOffset) : null);
    prog.setVec3('uScale', [(2 / renderer.curSize[0]), (2 / renderer.curSize[1]), size*0.5]);
    prog.setVec4('uColor', (color != null ? color : [255,255,255,255]));
    prog.setVec3('uPoints', plineBuffer);

    renderer.plines.draw(prog, 'aPosition', totalPoints);

    if (useState !== true) {
        if (depthTest !== true) {
            gl.enable(gl.DEPTH_TEST);
        }
    
        if (transparent) {
            gl.disable(gl.BLEND);
        }
    
        if (writeDepth === false) {
            gl.depthMask(false); 
        }
    
        gl.enable(gl.CULL_FACE);
    }
};


//draw 2d image - used for debuging
RendererDraw.prototype.drawImage = function(x, y, lx, ly, texture, color, depth, depthOffset, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (texture == null || renderer.imageProjectionMatrix == null) {
        return;
    }

    if (useState !== true) {
        if (depthTest !== true) {
            gl.disable(gl.DEPTH_TEST);
        }
    
        if (transparent) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }
    
        if (writeDepth === false) {
            gl.depthMask(false); 
        }
    
        gl.disable(gl.CULL_FACE);
    }

    var prog = renderer.progImage;

    gpu.useProgram(prog, ['aPosition']);
    gpu.bindTexture(texture);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute('aPosition'), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);

    prog.setMat4('uData', [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    if (depthOffset) {
        depth = depth * (1 + renderer.getZoffsetFactor(depthOffset) * 2);
    }

    prog.setVec4('uColor', (color != null ? color : [1,1,1,1]));
    prog.setFloat('uDepth', depth);

    gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

    if (useState !== true) {
        if (writeDepth === false) {
            gl.depthMask(true); 
        }
    
        if (depthTest !== true) {
            gl.enable(gl.DEPTH_TEST);
        }
    
        if (transparent) {
            gl.disable(gl.BLEND);
        }
    
        gl.enable(gl.CULL_FACE);
    }
};


RendererDraw.prototype.drawBillboard = function(mvp, texture, color, depthOffset, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (useState !== true) {
        if (depthTest !== true) {
            gl.disable(gl.DEPTH_TEST);
        }
    
        if (transparent) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }
    
        if (writeDepth === false) {
            gl.depthMask(false); 
        }
    
        gl.disable(gl.CULL_FACE);
    }

    var prog = renderer.progImage;

    gpu.useProgram(prog, ['aPosition', 'aTexCoord']);
    gpu.bindTexture(texture);
    prog.setSampler('uSampler', 0);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute('aPosition'), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4('uProjectionMatrix', mvp, depthOffset ? renderer.getZoffsetFactor(depthOffset) : null);

    var x = 0, y = 0, lx = 1, ly = 1;

    prog.setMat4('uData', [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    prog.setVec4('uColor', (color != null ? color : [1,1,1,1]));
    prog.setFloat('uDepth', 0);

    gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

    if (useState !== true) {
        if (writeDepth === false) {
            gl.depthMask(true); 
        }
    
        if (depthTest !== true) {
            gl.enable(gl.DEPTH_TEST);
        }
    
        if (transparent) {
            gl.disable(gl.BLEND);
        }
    
        gl.enable(gl.CULL_FACE);
    }
};


//draw flat 2d image - used for debuging
RendererDraw.prototype.drawFlatImage = function(x, y, lx, ly, texture, color, depth, depthOffset) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (texture == null || renderer.imageProjectionMatrix == null) {
        return;
    }

    var prog = renderer.progImage;

    gpu.useProgram(prog, ['aPosition']);
    gpu.bindTexture(texture);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute('aPosition'), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);

    prog.setMat4('uData', [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    prog.setVec4('uColor', (color != null ? color : [1,1,1,1]));
    prog.setFloat('uDepth', depth != null ? depth : 0);

    gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);
};


//draw 2d text - used for debuging
RendererDraw.prototype.drawText = function(x, y, size, text, color, depth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (renderer.imageProjectionMatrix == null) {
        return;
    }

    if (useState !== true) {
        gl.disable(gl.CULL_FACE);
    
    
        if (depth == null) {
            gl.disable(gl.DEPTH_TEST);
        } else {
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.DEPTH_TEST);
        }
    }

    var prog = renderer.progImage;

    gpu.useProgram(prog, ['aPosition']);
    gpu.bindTexture(renderer.textTexture2);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute('aPosition'), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);
    prog.setVec4('uColor', color);
    prog.setFloat('uDepth', depth != null ? depth : 0);

    var sizeX = size - 1;
    var sizeY = size;

    var sizeX2 = Math.round(size*0.5);

    var texelX = 1 / 256;
    var texelY = 1 / 128;

    var lx = this.getTextSize(size, text) + 2;

    //draw black line before text
    var char = 0;
    var charPosX = (char & 15) << 4;
    var charPosY = (char >> 4) << 4;

    prog.setMat4('uData', [
        x-2, y-2,  (charPosX * texelX), (charPosY * texelY),
        x-2 + lx, y-2,  ((charPosX+15) * texelX), (charPosY * texelY),
        x-2 + lx, y + sizeY+1, ((charPosX + 15) * texelX), ((charPosY+15) * texelY),
        x-2,  y + sizeY+1,  (charPosX * texelX), ((charPosY+15) * texelY) ]);

    gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);
    

    for (var i = 0, li = text.length; i < li; i++) {
        char = text.charCodeAt(i) - 32;
        charPosX = (char & 15) << 4;
        charPosY = (char >> 4) << 4;

        switch(char) {
        case 12:
        case 14:
        case 27: //:
        case 28: //;
        case 64: //'
        case 73: //i
        case 76: //l
        case 84: //t

            prog.setMat4('uData', [
                x, y,  (charPosX * texelX), (charPosY * texelY),
                x + sizeX2, y,  ((charPosX+8) * texelX), (charPosY * texelY),
                x + sizeX2, y + sizeY, ((charPosX + 8) * texelX), ((charPosY+16) * texelY),
                x,  y + sizeY,  (charPosX * texelX), ((charPosY+16) * texelY) ]);

            x += sizeX2;
            break;

        default:

            prog.setMat4('uData', [
                x, y,  (charPosX * texelX), (charPosY * texelY),
                x + sizeX, y,  ((charPosX+15) * texelX), (charPosY * texelY),
                x + sizeX, y + sizeY, ((charPosX + 15) * texelX), ((charPosY+16) * texelY),
                x,  y + sizeY,  (charPosX * texelX), ((charPosY+16) * texelY) ]);

            x += sizeX;
                
            break;
        }

        gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

    }

    if (useState !== true) {
        gl.enable(gl.CULL_FACE);
    
        if (depth == null) {
            gl.enable(gl.DEPTH_TEST);
        }
    }
};


RendererDraw.prototype.getTextSize = function(size, text) {
    var sizeX = size - 1;
    var sizeX2 = Math.round(size*0.5);
    var x = 0;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i) - 32;

        switch(char) {
        case 12:
        case 14:
        case 27: //:
        case 28: //;
        case 64: //'
        case 73: //i
        case 76: //l
        case 84: //t
            x += sizeX2;
            break;

        default:
            x += sizeX;
            break;
        }
    }
    
    return x;
};


RendererDraw.prototype.drawGpuJobs = function() {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    renderer.geoRenderCounter++;

    //setup stencil
    gl.stencilMask(0xFF);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.stencilFunc(gl.EQUAL, 0, 0xFF);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

    var screenPixelSize = [1.0/renderer.curSize[0], 1.0/renderer.curSize[1]];
    var clearPass = 513;
    var clearPassIndex = 0;
    var clearStencilPasses = renderer.clearStencilPasses;
    var jobZBuffer = renderer.jobZBuffer;
    var jobZBufferSize = renderer.jobZBufferSize;
    var onlyHitLayers = renderer.onlyHitLayers;
    var onlyAdvancedHitLayers = renderer.onlyAdvancedHitLayers;

    if (clearStencilPasses.length > 0) {
        clearPass = clearStencilPasses[0];
        clearPassIndex++;
    }

    //draw job buffer and also clean buffer
    for (var i = 0, li = jobZBuffer.length; i < li; i++) {
        var j, lj = jobZBufferSize[i];
        var buffer = jobZBuffer[i];

        if (lj > 0 && i >= clearPass) {
            gl.clear(gl.STENCIL_BUFFER_BIT);

            if (clearStencilPasses.length > clearPassIndex) {
                clearPass = clearStencilPasses[clearPassIndex];
                clearPassIndex++;
            } else {
                clearPass = 513;
            }
        }

        if (onlyHitLayers) {
            if (onlyAdvancedHitLayers) {
                for (j = 0; j < lj; j++) {
                    if (buffer[j].advancedHit) {
                        this.drawGpuJob(gpu, gl, renderer, buffer[j], screenPixelSize, true);
                    }
                }
            } else {
                for (j = 0; j < lj; j++) {
                    var job = buffer[j];
                    if (job.hitable) {
                        this.drawGpuJob(gpu, gl, renderer, job, screenPixelSize);
                        if (job.advancedHit) {
                            renderer.advancedPassNeeded = true;
                        }
                    }
                }
            }
        } else {
            for (j = 0; j < lj; j++) {
                this.drawGpuJob(gpu, gl, renderer, buffer[j], screenPixelSize);
            }
        }
    }
};


RendererDraw.prototype.clearJobBuffer = function() {
    var renderer = this.renderer;
    var jobZBuffer = renderer.jobZBuffer;
    var jobZBufferSize = renderer.jobZBufferSize;

    //clean job buffer
    for (var i = 0, li = jobZBuffer.length; i < li; i++) {
        var lj = jobZBufferSize[i];
        var buffer = jobZBuffer[i];

        for (var j = 0; j < lj; j++) {
            buffer[j] = null;
        }

        jobZBufferSize[i] = 0;
    }
};


RendererDraw.prototype.paintGL = function() {
    var renderer = this.renderer;

    this.gpu.clear(true, false);

    if (!renderer.onlyLayers) {
        if (!renderer.onlyDepth && !renderer.onlyHitLayers) {
            this.drawSkydome();
        }
    }
};


RendererDraw.prototype.drawGpuJob = function(gpu, gl, renderer, job, screenPixelSize, advancedHitPass) {
    var mvp = job.mvp, prog, texture;
    var vertexPositionAttribute, vertexTexcoordAttribute,
        vertexNormalAttribute, vertexOriginAttribute, vertexElementAttribute;

    if (!job.ready) {
        return;
    }

    if (job.state != 0) {
        var id = job.eventInfo['#id'];

        if (id != null && renderer.hoverFeature != null) {
            if (job.state == 1){  // 1 = no hover state

                if (renderer.hoverFeature[0]['#id'] == id) { //are we hovering over feature?
                    return;
                }

            } else { // 2 = hover state

                if (renderer.hoverFeature[0]['#id'] != id) { //are we hovering over feature?
                    return;
                }

            }
        } else { //id id provided
            if (job.state == 2) { //skip hover style
                return;
            }
        }
    }

    var hitmapRender = job.hitable && renderer.onlyHitLayers;
    var screenPixelSize2, color = job.color;

    if (hitmapRender) {
        var c = renderer.hoverFeatureCounter;
        //color = [(c&255)/255, ((c>>8)&255)/255, ((c>>16)&255)/255, 1];
        color = [(c&255)/255, ((c>>8)&255)/255, 0, 0];
        renderer.hoverFeatureList[c] = [job.eventInfo, job.center, job.clickEvent, job.hoverEvent, job.enterEvent, job.leaveEvent, advancedHitPass];
        renderer.hoverFeatureCounter++;
    }

    switch(job.type) {
    case 'flat-line':
        gpu.setState(hitmapRender ? renderer.stencilLineHitState : renderer.stencilLineState);

        prog = advancedHitPass ? job.program2 : job.program;
        //prog = advancedHitPass ? job.program2 : renderer.progLineWireframe;

        gpu.useProgram(prog, advancedHitPass ? ['aPosition', 'aElement'] : ['aPosition']);
        //gpu.useProgram(prog, advancedHitPass ? ['aPosition', 'aElement'] : ['aPosition', 'aBarycentric']);


        prog.setVec4('uColor', color);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));

        vertexPositionAttribute = prog.getAttribute('aPosition');

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        if (advancedHitPass) {
            vertexElementAttribute = prog.getAttribute('aElement');
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexElementBuffer);
            gl.vertexAttribPointer(vertexElementAttribute, job.vertexElementBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        //debug only 
        /*
        var barycentericAttribute = prog.getAttribute('aBarycentric');
        gl.bindBuffer(gl.ARRAY_BUFFER, gpu.barycentricBuffer);
        gl.vertexAttribPointer(barycentericAttribute, gpu.barycentricBuffer.itemSize, gl.FLOAT, false, 0, 0);
        */

        //draw polygons
        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

        break;

    case 'flat-rline':
    case 'flat-tline':
    case 'pixel-line':
    case 'pixel-tline':
        gpu.setState(hitmapRender ? renderer.stencilLineHitState : renderer.stencilLineState);
            
        prog = advancedHitPass ? job.program2 : job.program;
        texture = null;
        var textureParams = [0,0,0,0];
        screenPixelSize2 = screenPixelSize;

        if (hitmapRender) {
            if (job.type == 'pixel-tline') {
                if (job.widthByRatio) {
                    screenPixelSize2 = [ screenPixelSize[0] * renderer.curSize[1], screenPixelSize[1] * renderer.curSize[1]];
                }
                prog = advancedHitPass ? this.renderer.progELine3 : this.renderer.progLine3;
                if (!prog.isReady()) {
                    return;
                }
            }
        }

        if (job.type != 'pixel-line') {

            if (job.type == 'flat-rline') {
                textureParams = [0, 0, 0, job.widthByRatio ? renderer.cameraViewExtent : 1];
            } else {
                if (hitmapRender) {
                    texture = renderer.whiteTexture;

                    if (job.type == 'flat-tline' || job.type == 'flat-rline') {
                        textureParams = [0, 0, 0, job.widthByRatio ? renderer.cameraViewExtent : 1];
                    }

                } else {
                    var t = job.texture;
                    if (t == null || t[0] == null) {
                        return;
                    }

                    texture = t[0];
                    textureParams = [0, t[1]/t[0].height, (t[1]+t[2])/t[0].height, job.widthByRatio ? renderer.cameraViewExtent : 1];

                    if (job.type == 'flat-tline' || job.type == 'flat-rline') {
                        if (job.widthByRatio) {
                            textureParams[0] = 1/(renderer.cameraViewExtent2*job.lineWidth)/(texture.width/t[2]);
                        } else {
                            textureParams[0] = 1/job.lineWidth/(texture.width/t[2]);    
                        }
                    } else {
                        if (job.widthByRatio) {
                            textureParams[0] = 1/(renderer.cameraViewExtent2/renderer.curSize[1])/(texture.width/t[2]);
                            textureParams[0] /= (renderer.curSize[1]*job.lineWidth*0.5);
                            //textureParams[3] = renderer.curSize[1]*(1.0/job.lineWidth)*0.5;
                            textureParams[3] = renderer.curSize[1];
                        } else {
                            textureParams[0] = 1/(renderer.cameraViewExtent2/renderer.curSize[1])/(texture.width/t[2]);
                            textureParams[0] /= (job.lineWidth*0.5);
                            textureParams[3] = 1;
                        }    
                    }
                }

                if (!texture.loaded) {
                    return;
                }

                gpu.bindTexture(texture);
            }

        } else if (job.widthByRatio) {
            screenPixelSize2 = [ screenPixelSize[0] * renderer.curSize[1], screenPixelSize[1] * renderer.curSize[1]];
        }

        gpu.useProgram(prog, advancedHitPass ? ['aPosition','aNormal','aElement'] : ['aPosition','aNormal']);

        prog.setVec4('uColor', color);
        prog.setVec2('uScale', screenPixelSize2);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));

        if (job.type != 'pixel-line') {
            if (job.background != null) {
                prog.setVec4('uColor2', hitmapRender ? [0,0,0,0] : job.background);
            }
            prog.setVec4('uParams', textureParams);
            prog.setSampler('uSampler', 0);
        }

        vertexPositionAttribute = prog.getAttribute('aPosition');
        vertexNormalAttribute = prog.getAttribute('aNormal');

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //bind vetex normals
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexNormalBuffer);
        gl.vertexAttribPointer(vertexNormalAttribute, job.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

        if (advancedHitPass) {
            vertexElementAttribute = prog.getAttribute('aElement');
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexElementBuffer);
            gl.vertexAttribPointer(vertexElementAttribute, job.vertexElementBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        //draw polygons
        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

        break;

    case 'line-label':
        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);

        texture = hitmapRender ? renderer.whiteTexture : renderer.font.texture;

        prog = job.program; //renderer.progText;

        gpu.bindTexture(texture);

        gpu.useProgram(prog, ['aPosition', 'aTexCoord']);
        prog.setSampler('uSampler', 0);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));
        prog.setVec4('uVec', renderer.labelVector);
        prog.setVec4('uColor', color);
            //prog.setVec2("uScale", screenPixelSize);

        vertexPositionAttribute = prog.getAttribute('aPosition');
        vertexTexcoordAttribute = prog.getAttribute('aTexCoord');

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //bind vetex texcoords
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);
        gl.vertexAttribPointer(vertexTexcoordAttribute, job.vertexTexcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //draw polygons
        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

        break;

    case 'icon':
    case 'label':
        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);

        texture = hitmapRender ? renderer.whiteTexture : job.texture;

        if (!texture.loaded) {
            return;
        }

        var p1, p2, camVec, l, ll;

        if (job.culling != 180) {
            p2 = job.center;
            p1 = renderer.cameraPosition;
            camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

            if (job.visibility) {
                l = vec3.length(camVec);

                switch(job.visibility.length) {
                    case 1:
                        if (l > job.visibility[0]) {
                            return;
                        }
                        break;

                    case 2:
                        ll = l * renderer.localViewExtentFactor;
                        if (ll < job.visibility[0] || ll > job.visibility[1]) {
                            return;
                        }

                        break;

                    case 4:
                        ll = l * renderer.localViewExtentFactor;

                        var diameter = job.visibility[0] * job.visibility[1];

                        //dinfo = [l, ll, diameter, (job.visibility[2] * ll), (job.visibility[3] * ll)];

                        if (diameter < (job.visibility[2] * ll) || diameter > (job.visibility[3] * ll)) {
                            return;
                        }

                        break;
                }

                l = 1/l;
                camVec[0] *= l;                       
                camVec[1] *= l;                       
                camVec[2] *= l;                       
            } else {
                vec3.normalize(camVec);
            }
                
            job.normal = [0,0,0];
            vec3.normalize(job.center, job.normal);
                
            var a = -vec3.dot(camVec, job.normal);
            if (a < Math.cos(math.radians(job.culling))) {
                return;
            }
        } else if (job.visibility) {

            p2 = job.center;
            p1 = renderer.cameraPosition;
            camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
            l = vec3.length(camVec);

            switch(job.visibility.length) {
                case 1:
                    if (l > job.visibility[0]) {
                        return;
                    }
                    break;

                case 2:
                    l *= renderer.localViewExtentFactor;
                    if (l < job.visibility[0] || l > job.visibility[1]) {
                        return;
                    }

                    break;

                case 4:
                    l *= renderer.localViewExtentFactor;

                    var diameter = job.visibility[0] * job.visibility[1];
                    if (diameter < (job.visibility[2] * l) || diameter > (job.visibility[3] * l)) {
                        return;
                    }

                    break;
            }
        }
            
        var stickShift = 0, pp;

        if (job.stick[0] != 0) {
            var s = job.stick;
            stickShift = renderer.cameraTiltFator * s[0];
                
            if (stickShift < s[1]) {
                stickShift = 0;
            } else if (s[2] != 0) {
                pp = renderer.project2(job.center, renderer.camera.mvp, renderer.cameraPosition);
                pp[0] = Math.round(pp[0]);

                this.drawLineString([[pp[0], pp[1], pp[2]], [pp[0], pp[1]-stickShift, pp[2]]], true, s[2], [s[3], s[4], s[5], s[6]], null, null, null, null, true);
            }
        }

        if (job.noOverlap) {
            if (!pp) {
                pp = renderer.project2(job.center, renderer.camera.mvp, renderer.cameraPosition);
            }

            var o = job.noOverlap;

            if (!renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3])) {
                return;
            }

            if (renderer.drawLabelBoxes) {
                this.drawLineString([[pp[0]+o[0], pp[1]+o[1], 0.5], [pp[0]+o[2], pp[1]+o[1], 0.5],
                                     [pp[0]+o[2], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[1], 0.5]], true, 1, [255, 0, 0, 255], null, true, null, null, null);
            }
        }

        /*if (dinfo) { //debug only
            if (!pp) {
                pp = renderer.project2(job.center, renderer.camera.mvp, renderer.cameraPosition);
            }

            var stmp = "" + dinfo[0].toFixed(0) + " " + dinfo[1].toFixed(0) + " " + dinfo[2].toFixed(0) + " " + dinfo[3].toFixed(0) + " " + dinfo[4].toFixed(0);
            this.drawText(Math.round(pp[0]-this.getTextSize(10,stmp)*0.5), Math.round(pp[1]), 10, stmp, [1,1,1,1], 0);
        }*/

        prog = job.program; //renderer.progIcon;

        gpu.bindTexture(texture);

        gpu.useProgram(prog, ['aPosition', 'aTexCoord', 'aOrigin']);
        prog.setSampler('uSampler', 0);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));
        prog.setVec4('uScale', [screenPixelSize[0], screenPixelSize[1], (job.type == 'label' ? 1.0 : 1.0 / texture.width), stickShift*2]);
        prog.setVec4('uColor', color);

        vertexPositionAttribute = prog.getAttribute('aPosition');
        vertexTexcoordAttribute = prog.getAttribute('aTexCoord');
        vertexOriginAttribute = prog.getAttribute('aOrigin');

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //bind vetex texcoordds
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);
        gl.vertexAttribPointer(vertexTexcoordAttribute, job.vertexTexcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //bind vetex origin
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexOriginBuffer);
        gl.vertexAttribPointer(vertexOriginAttribute, job.vertexOriginBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //draw polygons
        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

        break;
    }
};

export default RendererDraw;
