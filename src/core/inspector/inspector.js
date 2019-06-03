
import {mat4 as mat4_} from '../utils/matrix';
import {math as math_} from '../utils/math';
import {utils as utils_} from '../utils/utils';
import InspectorInput_ from './input';
import InspectorStats_ from './stats';
import InspectorGraphs_ from './graphs';
import InspectorLayers_ from './layers';
import InspectorReplay_ from './replay';
import InspectorStylesheets_ from './stylesheets';

//get rid of compiler mess
var mat4 = mat4_;
var math = math_;
var utils = utils_;
var InspectorInput = InspectorInput_;
var InspectorStats = InspectorStats_;
var InspectorGraphs = InspectorGraphs_;
var InspectorLayers = InspectorLayers_;
var InspectorReplay = InspectorReplay_;
var InspectorStylesheets = InspectorStylesheets_;


var Inspector = function(core) {
    this.core = core;
    this.enabled = false;
    this.input = new InspectorInput(this);
    this.stats = new InspectorStats(this);
    this.graphs = new InspectorGraphs(this);
    this.layers = new InspectorLayers(this);
    this.replay = new InspectorReplay(this);
    this.stylesheets = new InspectorStylesheets(this);

    if (this.core.config.inspector) {
        this.input.init();
    }

    this.shakeCamera = false; 
    this.drawReplayCamera = false; 
    this.drawRadar = false;
    this.radarLod = null;
    this.debugValue = 0;
    this.measureMode = false;
    this.measurePoints = [];
};


Inspector.prototype.enableInspector = function() {
    if (!this.enabled) {
        this.stats.init();
        this.graphs.init();
        this.layers.init();
        this.replay.init();
        this.stylesheets.init();

        //load image    
        if (!this.circleImage) {
            this.circleImage = utils.loadImage(
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACW9GRnMAAAAgAAAA4ACD+EAUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA/UlEQVRYw+2VPwqDMBTG3dz1Am56EnH2XLroETxGuwc3Z7cOdhY8QJpfSUBspUvStJAPPggvD973/uQligICAgL+DKViqygUV02hbaXLwJlio7gpyhNu2idzEXwwgfI8H+u6vnZdN/V9P3EuimLcCRlsiyArGcfxjWDLsmzyAGzc4aNFNDZ7/iw7AeQH4LNrh5WZYLgkJTaZCyHuVVVdkiSZ0zSdOWMzlaBFWkRrQ4A4Zk/A4wBie1MFYUMAz0wybCYAmR8FUAlzj6+2r18TgM2VAO8tOB1Cyk7mrofQ+zP0voheVjHtIBjDxjrmvCu7k1Xs/TP6ie84ICDAGR5uCYdPo0MWiAAAAABJRU5ErkJggg==',
                    //"http://maps.google.com/mapfiles/kml/shapes/placemarkcircle.png",
                    (function(){
                        this.circleTexture = this.core.getRendererInterface().createTexture({ 'source': this.circleImage });
                    }).bind(this)
                );
        }

        this.core.on('map-update', this.onMapUpdate.bind(this));
        this.enabled = true;
    }
};


Inspector.prototype.setParameter = function(key, value) {
    this.input.setParameter(key, value);
};

Inspector.prototype.addStyle = function(string) {
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = string;
    document.getElementsByTagName('head')[0].appendChild(style);
};


//used to block mouse events
Inspector.prototype.doNothing = function(e) {
    e.stopPropagation();
    return false;
};


Inspector.prototype.preventDefault = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};


