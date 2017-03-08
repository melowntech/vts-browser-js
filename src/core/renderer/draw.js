
Melown.Renderer.prototype.drawSkydome = function(texture_, shader_) {
    if (!texture_) {
        return;
    }
    
    //this.gpu_.gl_.disable(this.gpu_.gl_.CULL_FACE);

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

    this.gpu_.useProgram(shader_, ["aPosition", "aTexCoord"]);
    this.gpu_.bindTexture(texture_);
//    this.gpu_.bindTexture(this.hitmapTexture_);

    shader_.setSampler("uSampler", 0);
    shader_.setMat4("uMVP", mvp_);

    this.gpu_.gl_.depthMask(false);

    this.skydomeMesh_.draw(shader_, "aPosition", "aTexCoord");

    this.gpu_.gl_.depthMask(true);

    this.gpu_.gl_.enable(this.gpu_.gl_.CULL_FACE);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();
};

Melown.Renderer.prototype.drawTBall = function(position_, size_, shader_, texture_, size2_, nocull_) {
    var gl_ = this.gpu_.gl_;

    if (nocull_) {
        gl_.disable(gl_.CULL_FACE);
    }

    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);

    var pos_ = [position_[0], position_[1], position_[2] ];

    size_ = (size_ != null) ? size_ : 1.5;

    var domeMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2]), Melown.scaleMatrix(size_, size_, size2_ || size_), domeMat_);
    //Melown.mat4.multiply(Melown.translationMatrix(this.camera_.getPosition()[0]+pos_[0], this.camera_.getPosition()[1]+pos_[1], this.camera_.getPosition()[2]), Melown.scaleMatrixf(21.5), domeMat_);

    var mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getMvpMatrix(), domeMat_, mvp_);
    Melown.mat4.multiply(mvp_, normMat_, mvp_);
    //var shader_ = this.progStardome_;

    this.gpu_.useProgram(shader_, ["aPosition", "aTexCoord"]);
    this.gpu_.bindTexture(texture_ || this.redTexture_);

    shader_.setSampler("uSampler", 0);
    shader_.setMat4("uMVP", mvp_);

    //this.atmoMesh_.draw(shader_, "aPosition", null /*"aTexCoord"*/);
    //this.atmoMesh_.draw(shader_, "aPosition", "aTexCoord");
    this.skydomeMesh_.draw(shader_, "aPosition", "aTexCoord");

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    if (nocull_) {
        gl_.enable(gl_.CULL_FACE);
    }
};

Melown.Renderer.prototype.drawBall = function(position_, size_, shader_, params_, params2_, params3_, normals_) {
    var gl_ = this.gpu_.gl_;

    //gl_.disable(gl_.CULL_FACE);

//            gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
//            gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
//            gl_.enable(gl_.BLEND);


    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);

    var pos_ = [position_[0], position_[1], position_[2] ];

    var domeMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2]), Melown.scaleMatrixf(size_ != null ? size_ : 1.5), domeMat_);
    //Melown.mat4.multiply(Melown.translationMatrix(this.camera_.getPosition()[0]+pos_[0], this.camera_.getPosition()[1]+pos_[1], this.camera_.getPosition()[2]), Melown.scaleMatrixf(21.5), domeMat_);

    var mv_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getModelviewMatrix(), domeMat_, mv_);
    Melown.mat4.multiply(mv_, normMat_, mv_);
    var proj_ = this.camera_.getProjectionMatrix();

    var norm_ = [0,0,0, 0,0,0, 0,0,0];
    Melown.mat4.toInverseMat3(mv_, norm_);
    Melown.mat3.transpose(norm_);
    
    //var shader_ = this.progStardome_;

    this.gpu_.useProgram(shader_, ["aPosition"]);
    this.gpu_.bindTexture(this.redTexture_);

    shader_.setSampler("uSampler", 0);
    shader_.setMat4("uProj", proj_);
    shader_.setMat4("uMV", mv_);
    
    if (normals_) {
        shader_.setMat3("uNorm", norm_);
        gl_.cullFace(gl_.FRONT);
        //gl_.disable(gl_.DEPTH_TEST);
    }
    

    if (params_) {
        shader_.setVec4("uParams", params_);
    }

    if (params2_) {
        shader_.setVec4("uParams2", params2_);
    }

    if (params2_) {
        shader_.setVec4("uParams3", params3_);
    }

    this.atmoMesh_.draw(shader_, "aPosition", null /*"aTexCoord"*/);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    //gl_.enable(gl_.CULL_FACE);
    if (normals_) {
        gl_.cullFace(gl_.BACK);
        //gl_.enable(gl_.DEPTH_TEST);
    }


