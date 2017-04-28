
import RendererGeometry_ from './geometry';
import GpuBBox_ from './gpu/bbox';
import GpuFont_ from './gpu/font';
import GpuMesh_ from './gpu/mesh';
import GpuPixelLine3_ from './gpu/pixel-line3';
import GpuProgram_ from './gpu/program';
import GpuShaders_ from './gpu/shaders';
import GpuTexture_ from './gpu/texture';

//get rid of compiler mess
var RendererGeometry = RendererGeometry_;
var GpuBBox = GpuBBox_;
var GpuFont = GpuFont_;
var GpuMesh = GpuMesh_;
var GpuPixelLine3 = GpuPixelLine3_;
var GpuProgram = GpuProgram_;
var GpuShaders = GpuShaders_;
var GpuTexture = GpuTexture_;


var RendererInit = function(renderer) {
    this.renderer = renderer;
    this.core = renderer.core;
    this.gpu = renderer.gpu;
    this.initShaders();
    this.initHeightmap();
    this.initSkydome();
    this.initHitmap();
    this.initTextMap();
    this.initImage();
    this.initTestMap();
    this.initBBox();
    this.initLines();
    this.initBaricentricBuffer();
};


RendererInit.prototype.initShaders = function() {
    var shaders = GpuShaders;
    var renderer = this.renderer;
    var gpu = this.gpu;
    renderer.progTile = new GpuProgram(gpu, shaders.tileVertexShader, shaders.tileFragmentShader);
    renderer.progTile2 = new GpuProgram(gpu, shaders.tile2VertexShader, shaders.tile2FragmentShader);
    renderer.progTile3 = new GpuProgram(gpu, shaders.tile2VertexShader, shaders.tile3FragmentShader);
    renderer.progShadedTile = new GpuProgram(gpu, shaders.tileTShadedVertexShader, shaders.tileShadedFragmentShader);
    renderer.progTShadedTile = new GpuProgram(gpu, shaders.tileTShadedVertexShader, shaders.tileTShadedFragmentShader);
    renderer.progFogTile = new GpuProgram(gpu, shaders.fogTileVertexShader, shaders.fogTileFragmentShader);
    renderer.progWireframeTile = new GpuProgram(gpu, shaders.tileWireframeVertexShader, shaders.tileWireframeFragmentShader);
    renderer.progWireframeTile2 = new GpuProgram(gpu, shaders.tileWireframeVertexShader, shaders.tileWireframe2FragmentShader);
    renderer.progWireframeTile3 = new GpuProgram(gpu, shaders.tileWireframe3VertexShader, shaders.tileWireframeFragmentShader);
    renderer.progFlatShadeTile = new GpuProgram(gpu, shaders.tileFlatShadeVertexShader, shaders.tileFlatShadeFragmentShader);
    renderer.progHeightmap = new GpuProgram(gpu, shaders.heightmapVertexShader, shaders.heightmapFragmentShader);
    renderer.progPlane = new GpuProgram(gpu, shaders.planeVertexShader, shaders.planeFragmentShader);
    renderer.progPlane2 = new GpuProgram(gpu, shaders.planeVertex2Shader, shaders.planeFragment2Shader);
    renderer.progSkydome = new GpuProgram(gpu, shaders.skydomeVertexShader, shaders.skydomeFragmentShader);
    renderer.progStardome = new GpuProgram(gpu, shaders.skydomeVertexShader, shaders.stardomeFragmentShader);
    
    renderer.progAtmo2 = new GpuProgram(gpu, shaders.atmoVertexShader, shaders.atmoFragmentShader);
    renderer.progAtmo = new GpuProgram(gpu, shaders.atmoVertexShader3, shaders.atmoFragmentShader3);

    renderer.progDepthTile = new GpuProgram(gpu, shaders.tileDepthVertexShader, shaders.tileDepthFragmentShader);
    renderer.progDepthHeightmap = new GpuProgram(gpu, shaders.heightmapDepthVertexShader, shaders.heightmapDepthFragmentShader);

    renderer.progBBox = new GpuProgram(gpu, shaders.bboxVertexShader, shaders.bboxFragmentShader);
    renderer.progBBox2 = new GpuProgram(gpu, shaders.bbox2VertexShader, shaders.bboxFragmentShader);
    renderer.progLine = new GpuProgram(gpu, shaders.lineVertexShader, shaders.lineFragmentShader);
    renderer.progLine3 = new GpuProgram(gpu, shaders.line3VertexShader, shaders.line3FragmentShader);
    renderer.progLine4 = new GpuProgram(gpu, shaders.line4VertexShader, shaders.line4FragmentShader);
    renderer.progTLine = new GpuProgram(gpu, shaders.tlineVertexShader, shaders.tlineFragmentShader);
    renderer.progTPLine = new GpuProgram(gpu, shaders.tplineVertexShader, shaders.tlineFragmentShader);
    renderer.progTBLine = new GpuProgram(gpu, shaders.tlineVertexShader, shaders.tblineFragmentShader);
    renderer.progTPBLine = new GpuProgram(gpu, shaders.tplineVertexShader, shaders.tblineFragmentShader);
    renderer.progPolygon = new GpuProgram(gpu, shaders.polygonVertexShader, shaders.polygonFragmentShader);
    renderer.progText = new GpuProgram(gpu, shaders.textVertexShader, shaders.textFragmentShader);
    renderer.progText2 = new GpuProgram(gpu, shaders.textVertexShader2, shaders.textFragmentShader);
    renderer.progImage = new GpuProgram(gpu, shaders.imageVertexShader, shaders.imageFragmentShader);
    renderer.progIcon = new GpuProgram(gpu, shaders.iconVertexShader, shaders.textFragmentShader);
};


