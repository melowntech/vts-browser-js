
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
};


RendererDraw.prototype.drawSkydome = function(texture, shader) {
    if (!texture) {
        return;
    }

    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;
    
    //this.gpu.gl.disable(this.gpu.gl.CULL_FACE);

    ///progSkydome.use();
    var lower = 400; // put the dome a bit lower
    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var domeMat = mat4.create();
//    mat4.multiply(math.translationMatrix(0, 0, this.camera.getPosition()[2] - lower), math.scaleMatrixf(this.camera.getFar()*0.5), domeMat);

    var pos = renderer.camera.getPosition();
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2] - lower), math.scaleMatrixf(Math.min(renderer.camera.getFar()*0.9,600000)), domeMat);

    var mvp = mat4.create();
    mat4.multiply(renderer.camera.getMvpMatrix(), domeMat, mvp);
    mat4.multiply(mvp, normMat, mvp);


    gpu.useProgram(shader, ["aPosition", "aTexCoord"]);
    gpu.bindTexture(texture);
//    this.gpu.bindTexture(this.hitmapTexture);

    shader.setSampler("uSampler", 0);
    shader.setMat4("uMVP", mvp);

    gl.depthMask(false);

    renderer.skydomeMesh.draw(shader, "aPosition", "aTexCoord");

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
    //mat4.multiply(math.translationMatrix(this.camera.getPosition()[0]+pos[0], this.camera.getPosition()[1]+pos[1], this.camera.getPosition()[2]), math.scaleMatrixf(21.5), domeMat);

    var mvp = mat4.create();
    mat4.multiply(renderer.camera.getMvpMatrix(), domeMat, mvp);
    mat4.multiply(mvp, normMat, mvp);
    //var shader = this.progStardome;

    gpu.useProgram(shader, ["aPosition", "aTexCoord"]);
    gpu.bindTexture(texture || renderer.redTexture);

    shader.setSampler("uSampler", 0);
    shader.setMat4("uMVP", mvp);

    //this.atmoMesh.draw(shader, "aPosition", null /*"aTexCoord"*/);
    //this.atmoMesh.draw(shader, "aPosition", "aTexCoord");
    renderer.skydomeMesh.draw(shader, "aPosition", "aTexCoord");

    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();

    if (nocull) {
        gl.enable(gl.CULL_FACE);
    }
};


RendererDraw.prototype.drawBall = function(position, size, shader, params, params2, params3, normals) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    //gl.disable(gl.CULL_FACE);

//            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
//            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
//            gl.enable(gl.BLEND);


    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var pos = [position[0], position[1], position[2] ];

    var domeMat = mat4.create();
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2]), math.scaleMatrixf(size != null ? size : 1.5), domeMat);
    //mat4.multiply(math.translationMatrix(this.camera.getPosition()[0]+pos[0], this.camera.getPosition()[1]+pos[1], this.camera.getPosition()[2]), math.scaleMatrixf(21.5), domeMat);

    var mv = mat4.create();
    mat4.multiply(renderer.camera.getModelviewMatrix(), domeMat, mv);
    mat4.multiply(mv, normMat, mv);
    var proj = renderer.camera.getProjectionMatrix();

    var norm = [0,0,0, 0,0,0, 0,0,0];
    mat4.toInverseMat3(mv, norm);
    mat3.transpose(norm);
    
    //var shader = this.progStardome;

    gpu.useProgram(shader, ["aPosition"]);
    gpu.bindTexture(renderer.redTexture);

    shader.setSampler("uSampler", 0);
    shader.setMat4("uProj", proj);
    shader.setMat4("uMV", mv);
    
    if (normals) {
        shader.setMat3("uNorm", norm);
        gl.cullFace(gl.FRONT);
        //gl.disable(gl.DEPTH_TEST);
    }
    

    if (params) {
        shader.setVec4("uParams", params);
    }

    if (params2) {
        shader.setVec4("uParams2", params2);
    }

    if (params2) {
        shader.setVec4("uParams3", params3);
    }

    renderer.atmoMesh.draw(shader, "aPosition", null /*"aTexCoord"*/);

    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();

    //gl.enable(gl.CULL_FACE);
    if (normals) {
        gl.cullFace(gl.BACK);
        //gl.enable(gl.DEPTH_TEST);
    }

