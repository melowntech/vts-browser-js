
/**
 * @constructor
 */
Melown.MapPosition = function(map_, pos_) {
    this.map_ = map_;
    if (pos_ instanceof Melown.MapPosition) {
        this.pos_ = pos_.pos_.slice();
    } else {
        if (!(pos_ != null && (pos_ instanceof Array))) {
            this.pos_ = [];
        } else {
            this.pos_ = pos_.slice();
        }

        this.validate();
    }
};

Melown.MapPosition.prototype.clone = function() {
    return new Melown.MapPosition(this.map_, this.pos_);
};

Melown.MapPosition.prototype.getCoords = function() {
    return [this.pos_[1], this.pos_[2], this.pos_[4]];
};

Melown.MapPosition.prototype.getCoords2 = function() {
    return [this.pos_[1], this.pos_[2]];
};

Melown.MapPosition.prototype.setCoords = function(coords_) {
    this.pos_[1] = coords_[0];
    this.pos_[2] = coords_[1];
    this.pos_[4] = coords_[2];
    return this;
};

Melown.MapPosition.prototype.setCoords2 = function(coords_) {
    this.pos_[1] = coords_[0];
    this.pos_[2] = coords_[1];
    return this;
};

Melown.MapPosition.prototype.getHeight = function() {
    return this.pos_[4];
};

Melown.MapPosition.prototype.setHeight = function(height_) {
    this.pos_[4] = height_;
    return this;
};

Melown.MapPosition.prototype.getOrientation = function() {
    return [this.pos_[5], this.pos_[6], this.pos_[7]];
};

Melown.MapPosition.prototype.setOrientation = function(orientation_) {
    this.pos_[5] = orientation_[0];
    this.pos_[6] = orientation_[1];
    this.pos_[7] = orientation_[2];
    return this;
};

Melown.MapPosition.prototype.getFov = function() {
    return this.pos_[9];
};

Melown.MapPosition.prototype.setFov = function(fov_) {
    this.pos_[9] = fov_;
    return this;
};

Melown.MapPosition.prototype.getViewExtent = function() {
    return this.pos_[8];
};

Melown.MapPosition.prototype.setViewExtent = function(extent_) {
    this.pos_[8] = extent_;
    return this;
};

Melown.MapPosition.prototype.getViewDistance = function() {
    return (this.getViewExtent()*0.5) / Math.tan(Melown.radians(this.getFov()*0.5));
};

Melown.MapPosition.prototype.getViewMode = function() {
    return this.pos_[0];
};

Melown.MapPosition.prototype.getHeightMode = function() {
    return this.pos_[3];
};

Melown.MapPosition.prototype.check = function(mode_) {
    //check pich
    if (this.getViewMode() == "obj") {
        this.pos_[6] = Melown.clamp(this.pos_[6], -90.0, 90.0);
    } else {
        this.pos_[6] = Melown.clamp(this.pos_[6], -90.0, 90.0);
    }

    this.pos_[5] = this.pos_[5] % 360;
    this.pos_[7] = this.pos_[7] % 360;
};

Melown.MapPosition.prototype.moveCoordsTo = function(azimuth_, distance_, azimuthCorrectionFactor_) {
    var coords_ = this.getCoords();
    var navigationSrsInfo_ = this.map_.getNavigationSrs().getSrsInfo();
    azimuthCorrectionFactor_ = (azimuthCorrectionFactor_ == null) ? 1 : azimuthCorrectionFactor_; 

    if (this.map_.getNavigationSrs().isProjected()) {
        var yaw_ = Melown.radians(azimuth_);
        var forward_ = [-Math.sin(yaw_), Math.cos(yaw_)];

        this.setCoords2([coords_[0] + (forward_[0]*distance_),
                         coords_[1] + (forward_[1]*distance_)]);
    } else {
        var navigationSrsInfo_ = this.map_.getNavigationSrs().getSrsInfo();

        var geod = new GeographicLib["Geodesic"]["Geodesic"](navigationSrsInfo_["a"],
                                                       (navigationSrsInfo_["a"] / navigationSrsInfo_["b"]) - 1.0);

        var r = geod["Direct"](coords_[1], coords_[0], azimuth_, distance_);
        this.setCoords2([r["lon2"], r["lat2"]]);

        var orientation_ = this.getOrientation();

        //console.log("corerction_: " + (r.azi1 - r.azi2));

        orientation_[0] += (r["azi1"] - r["azi2"]) * azimuthCorrectionFactor_;
        //orientation_[0] -= (r.azi1 - r.azi2); 

        //if (!skipOrientation_) {
            this.setOrientation(orientation_);
        //}
        
        //console.log("azimuthCorrection: " + azimuthCorrectionFactor_);
        //console.log("oldpos: " + JSON.stringify(this));
        //console.log("newpos: " + JSON.stringify(pos2_));
    }
    
    return this;
};

