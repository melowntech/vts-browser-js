//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var setFont = function(fontData_) {
    fonts_["default"] = {
        chars_ : fontData_["chars"],
        space_ : fontData_["space"],
        size_ : fontData_["size"]
    };

};

var addChar = function(pos_, dir_, verticalShift_, char_, factor_, index_, index2_, textVector_, font_, vertexBuffer_, texcoordsBuffer_, flat_) {
    //normal to dir

    if (geocent_ && !flat_) {
        var n = [0,0,0];
        var nn = [0,0,0];
        
        vec3Normalize(bboxMin_, nn);
        vec3Cross(nn, dir_, n);
    } else {
        var n = [-dir_[1],dir_[0],0];
    }

    var p1 = [pos_[0], pos_[1], pos_[2]];
    var p2 = [p1[0], p1[1], p1[2]];

    var chars_ = font_.chars_;

    var fc = chars_[char_];
    var l = 0;
    var nx = textVector_[0];
    var ny = textVector_[1];
    var nz = textVector_[2];

    if (char_ == 9 || char_ == 32) {  //tab or space
        fc = chars_[32]; //space

        if (fc != null) {
            p1[0] += dir_[0] * (fc.step_) * factor_;
            p1[1] += dir_[1] * (fc.step_) * factor_;
            l = fc.lx * factor_;
        }
    } else {
        if (fc != null) {
            var factorX_ = fc.lx * factor_;
            var factorY_ = fc.ly * factor_;

            var n2 = [n[0] * verticalShift_, n[1] * verticalShift_, n[2] * verticalShift_];
            var n3 = [n2[0] + n[0] * factorY_, n2[1] + n[1] * factorY_, n2[2] + n[2] * factorY_];

            p2[0] = p1[0] + dir_[0] * factorX_;
            p2[1] = p1[1] + dir_[1] * factorX_;
            p2[2] = p1[2] + dir_[2] * factorX_;

            //first polygon
            vertexBuffer_[index_] = p1[0] - n2[0];
            vertexBuffer_[index_+1] = p1[1] - n2[1];
            vertexBuffer_[index_+2] = p1[2] - n2[2];
            vertexBuffer_[index_+3] = nz;

            texcoordsBuffer_[index2_] = fc.u1;
            texcoordsBuffer_[index2_+1] = fc.v1;
            texcoordsBuffer_[index2_+2] = nx;
            texcoordsBuffer_[index2_+3] = ny;

            vertexBuffer_[index_+4] = p1[0] - n3[0];
            vertexBuffer_[index_+5] = p1[1] - n3[1];
            vertexBuffer_[index_+6] = p1[2] - n3[2];
            vertexBuffer_[index_+7] = nz;

            texcoordsBuffer_[index2_+4] = fc.u1;
            texcoordsBuffer_[index2_+5] = fc.v2;
            texcoordsBuffer_[index2_+6] = nx;
            texcoordsBuffer_[index2_+7] = ny;

            vertexBuffer_[index_+8] = p2[0] - n2[0];
            vertexBuffer_[index_+9] = p2[1] - n2[1];
            vertexBuffer_[index_+10] = p2[2] - n2[2];
            vertexBuffer_[index_+11] = nz;

            texcoordsBuffer_[index2_+8] = fc.u2;
            texcoordsBuffer_[index2_+9] = fc.v1;
            texcoordsBuffer_[index2_+10] = nx;
            texcoordsBuffer_[index2_+11] = ny;


            //next polygon
            vertexBuffer_[index_+12] = p1[0] - n3[0];
            vertexBuffer_[index_+13] = p1[1] - n3[1];
            vertexBuffer_[index_+14] = p1[2] - n3[2];
            vertexBuffer_[index_+15] = nz;

            texcoordsBuffer_[index2_+12] = fc.u1;
            texcoordsBuffer_[index2_+13] = fc.v2;
            texcoordsBuffer_[index2_+14] = nx;
            texcoordsBuffer_[index2_+15] = ny;

            vertexBuffer_[index_+16] = p2[0] - n3[0];
            vertexBuffer_[index_+17] = p2[1] - n3[1];
            vertexBuffer_[index_+18] = p2[2] - n3[2];
            vertexBuffer_[index_+19] = nz;

            texcoordsBuffer_[index2_+16] = fc.u2;
            texcoordsBuffer_[index2_+17] = fc.v2;
            texcoordsBuffer_[index2_+18] = nx;
            texcoordsBuffer_[index2_+19] = ny;

            vertexBuffer_[index_+20] = p2[0] - n2[0];
            vertexBuffer_[index_+21] = p2[1] - n2[1];
            vertexBuffer_[index_+22] = p2[2] - n2[2];
            vertexBuffer_[index_+23] = nz;

            texcoordsBuffer_[index2_+20] = fc.u2;
            texcoordsBuffer_[index2_+21] = fc.v1;
            texcoordsBuffer_[index2_+22] = nx;
            texcoordsBuffer_[index2_+23] = ny;

            index_ += 24;
            index2_ += 24;
            //polygons_ += 2;

            p1[0] = p1[0] + dir_[0] * fc.step_ * factor_;
            p1[1] = p1[1] + dir_[1] * fc.step_ * factor_;
            l = fc.lx * factor_;
        } else {
            //unknown char
        }
    }

    return [p1, index_, index2_, l];
};

var getCharVerticesCount = function(origin_) {
    return (origin_ ? 3 : 4) * 3 * 2;
};

