/**
 * @constructor
 */
Melown.MapTrajectory = function(map_, p1_, p2_, options_) {
    this.map_ = map_;
    this.p1_ = p1_.clone();
    this.p2_ = p2_.clone();
    
    this.p1_.pos_[5] = this.p1_.pos_[5] < 0 ? (360 + (this.p1_.pos_[5] % 360)) : (this.p1_.pos_[5] % 360);  
    this.p2_.pos_[5] = this.p2_.pos_[5] < 0 ? (360 + (this.p2_.pos_[5] % 360)) : (this.p2_.pos_[5] % 360);  
    
    this.pp1_ = this.p1_.clone();
      
    //this.pp1_.convertHeightMode("fix", true);
    //this.pp2_.convertHeightMode("fix", true);
    //this.pp1_.convertViewMode("subj");
    //this.pp2_.convertViewMode("subj");

    this.mode_ = options_["mode"] || "auto";
    this.submode_ = "piha";//options_["submode"] || "none";
//    this.submode_ = "none";
    this.maxHeight_ = options_["maxHeight"] || 1000000000;
    this.maxDuration_ = options_["maxDuration"] || 10000;
    this.samplePeriod_ = options_["samplePeriod"] || 10;

    this.pv_ = options_["pv"] || 0.15;

    if (!this.map_.getNavigationSrs().isProjected()) {
        this.geodesic_ = this.map_.getGeodesic();
    } 
    
    if (options_["distanceAzimuth"]) {
        this.distanceAzimuth_ = true;
        
        this.pp2_ = this.p1_.clone();
        if (options_["destHeight"]) {
            this.pp2_.setHeight(options_["destHeight"]);
        }

        if (options_["destOrientation"]) {
            this.pp2_.setHeight(options_["destOrientation"]);
        }
        
        if (options_["destFov"]) {
            this.pp2_.setHeight(options_["destFov"]);
        }

        this.geoAzimuth_ = options_["azimuth"] || 0; 
        this.geoDistance_ = options_["distance"] || 100;
        this.distance_ = this.geoDistance_; 
        this.azimuth_ = this.geoAzimuth_ % 360;
        this.azimuth_ = (this.azimuth_ < 0) ? (360 + this.azimuth_) : this.azimuth_;

    } else {
        this.distanceAzimuth_ = false;
            
        this.pp2_ = this.p2_.clone();

        //get distance and azimut
        var res_ = this.map_.getDistance(this.pp1_.getCoords(), this.pp2_.getCoords());
        this.distance_ = res_[0];
        this.azimuth_ = (res_[1] - 90) % 360;
        this.azimuth_ = (this.azimuth_ < 0) ? (360 + this.azimuth_) : this.azimuth_;

        if (!this.map_.getNavigationSrs().isProjected()) {
            var res_ = this.geodesic_["Inverse"](this.pp1_.pos_[2], this.pp1_.pos_[1], this.pp2_.pos_[2], this.pp2_.pos_[1]);
            this.geoAzimuth_ = res_["azi1"]; 
            this.geoDistance_ = res_["s12"];
            this.azimuth_ = this.geoAzimuth_ % 360;
            this.azimuth_ = (this.azimuth_ < 0) ? (360 + this.azimuth_) : this.azimuth_;
        }

    }
    
    //console.log("azim: " + Math.round(this.azimuth_) + " p1: " + this.p1_.pos_[5]  + " p2: " + this.p2_.pos_[5]);

    
    this.detectMode();
    this.detectDuration();
    this.detectFlightHeight(options_["height"]);
};

Melown.MapTrajectory.prototype.detectFlightHeight = function(flightHeight_) {
    if (this.mode_ == "ballistic") {
        this.flightHeight_ = Math.max(this.pp1_.getHeight(), this.pp2_.getHeight());
        this.flightHeight_ += flightHeight_ || (this.distance_ * 0.5);
        this.flightHeight_ = Math.min(this.flightHeight_, this.maxHeight_);
        this.flightHeight_ -= Math.max(this.pp1_.getHeight(), this.pp2_.getHeight());
    }
};

Melown.MapTrajectory.prototype.detectMode = function() {
    if (this.mode_ == "auto") {
        this.mode_ = (this.distance_ > 2000) ? "ballistic" : "direct";
    }
};

