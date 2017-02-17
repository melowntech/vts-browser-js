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
    this["keyup"] = this.keyup;
    this["keydown"] = this.keydown;
    this["keypress"] = this.keypress;
    this["doubleclick"] = this.doubleclick;
    
    this.retinaFactor_ = 1.0 / Math.max(1.0,(window.devicePixelRatio || 1) - 1);
};

Melown.ControlMode.MapObserver.prototype.drag = function(event_) {
    var map_ = this.browser_.getMap();
    if (!map_) {
        return;
    }

    var pos_ = map_.getPosition();
    var coords_ = map_.getPositionCoords(pos_);
    var delta_ = event_.getDragDelta();
    var zoom_ = event_.getDragZoom(); 
    var touches_ = event_.getDragTouches(); 
    var azimuthDistance_ = this.getAzimuthAndDistance(delta_[0], delta_[1]);
    
    var modifierKey_ = (this.browser_.controlMode_.altKey_
               || this.browser_.controlMode_.shiftKey_
               || this.browser_.controlMode_.ctrlKey_);

    //event_.getTouchParameter("touchMode");


    if (touches_ == 2) {//} && /*event_.getDragButton("middle")*/ zoom_ != 0 && this.config_.zoomAllowed_) {
        if (map_.getPositionViewMode(pos_) != "obj") {
            return;
        }
        
        if (event_.getTouchParameter("touchMode") == "pan" && this.config_.rotationAllowed_) {
            var pan_ = event_.getTouchParameter("touchPanDelta");
            var sensitivity_ = this.config_.sensitivity_[1] * this.retinaFactor_;
            this.orientationDeltas_.push([-delta_[0] * sensitivity_, 
                                          -delta_[1] * sensitivity_, 0]);
            this.browser_.callListener("map-position-rotated", {});
        } else if (this.config_.zoomAllowed_) {
            var factor_ = 1.0 + (event_.getTouchParameter("touchDistanceDelta") > 1.0 ? -1 : 1)*0.01;
            this.viewExtentDeltas_.push(factor_);
            this.reduceFloatingHeight(0.8);
            this.browser_.callListener("map-position-zoomed", {});
        }
        
    } else if ((event_.getDragButton("left") && !modifierKey_)
        && this.config_.panAllowed_) { //pan
            
        if (map_.getPositionHeightMode(pos_) == "fix") {
            var pos2_ = map_.convertPositionHeightMode(pos_, "float", true);
            if (pos2_ != null) {
                pos_ = pos2_;
                this.setPosition(pos_);
            }
        } else {
            var sensitivity_ = this.config_.sensitivity_[0] * this.retinaFactor_;
            var fov_ = map_.getPositionFov(pos_);
            var fovCorrection_ = (fov_ > 0.01 && fov_ < 179) ? (1.0 / Math.tan(Melown.radians(fov_*0.5))) : 1.0;
            var azimuth_ = Melown.radians(azimuthDistance_[0]);
            var forward_ = [-Math.sin(azimuth_), //direction vector x
                            Math.cos(azimuth_), //direction vector y
                            azimuthDistance_[1] * fovCorrection_ * sensitivity_, azimuthDistance_[0], //distance and azimut
                            coords_[0], coords_[1]]; //coords
            
            this.coordsDeltas_.push(forward_);
            this.reduceFloatingHeight(0.9);
            this.browser_.callListener("map-position-panned", {});
        }
    } else if (((touches_ <= 1 && event_.getDragButton("right")) || event_.getDragButton("middle") || modifierKey_) 
               && this.config_.rotationAllowed_) { //rotate
                   
        var sensitivity_ = this.config_.sensitivity_[1] * this.retinaFactor_;
        this.orientationDeltas_.push([-delta_[0] * sensitivity_,
                                      -delta_[1] * sensitivity_, 0]);
        this.browser_.callListener("map-position-rotated", {});
    }
};

