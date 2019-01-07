
import {globals as globals_, clamp as clamp_} from './worker-globals.js';
import {getLayerPropertyValue as getLayerPropertyValue_, getLayerExpresionValue as getLayerExpresionValue_} from './worker-style.js';
import {addText as addText_, getSplitIndex as getSplitIndex_, getTextGlyphs as getTextGlyphs_,
        getTextLength as getTextLength_, getFonts as getFonts_, getFontsStorage as getFontsStorage_,
        areTextCharactersAvailable as areTextCharactersAvailable_, getCharVerticesCount as getCharVerticesCount_, getLineHeight as getLineHeight_} from './worker-text.js';
import {postGroupMessage as postGroupMessage_, postGroupMessageFast as postGroupMessageFast_} from './worker-message.js';

//get rid of compiler mess
var globals = globals_, clamp = clamp_;
var getLayerPropertyValue = getLayerPropertyValue_, getLayerExpresionValue = getLayerExpresionValue_;
var addText = addText_, getSplitIndex = getSplitIndex_, getTextGlyphs = getTextGlyphs_,
    getTextLength = getTextLength_, getFonts = getFonts_, getFontsStorage = getFontsStorage_,
    areTextCharactersAvailable = areTextCharactersAvailable_, getCharVerticesCount = getCharVerticesCount_, getLineHeight = getLineHeight_;
var postGroupMessage = postGroupMessage_, postGroupMessageFast = postGroupMessageFast_;


