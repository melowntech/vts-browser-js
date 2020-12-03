
import {vec3 as vec3_, mat3 as mat3_, mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';
import {processGMap as processGMap_, processGMap4 as processGMap4_, processGMap5 as processGMap5_,
        processGMap6 as processGMap6_, processGMap7 as processGMap7_, radixDepthSortFeatures as radixDepthSortFeatures_ } from './gmap';

//get rid of compiler mess
var vec3 = vec3_, mat3 = mat3_, mat4 = mat4_;
var math = math_;
var processGMap = processGMap_;
var processGMap4 = processGMap4_;
var processGMap5 = processGMap5_;
var processGMap6 = processGMap6_;
var processGMap7 = processGMap7_;
var radixDepthSortFeatures = radixDepthSortFeatures_;


var RendererDraw = function(renderer) {
    this.renderer = renderer;
    this.core = renderer.core;
    this.gpu = renderer.gpu;
    this.gl = renderer.gpu.gl;
    this.rmap = renderer.rmap;
    this.mBuffer = new Float32Array(16);
    this.mBuffer2 = new Float32Array(16);
    this.vBuffer = new Float32Array(4);
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
        //gl.disable(gl.CULL_FACE);
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
        //gl.enable(gl.CULL_FACE);
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
    //gpu.bindTexture(renderer.redTexture);

    //shader.setSampler('uSampler', 0);
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

            plineBuffer[index] = p[0] - cameraPos[0];
            plineBuffer[index+1] = p[1] - cameraPos[1];
            plineBuffer[index+2] = p[2] - cameraPos[2];

            index += 3;
        }
    }

    if (useState !== true) {
        var tmpState = gpu.currentState;

        gpu.setState({
            ztest: !(depthTest !== true),
            blend: (transparent === true),
            zwrite: !(writeDepth === false),
            stencil: false,
            culling: false,
            zequal: false
        });
    }

    var prog = (!screenSpace) ? renderer.progLine5 : renderer.progLine4;

    gpu.useProgram(prog, ['aPosition']);

    if (screenSpace) { 
        prog.setMat4('uMVP', renderer.imageProjectionMatrix, depthOffset ? renderer.getZoffsetFactor(depthOffset) : null);
    } else {
        prog.setMat4('uMV', renderer.camera.getModelviewFMatrix(), null); //depthOffset ? renderer.getZoffsetFactor(depthOffset) : null);
        prog.setMat4('uProj', renderer.camera.getProjectionFMatrix(), null);
    }

    prog.setVec3('uScale', [(2 / renderer.curSize[0]), (2 / renderer.curSize[1]), size*0.5]);
    prog.setVec4('uColor', (color != null ? color : [1,1,1,1]));
    prog.setVec3('uPoints', plineBuffer);

    renderer.plines.draw(prog, 'aPosition', totalPoints);

    if (useState !== true) {
        gpu.setState(tmpState);
    }
};


//draw 2d circle - used for debuging
RendererDraw.prototype.drawCircle = function(point, radius, lineWidth, color, depthOffset, depthTest, transparent, writeDepth, useState) {
    var points = [];
    var circleSides = 16;
    var angle = 0, step = (2.0*Math.PI) / circleSides;

    for (var i = 0; i < circleSides; i++) {
        points[i] = [-Math.sin(angle)*radius+point[0], Math.cos(angle)*radius+point[1], point[2]];
        angle += step;
    }

    points[circleSides] = [point[0], radius+point[1], point[2]];;

    this.drawLineString(points, true, lineWidth, color, depthOffset, depthTest, transparent, writeDepth, useState);
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
        var tmpState = gpu.currentState;

        gpu.setState({
            ztest: !(depthTest !== true),
            blend: (transparent === true),
            zwrite: !(writeDepth === false),
            stencil: false,
            culling: false,
            zequal: false
        });
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
        gpu.setState(tmpState);
    }
};


