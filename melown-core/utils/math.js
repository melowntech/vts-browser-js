
if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

Melown.frustumMatrix = function(left_, right_, bottom_, top_, near_, far_)
{
    var w = (right_ - left_);
    var h = (top_ - bottom_);
    var d = (far_ - near_);

    var m = Melown.mat4.create([2*near_/w, 0, (right_+left_)/w, 0,
        0, 2*near_/h, (top_+bottom_)/h, 0,
        0, 0, -(far_+near_)/d, -2*far_*near_/d,
        0, 0, -1, 0]);

    Melown.mat4.transpose(m);
    return m;
};


Melown.perspectiveMatrix = function(fovy_, aspect_, near_, far_)
{
    var ymax_ = near_ * Math.tan(fovy_ * Math.PI / 360.0);
    var xmax_ = ymax_ * aspect_;
    return Melown.frustumMatrix(-xmax_, xmax_, -ymax_, ymax_, near_, far_);
};

Melown.orthographicMatrix = function(vsize_, aspect_, near_, far_)
{
    //vsize_ *= 0.020;
    var w = vsize_* 0.5 * aspect_;
    var h = vsize_ * 0.5;
    var d = (far_ - near_);

    var m = Melown.mat4.create([1/w, 0, 0, 0,
        0, 1/h, 0, 0,
        0, 0, -2/d, -((far_+near_)/d),
        0, 0, 0, 1]);

    Melown.mat4.transpose(m);
    return m;
};


Melown.rotationMatrix = function(axis_, angle_)
{
    var ca = Math.cos(angle_), sa = Math.sin(angle_);
    var m;

    switch (axis_) {
    case 0:
        m = [
            1,  0,  0, 0,
            0, ca,-sa, 0,
            0, sa, ca, 0,
            0,  0,  0, 1 ];
            break;
    case 1:
        m = [
            ca, 0,-sa, 0,
             0, 1,  0, 0,
            sa, 0, ca, 0,
             0, 0,  0, 1 ];
             break;
    default:
        m = [
            ca,-sa, 0, 0,
            sa, ca, 0, 0,
            0,  0,  1, 0,
            0,  0,  0, 1 ];
            break;
    }

    Melown.mat4.transpose(m);
    return m;
};


Melown.scaleMatrix = function(sx, sy, sz)
{
    var m = [
        sx,  0,  0, 0,
         0, sy,  0, 0,
         0,  0, sz, 0,
         0,  0,  0, 1 ];

    Melown.mat4.transpose(m);
    return m;
};

Melown.scaleMatrixf = function(s)
{
    return Melown.scaleMatrix(s, s, s);
};


Melown.translationMatrix = function(tx, ty, tz)
{
    var m = [
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1 ];

    Melown.mat4.transpose(m);
    return m;
};

Melown.translationMatrix2f = function(t)
{
    return Melown.translationMatrix(t[0], t[1], 0);
};

Melown.translationMatrix3f = function(t)
{
    return Melown.translationMatrix(t[0], t[1], t[2]);
};
