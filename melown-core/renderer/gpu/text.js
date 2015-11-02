//! Holds a GPU vertex buffer.

if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

/**
 * @constructor
 */
Melown.GpuText = function(gpu_, core_, font_, withNormals_)
{
    //this.bbox_ = mesh_.bbox_; //!< bbox copy from Mesh
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.core_ = core_;
    this.font_ = font_;
    this.withNormals_ = withNormals_;

    this.vertices_ = [];
    this.tvertices_ = [];

    this.vertexPositionBuffer_ = null;
    this.vertexTextureCoordBuffer_ = null;

    this.size_ = 0;
    this.polygons_ = 0;
};

//destructor
Melown.GpuText.prototype.kill = function()
{
    if (this.vertexPositionBuffer_ == null) {
        return;
    }

    this.gl_.deleteBuffer(this.vertexPositionBuffer_);
    this.gl_.deleteBuffer(this.vertexTextureCoordBuffer_);

    if (this.core_ != null && this.core_.renderer_ != null) {
        this.core_.renderer_.statsFluxMesh_[1][0] ++;
        this.core_.renderer_.statsFluxMesh_[1][1] += this.size_;
    }
};

Melown.GpuText.prototype.addChar = function(pos_, dir_, verticalShift_, char_, factor_, index_, index2_, textVector_)
{
    //normal to dir
    var n = [-dir_[1],dir_[0],0];

    var p1 = [pos_[0], pos_[1], pos_[2]];
    var p2 = [p1[0], p1[1], p1[2]];

    var chars_ = this.font_.chars_;

    var fc = chars_[char_];
    var l = 0;
    var nx = textVector_[0];
    var ny = textVector_[1];

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
            this.vertices_[index_] = p1[0] - n2[0];
            this.vertices_[index_+1] = p1[1] - n2[1];
            this.vertices_[index_+2] = p1[2] - n2[2];

            this.tvertices_[index2_] = fc.u1;
            this.tvertices_[index2_+1] = fc.v1;
            this.tvertices_[index2_+2] = nx;
            this.tvertices_[index2_+3] = ny;

            this.vertices_[index_+3] = p1[0] - n3[0];
            this.vertices_[index_+4] = p1[1] - n3[1];
            this.vertices_[index_+5] = p1[2] - n3[2];

            this.tvertices_[index2_+4] = fc.u1;
            this.tvertices_[index2_+5] = fc.v2;
            this.tvertices_[index2_+6] = nx;
            this.tvertices_[index2_+7] = ny;

            this.vertices_[index_+6] = p2[0] - n2[0];
            this.vertices_[index_+7] = p2[1] - n2[1];
            this.vertices_[index_+8] = p2[2] - n2[2];

            this.tvertices_[index2_+8] = fc.u2;
            this.tvertices_[index2_+9] = fc.v1;
            this.tvertices_[index2_+10] = nx;
            this.tvertices_[index2_+11] = ny;


            //next polygon
            this.vertices_[index_+9] = p1[0] - n3[0];
            this.vertices_[index_+10] = p1[1] - n3[1];
            this.vertices_[index_+11] = p1[2] - n3[2];

            this.tvertices_[index2_+12] = fc.u1;
            this.tvertices_[index2_+13] = fc.v2;
            this.tvertices_[index2_+14] = nx;
            this.tvertices_[index2_+15] = ny;

            this.vertices_[index_+12] = p2[0] - n3[0];
            this.vertices_[index_+13] = p2[1] - n3[1];
            this.vertices_[index_+14] = p2[2] - n3[2];

            this.tvertices_[index2_+16] = fc.u2;
            this.tvertices_[index2_+17] = fc.v2;
            this.tvertices_[index2_+18] = nx;
            this.tvertices_[index2_+19] = ny;

            this.vertices_[index_+15] = p2[0] - n2[0];
            this.vertices_[index_+16] = p2[1] - n2[1];
            this.vertices_[index_+17] = p2[2] - n2[2];

            this.tvertices_[index2_+20] = fc.u2;
            this.tvertices_[index2_+21] = fc.v1;
            this.tvertices_[index2_+22] = nx;
            this.tvertices_[index2_+23] = ny;

            index_ += 18;
            index2_ += 24;
            this.polygons_ += 2;

            p1[0] = p1[0] + dir_[0] * fc.step_ * factor_;
            p1[1] = p1[1] + dir_[1] * fc.step_ * factor_;
            l = fc.lx * factor_;
        } else {
            //unknown char
        }
    }

    return [p1, index_, index2_, l];
};


