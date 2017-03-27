//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var getLayer = function(layerId_, featureType_, index_) {
    var layer_ = stylesheetData_.layers_[layerId_];
    if (layer_ == null) {
        logError("wrong-Layer", layerId_, null, null, index_, featureType_);
        return {};
    } else {
        return layer_;
    }
};

var getLayerExpresionValue = function(layer_, value_, feature_, lod_) {

    switch(typeof value_) {
        case "string":

            if (value_.length > 0) {
                //is it feature property?
                switch (value_.charAt(0)) {

                    case "$":
                        var finalValue_ = feature_.properties_[value_.substr(1)];
                        if (typeof finalValue_ == "undefined") {
                            logError("wrong-expresion", layer_["$$layer-id"], value_, value_, null, "feature-property");
                        }
                        
                        return finalValue_;
                }
            }

            break;
    }
    
    return value_;
};

var getLayerPropertyValue = function(layer_, key_, feature_, lod_) {
    var value_ = layer_[key_];

    switch(typeof value_) {
        case "string":

            if (value_.length > 0) {
                //is it feature property?
                if (value_.charAt(0) == "$") {
                    var finalValue_ = feature_.properties_[value_.substr(1)];
                    if (finalValue_ != null) {
                        return finalValue_;
                    } else {
                        logError("wrong-object", layer_["$$layer-id"], key_, value_, null, "feature-property");
                        getDefaultLayerPropertyValue(key_);
                    }
                }
            }

            return value_;

            break;

        case "object":

            //is it null?
            if (value_ == null) {
                return getDefaultLayerPropertyValue(key_);
            }

            //is it array (rgb, rgba, vec2)?
            if (Array.isArray(value_) == true) {

                if (key_ == "icon-source" && stylesheetBitmaps_[value_[0]] == null) {
                    logError("wrong-object", layer_["$$layer-id"], key_, value_, null, "bitmap");
                    return getDefaultLayerPropertyValue(key_);
                }

                return value_;
            }

            //debugger

            var stops_ = null;
            var lodScaledArray_ = null;

            if (value_["lod-scaled"] != null) {
                var array_ = value_["lod-scaled"];

                if ((typeof array_[1]) == "number") {
                    return array_[1] * Math.pow(2*array_[2], array_[0] - lod_);
                }

                stops_ = array_[1];
                lodScaledArray_ = array_;

            } else {
                stops_ = value_["discrete"] || value_["linear"];
            }

            var lastLod_ = stops_[0][0];
            var lastValue_ = stops_[0][1];
            var valueType_ = (typeof lastValue_);
            var newValue_ = lastValue_;

            for (var i = 0, li = stops_.length; i <= li; i++) {

                if (i == li) {
                    newValue_ = lastValue_;
                    break;
                }

                if (stops_[i][0] > lod_) {

                    if (value_["discrete"] != null || lodScaledArray_ != null) { //no interpolation
                        newValue_ = lastValue_;
                        break;
                    } else { //interpolate

                        currentLod_ = stops_[i][0];
                        currentValue_ = stops_[i][1];

                        if (currentLod_ == lastLod_) { //end of array no interpolation needed
                            break;
                        }

                        switch(valueType_) {

                            case "boolean":
                                lastValue_ = lastValue_ ? 1 : 0;
                                currentValue_ = lastValue_ ? 1 : 0;
                                var newValue_ = lastValue_ + (currentValue_ - lastValue_) * ((lod_ - lastLod_) / (currentLod_ - lastLod_));

                                newValue_ = newValue_ > 0.5 ? true : false;
                                break;

                            case "number":

                                //debugger
                                var newValue_ = lastValue_ + (currentValue_ - lastValue_) * ((lod_ - lastLod_) / (currentLod_ - lastLod_));
                                break;

                            case "object":
                                var newValue_ = [];

                                for (var j = 0, lj= lastValue_.length; j < lj; j++) {
                                    newValue_[j] = lastValue_[j] + (currentValue_[j] - lastValue_[j]) * ((lod_ - lastLod_) / (currentLod_ - lastLod_));
                                }

                                break;
                        }

                        break;
                    }
                }

                lastLod_ = stops_[i][0];
                lastValue_ = stops_[i][1];
            }

            if (lodScaledArray_ != null) {
                newValue_ *= Math.pow(2*lodScaledArray_[2], lodScaledArray_[0] - lod_);
            }

            return newValue_;

            break;

        case "number":
        case "boolean":
            return value_;
    }

    return getDefaultLayerPropertyValue(key_);
};

