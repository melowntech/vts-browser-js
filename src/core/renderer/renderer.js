
import {vec3 as vec3_, mat4 as mat4_} from '../utils/matrix';
import GpuDevice_ from './gpu/device';
import GpuTexture_ from './gpu/texture';
import Camera_ from './camera';
import RenderInit_ from './init';
import RenderDraw_ from './draw';

//get rid of compiler mess
var vec3 = vec3_, mat4 = mat4_;
var GpuDevice = GpuDevice_;
var GpuTexture = GpuTexture_;
var Camera = Camera_;
var RenderInit = RenderInit_;
var RenderDraw = RenderDraw_;


var Renderer = function(core, div, onUpdate, onResize, config) {
    this.config = config || {};
    //this.setConfigParams(config);
    this.core = core;
    this.progTile = null;
    this.progHeightmap = null;
    this.progSkydome = null;
    this.progWireframeTile = null;
    this.progWireframeTile2 = null;
    this.progText = null;
    this.div = div;
    this.onUpdate = onUpdate;
    this.killed = false;
    this.onlyDepth = false;
    this.onlyLayers = false;
    this.onlyHitLayers = false;
    this.renderCounter = 1;
    this.hitmapCounter = 0;
    this.geoHitmapCounter = 0;
    this.clearStencilPasses = [];
    this.onResizeCall = onResize;
    //this.math = Math;
    this.stencilLineState = null;


    this.hoverFeatureCounter = 0;
    this.hoverFeatureList = [];

    this.touchSurfaceEvent = [];

    var rect = this.div.getBoundingClientRect();

    this.winSize = [rect.width, rect.height]; //QSize
    this.curSize = [rect.width, rect.height]; //QSize
    this.oldSize = [rect.width, rect.height]; //QSize
    this.dirty = true;
    this.cameraVector = [0,1,0];
    //this.texelSizeLimit = this.core.mapConfig.texelSize * texelSizeFactor;

    this.gpu = new GpuDevice(div, this.curSize, this.config.rendererAllowScreenshots, this.config.rendererAntialiasing);

    this.camera = new Camera(this, 45, 2, 1200000.0);

    //reduce garbage collection
    this.drawTileMatrix = mat4.create();
    this.drawTileMatrix2 = mat4.create();
    this.drawTileVec = [0,0,0];
    this.drawTileWorldMatrix = mat4.create();
    this.pixelTileSizeMatrix = mat4.create();

    this.heightmapMesh = null;
    this.heightmapTexture = null;

    this.skydomeMesh = null;
    this.skydomeTexture = null;

    this.hitmapTexture = null;
    this.geoHitmapTexture = null;
    this.hitmapSize = 1024;
    this.updateHitmap = true;
    this.updateGeoHitmap = true;

    this.redTexture = null;

    this.rectVerticesBuffer = null;
    this.rectIndicesBuffer = null;
    this.imageProjectionMatrix = null;

    this.font = null;
    this.fogDensity = 0;

    this.jobZBuffer = new Array(512);
    this.jobZBufferSize = new Array(512);
    
    for (var i = 0, li = this.jobZBuffer.length; i < li; i++) {
        this.jobZBuffer[i] = [];
        this.jobZBufferSize[i] = 0;
    }
    
    this.layerGroupVisible = [];
    this.bitmaps = {};
    
    this.cameraPosition = [0,0,0];
    this.cameraOrientation = [0,0,0];
    this.cameraTiltFator = 1;
    this.distanceFactor = 1;
    this.tiltFactor = 1;
    this.cameraVector = [0,0,0];
    this.labelVector = [0,0,0];
            
    //hack for vts maps
    //this.vtsHack = true;
    //this.vtsHack = false;

    //reduce garbage collection
    this.updateCameraMatrix = mat4.create();

    //debug
    this.lastHitPosition = [0,0,100];
    this.logTilePos = null;

    window.addEventListener('resize', (this.onResize).bind(this), false);

    this.gpu.init();

    //intit resources
    var init = new RenderInit(this);
    this.draw = new RenderDraw(this);

    //if (window["MelMobile"] && this.gpu.canvas != null) {
      //  this.gpu.canvas.style.width = "100%";
      //  this.gpu.canvas.style.height = "100%";
    //}

    var factor = 1; //window["MelScreenScaleFactor"];
    this.resizeGL(Math.floor(this.curSize[0]*factor), Math.floor(this.curSize[1]*factor));
};


