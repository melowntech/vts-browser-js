
import {mat4 as mat4_} from './matrix';

//get rid of compiler mess
var mat4 = mat4_;


var math = {};


math.isEqual = function(value, value2, delta) {
    return (Math.abs(value - value2) < delta);
};


math.clamp = function(value, min, max) {
    if (value < min) value = min;
    else if (value > max) value = max;

    return value;
};


math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};


math.degrees = function(radians) {
    return (radians / Math.PI) * 180;
};


math.mix = function(a, b, c) {
    return a + (b - a) * c;
};


math.frustumMatrix = function(left, right, bottom, top, near, far) {
    var w = (right - left);
    var h = (top - bottom);
    var d = (far - near);

    var m = mat4.create([2*near/w, 0, (right+left)/w, 0,
        0, 2*near/h, (top+bottom)/h, 0,
        0, 0, -(far+near)/d, -2*far*near/d,
        0, 0, -1, 0]);

    mat4.transpose(m);
    return m;
};


math.perspectiveMatrix = function(fovy, aspect, near, far) {
    var ymax = near * Math.tan(fovy * Math.PI / 180.0);
    var xmax = ymax * aspect;
    return math.frustumMatrix(-xmax, xmax, -ymax, ymax, near, far);
};


math.orthographicMatrix = function(vsize, aspect, near, far) {
    //vsize *= 0.020;
    var w = vsize* 0.5 * aspect;
    var h = vsize * 0.5;
    var d = (far - near);

    var m = mat4.create([1/w, 0, 0, 0,
        0, 1/h, 0, 0,
        0, 0, -2/d, -((far+near)/d),
        0, 0, 0, 1]);

    mat4.transpose(m);
    return m;
};


math.rotationMatrix = function(axis, angle) {
    var ca = Math.cos(angle), sa = Math.sin(angle);

    /*    var m;
    switch (axis) {
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
            0, 1,  0,  0,
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
    mat4.transpose(m);
    return m; */

    switch (axis) {
    case 0:
        return [
            1,   0,   0,  0,
            0,  ca,  sa,  0,
            0, -sa,  ca,  0,
            0,   0,   0,  1 ];
    case 1:
        return [
             ca,  0,  sa,  0,
              0,  1,   0,  0,
            -sa,  0,  ca,  0,
              0,  0,   0,  1 ];
    default:
        return [
             ca, sa,  0,  0,
            -sa, ca,  0,  0,
              0,  0,  1,  0,
              0,  0,  0,  1 ];
    }

};


math.scaleMatrix = function(sx, sy, sz) {
    /*var m = [
        sx,  0,  0, 0,
        0, sy,  0, 0,
        0,  0, sz, 0,
        0,  0,  0, 1 ];

    mat4.transpose(m);
    return m;*/
    return [
        sx,   0,   0,   0,
        0,   sy,   0,   0,
        0,    0,  sz,   0,
        0,    0,   0,   1 ];
};


math.scaleMatrixf = function(s) {
    return math.scaleMatrix(s, s, s);
};


math.translationMatrix = function(tx, ty, tz) {
    /*
    var m = [
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1 ];

    mat4.transpose(m);
    */

    return [
        1,   0,  0,  0,
        0,   1,  0,  0,
        0,   0,  1,  0,
        tx, ty, tz,  1 ];
};


math.translationMatrix2f = function(t) {
    return math.translationMatrix(t[0], t[1], 0);
};


math.translationMatrix3f = function(t) {
    return math.translationMatrix(t[0], t[1], t[2]);
};


export {math};
