
/**
 * @constructor
 */
Melown.Inspector = function(core_) {
    this.core_ = core_;

    this.initStatsPanel();
    this.initGraphsPanel();
    this.initLayersPanel();

    //keyboard events
    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    
    this.core_.on("map-update", this.onMapUpdate.bind(this));
   
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
                "color" : [0,1,1,255],
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
                "color" : [0,1,1,255],
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
