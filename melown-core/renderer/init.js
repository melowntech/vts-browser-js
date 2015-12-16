Melown.GpuBarycentricBuffer_ = null;

Melown.Renderer.prototype.initShaders = function() {
    this.progTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileVertexShader, Melown.tileFragmentShader);
    this.progTile2_ = new Melown.GpuProgram(this.gpu_, Melown.tile2VertexShader, Melown.tile2FragmentShader);
    this.progFogTile_ = new Melown.GpuProgram(this.gpu_, Melown.fogTileVertexShader, Melown.fogTileFragmentShader);
    this.progWireframeTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileWireframeVertexShader, Melown.tileWireframeFragmentShader);
    this.progWireframeTile2_ = new Melown.GpuProgram(this.gpu_, Melown.tileWireframeVertexShader, Melown.tileWireframe2FragmentShader);
    this.progWireframeTile3_ = new Melown.GpuProgram(this.gpu_, Melown.tileWireframe3VertexShader, Melown.tileWireframeFragmentShader);
    this.progFlatShadeTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileFlatShadeVertexShader, Melown.tileFlatShadeFragmentShader);
    this.progHeightmap_ = new Melown.GpuProgram(this.gpu_, Melown.heightmapVertexShader, Melown.heightmapFragmentShader);
    this.progSkydome_ = new Melown.GpuProgram(this.gpu_, Melown.skydomeVertexShader, Melown.skydomeFragmentShader);

    this.progDepthTile_ = new Melown.GpuProgram(this.gpu_, Melown.tileDepthVertexShader, Melown.tileDepthFragmentShader);
    this.progDepthHeightmap_ = new Melown.GpuProgram(this.gpu_, Melown.heightmapDepthVertexShader, Melown.heightmapDepthFragmentShader);
    //this.progDepthSkydome_ = new Melown.GpuProgram(this.gpu_, Melown.skydomeVertexShader, Melown.skydomeFragmentShader);

    this.progBBox_ = new Melown.GpuProgram(this.gpu_, Melown.bboxVertexShader, Melown.bboxFragmentShader);
    this.progLine_ = new Melown.GpuProgram(this.gpu_, Melown.lineVertexShader, Melown.lineFragmentShader);
    this.progLine3_ = new Melown.GpuProgram(this.gpu_, Melown.line3VertexShader, Melown.line3FragmentShader);
    this.progLine4_ = new Melown.GpuProgram(this.gpu_, Melown.line4VertexShader, Melown.line4FragmentShader);
    this.progTLine_ = new Melown.GpuProgram(this.gpu_, Melown.tlineVertexShader, Melown.tlineFragmentShader);
    this.progTPLine_ = new Melown.GpuProgram(this.gpu_, Melown.tplineVertexShader, Melown.tlineFragmentShader);
    this.progTBLine_ = new Melown.GpuProgram(this.gpu_, Melown.tlineVertexShader, Melown.tblineFragmentShader);
    this.progTPBLine_ = new Melown.GpuProgram(this.gpu_, Melown.tplineVertexShader, Melown.tblineFragmentShader);
    this.progPolygon_ = new Melown.GpuProgram(this.gpu_, Melown.polygonVertexShader, Melown.polygonFragmentShader);
    this.progText_ = new Melown.GpuProgram(this.gpu_, Melown.textVertexShader, Melown.textFragmentShader);
    this.progText2_ = new Melown.GpuProgram(this.gpu_, Melown.textVertexShader2, Melown.textFragmentShader);
    this.progImage_ = new Melown.GpuProgram(this.gpu_, Melown.imageVertexShader, Melown.imageFragmentShader);
    this.progIcon_ = new Melown.GpuProgram(this.gpu_, Melown.iconVertexShader, Melown.textFragmentShader);

};