//    gl_.disable(gl_.BLEND);

};

Melown.Renderer.prototype.drawBall2 = function(position_, size_, shader_, nfactor_, dir_, radius2_) {
    var gl_ = this.gpu_.gl_;

    //gl_.disable(gl_.CULL_FACE);

    var normMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.scaleMatrix(2, 2, 2), Melown.translationMatrix(-0.5, -0.5, -0.5), normMat_);

    var pos_ = [position_[0], position_[1], position_[2] ];

    var domeMat_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.translationMatrix(pos_[0], pos_[1], pos_[2]), Melown.scaleMatrixf(size_ != null ? size_ : 1.5), domeMat_);
    //Melown.mat4.multiply(Melown.translationMatrix(this.camera_.getPosition()[0]+pos_[0], this.camera_.getPosition()[1]+pos_[1], this.camera_.getPosition()[2]), Melown.scaleMatrixf(21.5), domeMat_);

    var mv_ = Melown.mat4.create();
    Melown.mat4.multiply(this.camera_.getModelviewMatrix(), domeMat_, mv_);
    Melown.mat4.multiply(mv_, normMat_, mv_);
    var proj_ = this.camera_.getProjectionMatrix();

    var norm_ = [0,0,0, 0,0,0, 0,0,0];
    Melown.Math.mat4ToInverseMat3(mv_, norm_);
    Melown.mat3.transpose(norm_);
    
    //var shader_ = this.progStardome_;

    this.gpu_.useProgram(shader_, ["aPosition"]);
    this.gpu_.bindTexture(this.redTexture_);

    shader_.setSampler("uSampler", 0);
    shader_.setMat4("uProj", proj_);
    shader_.setMat4("uMV", mv_);
    shader_.setMat3("uNorm", norm_);
    shader_.setFloat("uNFactor", nfactor_);
    shader_.setVec3("uCenter", position_);
    //shader_.setVec3("uDir", dir_);
    shader_.setVec2("uRadius", [size_, radius2_]);

    this.atmoMesh_.draw(shader_, "aPosition", null /*"aTexCoord"*/);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    //gl_.enable(gl_.CULL_FACE);
};

Melown.Renderer.prototype.drawLineString = function(points_, size_, color_, depthTest_, transparent_, writeDepth_, useState_) {
    var gl_ = this.gpu_.gl_;
    var index_ = 0;

    var totalPoints_ = points_.length; 
    
    if (totalPoints_ > 32) {
        for (var i = 0; i < totalPoints_; i += 31) {
            var p_ = points_.slice(i, i + 32); 
            this.drawLineString(p_, size_, color_, depthTest_, transparent_, writeDepth_, useState_);
        }
        return;
    }

    //fill points
    for (var i = 0; i < totalPoints_; i++) {
        var p = points_[i];
        this.plineBuffer_[index_] = p[0];
        this.plineBuffer_[index_+1] = p[1];
        this.plineBuffer_[index_+2] = p[2] || 0;
        index_ += 3;
    }

    if (useState_ != true) {
        if (depthTest_ != true) {
            gl_.disable(gl_.DEPTH_TEST);
        }
    
        if (transparent_ == true) {
            //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
            gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
            gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
            gl_.enable(gl_.BLEND);
        }
    
        if (writeDepth_ === false) {
            gl_.depthMask(false); 
        }
    
        gl_.disable(gl_.CULL_FACE);
    }

    this.gpu_.useProgram(this.progLine4_, ["aPosition"]);

    this.progLine4_.setMat4("uMVP", this.imageProjectionMatrix_);
    this.progLine4_.setVec3("uScale", [(2 / this.curSize_[0]), (2 / this.curSize_[1]), size_*0.5]);
    this.progLine4_.setVec4("uColor", (color_ != null ? color_ : [255,255,255,255]));
//    this.progLine4_.setVec3Array("uPoints", this.plineBuffer_);
    this.progLine4_.setVec3("uPoints", this.plineBuffer_);


    this.plines_.draw(this.progLine4_, "aPosition", totalPoints_);

    if (useState_ != true) {
        if (depthTest_ != true) {
            gl_.enable(gl_.DEPTH_TEST);
        }
    
        if (transparent_ == true) {
            gl_.disable(gl_.BLEND);
        }
    
        if (writeDepth_ === false) {
            gl_.depthMask(false); 
        }
    
        gl_.enable(gl_.CULL_FACE);
    }

};

