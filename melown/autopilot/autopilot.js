/**
 * @constructor
 */
Melown.Autopilot = function(browser_) {
    this.browser_ = browser_;
    this.trajectory_ = [];
    this.flightDuration_ = 1;
    this.flightTime_ = 0;
    this.trajectoryIndex_ = 0;
    this.finished_ = true;

    this.center_ = [0,0,0];
    this.orientation_ = [0,0,0];
    this.viewHeight_ = 0;
    this.fov_ = 90;
};

Melown.Autopilot.prototype.setTrajectory = function(trajectory_, duration_) {
    this.trajectory_ = trajectory_;
};

Melown.Autopilot.prototype.tick = function() {
    if (this.finished_ == true) {
        return;
    }

    //TODO:
};

