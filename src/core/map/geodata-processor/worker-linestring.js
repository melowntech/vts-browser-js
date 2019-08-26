
import {globals as globals_, vec3Normalize as vec3Normalize_,
        vec3Cross as vec3Cross_} from './worker-globals.js';
import {getLayerPropertyValue as getLayerPropertyValue_,
        getLayerExpresionValue as getLayerExpresionValue_, hasLayerProperty as hasLayerProperty_} from './worker-style.js';
import {addStreetTextOnPath as addStreetTextOnPath_, getTextGlyphs as getTextGlyphs_,
        areTextCharactersAvailable as areTextCharactersAvailable_,
        getCharVerticesCount as getCharVerticesCount_, getFonts as getFonts_, getFontsStorage as getFontsStorage_} from './worker-text.js';
import {postGroupMessageFast as postGroupMessageFast_} from './worker-message.js';
import {checkDPoints as checkDPoints_} from './worker-pointarray.js';

//get rid of compiler mess
var globals = globals_, vec3Normalize = vec3Normalize_,
    vec3Cross = vec3Cross_;
var getLayerPropertyValue = getLayerPropertyValue_,
    getLayerExpresionValue = getLayerExpresionValue_, hasLayerProperty = hasLayerProperty_;
var addStreetTextOnPath = addStreetTextOnPath_, areTextCharactersAvailable = areTextCharactersAvailable_,
    getCharVerticesCount = getCharVerticesCount_, getFonts = getFonts_, getFontsStorage = getFontsStorage_;
var postGroupMessageFast = postGroupMessageFast_, getTextGlyphs = getTextGlyphs_;
var checkDPoints = checkDPoints_;


var getLineInfo = function(lineString, lod, style, featureIndex, zIndex, eventInfo) {

};