//draw 2d image - used for debuging
Melown.Renderer.prototype.drawImage = function(x, y, lx, ly, texture_, color_, depth_, depthTest_, transparent_, writeDepth_, useState_) {
    if (texture_ == null || this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;

    if (useState_ != true) {
        if (depthTest_ != true) {
            gl_.disable(gl_.DEPTH_TEST);
        }
    
        if (transparent_ == true) {
            //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
            gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
            gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
            gl_.enable(gl_.BLEND);
        }
    
        if (writeDepth_ === false) {
            gl_.depthMask(false); 
        }
    
        gl_.disable(gl_.CULL_FACE);
    }

    this.gpu_.useProgram(this.progImage_, ["aPosition"]);
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

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [1,1,1,1]));
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);


    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    if (useState_ != true) {
        if (writeDepth_ === false) {
            gl_.depthMask(true); 
        }
    
        if (depthTest_ != true) {
            gl_.enable(gl_.DEPTH_TEST);
        }
    
        if (transparent_ == true) {
            gl_.disable(gl_.BLEND);
        }
    
        gl_.enable(gl_.CULL_FACE);
    }
};

Melown.Renderer.prototype.drawBillboard = function(mvp_, texture_, color_, depthTest_, transparent_, writeDepth_, useState_) {
    var gl_ = this.gpu_.gl_;

    if (useState_ != true) {
        if (depthTest_ != true) {
            gl_.disable(gl_.DEPTH_TEST);
        }
    
        if (transparent_ == true) {
            //gl_.blendFunc(gl_.SRC_ALPHA, gl_.ONE);
            gl_.blendEquationSeparate(gl_.FUNC_ADD, gl_.FUNC_ADD);
            gl_.blendFuncSeparate(gl_.SRC_ALPHA, gl_.ONE_MINUS_SRC_ALPHA, gl_.ONE, gl_.ONE_MINUS_SRC_ALPHA);
            gl_.enable(gl_.BLEND);
        }
    
        if (writeDepth_ === false) {
            gl_.depthMask(false); 
        }
    
        gl_.disable(gl_.CULL_FACE);
    }

    this.gpu_.useProgram(this.progImage_, ["aPosition", "aTexCoord"]);
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

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [1,1,1,1]));
    this.progImage_.setFloat("uDepth", 0);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    if (useState_ != true) {
        if (writeDepth_ === false) {
            gl_.depthMask(true); 
        }
    
        if (depthTest_ != true) {
            gl_.enable(gl_.DEPTH_TEST);
        }
    
        if (transparent_ == true) {
            gl_.disable(gl_.BLEND);
        }
    
        gl_.enable(gl_.CULL_FACE);
    }
};


//draw flat 2d image - used for debuging
Melown.Renderer.prototype.drawFlatImage = function(x, y, lx, ly, texture_, color_, depth_) {
    if (texture_ == null || this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;
    this.gpu_.useProgram(this.progImage_, ["aPosition"]);
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

    this.progImage_.setVec4("uColor", (color_ != null ? color_ : [1,1,1,1]));
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);
};

