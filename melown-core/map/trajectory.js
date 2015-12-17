/**
 * @constructor
 */
Melown.MapTrajectory = function(map_.p1_, p2_, options_) {
    this.map_ = map_;
    this.p1_ = p1_.clone();
    this.p2_ = p2_.clone();
      
    this.p1_.convertHeightMode("fix", true);
    this.p2_.convertHeightMode("fix", true);

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
    var samples_ = [];     
    
    for (var time_ = 0; time <= duration_; time_ += sampleRate_) {
        
        if (mode_ == "direct") {
            var factor_ = time_ / this.timeTotal_;
            
            var p = this.p1_.clone();
            
            p.setCoords(this.getInterpolatedCoords(factor_));
            
            var o1_ = this.p1_.getOrientation(); 
            var o2_ = this.p2_.getOrientation(); 

            p.setOrientation(this.getInterpolatedOrinetation(o1_, o2_, factor_));
        } else {
            
            
        }
        
    }

    return samples_;
};

Melown.MapTrajectory.prototype.getInterpolatedCoords = function(factor_) {
    var c1_ = this.p1_.getCoords(); 
    var c2_ = this.p2_.getCoords(); 

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



