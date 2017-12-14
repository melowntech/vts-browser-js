
import GpuTexture_ from './texture';

//get rid of compiler mess
var GpuTexture = GpuTexture_;


var GpuFont = function(gpu, core, font, size, path) {
    this.bbox = null;
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.core = core;

    this.chars = [];
    this.path = path;
    this.space = 0;
    this.font = font;
    this.size = size;
    this.image = null;
    this.texture = null;
    this.version = 0;

    this.textures = [];
    this.images = [];

    if (path) {
        this.load(path);
    } else {
        this.generate(font, size);
    }
};


//destructor
GpuFont.prototype.kill = function() {
};


GpuFont.prototype.generate = function(font, size) {
    if (font == null) {
        font = 'Arial, "Helvetica Neue", Helvetica, sans-serif'; //"Calibri";
    }

    if (size == null) {
        size = 10;
    }

    var textureLX = 512;
    var textureLY = 512;
    var fx = 1.0 / textureLX;
    var fy = 1.0 / textureLY;

    var canvas = document.createElement('canvas');
    canvas.width = textureLX;
    canvas.height = textureLY;

    var ctx = canvas.getContext('2d');

    //utDrawFilledRect(0, 0, textureLX, textureLY, [0,0,0,255]);

    //var fontSize = 10;
    ctx.beginPath();
    ctx.font = size + 'pt ' + font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
//  ctx.fillStyle = "@white";
//    ctx.fillStyle = [0,0,0,255];
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var lineSpace = Math.round(ctx.lineWidth*0.5);

    var space = ctx.lineWidth+2;
    var x = space;
    var y = space;

    var cly = Math.floor(ctx.measureText('e').width * 2.5);

    this.chars = [];
    this.space = cly;
    this.size = size;
    this.font = font;
    this.cly = cly;

    var codes = [0x20], i, li;
    //var codes = [], i, li;

    for (i = 33; i < 191; i++) {
        codes.push(i);
    }

    for (i = 192; i < 688; i++) {
        codes.push(i);
    }

    //for (i = 689; i < 4509; i++) { //azbuka. greek, ...
      //  codes.push(i);
    //}

    codes = codes.concat(0x2026, 0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x201e, 0x2032, 0x2033, 0x203c);

    var clx3 = Math.round(ctx.measureText('ee').width), clx2, c, clx;

    for (i = 0, li = codes.length; i < li; i++) {
        c = String.fromCharCode(codes[i]);
        clx2 = Math.round(ctx.measureText('e' + c+'e').width);
        clx2 = (clx2 - clx3);
        clx = clx2 + ctx.lineWidth;

        if (x + clx2 + space >= textureLX) {
            x = space;
            y += cly + space;
        }

        ctx.strokeText(c, x+lineSpace, y);
        ctx.fillText(c, x+lineSpace, y);

        var xx = Math.round(x), yy = Math.round(y), clxx = Math.round(clx);

        this.chars[codes[i]] = {
            u1 : xx * fx,
            v1 : yy * fy,
            u2 : (xx + clxx) * fx,
            v2 : (yy + cly) * fy,
            lx : clxx,
            ly : cly,
            step : (clx-2)
        };

        //console.log("" + xx + " " + yy + " " + JSON.stringify(this.chars[codes[i]]) + "-" + codes[i]);

        x += clx2 + space;
    }

    this.image = ctx.getImageData(0, 0, textureLX, textureLY);

    this.texture = new GpuTexture(this.gpu, null);
    //this.texture.createFromData(textureLX, textureLY, this.image);
    this.texture.createFromImage(this.image, 'linear');
    this.texture.width = textureLX;
    this.texture.height = textureLY;
    this.texture.size = textureLX * textureLY * 4;
};

// Returns GPU RAM used, in bytes.
GpuFont.prototype.size = function(){ return this.size; };


GpuFont.prototype.load = function(path) {
    // load image
    this.texture = new GpuTexture(this.gpu, path, this.core, null, null, null, 'nearest', true, this.onLoaded.bind(this), this.onError.bind(this));
    //this.texture = new GpuTexture(this.gpu, path, this.core, null, null, null, null, true, this.onLoaded.bind(this), this.onError.bind(this));
    this.texture[0] = this.texture;
};


GpuFont.prototype.readNumber = function(data, index) {
    var value = data[index] & 127, shift = 7;

    while (data[index] & 128) {
        index++;
        value |= (data[index] & 127) << (shift);
        shift += 7;
    }

    index++;

    return [value, index];
};