Melown.MapPosition.prototype.convertViewMode = function(mode_) {
    if (mode_ == this.pos_[0]) {
        return this;
    }

    if (mode_ == "obj") {
        if (this.getHeightMode() == "float") {
            var covertToFloat_ = true;
            this.convertHeightMode("fix", true);
        }
        
        var distance_ = this.getViewDistance();
        var orientation_ = this.getOrientation();
        
        //get height delta
        var pich_ = Melown.radians(-orientation_[1]);
        var heightDelta_ = distance_ * Math.sin(pich_);

        //reduce distance by pich
        distance_ *= Math.cos(pich_);

        if (this.map_.getNavigationSrs().isProjected()) {
            //get forward vector
            var yaw_ = Melown.radians(orientation_[0]);
            var forward_ = [-Math.sin(yaw_), Math.cos(yaw_)];
    
            //get center coords 
            var coords_ = this.getCoords();
            coords_[0] = coords_[0] + (forward_[0] * distance_);
            coords_[1] = coords_[1] + (forward_[1] * distance_);
        } else {
            this.moveCoordsTo(-orientation_[0], distance_);
            var coords_ = this.getCoords();
        }
        
        coords_[2] -= heightDelta_;
        this.setCoords(coords_);

        if (covertToFloat_) {
            this.convertHeightMode("float", true);
        }
        
    } else if (mode_ == "subj") {
        var coords_ = this.getCameraCoords(this.getHeightMode());
        this.setCoords(coords_);
                
        //TODO: take in accout planet ellipsoid
    }

    this.pos_[0] = mode_;

    return this;
};

Melown.MapPosition.prototype.convertHeightMode = function(mode_, noPrecisionCheck_) {
    if (this.pos_[3] == mode_) {
        return this;
    }

    var lod_ =  this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
    var height_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);

    if (height_[1] == false && !noPrecisionCheck_) {
        //return null;
    }

    //set new height
    if (mode_ == "float") {
        this.pos_[3] = mode_;
        this.pos_[4] = this.pos_[4] - height_[0];
    } else if (mode_ == "fix") {
        this.pos_[3] = mode_;
        this.pos_[4] = this.pos_[4] + height_[0];
    }

    return this;
};


Melown.MapPosition.prototype.convertSrs = function(sourceSrs_, destinationSrs_) {
};

Melown.MapPosition.prototype.convertSrs2 = function(sourceSrs_, destinationSrs_) {
};

Melown.MapPosition.prototype.isDifferent = function(pos_) {
    var pos_ = pos_.pos_;
    return !(this.pos_[0] == pos_[0] &&
             Melown.isEqual(this.pos_[1], pos_[1], 0.0000001) &&
             Melown.isEqual(this.pos_[2], pos_[2], 0.0000001) &&
             this.pos_[3] == pos_[3] &&
             Melown.isEqual(this.pos_[4], pos_[4], 0.001) &&
             Melown.isEqual(this.pos_[5], pos_[5], 0.001) &&
             Melown.isEqual(this.pos_[6], pos_[6], 0.001) &&
             Melown.isEqual(this.pos_[7], pos_[7], 0.001) &&
             Melown.isEqual(this.pos_[8], pos_[8], 0.001) &&
             Melown.isEqual(this.pos_[9], pos_[9], 0.001));
};

