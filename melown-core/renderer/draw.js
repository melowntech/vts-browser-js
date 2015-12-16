
Melown.Renderer.prototype.drawSkydome = function() {
    this.gpu_.gl_.disable(this.gpu_.gl_.CULL_FACE);

    ///progSkydome.use();
    var lower_ = 400; // put the dome a bit lower
    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);

    var domeMat_ = Melown.mat4.create();
//    Melown.mat4.multiply(Melown.translationMatrix(0, 0, this.camera_.getPosition()[2] - lower_), Melown.scaleMatrixf(this.camera_.getFar()*0.5), domeMat_);

    var pos_ = this.camera_.getPosition();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2] - lower_), Melown.scaleMatrixf(Math.min(this.camera_.getFar()*0.9,600000)), domeMat_);

    var mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getMvpMatrix(), domeMat_, mvp_);
    Melown.mat4.multiply(mvp_, normMat_, mvp_);

    this.gpu_.useProgram(this.progSkydome_, "aPosition", "aTexCoord");
    this.gpu_.bindTexture(this.skydomeTexture_);
//    this.gpu_.bindTexture(this.hitmapTexture_);

    this.progSkydome_.setSampler("uSampler", 0);
    this.progSkydome_.setMat4("uMVP", mvp_);

    this.gpu_.gl_.depthMask(false);

    this.skydomeMesh_.draw(this.progSkydome_, "aPosition", "aTexCoord");

    this.gpu_.gl_.depthMask(true);

    this.gpu_.gl_.enable(this.gpu_.gl_.CULL_FACE);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();
};

Melown.Renderer.prototype.drawBall = function(position_, size_) {
    var gl_ = this.gpu_.gl_;

    gl_.disable(gl_.CULL_FACE);

    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);


   // var cameraPos2_ = this.camera_.getGlobalPosition();
    //var cameraPos_ = [0,0,0];
    var cameraPos2_ = this.camera_.getPosition();
    var cameraPos_ = this.cameraPosition();

    var pos_ = [position_[0] - cameraPos_[0] + cameraPos2_[0], position_[1] - cameraPos_[1] + cameraPos2_[1], position_[2] - cameraPos_[2] + cameraPos2_[2] ];
//    var pos_ = [position_[0] - cameraPos_[0], position_[1] - cameraPos_[1], position_[2] ];
    //var pos_ = [position_[0], position_[1], position_[2] ];
//    var pos_ = [cameraPos_[0]-position_[0], cameraPos_[1]-position_[1], -(cameraPos_[2]-position_[2]) ];


    var domeMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2]), Melown.scaleMatrixf(size_ != null ? size_ : 1.5), domeMat_);
    //Melown.mat4.multiply(Melown.translationMatrix(this.camera_.getPosition()[0]+pos_[0], this.camera_.getPosition()[1]+pos_[1], this.camera_.getPosition()[2]), Melown.scaleMatrixf(21.5), domeMat_);

    var mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getMvpMatrix(), domeMat_, mvp_);
    Melown.mat4.multiply(mvp_, normMat_, mvp_);

    this.gpu_.useProgram(this.progSkydome_, "aPosition", "aTexCoord");
    this.gpu_.bindTexture(this.redTexture_);

    this.progSkydome_.setSampler("uSampler", 0);
    this.progSkydome_.setMat4("uMVP", mvp_);

    this.skydomeMesh_.draw(this.progSkydome_, "aPosition", "aTexCoord");

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    gl_.enable(gl_.CULL_FACE);
};

Melown.Renderer.prototype.drawLineString = function(points_, size_, color_, depthTest_, transparent_) {
    var gl_ = this.gpu_.gl_;
    var index_ = 0;

    //fill points
    for (var i = 0, li = points_.length; i < li; i++) {
        var p = points_[i];
        this.plineBuffer_[index_] = p[0];
        this.plineBuffer_[index_+1] = p[1];
        this.plineBuffer_[index_+2] = p[2] || 0;
        index_ += 3;
    }

    if (depthTest_ != true) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
        gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
        gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
        gl_.enable(gl_.BLEND);
    }

    gl_.disable(gl_.CULL_FACE);

    this.gpu_.useProgram(this.progLine4_, "aPosition", null);

    this.progLine4_.setMat4("uMVP", this.imageProjectionMatrix_);
    this.progLine4_.setVec3("uScale", [(2 / this.curSize_[0]), (2 / this.curSize_[1]), size_*0.5]);
    this.progLine4_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
//    this.progLine4_.setVec3Array("uPoints", this.plineBuffer_);
    this.progLine4_.setVec3("uPoints", this.plineBuffer_);


    this.plines_.draw(this.progLine4_, "aPosition", li);

    if (depthTest_ != true) {
        gl_.enable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        gl_.disable(gl_.BLEND);
    }

    gl_.enable(gl_.CULL_FACE);

};

