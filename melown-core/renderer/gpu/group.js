
/**
 * @constructor
 */
Melown.GpuGroup = function(id_, bbox_, origin_, gpu_, renderer_) {
    this.id_ = id_;
    this.bbox_ = null;
    this.origin_ = origin_ || [0,0,0];
    this.gpu_ = gpu_;
    this.gl_ = gpu_.gl_;
    this.renderer_ = renderer_;
    this.jobs_ = [];
    this.reduced_ = 0;

    if (bbox_ != null && bbox_[0] != null && bbox_[1] != null) {
        this.bbox_ = new Melown.BBox(bbox_[0][0], bbox_[0][1], bbox_[0][2], bbox_[1][0], bbox_[1][1], bbox_[1][2]);
    }
    
    this.optimize_ = true;

    this.size_ = 0;
    this.polygons_ = 0;
};

//destructor
Melown.GpuGroup.prototype.kill = function() {
    for (var i = 0, li = this.jobs_.length; i < li; i++) {

        switch(this.jobs_[i].type_) {
            case "flat-line":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                break;

            case "flat-tline":
            case "pixel-line":
            case "pixel-tline":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexNormalBuffer_);
                break;

            case "line-label":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexTexcoordBuffer_);
                break;

            case "icon":
            case "label":
                this.gl_.deleteBuffer(this.jobs_[i].vertexPositionBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexTexcoordBuffer_);
                this.gl_.deleteBuffer(this.jobs_[i].vertexOriginBuffer_);
                break;
        }
    }
};

Melown.GpuGroup.prototype.size = function() {
    return this.size_;
};

Melown.GpuGroup.prototype.getZbufferOffset = function(params_) {
    return this.size_;
};

Melown.GpuGroup.prototype.addLineJob = function(data_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = "flat-line";
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.lineWidth_ = data_["line-width"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];
    job_.reduced_ = false;
    job_.ready_ = true;

    if (this.optimize_ && !job_.hitable_) {
        job_.ready_ = false;

        job_.renderSignature_ = JSON.stringify({
            type_: job_.type_,
            color_ : color_,
            zIndex_ : job_.zIndex_,
            //lineWidth_ : job_.lineWidth_,
            zOffset_ : job_.zbufferOffset_
        });

        job_.vbuffer_ = vertices_;
        
    } else {
        //create vertex buffer
        job_.vertexPositionBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
    
        //gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
        gl_.bufferData(gl_.ARRAY_BUFFER, vertices_, gl_.STATIC_DRAW);
        job_.vertexPositionBuffer_.itemSize = 3;
        job_.vertexPositionBuffer_.numItems = vertices_.length / 3;
    }

    this.jobs_.push(job_);

    this.size_ += vertices_.length * 4 * 4;
    this.polygons_ += vertices_.length / 3;
};

Melown.GpuGroup.prototype.addExtentedLineJob = function(data_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var normals_ = data_["normalBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = data_["type"];
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.lineWidth_ = data_["line-width"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];
    job_.reduced_ = false;
    job_.ready_ = true;

    if (data_["texture"] != null) {
        var texture_ = data_["texture"];
        var bitmap_ = texture_[0];
        job_.texture_ = [this.renderer_.getBitmap(bitmap_["url"], bitmap_["filter"] || "linear", bitmap_["tiled"] || false),
                                                  texture_[1], texture_[2], texture_[3], texture_[4]];
        var background_ = data_["background"];

        if (background_[3] != 0) {
            job_.background_ = [background_[0]*f, background_[1]*f, background_[2]*f, background_[3]*f];
        }
    }

    switch(job_.type_) {
        case "flat-tline":   job_.program_ = (background_[3] != 0) ? this.renderer_.progTBLine_ : this.renderer_.progTLine_;  break;
        case "pixel-line":   job_.program_ = this.renderer_.progLine3_;  break;
        case "pixel-tline":  job_.program_ = (background_[3] != 0) ? this.renderer_.progTPBLine_ : this.renderer_.progTPLine_; break;
    }

    if (this.optimize_ && !job_.hitable_) {
        job_.ready_ = false;

        job_.renderSignature_ = JSON.stringify({
            type_: job_.type_,
            color_ : color_,
            zIndex_ : job_.zIndex_,
            lineWidth_ : job_.lineWidth_,
            zOffset_ : job_.zbufferOffset_
        });

        job_.vbuffer_ = vertices_;
        job_.nbuffer_ = normals_;
        
    } else {
        //create vertex buffer
        job_.vertexPositionBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
    
        //gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
        gl_.bufferData(gl_.ARRAY_BUFFER, vertices_, gl_.STATIC_DRAW);
        job_.vertexPositionBuffer_.itemSize = 4;
        job_.vertexPositionBuffer_.numItems = vertices_.length / 4;
    
        //create normal buffer
        job_.vertexNormalBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexNormalBuffer_);
    
        //gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(normals_), gl_.STATIC_DRAW);
        gl_.bufferData(gl_.ARRAY_BUFFER, normals_, gl_.STATIC_DRAW);
        job_.vertexNormalBuffer_.itemSize = 4;
        job_.vertexNormalBuffer_.numItems = normals_.length / 4;
    }

    this.jobs_.push(job_);

    this.size_ += vertices_.length * 4 * 4 + normals_.length * 4 * 4;
    this.polygons_ += vertices_.length / 3;
};