var processPointArrayPass = function(pointArray, lod, style, featureIndex, zIndex, eventInfo) {
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

    var visibility = getLayerPropertyValue(style, 'visibility-rel', pointArray, lod) || 
                     getLayerPropertyValue(style, 'visibility-abs', pointArray, lod) ||
                     getLayerPropertyValue(style, 'visibility', pointArray, lod);
    var culling = getLayerPropertyValue(style, 'culling', pointArray, lod);
    var hoverEvent = getLayerPropertyValue(style, 'hover-event', pointArray, lod);
    var clickEvent = getLayerPropertyValue(style, 'click-event', pointArray, lod);
    var drawEvent = getLayerPropertyValue(style, 'draw-event', pointArray, lod);
    var enterEvent = getLayerPropertyValue(style, 'enter-event', pointArray, lod);
    var leaveEvent = getLayerPropertyValue(style, 'leave-event', pointArray, lod);
    var advancedHit = getLayerPropertyValue(style, 'advanced-event', pointArray, lod);

    var zbufferOffset = getLayerPropertyValue(style, 'zbuffer-offset', pointArray, lod);

    var point = getLayerPropertyValue(style, 'point', pointArray, lod);
    var pointFlat = getLayerPropertyValue(style, 'point-flat', pointArray, lod);
    var pointColor = getLayerPropertyValue(style, 'point-color', pointArray, lod);
    var pointRadius = 0.5 * getLayerPropertyValue(style, 'point-radius', pointArray, lod);

    var source, bufferSize, bufferSize2, points, g, gl, totalPoints = 0;
    //zIndex = (zIndex !== null) ? zIndex : getLayerPropertyValue(style, "z-index", pointArray, lod);

    for (g = 0, gl = pointsGroups.length; g < gl; g++) {
        points = pointsGroups[g];
        if (Array.isArray(points) && points.length > 0) {
            totalPoints += points.length;
        }
    }

    var icon = getLayerPropertyValue(style, 'icon', pointArray, lod);
    if (icon) {
        source = getLayerPropertyValue(style, 'icon-source', pointArray, lod);
        
        if (source) {
            bufferSize = getCharVerticesCount() * totalPoints;
            bufferSize2 = getCharVerticesCount(true) * totalPoints;
    
            var iconData = {
                color : getLayerPropertyValue(style, 'icon-color', pointArray, lod),
                scale : getLayerPropertyValue(style, 'icon-scale', pointArray, lod),
                offset : getLayerPropertyValue(style, 'icon-offset', pointArray, lod),
                stick : getLayerPropertyValue(style, 'icon-stick', pointArray, lod),
                reduce : getLayerPropertyValue(style, 'dynamic-reduce', pointArray, lod),
                origin : getLayerPropertyValue(style, 'icon-origin', pointArray, lod),
                source : getLayerPropertyValue(style, 'icon-source', pointArray, lod),
                index : 0,
                index2 : 0
            };

            if (totalPoints > 1) {
                iconData.vertexBuffer = new Float32Array(bufferSize);
                iconData.originBuffer = new Float32Array(bufferSize2);
                iconData.texcoordsBuffer = new Float32Array(bufferSize);
            } else {
                iconData.singleBuffer = new Float32Array(16);
            }

        } else {
            icon = false;
        }
    }

    var label = getLayerPropertyValue(style, 'label', pointArray, lod);
    if (label) {
        source = getLayerPropertyValue(style, 'label-source', pointArray, lod);

        var text = getLayerExpresionValue(style, source, pointArray, lod, source);
        text = text ? text.replace('\r\n', '\n').replace('\r', '\n') : '';
        var size = getLayerPropertyValue(style, 'label-size', pointArray, lod);
        var fontNames = getLayerPropertyValue(style, 'label-font', pointArray, lod);
        var fonts = getFonts(fontNames);
        var glyphsRes = getTextGlyphs(text, fonts);
        
        if (source == '$name') {
            if (!areTextCharactersAvailable(text, fonts, glyphsRes)) {
                var text2 = getLayerExpresionValue(style, '$name:en', pointArray, lod, source);
                text2 = text2 ? text2.replace('\r\n', '\n').replace('\r', '\n') : '';
                var glyphsRes2 = getTextGlyphs(text2, fonts);
                
                if (areTextCharactersAvailable(text2, fonts)) {
                    text = text2;                     
                    glyphsRes = glyphsRes2;
                }
            }
        }
        if (text && text != '' && Math.abs(size) > 0.0001) {
            bufferSize = getCharVerticesCount() * text.length * totalPoints;
            bufferSize2 = getCharVerticesCount(true) * text.length * totalPoints;

            var useSingleBuffer = (totalPoints == 1);

            var factor = 1;
            if (getLayerPropertyValue(style, 'label-size-units', pointArray, lod) == 'points') {
                factor = globals.pixelFactor / ((1 / 72) * (96));
            }

            var labelData = {
                color : getLayerPropertyValue(style, 'label-color', pointArray, lod),
                color2 : getLayerPropertyValue(style, 'label-color2', pointArray, lod),
                outline : getLayerPropertyValue(style, 'label-outline', pointArray, lod),
                reduce : getLayerPropertyValue(style, 'dynamic-reduce', pointArray, lod),
                size : size * factor,
                spacing: getLayerPropertyValue(style, 'label-spacing', pointArray, lod),
                lineHeight: getLayerPropertyValue(style, 'label-line-height', pointArray, lod),
                offset : getLayerPropertyValue(style, 'label-offset', pointArray, lod),
                stick : getLayerPropertyValue(style, 'label-stick', pointArray, lod),
                origin : getLayerPropertyValue(style, 'label-origin', pointArray, lod),
                align : getLayerPropertyValue(style, 'label-align', pointArray, lod),
                fonts : fonts,
                fontsStorage : getFontsStorage(fontNames),
                text : text,
                hysteresis : getLayerPropertyValue(style, 'hysteresis', pointArray, lod),
                width : factor * getLayerPropertyValue(style, 'label-width', pointArray, lod),
                noOverlap : getLayerPropertyValue(style, 'label-no-overlap', pointArray, lod),
                noOverlapMargin : getLayerPropertyValue(style, 'label-no-overlap-margin', pointArray, lod),
                noOverlapFactor : getLayerPropertyValue(style, 'label-no-overlap-factor', pointArray, lod),
                vertexBuffer : (useSingleBuffer) ? null : (new Float32Array(bufferSize)),
                originBuffer : (useSingleBuffer) ? null : (new Float32Array(bufferSize2)),
                texcoordsBuffer : (useSingleBuffer) ? null : (new Float32Array(bufferSize)),
                singleBuffer : (useSingleBuffer) ? (new Float32Array(text.length * 4 * 2)) : null,
                index : 0,
                index2 : 0,
                glyphsRes : glyphsRes
            };

            if (labelData.stick) {
                labelData.stick = labelData.stick.slice();
                labelData.stick[2] *= factor;
                //labelData.stick[7] *= factor;
            }

        } else {
            label = false;
        }
    }

    var index = 0;
    var index2 = 0;

    
    var center = [0,0,0];
    var forceOrigin = globals.forceOrigin;
    var bboxMin = globals.bboxMin;
    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceScale = globals.forceScale;
    var labelBBox, p, p1;

    var pointsVertices, vertexBuffer, pointsNormals, normalBuffer;

    if (point) {
        var circleBuffer = [];
        var circleSides = clamp(pointRadius * 8 * 0.5, 8, 32);

        var angle = 0, step = (2.0*Math.PI) / circleSides;

        for (i = 0; i < circleSides; i++) {
            circleBuffer[i] = [-Math.sin(angle), Math.cos(angle)];
            angle += step;
        }

        circleBuffer[circleSides] = [0, 1.0];

        //allocate buffers
        if (!pointFlat) {
            pointsVertices = circleSides * 3 * 4;
            vertexBuffer = new Float32Array(totalPoints * pointsVertices);
            pointsNormals = circleSides * 3 * 4;
            normalBuffer = new Float32Array(totalPoints * pointsNormals);
        } else {
            pointsVertices = circleSides * 3 * 3;
            vertexBuffer = new Float32Array(totalPoints * pointsVertices);
        }
    }

    for (g = 0, gl = pointsGroups.length; g < gl; g++) {
        points = pointsGroups[g];
        
        if (Array.isArray(points) && points.length > 0) {
            p = points[0];
            p1 = [p[0], p[1], p[2]];
       
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
                    labelBBox = processLabel(p1, labelData); //, pointArray, lod, style, zIndex);
                }

                if (point) {
        
                    for (var j = 0; j < circleSides; j++) {

       
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
        
                if ((i + 1) < li) {
                    if (dpoints) {
                        var p2 = points[i+1];
                        p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
                    } else {
                        p1 = points[i+1];
                    }
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
    var message, messageSize;

    globals.signatureCounter++;
    var signature = (""+globals.signatureCounter);

    if (visibility && !Array.isArray(visibility)) {
        visibility = [visibility];
    }

    if (point) {
        if (pointFlat) {
            postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_FLAT_LINE, {
                'color':pointColor, 'z-index':zIndex, 'visibility': visibility, 'center': center,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'advancedHit': advancedHit,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer], signature);

            /*postGroupMessage({'command':'addRenderJob', 'type': 'flat-line', 'vertexBuffer': vertexBuffer,
                'color':pointColor, 'z-index':zIndex, 'visibility': visibility, 'center': center,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'advancedHit': advancedHit,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer.buffer], signature);*/
        } else {
            postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_PIXEL_LINE, {
                'color':pointColor, 'z-index':zIndex, 'visibility': visibility, 'center': center,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer, normalBuffer], signature);

            /*postGroupMessage({'command':'addRenderJob', 'type': 'pixel-line', 'vertexBuffer': vertexBuffer,
                'normalBuffer': normalBuffer, 'color':pointColor, 'z-index':zIndex,
                'visibility': visibility, 'center': center,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [vertexBuffer.buffer, normalBuffer.buffer], signature);*/
        }
    }

    if (icon) {

        globals.signatureCounter++;
        signature = (""+globals.signatureCounter);

        if ((iconData.singleBuffer && iconData.singleBuffer.length > 0) || (iconData.vertexBuffer && iconData.vertexBuffer.length > 0)) {

            postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_ICON, {
                'icon':globals.stylesheetBitmaps[iconData.source[0]], 'color':iconData.color, 'z-index':zIndex,
                'visibility': visibility, 'culling': culling, 'center': center, 'stick': iconData.stick,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'advancedHit': advancedHit,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'index': featureIndex, 'reduce': iconData.reduce,
                'lod':(globals.autoLod ? null : globals.tileLod) },
                (iconData.singleBuffer) ? [iconData.singleBuffer] : [iconData.vertexBuffer, iconData.originBuffer, iconData.texcoordsBuffer],
                signature);

            /*
            postGroupMessage({'command':'addRenderJob', 'type': 'icon', 'singleBuffer': iconData.singleBuffer,
                'icon':globals.stylesheetBitmaps[iconData.source[0]], 'color':iconData.color, 'z-index':zIndex,
                'visibility': visibility, 'culling': culling, 'center': center, 'stick': iconData.stick,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'advancedHit': advancedHit,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'index': featureIndex, 'reduce': iconData.reduce,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [iconData.singleBuffer.buffer], signature);

            } else if (iconData.vertexBuffer && iconData.vertexBuffer.length > 0) {

            postGroupMessage({'command':'addRenderJob', 'type': 'icon', 'vertexBuffer': iconData.vertexBuffer,
                'originBuffer': iconData.originBuffer, 'texcoordsBuffer': iconData.texcoordsBuffer,
                'icon':globals.stylesheetBitmaps[iconData.source[0]], 'color':iconData.color, 'z-index':zIndex,
                'visibility': visibility, 'culling': culling, 'center': center, 'stick': iconData.stick,
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'advancedHit': advancedHit,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'index': featureIndex, 'reduce': iconData.reduce,
                'lod':(globals.autoLod ? null : globals.tileLod) }, [iconData.vertexBuffer.buffer, iconData.originBuffer.buffer, iconData.texcoordsBuffer.buffer], signature);
            */
        }
    }

    if (label) {
        globals.signatureCounter++;
        signature = (""+globals.signatureCounter);

        if (labelData.noOverlap) {
            var margin = labelData.noOverlapMargin;
            var factorType = null, factorValue = null;

            if (labelData.noOverlapFactor !== null) {
                switch(labelData.noOverlapFactor[0]) {
                    case 'direct':      factorType = VTS_NO_OVERLAP_DIRECT;      break;
                    case 'div-by-dist': factorType = VTS_NO_OVERLAP_DIV_BY_DIST; break;
                }

                factorValue = labelData.noOverlapFactor[1];
            }

            var noOverlap = [labelBBox[0]-margin[0], labelBBox[1]-margin[1], labelBBox[2]+margin[0], labelBBox[3]+margin[1], factorType, factorValue];
        }

        if ((labelData.singleBuffer && labelData.singleBuffer.length > 0) || (labelData.vertexBuffer && labelData.vertexBuffer.length > 0)) {

            postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_LABEL, {
                'size':labelData.size, 'origin':labelData.pos, 'color':labelData.color,
                'color2':labelData.color2, 'outline':labelData.outline, 'z-index':zIndex, 'visibility': visibility,
                'culling': culling, 'center': center, 'stick': labelData.stick, 'noOverlap' : (labelData.noOverlap ? noOverlap: null),
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'files':labelData.files, 'index': featureIndex,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset, 'fonts': labelData.fontsStorage, 'hysteresis': labelData.hysteresis,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'advancedHit': advancedHit, 'reduce': labelData.reduce,  
                'lod':(globals.autoLod ? null : globals.tileLod) },
                (labelData.singleBuffer) ? [labelData.singleBuffer] : [labelData.vertexBuffer, labelData.originBuffer, labelData.texcoordsBuffer],
                signature);


            /*
            postGroupMessage({'command':'addRenderJob', 'type': 'label', 'singleBuffer': labelData.singleBuffer, 'size':labelData.size, 'origin':labelData.pos,
                'color':labelData.color, 'color2':labelData.color2, 'outline':labelData.outline, 'z-index':zIndex, 'visibility': visibility,
                'culling': culling, 'center': center, 'stick': labelData.stick, 'noOverlap' : (labelData.noOverlap ? noOverlap: null),
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'files':labelData.files, 'index': featureIndex,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset, 'fonts': labelData.fontsStorage, 'hysteresis': labelData.hysteresis,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'advancedHit': advancedHit, 'reduce': labelData.reduce,  
                'lod':(globals.autoLod ? null : globals.tileLod) }, [labelData.singleBuffer.buffer], signature);

            } else if (labelData.vertexBuffer && labelData.vertexBuffer.length > 0) {

            postGroupMessage({'command':'addRenderJob', 'type': 'label', 'vertexBuffer': labelData.vertexBuffer,
                'originBuffer': labelData.originBuffer, 'texcoordsBuffer': labelData.texcoordsBuffer, 'size':labelData.size,
                'color':labelData.color, 'color2':labelData.color2, 'outline':labelData.outline, 'z-index':zIndex, 'visibility': visibility,
                'culling': culling, 'center': center, 'stick': labelData.stick, 'noOverlap' : (labelData.noOverlap ? noOverlap: null),
                'hover-event':hoverEvent, 'click-event':clickEvent, 'draw-event':drawEvent, 'files':labelData.files, 'index': featureIndex,
                'enter-event':enterEvent, 'leave-event':leaveEvent, 'zbuffer-offset':zbufferOffset, 'fonts': labelData.fontsStorage, 'hysteresis': labelData.hysteresis,
                'hitable':hitable, 'state':globals.hitState, 'eventInfo':eventInfo, 'advancedHit': advancedHit, 'reduce': labelData.reduce,  
                'lod':(globals.autoLod ? null : globals.tileLod) }, [labelData.vertexBuffer.buffer, labelData.originBuffer.buffer, labelData.texcoordsBuffer.buffer], signature);
            */                
        }
    }

};