RendererDraw.prototype.drawBillboard = function(mvp, texture, color, depthOffset, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (useState !== true) {
        var tmpState = gpu.currentState;

        gpu.setState({
            ztest: !(depthTest !== true),
            blend: (transparent === true),
            zwrite: !(writeDepth === false),
            stencil: false,
            culling: false,
            zequal: false
        });
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
        gpu.setState(tmpState);
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
        var tmpState = gpu.currentState;

        gpu.setState({
          ztest: !(depth == null),
          blend: false,
          zwrite: !(depth == null),
          stencil: false,
          culling: false,
          zequal: !(depth == null)
        });
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
        gpu.setState(tmpState);
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
        case 28: //;7
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
    var sortHysteresis = renderer.config.mapSortHysteresis;
    var timerWait = renderer.config.mapHysteresisWait;

    renderer.geoRenderCounter++;
    renderer.totalJobs = 0;
    renderer.drawnJobs = 0;
    renderer.jobsTimer4 = 0;
    renderer.jobsTimer3 = 0;
    renderer.jobsTimer2 = 0;
    renderer.jobsTimer1 = performance.now();

    //setup stencil
    gl.stencilMask(0xFF);
    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.stencilFunc(gl.EQUAL, 0, 0xFF);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INCR);

    var screenPixelSize = [1.0/renderer.curSize[0], 1.0/renderer.curSize[1]];
    var rmap = this.rmap;
    var clearPass = 513;
    var clearPassIndex = 0;
    var clearStencilPasses = renderer.clearStencilPasses;
    var jobZBuffer = renderer.jobZBuffer;
    var jobZBufferSize = renderer.jobZBufferSize;
    var jobZBuffer2 = renderer.jobZBuffer2;
    var jobZBuffer2Size = renderer.jobZBuffer2Size;
    var onlyHitLayers = renderer.onlyHitLayers;
    var onlyAdvancedHitLayers = renderer.onlyAdvancedHitLayers;
    var geoRenderCounter = renderer.geoRenderCounter;
    var job, key, hitmapRender = renderer.onlyHitLayers;
    //var logDebugInfo = false;

    var hsortBuff = renderer.jobHSortBuffer;
    var hsortBuffSize = 0;

    if (clearStencilPasses.length > 0) {
        clearPass = clearStencilPasses[0];
        clearPassIndex++;
    }

    if (this.rmap.counter != this.renderer.geoRenderCounter) {
        this.rmap.clear();
    }

    renderer.gmapIndex = 0;
    renderer.gmapUseVersion = 1;

    var forceUpdate = false;

    var ret, frameTime = renderer.frameTime, sortHbuffer = false;

    //console.log("" + frameTime);

    //draw job buffer and also clean buffer
    for (var i = 0, li = jobZBuffer.length; i < li; i++) {
        var j, lj = jobZBufferSize[i], lj2 = jobZBuffer2Size[i];
        var buffer = jobZBuffer[i];
        var buffer2 = jobZBuffer2[i];
        renderer.jobHBuffer = {};

        renderer.totalJobs += lj;

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
 
                job = buffer[j];
                this.drawGpuJob(gpu, gl, renderer, job, screenPixelSize);
            }

            /*if (logDebugInfo) {
                for (j = 0; j < lj; j++) {
                    job = buffer[j];
                    console.log('' + j + ' ' + job.id);
                }
            }*/
        }
    
        renderer.jobsTimer3 = performance.now();

        if (renderer.gmapIndex > 0) {
            switch(renderer.gmapUseVersion) {
                case 1: //scr-count4
                    processGMap(gpu, gl, renderer, screenPixelSize, this);
                    break;
                case 2:  //scr-count5
                    processGMap4(gpu, gl, renderer, screenPixelSize, this);
                    break;
                case 3: //scr-count6
                    processGMap5(gpu, gl, renderer, screenPixelSize, this);
                    break;
                case 4: //scr-count7
                    processGMap6(gpu, gl, renderer, screenPixelSize, this);
                    break;
                case 5: //scr-count8
                    processGMap7(gpu, gl, renderer, screenPixelSize, this);
                    break;
            }
            renderer.gmapIndex = 0;
        }

        if (rmap.rectanglesCount > 0 || rmap.rectangles2Count > 0) {
            rmap.processRectangles(gpu, gl, renderer, screenPixelSize);
        }

        renderer.jobsTimer4 += performance.now() - renderer.jobsTimer3;

        //lj2 = jobZBuffer2Size[i]; //probably no op

        lj2 = false;
        var hbuffer = renderer.jobHBuffer;

        for (key in hbuffer) {
            lj2 = true;
            break;
        }

        for (key in buffer2) {
            lj2 = true;
            break;
        }

        if (lj2) {

            if (!hitmapRender) {

                for (key in hbuffer) {
                    job = hbuffer[key];

                     if (job.hysteresis && job.id) {
                        var job2 = buffer2[job.id];

                        if (!job2) {
                            job.timerShow = 0;
                            job.timerHide = 0;
                            job.draw = false;
                            job.hysteresisCounter = renderer.geoRenderCounter;
                            buffer2[job.id] = job;
                            jobZBuffer2Size[i]++;
                            forceUpdate = true;
                        } else {

                            if (job == job2) {
                                job2.hysteresisCounter = renderer.geoRenderCounter;
                            } else {
                                job2.hysteresisBackup = job;
                            }

                        }

                        //if (job.hysteresis[3] === true) {
                            sortHbuffer = true;
                        //}
                    }
                }
            }

            for (key in buffer2) {
                job = buffer2[key];
                job2 = hbuffer[key];

                renderer.drawnJobs++;

                if (!hitmapRender) {
                    if (job2) {
                        if (isNaN(job.timerShow)) {
                            job.timerShow = 0;
                            job.timerHide = 0;
                            job.draw = false;
                        }

                        if (!job.draw) {
                            job.timerShow += frameTime;

                            if ((job.timerShow - timerWait) > (job.hysteresis[0])) {
                                job.draw = true;
                                job.timerShow = 0;
                            } else {
                                forceUpdate = true;
                            }
                        } else if (job.timerHide) {
                            job.draw = false;
                            job.timerShow = timerWait + (job.hysteresis[0]) * (1.0-(job.timerHide / (job.hysteresis[1])));
                        }

                        job.timerHide = 0;

                    } else {
                        //job = buffer2[key];

                        if (job.draw) {
                            job.timerHide += frameTime;

                            if (job.timerHide > (job.hysteresis[1])) {
                                delete buffer2[key];
                                jobZBuffer2Size[i]--;
                                job.draw = false;
                                job.timerHide = 0;
                            } else {
                                forceUpdate = true;
                            }
                        } else if (job.timerShow) {
                            job.draw = true;
                            job.timerHide = (job.hysteresis[1]) * (1.0-((job.timerShow-timerWait) / (job.hysteresis[0])));
                        }

                        job.timerShow = 0;
                    }
                }

                var draw = job.draw, fade = null;

                if (!hitmapRender && job.hysteresis[3] === true) {
 
                    if (draw) {
                        if (job.timerHide != 0) {
                            fade = job.timerHide / (job.hysteresis[1]+1);
                            fade = 1.0 - Math.min(1.0, fade);
                        }
                    } else {
                        if (job.timerShow != 0 && (job.timerShow-timerWait) > 0) {
                            fade = (job.timerShow -timerWait) / (job.hysteresis[0]+1);
                            fade = Math.min(1.0, fade);
                            draw = true;
                        }
                    }
                }


                if (draw) {

                    if (job.hysteresisCounter != renderer.geoRenderCounter && job.hysteresisBackup) {
                        var job3 = job.hysteresisBackup;
                        buffer2[key] = job3;

                        job3.timerShow = job.timerShow;
                        job3.timerHide = job.timerHide;
                        job3.draw = job.draw;

                        job = job3;
                    }

                    // update job matricies
                    if (job.renderCounter[0][0] !== geoRenderCounter && job.renderCounter[0][0] !== null) { 
                        job.updatePos = true;

                        var renderCounter = job.renderCounter[0];

                        var mvp = mat4.create();
                        var mv = mat4.create();
                        var group = renderCounter[3];
                        var bbox = group.bbox;
                        var geoPos = renderer.cameraPosition;
                    
                        var m = math.translationMatrix(bbox.min[0] - geoPos[0], bbox.min[1] - geoPos[1], bbox.min[2] - geoPos[2]);
                        mat4.multiply(renderer.camera.getModelviewMatrix(), m, mv);

                        var proj = renderer.camera.getProjectionMatrix();
                        mat4.multiply(proj, mv, mvp);

                        job.mv = mv;
                        job.mvp = mvp;
                    }                    

                    if (sortHysteresis) {

                        job.fade = fade;

                        hsortBuff[hsortBuffSize] = job;
                        hsortBuffSize++;

                    } else {

                        switch(job.type) {
                            case VTS_JOB_VSPOINT:
                                var viewExtent = renderer.viewExtent;
                                var slayers = job.vswitch[job.vswitchIndex];

                                if (slayers) {
                                    slayers = slayers[1];

                                    for (var k = 0, lk = slayers.length; k < lk; k++) {
                                        var sjob = slayers[k];
                                        sjob.updatePos = job.updatePos;
                                        sjob.mvp = job.mvp;
                                        sjob.mv = job.mv;
                                        this.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, sjob.lastSubJob, fade);
                                    }
                                }

                                break;

                            case VTS_JOB_LINE_LABEL:
                                this.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, fade);
                                break;

                            default:
                                this.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, fade);
                                break;
                        }

                        job.updatePos = false;
                    }
                }

                job.hysteresisBackup = null;
            }
        }
    }

    if (sortHysteresis && hsortBuffSize) {

        radixDepthSortFeatures(renderer, hsortBuff, hsortBuffSize, renderer.gmap2);

        for (i = 0; i < hsortBuffSize; i++) {
            job = hsortBuff[i];

            switch(job.type) {
                case VTS_JOB_VSPOINT:
                    var viewExtent = renderer.viewExtent;
                    var slayers = job.vswitch[job.vswitchIndex];

                    if (slayers) {
                        slayers = slayers[1];

                        for (var k = 0, lk = slayers.length; k < lk; k++) {
                            var sjob = slayers[k];
                            sjob.updatePos = job.updatePos;
                            sjob.mvp = job.mvp;
                            sjob.mv = job.mv;
                            this.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, sjob.lastSubJob, job.fade);
                        }
                    }

                break;

                case VTS_JOB_LINE_LABEL:
                    this.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, job.lastSubJob, job.fade);
                    break;

                default:
                    this.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, job.lastSubJob, job.fade);
                    break;
            }

            job.updatePos = false;
        }

    }

    if (forceUpdate) {
        this.core.markDirty();
    }

    renderer.jobsTimer2 = performance.now();
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


RendererDraw.prototype.clearJobHBuffer = function() {
    var renderer = this.renderer;
    var jobZBuffer2 = renderer.jobZBuffer2;
    var jobZBuffer2Size = renderer.jobZBuffer2Size;

    //clean job hbuffer
    for (var i = 0, li = jobZBuffer2.length; i < li; i++) {
        jobZBuffer2[i] = {};
        jobZBuffer2Size[i] = 0;
    }
};


RendererDraw.prototype.paintGL = function() {   //remove this??
    var renderer = this.renderer;

    this.gpu.clear(true, false);

    if (!renderer.onlyLayers) {
        if (!renderer.onlyDepth && !renderer.onlyHitLayers) {
            this.drawSkydome();
        }
    }
};


RendererDraw.prototype.processNoOverlap = function(renderer, job, pp, p1, p2, camVec, l, stickShift, texture, files, color) {
    var res = { 
        exit: true
    };

    var reduce78 = (job.reduce && (job.reduce[0] >= 7 && job.reduce[0] <= 11));

    if (!renderer.drawAllLabels && job.noOverlap) { 
        if (!pp) {
            //if (job.type == VTS_JOB_LINE_LABEL) {
              //  pp = renderer.project2(job.center2, job.mvp, [0,0,0]);
            //} else {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition, true);
            //}
        }

        res.pp = pp;
        var o = job.noOverlap, depth = pp[2];

        if (depth < 0 || depth > 1.0) {
            return res;
        }

        if (job.type == VTS_JOB_LINE_LABEL) {
            if (renderer.benevolentMargins) {
                if (!renderer.rmap.checkRectangle(pp[0]-200, pp[1]-200, pp[0]+200, pp[1]+200, 0)) {
                    return res;
                }
            } else{ 
                if (!renderer.rmap.checkRectangle(pp[0], pp[1], pp[0], pp[1], 0)) {
                    return res;
                }
            }
        } else {
            if (!renderer.rmap.checkRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], stickShift)) {
                return res;
            }
        }

        if (o[4] !== null) {
            if (o[4] === VTS_NO_OVERLAP_DIRECT) {
                depth = o[5];
            } else {
                if (l === null) {
                    p2 = job.center2;
                    p1 = renderer.cameraPosition;
                    camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
                    l = vec3.length(camVec) + 0.0001;
                }

                if (!job.reduce || (job.reduce && !(job.reduce[0] >= 8 && job.reduce[0] <= 11))) {  //not overlap code not used for reduce==8
                    depth = o[5] / l;
                }
            } 
        }

        job.lastSubJob = [job, stickShift, texture, files, color, pp, true, depth, o];

        if (reduce78) {
            renderer.gmapUseVersion = (job.reduce[0] >= 8 && job.reduce[0] <= 11) ? (job.reduce[0] - 6) : 1;
            renderer.gmap[renderer.gmapIndex] = job.lastSubJob;
            renderer.gmapIndex++;

            if (renderer.config.mapFeaturesReduceFactor >= 1) { // prom / dists
                if (l === null) {
                    p2 = job.center2;
                    p1 = renderer.cameraPosition;
                    camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
                    l = vec3.length(camVec) + 0.0001;
                }

                if (l > renderer.fmaxDist) renderer.fmaxDist = l;
                if (l < renderer.fminDist) renderer.fminDist = l;

                job.reduce[1] = job.reduce[2];
                job.reduce[4] = l;
            }
            return res;
        }

        if (job.type == VTS_JOB_LINE_LABEL) {
            if (!renderer.rmap.addLineLabel(job.lastSubJob)) {
                //renderer.rmap.storeRemovedLineLabel(job.lastSubJob);
                return res;
            }
        } else {
            if (!renderer.rmap.addRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], depth, job.lastSubJob)) {
                renderer.rmap.storeRemovedRectangle(pp[0]+o[0], pp[1]+o[1], pp[0]+o[2], pp[1]+o[3], depth, job.lastSubJob);
                return res;
            }
        }

        return res; //draw all labe from same z-index together
    } else {
        if (reduce78) {
            if (!pp) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition, true);
            }

            job.lastSubJob = [job, stickShift, texture, files, color, pp, false];

            renderer.gmapUseVersion = (job.reduce[0] >= 8 && job.reduce[0] <= 11) ? (job.reduce[0] - 6) : 1;
            renderer.gmap[renderer.gmapIndex] = job.lastSubJob;
            renderer.gmapIndex++;

            if (renderer.config.mapFeaturesReduceFactor >= 1) { // prom / dists
                if (l === null) {
                    p2 = job.center2;
                    p1 = renderer.cameraPosition;
                    camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
                    l = vec3.length(camVec) + 0.0001;
                }

                if (l > renderer.fmaxDist) renderer.fmaxDist = l;
                if (l < renderer.fminDist) renderer.fminDist = l;

                job.reduce[1] = job.reduce[2];
                job.reduce[4] = l;
            }

            res.pp = pp;
            return res;
        }
    }

    if (job.hysteresis && job.id) {
        if (!pp) {
            pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition, true);
        }

        job.lastSubJob = [job, stickShift, texture, files, color, pp];
        renderer.jobHBuffer[job.id] = job;
        res.pp = pp;
        return res;
     } else {
        res.pp = pp;
     }

    res.exit = false;

    return res;
}