Melown.GpuGroup.prototype.addLineLabelJob = function(data_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var texcoords_ = data_["texcoordsBuffer"];
    var color_ = data_["color"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = "line-label";
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.lod_ = data_["lod"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];
    job_.reduced_ = false;
    job_.ready_ = true;


    if (this.optimize_ && !job_.hitable_) {
        job_.ready_ = false;

        job_.renderSignature_ = JSON.stringify({
            type_: job_.type_,
            color_ : color_,
            zIndex_ : job_.zIndex_,
            //lineWidth_ : job_.lineWidth_,
            zOffset_ : job_.zbufferOffset_
        });

        job_.vbuffer_ = vertices_;
        job_.nbuffer_ = texcoords_;
        
    } else {
        //create vertex buffer
        job_.vertexPositionBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
    
        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
        //gl_.bufferData(gl_.ARRAY_BUFFER, vertices_, gl_.STATIC_DRAW);
        job_.vertexPositionBuffer_.itemSize = 4;
        job_.vertexPositionBuffer_.numItems = vertices_.length / 4;
    
        //create normal buffer
        job_.vertexTexcoordBuffer_ = gl_.createBuffer();
        gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);
    
        gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(texcoords_), gl_.STATIC_DRAW);
        //gl_.bufferData(gl_.ARRAY_BUFFER, texcoords_, gl_.STATIC_DRAW);
        job_.vertexTexcoordBuffer_.itemSize = 4;
        job_.vertexTexcoordBuffer_.numItems = texcoords_.length / 4;
    }

    this.jobs_.push(job_);

    this.size_ += vertices_.length * 4 * 4 + texcoords_.length * 4 * 4;
    this.polygons_ += vertices_.length / 3;
};

Melown.GpuGroup.prototype.addIconJob = function(data_, label_) {
    var gl_ = this.gl_;

    var vertices_ = data_["vertexBuffer"];
    var texcoords_ = data_["texcoordsBuffer"];
    var origins_ = data_["originBuffer"];
    var color_ = data_["color"];
    var s = data_["stick"];
    var f = 1.0/255;

    var job_ = {};
    job_.type_ = label_ ? "label" : "icon";
    job_.program_ = data_["program"];
    job_.color_ = [color_[0]*f, color_[1]*f, color_[2]*f, color_[3]*f];
    job_.zIndex_ = data_["z-index"] + 256;
    job_.visibility_ = data_["visibility"];
    job_.clickEvent_ = data_["click-event"];
    job_.hoverEvent_ = data_["hover-event"];
    job_.enterEvent_ = data_["enter-event"];
    job_.leaveEvent_ = data_["leave-event"];
    job_.hitable_ = data_["hitable"];
    job_.eventInfo_ = data_["eventInfo"];
    job_.state_ = data_["state"];
    job_.center_ = data_["center"];
    job_.stick_ = [s[0], s[1], s[2], s[3]*f, s[4]*f, s[5]*f, s[6]*f];
    job_.lod_ = data_["lod"];
    job_.zbufferOffset_ = data_["zbuffer-offset"];
    job_.reduced_ = false;
    job_.ready_ = true;

    if (label_ != true) {
        var icon_ = data_["icon"];
        job_.texture_ = this.renderer_.getBitmap(icon_["url"], icon_["filter"] || "linear", icon_["tiled"] || false);
    } else {
        job_.texture_ = this.renderer_.font_.texture_;
    }

    //create vertex buffer
    job_.vertexPositionBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(vertices_), gl_.STATIC_DRAW);
    job_.vertexPositionBuffer_.itemSize = 4;
    job_.vertexPositionBuffer_.numItems = vertices_.length / 4;

    //create normal buffer
    job_.vertexTexcoordBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(texcoords_), gl_.STATIC_DRAW);
    job_.vertexTexcoordBuffer_.itemSize = 4;
    job_.vertexTexcoordBuffer_.numItems = texcoords_.length / 4;

    //create origin buffer
    job_.vertexOriginBuffer_ = gl_.createBuffer();
    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexOriginBuffer_);

    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(origins_), gl_.STATIC_DRAW);
    job_.vertexOriginBuffer_.itemSize = 3;
    job_.vertexOriginBuffer_.numItems = origins_.length / 3;

    this.jobs_.push(job_);

    this.size_ += job_.vertexPositionBuffer_.numItems * 4 * 4 +
                  job_.vertexOriginBuffer_.numItems * 3 * 4 +
                  job_.vertexTexcoordBuffer_.numItems * 4 * 4;
    this.polygons_ += job_.vertexPositionBuffer_.numItems / 3;
};