RendererInit.prototype.initHeightmap = function() {
    var renderer = this.renderer;
    var gpu = this.gpu;

    // initialize heightmap geometry
    var meshData = RendererGeometry.buildHeightmap(5);
    renderer.heightmapMesh = new GpuMesh(gpu, meshData, null, this.core);

    var meshData = RendererGeometry.buildPlane(16);
    renderer.planeMesh = new GpuMesh(gpu, meshData, null, this.core);

    // create heightmap texture
    var size = 64;
    var halfLineWidth = 1;
    var data = new Uint8Array( size * size * 4 );

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {

            var index =(i*size+j)*4;

            if (i < halfLineWidth || i >= size-halfLineWidth || j < halfLineWidth || j >= size-halfLineWidth) {
                data[index] = 255;
                data[index + 1] = 255;
                data[index + 2] = 255;
            } else {
                data[index] = 32;
                data[index + 1] = 32;
                data[index + 2] = 32;
            }

            data[index + 3] = 255;
        }
    }


    renderer.heightmapTexture = new GpuTexture(gpu);
    renderer.heightmapTexture.createFromData(size, size, data, 'trilinear', true);
};


RendererInit.prototype.initHitmap = function() {
    var renderer = this.renderer;
    var size = renderer.hitmapSize;
    var data = new Uint8Array( size * size * 4 );

    renderer.hitmapTexture = new GpuTexture(this.gpu);
    renderer.hitmapTexture.createFromData(size, size, data);
    renderer.hitmapTexture.createFramebuffer(size, size);

    renderer.geoHitmapTexture = new GpuTexture(this.gpu);
    renderer.geoHitmapTexture.createFromData(size, size, data);
    renderer.geoHitmapTexture.createFramebuffer(size, size);
};


