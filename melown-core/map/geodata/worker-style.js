//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var getStyle = function(styleId_, featureType_, index_) {
    var style_ = layerStyles_.styles_[styleId_];
    if (style_ == null) {
        logError("wrong-style", styleId_, null, null, index_, featureType_);
        return {};
    } else {
        return style_;
    }
};

var getStylePropertyValue = function(style_, key_, feature_, lod_) {

    var value_ = style_[key_];

    switch(typeof value_) {
        case "string":

            if (value_.length > 0) {
                //is it feature property?
                if (value_.charAt(0) == "$") {
                    var finalValue_ = feature_[value_.substr(1)];
                    if (finalValue_ != null) {
                        return finalValue_;
                    } else {
                        logError("wrong-object", style_["$$style-id"], key_, value_, null, "feature-property");
                        getDefaultStylePropertyValue(key_);
                    }
                }
            }

            return value_;

            break;

        case "object":

            //is it null?
            if (value_ == null) {
                return getDefaultStylePropertyValue(key_);
            }

            //is it array (rgb, rgba, vec2)?
            if (Array.isArray(value_) == true) {

                if (key_ == "icon-source" && layerBitmaps_[value_[0]] == null) {
                    logError("wrong-object", style_["$$style-id"], key_, value_, null, "bitmap");
                    return getDefaultStylePropertyValue(key_);
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

    return getDefaultStylePropertyValue(key_);
};

var inheritStyle = function(styleId_, style_, styleData_, layerStylesData_, depth_) {

    if (depth_ > 100) {
        logError("custom", "infinite inherit loop in style: " + styleId_);
        return;
    }

    //do we need inherite style?
    if (styleData_["inherit"] != null) {
        //get inherited style
        var styleToInherit_ = layerStylesData_["styles"][styleData_["inherit"]];

        if (styleToInherit_ != null) {

            if (styleToInherit_["inherit"] != null) {
                inheritStyle(styleData_["inherit"], style_, styleToInherit_, layerStylesData_, depth_++);
            }

            //copy inherited style properties
            for (var key_ in styleToInherit_) {
                style_[key_] = styleToInherit_[key_];
            }
        } else {
            logError("wrong-object", styleId_, "inherit", styleToInherit_, "style");
            return getDefaultStylePropertyValue(key_);
        }
    }

};

var copyStyle = function(styleId_, style_, styleData_, layerStylesData_) {

    //do we need inherite style?
    if (styleData_["inherit"] != null) {
        inheritStyle(styleId_, style_, styleData_, layerStylesData_, 0);

        /*
        //get inherited style
        var styleToInherit_ = layerStylesData_["styles"][styleData_["inherit"]];

        if (styleToInherit_ != null) {
            //copy inherited style properties
            for (var key_ in styleToInherit_) {
                style_[key_] = styleToInherit_[key_];
            }
        } else {
            logError("wrong-object", styleId_, "inherit", styleToInherit_, "style");
            return getDefaultStylePropertyValue(key_);
        }*/
    }

    //copy style properties
    //if inherited properties are present then they will be overwriten
    for (var key_ in styleData_) {
        style_[key_] = styleData_[key_];
    }

    //store style id
    style_["$$style-id"] = styleId_;
};

var logError = function(errorType_, styleId_, key_, value_, index_, subkey_) {
    if ((typeof value_) == "object") {
        value_ = JSON.stringify(value_);
    }

    switch(errorType_) {
        case "wrong-property-value":
            console.log("Error: wrong style property " + (subkey_ ? ("'" + subkey_ + "'") : "") + ": " + styleId_ + "." + key_ + " = " + value_);
            break;

        case "wrong-property-value[]":
            console.log("Error: wrong style property " + (subkey_ ? ("'" + subkey_ + "'") : "") + "["+index_+"]: " + styleId_ + "." + key_ + " = " + value_);
            break;

        case "wrong-object":
            console.log("Error: reffered "+ subkey_ + " does not exist: " + styleId_ + "." + key_ + " = " + value_);
            break;

        case "wrong-object[]":
            console.log("Error: reffered "+ subkey_ + " does not exist: " + styleId_ + "." + key_ + "["+index_+"] = " + value_);
            break;

        case "wrong-style":
            console.log("Error: reffered "+ subkey_ + " style does not exist: " + subkey_ + "["+index_+"].style = " + styleId_);
            break;

        case "wrong-bitmap":
            console.log("Error: wrong definition of bitmap: " + styleId_);
            break;

        case "custom":
            console.log("Error: " + styleId_);
            break;
    }
};

var validateValue = function(styleId_, key_, value_, type_, arrayLength_, min_, max_) {

    //check interpolator
    if (value_ != null && (typeof value_) == "object" && (value_["discrete"] != null || value_["linear"] != null || value_["lod-scaled"] != null)) {

        var stops_ = null;
        var lodScaled_ = false;

        if (value_["lod-scaled"] != null) {

            var array_ = value_["lod-scaled"];

            if (!((typeof array_) == "object" && Array.isArray(array_) && array_.length >= 2)) {
                logError("wrong-property-value", styleId_, key_, value_, null, "[]");
                return getDefaultStylePropertyValue(key_);
            }

            if (array_[2] == null) {
                array_[2] = 1;
            }

            if (!((typeof array_[0]) == "number" && (typeof array_[2]) == "number")) {
                logError("wrong-property-value", styleId_, key_, value_, null, "[]");
                return getDefaultStylePropertyValue(key_);
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
            logError("wrong-property-value", styleId_, key_, value_, null, "[]");
            return getDefaultStylePropertyValue(key_);
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
                            logError("wrong-property-value[]", styleId_, key_, value_, i, "[]");
                            return getDefaultStylePropertyValue(key_);
                        }
                    }

                    //check lod value and type of value
                    if(!((typeof stopItem_[0]) == "number" && (typeof stopItem_[1]) == stopsValueType_)) {
                        logError("wrong-property-value[]", styleId_, key_, value_, i, "[]");
                        return getDefaultStylePropertyValue(key_);
                    }

                    //check number value
                    if (stopsValueType_ == "number") {
                        if (stopItem_[1] > max_ || stopItem_[1] < min_) {
                            logError("wrong-property-value[]", styleId_, key_, value_, i, "[]");
                            return getDefaultStylePropertyValue(key_);
                        }
                    }
                }
            }
        }


        return value_;
    }

    //console.log("validate."+styleId_+"."+key_+"."+value_);

    //check value type
    if ((typeof value_) != type_) {
        //check for exceptions
        if (!(value_ === null && (key_ == "icon-source" || key_ == "visibility"))) {
            logError("wrong-property-value", styleId_, key_, value_);
            return getDefaultStylePropertyValue(key_);
        }
    }

    //check value
    switch(typeof value_) {

        case "object":

            //accepted cases for null value
            if (value_ === null && (key_ == "line-style-texture" || key_ == "icon-source" || key_ == "visibility" || key_ == "multi-pass")) {
                return value_;
            }

            //check multipasss
            if (key_ == "multi-pass") {
                if (Array.isArray(value_) == true && value_.length > 0) {

                    for (var i = 0; i < li; i++) {
                        var valueItem_ = value_[i];

                        if (typeof valueItem_ == "object" &&
                            Array.isArray(valueItem_) == true &&
                            valueItem_.length == 2 &&
                            typeof valueItem_[0] == "number" &&
                            typeof valueItem_[1] == "string") {

                            if (layerStylesData_["styles"][valueItem_[1]] == null) {

                            }

                        } else {
                            logError("wrong-property-value[]", styleId_, key_, value_, i);
                            return getDefaultStylePropertyValue(key_);
                        }
                    }

                } else {
                    logError("wrong-property-value", styleId_, key_, value_);
                    return getDefaultStylePropertyValue(key_);
                }
            }

            //check array
            if (arrayLength_ != null) {
                if (Array.isArray(value_) == true && value_.length == arrayLength_) {

                    //validate array values
                    var i = 0;

                    if (key_ == "icon-source" || key_ == "line-style-texture") {
                        if (typeof value_[0] != "string") {
                            logError("wrong-property-value[]", styleId_, key_, value_, 0);
                            return getDefaultStylePropertyValue(key_);
                        }

                        if (layerBitmaps_[value_[0]] == null) {
                            logError("wrong-object", styleId_, key_, value_, null, "bitmap");
                            return getDefaultStylePropertyValue(key_);
                        }

                        i = 1;
                    }

                    for (li = value_.length; i < li; i++) {
                        if (typeof value_[i] != "number") {
                            logError("wrong-property-value[]", styleId_, key_, value_, i);
                            return getDefaultStylePropertyValue(key_);
                        }
                    }

                    return value_;
                } else {
                    logError("wrong-property-value", styleId_, key_, value_);
                    return getDefaultStylePropertyValue(key_);
                }
            }

            return value_;

        case "string":

            //validate line style enum
            if (key_ == "line-style") {
                switch(value_) {
                    case "solid":
                    case "texture": return value_;
                    default:
                        logError("wrong-property-value", styleId_, key_, value_);
                        return getDefaultStylePropertyValue(key_);
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
                        logError("wrong-property-value", styleId_, key_, value_);
                        return getDefaultStylePropertyValue(key_);
                }
            }

            //validate align enum
            if (key_ == "label-align") {
                switch(value_) {
                    case "left":
                    case "right":
                    case "center":  return value_;
                    default:
                        logError("wrong-property-value", styleId_, key_, value_);
                        return getDefaultStylePropertyValue(key_);
                }
            }

            return value_;

        case "number":

            //console.log("num2");

            if (value_ > max_ || value_ < min_) {
                logError("wrong-property-value", styleId_, key_, value_);
                return getDefaultStylePropertyValue(key_);
            }

            //console.log("num3");

            return value_;

        case "boolean":
            return value_;
    }

};