Melown.GpuText.prototype.addText = function(pos_, dir_, text_, size_)
{
    var textVector_ = [0,1];
    var index_ = this.vertices_.length;
    var index2_ = this.tvertices_.length;

    var factor_ = size_ / this.font_.size_;
    var newLineSpace_ = this.font_.space_ * factor_;

    var s = [pos_[0], pos_[1], pos_[2]];
    var p1 = [pos_[0], pos_[1], pos_[2]];

    for (var i = 0, li = text_.length; i < li; i++)
    {
        var char_ = text_.charCodeAt(i);

        if (char_ == 10) { //new line
            s[0] += -dir_[1] * newLineSpace_;
            s[1] += dir_[0] * newLineSpace_;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        var shift_ = this.addChar(p1, dir_, 0, char_, factor_, index_, index2_, textVector_);

        p1 = shift_[0];
        index_ = shift_[1];
        index2_ = shift_[2];
    }

};


Melown.GpuText.prototype.addTextOnPath = function(points_, distance_, text_, size_, textVector_)
{
    if (textVector_ == null) {
        textVector_ = [0,1];
    }

    var p1 = points_[0];
    var p2 = points_[1];

    var index_ = this.vertices_.length;
    var index2_ = this.tvertices_.length;

    var chars_ = this.font_.chars_;

    var factor_ = size_ / this.font_.size_;
    var newLineSpace_ = this.font_.space_ * factor_;

    var s = [p1[0], p1[1], p1[2]];
    var p1 = [p1[0], p1[1], p1[2]];
    var l = distance_;

    for (var i = 0, li = text_.length; i < li; i++)
    {
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

        var posAndDir_ = this.getPathPositionAndDirection(points_, l);
        var posAndDir2_ = this.getPathPositionAndDirection(points_, l+ll);

        //average dir
        var dir_ = [(posAndDir2_[1][0] + posAndDir_[1][0])*0.5,
                    (posAndDir2_[1][1] + posAndDir_[1][1])*0.5,
                    (posAndDir2_[1][2] + posAndDir_[1][2])*0.5];

        Melown.vec3.normalize(dir_);

        var shift_ = this.addChar(posAndDir_[0], dir_, -factor_*this.font_.size_*0.7, char_, factor_, index_, index2_, textVector_);

        p1 = shift_[0];
        index_ = shift_[1];
        index2_ = shift_[2];
        l += ll;
    }

};

Melown.GpuText.prototype.addStreetTextOnPath = function(points_, text_, size_)
{
    var factor_ = size_ / this.font_.size_;
    var textLength_ = this.getTextLength(text_, factor_);
    var pathLength_ = this.getPathLength(points_);
    var shift_ = (pathLength_ -  textLength_)*0.5;
    if (shift_ < 0) {
        shift_ = 0;
    }

    if (textLength_ > pathLength_) {
        return;
    }

    var textVector_ = this.getPathTextVector(points_, shift_, text_, factor_);

    this.addTextOnPath(points_, shift_, text_, size_, textVector_);
};

Melown.GpuText.prototype.getFontFactor = function(size_)
{
    return size_ / this.font_.size_;
};

Melown.GpuText.prototype.getTextLength = function(text_, factor_)
{
    var l = 0;
    var chars_ = this.font_.chars_;

    for (var i = 0, li = text_.length; i < li; i++)
    {
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

Melown.GpuText.prototype.getPathLength = function(points_) {
    var l = 0;

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        var p1 = points_[i];
        var p2 = points_[i+1];
        var dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += Melown.vec3.length(dir_);
    }

    return l;
};

Melown.GpuText.prototype.getPathPositionAndDirection = function(points_, distance_)
{
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        var ll = Melown.vec3.length(dir_);

        if ((l + ll) > distance_) {

            var factor_ = (distance_ - l) / (ll);
            var p = [p1[0] + dir_[0] * factor_,
                     p1[1] + dir_[1] * factor_,
                     p1[2] + dir_[2] * factor_];

            Melown.vec3.normalize(dir_);

            return [p, dir_];
        }

        l += ll;
    }

    return [p1, dir_];
};

Melown.GpuText.prototype.getPathTextVector = function(points_, shift_, text_, factor_)
{
    var l = 0;
    var p1 = [0,0,0];
    var dir_ = [1,0,0];
    var textDir_ = [0,0,0];
    var textStart_ = shift_;
    var textEnd_ = shift_ + this.getTextLength(text_, factor_);

    for (var i = 0, li = points_.length-1; i < li; i++)
    {
        p1 = points_[i];
        var p2 = points_[i+1];
        dir_ = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += Melown.vec3.length(dir_);

        if (l > textStart_) {
            Melown.vec3.normalize(dir_);
            textDir_[0] += dir_[0];
            textDir_[1] += dir_[1];
            textDir_[2] += dir_[2];
        }

        if (l > textEnd_) {
            Melown.vec3.normalize(textDir_);
            return [-textDir_[1], textDir_[0],0];
        }
    }

    return textDir_;
};

Melown.GpuText.prototype.compile = function()
{
    var gl_ = this.gl_;
    if (gl_ == null)
        return;

    this.kill();

    this.vertexPositionBuffer_ = null;
    this.vertexTextureCoordBuffer_ = null;
    this.vertexNormalBuffer_ = null;

    //create vertex buffer
    this.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.vertices_), gl_.STATIC_DRAW);
    this.vertexPositionBuffer_.itemSize = 3;
    this.vertexPositionBuffer_.numItems = this.vertices_.length / 3;

    //create texture coords buffer
    this.vertexTextureCoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(this.tvertices_), gl_.STATIC_DRAW);
    this.vertexTextureCoordBuffer_.itemSize = 4;
    this.vertexTextureCoordBuffer_.numItems = this.tvertices_.length / 4;

    this.size_ = this.vertexPositionBuffer_.numItems * 3 * 4 + this.vertexTextureCoordBuffer_.numItems * 4 * 4;
    this.polygons_ = this.vertexPositionBuffer_.numItems / 3;

    if (this.core_ != null && this.core_.renderer_ != null) {
        //this.core_.renderer_.statsCreateGpuTextTime_ += performance.now() - timer_;
        //this.core_.renderer_.statsFluxMesh_[0][0] ++;
        //this.core_.renderer_.statsFluxMesh_[0][1] += this.size_;
    }


    if (this.withNormals_ == true) {
        this.normals_ = [];
    }

};

//! Draws the mesh, given the two vertex shader attributes locations.
Melown.GpuText.prototype.draw = function(program_, attrPosition_, attrTexCoord_)
{
    var gl_ = this.gl_;
    if (gl_ == null)
        return;

    var vertexPositionAttribute_ = program_.getAttribute(attrPosition_);
    var textureCoordAttribute_ = program_.getAttribute(attrTexCoord_);

    //bind vetex positions
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexPositionBuffer_);
    gl_.vertexAttribPointer(vertexPositionAttribute_, this.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //bind texture coords
    gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexTextureCoordBuffer_);
    gl_.vertexAttribPointer(textureCoordAttribute_, this.vertexTextureCoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

    //draw polygons
    gl_.drawArrays(gl_.TRIANGLES, 0, this.vertexPositionBuffer_.numItems);
};

//! Returns GPU RAM used, in bytes.
Melown.GpuText.prototype.size = function(){ return this.size_; };

Melown.GpuText.prototype.bbox = function(){ return this.bbox_; };

Melown.GpuText.prototype.getPolygons = function(){ return this.polygons_; };

