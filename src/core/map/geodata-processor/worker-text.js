
import {globals as globals_, vec3Normalize as vec3Normalize_,
        vec3Length as vec3Length_, vec3Cross as vec3Cross_} from './worker-globals.js';

//get rid of compiler mess
var globals = globals_,
    vec3Normalize = vec3Normalize_, vec3Length = vec3Length_,
    vec3Cross = vec3Cross_;


var setFont = function(fontData) {
    globals_.fonts['default'] = {
        chars : fontData['chars'],
        space : fontData['space'],
        size : fontData['size']
    };
};


var addChar = function(pos, dir, verticalShift, char, factor, index, index2, textVector, font, vertexBuffer, texcoordsBuffer, flat) {
    
    var n;

    if (globals.geocent && !flat) {
        n = [0,0,0];
        var nn = [0,0,0];
        
        vec3Normalize(globals.bboxMin, nn);
        vec3Cross(nn, dir, n);
    } else {
        n = [-dir[1],dir[0],0];
    }

    var p1 = [pos[0], pos[1], pos[2]];
    var p2 = [p1[0], p1[1], p1[2]];

    var chars = font.chars;

    var fc = chars[char];
    var l = 0;
    var nx = textVector[0];
    var ny = textVector[1];
    var nz = textVector[2];

    if (char == 9 || char == 32) {  //tab or space
        fc = chars[32]; //space

        if (fc != null) {
            p1[0] += dir[0] * (fc.step) * factor;
            p1[1] += dir[1] * (fc.step) * factor;
            l = fc.lx * factor;
        }
    } else {
        if (fc != null) {
            var factorX = fc.lx * factor;
            var factorY = fc.ly * factor;

            var n2 = [n[0] * verticalShift, n[1] * verticalShift, n[2] * verticalShift];
            var n3 = [n2[0] + n[0] * factorY, n2[1] + n[1] * factorY, n2[2] + n[2] * factorY];

            p2[0] = p1[0] + dir[0] * factorX;
            p2[1] = p1[1] + dir[1] * factorX;
            p2[2] = p1[2] + dir[2] * factorX;

            //first polygon
            vertexBuffer[index] = p1[0] - n2[0];
            vertexBuffer[index+1] = p1[1] - n2[1];
            vertexBuffer[index+2] = p1[2] - n2[2];
            vertexBuffer[index+3] = nz;

            texcoordsBuffer[index2] = fc.u1;
            texcoordsBuffer[index2+1] = fc.v1;
            texcoordsBuffer[index2+2] = nx;
            texcoordsBuffer[index2+3] = ny;

            vertexBuffer[index+4] = p1[0] - n3[0];
            vertexBuffer[index+5] = p1[1] - n3[1];
            vertexBuffer[index+6] = p1[2] - n3[2];
            vertexBuffer[index+7] = nz;

            texcoordsBuffer[index2+4] = fc.u1;
            texcoordsBuffer[index2+5] = fc.v2;
            texcoordsBuffer[index2+6] = nx;
            texcoordsBuffer[index2+7] = ny;

            vertexBuffer[index+8] = p2[0] - n2[0];
            vertexBuffer[index+9] = p2[1] - n2[1];
            vertexBuffer[index+10] = p2[2] - n2[2];
            vertexBuffer[index+11] = nz;

            texcoordsBuffer[index2+8] = fc.u2;
            texcoordsBuffer[index2+9] = fc.v1;
            texcoordsBuffer[index2+10] = nx;
            texcoordsBuffer[index2+11] = ny;


            //next polygon
            vertexBuffer[index+12] = p1[0] - n3[0];
            vertexBuffer[index+13] = p1[1] - n3[1];
            vertexBuffer[index+14] = p1[2] - n3[2];
            vertexBuffer[index+15] = nz;

            texcoordsBuffer[index2+12] = fc.u1;
            texcoordsBuffer[index2+13] = fc.v2;
            texcoordsBuffer[index2+14] = nx;
            texcoordsBuffer[index2+15] = ny;

            vertexBuffer[index+16] = p2[0] - n3[0];
            vertexBuffer[index+17] = p2[1] - n3[1];
            vertexBuffer[index+18] = p2[2] - n3[2];
            vertexBuffer[index+19] = nz;

            texcoordsBuffer[index2+16] = fc.u2;
            texcoordsBuffer[index2+17] = fc.v2;
            texcoordsBuffer[index2+18] = nx;
            texcoordsBuffer[index2+19] = ny;

            vertexBuffer[index+20] = p2[0] - n2[0];
            vertexBuffer[index+21] = p2[1] - n2[1];
            vertexBuffer[index+22] = p2[2] - n2[2];
            vertexBuffer[index+23] = nz;

            texcoordsBuffer[index2+20] = fc.u2;
            texcoordsBuffer[index2+21] = fc.v1;
            texcoordsBuffer[index2+22] = nx;
            texcoordsBuffer[index2+23] = ny;

            index += 24;
            index2 += 24;
            //polygons += 2;

            p1[0] = p1[0] + dir[0] * fc.step * factor;
            p1[1] = p1[1] + dir[1] * fc.step * factor;
            l = fc.lx * factor;
        } else {
            //unknown char
        }
    }

    return [p1, index, index2, l];
};


