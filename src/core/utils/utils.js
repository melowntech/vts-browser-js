
import {math as math_} from './math';
import {utilsUrl as utilsUrl_} from './url';

//get rid of compiler mess
var math = math_;
var utilsUrl = utilsUrl_;


var utils = {};
utils.useCredentials = false;
utils.instanceCounter = 0;


utils.validateBool = function(value, defaultValue) {
    if (typeof value === 'boolean') {
        return value;
    } else {
        return defaultValue;
    }
};


utils.validateNumber = function(value, minValue, maxValue, defaultValue) {
    if (typeof value === 'number') {
        return math.clamp(value, minValue, maxValue);
    } else {
        return defaultValue;
    }
};


utils.validateNumberArray = function(array, arraySize, minValues, maxValues, defaultValues) {
    if (Array.isArray(array) && array.length == arraySize) {
        for (var i = 0; i < arraySize; i++) {
            array[i] = math.clamp(array[i], minValues[i], maxValues[i]);
        }
        return array;
    } else {
        return defaultValues;
    }
};


utils.validateString = function(value, defaultValue) {
    if (typeof value === 'string') {
        return value;
    } else {
        return defaultValue;
    }
};


utils.padNumber = function(n, width) {
    var z = '0';

    if (n < 0) {
        n = (-n) + '';
        width--;     //7
        return n.length >= width ? ('-' + n) : '-' + (new Array(width - n.length + 1).join(z) + n);
    } else {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    }
};


utils.decodeFloat16 = function(binary) {
    var exponent = (binary & 0x7C00) >> 10;
    var fraction = binary & 0x03FF;
    return (binary >> 15 ? -1 : 1) * (
        exponent ?
        (
            exponent === 0x1F ?
            fraction ? NaN : Infinity :
            Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
        ) :
        6.103515625e-5 * (fraction / 0x400)
    );
};


utils.simpleFmtObj = (function obj(str, obj) {
    if (!str || str == '') {
        return '';
    }

    return str.replace(/\{([$a-zA-Z0-9][$a-zA-Z0-9]*)\}/g, function(s, match) {
        return (match in obj ? obj[match] : s);
    });
});


utils.simpleWikiLinks = (function obj(str, plain) {
    if (!str || str == '') {
        return '';
    }

    var str2 = utils.simpleFmtObj(str, {'copy':'&copy;', 'Y': (new Date().getFullYear())}); 
    
    return str2.replace(/\[([^\]]*)\]/g, function(s, match) {
        match  = match.trim();
        var urls = match.split(' ');//, 1);
        
        if (urls[0].indexOf('//') != -1) {
            if (plain) {
                if (urls.length > 1) {
                    return '' + match.substring(urls[0].length);
                } else {
                    return '' + urls[0];
                }
            } else {
                if (urls.length > 1) {
                    return '<a href=' + urls[0] + ' target="blank">' + match.substring(urls[0].length)+'</a>';
                } else {
                    return '<a href=' + urls[0] + ' target="blank">' + urls[0]+'</a>';
                }
            }
        }
        
        return match;
    });
});


