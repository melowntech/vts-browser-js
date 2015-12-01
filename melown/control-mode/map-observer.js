var Melown.ControlMode.MapObserver = function(browser_) {

}

Melown.ControlMode.MapObserver.prototype.drag = function() {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getDragDelta();

    if (event_.getDragButton("left")) { //pan
        var sensitivity_ = 0.5;
        pos_ = map_.pan(pos_, delta_[0] * sensitivity_,
                              delta_[1] * sensitivity_);
    } else if (event_.getDragButton("right")) { //rotate
        var sensitivity_ = 0.4;
        pos_[5] -= delta_[0] * sensitivity_;
        pos_[6] -= delta_[1] * sensitivity_;
    }

    map_.setPosition(pos_);
}

Melown.ControlMode.MapObserver.prototype.wheel = function() {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getWheelDelta();

    var factor_ = 1.0 + (delta_ > 0 ? -1 : 1)*0.05;
    pos_[8] *= factor_;

    map_.setPosition(pos_);
}

Melown.ControlMode.MapObserver.prototype.tick = function() {
    
}

Melown.ControlMode.MapObserver.prototype.reset = function() {
    
}
