
import {globals as globals_, clamp as clamp_} from './worker-globals.js';
import {getLayerPropertyValue as getLayerPropertyValue_, getLayerExpresionValue as getLayerExpresionValue_} from './worker-style.js';
import {addText as addText_, getSplitIndex as getSplitIndex_, getFontFactor as getFontFactor_, getTextLength as getTextLength_,
        areTextCharactersAvailable as areTextCharactersAvailable_, getCharVerticesCount as getCharVerticesCount_, getLineHeight as getLineHeight_} from './worker-text.js';
import {postGroupMessage as postGroupMessage_} from './worker-message.js';

//get rid of compiler mess
var globals = globals_, clamp = clamp_;
var getLayerPropertyValue = getLayerPropertyValue_, getLayerExpresionValue = getLayerExpresionValue_;
var addText = addText_, getSplitIndex = getSplitIndex_, getFontFactor = getFontFactor_, getTextLength = getTextLength_,
    areTextCharactersAvailable = areTextCharactersAvailable_, getCharVerticesCount = getCharVerticesCount_, getLineHeight = getLineHeight_;
var postGroupMessage = postGroupMessage_;


var processPointArrayPass = function(pointArray, lod, style, zIndex, eventInfo) {
    var pointsGroups = []; 
    var i, li, dpoints = false;

    if (pointArray['lines'] || pointArray['d-lines']) {  //use lines as points
        pointsGroups = pointArray['lines'] || pointArray['d-lines'];
        dpoints = (pointArray['d-lines']) ? true : false;
    } else {
        if (pointArray['points'] || pointArray['d-points']) {
            pointsGroups = [(pointArray['points'] || pointArray['d-points'])];
            dpoints = (pointArray['d-points']) ? true : false;
        }
    }
    
    if (pointsGroups.length == 0) {
        return;
    }

    //debugger
    var visibility = getLayerPropertyValue(style, 'visibility', pointArray, lod);
    var culling = getLayerPropertyValue(style, 'culling', pointArray, lod);
    var hoverEvent = getLayerPropertyValue(style, 'hover-event', pointArray, lod);
    var clickEvent = getLayerPropertyValue(style, 'click-event', pointArray, lod);
    var drawEvent = getLayerPropertyValue(style, 'draw-event', pointArray, lod);
    var enterEvent = getLayerPropertyValue(style, 'enter-event', pointArray, lod);
    var leaveEvent = getLayerPropertyValue(style, 'leave-event', pointArray, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', pointArray, lod);

    var point = getLayerPropertyValue(style, 'point', pointArray, lod);
    var pointFlat = getLayerPropertyValue(style, 'point-flat', pointArray, lod);
    var pointColor = getLayerPropertyValue(style, 'point-color', pointArray, lod);
    var pointRadius = 0.5 * getLayerPropertyValue(style, 'point-radius', pointArray, lod);

    var source, bufferSize, bufferSize2;
    //zIndex = (zIndex !== null) ? zIndex : getLayerPropertyValue(style, "z-index", pointArray, lod);

    var icon = getLayerPropertyValue(style, 'icon', pointArray, lod);
    if (icon) {
        source = getLayerPropertyValue(style, 'icon-source', pointArray, lod);
        
        if (source) {
            bufferSize = getCharVerticesCount() * pointsGroups.length;
            bufferSize2 = getCharVerticesCount(true) * pointsGroups.length;
    
            var iconData = {
                color : getLayerPropertyValue(style, 'icon-color', pointArray, lod),
                scale : getLayerPropertyValue(style, 'icon-scale', pointArray, lod),
                offset : getLayerPropertyValue(style, 'icon-offset', pointArray, lod),
                stick : getLayerPropertyValue(style, 'icon-stick', pointArray, lod),
                origin : getLayerPropertyValue(style, 'icon-origin', pointArray, lod),
                source : getLayerPropertyValue(style, 'icon-source', pointArray, lod),
                vertexBuffer : new Float32Array(bufferSize),
                originBuffer : new Float32Array(bufferSize2),
                texcoordsBuffer : new Float32Array(bufferSize),
                index : 0,
                index2 : 0
            };
        } else {
            icon = false;
        }
    }

    var label = getLayerPropertyValue(style, 'label', pointArray, lod);
    if (label) {
        source = getLayerPropertyValue(style, 'label-source', pointArray, lod);
        var text = getLayerExpresionValue(style, source, pointArray);
        var size = getLayerPropertyValue(style, 'label-size', pointArray, lod);
        
        if (source == '$name') {
            if (!areTextCharactersAvailable(text, globals.fonts['default'])) {
                var text2 = getLayerExpresionValue(style, '$name:en', pointArray);
                
                if (areTextCharactersAvailable(text2, globals.fonts['default'])) {
                    text = text2;                     
                }
            }
        }
        if (text && text != '' && Math.abs(size) > 0.0001) {
            bufferSize = getCharVerticesCount() * text.length * pointsGroups.length;
            bufferSize2 = getCharVerticesCount(true) * text.length * pointsGroups.length;

            var labelData = {
                color : getLayerPropertyValue(style, 'label-color', pointArray, lod),
                size : size,
                offset : getLayerPropertyValue(style, 'label-offset', pointArray, lod),
                stick : getLayerPropertyValue(style, 'label-stick', pointArray, lod),
                origin : getLayerPropertyValue(style, 'label-origin', pointArray, lod),
                align : getLayerPropertyValue(style, 'label-align', pointArray, lod),
                text : text,
                width : getLayerPropertyValue(style, 'label-width', pointArray, lod),
                vertexBuffer : new Float32Array(bufferSize),
                originBuffer : new Float32Array(bufferSize2),
                texcoordsBuffer : new Float32Array(bufferSize),
                index : 0,
                index2 : 0
            };
        } else {
            label = false;
        }
    }

    var index = 0;
    var index2 = 0;

    var circleBuffer = [];
    var circleSides = clamp(pointRadius * 8 * 0.5, 8, 32);

    var angle = 0, step = (2.0*Math.PI) / circleSides;

    for (i = 0; i < circleSides; i++) {
        circleBuffer[i] = [-Math.sin(angle), Math.cos(angle)];
        angle += step;
    }

    circleBuffer[circleSides] = [0, 1.0];
    
    var totalPoints = 0;
    var center = [0,0,0];
    var forceOrigin = globals.forceOrigin;
    var bboxMin = globals.bboxMin;
    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceScale = globals.forceScale;

    var pointsVertices, vertexBuffer, pointsNormals, normalBuffer;

    for (var g = 0, gl = pointsGroups.length; g < gl; g++) {
        var points = pointsGroups[g];
        
        if (Array.isArray(points) && points.length > 0) {
            var p = points[0];
            var p1 = [p[0], p[1], p[2]];
            
            totalPoints += points.length;
        
            //allocate buffers
        
            if (!pointFlat) {
                pointsVertices = circleSides * 3 * 4;
                vertexBuffer = new Array(points.length * pointsVertices);
                pointsNormals = circleSides * 3 * 4;
                normalBuffer = new Array(points.length * pointsNormals);
            } else {
                pointsVertices = circleSides * 3 * 3;
                vertexBuffer = new Array(points.length * pointsVertices);
            }
        
            //add ponints
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

                if (icon) {
                    processIcon(p1, iconData) ;//, pointArray, lod, style, zIndex);
                }
    
                if (label) {
                    processLabel(p1, labelData); //, pointArray, lod, style, zIndex);
                }
        
                for (var j = 0; j < circleSides; j++) {

                    if (point) {
        
                        if (pointFlat) {
        
                            //add polygon
                            vertexBuffer[index] = p1[0];
                            vertexBuffer[index+1] = p1[1];
                            vertexBuffer[index+2] = p1[2];
        
                            vertexBuffer[index+3] = p1[0] + circleBuffer[j][0] * pointRadius;
                            vertexBuffer[index+4] = p1[1] + circleBuffer[j][1] * pointRadius;
                            vertexBuffer[index+5] = p1[2];
        
                            vertexBuffer[index+6] = p1[0] + circleBuffer[j+1][0] * pointRadius;
                            vertexBuffer[index+7] = p1[1] + circleBuffer[j+1][1] * pointRadius;
                            vertexBuffer[index+8] = p1[2];

                            index += 9;
        
                        } else {
        
                            //add polygon
                            vertexBuffer[index] = p1[0];
                            vertexBuffer[index+1] = p1[1];
                            vertexBuffer[index+2] = p1[2];
                            vertexBuffer[index+3] = 0;
                            normalBuffer[index2] = 0;
                            normalBuffer[index2+1] = 0;
                            normalBuffer[index2+2] = 0;
                            normalBuffer[index2+3] = 0;
        
                            vertexBuffer[index+4] = p1[0];
                            vertexBuffer[index+5] = p1[1];
                            vertexBuffer[index+6] = p1[2];
                            vertexBuffer[index+7] = 0;
                            normalBuffer[index2+4] = circleBuffer[j][0] * pointRadius;
                            normalBuffer[index2+5] = circleBuffer[j][1] * pointRadius;
                            normalBuffer[index2+6] = 0;
                            normalBuffer[index2+7] = 0;
        
                            vertexBuffer[index+8] = p1[0];
                            vertexBuffer[index+9] = p1[1];
                            vertexBuffer[index+10] = p1[2];
                            vertexBuffer[index+11] = 0;
                            normalBuffer[index2+8] = circleBuffer[j+1][0] * pointRadius;
                            normalBuffer[index2+9] = circleBuffer[j+1][1] * pointRadius;
                            normalBuffer[index2+10] = 0;
                            normalBuffer[index2+11] = 0;
        
                            index += 12;
                            index2 += 12;
                        }
                    }
                }
        
                if (dpoints) {
                    var p2 = points[i+1];
                    p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
                } else {
                    p1 = points[i+1];
                }
            }
        }
    }
   

    if (totalPoints > 0) {
        center[0] /= totalPoints;
        center[1] /= totalPoints;
        center[2] /= totalPoints;
    }

    center[0] += bboxMin[0];//groupOrigin[0];
    center[1] += bboxMin[1];//groupOrigin[1];
    center[2] += bboxMin[2];//groupOrigin[2];

    var hitable = hoverEvent || clickEvent || enterEvent || leaveEvent;

    if (point) {
        if (pointFlat) {
            postGroupMessage({'command':'addRenderJob', 'type': 'flat-line', 'vertexBuffer': vertexBuffer,
                'color':pointColor, 'z-index':zIndex, 'visibility': visibility, 'center': center,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer.buffer]);
        } else {
            postGroupMessage({'command':'addRenderJob', 'type': 'pixel-line', 'vertexBuffer': vertexBuffer,
                'normalBuffer': normalBuffer, 'color':pointColor, 'z-index':zIndex,
                'visibility': visibility, 'center': center,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer.buffer, normalBuffer.buffer]);
        }
    }

    if (icon && iconData.vertexBuffer.length > 0) {
        postGroupMessage({'command':'addRenderJob', 'type': 'icon', 'vertexBuffer': iconData.vertexBuffer,
            'originBuffer': iconData.originBuffer, 'texcoordsBuffer': iconData.texcoordsBuffer,
            'icon':globals.stylesheetBitmaps[iconData.source[0]], 'color':iconData.color, 'z-index':zIndex,
            'visibility': visibility, 'culling': culling, 'center': center, 'stick': iconData.stick,
            'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
            'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
            'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
            'lod':(globals.autoLod ? null : globals.tileLod) }, [iconData.vertexBuffer.buffer, iconData.originBuffer.buffer, iconData.texcoordsBuffer.buffer]);
    }

    if (label && labelData.vertexBuffer.length > 0) {
        postGroupMessage({'command':'addRenderJob', 'type': 'label', 'vertexBuffer': labelData.vertexBuffer,
            'originBuffer': labelData.originBuffer, 'texcoordsBuffer': labelData.texcoordsBuffer,
            'color':labelData.color, 'z-index':zIndex, 'visibility': visibility, 'culling': culling, 
            'center': center, 'stick': labelData.stick,
            'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
            'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
            'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
            'lod':(globals.autoLod ? null : globals.tileLod) }, [labelData.vertexBuffer.buffer, labelData.originBuffer.buffer, labelData.texcoordsBuffer.buffer]);
    }

};