utils.simpleFmtObjOrCall = (function obj(str, obj, call) {
    if (!str || str == '') {
        return '';
    }

    return str.replace(/\{([$a-zA-Z(-9][$a-zA-Z(-9]*)\}/g, function(s, match) {
        return (match in obj ? obj[match] : call(match));
    });
});


utils.getABGRFromHexaCode = (function(code) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(code);

    return result ?
    [ parseInt(result[4], 16),
        parseInt(result[3], 16),
        parseInt(result[2], 16),
        parseInt(result[1], 16)]
    : [0,0,0,255];
});


utils.stringifyFunction = (function(fn) {
    // Stringify the code
    return '(' + fn + ').call(self);';
});


utils.isPowerOfTwo = (function(value) {
    return (value & (value - 1)) === 0 && value !== 0;
});


utils.nearestPowerOfTwo = (function(value) {
    return Math.pow(2, Math.round(Math.log(value) / Math.LN2));
});   


utils.fitToPowerOfTwo = (function(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
});   


utils.getHash = function(str) {
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
};


utils.convertRGB2YCbCr = function(r, g, b) {
  return [( .299 * r + .587 * g  +  0.114 * b) + 0,
          ( -.169 * r + -.331 * g +  0.500 * b) + 128,
          ( .500 * r + -.419 * g +  -0.081 * b) + 128];
};


utils.convertYCbCr2RGB = function(y, cb, cr) {
  return [1 * y +  0 * (cb-128)      +  1.4 * (cr-128),
          1 * y +  -.343 * (cb-128)  +  -.711 * (cr-128),
          1 * y +  1.765 * (cb-128)  +  0 * (cr-128)];
};


utils.convertHSL2RGB = function(h, s, l){
   var r, g, b, m, c, x;

    h /= 60;
    if (h < 0) h = 6 - (-h % 6);
    h %= 6;

    s = Math.max(0, Math.min(1, s / 100));
    l = Math.max(0, Math.min(1, l / 100));

    c = (1 - Math.abs((2 * l) - 1)) * s;
    x = c * (1 - Math.abs((h % 2) - 1));

    if (h < 1) {
        r = c, g = x, b = 0;
    } else if (h < 2) {
        r = x, g = c, b = 0;
    } else if (h < 3) {
        r = 0, g = c, b = x;
    } else if (h < 4) {
        r = 0, g = x, b = c;
    } else if (h < 5) {
        r = x, g = 0, b = c;
    } else {
        r = c, g = 0, b = x;
    }

    m = l - c / 2
    
    return [(r + m),
            (g + m),
            (b + m)];
}


utils.getHashColor = function(str) {
    var h = utils.getHash(str);
    var c = utils.convertRGB2YCbCr(h&255,(h>>8)&255,(h>>16)&255);
    c[0] = math.clamp(c[0], 50, 200);
    return utils.convertRGB2YCbCr(c[0],c[1],c[2]);
};


utils.getHashColor2 = function(counter) {
    var h = Math.floor(counter / 18);
    var l = 50;

    if (h >= 1) {
        if (h % 2) {
            l = 50 + ((l * 10) % 30);
        } else {
            l = 50 - (((l-1) * 10) % 30);
        }
     }

    h = (counter % 18) * 20;

    return utils.convertHSL2RGB(h,100,l);
};


utils.loadText = function(path, onLoaded, onError, withCredentials, xhrParams) {
    utils.loadJSON(path, onLoaded, onError, true, withCredentials, xhrParams);
};


utils.loadXML = function(path, onLoaded, onError, withCredentials, xhrParams) {
    var onLoaded2 = (function(data){
        var parser = new DOMParser();
        data = parser.parseFromString(data, 'text/xml');
        if (onLoaded) {
            onLoaded(data);
        }
    });

    utils.loadJSON(path, onLoaded2, onError, true, withCredentials, xhrParams);
};


utils.loadJSON = function(path, onLoaded, onError, skipParse, withCredentials, xhrParams) {
    var xhr = new XMLHttpRequest();

    //xhr.onload  = (function() {
    xhr.onreadystatechange = (function (){

        switch (xhr.readyState) {
        case 0 : // UNINITIALIZED
        case 1 : // LOADING
        case 2 : // LOADED
        case 3 : // INTERACTIVE
            break;
        case 4 : // COMPLETED
    
            if (xhr.status >= 400 || xhr.status == 0) {
                if (onError) {
                    onError(xhr.status);
                }
                break;
            }
    
            var data = xhr.response;
            var parsedData = data;
                
            if (!skipParse) {
                try {
                        //var parsedData = skipParse ? data : eval("("+data+")");
                    parsedData = JSON.parse(data);
                } catch(e) {
                    // eslint-disable-next-line
                    console.log('JSON Parse Error ('+path+'): ' + (e['message'] ? e['message'] : ''));
                        
                    if (onError ) {
                        onError(xhr.status);
                    }
                
                    return;
                }
            }
                
            if (onLoaded) {
                onLoaded(parsedData);
            }
    
            break;
        }

    }).bind(this);

    /*
    xhr.onerror  = (function() {
        if (onError) {
            onError();
        }
    }).bind(this);*/

    xhr.open('GET',  path, true);
    xhr.withCredentials = withCredentials;
    
    if (xhrParams && xhrParams['token'] /*&& xhrParams["tokenHeader"]*/) {
        //xhr.setRequestHeader(xhrParams["tokenHeader"], xhrParams["token"]); //old way
        xhr.setRequestHeader('Accept', 'token/' + xhrParams['token'] + ', */*');
    }

    if (xhrParams && xhrParams['charset']) {
        xhr.overrideMimeType('text/xml; charset=' + xhrParams['charset']);
        //xhr.setRequestHeader('Content-type', xhrParams['Content-type']);
    }
    
    xhr.send('');
};


utils.loadBinary = function(path, onLoaded, onError, withCredentials, xhrParams, responseType) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (function (){

        switch (xhr.readyState) {
        case 0 : // UNINITIALIZED
        case 1 : // LOADING
        case 2 : // LOADED
        case 3 : // INTERACTIVE
            break;
        case 4 : // COMPLETED
    
            if (xhr.status >= 400 || xhr.status == 0) {
                if (onError) {
                    onError(xhr.status);
                }
                break;
            }
    
            var abuffer = xhr.response;
                    
            if (!abuffer) {
                if (onError) {
                    onError();
                }
                break;
            }
                    
                    //if (!responseType || responseType == "arraybuffer") {
                        //var data = new DataView(abuffer);
                    //} else {
                      //  var data = abuffer;
                    //}
    
            if (onLoaded) {
                onLoaded(abuffer);
            }
    
            break;
    
        default:
    
            if (onError) {
                onError();
            }
    
            break;
        }

    }).bind(this);
    
    /*
    xhr.onerror  = (function() {
        if (onError) {
            onError();
        }
    }).bind(this);*/

    xhr.open('GET', path, true);
    xhr.responseType = responseType ? responseType : 'arraybuffer';
    xhr.withCredentials = withCredentials;

    if (xhrParams && xhrParams['token'] /*&& xhrParams["tokenHeader"]*/) {
        //xhr.setRequestHeader(xhrParams["tokenHeader"], xhrParams["token"]); //old way
        xhr.setRequestHeader('Accept', 'token/' + xhrParams['token'] + ', */*');
    }

    xhr.send('');
};


