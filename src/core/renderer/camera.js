
import {vec3 as vec3_, vec4 as vec4_, mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';

//get rid of compiler mess
var vec3 = vec3_, vec4 = vec4_, mat4 = mat4_;
var math = math_;


var Camera = function(parent, fov, near, far) {
    this.parent = parent;
    this.position = [0,0,0];
    this.orientation = [0,0,0];
    this.aspect = 1;
    this.fov = fov;
    this.fovTan = Math.tan(fov * Math.PI / 180.0);
    this.fovDist = 1;
    this.near = near;
    this.far = far;
    this.rotationByMatrix = false;

    // derived quantities, calculated from camera parameters by update()
    this.modelview = mat4.create();
    this.rotationview = mat4.create();
    this.projection = mat4.create();
    this.mvp = mat4.create();
    this.mvp32 = new Float32Array(16);
    this.modelview32 = new Float32Array(16);
    this.rotationview32 = new Float32Array(16);
    this.projection32 = new Float32Array(16);

    this.frustumPlanes = [ [0,0,0,0], [0,0,0,0], [0,0,0,0],
                           [0,0,0,0], [0,0,0,0], [0,0,0,0] ];
    this.bboxPoints = [
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
    this.scaleFactorVec = [0,0,0,0];
    this.dirty = true;
};


Camera.prototype.setPosition = function(position) {
    this.position = position;
    this.dirty = true;
};


Camera.prototype.setOrientation = function(orientation) {
    this.rotationByMatrix = false;
    this.orientation = orientation;
    this.dirty = true;
};


Camera.prototype.setRotationMatrix = function(matrix){
    this.rotationByMatrix = true;
    this.rotationview = matrix.slice();
    this.dirty = true;
};


// Sets the viewport aspect ratio (width / height). Should be called
// whenever the rendering viewport changes.
Camera.prototype.setAspect = function(aspect) {
    this.aspect = aspect;
    this.dirty = true;
};


Camera.prototype.setViewHeight = function(height) {
    this.viewHeight = height;
    this.dirty = true;
};


Camera.prototype.setOrtho = function(state) {
    this.ortho = state;
    this.dirty = true;
};


Camera.prototype.setParams = function(fov, near, far) {
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.dirty = true;
};


Camera.prototype.clone = function(newFov) {
    var camera = new Camera(this. parent, (newFov != null) ? newFov : this.getFov(), this.getNear(), this.getFar());

    camera.setPosition(this.getPosition());
    camera.setOrientation(this.getOrientation());
    camera.setAspect(this.getAspect());
    camera.update();

    return camera;
};


// simple getters
Camera.prototype.getPosition = function(){ return [this.position[0], this.position[1], this.position[2]]; };
Camera.prototype.getOrientation = function(){ return [this.orientation[0], this.orientation[1], this.orientation[2]]; };
Camera.prototype.getAspect = function(){ return this.aspect; };
Camera.prototype.getFov = function(){ return this.fov; };
Camera.prototype.getNear = function(){ return this.near; };
Camera.prototype.getFar = function(){ return this.far; };
Camera.prototype.getViewHeight = function(){ return this.viewHeight; };
Camera.prototype.getOrtho = function(){ return this.ortho; };


// Returns rotation matrix
Camera.prototype.getRotationviewMatrix = function() {
    if (this.dirty) this.update();
    return this.rotationview;
};

Camera.prototype.getRotationviewFMatrix = function() {
    if (this.dirty) this.update();
    return this.rotationview32;
};

// Returns a matrix that transforms the world space to camera space.
Camera.prototype.getModelviewMatrix = function(){
    if (this.dirty) this.update();
    return this.modelview;
};

Camera.prototype.getModelviewFMatrix = function(){
    if (this.dirty) this.update();
    return this.modelview32;
};


// Returns a matrix that transforms the camera space to screen space.
Camera.prototype.getProjectionMatrix = function() {
    if (this.dirty) this.update();
    return this.projection;
};

Camera.prototype.getProjectionFMatrix = function() {
    if (this.dirty) this.update();
    return this.projection32;
};


// Returns projectionMatrix() * modelviewMatrix()
Camera.prototype.getMvpMatrix = function() {
    if (this.dirty) this.update();
    return this.mvp;
};

Camera.prototype.getMvpFMatrix = function() {
    if (this.dirty) this.update();
    return this.mvp32;
};

// Returns how much a length unit located at a point in world space is
// stretched when projected to the sceen space.
Camera.prototype.scaleFactor = function(worldPos, returnDist) {
    if (this.dirty) this.update();

    //var camPos = vec4.create();
    //mat4.multiplyVec4(this.modelview, worldPos, camPos);
    mat4.multiplyVec3(this.modelview, worldPos, this.scaleFactorVec);
    var dist = vec3.length(this.scaleFactorVec); // distance from camera

    // the expression "projection(0,0) / depth" is the derivative of the
    // screen X position by the camera space X coordinate.

    // ('dist' is used instead of camera depth (camPos(2)) to make the tile
    // resolution independent of camera rotation)

    if (returnDist) {
        if (dist < this.near) return [Number.POSITIVE_INFINITY, dist];
        return [this.projection[0] / dist, dist]; 
        //return [(this.projection[5]*0.5) / dist, dist]; //projection by sy
    }

    if (dist < this.near) return Number.POSITIVE_INFINITY;
    return this.projection[0] / dist;
    //return (this.projection[5]*0.5) / dist; //projection by sy
};


Camera.prototype.scaleFactor2 = function(dist) {
    if (this.dirty) this.update();

    if (dist < this.near) return Number.POSITIVE_INFINITY;
    return this.projection[0] / dist;
    //return (this.projection[5]*0.5) / dist; //projection by sy
};


Camera.prototype.distance = function(worldPos) {
    var delta = vec3.create();
    vec3.subtract(this.position, worldPos, delta);
    return vec3.length(delta);
};


// Returns true if point is inside camera frustum.
Camera.prototype.pointVisible = function(point, shift) {
    if (this.dirty) this.update();

    var p;

    if (shift) {
        p = [ point[0] - shift[0], point[1] - shift[1], point[2] - shift[2], 1 ];
    } else {
        p = [ point[0], point[1], point[2], 1 ];
    }

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if point lie on the negative side of the frustum plane
        if (vec4.dot(this.frustumPlanes[i], p) < 0) {
            return false;
        }
    }

    // the box might be inside - further testing should be done here - TODO!
    return true;
};


// Returns true if the box intersects the camera frustum.
Camera.prototype.pointsVisible = function(points, shift) {
    if (this.dirty) this.update();
   
    var planes = this.frustumPlanes;
    var lj = points.length, sx, sy, sz;

    if (shift) {
        sx = shift[0];
        sy = shift[1];
        sz = shift[2];
    } else {
        sx = 0;
        sy = 0;
        sz = 0;
    }
        
    var dot = vec4.dot3;

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if all points lie on the negative side of the frustum plane
        var negative = true;
        var plane = planes[i];
        for (var j = 0; j < lj; j+=3) {
            if (dot(plane, points, j, sx, sy, sz) >= 0) {
                //return false;
                negative = false;
                break;
            }
        }
        if (negative) return false;
    }

    return true;
};