Melown.GpuGroup.prototype.addRenderJob = function(data_) {
    switch(data_["type"]) {
        case "flat-line":   this.addLineJob(data_); break;
        case "flat-tline":  this.addExtentedLineJob(data_); break;
        case "pixel-line":  this.addExtentedLineJob(data_); break;
        case "pixel-tline": this.addExtentedLineJob(data_); break;
        case "line-label":  this.addLineLabelJob(data_); break;
        case "icon":        this.addIconJob(data_); break;
        case "label":       this.addIconJob(data_, true); break;
        case "optimize":    this.optimaze(data_); break;
    }
};

Melown.GpuGroup.prototype.optimize = function() {
    if (!this.optimize_) {
        return;
    }

    var gl_ = this.gl_;
    var newJobs_ = [];
    
    for (var i = 0, li = this.jobs_.length; i < li; i++) {
        var job_ = this.jobs_[i];
        
        if (!job_.hitable_ && !job_.reduced_ &&
            !(job_.type_ == "icon" || job_.type_ == "label")) {

            /*
            //simple but unstable
            for (var j = i + 1; j < li; j++) {
                var job2_ = this.jobs_[j];
                
                if (job_.renderSignature_ == job2_.renderSignature_) {
                    job2_.reduced_ = true;

                    switch(job_.type_) {
                        case "flat-line":
                            job_.vbuffer_.push.apply(job_.vbuffer_, job2_.vbuffer_);                             
                            break;
                            
                        case "pixel-line":
                        case "line-label":
                            job_.vbuffer_.push.apply(job_.vbuffer_, job2_.vbuffer_);                             
                            job_.nbuffer_.push.apply(job_.nbuffer_, job2_.nbuffer_);                             
                            break;
                    }
                }
            }
            */

            
            switch(job_.type_) {
                case "flat-line":

                    var vbufferSize_ = job_.vbuffer_.length;
                    var signature_ = job_.renderSignature_;

                    for (var j = i + 1; j < li; j++) {
                        var job2_ = this.jobs_[j];
                        
                        if (job2_.renderSignature_ == signature_) {
                            job2_.reduced_ = true;
                            vbufferSize_ += job2_.vbuffer_.length;                             
                        }
                    }

                    var vbuffer_ = new Array(vbufferSize_);
                    var index_ = 0;

                    for (var j = i; j < li; j++) {
                        var job2_ = this.jobs_[j];
                        
                        if (job2_.renderSignature_ == signature_) {
                            var buff_ = job2_.vbuffer_;
                            job2_.vbuffer_ = null;
                            for (var k = 0, lk = buff_.length; k < lk; k++) {
                                vbuffer_[index_+k] = buff_[k];
                            }
                            index_+= lk;        
                        }
                    }

                    job_.vbuffer_ = vbuffer_;                             
                    break;
                    
                case "pixel-line":
                case "line-label":
                    var vbufferSize_ = job_.vbuffer_.length;
                    var signature_ = job_.renderSignature_;

                    for (var j = i + 1; j < li; j++) {
                        var job2_ = this.jobs_[j];
                        
                        if (job2_.renderSignature_ == signature_) {
                            job2_.reduced_ = true;
                            vbufferSize_ += job2_.vbuffer_.length;                             
                        }
                    }

                    var vbuffer_ = new Array(vbufferSize_);
                    var nbuffer_ = new Array(vbufferSize_);
                    var index_ = 0;

                    for (var j = i; j < li; j++) {
                        var job2_ = this.jobs_[j];
                        
                        if (job2_.renderSignature_ == signature_) {
                            var buff_ = job2_.vbuffer_;
                            var buff2_ = job2_.nbuffer_;
                            job2_.vbuffer_ = null;
                            job2_.nbuffer_ = null;
                            for (var k = 0, lk = buff_.length; k < lk; k++) {
                                vbuffer_[index_+k] = buff_[k];
                                nbuffer_[index_+k] = buff2_[k];
                            }
                            index_+= lk;        
                        }
                    }

                    job_.vbuffer_ = vbuffer_;                             
                    job_.nbuffer_ = nbuffer_;                             
                    break;
            }

            newJobs_.push(job_);
            job_.ready_ = true;
            
        } else if (!job_.reduced_) {
            newJobs_.push(job_);
        }
    }

    this.reduced_ = this.jobs_.length - newJobs_.length;  

    console.log("total: " + this.jobs_.length + "    reduced: " + this.reduced_);

    this.jobs_ = newJobs_;

    //build vertex buffers
    for (var i = 0, li = this.jobs_.length; i < li; i++) {
        var job_ = this.jobs_[i];

        if (!job_.hitable_ && !(job_.type_ == "icon" || job_.type_ == "label")) {

            switch(job_.type_) {
                case "flat-line":
                    //create vertex buffer
                    job_.vertexPositionBuffer_ = gl_.createBuffer();
                    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
                
                    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(job_.vbuffer_), gl_.STATIC_DRAW);
                    job_.vertexPositionBuffer_.itemSize = 3;
                    job_.vertexPositionBuffer_.numItems = job_.vbuffer_.length / 3;
                    break;
                    
                case "pixel-line":
        
                    //create vertex buffer
                    job_.vertexPositionBuffer_ = gl_.createBuffer();
                    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
                
                    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(job_.vbuffer_), gl_.STATIC_DRAW);
                    job_.vertexPositionBuffer_.itemSize = 4;
                    job_.vertexPositionBuffer_.numItems = job_.vbuffer_.length / 4;
                
                    //create normal buffer
                    job_.vertexNormalBuffer_ = gl_.createBuffer();
                    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexNormalBuffer_);
                
                    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(job_.nbuffer_), gl_.STATIC_DRAW);
                    job_.vertexNormalBuffer_.itemSize = 4;
                    job_.vertexNormalBuffer_.numItems = job_.nbuffer_.length / 4;

                case "line-label":

                    //create vertex buffer
                    job_.vertexPositionBuffer_ = gl_.createBuffer();
                    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
                
                    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(job_.vbuffer_), gl_.STATIC_DRAW);
                    job_.vertexPositionBuffer_.itemSize = 4;
                    job_.vertexPositionBuffer_.numItems = job_.vbuffer_.length / 4;

                    //create normal buffer
                    job_.vertexTexcoordBuffer_ = gl_.createBuffer();
                    gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);
                
                    gl_.bufferData(gl_.ARRAY_BUFFER, new Float32Array(job_.nbuffer_), gl_.STATIC_DRAW);
                    job_.vertexTexcoordBuffer_.itemSize = 4;
                    job_.vertexTexcoordBuffer_.numItems = job_.nbuffer_.length / 4;
                   
                    break;
            }
        }        
    }
};


