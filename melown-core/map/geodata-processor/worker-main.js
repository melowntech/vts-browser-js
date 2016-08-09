//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processLayerFeaturePass = function(type_, feature_, lod_, layer_, zIndex_, eventInfo_) {
    switch(type_) {
        case "line-string":
            if (getLayerPropertyValue(layer_, "point", feature_, lod_) ||
                getLayerPropertyValue(layer_, "label", feature_, lod_)) {
                processPointArrayPass(feature_, lod_, layer_, zIndex_, eventInfo_);
            }

            processLineStringPass(feature_, lod_, layer_, zIndex_, eventInfo_);
            break;

        case "point-array":
            processPointArrayPass(feature_, lod_, layer_, zIndex_, eventInfo_);

            /*if (getLayerPropertyValue(layer_, "line", feature_, lod_) ||
                getLayerPropertyValue(layer_, "line-label", feature_, lod_)) {
                processLineStringPass(feature_, lod_, layer_, zIndex_, eventInfo_);
            }*/

            break;
            
        case "polygon":
            processPolygonPass(feature_, lod_, style_, zIndex_, eventInfo_);
            break;     
    }

};

var processLayerFeature = function(type_, feature_, lod_, layer_, featureIndex_) {
    //var layer_ = getLayer(feature_["style"], type_, featureIndex_);
    var visible_ = getLayerPropertyValue(layer_, "visible", feature_, lod_);
    var zIndex_ = getLayerPropertyValue(layer_, "z-index", feature_, lod_);

    if (visible_ == false) {
        return;
    }

    feature_.properties_ = feature_["properties"] || {};

    var eventInfo_ = feature_.properties_;

    var hoverLayerId_ = getLayerPropertyValue(layer_, "hover-style", feature_, lod_);
    var hoverlayer_ = (hoverLayerId_ != "") ? getLayer(hoverLayerId_, type_, featureIndex_) : null;

    if (hoverlayer_ != null) {
        hitState_ = 1;
        processLayerFeaturePass(type_, feature_, lod_, layer_, zIndex_, eventInfo_);
        hitState_ = 2;
        processLayerFeaturePass(type_, feature_, lod_, hoverlayer_, zIndex_, eventInfo_);
    } else {
        hitState_ = 0;
        processLayerFeaturePass(type_, feature_, lod_, layer_, zIndex_, eventInfo_);
    }


    var multiPass_ = getLayerPropertyValue(layer_, "next-pass", feature_, lod_);

    if (multiPass_ != null) {
        for (var i = 0, li = multiPass_.length; i < li; i++) {
            var zIndex_ = multiPass_[i][0];
            var layer_ = getLayer(multiPass_[i][1], type_, featureIndex_);

            visible_ = getLayerPropertyValue(layer_, "visible", feature_, lod_);

            if (visible_ == false) {
                continue;
            }

            hoverLayerId_ = getLayerPropertyValue(layer_, "hover-style", feature_, lod_);
            hoverlayer_ = (hoverLayerId_ != "") ? getLayer(hoverLayerId_, type_, featureIndex_) : null;

            if (hoverlayer_ != null) {
                hitState_ = 1;
                processLayerFeaturePass(type_, feature_, lod_, layer_, zIndex_, eventInfo_);
                hitState_ = 2;
                processLayerFeaturePass(type_, feature_, lod_, hoverlayer_, zIndex_, eventInfo_);
            } else {
                hitState_ = 0;
                processLayerFeaturePass(type_, feature_, lod_, layer_, zIndex_, eventInfo_);
            }
        }
    }

};

var processFeature = function(type_, feature_, lod_, featureIndex_, featureType_, group_) {
    
    //loop layers
    for (var key_ in stylesheetLayers_) {
        var layer_ = stylesheetLayers_[key_];
        var filter_ =  getLayerPropertyValue(layer_, "filter", feature_, lod_);
        
        if (!filter_ || getFilterResult(filter_, feature_, featureType_, group_)) {
            processLayerFeature(type_, feature_, lod_, layer_, featureIndex_);
        }
    }
    
};


var processGroup = function(group_, lod_) {
    /*
    if (group_["origin"] == null && (tileX_ != 0 && tileY_ != 0)) {
        group_["origin"] = [tileX_, tileY_, 0];
        forceOrigin_ = true;
    } else {
        forceOrigin_ = false;
    }*/

    var groupId_ = group_["id"] || "";

    var bbox_ = group_["bbox"];    
    if (!bbox_) {
        return;
    }
          
    bboxMin_ = bbox_[0];
    bboxMax_ = bbox_[1];
    bboxDelta_ = [bbox_[1][0] - bbox_[0][0],
                  bbox_[1][1] - bbox_[0][1],
                  bbox_[1][2] - bbox_[0][2]];
    bboxResolution_ = group_["resolution"] || 4096;
    
    /*
    console.log(JSON.stringify(bboxMin_));
    console.log(JSON.stringify(bboxMax_));
    console.log(JSON.stringify(bboxDelta_));
    console.log(JSON.stringify(bboxResolution_));
    */

    groupOrigin_ = [0,0,0];
    forceScale_ = [bboxDelta_[0] / bboxResolution_,
                   bboxDelta_[1] / bboxResolution_,
                   bboxDelta_[2] / bboxResolution_];

    postMessage({"command":"beginGroup", "id": group_["id"], "bbox": [bboxMin_, bboxMax_], "origin": bboxMin_});

    var points_ = group_["points"] || [];

    //process points
    for (var i = 0, li = points_.length; i < li; i++) {
        processFeature("point-array", points_[i], lod_, i, "point", groupId_);
    }

    var lines_ = group_["lines"] || [];

    //process lines
    for (var i = 0, li = lines_.length; i < li; i++) {
        processFeature("line-string", lines_[i], lod_, i, "line", groupId_);
    }

    var polygons_ = group_["polygons"] || [];

    //process polygons
    for (var i = 0, li = polygons_.length; i < li; i++) {
        processFeature("polygon", polygons_[i], lod_, i, "polygon", groupId_);
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

        var groups_ = geodata_["groups"] || [];

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

    console.log("worker_onmessage: " + command_);

    switch(command_) {

        case "setStylesheet":
            processStylesheet(data_);
            postMessage("ready");
            break;

        case "setFont":
            setFont(data_);
            postMessage("ready");
            break;

        case "processGeodata":
            processGeodata(data_, tileLod_);
            postMessage("allProcessed");
            postMessage("ready");
            break;
    }
};