Renderer.prototype.onResize = function() {
    if (this.killed){
        return;
    }

    var rect = this.div.getBoundingClientRect();
    //var factor = window["MelScreenScaleFactor"];
    this.resizeGL(Math.floor(rect.width), Math.floor(rect.height));
    
    if (this.onResizeCall) {
        this.onResizeCall();
    }
};


Renderer.prototype.kill = function() {
    if (this.killed){
        return;
    }

    this.killed = true;

    if (this.planet != null) {
        this.planet.kill();
    }

    //this.gpuCache.reset();

    if (this.heightmapMesh) this.heightmapMesh.kill();
    if (this.heightmapTexture) this.heightmapTexture.kill();
    if (this.skydomeMesh) this.skydomeMesh.kill();
    if (this.skydomeTexture) this.skydomeTexture.kill();
    if (this.hitmapTexture) this.hitmapTexture.kill();
    if (this.geoHitmapTexture) this.geoHitmapTexture.kill();
    if (this.redTexture) this.redTexture.kill();
    if (this.whiteTexture) this.whiteTexture.kill();
    if (this.blackTexture) this.blackTexture.kill();
    if (this.lineTexture) this.lineTexture.kill();
    if (this.textTexture2) this.textTexture2.kill();
    if (this.atmoMesh) this.atmoMesh.kill();
    if (this.bboxMesh) this.bboxMesh.kill();
    if (this.font) this.font.kill();
    if (this.plines) this.plines.kill();
    if (this.plineJoints) this.plineJoints.kill();
 
    this.gpu.kill();
    //this.div.removeChild(this.gpu.getCanvas());
};


Renderer.prototype.getPlanet = function() {
    return this.planet;
};


Renderer.prototype.resizeGL = function(width, height, skipCanvas, skipPaint) {
    this.camera.setAspect(width / height);
    this.curSize = [width, height];
    this.oldSize = [width, height];
    this.gpu.resize(this.curSize, skipCanvas);

    if (skipPaint !== true) {
        this.draw.paintGL();
    }

    var m = [];
    m[0] = 2.0/width; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = -2.0/height; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = -width*0.5*m[0]; m[13] = -height*0.5*m[5]; m[14] = 0; m[15] = 1;

    this.imageProjectionMatrix = m;
};


Renderer.prototype.project2 = function(point, mvp) {
    var p = [point[0], point[1], point[2], 1 ];

    //project point coords to screen
    var p2 = [0, 0, 0, 1];
    p2 = mat4.multiplyVec4(mvp, p);

    if (p2[3] != 0) {
        var sp = [0,0,0];

        //x and y are in screen pixels
        sp[0] = ((p2[0]/p2[3])+1.0)*0.5*this.curSize[0];
        sp[1] = (-(p2[1]/p2[3])+1.0)*0.5*this.curSize[1];

        //depth in meters
        sp[2] = p2[2]/p2[3];
        //sp[2] = p2[2];
        //sp[2] =  this.camera.getNear() + sp[2] ;//* (this.camera.getFar() - this.camera.getNear());

        return sp;
    } else {
        return [0, 0, 0];
    }
};


Renderer.prototype.project = function(point, mvp) {
    //get mode-view-projection matrix
    var mvp = this.camera.getMvpMatrix();

    //get camera position relative to position
    var cameraPos2 = this.camera.getPosition();

    //get global camera position
    var cameraPos = this.cameraPosition();

    //get point coords relative to camera
    var p = [point[0] - cameraPos[0] + cameraPos2[0], point[1] - cameraPos[1] + cameraPos2[1], point[2] - cameraPos[2] + cameraPos2[2], 1 ];

    //project point coords to screen
    var p2 = [0, 0, 0, 1];
    p2 = mat4.multiplyVec4(mvp, p);

    if (p2[3] != 0) {

        var sp = [0,0,0];

        //x and y are in screen pixels
        sp[0] = ((p2[0]/p2[3])+1.0)*0.5*this.curSize[0];
        sp[1] = (-(p2[1]/p2[3])+1.0)*0.5*this.curSize[1];

        //depth in meters
        sp[2] = p2[2]/p2[3];
        //sp[2] = p2[2];
        //sp[2] =  this.camera.getNear() + sp[2] ;//* (this.camera.getFar() - this.camera.getNear());

        return sp;
    } else {
        return [0, 0, 0];
    }
};


