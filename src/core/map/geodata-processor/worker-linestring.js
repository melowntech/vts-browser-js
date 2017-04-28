
import {globals as globals_, vec3Normalize as vec3Normalize_,
        vec3Cross as vec3Cross_,
        vec3AnyPerpendicular as vec3AnyPerpendicular_} from './worker-globals.js';
import {getLayerPropertyValue as getLayerPropertyValue_,
        getLayerExpresionValue as getLayerExpresionValue_} from './worker-style.js';
import {addStreetTextOnPath as addStreetTextOnPath_,
        areTextCharactersAvailable as areTextCharactersAvailable_,
        getCharVerticesCount as getCharVerticesCount_} from './worker-text.js';
import {postGroupMessage as postGroupMessage_} from './worker-message.js';

//get rid of compiler mess
var globals = globals_, vec3Normalize = vec3Normalize_,
    vec3Cross = vec3Cross_, vec3AnyPerpendicular = vec3AnyPerpendicular_;
var getLayerPropertyValue = getLayerPropertyValue_,
    getLayerExpresionValue = getLayerExpresionValue_;
var addStreetTextOnPath = addStreetTextOnPath_, areTextCharactersAvailable = areTextCharactersAvailable_,
    getCharVerticesCount = getCharVerticesCount_;
var postGroupMessage = postGroupMessage_;