Melown.ControlMode.MapObserver.prototype.wheel = function(event_) {
    Melown.Utils.preventDefault(event_);    

    var map_ = this.browser_.getMap();
    if (!map_ || !this.config_.zoomAllowed_) { 
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getWheelDelta();
    var sensitivity_ = this.config_.sensitivity_[2];
    var factor_ = 1.0 + (delta_ > 0 ? -1 : 1)*sensitivity_;

    if (this.browser_.controlMode_.altKey_ &&
        this.browser_.controlMode_.shiftKey_ &&
        this.browser_.controlMode_.ctrlKey_) {
        var fov_ = Melown.clamp(map_.getPositionFov(pos_) * factor_, 1, 179);
        pos_ = map_.setPositionFov(pos_, fov_);
        map_.setPosition(pos_);
    } else {
        if (map_.getPositionViewMode(pos_) != "obj") {
            return;
        }
        
        this.viewExtentDeltas_.push(factor_);
        this.reduceFloatingHeight(0.8);
        this.browser_.callListener("map-position-zoomed", {});
    }
};

Melown.ControlMode.MapObserver.prototype.doubleclick = function(event_) {
    Melown.Utils.preventDefault(event_);    

    var map_ = this.browser_.getMap();
    if (!map_ || !this.config_.jumpAllowed_) {
        return;
    }

    if (this.browser_.controlMode_.altKey_ &&
        this.browser_.controlMode_.shiftKey_ &&
        this.browser_.controlMode_.ctrlKey_) {
        this.browser_.config_.minViewExtent_ = 0.5;        
        return;            
    }

    var coords_ = event_.getMouseCoords();

    //get hit coords with fixed height
    var mapCoords_ = map_.getHitCoords(coords_[0], coords_[1], "fix");
    
    if (mapCoords_) {
        var pos_ = map_.getPosition();
        pos_ = map_.setPositionCoords(pos_, mapCoords_);
        pos_ = map_.convertPositionHeightMode(pos_, "fix");
        pos_ = map_.setPositionHeight(pos_, mapCoords_[2]);
        //pos_ = map_.convertPositionHeightMode(pos_, "fix");
        //pos_ = map_.setPositionHeight(pos_, 0);
        
        this.browser_.autopilot_.flyTo(pos_, {"mode" : "direct", "maxDuration" : 2000 });
    }
};

Melown.ControlMode.MapObserver.prototype.keyup = function(event_) {
};

Melown.ControlMode.MapObserver.prototype.keydown = function(event_) {
};

Melown.ControlMode.MapObserver.prototype.keypress = function(event_) {
};

Melown.ControlMode.MapObserver.prototype.setPosition = function(pos_) {
    pos_ = Melown.constrainMapPosition(this.browser_, pos_);
    var map_ = this.browser_.getMap();
    map_.setPosition(pos_);
    //console.log(JSON.stringify(pos_));
};

Melown.ControlMode.MapObserver.prototype.reduceFloatingHeight = function(factor_) {
    var map_ = this.browser_.getMap();
    var pos_ = map_.getPosition();
    var coords_ = map_.getPositionCoords(pos_);
    
    if (map_.getPositionHeightMode(pos_) == "float" &&
        map_.getPositionViewMode(pos_) == "obj") {
        if (coords_[2] != 0) {
            coords_[2] *= factor_;

            if (Math.abs(coords_[2]) < 0.1) {
                coords_[2] = 0;
            }

            pos_ = map_.setPositionCoords(pos_, coords_);
            this.setPosition(pos_);
        }
    }
};

Melown.ControlMode.MapObserver.prototype.isNavigationSRSProjected = function() {
    var map_ = this.browser_.getMap();
    var rf_ = map_.getReferenceFrame();
    var srs_ = map_.getSrsInfo(rf_["navigationSrs"]);
    return (srs_) ? (srs_["type"] == "projected") : false; 
};

Melown.ControlMode.MapObserver.prototype.getAzimuthAndDistance = function(dx_, dy_) {
    var map_ = this.browser_.getMap();
    var pos_ = map_.getPosition();
    var viewExtent_ = map_.getPositionViewExtent(pos_);
    var fov_ = map_.getPositionFov(pos_)*0.5;

    //var sensitivity_ = 0.5;
    var zoomFactor_ = (((viewExtent_*0.5) * Math.tan(Melown.radians(fov_))) / 800);
    dx_ *= zoomFactor_;
    dy_ *= zoomFactor_;

    var distance_ = Math.sqrt(dx_*dx_ + dy_*dy_);    
    var azimuth_ = Melown.degrees(Math.atan2(dx_, dy_)) + map_.getPositionOrientation(pos_)[0]; 
    
    return [azimuth_, distance_];
};

Melown.ControlMode.MapObserver.prototype.tick = function(event_) {
    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var update_ = false;
    var inertia_ = this.config_.inertia_; //[0.83, 0.9, 0.7]; 
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
        if (this.config_.navigationMode_ == "free") { 
            var correction_ = map_.getPositionOrientation(pos_)[0];
            pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_);
            correction_ = map_.getPositionOrientation(pos_)[0] - correction_;
            
        } else { // "azimuthal" 

            var correction_ = map_.getPositionOrientation(pos_)[0];
            //pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_, true);
            
            
            //var correctionFactor_ = Math.min(5, Math.max(0, Math.abs(coords_[1]) - 75)) / 5;
            
            //pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_, (Math.abs(coords_[1]) < 70));
            pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_, (Math.abs(coords_[1]) < 75) ? 0 : 1);
            //pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_, correctionFactor_);

            correction_ = map_.getPositionOrientation(pos_)[0] - correction_;

            //if (Math.abs(coords_[1]) < 70) {

/*
            var orientation_ = map_.getPositionOrientation(pos_);
            //orientation_[0] *= 0.5  + 0.5 * (Math.max(0, orientation_[1] - 70) / 30);
            //pos_ = map_.setPositionOrientation(pos_, orientation_);
            
            if (Math.abs(coords_[1]) < 70) {
                if (!event_.draggingState_["dragging"]) {
                    orientation_[0] *= 0.5;
                    pos_ = map_.setPositionOrientation(pos_, orientation_);
                }
            }
            
*/

            /*
            var correction_ = 0; //HACK

            var coords_ = map_.getPositionCoords(pos_);
            
            var rf_ = map_.getReferenceFrame();
            var srs_ = map_.getSrsInfo(rf_["navigationSrs"]);
            
            fx_ = Melown.degrees((forward_[0] / (srs_["a"] * 2) * Math.PI) * Math.PI * 2) * 0.25;             
            fy_ = Melown.degrees((forward_[1] / (srs_["b"] * 2) * Math.PI) * Math.PI * 2) * 0.25;
            
            coords_[0] += fx_;    
            coords_[1] += fy_;
            
            if (Math.abs(coords_[1]) < 80) { || Math.abs(map_.getPositionOrientation(pos_)[0]) < 1) {
                //coords_[0] %= 180;
                //coords_[1] %= 90;
                pos_ = map_.setPositionCoords(pos_, coords_);
            } else {
                pos_ = map_.movePositionCoordsTo(pos_, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth_, distance_, true);
            }*/
        }
        
        

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
        // HACK
        pos_ = map_.setPositionOrientation(pos_, orientation_);
        update_ = true;
    }

    //process view extents deltas
    if (this.viewExtentDeltas_.length > 0) {
        var deltas_ = this.viewExtentDeltas_;
        var viewExtent_ = map_.getPositionViewExtent(pos_);
        
        //apply detals to current view extent    
        for (var i = 0; i < deltas_.length; i++) {
            viewExtent_ *= deltas_[i];
            deltas_[i] += (1 - deltas_[i]) * (1.0 - inertia_[2]);
            
            //remove zero deltas
            if (Math.abs(1 - deltas_[i]) < 0.001) {
                deltas_.splice(i, 1);
                i--;
            }
        }
        
        viewExtent_ = Math.max(1, viewExtent_);

        //apply final view extrent
        pos_ = map_.setPositionViewExtent(pos_, viewExtent_);
        update_ = true;
    }


    //set new position
    if (update_) {
        this.setPosition(pos_);    
        
            
    }
    
};

