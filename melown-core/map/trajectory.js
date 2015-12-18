/**
 * @constructor
 */
Melown.MapTrajectory = function(map_, p1_, p2_, options_) {
    this.map_ = map_;
    this.p1_ = p1_.clone();
    this.p2_ = p2_.clone();
    this.pp1_ = p1_.clone();
    this.pp2_ = p2_.clone();
      
    this.pp1_.convertHeightMode("fix", true);
    this.pp2_.convertHeightMode("fix", true);
    this.pp1_.convertViewMode("obj");
    this.pp2_.convertViewMode("obj");

    this.mode_ = options_["mode"] || "auto";
    this.maxHeight_ = options_["maxHeight"] || 100000;
    this.maxDuration_ = options_["maxDuration"] || 10000;
    this.sampleRate_ = options_["sampleRate"] || 100;

    //get distance and azimut
    var res_ = this.map_.getDistance(coords_, coords2_);
    this.distance_ = res_[0];
    this.azimut_ = res_[1];

    if (!this.getNavigationSrs().isProjected()) {
        this.geodesic_ = this.getGeodesic(); 
    }
    
    this.detectMode();
    this.detectDuration();
    this.detectFlightHeight(options_["height"]);
};

Melown.MapTrajectory.prototype.detectFlightHeight = function(flightHeight_) {
    if (this.mode_ == "fly") {
        this.flightHeight_ = Math.max(this.pp1_.getHeight(), this.pp2_.getHeight());
        this.flightHeight_ += flightHeight_ || (this.distance_ * 0.5);
        this.flightHeight_ = Math.min(this.flightHeight_, this.maxHeight_);
        this.flightHeight_ -= Math.max(this.pp1_.getHeight(), this.pp2_.getHeight());
    }
};

Melown.MapTrajectory.prototype.detectMode = function() {
    if (this.mode_ == "auto") {"
        this.mode_ = (this.distance_ > 2000) ? "fly" : "direct";
    }
};

Melown.MapTrajectory.prototype.detectDuration = function() {
    this.duration_ = 0;
    this.headingDuration_ = 1500;
    
    if (this.distance_ < 500) {
        this.duration_ = 1000;
    } else if (this.distance_ < 2000) {
        this.duration_ = 2000;
    } else {
        this.duration_ = this.distance_ / 100;
        this.headingDuration_ = 1500;

        if (this.duration_ < 300) {
             this.duration_ = 3000;
             this.headingDuration_ = 1000;
        }
        
        if (this.duration_ < 6000) {
             this.duration_ = 6000;
        }

        if (this.duration_ > 10000) {
             this.duration_ = 10000;
        }

        if (this.mode_ != "direct") {
            this.duration_ *= 1.8;
            this.headingDuration_ *= 1.8;
        }
    }
};
    
Melown.MapTrajectory.prototype.generate = function() {
    var samples_ = new Array(Math.ceil(duration_ / this.sampleRate_)+1);
    var index_ = 0;
    
    for (var time_ = 0; time <= this.duration_; time_ += this.sampleRate_) {
        var factor_ = time_ / this.duration_;

        var p = this.pp1_.clone();
        
        if (mode_ == "direct") {
            p.setCoords(this.getInterpolatedCoords(factor_));
            
            var o1_ = this.pp1_.getOrientation(); 
            var o2_ = this.pp2_.getOrientation(); 

            p.setOrientation(this.getInterpolatedOrinetation(o1_, o2_, factor_));
            p.setFov(this.getInterpolatedFov(factor_));
            
            samples_[index_] = p;
            index_++;
        } else {

            //factor2 includes slow start and end of flight
            factor2_ =  this.getSmoothFactor(time_);

            p.setCoords(this.getInterpolatedCoords(factor2_));
            p.setHeight(this.getSineHeight(factor_));            
            p.setOrientation(this.getFlightOrienation(time_));
            p.setFov(this.getInterpolatedFov(factor_));

            samples_[index_] = p;
            index_++;
        }
    }
    
    samples_[index_] = this.p2_.clone();

    return samples_;
};

Melown.MapTrajectory.prototype.getInterpolatedCoords = function(factor_) {
    var c1_ = this.pp1_.getCoords(); 
    var c2_ = this.pp2_.getCoords(); 

    if (!this.getNavigationSrs().isProjected()) {
        //this.geodesic_ = ; 
    } else {
        return [ c1_[0] + (c2_[0] - c1_[0]) * factor_,
                 c1_[1] + (c2_[1] - c1_[1]) * factor_,
                 c1_[2] + (c2_[2] - c1_[2]) * factor_ ];
    }
};

Melown.MapTrajectory.prototype.getInterpolatedOrinetation = function(o1_, o2_, factor_) {
    var od1_ = o2_[0] - o1_[0];
    var od2_ = o2_[1] - o1_[1];
    var od3_ = o2_[2] - o1_[2];

    if (Math.abs(od1_) > 180) {
        if (od1_ > 0) {
            od1_ = -(360 - od1_);
        } else {
            od1_ = 360 - Math.abs(od1_);
        }
    }

    return [ o1_[0] + od1_ * factor_,
             o1_[1] + od2_ * factor_,
             o1_[2] + od3_ * factor_ ];
};

Melown.MapTrajectory.prototype.getInterpolatedFov = function(factor_) {
    var f1_ = this.pp1_.getFov(); 
    var f2_ = this.pp2_.getFov(); 
    return f1_ + (f2_ - f1_) * factor_;
};

Melown.MapTrajectory.prototype.getSineHeight = function(height_, factor_) {
    var c1_ = this.pp1_.getCoords(); 
    var c2_ = this.pp2_.getCoords(); 

    return c1_[2] + (c2_[2] - c1_[2]) * factor_ +
           Math.sin(Math.PI * factor_) * this.flightHeight_;
};

Melown.MapTrajectory.prototype.getSmoothFactor = function(time_) {
    var x = 0;

    if (time_ < this.headingDuration_) {
        x = 0;
    } else if (time_ > (this.duration_ - this.headingDuration_)) {
        x = 1.0;
    } else {
        x = Math.min(1.0, (time_-this.headingDuration_) / (this.duration_ - this.headingDuration_*2));
    }

    x = x*x*(3 - 2*x);
    return x*x*(3 - 2*x);
};

Melown.MapTrajectory.prototype.getFlightOrienation = function(time_) {
    var o1_ = null;
    var o2_ = null;
    var fo_ = [0, -90, 0]; //flight orientation
    var factor_ = 0;

    //get fly direction angle
    fo_[0] = this.azimut_ % 360;

    if (fo_[0] < 0) {
        fo_[0] = 360 - Math.abs(fo_[0]);
    }

    if (time_ <= this.headingDuration_) { //start sequence
        factor_ = time_ / this.headingDuration_;
        o1_ = this.pp1_.getOrientation();
        o2_ = fo_;
    } else if (time_ >= this.duration_ - this.headingDuration_) { //end sequence
        factor_ = (time_ - (this.duration_ - this.headingDuration_)) / this.headingDuration_;
        o1_ = fo_;
        o2_ = this.pp2_.getOrientation();
    } else { //fly sequence
        factor_ = 0;
        o1_ = fo_;
        o2_ = fo_;
    }    
    
    return this.getInterpolatedOrinetation(o1_, o2_, factor_);
};