RendererDraw.prototype.drawGpuJob = function(gpu, gl, renderer, job, screenPixelSize, advancedHitPass, ignoreFilters) {
    if (!job.ready) {
        return;
    }

    //if (!(job.tile.id[0] == 14 && job.tile.id[1] == 4383 && job.tile.id[2] == 2863)) {
      //  return;
    //}

    if (!job.eventInfo) {
        return;
    }

    var state = job.state & 0xff;
    var id = job.eventInfo['#id'];

    if (id != null) {

        if (job.state & (2 << 8)) { //has selection layers?

            if (renderer.geodataSelection.indexOf(id) != -1) {  // is selected

                if (job.state & (3 << 8)) { //has hover layers?

                    if (renderer.hoverFeature && renderer.hoverFeature[0]['#id'] == id) {
                        if (state != 3) {
                            return;
                        }
                    } else {
                        if (state != 2) {
                            return;
                        }
                    }
                }
            } else if (job.state & (1 << 8)) { //has hover layers?

                if (renderer.hoverFeature && renderer.hoverFeature[0]['#id'] == id) {
                    if (state != 1) {
                        return;
                    }
                } else {
                    if (state != 0) {
                        return;
                    }
                }

            } else {
                if (state != 0) {
                    return;
                }        
            }
        
        } else if (job.state & (1 << 8)) { //has hover layers?

            if (renderer.hoverFeature && renderer.hoverFeature[0]['#id'] == id) {
                if (state != 1) {
                    return;
                }
            } else {
                if (state != 0) {
                    return;
                }
            }

        } else {
            if (state != 0) {
                return;;
            }        
        }

    } else {
        if (state != 0) {
            return;
        }        
    }

    var mvp = job.mvp, prog, texture, res;
    var vertexPositionAttribute, vertexTexcoordAttribute,
        vertexNormalAttribute, vertexOriginAttribute, vertexElementAttribute;

    var hitmapRender = job.hitable && renderer.onlyHitLayers;
    var screenPixelSize2, color = job.color;
    var useSuperElevation = renderer.useSuperElevation;

    if (hitmapRender) {
        var c = renderer.hoverFeatureCounter;
        //color = [(c&255)/255, ((c>>8)&255)/255, ((c>>16)&255)/255, 1];
        color = [(c&255)/255, ((c>>8)&255)/255, 0, 0];
        renderer.hoverFeatureList[c] = [job.eventInfo, job.center, job.clickEvent, job.hoverEvent, job.enterEvent, job.leaveEvent, advancedHitPass];
        renderer.hoverFeatureCounter++;
    }

    switch(job.type) {
    case VTS_JOB_FLAT_LINE:
    case VTS_JOB_POLYGON:

        if (job.type == VTS_JOB_POLYGON) {
            if (hitmapRender) {
                if (job.stencil) {
                    gpu.setState(job.culling ? renderer.polygonB0S1C1tate : renderer.polygonB0S1C0tate);
                } else {
                    gpu.setState(job.culling ? renderer.polygonB0S0C1tate : renderer.polygonB0S0C0tate);
                }
            } else {
                if (job.stencil) {
                    gpu.setState(job.culling ? renderer.polygonB1S1C1tate : renderer.polygonB1S1C0tate);
                } else {
                    gpu.setState(job.culling ? renderer.polygonB1S0C1tate : renderer.polygonB1S0C0tate);
                }
            }
        } else {
            gpu.setState(hitmapRender ? renderer.stencilLineHitState : renderer.stencilLineState);
        }

        var debugWires = (gpu === 0); //just generate false value to avoid compiler warnings;

        if (useSuperElevation) {
            prog = advancedHitPass ? job.program2 : renderer.progLineSE;
        } else {            
            prog = advancedHitPass ? job.program2 : debugWires ? renderer.progLineWireframe : job.program;
        }

        var flatShade = (!advancedHitPass && job.type == VTS_JOB_POLYGON && job.style == 1);

        if (flatShade) { 
            prog = useSuperElevation ? renderer.progCFlatShadeTileSE : renderer.progCFlatShadeTile;
        }

        gpu.useProgram(prog, advancedHitPass ? ['aPosition', 'aElement'] : debugWires ? ['aPosition', 'aBarycentric'] : ['aPosition']);

        if (useSuperElevation) {
            var m = this.mBuffer;
            var se = renderer.superElevation;

            m[0] = job.bbox.min[0];
            m[1] = job.bbox.min[1];
            m[2] = job.bbox.min[2];

            m[3] = 1;
            m[4] = 1;
            m[5] = 1;

            m[9] = se[0]; // h1
            m[10] = se[1]; // f1
            m[11] = se[2]; // h2
            m[12] = se[6]; // inv dh
            m[13] = se[5]; // df

            m[14] = renderer.earthRadius;
            m[15] = renderer.earthERatio;

            prog.setMat4('uParamsSE', m);
        }

        if (flatShade) { 
            prog.setMat4('uMV', job.mv);
            prog.setMat4('uProj', renderer.camera.getProjectionFMatrix(), renderer.getZoffsetFactor(job.zbufferOffset));
            prog.setVec4('uColor', color);
        } else {
            prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));
            prog.setVec4('uColor', color);
        }

        vertexPositionAttribute = prog.getAttribute('aPosition');

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        if (advancedHitPass) {
            vertexElementAttribute = prog.getAttribute('aElement');
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexElementBuffer);
            gl.vertexAttribPointer(vertexElementAttribute, job.vertexElementBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }

        if (debugWires) {
            var barycentericAttribute = prog.getAttribute('aBarycentric');
            gl.bindBuffer(gl.ARRAY_BUFFER, gpu.barycentricBuffer);
            gl.vertexAttribPointer(barycentericAttribute, gpu.barycentricBuffer.itemSize, gl.FLOAT, false, 0, 0);
        }
        
        //draw polygons
        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

        var drawDebugLines = renderer.debug.drawPolyWires;// false;//true;

        if (drawDebugLines) {

            var program = useSuperElevation ? renderer.progWireFrameBasicSE : renderer.progWireFrameBasic;
            renderer.gpu.useProgram(program, ['aPosition']);

            if (useSuperElevation) {
                program.setMat4('uParamsSE', m);
            }

            program.setMat4('uMV', job.mv);
            program.setVec4('uColor', [0,0,0,1]);

            program.setMat4('uProj', renderer.camera.getProjectionFMatrix(), renderer.getZoffsetFactor(job.zbufferOffset));

            for (var i = 0, li = job.vertexPositionBuffer.numItems*2; i < li; i+=3) {
                gl.drawArrays(gl.LINE_LOOP, i, 3);
            }


        }

        break;

    case VTS_JOB_FLAT_RLINE:
    case VTS_JOB_FLAT_TLINE:
    case VTS_JOB_PIXEL_LINE:
    case VTS_JOB_PIXEL_TLINE:
        gpu.setState(hitmapRender ? renderer.stencilLineHitState : renderer.stencilLineState);

        prog = advancedHitPass ? job.program2 : job.program;
        texture = null;
        var textureParams = [0,0,0,0];
        screenPixelSize2 = screenPixelSize;

        if (hitmapRender) {
            if (job.type == VTS_JOB_PIXEL_TLINE) {
                if (job.widthByRatio) {
                    screenPixelSize2 = [ screenPixelSize[0] * renderer.curSize[1], screenPixelSize[1] * renderer.curSize[1]];
                }
                prog = advancedHitPass ? this.renderer.progELine3 : this.renderer.progLine3;
                if (!prog.isReady()) {
                    return;
                }
            }
        }

        if (job.type != VTS_JOB_PIXEL_LINE) {

            if (job.type == VTS_JOB_FLAT_RLINE) {
                textureParams = [0, 0, 0, job.widthByRatio ? renderer.cameraViewExtent : 1];
            } else {
                if (hitmapRender) {
                    texture = renderer.whiteTexture;

                    if (job.type == VTS_JOB_FLAT_TLINE || job.type == VTS_JOB_FLAT_RLINE) {
                        textureParams = [0, 0, 0, job.widthByRatio ? renderer.cameraViewExtent : 1];
                    }

                } else {
                    var t = job.texture;
                    if (t == null || t[0] == null) {
                        return;
                    }

                    texture = t[0];
                    textureParams = [0, t[1]/t[0].height, (t[1]+t[2])/t[0].height, job.widthByRatio ? renderer.cameraViewExtent : 1];

                    if (job.type == VTS_JOB_FLAT_TLINE || job.type == VTS_JOB_FLAT_RLINE) {
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

        if (useSuperElevation) {
            prog = advancedHitPass ? job.program2 : renderer.progLine3SE;

            var m = this.mBuffer;
            var se = renderer.superElevation;

            m[0] = job.bbox.min[0];
            m[1] = job.bbox.min[1];
            m[2] = job.bbox.min[2];

            m[3] = 1;
            m[4] = 1;
            m[5] = 1;

            m[9] = se[0]; // h1
            m[10] = se[1]; // f1
            m[11] = se[2]; // h2
            m[12] = se[6]; // inv dh
            m[13] = se[5]; // df

            m[14] = renderer.earthRadius;
            m[15] = renderer.earthERatio;

            gpu.useProgram(prog, advancedHitPass ? ['aPosition','aNormal','aElement'] : ['aPosition','aNormal']);
            prog.setMat4('uParamsSE', m);

        } else {
            gpu.useProgram(prog, advancedHitPass ? ['aPosition','aNormal','aElement'] : ['aPosition','aNormal']);
        }           

        prog.setVec4('uColor', color);
        prog.setVec2('uScale', screenPixelSize2);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));

        if (job.type != VTS_JOB_PIXEL_LINE) {
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

    case VTS_JOB_LINE_LABEL:
        var files = job.files;

        if (files.length > 0) {
            for (var i = 0, li = files.length; i < li; i++) {
                if (files[i].length > 0) {
                    var font = job.fonts[i];
                    if (font && !font.areTexturesReady(files[i])) {
                        return;
                    }
                }
            }

        } else {
            if (!hitmapRender) {
                return;
            }

            texture = renderer.whiteTexture;
        }

        if (renderer.useSuperElevation) {
            if (job.seCounter != renderer.seCounter) {
                job.seCounter = renderer.seCounter;
                job.labelPointsBuffer.id = -1;
                job.center2 = renderer.transformPointBySE(job.center);
            }
        } else {
            job.center2 = job.center;
        }

        var gamma = job.outline[2] * 1.4142 / 20;
        var gamma2 = job.outline[3] * 1.4142 / 20;

        if (job.singleBuffer) {

            var p1, p2, camVec, ll, l = null, localTilt;

            if (job.culling != 180) {
                p2 = job.center2;
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
                vec3.normalize(job.center2, job.normal);
                    
                localTilt = -vec3.dot(camVec, job.normal);

                if (localTilt < Math.cos(math.radians(job.culling))) {
                    return;
                }
                
            } else if (job.visibility) {

                p2 = job.center2;
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

            res = this.processNoOverlap(renderer, job, pp, p1, p2, camVec, l, stickShift, texture, files, color); //, pointsIndex);

            if (res.exit) {
                return;
            } else {
                //pp = res.pp;
                //p1 = res.p1;
                //p2 = res.p2;
                //camVec = res.camVec;
                //l = res.l;
            }
           
            this.drawGpuSubJobLineLabel(gpu, gl, renderer, screenPixelSize, [job,0,texture,files,color,pp]);

            /*
            if (bl > 384) { vbuff = renderer.textQuads128; prog = renderer.progLineLabel128; } else
            if (bl > 256) { vbuff = renderer.textQuads96; prog = renderer.progLineLabel96; } else
            if (bl > 192) { vbuff = renderer.textQuads64; prog = renderer.progLineLabel64; } else
            if (bl > 128) { vbuff = renderer.textQuads48; prog = renderer.progLineLabel48; } else
            if (bl > 64) { vbuff = renderer.textQuads32; prog = renderer.progLineLabel32; }
            else { vbuff = renderer.textQuads16; prog = renderer.progLineLabel16; }

            gpu.useProgram(prog, ['aPosition']);
            prog.setSampler('uSampler', 0);
            prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));

            prog.setVec4('uColor', hitmapRender ? color : job.color2);
            prog.setVec2('uParams', [job.outline[0], gamma2]);
            lj = hitmapRender ? 1 : 2;

            var vertexPositionAttribute = prog.getAttribute('aPosition');

            prog.setVec4('uData', b);

            //bind vetex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuff);
            gl.vertexAttribPointer(vertexPositionAttribute, vbuff.itemSize, gl.FLOAT, false, 0, 0);

            //draw polygons
            for(var j = 0; j < (hitmapRender ? 1 : 2); j++) {
                if (j == 1) {
                    prog.setVec4('uColor', color);
                    prog.setVec2('uParams', [job.outline[1], gamma]);
                }

                for (var i = 0, li = files.length; i < li; i++) {
                    var fontFiles = files[i];

                    for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                        var file = fontFiles[k];
                        prog.setFloat('uFile', Math.round(file+i*1000));
                        gpu.bindTexture(job.fonts[i].getTexture(file));
                        gl.drawArrays(gl.TRIANGLES, 0, vitems / 3); //TODO: demystify vitems
                    }
                }
            }

            if (renderer.drawLabelBoxes) {
                if (job.labelPoints.length > 0) {
                    var points = job.labelPoints[0][pointsIndex];

                    for(j = 0; j < points.length; j++) {
                        pp = renderer.project2(points[j], mvp, [0,0,0], true);
                        this.drawCircle(pp, points[j][3] *renderer.camera.scaleFactor2(pp[3])*0.5*renderer.curSize[1]*(renderer.curSize[0]/renderer.curSize[1]), 1, [255, 0, 255, 255], null, null, null, null, null);
                    }
                }
            }*/

            return;
        }

        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);

        prog = renderer.useSuperElevation ? renderer.progText2SE : job.program;
        gpu.useProgram(prog, ['aPosition', 'aTexCoord']);

        if (useSuperElevation) {
            var m = this.mBuffer;
            var se = renderer.superElevation;

            m[0] = job.bbox.min[0];
            m[1] = job.bbox.min[1];
            m[2] = job.bbox.min[2];

            m[3] = 1;
            m[4] = 1;
            m[5] = 1;

            m[9] = se[0]; // h1
            m[10] = se[1]; // f1
            m[11] = se[2]; // h2
            m[12] = se[6]; // inv dh
            m[13] = se[5]; // df

            m[14] = renderer.earthRadius;
            m[15] = renderer.earthERatio;

            prog.setMat4('uParamsSE', m);
        }  

        prog.setSampler('uSampler', 0);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));
        prog.setVec4('uVec', renderer.labelVector);

        prog.setVec4('uColor', (hitmapRender ? color : job.color2));
        prog.setVec2('uParams', [job.outline[0], gamma2]);

        vertexPositionAttribute = prog.getAttribute('aPosition');
        vertexTexcoordAttribute = prog.getAttribute('aTexCoord');

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //bind vetex texcoords
        gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);
        gl.vertexAttribPointer(vertexTexcoordAttribute, job.vertexTexcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

        //draw polygons
        for(var j = 0; j < (hitmapRender ? 1 : 2); j++) {
            if (j == 1) {
                prog.setVec4('uColor', color);
                prog.setVec2('uParams', [job.outline[1], gamma]);
            }

            if (files.length > 0) {
                for (var i = 0, li = files.length; i < li; i++) {
                    var fontFiles = files[i];

                    for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                        var file = fontFiles[k];
                        prog.setFloat('uFile', Math.round(file+i*1000));
                        gpu.bindTexture(job.fonts[i].getTexture(file));
                        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);
                    }
                }

            } else {
                gpu.bindTexture(texture);
                gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);
            }
        }

        break;

    case VTS_JOB_ICON:
    case VTS_JOB_LABEL:
    case VTS_JOB_PACK:
    case VTS_JOB_VSPOINT:


        if (job.reduce && !(job.reduce[0] >= 7 && job.reduce[0] <= 11)) {
            var a, r = job.reduce;

            if (r[0] > 4) {
                
                if (r[0] == 4) {
                    a = Math.max(r[1], Math.floor(r[2] / Math.max(1, renderer.drawnGeodataTiles)));

                    if (job.index >= a) {
                        return;
                    } 
                    r[5] = a; //for debug
                } else {
                    a = Math.pow(job.texelSize * job.tiltAngle, VTS_TILE_COUNT_FACTOR); 
                    a = Math.max(r[1], Math.round(r[2] * (a / Math.max(0.00001, this.renderer.drawnGeodataTilesFactor))));

                    if (job.index >= a) {
                        return;
                    } 
                    r[5] = a; //for debug
                }

            } else {
                a = job.tiltAngle;

                if (r[0] == 1) {
                    a = 1.0 - (Math.acos(a) * (1.0/(Math.PI*0.5)));
                } else if (r[0] == 3) {
                    a = (Math.cos(Math.acos(a) * 2) + 1.0) * 0.5;
                }

                var indexLimit = (Math.round(r[1] + (a*r[2]))-1);

                if (job.index > indexLimit) {
                    return;
                } 
                r[5] = indexLimit; //for debug
            }
        }

        var files = job.files;

        if (job.type != VTS_JOB_VSPOINT) {
            if (job.type == VTS_JOB_PACK) {

                var notready = false;
                
                for (var j = 0, lj = job.subjobs.length; j < lj; j++) {
                    var subjob = job.subjobs[j];

                    files = subjob.files;

                    if (files.length > 0) {
                        for (var i = 0, li = files.length; i < li; i++) {
                            if (files[i].length > 0) {
                                var font = subjob.fonts[i];
                                if (font && !font.areTexturesReady(files[i])) {
                                    notready = true;
                                }
                            }
                        }

                    } else {
                        texture = hitmapRender ? renderer.whiteTexture : subjob.texture;
                        if (!texture.loaded) {
                            notready = true;
                        }
                    }
                }

                if (notready) {
                    return;
                }

            } else {
                files = job.files;

                if (files.length > 0) {
                    for (var i = 0, li = files.length; i < li; i++) {
                        if (files[i].length > 0) {
                            var font = job.fonts[i];
                            if (font && !font.areTexturesReady(files[i])) {
                                return;
                            }
                        }
                    }

                } else {
                    texture = hitmapRender ? renderer.whiteTexture : job.texture;
                    if (!texture.loaded) {
                        return;
                    }
                }
            }
        }

        var p1, p2, camVec, ll, l = null, localTilt;

        if (renderer.useSuperElevation) {
            if (job.seCounter != renderer.seCounter) {
                job.seCounter = renderer.seCounter;
                job.center2 = renderer.transformPointBySE(job.center);
            }
        } else {
            job.center2 = job.center;
        }

        if (job.culling != 180) {
            p2 = job.center2;
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
            vec3.normalize(job.center2, job.normal);
                
            localTilt = -vec3.dot(camVec, job.normal);

            if (localTilt < Math.cos(math.radians(job.culling))) {
                return;
            }
            
        } else if (job.visibility) {

            p2 = job.center2;
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

        if (job.type == VTS_JOB_VSPOINT) {
            //TODO: solve switch an call render
            var viewExtent = renderer.viewExtent;
            var lastViewExtent = 0, vswitch = job.vswitch;
            job.vswitchIndex = 0;

            for (i = 0, li = vswitch.length; i < li; i++) {
                if (viewExtent <= vswitch[i][0] || i == (li-1)) {
                    job.vswitchIndex = i;
                    var slayers = job.vswitch[i];

                    if (slayers) {
                        slayers = slayers[1];

                        for (j = 0, lj = slayers.length; j < lj; j++) {
                            var sjob = slayers[j];
                            sjob.mv = job.mv;
                            sjob.mvp = job.mvp;
                            sjob.updatePos = job.updatePos;
                            sjob.hysteresis = job.hysteresis;
                            sjob.vswitchIndex = i;
                            sjob.renderCounter = job.renderCounter;
                            sjob.localTilt = localTilt;
                            sjob.id = job.id;
                            this.drawGpuJob(gpu, gl, renderer, sjob, screenPixelSize, advancedHitPass, ignoreFilters);
                        }
                    }

                    return;
                }
            }

            return;
        }

        var s = job.stick;
        var stickShift = 0, pp, o, depth, stickMode, stickHeight;

        if (s[0] != 0) {
            stickMode = renderer.config.mapFeatureStickMode;
            stickHeight = s[0];

            if (stickMode[0]) {
                if (!localTilt) {
                    localTilt = job.localTilt;

                    if (!localTilt) {
                        p2 = job.center2;
                        p1 = renderer.cameraPosition;
                        camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
                        vec3.normalize(camVec);
                        job.normal = [0,0,0];
                        vec3.normalize(job.center2, job.normal);
                            
                        localTilt = -vec3.dot(camVec, job.normal);
                    }
                }

                if (stickMode[0] == 2) {

                    var hdelta = renderer.gridHmax - renderer.gridHmin;

                    if (hdelta < 0) {
                        hdelta = 0;
                    }

                    if (hdelta < stickHeight) {
                        stickHeight = hdelta;
                    }
                }

                if (localTilt < 0) {
                    localTilt = 0;
                }
               
                stickShift = Math.pow(1-localTilt,stickMode[1]) * stickHeight * renderer.cameraTiltFator;

            } else {
                stickShift = renderer.cameraTiltFator * s[0];
            }
                
            if (stickShift < s[1]) {
                stickShift = 0;
            }

            if (s[0] != 0 && s[2] != 0 && stickShift >= 4) {
                stickShift += s[7];
            }

            //else if (s[2] != 0) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                pp[0] = Math.round(pp[0]);
                pp[1] -= stickShift;
            //}
        }

        res = this.processNoOverlap(renderer, job, pp, p1, p2, camVec, l, stickShift, texture, files, color);

        if (res.exit) {
            return;
        } else {
            pp = res.pp;
            p1 = res.p1;
            p2 = res.p2;
            camVec = res.camVec;
            l = res.l;
        }
        
        if (job.type == VTS_JOB_PACK) {
            return;
        }

        if (renderer.drawLabelBoxes) {
            o = job.noOverlap;

            if (o) {
                if (!pp) {
                    pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                }

                gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);
                this.drawLineString([[pp[0]+o[0], pp[1]+o[1], 0.5], [pp[0]+o[2], pp[1]+o[1], 0.5],
                                     [pp[0]+o[2], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[1], 0.5]], true, 1, [255, 0, 0, 255], null, true, null, null, null);

                if (job.reduce) {
                    if (job.reduce[0] >= 10) {
                        this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[6].toFixed(3)+' '+job.reduce[1].toFixed(2)+' '+job.reduce[3].toFixed(2)+' '+job.reduce[7].toFixed(0), [1,0,0,1], 0.5);
                    } else {
                        this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[1].toFixed(0)+' '+job.reduce[5].toFixed(0), [1,0,0,1], 0.5);
                    }
                }
            }
        }

        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.labelState);

        if (s[0] != 0 && s[2] != 0) {
            if (!pp) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
            }

            this.drawLineString([[pp[0], pp[1]+stickShift+s[7], pp[2]], [pp[0], pp[1]+s[7], pp[2]]], true, s[2], [s[3], s[4], s[5], s[6]], null, null, null, null, true);
        }

        /*if (dinfo) { //debug only
            if (!pp) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
            }

            var stmp = "" + dinfo[0].toFixed(0) + " " + dinfo[1].toFixed(0) + " " + dinfo[2].toFixed(0) + " " + dinfo[3].toFixed(0) + " " + dinfo[4].toFixed(0);
            this.drawText(Math.round(pp[0]-this.getTextSize(10,stmp)*0.5), Math.round(pp[1]), 10, stmp, [1,1,1,1], 0);
        }*/

        prog = job.program; //renderer.progIcon;

        if (job.singleBuffer) {
            if (!pp) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
            }

            if (prog == renderer.progIcon) {
                var b = job.singleBuffer;
                prog = renderer.progImage;

                if (!job.singleBuffer2) {
                    job.singleBuffer2 = new Float32Array(b);

                    var tx = 1 / texture.width, ty = 1 / texture.height;
                    b[2] *= tx; b[3] *= ty;
                    b[6] *= tx; b[7] *= ty;
                    b[10] *= tx; b[11] *= ty;
                    b[14] *= tx; b[15] *= ty;
                }

                if (job.updatePos) {
                    pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                    pp[1] -= stickShift;
                }

                var b2 = job.singleBuffer2;

                b[0] = pp[0] + b2[0];
                b[1] = pp[1] + b2[1];

                b[4] = pp[0] + b2[4];
                b[5] = pp[1] + b2[5];

                b[8] = pp[0] + b2[8];
                b[9] = pp[1] + b2[9];

                b[12] = pp[0] + b2[12];
                b[13] = pp[1] + b2[13];

                gpu.useProgram(prog, ['aPosition']);
                gpu.bindTexture(texture);

                var vertices = renderer.rectVerticesBuffer;
                gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
                gl.vertexAttribPointer(prog.getAttribute('aPosition'), vertices.itemSize, gl.FLOAT, false, 0, 0);

                var indices = renderer.rectIndicesBuffer;
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

                prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);
                prog.setMat4('uData', job.singleBuffer );
                prog.setVec4('uColor', color);
                prog.setFloat('uDepth', pp[2] * (1 + renderer.getZoffsetFactor(job.zbufferOffset) * 2));

                gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

            } else {

                var b = job.singleBuffer, bl = b.length, vbuff, vitems = (b.length / 4) * 6, color2 = job.color2, j = 0;

                if (bl > 384) { vbuff = renderer.textQuads128; prog = renderer.progLabel128; } else
                if (bl > 256) { vbuff = renderer.textQuads96; prog = renderer.progLabel96; } else
                if (bl > 192) { vbuff = renderer.textQuads64; prog = renderer.progLabel64; } else
                if (bl > 128) { vbuff = renderer.textQuads48; prog = renderer.progLabel48; } else
                if (bl > 64) { vbuff = renderer.textQuads32; prog = renderer.progLabel32; }
                else { vbuff = renderer.textQuads16; prog = renderer.progLabel16; }

                if (job.updatePos) {
                    pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                    pp[1] -= stickShift;
                }

                gpu.useProgram(prog, ['aPosition']);
                prog.setSampler('uSampler', 0);
                prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);

                prog.setVec4('uScale', [screenPixelSize[0], screenPixelSize[1], 1, stickShift*2]);
                prog.setVec3('uOrigin', [pp[0],pp[1],pp[2] * (1 + renderer.getZoffsetFactor(job.zbufferOffset) * 2)]);
                prog.setVec4('uColor', hitmapRender ? color : color2);
                prog.setVec2('uParams', [job.outline[0], job.gamma[1]]);
                lj = hitmapRender ? 1 : 2;

                var vertexPositionAttribute = prog.getAttribute('aPosition');

                prog.setVec4('uData', b);

                //bind vetex positions
                gl.bindBuffer(gl.ARRAY_BUFFER, vbuff);
                gl.vertexAttribPointer(vertexPositionAttribute, vbuff.itemSize, gl.FLOAT, false, 0, 0);

                //draw polygons
                for(;j<lj;j++) {
                    if (j == 1) {
                        prog.setVec4('uColor', color);
                        prog.setVec2('uParams', [job.outline[1], job.gamma[0]]);
                    }

                    for (var i = 0, li = files.length; i < li; i++) {
                        var fontFiles = files[i];

                        for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                            var file = fontFiles[k];
                            prog.setFloat('uFile', Math.round(file+i*1000));
                            gpu.bindTexture(job.fonts[i].getTexture(file));
                            gl.drawArrays(gl.TRIANGLES, 0, vitems);
                        }
                    }
                }

            }
            
            return;   
        }

        gpu.useProgram(prog, ['aPosition', 'aTexCoord', 'aOrigin']);
        prog.setSampler('uSampler', 0);
        prog.setMat4('uMVP', mvp, renderer.getZoffsetFactor(job.zbufferOffset));
        prog.setVec4('uScale', [screenPixelSize[0], screenPixelSize[1], (job.type == VTS_JOB_LABEL ? 1.0 : 1.0 / texture.width), stickShift*2]);

        var j = 0, lj = 1;

        if (prog != renderer.progIcon) {
            prog.setVec4('uColor', hitmapRender ? color : job.color2);
            prog.setVec2('uParams', [job.outline[0], job.gamma[1]]);
            lj = hitmapRender ? 1 : 2;
        } else {
            prog.setVec4('uColor', color);
        }

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
        for(;j<lj;j++) {
            if (j == 1) {
                prog.setVec4('uColor', color);
                prog.setVec2('uParams', [job.outline[1], job.gamma[0]]);
            }

            if (files.length > 0) {
                for (var i = 0, li = files.length; i < li; i++) {
                    var fontFiles = files[i];

                    for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                        var file = fontFiles[k];
                        prog.setFloat('uFile', Math.round(file+i*1000));
                        gpu.bindTexture(job.fonts[i].getTexture(file));
                        gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);
                    }
                }

            } else {
                gpu.bindTexture(texture);
                gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);
            }
        }

        break;
    }

    return;
};

