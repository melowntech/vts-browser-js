
import {globals as globals_, simpleFmtCall as simpleFmtCall_} from './worker-globals.js';
import {areTextCharactersAvailable as areTextCharactersAvailable_, hasLatin as hasLatin_, isCJK as isCJK_ } from './worker-text.js';

//get rid of compiler mess
var globals = globals_;
var simpleFmtCall = simpleFmtCall_;
var hasLatin = hasLatin_, isCJK = isCJK_;
var areTextCharactersAvailable = areTextCharactersAvailable_;


var getLayer = function(layerId, featureType, index) {
    var layer = globals.stylesheetData.layers[layerId];
    if (layer == null) {
        logError('wrong-Layer', layerId, null, null, index, featureType);
        return {};
    } else {
        return layer;
    }
};


var getLayerExpresionValue = function(layer, value, feature, lod, key) {
    var finalValue;

    switch(typeof value) {
    case 'string':

        if (value.length > 0) {
            //is it feature property?
            switch (value.charAt(0)) {
                case '#': 
                    //debugger;
                    switch(value) {
                        case '#id':       return feature.id;
                        case '#type':     return globals.featureType;
                        case '#group':    return globals.groupId;
                        case '#lod':      return globals.tileLod;
                        case '#tileSize': return globals.tileSize;
                        case '#metric':   return globals.metricUnits;
                    }

                    return finalValue;

                case '$':
                case '@':

                    switch (value.charAt(0)) {
                        case '$': finalValue = feature.properties[value.substr(1)]; break;
                        case '@': finalValue = globals.stylesheetConstants[value]; break;
                    }

                    if (typeof finalValue == 'undefined') {
                        logError('wrong-expresion', layer['$$layer-id'], value, value, null, 'feature-property');
                    }

                    return getLayerExpresionValue(layer, finalValue, feature, lod, key);
                    //return finalValue;
            }

            return simpleFmtCall(value, (function(str){  

                if (str.length > 0) {

                    switch (str.charAt(0)) {
                        case '#': 
                            //debugger;
                            switch(str) {
                                case '#id':       return feature.id;
                                case '#type':     return globals.featureType;
                                case '#group':    return globals.groupId;
                                case '#lod':      return globals.tileLod;
                                case '#tileSize': return globals.tileSize;
                                case '#metric':   return globals.metricUnits;
                            }

                        case '$':
                        case '@':

                            switch (str.charAt(0)) {
                                case '$': finalValue = feature.properties[str.substr(1)]; break;
                                case '@': finalValue = globals.stylesheetConstants[str]; break;
                            }

                            if (typeof finalValue == 'undefined') {
                                logError('wrong-expresion', layer['$$layer-id'], value, value, null, 'feature-property');
                            }

                            finalValue = getLayerPropertyValueInner(layer, key, feature, lod, finalValue, 0);

                            return getLayerExpresionValue(layer, finalValue, feature, lod, key);
                    }

                    if (str.indexOf('{') != -1) {

                        try {
                            str = str.replace(/'/g, '"');
                            finalValue = JSON.parse(str);
                        } catch(e) {
                            logError('wrong-expresion', layer['$$layer-id'], value, value, null, 'feature-property');
                            return "";
                        }

                        if (typeof finalValue == 'undefined') {
                            logError('wrong-expresion', layer['$$layer-id'], value, value, null, 'feature-property');
                            return "";
                        } else {
                            return getLayerPropertyValueInner(layer, key, feature, lod, finalValue, 0);
                        }

                    } else {
                        return str;
                    }

                }

            }));
        }

        break;
    }
    
    return value;
};


var getLayerPropertyValue = function(layer, key, feature, lod) {
    var value = getLayerPropertyValueInner(layer, key, feature, lod);
    return validateLayerPropertyValue(layer['$$layer-id'], key, value);
};


var getLayerPropertyValueInner = function(layer, key, feature, lod, value, depth) {
    var index = 0, i, li, finalValue, root, v1, v2;
    var tmpValue;

    
    if ((typeof value) === 'undefined') {
        /*
        if (layer[key]) {
            value = JSON.parse(JSON.stringify(layer[key])); //make copy
        } else {
            value = layer[key];
        }*/

        value = layer[key];

        root = true;
        depth = 0;
    } else {
        if (depth > 100) {
            return void(0);
        }
    }

    switch(typeof value) {
    case 'string':

        if (value.length > 0) {
            finalValue = value;

            //is it feature property, variable or constant?
            switch(value.charAt(0)) {
                case '$': finalValue = feature.properties[value.substr(1)]; break;
                case '@': finalValue = globals.stylesheetConstants[value]; break;
                case '&': finalValue = globals.stylesheetVariables[value.substr(1)]; break;
                case '#': 
                    //debugger;
                    switch(value) {
                        case '#id':       return feature.id;
                        case '#type':     return globals.featureType;
                        case '#group':    return globals.groupId;
                        case '#lod':      return globals.tileLod;
                        case '#tileSize': return globals.tileSize;
                        case '#metric':   return globals.metricUnits;
                    }
                    break;
            }

            if (typeof finalValue === 'string') {
                finalValue = getLayerExpresionValue(layer, value, feature, lod, key);
            } else {
                if (typeof finalValue !== 'undefined' && value.charAt(0) == '@') {
                    finalValue = getLayerPropertyValueInner(layer, key, feature, lod, finalValue, depth+1);
                }
            }

            if (typeof finalValue !== 'undefined') {

                //simpleFmtCall(finalValue, (function(svalue){ getLayerPropertyValueInner(layer, key, feature, lod, svalue, depth+1); }))

                return finalValue;
            } else {
                logError('wrong-object', layer['$$layer-id'], key, value, null, 'feature-property');
                
                if (root) {
                    return getDefaultLayerPropertyValue(key);
                } else {
                    return void(0);
                }
            }
        }

        return value;

    case 'object':

            //is it null?
        if (value == null) {
            if (root) {
                return getDefaultLayerPropertyValue(key);
            } else {
                return void(0);
            }
        }

        //is it array (rgb, rgba, vec2)?
        if (Array.isArray(value)) {

            if (key == 'icon-source') {
                //index++;
                if (globals.stylesheetBitmaps[value[0]] == null) {
                    logError('wrong-object', layer['$$layer-id'], key, value, null, 'bitmap');

                    if (root) {
                        return getDefaultLayerPropertyValue(key);
                    } else {
                        return void(0);
                    }
                }
            }

            if (key != 'filter') {
                tmpValue = new Array(value.length);

                for (i = index, li = value.length; i < li; i++) {
                    tmpValue[i] = getLayerPropertyValueInner(layer, key, feature, lod, value[i], depth + 1);
                }

                return tmpValue;
            }

            return value;
        }

        var functionName, functionValue, functionError, finalValue;

        for (functionName in value) {
            break;
        }

        if (!functionName) {
            if (root) {
                return getDefaultLayerPropertyValue(key);
            } else {
                return void(0);
            }
        }

        functionValue = value[functionName];

        switch (functionName) {
            case 'if':

                if (!Array.isArray(functionValue) || functionValue.length != 3) {
                    functionError = true;
                } else {
                    if (getFilterResult(functionValue[0], feature, globals.featureType, globals.groupId, layer, key, lod, 0)) {
                        finalValue = getLayerPropertyValueInner(layer, key, feature, lod, functionValue[1], depth + 1);
                    } else {
                        finalValue = getLayerPropertyValueInner(layer, key, feature, lod, functionValue[2], depth + 1);
                    }

                    if (typeof finalValue === 'undefined') {
                        functionError = true;
                    } else {
                        return finalValue;
                    }
                }

            case 'add':
            case 'sub':
            case 'mul':
            case 'div':
            case 'pow':
            case 'atan2':

                if (!Array.isArray(functionValue) || functionValue.length != 2) {
                    functionError = true;
                } else {

                    v1 = getLayerPropertyValueInner(layer, key, feature, lod, functionValue[0], depth + 1);
                    v2 = getLayerPropertyValueInner(layer, key, feature, lod, functionValue[1], depth + 1);

                    if (typeof v1 !== 'number' || typeof v2 !== 'number') {
                        functionError = true;
                    } else {
                        switch (functionName) {
                            case 'add':    return v1 + v2;
                            case 'sub':    return v1 - v2;
                            case 'mul':    return v1 * v2;
                            case 'div':    return v1 / v2;
                            case 'pow':    return Math.pow(v1, v2);
                            case 'atan2':  return Math.atan2(v1, v2);
                        }
                    }
                }

            case 'sgn':
            case 'sin':
            case 'cos':
            case 'tan':
            case 'asin':
            case 'acos':
            case 'atan':
            case 'sqrt':
            case 'abs':
            case 'round':
            case 'floor':
            case 'ceil':
            case 'deg2rad':
            case 'rad2deg':

                functionValue = getLayerPropertyValueInner(layer, key, feature, lod, functionValue, depth + 1);

                if (typeof functionValue !== 'number') {
                    functionError = true;
                } else {
                    switch (functionName) {
                        case 'sgn':  return functionValue < 0 ? -1 : 1;
                        case 'sin':  return Math.sin(functionValue);
                        case 'cos':  return Math.cos(functionValue);
                        case 'tan':  return Math.tan(functionValue);
                        case 'asin': return Math.asin(functionValue);
                        case 'acos': return Math.acos(functionValue);
                        case 'atan': return Math.atan(functionValue);
                        case 'sqrt': return Math.sqrt(functionValue);
                        case 'abs':  return Math.abs(functionValue);
                        case 'round': return Math.round(functionValue);
                        case 'floor': return Math.floor(functionValue);
                        case 'ceil':  return Math.ceil(functionValue);
                        case 'deg2rad':  return (functionValue / 180) * Math.PI;
                        case 'rad2deg':  return (functionValue / Math.PI) * 180;
                    }
                }

                break;

            case 'strlen':
            case 'str2num':
            case 'lowercase':
            case 'uppercase':
            case 'capitalize':
            case 'has-fonts':
            case 'has-latin':
            case 'is-cjk':
                functionValue = getLayerPropertyValueInner(layer, key, feature, lod, functionValue, depth + 1);

                if (typeof functionValue !== 'string') {
                    functionError = true;
                } else {
                    switch (functionName) {
                        case 'strlen':     return functionValue.length;
                        case 'str2num':    return parseFloat(functionValue);
                        case 'lowercase':  return functionValue.toLowerCase();
                        case 'uppercase':  return functionValue.toUpperCase();
                        case 'capitalize': return functionValue.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
                        case 'has-fonts':  return areTextCharactersAvailable(functionValue);
                        case 'has-latin':  return hasLatin(functionValue);
                        case 'is-cjk':     return isCJK(functionValue); 
                    }
                }

                break;

            case 'min':
            case 'max':

                if (!Array.isArray(functionValue)) {
                    functionError = true;
                } else {

                    finalValue = getLayerPropertyValueInner(layer, key, feature, lod, functionValue[0], depth + 1);

                    for (i = index, li = value.length; i < li; i++) {
                        tmpValue = getLayerPropertyValueInner(layer, key, feature, lod, functionValue[i], depth + 1);

                        if (typeof tmpValue !== 'number') {
                            functionError = true;
                            break;
                        }

                        if (functionName == 'max') {
                            finalValue = Math.max(finalValue, tmpValue);
                        } else {
                            finalValue = Math.min(finalValue, tmpValue);
                        }
                    }

                    return finalValue;
                }

                break;

            case 'linear':
            case 'linear2':
            case 'discrete':
            case 'discrete2':
            case 'lod-scaled':

                //LOD based functions
                var stops = null;
                var lodScaledArray = null;
                var functionValue = lod;

                if (value['lod-scaled'] != null) {
                    var array = value['lod-scaled'];

                    if ((typeof array[1]) == 'number') {
                        return array[1] * Math.pow(2*array[2], array[0] - lod);
                    }

                    stops = array[1];
                    lodScaledArray = array;

                } if (value['discrete2'] != null || value['linear2'] != null) {
                    var array = value['discrete2'] || value['linear2'];
                    stops = array[1];
                    functionValue = getLayerPropertyValueInner(layer, key, feature, lod, array[0], depth + 1);
                } else {
                    stops = value['discrete'] || value['linear'];
                }

                var lastLod = stops[0][0];
                var lastValue = stops[0][1];
                var valueType = (typeof lastValue);
                var newValue = lastValue;

                var currentLod, currentValue;

                for (var i = 0, li = stops.length; i <= li; i++) {

                    if (i == li) {
                        newValue = lastValue;
                        break;
                    }

                    if (stops[i][0] > functionValue) {

                        if (value['discrete'] != null || value['discrete2'] != null || lodScaledArray != null) { //no interpolation
                            newValue = lastValue;
                            break;
                        } else { //interpolate

                            currentLod = stops[i][0];
                            currentValue = stops[i][1];

                            if (currentLod == lastLod) { //end of array no interpolation needed
                                break;
                            }

                            switch(valueType) {

                            case 'boolean':
                                lastValue = lastValue ? 1 : 0;
                                currentValue = lastValue ? 1 : 0;
                                newValue = lastValue + (currentValue - lastValue) * ((functionValue - lastLod) / (currentLod - lastLod));

                                newValue = newValue > 0.5 ? true : false;
                                break;

                            case 'number':
                                newValue = lastValue + (currentValue - lastValue) * ((functionValue - lastLod) / (currentLod - lastLod));
                                break;

                            case 'object':
                                newValue = [];

                                for (var j = 0, lj= lastValue.length; j < lj; j++) {
                                    newValue[j] = lastValue[j] + (currentValue[j] - lastValue[j]) * ((functionValue - lastLod) / (currentLod - lastLod));
                                }

                                break;
                            }

                            break;
                        }
                    }

                    lastLod = stops[i][0];
                    lastValue = stops[i][1];
                }

                if (lodScaledArray != null) {
                    newValue *= Math.pow(2*lodScaledArray[2], lodScaledArray[0] - functionValue);
                }

                return newValue;

            default: 
                functionError = true;
                break;
        }

        if (functionError) {
            if (root) {
                return getDefaultLayerPropertyValue(key);
            } else {
                return void(0);
            }
        }


    case 'number':
    case 'boolean':
        return value;
    }

    if (root) {
        return getDefaultLayerPropertyValue(key);
    } else {
        return void(0);
    }
};


var inheritLayer = function(layerId, layer, layerData, stylesheetLayersData, depth) {
    if (depth > 100) {
        logError('custom', 'infinite inherit loop in Layer: ' + layerId);
        return;
    }

    //do we need inherite Layer?
    if (layerData['inherit'] != null) {
        //get inherited Layer
        var LayerToInherit = stylesheetLayersData['layers'][layerData['inherit']];

        if (LayerToInherit != null) {

            if (LayerToInherit['inherit'] != null) {
                inheritLayer(layerData['inherit'], layer, LayerToInherit, stylesheetLayersData, depth++);
            }

            //copy inherited Layer properties
            for (var key in LayerToInherit) {
                layer[key] = LayerToInherit[key];
            }
        } else {
            logError('wrong-object', layerId, 'inherit', LayerToInherit, 'Layer');
            return getDefaultLayerPropertyValue(key);
        }
    }
};


var copyLayer = function(layerId, layer, layerData, stylesheetLayersData) {
    //do we need inherite Layer?
    if (layerData['inherit'] != null) {
        inheritLayer(layerId, layer, layerData, stylesheetLayersData, 0);
    }

    //copy Layer properties
    //if inherited properties are present then they will be overwriten
    for (var key in layerData) {
        layer[key] = layerData[key];
    }

    //store layer id
    layer['$$layer-id'] = layerId;
};


var logError = function(errorType, layerId, key, value, index, subkey) {
    if (globals.disableLog) {
        return;
    }

    if ((typeof value) == 'object') {
        value = JSON.stringify(value);
    }
    
    var str = null;

    switch(errorType) {
    case 'wrong-property-value':
        str = 'Error: wrong layer property ' + (subkey ? ('\'' + subkey + '\'') : '') + ': ' + layerId + '.' + key + ' = ' + value;
        break;

    case 'wrong-property-value[]':
        str = 'Error: wrong layer property ' + (subkey ? ('\'' + subkey + '\'') : '') + '['+index+']: ' + layerId + '.' + key + ' = ' + value;
        break;

    case 'wrong-object':
        str = 'Error: reffered '+ subkey + ' does not exist: ' + layerId + '.' + key + ' = ' + value;
        break;

    case 'wrong-object[]':
        str = 'Error: reffered '+ subkey + ' does not exist: ' + layerId + '.' + key + '['+index+'] = ' + value;
        break;

    case 'wrong-Layer':
        str = 'Error: reffered '+ subkey + ' Layer does not exist: ' + subkey + '['+index+'].Layer = ' + layerId;
        break;

    case 'wrong-bitmap':
        str = 'Error: wrong definition of bitmap: ' + layerId;
        break;

    case 'custom':
        str = 'Error: ' + layerId;
        break;
    }
    
    if (str) {
         // eslint-disable-next-line 
        console.log(str);
        //throw str;
    }
};


var validateValue = function(layerId, key, value, type, arrayLength, min, max) {
    var i, li;

    //check for object
    if (value != null && (typeof value) == 'object' && !Array.isArray(value)) {
        logError('wrong-property-value', layerId, key, value);
        return getDefaultLayerPropertyValue(key);
    }

    //check value type
    if ((typeof value) != type) {
        //check for exceptions
        if (!(value === null && (key == 'icon-source' || key == 'visibility' || key == 'label-no-overlap-factor'))) {
            logError('wrong-property-value', layerId, key, value);
            return getDefaultLayerPropertyValue(key);
        }
    }

    //check value
    switch(typeof value) {

    case 'object':

        //accepted cases for null value
        if (value === null && (key == 'line-style-texture' || key == 'icon-source' || 'dynamic-reduce' || 'reduce' ||
            key == 'hysteresis' || key == 'visibility' || key == 'visibility-abs' || key == 'visibility-rel' || key == 'next-pass')) {
            return value;
        }

        //check reduce
        if (key == 'reduce' || key == 'dynamic-reduce' || key == 'label-no-overlap-factor') {
            if (Array.isArray(value) && value.length > 0 && (typeof value[0] === 'string')) {

                if (key == 'dynamic-reduce') {
                    if (!((value[0] == 'tilt' || value[0] == 'tilt-cos' || value[0] == 'tilt-cos2' || value[0] == 'scr-count' || value[0] == 'scr-count2' ||
                           value[0] == 'scr-count3' || value[0] == 'scr-count4') &&
                        (typeof value[1] === 'number') && ((typeof value[2] === 'number') || value[0] == 'scr-count4'))) {
                        logError('wrong-property-value', layerId, key, value);
                        return getDefaultLayerPropertyValue(key);
                    }
                } else if (key == 'reduce') {
                    if (value[0] != 'odd' && value != 'even') {
                        if ((typeof value[1] !== 'number') || ((value[0] != 'top' || value != 'bottom') && (typeof value[2] !== 'string'))) {
                            logError('wrong-property-value', layerId, key, value);
                            return getDefaultLayerPropertyValue(key);
                        }
                    }
                } else if (key == 'label-no-overlap-factor') {
                    if (!(value[0] == 'direct' || value[0] == 'div-by-dist')) {
                        logError('wrong-property-value', layerId, key, value);
                        return getDefaultLayerPropertyValue(key);
                    }
                }

            } else {
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        //check multipasss
        if (key == 'next-pass') {
            if (Array.isArray(value) && value.length > 0) {

                for (i = 0; i < li; i++) {
                    var valueItem = value[i];

                    if (!(typeof valueItem == 'object' &&
                            Array.isArray(valueItem) &&
                            valueItem.length == 2 &&
                            typeof valueItem[0] == 'number' &&
                            typeof valueItem[1] == 'string')) {

                        logError('wrong-property-value[]', layerId, key, value, i);
                        return getDefaultLayerPropertyValue(key);
                    }
                }

            } else {
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        if (key == 'label-font' || key == 'line-label-font') {

            if (!Array.isArray(value) || value.length < 1) {
                logError('wrong-property-value[]', layerId, key, value, 0);
                return getDefaultLayerPropertyValue(key);
            } else {
                for (i = 0, li = value.length; i < li; i++) {
                    if (typeof value[i] != 'string' || !globals.fonts[value[i]]) {
                        logError('wrong-property-value[]', layerId, key, value, 0);
                        return getDefaultLayerPropertyValue(key);
                    }
                }
            }

            return value;
        }

        //check array
        if (arrayLength != null) {
            if (Array.isArray(value) && value.length == arrayLength) {

                //validate array values
                i = 0;

                if (key == 'icon-source' || key == 'line-style-texture') {
                    if (typeof value[0] != 'string') {
                        logError('wrong-property-value[]', layerId, key, value, 0);
                        return getDefaultLayerPropertyValue(key);
                    }

                    if (globals.stylesheetBitmaps[value[0]] == null) {
                        logError('wrong-object', layerId, key, value, null, 'bitmap');
                        return getDefaultLayerPropertyValue(key);
                    }

                    i = 1;
                }

                for (li = value.length; i < li; i++) {
                    if (typeof value[i] != 'number') {
                        logError('wrong-property-value[]', layerId, key, value, i);
                        return getDefaultLayerPropertyValue(key);
                    }
                }

                return value;
            } else {
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        return value;

    case 'string':

        //validate line Layer enum
        if (key == 'line-style') {
            switch(value) {
            case 'solid':
            case 'texture': return value;
            default:
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        if (key == 'line-width-units') {
            switch(value) {
            case 'pixels':
            case 'meters':
            case 'ratio': return value;
            default:
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        //validate origin enum
        if (key == 'label-origin' || key == 'icon-origin') {
            switch(value) {
            case 'top-left':
            case 'top-right':
            case 'top-center':
            case 'center-left':
            case 'center-right':
            case 'center-center':
            case 'bottom-left':
            case 'bottom-right':
            case 'bottom-center':   return value;
            default:
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        //validate align enum
        if (key == 'label-align') {
            switch(value) {
            case 'left':
            case 'right':
            case 'center':  return value;
            default:
                logError('wrong-property-value', layerId, key, value);
                return getDefaultLayerPropertyValue(key);
            }
        }

        return value;

    case 'number':

        if (value > max || value < min) {
            logError('wrong-property-value', layerId, key, value);
            return getDefaultLayerPropertyValue(key);
        }

        return value;

    case 'boolean':
        return value;
    }
};


var validateLayerPropertyValue = function(layerId, key, value) {

    switch(key) {

    case 'inherit' :        return validateValue(layerId, key, value, 'string');
    case 'reduce':          return validateValue(layerId, key, value, 'object');
    case 'dynamic-reduce':  return validateValue(layerId, key, value, 'object');

    case 'line':              return validateValue(layerId, key, value, 'boolean');
    case 'line-flat':         return validateValue(layerId, key, value, 'boolean');
    case 'line-width':        return validateValue(layerId, key, value, 'number', null, 0.0001, Number.MAX_VALUE);
    case 'line-width-units':  return validateValue(layerId, key, value, 'string');
    case 'line-color':        return validateValue(layerId, key, value, 'object', 4, 0, 255);
    case 'line-style':        return validateValue(layerId, key, value, 'string');
    case 'line-style-texture':    return validateValue(layerId, key, value, 'object', 3, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'line-style-background': return validateValue(layerId, key, value, 'object', 4, 0, 255);

    case 'line-label':         return validateValue(layerId, key, value, 'boolean');
    case 'line-label-source':  return validateValue(layerId, key, value, 'string');
    case 'line-label-color':   return validateValue(layerId, key, value, 'object', 4, 0, 255);
    case 'line-label-color2':  return validateValue(layerId, key, value, 'object', 4, 0, 255);
    case 'line-label-size':    return validateValue(layerId, key, value, 'number', null, 0.0001, Number.MAX_VALUE);
    case 'line-label-offset':  return validateValue(layerId, key, value, 'number', null, -Number.MAX_VALUE, Number.MAX_VALUE);

    case 'point':        return validateValue(layerId, key, value, 'boolean');
    case 'point-flat':   return validateValue(layerId, key, value, 'boolean');
    case 'point-radius': return validateValue(layerId, key, value, 'number', null, 0.0001, Number.MAX_VALUE);
    case 'point-Layer':  return validateValue(layerId, key, value, 'string');

    case 'point-color':  return validateValue(layerId, key, value, 'object', 4, 0, 255);

    case 'icon':         return validateValue(layerId, key, value, 'boolean');
    case 'icon-source':  return validateValue(layerId, key, value, 'object', 5, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'icon-scale':   return validateValue(layerId, key, value, 'number', null, 0.0001, Number.MAX_VALUE);
    case 'icon-offset':  return validateValue(layerId, key, value, 'object', 2, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'icon-origin':  return validateValue(layerId, key, value, 'string');
    case 'icon-stick':   return validateValue(layerId, key, value, 'object', 7, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'icon-color':   return validateValue(layerId, key, value, 'object', 4, 0, 255);

    case 'label':            return validateValue(layerId, key, value, 'boolean');
    case 'label-color':      return validateValue(layerId, key, value, 'object', 4, 0, 255);
    case 'label-color2':     return validateValue(layerId, key, value, 'object', 4, 0, 255);
    case 'label-source':     return validateValue(layerId, key, value, 'string');
    case 'label-size':       return validateValue(layerId, key, value, 'number', null, 0.0001, Number.MAX_VALUE);
    case 'label-offset':     return validateValue(layerId, key, value, 'object', 2, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'label-origin':     return validateValue(layerId, key, value, 'string');
    case 'label-align':      return validateValue(layerId, key, value, 'string');
    case 'label-stick':      return validateValue(layerId, key, value, 'object', 7, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'label-width':      return validateValue(layerId, key, value, 'number', null, 0.0001, Number.MAX_VALUE);
    case 'label-no-overlap': return validateValue(layerId, key, value, 'boolean');
    case 'label-no-overlap-factor': return validateValue(layerId, key, value, 'object');
    case 'label-no-overlap-margin': return validateValue(layerId, key, value, 'object', 2, -Number.MAX_VALUE, Number.MAX_VALUE);

    case 'polygon':         return validateValue(layerId, key, value, 'boolean');
    case 'polygon-color':   return validateValue(layerId, key, value, 'object', 4, 0, 255);

    case 'z-index':        return validateValue(layerId, key, value, 'number', null, -Number.MAX_VALUE, Number.MAX_VALUE);
    case 'zbuffer-offset': return validateValue(layerId, key, value, 'object', 3, 0, Number.MAX_VALUE);

    case 'selected-hover-layer':  return validateValue(layerId, key, value, 'string');
    case 'selected-layer':  return validateValue(layerId, key, value, 'string');
    case 'hover-event':     return validateValue(layerId, key, value, 'boolean');
    case 'hover-layer':     return validateValue(layerId, key, value, 'string');
    case 'enter-event':     return validateValue(layerId, key, value, 'boolean');
    case 'leave-event':     return validateValue(layerId, key, value, 'boolean');
    case 'click-event':     return validateValue(layerId, key, value, 'boolean');
    case 'draw-event':      return validateValue(layerId, key, value, 'boolean');
    case 'advanced-hit':    return validateValue(layerId, key, value, 'boolean');
    case 'export-geometry': return validateValue(layerId, key, value, 'boolean');

    case 'visible':         return validateValue(layerId, key, value, 'boolean');
    case 'visibility':      return validateValue(layerId, key, value, 'number', null, 0.00001, Number.MAX_VALUE);
    case 'visibility-abs':  return validateValue(layerId, key, value, 'object', 2, 0.00001, Number.MAX_VALUE);
    case 'visibility-rel':  return validateValue(layerId, key, value, 'object', 4, 0.00001, Number.MAX_VALUE);

    case 'hysteresis':  return validateValue(layerId, key, value, 'object');
    case 'culling':     return validateValue(layerId, key, value, 'number', 180, 0.0001, 180);
    case 'next-pass':   return validateValue(layerId, key, value, 'object');

    }

    return value; //custom property
};


var getDefaultLayerPropertyValue = function(key) {
    switch(key) {
    case 'inherit':          return '';
    case 'filter':           return null;
    case 'reduce':           return null;
    case 'dynamic-reduce':   return null;

    case 'line':             return false;
    case 'line-flat':        return false;
    case 'line-width':       return 1;
    case 'line-width-units': return 'meters';
    case 'line-color':       return [255,255,255,255];
    case 'line-style':       return 'solid';
    case 'line-style-texture':    return null;
    case 'line-style-background': return [0,0,0,0];

    case 'line-label':         return false;
    case 'line-label-font':    return ['#default'];
    case 'line-label-color':   return [255,255,255,255];
    case 'line-label-color2':  return [0,0,0,255];
    case 'line-label-outline': return [0.27,0.75,2.2,2.2];
    case 'line-label-source':  return '$name';
    case 'line-label-size':    return 1;
    case 'line-label-offset':  return 0;

    case 'point':        return false;
    case 'point-flat':   return false;
    case 'point-radius': return 1;
    case 'point-Layer':  return 'solid';
    case 'point-color':  return [255,255,255,255];

    case 'icon':         return false;
    case 'icon-source':  return null;
    case 'icon-scale':   return 1;
    case 'icon-offset':  return [0,0];
    case 'icon-origin':  return 'bottom-center';
    case 'icon-stick':   return [0,0,0,255,255,255,255];
    case 'icon-color':   return [255,255,255,255];

    case 'label':            return false;
    case 'label-font':       return ['#default'];
    case 'label-color':      return [255,255,255,255];
    case 'label-color2':     return [0,0,0,255];
    case 'label-outline':    return [0.27,0.75,2.2,2.2];
    case 'label-source':     return '$name';
    case 'label-size':       return 10;
    case 'label-offset':     return [0,0];
    case 'label-origin':     return 'bottom-center';
    case 'label-align':      return 'center';
    case 'label-stick':      return [0,0,0,255,255,255,255];
    case 'label-width':      return 200;
    case 'label-no-overlap': return true;
    case 'label-no-overlap-factor': return null;
    case 'label-no-overlap-margin': return [5,5];
       
    case 'polygon':        return false;
    case 'polygon-color':  return [255,255,255,255];

    case 'z-index':        return 0;
    case 'zbuffer-offset': return [0,0,0];

    case 'selected-hover-layer':  return '';
    case 'selected-layer':  return '';
    case 'hover-event':     return false;
    case 'hover-layer':     return '';
    case 'enter-event':     return false;
    case 'leave-event':     return false;
    case 'click-event':     return false;
    case 'draw-event':      return false;
    case 'advanced-hit':    return false;
    case 'export-geometry': return false;

    case 'visible':        return true;
    case 'visibility':     return null;
    case 'visibility-abs': return null;
    case 'visibility-rel': return null;

    case 'hysteresis':      return null;
    case 'culling':         return 180;
    case 'next-pass':       return null;
    }
};


function getFilterResult(filter, feature, featureType, group, layer, key, lod, depth, fast) {
    var result, i, li;

    if (!filter || !Array.isArray(filter)) {
        return false;
    }

    if (depth > 100) {
        return false;
    }

    switch(filter[0]) {
    case 'all': 
        for (i = 1, li = filter.length; i < li; i++) {
            result = getFilterResult(filter[i], feature, featureType, group, layer, key, lod, depth + 1, fast);

            if (!result) {
                return false;
            }
        }
           
        return true;                         

    case 'any':
        for (i = 1, li = filter.length; i < li; i++) {
            result = getFilterResult(filter[i], feature, featureType, group, key, lod, depth + 1, fast);

            if (result) {
                return true;
            }
        }
           
        return false;                         

    case 'none':
        for (i = 1, li = filter.length; i < li; i++) {
            result = getFilterResult(filter[i], feature, featureType, group, key, lod, depth + 1, fast);

            if (result) {
                return false;
            }
        }
           
        return true;
                              
    case 'skip': return false; 
    }

    var value, value2;

    if (fast && filter[2]) {
        value = filter[1];
    } else {
        globals.disableLog = (filter[0] == 'has' || filter[0] == '!has');
        value = getLayerPropertyValueInner(layer, key, feature, lod, filter[1], 0);
        globals.disableLog = false;
    }

    switch(filter[0]) {
    case '==':
    case '!=':
    case '>=':
    case '<=':
    case '>':
    case '<':
        value2 = filter[fast ? 3 : 2];

        if (typeof value2 == 'undefined') {
            return false;
        }

        if (!(fast && filter[4])) {
            value2 = getLayerPropertyValueInner(layer, key, feature, lod, value2, 0);
        }

        break;
    }

    switch(filter[0]) {
    case '==': return (value == value2);
    case '!=': return (value != value2);
    case '>=': return (value >= value2);
    case '<=': return (value <= value2);
    case '>': return (value > value2);
    case '<': return (value < value2);
        
    case 'has': return (typeof value != 'undefined');
    case '!has': return (typeof value == 'undefined');
        
    case 'in':
        for (i = fast ? 3 : 2, li = filter.length; i < li; i++) {
            if (filter[i] == value) {
                return true;
            }
        } 
        return false;
        
    case '!in':
        for (i = fast ? 3 : 2, li = filter.length; i < li; i++) {
            if (filter[i] == value) {
                return false;
            }
        } 
        return true;
    }            

    return false;    
}


function isSimpleValue(value) {
    switch(typeof value) {
        case 'number':  return true;
        case 'string': 
            
            if (value.length > 0) {
                switch(value.charAt(0)) {
                    case '#': 
                    case '$':
                    case '@':
                    case '&':
                        break;
                    
                    default: 

                        if (value.indexOf('{') == -1) {
                            return true;
                        }

                        break;
                }
            } else {
                return true;
            }

            break;
    }

    return false;
}


function makeFasterFilter(filter) {
    if (!filter || !Array.isArray(filter)) {
        return filter;
    }

    var i, li, value, simple, result = [filter[0]];

    switch(filter[0]) {
    case 'all': 
    case 'any':
    case 'none':
    case 'skip':
        for (i = 1, li = filter.length; i < li; i++) {
            result[i] = makeFasterFilter(filter[i]);
        }

        return result;
    }

    result[1] = filter[1];
    result[2] = isSimpleValue(filter[1]);

    switch(filter[0]) {
    case '==':
    case '!=':
    case '>=':
    case '<=':
    case '>':
    case '<':
        result[3] = filter[2];
        result[4] = isSimpleValue(filter[2]);
        break;

    case 'in':
    case '!in':

        for (i = 2, li = filter.length; i < li; i++) {
            result[i+1] = filter[i];
        } 

    }

    return result;
}

var processLayer = function(layerId, layerData, stylesheetLayersData) {
    var layer = {}, key, value;

    //copy Layer and inherit Layer if needed
    copyLayer(layerId, layer, layerData, stylesheetLayersData);

    //replace constants and validate properties
    for (key in layer) {

        value = layer[key];

        //replace constant with value
        if ((typeof value) == 'string') {
            if (value.length > 0) {
                //is it constant?
                switch(value.charAt(0)) {
                    case '@':
                        if (globals.stylesheetConstants[value] != null) {
                            //replace constant with value
                            layer[key] = globals.stylesheetConstants[value];
                        } else {
                            logError('wrong-object', layerId, key, value, null, 'constant');

                            //replace constant with deafault value
                            layer[key] = getDefaultLayerPropertyValue(key);
                        }
                        break;

                    case '&':

                        if (globals.stylesheetVariables[value] != null) {
                            if (!layer['$$layer-variables']) {
                                layer['$$layer-variables'] = {};
                            }

                            layer['$$layer-variables'][key] = value;

                            //replace variable with value
                            layer[key] = globals.stylesheetVariables[value];

                        } else {
                            logError('wrong-object', layerId, key, value, null, 'variable');

                            //replace constant with deafault value
                            layer[key] = getDefaultLayerPropertyValue(key);
                        }
                        break;
                }
            }
        }
    }

    return layer;
};


var processStylesheet = function(stylesheetLayersData) {
    var key;
    globals.stylesheetBitmaps = {};
    globals.stylesheetFonts = {};
    globals.stylesheetConstants = stylesheetLayersData['constants'] || {};
    globals.stylesheetVariables = stylesheetLayersData['variables'] || {};

    //get bitmaps
    var bitmaps = stylesheetLayersData['bitmaps'] || {};

    //build map
    for (key in bitmaps) {
        var bitmap = bitmaps[key];
        //var skip = false;

        if ((typeof bitmap) == 'string') {
            bitmap = {'url':bitmap};
        } else if((typeof bitmap) == 'object'){
            if (bitmap['url'] == null) {
                logError('wrong-bitmap', key);
            }
        } else {
            logError('wrong-bitmap', key);
        }

        globals.stylesheetBitmaps[key] = bitmap;
    }

    //load bitmaps
    postMessage({'command':'loadBitmaps', 'bitmaps': globals.stylesheetBitmaps});


    //get fonts
    var fonts = stylesheetLayersData['fonts'] || {};

    //build map
    for (key in fonts) {
        var font = fonts[key];

        if ((typeof font) == 'string') {
            font = {'url':font};
        } else if((typeof font) == 'object'){
            if (font['url'] == null) {
                logError('wrong-font', key);
            }
        } else {
            logError('wrong-font', key);
        }

        globals.stylesheetFonts[key] = font;
    }

    //load fonts
    postMessage({'command':'loadFonts', 'fonts': globals.stylesheetFonts});


    //get layers
    globals.stylesheetData = {
        layers : {}
    };

    var layers = stylesheetLayersData['layers'] || {};

    globals.stylesheetLayers = globals.stylesheetData.layers;

    //process layers
    for (key in layers) {
        globals.stylesheetData.layers[key] = processLayer(key, layers[key], stylesheetLayersData);
    }
};


export {getFilterResult, processStylesheet, getLayer, getLayerPropertyValue, getLayerExpresionValue, getLayerPropertyValueInner, makeFasterFilter};
