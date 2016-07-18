//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processFeaturePass = function(type_, feature_, lod_, style_, zIndex_, eventInfo_) {
    switch(type_) {
        case "line-string":
            if (getStylePropertyValue(style_, "point", feature_, lod_) ||
                getStylePropertyValue(style_, "label", feature_, lod_)) {
                processPointArrayPass(feature_, lod_, style_, zIndex_, eventInfo_);
            }

            processLineStringPass(feature_, lod_, style_, zIndex_, eventInfo_);
            break;

        case "point-array":
            processPointArrayPass(feature_, lod_, style_, zIndex_, eventInfo_);

            if (getStylePropertyValue(style_, "line", feature_, lod_) ||
                getStylePropertyValue(style_, "line-label", feature_, lod_)) {
                processLineStringPass(feature_, lod_, style_, zIndex_, eventInfo_);
            }

            break;
    }

};

var processFeature= function(type_, feature_, lod_, featureIndex_) {
    var style_ = getStyle(feature_["style"], type_, featureIndex_);
    var visible_ = getStylePropertyValue(style_, "visible", feature_, lod_);
    var zIndex_ = getStylePropertyValue(style_, "z-index", feature_, lod_);

    if (visible_ == false) {
        return;
    }

    var eventInfo_ = {};

    for (var key_ in feature_) {
        if (key_ != "points" && key_ != "d-points") {
            eventInfo_[key_] = feature_[key_];
        }
    }

    var hoverStyleId_ = getStylePropertyValue(style_, "hover-style", feature_, lod_);
    var hoverStyle_ = (hoverStyleId_ != "") ? getStyle(hoverStyleId_, type_, featureIndex_) : null;

    if (hoverStyle_ != null) {
        hitState_ = 1;
        processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
        hitState_ = 2;
        processFeaturePass(type_, feature_, lod_, hoverStyle_, zIndex_, eventInfo_);
    } else {
        hitState_ = 0;
        processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
    }


    var multiPass_ = getStylePropertyValue(style_, "multi-pass", feature_, lod_);

    if (multiPass_ != null) {
        for (var i = 0, li = multiPass_.length; i < li; i++) {
            var zIndex_ = multiPass_[i][0];
            var style_ = getStyle(multiPass_[i][1], type_, featureIndex_);

            visible_ = getStylePropertyValue(style_, "visible", feature_, lod_);

            if (visible_ == false) {
                continue;
            }

            hoverStyleId_ = getStylePropertyValue(style_, "hover-style", feature_, lod_);
            hoverStyle_ = (hoverStyleId_ != "") ? getStyle(hoverStyleId_, type_, featureIndex_) : null;

            if (hoverStyle_ != null) {
                hitState_ = 1;
                processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
                hitState_ = 2;
                processFeaturePass(type_, feature_, lod_, hoverStyle_, zIndex_, eventInfo_);
            } else {
                hitState_ = 0;
                processFeaturePass(type_, feature_, lod_, style_, zIndex_, eventInfo_);
            }
        }
    }

};


var processGroup = function(group_, lod_) {
    var points_ = group_["points"] || [];

    if (group_["origin"] == null && (tileX_ != 0 && tileY_ != 0)) {
        group_["origin"] = [tileX_, tileY_, 0];
        forceOrigin_ = true;
    } else {
        forceOrigin_ = false;
    }

    groupOrigin_ = group_["origin"];

    if (group_["scale"] != null) {
        forceScale_ = group_["scale"];
    } else {
        forceScale_ = null;
    }

    postMessage({"command":"beginGroup", "id": group_["id"], "bbox": group_["bbox"], "origin": group_["origin"]});

    //process points
    for (var i = 0, li = points_.length; i < li; i++) {
        processFeature("point-array", points_[i], lod_, i);
    }

    var lines_ = group_["lines"] || [];

    //process lines
    for (var i = 0, li = lines_.length; i < li; i++) {
        processFeature("line-string", lines_[i], lod_, i);
    }

    postMessage({"command":"endGroup"});
};


var processGeodata = function(data_, lod_) {
    //console.log("processGeodata");

    //create object from JSON
    if ((typeof data_) == "string") {
        try {
            var geodata_ = JSON.parse(data_);
        } catch (e) {
            geodata_ = null;
        }
    } else {
        geodata_ = data_;
    }

    if (geodata_) {

        var groups_ = geodata_["layers"] || geodata_["groups"] || [];

        //process layers
        for (var i = 0, li = groups_.length; i < li; i++) {
            processGroup(groups_[i], lod_);
        }
    }

    //console.log("processGeodata-ready");
};

self.onmessage = function (e) {
    var message_ = e.data;
    var command_ = message_["command"];
    var data_ = message_["data"];

    switch(command_) {

        case "setStyles":
            processStyles(data_);
            postMessage("ready");
            break;

        case "setFont":
            setFont(data_);
            postMessage("ready");
            break;

        case "processGeodata":

            tileX_ = message_["x"] || 0;
            tileY_ = message_["y"] || 0;
            tileLod_ = message_["lod"] || 1;
            autoLod_ = message_["autoLod"] || false;

            processGeodata(data_, tileLod_);
            postMessage("allProcessed");
            postMessage("ready");
            break;
    }
};

