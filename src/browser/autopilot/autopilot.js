

var Autopilot = function(browser) {
    this.browser = browser;
    this.trajectory = [];
    this.flightDuration = 1;
    this.flightTime = 0;
    this.trajectoryIndex = 0;
    this.finished = true;
    this.autoMovement = false;
    this.autoRotate = 0;
    this.autoPan = 0;
    this.autoPanAzimuth = 0;

    this.center = [0,0,0];
    this.orientation = [0,0,0];
    this.viewHeight = 0;
    this.fov = 90;
    this.lastTime = 0;
};


Autopilot.prototype.setAutorotate = function(speed) {
    if (this.autoRotate != speed) {
        this.browser.callListener('autorotate-changed', { 'autorotate' : speed});
    }

    this.autoRotate = speed;
};


Autopilot.prototype.getAutorotate = function() {
    return this.autoRotate;
};


Autopilot.prototype.setAutopan = function(speed, azimuth) {
    this.autoPan = speed;
    this.autoPanAzimuth = azimuth;
};


Autopilot.prototype.getAutopan = function() {
    return [this.autoPan, this.autoPanAzimuth];
};

Autopilot.prototype.flyToDAH = function(distance, azimuth, height, options) {
    var map = this.browser.core.map;
    if (!map) {
        return;
    }
    
    options = options || {};
    
    var trajectory = map.generatePIHTrajectory(map.getPosition(), distance, azimuth, height, options);
    this.setTrajectory(trajectory, options['samplePeriod'] || 10, options); 
};


Autopilot.prototype.flyTo = function(position, options) {
    var map = this.browser.core.map;
    if (!map) {
        return;
    }
    
    options = options || {};
    var trajectory = map.generateTrajectory(map.getPosition(), position, options);
    this.setTrajectory(trajectory, options['samplePeriod'] || 10, options); 
};


Autopilot.prototype.flyTrajectory = function(trajectory, sampleDuration) {
    this.setTrajectory(trajectory, sampleDuration || 10, {});
};


Autopilot.prototype.cancelFlight = function() {
    this.browser.getControlMode().setCurrentControlMode(this.lastControlMode);
    this.finished = true;
};


Autopilot.prototype.setTrajectory = function(trajectory, sampleDuration, options) {
    if (trajectory == null || trajectory.length == 0) {
        return;
    }

    this.setAutorotate(0);
    this.setAutopan(0,0);

    this.speed = options['speed'] || 1.0;
    if (this.finished) {
        this.lastControlMode = this.browser.getControlMode().getCurrentControlMode(); 
    }
    this.browser.getControlMode().setCurrentControlMode('disabled');

    this.trajectory = trajectory;
    this.sampleDuration = sampleDuration;
    //this.
    
    this.browser.callListener('fly-start', { 'startPosition' : this.trajectory[0],
        'endPosition' : this.trajectory[this.trajectory.length - 1],
        'options' : options
    });
    
    this.timeStart = performance.now();
    this.finished = false;
};


Autopilot.prototype.tick = function() {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var time = performance.now(), pos;
    var timeFactor =  (time - this.lastTime) / 1000; 
    this.lastTime = time;

    if (this.browser.ui && this.browser.ui.loading &&
        this.browser.ui.loading.control.getVisible()) {
        return;
    }


    if (this.autoRotate != 0) {
        pos = map.getPosition();
        var o = pos.getOrientation();
        o[0] = (o[0] + this.autoRotate*timeFactor) % 360;
        pos.setOrientation(o);
        map.setPosition(pos);
    }
    
    if (this.autoPan != 0) {
        pos = map.getPosition();
        pos = map.movePositionCoordsTo(pos, this.autoPanAzimuth, pos.getViewExtent()*(this.autoPan*0.01)*timeFactor, 0);
        map.setPosition(pos);
    }

    if (this.finished || !this.trajectory) {
        return;
    }
    
    time = time - this.timeStart;
    var sampleIndex =  Math.floor((time / this.sampleDuration)*this.speed);
    var totalSamples = this.trajectory.length - 1; 

    if (sampleIndex < totalSamples) {
        //interpolate
        map.setPosition(this.trajectory[sampleIndex]);        
        //console.log(JSON.stringify(this.trajectory[sampleIndex]));

        this.browser.callListener('fly-progress', { 'position' : this.trajectory[sampleIndex],
            'progress' : 100 * (sampleIndex / totalSamples)
        });

    } else {
        map.setPosition(this.trajectory[totalSamples]);
        //console.log(JSON.stringify(this.trajectory[totalSamples]));
    } 
    
    if (sampleIndex >= this.trajectory.length) {
        this.browser.callListener('fly-end', { 'position' : this.trajectory[totalSamples] });

        this.browser.getControlMode().setCurrentControlMode(this.lastControlMode);
        this.finished = true;
    } 
};


Autopilot.prototype.generateTrajectory = function(p1, p2, options) {
    var map = this.browser.core.map;
    if (!map) {
        return;
    }
    
    options = options || {};
    return map.generateTrajectory(p1, p2, options);
};


Autopilot.prototype.generatePIHTrajectory = function(position, azimuth, distance, options) {
    var map = this.browser.core.map;
    if (!map) {
        return;
    }
    
    options = options || {};
    return map.generatePIHTrajectory(position, azimuth, distance, options);
};


export default Autopilot;