var processLineStringPass = function(lineString, lod, style, zIndex, eventInfo) {
    var lines = lineString['lines'] || [];

    if (lines.length == 0) {
        return;
    }

    var line = getLayerPropertyValue(style, 'line', lineString, lod);
    var lineLabel = getLayerPropertyValue(style, 'line-label', lineString, lod);

    if (!line && !lineLabel) {
        return;
    }

    var hoverEvent = getLayerPropertyValue(style, 'hover-event', lineString, lod);
    var clickEvent = getLayerPropertyValue(style, 'click-event', lineString, lod);
    var drawEvent = getLayerPropertyValue(style, 'draw-event', lineString, lod);
    var enterEvent = getLayerPropertyValue(style, 'enter-event', lineString, lod);
    var leaveEvent = getLayerPropertyValue(style, 'leave-event', lineString, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', lineString, lod);

    var lineFlat = getLayerPropertyValue(style, 'line-flat', lineString, lod);
    var lineColor = getLayerPropertyValue(style, 'line-color', lineString, lod);
    var lineWidth = 0.5 * getLayerPropertyValue(style, 'line-width', lineString, lod);

    var lineStyle = getLayerPropertyValue(style, 'line-style', lineString, lod);
    var lineStyleTexture = getLayerPropertyValue(style, 'line-style-texture', lineString, lod);
    var lineStyleBackground = getLayerPropertyValue(style, 'line-style-background', lineString, lod);

    var lineLabelSize = getLayerPropertyValue(style, 'line-label-size', lineString, lod);

    //console.log("lineflat: "+lineFlat);
    //var lineWidth = Math.pow(2, 23 - lod) / 32;

    var index = 0;
    var index2 = 0;
    var skipJoins = (!lineFlat && lineWidth < 2.1);

    var ii, i, li, p2, v, vv, l, n, nn, p1, p;

    //console.log("lod: " + lod + "  width: " + lineWidth);

    if (!skipJoins) {
        var circleBuffer = [];
        var circleBuffer2 = [];
        var circleSides = 8;//Math.max(8, (14 - lod) * 8);
    
        var angle = 0, step = (2.0*Math.PI) / circleSides;
    
        for (i = 0; i < circleSides; i++) {
            circleBuffer[i] = [-Math.sin(angle), Math.cos(angle)];
            circleBuffer2[i] = angle;
            angle += step;
        }
    
        circleBuffer[circleSides] = [0, 1.0];
        circleBuffer2[circleSides] = 0;
    }

    var totalPoints = 0;

    for (ii = 0; ii < lines.length; ii++) {
        if (Array.isArray(lines[ii])) {
            totalPoints += lines[ii].length;
        }
    }

    //allocate buffers
    var lineVertices = (texturedLine || !lineFlat ? 4 : 3) * 3 * 2;
    var joinVertices = skipJoins ? 0 : (circleSides * (texturedLine || !lineFlat? 4 : 3) * 3);
    var vertexBuffer = new Float32Array(totalPoints * lineVertices + totalPoints * joinVertices);


    if (!lineFlat || texturedLine) {
        var lineNormals = 3 * 4 * 2;
        var joinNormals = skipJoins ? 0 : (circleSides * 3 * 4);
        var normalBuffer = new Float32Array(totalPoints * lineNormals + totalPoints * joinNormals);
    }

    if (texturedLine && !skipJoins) {
        var joinParams = Float32Array(totalPoints);
    }

    var center = [0,0,0];
    var lineLabelStack = [];
    var forceOrigin = globals.forceOrigin;
    var bboxMin = globals.bboxMin;
    var geocent = globals.geocent;
    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceScale = globals.forceScale;

    for (ii = 0; ii < lines.length; ii++) {
        if (!Array.isArray(lines[ii]) || !lines[ii].length) {
            continue;
        }
        
        var points = lines[ii];

        if (lineLabel) {
            var lineLabelPoints = new Array(points.length);
            var lineLabelPoints2 = new Array(points.length);
            
            lineLabelStack.push({points: lineLabelPoints, points2 :lineLabelPoints2});
        }
    
        p = points[0];
        p1 = [p[0], p[1], p[2]];
    
        if (forceOrigin) {
            p1 = [p1[0] - tileX, p1[1] - tileY, p1[2]];
        }
    
        if (forceScale != null) {
            p1 = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
        }
    
        var texturedLine = (lineStyle != 'solid');
    
    
        var dlines = false;
        var distance = 0.001;
        var distance2 = 0.001;
    
        //add lines
        for (i = 0, li = points.length - 1; i < li; i++) {
    
            if (dlines) {
                p2 = points[i+1];
                p2 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
    
                if (forceOrigin) {
                    p2 = [p2[0] - tileX, p2[1] - tileY, p2[2]];
                }
    
                if (forceScale != null) {
                    p2 = [p2[0] * forceScale[0], p2[1] * forceScale[1], p2[2] * forceScale[2]];
                }
    
            } else {
                p1 = points[i];
                p2 = points[i+1];
    
                if (forceOrigin) {
                    p1 = [p1[0] - tileX, p1[1] - tileY, p1[2]];
                    p2 = [p2[0] - tileX, p2[1] - tileY, p2[2]];
                }
    
                if (forceScale != null) {
                    p1 = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
                    p2 = [p2[0] * forceScale[0], p2[1] * forceScale[1], p2[2] * forceScale[2]];
                }
            }
    
    
            if (lineFlat && !texturedLine) {

                //normalize vector to line width and rotate 90 degrees
                if (geocent) {
                    //direction vector
                    v = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];
        
                    //get line length
                    l = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
                    distance2 += l;
        
                    l = (l != 0) ? (1 / l) : 0;

                    vv = [v[0]*l, v[1]*l, v[2]*l];
                    n = [0,0,0];
                    nn = [0,0,0];
                    
                    vec3Normalize(bboxMin, nn);
                    vec3Cross(nn, vv, n);
                    
                    n = [n[0] * lineWidth, n[1] * lineWidth, n[2] * lineWidth];
                } else {
                    //direction vector
                    v = [p2[0] - p1[0], p2[1] - p1[1], 0];
        
                    //get line length
                    l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
                    distance2 += l;
        
                    l = (l != 0) ? (lineWidth / l) : 0;

                    n = [-v[1]*l, v[0]*l, 0];
                }
                        
                //add polygon
                vertexBuffer[index] = p1[0] + n[0];
                vertexBuffer[index+1] = p1[1] + n[1];
                vertexBuffer[index+2] = p1[2] + n[2];
    
                vertexBuffer[index+3] = p1[0] - n[0];
                vertexBuffer[index+4] = p1[1] - n[1];
                vertexBuffer[index+5] = p1[2] - n[2];
    
                vertexBuffer[index+6] = p2[0] + n[0];
                vertexBuffer[index+7] = p2[1] + n[1];
                vertexBuffer[index+8] = p2[2] + n[2];
    
                //add polygon
                vertexBuffer[index+9] = p1[0] - n[0];
                vertexBuffer[index+10] = p1[1] - n[1];
                vertexBuffer[index+11] = p1[2] - n[2];
    
                vertexBuffer[index+12] = p2[0] - n[0];
                vertexBuffer[index+13] = p2[1] - n[1];
                vertexBuffer[index+14] = p2[2] - n[2];
    
                vertexBuffer[index+15] = p2[0] + n[0];
                vertexBuffer[index+16] = p2[1] + n[1];
                vertexBuffer[index+17] = p2[2] + n[2];
    
                index += 18;
    
            } else {
    
                //direction vector
                v = [p2[0] - p1[0], p2[1] - p1[1], 0];
    
                //get line length
                l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
                distance2 += l;
    
                //console.log("distance("+i+"): " + distance + " " + distance2);
    
                if (lineFlat) {
    
                    //normalize vector to line width and rotate 90 degrees
                    l = (l != 0) ? (lineWidth / l) : 0;
                    n = [-v[1]*l, v[0]*l,0];
    
                    if (joinParams != null) {
                        joinParams[i] = (l != 0) ? Math.atan2(v[0], v[1]) + Math.PI *0.5 : 0;
                    }
    
                    //add polygon
                    vertexBuffer[index] = p1[0];
                    vertexBuffer[index+1] = p1[1];
                    vertexBuffer[index+2] = p1[2];
                    vertexBuffer[index+3] = distance;
                    normalBuffer[index2] = n[0];
                    normalBuffer[index2+1] = n[1];
                    normalBuffer[index2+2] = 0;
                    normalBuffer[index2+3] = lineWidth;
    
                    vertexBuffer[index+4] = p1[0];
                    vertexBuffer[index+5] = p1[1];
                    vertexBuffer[index+6] = p1[2];
                    vertexBuffer[index+7] = -distance;
                    normalBuffer[index2+4] = -n[0];
                    normalBuffer[index2+5] = -n[1];
                    normalBuffer[index2+6] = 0;
                    normalBuffer[index2+7] = -lineWidth;
    
                    vertexBuffer[index+8] = p2[0];
                    vertexBuffer[index+9] = p2[1];
                    vertexBuffer[index+10] = p2[2];
                    vertexBuffer[index+11] = distance2;
                    normalBuffer[index2+8] = n[0];
                    normalBuffer[index2+9] = n[1];
                    normalBuffer[index2+10] = 0;
                    normalBuffer[index2+11] = lineWidth;
    
                    //add polygon
                    vertexBuffer[index+12] = p1[0];
                    vertexBuffer[index+13] = p1[1];
                    vertexBuffer[index+14] = p1[2];
                    vertexBuffer[index+15] = -distance;
                    normalBuffer[index2+12] = -n[0];
                    normalBuffer[index2+13] = -n[1];
                    normalBuffer[index2+14] = 0;
                    normalBuffer[index2+15] = -lineWidth;
    
                    vertexBuffer[index+16] = p2[0];
                    vertexBuffer[index+17] = p2[1];
                    vertexBuffer[index+18] = p2[2];
                    vertexBuffer[index+19] = -distance2;
                    normalBuffer[index2+16] = -n[0];
                    normalBuffer[index2+17] = -n[1];
                    normalBuffer[index2+18] = 0;
                    normalBuffer[index2+19] = -lineWidth;
    
                    vertexBuffer[index+20] = p2[0];
                    vertexBuffer[index+21] = p2[1];
                    vertexBuffer[index+22] = p2[2];
                    vertexBuffer[index+23] = distance2;
                    normalBuffer[index2+20] = n[0];
                    normalBuffer[index2+21] = n[1];
                    normalBuffer[index2+22] = 0;
                    normalBuffer[index2+23] = lineWidth;
    
                    index += 24;
                    index2 += 24;
    
                } else {
    
                    //add polygon
                    vertexBuffer[index] = p1[0];
                    vertexBuffer[index+1] = p1[1];
                    vertexBuffer[index+2] = p1[2];
                    vertexBuffer[index+3] = distance;
                    normalBuffer[index2] = p2[0];
                    normalBuffer[index2+1] = p2[1];
                    normalBuffer[index2+2] = p2[2];
                    normalBuffer[index2+3] = lineWidth;
    
                    vertexBuffer[index+4] = p1[0];
                    vertexBuffer[index+5] = p1[1];
                    vertexBuffer[index+6] = p1[2];
                    vertexBuffer[index+7] = -distance;
                    normalBuffer[index2+4] = p2[0];
                    normalBuffer[index2+5] = p2[1];
                    normalBuffer[index2+6] = p2[2];
                    normalBuffer[index2+7] = -lineWidth;
    
                    vertexBuffer[index+8] = p2[0];
                    vertexBuffer[index+9] = p2[1];
                    vertexBuffer[index+10] = p2[2];
                    vertexBuffer[index+11] = -distance2;
                    normalBuffer[index2+8] = p1[0];
                    normalBuffer[index2+9] = p1[1];
                    normalBuffer[index2+10] = p1[2];
                    normalBuffer[index2+11] = lineWidth;
    
                    //add polygon
                    vertexBuffer[index+12] = p1[0];
                    vertexBuffer[index+13] = p1[1];
                    vertexBuffer[index+14] = p1[2];
                    vertexBuffer[index+15] = distance;
                    normalBuffer[index2+12] = p2[0];
                    normalBuffer[index2+13] = p2[1];
                    normalBuffer[index2+14] = p2[2];
                    normalBuffer[index2+15] = lineWidth;
    
                    vertexBuffer[index+16] = p2[0];
                    vertexBuffer[index+17] = p2[1];
                    vertexBuffer[index+18] = p2[2];
                    vertexBuffer[index+19] = -distance2;
                    normalBuffer[index2+16] = p1[0];
                    normalBuffer[index2+17] = p1[1];
                    normalBuffer[index2+18] = p1[2];
                    normalBuffer[index2+19] = lineWidth;
    
                    vertexBuffer[index+20] = p2[0];
                    vertexBuffer[index+21] = p2[1];
                    vertexBuffer[index+22] = p2[2];
                    vertexBuffer[index+23] = distance2;
                    normalBuffer[index2+20] = p1[0];
                    normalBuffer[index2+21] = p1[1];
                    normalBuffer[index2+22] = p1[2];
                    normalBuffer[index2+23] = -lineWidth;
    
                    index += 24;
                    index2 += 24;
                }
            }
    
            distance = distance2;
            p1 = p2; //only for dlines
        }
    
        p1 = [p[0], p[1], p[2]];
    
        //add joins
        for (i = 0, li = points.length; i < li; i++) {
    
            if (forceOrigin) {
                p1 = [p1[0] - tileX, p1[1] - tileY, p1[2]];
            }
    
            if (forceScale != null) {
                p1 = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
            }
    
            center[0] += p1[0];
            center[1] += p1[1];
            center[2] += p1[2];
            
            if (!skipJoins) {
                var angleShift = (joinParams != null) ? joinParams[i] : 0;
    
                if (geocent) {
                    vv = [0,0,0];
                    nn = [0,0,0];
                    vec3Normalize(bboxMin, nn);
                    vec3AnyPerpendicular(nn, vv);
                    vec3Normalize(vv);
                    vec3Cross(nn, vv, nn);
                }
        
                for (var j = 0; j < circleSides; j++) {
        
                    if (lineFlat && !texturedLine) {
    
                        vertexBuffer[index] = p1[0];
                        vertexBuffer[index+1] = p1[1];
                        vertexBuffer[index+2] = p1[2];
        
                        //add polygon
                        if (geocent) {
                            var dx = circleBuffer[j][0];
                            var dy = circleBuffer[j][1];
                            vertexBuffer[index+3] = p1[0] + (nn[0] * dx + vv[0] * dy) * lineWidth;
                            vertexBuffer[index+4] = p1[1] + (nn[1] * dx + vv[1] * dy) * lineWidth;
                            vertexBuffer[index+5] = p1[2] + (nn[2] * dx + vv[2] * dy) * lineWidth;
            
                            dx = circleBuffer[j+1][0];
                            dy = circleBuffer[j+1][1];
                            vertexBuffer[index+6] = p1[0] + (nn[0] * dx + vv[0] * dy) * lineWidth;
                            vertexBuffer[index+7] = p1[1] + (nn[1] * dx + vv[1] * dy) * lineWidth;
                            vertexBuffer[index+8] = p1[2] + (nn[2] * dx + vv[2] * dy) * lineWidth;
                        } else {
            
                            vertexBuffer[index+3] = p1[0] + circleBuffer[j][0] * lineWidth;
                            vertexBuffer[index+4] = p1[1] + circleBuffer[j][1] * lineWidth;
                            vertexBuffer[index+5] = p1[2];
            
                            vertexBuffer[index+6] = p1[0] + circleBuffer[j+1][0] * lineWidth;
                            vertexBuffer[index+7] = p1[1] + circleBuffer[j+1][1] * lineWidth;
                            vertexBuffer[index+8] = p1[2];
                        }
            
                        index += 9;
        
                    } else {
        
                        //distance = vertexBuffer[(i >> 1) * lineVertices + ((i & 1) ? 11 : 3)];
                        if (i != (li-1)) {
                            distance = vertexBuffer[i * lineVertices + 3];
                        } else {
                            distance = vertexBuffer[(i - 1) * lineVertices + 11];
                        }
                        //distance = vertexBuffer[((i == li) ? i - 1 : i) * lineVertices + 3];
        
                        //if (distance == null) {
                          //  debugger
                        //}
        
                        //console.log("distance-dot("+i+"): " + distance);
        
                        //add polygon
                        vertexBuffer[index] = p1[0];
                        vertexBuffer[index+1] = p1[1];
                        vertexBuffer[index+2] = p1[2];
                        vertexBuffer[index+3] = distance;
                        normalBuffer[index2] = 0;
                        normalBuffer[index2+1] = 0;
                        normalBuffer[index2+2] = 0;
                        normalBuffer[index2+3] = 0;
        
                        vertexBuffer[index+4] = p1[0];
                        vertexBuffer[index+5] = p1[1];
                        vertexBuffer[index+6] = p1[2];
                        vertexBuffer[index+7] = distance;
                        normalBuffer[index2+4] = circleBuffer[j][0] * lineWidth;
                        normalBuffer[index2+5] = circleBuffer[j][1] * lineWidth;
                        normalBuffer[index2+6] = circleBuffer2[j] + angleShift;
                        normalBuffer[index2+7] = 0;
        
                        vertexBuffer[index+8] = p1[0];
                        vertexBuffer[index+9] = p1[1];
                        vertexBuffer[index+10] = p1[2];
                        vertexBuffer[index+11] = distance;
                        normalBuffer[index2+8] = circleBuffer[j+1][0] * lineWidth;
                        normalBuffer[index2+9] = circleBuffer[j+1][1] * lineWidth;
                        normalBuffer[index2+10] = circleBuffer2[j+1] + angleShift;
                        normalBuffer[index2+11] = 0;
        
                        index += 12;
                        index2 += 12;
                    }
                }
            }
    
            if (lineLabel) {
                p = [p1[0], p1[1], p1[2] + lineLabelSize*0.1];
                lineLabelPoints[i] = p;
                lineLabelPoints2[li - i - 1] = p;
            }
    
            if (dlines) {
                p2 = points[i+1];
                p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
            } else {
                p1 = points[i+1];
            }
        }

    }

    if (totalPoints > 0) {
        center[0] /= totalPoints;
        center[1] /= totalPoints;
        center[2] /= totalPoints;
    }

    center[0] += globals.groupOrigin[0];
    center[1] += globals.groupOrigin[1];
    center[2] += globals.groupOrigin[2];

    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent;

    if (line) {
        var messageData = {'command':'addRenderJob', 'vertexBuffer': vertexBuffer,
            'color':lineColor, 'z-index':zIndex, 'center': center, 'normalBuffer': normalBuffer,
            'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
            'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
            'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
            'line-width':lineWidth*2, 'lod':(globals.autoLod ? null : globals.tileLod) };
    
        if (lineFlat) {
            messageData['type'] = texturedLine ? 'flat-tline' : 'flat-line';
        } else {
            messageData['type'] = texturedLine ? 'pixel-tline' : 'pixel-line';
        }
    
        if (texturedLine) {
            if (lineStyleTexture != null) {
                messageData['texture'] = [globals.stylesheetBitmaps[lineStyleTexture[0]], lineStyleTexture[1], lineStyleTexture[2]];
                messageData['background'] = lineStyleBackground;
            }
        }

        var signature = JSON.stringify({
            type: messageData['type'],
            color : lineColor,
            zIndex : zIndex,
            zOffset : zbufferOffset,
            state : globals.hitState
        });
        
        if (normalBuffer) {
            postGroupMessage(messageData, [vertexBuffer.buffer, normalBuffer.buffer], signature);
        } else {
            postGroupMessage(messageData, [vertexBuffer.buffer], signature);
        }
    }

    //debugger

    if (lineLabel) {
        for (i = 0, li = lineLabelStack.length; i < li; i++) {
            processLineLabel(lineLabelStack[i].points, lineLabelStack[i].points2, lineString, center, lod, style, zIndex, eventInfo);
        }
    }

};

