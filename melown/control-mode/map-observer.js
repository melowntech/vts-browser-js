/**
 * @constructor
 */
Melown.ControlMode.MapObserver = function(browser_) {
    this.browser_ = browser_;
    this.config_ = browser_.config_;

    this["drag"] = this.drag;
    this["wheel"] = this.wheel;
    this["tick"] = this.tick;
    this["reset"] = this.reset;
};

Melown.ControlMode.MapObserver.prototype.drag = function(event_) {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getDragDelta();

    if (event_.getDragButton("left") && this.config_.panAllowed_) { //pan
        if (map_.getPositionHeightMode(pos_) == "fix") {
            var pos2_ = map_.convertPositionHeightMode(pos_, "float");
            if (pos2_ != null) {
                pos_ = pos2_;
            }
        } else {
            var sensitivity_ = 0.5;
            pos_ = map_.pan(pos_, delta_[0] * sensitivity_,
                                  delta_[1] * sensitivity_);
        }
    } else if (event_.getDragButton("right") && this.config_.rotationAllowed_) { //rotate
        var sensitivity_ = 0.4;
        pos_[5] -= delta_[0] * sensitivity_;
        pos_[6] -= delta_[1] * sensitivity_;
    }

    map_.setPosition(pos_);
};

Melown.ControlMode.MapObserver.prototype.wheel = function(event_) {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null || !this.config_.zoomAllowed_) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getWheelDelta();

    var factor_ = 1.0 + (delta_ > 0 ? -1 : 1)*0.05;
    pos_[8] *= factor_;

    map_.setPosition(pos_);
};

Melown.ControlMode.MapObserver.prototype.tick = function(event_) {

};

Melown.ControlMode.MapObserver.prototype.reset = function(config_) {

};
