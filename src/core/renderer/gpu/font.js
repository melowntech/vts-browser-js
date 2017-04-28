
import GpuTexture_ from './texture';

//get rid of compiler mess
var GpuTexture = GpuTexture_;


var GpuFont = function(gpu, core, font, size) {
    this.bbox = null;
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.core = core;

    this.chars = [];
    this.space = 0;
    this.font = font;
    this.size = size;
    this.image = null;
    this.texture = null;

    this.generate(font, size);
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

    var fontSize = 10;
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
    var clxe = Math.floor(ctx.measureText('e').width);
    //var clxe = Math.floor(ctx.measureText("ee").width);

    this.chars = [];
    this.space = cly;
    this.size = size;
    this.font = font;

    var codes = [];

    for (var i = 33; i < 191; i++) {
        codes.push(i);
    }

    for (var i = 192; i < 688; i++) {
        codes.push(i);
    }

    codes = codes.concat(0x20, 0x2026, 0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x201e, 0x2032, 0x2033, 0x203c);

    for (var i = 0, li = codes.length; i < li; i++) {
        var c = String.fromCharCode(codes[i]);
        var clx2 = Math.round(ctx.measureText(c).width);
        var clx = clx2 + ctx.lineWidth;

        if (x + clx2 + space >= textureLX) {
            x = space;
            y += cly + space;
        }

        ctx.strokeText(c, x+lineSpace, y);
        ctx.fillText(c, x+lineSpace, y);

        this.chars[codes[i]] = {
            u1 : x * fx,
            v1 : y * fy,
            u2 : (x + clx) * fx,
            v2 : (y + cly) * fy,
            lx : clx,
            ly : cly,
            step : (clx-2)
        };

        x += clx + space;
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


export default GpuFont;