var processLineLabel = function(lineLabelPoints, lineLabelPoints2, lineString, center, lod, style, zIndex, eventInfo) {
    var labelColor = getLayerPropertyValue(style, 'line-label-color', lineString, lod);
    var labelSource = getLayerPropertyValue(style, 'line-label-source', lineString, lod);
    var labelSize = getLayerPropertyValue(style, 'line-label-size', lineString, lod);
    var labelOffset = getLayerPropertyValue(style, 'line-label-offset', lineString, lod);

    //console.log("label size: " + lod + "   " + labelSize);

    if (Math.abs(labelSize) < 0.0001) {
    //if (labelSource == null || labelSource == "" || Math.abs(labelSize) < 0.0001) {
        return;
    }

    var labelText = getLayerExpresionValue(style, labelSource, lineString);

    if (labelSource == '$name') {
        if (!areTextCharactersAvailable(labelText, globals.fonts['default'])) {
            var labelText2 = getLayerExpresionValue(style, '$name:en', lineString);
            
            if (areTextCharactersAvailable(labelText2, globals.fonts['default'])) {
                labelText = labelText2;                     
            }
        }
    }

    if (!labelText || labelText == '') {
        return;
    }

    var hoverEvent = getLayerPropertyValue(style, 'hover-event', lineString, lod);
    var clickEvent = getLayerPropertyValue(style, 'click-event', lineString, lod);
    var drawEvent = getLayerPropertyValue(style, 'draw-event', lineString, lod);
    var enterEvent = getLayerPropertyValue(style, 'enter-event', lineString, lod);
    var leaveEvent = getLayerPropertyValue(style, 'leave-event', lineString, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', lineString, lod);

    var bufferSize = getCharVerticesCount() * labelText.length * 2;
    var vertexBuffer = new Float32Array(bufferSize);
    var texcoordsBuffer = new Float32Array(bufferSize);

    //debugger

    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent;

    var index = addStreetTextOnPath(lineLabelPoints, labelText, labelSize, globals.fonts['default'], labelOffset, vertexBuffer, texcoordsBuffer, index);
    index = addStreetTextOnPath(lineLabelPoints2, labelText, labelSize, globals.fonts['default'], labelOffset, vertexBuffer, texcoordsBuffer, index);

    var signature = JSON.stringify({
        type: 'line-label',
        color : labelColor,
        zIndex : zIndex,
        zOffset : zbufferOffset
    });

    postGroupMessage({'command':'addRenderJob', 'type': 'line-label', 'vertexBuffer': vertexBuffer,
        'texcoordsBuffer': texcoordsBuffer, 'color':labelColor, 'z-index':zIndex, 'center': center,
        'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
        'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
        'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
        'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer.buffer, texcoordsBuffer.buffer], signature);
};

export {processLineStringPass, processLineLabel};