Melown.GpuGroup.prototype.draw = function(mv_, mvp_, applyOrigin_) {
    if (this.id_ != null) {
        if (this.renderer_.layerGroupVisible_[this.id_] === false) {
            return;
        }
    }

    if (applyOrigin_ == true) {
        var mvp2_ = Melown.mat4.create();
        var mv2_ = Melown.mat4.create();

        var pos_ = this.renderer_.position_;

        var transform_ = this.renderer_.layerGroupTransform_[this.id_];

        if (transform_ != null) {
            var origin_ = transform_[1];
            origin_ = [origin_[0] - pos_[0], origin_[1] - pos_[1], origin_[2]];
            Melown.mat4.multiply(Melown.translationMatrix(origin_[0], origin_[1], origin_[2]), transform_[0], mv2_);
            Melown.mat4.multiply(mv_, mv2_, mv2_);
        } else {
            var origin_ = [this.origin_[0] - pos_[0], this.origin_[1] - pos_[1], this.origin_[2]];
            Melown.mat4.multiply(mv_, Melown.translationMatrix(origin_[0], origin_[1], origin_[2]), mv2_);
        }

        Melown.mat4.multiply(mvp_, mv2_, mvp2_);
        mv_ = mv2_;
        mvp_ = mvp2_;
    }

    var gl_ = this.gl_;
    var gpu_ = this.gpu_;

    var cameraPos_ = this.renderer_.cameraPosition_;
    
    var jobZBuffer_ = this.renderer_.jobZBuffer_;
    var jobZBufferSize_ = this.renderer_.jobZBufferSize_;

    var onlyHitable_ = this.renderer_.onlyHitLayers_;

    for (var i = 0, li = this.jobs_.length; i < li; i++) {
        var job_ = this.jobs_[i];

        if ((job_.type_ == "icon" || job_.type_ == "label") && job_.visibility_ > 0) {
            var center_ = job_.center_;
            if (Melown.vec3.length([center_[0]-cameraPos_[0],
                                    center_[1]-cameraPos_[1],
                                    center_[2]-cameraPos_[2]]) > job_.visibility_) {
                continue;
            }
        }

        if (onlyHitable_ && !job_.hitable_) {
            continue;
        }

        job_.mv_ = mv_;
        job_.mvp_ = mvp_;

        var zIndex_ = job_.zIndex_;
        jobZBuffer_[zIndex_][jobZBufferSize_[zIndex_]] = job_;
        jobZBufferSize_[zIndex_]++;
    }
};

