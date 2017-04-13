
import {mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';
import MapPosition_ from './position';
import GeographicLib_ from 'geographiclib';

//get rid of compiler mess
var mat4 = mat4_;
var math = math_;
var MapPosition = MapPosition_;
var GeographicLib = GeographicLib_;


var MapConvert = function(map) {
    this.map = map;
    this.config = map.config;
    this.measure = map.measure;
    this.isProjected = this.map.getNavigationSrs().isProjected()
};


MapConvert.prototype.convertCoords = function(coords, source, destination) {
    return this.map.referenceFrame.convertCoords(coords, source, destination);
};


MapConvert.prototype.movePositionCoordsTo = function(position, azimuth, distance, azimuthCorrectionFactor) {
    var coords = position.getCoords();
    var navigationSrsInfo = this.map.getNavigationSrs().getSrsInfo();
    azimuthCorrectionFactor = (azimuthCorrectionFactor == null) ? 1 : azimuthCorrectionFactor; 

    if (this.isProjected) {
        var yaw = math.radians(azimuth);
        var forward = [-Math.sin(yaw), Math.cos(yaw)];

        position.setCoords2([coords[0] + (forward[0]*distance),
                              coords[1] + (forward[1]*distance)]);
    } else {
        var navigationSrsInfo = this.map.getNavigationSrs().getSrsInfo();

        var geod = new GeographicLib.Geodesic.Geodesic(navigationSrsInfo["a"],
                                                      (navigationSrsInfo["a"] / navigationSrsInfo["b"]) - 1.0);

        var r = geod.Direct(coords[1], coords[0], azimuth, distance);
        position.setCoords2([r.lon2, r.lat2]);

        var orientation = position.getOrientation();

        //console.log("corerction: " + (r.azi1 - r.azi2));

        orientation[0] += (r.azi1 - r.azi2) * azimuthCorrectionFactor;
        //orientation[0] -= (r.azi1 - r.azi2); 

        //if (!skipOrientation) {
            position.setOrientation(orientation);
        //}
        
        //console.log("azimuthCorrection: " + azimuthCorrectionFactor);
        //console.log("oldpos: " + JSON.stringify(this));
        //console.log("newpos: " + JSON.stringify(pos2));
    }
    
    return position;
};


MapConvert.prototype.convertPositionViewMode = function(position, mode) {
    if (mode == position.pos[0]) {
        return position;
    }

    if (mode == "obj") {
        if (position.getHeightMode() == "float") {
            var covertToFloat = true;
            this.convertPositionHeightMode(position, "fix", true);
        }
        
        var distance = position.getViewDistance();
        var orientation = position.getOrientation();
        
        //get height delta
        var pich = math.radians(-orientation[1]);
        var heightDelta = distance * Math.sin(pich);

        //reduce distance by pich
        distance *= Math.cos(pich);

        if (this.isProjected) {
            //get forward vector
            var yaw = math.radians(orientation[0]);
            var forward = [-Math.sin(yaw), Math.cos(yaw)];
    
            //get center coords 
            var coords = position.getCoords();
            coords[0] = coords[0] + (forward[0] * distance);
            coords[1] = coords[1] + (forward[1] * distance);
        } else {
            this.movePositionCoordsTo(position, -orientation[0], distance);
            var coords = position.getCoords();
        }
        
        coords[2] -= heightDelta;
        position.setCoords(coords);

        if (covertToFloat) {
            this.convertPositionHeightMode(position, "float", true);
        }
        
    } else if (mode == "subj") {
        var coords = this.getPositionCameraCoords(position, position.getHeightMode());
        position.setCoords(coords);
                
        //TODO: take in accout planet ellipsoid
    }

    position.pos[0] = mode;

    return position;
};


MapConvert.prototype.convertPositionHeightMode = function(position, mode, noPrecisionCheck) {
    if (position.pos[3] == mode) {
        return position;
    }

    var lod =  this.measure.getOptimalHeightLod(position.getCoords(), position.getViewExtent(), this.config.mapNavSamplesPerViewExtent);
    var height = this.measure.getSurfaceHeight(position.getCoords(), lod);

    if (height[1] == false && !noPrecisionCheck) {
        //return null;
    }

    //set new height
    if (mode == "float") {
        position.pos[3] = mode;
        position.pos[4] = position.pos[4] - height[0];
    } else if (mode == "fix") {
        position.pos[3] = mode;
        position.pos[4] = position.pos[4] + height[0];
    }

    return position;
};


MapConvert.prototype.getPositionCameraCoords = function(position, heightMode) {
    var orientation = position.getOrientation();
    var rotMatrix = mat4.create();
    mat4.multiply(math.rotationMatrix(2, math.radians(orientation[0])), math.rotationMatrix(0, math.radians(orientation[1])), rotMatrix);

    if (position.getViewMode() == "obj") {
        var coords = position.getCoords();
        var terrainHeight = 0;
        var lod = -1;

        //convert height to fix
        if (position.getHeightMode() == "float") {
            lod = this.measure.getOptimalHeightLod(coords, position.getViewExtent(), this.config.mapNavSamplesPerViewExtent);
            var surfaceHeight = this.measure.getSurfaceHeight(coords, lod);
            terrainHeight = surfaceHeight[0];
        }

        var camInfo = this.measure.getPositionCameraInfo(position, this.isProjected);

        if (this.isProjected) {
            //var distance = (this.getViewExtent()) / Math.tan(math.radians(this.getFov()*0.5));
            //var orbitPos = [0, -distance, 0];
            //math.mat4.multiplyVec3(rotMatrix, orbitPos);

            coords[0] += camInfo.orbitCoords[0];
            coords[1] += camInfo.orbitCoords[1];
            coords[2] += camInfo.orbitCoords[2] + terrainHeight;
        } else {
            var worldPos = this.convertCoords([coords[0], coords[1], coords[2] + terrainHeight], "navigation", "physical");
            worldPos[0] += camInfo.orbitCoords[0];
            worldPos[1] += camInfo.orbitCoords[1];
            worldPos[2] += camInfo.orbitCoords[2];// + terrainHeight;

            coords = this.convertCoords(worldPos, "physical", "navigation");
        }

        if (heightMode == "fix") {
            return coords;
        } else {
            //get float height for new coords
            if (lod == -1) {
                lod =  this.measure.getOptimalHeightLod(coords, position.getViewExtent(), this.config.mapNavSamplesPerViewExtent);
            }
            
            var surfaceHeight = this.measure.getSurfaceHeight(coords, lod);
            coords[2] -= surfaceHeight[0];

            return coords;
        }

    } else {

        if (position.getHeightMode() == heightMode) {
            return position.getCoords();
        } else {
            var lod =  this.measure.getOptimalHeightLod(position.getCoords(), position.getViewExtent(), this.config.mapNavSamplesPerViewExtent);
            var surfaceHeight = this.measure.getSurfaceHeight(position.getCoords(), lod);
            //height += surfaceHeight[0];

            var coords = position.getCoords();

            if (heightMode == "fix") {
                coords[2] += surfaceHeight[0];
            } else {
                coords[2] -= surfaceHeight[0];
            }

            return coords;
        }
    }
};


MapConvert.prototype.getPositionPhysCoords = function(position, lod) {
    var coords = position.getCoords();

    if (position.getHeightMode() == "float") {
        lod =  (lod != null) ? lod : this.measure.getOptimalHeightLod(position.getCoords(), position.getViewExtent(), this.config.mapNavSamplesPerViewExtent);
        var surfaceHeight = this.measure.getSurfaceHeight(position.getCoords(), lod);
        coords[2] += surfaceHeight[0]; 
    }

    return this.convertCoords(coords, "navigation", "physical");
};


MapConvert.prototype.getPositionCameraSpaceCoords = function(position, lod) {
    var coords = position.getCoords();

    if (position.getHeightMode() == "float") {
        lod =  (lod != null) ? lod : this.measure.getOptimalHeightLod(position.getCoords(), position.getViewExtent(), this.config.mapNavSamplesPerViewExtent);
        var surfaceHeight = this.measure.getSurfaceHeight(position.getCoords(), lod);
        coords[2] += surfaceHeight[0]; 
    }

    var worldPos = this.convertCoords(coords, "navigation", "physical");
    var camPos = this.map.camera.position;
    worldPos[0] -= camPos[0];
    worldPos[1] -= camPos[1];
    worldPos[2] -= camPos[2];
  
    return worldPos;
};


MapConvert.prototype.getPositionCanvasCoords = function(position, lod, physical) {
    if (physical) {
        var camPos = this.map.camera.position;
        var coords = position.getCoords();
        var worldPos = [coords[0] - camPos[0],
                         coords[1] - camPos[1],
                         coords[2] - camPos[2]];
    } else {
        var worldPos = this.getPositionCameraSpaceCoords(position, lod);
    }
    
    return this.map.renderer.project2(worldPos, this.map.camera.getMvpMatrix());
};


export default MapConvert;