Melown.MapTrajectory.prototype.detectDuration = function() {
    this.duration_ = 0;
    this.headingDuration_ = 1000;
    
    if (this.distance_ < 500) {
        this.duration_ = 1000;
    } else if (this.distance_ < 2000) {
        this.duration_ = 2000;
    } else {
        this.duration_ = this.distance_ / 100;

        if (this.duration_ < 300) {
            this.duration_ = 3000;
        } else {
            this.headingDuration_ = 1500;
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
    
    if (this.mode_ != "direct") {
        var minDuration_ = 3 * this.headingDuration_; 
        this.duration_ = Math.max(this.duration_, minDuration_);
        
        if (this.maxDuration_ < minDuration_) {
            this.duration_ = this.maxDuration_;
            this.headingDuration_ = this.maxDuration_ / 3;
        }   
    }    
    
    this.duration_ = Math.min(this.duration_, this.maxDuration_);
};
    
Melown.MapTrajectory.prototype.generate = function() {
    var samples_ = new Array(Math.ceil(this.duration_ / this.samplePeriod_)+(this.distanceAzimuth_?0:1));
    var index_ = 0;
    
    for (var time_ = 0; time_ <= this.duration_; time_ += this.samplePeriod_) {
        var factor_ = time_ / this.duration_;

        var p = this.pp1_.clone();
        
        if (this.mode_ == "direct") {
            p.setCoords(this.getInterpolatedCoords(factor_));
            p.setHeight(this.getInterpolatedHeight(factor_));
            
            var o1_ = this.pp1_.getOrientation(); 
            var o2_ = this.pp2_.getOrientation(); 

            p.setOrientation(this.getInterpolatedOrinetation(o1_, o2_, factor_));
            p.setFov(this.getInterpolatedFov(factor_));
            p.setViewExtent(this.getInterpolatedViewExtent(factor_));
            
            samples_[index_] = p.pos_;
            index_++;
        } else {

            //http://en.wikipedia.org/wiki/Smoothstep
            var x = factor_;
            factor_ =  x*x*(3 - 2*x);
            x = factor_;
            factor_ =  x*x*(3 - 2*x);

            //factor2 includes slow start and end of flight
            factor2_ =  this.getSmoothFactor(time_);
            
            if (this.submode_ == "piha") {
                
                var distanceFactor_ = (this.distance_ / this.duration_ * (time_ - this.duration_ / (2 * Math.PI) * Math.sin(2 * Math.PI / this.duration_ * time_))) / this.distance_;

                //var f = (time_ / this.duration_) * Math.PI * 2;
                //var distanceFactor_ = ((f - Math.sin(f)) / (2 * Math.PI));
                
                var pv_ = this.pv_;
                var h1_ = this.pp1_.getCoords()[2]; 
                var h2_ = this.pp2_.getCoords()[2]; 

                var height_ = this.distance_ / ((this.duration_*0.001) * pv_ * Math.tan(Melown.radians(this.pp1_.getFov()) * 0.5))
                              * (1 - Math.cos(2 * Math.PI * time_ / this.duration_))
                              + h1_ + (h2_ - h1_) * time_  / this.duration_;

                var coords_ = this.getInterpolatedCoords(distanceFactor_);

                p.setCoords(coords_);
                p.setHeight(height_);            
            } else {

                var coords_ = this.getInterpolatedCoords(factor2_);
    
                p.setCoords(coords_);
                p.setHeight(this.getSineHeight(factor_));            
            }
            
            if (coords_[3] != null) { //used for correction in planet mode
                this.azimuth_ = coords_[3];
            }

            p.setOrientation(this.getFlightOrienation(time_));
            p.setFov(this.getInterpolatedFov(factor_));
            p.setViewExtent(this.getInterpolatedViewExtent(factor_));
            
            //p.convertViewMode("subj");
            //console.log("pos: " + p.toString());

            samples_[index_] = p.pos_;
            samples_[index_] = p.pos_;
            index_++;
        }
    }
    
    if (!this.distanceAzimuth_) {
        samples_[index_] = this.p2_.clone().pos_;
    }

    //console.log("pos2: " + this.p2_.toString());

    return samples_;
};

Melown.MapTrajectory.prototype.getInterpolatedCoords = function(factor_) {
    var c1_ = this.pp1_.getCoords(); 
    var c2_ = this.pp2_.getCoords(); 

    if (!this.map_.getNavigationSrs().isProjected()) {
        var res_ = this.geodesic_["Direct"](c1_[1], c1_[0], this.geoAzimuth_, this.geoDistance_ * factor_);

        var azimut_ = res_["azi1"] - res_["azi2"];

        //var azimut_ = (azimut_ - 90) % 360;
        azimut_ = (this.azimuth_ < 0) ? (360 + azimut_) : azimut_;

        //azimut_ = this.azimuth_;


        return [ res_["lon2"], res_["lat2"],
                 c1_[2] + (c2_[2] - c1_[2]) * factor_, azimut_];

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

Melown.MapTrajectory.prototype.getInterpolatedViewExtent = function(factor_) {
    var v1_ = this.pp1_.getViewExtent(); 
    var v2_ = this.pp2_.getViewExtent(); 
    return v1_ + (v2_ - v1_) * factor_;
};

Melown.MapTrajectory.prototype.getInterpolatedHeight = function(factor_) {
    var h1_ = this.pp1_.getHeight(); 
    var h2_ = this.pp2_.getHeight(); 
    return h1_ + (h2_ - h1_) * factor_;
};

Melown.MapTrajectory.prototype.getSineHeight = function(factor_) {
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
    fo_[0] = this.azimuth_ % 360;

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