var processLineStringPass = function(lineString, lod, style, featureIndex, zIndex, eventInfo) {

    checkDPoints(lineString);

    var lines = lineString['lines'];

    if (!lines || lines.length == 0) {
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
    var advancedHit = getLayerPropertyValue(style, 'advanced-hit', lineString, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', lineString, lod);

    if (hasLayerProperty(style,'line-type')) {

    } else {
        var lineFlat = getLayerPropertyValue(style, 'line-flat', lineString, lod);
    }

    var lineColor = getLayerPropertyValue(style, 'line-color', lineString, lod);
    var lineWidth = 0.5 * getLayerPropertyValue(style, 'line-width', lineString, lod);
    var lineWidthUnits = getLayerPropertyValue(style, 'line-width-units', lineString, lod);

    var lineStyle = getLayerPropertyValue(style, 'line-style', lineString, lod);
    var lineStyleTexture = getLayerPropertyValue(style, 'line-style-texture', lineString, lod);
    var lineStyleBackground = getLayerPropertyValue(style, 'line-style-background', lineString, lod);

    var lineLabelSize = getLayerPropertyValue(style, 'line-label-size', lineString, lod);

    var texturedLine = (lineStyle != 'solid');
    var widthByRatio = (lineWidthUnits == 'ratio');

    if (lineWidthUnits == 'points') {
        lineWidth *= globals.pixelFactor / ((1 / 72) * (96));
    }

    var index = 0, index2 = 0, index3 = 0;
    var skipJoins = false;

    if (widthByRatio) {
        skipJoins = (!lineFlat && ((lineWidth/* *globals.invPixelFactor*/)*1080) < 2.1);
    } else {
        skipJoins = (!lineFlat && (lineWidth/* *globals.invPixelFactor*/) < 2.1);        
    }

    var ii, i, li, p2, v, vv, l, n, nn, p1, p, elementIndex, elemetBase = 1;

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

    if (totalPoints <= 1) {
        return;
    }

    if (lineFlat) {
        circleSides = 2;
    }

    //allocate buffers
    var lineVertices = ((texturedLine || (widthByRatio)) || !lineFlat ? 4 : 3) * 3 * 2;
    var joinVertices = skipJoins ? 0 : (circleSides * ((texturedLine || (widthByRatio)) || !lineFlat? 4 : 3) * 3);
    var vertexBuffer = new Float32Array((totalPoints-1) * lineVertices + totalPoints * joinVertices);

    if (advancedHit) {
       var elementBuffer = new Float32Array((totalPoints-1) * (3 * 2) + totalPoints * (skipJoins ? 0 : circleSides) * 3);
    }

    if (!(lineFlat && !texturedLine && !widthByRatio)) {
        var lineNormals = 3 * 4 * 2;
        var joinNormals = skipJoins ? 0 : (circleSides * 3 * 4);
        var normalBuffer = new Float32Array((totalPoints-1) * lineNormals + totalPoints * joinNormals);
    }

    var center = [0,0,0];
    var lineLabelStack = [];
    var forceOrigin = globals.forceOrigin;
    var bboxMin = globals.bboxMin;
    var geocent = globals.geocent;
    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceScale = globals.forceScale;
    var vstart = [1,0,0], vend = [-1,0,0];

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
    
        var distance = 0.001;
        var distance2 = 0.001;
        /*var ln = null;*/
        var vertexBase = index;
        var normalBase = index2;

        //add lines
        for (i = 0, li = points.length - 1; i < li; i++) {
    
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
    
            if (advancedHit) {
                elementIndex = elemetBase + i;

                elementBuffer[index3] = elementIndex;
                elementBuffer[index3+1] = elementIndex;
                elementBuffer[index3+2] = elementIndex;
    
                //add polygon
                elementBuffer[index3+3] = elementIndex;
                elementBuffer[index3+4] = elementIndex;
                elementBuffer[index3+5] = elementIndex;

                index3 += 6;
            }

            if (lineFlat && !texturedLine && !widthByRatio) {

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

                    if (i == 0) {
                        vstart = vv;
                    }

                    if (i == (li - 1)) {
                        vend = vv;
                    }
                    
                    n = [n[0] * lineWidth, n[1] * lineWidth, n[2] * lineWidth];
                } else {
                    //direction vector
                    v = [p2[0] - p1[0], p2[1] - p1[1], 0];
        
                    //get line length
                    l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
                    distance2 += l;
        
                    l = (l != 0) ? (lineWidth / l) : 0;

                    n = [-v[1]*l, v[0]*l, 0];

                    if (i == 0) {
                        vstart = [v[0]*l, v[1]*l, 0];
                    }

                    if (i == (li - 1)) {
                        vend = [v[0]*l, v[1]*l, 0];
                    }
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
    
   
                //console.log("distance("+i+"): " + distance + " " + distance2);
    
                if (lineFlat) {
                    
                    /*
                    //normalize vector to line width and rotate 90 degrees
                    l = (l != 0) ? (lineWidth / l) : 0;
                    n = [-v[1]*l, v[0]*l,0];
    
                    if (joinParams != null) {
                        joinParams[i] = (l != 0) ? Math.atan2(v[0], v[1]) + Math.PI *0.5 : 0;
                    }*/
    
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

                        if (i == 0) {
                            vstart = vv;
                        }

                        if (i == (li - 1)) {
                            vend = vv;
                        }
                        
                        vec3Normalize(bboxMin, nn);
                        vec3Cross(nn, vv, n);
                        
                        //n = [n[0] * lineWidth, n[1] * lineWidth, n[2] * lineWidth];
                        n = [n[0], n[1], n[2]];
                    } else {
                        //direction vector
                        v = [p2[0] - p1[0], p2[1] - p1[1], 0];
            
                        //get line length
                        l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
                        distance2 += l;
            
                        l = (l != 0) ? (lineWidth / l) : 0;

                        n = [-v[1], v[0], 0];

                        if (i == 0) {
                            vstart = [v[0]*l, v[1]*l, 0];
                        }

                        if (i == (li - 1)) {
                            vend = [v[0]*l, v[1]*l, 0];
                        }
                    }

                    //add polygon
                    vertexBuffer[index] = p1[0];
                    vertexBuffer[index+1] = p1[1];
                    vertexBuffer[index+2] = p1[2];
                    vertexBuffer[index+3] = distance;
                    normalBuffer[index2] = n[0];
                    normalBuffer[index2+1] = n[1];
                    normalBuffer[index2+2] = n[2];
                    normalBuffer[index2+3] = lineWidth;
    
                    vertexBuffer[index+4] = p1[0];
                    vertexBuffer[index+5] = p1[1];
                    vertexBuffer[index+6] = p1[2];
                    vertexBuffer[index+7] = -distance;
                    normalBuffer[index2+4] = -n[0];
                    normalBuffer[index2+5] = -n[1];
                    normalBuffer[index2+6] = -n[2];
                    normalBuffer[index2+7] = lineWidth;
    
                    vertexBuffer[index+8] = p2[0];
                    vertexBuffer[index+9] = p2[1];
                    vertexBuffer[index+10] = p2[2];
                    vertexBuffer[index+11] = distance2;
                    normalBuffer[index2+8] = n[0];
                    normalBuffer[index2+9] = n[1];
                    normalBuffer[index2+10] = n[2];
                    normalBuffer[index2+11] = lineWidth;
    
                    //add polygon
                    vertexBuffer[index+12] = p1[0];
                    vertexBuffer[index+13] = p1[1];
                    vertexBuffer[index+14] = p1[2];
                    vertexBuffer[index+15] = -distance;
                    normalBuffer[index2+12] = -n[0];
                    normalBuffer[index2+13] = -n[1];
                    normalBuffer[index2+14] = -n[2];
                    normalBuffer[index2+15] = lineWidth;
    
                    vertexBuffer[index+16] = p2[0];
                    vertexBuffer[index+17] = p2[1];
                    vertexBuffer[index+18] = p2[2];
                    vertexBuffer[index+19] = -distance2;
                    normalBuffer[index2+16] = -n[0];
                    normalBuffer[index2+17] = -n[1];
                    normalBuffer[index2+18] = -n[2];
                    normalBuffer[index2+19] = lineWidth;
    
                    vertexBuffer[index+20] = p2[0];
                    vertexBuffer[index+21] = p2[1];
                    vertexBuffer[index+22] = p2[2];
                    vertexBuffer[index+23] = distance2;
                    normalBuffer[index2+20] = n[0];
                    normalBuffer[index2+21] = n[1];
                    normalBuffer[index2+22] = n[2];
                    normalBuffer[index2+23] = lineWidth;
    
                    index += 24;
                    index2 += 24;
                    
                } else {

                    //direction vector
                    v = [p2[0] - p1[0], p2[1] - p1[1], 0];
        
                    //get line length
                    l = Math.sqrt(v[0]*v[0] + v[1]*v[1]);
                    distance2 += l;
    
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
                var angleShift = 0;//(joinParams != null) ? joinParams[i] : 0;
                /*var dx, dy;*/

                if (lineFlat) {

                    if (advancedHit) {
                        elementIndex = elemetBase + ((i != (li-1)) ? i : (i -1));

                        elementBuffer[index3] = elementIndex;
                        elementBuffer[index3+1] = elementIndex;
                        elementBuffer[index3+2] = elementIndex;
            
                        //add polygon
                        elementBuffer[index3+3] = elementIndex;
                        elementBuffer[index3+4] = elementIndex;
                        elementBuffer[index3+5] = elementIndex;

                        index3 += 6;
                    }

                    var lineIndex, lineIndex2;

                    if (!(texturedLine || widthByRatio)) {

                        if (i != (li-1)) {
                            lineIndex = vertexBase + i * lineVertices;
                        } else {
                            lineIndex = vertexBase + (i - 1) * lineVertices;
                        }

                        if (i > 0) {
                            lineIndex2 = vertexBase + (i - 1) * lineVertices;
                        } else {
                            lineIndex2 = vertexBase + lineIndex;
                        }

                        if (i == 0) { //start cap
                            //add polygon
                            vertexBuffer[index] = p1[0];
                            vertexBuffer[index+1] = p1[1];
                            vertexBuffer[index+2] = p1[2];

                            vertexBuffer[index+3] = vertexBuffer[lineIndex];
                            vertexBuffer[index+4] = vertexBuffer[lineIndex+1];
                            vertexBuffer[index+5] = vertexBuffer[lineIndex+2];

                            vertexBuffer[index+6] = p1[0] - vstart[0] * lineWidth;
                            vertexBuffer[index+7] = p1[1] - vstart[1] * lineWidth;
                            vertexBuffer[index+8] = p1[2] - vstart[2] * lineWidth;

                            //add polygon
                            vertexBuffer[index+9] = p1[0];
                            vertexBuffer[index+9+1] = p1[1];
                            vertexBuffer[index+9+2] = p1[2];

                            vertexBuffer[index+9+3] = vertexBuffer[lineIndex+3];
                            vertexBuffer[index+9+4] = vertexBuffer[lineIndex+4];
                            vertexBuffer[index+9+5] = vertexBuffer[lineIndex+5];

                            vertexBuffer[index+9+6] = p1[0] - vstart[0] * lineWidth;
                            vertexBuffer[index+9+7] = p1[1] - vstart[1] * lineWidth;
                            vertexBuffer[index+9+8] = p1[2] - vstart[2] * lineWidth;
                        } else if (i == (li - 1)) {  //end cap
                            //add polygon
                            vertexBuffer[index] = p1[0];
                            vertexBuffer[index+1] = p1[1];
                            vertexBuffer[index+2] = p1[2];

                            vertexBuffer[index+3] = vertexBuffer[lineIndex+15];
                            vertexBuffer[index+4] = vertexBuffer[lineIndex+16];
                            vertexBuffer[index+5] = vertexBuffer[lineIndex+17];

                            vertexBuffer[index+6] = p1[0] + vend[0] * lineWidth;
                            vertexBuffer[index+7] = p1[1] + vend[1] * lineWidth;
                            vertexBuffer[index+8] = p1[2] + vend[2] * lineWidth;

                            //add polygon
                            vertexBuffer[index+9] = p1[0];
                            vertexBuffer[index+9+1] = p1[1];
                            vertexBuffer[index+9+2] = p1[2];

                            vertexBuffer[index+9+3] = vertexBuffer[lineIndex+12];
                            vertexBuffer[index+9+4] = vertexBuffer[lineIndex+13];
                            vertexBuffer[index+9+5] = vertexBuffer[lineIndex+14];

                            vertexBuffer[index+9+6] = p1[0] + vend[0] * lineWidth;
                            vertexBuffer[index+9+7] = p1[1] + vend[1] * lineWidth;
                            vertexBuffer[index+9+8] = p1[2] + vend[2] * lineWidth;
                        } else {
                            //add polygon
                            vertexBuffer[index] = p1[0];
                            vertexBuffer[index+1] = p1[1];
                            vertexBuffer[index+2] = p1[2];

                            vertexBuffer[index+3] = vertexBuffer[lineIndex];
                            vertexBuffer[index+4] = vertexBuffer[lineIndex+1];
                            vertexBuffer[index+5] = vertexBuffer[lineIndex+2];

                            vertexBuffer[index+6] = vertexBuffer[lineIndex2 + 15];
                            vertexBuffer[index+7] = vertexBuffer[lineIndex2 + 16];
                            vertexBuffer[index+8] = vertexBuffer[lineIndex2 + 17];

                            //add polygon
                            vertexBuffer[index+9] = p1[0];
                            vertexBuffer[index+9+1] = p1[1];
                            vertexBuffer[index+9+2] = p1[2];

                            vertexBuffer[index+9+3] = vertexBuffer[lineIndex+3];
                            vertexBuffer[index+9+4] = vertexBuffer[lineIndex+4];
                            vertexBuffer[index+9+5] = vertexBuffer[lineIndex+5];

                            vertexBuffer[index+9+6] = vertexBuffer[lineIndex2 + 12];
                            vertexBuffer[index+9+7] = vertexBuffer[lineIndex2 + 13];
                            vertexBuffer[index+9+8] = vertexBuffer[lineIndex2 + 14];
                        }

                        index += 18;

                    } else {

                        if (i != (li-1)) {
                            distance = vertexBuffer[i * lineVertices + 3];
                        } else {
                            distance = vertexBuffer[(i - 1) * lineVertices + 11];
                        }

                        if (i != (li-1)) {
                            lineIndex = normalBase + i * lineVertices;
                        } else {
                            lineIndex = normalBase + (i - 1) * lineVertices + 8;
                        }

                        if (i > 0) {
                            lineIndex2 = normalBase + (i - 1) * lineVertices + 8;
                        } else {
                            lineIndex2 = normalBase + lineIndex;
                        }

                        //add polygon
                        vertexBuffer[index] = p1[0];
                        vertexBuffer[index+1] = p1[1];
                        vertexBuffer[index+2] = p1[2];
                        vertexBuffer[index+3] = distance;

                        vertexBuffer[index+4] = p1[0];
                        vertexBuffer[index+5] = p1[1];
                        vertexBuffer[index+6] = p1[2];
                        vertexBuffer[index+7] = distance;

                        vertexBuffer[index+8] = p1[0];
                        vertexBuffer[index+9] = p1[1];
                        vertexBuffer[index+10] = p1[2];
                        vertexBuffer[index+11] = distance;

                        //add polygon
                        vertexBuffer[index+12] = p1[0];
                        vertexBuffer[index+1+12] = p1[1];
                        vertexBuffer[index+2+12] = p1[2];
                        vertexBuffer[index+3+12] = distance;

                        vertexBuffer[index+4+12] = p1[0];
                        vertexBuffer[index+5+12] = p1[1];
                        vertexBuffer[index+6+12] = p1[2];
                        vertexBuffer[index+7+12] = -distance;

                        vertexBuffer[index+8+12] = p1[0];
                        vertexBuffer[index+9+12] = p1[1];
                        vertexBuffer[index+10+12] = p1[2];
                        vertexBuffer[index+11+12] = -distance;

                        if (i == 0) { //start cap
                            //first polygon
                            normalBuffer[index2] = 0;
                            normalBuffer[index2+1] = 0;
                            normalBuffer[index2+2] = 0;
                            normalBuffer[index2+3] = -lineWidth;
            
                            normalBuffer[index2+4] = normalBuffer[lineIndex];
                            normalBuffer[index2+5] = normalBuffer[lineIndex+1];
                            normalBuffer[index2+6] = normalBuffer[lineIndex+2];
                            normalBuffer[index2+7] = lineWidth;
            
                            normalBuffer[index2+8] = -vstart[0];
                            normalBuffer[index2+9] = -vstart[1];
                            normalBuffer[index2+10] = -vstart[2];
                            normalBuffer[index2+11] = -lineWidth;

                            //second polygon
                            normalBuffer[index2+12] = 0;
                            normalBuffer[index2+1+12] = 0;
                            normalBuffer[index2+2+12] = 0;
                            normalBuffer[index2+3+12] = -lineWidth;

                            normalBuffer[index2+4+12] = -normalBuffer[lineIndex];
                            normalBuffer[index2+5+12] = -normalBuffer[lineIndex+1];
                            normalBuffer[index2+6+12] = -normalBuffer[lineIndex+2];
                            normalBuffer[index2+7+12] = lineWidth;
            
                            normalBuffer[index2+8+12] = -vstart[0];
                            normalBuffer[index2+9+12] = -vstart[1];
                            normalBuffer[index2+10+12] = -vstart[2];
                            normalBuffer[index2+11+12] = -lineWidth;
                        } else if (i == (li - 1)) {  //end cap
                            //first polygon
                            normalBuffer[index2] = 0;
                            normalBuffer[index2+1] = 0;
                            normalBuffer[index2+2] = 0;
                            normalBuffer[index2+3] = -lineWidth;
            
                            normalBuffer[index2+4] = normalBuffer[lineIndex2];
                            normalBuffer[index2+5] = normalBuffer[lineIndex2+1];
                            normalBuffer[index2+6] = normalBuffer[lineIndex2+2];
                            normalBuffer[index2+7] = lineWidth;
            
                            normalBuffer[index2+8] = vend[0];
                            normalBuffer[index2+9] = vend[1];
                            normalBuffer[index2+10] = vend[2];
                            normalBuffer[index2+11] = -lineWidth;

                            //second polygon
                            normalBuffer[index2+12] = 0;
                            normalBuffer[index2+1+12] = 0;
                            normalBuffer[index2+2+12] = 0;
                            normalBuffer[index2+3+12] = -lineWidth;

                            normalBuffer[index2+4+12] = -normalBuffer[lineIndex2];
                            normalBuffer[index2+5+12] = -normalBuffer[lineIndex2+1];
                            normalBuffer[index2+6+12] = -normalBuffer[lineIndex2+2];
                            normalBuffer[index2+7+12] = lineWidth;
            
                            normalBuffer[index2+8+12] = vend[0];
                            normalBuffer[index2+9+12] = vend[1];
                            normalBuffer[index2+10+12] = vend[2];
                            normalBuffer[index2+11+12] = -lineWidth;
                        } else {
                            normalBuffer[index2] = 0;
                            normalBuffer[index2+1] = 0;
                            normalBuffer[index2+2] = 0;
                            normalBuffer[index2+3] = -lineWidth;
            
                            normalBuffer[index2+4] = normalBuffer[lineIndex];
                            normalBuffer[index2+5] = normalBuffer[lineIndex+1];
                            normalBuffer[index2+6] = normalBuffer[lineIndex+2];
                            normalBuffer[index2+7] = lineWidth;
            
                            normalBuffer[index2+8] = normalBuffer[lineIndex2];
                            normalBuffer[index2+9] = normalBuffer[lineIndex2+1];
                            normalBuffer[index2+10] = normalBuffer[lineIndex2+2];
                            normalBuffer[index2+11] = lineWidth;

                            //add polygon
                            normalBuffer[index2+12] = 0;
                            normalBuffer[index2+1+12] = 0;
                            normalBuffer[index2+2+12] = 0;
                            normalBuffer[index2+3+12] = -lineWidth;

                            normalBuffer[index2+4+12] = -normalBuffer[lineIndex];
                            normalBuffer[index2+5+12] = -normalBuffer[lineIndex+1];
                            normalBuffer[index2+6+12] = -normalBuffer[lineIndex+2];
                            normalBuffer[index2+7+12] = lineWidth;
            
                            normalBuffer[index2+8+12] = -normalBuffer[lineIndex2];
                            normalBuffer[index2+9+12] = -normalBuffer[lineIndex2+1];
                            normalBuffer[index2+10+12] = -normalBuffer[lineIndex2+2];
                            normalBuffer[index2+11+12] = lineWidth;
                        }

                        index += 24;
                        index2 += 24;

                    }

                } else {

                    var segmentIndex = (i != (li-1)) ? i : (i - 1);

                    for (var j = 0; j < circleSides; j++) {
           
                        if (advancedHit) {
                            elementIndex = elemetBase + segmentIndex;
                            elementBuffer[index3] = elementIndex;
                            elementBuffer[index3+1] = elementIndex;
                            elementBuffer[index3+2] = elementIndex;
                            index3 += 3;
                        }

                        distance = vertexBuffer[segmentIndex * lineVertices + 3];
        
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
    
            if ((i + 1) < li) {
                p1 = points[i+1];
            }
        }

        elemetBase += points.length;
    }

    if (totalPoints > 0) {
        center[0] /= totalPoints;
        center[1] /= totalPoints;
        center[2] /= totalPoints;
    }

    center[0] += globals.groupOrigin[0];
    center[1] += globals.groupOrigin[1];
    center[2] += globals.groupOrigin[2];

    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent, type;

    if (line) {
        //console.log('totalPoints:' + totalPoints + ' vbuff-l:' + (vertexBuffer ? vertexBuffer.length : '??'));

        var messageData = {
            'color':lineColor, 'z-index':zIndex, 'center': center, 'advancedHit': advancedHit, 'totalPoints': totalPoints,
            'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'width-units': lineWidthUnits,
            'hitable':hitable, 'state':globals.hitState, 'eventInfo': (globals.alwaysEventInfo || hitable || drawEvent) ? eventInfo : {},
            'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset, 
            'line-width':lineWidth*2, 'lod':(globals.autoLod ? null : globals.tileLod) };
    
        if (lineFlat) {
            type = texturedLine ? VTS_WORKER_TYPE_FLAT_TLINE : (widthByRatio ? VTS_WORKER_TYPE_FLAT_RLINE : VTS_WORKER_TYPE_FLAT_LINE);
        } else {
            type = texturedLine ? VTS_WORKER_TYPE_PIXEL_TLINE : VTS_WORKER_TYPE_PIXEL_LINE;
        }
    
        if (texturedLine) {
            if (lineStyleTexture != null) {
                messageData['texture'] = [globals.stylesheetBitmaps[lineStyleTexture[0]], lineStyleTexture[1], lineStyleTexture[2]];
                messageData['background'] = lineStyleBackground;
            }
        }

        var signature = JSON.stringify({
            type: 'T'+type,
            color : lineColor,
            zIndex : zIndex,
            zOffset : zbufferOffset,
            state : globals.hitState
        });

        var buffers = (normalBuffer) ? [vertexBuffer, normalBuffer] : [vertexBuffer];

        if (advancedHit) {
            buffers.push(elementBuffer);
        }
        
        postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, type, messageData, buffers, signature);
    }

    if (lineLabel) {
        for (i = 0, li = lineLabelStack.length; i < li; i++) {
            processLineLabel(lineLabelStack[i].points, lineLabelStack[i].points2, lineString, center, lod, style, featureIndex, zIndex, eventInfo);
        }
    }

};

var processLineLabel = function(lineLabelPoints, lineLabelPoints2, lineString, center, lod, style, featureIndex, zIndex, eventInfo) {
    var labelType = getLayerPropertyValue(style, 'line-label-type', lineString, lod);
    var labelColor = getLayerPropertyValue(style, 'line-label-color', lineString, lod);
    var labelColor2 = getLayerPropertyValue(style, 'line-label-color2', lineString, lod);
    var labelOutline = getLayerPropertyValue(style, 'line-label-outline', lineString, lod);
    var labelSource = getLayerPropertyValue(style, 'line-label-source', lineString, lod);
    var labelSize = getLayerPropertyValue(style, 'line-label-size', lineString, lod);
    var labelSpacing = getLayerPropertyValue(style, 'line-label-spacing', lineString, lod);
    var labelLineHeight = getLayerPropertyValue(style, 'line-label-line-height', lineString, lod);
    var labelOffset = getLayerPropertyValue(style, 'line-label-offset', lineString, lod);
    var labelReduce =  getLayerPropertyValue(style, 'dynamic-reduce', lineString, lod);
    var labelOverlap = getLayerPropertyValue(style, 'line-label-no-overlap', lineString, lod);
    var labelOverlapFactor = getLayerPropertyValue(style, 'line-label-no-overlap-factor', lineString, lod);
    var labelOverlapMargin = getLayerPropertyValue(style, 'line-label-no-overlap-margin', lineString, lod);

    if (Math.abs(labelSize) < 0.0001) {
        return;
    }

    var labelText = getLayerExpresionValue(style, labelSource, lineString, lod, labelSource);
    labelText = labelText ? labelText.replace('\r\n', '\n').replace('\r', '\n') : '';
    var fontNames = getLayerPropertyValue(style, 'line-label-font', lineString, lod);
    var fonts = getFonts(fontNames);
    var fontsStorage = getFontsStorage(fontNames);
    var glyphsRes = getTextGlyphs(labelText, fonts);

    if (labelSource == '$name') {
        if (!areTextCharactersAvailable(labelText, fonts, glyphsRes)) {
            var labelText2 = getLayerExpresionValue(style, '$name:en', lineString, lod, labelSource);
            labelText2 = labelText2 ? labelText2.replace('\r\n', '\n').replace('\r', '\n') : '';
            var glyphsRes2 = getTextGlyphs(labelText, fonts);
            
            if (areTextCharactersAvailable(labelText2, fonts, glyphsRes2)) {
                labelText = labelText2;                     
                glyphsRes = glyphsRes2;
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
    var advancedHit = getLayerPropertyValue(style, 'advanced-hit', lineString, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', lineString, lod);

    var bufferSize, vertexBuffer, texcoordsBuffer, singleBuffer, singleBuffer2;

    globals.useLineLabel2 = (labelType != 'flat');

    if (globals.useLineLabel2) {
        bufferSize = 12 * labelText.length;
        singleBuffer = new Float32Array(bufferSize);
        singleBuffer2 = new Float32Array(bufferSize);
    } else {
        bufferSize = getCharVerticesCount() * labelText.length * 2;
        vertexBuffer = new Float32Array(bufferSize);
        texcoordsBuffer = new Float32Array(bufferSize);
    }

    var planes = {};
    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent;
    var originalLabelSize = labelSize;

    globals.lineLabelPass = 0;
    globals.lineLabelPoints = [];
    var index = addStreetTextOnPath(lineLabelPoints, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, 0, planes, glyphsRes, singleBuffer);
    var labelPoints = globals.lineLabelPoints;

    globals.lineLabelPoints = [];
    index = addStreetTextOnPath(lineLabelPoints2, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, globals.useLineLabel2 ? 0 : index, null, glyphsRes, singleBuffer2);
    var labelPoints2 = globals.lineLabelPoints;

    if (!index) {

        //label is bigger than path
        if (globals.useLineLabel2) {

            while(true) {

                //reduce size until is label smaler than path
                labelSize *= 0.5;

                globals.lineLabelPass = 0;
                globals.lineLabelPoints = [];
                var index = addStreetTextOnPath(lineLabelPoints, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, 0, planes, glyphsRes, singleBuffer);
                var labelPoints = globals.lineLabelPoints;

                globals.lineLabelPoints = [];
                index = addStreetTextOnPath(lineLabelPoints2, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, globals.useLineLabel2 ? 0 : index, null, glyphsRes, singleBuffer2);
                var labelPoints2 = globals.lineLabelPoints;

                if (index || labelSize < 0.05) {
                    break;
                }
            }
        }

        if (!index) {
            return;
        }
    }

    var visibility = getLayerPropertyValue(style, 'visibility-rel', lineString, lod) || 
                     getLayerPropertyValue(style, 'visibility-abs', lineString, lod) ||
                     getLayerPropertyValue(style, 'visibility', lineString, lod);
    var culling = getLayerPropertyValue(style, 'culling', lineString, lod);
    var hysteresis = getLayerPropertyValue(style, 'hysteresis', lineString, lod);


    var bboxMin = globals.bboxMin, p, i, li, labelsPack = [], labelIndex = 0;
    var originalLabelOffset = labelOffset;

    if (globals.useLineLabel2) {
        for (i = 0, li = labelPoints.length; i < li; i++) {
            p = labelPoints[i];
            p[0] += bboxMin[0];
            p[1] += bboxMin[1];
            p[2] += bboxMin[2];
            p = labelPoints2[i];
            p[0] += bboxMin[0];
            p[1] += bboxMin[1];
            p[2] += bboxMin[2];
        }

        labelsPack.push([labelSize, globals.textVector, labelPoints, labelPoints2]);
        globals.lineLabelPass = 1;

        //bigger labels
        while(true) {

            labelSize *= 2;

            globals.lineLabelPoints = [];
            index = addStreetTextOnPath(lineLabelPoints, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, 0, planes, glyphsRes, singleBuffer);
            labelPoints = globals.lineLabelPoints;

            if (!index) {
                break;
            }

            globals.lineLabelPoints = [];
            index = addStreetTextOnPath(lineLabelPoints2, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, globals.useLineLabel2 ? 0 : index, null, glyphsRes, singleBuffer2);
            labelPoints2 = globals.lineLabelPoints;

            for (i = 0, li = labelPoints.length; i < li; i++) {
                p = labelPoints[i];
                p[0] += bboxMin[0];
                p[1] += bboxMin[1];
                p[2] += bboxMin[2];
                p = labelPoints2[i];
                p[0] += bboxMin[0];
                p[1] += bboxMin[1];
                p[2] += bboxMin[2];
            }

            labelsPack.push([labelSize, globals.textVector, labelPoints, labelPoints2]);
        }

        labelSize = originalLabelSize;

        //smaller labels
        while(true) {

            labelSize *= 0.5;

            globals.lineLabelPoints = [];
            index = addStreetTextOnPath(lineLabelPoints, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, 0, planes, glyphsRes, singleBuffer);
            labelPoints = globals.lineLabelPoints;

            if (globals.textLength < 2) {
                break;
            }

            globals.lineLabelPoints = [];
            index = addStreetTextOnPath(lineLabelPoints2, labelText, labelSize, labelSpacing, fonts, labelOffset, vertexBuffer, texcoordsBuffer, 0, null, glyphsRes, singleBuffer2);
            labelPoints2 = globals.lineLabelPoints;

            for (i = 0, li = labelPoints.length; i < li; i++) {
                p = labelPoints[i];
                p[0] += bboxMin[0];
                p[1] += bboxMin[1];
                p[2] += bboxMin[2];
                p = labelPoints2[i];
                p[0] += bboxMin[0];
                p[1] += bboxMin[1];
                p[2] += bboxMin[2];
            }

            labelsPack.unshift([labelSize, globals.textVector, labelPoints, labelPoints2]);
            labelIndex++;
        }

        center = globals.textCenter;
        center[0] += bboxMin[0];
        center[1] += bboxMin[1];
        center[2] += bboxMin[2];
    }
    

    //var fonts = labelData.fonts;
    var labelFiles = new Array(fonts.length);

    for (i = 0, li= fonts.length; i < li; i++) {
        labelFiles[i] = [];
    }

    for (var key in planes) {
        var fontIndex = parseInt(key);
        var planes2 = planes[key];

        var files = [];

        for (var key2 in planes2) {
            var plane = parseInt(key2) - (fontIndex*4000);
            var file = Math.round((plane - (plane % 4)) / 4);

            if (files.indexOf(file) == -1) {
                files.push(file);
            }
        }

        labelFiles[fontIndex] = files;
    }

    var signature = JSON.stringify({
        type: 'line-label',
        color : labelColor,
        color2 : labelColor2,
        outline : labelOutline,
        fonts : fontNames,
        zIndex : zIndex,
        zOffset : zbufferOffset
    });


    if (labelOverlap) {
        var factorType = null, factorValue = null;

        if (labelOverlapFactor !== null) {
            switch(labelOverlapFactor[0]) {
                case 'direct':      factorType = VTS_NO_OVERLAP_DIRECT;      break;
                case 'div-by-dist': factorType = VTS_NO_OVERLAP_DIV_BY_DIST; break;
            }

            factorValue = labelOverlapFactor[1];
        }

        var noOverlap = [labelOverlapMargin, factorType, factorValue];
    }

    postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, globals.useLineLabel2 ? VTS_WORKER_TYPE_LINE_LABEL2 : VTS_WORKER_TYPE_LINE_LABEL, {
        'color':labelColor, 'color2':labelColor2, 'outline':labelOutline, 'textVector':globals.textVector, 'labelPoints': globals.useLineLabel2 ? labelsPack : [],
        'visibility': visibility, 'culling': culling, 'hysteresis' : hysteresis, 'z-index':zIndex,
        'center': center, 'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
        'reduce':labelReduce, 'noOverlap': (labelOverlap ? noOverlap : null), 'files': labelFiles, 'enter-event':enterEvent,
        'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset, 'advancedHit': advancedHit, 'labelIndex': labelIndex, 'labelSize': originalLabelSize,
        'fonts': fontsStorage, 'hitable':hitable, 'state':globals.hitState, 'eventInfo': (globals.alwaysEventInfo || hitable || drawEvent) ? eventInfo : {},
        'lod':(globals.autoLod ? null : globals.tileLod) }, globals.useLineLabel2 ? [singleBuffer, singleBuffer2] : [vertexBuffer, texcoordsBuffer], signature);
};


var processLineStringGeometry = function(lineString) {

    checkDPoints(lineString);

    var lines = lineString['lines'];

    if (lines || lines.length == 0) {
        return;
    }

    //debugger
    var totalPoints = 0;
    var indicesBuffer = new Uint32Array(lines.length);

    for (i = 0; i < lines.length; i++) {
        indicesBuffer[i] = totalPoints;

        if (Array.isArray(lines[i])) {
            totalPoints += lines[i].length;
        }
    }

    var geometryBuffer = new Float64Array(totalPoints * 3);

    /*var forceOrigin = globals.forceOrigin;
    var tileX = globals.tileX;
    var tileY = globals.tileY;*/
    var forceScale = globals.forceScale;
    var index = 0, p1, p2, pp, p;

    for (var i = 0; i < lines.length; i++) {
        if (!Array.isArray(lines[i]) || !lines[i].length) {
            continue;
        }
        
        var points = lines[i];
   
        p = points[0];
        p1 = [p[0], p[1], p[2]];
    
        //add lines
        for (var j = 0, lj = points.length; j < lj; j++) {

            /*if (forceOrigin) {
                pp = [p1[0] - tileX, p1[1] - tileY, p1[2]];
            }*/
    
            if (forceScale != null) {
                pp = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
            }

            geometryBuffer[index] = pp[0];
            geometryBuffer[index+1] = pp[1];
            geometryBuffer[index+2] = pp[2];
            index += 3;

            if (j == (lj - 1)) {
                break;
            }
    
            p1 = points[j+1];
        }
    }

    globals.signatureCounter++;

    postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_LINE_GEOMETRY, {
        'id':lineString['id'] }, [geometryBuffer, indicesBuffer], (""+globals.signatureCounter));
};


export {processLineStringPass, processLineLabel, processLineStringGeometry};