Melown.Renderer.prototype.initHeightmap = function() {
    // initialize heightmap geometry
    var meshData_ = Melown.RendererGeometry.buildHeightmap(5);
    this.heightmapMesh_ = new Melown.GpuMesh(this.gpu_, meshData_, null, this.core_);

   // create heightmap texture
    var size_ = 64;
    var halfLineWidth_ = 1;
    var data_ = new Uint8Array( size_ * size_ * 4 );

    for (var i = 0; i < size_; i++) {
        for (var j = 0; j < size_; j++) {

            var index_ =(i*size_+j)*4;

            if (i < halfLineWidth_ || i >= size_-halfLineWidth_ || j < halfLineWidth_ || j >= size_-halfLineWidth_) {
                 data_[index_] = 255;
                 data_[index_ + 1] = 255;
                 data_[index_ + 2] = 255;
             } else {
                 data_[index_] = 32;
                 data_[index_ + 1] = 32;
                 data_[index_ + 2] = 32;
             }

             data_[index_ + 3] = 255;
        }
    }


    this.heightmapTexture_ = new Melown.GpuTexture(this.gpu_);
    this.heightmapTexture_.createFromData(size_, size_, data_, "trilinear", true);
};


Melown.Renderer.prototype.initHitmap = function() {
    var size_ = this.hitmapSize_;
    var data_ = new Uint8Array( size_ * size_ * 4 );

    this.hitmapTexture_ = new Melown.GpuTexture(this.gpu_);
    this.hitmapTexture_.createFromData(size_, size_, data_);
    this.hitmapTexture_.createFramebuffer(size_, size_);

    this.geoHitmapTexture_ = new Melown.GpuTexture(this.gpu_);
    this.geoHitmapTexture_.createFromData(size_, size_, data_);
    this.geoHitmapTexture_.createFramebuffer(size_, size_);
};

Melown.Renderer.prototype.initTestMap = function() {
   // create red texture
    var size_ = 16;
    var data_ = new Uint8Array( size_ * size_ * 4 );

    for (var i = 0; i < size_; i++) {
        for (var j = 0; j < size_; j++) {

            var index_ = (i*size_+j)*4;

             data_[index_] = 255;
             data_[index_ + 1] = 0;
             data_[index_ + 2] = 0;
             data_[index_ + 3] = 255;
        }
    }

    this.redTexture_ = new Melown.GpuTexture(this.gpu_);
    this.redTexture_.createFromData(size_, size_, data_);

    var data_ = new Uint8Array( size_ * size_ * 4 );

    for (var i = 0; i < size_; i++) {
        for (var j = 0; j < size_; j++) {
            var index_ = (i*size_+j)*4;
             data_[index_] = 255;
             data_[index_ + 1] = 255;
             data_[index_ + 2] = 255;
             data_[index_ + 3] = 255;
        }
    }

    this.whiteTexture_ = new Melown.GpuTexture(this.gpu_);
    this.whiteTexture_.createFromData(size_, size_, data_);

    var sizeX_ = 64;
    var sizeY_ = 8;
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    var chars_ = [
    "............................................................",
    ".....xxxxx.......................xxxxx......................",
    ".....xxxxx.......................xxxxx......................",
    ".....xxxxx.......................xxxxx......................",
    "xxxxxxxxxxxxxxxx............xxxxxxxxxxxxxxxx................",
    "xxxxxxxxxxxxxxxx............xxxxxxxxxxxxxxxx................",
    "............................................................"
    ];


    // create red texture
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    //clear texture
    for (var i = 0; i < sizeY_; i++) {
        for (var j = 0; j < sizeX_; j++) {

            var index_ = (i*sizeX_+j)*4;

             data_[index_] = 0;
             data_[index_ + 1] = 0;
             data_[index_ + 2] = 0;
             data_[index_ + 3] = 0;//255;
        }
    }

    for (var i = 0, li = chars_.length; i < li; i++) {

        var string_ = chars_[i];

        for (var j = 0, lj = string_.length; j < lj; j++) {

            var index_ = (i*sizeX_+j)*4;

            if (string_.charAt(j) != '.') {
                 data_[index_] = 255;
                 data_[index_ + 1] = 255;
                 data_[index_ + 2] = 255;
                 data_[index_ + 3] = 255;
            }
        }
    }

    this.lineTexture_ = new Melown.GpuTexture(this.gpu_);
    this.lineTexture_.createFromData(sizeX_, sizeY_, data_, "linear", true);

};

