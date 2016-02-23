/**
 * @constructor
 */
Melown.ControlMode.Pano = function(browser_) {
    this.browser_ = browser_;
    this.config_ = null;

    this.center_ = [0, 0];
    this.dragging_ = false;
    this.velocity_ = [0, 0];

    this.impulse_ = [0, 0];

    this["drag"] = this.drag;
    this["down"] = this.drag;
    this["up"] = this.drag;
    this["wheel"] = this.wheel;
    this["tick"] = this.tick;
    this["reset"] = this.reset;
    this["keyup"] = this.keyup;
    this["keydown"] = this.keydown;
    this["keypress"] = this.keypress;
};

Melown.ControlMode.Pano.prototype.drag = function(event_) {
    if (!this.dragging_) {
        return;
    }

    var mouse_ = event_.getMousePosition();
    var delta_ = [mouse_[0] - this.center_[0], mouse_[1] - this.center_[1]];
    var sensitivity_ = 0.008;
    this.velocity_[0] = delta_[0] * sensitivity_;
    this.velocity_[1] = delta_[1] * sensitivity_;

    this.impulse_[0] = delta_[0] * sensitivity_;
    this.impulse_[1] = delta_[1] * sensitivity_;
};

Melown.ControlMode.Pano.prototype.down = function(event_) {
    if (event_.getMouseButton() === 'left') {
        this.center_ = event_.getMousePosition();
        this.dragging_ = true;
    }
};

Melown.ControlMode.Pano.prototype.up = function(event_) {
    if (event_.getMouseButton() === 'left') {
        this.dragging_ = false;
    }
};

Melown.ControlMode.Pano.prototype.wheel = function(event_) {
    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getWheelDelta();

    var factor_ = (delta_ > 0 ? -1 : 1) * 1;
    pos_[9] = Melown.clamp(pos_[9] + factor_, 1, 179);

    map_.setPosition(pos_);
};

Melown.ControlMode.Pano.prototype.keyup = function(event_) {
};

Melown.ControlMode.Pano.prototype.keydown = function(event_) {
};

Melown.ControlMode.Pano.prototype.keypress = function(event_) {
};

Melown.ControlMode.Pano.prototype.tick = function(event_) {
    if (this.velocity_[0] == 0.0 && this.velocity_[1] == 0.0) {
        return;
    }

    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    pos_[5] -= this.velocity_[0];
    pos_[6] -= this.velocity_[1];
    map_.setPosition(pos_);

    // friction
    if (this.dragging_) {
        return;
    }
    var step_ = 0.9;
    var treshold_ = 0.0005;

    if (Math.abs(this.velocity_[0]) < treshold_) {
        this.velocity_[0] = 0.0;
    } else {
        this.velocity_[0] *= step_;
    }

    if (Math.abs(this.velocity_[1]) < treshold_) {
        this.velocity_[1] = 0.0;
    } else {
        this.velocity_[1] *= step_;
    }

};

Melown.ControlMode.Pano.prototype.reset = function(config_) {
    this.config_ = config_;
};