utils.headRequest = function(url, onLoaded, onError, withCredentials, xhrParams) { 
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (function (){

        switch (xhr.readyState) {
        case 0 : // UNINITIALIZED
        case 1 : // LOADING
        case 2 : // LOADED
        case 3 : // INTERACTIVE
            break;
        case 4 : // COMPLETED
            if (onLoaded != null) {
                onLoaded(xhr.getAllResponseHeaders(), xhr.status);
                    //onLoaded(xhr.getResponseHeader("X-VE-Tile-Info"), xhr.status);
            }
            break;
    
        default:
    
            if (onError != null) {
                onError();
            }
    
            break;
        }

    }).bind(this);

    xhr.onerror  = (function() {
        if (onError != null) {
            onError();
        }
    }).bind(this);

    xhr.open('HEAD', url, true);
    //xhr.responseType = responseType ? responseType : "arraybuffer";
    xhr.withCredentials = withCredentials;

    if (xhrParams && xhrParams['token'] /*&& xhrParams["tokenHeader"]*/) {
        //xhr.setRequestHeader(xhrParams["tokenHeader"], xhrParams["token"]); //old way
        xhr.setRequestHeader('Accept', 'token/' + xhrParams['token'] + ', */*');
    }

    xhr.send('');
};


utils.loadImage = function(url, onload, onerror, withCredentials, direct) {
    var image = new Image();
    image.onerror = onerror;
    image.onload = onload;

    if (!direct){
        image.crossOrigin = withCredentials ? 'use-credentials' : 'anonymous';
    }

    image.src = url;
    return image;
};


utils.getParamsFromUrl = function(url) {
    return utilsUrl.getParamsFromUrl(url);
};


//var textDecoderUtf8 = null; //(typeof TextDecoder !== 'undefined') ? (new TextDecoder('utf-8')) : null;
var textDecoderUtf8 = (typeof TextDecoder !== 'undefined') ? (new TextDecoder('utf-8')) : null;

utils.unint8ArrayToString = function(array) {
    if (textDecoderUtf8) {
        return textDecoderUtf8.decode(array);
    } else {
//        return String.fromCharCode.apply(null, new Uint8Array(array.buffer));

        /*
        var buff = new Uint16Array(array.buffer, array.byteOffset, array.byteLength);
        var getChar = String.fromCharCode;
        //var buff2 = new Array(buff.length);
        var str = '';

        for (var i = 0, li = buff.length; i < li; i++) {
            //buff2[i] = getChar(buff[i]);
            str += getChar(buff[i]);
        }

        return str;
        //return buff2.join('');
        */

        var s = '';
        //var code_points2 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        var code_points2 = new Uint8Array(array.byteLength);
        code_points2.set(array);
        var code_points = new Uint32Array(code_points2.buffer);

        for (var i = 0, li = code_points.length; i < li; ++i) {
          var cp = code_points[i];
          if (cp <= 0xFFFF) {
            s += String.fromCharCode(cp);
          } else {
            cp -= 0x10000;
            s += String.fromCharCode((cp >> 10) + 0xD800,
                                     (cp & 0x3FF) + 0xDC00);
          }
        }
        return s;

    }
}


export {utils};

// only implement if no native implementation is available
/*
if (typeof Array.isArray === 'undefined') {
  Array.isArray = (function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  });
}*/