Melown.Renderer.prototype.initTextMap = function() {
    var sizeX_ = 64;
    var sizeY_ = 8;
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    var chars_ = [
    "............................................................",
    "xxx..x..xxx.xxx.x...xxx.xxx.xxx.xxx.xxx.....................",
    "x.x.xx....x...x.x...x...x.....x.x.x.x.x......x..............",
    "x.x..x..xxx.xxx.x...xxx.xxx...x.xxx.xxx.........x.x.xxx.....",
    "x.x..x..x.....x.xxx...x.x.x...x.x.x...x......x...x..........",
    "xxx..x..xxx.xxx..x..xxx.xxx...x.xxx.xxx..x......x.x.........",
    "............................................................"
    ];

    this.textTable_ = {
        "0" : 0,
        "1" : 4,
        "2" : 8,
        "3" : 12,
        "4" : 16,
        "5" : 20,
        "6" : 24,
        "7" : 28,
        "8" : 32,
        "9" : 36,
        "." : 40,
        ":" : 44,
        "x" : 48,
        "-" : 52,
        " " : 56
    };

    // create red texture
    var data_ = new Uint8Array( sizeX_ * sizeY_ * 4 );

    //clear texture
    for (var i = 0; i < sizeY_; i++) {
        for (var j = 0; j < sizeX_; j++) {

            var index_ = (i*sizeX_+j)*4;

             data_[index_] = 0;
             data_[index_ + 1] = 0;
             data_[index_ + 2] = 0;
             data_[index_ + 3] = 255;
        }
    }

    for (var i = 0, li = chars_.length; i < li; i++) {

        var string_ = chars_[i];

        for (var j = 0, lj = string_.length; j < lj; j++) {

            var index_ = (i*sizeX_+j)*4;

            if (string_.charAt(j) != '.') {
                 data_[index_] = 255;
                 data_[index_ + 1] = 255;
                 data_[index_ + 2] = 255;
            }
        }
    }

    this.textTexture_ = new Melown.GpuTexture(this.gpu_);
    this.textTexture_.createFromData(sizeX_, sizeY_, data_);
};



Melown.Renderer.prototype.initImage = function() {
    var gl_ = this.gpu_.gl_;

    //create vertices buffer for rect
    this.rectVerticesBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.rectVerticesBuffer_);

    var vertices_ = [ 0, 0, 0, 1,   1, 0, 0, 1,
                      2, 0, 0, 1,   3, 0, 0, 1 ];

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    this.rectVerticesBuffer_.itemSize = 4;
    this.rectVerticesBuffer_.numItems = 4;

    //create indices buffer for rect
    this.rectIndicesBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, this.rectIndicesBuffer_);

    var indices_ = [ 0, 2, 1,    0, 3, 2 ];

    gl_.bufferData(gl_.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_), gl_.STATIC_DRAW);
    this.rectIndicesBuffer_.itemSize = 1;
    this.rectIndicesBuffer_.numItems = 6;
};


Melown.Renderer.prototype.initSkydome = function() {
    var meshData_ = Melown.RendererGeometry.buildSkydome(32, 64);
    this.skydomeMesh_ = new Melown.GpuMesh(this.gpu_, meshData_, null, this.core_);
    this.skydomeTexture_ = new Melown.GpuTexture(this.gpu_, this.core_.coreConfig_.skydomeTexture_, this.core_);
};


