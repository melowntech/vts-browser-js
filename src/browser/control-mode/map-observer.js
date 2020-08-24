
import Dom_ from '../utility/dom';
import {math as math_} from '../../core/utils/math';

//get rid of compiler mess
var dom = Dom_;
var math = math_;


var ControlModeMapObserver = function(browser) {
    this.browser = browser;
    this.config = browser.config;

    this.coordsDeltas = [];
    this.orientationDeltas = [];
    this.viewExtentDeltas = [];
    this.northResetAnimation = false;

    this['drag'] = this.drag;
    this['wheel'] = this.wheel;
    this['tick'] = this.tick;
    this['reset'] = this.reset;
    this['keyup'] = this.keyup;
    this['keydown'] = this.keydown;
    this['keypress'] = this.keypress;
    this['doubleclick'] = this.doubleclick;

    this.retinaFactor = 1.0 / Math.max(1.0,(window.devicePixelRatio || 1) - 1);
};


ControlModeMapObserver.prototype.drag = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var pos = map.getPosition();
    var coords = pos.getCoords();
    var delta = event.getDragDelta();
    //var zoom = event.getDragZoom();
    var touches = event.getDragTouches();
    var azimuthDistance = this.getAzimuthAndDistance(delta[0], delta[1]);
    var sensitivity, config = this.config;

    var modifierKey = (this.browser.controlMode.altKey
               || this.browser.controlMode.shiftKey
               || this.browser.controlMode.ctrlKey);

    //event.getTouchParameter("touchMode");


    if (touches == 2) {//} && /*event.getDragButton("middle")*/ zoom != 0 && this.config.zoomAllowed) {
        if (pos.getViewMode() != 'obj') {
            return;
        }

        if (event.getTouchParameter('touchMode') == 'pan' && config.rotationAllowed) {

            sensitivity = config.sensitivity[1] * this.retinaFactor;
            this.orientationDeltas.push([delta[0] * sensitivity,  -delta[1] * sensitivity, 0]);
            this.browser.callListener('map-position-rotated', {});

        } else if (event.getTouchParameter('touchMode') == 'zoom' && config.zoomAllowed) {

            var delta = event.getTouchParameter('touchDistanceDelta');

            if (Math.abs(delta) >= 1) {

                var factor = 1.0 + (delta > 0 ? -1 : 1)*0.01;
                this.viewExtentDeltas.push(factor);
                this.reduceFloatingHeight(0.8);

                if (config.legacyInertia) {
                    this.updateDeltas(false, false, true);
                }

                this.browser.callListener('map-position-zoomed', {});
            }
        }

    } else if ((event.getDragButton('left') && !modifierKey) && config.panAllowed) { //pan

        if (pos.getHeightMode() == 'fix') {
            var pos2 = map.convertPositionHeightMode(pos, 'float', true);
            if (pos2 != null) {
                pos = pos2;
                this.setPosition(pos);
            }
        } else {
            sensitivity = config.sensitivity[0] * this.retinaFactor;
            var fov = pos.getFov();
            var fovCorrection = (fov > 0.01 && fov < 179) ? (1.0 / Math.tan(math.radians(fov*0.5))) : 1.0;
            var azimuth = math.radians(azimuthDistance[0]);
            var forward = [Math.sin(azimuth), //direction vector x
                Math.cos(azimuth), //direction vector y
                azimuthDistance[1] * fovCorrection * sensitivity, azimuthDistance[0], //distance and azimut
                coords[0], coords[1]]; //coords

            this.coordsDeltas.push(forward);
            this.reduceFloatingHeight(0.9);

            if (config.legacyInertia) {
                this.updateDeltas(true);
            }

            this.browser.callListener('map-position-panned', {});
        }
    } else if (((touches <= 1 && event.getDragButton('right')) || event.getDragButton('middle') || modifierKey)  && config.rotationAllowed) { //rotate

        sensitivity = config.sensitivity[1] * this.retinaFactor * (pos.getViewMode() != 'obj' ? 0.5 : 1);
        this.orientationDeltas.push([delta[0] * sensitivity, -delta[1] * sensitivity, 0]);

        if (config.legacyInertia) {
            this.updateDeltas(false, true);
        }

        this.browser.callListener('map-position-rotated', {});
    }
};