var getCharVerticesCount = function(origin) {
    return (origin ? 3 : 4) * 3 * 2;
};


var addText = function(pos, dir, text, size, font, vertexBuffer, texcoordsBuffer, flat, index) {
    var textVector = [0,1,0];

    var factor = size / font.size;
    var newLineSpace = font.space * factor;

    var s = [pos[0], pos[1], pos[2]];
    var p1 = [pos[0], pos[1], pos[2]];

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10) { //new line
            s[0] += -dir[1] * newLineSpace;
            s[1] += dir[0] * newLineSpace;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        var shift = addChar(p1, dir, 0, char, factor, index, index, textVector, font, vertexBuffer, texcoordsBuffer, flat);

        p1 = shift[0];
        index = shift[1];
        //index2 = shift[2];
    }

    return index;
};


var addTextOnPath = function(points, distance, text, size, textVector, font, verticalOffset, vertexBuffer, texcoordsBuffer, index) {
    if (textVector == null) {
        textVector = [0,1,0];
    }

    var p1 = points[0];
    
    var chars = font.chars;
    var factor = size / font.size;
    var newLineSpace = font.space * factor;

    var s = [p1[0], p1[1], p1[2]];
    p1 = [p1[0], p1[1], p1[2]];
    var l = distance;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10) { //new line
            s[0] += -dir[1] * newLineSpace;
            s[1] += dir[0] * newLineSpace;
            p1 = [s[0], s[1], s[2]];
            continue;
        }

        if (char == 9) { //tab
            char = 32;
        }

        var fc = chars[char];
        var ll = 1;
        if (fc != null) {
            ll = fc.step * factor;
        }

        var posAndDir = getPathPositionAndDirection(points, l);
        var posAndDir2 = getPathPositionAndDirection(points, l+ll);

        //average dir
        var dir = [(posAndDir2[1][0] + posAndDir[1][0])*0.5,
            (posAndDir2[1][1] + posAndDir[1][1])*0.5,
            (posAndDir2[1][2] + posAndDir[1][2])*0.5];

        vec3Normalize(dir);

        var shift = addChar(posAndDir[0], dir, -factor*font.size*0.7+verticalOffset, char, factor, index, index, textVector, font, vertexBuffer, texcoordsBuffer);

        p1 = shift[0];
        index = shift[1];
        //index2 = shift[2];
        l += ll;
    }

    return index;
};


