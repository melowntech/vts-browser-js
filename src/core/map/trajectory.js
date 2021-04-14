
import {math as math_} from '../utils/math';

//get rid of compiler mess
var math = math_;


var MapTrajectory = function(map, p1, p2, options) {
    this.map = map;
    this.p1 = p1.clone();
    this.p2 = p2.clone();
    this.op2 = p2.clone();

    var hm1 = this.p1.getHeightMode();
    var hm2 = this.p2.getHeightMode();
    
    if (hm1 == 'fix' && hm2 == 'float') {
        this.p1 = this.map.convert.convertPositionHeightMode(this.p1, 'float', true);
    } else if (hm1 == 'float' && hm2 == 'fix') {
        this.p1 = this.map.convert.convertPositionHeightMode(this.p1, 'fix', true);
    } 
    
    var vm1 = this.p1.getViewMode();
    var vm2 = this.p2.getViewMode();

    if (vm1 == 'subj' && vm2 == 'obj') {
        this.p2 = this.map.convert.convertPositionViewMode(this.p2, 'subj');
    } else if (vm1 == 'obj' && vm2 == 'subj') {
        this.p1 = this.map.convert.convertPositionViewMode(this.p1, 'subj');
    } 
    
    this.p1.pos[5] = this.p1.pos[5] < 0 ? (360 + (this.p1.pos[5] % 360)) : (this.p1.pos[5] % 360);  
    this.p2.pos[5] = this.p2.pos[5] < 0 ? (360 + (this.p2.pos[5] % 360)) : (this.p2.pos[5] % 360);  
    
    this.pp1 = this.p1.clone();

    this.mode = options['mode'] || 'auto';
    this.submode = options['submode'] || 'none';
    this.submode = 'none';
    this.maxHeight = options['maxHeight'] || 1000000000;
    this.minDuration = options['minDuration'] || 0;
    this.maxDuration = options['maxDuration'] || 10000;
    this.samplePeriod = options['samplePeriod'] || 10;
    this.fade = options['fade'] || 'none';
    this.fadePower = options['fadePower'] || 1;
    this.yawInterpolation = options['yawInterpolation'] || 'shortest';

    this.pv = options['pv'] || 0.15;

    if (!this.map.getNavigationSrs().isProjected()) {
        this.geodesic = this.map.measure.getGeodesic();
    } 
    
    if (options['distanceAzimuth']) {
        this.distanceAzimuth = true;
        
        this.pp2 = this.p1.clone();
        if (options['destHeight']) {
            this.pp2.setHeight(options['destHeight']);
        }

        if (options['destOrientation']) {
            this.pp2.setHeight(options['destOrientation']);
        }
        
        if (options['destFov']) {
            this.pp2.setHeight(options['destFov']);
        }

        this.geoAzimuth = options['azimuth'] || 0; 
        this.geoDistance = options['distance'] || 100;
        this.distance = this.geoDistance; 
        this.azimuth = this.geoAzimuth % 360;
        this.azimuth = (this.azimuth < 0) ? (360 + this.azimuth) : this.azimuth;

    } else {
        this.distanceAzimuth = false;
            
        this.pp2 = this.p2.clone();

        //get distance and azimut
        var res = this.map.measure.getDistance(this.pp1.getCoords(), this.pp2.getCoords());
        this.distance = res[0];
        this.azimuth = (res[1] + 90) % 360;
        this.azimuth = (this.azimuth < 0) ? (360 + this.azimuth) : this.azimuth;

        if (!this.map.getNavigationSrs().isProjected()) {
            res = this.geodesic.Inverse(this.pp1.pos[2], this.pp1.pos[1], this.pp2.pos[2], this.pp2.pos[1]);
            this.geoAzimuth = res.azi1; 
            this.geoDistance = res.s12;
            this.azimuth = this.geoAzimuth % 360;
            this.azimuth = (this.azimuth < 0) ? (360 + this.azimuth) : this.azimuth;
        }
    }
    
    //console.log("azim: " + Math.round(this.azimuth) + " p1: " + this.p1.pos[5]  + " p2: " + this.p2.pos[5]);

    this.detectMode();
    this.detectDuration();
    this.detectFlightHeight(options['height']);
};


MapTrajectory.prototype.detectFlightHeight = function(flightHeight) {
    if (this.mode == 'ballistic') {
        this.flightHeight = Math.max(this.pp1.getHeight(), this.pp2.getHeight());
        this.flightHeight += flightHeight || (this.distance * 0.5);
        this.flightHeight = Math.min(this.flightHeight, this.maxHeight);
        this.flightHeight -= Math.max(this.pp1.getHeight(), this.pp2.getHeight());
    }
};


MapTrajectory.prototype.detectMode = function() {
    if (this.mode == 'auto') {
        this.mode = (this.distance > 2000) ? 'ballistic' : 'direct';
    }
};


