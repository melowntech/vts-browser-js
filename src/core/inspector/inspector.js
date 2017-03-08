
/**
 * @constructor
 */
Melown.Inspector = function(core_) {
    this.core_ = core_;

    this.initStatsPanel();
    this.initGraphsPanel();
    this.initLayersPanel();
    this.initReplayPanel();
    this.initStylesheetsPanel();

    //keyboard events
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    
    this.core_.on("map-update", this.onMapUpdate.bind(this));
   
    this.shakeCamera_ = false; 
    this.drawReplayCamera_ = false; 
    this.drawRadar_ = false;
    this.radarLod_ = null;
    this.debugValue_ = 0;
};

Melown.Inspector.prototype.addStyle = function(string_) {
    var style_ = document.createElement('style');
    style_.type = 'text/css';
    style_.innerHTML = string_;
    document.getElementsByTagName('head')[0].appendChild(style_);
};

//used to block mouse events
Melown.Inspector.prototype.doNothing = function(e) {
    e.stopPropagation();
    return false;
};

Melown.Inspector.prototype.onMapUpdate = function(string_) {
    var map_ = this.core_.getMapInterface();
    if (!map_) {
        return;
    }

    if (this.shakeCamera_) {
        map_.redraw();
    } 

    if (this.drawReplayGlobe_) {
        var renderer_ = this.core_.getRenderer();
        var p_ = map_.convertCoordsFromPhysToCameraSpace([0,0,0]);
        renderer_.drawTBall(p_, 12742000 * 0.5, renderer_.progStardome_, this.replayGlobeTexture_, 12742000 * 0.5, true);
    }

    if (this.drawReplayCamera_) {
        var renderer_ = this.core_.getRendererInterface();

        var slines_ = []; 
        for (var i = 0, li = this.replayCameraLines_.length; i < li; i++) {
            slines_.push(map_.convertCoordsFromPhysToCanvas(this.replayCameraLines_[i]));
        }
        
        renderer_.drawLineString({
            "points" : slines_,
            "size" : 2.0,
            "color" : [0,128,255,255],
            "depth-test" : false,
            "blend" : false
            });            

        for (var i = 0, li = this.replayCameraLines3_.length; i < li; i++) {
            var slines_ = []; 
            for (var j = 0, lj = this.replayCameraLines3_[i].length; j < lj; j++) {
                slines_.push(map_.convertCoordsFromPhysToCanvas(this.replayCameraLines3_[i][j]));
            }

            renderer_.drawLineString({
                "points" : slines_,
                "size" : 2.0,
                "color" : [0,255,128,255],
                "depth-test" : false,
                "blend" : false
                });   
        }


        for (var i = 0, li = this.replayCameraLines2_.length; i < li; i++) {
            var slines_ = []; 
            for (var j = 0, lj = this.replayCameraLines2_[i].length; j < lj; j++) {
                slines_.push(map_.convertCoordsFromPhysToCanvas(this.replayCameraLines2_[i][j]));
            }

            renderer_.drawLineString({
                "points" : slines_,
                "size" : 2.0,
                "color" : [0,255,255,255],
                "depth-test" : false,
                "blend" : false
                });   
        }


        var cameInfo = map_.getCameraInfo();
        var p1_ = map_.convertCoordsFromPhysToCameraSpace(this.replayCameraLines_[0]);

        var map2_ = this.core_.getMap();
    
        //var m2_ = map2_.camera_.getRotationviewMatrix();
        var mv_ = Melown.mat4.create(this.replayCameraMatrix_);
        //Melown.mat4.inverse(m2_, mv_);
    
        //matrix which tranforms mesh position and scale
        /*
        var mv_ = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            p1_[0], p1_[1], p1_[2], 1
        ];*/
        mv_[12] = p1_[0];
        mv_[13] = p1_[1];
        mv_[14] = p1_[2];
    
        //setup material 
        var material_ = [ 
            255,128,128, 0, //ambient,
            0,0,0,0, //diffuse
            0,0,0,0, //specular 
            0,0.5,0,0 //shininess, alpha,0,0
        ];
    
        //multiply cube matrix with camera view matrix
        Melown.Math.mat4Multiply(cameInfo["view-matrix"], mv_, mv_);
    
        var norm_ = [
            0,0,0,
            0,0,0,
            0,0,0
        ];
    
        //normal transformation matrix
        Melown.mat4.toInverseMat3(mv_, norm_);
    
        renderer_.setState(this.replayFrustumState_);
    
        //draw cube
        renderer_.drawMesh({
                "mesh" : this.replayFrustumMesh_,
                "texture" : null,
                "shader" : "shaded",
                "shader-variables" : {
                    "uMV" : ["mat4", mv_],
                    "uNorm" : ["mat3", norm_],
                    "uMaterial" : ["mat4", material_]
                }
            });
    }
    
    if (this.drawRadar_ && this.circleTexture_) {
        var renderer_ = this.core_.getRendererInterface();
        var pos_ = map_.getPosition();
        var count_ = 16;
        var step_ = map_.getPositionViewExtent(pos_) / (count_ * 4);

        var cbuffer_ = new Array(count_ * count_);

/*        
        var coords_ = map_.getPositionCoords(pos_);

        for (var j = 0; j < count_; j++) {
            for (var i = 0; i < count_; i++) {
                var screenCoords_ = map_.convertCoordsFromNavToCanvas([coords_[0] + i*step_ - count_*0.5*step_,
                                                                       coords_[1] + j*step_ - count_*0.5*step_, 0], "float", this.radarLod_);
        
                cbuffer_[j * count_ + i] = screenCoords_;
            }            
        }
*/


        for (var j = 0; j < count_; j++) {
            for (var i = 0; i < count_; i++) {
                var dx_ =  i*step_ - count_*0.5*step_;
                var dy_ =  j*step_ - count_*0.5*step_;
                var a = Math.atan2(dy_, dx_);
                var l = Math.sqrt(dx_*dx_ + dy_*dy_);

                var pos2_ = map_.movePositionCoordsTo(pos_, Melown.degrees(a), l);
                var coords_ = map_.getPositionCoords(pos2_);
                
                var screenCoords_ = map_.convertCoordsFromNavToCanvas([coords_[0], coords_[1], 0], "float", this.radarLod_);

                cbuffer_[j * count_ + i] = screenCoords_;
            }            
        }


        var lbuffer_ = new Array(count_);

        for (var j = 0; j < count_; j++) {
            for (var i = 0; i < count_; i++) {
                lbuffer_[i] =  cbuffer_[j * count_ + i];
            }
            
            renderer_.drawLineString({
                "points" : lbuffer_,
                "size" : 2.0,
                "color" : [0,255,255,255],
                "depth-test" : false,
                "blend" : false
                });            
        }


        for (var i = 0; i < count_; i++) {
            for (var j = 0; j < count_; j++) {
                lbuffer_[j] =  cbuffer_[j * count_ + i];
            }
            
            renderer_.drawLineString({
                "points" : lbuffer_,
                "size" : 2.0,
                "color" : [0,255,255,255],
                "depth-test" : false,
                "blend" : false
                });            
        }

        for (var i = 0, li = cbuffer_.length; i < li; i++) {
            var p = cbuffer_[i];
            renderer_.drawImage({
                "rect" : [p[0]-10, p[1]-10, 20, 20],
                "texture" : this.circleTexture_,
                "color" : [255,0,255,255],
                "depth" : p[2],
                "depth-test" : false,
                "blend" : true
                });
        }
        
    }
};
