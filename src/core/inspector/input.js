

import {utils as utils_} from '../utils/utils';

//get rid of compiler mess
var utils = utils_;


var InspectorInput = function(inspector) {
    this.inspector = inspector;
    this.core = inspector.core;
};


InspectorInput.prototype.init = function() {
    //mouse events
    //document.addEventListener("click", this.onKeyClick.bind(this), false);

    //keyboard events
    document.addEventListener('keyup', this.onKeyUp.bind(this), false);
    document.addEventListener('keypress', this.onKeyPress.bind(this), false);
    document.addEventListener('keydown', this.onKeyDown.bind(this), false);
};


//keyboard events
InspectorInput.prototype.onKeyDown = function(event) {
    if (typeof event == 'undefined') {
        event = window.event;
    }

    this.altDown = event.altKey;
    this.ctrlDown = event.ctrlKey;
    this.shiftDown = event.shiftKey;

    this.onKeyUp(event, true);
};


InspectorInput.prototype.onKeyPress = function(event) {
    this.onKeyUp(event, true);
};


InspectorInput.prototype.onKeyUp = function(event, press) {
    if (typeof event == 'undefined') {
        event = window.event;
    }

    var map = this.core.getMap();
    var inspector = this.inspector;

    if (map == null) {
        return;
    }

    var debug = map.draw.debug;

    this.altDown = event.altKey;
    this.ctrlDown = event.ctrlKey;
    this.shiftDown = event.shiftKey;

    var hit = false;
    var blockHit = true;

    if (event) {
        var keyCode;

        if (window.event) {         // eg. IE
            keyCode = window.event.keyCode;
        } else if (event.which) {   // eg. Firefox
            keyCode = event.which;
        } else {
            keyCode = event.charCode;
        }

        if (this.shiftDown) {
            if (this.ctrlDown) {
                switch(keyCode) {
                case 68:
                case 100:
                    inspector.preventDefault(event); break;  //key D pressed
                }
            }
        }

        if (this.shiftDown && press !== true) {

            switch(keyCode) {
            case 76:
            case 108:
                /*this.showMenu(); this.toolbarItemSelected('link'); done();*/  break;  //key L pressed

            case 71:
            case 103:
                /*this.showMenu(); this.toolbarItemSelected('position'); done();*/ break; //key G pressed

            case 65:
            case 97:
                /*this.engine.setAutorotate(1);*/ break;  //key A pressed
            }

            if (this.ctrlDown) {

                switch(keyCode) {
                case 68:
                case 100:
                    
                    inspector.enableInspector();
                    //load image    
                        
                    if (!inspector.circleImage) {
                        inspector.circleImage = utils.loadImage(
                                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACW9GRnMAAAAgAAAA4ACD+EAUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA/UlEQVRYw+2VPwqDMBTG3dz1Am56EnH2XLroETxGuwc3Z7cOdhY8QJpfSUBspUvStJAPPggvD973/uQligICAgL+DKViqygUV02hbaXLwJlio7gpyhNu2idzEXwwgfI8H+u6vnZdN/V9P3EuimLcCRlsiyArGcfxjWDLsmzyAGzc4aNFNDZ7/iw7AeQH4LNrh5WZYLgkJTaZCyHuVVVdkiSZ0zSdOWMzlaBFWkRrQ4A4Zk/A4wBie1MFYUMAz0wybCYAmR8FUAlzj6+2r18TgM2VAO8tOB1Cyk7mrofQ+zP0voheVjHtIBjDxjrmvCu7k1Xs/TP6ie84ICDAGR5uCYdPo0MWiAAAAABJRU5ErkJggg==',
                                //"http://maps.google.com/mapfiles/kml/shapes/placemarkcircle.png",
                                (function(){
                                    this.inspector.circleTexture = this.core.getRendererInterface().createTexture({ 'source': inspector.circleImage });
                                }).bind(this)
                            );
                    }
                                            
                    this.diagnosticMode = true; hit = true; break;  //key D pressed
                }
            }

            if (this.diagnosticMode) {
                blockHit = true;

                switch(keyCode) {

                case 67:
                case 99:
                    map.config.mapDegradeHorizon = !map.config.mapDegradeHorizon;

                        //this.measureMode = !this.measureMode;
                        //this.measurePoints = [];
                        //var pos = this.core.hitTest(this.mouseX, this.mouseY, "all");
                        //console.log("hit pos: " + pos[0] + " " + pos[1] + " " + pos[2] + " " + pos[3] + " d " + pos[4]); //key T pressed

                    break; //key C pressed

                case 49: /*this.core.setControlMode("manual"); done();*/  break;  //key 1 pressed
                case 50: /*this.core.setControlMode("drone"); done();*/   break;  //key 2 pressed
                case 51: /*this.core.setControlMode("observer"); done();*/ break; //key 3 pressed

                case 48:  //key 0 pressed
                        /*this.core.setOption("noForwardMovement" , !this.core.getOption("noForwardMovement"));*/
                    break;

                    //case 84: //key T pressed
                    //case 116:
                        /*var pos = this.core.hitTest(this.mouseX, this.mouseY, "all");
                        console.log("hit pos: " + pos[0] + " " + pos[1] + " " + pos[2] + " " + pos[3] + " d " + pos[4]); //key T pressed
                        this.core.logTile(pos);*/
                        //break;

                case 72:
                case 104:
                    debug.heightmapOnly = !debug.heightmapOnly;

                        /*
                        var pos = map.getPosition();
                        pos.setHeight(pos.setHeight() * 0.9);
                        map.setPosition(pos);*/

                    break;  //key H pressed

                case 81:
                case 113:
                    var pos = map.getPosition();
                    // eslint-disable-next-line
                    console.log('pos-before: ' + JSON.stringify(pos.pos));
                    map.convertPositionViewMode(pos, (pos.getViewMode() == 'obj') ? 'subj' : 'obj');
                    // eslint-disable-next-line
                    console.log('new mode: ' + pos.getViewMode());
                    // eslint-disable-next-line
                    console.log('pos-after: ' + JSON.stringify(pos.pos));
                    map.setPosition(pos);
                    /*this.core.saveScreenshot(pos);*/ break;  //key Q pressed

                case 80:
                case 112:
                    map.renderer.saveScreenshot('file', 'vts-screenshot.png', 'png'); break;  //key P pressed

                case 83:
                case 115:
                    inspector.stats.switchPanel(); break; //key S pressed

                case 86:
                case 118:
                    inspector.layers.switchPanel(); break; //key V pressed

                case 69:
                case 101:
                    inspector.stylesheets.switchPanel(); break; //key E pressed

                case 84:
                case 116:
                    inspector.replay.switchPanel(); break; //key T pressed

                case 66:
                case 98:
                    debug.drawBBoxes = !debug.drawBBoxes; break; //key B pressed

                case 87:
                case 119:
                    var value = debug.drawWireframe + 1;
                    debug.drawWireframe = value > 2 ? 0 : value;
                    break; //key W pressed

                case 70:
                case 102:
                    debug.drawWireframe = debug.drawWireframe != 3 ? 3 : 0;
                    break; //key F pressed

                case 77:
                case 109:
                        //map.drawMaxLod = !map.drawMaxLod;
                        
                        //map.config.mapGeocentCulling2 = !map.config.mapGeocentCulling2;
                        //console.log("mapGeocentCulling2: " + map.config.mapGeocentCulling2);
                        
                       /*
                        var from = "+proj=merc +a=6378137 +b=6378137 +latts=0.0 +lon0=0.0 +x0=0.0 +y0=0 +k=1.0 +units=m +nadgrids=@null +wktext +nodefs";
                        var to = "+proj=geocent +datum=WGS84 +units=m +nodefs";
                        var coords = [-5009377.08569725, 15028131.257091751, 0];
    
                        var timeStart = performance.now();
                        
                        for (var i = 0; i < 100000; i++) {
                            var r = map.proj4(from, to, coords);
                        }
                        
                        var timeEnd = performance.now();
                        
                        var tt = timeEnd - timeStart;
                        
                        console.log("proj4 timer: " + tt + "   " + JSON.stringify(r));
                        */
                        /*
                        var from2 = map.proj4("+proj=merc +a=6378137 +b=6378137 +latts=0.0 +lon0=0.0 +x0=0.0 +y0=0 +k=1.0 +units=m +nadgrids=@null +wktext +nodefs", null, null, true);
                        var to2 = map.proj4("+proj=geocent +datum=WGS84 +units=m +nodefs", null, null, true);
                        var coords = [-5009377.08569725, 15028131.257091751, 0];

                        var timeStart = performance.now();
                        
                        for (var i = 0; i < 100000; i++) {
                            var r = map.proj4(from2, to2, coords);
                        }
                        
                        var timeEnd = performance.now();
                        
                        var tt = timeEnd - timeStart;
                        
                        console.log("proj4 timer2: " + tt + "   " + JSON.stringify(r));
                        */

                        //map.zFactor2 += 0.1; //0.000001;
                        //console.log("zfactor  " + map.zFactor2 + "   zz: " + map.renderer.getZoffsetFactor([map.zFactor2, 0, 0]));
                        
                    map.loaderSuspended = !map.loaderSuspended;            
                    // eslint-disable-next-line
                    console.log('loader state ' + map.loaderSuspended);

                    break; //key M pressed

                case 74:
                case 106:
                    debug.drawEarth = !debug.drawEarth; hit = true; break; //key X pressed

                case 88:
                case 120:
                    debug.drawFog = !debug.drawFog; hit = true; break; //key X pressed

                case 82:
                case 114:
                    inspector.graphs.switchPanel(); break; //key R pressed

                case 79:
                case 111:
                    map.camera.camera.setOrtho(!map.camera.camera.getOrtho()); break; //key O pressed

                case 76:
                case 108:
                    inspector.drawRadar = !inspector.drawRadar; break; //key L pressed

                case 90:
                case 122:
                    debug.ignoreTexelSize = !debug.ignoreTexelSize; break; //key Z pressed

                case 78:
                case 110:
                    inspector.shakeCamera = !inspector.shakeCamera; break; //key N pressed

                default:
                    blockHit = false;
                    break;

                }

                if (blockHit) {
                    hit = true;
                }
            }
        }

        if (this.diagnosticMode && inspector.drawRadar && !this.shiftDown && !press) {
            blockHit = true;

            switch(keyCode) {
            case 43:
            case 107:
                if (inspector.radarLod == null) { inspector.radarLod = 8;}
                inspector.radarLod++; /*console.log("radarLOD: " + this.radarLod);*/ break; //key mun + pressed

            case 45:
            case 109:
                if (inspector.radarLod == null) { inspector.radarLod = 8;}
                inspector.radarLod = Math.max(0,inspector.radarLod-1); /*console.log("radarLOD: " + this.radarLod);*/ break; //key mun - pressed

            case 42:
            case 106:
                inspector.radarLod = null; /*console.log("radarLOD: auto");*/ break; //key mun * pressed

            default:
                blockHit = false;
                break;
            }

            if (blockHit) {
                hit = true;
            }
        }

        if (this.diagnosticMode && debug.drawBBoxes && !this.shiftDown && !press) {
            blockHit = true;

            switch(keyCode) {
            case 76:
            case 108:
                debug.drawLods = !debug.drawLods; break; //key L pressed

            case 80:
            case 112:
                debug.drawPositions = !debug.drawPositions; break; //key P pressed

            case 84:
            case 116:
                debug.drawTextureSize = !debug.drawTextureSize; break; //key T pressed

            case 70:
            case 102:
                debug.drawFaceCount = !debug.drawFaceCount; break; //key F pressed

            case 68:
            case 100:
                debug.drawDistance = !debug.drawDistance; break; //key D pressed

            case 78:
            case 110:
                debug.drawNodeInfo = !debug.drawNodeInfo; break; //key N pressed

            case 77:
            case 109:
                debug.drawMeshBBox = !debug.drawMeshBBox; break; //key M pressed

            case 73:
            case 105:
                debug.drawIndices = !debug.drawIndices; break; //key I pressed

            case 66:
            case 98:
                debug.drawBoundLayers = !debug.drawBoundLayers; break; //key B pressed

            case 83:
            case 115:
                debug.drawSurfaces = !debug.drawSurfaces; break; //key S pressed

            case 67:
            case 99:
                debug.drawCredits = !debug.drawCredits; break; //key C pressed

            case 79:
            case 111:
                debug.drawOrder = !debug.drawOrder; break; //key O pressed

            case 69:
            case 101:
                debug.debugTextSize = (debug.debugTextSize == 2.0) ? 3.0 : 2.0; break; //key E pressed

            case 88:
            case 120:
                map.config.mapPreciseBBoxTest = !map.config.mapPreciseBBoxTest; break; //key X pressed

            case 90:
            case 122:
                map.config.mapPreciseDistanceTest = !map.config.mapPreciseDistanceTest; break; //key Z pressed

            default:
                blockHit = false;
                break;
            }

            if (blockHit) {
                hit = true;
            }
        }

    }

    if (hit) {
        map.markDirty();
        inspector.preventDefault(event);
    }

    //console.log("key" + keyCode);
};


export default InspectorInput;