RendererInit.prototype.initTestMap = function() {
    var renderer = this.renderer;
    var gpu = this.gpu;

   // create red texture
    var size = 16;
    var data = new Uint8Array( size * size * 4 );

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {

            var index = (i*size+j)*4;

            data[index] = 255;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
        }
    }

    renderer.redTexture = new GpuTexture(gpu);
    renderer.redTexture.createFromData(size, size, data);

    var data = new Uint8Array( size * size * 4 );

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var index = (i*size+j)*4;
            data[index] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;
            data[index + 3] = 255;
        }
    }

    renderer.whiteTexture = new GpuTexture(gpu);
    renderer.whiteTexture.createFromData(size, size, data);

    var data = new Uint8Array( size * size * 4 );

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            var index = (i*size+j)*4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
        }
    }

    renderer.blackTexture = new GpuTexture(gpu);
    renderer.blackTexture.createFromData(size, size, data);

    var sizeX = 64;
    var sizeY = 8;
    var data = new Uint8Array( sizeX * sizeY * 4 );

    var chars = [
        '............................................................',
        '.....xxxxx.......................xxxxx......................',
        '.....xxxxx.......................xxxxx......................',
        '.....xxxxx.......................xxxxx......................',
        'xxxxxxxxxxxxxxxx............xxxxxxxxxxxxxxxx................',
        'xxxxxxxxxxxxxxxx............xxxxxxxxxxxxxxxx................',
        '............................................................'
    ];


    // create red texture
    var data = new Uint8Array( sizeX * sizeY * 4 );

    //clear texture
    for (var i = 0; i < sizeY; i++) {
        for (var j = 0; j < sizeX; j++) {

            var index = (i*sizeX+j)*4;

            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 0;//255;
        }
    }

    for (var i = 0, li = chars.length; i < li; i++) {

        var string = chars[i];

        for (var j = 0, lj = string.length; j < lj; j++) {

            var index = (i*sizeX+j)*4;

            if (string.charAt(j) != '.') {
                data[index] = 255;
                data[index + 1] = 255;
                data[index + 2] = 255;
                data[index + 3] = 255;
            }
        }
    }

    renderer.lineTexture = new GpuTexture(gpu);
    renderer.lineTexture.createFromData(sizeX, sizeY, data, 'linear', true);
};


RendererInit.prototype.initTextMap = function() {
    var renderer = this.renderer;
    var sizeX = 64;
    var sizeY = 8;

    //font texture
    var texture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAACACAMAAADTa0c4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFAAAA////pdmf3QAABIFJREFUeNrsnNuyqzAIhsP7v/Se6Yxra0L4OUVNCzetVqP5DAQItrVOiLg95739NnfOaR99RDj6esBw+CKZXiMK4PiuBkAcANoHAP3J5fzzAV2jePQIt6f4Ndb/MIChlVcCEFpAACZPfN4KUAF0/ufboDW3AuBMFgBwHTCfg2ftYgDUKBuA1ABuHKvA2P+5XdONIEt7BO2o2MdlAJoTQOsV6GEAswt0Zq/bsBhdeQQkqEDMwmIAnJHzA8i3ASkWRFKBbADyLGB3mlYD6DyhA4DfBlgsBDtirUPcBgC5woStYMgVtgKATWcB6DskKUEkGFLYrGw3+l3ydR16wKbbPDlWp4Xfo9vZwR1jtOMA6GkABrdvNmt1Vluy6pyvxu4Xt62fquyTggCTsIkCoIuv8gAA08w+ATBXAdSRY56xPDFPx/VPWFZp5v65kFMPgFjP70YASMfRsDn01xLPcwkRq1HLMoK647hR8v+nId74MQBjvIbUQePra42ZVXVcBCR3mIY89mYAlNGLflqA0V1seosCQNMg80B0bsLGAIDNwvFyiqu66ngVGGMGVBwyWwIwpty2DqEr/qf0Bq+DbjYkkcr4VUoOxiRjrYn3YY5SC4BQB/cF0Lq4kD1RCJ+tN4g6Jps5zfWu+QmSz9sUABkA0BIAXocmBwCJ99MDIASATkmtLQAIft4IgE/ZDStZ59yQbOQQAGZWYMbZ3FFCAGRHnwHQznegGAE+zwxNi8kALCOgS9tzAC4jYG1Qo0myRm0Ae/z8eleqewBoZLwfUswCsbT1KgBZD6QAzAEoXUe3K+xxVf2uLf5U3nBeMPRyACW/LtrwVX989id3PRQOG5Io6vh9XwC6stHIdGdJozun03lxNlwvH4u6UgDM8/LmJyx7ak12feEebaXmUwCOYJWk1JcYKsl74HL74wAaH93NqkE1FSKXc4cv0AjaPEEPgE4ru/ieWdvzVq/4psG3AYDFHlEAioQCuEgMgPjK1VDrqlkbTABAiQBGK38B0BlBSf9xtiAJQDM4NtDqMlaeyduTtkDjHgAtEQBj5ZGK2QE0aCcMAIxLSw0WVYlGDgOQXWE+afouAM0S398O4Nej3wIQf4cIHSfz9pbWugyep4MFIAFARvspbm8BcE2DOdvWnCJQAWFhJ/hKzh4AaB2A7NxedKmLPc+6PN4cL2S8GYC1QMIEQJvmFsJfxdvkEQAoLV4AogBS8/kNvdXlWe5GKhABvQUAZASDALJffY1XfsrToFXFbvYD1gBo6wC8LR7/uvj9CwHcfWuoUJItsVl5nwWAnhxxqsXatUq0OYCcaS/fkbK61u5H8jwAuUIEZXHNL1Jmub5oSKZWiDR9FttM4HEAigqRpn8TeB2AuWNiByAXSHCGbB7/3qYCfgCgPgADEEskbjCCaJDB/+kR6wP4P1Obl8jsBwDUB4yAxqKkthaATjX0KmCtDyCxm+yIMLjCbwBgrg94FYC3h8vLPPmfAVBSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlLy9fJPgAEAvWMULbGsSjwAAAAASUVORK5CYII=';
    renderer.textTexture2 = new GpuTexture(this.gpu, texture, this.core, null, true);

    // create red texture
    /*
    var data = new Uint8Array( sizeX * sizeY * 4 );

    //clear texture
    for (var i = 0; i < sizeY; i++) {
        for (var j = 0; j < sizeX; j++) {

            var index = (i*sizeX+j)*4;

             data[index] = 0;
             data[index + 1] = 0;
             data[index + 2] = 0;
             data[index + 3] = 255;
        }
    }*/
};