Melown.drawGpuJob = function(gpu_, gl_, renderer_, job_, screenPixelSize_) {
    var mv_ = job_.mv_;
    var mvp_ = job_.mvp_;

    if (!job_.ready_) {
        return;
    }

    if (job_.state_ != 0) {
        var id_ = job_.eventInfo_["id"];

        if (id_ != null && renderer_.hoverFeature_ != null) {
            if (job_.state_ == 1){  // 1 = no hover state

                if (renderer_.hoverFeature_[0]["id"] == id_) { //are we hovering over feature?
                    return;
                }

            } else { // 2 = hover state

                if (renderer_.hoverFeature_[0]["id"] != id_) { //are we hovering over feature?
                    return;
                }

            }
        } else { //id id provided
            if (job_.state_ == 2) { //skip hover style
                return;
            }
        }
    }

    var hitmapRender_ = job_.hitable_ && renderer_.onlyHitLayers_;

    var color_ = job_.color_;

    if (hitmapRender_) {
        var c = renderer_.hoverFeatureCounter_;
        color_ = [(c&255)/255, ((c>>8)&255)/255, ((c>>16)&255)/255, 1];
        renderer_.hoverFeatureList_[c] = [job_.eventInfo_, job_.center_, job_.clickEvent_, job_.hoverEvent_, job_.enterEvent_, job_.leaveEvent_];
        renderer_.hoverFeatureCounter_++;
    }

    switch(job_.type_) {
        case "flat-line":

            gpu_.setState(Melown.StencilLineState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = renderer_.progLine_;

            gpu_.useProgram(prog_, "aPosition", null, null, null);
            prog_.setVec4("uColor", color_);
            prog_.setMat4("uMVP", mvp_);

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;

        case "flat-tline":
        case "pixel-line":
        case "pixel-tline":

            gpu_.setState(Melown.StencilLineState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = job_.program_;
            var texture_ = null;
            var textureParams_ = [0,0,0,0];

            if (job_.type_ != "pixel-line") {

                if (hitmapRender_) {
                    texture_ = renderer_.whiteTexture_;
                } else {
                    var t = job_.texture_;

                    if (t == null || t[0] == null) {
                        return;
                    }

                    texture_ = t[0];
                    textureParams_ = [0, t[1]/t[0].height_, (t[1]+t[2])/t[0].height_, 0];

                    if (job_.type_ == "flat-tline") {
                        textureParams_[0] = 1/job_.lineWidth_/(texture_.width_/t[2]);
                    } else {
                        var lod_ = job_.lod_; // || job_.layer_.currentLod_;
                        var tileSize_ = 256;//job_.layer_.core_.mapConfig_.tileSize(lod_);
                        var tilePixelSize_ = tileSize_ / 256;//job_.layer_.tilePixels_;
                        textureParams_[0] = 1/texture_.width_/tilePixelSize_;
                    }
                }

                if (texture_.loaded_ == false) {
                    return;
                }

                gpu_.bindTexture(texture_);
            }

            gpu_.useProgram(prog_, "aPosition", null, null, null);
            prog_.setVec4("uColor", color_);
            prog_.setVec2("uScale", screenPixelSize_);
            prog_.setMat4("uMVP", mvp_);

            if (job_.type_ != "pixel-line") {
                if (job_.background_ != null) {
                    prog_.setVec4("uColor2", job_.background_);
                }
                prog_.setVec4("uParams", textureParams_);
                prog_.setSampler("uSampler", 0);
            }

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");
            var vertexNormalAttribute_ = prog_.getAttribute("aNormal");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex normals
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexNormalBuffer_);
            gl_.vertexAttribPointer(vertexNormalAttribute_, job_.vertexNormalBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;

        case "line-label":

            var texture_ = hitmapRender_ ? renderer_.whiteTexture_ : renderer_.font_.texture_;
            
            //var yaw_ = Melown.radians(renderer_.cameraOrientation_[0]);
            //var forward_ = [-Math.sin(yaw_), Math.cos(yaw_), 0, 0];

            gpu_.setState(Melown.LineLabelState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            var prog_ = renderer_.progText_;

            gpu_.bindTexture(texture_);

            gpu_.useProgram(prog_, "aPosition", "aTexCoord", null, null);
            prog_.setSampler("uSampler", 0);
            prog_.setMat4("uMVP", mvp_);
            prog_.setVec4("uVec", renderer_.labelVector_);
            prog_.setVec4("uColor", color_);
            //prog_.setVec2("uScale", screenPixelSize_);

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");
            var vertexTexcoordAttribute_ = prog_.getAttribute("aTexCoord");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex texcoords
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);
            gl_.vertexAttribPointer(vertexTexcoordAttribute_, job_.vertexTexcoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;

        case "icon":
        case "label":

            var texture_ = hitmapRender_ ? renderer_.whiteTexture_ : job_.texture_;

            if (texture_.loaded_ == false) {
                return;
            }
            
            //value larger then 0 means that visibility is tested
            //if (job_.visibility_ != 0) {
                //job_.visibility_
            //}

            gpu_.setState(Melown.LineLabelState_, renderer_.getZoffsetFactor(job_.zbufferOffset_));
            
            var stickShift_ = 0;

            if (job_.stick_[0] != 0) {
                var s = job_.stick_;
                stickShift_ = renderer_.cameraTiltFator_ * s[0];
                
                if (stickShift_ < s[1]) {
                    stickShift_ = 0;
                } else if (s[2] != 0) {
                    var pp_ = renderer_.project2(job_.center_, mvp_);
                    pp_[0] = Math.round(pp_[0]);

                    renderer_.drawLineString([[pp_[0], pp_[1], pp_[2]], [pp_[0], pp_[1]-stickShift_, pp_[2]]], s[2], [s[3], s[4], s[5], s[6]], null, null, null, true);
                }
            }

            var prog_ = renderer_.progIcon_;

            gpu_.bindTexture(texture_);

            gpu_.useProgram(prog_, "aPosition", "aTexCoord", null, "aOrigin");
            prog_.setSampler("uSampler", 0);
            prog_.setMat4("uMVP", mvp_);
            prog_.setVec4("uScale", [screenPixelSize_[0], screenPixelSize_[1], (job_.type_ == "label" ? 1.0 : 1.0 / texture_.width_), stickShift_*2]);
            prog_.setVec4("uColor", color_);
            //prog_.setVec2("uScale", screenPixelSize_);

            var vertexPositionAttribute_ = prog_.getAttribute("aPosition");
            var vertexTexcoordAttribute_ = prog_.getAttribute("aTexCoord");
            var vertexOriginAttribute_ = prog_.getAttribute("aOrigin");

            //bind vetex positions
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexPositionBuffer_);
            gl_.vertexAttribPointer(vertexPositionAttribute_, job_.vertexPositionBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex texcoordds
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexTexcoordBuffer_);
            gl_.vertexAttribPointer(vertexTexcoordAttribute_, job_.vertexTexcoordBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //bind vetex origin
            gl_.bindBuffer(gl_.ARRAY_BUFFER, job_.vertexOriginBuffer_);
            gl_.vertexAttribPointer(vertexOriginAttribute_, job_.vertexOriginBuffer_.itemSize, gl_.FLOAT, false, 0, 0);

            //draw polygons
            gl_.drawArrays(gl_.TRIANGLES, 0, job_.vertexPositionBuffer_.numItems);

            break;
    }

};