Melown.MapPosition.prototype.validate = function() {
    var pos_ = this.pos_;
    if (pos_[0] == "fixed") { //old format
        pos_[0] = "obj";
        pos_[9] = pos_[8];
        pos_[8] = pos_[7];
        pos_[7] = pos_[6];
        pos_[6] = pos_[5];
        pos_[5] = pos_[4];
        pos_[4] = pos_[3];
        pos_[3] = "fix";
    }

    pos_[0] = (pos_[0] == "obj" || pos_[0] == "subj") ? pos_[0] : "obj";
    pos_[1] = (pos_[1] != null) ? pos_[1] : 0;
    pos_[2] = (pos_[2] != null) ? pos_[2] : 0;
    pos_[3] = (pos_[3] == "fix" || pos_[3] == "fixed" || pos_[3] == "float") ? pos_[3] : "float";
    pos_[4] = (pos_[4] != null) ? pos_[4] : 0;
    pos_[5] = (pos_[5] != null) ? pos_[5] : 0;
    pos_[6] = (pos_[6] != null) ? pos_[6] : -90;
    pos_[7] = (pos_[7] != null) ? pos_[7] : 0;
    pos_[8] = (pos_[8] != null) ? pos_[8] : 900;
    pos_[9] = (pos_[9] != null) ? pos_[9] : 55;

    pos_[3] = (pos_[3] == "fixed") ? "fix" : pos_[3];
};

Melown.MapPosition.prototype.getCameraCoords = function(heightMode_) {
    var orientation_ = this.getOrientation();
    var rotMatrix_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(orientation_[0])), Melown.rotationMatrix(0, Melown.radians(orientation_[1])), rotMatrix_);

    if (this.getViewMode() == "obj") {
      
        var coords_ = this.getCoords();
        var terrainHeight_ = 0;
        var lod_ = -1;

        //convert height to fix
        if (this.getHeightMode() == "float") {
            lod_ = this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
            var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
            terrainHeight_ = surfaceHeight_[0];
        }

        var camInfo_ = this.getCameraInfo(this.map_.getNavigationSrs().isProjected());

        if (this.map_.getNavigationSrs().isProjected()) {
            //var distance_ = (this.getViewExtent()) / Math.tan(Melown.radians(this.getFov()*0.5));
            //var orbitPos_ = [0, -distance_, 0];
            //Melown.mat4.multiplyVec3(rotMatrix_, orbitPos_);

            coords_[0] += camInfo_.orbitCoords_[0];
            coords_[1] += camInfo_.orbitCoords_[1];
            coords_[2] += camInfo_.orbitCoords_[2] + terrainHeight_;
        } else {
            var worldPos_ = this.map_.convertCoords([coords_[0], coords_[1], coords_[2] + terrainHeight_], "navigation", "physical");
            worldPos_[0] += camInfo_.orbitCoords_[0];
            worldPos_[1] += camInfo_.orbitCoords_[1];
            worldPos_[2] += camInfo_.orbitCoords_[2];// + terrainHeight_;

            coords_ = this.map_.convertCoords(worldPos_, "physical", "navigation");
        }


        if (heightMode_ == "fix") {
            return coords_;
        } else {
            //get float height for new coords
            if (lod_ == -1) {
                lod_ =  this.map_.getOptimalHeightLod(coords_, this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
            }
            
            var surfaceHeight_ = this.map_.getSurfaceHeight(coords_, lod_);
            coords_[2] -= surfaceHeight_[0];

            return coords_;
        }

    } else {

        if (this.getHeightMode() == heightMode_) {
            return this.getCoords();
        } else {
            var lod_ =  this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
            var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
            //height_ += surfaceHeight_[0];

            var coords_ = this.getCoords();

            if (heightMode_ == "fix") {
                coords_[2] += surfaceHeight_[0];
            } else {
                coords_[2] -= surfaceHeight_[0];
            }

            return coords_;
        }
    }
};