Inspector.prototype.onMapUpdate = function() {
    var map = this.core.getMapInterface();
    if (!map) {
        return;
    }

    if (this.shakeCamera) {
        map.redraw();
    } 

    /*if (this.measureMode) {
        var renderer = this.core.getRenderer();
        var p = map.convertCoordsFromPhysToNav(this.measurePoints[0]);
        map.convertCoordsFromPhysToCanvas(this.measurePoints[0]);
    }*/

    var renderer = this.core.getRendererInterface(), i, li, j, lj, lines, slines, p;

    if (this.replay.drawGlobe) {
        p = map.convertCoordsFromPhysToCameraSpace([0,0,0]);
        var renderer2 = this.core.getRenderer();
        renderer2.draw.drawTBall(p, 12742000 * 0.5, renderer2.progStardome, this.replay.globeTexture, 12742000 * 0.5, true);
    }

    if (this.replay.drawCamera) {
        lines = this.replay.cameraLines;
        slines = []; 
        //for (i = 0, li = lines.length; i < li; i++) {
          //  slines.push(map.convertCoordsFromPhysToCanvas(lines[i]));
        //}
        
        renderer.drawLineString({
            points : lines,
            size : 2.0,
            color : [0,128,255,255],
            depthTest : false,
            screenSpace : false,
            blend : false
        });            

        lines = this.replay.cameraLines3;
        for (i = 0, li = lines.length; i < li; i++) {
            slines = []; 
            for (j = 0, lj = lines[i].length; j < lj; j++) {
                //slines.push(map.convertCoordsFromPhysToCanvas(lines[i][j]));
                slines.push(lines[i][j]);
            }

            renderer.drawLineString({
                points : slines,
                size : 2.0,
                color : [0,255,128,255],
                depthTest : false,
                screenSpace : false,
                blend : false
            });   
        }

        lines = this.replay.cameraLines2;
        for (i = 0, li = lines.length; i < li; i++) {
            slines = []; 
            for (j = 0, lj = lines[i].length; j < lj; j++) {
                //slines.push(map.convertCoordsFromPhysToCanvas(lines[i][j]));
                slines.push(lines[i][j]);
            }

            renderer.drawLineString({
                points : slines,
                size : 2.0,
                color : [0,255,255,255],
                depthTest : false,
                screenSpace : false,
                blend : false
            });   
        }


        var cameInfo = map.getCameraInfo();
        var p1 = map.convertCoordsFromPhysToCameraSpace(this.replay.cameraLines[0]);

        //var map2 = this.core.getMap();
    
        //var m2 = map2.camera.getRotationviewMatrix();
        var mv = mat4.create(this.replay.cameraMatrix);
        //mat4.inverse(m2, mv);
    
        //matrix which tranforms mesh position and scale
        /*
        var mv = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            p1[0], p1[1], p1[2], 1
        ];*/
        mv[12] = p1[0];
        mv[13] = p1[1];
        mv[14] = p1[2];
    
        //setup material 
        var material = [ 
            255,128,128, 0, //ambient,
            0,0,0,0, //diffuse
            0,0,0,0, //specular 
            0,0.5,0,0 //shininess, alpha,0,0
        ];
    
        //multiply cube matrix with camera view matrix
        mat4.multiply(cameInfo.viewMatrix, mv, mv);
    
        var norm = [
            0,0,0,
            0,0,0,
            0,0,0
        ];
    
        //normal transformation matrix
        mat4.toInverseMat3(mv, norm);
    
        renderer.setState(this.replay.frustumState);
    
        //draw cube
        renderer.drawMesh({
            mesh : this.replay.frustumMesh,
            texture : null,
            shader : 'shaded',
            shaderVariables : {
                'uMV' : ['mat4', mv],
                'uNorm' : ['mat3', norm],
                'uMaterial' : ['mat4', material]
            }
        });
    }
    
    if (this.drawRadar && this.circleTexture) {
        //var renderer = this.core.getRendererInterface();
        var pos = map.getPosition();
        var count = 16;
        var step = pos.getViewExtent() / (count * 4);

        var cbuffer = new Array(count * count);

/*        
        var coords = pos.getCoords();

        for (var j = 0; j < count; j++) {
            for (var i = 0; i < count; i++) {
                var screenCoords = map.convertCoordsFromNavToCanvas([coords[0] + i*step - count*0.5*step,
                                                                       coords[1] + j*step - count*0.5*step, 0], "float", this.radarLod);
        
                cbuffer[j * count + i] = screenCoords;
            }            
        }
*/


        for (j = 0; j < count; j++) {
            for (i = 0; i < count; i++) {
                var dx =  i*step - count*0.5*step;
                var dy =  j*step - count*0.5*step;
                var a = Math.atan2(dy, dx);
                var l = Math.sqrt(dx*dx + dy*dy);

                var pos2 = map.movePositionCoordsTo(pos, math.degrees(a), l);
                var coords = pos2.getCoords();
                
                var screenCoords = map.convertCoordsFromNavToCanvas([coords[0], coords[1], 0], 'float', this.radarLod);

                cbuffer[j * count + i] = screenCoords;
            }            
        }


        var lbuffer = new Array(count);

        for (j = 0; j < count; j++) {
            for (i = 0; i < count; i++) {
                lbuffer[i] =  cbuffer[j * count + i];
            }
            
            renderer.drawLineString({
                points : lbuffer,
                size : 2.0,
                screenSpace : true,
                color : [0,255,255,255],
                depthTest : false,
                blend : false
            });            
        }


        for (i = 0; i < count; i++) {
            for (j = 0; j < count; j++) {
                lbuffer[j] =  cbuffer[j * count + i];
            }
            
            renderer.drawLineString({
                points : lbuffer,
                size : 2.0,
                screenSpace : true,
                color : [0,255,255,255],
                depthTest : false,
                blend : false
            });            
        }

        for (i = 0, li = cbuffer.length; i < li; i++) {
            p = cbuffer[i];
            renderer.drawImage({
                rect : [p[0]-10, p[1]-10, 20, 20],
                texture : this.circleTexture,
                color : [255,0,255,255],
                depth : p[2],
                depthTest : false,
                blend : true
            });
        }
    }
};


export default Inspector;