var processPointArrayVSwitchPass = function(pointArray, lod, style, featureIndex, zIndex, eventInfo) {
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

    var visibility = getLayerPropertyValue(style, 'visibility-rel', pointArray, lod) || 
                     getLayerPropertyValue(style, 'visibility-abs', pointArray, lod) ||
                     getLayerPropertyValue(style, 'visibility', pointArray, lod);
    var culling = getLayerPropertyValue(style, 'culling', pointArray, lod);
    var hysteresis = getLayerPropertyValue(style, 'hysteresis', pointArray, lod);

    var points, g, gl, totalPoints = 0;

    for (g = 0, gl = pointsGroups.length; g < gl; g++) {
        points = pointsGroups[g];
        if (Array.isArray(points) && points.length > 0) {
            totalPoints += points.length;
        }
    }

    var center = [0,0,0];
    var forceOrigin = globals.forceOrigin;
    var bboxMin = globals.bboxMin;
    var tileX = globals.tileX;
    var tileY = globals.tileY;
    var forceScale = globals.forceScale;
    var p, p1;

    for (g = 0, gl = pointsGroups.length; g < gl; g++) {
        points = pointsGroups[g];
        
        if (Array.isArray(points) && points.length > 0) {
            p = points[0];
            p1 = [p[0], p[1], p[2]];
       
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
       
                if ((i + 1) < li) {
                    if (dpoints) {
                        var p2 = points[i+1];
                        p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
                    } else {
                        p1 = points[i+1];
                    }
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

    globals.signatureCounter++;
    var signature = (""+globals.signatureCounter);

    postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_VSPOINT, {
        'z-index':zIndex, 'hysteresis' : hysteresis,
        'visibility': visibility, 'culling': culling, 'center': center, 'eventInfo':eventInfo, 'index': featureIndex, //'reduce': iconData.reduce,
        'lod':(globals.autoLod ? null : globals.tileLod) }, [], signature);

    /*postGroupMessage({'command':'addRenderJob', 'type': 'vspoint', 'z-index':zIndex, 'hysteresis' : hysteresis,
        'visibility': visibility, 'culling': culling, 'center': center, 'eventInfo':eventInfo, 'index': featureIndex, //'reduce': iconData.reduce,
        'lod':(globals.autoLod ? null : globals.tileLod) }, [], signature);*/
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

    var width = Math.abs(icon[3] * iconData.scale * 0.5);
    var height = Math.abs(icon[4] * iconData.scale * 0.5);

    //get offset
    var originOffset = getOriginOffset(iconData.origin, width, height);
    var offsetX = originOffset[0] + iconData.offset[0];
    var offsetY = originOffset[1] + iconData.offset[1];

    if (iconData.singleBuffer) {
        var b = iconData.singleBuffer;

        b[0] = offsetX; b[1] = offsetY;
        b[2] = icon[1];
        b[3] = icon[2];

        b[4] = width + offsetX; b[5] = offsetY;
        b[6] = icon[1]+icon[3];
        b[7] = icon[2];

        b[8] = width + offsetX; b[9] = height + offsetY;
        b[10] = icon[1]+icon[3];
        b[11] = icon[2]+icon[4];

        b[12] = offsetX; b[13] = height + offsetY;
        b[14] = icon[1];
        b[15] = icon[2]+icon[4];

        return;
    }

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
    var singleBuffer = labelData.singleBuffer;
    var index = labelData.index;
    var index2 = labelData.index2;
    var lastIndex = index;
    var text = '' + labelData.text;
    var fonts = labelData.fonts;
    var planes = {}, i, li;
    var glyphsRes = labelData.glyphsRes;

    var linesGlyphsRes = [];
    var linesGlyphsRes2 = [];

    //split text to lines
    do {
        var res = glyphsRes[2].indexOf(10); //search /n

        if (res != -1) {
            linesGlyphsRes.push([glyphsRes[0].slice(0,res), glyphsRes[1].slice(0,res), glyphsRes[2].slice(0,res)]);
            glyphsRes = [glyphsRes[0].slice(res+1), glyphsRes[1].slice(res+1), glyphsRes[2].slice(res+1)];
        } else {
            linesGlyphsRes.push(glyphsRes);
        }

    } while (res != -1);

    //split lines by width
    for (var i = 0, li = linesGlyphsRes.length; i < li; i++) {

        var glyphsRes = linesGlyphsRes[i];

        // eslint-disable-next-line
        do {
            var splitIndex = getSplitIndex(null, labelData.width, labelData.size, labelData.spacing, fonts, glyphsRes);
            var codes = glyphsRes[2];

            if (codes.length == splitIndex) {
                linesGlyphsRes2.push(glyphsRes);
                break;
            }

            linesGlyphsRes2.push([glyphsRes[0].slice(0,splitIndex), glyphsRes[1].slice(0,splitIndex), glyphsRes[2].slice(0,splitIndex)]);

            glyphsRes = [glyphsRes[0].slice(splitIndex+1), glyphsRes[1].slice(splitIndex+1), glyphsRes[2].slice(splitIndex+1)];

        } while(true);

    }

    var x = 0, y = 0;
    var lineHeight = getLineHeight(labelData.size, labelData.lineHeight, fonts);
    var maxWidth = 0;
    var lineWidths = [];

    //get max width
    for (i = 0, li = linesGlyphsRes2.length; i < li; i++) {
        lineWidths[i] = getTextLength(null, labelData.size, labelData.spacing, fonts, linesGlyphsRes2[i]);
        maxWidth = Math.max(lineWidths[i], maxWidth);
    }

    //generate text
    for (i = 0, li = linesGlyphsRes2.length; i < li; i++) {
        var textWidth = lineWidths[i];

        switch(labelData.align) {
        case 'left': x = 0; break;
        case 'right': x = maxWidth - textWidth; break;
        case 'center': x = (maxWidth - textWidth)*0.5; break;
        }

        index = addText([x,y,0], [1,0,0], null, labelData.size, labelData.spacing, fonts, vertexBuffer, texcoordsBuffer, true, index, planes, linesGlyphsRes2[i], singleBuffer);
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
    if (!singleBuffer) {
        for (i = lastIndex; i < index; i+=4) {
            vertexBuffer[i] += offsetX;
            vertexBuffer[i+1] -= offsetY;

            originBuffer[index2] = p1;
            originBuffer[index2 + 1] = p2;
            originBuffer[index2 + 2] = p3;
            index2 += 3;
        }
    } else {
        for (i = lastIndex; i < index; i+=8) {
            singleBuffer[i] += offsetX;
            singleBuffer[i+1] -= offsetY;
            singleBuffer[i+2] += offsetX;
            singleBuffer[i+3] -= offsetY;
        }

        labelData.pos = [p1,p2,p3];
        singleBuffer = new Float32Array(singleBuffer.buffer, 0, index);
    }
    
    var fonts = labelData.fonts;
    labelData.files = new Array(fonts.length);

    for (i = 0, li= fonts.length; i < li; i++) {
        labelData.files[i] = [];
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

        labelData.files[fontIndex] = files;
    }

    labelData.index = index;
    labelData.index2 = index2;

    return [offsetX * 0.5, offsetY * 0.5, (offsetX + maxWidth) * 0.5 + 1, (offsetY + Math.abs(y)) *0.5];
};

var processPointArrayGeometry = function(pointArray) {
    var i, li, dpoints = false;

    if (pointArray['points'] || pointArray['d-points']) {
        points = (pointArray['points'] || pointArray['d-points']);
        dpoints = (pointArray['d-points']) ? true : false;

        if (!(Array.isArray(points) && points.length > 0)) {
            return;
        }
    }

    var index = 0;
    var forceScale = globals.forceScale;

    var geometryBuffer = new Float64Array(points.length);

    var p = points[0], pp;
    var p1 = [p[0], p[1], p[2]], p2;

    //add ponints
    for (i = 0, li = points.length; i < li; i++) {

        if (forceScale != null) {
            pp = [p1[0] * forceScale[0], p1[1] * forceScale[1], p1[2] * forceScale[2]];
        }

        geometryBuffer[index] = pp[0];
        geometryBuffer[index+1] = pp[1];
        geometryBuffer[index+2] = pp[2];
        index += 3;

        if (i >= (li - 1)) {
            break;
        }

        if (dpoints) {
            p2 = points[i+1];
            p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
        } else {
            p1 = points[i+1];
        }
    }

    globals.signatureCounter++;
    postGroupMessageFast(VTS_WORKERCOMMAND_ADD_RENDER_JOB, VTS_WORKER_TYPE_POINT_GEOMETRY, {
        'id':pointArray['id'] }, [geometryBuffer, indicesBuffer], (""+globals.signatureCounter));
      
    /*postGroupMessage({'command':'addRenderJob', 'type': 'point-geometry', 'id':lineString['id'], 'geometryBuffer': geometryBuffer },
                      [geometryBuffer.buffer, indicesBuffer.buffer], (""+globals.signatureCounter));*/
};

export {processPointArrayPass, processPointArrayGeometry, processPointArrayVSwitchPass};


