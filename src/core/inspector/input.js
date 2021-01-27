

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

    if (!map) {
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
            }

            if (this.ctrlDown) {

                switch(keyCode) {
                case 68:
                case 100:
                    
                    inspector.enableInspector();
                    this.diagnosticMode = true; hit = true; break;  //key D pressed
                }
            }

            if (this.diagnosticMode) {
                blockHit = true;

                switch(keyCode) {

                case 67:
                case 99:
                        inspector.shakeCamera = !inspector.shakeCamera;

                        //map.config.mapDegradeHorizon = !map.config.mapDegradeHorizon;
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
                    map.convert.convertPositionViewMode(pos, (pos.getViewMode() == 'obj') ? 'subj' : 'obj');
                    // eslint-disable-next-line
                    console.log('new mode: ' + pos.getViewMode());
                    // eslint-disable-next-line
                    console.log('pos-after: ' + JSON.stringify(pos.pos));
                    map.setPosition(pos);
                    /*this.core.saveScreenshot(pos);*/

                    if (this.altDown && pos.getViewMode() != 'obj') {
                        map.camera.near = 0.1;
                    } else {
                        map.camera.near = 2;
                    }

                    inspector.preventDefault(event);

                    break;  //key Q pressed

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

                case 65:
                case 97:
                    debug.drawLabelBoxes = !debug.drawLabelBoxes; break; //key A pressed

                case 75:
                case 107:
                   debug.drawAllLabels = !debug.drawAllLabels; break; //key K pressed

                case 73:
                case 105:
                    debug.drawHiddenLabels = !debug.drawHiddenLabels; break; //key I pressed
                    //debug.drawGridCells = !debug.drawGridCells; break; //key I pressed

                case 87:
                case 119:
                    
                    if (debug.drawWireframe == 3) {
                        debug.drawWireframe = 1;
                    } else {
                        var value = debug.drawWireframe + 1;
                        debug.drawWireframe = value > 2 ? 0 : value;
                    }
                    break; //key W pressed

                case 70:
                case 102:
                    debug.drawWireframe = debug.drawWireframe != 3 ? 3 : 0;
                    break; //key F pressed

                case 85:
                case 117:
                    map.renderer.setSuperElevationState(!map.renderer.useSuperElevation);
                    break; //key U pressed

                case 71:
                case 103:
                    debug.meshStats = !debug.meshStats; hit = true;
                    break; //key G pressed

                case 77:
                case 109:
                    map.loaderSuspended = !map.loaderSuspended;            
                    // eslint-disable-next-line
                    console.log('loader state ' + map.loaderSuspended);

                    break; //key M pressed

                case 74:
                case 106:
                    debug.drawEarth = !debug.drawEarth; hit = true; break; //key J pressed

                case 88:
                case 120:
                    debug.drawFog = !debug.drawFog; hit = true; break; //key X pressed

                case 89:
                case 120:
                    map.config.mapSplitLods = !map.config.mapSplitLods; hit = true; break; //key Y pressed

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
                    debug.maxZoom = !debug.maxZoom; break; //key Z pressed

                case 78:
                case 110:
                    debug.drawNBBoxes = !debug.drawNBBoxes; break; //key N pressed

                default:
                    blockHit = false;
                    break;

                }

                if (blockHit) {
                    hit = true;
                }
            }
        }

        if (this.diagnosticMode && debug.drawWireframe && !press) {
            if (keyCode >= 96 && keyCode <= 105) {
                if (this.altDown) {
                    debug.drawTestData = keyCode - 96;
                    if (this.ctrlDown) {
                        debug.drawTestData += 10;
                    }
                } else {
                    debug.drawTestMode = keyCode - 96;
                }

                hit = true;
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

        if (this.diagnosticMode && (debug.drawBBoxes || debug.drawNBBoxes) && !this.shiftDown && !press) {
            blockHit = true;

            switch(keyCode) {
            case 76:
            case 108:
                debug.drawLods = !debug.drawLods; break; //key L pressed

            case 80:
            case 112:
                debug.drawPositions = !debug.drawPositions; break; //key P pressed

            case 85:
            case 117:
                debug.drawOctants = !debug.drawOctants; break;  //key U pressed

            case 84:
            case 116:
                debug.drawTextureSize = !debug.drawTextureSize; break; //key T pressed

            case 70:
            case 102:
                debug.drawFaceCount = !debug.drawFaceCount; break; //key F pressed

            case 71:
            case 103:
                debug.drawGeodataOnly = !debug.drawGeodataOnly; break; //key G pressed

            case 68:
            case 100:
                debug.drawDistance = !debug.drawDistance; break; //key D pressed

            case 86:
            case 118:
                debug.drawSpaceBBox = !debug.drawSpaceBBox; break; //key V pressed

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

            case 82:
            case 114:
                debug.drawResources = !debug.drawResources; break; //key R pressed

            case 83:
            case 115:
                debug.drawSurfaces = !debug.drawSurfaces; break; //key S pressed

            case 90:
            case 122:
                debug.drawSurfaces2 = !debug.drawSurfaces2; break; //key Z pressed

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

            case 87:
            case 119:
                debug.drawPolyWires = !debug.drawPolyWires; break; //key W pressed

            case 90:
            case 122:
                map.config.mapPreciseDistanceTest = !map.config.mapPreciseDistanceTest; break; //key Z pressed

            case 75:
            case 107:
                debug.drawGPixelSize = !debug.drawGPixelSize; break; //key K pressed

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


InspectorInput.prototype.setParameter = function(key, value) {
    var map = this.core.getMap();
    var inspector = this.inspector;

    if (!map) {
        return;
    }

    var debug = map.draw.debug;
    var getBool = (function(a){ return (value === true || value == 'true' || value == '1') });

    switch(key) {
        case 'debugMode': this.diagnosticMode = true; break;
        case 'debugBBox':
            debug.drawBBoxes = true;
        case 'debugNBBox':
            if (key == 'debugNBBox') debug.drawNBBoxes = true;
            var has = (function(a){ return (value.indexOf(a)!=-1); });
            if (has('L')) debug.drawLods = true;
            if (has('P')) debug.drawPositions = true;
            if (has('T')) debug.drawTextureSize = true;
            if (has('F')) debug.drawFaceCount = true;
            if (has('G')) debug.drawGeodataOnly = true;
            if (has('D')) debug.drawDistance = true;
            if (has('N')) debug.drawNodeInfo = true;
            if (has('V')) debug.drawSpaceBBox = true;
            if (has('M')) debug.drawMeshBBox = true;
            if (has('I')) debug.drawIndices = true;
            if (has('U')) debug.drawOctants = true;
            if (has('B')) debug.drawBoundLayers = true;
            if (has('S')) debug.drawSurfaces = true;
            if (has('Z')) debug.drawSurfaces2 = true;
            if (has('C')) debug.drawCredits = true;
            if (has('O')) debug.drawOrder = true;
            if (has('E')) debug.debugTextSize = 3.0;
            if (has('K')) debug.drawGPixelSize = true;
            break;
        case 'debugLBox': debug.drawLabelBoxes = getBool(value); break;
        case 'debugNoEarth': debug.drawEarth = !getBool(value); break;
        case 'debugShader': debug.drawWireframe = parseInt(value); break;
        case 'debugHeightmap': debug.heightmapOnly = getBool(value); break;
        case 'debugGridCells': debug.drawGridCells = getBool(value); break;
        case 'debugRadar':
            inspector.enableInspector();
            inspector.drawRadar = true;
            inspector.radarLod = parseInt(value);
            if (isNaN(inspector.radarLod)) {
                inspector.radarLod = null;
            } 
            break;

    }

    map.markDirty();
};

export default InspectorInput;