RendererDraw.prototype.drawGpuSubJob = function(gpu, gl, renderer, screenPixelSize, subjob, fade) {
    if (!subjob) {
        return;
    }

    var job = subjob[0], stickShift = subjob[1], texture = subjob[2],
        files = subjob[3], color = subjob[4], pp = subjob[5], s = job.stick,
        o = job.noOverlap, localTilt, p2, p1, camVec;

    if (renderer.useSuperElevation) {
        if (job.seCounter != renderer.seCounter) {
            job.seCounter = renderer.seCounter;
            job.center2 = renderer.transformPointBySE(job.center);
        }
    } else {
        job.center2 = job.center;
    }

    if (job.hysteresis && job.id) {

        /*
        if (job.culling != 180) {
            p2 = job.center2;
            p1 = renderer.cameraPosition;
            var camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
            vec3.normalize(camVec);
                
            job.normal = [0,0,0];
            vec3.normalize(job.center2, job.normal);
                
            localTilt = -vec3.dot(camVec, job.normal);
            if (localTilt < Math.cos(math.radians(job.culling))) {
                return;
            }
        }

        //if (o) {
            //var x1 = pp[0]+o[0], y1 = pp[1]+o[1], 
              //  x2 = pp[0]+o[2], y2 = pp[1]+o[3]+stickShift;

            /*
            if (s[0] != 0) {
                stickShift = renderer.cameraTiltFator * s[0];
                    
                if (stickShift < s[1]) {
                    stickShift = 0;
                }
            }*/

            /* 
            var rmap = renderer.rmap;

            //screen including credits
            if (x1 < 0 || x2 > rmap.slx || y1 < 0 || y2 > rmap.sly) {
                return false;
            }

            //compass
            if (x1 < rmap.clx && x2 > 0 && y1 <= rmap.sly && y2 > (rmap.sly - rmap.cly)) {
                return false;
            }

            //serach bar
            if (x1 < rmap.blx && x2 > 0 && y1 <= rmap.bly && y2 > 0) {
                return false;
            }*/
        //}

        if (s[0] != 0) {
            var stickMode = renderer.config.mapFeatureStickMode;
            var stickHeight = s[0];

            if (stickMode[0]) {
                if (!localTilt) {
                    localTilt = job.localTilt;

                    if (!localTilt) {
                        p2 = job.center2;
                        p1 = renderer.cameraPosition;
                        camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
                        vec3.normalize(camVec);
                        job.normal = [0,0,0];
                        vec3.normalize(job.center2, job.normal);
                            
                        localTilt = -vec3.dot(camVec, job.normal);
                    }
                }

                if (stickMode[0] == 2) {

                    var hdelta = renderer.gridHmax - renderer.gridHmin;

                    if (hdelta < 0) {
                        hdelta = 0;
                    }

                    if (hdelta < stickHeight) {
                        stickHeight = hdelta;
                    }
                }

                if (localTilt < 0) {
                    localTilt = 0;
                }
               
                stickShift = Math.pow(1-localTilt,stickMode[1]) * stickHeight * renderer.cameraTiltFator;

            } else {
                stickShift = renderer.cameraTiltFator * s[0];
            }
              
            if (stickShift < s[1]) {
                stickShift = 0;
            }

            if (s[0] != 0 && s[2] != 0 && stickShift >= 4) {
                stickShift += s[7];
            }


             //else if (s[2] != 0) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                pp[0] = Math.round(pp[0]);
                pp[1] -= stickShift;
            //}

        }

    }

    var hitmapRender = job.hitable && renderer.onlyHitLayers;

    if (job.type == VTS_JOB_PACK) {
        if (renderer.drawLabelBoxes && o) {
            gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);
            this.drawLineString([[pp[0]+o[0], pp[1]+o[1], 0.5], [pp[0]+o[2], pp[1]+o[1], 0.5],
                                 [pp[0]+o[2], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[1], 0.5]], true, 1, [255, 0, 0, 255], null, true, null, null, null);

            if (job.reduce) {
                if (job.reduce[0] >= 10) {
                    this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[6].toFixed(3)+' '+job.reduce[1].toFixed(2)+' '+job.reduce[3].toFixed(2)+' '+job.reduce[7].toFixed(0), [1,0,0,1], 0.5);
                } else {
                    this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[1].toFixed(0)+' '+job.reduce[5].toFixed(0), [1,0,0,1], 0.5);
                }
            }
        }

        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.labelState);

        if (s[0] != 0 && s[2] != 0 && stickShift >= 4) {
            this.drawLineString([[pp[0], pp[1]+stickShift+s[7], pp[2]], [pp[0], pp[1]+s[7], pp[2]]], true, s[2], [s[3], s[4], s[5], ((fade !== null) ? s[6] * fade : s[6]) ], null, null, null, null, true);
            //stickShift += s[7];
        }

        for (var i = 0, li = job.subjobs.length; i < li; i++) {
            var subjob2 = job.subjobs[i], job2;
            subjob2.mvp = job.mvp;
            subjob2.updatePos = job.updatePos;

            var depth = subjob[7];

            o = null;
            files = subjob2.files;

            if (hitmapRender) {
                color = subjob[4];
                texture = renderer.whiteTexture;
            } else {
                color = subjob2.color;
                texture = subjob2.texture;
            }

            this.drawGpuSubJob(gpu, gl, renderer, screenPixelSize, [subjob2, stickShift, texture, files, color, pp, true, depth, o], fade);
        }

        return;
    }


    if (renderer.drawLabelBoxes && o) {
        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);
        this.drawLineString([[pp[0]+o[0], pp[1]+o[1], 0.5], [pp[0]+o[2], pp[1]+o[1], 0.5],
                             [pp[0]+o[2], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[3], 0.5], [pp[0]+o[0], pp[1]+o[1], 0.5]], true, 1, [255, 0, 0, 255], null, true, null, null, null);

        if (job.reduce) {
            if (job.reduce[0] >= 10) {
                this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[6].toFixed(3)+' '+job.reduce[1].toFixed(2)+' '+job.reduce[3].toFixed(2)+' '+job.reduce[7].toFixed(0), [1,0,0,1], 0.5);
                //this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[6].toFixed(3)+' '+job.reduce[1].toFixed(2)+' '+job.reduce[3].toFixed(2)+' '+job.fade, [1,0,0,1], 0.5);
            } else {
                this.drawText(pp[0]+o[0], pp[1]+o[3]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[1].toFixed(0)+' '+job.reduce[5].toFixed(0), [1,0,0,1], 0.5);
            }
        }
    }

    gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.labelState);

    var j = 0, lj = 1, color2 = job.color2;

    if (fade !== null) {
        color = [color[0], color[1], color[2], color[3] * fade];

        if (color2) {
            color2 = [color2[0], color2[1], color2[2], color2[3] * fade];
        }
    }

    if (s[0] != 0 && s[2] != 0 && stickShift >= 4) {
        this.drawLineString([[pp[0], pp[1]+stickShift+s[7], pp[2]], [pp[0], pp[1]+s[7], pp[2]]], true, s[2], [s[3], s[4], s[5], ((fade !== null) ? s[6] * fade : s[6]) ], null, null, null, null, true);
    }

    var prog = job.program; //renderer.progIcon;

    if (job.singleBuffer) {

        if (prog == renderer.progIcon) {
            var b = job.singleBuffer;
            prog = renderer.progImage;

            if (!job.singleBuffer2) {
                job.singleBuffer2 = new Float32Array(b);

                var tx = 1 / texture.width, ty = 1 / texture.height;
                b[2] *= tx; b[3] *= ty;
                b[6] *= tx; b[7] *= ty;
                b[10] *= tx; b[11] *= ty;
                b[14] *= tx; b[15] *= ty;
            }

            if (job.updatePos) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                pp[1] -= stickShift;
            }

            var b2 = job.singleBuffer2;

            b[0] = pp[0] + b2[0];
            b[1] = pp[1] + b2[1];

            b[4] = pp[0] + b2[4];
            b[5] = pp[1] + b2[5];

            b[8] = pp[0] + b2[8];
            b[9] = pp[1] + b2[9];

            b[12] = pp[0] + b2[12];
            b[13] = pp[1] + b2[13];

            gpu.useProgram(prog, ['aPosition']);
            gpu.bindTexture(texture);

            var vertices = renderer.rectVerticesBuffer;
            gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
            gl.vertexAttribPointer(prog.getAttribute('aPosition'), vertices.itemSize, gl.FLOAT, false, 0, 0);

            var indices = renderer.rectIndicesBuffer;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

            prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);
            prog.setMat4('uData', job.singleBuffer );
            prog.setVec4('uColor', color);
            prog.setFloat('uDepth', pp[2] * (1 + renderer.getZoffsetFactor(job.zbufferOffset) * 2));

            gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

        } else {

            var b = job.singleBuffer, bl = b.length, vbuff, vitems = (b.length / 4) * 6;

            if (bl > 384) { vbuff = renderer.textQuads128; prog = renderer.progLabel128; } else
            if (bl > 256) { vbuff = renderer.textQuads96; prog = renderer.progLabel96; } else
            if (bl > 192) { vbuff = renderer.textQuads64; prog = renderer.progLabel64; } else
            if (bl > 128) { vbuff = renderer.textQuads48; prog = renderer.progLabel48; } else
            if (bl > 64) { vbuff = renderer.textQuads32; prog = renderer.progLabel32; }
            else { vbuff = renderer.textQuads16; prog = renderer.progLabel16; }

            if (job.updatePos) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition);
                pp[1] -= stickShift;
            }

            gpu.useProgram(prog, ['aPosition']);
            prog.setSampler('uSampler', 0);
            prog.setMat4('uProjectionMatrix', renderer.imageProjectionMatrix);

            prog.setVec4('uScale', [screenPixelSize[0], screenPixelSize[1], 1, stickShift*2]);
            prog.setVec3('uOrigin', [pp[0],pp[1],pp[2] * (1 + renderer.getZoffsetFactor(job.zbufferOffset) * 2)]);
            prog.setVec4('uColor', hitmapRender ? color : color2);
            prog.setVec2('uParams', [job.outline[0], job.gamma[1]]);
            lj = hitmapRender ? 1 : 2;

            var vertexPositionAttribute = prog.getAttribute('aPosition');

            prog.setVec4('uData', b);

            //bind vetex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, vbuff);
            gl.vertexAttribPointer(vertexPositionAttribute, vbuff.itemSize, gl.FLOAT, false, 0, 0);

            //draw polygons
            for(;j<lj;j++) {
                if (j == 1) {
                    prog.setVec4('uColor', color);
                    prog.setVec2('uParams', [job.outline[1], job.gamma[0]]);
                }

                for (var i = 0, li = files.length; i < li; i++) {
                    var fontFiles = files[i];

                    for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                        var file = fontFiles[k];
                        prog.setFloat('uFile', Math.round(file+i*1000));
                        gpu.bindTexture(job.fonts[i].getTexture(file));
                        gl.drawArrays(gl.TRIANGLES, 0, vitems);
                    }
                }
            }

        }
        
        return;   
    }

    gpu.useProgram(prog, ['aPosition', 'aTexCoord', 'aOrigin']);
    prog.setSampler('uSampler', 0);
    prog.setMat4('uMVP', job.mvp, renderer.getZoffsetFactor(job.zbufferOffset));
    prog.setVec4('uScale', [screenPixelSize[0], screenPixelSize[1], (job.type == VTS_JOB_LABEL ? 1.0 : 1.0 / texture.width), stickShift*2]);

    if (prog != renderer.progIcon) {
        prog.setVec4('uColor', hitmapRender ? color : color2);
        prog.setVec2('uParams', [job.outline[0], job.gamma[1]]);
        lj = hitmapRender ? 1 : 2;
    } else {
        prog.setVec4('uColor', color);
    }

    var vertexPositionAttribute = prog.getAttribute('aPosition');
    var vertexTexcoordAttribute = prog.getAttribute('aTexCoord');
    var vertexOriginAttribute = prog.getAttribute('aOrigin');

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
    for(;j<lj;j++) {
        if (j == 1) {
            prog.setVec4('uColor', color);
            prog.setVec2('uParams', [job.outline[1], job.gamma[0]]);
        }

        if (files.length > 0) {
            for (var i = 0, li = files.length; i < li; i++) {
                var fontFiles = files[i];

                for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                    var file = fontFiles[k];
                    prog.setFloat('uFile', Math.round(file+i*1000));
                    gpu.bindTexture(job.fonts[i].getTexture(file));
                    gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);
                }
            }

        } else {
            gpu.bindTexture(texture);
            gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);
        }
    }
};


