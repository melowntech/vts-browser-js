
/**
 * @constructor
 */
Melown.Camera = function(parent_, fov_, near_, far_) {
    this.parent_ = parent_;
    this.position_ = /*(position_ != null) ? position_ :*/ [0,0,0];
    this.orientation_ = /*(orientation_ != null) ? orientation_ :*/ [0,0,0]; // {yaw, pitch, roll}
    this.aspect_ = 1;
    this.fov_ = fov_;
    this.near_ = near_;
    this.far_ = far_;
    this.rotationByMatrix_ = false;

    // derived quantities, calculated from camera parameters by update()
    this.modelview_ = Melown.mat4.create();
    this.rotationview_ = Melown.mat4.create();
    this.projection_ = Melown.mat4.create();
    this.projection2_ = Melown.mat4.create();
    this.mvp_ = Melown.mat4.create();
    this.mvp2_ = Melown.mat4.create();
    this.frustumPlanes_ = [ [0,0,0,0], [0,0,0,0], [0,0,0,0],
                            [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
    this.bboxPoints_ = [
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ],
        [ 0, 0, 0, 1 ]
    ];

    //reduce garbage collection
    this.scaleFactorVec_ = [0,0,0,0];

    this.dirty_ = true;
};

Melown.Camera.prototype.setPosition = function(position_) {
    this.position_ = position_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setOrientation = function(orientation_) {
    this.rotationByMatrix_ = false;
    this.orientation_ = orientation_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setRotationMatrix = function(matrix_){
    this.rotationByMatrix_ = true;
    this.rotationview_ = matrix_.slice();
    this.dirty_ = true;
};


//! Sets the viewport aspect ratio (width / height). Should be called
//! whenever the rendering viewport changes.
Melown.Camera.prototype.setAspect = function(aspect_) {
    this.aspect_ = aspect_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setViewHeight = function(height_) {
    this.viewHeight_ = height_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setOrtho = function(state_) {
    this.ortho_ = state_;
    this.dirty_ = true;
};

Melown.Camera.prototype.setParams = function(fov_, near_, far_) {
    this.fov_ = fov_;
    this.near_ = near_;
    this.far_ = far_;
    this.dirty_ = true;
};

Melown.Camera.prototype.clone = function(newFov_) {
    var camera_ = new Melown.Camera(this. parent_, (newFov_ != null) ? newFov_ : this.getFov(), this.getNear(), this.getFar());

    camera_.setPosition(this.getPosition());
    camera_.setOrientation(this.getOrientation());
    camera_.setAspect(this.getAspect());
    camera_.update();

    return camera_;
};

// simple getters
Melown.Camera.prototype.getPosition = function(){ return [this.position_[0], this.position_[1], this.position_[2]]; };
Melown.Camera.prototype.getOrientation = function(){ return [this.orientation_[0], this.orientation_[1], this.orientation_[2]]; };
Melown.Camera.prototype.getAspect = function(){ return this.aspect_; };
Melown.Camera.prototype.getFov = function(){ return this.fov_; };
Melown.Camera.prototype.getNear = function(){ return this.near_; };
Melown.Camera.prototype.getFar = function(){ return this.far_; };
Melown.Camera.prototype.getViewHeight = function(){ return this.viewHeight_; };
Melown.Camera.prototype.getOrtho = function(){ return this.ortho_; };

//! Returns rotation matrix
Melown.Camera.prototype.getRotationviewMatrix = function() {
    if (this.dirty_) this.update();
    return this.rotationview_;
};


//! Returns a matrix that transforms the world space to camera space.
Melown.Camera.prototype.getModelviewMatrix = function(){
    if (this.dirty_) this.update();
    return this.modelview_;
};

//! Returns a matrix that transforms the camera space to screen space.
Melown.Camera.prototype.getProjectionMatrix = function() {
    if (this.dirty_) this.update();
    return this.projection_;
};

//! Returns projectionMatrix() * modelviewMatrix()
Melown.Camera.prototype.getMvpMatrix = function() {
    if (this.dirty_) this.update();
    return this.mvp_;
};

//! Returns how much a length unit located at a point in world space is
//! stretched when projected to the sceen space.
Melown.Camera.prototype.scaleFactor = function(worldPos_, returnDist_) {
    if (this.dirty_) this.update();

    //var camPos_ = Melown.vec4.create();
    //Melown.mat4.multiplyVec4(this.modelview_, worldPos_, camPos_);
    Melown.mat4.multiplyVec3(this.modelview_, worldPos_, this.scaleFactorVec_);
    var dist_ = Melown.vec3.length(this.scaleFactorVec_); // distance from camera

    // the expression "projection(0,0) / depth" is the derivative of the
    // screen X position by the camera space X coordinate.

    // ('dist' is used instead of camera depth (camPos(2)) to make the tile
    // resolution independent of camera rotation)

    if (returnDist_ == true) {
        if (dist_ < this.near_) return [Number.POSITIVE_INFINITY, dist_];
        return [this.projection_[0] / dist_, dist_]; 
        //return [(this.projection_[5]*0.5) / dist_, dist_]; //projection by sy
    }

    if (dist_ < this.near_) return Number.POSITIVE_INFINITY;
    return this.projection_[0] / dist_;
    //return (this.projection_[5]*0.5) / dist_; //projection by sy
};

Melown.Camera.prototype.scaleFactor2 = function(dist_) {
    if (this.dirty_) this.update();

    if (dist_ < this.near_) return Number.POSITIVE_INFINITY;
    return this.projection_[0] / dist_;
    //return (this.projection_[5]*0.5) / dist_; //projection by sy
};

Melown.Camera.prototype.distance = function(worldPos_) {
    var delta_ = Melown.vec3.create();
    Melown.vec3.subtract(this.position_, worldPos_, delta_);
    return Melown.vec3.length(delta_);
};

//! Returns true if point is inside camera frustum.
Melown.Camera.prototype.pointVisible = function(point_, shift_) {
    if (this.dirty_) this.update();

    if (shift_) {
        var p = [ point_[0] - shift_[0], point_[1] - shift_[1], point_[2] - shift_[2], 1 ];
    } else {
        var p = [ point_[0], point_[1], point_[2], 1 ];
    }

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if point lie on the negative side of the frustum plane
        if (Melown.vec4.dot(this.frustumPlanes_[i], p) < 0) {
            return false;
        }
    }

    // the box might be inside - further testing should be done here - TODO!
    return true;
};

//! Returns true if the box intersects the camera frustum.
Melown.Camera.prototype.pointsVisible = function(points_, shift_) {
    if (this.dirty_) this.update();
   
    var planes_ = this.frustumPlanes_;
    var points2_ = this.bboxPoints_;
    var lj = points_.length;

    if (shift_) {
        var sx_ = shift_[0];
        var sy_ = shift_[1];
        var sz_ = shift_[2];
    } else {
        var sx_ = 0;
        var sy_ = 0;
        var sz_ = 0;
    }
        
    var dot_ = Melown.vec4.dot3;

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if all points lie on the negative side of the frustum plane
        var negative_ = true;
        var plane_ = planes_[i];
        for (var j = 0; j < lj; j+=3) {
            if (dot_(plane_, points_, j, sx_, sy_, sz_) >= 0) {
                //return false;
                negative_ = false;
                break;
            }
        }
        if (negative_) return false;
    }

    return true;
};

//! Returns true if the box intersects the camera frustum.
Melown.Camera.prototype.bboxVisible = function(bbox_, shift_) {
    if (this.dirty_) this.update();

    var min_ = bbox_.min_;
    var max_ = bbox_.max_;

    /* old
    if (shift_) {
        min_ = [min_[0] - shift_[0], min_[1] - shift_[1], min_[2] - shift_[2]];
        max_ = [max_[0] - shift_[0], max_[1] - shift_[1], max_[2] - shift_[2]];
    }

    var points_ = [
        [ min_[0], min_[1], min_[2], 1 ],
        [ min_[0], min_[1], max_[2], 1 ],
        [ min_[0], max_[1], min_[2], 1 ],
        [ min_[0], max_[1], max_[2], 1 ],
        [ max_[0], min_[1], min_[2], 1 ],
        [ max_[0], min_[1], max_[2], 1 ],
        [ max_[0], max_[1], min_[2], 1 ],
        [ max_[0], max_[1], max_[2], 1 ]
    ];
    */
   
    var points_ = this.bboxPoints_;
    var p;

    if (shift_) {
        var minX_ = min_[0] - shift_[0];        
        var minY_ = min_[1] - shift_[1];        
        var minZ_ = min_[2] - shift_[2];        

        var maxX_ = max_[0] - shift_[0];        
        var maxY_ = max_[1] - shift_[1];        
        var maxZ_ = max_[2] - shift_[2];        
    } else {
        var minX_ = min_[0];        
        var minY_ = min_[1];        
        var minZ_ = min_[2];        

        var maxX_ = max_[0];        
        var maxY_ = max_[1];        
        var maxZ_ = max_[2];        
    }

    p = points_[0];
    p[0] = minX_;  p[1] = minY_; p[2] = minZ_; 
    p = points_[1];
    p[0] = minX_;  p[1] = minY_; p[2] = maxZ_; 
    p = points_[2];
    p[0] = minX_;  p[1] = maxY_; p[2] = minZ_; 
    p = points_[3];
    p[0] = minX_;  p[1] = maxY_; p[2] = maxZ_; 

    p = points_[4];
    p[0] = maxX_;  p[1] = minY_; p[2] = minZ_; 
    p = points_[5];
    p[0] = maxX_;  p[1] = minY_; p[2] = maxZ_; 
    p = points_[6];
    p[0] = maxX_;  p[1] = maxY_; p[2] = minZ_; 
    p = points_[7];
    p[0] = maxX_;  p[1] = maxY_; p[2] = maxZ_; 


    var dot_ = Melown.vec4.dot2;
    var planes_ = this.frustumPlanes_;

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if all points lie on the negative side of the frustum plane
        var negative_ = true;
        var plane_ = planes_[i];
        for (var j = 0; j < 8; j++) {
            if (dot_(plane_, points_[j]) >= 0) {
                //return false;
                negative_ = false;
                break;
            }
        }
        if (negative_) return false;
    }

    // the box might be inside - further testing should be done here - TODO!
    return true;
};

Melown.Camera.prototype.update = function(zoffset_) {
    // modelview matrix, this is essentially the inverse of a matrix that
    // brings the camera from the origin to its world position (the inverse
    // is trivial here -- negative angles, reverse order of transformations)
    //this.modelview_ = Melown.mat4.create();

    if (!this.rotationByMatrix_) {
        Melown.mat4.multiply(Melown.rotationMatrix(2, Melown.radians(-this.orientation_[2])), Melown.rotationMatrix(0, Melown.radians(-this.orientation_[1] - 90.0)), this.rotationview_);
        Melown.mat4.multiply(this.rotationview_, Melown.rotationMatrix(2, Melown.radians(-this.orientation_[0])), this.rotationview_);
    }

    Melown.mat4.multiply(this.rotationview_, Melown.translationMatrix(-this.position_[0], -this.position_[1], -this.position_[2]), this.modelview_);

    if (this.ortho_ == true) {
        this.projection_ = Melown.orthographicMatrix(this.viewHeight_, this.aspect_, this.near_, this.far_);
    } else {
        this.projection_ = Melown.perspectiveMatrix(this.fov_, this.aspect_, this.near_, this.far_);
    }

    Melown.mat4.set(this.projection_, this.projection2_); //without zoffset

    if (zoffset_) {
        zoffset_ = 1.0 + zoffset_;
        var m_ = this.projection_; 
        m_[2] *= zoffset_;
        m_[6] *= zoffset_;
        m_[10] *= zoffset_;
        m_[15] *= zoffset_;
    } 

    //this.mvp_ = Melown.mat4.create();
    Melown.mat4.multiply(this.projection_, this.modelview_, this.mvp_);
    Melown.mat4.multiply(this.projection2_, this.modelview_, this.mvp2_); //without zoffset

    // prepare frustum planes (in normalized device coordinates)
    this.frustumPlanes_[0] = [ 0, 0, 1, 1 ]; // far
    this.frustumPlanes_[1] = [ 0, 0,-1, 1 ]; // near
    this.frustumPlanes_[2] = [ 1, 0, 0, 1 ]; // left
    this.frustumPlanes_[3] = [-1, 0, 0, 1 ]; // right
    this.frustumPlanes_[4] = [ 0, 1, 0, 1 ]; // bottom
    this.frustumPlanes_[5] = [ 0,-1, 0, 1 ]; // top

    // transform the frustum planes to the world space, remember that
    // planes in homogeneous coordinates transform as p' = M^{-T} * p, where
    // M^{-T} is the transpose of inverse of M
    var mvpt_ = Melown.mat4.create();
    Melown.mat4.transpose(this.mvp2_, mvpt_); //without zoffset
    for (var i = 0; i < 6; i++) {
        this.frustumPlanes_[i] = Melown.mat4.multiplyVec4(mvpt_, this.frustumPlanes_[i]);
    }

    // the derived quantities are now in sync with the parameters
    this.dirty_ = false;
};