Camera.prototype.pointsVisible2 = function(points, shift) {
    if (this.dirty) this.update();
   
    var planes = this.frustumPlanes;
    var lj = points.length, sx, sy, sz;

    if (shift) {
        sx = shift[0];
        sy = shift[1];
        sz = shift[2];
    } else {
        sx = 0;
        sy = 0;
        sz = 0;
    }
        
    var dot = vec4.dot3;

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if all points lie on the negative side of the frustum plane
        var negative = true;
        var plane = planes[i];
        for (var j = 0; j < lj; j++) {
            if (dot(plane, points[j], 0, sx, sy, sz) >= 0) {
                //return false;
                negative = false;
                break;
            }
        }
        if (negative) return false;
    }

    return true;
};


// Returns true if the box intersects the camera frustum.
Camera.prototype.bboxVisible = function(bbox, shift) {
    if (this.dirty) this.update();

    var min = bbox.min;
    var max = bbox.max;
    var points = this.bboxPoints;
    var p, minX, minY, minZ, maxX, maxY, maxZ;

    if (shift) {
        minX = min[0] - shift[0];        
        minY = min[1] - shift[1];        
        minZ = min[2] - shift[2];        
       
        maxX = max[0] - shift[0];        
        maxY = max[1] - shift[1];        
        maxZ = max[2] - shift[2];        
    } else {
        minX = min[0];        
        minY = min[1];        
        minZ = min[2];        

        maxX = max[0];        
        maxY = max[1];        
        maxZ = max[2];        
    }

    p = points[0];
    p[0] = minX;  p[1] = minY; p[2] = minZ; 
    p = points[1];
    p[0] = minX;  p[1] = minY; p[2] = maxZ; 
    p = points[2];
    p[0] = minX;  p[1] = maxY; p[2] = minZ; 
    p = points[3];
    p[0] = minX;  p[1] = maxY; p[2] = maxZ; 

    p = points[4];
    p[0] = maxX;  p[1] = minY; p[2] = minZ; 
    p = points[5];
    p[0] = maxX;  p[1] = minY; p[2] = maxZ; 
    p = points[6];
    p[0] = maxX;  p[1] = maxY; p[2] = minZ; 
    p = points[7];
    p[0] = maxX;  p[1] = maxY; p[2] = maxZ; 


    var dot = vec4.dot2;
    var planes = this.frustumPlanes;

    // test all frustum planes quickly
    for (var i = 0; i < 6; i++) {
        // check if all points lie on the negative side of the frustum plane
        var negative = true;
        var plane = planes[i];
        for (var j = 0; j < 8; j++) {
            if (dot(plane, points[j]) >= 0) {
                //return false;
                negative = false;
                break;
            }
        }
        if (negative) return false;
    }

    // the box might be inside - further testing should be done here - TODO!
    return true;
};