Melown.MapPosition.prototype.getPhysCoords = function(lod_) {
    var coords_ = this.getCoords();

    if (this.getHeightMode() == "float") {
        lod_ =  (lod_ != null) ? lod_ : this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
        var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
        coords_[2] += surfaceHeight_[0]; 
    }

    return this.map_.convertCoords(coords_, "navigation", "physical");
};

Melown.MapPosition.prototype.getCameraSpaceCoords = function(lod_) {
    var coords_ = this.getCoords();

    if (this.getHeightMode() == "float") {
        lod_ =  (lod_ != null) ? lod_ : this.map_.getOptimalHeightLod(this.getCoords(), this.getViewExtent(), this.map_.config_.mapNavSamplesPerViewExtent_);
        var surfaceHeight_ = this.map_.getSurfaceHeight(this.getCoords(), lod_);
        coords_[2] += surfaceHeight_[0]; 
    }

    var worldPos_ = this.map_.convertCoords(coords_, "navigation", "physical");
    var camPos_ = this.map_.cameraPosition_;
    worldPos_[0] -= camPos_[0];
    worldPos_[1] -= camPos_[1];
    worldPos_[2] -= camPos_[2];
  
    return worldPos_;
};

Melown.MapPosition.prototype.getCanvasCoords = function(lod_, physical_) {
    if (physical_) {
        var camPos_ = this.map_.cameraPosition_;
        var coords_ = this.getCoords();
        var worldPos_ = [coords_[0] - camPos_[0],
                         coords_[1] - camPos_[1],
                         coords_[2] - camPos_[2]];
    } else {
        var worldPos_ = this.getCameraSpaceCoords(lod_);
    }
    
	return this.map_.renderer_.project2(worldPos_, this.map_.camera_.getMvpMatrix());
};


Melown.MapPosition.prototype.getNED = function() {
    var pos_ = this.clone();
    var coords_ = pos_.getCoords();
    coords_[2] = 0;
    var centerCoords_ = this.map_.convertCoords(coords_, "navigation", "physical");

    if (this.map_.getNavigationSrs().isProjected()) {
        var upCoords_ = this.map_.convertCoords([coords_[0], coords_[1] + 100, coords_[2]], "navigation", "physical");
        var rightCoords_ = this.map_.convertCoords([coords_[0] + 100, coords_[1], coords_[2]], "navigation", "physical");
    } else {
        var cy = (coords_[1] + 90) - 0.0001;
        var cx = (coords_[0] + 180) + 0.0001;

        if (cy < 0 || cx > 180) { //if we are out of bounds things start to be complicated
            var geodesic_ = this.map_.getGeodesic();
        
            var r = geodesic_["Direct"](coords_[1], coords_[0], 0, -100);
            var upPos_ = this.clone();
            upPos_.setCoords2([r["lon2"], r["lat2"]]);        
            var upCoords_ = this.map_.convertCoords(upPos_.getCoords(), "navigation", "physical");
    
            r = geodesic_["Direct"](coords_[1], coords_[0], 90, 100);
            var rightPos_ = this.clone();
            rightPos_.setCoords2([r["lon2"], r["lat2"]]);        
            var rightCoords_ = this.map_.convertCoords(rightPos_.getCoords(), "navigation", "physical");
        } else {
            // substraction instead of addition is probably case of complicated view matrix calculation
            var upCoords_ = this.map_.convertCoords([coords_[0], coords_[1] - 0.0001, coords_[2]], "navigation", "physical");
            var rightCoords_ = this.map_.convertCoords([coords_[0] + 0.0001, coords_[1], coords_[2]], "navigation", "physical");
        }
    }

    var up_ = [upCoords_[0] - centerCoords_[0],
               upCoords_[1] - centerCoords_[1],
               upCoords_[2] - centerCoords_[2]]; 

    var right_ = [rightCoords_[0] - centerCoords_[0],
                  rightCoords_[1] - centerCoords_[1],
                  rightCoords_[2] - centerCoords_[2]]; 

    var dir_ = [0,0,0];
    Melown.vec3.normalize(up_);
    Melown.vec3.normalize(right_);
    Melown.vec3.cross(up_, right_, dir_);
    Melown.vec3.normalize(dir_);
    
    return {
        east_  : right_, 
        direction_ : up_,
        north_ : dir_        
    };
};