var getOriginOffset = function(origin, width, height) {
    switch(origin) {
    case 'top-left':        return [0, 0];
    case 'top-right':       return [-width, 0];
    case 'top-center':      return [-width*0.5, 0];
    case 'center-left':     return [0, -height*0.5];
    case 'center-right':    return [-width, -height*0.5];
    case 'center-center':   return [-width*0.5, -height*0.5];
    case 'bottom-left':     return [0, -height];
    case 'bottom-right':    return [-width, -height];
    case 'bottom-center':   return [-width*0.5, -height];
    }
};

var processIcon = function(point, iconData) {
    var icon = iconData.source;
    var index = iconData.index;
    var index2 = iconData.index2;
    var lastIndex = index;

    var width = Math.abs(icon[3] * iconData.scale);
    var height = Math.abs(icon[4] * iconData.scale);

    var vertexBuffer = iconData.vertexBuffer;
    var texcoordsBuffer = iconData.texcoordsBuffer;
    var originBuffer = iconData.originBuffer;

    //add polygon
    vertexBuffer[index] = 0;
    vertexBuffer[index+1] = 0;
    vertexBuffer[index+2] = 0;
    vertexBuffer[index+3] = 0;

    vertexBuffer[index+4] = width;
    vertexBuffer[index+5] = 0;
    vertexBuffer[index+6] = 0;
    vertexBuffer[index+7] = 0;

    vertexBuffer[index+8] = width;
    vertexBuffer[index+9] = -height;
    vertexBuffer[index+10] = 0;
    vertexBuffer[index+11] = 0;

    texcoordsBuffer[index] = icon[1];
    texcoordsBuffer[index+1] = icon[2];
    texcoordsBuffer[index+2] = 0;
    texcoordsBuffer[index+3] = 0;

    texcoordsBuffer[index+4] = icon[1]+icon[3];
    texcoordsBuffer[index+5] = icon[2];
    texcoordsBuffer[index+6] = 0;
    texcoordsBuffer[index+7] = 0;

    texcoordsBuffer[index+8] = icon[1]+icon[3];
    texcoordsBuffer[index+9] = icon[2]+icon[4];
    texcoordsBuffer[index+10] = 0;
    texcoordsBuffer[index+11] = 0;

    index += 12;

    //add polygon
    vertexBuffer[index] = 0;
    vertexBuffer[index+1] = 0;
    vertexBuffer[index+2] = 0;
    vertexBuffer[index+3] = 0;

    vertexBuffer[index+4] = 0;
    vertexBuffer[index+5] = -height;
    vertexBuffer[index+6] = 0;
    vertexBuffer[index+7] = 0;

    vertexBuffer[index+8] = width;
    vertexBuffer[index+9] = -height;
    vertexBuffer[index+10] = 0;
    vertexBuffer[index+11] = 0;

    texcoordsBuffer[index] = icon[1];
    texcoordsBuffer[index+1] = icon[2];
    texcoordsBuffer[index+2] = 0;
    texcoordsBuffer[index+3] = 0;

    texcoordsBuffer[index+4] = icon[1];
    texcoordsBuffer[index+5] = icon[2]+icon[4];
    texcoordsBuffer[index+6] = 0;
    texcoordsBuffer[index+7] = 0;

    texcoordsBuffer[index+8] = icon[1]+icon[3];
    texcoordsBuffer[index+9] = icon[2]+icon[4];
    texcoordsBuffer[index+10] = 0;
    texcoordsBuffer[index+11] = 0;
    
    index += 12;

    //get offset
    var originOffset = getOriginOffset(iconData.origin, width, height);
    var offsetX = originOffset[0] + iconData.offset[0];
    var offsetY = originOffset[1] + iconData.offset[1];

    var p1 = point[0];
    var p2 = point[1];
    var p3 = point[2];

    //set origin buffer and apply offset
    for (var i = lastIndex; i < index; i+=4) {
        vertexBuffer[i] += offsetX;
        vertexBuffer[i+1] -= offsetY;

        originBuffer[index2] = p1;
        originBuffer[index2 + 1] = p2;
        originBuffer[index2 + 2] = p3;
        index2 += 3;
    }

    iconData.index = index;
    iconData.index2 = index2;
};


