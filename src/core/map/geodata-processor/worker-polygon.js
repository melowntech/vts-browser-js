
import {globals as globals_} from './worker-globals.js';
import {getLayerPropertyValue as getLayerPropertyValue_} from './worker-style.js';
import {postGroupMessage as postGroupMessage_} from './worker-message.js';
import {processLineStringPass as processLineStringPass_} from './worker-linestring.js';
import {processPointArrayPass as processPointArrayPass_} from './worker-pointarray.js';

//get rid of compiler mess
var globals = globals_;
var getLayerPropertyValue = getLayerPropertyValue_;
var postGroupMessage = postGroupMessage_;
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
        processPolygonLines(polygon, vertices, lod, style, zIndex, eventInfo, false);
    }
    
    // borders as lines
    if (getLayerPropertyValue(style, 'line', polygon, lod) ||
        getLayerPropertyValue(style, 'line-label', polygon, lod)) {
        processPolygonLines(polygon, vertices, lod, style, zIndex, eventInfo, true);
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
    
    var center = [0,0,0];
   
    // allocate vertex buffer
    var trisCount = surface.length / 3;
    var vertexCount = trisCount * 3;
    var vertexBuffer = new Array (vertexCount * 3);
    
    var surfaceI = 0;
    var index = 0;
    var p1;
    var offs;

    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceOrigin = globals.forceOrigin;
    var forceScale = globals.forceScale;    
    
    //console.log("vertexCount = " + vertexCount);
    //add tris
    for (var i = 0; i < vertexCount; i++) {
        offs = 3 * surface[surfaceI++];
        p1 = [vertices[offs++], vertices[offs++], vertices[offs]];
        
        if (forceOrigin) {
            p1 = [p1[0] - tileX, p1[1] - tileY, p1[2]];
        }

        if (forceScale != null) {
            p1 = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
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

    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent;
    
    var messageData = {'command':'addRenderJob', 'type': 'flat-line', 'vertexBuffer': vertexBuffer,
        'color':polygonColor, 'z-index':zIndex, 'center': center, 'advancedHit': advancedHit,
        'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
        'hitable':hitable, 'state':globals.hitState, 'eventInfo': (globals.alwaysEventInfo || hitable || drawEvent) ? eventInfo : {},
        'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
        'lod':(globals.autoLod ? null : globals.tileLod) };

    postGroupMessage(messageData);
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
    var feature = createEmptyFeatureFromPolygon(polygon);
    var bordersCount = borders.length;
    for (var j = 0; j < bordersCount; j++) {
        var border = borders[j], offset;
        var pointsCount = border.length;
        var pointsCount2 = 0;
        if (pointsCount > 0) {
            var points, i;
            if (processLines) {
                points = new Array(pointsCount + 1);
            } else {
                points = new Array(pointsCount);
            }
            for (i = 0; i < pointsCount; i++) {
                if (border[i] >= 0) {
                    offset = 3 * border[i];
                    pointsCount2++; // count vertices with positive index
                } else {
                    offset = 3 * (-border[i]);
                }
                points[i] = [vertices[offset], vertices[offset+1], vertices[offset+2]];
                if (processLines && i == 0) {
                    points[pointsCount] = points[0];
                }
            }

            var points2 = new Array(pointsCount2);
            var i2 = 0;
            //debugger

            //create array of points only for vertices with positive value
            for (i = 0; i < pointsCount; i++) {
                if (border[i] >= 0) {
                    offset = 3 * border[i];
                    points2[i2] = [vertices[offset], vertices[offset+1], vertices[offset+2]];
                    i2++;
                }
            }

            if(processLines) {
                feature['lines'] = [points];
                processLineStringPass(feature, lod, style, featureIndex, zIndex, eventInfo);
            } else {
                feature['points'] = points2;
                processPointArrayPass(feature, lod, style, featureIndex, zIndex, eventInfo);
            }
        }
    }
};
 
export {processPolygonPass};
