/**
 * @constructor
 */
Melown.ControlMode.MapObserver = function(browser_) {
    this.browser_ = browser_;
    this.config_ = browser_.config_;
    
    this.coordsDeltas_ = [];
    this.orientationDeltas_ = [];
    this.viewExtentDeltas_ = [];

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
    var coords_ = map_.getPositionCoords(pos_);
    var delta_ = event_.getDragDelta();
    var azimuthDistance_ = this.getAzimuthAndDistance(delta_[0], delta_[1]);

    if (event_.getDragButton("left") && this.config_.panAllowed_) { //pan
        if (map_.getPositionHeightMode(pos_) == "fix") {
            var pos2_ = map_.convertPositionHeightMode(pos_, "float");
            if (pos2_ != null) {
                pos_ = pos2_;
            }
        } else {
            var azimuth_ = Melown.radians(azimuthDistance_[0]);
            var forward_ = [-Math.sin(azimuth_),
                            Math.cos(azimuth_),
                            azimuthDistance_[1], azimuthDistance_[0],
                            coords_[0], coords_[1]];
            
            this.coordsDeltas_.push(forward_);
            //this.coordsDeltas_[0] = forward_;
            //console.log("pan: " + JSON.stringify(azimuthDistance_));
        }
    } else if (event_.getDragButton("right") && this.config_.rotationAllowed_) { //rotate
        var sensitivity_ = 0.4;
        //pos_[5] -= delta_[0] * sensitivity_;
        //pos_[6] -= delta_[1] * sensitivity_;

        this.orientationDeltas_.push([-delta_[0] * sensitivity_,
                                      -delta_[1] * sensitivity_, 0]);
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
    //pos_[8] *= factor_;

    //map_.setPosition(pos_);
    
    this.viewExtentDeltas_.push(factor_);
};

Melown.ControlMode.MapObserver.prototype.isNavigationSRSProjected = function() {
    var map_ = this.browser_.getCore().getMap();
    var rf_ = map_.getReferenceFrame();
    var srs_ = map_.getSrsInfo(rf_["navigationSrs"]);
    return (srs_) ? (srs_["type"] == "projected") : false; 
};

Melown.ControlMode.MapObserver.prototype.getAzimuthAndDistance = function(dx_, dy_) {
    var map_ = this.browser_.getCore().getMap();
    var pos_ = map_.getPosition();
    var viewExtent_ = map_.getPositionViewExtent(pos_);
    var fov_ = map_.getPositionFov(pos_)*0.5;

    var sensitivity_ = 0.5;
    var zoomFactor_ = ((viewExtent_ * Math.tan(Melown.radians(fov_))) / 800) * sensitivity_;
    dx_ *= zoomFactor_;
    dy_ *= zoomFactor_;

    var distance_ = Math.sqrt(dx_*dx_ + dy_*dy_);    
    var azimuth_ = Melown.degrees(Math.atan2(dx_, dy_)) + map_.getPositionOrientation(pos_)[0]; 
    
    return [azimuth_, distance_];
};

Melown.ControlMode.MapObserver.prototype.tick = function(event_) {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var update_ = false;
    var inertia_ = [0.8, 0.8, 0.8]; 
    //var inertia_ = [0.95, 0.8, 0.8]; 
    //var inertia_ = [0, 0, 0]; 

    //process coords deltas
    if (this.coordsDeltas_.length > 0) {
        var deltas_ = this.coordsDeltas_;
        var forward_ = [0,0];
        var coords_ = map_.getPositionCoords(pos_);
        
        //get foward vector form coord deltas    
        for (var i = 0; i < deltas_.length; i++) {
            var delta_ = deltas_[i];

            var coords2_ = [delta_[4], delta_[5]];
            
            var azimuth_ = delta_[3];
            azimuth_ += 0;//map_.getAzimuthCorrection(coords2_, coords_);
            azimuth_ = Melown.radians(azimuth_);

            //console.log("correction: " + map_.getAzimuthCorrection(coords2_, coords_) + " coords2: " + JSON.stringify(coords2_) + " coords: " + JSON.stringify(coords_));


            forward_[0] += -Math.sin(azimuth_) * delta_[2];  
            forward_[1] += Math.cos(azimuth_) * delta_[2];


            /*
            forward_[0] += delta_[0] * delta_[2];  
            forward_[1] += delta_[1] * delta_[2];
            */
            delta_[2] *= inertia_[0];

            
            //remove zero deltas
            if (delta_[2] < 0.01) {
                deltas_.splice(i, 1);
                i--;
            }
        }
        
        var distance_ = Math.sqrt(forward_[0]*forward_[0] + forward_[1]*forward_[1]);
        var azimuth_ = Melown.degrees(Math.atan2(forward_[0], forward_[1]));
    
        //console.log("tick: " + azimuth_ + " " + distance_);

        //apply final azimuth and distance
        var correction_ = map_.getPositionOrientation(pos_)[0];
        pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_);
        correction_ = map_.getPositionOrientation(pos_)[0] - correction_;

        //console.log("correction2: " + correction_);

        for (var i = 0; i < deltas_.length; i++) {
            var delta_ = deltas_[i];
            delta_[3] += correction_; 
        }

        update_ = true;
    }

    //process coords deltas
    if (this.orientationDeltas_.length > 0) {
        var deltas_ = this.orientationDeltas_;
        var orientation_ = map_.getPositionOrientation(pos_);
        
        //apply detals to current orientation    
        for (var i = 0; i < deltas_.length; i++) {
            var delta_ = deltas_[i];
            orientation_[0] += delta_[0];  
            orientation_[1] += delta_[1];
            orientation_[2] += delta_[2];
            delta_[0] *= inertia_[1];
            delta_[1] *= inertia_[1];
            delta_[2] *= inertia_[1];
            
            //remove zero deltas
            if (delta_[0]*delta_[0] + delta_[1]*delta_[1] + delta_[2]*delta_[2] < 0.1) {
                deltas_.splice(i, 1);
                i--;
            }
        }

        //apply final orintation
        pos_ = map_.setPositionOrientation(pos_, orientation_);
        update_ = true;
    }

    //process view extents deltas
    if (this.viewExtentDeltas_.length > 0) {
        var deltas_ = this.viewExtentDeltas_;
        var viewExtent_ = map_.getPositionViewExtent(pos_);
        
        //apply detals to current orientation    
        for (var i = 0; i < deltas_.length; i++) {
            viewExtent_ *= deltas_[i];
            deltas_[i] += (1 - deltas_[i]) * (1.0 - inertia_[2]);
            
            //remove zero deltas
            if (Math.abs(1 - deltas_[i]) < 0.001) {
                deltas_.splice(i, 1);
                i--;
            }
        }

        //apply final orintation
        pos_ = map_.setPositionViewExtent(pos_, viewExtent_);
        update_ = true;
    }


    //set new position
    if (update_) {
        map_.setPosition(pos_);        
    }
    
};

Melown.ControlMode.MapObserver.prototype.reset = function(config_) {
    this.coordsDeltas_ = [];
    this.orientationDeltas_ = [];
    this.viewExtentDeltas_ = [];
};