Melown.MapPosition.prototype.getCameraInfo = function(projected_, clampTilt_) {
    var position_ = [0,0,0];
    var orientation_ = this.getOrientation();
    var distance_ = this.getViewDistance();
    
    if (clampTilt_) { //used for street labels
        orientation_[1] = Melown.clamp(orientation_[1], -89.0, 90.0);
    }
    
    var tmpMatrix_ = Melown.mat4.create();
    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(orientation_[0])), Melown.rotationMatrix(0, Melown.radians(orientation_[1])), tmpMatrix_);

    if (this.getViewMode() == "obj") {
        var orbitPos_ = [0, -distance_, 0];
        Melown.mat4.multiplyVec3(tmpMatrix_, orbitPos_);
    } else {
        var orbitPos_ = [0, 0, 0];
    }

    //this.cameraVector_ = [0, 0, 1];
    //Melown.mat4.multiplyVec3(this.updateCameraMatrix_, this.cameraVector_);

    var ret_ = {
        orbitCoords_ : null,
        distance_ : distance_,
        rotMatrix_ : null,
        vector_ : null,
        orbitHeight_ : orbitPos_[2]  
    };

    if (projected_) {
        
        tmpMatrix_ = Melown.mat4.create();
        Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians(-orientation_[1] - 90.0)), Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), tmpMatrix_);

        /*
        //get NED for latlon coordinates
        //http://www.mathworks.com/help/aeroblks/directioncosinematrixeceftoned.html
        var coords_ = this.position_.getCoords();
        var lon_ = Melown.radians(0);
        var lat_ = Melown.radians(89);

        //NED vectors for sphere
        var east_ = [-Math.sin(lat_)*Math.cos(lon_), -Math.sin(lat_)*Math.sin(lon_), Math.cos(lat_)];
        var direction_ = [-Math.sin(lon_), Math.cos(lon_), 0];
        var north_ = [-Math.cos(lat_)*Math.cos(lon_), -Math.cos(lat_)*Math.sin(lon_), -Math.sin(lat_)];
        //direction_ = [-direction_[0], -direction_[1], -direction_[2]];

        north_ = Melown.vec3.negate(north_);
        east_  = Melown.vec3.negate(east_);
        //direction_ = Melown.vec3.negate(direction_);
        */

        var ned_ = this.getNED();
        north_ = ned_.north_;
        east_  = ned_.east_;
        direction_ = ned_.direction_;

        var spaceMatrix_ = [
            east_[0], east_[1], east_[2], 0,
            direction_[0], direction_[1], direction_[2], 0,
            north_[0], north_[1], north_[2], 0,
            0, 0, 0, 1
        ];
        
        var east2_  = [1,0,0];
        var direction2_ = [0,1,0];
        var north2_ = [0,0,1];

        var dir_ = [1,0,0];
        var up_ = [0,0,-1];
        var right_ = [0,0,0];
        Melown.vec3.cross(dir_, up_, right_);

        //rotate vectors according to eulers
        Melown.mat4.multiplyVec3(tmpMatrix_, north2_);
        Melown.mat4.multiplyVec3(tmpMatrix_, east2_);
        Melown.mat4.multiplyVec3(tmpMatrix_, direction2_);

        Melown.mat4.multiplyVec3(tmpMatrix_, dir_);
        Melown.mat4.multiplyVec3(tmpMatrix_, up_);
        Melown.mat4.multiplyVec3(tmpMatrix_, right_);

        var t = 0;
        t = dir_[0]; dir_[0] = dir_[1]; dir_[1] = t;
        t = up_[0]; up_[0] = up_[1]; up_[1] = t;
        t = right_[0]; right_[0] = right_[1]; right_[1] = t;
        
        dir_[2] = -dir_[2];
        up_[2] = -up_[2];
        right_[2] = -right_[2];

        /*
        Melown.mat4.multiplyVec3(spaceMatrix_, north2_);
        Melown.mat4.multiplyVec3(spaceMatrix_, east2_);
        Melown.mat4.multiplyVec3(spaceMatrix_, direction2_);
        */

        //get rotation matrix
        var rotationMatrix_ = [
            east2_[0], east2_[1], east2_[2], 0,
            direction2_[0], direction2_[1], direction2_[2], 0,
            north2_[0], north2_[1], north2_[2], 0,
            0, 0, 0, 1
        ];

       // Melown.mat4.multiplyVec3(spaceMatrix_, orbitPos_);
