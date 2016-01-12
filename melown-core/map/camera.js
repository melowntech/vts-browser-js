
Melown.Map.prototype.updateCamera = function() {
    var controlMode_ = "observer";
    var position_ = [0,0,0];
    var orientation_ = this.position_.getOrientation();

    this.updateCameraMatrix_ = Melown.mat4.create();

    //check position orientaion ...
    this.position_.check();

    //get camera distance
    this.cameraDistance_ = this.position_.getViewDistance();
    this.cameraDistance_ = Melown.clamp(this.cameraDistance_, 0.1, this.camera_.getFar());


    Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(orientation_[0])), Melown.rotationMatrix(0, Melown.radians(orientation_[1])), this.updateCameraMatrix_);

    //Melown.mat4.multiply(this.updateCameraMatrix_, Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), this.updateCameraMatrix_);

    //this.updateCameraMatrix_ = Melown.mat4.inverse(this.updateCameraMatrix_);
    //this.updateCameraMatrix_ = Melown.rotationMatrix(0, -Melown.radians(orientation_[1]));

    //var height_ = 227;
    var height_ = this.position_.getHeight();

    if (this.position_.getHeightMode() == "float") {
        var lod_ =  this.getOptimalHeightLod(this.position_.getCoords(), this.position_.getViewExtent(), this.config_.mapNavSamplesPerViewExtent_);
        var surfaceHeight_ = this.getSurfaceHeight(this.position_.getCoords(), lod_);
        height_ += surfaceHeight_[0];
    }

    if (this.position_.getViewMode() == "obj") {
        var orbitPos_ = [0, -this.cameraDistance_, 0];
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, orbitPos_);
    } else {
        var orbitPos_ = [0, 0, 0];
    }

    this.cameraVector_ = [0, 1, 0];
    Melown.mat4.multiplyVec3(this.updateCameraMatrix_, this.cameraVector_);


    if (this.getNavigationSrs().isProjected()) {
        //this.camera_.setPosition(orbitPos_);
        //this.camera_.setOrientation(orientation_);
        //this.renderer_.cameraDistance_ = this.cameraDistance_;

        
        this.updateCameraMatrix_ = Melown.mat4.create();
        
        //Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), Melown.rotationMatrix(0, Melown.radians(-orientation_[1] - 90.0)), this.updateCameraMatrix_);
        Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians(-orientation_[1] - 90.0)), Melown.rotationMatrix(2, Melown.radians(-orientation_[0])), this.updateCameraMatrix_);

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

        var ned_ = this.position_.getNED();
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
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, north2_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, east2_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, direction2_);

        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, dir_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, up_);
        Melown.mat4.multiplyVec3(this.updateCameraMatrix_, right_);

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
        this.camera_.setPosition(orbitPos_);
        this.camera_.setRotationMatrix(rotationMatrix_);
        this.renderer_.cameraDistance_ = this.cameraDistance_;
        

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
        
        var ned_ = this.position_.getNED();
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

        var coords_ = this.position_.getCoords();
        var latlonMatrix_ = Melown.mat4.create();
        Melown.mat4.multiply(Melown.rotationMatrix(0, Melown.radians((coords_[1] - 90.0))), Melown.rotationMatrix(2, Melown.radians((-coords_[0]-90))), latlonMatrix_);
//        Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians((coords_[0]-90))), Melown.rotationMatrix(0, Melown.radians((coords_[1] - 90.0))), latlonMatrix_);


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

        spaceMatrix_ = Melown.mat4.inverse(spaceMatrix_);

        Melown.mat4.multiplyVec3(spaceMatrix_, orbitPos_);

        this.camera_.setPosition(orbitPos_);
        this.camera_.setRotationMatrix(rotationMatrix_);
        this.renderer_.cameraDistance_ = this.cameraDistance_;
        
       // this.position_.setCoords([0,90,0]);
        this.position_.setHeight(0);
    }

    this.camera_.setViewHeight(this.position_.getViewExtent());
    //this.camera_.setOrtho(true);

    this.camera_.setParams(this.position_.getFov()*0.5, this.renderer_.camera_.getNear(), this.renderer_.camera_.getFar());


    //convert public coords to physical
    var worldPos_ = this.convertCoords([this.position_.getCoords()[0], this.position_.getCoords()[1], height_], "navigation", "physical");
	worldPos_[0] += orbitPos_[0];
	worldPos_[1] += orbitPos_[1];
	worldPos_[2] += orbitPos_[2];
    this.camera_.setPosition([0,0,0]); //always zeros

	//var camCoords_ = orbitPos


    //var worldPos_ = [this.position_.getCoords()[0], this.position_.getCoords()[1], height_];

    //console.log("height: " + JSON.stringify(height2_));

    this.cameraPosition_ = worldPos_;

    //auto far plane
    /*
    var far_ = this.camera_.getFar();

    var maxDistance_ = this.cameraDistance_ * (Math.tan(this.camera_.getFov()*0.5) / this.camera_.getAspect());

    maxDistance_ *= Math.tan(Melown.radians(90+this.orientation_[1]*0.10));
    maxDistance_ = maxDistance_ > 9000000.0 ? 9000000.0 : maxDistance_;
    maxDistance_ = maxDistance_ < this.core_.coreConfig_.cameraVisibility_ ? this.core_.coreConfig_.cameraVisibility_ : maxDistance_;

    if (Math.abs(maxDistance_- far_) > 1.0) {
        this.camera_.setParams(this.camera_.getFov(), this.camera_.getNear(), maxDistance_);
    }
    */


    //set near and far of camera by distance of orbit
    var factor_ = this.cameraDistance_ / 600000;

    var near_ = Math.max(2, 2 * (factor_ * 20));
    factor_ = Math.max(1.0, factor_);
    var far_ = 600000 * (factor_ * 10);

    console.log("near: " + near_ + "  far: " + far_);

    this.camera_.setParams(this.camera_.getFov(), near_, far_);


    //this.dirty_ = true;
};

Melown.Map.prototype.cameraHeight = function() {
    //TODO: get camera height
    //var cameraPos_ = this.camera_.position_;
    //return (this.camera_.getPosition()[2] - this.planet_.surfaceHeight([this.position_[0] + cameraPos_[0], this.position_[1] + cameraPos_[1]])[0]);

    //hack - distance intead of height
    return this.cameraDistance_;
};