MapTrajectory.prototype.detectDuration = function() {
    this.duration = 0;
    this.headingDuration = 1000;
    
    if (this.distance < 500) {
        this.duration = 1000;
    } else if (this.distance < 2000) {
        this.duration = 2000;
    } else {
        this.duration = this.distance / 100;

        if (this.duration < 300) {
            this.duration = 3000;
        } else {
            this.headingDuration = 1500;
        }
        
        if (this.duration < 6000) {
            this.duration = 6000;
        }

        if (this.duration > 10000) {
            this.duration = 10000;
        }

        if (this.mode != 'direct') {
            this.duration *= 1.8;
            this.headingDuration *= 1.8;
        }
    }
    
    if (this.mode != 'direct') {
        var minDuration = 3 * this.headingDuration; 
        this.duration = Math.max(this.duration, minDuration);
        
        if (this.maxDuration < minDuration) {
            this.duration = this.maxDuration;
            this.headingDuration = this.maxDuration / 3;
        }   
    }    
    
    this.duration = Math.min(this.duration, this.maxDuration);
    this.duration = Math.max(this.duration, this.minDuration);
};

    
MapTrajectory.prototype.generate = function() {
    var samples = new Array(Math.ceil(this.duration / this.samplePeriod)+(this.distanceAzimuth?0:1));
    var index = 0;
    
    for (var time = 0; time <= this.duration; time += this.samplePeriod) {
        var factor = time / this.duration;

        var p = this.pp1.clone(), x, coords;
        
        if (this.mode == 'direct') {

            x = factor;
            
            switch(this.fade) {
            case 'in':
                switch(this.fadePower) {
                case 1: factor = x*x; break;
                case 2: factor = x*x*x; break;
                case 3: factor = x*x*x*x; break;
                case 4: factor = x*x*x*x*x; break;
                case 5: factor = x*x*x*x*x*x; break;
                case 6: factor = x*x*x*x*x*x*x; break;
                }
                break;

            case 'out':
                x = 1 - x;
                switch(this.fadePower) {
                case 1: factor = 1 - (x*x); break;
                case 2: factor = 1 - (x*x*x); break;
                case 3: factor = 1 - (x*x*x*x); break;
                case 4: factor = 1 - (x*x*x*x*x); break;
                case 5: factor = 1 - (x*x*x*x*x*x); break;
                case 6: factor = 1 - (x*x*x*x*x*x*x); break;
                }
                break;

            case 'inout':
                switch(this.fadePower) {
                case 1: factor = x*x*(3 - 2*x); break;
                case 2: factor = x*x*x * (x * (6*x - 15) + 10); break;
                case 3: factor = x*x*(3 - 2*x); x = factor; factor = x*x*(3 - 2*x); break;
                case 4: factor = x*x*x * (x * (6*x - 15) + 10); x = factor; factor = x*x*x * (x * (6*x - 15) + 10); break;
                case 5: factor = x*x*(3 - 2*x); x = factor; factor = x*x*(3 - 2*x); x = factor; factor = x*x*(3 - 2*x); break;
                case 6: factor = x*x*x * (x * (6*x - 15) + 10); x = factor; factor = x*x*x * (x * (6*x - 15) + 10); x = factor; factor = x*x*x * (x * (6*x - 15) + 10); break;
                }
                break;
            }
            
            p.setCoords(this.getInterpolatedCoords(factor));
            p.setHeight(this.getInterpolatedHeight(factor));
            
            var o1 = this.pp1.getOrientation(); 
            var o2 = this.pp2.getOrientation(); 

            p.setOrientation(this.getInterpolatedOrinetation(o1, o2, factor));
            p.setFov(this.getInterpolatedFov(factor));
            p.setViewExtent(this.getInterpolatedViewExtent(factor));
            
            samples[index] = p.pos;
            index++;
        } else {

            //http://en.wikipedia.org/wiki/Smoothstep
            x = factor;
            factor =  x*x*(3 - 2*x);
            x = factor;
            factor =  x*x*(3 - 2*x);

            //factor2 includes slow start and end of flight
            var factor2 =  this.getSmoothFactor(time);
            
            if (this.submode == 'piha') {
                
                var distanceFactor = (this.distance / this.duration * (time - this.duration / (2 * Math.PI) * Math.sin(2 * Math.PI / this.duration * time))) / this.distance;

                //var f = (time / this.duration) * Math.PI * 2;
                //var distanceFactor = ((f - Math.sin(f)) / (2 * Math.PI));
                
                var pv = this.pv;
                var h1 = this.pp1.getCoords()[2]; 
                var h2 = this.pp2.getCoords()[2]; 

                var height = this.distance / ((this.duration*0.001) * pv * Math.tan(math.radians(this.pp1.getFov()) * 0.5))
                              * (1 - Math.cos(2 * Math.PI * time / this.duration))
                              + h1 + (h2 - h1) * time  / this.duration;

                coords = this.getInterpolatedCoords(distanceFactor);

                p.setCoords(coords);
                p.setHeight(height);            
            } else {

                coords = this.getInterpolatedCoords(factor2);
    
                p.setCoords(coords);
                p.setHeight(this.getSineHeight(factor));            
            }
            
            if (coords[3] != null) { //used for correction in planet mode
                this.azimuth = -coords[3];
            }

            p.setOrientation(this.getFlightOrienation(time));
            p.setFov(this.getInterpolatedFov(factor));
            p.setViewExtent(this.getInterpolatedViewExtent(factor));
            
            //p.convertViewMode("subj");
            //console.log("pos: " + p.toString());

            samples[index] = p.pos;
            samples[index] = p.pos;
            index++;
        }
    }
    
    if (!this.distanceAzimuth) {
        samples[index] = this.op2.clone().pos;
    }

    //console.log("pos2: " + this.p2.toString());

    return samples;
};