var inheritLayer = function(layerId_, layer_, layerData_, stylesheetLayersData_, depth_) {
    if (depth_ > 100) {
        logError("custom", "infinite inherit loop in Layer: " + layerId_);
        return;
    }

    //do we need inherite Layer?
    if (layerData_["inherit"] != null) {
        //get inherited Layer
        var LayerToInherit_ = stylesheetLayersData_["layers"][layerData_["inherit"]];

        if (LayerToInherit_ != null) {

            if (LayerToInherit_["inherit"] != null) {
                inheritLayer(layerData_["inherit"], layer_, LayerToInherit_, stylesheetLayersData_, depth_++);
            }

            //copy inherited Layer properties
            for (var key_ in LayerToInherit_) {
                layer_[key_] = LayerToInherit_[key_];
            }
        } else {
            logError("wrong-object", layerId_, "inherit", LayerToInherit_, "Layer");
            return getDefaultLayerPropertyValue(key_);
        }
    }

};

var copyLayer = function(layerId_, layer_, layerData_, stylesheetLayersData_) {
    //do we need inherite Layer?
    if (layerData_["inherit"] != null) {
        inheritLayer(layerId_, layer_, layerData_, stylesheetLayersData_, 0);
    }

    //copy Layer properties
    //if inherited properties are present then they will be overwriten
    for (var key_ in layerData_) {
        layer_[key_] = layerData_[key_];
    }

    //store layer id
    layer_["$$layer-id"] = layerId_;
};

var logError = function(errorType_, layerId_, key_, value_, index_, subkey_) {
    if ((typeof value_) == "object") {
        value_ = JSON.stringify(value_);
    }
    
    var str_ = null;

    switch(errorType_) {
        case "wrong-property-value":
            str_ = "Error: wrong layer property " + (subkey_ ? ("'" + subkey_ + "'") : "") + ": " + layerId_ + "." + key_ + " = " + value_;
            break;

        case "wrong-property-value[]":
            str_ = "Error: wrong layer property " + (subkey_ ? ("'" + subkey_ + "'") : "") + "["+index_+"]: " + layerId_ + "." + key_ + " = " + value_;
            break;

        case "wrong-object":
            str_ = "Error: reffered "+ subkey_ + " does not exist: " + layerId_ + "." + key_ + " = " + value_;
            break;

        case "wrong-object[]":
            str_ = "Error: reffered "+ subkey_ + " does not exist: " + layerId_ + "." + key_ + "["+index_+"] = " + value_;
            break;

        case "wrong-Layer":
            str_ = "Error: reffered "+ subkey_ + " Layer does not exist: " + subkey_ + "["+index_+"].Layer = " + layerId_;
            break;

        case "wrong-bitmap":
            str_ = "Error: wrong definition of bitmap: " + layerId_;
            break;

        case "custom":
            str_ = "Error: " + layerId_;
            break;
    }
    
    if (str_) {
        console.log(str_);
    }
};