var addText = function(pos_, dir_, text_, size_, font_, vertexBuffer_, texcoordsBuffer_, flat_, index_) {
    var textVector_ = [0,1,0];

    var factor_ = size_ / font_.size_;
    var newLineSpace_ = font_.space_ * factor_;

    var s = [pos_[0], pos_[1], pos_[2]];
    var p1 = [pos_[0], pos_[1], pos_[2]];

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        var shift_ = addChar(p1, dir_, 0, char_, factor_, index_, index_, textVector_, font_, vertexBuffer_, texcoordsBuffer_, flat_);

        p1 = shift_[0];
        index_ = shift_[1];
        //index2_ = shift_[2];
    }

    return index_;
};


var addTextOnPath = function(points_, distance_, text_, size_, textVector_, font_, verticalOffset_, vertexBuffer_, texcoordsBuffer_, index_) {
    if (textVector_ == null) {
        textVector_ = [0,1,0];
    }

    var p1 = points_[0];
    var p2 = points_[1];
    
    var chars_ = font_.chars_;
    var factor_ = size_ / font_.size_;
    var newLineSpace_ = font_.space_ * factor_;

    var s = [p1[0], p1[1], p1[2]];
    var p1 = [p1[0], p1[1], p1[2]];
    var l = distance_;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        if (char_ == 9) { //tab
            char_ = 32;
        }

        var fc = chars_[char_];
        var ll = 1;
        if (fc != null) {
            ll = fc.step_ * factor_;
        }

        var posAndDir_ = getPathPositionAndDirection(points_, l);
        var posAndDir2_ = getPathPositionAndDirection(points_, l+ll);

        //average dir
        var dir_ = [(posAndDir2_[1][0] + posAndDir_[1][0])*0.5,
                    (posAndDir2_[1][1] + posAndDir_[1][1])*0.5,
                    (posAndDir2_[1][2] + posAndDir_[1][2])*0.5];

        vec3Normalize(dir_);

        var shift_ = addChar(posAndDir_[0], dir_, -factor_*font_.size_*0.7+verticalOffset_, char_, factor_, index_, index_, textVector_, font_, vertexBuffer_, texcoordsBuffer_);

        p1 = shift_[0];
        index_ = shift_[1];
        //index2_ = shift_[2];
        l += ll;
    }

    return index_;
};

var addStreetTextOnPath = function(points_, text_, size_, font_, verticalOffset_, vertexBuffer_, texcoordsBuffer_, index_) {
    var factor_ = size_ / font_.size_;
    var textLength_ = getTextLength(text_, factor_, font_);
    var pathLength_ = getPathLength(points_);
    var shift_ = (pathLength_ -  textLength_)*0.5;
    if (shift_ < 0) {
        shift_ = 0;
    }

    if (textLength_ > pathLength_) {
        return;
    }

    var textVector_ = getPathTextVector(points_, shift_, text_, factor_, font_);

    return addTextOnPath(points_, shift_, text_, size_, textVector_, font_, verticalOffset_, vertexBuffer_, texcoordsBuffer_, index_);
};

var getFontFactor = function(size_, font_) {
    return size_ / font_.size_;
};

var getLineHeight = function(size_, font_) {
    var factor_ = size_ / font_.size_;
    return font_.space_ * factor_;
};

var getTextLength = function(text_, factor_, font_) {
    var l = 0;
    var chars_ = font_.chars_;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            continue;
        }

        if (char_ == 9) {  //tab or space
            char_ = 32;
        }

        var fc = chars_[char_];

        if (fc != null) {
            l += fc.step_ * factor_;
        }
    }

    return l;
};

var getSplitIndex = function(text_, width_, factor_, font_) {
    var l = 0;
    var chars_ = font_.chars_;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i);

        if (l > width_ && (char_ == 10 || char_ == 9 || char_ == 32)) {
            return i;
        }

        if (char_ == 10) { //new line
            continue;
        }

        if (char_ == 9) {  //tab or space
            char_ = 32;
        }

        var fc = chars_[char_];

        if (fc != null) {
            l += fc.step_ * factor_;
        }
    }

    return li;
};

var getPathLength = function(points_) {
    var l = 0;

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        var p1 = points_[i];
        var p2 = points_[i+1];
        var dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3Length(dir_);
    }

    return l;
};

var getPathPositionAndDirection = function(points_, distance_) {
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];

    for (var i = 0, li = points_.length-1; i < li; i++) {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        var ll = vec3Length(dir_);

        if ((l + ll) > distance_) {

            var factor_ = (distance_ - l) / (ll);
            var p = [p1[0] + dir_[0] * factor_,
                     p1[1] + dir_[1] * factor_,
                     p1[2] + dir_[2] * factor_];

            vec3Normalize(dir_);

            return [p, dir_];
        }

        l += ll;
    }

    return [p1, dir_];
};

var getPathTextVector = function(points_, shift_, text_, factor_, font_) {
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];
    var textDir_ = [0,0,0];
    var textStart_ = shift_;
    var textEnd_ = shift_ + getTextLength(text_, factor_, font_);

    for (var i = 0, li = points_.length-1; i < li; i++) {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3Length(dir_);

        if (l > textStart_) {
            vec3Normalize(dir_);
            textDir_[0] += dir_[0];
            textDir_[1] += dir_[1];
            textDir_[2] += dir_[2];
        }

        if (l > textEnd_) {
            vec3Normalize(textDir_);

            if (geocent_) {
                var nn = [0,0,0];
                vec3Normalize(bboxMin_, nn);
                vec3Cross(nn, textDir_, nn);
                return nn;
            } else {
                return [-textDir_[1], textDir_[0],0];
            }
        }
    }

    return textDir_;
};