Renderer.prototype.getScreenRay = function(screenX, screenY) {
    if (this.camera == null) {
        return [0,0,1.0];
    }

    //conver screen coords
    var x = (2.0 * screenX) / this.curSize[0] - 1.0;
    var y = 1.0 - (2.0 * screenY) / this.curSize[1];
    
    //console.log("x: " + x + " y: " + y);

    var rayNormalizeDeviceSpace = [x, y, 1.0];

    var rayClipCoords = [rayNormalizeDeviceSpace[0], rayNormalizeDeviceSpace[1], -1.0, 1.0];

    var invProjection = mat4.create();
    invProjection = mat4.inverse(this.camera.getProjectionMatrix());

    var rayEye = [0,0,0,0];
    mat4.multiplyVec4(invProjection, rayClipCoords, rayEye); //inverse (projectionmatrix) * rayClipCoords;
    rayEye[2] = -1.0;
    rayEye[3] = 0.0;

    var invView = mat4.create();
    invView = mat4.inverse(this.camera.getModelviewMatrix());

    var rayWorld = [0,0,0,0];
    mat4.multiplyVec4(invView, rayEye, rayWorld); //inverse (projectionmatrix) * rayClipCoords;

    // don't forget to normalise the vector at some point
    rayWorld = vec3.normalize([rayWorld[0], rayWorld[1], rayWorld[2]]); //normalise (raywor);

    return rayWorld;
};


Renderer.prototype.hitTestGeoLayers = function(screenX, screenY, mode) {
    var gl = this.gpu.gl;

    //conver screen coords to texture coords
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        //return [null, false, []];
        return [false, 0,0,0,0];
    }

    var surfaceHit = false;

    if (screenX >= 0 && screenX < this.curSize[0] &&
        screenY >= 0 && screenY < this.curSize[1]) {

        var x = 0, y = 0;

        //get screen coords
        x = Math.floor(screenX * (this.hitmapSize / this.curSize[0]));
        y = Math.floor(screenY * (this.hitmapSize / this.curSize[1]));

        //get pixel value from framebuffer
        var pixel = this.geoHitmapTexture.readFramebufferPixels(x, this.hitmapSize - y - 1, 1, 1);

        //convert rgb values into depth
        var id = (pixel[0]) + (pixel[1]<<8) + (pixel[2]<<16);// + (pixel[3]*16581375.0);

        var surfaceHit = !(pixel[0] == 255 && pixel[1] == 255 && pixel[2] == 255 && pixel[3] == 255);

    //    console.log(JSON.stringify([pixel[0], pixel[1], pixel[2], pixel[3], surfaceHit]));

    }

    if (surfaceHit) {
        return [true, pixel[0], pixel[1], pixel[2], pixel[3]];
    } 

    return [false, 0,0,0,0];
};