function q4Slerp(a, b, t, out) {
  // benchmarks:
  //    http://jsperf.com/quaternion-slerp-implementations
  var ax = a[0], ay = a[1], az = a[2], aw = a[3];
  var bx = b[0], by = b[1], bz = b[2], bw = b[3];

  var omega, cosom, sinom, scale0, scale1;

  // calc cosine
  cosom = ax * bx + ay * by + az * bz + aw * bw;
  // adjust signs (if necessary)
  if ( cosom < 0.0 ) {
    cosom = -cosom;
    bx = - bx;
    by = - by;
    bz = - bz;
    bw = - bw;
  }
  // calculate coefficients
  if ( (1.0 - cosom) > 0.000001) {
    // standard case (slerp)
    omega  = Math.acos(cosom);
    sinom  = Math.sin(omega);
    scale0 = Math.sin((1.0 - t) * omega) / sinom;
    scale1 = Math.sin(t * omega) / sinom;
  } else {
    // "from" and "to" quaternions are very close
    //  ... so we can do a linear interpolation
    scale0 = 1.0 - t;
    scale1 = t;
  }
  // calculate final values
  out[0] = scale0 * ax + scale1 * bx;
  out[1] = scale0 * ay + scale1 * by;
  out[2] = scale0 * az + scale1 * bz;
  out[3] = scale0 * aw + scale1 * bw;

  return out;
}