//draw 2d image - used for debuging
Melown.Renderer.prototype.drawImage = function(x, y, lx, ly, texture_, color_, depth_, depthTest_, transparent_) {
    if (texture_ == null || this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;

    if (depthTest_ != true) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
        gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
        gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
        gl_.enable(gl_.BLEND);
    }

    gl_.disable(gl_.CULL_FACE);

    this.gpu_.useProgram(this.progImage_, "aPosition", null);
    this.gpu_.bindTexture(texture_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);

    this.progImage_.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);


    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    if (depthTest_ != true) {
        gl_.enable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        gl_.disable(gl_.BLEND);
    }

    gl_.enable(gl_.CULL_FACE);
};

Melown.Renderer.prototype.drawBillboard = function(mvp_, texture_, color_, depthTest_, transparent_) {
    var gl_ = this.gpu_.gl_;

    if (depthTest_ != true) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
        gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
        gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
        gl_.enable(gl_.BLEND);
    }

    gl_.disable(gl_.CULL_FACE);

    this.gpu_.useProgram(this.progImage_, "aPosition", "aTexCoord");
    this.gpu_.bindTexture(texture_);

    this.progImage_.setSampler("uSampler", 0);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", mvp_);

    var x = 0, y = 0, lx = 1, ly = 1;

    this.progImage_.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
    this.progImage_.setFloat("uDepth", 0);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    if (depthTest_ != true) {
        gl_.enable(gl_.DEPTH_TEST);
    }

    if (transparent_ == true) {
        gl_.disable(gl_.BLEND);
    }

    gl_.enable(gl_.CULL_FACE);
};


//draw flat 2d image - used for debuging
Melown.Renderer.prototype.drawFlatImage = function(x, y, lx, ly, texture_, color_, depth_) {
    if (texture_ == null || this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;
    this.gpu_.useProgram(this.progImage_, "aPosition", null);
    this.gpu_.bindTexture(texture_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);

    this.progImage_.setMat4("uData", [
        x, y,  0, 0,
        x + lx, y,  1, 0,
        x + lx, y + ly, 1, 1,
        x,  y + ly,  0, 1  ]);

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);
};

//draw 2d text - used for debuging
Melown.Renderer.prototype.drawText = function(x, y, size_, text_, color_, depth_) {
    if (this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;

    gl_.disable(gl_.CULL_FACE);

    gl_.enable(gl_.DEPTH_TEST);

    if (depth_ == null) {
        gl_.disable(gl_.DEPTH_TEST);
    }

    this.gpu_.useProgram(this.progImage_, "aPosition", null);
    this.gpu_.bindTexture(this.textTexture_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);
    this.progImage_.setVec4("uColor", color_);
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);

    var sizeX_ = size_;
    var sizeY_ = size_ * (7/4);

    var texelX_ = 1 / 64;
    var texelY_ = 1 / 8;


    var lx_ = x;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charAt(i);
        var charPos_ = this.textTable_[char_];

        this.progImage_.setMat4("uData", [
            x, y,  (charPos_ * texelX_), 0,
            x + sizeX_, y,  ((charPos_+4) * texelX_), 0,
            x + sizeX_, y + sizeY_, ((charPos_ + 4) * texelX_), texelY_*7,
            x,  y + sizeY_,  (charPos_ * texelX_), texelY_*7  ]);

        gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

        x += sizeX_;
    }

    x = lx_ - 1;

    //draw black line before text
    var charPos_ = this.textTable_[" "];

    this.progImage_.setMat4("uData", [
        x, y,  (charPos_ * texelX_), 0,
        x + sizeX_, y,  ((charPos_+4) * texelX_), 0,
        x + sizeX_, y + sizeY_, ((charPos_ + 4) * texelX_), texelY_*7,
        x,  y + sizeY_,  (charPos_ * texelX_), texelY_*7  ]);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);


    gl_.enable(gl_.CULL_FACE);

    if (depth_ == null) {
        gl_.enable(gl_.DEPTH_TEST);
    }

};

Melown.Renderer.prototype.fogSetup = function(program_, fogDensity_) {
    // the fog equation is: exp(-density*distance), this gives the fraction
    // of the original color that is still visible at some distance

    // we define visibility as a distance where only 5% of the original color
    // is visible; from this it is easy to calculate the correct fog density

    //var density_ = Math.log(0.05) / this.core_.coreConfig_.cameraVisibility_;
    var density_ = Math.log(0.05) / (this.core_.coreConfig_.cameraVisibility_ * 10*(Math.max(5,-this.camera_.getOrientation()[1])/90));
    density_ *= (5.0) / (Math.min(50000, Math.max(this.cameraDistance_, 1000)) /5000);

    if (this.drawFog_ == false) {
        density_ = 0;
    }

    //console.log("fden: " + density_);

    //reduce fog when camera is facing down
    //density_ *= 1.0 - (-this.orientation_[0]/90)

    program_.setFloat(fogDensity_, density_);
};

Melown.Renderer.prototype.paintGL = function() {
    this.gpu_.clear(true, false);

    //this.updateCamera();

    if (this.onlyLayers_ != true) {
        if (this.onlyDepth_ != true && this.onlyHitLayers_ != true) {
            this.drawSkydome();
        }
    }
};