/*
        //get rotation matrix
        var rotationMatrix_ = [
            east_[0], east_[1], east_[2], 0,
            direction_[0], direction_[1], direction_[2], 0,
            north_[0], north_[1], north_[2], 0,
            0, 0, 0, 1
        ];
*/
        ret_.vector_ = Melown.vec3.normalize([-orbitPos_[0], -orbitPos_[1], -orbitPos_[2]]); 
        ret_.vector2_ = ret_.vector_; //vector2 is probably hack for tree.js bboxVisible 
        
        ret_.orbitCoords_ = orbitPos_;
        ret_.rotMatrix_ = rotationMatrix_; 

    } else { //geographics

        //get NED for latlon coordinates
        //http://www.mathworks.com/help/aeroblks/directioncosinematrixeceftoned.html
/*        
        var coords_ = this.position_.getCoords();
        var lon_ = Melown.radians(coords_[0]);
        var lat_ = Melown.radians(coords_[1]);

        //NED vectors for sphere
        var east_ = [-Math.sin(lat_)*Math.cos(lon_), -Math.sin(lat_)*Math.sin(lon_), Math.cos(lat_)];
        var direction_ = [-Math.sin(lon_), Math.cos(lon_), 0];
        var north_ = [-Math.cos(lat_)*Math.cos(lon_), -Math.cos(lat_)*Math.sin(lon_), -Math.sin(lat_)];

        north_ = Melown.vec3.negate(north_);
        east_  = Melown.vec3.negate(east_);
        
        //get elipsoid factor
        var navigationSrsInfo_ = this.getNavigationSrs().getSrsInfo();
        var factor_ = navigationSrsInfo_["b"] / navigationSrsInfo_["a"];

        //flaten vectors
        north_[2] *= factor_;
        east_[2] *= factor_;
        direction_[2] *= factor_;

        //normalize vectors
        north_ = Melown.vec3.normalize(north_);
        east_  = Melown.vec3.normalize(east_);
        direction_ = Melown.vec3.normalize(direction_);
*/
        
        var ned_ = this.getNED();
        north_ = ned_.north_;
        east_  = ned_.east_;
        direction_ = ned_.direction_;
        

        var spaceMatrix_ = [
            east_[0], east_[1], east_[2], 0,
            direction_[0], direction_[1], direction_[2], 0,
            north_[0], north_[1], north_[2], 0,
            0, 0, 0, 1
        ];
        
        //spaceMatrix_ = Melown.mat4.inverse(spaceMatrix_);
        
        var localRotMatrix_ = Melown.mat4.create();
        Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians(-orientation_[1] - 90.0)), Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), localRotMatrix_);

        var east2_  = [1,0,0];
        var direction2_ = [0,1,0];
        var north2_ = [0,0,1];

        var coords_ = this.getCoords();
        var latlonMatrix_ = Melown.mat4.create();
        Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians((coords_[1] - 90.0))), Melown.rotationMatrix(2, Melown.radians((-coords_[0]-90))), latlonMatrix_);