ControlModeMapObserver.prototype.wheel = function(event) {
    dom.preventDefault(event);

    var map = this.browser.getMap();
    if (!map || !this.config.zoomAllowed) {
        return;
    }

    if (map.getStats(true)['maxZoom']) {
        this.browser.config.minViewExtent = 0.5;
    }

    var pos = map.getPosition();
    var delta = event.getWheelDelta();
    var sensitivity = this.config.sensitivity[2];

    if (this.browser.controlMode.shiftKey) sensitivity *= 0.1;

    var factor = 1.0 + (delta > 0 ? -1 : 1)*sensitivity;

    if (this.browser.controlMode.altKey &&
        this.browser.controlMode.shiftKey &&
        this.browser.controlMode.ctrltKey) {
        var fov = math.clamp(pos.getFov() * factor, 1, 179);
        pos.setFov(fov);
        map.setPosition(pos);
    } else {
        if (pos.getViewMode() != 'obj') {
            var coords = pos.getCoords();

            var cameraInfo = map.getCameraInfo();
            var vector = cameraInfo.vector;
            var height = cameraInfo.height;
            var speed = Math.max(100, height) * (this.browser.controlMode.shiftKey ? 0.00025 : 0.0025) * (delta > 0 ? 1 : -1);

            coords = map.convertCoordsFromNavToPhys(coords, 'float');

            coords[0] += vector[0] * speed;
            coords[1] += vector[1] * speed;
            coords[2] += vector[2] * speed;

            coords = map.convertCoordsFromPhysToNav(coords, 'float');

            pos.setCoords(coords);
            map.setPosition(pos);
            return;
        }


        this.viewExtentDeltas.push(factor);
        this.reduceFloatingHeight(0.8);
        this.browser.callListener('map-position-zoomed', {});
    }
};


ControlModeMapObserver.prototype.doubleclick = function(event) {
    dom.preventDefault(event);

    var map = this.browser.getMap();
    if (!map || !this.config.jumpAllowed) {
        return;
    }

    if (this.browser.controlMode.altKey &&
        this.browser.controlMode.shiftKey &&
        this.browser.controlMode.ctrlKey) {
        this.browser.config.minViewExtent = 0.5;
        return;
    }

    var coords = event.getMouseCoords();
    var canvasSize = this.browser.getRenderer().getCanvasSize();

    if (coords[0] < 0 || coords[1] < 0 || coords[0] >= canvasSize[0] || coords[1] >= canvasSize[1]) {
        return;
    }

    //get hit coords with fixed height
    var mapCoords = map.getHitCoords(coords[0], coords[1], 'fix');

    if (mapCoords) {
        var pos = map.getPosition();
        pos.setCoords(mapCoords);
        pos = map.convertPositionHeightMode(pos, 'fix');
        pos.setHeight(mapCoords[2]);
        //pos = map.convertPositionHeightMode(pos, "fix");
        //pos.setPositionHeight(0);

        if (this.browser.controlMode.shiftKey) {
            map.setPosition(pos);
        } else {        
            this.browser.autopilot.flyTo(pos, {'mode' : 'direct', 'maxDuration' : 2000 });
        }
    }
};


ControlModeMapObserver.prototype.keyup = function() {
};


ControlModeMapObserver.prototype.keydown = function() {
};


ControlModeMapObserver.prototype.keypress = function() {
};


ControlModeMapObserver.prototype.setPosition = function(pos) {

    if (!this.config.walkMode) {
        pos = constrainMapPosition(this.browser, pos);
    }

    if (this.config.fixedHeight) {
        pos.setHeight(this.config.fixedHeight);
    }

    var map = this.browser.getMap();
    map.setPosition(pos);
    //console.log(JSON.stringify(pos));
};


ControlModeMapObserver.prototype.reduceFloatingHeight = function(factor) {
    var map = this.browser.getMap();
    var pos = map.getPosition();
    var coords = pos.getCoords();

    if (pos.getHeightMode() == 'float' &&
        pos.getViewMode() == 'obj') {
        if (coords[2] != 0) {
            coords[2] *= factor;

            if (Math.abs(coords[2]) < 0.1) {
                coords[2] = 0;
            }

            pos.setCoords(coords);
            this.setPosition(pos);
        }
    }
};


ControlModeMapObserver.prototype.isNavigationSRSProjected = function() {
    var map = this.browser.getMap();
    var rf = map.getReferenceFrame();
    var srs = map.getSrsInfo(rf['navigationSrs']);
    return (srs) ? (srs['type'] == 'projected') : false;
};


