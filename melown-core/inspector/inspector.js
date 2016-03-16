
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
    this.debugValue_ = 0;
};

Melown.Inspector.prototype.addStyle = function(string_) {
    var style_ = document.createElement('style');
    style_.type = 'text/css';
    style_.innerHTML = string_;
    document.getElementsByTagName('head')[0].appendChild(style_);
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
        var coords_ = map_.getPositionCoords(pos_);

        var cbuffer_ = new Array(count_ * count_);
        
        for (var j = 0; j < count_; j++) {
            for (var i = 0; i < count_; i++) {
                var screenCoords_ = map_.convertCoordsFromNavToCanvas([coords_[0] + i*step_ - count_*0.5*step_,
                                                                       coords_[1] + j*step_ - count_*0.5*step_, 0], "float");
        
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
                "rect" : [p[0]-12, p[1]-12, 24, 24],
                "texture" : this.circleTexture_,
                "color" : [255,0,255,255],
                "depth" : p[2],
                "depth-test" : false,
                "blend" : true
                });
        }
        
    }
};
