
Melown.Map.prototype.quad = function(lod_, ix, iy) {
    var quadKey = "";
    //ty = Math.pow(2,zoom - 1) - ty;
    for (i = lod_; i > 0; i--) {
        var digit = 0;
        var mask = 1 << (i-1);
        if ((ix & mask) != 0) {
            digit += 1;
        }

        if ((iy & mask) != 0) {
            digit += 2;
        }

        quadKey += digit;
    }

    return quadKey;
};

Melown.Map.prototype.msDigit = function(iy, ix) {
    return (((iy & 3) << 1) + (ix & 1));
};

Melown.Map.prototype.hex = function(v, n) {
    var s = v.toString(16);
    while (s.length < 8) {
        s = "0" + s;
    }
    return s;
};

Melown.Map.prototype.ppx = function(lod_, ix) {
    return this.hex(ix << (28 - lod_), 7);

};

Melown.Map.prototype.ppy = function(lod_, iy) {
    return this.hex((1 << 28) - ((iy + 1) << (28 - lod_)), 7);
};


Melown.Map.prototype.processUrlFunction = function(id_, counter_, string_) {
    if (typeof string_ == "string") {
        if (string_.indexOf("quad") != -1) {
            var string2_ = "(function(lod,x,y){" + string_.replace("quad", "return this.quad") + "})";

            try {
                var fc_ = eval(string2_).bind(this);
                return fc_(id_.lod_, id_.ix_, id_.iy_);
            } catch(e) {
                return string_;
            }
        } else if (string_.indexOf("ms_digit") != -1) {
            var string2_ = "(function(x,y){" + string_.replace("ms_digit", "return this.msDigit") + "})";

            try {
                var fc_ = eval(string2_).bind(this);
                return fc_(id_.ix_, id_.iy_);
            } catch(e) {
                return string_;
            }

        } else if (string_.indexOf("alt") != -1) {

            var result_ = /\(([^)]*)\)/.exec(string_);

            if (result_ && result_[1]) {
                var strings_ = result_[1].match(/([^,]+)/g);

                if (strings_.length > 0) {
                    return strings_[(counter_ % strings_.length)];
                }
            }

            return string_;

        } else if (string_.indexOf("ppx") != -1) {

            var string2_ = "(function(lod,x){" + string_.replace("ppx", "return this.ppx") + "})";

            try {
                var fc_ = eval(string2_).bind(this);
                return fc_(id_.lod_, id_.ix_);
            } catch(e) {
                return string_;
            }

        } else if (string_.indexOf("ppy") != -1) {

            var string2_ = "(function(lod,y){" + string_.replace("ppy", "return this.ppy") + "})";

            try {
                var fc_ = eval(string2_).bind(this);
                return fc_(id_.lod_, id_.iy_);
            } catch(e) {
                return string_;
            }

        } else {
            return string_;
        }

    } else {
        return string_;
    }

};

Melown.Map.prototype.makeUrl = function(templ_, id_, subId_, skipBaseUrl_) {
    //if (templ_.indexOf("jpg") != -1) {
       //templ_ = "{lod}-{easting}-{northing}.jpg?v=4";
       //templ_ = "{lod}-{x}-{y}.jpg?v=4";
       //templ_ = "{quad(lod,x,y)}.jpg?v=4";
       //templ_ = "{quad(lod,x+1,y*2)}.jpg?v=4";
       //templ_ = "{lod}-{ms_digit(x,y)}.jpg?v=4";
    //}
    //templ_ = "maps{alt(1,2,3,4)}.irist-test.citationtech.net/map/{lod}-{x}-{y}.jpg?v=4";

    //var worldParams_ = id_.getWorldParams();
    //var url_ = Melown.simpleFmtObjOrCall(templ_, {"lod":id_.lod_, "easting":Melown.padNumber(worldParams_[0], 7), "northing":Melown.padNumber(worldParams_[1], 7),

    //remove white spaces from template
    templ_ = templ_.replace(/ /g, '');

    var url_ = Melown.simpleFmtObjOrCall(templ_, {"lod":id_.lod_,  "x":id_.ix_, "y":id_.iy_, "sub": subId_,
                                                    "here_app_id": "abcde", "here_app_code":"12345"},
                                           this.processUrlFunction.bind(this, id_, this.urlCounter_));

    this.urlCounter_++;

    skipBaseUrl_ = (url_.indexOf("://") != -1);

    if (skipBaseUrl_) {
        return url_;
    } else {
        return this.baseURL_ + url_;
    }
};