Melown.Renderer.prototype.initBBox = function() {
    this.bboxMesh_ = new Melown.GpuBBox(this.gpu_);

    if (this.displayDrawTest_ != true) {
        return;
    }
/*
    var x = 464823, y = 5582535, z = 259;

    var d = 400;

    var points_ = [
        [x,y,z],
        [x+d,y,z],
        [x+d,y+d,z],
        [x,y+d,z],
        [x+d*0.5,y,z],
        [x+d*0.5,y+d*2,z],
        [x,y,z+20],
        [x+d*0.5,y,z]
     ];

    this.lineTest_ = new Melown.GpuLine3(this.gpu_, this.core_);

    var s = 20;
   // var s = 1.0;

    this.lineTest_.addLine(points_[0], points_[7], s);
    this.lineTest_.addLine(points_[7], points_[1], s);

    this.lineTest_.addLine(points_[1], points_[2], s);
    this.lineTest_.addLine(points_[2], points_[3], s);
    //this.lineTest_.addLine(points_[3], points_[0], 5);

    this.lineTest_.addLine(points_[3], points_[4], s);
    this.lineTest_.addLine(points_[4], points_[5], s);

    this.lineTest_.addCircle(points_[0], s, 8);
    this.lineTest_.addCircle(points_[1], s, 8);
    this.lineTest_.addCircle(points_[2], s, 8);
    this.lineTest_.addCircle(points_[5], s, 8);

    this.lineTest_.addCircle(points_[3], s*5, 8);

    this.lineTest_.compile();


    this.font_ = new Melown.GpuFont(this.gpu_, this.core_);
    this.textTest_ = new Melown.GpuText(this.gpu_, this.core_, this.font_);

    this.textTest_.addText(points_[6], [1,0,0], "ABCabc", 1000);
    this.textTest_.compile();

    //var placemark_ = "data:image/png;base64,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";
    var placemark_ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAKTSURBVHjavNfPS1RBAAfwL6nbocMebDe79UMFQyG3Tit2EjatLhZkmluYGwZlJoJZUuy2BUGuSCAWFkgnCRIrfxyk3ZMtHpT+gbq8UgLrtGD43ny7vKnJLH2zu29gLnv4fj/zdnbeLEjCyQRwBsAUgI8AvtvzE4BZAM2O8xwUhwG8B0A5PUVF3OnxUP0MwCKASE4BAO7IAr/Px7v9/UzPz/OzYfCLYXAhnea9aJQlJSUq5EFOAACuytCL4TB/rK1RCMGNQwhBc32dlyMRFdGTFQDAPhl2vbOTlmVxq2FZFvt6e1VEVTaAhwB4rLZ2W+Uq4ngopCIKHQMAnJQBszMzdDpSyaQKaNIBJACwrLSUuqOqslICnugAJgGwualp00231RBC8FJbmwS80QHMAOCVjg5twI2uLgmY1gG8BsDzLS3agEh7uwS81QE8BsBDFRXaeyBQXS0Bz3QAZ+UuTiWTjssX0mn1VxDWARTKgBP1DY7OAdM0ebqxUQXs0j2IqmRIPBbbFsI0TQ4mEmp5MNt3wS0Z9nRk5L8Iy7L4YmxMLY/m6m34SIa+m5v7J2BpcYkFOwpk+VCu7wPDAFheVsZMJrPp6mtramT5cD4uJLvtywbvx+N/nQ3PR0fVR1+ec4CNiADgHr+f31ZX/9h4RwIBWd6XlyuZglgAwMTAwC/A9NSUuvrifAOuAWBNMEjLsiiE4IXWVsfffTaA/XK1K8vLJMm9v++CDXkH2IgUAE5OTPDryor6+D1uAaIAODQ4yJfj47L8lVaWJuAcAPZ0dzMei0nATTcBRwEwVFfHU/X1EtDoJuAAABZ7vSz2eiXgsJsA/4a/YwRw0E2AZxOAzzWAjfiglBvaOVkAOmyEAeC2bs7PAQBlCgrhBHN4PQAAAABJRU5ErkJggg==";
    this.placemarkTexture_ = new Melown.GpuTexture(this.gpu_, placemark_, this.core_, null, true);
    */
};


Melown.Renderer.prototype.initLines = function() {
    this.plineBuffer_ = new Float32Array(32*3);
    this.plines_ = new Melown.GpuPixelLine3(this.gpu_, this.core_, true, 64, true, 8);
    this.plineJoints_ = new Melown.GpuPixelLine3(this.gpu_, this.core_, false, 64, true, 8);
};

Melown.Renderer.prototype.initBaricentricBuffer = function() {
    var buffer_ = new Array(65535*3);

    for (var i = 0; i < 65535*3; i+=9) {
        buffer_[i] = 1.0;
        buffer_[i+1] = 0;
        buffer_[i+2] = 0;

        buffer_[i+3] = 0;
        buffer_[i+4] = 1.0;
        buffer_[i+5] = 0;

        buffer_[i+6] = 0;
        buffer_[i+7] = 0;
        buffer_[i+8] = 1.0;
    }

    var gl_ = this.gpu_.gl_;
    Melown.GpuBarycentricBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, Melown.GpuBarycentricBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(buffer_), gl_.STATIC_DRAW);
    Melown.GpuBarycentricBuffer_.itemSize = 3;
    Melown.GpuBarycentricBuffer_.numItems = buffer_.length / 3;
};

Melown.Renderer.prototype.initializeGL = function() {
    this.gpu_.init();
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