RendererDraw.prototype.drawGpuSubJobLineLabel = function(gpu, gl, renderer, screenPixelSize, subjob, fade) {
    if (!subjob) {
        return;
    }

    var job = subjob[0], texture = subjob[2],
        files = subjob[3], color = subjob[4], pp = subjob[5],
        o = job.noOverlap, localTilt, p2, p1, camVec, prog,
        useSE = renderer.useSuperElevation;

    if (useSE) {
        if (job.seCounter != renderer.seCounter) {
            job.seCounter = renderer.seCounter;
            job.labelPointsBuffer.id = -1;
            job.center2 = renderer.transformPointBySE(job.center);
        }
    } else {
        job.center2 = job.center;
    }

    var hitmapRender = job.hitable && renderer.onlyHitLayers, j, lj, p, p2;

    var gamma = job.outline[2] * 1.4142 / 20;
    var gamma2 = job.outline[3] * 1.4142 / 20;

    if (job.singleBuffer) {

        gpu.setState(hitmapRender ? renderer.lineLabelHitState : renderer.lineLabelState);

        //if (job.labelPoints.length < 1) return;

        pp = subjob[5];

        if (!pp || job.updatePos) {
            pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition, true);                    
        }

        var targetSize = job.labelSize * 0.5; 
        var sizeFactor = renderer.camera.scaleFactor2(pp[3])*0.5*renderer.curSize[1]*(renderer.curSize[0]/renderer.curSize[1]);
        var labelPoints = job.labelPoints;
        var labelIndex = job.labelIndex;
        var labelMorph = 0;

        lj = labelPoints.length;

        if (lj <= 1 || labelPoints[lj -1][0]*sizeFactor < targetSize) {
            return;
        }

        lj--;

        for (j = 0; j < lj; j++) {
            var s2 = labelPoints[j+1][0] * sizeFactor;

            if (s2 > targetSize) {
                var s1 = labelPoints[j][0] * sizeFactor;

                labelIndex = j;
                labelMorph = (targetSize - s1) / (s2 - s1);
                break;                
            }
        }

        var pointsIndex = (vec3.dot(labelPoints[labelIndex][1], renderer.labelVector) >= 0) ? 3 : 2;

        var b = (pointsIndex == 3) ? job.singleBuffer2 : job.singleBuffer, bl = b.length, vbuff, vitems = (b.length / 4) * 6;

        var points = labelPoints[labelIndex][pointsIndex], index = 0;
        var points2 = (labelPoints[labelIndex+1]) ? labelPoints[labelIndex+1][pointsIndex] : points;
        var q = [0,0,0,0], buffer;

        if (useSE) {
            buffer = job.labelPointsBuffer;

            if (buffer.id != (labelIndex * 1024 + pointsIndex)) {
                buffer.id = (labelIndex * 1024 + pointsIndex);
                if (buffer.points.length != points.length) {
                    buffer.points = new Array(points.length);
                    buffer.points2 = new Array(points.length);
                }

                var sePoints = buffer.points;
                var sePoints2 = buffer.points2;

                for(j = 0, lj = points.length; j < lj; j++) {
                    sePoints[j] = renderer.transformPointBySE2(points[j]);
                    sePoints2[j] = renderer.transformPointBySE2(points2[j]);
                }

                points = sePoints;
                points2 = sePoints2;

            } else {
                points = buffer.points;
                points2 = buffer.points2;
            }
        }

        if (!points.length || !points2.length) {
            return;
        }

        for(j = 0, lj = points.length; j < lj; j++) {
            p = points[j];
            p2 = points2[j];

            if (useSE) {
                b[index] = (p[4]+p[13]) + ((p2[4]+p2[13]) - (p[4]+p[13])) * labelMorph;
                b[index+1] = (p[5]+p[14]) + ((p2[5]+p2[14]) - (p[5]+p[14])) * labelMorph;
                b[index+2] = (p[6]+p[15]) + ((p2[6]+p2[15]) - (p[6]+p[15])) * labelMorph;
            } else {
                b[index] = p[4] + (p2[4] - p[4]) * labelMorph;
                b[index+1] = p[5] + (p2[5] - p[5]) * labelMorph;
                b[index+2] = p[6] + (p2[6] - p[6]) * labelMorph;
            }

            q4Slerp([p[7],p[8],p[9],p[10]], [p2[7],p2[8],p2[9],p2[10]], labelMorph, q);

            b[index+3] = q[0];
            b[index+4] = q[1];
            b[index+5] = q[2];
            b[index+6] = q[3];

            b[index+7] = p[11] + (p2[11] - p[11]) * labelMorph;
            b[index+8] = p[12] + (p2[12] - p[12]) * labelMorph;

            index += 12;
        }

        if (bl > 384) { vbuff = renderer.textQuads128; prog = renderer.progLineLabel128; } else
        if (bl > 256) { vbuff = renderer.textQuads96; prog = renderer.progLineLabel96; } else
        if (bl > 192) { vbuff = renderer.textQuads64; prog = renderer.progLineLabel64; } else
        if (bl > 128) { vbuff = renderer.textQuads48; prog = renderer.progLineLabel48; } else
        if (bl > 64) { vbuff = renderer.textQuads32; prog = renderer.progLineLabel32; }
        else { vbuff = renderer.textQuads16; prog = renderer.progLineLabel16; }

        var color2 = job.color2;

        if (fade !== null) {
            color = [color[0], color[1], color[2], color[3] * fade];

            if (color2) {
                color2 = [color2[0], color2[1], color2[2], color2[3] * fade];
            }
        }

        gpu.useProgram(prog, ['aPosition']);
        prog.setSampler('uSampler', 0);
        prog.setMat4('uMVP', job.mvp, renderer.getZoffsetFactor(job.zbufferOffset));

        prog.setVec4('uColor', hitmapRender ? color : color2);
        prog.setVec2('uParams', [job.outline[0], gamma2]);
        var lj = hitmapRender ? 1 : 2;

        var vertexPositionAttribute = prog.getAttribute('aPosition');

        prog.setVec4('uData', b);

        //bind vetex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, vbuff);
        gl.vertexAttribPointer(vertexPositionAttribute, vbuff.itemSize, gl.FLOAT, false, 0, 0);

        //draw polygons
        for(j = 0, lj = (hitmapRender ? 1 : 2); j < lj; j++) {
            if (j == 1) {
                prog.setVec4('uColor', color);
                prog.setVec2('uParams', [job.outline[1], gamma]);
            }

            for (var i = 0, li = files.length; i < li; i++) {
                var fontFiles = files[i];

                for (var k = 0, lk = fontFiles.length; k < lk; k++) {
                    var file = fontFiles[k];
                    prog.setFloat('uFile', Math.round(file+i*1000));
                    gpu.bindTexture(job.fonts[i].getTexture(file));
                    gl.drawArrays(gl.TRIANGLES, 0, vitems / 3); //TODO: demystify vitems
                }
            }
        }

        if (renderer.drawLabelBoxes) {
            var margin = o ? o[0] : 1, pp = [0,0,0], r;

            for(j = 0, lj = points.length; j < lj; j++) {
                p = points[j];
                p2 = points2[j];

                pp[0] = p[0] + (p2[0] - p[0]) * labelMorph;
                pp[1] = p[1] + (p2[1] - p[1]) * labelMorph;
                pp[2] = p[2] + (p2[2] - p[2]) * labelMorph;
                r = p[3] + (p2[3] - p[3]) * labelMorph;

                pp = renderer.project2(pp, renderer.camera.mvp, renderer.cameraPosition, true);                    
                this.drawCircle(pp, r*sizeFactor*margin, 1, [255, 0, 255, 255], null, null, null, null, null);
            }

            pp = subjob[5];

            if (!pp) {
                pp = renderer.project2(job.center2, renderer.camera.mvp, renderer.cameraPosition, true);                    
            }

            this.drawCircle(pp, 8, 1, [255, 255, 0, 255], null, null, null, null, null);

            if (job.reduce) {
                if (job.reduce[0] >= 10) {
                    this.drawText(pp[0], pp[1]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[6].toFixed(3)+' '+job.reduce[1].toFixed(2)+' '+job.reduce[3].toFixed(2)+' '+job.reduce[7].toFixed(0), [1,0,0,1], 0.5);
                } else {
                    this.drawText(pp[0], pp[1]-4*renderer.debug.debugTextSize, 4*renderer.debug.debugTextSize, ''+job.reduce[1].toFixed(0)+' '+job.reduce[5].toFixed(0), [1,0,0,1], 0.5);
                }
            }
        }

        return;
    }

};

export default RendererDraw;