RendererInit.prototype.initImage = function() {
    var renderer = this.renderer;
    var gl = this.gpu.gl;

    //create vertices buffer for rect
    renderer.rectVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.rectVerticesBuffer);

    var vertices = [ 0, 0, 0, 1,   1, 0, 0, 1,
        2, 0, 0, 1,   3, 0, 0, 1 ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    renderer.rectVerticesBuffer.itemSize = 4;
    renderer.rectVerticesBuffer.numItems = 4;

    //create indices buffer for rect
    renderer.rectIndicesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, renderer.rectIndicesBuffer);

    var indices = [ 0, 2, 1,    0, 3, 2 ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    renderer.rectIndicesBuffer.itemSize = 1;
    renderer.rectIndicesBuffer.numItems = 6;
};


RendererInit.prototype.initSkydome = function() {
    var renderer = this.renderer;
    var meshData = RendererGeometry.buildSkydome(32, 64);
    renderer.skydomeMesh = new GpuMesh(this.gpu, meshData, null, this.core);
    //this.skydomeTexture = new GpuTexture(this.gpu, "./skydome.jpg", this.core);

    var meshData = RendererGeometry.buildSkydome(128, 256);
//    var meshData = RendererGeometry.buildSkydome(256, 512);
    renderer.atmoMesh = new GpuMesh(this.gpu, meshData, null, this.core);
};


