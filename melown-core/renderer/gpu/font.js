
/**
 * @constructor
 */
Melown.GpuFont = function(gpu_, core_, font_, size_) {
    this.bbox_ = null;
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;

    this.chars_ = [];
    this.space_ = 0;
    this.font_ = font_;
    this.size_ = size_;
    this.image_ = null;
    this.texture_ = null;

    this.generate(font_, size_);
};

//destructor
Melown.GpuFont.prototype.kill = function() {

};

Melown.GpuFont.prototype.generate = function(font_, size_) {
    if (font_ == null) {
        font_ = "Arial, 'Helvetica Neue', Helvetica, sans-serif"; //"Calibri";
    }

    if (size_ == null) {
        size_ = 10;
    }

    var textureLX_ = 512;
    var textureLY_ = 512;
    var fx = 1.0 / textureLX_;
    var fy = 1.0 / textureLY_;

    var canvas_ = document.createElement('canvas');
    canvas_.width = textureLX_;
    canvas_.height = textureLY_;

    var ctx_ = canvas_.getContext('2d');

    //utDrawFilledRect(0, 0, _textureLX, _textureLY, [0,0,0,255]);

    var _fontSize = 10;
    ctx_.beginPath();
    ctx_.font = size_ + "pt " + font_;
    ctx_.textAlign = "left";
    ctx_.textBaseline = "top";
//  ctx_.fillStyle = "@white";
//    ctx_.fillStyle = [0,0,0,255];
    ctx_.fillStyle = "#ffffff";
    ctx_.strokeStyle = "#000000";
    ctx_.lineWidth = 5;
    ctx_.lineCap = "round";
    ctx_.lineJoin = "round";

    var lineSpace_ = Math.round(ctx_.lineWidth*0.5);

    var space_ = ctx_.lineWidth+2;
    var x = space_;
    var y = space_;


    var cly = Math.floor(ctx_.measureText("e").width * 2.5);
    var clxe = Math.floor(ctx_.measureText("e").width);
    //var clxe = Math.floor(ctx_.measureText("ee").width);

    this.chars_ = [];
    this.space_ = cly;
    this.size_ = size_;
    this.font_ = font_;

    var codes_ = [];

    for (var i = 33; i < 191; i++) {
        codes_.push(i);
    }

    for (var i = 192; i < 688; i++) {
        codes_.push(i);
    }

    codes_ = codes_.concat(0x20, 0x2026, 0x2018, 0x2019, 0x201a, 0x201b, 0x201c, 0x201d, 0x201e, 0x2032, 0x2033, 0x203c);

    for (var i = 0, li = codes_.length; i < li; i++) {
        var c = String.fromCharCode(codes_[i]);
        var clx2 = Math.round(ctx_.measureText(c).width);
        var clx = clx2 + ctx_.lineWidth;

        if (x + clx2 + space_ >= textureLX_) {
            x = space_;
            y += cly + space_;
        }

        ctx_.strokeText(c, x+lineSpace_, y);
        ctx_.fillText(c, x+lineSpace_, y);

        this.chars_[codes_[i]] = {
                u1 : x * fx,
                v1 : y * fy,
                u2 : (x + clx) * fx,
                v2 : (y + cly) * fy,
                lx : clx,
                ly : cly,
                step_ : (clx-2)
            };

        x += clx + space_;
    }

    this.image_ = ctx_.getImageData(0, 0, textureLX_, textureLY_);

    this.texture_ = new Melown.GpuTexture(this.gpu_, null);
    //this.texture_.createFromData(textureLX_, textureLY_, this.image_);
    this.texture_.createFromImage(this.image_, "linear");
    this.texture_.width_ = textureLX_;
    this.texture_.height_ = textureLY_;
    this.texture_.size_ = textureLX_ * textureLY_ * 4;
};

//! Returns GPU RAM used, in bytes.
Melown.GpuFont.prototype.size = function(){ return this.size_; };