var validateStylePropertyValue = function(styleId_, key_, value_) {

    //console.log("vall:"+styleId_+"."+key_+"."+value_);
    //debugger;

    switch(key_) {
       case "inherit" :    return validateValue(styleId_, key_, value_, "string"); break;

       case "line":        return validateValue(styleId_, key_, value_, "boolean"); break;
       case "line-flat":   return validateValue(styleId_, key_, value_, "boolean"); break;
       case "line-width":  return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "line-color":  return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;
       case "line-style":  return validateValue(styleId_, key_, value_, "string"); break;
       case "line-style-texture":    return validateValue(styleId_, key_, value_, "object", 3, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "line-style-background": return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "line-label":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "line-label-source":  return validateValue(styleId_, key_, value_, "string"); break;
       case "line-label-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;
       case "line-label-size":    return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "line-label-offset":  return validateValue(styleId_, key_, value_, "number", null, -Number.MAX_VALUE, Number.MAX_VALUE); break;

       case "point":        return validateValue(styleId_, key_, value_, "boolean"); break;
       case "point-flat":   return validateValue(styleId_, key_, value_, "boolean"); break;
       case "point-radius": return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "point-style":  return validateValue(styleId_, key_, value_, "string"); break;

       case "point-color":  return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "icon":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "icon-source":  return validateValue(styleId_, key_, value_, "object", 5, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-scale":   return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "icon-offset":  return validateValue(styleId_, key_, value_, "object", 2, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "icon-origin":  return validateValue(styleId_, key_, value_, "string"); break;
       case "icon-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;

       case "label":         return validateValue(styleId_, key_, value_, "boolean"); break;
       case "label-color":   return validateValue(styleId_, key_, value_, "object", 4, 0, 255); break;
       case "label-source":  return validateValue(styleId_, key_, value_, "string"); break;
       case "label-size":    return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "label-offset":  return validateValue(styleId_, key_, value_, "object", 2, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "label-origin":  return validateValue(styleId_, key_, value_, "string"); break;
       case "label-align":   return validateValue(styleId_, key_, value_, "string"); break;
       case "label-width":   return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;

       case "z-index":        return validateValue(styleId_, key_, value_, "number", null, -Number.MAX_VALUE, Number.MAX_VALUE); break;
       case "zbuffer-offset": return validateValue(styleId_, key_, value_, "object", 3, 0, Number.MAX_VALUE); break;

       case "hover-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "hover-style":  return validateValue(styleId_, key_, value_, "string"); break;
       case "enter-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "leave-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "click-event":  return validateValue(styleId_, key_, value_, "boolean"); break;
       case "draw-event":   return validateValue(styleId_, key_, value_, "boolean"); break;

       case "visible":     return validateValue(styleId_, key_, value_, "boolean"); break;
       case "visibility":  return validateValue(styleId_, key_, value_, "number", null, 0.0001, Number.MAX_VALUE); break;
       case "multi-pass":  return validateValue(styleId_, key_, value_, "object"); break;
    }

    return value_; //custom property
};

var getDefaultStylePropertyValue = function(key_) {
    switch(key_) {
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
       case "line-label-source": return "name";
       case "line-label-size":   return 1;
       case "line-label-offset": return 0;

       case "point":        return false;
       case "point-flat":   return false;
       case "point-radius": return 1;
       case "point-style":  return "solid";
       case "point-color":  return [255,255,255,255];

       case "icon":        return false;
       case "icon-source": return null;
       case "icon-scale":  return 1;
       case "icon-offset": return [0,0];
       case "icon-origin": return "bottom-center";
       case "icon-color":  return [255,255,255,255];

       case "label":         return false;
       case "label-color":   return [255,255,255,255];
       case "label-source":  return "name";
       case "label-size":    return 10;
       case "label-offset":  return [0,0];
       case "label-origin":  return "bottom-center";
       case "label-align":   return "center";
       case "label-width":   return 200;

       case "z-index":        return 0;
       case "zbuffer-offset": return [1,1,1];

       case "hover-event": return false;
       case "hover-style": return "";
       case "enter-event": return false;
       case "leave-event": return false;
       case "click-event": return false;
       case "draw-event":  return false;

       case "visible":    return true;
       case "visibility": return 0;
       case "multi-pass": return null;
    }
};


var processStyle = function(styleId_, styleData_, layerStylesData_) {

    var style_ = {};

    //copy style and inherit style if needed
    copyStyle(styleId_, style_, styleData_, layerStylesData_);

    //console.log(JSON.stringify(style_));

    //replace constants and validate properties
    for (var key_ in style_) {

        var value_ = style_[key_];

        //replace constant with value
        if ((typeof value_) == "string") {
            if (value_.length > 0) {
                //is it constant?
                if (value_.charAt(0) == "@") {

                    if (layerStylesData_["constants"] != null) {
                        if (layerStylesData_["constants"][value_] != null) {

                            //replace constant with value
                            style_[key_] = layerStylesData_["constants"][value_];
                        } else {
                            logError("wrong-object", styleId_, key_, value_, null, "constant");

                            //replace constant with deafault value
                            style_[key_] = getDefaultStylePropertyValue(key_);
                        }
                    } else {
                        logError("wrong-object", styleId_, key_, value_, null, "constant");

                        //replace constant with deafault value
                        style_[key_] = getDefaultStylePropertyValue(key_);
                    }
                }
            }
        }

        //console.log("process."+styleId_+"."+key_+"."+value_);
        //console.log("out1: "+JSON.stringify(style_[key_]));

        style_[key_] = validateStylePropertyValue(styleId_, key_, style_[key_]);

        //console.log("out2: "+JSON.stringify(style_[key_]));
    }

    return style_;
};

var processStyles = function(layerStylesData_) {

    layerBitmaps_ = {};

    //get bitmaps
    var bitmaps_ = layerStylesData_["bitmaps"] || {};

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
            layerBitmaps_[key_] = bitmap_;
        }
    }

    //load bitmaps
    postMessage({"command":"loadBitmaps", "bitmaps": layerBitmaps_});

    //get layers
    layerStyles_ = {
        styles_ : {}
    };

    var styles_ = layerStylesData_["styles"] || {};

    //console.log(JSON.stringify(styles_));

    //process layers
    for (var key_ in styles_) {
        layerStyles_.styles_[key_] = processStyle(key_, styles_[key_], layerStylesData_);

        //console.log(JSON.stringify(layerStyles_.styles_[key_]));
    }
};


