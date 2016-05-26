
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

    this.gpu_.useProgram(shader_, "aPosition", "aTexCoord");
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

Melown.Renderer.prototype.drawTBall = function(position_, size_, shader_) {
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

    this.gpu_.useProgram(shader_, "aPosition", null/*"aTexCoord"*/);
    this.gpu_.bindTexture(this.redTexture_);

    shader_.setSampler("uSampler", 0);
    shader_.setMat4("uMVP", mvp_);

    this.atmoMesh_.draw(shader_, "aPosition", null /*"aTexCoord"*/);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    //gl_.enable(gl_.CULL_FACE);
};

Melown.Renderer.prototype.drawBall = function(position_, size_, shader_, nfactor_) {
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

    this.gpu_.useProgram(shader_, "aPosition", null/*"aTexCoord"*/);
    this.gpu_.bindTexture(this.redTexture_);

    shader_.setSampler("uSampler", 0);
    shader_.setMat4("uProj", proj_);
    shader_.setMat4("uMV", mv_);
    shader_.setMat3("uNorm", norm_);
    shader_.setFloat("uNFactor", nfactor_);

    this.atmoMesh_.draw(shader_, "aPosition", null /*"aTexCoord"*/);

    this.renderedPolygons_ += this.skydomeMesh_.getPolygons();

    //gl_.enable(gl_.CULL_FACE);
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

    this.gpu_.useProgram(shader_, "aPosition", null/*"aTexCoord"*/);
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

    this.gpu_.useProgram(this.progLine4_, "aPosition", null);

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

    this.gpu_.useProgram(this.progImage_, "aPosition", null);
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
