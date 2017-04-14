import {globals as globals_} from "./worker-globals.js";
var globals = globals_;

import {getLayer as getLayer_, getLayerPropertyValue as getLayerPropertyValue_, getLayerExpresionValue as getLayerExpresionValue_} from "./worker-style.js";
var getLayer = getLayer_, getLayerPropertyValue = getLayerPropertyValue_, getLayerExpresionValue = getLayerExpresionValue_;

import {postGroupMessage as postGroupMessage_} from "./worker-message.js";
var postGroupMessage = postGroupMessage_;

//get rid of compiler mess


var processPolygonPass = function(polygon, lod, style, zIndex, eventInfo) {
    var vertices = polygon["vertices"] || [];
    if (vertices.length == 0) {
        return;
    }
    
    // borders as points
    if (getLayerPropertyValue(style, "point", polygon, lod) ||
        getLayerPropertyValue(style, "label", polygon, lod)) {
            processPolygonLines(polygon, vertices, lod, style, zIndex, eventInfo, false);
    }
    
    // borders as lines
    if (getLayerPropertyValue(style, "line", polygon, lod) ||
        getLayerPropertyValue(style, "line-label", polygon, lod)) {
            processPolygonLines(polygon, vertices, lod, style, zIndex, eventInfo, true);
    }
    
    var spolygon = getLayerPropertyValue(style, "polygon", polygon, lod);
    
    if (!spolygon) {
        return;
    }
    
    var surface = polygon["surface"] || [];
    if (surface.length == 0) {
        return;
    }
    
    var hoverEvent = getLayerPropertyValue(style, "hover-event", polygon, lod);
    var clickEvent = getLayerPropertyValue(style, "click-event", polygon, lod);
    var drawEvent = getLayerPropertyValue(style, "draw-event", polygon, lod);
    var enterEvent = getLayerPropertyValue(style, "enter-event", polygon, lod);
    var leaveEvent = getLayerPropertyValue(style, "leave-event", polygon, lod);

    var zbufferOffset = getLayerPropertyValue(style, "zbuffer-offset", polygon, lod);
    
    var polygonColor = getLayerPropertyValue(style, "polygon-color", polygon, lod);
    
    var center = [0,0,0];
   
    // allocate vertex buffer
    var trisCount = surface.length / 3;
    var vertexCount = trisCount * 3;
    var vertexBuffer = new Array (vertexCount * 3);
    
    var dpoints = false;
    var surfaceI = 0;
    var index = 0;
    var p1;
    var offs;

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
    
    var messageData = {"command":"addRenderJob", "type": "flat-line", "vertexBuffer": vertexBuffer,
                        "color":polygonColor, "z-index":zIndex, "center": center,
                        "hover-event":hoverEvent, "click-event":clickEvent, "draw-event":drawEvent,
                        "hitable":hitable, "state":globals.hitState, "eventInfo":eventInfo,
                        "enter-event":enterEvent, "leave-event":leaveEvent, "zbuffer-offset":zbufferOffset,
                        "lod":(globals.autoLod ? null : globals.tileLod) };

    postGroupMessage(messageData);
};

var createEmptyFeatureFromPolygon = function(polygon) {
    var feature = {};
    for(var key in polygon) {
        if(key != "surface" && key != "vertices" && key != "borders") {
            feature[key] = polygon[key];
        }
    }
    return feature;
};

var processPolygonLines = function(polygon, vertices, lod, style, zIndex, eventInfo, processLines) {
    var borders = polygon["borders"] || [];
    if (borders.length == 0) {
        return;
    }
    var feature = createEmptyFeatureFromPolygon(polygon);
    var bordersCount = borders.length;
    for (var j = 0; j < bordersCount; j++) {
        var border = borders[j];
        var pointsCount = border.length;
        if (pointsCount > 0) {
            var points;
            if (processLines) {
                points = new Array(pointsCount + 1);
            }
            else {
                points = new Array(pointsCount);
            }
            for (var i = 0; i < pointsCount; i++) {
                var offs = 3 * border[i];
                points[i] = [vertices[offs++], vertices[offs++], vertices[offs]];
                if (processLines && i == 0) {
                    points[pointsCount] = points[0];
                }
            }
            feature["points"] = points;
            if(processLines) {
                processLineStringPass(feature, lod, style, zIndex, eventInfo);
            }
            else {
                processPointArrayPass(feature, lod, style, zIndex, eventInfo);
            }
        }
    }
};
 
export {processPolygonPass};