MapTrajectory.prototype.getInterpolatedCoords = function(factor) {
    var c1 = this.pp1.getCoords(); 
    var c2 = this.pp2.getCoords(); 

    if (!this.map.getNavigationSrs().isProjected()) {
        var res = this.geodesic.Direct(c1[1], c1[0], this.geoAzimuth, this.geoDistance * factor);

        var azimut = res.azi1 - res.azi2;

        //var azimut = (azimut - 90) % 360;
        azimut = (this.azimuth < 0) ? (360 + azimut) : azimut;

        //azimut = this.azimuth;


        return [ res.lon2, res.lat2,
            c1[2] + (c2[2] - c1[2]) * factor, azimut];

    } else {
        return [ c1[0] + (c2[0] - c1[0]) * factor,
            c1[1] + (c2[1] - c1[1]) * factor,
            c1[2] + (c2[2] - c1[2]) * factor ];
    }
};


MapTrajectory.prototype.getInterpolatedOrinetation = function(o1, o2, factor) {
    var od1 = o2[0] - o1[0];
    var od2 = o2[1] - o1[1];
    var od3 = o2[2] - o1[2];

    if (this.yawInterpolation == 'shortest' || this.yawInterpolation == 'longest') {
        if (Math.abs(od1) > 180) {
            if (od1 > 0) {
                od1 = -(360 - od1);
            } else {
                od1 = 360 - Math.abs(od1);
            }
        }
    }

    if (this.yawInterpolation == 'longest') {
        if (od1 < 0) {
            od1 = 360 + od1;
        } else {
            od1 = (-360) + od1;
        }
    }

    return [ o1[0] + od1 * factor,
        o1[1] + od2 * factor,
        o1[2] + od3 * factor ];
};


MapTrajectory.prototype.getInterpolatedFov = function(factor) {
    var f1 = this.pp1.getFov(); 
    var f2 = this.pp2.getFov(); 
    return f1 + (f2 - f1) * factor;
};


MapTrajectory.prototype.getInterpolatedViewExtent = function(factor) {
    var v1 = this.pp1.getViewExtent(); 
    var v2 = this.pp2.getViewExtent(); 
    return v1 + (v2 - v1) * factor;
};


MapTrajectory.prototype.getInterpolatedHeight = function(factor) {
    var h1 = this.pp1.getHeight(); 
    var h2 = this.pp2.getHeight(); 
    return h1 + (h2 - h1) * factor;
};


MapTrajectory.prototype.getSineHeight = function(factor) {
    var c1 = this.pp1.getCoords(); 
    var c2 = this.pp2.getCoords(); 

    return c1[2] + (c2[2] - c1[2]) * factor +
           Math.sin(Math.PI * factor) * this.flightHeight;
};


MapTrajectory.prototype.getSmoothFactor = function(time) {
    var x = 0;

    if (time < this.headingDuration) {
        x = 0;
    } else if (time > (this.duration - this.headingDuration)) {
        x = 1.0;
    } else {
        x = Math.min(1.0, (time-this.headingDuration) / (this.duration - this.headingDuration*2));
    }

    x = x*x*(3 - 2*x);
    return x*x*(3 - 2*x);
};


MapTrajectory.prototype.getFlightOrienation = function(time) {
    var o1 = null;
    var o2 = null;
    var fo = [0, -90, 0]; //flight orientation
    var factor = 0;

    //get fly direction angle
    fo[0] = this.azimuth % 360;

    if (fo[0] < 0) {
        fo[0] = 360 - Math.abs(fo[0]);
    }

    if (time <= this.headingDuration) { //start sequence
        factor = time / this.headingDuration;
        o1 = this.pp1.getOrientation();
        o2 = fo;
    } else if (time >= this.duration - this.headingDuration) { //end sequence
        factor = (time - (this.duration - this.headingDuration)) / this.headingDuration;
        o1 = fo;
        o2 = this.pp2.getOrientation();
    } else { //fly sequence
        factor = 0;
        o1 = fo;
        o2 = fo;
    }    
    
    return this.getInterpolatedOrinetation(o1, o2, factor);
};


export default MapTrajectory;