var addStreetTextOnPath = function(points, text, size, font, verticalOffset, vertexBuffer, texcoordsBuffer, index) {
    var factor = size / font.size;
    var textLength = getTextLength(text, factor, font);
    var pathLength = getPathLength(points);
    var shift = (pathLength -  textLength)*0.5;
    if (shift < 0) {
        shift = 0;
    }

    if (textLength > pathLength) {
        return;
    }

    var textVector = getPathTextVector(points, shift, text, factor, font);

    return addTextOnPath(points, shift, text, size, textVector, font, verticalOffset, vertexBuffer, texcoordsBuffer, index);
};


var getFontFactor = function(size, font) {
    return size / font.size;
};


var getLineHeight = function(size, font) {
    var factor = size / font.size;
    return font.space * factor;
};


var getTextLength = function(text, factor, font) {
    var l = 0;
    var chars = font.chars;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10) { //new line
            continue;
        }

        if (char == 9) {  //tab or space
            char = 32;
        }

        var fc = chars[char];

        if (fc != null) {
            l += fc.step * factor;
        }
    }

    return l;
};


var getSplitIndex = function(text, width, factor, font) {
    var l = 0;
    var chars = font.chars;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (l > width && (char == 10 || char == 9 || char == 32)) {
            return i;
        }

        if (char == 10) { //new line
            continue;
        }

        if (char == 9) {  //tab or space
            char = 32;
        }

        var fc = chars[char];

        if (fc != null) {
            l += fc.step * factor;
        }
    }

    return li;
};


var getPathLength = function(points) {
    var l = 0;

    for (var i = 0, li = points.length-1; i < li; i++)
    {
        var p1 = points[i];
        var p2 = points[i+1];
        var dir = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3Length(dir);
    }

    return l;
};


var getPathPositionAndDirection = function(points, distance) {
    var l = 0;
    var p1 = [0,0,0];
    var dir = [1,0,0];

    for (var i = 0, li = points.length-1; i < li; i++) {
        p1 = points[i];
        var p2 = points[i+1];
        dir = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        var ll = vec3Length(dir);

        if ((l + ll) > distance) {

            var factor = (distance - l) / (ll);
            var p = [p1[0] + dir[0] * factor,
                p1[1] + dir[1] * factor,
                p1[2] + dir[2] * factor];

            vec3Normalize(dir);

            return [p, dir];
        }

        l += ll;
    }

    return [p1, dir];
};


var getPathTextVector = function(points, shift, text, factor, font) {
    var l = 0;
    var p1 = [0,0,0];
    var dir = [1,0,0];
    var textDir = [0,0,0];
    var textStart = shift;
    var textEnd = shift + getTextLength(text, factor, font);
    var bboxMin = globals.bboxMin;
    var geocent = globals.geocent;

    for (var i = 0, li = points.length-1; i < li; i++) {
        p1 = points[i];
        var p2 = points[i+1];
        dir = [p2[0] - p1[0], p2[1] - p1[1], p2[2] - p1[2]];

        l += vec3Length(dir);

        if (l > textStart) {
            vec3Normalize(dir);
            textDir[0] += dir[0];
            textDir[1] += dir[1];
            textDir[2] += dir[2];
        }

        if (l > textEnd) {
            vec3Normalize(textDir);

            if (geocent) {
                var nn = [0,0,0];
                vec3Normalize(bboxMin, nn);
                vec3Cross(nn, textDir, nn);
                return nn;
            } else {
                return [-textDir[1], textDir[0],0];
            }
        }
    }

    return textDir;
};


var areTextCharactersAvailable = function(text, font) {
    if (!text || text == '') {
        return false;
    }

    var chars = font.chars;

    for (var i = 0, li = text.length; i < li; i++) {
        var char = text.charCodeAt(i);

        if (char == 10 || char == 9) { //new line, tab or space
            continue;
        }

        if (!chars[char]) {
            return false;
        }
    }

    return true;
};


export {addStreetTextOnPath, getTextLength, getLineHeight, getFontFactor, getSplitIndex, areTextCharactersAvailable, addText, addTextOnPath, setFont, getCharVerticesCount};