ControlModeMapObserver.prototype.getAzimuthAndDistance = function(dx, dy) {
    var map = this.browser.getMap();
    var pos = map.getPosition();
    var viewExtent = pos.getViewExtent();
    var fov = pos.getFov()*0.5;

    if (this.config.walkMode) {
        viewExtent += 5;
    }

    //var sensitivity = 0.5;
    var zoomFactor = (((viewExtent*0.5) * Math.tan(math.radians(fov))) / 800);
    dx *= zoomFactor;
    dy *= zoomFactor;

    var distance = Math.sqrt(dx*dx + dy*dy);
    var azimuth = -math.degrees(Math.atan2(dx, dy)) + pos.getOrientation()[0];

    return [azimuth, distance];
};


ControlModeMapObserver.prototype.updateDeltas = function(onlyLastPan, onlyLastRotate, onlyLastZoom) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var pos = map.getPosition(), delta, deltas;
    var update = false, azimuth, correction, i;
    var inertia = this.config.inertia, stats = map.getStats();
    var timeFactor = 1;
    var invTimeFactor = 1;

    if (this.config.timeNormalizedInertia) {
        var fps = (1000/(map.getStats()['frameTime'] + 0.000001));

        if (fps < 1) {
            fps = 60;
        }

        timeFactor = (fps/60);  //normalized to 60 fps
        invTimeFactor = 1.0/timeFactor;
    }

    //console.log(''+timeFactor);

    //process coords deltas
    if (!onlyLastRotate && !onlyLastZoom && this.coordsDeltas.length > 0) {
        deltas = this.coordsDeltas;
        var forward = [0,0];
        var coords = pos.getCoords();

        //get foward vector form coord deltas
        for (i = (onlyLastPan ? (deltas.length - 1) : 0); i < deltas.length; i++) {
            delta = deltas[i];

            azimuth = delta[3];
            azimuth = math.radians(azimuth);

            forward[0] += Math.sin(azimuth) * (delta[2] * invTimeFactor);
            forward[1] += Math.cos(azimuth) * (delta[2] * invTimeFactor);

            delta[2] *= inertia[0] * timeFactor;

            //remove zero deltas
            if (delta[2] < 0.01) {
                deltas.splice(i, 1);
                i--;
            }
        }

        var distance = Math.sqrt(forward[0]*forward[0] + forward[1]*forward[1]);
        azimuth = math.degrees(Math.atan2(forward[0], forward[1]));

        if (!this.isNavigationSRSProjected()) {
            if (!this.northResetAnimation && this.config.navigationMode == 'azimuthal' && (Math.abs(coords[1]) > 75 || Math.abs(pos.getOrientation()[0]) > 1))  {
                this.config.navigationMode = 'azimuthal2';
            }
        }

        //apply final azimuth and distance
        correction = pos.getOrientation()[0];
        pos = map.movePositionCoordsTo(pos, (this.isNavigationSRSProjected() ? -1 : 1) * azimuth, distance,
                                            (!(this.config.navigationMode == 'free' || this.config.navigationMode == 'azimuthal2')) ? 0 : 1);
        correction = pos.getOrientation()[0] - correction;


        for (i = 0; i < deltas.length; i++) {
            delta = deltas[i];
            delta[3] += correction;
        }

        update = true;
    }

    //process coords deltas
    if (!onlyLastPan && !onlyLastZoom && this.orientationDeltas.length > 0) {
        deltas = this.orientationDeltas;
        var orientation = pos.getOrientation();

        //apply detals to current orientation
        for (i = (onlyLastRotate ? (deltas.length - 1) : 0); i < deltas.length; i++) {
            delta = deltas[i];
            orientation[0] += delta[0] * invTimeFactor;
            orientation[1] += delta[1] * invTimeFactor;
            orientation[2] += delta[2] * invTimeFactor;

            delta[0] *= inertia[1] * timeFactor;
            delta[1] *= inertia[1] * timeFactor;
            delta[2] *= inertia[1] * timeFactor;

            //remove zero deltas
            if (delta[0]*delta[0] + delta[1]*delta[1] + delta[2]*delta[2] < 0.1) {
                deltas.splice(i, 1);
                i--;
            }
        }

        //apply final orintation
        // HACK
        pos.setOrientation(orientation);
        update = true;
    }

    //process view extents deltas
    if (!onlyLastRotate && !onlyLastPan && this.viewExtentDeltas.length > 0) {
        deltas = this.viewExtentDeltas;
        var viewExtent = pos.getViewExtent();

        //apply detals to current view extent
        for (i = (onlyLastZoom ? (deltas.length - 1) : 0); i < deltas.length; i++) {
            //viewExtent *= deltas[i];
            viewExtent *= Math.pow(deltas[i], invTimeFactor);
            deltas[i] += (1 - deltas[i]) * (1.0 - (inertia[2] * timeFactor));

            //deltas[i] *= Math.pow(deltas[i], Math.pow(inertia[2], timeFactor));

            //remove zero deltas
            if (Math.abs(1 - deltas[i]) < 0.001) {
                deltas.splice(i, 1);
                i--;
            }
        }

        viewExtent = Math.max(1, viewExtent);

        //apply final view extrent
        pos.setViewExtent(viewExtent);
        update = true;
    }

    //set new position
    if (update) {
        this.setPosition(pos);
    }
};