GpuFont.prototype.readChar = function(char, data, index, fx, fy, cly, textureLX) {
    var value = (data[index] << 24) | (data[index+1] << 16) | (data[index+2] << 8) | (data[index+3]);
    var x, y, clx, plane;

    switch(textureLX) {
        case 2048: // 4 x unit8 x-11bit,y-11bit,clx-6bit,plane-4bit
            x = ((value >> 21) & 2047), y = ((value >> 10) & 2047), clx = ((value >> 4) & 63), plane = (value & 15);
            break;
                   
        case 1024: // 4 x unit8 x-10bit,y-10bit,clx-6bit,plane-6bit
            x = ((value >> 22) & 1023), y = ((value >> 12) & 1023), clx = ((value >> 6) & 63), plane = (value & 63);
            break;

        default:   // 4 x unit8 x-9bit,y-9bit,clx-6bit,plane-8bit
            x = ((value >> 23) & 511), y = ((value >> 14) & 511), clx = ((value >> 8) & 63), plane = (value & 255);
            break;
    }

    //console.log('load:'+plane);

    this.chars[char] = {
        u1 : (x ) * fx,
        v1 : (y * fy) + plane,
        u2 : (x + clx) * fx,
        v2 : ((y + cly) * fy) + plane,
        lx : clx,
        ly : cly,
        step : (clx-2), 
        plane: plane
    };
};

GpuFont.prototype.onLoaded = function() {
    var image = this.texture.image;

    var canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight); 
    
    var data2 = ctx.getImageData(0,0,image.naturalWidth,image.naturalHeight).data;

    var data = new Array(data2.length), i, li, j = 0;

    //remove alpha channel from data
    for (i = 0, li = data2.length; i < li; i+= 4) {
        data[j] = data2[i];
        data[j+1] = data2[i+1];
        data[j+2] = data2[i+2];
        j+=3;
    }


   // load header
    // uint8 version
    // uint8 cly

    //number of ranges uint16
        // uintx min glyph id
        // uintx max glyph id
            // 4 x unit8 x-11bit,y-11bit,clx-6bit,plane-4bit
    //number of glyphs
        // uintx glyph
        // 4 x unit8 x-11bit,y-11bit,clx-6bit,plane-4bit

    this.chars = [];
    this.textures = [this.texture];
    this.images = [];
    this.version = data[0];
    this.size = data[1];
    this.space = data[2];
    this.cly = data[3];

    var cly = data[3];
    var ranges = (data[4]<<8) | data[5];

    var min, max, res, index = 6; 
    var fx = 1.0 / image.naturalWidth;
    var fy = 1.0 / image.naturalHeight;

    for (i = 0; i < ranges; i++) {
        res = this.readNumber(data, index);
        min = res[0];
        index = res[1];

        res = this.readNumber(data, index);
        max = res[0];
        index = res[1];
    
        for (j = min; j <= max; j++) {
            this.readChar(j, data, index, fx, fy, cly, image.naturalWidth);
            index += 4;
        }
    }

    var glyphs = (data[index]<<8) | data[index+1];
    index += 2;

    for (i = 0; i < glyphs; i++) {
        res = this.readNumber(data, index);
        j = res[0];
        index = res[1];

        this.readChar(j, data, index, fx, fy, cly, image.naturalWidth);
        index += 4;
    }

};


GpuFont.prototype.onError = function() {

};

GpuFont.prototype.onFileLoaded = function() {
    this.core.markDirty();
};

GpuFont.prototype.onFileLoadError = function() {
};

GpuFont.prototype.areTexturesReady = function(files) {
    var ready = true;
    for (var i = 0, li = files.length; i < li; i++) {
        var index = files[i];//Math.round( (planes[i] - (planes[i] % 3)) );

        if (!this.textures[index]) {
            this.textures[index] = new GpuTexture(this.gpu, this.path + (index+1), this.core, null, null, null, 'nearest', true, this.onFileLoaded.bind(this), this.onFileLoadError.bind(this));
            ready = false;
        } else {
            ready = (ready || this.textures[index].loaded);
        }
    }

    return ready;
};

GpuFont.prototype.getTexture = function(file) {
    if (!this.textures[file]) {
        debugger;
    }

    return this.textures[file];
};

export default GpuFont;


