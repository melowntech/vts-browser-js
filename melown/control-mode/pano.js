var Melown.ControlMode.Pano = function(browser_) {
    this.config_ = null;
}

Melown.ControlMode.Pano.prototype.drag = function() {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getDragDelta();

    if (event_.getDragButton("right")) { //rotate
        var sensitivity_ = 0.4;
        pos_[5] -= delta_[0] * sensitivity_;
        pos_[6] -= delta_[1] * sensitivity_;
    }

    map_.setPosition(pos_);
}

Melown.ControlMode.Pano.prototype.wheel = function() {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getWheelDelta();

    var factor_ = (delta_ > 0 ? -1 : 1) * 1;
    pos_[9] = Melown.clamp(pos_[9] + factor_, 1, 179);

    map_.setPosition(pos_);
}

Melown.ControlMode.Pano.prototype.tick = function() {
    
}

Melown.ControlMode.Pano.prototype.reset = function(config_) {
    this.config_ = config_;
}
