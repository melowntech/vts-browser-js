
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

    //renderer.font = new GpuFont(this.gpu, this.core);
    //renderer.fonts['#default'] = renderer.font;
    //renderer.font = new GpuFont(this.gpu, this.core, null, null, './allinone.fnt');

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
    renderer.progPlane = new GpuProgram(gpu, shaders.planeVertexShader, shaders.planeFragmentShader); //flat
    renderer.progPlane2 = new GpuProgram(gpu, shaders.planeVertex2Shader, shaders.planeFragment2Shader); //poles
    renderer.progPlane3 = new GpuProgram(gpu, shaders.planeVertex3Shader, shaders.planeFragmentShader); // grid         

    renderer.progSkydome = new GpuProgram(gpu, shaders.skydomeVertexShader, shaders.skydomeFragmentShader);
    renderer.progStardome = new GpuProgram(gpu, shaders.skydomeVertexShader, shaders.stardomeFragmentShader);
    
    renderer.progAtmo2 = new GpuProgram(gpu, shaders.atmoVertexShader, shaders.atmoFragmentShader);
    renderer.progAtmo = new GpuProgram(gpu, shaders.atmoVertexShader3, shaders.atmoFragmentShader3);

    renderer.progDepthTile = new GpuProgram(gpu, shaders.tileDepthVertexShader, shaders.tileDepthFragmentShader);
    renderer.progDepthHeightmap = new GpuProgram(gpu, shaders.heightmapDepthVertexShader, shaders.heightmapDepthFragmentShader);

    renderer.progBBox = new GpuProgram(gpu, shaders.bboxVertexShader, shaders.bboxFragmentShader);
    renderer.progBBox2 = new GpuProgram(gpu, shaders.bbox2VertexShader, shaders.bboxFragmentShader);

    renderer.progLine = new GpuProgram(gpu, shaders.lineVertexShader, shaders.lineFragmentShader); //line
    renderer.progELine = new GpuProgram(gpu, shaders.elineVertexShader, shaders.elineFragmentShader); //line elements 
    renderer.progLine3 = new GpuProgram(gpu, shaders.line3VertexShader, shaders.lineFragmentShader); //pixel line
    renderer.progELine3 = new GpuProgram(gpu, shaders.eline3VertexShader, shaders.elineFragmentShader); //pixel line elements
    renderer.progLine4 = new GpuProgram(gpu, shaders.line4VertexShader, shaders.lineFragmentShader); //direct linestring pixel line
    renderer.progRLine = new GpuProgram(gpu, shaders.rlineVertexShader, shaders.lineFragmentShader); //dynamic width line
    renderer.progERLine = new GpuProgram(gpu, shaders.erlineVertexShader, shaders.elineFragmentShader); //dynamic width line elements
    renderer.progTLine = new GpuProgram(gpu, shaders.tlineVertexShader, shaders.tlineFragmentShader); //textured line
    renderer.progTPLine = new GpuProgram(gpu, shaders.tplineVertexShader, shaders.tlineFragmentShader); //textured pixed line
    renderer.progTBLine = new GpuProgram(gpu, shaders.tlineVertexShader, shaders.tblineFragmentShader); //textured line with background color
    renderer.progTPBLine = new GpuProgram(gpu, shaders.tplineVertexShader, shaders.tblineFragmentShader); //textured pixel line with background color
    renderer.progETLine = new GpuProgram(gpu, shaders.etlineVertexShader, shaders.elineFragmentShader); //textured line elements
    renderer.progETPLine = new GpuProgram(gpu, shaders.etplineVertexShader, shaders.elineFragmentShader); //textured pixed line elements
    renderer.progLineWireframe = new GpuProgram(gpu, shaders.lineWireframeVertexShader, shaders.lineWireframeFragmentShader); //line with wireframe for debugging

    renderer.progPolygon = new GpuProgram(gpu, shaders.polygonVertexShader, shaders.polygonFragmentShader);
    renderer.progText = new GpuProgram(gpu, shaders.textVertexShader, shaders.textFragmentShader);
    renderer.progText2 = new GpuProgram(gpu, shaders.text2VertexShader, shaders.text2FragmentShader); //line label
    renderer.progImage = new GpuProgram(gpu, shaders.imageVertexShader, shaders.imageFragmentShader);
    renderer.progIcon = new GpuProgram(gpu, shaders.iconVertexShader, shaders.textFragmentShader); //label or icon
    renderer.progIcon2 = new GpuProgram(gpu, shaders.icon2VertexShader, shaders.text2FragmentShader); //label
};