//draw 2d text - used for debuging
Melown.Renderer.prototype.drawText = function(x, y, size_, text_, color_, depth_, useState_) {
    if (this.imageProjectionMatrix_ == null) {
        return;
    }

    var gl_ = this.gpu_.gl_;

    if (useState_ != true) {
        gl_.disable(gl_.CULL_FACE);
    
    
        if (depth_ == null) {
            gl_.disable(gl_.DEPTH_TEST);
        } else {
            gl_.depthFunc(gl_.LEQUAL);
            gl_.enable(gl_.DEPTH_TEST);
        }
    }

    this.gpu_.useProgram(this.progImage_, ["aPosition"]);
    this.gpu_.bindTexture(this.textTexture2_);
    //this.gpu_.bindTexture(this.textTexture2_);

    var vertices_ = this.rectVerticesBuffer_;
    gl_.bindBuffer(gl_.ARRAY_BUFFER, vertices_);
    gl_.vertexAttribPointer(this.progImage_.getAttribute("aPosition"), vertices_.itemSize, gl_.FLOAT, false, 0, 0);

    var indices_ = this.rectIndicesBuffer_;
    gl_.bindBuffer(gl_.ELEMENT_ARRAY_BUFFER, indices_);

    this.progImage_.setMat4("uProjectionMatrix", this.imageProjectionMatrix_);
    this.progImage_.setVec4("uColor", color_);
    this.progImage_.setFloat("uDepth", depth_ != null ? depth_ : 0);

    //size_ *= 2;

    var sizeX_ = size_ - 1;
    var sizeY_ = size_;// * (7/4);

    var sizeX2_ = Math.round(size_*0.5);// - 1;

    var texelX_ = 1 / 256;
    var texelY_ = 1 / 128;

    var lx_ = this.getTextSize(size_, text_) + 2;

    //draw black line before text
    var char_ = 0;
    var charPosX_ = (char_ & 15) << 4;
    var charPosY_ = (char_ >> 4) << 4;

    this.progImage_.setMat4("uData", [
        x-2, y-2,  (charPosX_ * texelX_), (charPosY_ * texelY_),
        x-2 + lx_, y-2,  ((charPosX_+15) * texelX_), (charPosY_ * texelY_),
        x-2 + lx_, y + sizeY_+1, ((charPosX_ + 15) * texelX_), ((charPosY_+15) * texelY_),
        x-2,  y + sizeY_+1,  (charPosX_ * texelX_), ((charPosY_+15) * texelY_) ]);

    gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);
    

    for (var i = 0, li = text_.length; i < li; i++) {
        char_ = text_.charCodeAt(i) - 32;
        charPosX_ = (char_ & 15) << 4;
        charPosY_ = (char_ >> 4) << 4;

        switch(char_) {
            case 12:
            case 14:
            case 27: //:
            case 28: //;
            case 64: //'
            case 73: //i
            case 76: //l
            case 84: //t

                this.progImage_.setMat4("uData", [
                    x, y,  (charPosX_ * texelX_), (charPosY_ * texelY_),
                    x + sizeX2_, y,  ((charPosX_+8) * texelX_), (charPosY_ * texelY_),
                    x + sizeX2_, y + sizeY_, ((charPosX_ + 8) * texelX_), ((charPosY_+16) * texelY_),
                    x,  y + sizeY_,  (charPosX_ * texelX_), ((charPosY_+16) * texelY_) ]);

                x += sizeX2_;
                break;

            default:

                this.progImage_.setMat4("uData", [
                    x, y,  (charPosX_ * texelX_), (charPosY_ * texelY_),
                    x + sizeX_, y,  ((charPosX_+15) * texelX_), (charPosY_ * texelY_),
                    x + sizeX_, y + sizeY_, ((charPosX_ + 15) * texelX_), ((charPosY_+16) * texelY_),
                    x,  y + sizeY_,  (charPosX_ * texelX_), ((charPosY_+16) * texelY_) ]);

                x += sizeX_;
                
                break;
        }

        gl_.drawElements(gl_.TRIANGLES, indices_.numItems, gl_.UNSIGNED_SHORT, 0);

    }

    if (useState_ != true) {
        gl_.enable(gl_.CULL_FACE);
    
        if (depth_ == null) {
            gl_.enable(gl_.DEPTH_TEST);
        }
    }

};


Melown.Renderer.prototype.getTextSize = function(size_, text_) {
    var sizeX_ = size_ - 1;
    var sizeX2_ = Math.round(size_*0.5);// - 1;
    var x = 0;

    for (var i = 0, li = text_.length; i < li; i++) {
        var char_ = text_.charCodeAt(i) - 32;

        switch(char_) {
            case 12:
            case 14:
            case 27: //:
            case 28: //;
            case 64: //'
            case 73: //i
            case 76: //l
            case 84: //t
                x += sizeX2_;
                break;

            default:
               x += sizeX_;
                break;
        }
    }
    
    return x;
};