//    gl.disable(gl.BLEND);
};


RendererDraw.prototype.drawBall2 = function(position, size, shader, nfactor, dir, radius2) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    //gl.disable(gl.CULL_FACE);

    var normMat = mat4.create();
    mat4.multiply(math.scaleMatrix(2, 2, 2), math.translationMatrix(-0.5, -0.5, -0.5), normMat);

    var pos = [position[0], position[1], position[2] ];

    var domeMat = mat4.create();
    mat4.multiply(math.translationMatrix(pos[0], pos[1], pos[2]), math.scaleMatrixf(size != null ? size : 1.5), domeMat);
    //mat4.multiply(math.translationMatrix(this.camera.getPosition()[0]+pos[0], this.camera.getPosition()[1]+pos[1], this.camera.getPosition()[2]), math.scaleMatrixf(21.5), domeMat);

    var mv = mat4.create();
    mat4.multiply(renderer.camera.getModelviewMatrix(), domeMat, mv);
    mat4.multiply(mv, normMat, mv);
    var proj = renderer.camera.getProjectionMatrix();

    var norm = [0,0,0, 0,0,0, 0,0,0];
    mat4.toInverseMat3(mv, norm);
    mat3.transpose(norm);
    
    //var shader = this.progStardome;

    gpu.useProgram(shader, ["aPosition"]);
    gpu.bindTexture(renderer.redTexture);

    shader.setSampler("uSampler", 0);
    shader.setMat4("uProj", proj);
    shader.setMat4("uMV", mv);
    shader.setMat3("uNorm", norm);
    shader.setFloat("uNFactor", nfactor);
    shader.setVec3("uCenter", position);
    //shader.setVec3("uDir", dir);
    shader.setVec2("uRadius", [size, radius2]);

    renderer.atmoMesh.draw(shader, "aPosition", null /*"aTexCoord"*/);
    renderer.renderedPolygons += renderer.skydomeMesh.getPolygons();
};