var processLabel = function(point, labelData) {
    var vertexBuffer = labelData.vertexBuffer;
    var texcoordsBuffer = labelData.texcoordsBuffer;
    var originBuffer = labelData.originBuffer;
    var index = labelData.index;
    var index2 = labelData.index2;
    var lastIndex = index;
    var text = '' + labelData.text;

    //split by new line
    var lines = text.match(/[^\r\n]+/g);
    var lines2 = [];

    //split lines by width
    for (var i = 0, li = lines.length; i < li; i++) {

        var line = lines[i];

        // eslint-disable-next-line
        do {
            var splitIndex = getSplitIndex(line, labelData.width, getFontFactor(labelData.size, globals.fonts['default']), globals.fonts['default']);

            if (line.length == splitIndex) {
                lines2.push(line);
                break;
            }

            lines2.push(line.substring(0,splitIndex));
            line = line.substring(splitIndex+1);

        } while(true);

    }

    var x = 0;
    var y = 0;
    var lineHeight = getLineHeight(labelData.size, globals.fonts['default']);
    var maxWidth = 0;
    var lineWidths = [];

    //get max width
    for (i = 0, li = lines2.length; i < li; i++) {
        lineWidths[i] = getTextLength(lines2[i], getFontFactor(labelData.size, globals.fonts['default']), globals.fonts['default']);
        maxWidth = Math.max(lineWidths[i], maxWidth);
    }

    //generate text
    for (i = 0, li = lines2.length; i < li; i++) {
        var textWidth = lineWidths[i];//getTextLength(lines2[i], getFontFactor(labelData.size, fonts["default"]), fonts["default"]);
        //maxWidth = Math.max(textWidth, maxWidth);

        switch(labelData.align) {
        case 'left': x = 0; break;
        case 'right': x = maxWidth - textWidth; break;
        case 'center': x = (maxWidth - textWidth)*0.5; break;
        }

        index = addText([x,y,0], [1,0,0], lines2[i], labelData.size, globals.fonts['default'], vertexBuffer, texcoordsBuffer, true, index);
        y -= lineHeight;
    }

    //get offset
    var originOffset = getOriginOffset(labelData.origin, maxWidth, -y);
    var offsetX = originOffset[0] + labelData.offset[0];
    var offsetY = originOffset[1] + labelData.offset[1];
    
    var p1 = point[0];
    var p2 = point[1];
    var p3 = point[2];

    //set origin buffer and apply offset
    for (i = lastIndex; i < index; i+=4) {
        vertexBuffer[i] += offsetX;
        vertexBuffer[i+1] -= offsetY;

        originBuffer[index2] = p1;
        originBuffer[index2 + 1] = p2;
        originBuffer[index2 + 2] = p3;
        index2 += 3;
    }

    labelData.index = index;
    labelData.index2 = index2;
};

export {processPointArrayPass};