Melown.Renderer.prototype.drawGpuJobs = function() {
    var gpu_ = this.gpu_;
    var gl_ = gpu_.gl_;

    //setup stencil
    gl_.stencilMask(0xFF);
    gl_.clear(gl_.STENCIL_BUFFER_BIT);

    gl_.stencilFunc(gl_.EQUAL, 0, 0xFF);
    gl_.stencilOp(gl_.KEEP, gl_.KEEP, gl_.INCR);

    /*
    var distance_ = this.position_[2];
    distance_ = distance_ * Math.tan(Vadstena.radians(this.camera_.getFov()));
    var distanceFactor_ = (500/Math.max(10.0,distance_));
    this.distanceFactor_ = (distanceFactor_ * distanceFactor_ * distanceFactor_)*0.5;
    this.tiltFactor_ = 0.5 + 0.5 * (Math.abs(this.orientation_[1]/-90));

    var zoffset_ = this.getZoffsetFactor([1,1,1]);

    Vadstena.StencilLineState_ = this.gpu_.createState({blend_:true, stencil_:true, zoffset_:zoffset_, culling_: false});
    Vadstena.LineLabelState_ = this.gpu_.createState({blend_:true, zoffset_:zoffset_, culling_: false});
    */

    Melown.StencilLineState_ = this.gpu_.createState({blend_:true, stencil_:true, culling_: false});
    Melown.LineLabelState_ = this.gpu_.createState({blend_:true, culling_: false});

    var screenPixelSize_ = [1.0/this.curSize_[0], 1.0/this.curSize_[1]];

    //this.updateGeoHitmap_ = this.dirty_;

    var clearPass_ = 513;
    var clearPassIndex_ = 0;

    if (this.clearStencilPasses_.length > 0) {
        clearPass_ = this.clearStencilPasses_[0];
        clearPassIndex_++;
    }

    //draw job buffer and also clean buffer
    for (var i = 0, li = this.jobZBuffer_.length; i < li; i++) {
        var lj = this.jobZBufferSize_[i];
        var buffer_ = this.jobZBuffer_[i];

        if (lj > 0 && i >= clearPass_) {
            gl_.clear(gl_.STENCIL_BUFFER_BIT);

            if (this.clearStencilPasses_.length > clearPassIndex_) {
                clearPass_ = this.clearStencilPasses_[clearPassIndex_];
                clearPassIndex_++;
            } else {
                clearPass_ = 513;
            }
        }

        for (var j = 0; j < lj; j++) {
            Melown.drawGpuJob(gpu_, gl_, this, buffer_[j], screenPixelSize_);
            //buffer_[j] = null;
        }

        //this.jobZBufferSize_[i] = 0;
    }
};


Melown.Renderer.prototype.drawHitmapGpuJobs = function() {
    var gpu_ = this.gpu_;
    var gl_ = gpu_.gl_;

    this.hoverFeatureCounter_ = 0;

    var size_ = this.hitmapSize_;

    //set texture framebuffer
    this.gpu_.setFramebuffer(this.geoHitmapTexture_);

    var oldSize_ = [ this.curSize_[0], this.curSize_[1] ];

    var width_ = size_;
    var height_ = size_;

    gl_.clearColor(1.0,1.0, 1.0, 1.0);
    gl_.enable(gl_.DEPTH_TEST);

    //clear screen
    gl_.viewport(0, 0, size_, size_);
    gl_.clear(gl_.COLOR_BUFFER_BIT | gl_.DEPTH_BUFFER_BIT);

    this.curSize_ = [width_, height_];

    //render scene
    this.onlyHitLayers_ = true;
    //this.paintGL();

    this.gpu_.clear();
    this.updateCamera();

    //this.camera_.update();
    this.drawGpuJobs(this);

    this.onlyHitLayers_ = false;

    //return screen framebuffer
    width_ = oldSize_[0];
    height_ = oldSize_[1];

    gl_.clearColor(0.0, 0.0, 0.0, 1.0);

    this.gpu_.setFramebuffer(null);

    this.camera_.setAspect(width_ / height_);
    this.curSize_ = [width_, height_];
    this.gpu_.resize(this.curSize_, true);
    this.camera_.update();
    this.updateCamera();

/*
    var m = [];
    m[0] = 2.0/width_; m[1] = 0; m[2] = 0; m[3] = 0;
    m[4] = 0; m[5] = -2.0/height_; m[6] = 0; m[7] = 0;
    m[8] = 0; m[9] = 0; m[10] = 1; m[11] = 0;
    m[12] = -width_*0.5*m[0]; m[13] = -height_*0.5*m[5]; m[14] = 0; m[15] = 1;
    this.imageProjectionMatrix_ = m;
*/

};

Melown.Renderer.prototype.clearJobBuffer = function() {

    //clean job buffer
    for (var i = 0, li = this.jobZBuffer_.length; i < li; i++) {
        var lj = this.jobZBufferSize_[i];
        var buffer_ = this.jobZBuffer_[i];

        for (var j = 0; j < lj; j++) {
            buffer_[j] = null;
        }

        this.jobZBufferSize_[i] = 0;
    }

};

Melown.Renderer.prototype.fogSetup = function(program_, fogDensity_) {
    // the fog equation is: exp(-density*distance), this gives the fraction
    // of the original color that is still visible at some distance

    // we define visibility as a distance where only 5% of the original color
    // is visible; from this it is easy to calculate the correct fog density

    //var density_ = Math.log(0.05) / this.core_.coreConfig_.cameraVisibility_;
	var cameraVisibility_ = 1200000.0;
    var density_ = Math.log(0.05) / (cameraVisibility_ * 10*(Math.max(5,-this.camera_.getOrientation()[1])/90));
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
