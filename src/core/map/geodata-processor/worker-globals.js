
var globals = {
    stylesheetData : {},
    stylesheetLayers : {},
    stylesheetBitmaps : {},
    stylesheetFonts : {},
    stylesheetConstants : {},
    stylesheetVariables : {},
    fonts : {},
    fontsMap : {},
    fontsStorage : {},
    forceOrigin : false,
    forceScale : [1,1,1],
    bboxMin : [0,0,0],
    bboxMax : [1,1,1],
    geocent : false,
    tileX : 0,
    tileY : 0,
    tileLod : 0,
    tileSize : 1,
    hitState : 0,
    pixelFactor : 1,
    metricUnits : true,
    groupOptimize : true,
    groupOrigin : [0,0,0],
    messageBuffer : new Array(65536),
    messageBuffer2 : new Array(65536),
    messageBufferIndex : 0,
    messageBufferIndex2 : 0,
    messageBufferSize : 65536,
    messageBufferSize2 : 65536,
    messagePackSize : 0,
    signatureCounter : 0,
    autoLod : false,
    featureType : null,
    groupId : null,
    disableLog : false,
    reduceMode : 'scr-count4',
    reduceParams : null,
};


function clamp(value, min, max) {
    if (value < min) {
        value = min;
    }

    if (value > max) {
        value = max;
    }

    return value;
}


function vec3Normalize(a, b) {
    b || (b = a);
    var c = a[0],
        d = a[1],
        e = a[2],
        g = Math.sqrt(c * c + d * d + e * e);
    if (g) {
        if (g == 1) {
            b[0] = c;
            b[1] = d;
            b[2] = e;
            return b;
        }
    } else {
        b[0] = 0;
        b[1] = 0;
        b[2] = 0;
        return b;
    }
    g = 1 / g;
    b[0] = c * g;
    b[1] = d * g;
    b[2] = e * g;
    return b;
}


function vec3Length(a) {
    var b = a[0],
        c = a[1];
    a = a[2];
    return Math.sqrt(b * b + c * c + a * a);
}


function vec3Cross(a, b, c) {
    c || (c = a);
    var d = a[0],
        e = a[1];
    a = a[2];
    var g = b[0],
        f = b[1];
    b = b[2];
    c[0] = e * b - a * f;
    c[1] = a * g - d * b;
    c[2] = d * f - e * g;
    return c;
}


function getHash(str) {
    if (!str || str.length === 0) {
        return 0;    
    }

    var hash = 0, c;
    for (var i = 0, li = str.length; i < li; i++) {
        c   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + c;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}


var simpleFmtCall = (function obj(str, call) {
    if (!str || str == '') {
        return '';
    }

    var i = str.indexOf('{'), li, str2;

    if (i == -1) {
        return str;
    } else {
        str2 = i > 0 ? str.substring(0, i) : '';
    }

    var counter = 0;
    var begin = -1;

    for (li = str.length; i < li; i++) {
        var c = str.charAt(i);

        if (c == '{') {
            if (counter == 0) {
                begin = i;
            }

            counter++;
        } else if (c == '}') {
            counter--;

            if (counter == 0) {
                str2 += call(str.substring(begin+1, i));
            }
            
        } else if (counter == 0) {
            str2 += c;
        }
    }

    return str2;
});

/*
function copyArrayToBuffer(view, index, array) {
    for (var i = 0, li = array.length; i < li; i++) {
        view.setFloat32(index, array[i]); index += 4;
    }

    return index;
}

function copyDynamicArrayToBuffer(view, index, array) {
    if (array) {
        view.setUint8(index, array.length); index += 1;

        for (var i = 0, li = array.length; i < li; i++) {
            view.setFloat32(index, array[i]); index += 4;
        }
    } else {
        view.setUint8(index, 0); index += 1;
    }

    return index;
}

function copyDynamicArrayOfArraysToBuffer(view, index, array) {
    if (array) {
        view.setUint16(index, array.length); index += 2;

        for (var i = 0, li = array.length; i < li; i++) {
            var subarray = array[i];

            for (var j = 0, lj = array.length; j < lj; j++) {
                view.setUint16(index, subarray[j]); index += 2;
            }
        }
    } else {
        view.setUint16(index, 0); index += 2;
    }

    return index;
}

function getSizeOfArrayOfArrays(array) {
    var size = 0;

    for (var i = 0, li = array.length; i < li; i++) {
        size += array[i].length;
    }

    return size;
}
*/

var textEncoderUtf8 = TextEncoder ? (new TextEncoder('utf-8')) : null;

function stringToUint8Array(str) {
    if (textEncoderUtf8) {
        return textEncoderUtf8.encode(str);
    } else {

        var buffer = new ArrayBuffer(str.length * 2);
        var view = new Uint16Array(buffer);
        for (var i = 0, li = str.length; i < li; i++) {
            view[i] = str.charCodeAt(i);
        }
        return new Uint8Array(buffer);
    }
}

/*
var textDecoderUtf8 = TextEncoder ? (new TextDecoder('utf-8')) : null;

function unint8ToStringArray(array) {
    if (textDecoderUtf8) {
        return textDecoderUtf8.decode(array);
    } else {
        return String.fromCharCode.apply(null, new Uint8Array(array.buffer));
    }
}
*/

export {globals, clamp, vec3Normalize, vec3Length, vec3Cross, simpleFmtCall, getHash, stringToUint8Array};