var validateValue = function(layerId_, key_, value_, type_, arrayLength_, min_, max_) {
    //check interpolator
    if (value_ != null && (typeof value_) == "object" && (value_["discrete"] != null || value_["linear"] != null || value_["lod-scaled"] != null)) {

        var stops_ = null;
        var lodScaled_ = false;

        if (value_["lod-scaled"] != null) {

            var array_ = value_["lod-scaled"];

            if (!((typeof array_) == "object" && Array.isArray(array_) && array_.length >= 2)) {
                logError("wrong-property-value", layerId_, key_, value_, null, "[]");
                return getDefaultLayerPropertyValue(key_);
            }

            if (array_[2] == null) {
                array_[2] = 1;
            }

            if (!((typeof array_[0]) == "number" && (typeof array_[2]) == "number")) {
                logError("wrong-property-value", layerId_, key_, value_, null, "[]");
                return getDefaultLayerPropertyValue(key_);
            }

            if ((typeof array_[1]) == "number") {
                return value_;
            }

            stops_ = array_[1];
            lodScaled_ = true;

        } else {
            stops_ = value_["discrete"] || value_["linear"];
        }

        //if stops exist then check if they are array
        if (stops_ == null || !((typeof stops_) == "object" && Array.isArray(stops_) && stops_.length > 0)) {
            logError("wrong-property-value", layerId_, key_, value_, null, "[]");
            return getDefaultLayerPropertyValue(key_);
        }


        //validate stops values
        if (stops_ != null) {
            var stopsValueType_ = null;

            for (var i = 0, li = stops_.length; i < li; i++) {
                var stopItem_ = stops_[i];

                //is stop array[2]?
                if(!(stopItem_ != null && (typeof stopItem_) == "object" && Array.isArray(stopItem_) && stopItem_.length != 2)) {

                    //store fist stop type
                    if (stopsValueType_ == null) {
                        stopsValueType_ = typeof stopItem_[1];

                        if (lodScaled_ == true && stopsValueType_ != "number") {
                            logError("wrong-property-value[]", layerId_, key_, value_, i, "[]");
                            return getDefaultLayerPropertyValue(key_);
                        }
                    }

                    //check lod value and type of value
                    if(!((typeof stopItem_[0]) == "number" && (typeof stopItem_[1]) == stopsValueType_)) {
                        logError("wrong-property-value[]", layerId_, key_, value_, i, "[]");
                        return getDefaultLayerPropertyValue(key_);
                    }

                    //check number value
                    if (stopsValueType_ == "number") {
                        if (stopItem_[1] > max_ || stopItem_[1] < min_) {
                            logError("wrong-property-value[]", layerId_, key_, value_, i, "[]");
                            return getDefaultLayerPropertyValue(key_);
                        }
                    }
                }
            }
        }


        return value_;
    }

    //console.log("validate."+layerId_+"."+key_+"."+value_);

    //check value type
    if ((typeof value_) != type_) {
        //check for exceptions
        if (!(value_ === null && (key_ == "icon-source" || key_ == "visibility"))) {
            logError("wrong-property-value", layerId_, key_, value_);
            return getDefaultLayerPropertyValue(key_);
        }
    }

    //check value
    switch(typeof value_) {

        case "object":

            //accepted cases for null value
            if (value_ === null && (key_ == "line-style-texture" || key_ == "icon-source" || key_ == "visibility" || key_ == "next-pass")) {
                return value_;
            }

            //check multipasss
            if (key_ == "next-pass") {
                if (Array.isArray(value_) == true && value_.length > 0) {

                    for (var i = 0; i < li; i++) {
                        var valueItem_ = value_[i];

                        if (typeof valueItem_ == "object" &&
                            Array.isArray(valueItem_) == true &&
                            valueItem_.length == 2 &&
                            typeof valueItem_[0] == "number" &&
                            typeof valueItem_[1] == "string") {

                            if (stylesheetLayersData_["layers"][valueItem_[1]] == null) {

                            }

                        } else {
                            logError("wrong-property-value[]", layerId_, key_, value_, i);
                            return getDefaultLayerPropertyValue(key_);
                        }
                    }

                } else {
                    logError("wrong-property-value", layerId_, key_, value_);
                    return getDefaultLayerPropertyValue(key_);
                }
            }

            //check array
            if (arrayLength_ != null) {
                if (Array.isArray(value_) == true && value_.length == arrayLength_) {

                    //validate array values
                    var i = 0;

                    if (key_ == "icon-source" || key_ == "line-style-texture") {
                        if (typeof value_[0] != "string") {
                            logError("wrong-property-value[]", layerId_, key_, value_, 0);
                            return getDefaultLayerPropertyValue(key_);
                        }

                        if (stylesheetBitmaps_[value_[0]] == null) {
                            logError("wrong-object", layerId_, key_, value_, null, "bitmap");
                            return getDefaultLayerPropertyValue(key_);
                        }

                        i = 1;
                    }

                    for (li = value_.length; i < li; i++) {
                        if (typeof value_[i] != "number") {
                            logError("wrong-property-value[]", layerId_, key_, value_, i);
                            return getDefaultLayerPropertyValue(key_);
                        }
                    }

                    return value_;
                } else {
                    logError("wrong-property-value", layerId_, key_, value_);
                    return getDefaultLayerPropertyValue(key_);
                }
            }

            return value_;

        case "string":

            //validate line Layer enum
            if (key_ == "line-style") {
                switch(value_) {
                    case "solid":
                    case "texture": return value_;
                    default:
                        logError("wrong-property-value", layerId_, key_, value_);
                        return getDefaultLayerPropertyValue(key_);
                }
            }

            //validate origin enum
            if (key_ == "label-origin" || key_ == "icon-origin") {
                switch(value_) {
                    case "top-left":
                    case "top-right":
                    case "top-center":
                    case "center-left":
                    case "center-right":
                    case "center-center":
                    case "bottom-left":
                    case "bottom-right":
                    case "bottom-center":   return value_;
                    default:
                        logError("wrong-property-value", layerId_, key_, value_);
                        return getDefaultLayerPropertyValue(key_);
                }
            }

            //validate align enum
            if (key_ == "label-align") {
                switch(value_) {
                    case "left":
                    case "right":
                    case "center":  return value_;
                    default:
                        logError("wrong-property-value", layerId_, key_, value_);
                        return getDefaultLayerPropertyValue(key_);
                }
            }

            return value_;

        case "number":

            //console.log("num2");

            if (value_ > max_ || value_ < min_) {
                logError("wrong-property-value", layerId_, key_, value_);
                return getDefaultLayerPropertyValue(key_);
            }

            //console.log("num3");

            return value_;

        case "boolean":
            return value_;
    }

};

