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
    this.autoMovement_ = false;
    this.autoRotate_ = 0;
    this.autoPan_ = 0;
    this.autoPanAzimuth_ = 0;

    this.center_ = [0,0,0];
    this.orientation_ = [0,0,0];
    this.viewHeight_ = 0;
    this.fov_ = 90;
    this.lastTime_ = 0;
};

Melown.Autopilot.prototype.setAutorotate = function(speed_) {
    if (this.autoRotate_ != speed_) {
        this.browser_.callListener("autorotate-changed", { "autorotate" : speed_});
    }

    this.autoRotate_ = speed_;
};

Melown.Autopilot.prototype.getAutorotate = function() {
    return this.autoRotate_;
};

Melown.Autopilot.prototype.setAutopan = function(speed_, azimuth_) {
    this.autoPan_ = speed_;
    this.autoPanAzimuth_ = azimuth_;
};

Melown.Autopilot.prototype.getAutopan = function() {
    return [this.autoPan_, this.autoPanAzimuth_];
};

Melown.Autopilot.prototype.flyToDAH = function(distance_, azimuth_, height_, options_) {
    var map_ = this.browser_.getCore().getMap();
    if (!map_) {
        return;
    }
    
    options_ = options_ || {};
    
    var trajectory_ = map_.generatePIHTrajectory(map_.getPosition(), distance_, azimuth_, height_, options_);
    this.setTrajectory(trajectory_, options_["samplePeriod"] || 10, options_); 
};

Melown.Autopilot.prototype.flyTo = function(position_, options_) {
    var map_ = this.browser_.getCore().getMap();
    if (!map_) {
        return;
    }
    
    options_ = options_ || {};
    var trajectory_ = map_.generateTrajectory(map_.getPosition(), position_, options_);
    this.setTrajectory(trajectory_, options_["samplePeriod"] || 10, options_); 
};

Melown.Autopilot.prototype.flyTrajectory = function(trajectory_, sampleDuration_) {
    var options_ = {};
    this.setTrajectory(trajectory_, sampleDuration_ || 10, {});
};

Melown.Autopilot.prototype.cancelFlight = function() {
    this.browser_.getControlMode().setCurrentControlMode(this.lastControlMode_);
    this.finished_ = true;
};

Melown.Autopilot.prototype.setTrajectory = function(trajectory_, sampleDuration_, options_) {
    if (trajectory_ == null || trajectory_.length == 0) {
        return;
    }

    this.setAutorotate(0);
    this.setAutopan(0,0);

    this.speed_ = options_["speed"] || 1.0;
    if (this.finished_) {
        this.lastControlMode_ = this.browser_.getControlMode().getCurrentControlMode(); 
    }
    this.browser_.getControlMode().setCurrentControlMode("disabled");

    this.trajectory_ = trajectory_;
    this.sampleDuration_ = sampleDuration_;
    //this.
    
    this.browser_.callListener("fly-start", { "startPosition" : this.trajectory_[0],
                                              "endPosition" : this.trajectory_[this.trajectory_.length - 1],
                                              "options" : options_
                                             });
    
    this.timeStart_ = performance.now();
    this.finished_ = false;
};

Melown.Autopilot.prototype.tick = function() {
    var map_ = this.browser_.getMap();
    if (!map_) {
        return;
    }

    var time_ = performance.now();
    var timeFactor_ =  (time_ - this.lastTime_) / 1000; 
    this.lastTime_ = time_;

    if (this.autoRotate_ != 0) {
        var pos_ = map_.getPosition();
        var o = map_.getPositionOrientation(pos_);
        o[0] = (o[0] + this.autoRotate_*timeFactor_) % 360;
        pos_ = map_.setPositionOrientation(pos_, o);
        map_.setPosition(pos_);
    }
    
    if (this.autoPan_ != 0) {
        var pos_ = map_.getPosition();
        pos_ = map_.movePositionCoordsTo(pos_, this.autoPanAzimuth_, map_.getPositionViewExtent(pos_)*(this.autoPan_*0.01)*timeFactor_, 0);
        map_.setPosition(pos_);
    }


    if (this.finished_ || !this.trajectory_) {
        return;
    }
    
    time_ = time_ - this.timeStart_;
    var sampleIndex_ =  Math.floor((time_ / this.sampleDuration_)*this.speed_);
    var totalSamples_ = this.trajectory_.length - 1; 

    if (sampleIndex_ < totalSamples_) {
        //interpolate
        map_.setPosition(this.trajectory_[sampleIndex_]);        
        //console.log(JSON.stringify(this.trajectory_[sampleIndex_]));

        this.browser_.callListener("fly-progress", { "position" : this.trajectory_[sampleIndex_],
                                                     "progress" : 100 * (sampleIndex_ / totalSamples_)
                                                    });

    } else {
        map_.setPosition(this.trajectory_[totalSamples_]);
        //console.log(JSON.stringify(this.trajectory_[totalSamples_]));
    } 
    
    if (sampleIndex_ >= this.trajectory_.length) {
        this.browser_.callListener("fly-end", { "position" : this.trajectory_[totalSamples_] });

        this.browser_.getControlMode().setCurrentControlMode(this.lastControlMode_);
        this.finished_ = true;
    } 
};

