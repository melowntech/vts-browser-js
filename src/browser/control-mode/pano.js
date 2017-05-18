

import {math as math_} from '../../core/utils/math';

//get rid of compiler mess
var math = math_;


var ControlModePano = function(browser) {
    this.browser = browser;
    this.config = null;

    this.center = [0, 0];
    this.dragging = false;
    this.velocity = [0, 0];

    this.impulse = [0, 0];

    this['drag'] = this.drag;
    this['down'] = this.drag;
    this['up'] = this.drag;
    this['wheel'] = this.wheel;
    this['tick'] = this.tick;
    this['reset'] = this.reset;
    this['keyup'] = this.keyup;
    this['keydown'] = this.keydown;
    this['keypress'] = this.keypress;
};


ControlModePano.prototype.drag = function(event) {
    if (!this.dragging) {
        return;
    }

    var mouse = event.getMouseCoords();
    var delta = [mouse[0] - this.center[0], mouse[1] - this.center[1]];
    var sensitivity = 0.008;
    this.velocity[0] = delta[0] * sensitivity;
    this.velocity[1] = delta[1] * sensitivity;

    this.impulse[0] = delta[0] * sensitivity;
    this.impulse[1] = delta[1] * sensitivity;
};


ControlModePano.prototype.down = function(event) {
    if (event.getMouseButton() === 'left') {
        this.center = event.getMouseCoords();
        this.dragging = true;
    }
};


ControlModePano.prototype.up = function(event) {
    if (event.getMouseButton() === 'left') {
        this.dragging = false;
    }
};


ControlModePano.prototype.wheel = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var pos = map.getPosition();
    var delta = event.getWheelDelta();

    var factor = (delta > 0 ? -1 : 1) * 1;
    pos.setViewExtent(math.clamp(pos.getViewExtent() + factor, 1, 179));

    map.setPosition(pos);
};


ControlModePano.prototype.keyup = function() {
};


ControlModePano.prototype.keydown = function() {
};


ControlModePano.prototype.keypress = function() {
};


ControlModePano.prototype.tick = function() {
    if (this.velocity[0] == 0.0 && this.velocity[1] == 0.0) {
        return;
    }

    var map = this.browser.getMap();
    if (!map) {
        return;
    }
    
    var pos = map.getPosition();
    var coords = pos.getCoords();
    coords[0] -= this.velocity[0];
    coords[1] -= this.velocity[1];
    pos.setCoords(coords);
    map.setPosition(pos);

    // friction
    if (this.dragging) {
        return;
    }
    var step = 0.9;
    var treshold = 0.0005;

    if (Math.abs(this.velocity[0]) < treshold) {
        this.velocity[0] = 0.0;
    } else {
        this.velocity[0] *= step;
    }

    if (Math.abs(this.velocity[1]) < treshold) {
        this.velocity[1] = 0.0;
    } else {
        this.velocity[1] *= step;
    }
};


ControlModePano.prototype.reset = function(config) {
    this.config = config;
};


export default ControlModePano;