Melown.ControlMode.MapObserver.prototype.reset = function(config_) {
    this.coordsDeltas_ = [];
    this.orientationDeltas_ = [];
    this.viewExtentDeltas_ = [];
};


Melown.constrainMapPosition = function(browser_, pos_) {
    if (!browser_.config_.constrainCamera_) {
        return pos_;
    }

    var minVE_ = browser_.config_.minViewExtent_;
    var maxVE_ = browser_.config_.maxViewExtent_;

    var map_ = browser_.getMap();

    //clamp view extets
    var viewExtent_ = Melown.clamp(map_.getPositionViewExtent(pos_), minVE_, maxVE_); 
    pos_ = map_.setPositionViewExtent(pos_, viewExtent_);

    var distance_ = (map_.getPositionViewExtent(pos_)*0.5) / Math.tan(Melown.radians(map_.getPositionFov(pos_)*0.5));

    //reduce tilt whe you are far off the planet
    if (map_.getPositionViewMode(pos_) == "obj") {
        var rf_ = map_.getReferenceFrame();
        var srs_ = map_.getSrsInfo(rf_["navigationSrs"]);
        
        
        if (srs_["a"]) {
            var factor_ = Math.min(distance_ / (srs_["a"]*0.5), 1.0);
            var maxTilt_ = 20 + ((-90) - 20) * factor_; 
            var minTilt_ = -90; 
            
            var o = map_.getPositionOrientation(pos_);
            
            if (o[1] > maxTilt_) {
                o[1] = maxTilt_;
            }
    
            if (o[1] < minTilt_) {
                o[1] = minTilt_;
            }
    
            pos_ = map_.setPositionOrientation(pos_, o);
        }
    }

    //do not allow camera under terrain
    var camPos_ = map_.getPositionCameraCoords(pos_, "float");
    //var cameraConstrainDistance_ = 1;
    var cameraConstrainDistance_ = (minVE_*0.5) / Math.tan(Melown.radians(map_.getPositionFov(pos_)*0.5));
    cameraConstrainDistance_ *= 0.5; //divice by 2 to alow 45deg tilt in maximum zoom
    
    //var hmax_ = Math.max(Math.min(4000,cameraConstrainDistance_), (distance_ * Math.tan(Melown.radians(3.0))));
    //var hmax_ = Math.max(Math.min(4000,cameraConstrainDistance_), (distance_ * Math.tan(Melown.radians(3.0))));
    var hmax_ = Math.max(cameraConstrainDistance_, (distance_ * Math.tan(Melown.radians(3.0))));
    var cameraHeight_ = camPos_[2]; //this.cameraHeight() - this.cameraHeightOffset_ - this.cameraHeightOffset2_;

    if (cameraHeight_ < hmax_) {
        var o = map_.getPositionOrientation(pos_);

        var getFinalOrientation = (function(start_, end_, level_) {
            var value_ = (start_ + end_) * 0.5;

            if (level_ > 20) {
                return value_;
            } else {
                o[1] = value_;
                pos_ = map_.setPositionOrientation(pos_, o);

                if (map_.getPositionCameraCoords(pos_, "float")[2] < hmax_) {
                    return getFinalOrientation(start_, value_, level_+1);
                } else {
                    return getFinalOrientation(value_, end_, level_+1);
                }
            }

        });//.bind(this);

        o[1] = getFinalOrientation(-90, Math.min(-1, o[1]), 0);
        pos_ = map_.setPositionOrientation(pos_, o);
    }

    return pos_;
};