RendererDraw.prototype.drawLineString = function(points, size, color, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;
    var index = 0;

    var totalPoints = points.length; 
    
    if (totalPoints > 32) {
        for (var i = 0; i < totalPoints; i += 31) {
            var p = points.slice(i, i + 32); 
            this.drawLineString(p, size, color, depthTest, transparent, writeDepth, useState);
        }
        return;
    }

    var plineBuffer = renderer.plineBuffer;

    //fill points
    for (var i = 0; i < totalPoints; i++) {
        var p = points[i];
        plineBuffer[index] = p[0];
        plineBuffer[index+1] = p[1];
        plineBuffer[index+2] = p[2] || 0;
        index += 3;
    }

    if (useState != true) {
        if (depthTest != true) {
            gl.disable(gl.DEPTH_TEST);
        }
    
        if (transparent == true) {
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
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

    gpu.useProgram(prog, ["aPosition"]);
    prog.setMat4("uMVP", renderer.imageProjectionMatrix);
    prog.setVec3("uScale", [(2 / renderer.curSize[0]), (2 / renderer.curSize[1]), size*0.5]);
    prog.setVec4("uColor", (color != null ? color : [255,255,255,255]));
    prog.setVec3("uPoints", plineBuffer);

    renderer.plines.draw(prog, "aPosition", totalPoints);

    if (useState != true) {
        if (depthTest != true) {
            gl.enable(gl.DEPTH_TEST);
        }
    
        if (transparent == true) {
            gl.disable(gl.BLEND);
        }
    
        if (writeDepth === false) {
            gl.depthMask(false); 
        }
    
        gl.enable(gl.CULL_FACE);
    }
};


//draw 2d image - used for debuging
RendererDraw.prototype.drawImage = function(x, y, lx, ly, texture, color, depth, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (texture == null || renderer.imageProjectionMatrix == null) {
        return;
    }

    if (useState != true) {
        if (depthTest != true) {
            gl.disable(gl.DEPTH_TEST);
        }
    
        if (transparent == true) {
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
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

    gpu.useProgram(prog, ["aPosition"]);
    gpu.bindTexture(texture);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute("aPosition"), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4("uProjectionMatrix", renderer.imageProjectionMatrix);

    prog.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    prog.setVec4("uColor", (color != null ? color : [1,1,1,1]));
    prog.setFloat("uDepth", depth != null ? depth : 0);

    gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

    if (useState != true) {
        if (writeDepth === false) {
            gl.depthMask(true); 
        }
    
        if (depthTest != true) {
            gl.enable(gl.DEPTH_TEST);
        }
    
        if (transparent == true) {
            gl.disable(gl.BLEND);
        }
    
        gl.enable(gl.CULL_FACE);
    }
};


RendererDraw.prototype.drawBillboard = function(mvp, texture, color, depthTest, transparent, writeDepth, useState) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (useState != true) {
        if (depthTest != true) {
            gl.disable(gl.DEPTH_TEST);
        }
    
        if (transparent == true) {
            //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
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

    gpu.useProgram(prog, ["aPosition", "aTexCoord"]);
    gpu.bindTexture(texture);
    prog.setSampler("uSampler", 0);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute("aPosition"), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4("uProjectionMatrix", mvp);

    var x = 0, y = 0, lx = 1, ly = 1;

    prog.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    prog.setVec4("uColor", (color != null ? color : [1,1,1,1]));
    prog.setFloat("uDepth", 0);

    gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

    if (useState != true) {
        if (writeDepth === false) {
            gl.depthMask(true); 
        }
    
        if (depthTest != true) {
            gl.enable(gl.DEPTH_TEST);
        }
    
        if (transparent == true) {
            gl.disable(gl.BLEND);
        }
    
        gl.enable(gl.CULL_FACE);
    }
};


//draw flat 2d image - used for debuging
RendererDraw.prototype.drawFlatImage = function(x, y, lx, ly, texture, color, depth) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    if (texture == null || renderer.imageProjectionMatrix == null) {
        return;
    }

    var prog = renderer.progImage;

    gpu.useProgram(prog, ["aPosition"]);
    gpu.bindTexture(texture);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute("aPosition"), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4("uProjectionMatrix", renderer.imageProjectionMatrix);

    prog.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    prog.setVec4("uColor", (color != null ? color : [1,1,1,1]));
    prog.setFloat("uDepth", depth != null ? depth : 0);

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

    if (useState != true) {
        gl.disable(gl.CULL_FACE);
    
    
        if (depth == null) {
            gl.disable(gl.DEPTH_TEST);
        } else {
            gl.depthFunc(gl.LEQUAL);
            gl.enable(gl.DEPTH_TEST);
        }
    }

    var prog = renderer.progImage;

    gpu.useProgram(prog, ["aPosition"]);
    gpu.bindTexture(renderer.textTexture2);
    //this.gpu.bindTexture(this.textTexture2);

    var vertices = renderer.rectVerticesBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.vertexAttribPointer(prog.getAttribute("aPosition"), vertices.itemSize, gl.FLOAT, false, 0, 0);

    var indices = renderer.rectIndicesBuffer;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);

    prog.setMat4("uProjectionMatrix", renderer.imageProjectionMatrix);
    prog.setVec4("uColor", color);
    prog.setFloat("uDepth", depth != null ? depth : 0);

    //size *= 2;

    var sizeX = size - 1;
    var sizeY = size;// * (7/4);

    var sizeX2 = Math.round(size*0.5);// - 1;

    var texelX = 1 / 256;
    var texelY = 1 / 128;

    var lx = this.getTextSize(size, text) + 2;

    //draw black line before text
    var char = 0;
    var charPosX = (char & 15) << 4;
    var charPosY = (char >> 4) << 4;

    prog.setMat4("uData", [
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

                prog.setMat4("uData", [
                    x, y,  (charPosX * texelX), (charPosY * texelY),
                    x + sizeX2, y,  ((charPosX+8) * texelX), (charPosY * texelY),
                    x + sizeX2, y + sizeY, ((charPosX + 8) * texelX), ((charPosY+16) * texelY),
                    x,  y + sizeY,  (charPosX * texelX), ((charPosY+16) * texelY) ]);

                x += sizeX2;
                break;

            default:

                prog.setMat4("uData", [
                    x, y,  (charPosX * texelX), (charPosY * texelY),
                    x + sizeX, y,  ((charPosX+15) * texelX), (charPosY * texelY),
                    x + sizeX, y + sizeY, ((charPosX + 15) * texelX), ((charPosY+16) * texelY),
                    x,  y + sizeY,  (charPosX * texelX), ((charPosY+16) * texelY) ]);

                x += sizeX;
                
                break;
        }

        gl.drawElements(gl.TRIANGLES, indices.numItems, gl.UNSIGNED_SHORT, 0);

    }

    if (useState != true) {
        gl.enable(gl.CULL_FACE);
    
        if (depth == null) {
            gl.enable(gl.DEPTH_TEST);
        }
    }
};


RendererDraw.prototype.getTextSize = function(size, text) {
    var sizeX = size - 1;
    var sizeX2 = Math.round(size*0.5);// - 1;
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

    if (clearStencilPasses.length > 0) {
        clearPass = clearStencilPasses[0];
        clearPassIndex++;
    }

    //draw job buffer and also clean buffer
    for (var i = 0, li = jobZBuffer.length; i < li; i++) {
        var lj = jobZBufferSize[i];
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
            for (var j = 0; j < lj; j++) {
                if (buffer[j].hitable) {
                    this.drawGpuJob(gpu, gl, this, buffer[j], screenPixelSize);
                }
            }
        } else {
            for (var j = 0; j < lj; j++) {
                this.drawGpuJob(gpu, gl, this, buffer[j], screenPixelSize);
                //buffer[j] = null;
            }
        }

        //this.jobZBufferSize[i] = 0;
    }
};

/*
RendererDraw.prototype.drawHitmapGpuJobs = function() {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    renderer.hoverFeatureCounter = 0;

    var size = renderer.hitmapSize;

    //set texture framebuffer
    gpu.setFramebuffer(renderer.geoHitmapTexture);

    var oldSize = [ renderer.curSize[0], renderer.curSize[1] ];

    var width = size;
    var height = size;

    gl.clearColor(1.0,1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //clear screen
    gl.viewport(0, 0, size, size);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderer.curSize = [width, height];

    //render scene
    renderer.onlyHitLayers = true;
    //this.paintGL();

    gpu.clear();
    renderer.updateCamera();

    //this.camera.update();
    this.drawGpuJobs();

    renderer.onlyHitLayers = false;

    //return screen framebuffer
    width = oldSize[0];
    height = oldSize[1];

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gpu.setFramebuffer(null);

    renderer.camera.setAspect(width / height);
    renderer.curSize = [width, height];
    gpu.resize(this.curSize, true);
    renderer.camera.update();
    renderer.updateCamera();
};*/


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

/*
RendererDraw.prototype.fogSetup = function(program, fogDensity) {
    var renderer = this.renderer;

    // the fog equation is: exp(-density*distance), this gives the fraction
    // of the original color that is still visible at some distance

    // we define visibility as a distance where only 5% of the original color
    // is visible; from this it is easy to calculate the correct fog density

    //var density = Math.log(0.05) / this.core.coreConfig.cameraVisibility;
	var cameraVisibility = 1200000.0;
    var density = Math.log(0.05) / (cameraVisibility * 10*(Math.max(5,-renderer.camera.getOrientation()[1])/90));
    density *= (5.0) / (Math.min(50000, Math.max(renderer.cameraDistance, 1000)) /5000);

    if (renderer.drawFog == false) {
        density = 0;
    }

    //console.log("fden: " + density);

    //reduce fog when camera is facing down
    //density *= 1.0 - (-this.orientation[0]/90)

    program.setFloat(fogDensity, density);
};*/


RendererDraw.prototype.paintGL = function() {
    var renderer = this.renderer;

    this.gpu.clear(true, false);

    if (renderer.onlyLayers != true) {
        if (renderer.onlyDepth != true && renderer.onlyHitLayers != true) {
            this.drawSkydome();
        }
    }
};


RendererDraw.prototype.drawGpuJob = function(gpu, gl, renderer, job, screenPixelSize) {
    var gpu = this.gpu;
    var gl = this.gl;
    var renderer = this.renderer;

    var mv = job.mv;
    var mvp = job.mvp;

    if (!job.ready) {
        return;
    }

    if (job.state != 0) {
        var id = job.eventInfo["#id"];

        if (id != null && renderer.hoverFeature != null) {
            if (job.state == 1){  // 1 = no hover state

                if (renderer.hoverFeature[0]["#id"] == id) { //are we hovering over feature?
                    return;
                }

            } else { // 2 = hover state

                if (renderer.hoverFeature[0]["#id"] != id) { //are we hovering over feature?
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

    var color = job.color;

    if (hitmapRender) {
        var c = renderer.hoverFeatureCounter;
        //color = [(c&255)/255, ((c>>8)&255)/255, ((c>>16)&255)/255, 1];
        color = [(c&255)/255, ((c>>8)&255)/255, 0, 0];
        renderer.hoverFeatureList[c] = [job.eventInfo, job.center, job.clickEvent, job.hoverEvent, job.enterEvent, job.leaveEvent];
        renderer.hoverFeatureCounter++;
    }

    switch(job.type) {
        case "flat-line":
            if (hitmapRender) {
                gpu.setState(renderer.stencilLineHitState);
            } else {
                gpu.setState(renderer.stencilLineState);
            }

            gpu.setState(renderer.stencilLineState);
            var prog = renderer.progLine;

            gpu.useProgram(prog, ["aPosition"]);
            prog.setVec4("uColor", color);
            prog.setMat4("uMVP", mvp, renderer.getZoffsetFactor(job.zbufferOffset));

            var vertexPositionAttribute = prog.getAttribute("aPosition");

            //bind vetex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

            //draw polygons
            gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

            break;

        case "flat-tline":
        case "pixel-line":
        case "pixel-tline":
            if (hitmapRender) {
                gpu.setState(renderer.stencilLineHitState);
            } else {
                gpu.setState(renderer.stencilLineState);
            }
            
            var prog = job.program;
            var texture = null;
            var textureParams = [0,0,0,0];

            if (job.type != "pixel-line") {

                if (hitmapRender) {
                    texture = renderer.whiteTexture;
                } else {
                    var t = job.texture;

                    if (t == null || t[0] == null) {
                        return;
                    }

                    texture = t[0];
                    textureParams = [0, t[1]/t[0].height, (t[1]+t[2])/t[0].height, 0];

                    if (job.type == "flat-tline") {
                        textureParams[0] = 1/job.lineWidth/(texture.width/t[2]);
                    } else {
                        var lod = job.lod; // || job.layer.currentLod;
                        var tileSize = 256;//job.layer.core.mapConfig.tileSize(lod);
                        var tilePixelSize = tileSize / 256;//job.layer.tilePixels;
                        textureParams[0] = 1/texture.width/tilePixelSize;
                    }
                }

                if (texture.loaded == false) {
                    return;
                }

                gpu.bindTexture(texture);
            }

            gpu.useProgram(prog, ["aPosition","aNormal"]);
            prog.setVec4("uColor", color);
            prog.setVec2("uScale", screenPixelSize);
            prog.setMat4("uMVP", mvp, renderer.getZoffsetFactor(job.zbufferOffset));

            if (job.type != "pixel-line") {
                if (job.background != null) {
                    prog.setVec4("uColor2", job.background);
                }
                prog.setVec4("uParams", textureParams);
                prog.setSampler("uSampler", 0);
            }

            var vertexPositionAttribute = prog.getAttribute("aPosition");
            var vertexNormalAttribute = prog.getAttribute("aNormal");

            //bind vetex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

            //bind vetex normals
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexNormalBuffer);
            gl.vertexAttribPointer(vertexNormalAttribute, job.vertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

            //draw polygons
            gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

            break;

        case "line-label":
            if (hitmapRender) {
                gpu.setState(renderer.lineLabelHitState);
            } else {
                gpu.setState(renderer.lineLabelState);
            }

            var texture = hitmapRender ? renderer.whiteTexture : renderer.font.texture;
            
            //var yaw = math.radians(renderer.cameraOrientation[0]);
            //var forward = [-Math.sin(yaw), Math.cos(yaw), 0, 0];

            var prog = renderer.progText;

            gpu.bindTexture(texture);

            gpu.useProgram(prog, ["aPosition", "aTexCoord"]);
            prog.setSampler("uSampler", 0);
            prog.setMat4("uMVP", mvp, renderer.getZoffsetFactor(job.zbufferOffset));
            prog.setVec4("uVec", renderer.labelVector);
            prog.setVec4("uColor", color);
            //prog.setVec2("uScale", screenPixelSize);

            var vertexPositionAttribute = prog.getAttribute("aPosition");
            var vertexTexcoordAttribute = prog.getAttribute("aTexCoord");

            //bind vetex positions
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexPositionBuffer);
            gl.vertexAttribPointer(vertexPositionAttribute, job.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

            //bind vetex texcoords
            gl.bindBuffer(gl.ARRAY_BUFFER, job.vertexTexcoordBuffer);
            gl.vertexAttribPointer(vertexTexcoordAttribute, job.vertexTexcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

            //draw polygons
            gl.drawArrays(gl.TRIANGLES, 0, job.vertexPositionBuffer.numItems);

            break;

        case "icon":
        case "label":
            if (hitmapRender) {
                gpu.setState(renderer.lineLabelHitState);
            } else {
                gpu.setState(renderer.lineLabelState);
            }

            var texture = hitmapRender ? renderer.whiteTexture : job.texture;

            if (texture.loaded == false) {
                return;
            }

            if (job.culling != 180) {
                var p2 = job.center;
                var p1 = renderer.cameraPosition;
                var camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

                if (job.visibility != 0) {
                    var l = vec3.length(camVec);
                    if (l > job.visibility) {
                        return;
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
            } else if (job.visibility != 0) {
                var p2 = job.center;
                var p1 = renderer.cameraPosition;
                var camVec = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
                var l = vec3.length(camVec);
                if (l > job.visibility) {
                    return;
                }
            }
            
            //console.log(""+JSON.stringify(renderer.cameraPosition));
            
            //value larger then 0 means that visibility is tested
            //if (job.visibility != 0) {
                //job.visibility
            //}

            gpu.setState(renderer.lineLabelState);
            
            var stickShift = 0;

            if (job.stick[0] != 0) {
                var s = job.stick;
                stickShift = renderer.cameraTiltFator * s[0];
                
                if (stickShift < s[1]) {
                    stickShift = 0;
                } else if (s[2] != 0) {
                    var pp = renderer.project2(job.center, mvp);
                    pp[0] = Math.round(pp[0]);

                    this.drawLineString([[pp[0], pp[1], pp[2]], [pp[0], pp[1]-stickShift, pp[2]]], s[2], [s[3], s[4], s[5], s[6]], null, null, null, true);
                }
            }

            var prog = renderer.progIcon;

            gpu.bindTexture(texture);

            gpu.useProgram(prog, ["aPosition", "aTexCoord", "aOrigin"]);
            prog.setSampler("uSampler", 0);
            prog.setMat4("uMVP", mvp, renderer.getZoffsetFactor(job.zbufferOffset));
            prog.setVec4("uScale", [screenPixelSize[0], screenPixelSize[1], (job.type == "label" ? 1.0 : 1.0 / texture.width), stickShift*2]);
            prog.setVec4("uColor", color);
            //prog.setVec2("uScale", screenPixelSize);

            var vertexPositionAttribute = prog.getAttribute("aPosition");
            var vertexTexcoordAttribute = prog.getAttribute("aTexCoord");
            var vertexOriginAttribute = prog.getAttribute("aOrigin");

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