Renderer.prototype.switchToFramebuffer = function(type) {
    var gl = this.gpu.gl;
    
    switch(type) {
    case 'base':
        var width = this.oldSize[0];
        var height = this.oldSize[1];
    
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
        this.gpu.setFramebuffer(null);
    
        this.camera.setAspect(width / height);
        this.curSize = [width, height];
        this.gpu.resize(this.curSize, true);
        this.camera.update();
            //this.updateCamera();
        this.onlyDepth = false;
        this.onlyHitLayers = false;
        break;

    case 'depth':
            //set texture framebuffer
        this.gpu.setFramebuffer(this.hitmapTexture);

        this.oldSize = [ this.curSize[0], this.curSize[1] ];
   
        gl.clearColor(1.0,1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);

        var size = this.hitmapSize;
    
            //clear screen
        gl.viewport(0, 0, size, size);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        this.curSize = [size, size];
            //this.gpu.resize(this.curSize, true);

            //var width = this.oldSize[0];
            //var height = this.oldSize[1];
            //this.camera.setAspect(width / height);

        this.gpu.clear();
            //this.camera.setAspect(2.5);
        this.camera.update();
        this.onlyDepth = true;
        this.onlyHitLayers = false;
        break;

    case 'geo':
            
        this.hoverFeatureCounter = 0;
            
        var size = this.hitmapSize;
            
            //set texture framebuffer
        this.gpu.setFramebuffer(this.geoHitmapTexture);
            
        var oldSize = [ this.curSize[0], this.curSize[1] ];
            
        var width = size;
        var height = size;
            
        gl.clearColor(1.0,1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
            
            //clear screen
        gl.viewport(0, 0, size, size);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            
        this.curSize = [width, height];
            
            //render scene
        this.onlyHitLayers = true;
            
        this.gpu.clear();
        this.camera.update();
        break;
    }
};


Renderer.prototype.hitTest = function(screenX, screenY) {
    var gl = this.gpu.gl;

    //get screen ray
    var screenRay = this.getScreenRay(screenX, screenY);
    var cameraPos = this.camera.getPosition();

    //conver screen coords to texture coords
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) {
        return [0, 0, 0, null, screenRay, Number.MAXVALUE, cameraPos];
    }

    var x = 0, y = 0;

    //get screen coords
    //if (this.curSize[0] > this.curSize[1]) {
    x = Math.floor(screenX * (this.hitmapSize / this.curSize[0]));
    y = Math.floor(screenY * (this.hitmapSize / this.curSize[1]));

    //console.log("hit screen: " + x + " " + y);

    //get pixel value from framebuffer
    var pixel = this.hitmapTexture.readFramebufferPixels(x, this.hitmapSize - y - 1, 1, 1);

    //convert rgb values into depth
    var depth = (pixel[0] * (1.0/255)) + (pixel[1]) + (pixel[2]*255.0) + (pixel[3]*65025.0);// + (pixel[3]*16581375.0);

    var surfaceHit = !(pixel[0] == 255 && pixel[1] == 255 && pixel[2] == 255 && pixel[3] == 255);


    //compute hit postion
    this.lastHitPosition = [cameraPos[0] + screenRay[0]*depth, cameraPos[1] + screenRay[1]*depth, cameraPos[2] + screenRay[2]*depth];


    //this.hitTestGeoLayers(screenX, screenY, "hover");
    //this.core.hover(screenX, screenY, false, { test:true});
    //this.core.click(screenX, screenY, { test2:true});

    return [this.lastHitPosition[0], this.lastHitPosition[1], this.lastHitPosition[2], surfaceHit, screenRay, depth, cameraPos];
};


Renderer.prototype.getZoffsetFactor = function(params) {
    //var offsetFactor = 1.0 + this.distanceFactor*params[1]*((1-params[2])+params[2]*this.tiltFactor);
//    return -Math.round(2000 * offsetFactor * params[0]);
//    return 1.0/(this.camera.getFar() - this.camera.getNear()) * offsetFactor * params[0];
//    return (1.0/(this.camera.getFar() - this.camera.getNear())) * (params[0]*10000) * this.distanceFactor;
//    return (1.0/(this.camera.getFar() - this.camera.getNear())) * offsetFactor * (params[0]*10000);

    return (params[0] + params[1]*this.distanceFactor + params[2]*this.tiltFactor)*0.0001;
};


Renderer.prototype.saveScreenshot = function(output, filename, filetype) {
    //this.updateHitmap = true;

    var gl = this.gpu.gl;

    //get current screen size
    var width = this.curSize[0];
    var height = this.curSize[1];

    //read rgba data from frame buffer
    //works only when webgl context is initialized with preserveDrawingBuffer: true
    var data2 = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data2);

    //flip image vertically
    var data = new Uint8Array(width * height * 4);
    var index = 0;

    for (var y = 0; y < height; y++) {

        var index2 = ((height-1) - y) * width * 4;

        for (var x = 0; x < width; x++) {
            data[index] = data2[index2];
            data[index+1] = data2[index2+1];
            data[index+2] = data2[index2+2];
            data[index+3] = data2[index2+3];
            index+=4;
            index2+=4;
        }
    }

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);
    context.putImageData(imageData, 0, 0);

    filetype = filetype || 'jpg'; 

    //open image in new window
    
    if (output == 'file') {
        var a = document.createElement('a');

        var dataURI= canvas.toDataURL('image/' + filetype);

        var byteString = atob(dataURI.split(',')[1]);
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        
          // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
      
        var file = new Blob([ab], {type: filetype});

        var url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    } if (output == 'tab') {
        window.open(canvas.toDataURL('image/' + filetype));
    }
    
    return imageData;
};


Renderer.prototype.getBitmap = function(url, filter, tiled) {
    var id = url + '*' + filter + '*' + tiled;

    var texture = this.bitmaps[id];
    if (texture == null) {
        texture = new GpuTexture(this.gpu, url, this.core, null, null, tiled, filter);
        this.bitmaps[id] = texture;
    }

    return texture;
};


export default Renderer;

/*
Renderer.prototype.setConfigParams = function(params) {
    if (typeof params === "object" && params !== null) {
        for (var key in params) {
            this.setConfigParam(key, params[key]);
        }
    }
};*/