RendererInit.prototype.initProceduralShaders = function() {
    var shaders = GpuShaders;
    var renderer = this.renderer;
    var gpu = this.gpu;
    renderer.progHmapPlane = new GpuProgram(gpu, shaders.planeVertex4Shader, shaders.planeFragmentShader2);
    renderer.progHmapPlane2 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define grid\n' + shaders.planeFragmentShader2);
    renderer.progHmapPlane3 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define exmap\n' + shaders.planeFragmentShader2);
    renderer.progHmapPlane4 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define flat\n' + shaders.planeFragmentShader2);
    renderer.progHmapPlane5 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define normals\n' + shaders.planeFragmentShader2);
    renderer.progHmapPlane6 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define nmix\n#define normals\n' + shaders.planeFragmentShader2);
    renderer.progHmapPlane7 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define nmix\n' + shaders.planeFragmentShader2);
    renderer.progHmapPlane8 = new GpuProgram(gpu, shaders.planeVertex4Shader, '#define exmap\n#define classmap\n' + shaders.planeFragmentShader2);
}

RendererInit.prototype.initHeightmap = function() {
    var renderer = this.renderer;
    var gpu = this.gpu;

    // initialize heightmap geometry
    var meshData = RendererGeometry.buildHeightmap(5);
    renderer.heightmapMesh = new GpuMesh(gpu, meshData, null, this.core);

    meshData = RendererGeometry.buildPlane(16);
    renderer.planeMesh = new GpuMesh(gpu, meshData, null, this.core);

    meshData = RendererGeometry.buildPlane(128);
    renderer.planeMesh2 = new GpuMesh(gpu, meshData, null, this.core);

    // create heightmap texture
    var size = 64;
    var halfLineWidth = 1;
    var data = new Uint8Array( size * size * 4 );

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {

            var index = (i*size+j)*4;

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

    renderer.geoHitmapTexture2 = new GpuTexture(this.gpu);
    renderer.geoHitmapTexture2.createFromData(size, size, data);
    renderer.geoHitmapTexture2.createFramebuffer(size, size);
};


RendererInit.prototype.initTestMap = function() {
    var renderer = this.renderer;
    var gpu = this.gpu;

   // create red texture
    var size = 16, i, j, index;
    var data = new Uint8Array( size * size * 4 );

    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            index = (i*size+j)*4;
            data[index] = 255;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
        }
    }

    renderer.redTexture = new GpuTexture(gpu);
    renderer.redTexture.createFromData(size, size, data);

    data = new Uint8Array( size * size * 4 );

    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            index = (i*size+j)*4;
            data[index] = 255;
            data[index + 1] = 255;
            data[index + 2] = 255;
            data[index + 3] = 255;
        }
    }

    renderer.whiteTexture = new GpuTexture(gpu);
    renderer.whiteTexture.createFromData(size, size, data);

    data = new Uint8Array( size * size * 4 );

    for (i = 0; i < size; i++) {
        for (j = 0; j < size; j++) {
            index = (i*size+j)*4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
        }
    }

    renderer.blackTexture = new GpuTexture(gpu);
    renderer.blackTexture.createFromData(size, size, data);
};