Camera.prototype.update = function(zoffset) {
    // modelview matrix, this is essentially the inverse of a matrix that
    // brings the camera from the origin to its world position (the inverse
    // is trivial here -- negative angles, reverse order of transformations)
    //this.modelview = mat4.create();

    if (!this.rotationByMatrix) {
        mat4.multiply(math.rotationMatrix(2, math.radians(-this.orientation[2])), math.rotationMatrix(0, math.radians(-this.orientation[1] - 90.0)), this.rotationview);
        mat4.multiply(this.rotationview, math.rotationMatrix(2, math.radians(-this.orientation[0])), this.rotationview);
    }

    mat4.multiply(this.rotationview, math.translationMatrix(-this.position[0], -this.position[1], -this.position[2]), this.modelview);

    if (this.ortho) {
        this.projection = math.orthographicMatrix(this.viewHeight, this.aspect, this.near, this.far);
    } else {
        this.projection = math.perspectiveMatrix(this.fov, this.aspect, this.near, this.far);
    }

    mat4.multiply(this.projection, this.modelview, this.mvp);

    // prepare frustum planes (in normalized device coordinates)
    this.frustumPlanes[0] = [ 0, 0, 1, 1 ]; // far
    this.frustumPlanes[1] = [ 0, 0,-1, 1 ]; // near
    this.frustumPlanes[2] = [ 1, 0, 0, 1 ]; // left
    this.frustumPlanes[3] = [-1, 0, 0, 1 ]; // right
    this.frustumPlanes[4] = [ 0, 1, 0, 1 ]; // bottom
    this.frustumPlanes[5] = [ 0,-1, 0, 1 ]; // top

    // transform the frustum planes to the world space, remember that
    // planes in homogeneous coordinates transform as p' = M^{-T} * p, where
    // M^{-T} is the transpose of inverse of M
    var mvpt = mat4.create();
    mat4.transpose(this.mvp, mvpt); //without zoffset
    for (var i = 0; i < 6; i++) {
        this.frustumPlanes[i] = mat4.multiplyVec4(mvpt, this.frustumPlanes[i]);
    }

    this.mvp32.set(this.mvp);
    this.projection32.set(this.projection);
    this.modelview32.set(this.modelview);
    this.rotationview32.set(this.rotationview);

    this.fovDist = (this.parent.curSize[1] *0.5) / this.fovTan;

    // the derived quantities are now in sync with the parameters
    this.dirty = false;
};


export default Camera;