//      Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians((coords_[0]-90))), Melown.rotationMatrix(0, Melown.radians((coords_[1] - 90.0))), latlonMatrix_);


        //Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians(0)), Melown.rotationMatrix(2, Melown.radians(-(coords_[0]+90))), latlonMatrix_);
        //Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians(0)), Melown.rotationMatrix(2, Melown.radians(0)), latlonMatrix_);

        //rotate vectors according to latlon
        Melown.mat4.multiplyVec3(latlonMatrix_, north2_);
        Melown.mat4.multiplyVec3(latlonMatrix_, east2_);
        Melown.mat4.multiplyVec3(latlonMatrix_, direction2_);


        var spaceMatrix_ = [
            east2_[0], east2_[1], east2_[2], 0,
            direction2_[0], direction2_[1], direction2_[2], 0,
            north2_[0], north2_[1], north2_[2], 0,
            0, 0, 0, 1
        ];

        var right_ = [1,0,0];
        var dir_ = [0,1,0];
        var up_ = [0,0,1];
        //Melown.vec3.cross(dir_, up_, right_);

        //rotate vectors according to eulers
        //Melown.mat4.multiplyVec3(this.updateCameraMatrix_, north2_);
        //Melown.mat4.multiplyVec3(this.updateCameraMatrix_, east2_);
        //Melown.mat4.multiplyVec3(this.updateCameraMatrix_, direction2_);

        Melown.mat4.multiplyVec3(spaceMatrix_, dir_);
        Melown.mat4.multiplyVec3(spaceMatrix_, up_);
        Melown.mat4.multiplyVec3(spaceMatrix_, right_);

        Melown.mat4.multiplyVec3(localRotMatrix_, right_);
        Melown.mat4.multiplyVec3(localRotMatrix_, dir_);
        Melown.mat4.multiplyVec3(localRotMatrix_, up_);
        
        //Melown.mat4.multiplyVec3(spaceMatrix_, north2_);
        //Melown.mat4.multiplyVec3(spaceMatrix_, east2_);
        //Melown.mat4.multiplyVec3(spaceMatrix_, direction2_);


        //get rotation matrix
/*        
        var rotationMatrix_ = [
            east2_[0], east2_[1], east2_[2], 0,
            direction2_[0], direction2_[1], direction2_[2], 0,
            north2_[0], north2_[1], north2_[2], 0,
            0, 0, 0, 1
        ];
*/        

        var rotationMatrix_ = [
            right_[0], right_[1], right_[2], 0,
            dir_[0], dir_[1], dir_[2], 0,
            up_[0], up_[1], up_[2], 0,
            0, 0, 0, 1
        ];

        //get orbit pos
        spaceMatrix_ = Melown.mat4.inverse(spaceMatrix_);
        Melown.mat4.multiplyVec3(spaceMatrix_, orbitPos_);

        ret_.vector2_ = [-spaceMatrix_[8], -spaceMatrix_[9], -spaceMatrix_[10]]; //vector2 is probably hack for tree.js bboxVisible 

        //var ray_ = this.map_.renderer_.getScreenRay(800,400);

        //get camera direction
        Melown.mat4.inverse(rotationMatrix_, spaceMatrix_);
        ret_.vector_ = [-spaceMatrix_[8], -spaceMatrix_[9], -spaceMatrix_[10]]; 
        
        //console.log("cam vec: " + JSON.stringify(this.cameraVector_));
         
        //this.position_.setHeight(0); !!!!!!!!!!!!!!!
    }

    ret_.orbitCoords_ = orbitPos_;
    ret_.rotMatrix_ = rotationMatrix_;
    return ret_; 
};

Melown.MapPosition.prototype.toString = function() {
    var p = this.pos_;
    return p[0] + ", " + p[1].toFixed(0) + ", " + p[2].toFixed(0) + ", " + p[3] + ", " + p[4].toFixed(0)
           + ", " + p[5].toFixed(0) + ", " + p[6].toFixed(0) + ", " + p[7].toFixed(0) + ", " 
           + ", " + p[8].toFixed(0) + ", " + p[9].toFixed(0); 
};