RendererInit.prototype.initBBox = function() {
    var renderer = this.renderer;
    var gpu = this.gpu;
    renderer.bboxMesh = new GpuBBox(gpu);
    renderer.bboxMesh2 = new GpuBBox(gpu, true);

    renderer.font = new GpuFont(gpu, this.core);

/*
    if (!renderer.displayDrawTest) {
        return;
    }

    var x = 464823, y = 5582535, z = 259;

    var d = 400;

    var points = [
        [x,y,z],
        [x+d,y,z],
        [x+d,y+d,z],
        [x,y+d,z],
        [x+d*0.5,y,z],
        [x+d*0.5,y+d*2,z],
        [x,y,z+20],
        [x+d*0.5,y,z]
     ];

    this.lineTest = new GpuLine-3(this.gpu, this.core);

    var s = 20;
   // var s = 1.0;

    this.lineTest.addLine(points[0], points[7], s);
    this.lineTest.addLine(points[7], points[1], s);

    this.lineTest.addLine(points[1], points[2], s);
    this.lineTest.addLine(points[2], points[3], s);
    //this.lineTest.addLine(points[3], points[0], 5);

    this.lineTest.addLine(points[3], points[4], s);
    this.lineTest.addLine(points[4], points[5], s);

    this.lineTest.addCircle(points[0], s, 8);
    this.lineTest.addCircle(points[1], s, 8);
    this.lineTest.addCircle(points[2], s, 8);
    this.lineTest.addCircle(points[5], s, 8);

    this.lineTest.addCircle(points[3], s*5, 8);

    this.lineTest.compile();


    this.font = new GpuFont(this.gpu, this.core);
    this.textTest = new GpuText(this.gpu, this.core, this.font);

    this.textTest.addText(points[6], [1,0,0], "ABCabc", 1000);
    this.textTest.compile();

    //var placemark = "data:image/png;base64,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";
    var placemark = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAKTSURBVHjavNfPS1RBAAfwL6nbocMebDe79UMFQyG3Tit2EjatLhZkmluYGwZlJoJZUuy2BUGuSCAWFkgnCRIrfxyk3ZMtHpT+gbq8UgLrtGD43ny7vKnJLH2zu29gLnv4fj/zdnbeLEjCyQRwBsAUgI8AvtvzE4BZAM2O8xwUhwG8B0A5PUVF3OnxUP0MwCKASE4BAO7IAr/Px7v9/UzPz/OzYfCLYXAhnea9aJQlJSUq5EFOAACuytCL4TB/rK1RCMGNQwhBc32dlyMRFdGTFQDAPhl2vbOTlmVxq2FZFvt6e1VEVTaAhwB4rLZ2W+Uq4ngopCIKHQMAnJQBszMzdDpSyaQKaNIBJACwrLSUuqOqslICnugAJgGwualp00231RBC8FJbmwS80QHMAOCVjg5twI2uLgmY1gG8BsDzLS3agEh7uwS81QE8BsBDFRXaeyBQXS0Bz3QAZ+UuTiWTjssX0mn1VxDWARTKgBP1DY7OAdM0ebqxUQXs0j2IqmRIPBbbFsI0TQ4mEmp5MNt3wS0Z9nRk5L8Iy7L4YmxMLY/m6m34SIa+m5v7J2BpcYkFOwpk+VCu7wPDAFheVsZMJrPp6mtramT5cD4uJLvtywbvx+N/nQ3PR0fVR1+ec4CNiADgHr+f31ZX/9h4RwIBWd6XlyuZglgAwMTAwC/A9NSUuvrifAOuAWBNMEjLsiiE4IXWVsfffTaA/XK1K8vLJMm9v++CDXkH2IgUAE5OTPDryor6+D1uAaIAODQ4yJfj47L8lVaWJuAcAPZ0dzMei0nATTcBRwEwVFfHU/X1EtDoJuAAABZ7vSz2eiXgsJsA/4a/YwRw0E2AZxOAzzWAjfiglBvaOVkAOmyEAeC2bs7PAQBlCgrhBHN4PQAAAABJRU5ErkJggg==";
    this.placemarkTexture = new GpuTexture(this.gpu, placemark, this.core, null, true);
    */

};


RendererInit.prototype.initLines = function() {
    var gpu = this.gpu;
    var renderer = this.renderer;
    renderer.plineBuffer = new Float32Array(32*3);
    renderer.plines = new GpuPixelLine3(gpu, this.core, true, 64, true, 8);
    renderer.plineJoints = new GpuPixelLine3(gpu, this.core, false, 64, true, 8);

    renderer.stencilLineState = gpu.createState({blend:true, stencil:true, culling: false});
    renderer.lineLabelState = gpu.createState({blend:true, culling: false});
    renderer.stencilLineHitState = gpu.createState({blend:false, stencil:true, culling: false});
    renderer.lineLabelHitState = gpu.createState({blend:false, culling: false});
};


RendererInit.prototype.initBaricentricBuffer = function() {
    var gpu = this.gpu;
    var buffer = new Array(65535*3);

    for (var i = 0; i < 65535*3; i+=9) {
        buffer[i] = 1.0;
        buffer[i+1] = 0;
        buffer[i+2] = 0;

        buffer[i+3] = 0;
        buffer[i+4] = 1.0;
        buffer[i+5] = 0;

        buffer[i+6] = 0;
        buffer[i+7] = 0;
        buffer[i+8] = 1.0;
    }

    var gl = gpu.gl;
    gpu.barycentricBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gpu.barycentricBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(buffer), gl.STATIC_DRAW);
    gpu.barycentricBuffer.itemSize = 3;
    gpu.barycentricBuffer.numItems = buffer.length / 3;
};


export default RendererInit;
