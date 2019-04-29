
import {globals as globals_, vec3Normalize as vec3Normalize_} from './worker-globals.js';
import {getLayerPropertyValue as getLayerPropertyValue_} from './worker-style.js';
import {postGroupMessageFast as postGroupMessageFast_} from './worker-message.js';
import {processLineStringPass as processLineStringPass_} from './worker-linestring.js';
import {processPointArrayPass as processPointArrayPass_} from './worker-pointarray.js';

//get rid of compiler mess
var globals = globals_, vec3Normalize = vec3Normalize_;
var getLayerPropertyValue = getLayerPropertyValue_;
var postGroupMessageFast = postGroupMessageFast_;
var processLineStringPass = processLineStringPass_;
var processPointArrayPass = processPointArrayPass_;

var processPolygonPass = function(polygon, lod, style, featureIndex, zIndex, eventInfo) {
    var vertices = polygon['vertices'] || [];
    if (vertices.length == 0) {
        return;
    }
    
    // borders as points
    if (getLayerPropertyValue(style, 'point', polygon, lod) ||
        getLayerPropertyValue(style, 'label', polygon, lod)) {
        processPolygonLines(polygon, vertices, lod, style, featureIndex, zIndex, eventInfo, false);
    }
    
    // borders as lines
    if (getLayerPropertyValue(style, 'line', polygon, lod) ||
        getLayerPropertyValue(style, 'line-label', polygon, lod)) {
        processPolygonLines(polygon, vertices, lod, style, featureIndex, zIndex, eventInfo, true);
    }
    
    var spolygon = getLayerPropertyValue(style, 'polygon', polygon, lod);
    
    if (!spolygon) {
        return;
    }
    
    var surface = polygon['surface'] || [];
    if (surface.length == 0) {
        return;
    }
    
    var hoverEvent = getLayerPropertyValue(style, 'hover-event', polygon, lod);
    var clickEvent = getLayerPropertyValue(style, 'click-event', polygon, lod);
    var drawEvent = getLayerPropertyValue(style, 'draw-event', polygon, lod);
    var enterEvent = getLayerPropertyValue(style, 'enter-event', polygon, lod);
    var leaveEvent = getLayerPropertyValue(style, 'leave-event', polygon, lod);
    var advancedHit = getLayerPropertyValue(style, 'advanced-hit', polygon, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', polygon, lod);
    
    var polygonColor = getLayerPropertyValue(style, 'polygon-color', polygon, lod);
    var polygonStyle = getLayerPropertyValue(style, 'polygon-style', polygon, lod);
    var polygonStencil = getLayerPropertyValue(style, 'polygon-use-stencil', polygon, lod);
    var polygonCulling = getLayerPropertyValue(style, 'polygon-culling', polygon, lod);
    var polygonExtrude = getLayerPropertyValue(style, 'polygon-extrude', polygon, lod);
    
    polygonStyle = (polygonStyle == 'flatshade') ? 1 : 0;
    polygonCulling = (polygonCulling == 'back') ? 1 : 0;

    var geocent = globals.geocent;
    var center = [0,0,0], n = [0,0,0];
    var bboxMin = globals.bboxMin;
  

    // allocate vertex buffer
    var trisCount = surface.length / 3;
    var vertexCount = trisCount * 3;
    var vertexBuffer = new Float32Array(vertexCount * 3);
    
    var surfaceI = 0;
    var index = 0;
    var p1 = [0,0,0], p2 = [0,0,0], p3 = [0,0,0], p4 = [0,0,0];
    var offs, li, j, lj;

    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceOrigin = globals.forceOrigin;
    var forceScale = globals.forceScale;    

    //debugger
    
    //console.log("vertexCount = " + vertexCount);
    //add tris
    for (var i = 0; i < vertexCount; i++) {
        offs = 3 * surface[surfaceI++];
        p1 = [vertices[offs], vertices[offs+1], vertices[offs+2]];

        if (forceOrigin) {
            p1 = [p1[0] - tileX, p1[1] - tileY, p1[2]];
        }

        if (forceScale != null) {
            p1 = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
        }
 
        if (polygonExtrude) {
            if (geocent) {
                vec3Normalize([p1[0] + bboxMin[0], p1[1] + bboxMin[1], p1[2] + bboxMin[2]], n);
                p1[0] += n[0] * polygonExtrude;
                p1[1] += n[1] * polygonExtrude;
                p1[2] += n[2] * polygonExtrude;
            } else {
                p1[2] += polygonExtrude;
            }
        }

        center[0] += p1[0];
        center[1] += p1[1];
        center[2] += p1[2];

        //add vertex
        vertexBuffer[index++] = p1[0];
        vertexBuffer[index++] = p1[1];
        vertexBuffer[index++] = p1[2];
    }
    
    //console.log( "vertexBuffer: " + vertexBuffer );
    
    if (vertexCount > 0) {
        var k = 1.0 / vertexCount;
        center[0] *= k;
        center[1] *= k;
        center[2] *= k;
    }

    center[0] += globals.groupOrigin[0];
    center[1] += globals.groupOrigin[1];
    center[2] += globals.groupOrigin[2];

    var borders = polygon['borders'] || [];
    if (borders.length > 0) {

        var totalFaces = 0;

        for (i = 0, li = borders.length; i < li; i++) {
            var border = borders[i];
            totalFaces += (border.length + 1) * 2;
        }

        var vertexBuffer2 = vertexBuffer;
        vertexBuffer = new Float32Array(vertexBuffer.length + (totalFaces * 3 * 3));
        vertexBuffer.set(vertexBuffer2);

        for (i = 0, li = borders.length; i < li; i++) {
            var border = borders[i], offset;

            for (j = 0, lj = border.length; j < lj; j++) {

                if (border[j] >= 0) {
                    offset = 3 * border[j];
                } else {
                    offset = 3 * (-border[j]);
                }

                p1[0] = vertices[offset];
                p1[1] = vertices[offset+1];
                p1[2] = vertices[offset+2];

                p3[0] = vertices[offset];
                p3[1] = vertices[offset+1];
                p3[2] = vertices[offset+2];

                if (j < lj - 1) {
                    if (border[j+1] >= 0) {
                        offset = 3 * border[j+1];
                    } else {
                        offset = 3 * (-border[j+1]);
                    }
                } else {
                    if (border[0] >= 0) {
                        offset = 3 * border[0];
                    } else {
                        offset = 3 * (-border[0]);
                    }
                }

                p2[0] = vertices[offset];
                p2[1] = vertices[offset+1];
                p2[2] = vertices[offset+2];

                p4[0] = vertices[offset];
                p4[1] = vertices[offset+1];
                p4[2] = vertices[offset+2];

                if (forceOrigin) {
                    p1 = [p1[0] - tileX, p1[1] - tileY, p1[2]];
                    p2 = [p2[0] - tileX, p2[1] - tileY, p2[2]];
                    p3 = [p3[0] - tileX, p3[1] - tileY, p3[2]];
                    p4 = [p4[0] - tileX, p4[1] - tileY, p4[2]];
                }

                if (forceScale != null) {
                    p1 = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
                    p2 = [p2[0] * forceScale[0], p2[1] * forceScale[1], p2[2] * forceScale[2]];
                    p3 = [p3[0] * forceScale[0], p3[1] * forceScale[1], p3[2] * forceScale[2]];
                    p4 = [p4[0] * forceScale[0], p4[1] * forceScale[1], p4[2] * forceScale[2]];
                }

                if (polygonExtrude) {
                    if (geocent) {
                        vec3Normalize([p1[0] + bboxMin[0], p1[1] + bboxMin[1], p1[2] + bboxMin[2]], n);
                        p1 = [p1[0] + n[0] * polygonExtrude, p1[1] + n[1] * polygonExtrude, p1[2] + n[2] * polygonExtrude];

                        vec3Normalize([p2[0] + bboxMin[0], p2[1] + bboxMin[1], p2[2] + bboxMin[2]], n);
                        p2 = [p2[0] + n[0] * polygonExtrude, p2[1] + n[1] * polygonExtrude, p2[2] + n[2] * polygonExtrude];
                    } else {
                        p1[2] += polygonExtrude;
                        p2[2] += polygonExtrude;
                    }
                }

                vertexBuffer[index] = p4[0];
                vertexBuffer[index+1] = p4[1];
                vertexBuffer[index+2] = p4[2];

                vertexBuffer[index+3] = p2[0];
                vertexBuffer[index+4] = p2[1];
                vertexBuffer[index+5] = p2[2];

                vertexBuffer[index+6] = p1[0];
                vertexBuffer[index+7] = p1[1];
                vertexBuffer[index+8] = p1[2];

                vertexBuffer[index+9] = p1[0];
                vertexBuffer[index+10] = p1[1];
                vertexBuffer[index+11] = p1[2];

                vertexBuffer[index+12] = p3[0];
                vertexBuffer[index+13] = p3[1];
                vertexBuffer[index+14] = p3[2];

                vertexBuffer[index+15] = p4[0];
                vertexBuffer[index+16] = p4[1];
                vertexBuffer[index+17] = p4[2];

                index += 18;
            }
        }
    }    

    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent;
    
    var signature = JSON.stringify({
        style: polygonStyle,
        culling: polygonCulling, 
        stencil: polygonStencil, 
        color : polygonColor,
        zIndex : zIndex,
        zOffset : zbufferOffset,
        state : globals.hitState
    });

    //debugger

    postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_POLYGON, {
        'color':polygonColor, 'z-index':zIndex, 'center': center, 'advancedHit': advancedHit, 'culling': polygonCulling, 
        'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'style' : polygonStyle, 'stencil': polygonStencil, 
        'hitable':hitable, 'state':globals.hitState, 'eventInfo': (globals.alwaysEventInfo || hitable || drawEvent) ? eventInfo : {},
        'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
        'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer], signature);
};

var createEmptyFeatureFromPolygon = function(polygon) {
    var feature = {};
    for(var key in polygon) {
        if(key != 'surface' && key != 'vertices' && key != 'borders') {
            feature[key] = polygon[key];
        }
    }
    return feature;
};

var processPolygonLines = function(polygon, vertices, lod, style, featureIndex, zIndex, eventInfo, processLines) {
    var borders = polygon['borders'] || [];
    if (borders.length == 0) {
        return;
    }
    var polygonExtrude = getLayerPropertyValue(style, 'polygon-extrude', polygon, lod);
    var feature = createEmptyFeatureFromPolygon(polygon);
    var bordersCount = borders.length;
    var allPoints = [], allPoints2 = [];
    var p, p2, n = [0,0,0];

    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceOrigin = globals.forceOrigin;
    var forceScale = globals.forceScale;    
    var forceScale2 = [1.0/forceScale[0], 1.0/forceScale[1], 1.0/forceScale[2]];    
    var geocent = globals.geocent;
    var bboxMin = globals.bboxMin;

    for (var j = 0; j < bordersCount; j++) {
        var border = borders[j], offset;
        var pointsCount = border.length;
        var pointsCount2 = 0;
        if (pointsCount > 0) {
            var points, points3, points4, i;
            if (processLines) {
                points = new Array(pointsCount + 1);
                points3 = new Array(pointsCount + 1);
            } else {
                points = new Array(pointsCount);
                points3 = new Array(pointsCount);
            }
            for (i = 0; i < pointsCount; i++) {
                if (border[i] >= 0) {
                    offset = 3 * border[i];
                    pointsCount2++; // count vertices with positive index
                } else {
                    offset = 3 * (-border[i]);
                }

                if (polygonExtrude) {
                    p = [vertices[offset], vertices[offset+1], vertices[offset+2]];
                    p2 = p.slice();

                    if (forceOrigin) {
                        p2 = [p2[0] - tileX, p2[1] - tileY, p2[2]];
                    }

                    if (forceScale != null) {
                        p2 = [p2[0] * forceScale[0], p2[1] * forceScale[1], p2[2] * forceScale[2]];
                    }

                    if (geocent) {
                        vec3Normalize([p2[0] + bboxMin[0], p2[1] + bboxMin[1], p2[2] + bboxMin[2]], n);
                        p2 = [p[0] + (n[0] * polygonExtrude) * forceScale2[0], p[1] + (n[1] * polygonExtrude) * forceScale2[1], p[2] + (n[2] * polygonExtrude) * forceScale2[2]];
                    } else {
                        p2[2] += polygonExtrude;
                    }

                    points[i] = p;
                    points3[i] = p2;

                    if (border[i] >= 0) {
                        allPoints.push([p,p2]);
                    }

                } else {
                    points[i] = [vertices[offset], vertices[offset+1], vertices[offset+2]];
                }

                if (processLines && i == 0) {
                    points[pointsCount] = points[0];
                    points3[pointsCount] = points3[0];
                }
            }

            var points2 = new Array(pointsCount2);
            var points4 = new Array(pointsCount2);
            var i2 = 0;
            //debugger

            //create array of points only for vertices with positive value
            for (i = 0; i < pointsCount; i++) {
                if (border[i] >= 0) {
                    points2[i2] = points[i].slice();

                    if (polygonExtrude) {
                        points4[i2] = points3[i].slice();
                    }

                    i2++;
                }
            }

            allPoints.push(points);
            allPoints2 = allPoints2.concat(points2);

            if (polygonExtrude) {
                allPoints.push(points3);
                allPoints2 = allPoints2.concat(points4);
            }

        }
    }

    if(processLines && allPoints.length > 0) {
        feature['lines'] = allPoints;
        processLineStringPass(feature, lod, style, featureIndex, zIndex, eventInfo);
    } else if(allPoints2.length > 0) {
        feature['points'] = allPoints2;
        processPointArrayPass(feature, lod, style, featureIndex, zIndex, eventInfo);
    }

};
 
export {processPolygonPass};
