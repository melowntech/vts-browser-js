
import {vec3 as vec3_} from '../utils/matrix';
import {math as math_} from '../utils/math';

//get rid of compiler mess
var vec3 = vec3_;
var math = math_;


var MapCamera = function(map) {
    this.map = map;
    this.camera = map.renderer.camera;
    this.distance = 10;
    this.distance2 = 10;
    this.position = [0,0,0];
    this.vector = [0,0,1];
    this.vector2 = [0,0,1,1];
    this.center = [0,0,0];
    this.height = 0;
    this.terrainHeight = 0;
    this.lastTerrainHeight = 0;
    this.near = 2;
};


MapCamera.prototype.update = function() {
    var map = this.map;

    //check position orientaion ...
    map.position.check();

    //var height = 227;
    var height = map.position.getHeight();

    var lod =  map.measure.getOptimalHeightLod(map.position.getCoords(), map.position.getViewExtent(), map.config.mapNavSamplesPerViewExtent);
    //var surfaceHeight = [226,true,true]; //map.getSurfaceHeight(map.position.getCoords(), lod, true);
    var surfaceHeight = map.measure.getSurfaceHeight(map.position.getCoords(), lod, true);
    
    map.stats.heightTerrain = surfaceHeight[0];
    map.stats.heightDelta = height;

    //console.log("terrain height:" + surfaceHeight[0] + "  pos height:" + map.position.getHeight());

    if (map.position.getHeightMode() == 'float') {
        height += surfaceHeight[0];
    }

    if (map.renderer.useSuperElevation) {
        height = map.renderer.getSuperElevatedHeight(height);
    }

    var camInfo = map.measure.getPositionCameraInfo(map.position, map.getNavigationSrs().isProjected());

    this.camera.setPosition(camInfo.orbitCoords);
    this.camera.setRotationMatrix(camInfo.rotMatrix);
    this.vector = camInfo.vector;
    this.vector2 = camInfo.vector2;
    this.position = camInfo.orbitCoords;
    this.height = camInfo.orbitHeight + height;
    this.terrainHeight = this.height - surfaceHeight[0];

    //console.log(''+this.height + ' ' + this.terrainHeight + ' ' + surfaceHeight[0]);

    //get camera distance
    this.distance2 = map.position.getViewDistance();
    this.distance = Math.max(this.terrainHeight, this.distance2);
    this.distance = math.clamp(this.distance, 0.1, this.camera.getFar());

    this.distanceFactor = Math.tan(math.radians(map.position.getFov()*0.5)); 

    this.perceivedDistance = Math.max(this.terrainHeight, this.distance2 * this.distanceFactor);
    
    //this.renderer.cameraDistance = camInfo.distance; //needed for fog
    map.renderer.cameraDistance = this.distance; //needed for fog
    map.renderer.viewExtent = map.position.getViewExtent();

    this.camera.setViewHeight(map.position.getViewExtent());
    //this.camera.setOrtho(true);

    //convert nav coords to physical
    var coords = map.position.getCoords();
    var worldPos = map.convert.convertCoords([coords[0], coords[1], height], 'navigation', 'physical');
    this.center = [worldPos[0], worldPos[1], worldPos[2]];
    worldPos[0] += camInfo.orbitCoords[0];
    worldPos[1] += camInfo.orbitCoords[1];
    worldPos[2] += camInfo.orbitCoords[2];
    this.camera.setPosition([0,0,0]); //always zeros
    this.position = worldPos;

    this.vector2 = [-worldPos[0], -worldPos[1], -worldPos[2], 1];
    vec3.normalize(this.vector2);

    this.mapIsProjected = map.getNavigationSrs().isProjected();

    if (!this.mapIsProjected) { //HACK!!!!!!!!
        this.geocentDistance = vec3.length(this.position);

        var n = [0,0,0];
        vec3.normalize(this.position, n);
        this.geocentNormal = n;
    } else {
        this.vector2[3] = 0;
    }
    
    //console.log("word-pos: " + JSON.stringify(worldPos));

    //set near and far of camera by distance of orbit
    var factor = Math.max(this.height, this.distance) / 600000;

    var near = Math.max(this.near, this.near * (factor * 20));
    factor = Math.max(1.0, factor);
    var far = 600000 * (factor * 10);

    //console.log("near: " + near + "  far: " + far);

    this.camera.setParams(map.position.getFov()*0.5, near, far * 2.0);
    
    return camInfo;
};


MapCamera.prototype.getCameraHeight = function() {
    //TODO: get camera height
    //var cameraPos = this.camera.position;
    //return (this.camera.getPosition()[2] - this.planet.surfaceHeight([this.position[0] + cameraPos[0], this.position[1] + cameraPos[1]])[0]);

    //hack - distance intead of height
    //return this.cameraDistance;
    return this.cameraHeight;
};


MapCamera.prototype.getMvpMatrix = function() {
    return this.camera.getMvpMatrix();
};


MapCamera.prototype.getRotationMatrix = function() {
    return this.camera.getRotationMatrix();
};


MapCamera.prototype.getRotationviewMatrix = function() {
    return this.camera.getRotationviewMatrix();
};


MapCamera.prototype.getFar = function() {
    return this.camera.getFar();
};


MapCamera.prototype.getFov = function() {
    return this.camera.getFov();
};


MapCamera.prototype.getAspect = function() {
    return this.camera.getAspect();
};


export default MapCamera;