RendererInit.prototype.initTextMap = function() {
    var renderer = this.renderer;

    //font texture
    var texture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAACACAMAAADTa0c4AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFAAAA////pdmf3QAABIFJREFUeNrsnNuyqzAIhsP7v/Se6Yxra0L4OUVNCzetVqP5DAQItrVOiLg95739NnfOaR99RDj6esBw+CKZXiMK4PiuBkAcANoHAP3J5fzzAV2jePQIt6f4Ndb/MIChlVcCEFpAACZPfN4KUAF0/ufboDW3AuBMFgBwHTCfg2ftYgDUKBuA1ABuHKvA2P+5XdONIEt7BO2o2MdlAJoTQOsV6GEAswt0Zq/bsBhdeQQkqEDMwmIAnJHzA8i3ASkWRFKBbADyLGB3mlYD6DyhA4DfBlgsBDtirUPcBgC5woStYMgVtgKATWcB6DskKUEkGFLYrGw3+l3ydR16wKbbPDlWp4Xfo9vZwR1jtOMA6GkABrdvNmt1Vluy6pyvxu4Xt62fquyTggCTsIkCoIuv8gAA08w+ATBXAdSRY56xPDFPx/VPWFZp5v65kFMPgFjP70YASMfRsDn01xLPcwkRq1HLMoK647hR8v+nId74MQBjvIbUQePra42ZVXVcBCR3mIY89mYAlNGLflqA0V1seosCQNMg80B0bsLGAIDNwvFyiqu66ngVGGMGVBwyWwIwpty2DqEr/qf0Bq+DbjYkkcr4VUoOxiRjrYn3YY5SC4BQB/cF0Lq4kD1RCJ+tN4g6Jps5zfWu+QmSz9sUABkA0BIAXocmBwCJ99MDIASATkmtLQAIft4IgE/ZDStZ59yQbOQQAGZWYMbZ3FFCAGRHnwHQznegGAE+zwxNi8kALCOgS9tzAC4jYG1Qo0myRm0Ae/z8eleqewBoZLwfUswCsbT1KgBZD6QAzAEoXUe3K+xxVf2uLf5U3nBeMPRyACW/LtrwVX989id3PRQOG5Io6vh9XwC6stHIdGdJozun03lxNlwvH4u6UgDM8/LmJyx7ak12feEebaXmUwCOYJWk1JcYKsl74HL74wAaH93NqkE1FSKXc4cv0AjaPEEPgE4ru/ieWdvzVq/4psG3AYDFHlEAioQCuEgMgPjK1VDrqlkbTABAiQBGK38B0BlBSf9xtiAJQDM4NtDqMlaeyduTtkDjHgAtEQBj5ZGK2QE0aCcMAIxLSw0WVYlGDgOQXWE+afouAM0S398O4Nej3wIQf4cIHSfz9pbWugyep4MFIAFARvspbm8BcE2DOdvWnCJQAWFhJ/hKzh4AaB2A7NxedKmLPc+6PN4cL2S8GYC1QMIEQJvmFsJfxdvkEQAoLV4AogBS8/kNvdXlWe5GKhABvQUAZASDALJffY1XfsrToFXFbvYD1gBo6wC8LR7/uvj9CwHcfWuoUJItsVl5nwWAnhxxqsXatUq0OYCcaS/fkbK61u5H8jwAuUIEZXHNL1Jmub5oSKZWiDR9FttM4HEAigqRpn8TeB2AuWNiByAXSHCGbB7/3qYCfgCgPgADEEskbjCCaJDB/+kR6wP4P1Obl8jsBwDUB4yAxqKkthaATjX0KmCtDyCxm+yIMLjCbwBgrg94FYC3h8vLPPmfAVBSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlJSUlLy9fJPgAEAvWMULbGsSjwAAAAASUVORK5CYII=';
    renderer.textTexture2 = new GpuTexture(this.gpu, texture, this.core, null, true);
};


RendererInit.prototype.initImage = function() {
    var renderer = this.renderer;
    var gl = this.gpu.gl;

    //create vertices buffer for rect
    renderer.rectVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, renderer.rectVerticesBuffer);

    var vertices = [ 0, 0, 0, 1,   1, 0, 0, 1,   2, 0, 0, 1,   3, 0, 0, 1 ];

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

    meshData = RendererGeometry.buildSkydome(128, 256);
//    var meshData = RendererGeometry.buildSkydome(256, 512);
    renderer.atmoMesh = new GpuMesh(this.gpu, meshData, null, this.core);
};


RendererInit.prototype.initBBox = function() {
    var renderer = this.renderer;
    var gpu = this.gpu;
    renderer.bboxMesh = new GpuBBox(gpu);
    renderer.bboxMesh2 = new GpuBBox(gpu, true);
};


RendererInit.prototype.initLines = function() {
    var gpu = this.gpu;
    var renderer = this.renderer;
    renderer.plineBuffer = new Float32Array(32*3);
    renderer.plines = new GpuPixelLine3(gpu, this.core, true, 64, true, 8);
    renderer.plineJoints = new GpuPixelLine3(gpu, this.core, false, 64, true, 8);

    renderer.stencilLineState = gpu.createState({blend:true, stencil:true, culling: false});
    renderer.lineLabelState = gpu.createState({blend:true, culling: false, zequal: true, zwrite:false});
    renderer.labelState = gpu.createState({blend:true, culling: false, zequal: true});
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