ControlModeMapObserver.prototype.tick = function() {
    this.updateDeltas();
};


ControlModeMapObserver.prototype.reset = function() {
    this.coordsDeltas = [];
    this.orientationDeltas = [];
    this.viewExtentDeltas = [];
};


function constrainMapPosition(browser, pos) {
    if (!browser.config.constrainCamera) {
        return pos;
    }

    var minVE = browser.config.minViewExtent;
    var maxVE = browser.config.maxViewExtent;

    var map = browser.getMap(), o;

    //clamp view extets
    var viewExtent = math.clamp(pos.getViewExtent(), minVE, maxVE);
    pos.setViewExtent(viewExtent);

    var distance = (viewExtent*0.5) / Math.tan(math.radians(pos.getFov()*0.5));
    //var hmaxOffset = 0;

    //reduce tilt when you are far off the planet
    if (pos.getViewMode() == 'obj') {
        var rf = map.getReferenceFrame();
        var srs = map.getSrsInfo(rf['navigationSrs']);

        if (srs['a']) {

            var a1 = Math.asin(srs['a'] / (distance + srs['a'])); //get angle to horion
            //console.log('a1: ' + math.degrees(a1));

            var factor = Math.tan(math.radians(pos.getFov()*0.5)) / Math.tan(a1);
            //var viewFactor = factor;

            //console.log('factor: ' + factor);

            var threshold = browser.config.tiltConstrainThreshold;
            var thresholdMin = threshold[0];// * 0.5;
            var thresholdMax = threshold[1];// * 0.5;
            var maxTilt, minTilt = -90;

            if (!(thresholdMin > thresholdMax || thresholdMin == thresholdMax)) {
                factor = math.clamp(factor, thresholdMin, thresholdMax);
                factor = ((factor - thresholdMin) / (thresholdMax - thresholdMin));
                maxTilt = 20 + ((-90) - 20) * (factor);
            } else {
                maxTilt = 20;
            }

            //console.log('maxTilt: ' + maxTilt);

            o = pos.getOrientation();
            o[1] = math.clamp(o[1], minTilt, maxTilt);

            pos.setOrientation(o);
        }

        //do not allow camera under terrain
        var camPos = map.getPositionCameraCoords(pos, 'float');
        //var cameraConstrainDistance = 1;
        var cameraConstrainDistance = (minVE*0.5) / Math.tan(math.radians(pos.getFov()*0.5));
        cameraConstrainDistance *= 0.5; //divice by 2 to alow 45deg tilt in maximum zoom

        //var hmax = Math.max(Math.min(4000,cameraConstrainDistance), (distance * Math.tan(math.radians(3.0))));
        //var hmax = Math.max(Math.min(4000,cameraConstrainDistance), (distance * Math.tan(math.radians(3.0))));
        var hmax = Math.max(cameraConstrainDistance, (distance * Math.tan(math.radians(3.0))));

        var cameraHeight = camPos[2]; //this.cameraHeight() - this.cameraHeightOffset - this.cameraHeightOffset2;

        if (cameraHeight < hmax) {
            o = pos.getOrientation();

            var getFinalOrientation = (function(start, end, level) {
                var value = (start + end) * 0.5;

                if (level > 20) {
                    return value;
                } else {
                    o[1] = value;
                    pos.setOrientation(o);

                    if (map.getPositionCameraCoords(pos, 'float')[2] < hmax) {
                        return getFinalOrientation(start, value, level+1);
                    } else {
                        return getFinalOrientation(value, end, level+1);
                    }
                }

            });//.bind(this);

            o[1] = getFinalOrientation(-90, Math.min(20, o[1]), 0);
            pos.setOrientation(o);
        }
    }

    return pos;
}


export {ControlModeMapObserver, constrainMapPosition};