var validateLayerPropertyValue = function(layerId_, key_, value_) {
    //console.log("vall:"+layerId_+"."+key_+"."+value_);
    //debugger;

    switch(key_) {
       //case "filter" :    return validateValue(layerId_, key_, value_, "string"); break;

       case "inherit" :    return validateValue(layerId_, key_, value_, "string"); break;

       case "line":        return validateValue(layerId_, key_, value_, "boolean"); break;
       case "line-flat":   return validateValue(layerId_, key_, value_, "boolean"); break;
       case "line-width":  return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "line-color":  return validateValue(layerId_, key_, value_, "object", 4, 0, 255); break;
       case "line-style":  return validateValue(layerId_, key_, value_, "string"); break;
       case "line-style-texture":    return validateValue(layerId_, key_, value_, "object", 3, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "line-style-background": return validateValue(layerId_, key_, value_, "object", 4, 0, 255); break;

       case "line-label":         return validateValue(layerId_, key_, value_, "boolean"); break;
       case "line-label-source":  return validateValue(layerId_, key_, value_, "string"); break;
       case "line-label-color":   return validateValue(layerId_, key_, value_, "object", 4, 0, 255); break;
       case "line-label-size":    return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "line-label-offset":  return validateValue(layerId_, key_, value_, "number", null, -Number.MAX_VALUE, Number.MAX_VALUE); break;

       case "point":        return validateValue(layerId_, key_, value_, "boolean"); break;
       case "point-flat":   return validateValue(layerId_, key_, value_, "boolean"); break;
       case "point-radius": return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "point-Layer":  return validateValue(layerId_, key_, value_, "string"); break;

       case "point-color":  return validateValue(layerId_, key_, value_, "object", 4, 0, 255); break;

       case "icon":         return validateValue(layerId_, key_, value_, "boolean"); break;
       case "icon-source":  return validateValue(layerId_, key_, value_, "object", 5, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-scale":   return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "icon-offset":  return validateValue(layerId_, key_, value_, "object", 2, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-origin":  return validateValue(layerId_, key_, value_, "string"); break;
       case "icon-stick":   return validateValue(layerId_, key_, value_, "object", 7, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-color":   return validateValue(layerId_, key_, value_, "object", 4, 0, 255); break;

       case "label":         return validateValue(layerId_, key_, value_, "boolean"); break;
       case "label-color":   return validateValue(layerId_, key_, value_, "object", 4, 0, 255); break;
       case "label-source":  return validateValue(layerId_, key_, value_, "string"); break;
       case "label-size":    return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "label-offset":  return validateValue(layerId_, key_, value_, "object", 2, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "label-origin":  return validateValue(layerId_, key_, value_, "string"); break;
       case "label-align":   return validateValue(layerId_, key_, value_, "string"); break;
       case "label-stick":   return validateValue(layerId_, key_, value_, "object", 7, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "label-width":   return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;

       case "polygon":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "polygon-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "z-index":        return validateValue(layerId_, key_, value_, "number", null, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "zbuffer-offset": return validateValue(layerId_, key_, value_, "object", 3, 0, Number.MAX_VALUE); break;

       case "hover-event":  return validateValue(layerId_, key_, value_, "boolean"); break;
       case "hover-layer":  return validateValue(layerId_, key_, value_, "string"); break;
       case "enter-event":  return validateValue(layerId_, key_, value_, "boolean"); break;
       case "leave-event":  return validateValue(layerId_, key_, value_, "boolean"); break;
       case "click-event":  return validateValue(layerId_, key_, value_, "boolean"); break;
       case "draw-event":   return validateValue(layerId_, key_, value_, "boolean"); break;

       case "visible":     return validateValue(layerId_, key_, value_, "boolean"); break;
       case "visibility":  return validateValue(layerId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "culling":     return validateValue(layerId_, key_, value_, "number", 180, 0.0001, 180); break;
       case "next-pass":   return validateValue(layerId_, key_, value_, "object"); break;
    }

    return value_; //custom property
};

var getDefaultLayerPropertyValue = function(key_) {
    switch(key_) {
       case "filter": return null;

       case "inherit": return "";

       case "line":       return false;
       case "line-flat":  return false;
       case "line-width": return 1;
       case "line-color": return [255,255,255,255];
       case "line-style": return "solid";
       case "line-style-texture":    return null;
       case "line-style-background": return [0,0,0,0];

       case "line-label":        return false;
       case "line-label-color":  return [255,255,255,255];
       case "line-label-source": return "$name";
       case "line-label-size":   return 1;
       case "line-label-offset": return 0;

       case "point":        return false;
       case "point-flat":   return false;
       case "point-radius": return 1;
       case "point-Layer":  return "solid";
       case "point-color":  return [255,255,255,255];

       case "icon":         return false;
       case "icon-source":  return null;
       case "icon-scale":   return 1;
       case "icon-offset":  return [0,0];
       case "icon-origin":  return "bottom-center";
       case "icon-stick":   return [0,0,0,255,255,255,255];
       case "icon-color":   return [255,255,255,255];

       case "label":         return false;
       case "label-color":   return [255,255,255,255];
       case "label-source":  return "$name";
       case "label-size":    return 10;
       case "label-offset":  return [0,0];
       case "label-origin":  return "bottom-center";
       case "label-align":   return "center";
       case "label-stick":   return [0,0,0,255,255,255,255];
       case "label-width":   return 200;
       
       case "polygon":        return false;
       case "polygon-color":  return [255,255,255,255];

       case "z-index":        return 0;
       case "zbuffer-offset": return [0,0,0];

       case "hover-event": return false;
       case "hover-layer": return "";
       case "enter-event": return false;
       case "leave-event": return false;
       case "click-event": return false;
       case "draw-event":  return false;

       case "visible":    return true;
       case "visibility": return 0;
       case "culling":    return 180;
       case "next-pass":  return null;
    }
};

function getFilterResult(filter_, feature_, featureType_, group_) {
    if (!filter_ || !Array.isArray(filter_)) {
        return false;
    }

    switch(filter_[0]) {
        case "all": 
            var result_ = true;
            for (var i = 1, li = filter_.length; i < li; i++) {
                result_ = result_ && getFilterResult(filter_[i], feature_, featureType_, group_);
            }
           
            return result_;                         

        case "any":
            var result_ = false;
            for (var i = 1, li = filter_.length; i < li; i++) {
                result_ = result_ || getFilterResult(filter_[i], feature_, featureType_, group_);
            }
           
            return result_;                         

        case "none":
            var result_ = true;
            for (var i = 1, li = filter_.length; i < li; i++) {
                result_ = result_ && getFilterResult(filter_[i], feature_, featureType_, group_);
            }
           
            return (!result_);                         
                              
        case "skip": return false; 
    }

    var value_;

    switch(filter_[1]) {
        case "#type":  value_ = featureType_; break;   
        case "#group": value_ = group_;       break;
        default:   
            var filterValue_ = filter_[1];  

            if (filterValue_ && filterValue_.length > 0) {
                //is it feature property?
                switch (filterValue_.charAt(0)) {
                    case "$": value_ = feature_.properties_[filterValue_.substr(1)]; break;
                    case "@": value_ = stylesheetConstants_[filterValue_]; break;
                    default:
                        value_ = feature_.properties_[filterValue_]; //fallback for old format
                }
            }
    }

    switch(filter_[0]) {
        case "==": return (value_ == filter_[2]);
        case "!=": return (value_ != filter_[2]);
        case ">=": return (value_ >= filter_[2]);
        case "<=": return (value_ <= filter_[2]);
        case ">": return (value_ > filter_[2]);
        case "<": return (value_ < filter_[2]);
        
        case "has": return (typeof value_ != "undefined");
        case "!has": return (typeof value_ == "undefined");
        
        case "in":
            for (var i = 2, li = filter_.length; i < li; i++) {
                if (filter_[i] == value_) {
                    return true;
                }
            } 
            return false;
        
        case "!in":
            for (var i = 2, li = filter_.length; i < li; i++) {
                if (filter_[i] == value_) {
                    return false;
                }
            } 
            return true;
    }            

    return false;    
};

var processLayer = function(layerId_, layerData_, stylesheetLayersData_) {
    var layer_ = {};

    //copy Layer and inherit Layer if needed
    copyLayer(layerId_, layer_, layerData_, stylesheetLayersData_);

    //console.log(JSON.stringify(layer_));

    //replace constants and validate properties
    for (var key_ in layer_) {

        var value_ = layer_[key_];

        //replace constant with value
        if ((typeof value_) == "string") {
            if (value_.length > 0) {
                //is it constant?
                if (value_.charAt(0) == "@") {
                    if (stylesheetConstants_[value_] != null) {
                        //replace constant with value
                        layer_[key_] = stylesheetConstants_[value_];
                    } else {
                        logError("wrong-object", layerId_, key_, value_, null, "constant");

                        //replace constant with deafault value
                        layer_[key_] = getDefaultLayerPropertyValue(key_);
                    }
                }
            }
        }

        //console.log("process."+layerId_+"."+key_+"."+value_);
        //console.log("out1: "+JSON.stringify(layer_[key_]));

        layer_[key_] = validateLayerPropertyValue(layerId_, key_, layer_[key_]);

        //console.log("out2: "+JSON.stringify(layer_[key_]));
    }

    return layer_;
};

var processStylesheet = function(stylesheetLayersData_) {
    stylesheetBitmaps_ = {};
    stylesheetConstants_ = stylesheetLayersData_["constants"] || {};

    //get bitmaps
    var bitmaps_ = stylesheetLayersData_["bitmaps"] || {};

    //build map
    for (var key_ in bitmaps_) {
        var bitmap_ = bitmaps_[key_];
        var skip_ = false;

        if ((typeof bitmap_) == "string") {
            bitmap_ = {"url":bitmap_};
        } else if((typeof bitmap_) == "object"){
            if (bitmap_["url"] == null) {
                logError("wrong-bitmap", key_);
            }
        } else {
            logError("wrong-bitmap", key_);
        }

        if (skip_ != true) {
            stylesheetBitmaps_[key_] = bitmap_;
        }
    }

    //load bitmaps
    postMessage({"command":"loadBitmaps", "bitmaps": stylesheetBitmaps_});

    //get layers
    stylesheetData_ = {
        layers_ : {}
    };

    var layers_ = stylesheetLayersData_["layers"] || {};

    //console.log(JSON.stringify(Layers_));

    stylesheetLayers_ = stylesheetData_.layers_;

    //process layers
    for (var key_ in layers_) {
        stylesheetData_.layers_[key_] = processLayer(key_, layers_[key_], stylesheetLayersData_);

        //console.log(JSON.stringify(stylesheetData_.layers_[key_]));
    }
};


