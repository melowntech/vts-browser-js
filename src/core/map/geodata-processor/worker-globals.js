
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
    alwaysEventInfo : false,
    metricUnits : true,
    groupOptimize : true,
    groupOrigin : [0,0,0],
    messageBuffer : new Array(65536),
    messageBufferIndex : 0,
    messageBufferSize : 65536,
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

//var textEncoderUtf8 = null; //(typeof TextEncoder !== 'undefined') ? (new TextEncoder('utf-8')) : null;
var textEncoderUtf8 = (typeof TextEncoder !== 'undefined') ? (new TextEncoder('utf-8')) : null;

function stringToUint8Array(str) {
    if (textEncoderUtf8) {
        return textEncoderUtf8.encode(str);
    } else {

        /*
        console.log('' + (str.length * 2));

        var buffer = new ArrayBuffer(str.length * 2);
        var view = new Uint16Array(buffer);
        for (var i = 0, li = str.length; i < li; i++) {
            view[i] = str.charCodeAt(i);
        }
        return new Uint8Array(buffer);
        */


        // 1. Let S be the DOMString value.
        var s = String(str);

        // 2. Let n be the length of S.
        var n = s.length;

        // 3. Initialize i to 0.
        var i = 0;

        // 4. Initialize U to be an empty sequence of Unicode characters.
        var u = [];

        // 5. While i < n:
        while (i < n) {

          // 1. Let c be the code unit in S at index i.
          var c = s.charCodeAt(i);

          // 2. Depending on the value of c:

          // c < 0xD800 or c > 0xDFFF
          if (c < 0xD800 || c > 0xDFFF) {
            // Append to U the Unicode character with code point c.
            u.push(c);
          }

          // 0xDC00 ≤ c ≤ 0xDFFF
          else if (0xDC00 <= c && c <= 0xDFFF) {
            // Append to U a U+FFFD REPLACEMENT CHARACTER.
            u.push(0xFFFD);
          }

          // 0xD800 ≤ c ≤ 0xDBFF
          else if (0xD800 <= c && c <= 0xDBFF) {
            // 1. If i = n−1, then append to U a U+FFFD REPLACEMENT
            // CHARACTER.
            if (i === n - 1) {
              u.push(0xFFFD);
            }
            // 2. Otherwise, i < n−1:
            else {
              // 1. Let d be the code unit in S at index i+1.
              var d = s.charCodeAt(i + 1);

              // 2. If 0xDC00 ≤ d ≤ 0xDFFF, then:
              if (0xDC00 <= d && d <= 0xDFFF) {
                // 1. Let a be c & 0x3FF.
                var a = c & 0x3FF;

                // 2. Let b be d & 0x3FF.
                var b = d & 0x3FF;

                // 3. Append to U the Unicode character with code point
                // 2^16+2^10*a+b.
                u.push(0x10000 + (a << 10) + b);

                // 4. Set i to i+1.
                i += 1;
              }

              // 3. Otherwise, d < 0xDC00 or d > 0xDFFF. Append to U a
              // U+FFFD REPLACEMENT CHARACTER.
              else  {
                u.push(0xFFFD);
              }
            }
          }

          // 3. Set i to i+1.
          i += 1;
        }

        // 6. Return U.
        return new Uint8Array((new Uint32Array(u)).buffer);        
    }
}

/*
var textDecoderUtf8 = TextEncoder ? (new TextDecoder('utf-8')) : null;

function unint8ArrayToString(array) {
    if (textDecoderUtf8) {
        return textDecoderUtf8.decode(array);
    } else {
        return String.fromCharCode.apply(null, new Uint8Array(array.buffer));
    }
}
*/

export {globals, clamp, vec3Normalize, vec3Length, vec3Cross, simpleFmtCall, getHash, stringToUint8Array};
