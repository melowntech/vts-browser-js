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

        feature_.properties_ = feature_["properties"] || {};
        
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

    if (groupOptimize_) {
        optimizeGroupMessages();
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

var optimizeGroupMessages = function() {
    //loop messages
    var index2_ = 0;
    var messages_ = messageBuffer_;
    var messages2_ = messageBuffer2_;

    for (var i = 0, li = messageBufferIndex_; i < li; i++) {
        var message_ = messages_[i];
        var job_ = message_.job_;
        var type_ = job_["type"];
        var signature_ = message_.signature_;
        
        if (!message_["hitable"] && !message_.reduced_ &&
            !(type_ == "icon" || type_ == "label")) {
            
            switch(type_) {
                case "flat-line":
                    var vbufferSize_ = job_["vertexBuffer"].length;

                    for (var j = i + 1; j < li; j++) {
                        var message2_ = messages_[j];
                        
                        if (message2_.signature_ == signature_) {
                            message2_.reduced_ = true;
                            vbufferSize_ += message2_.job_["vertexBuffer"].length;                             
                        }
                    }

                    var vbuffer_ = new Float32Array(vbufferSize_);
                    var index_ = 0;

                    for (var j = i; j < li; j++) {
                        var message2_ = messages_[j];
                        var job2_ = message2_.job_;
                        
                        if (message2_.signature_ == signature_) {
                            var buff_ = job2_["vertexBuffer"];
                            job2_["vertexBuffer"] = null;
                            for (var k = 0, lk = buff_.length; k < lk; k++) {
                                vbuffer_[index_+k] = buff_[k];
                            }
                            index_+= lk;        
                        }
                    }

                    job_["vertexBuffer"] = vbuffer_;                             
                    message_.arrays_ = [vbuffer_.buffer];                             
                    break;
                    
                case "pixel-line":
                case "line-label":
                    var vbufferSize_ = job_["vertexBuffer"].length;

                    for (var j = i + 1; j < li; j++) {
                        var message2_ = messages_[j];
                        
                        if (message2_.signature_ == signature_) {
                            message2_.reduced_ = true;
                            vbufferSize_ += message2_.job_["vertexBuffer"].length;                             
                        }
                    }

                    var vbuffer_ = new Float32Array(vbufferSize_);
                    var nbuffer_ = new Float32Array(vbufferSize_);
                    var index_ = 0;

                    for (var j = i; j < li; j++) {
                        var message2_ = messages_[j];
                        var job2_ = message2_.job_;
                        
                        if (message2_.signature_ == signature_) {
                            var buff_ = job2_["vertexBuffer"];
                            job2_["vertexBuffer"] = null;
                            
                            if (type_ == "line-label") {
                                var buff2_ = job2_["texcoordsBuffer"];
                                job2_["texcoordsBuffer"] = null;
                            } else {
                                var buff2_ = job2_["normalBuffer"];
                                job2_["normalBuffer"] = null;
                            }
                            
                            for (var k = 0, lk = buff_.length; k < lk; k++) {
                                vbuffer_[index_+k] = buff_[k];
                                nbuffer_[index_+k] = buff2_[k];
                            }
                            index_+= lk;        
                        }
                    }

                    job_["vertexBuffer"] = vbuffer_;                             

                    if (type_ == "line-label") {
                        job_["texcoordsBuffer"] = nbuffer_;
                    } else {
                        job_["normalBuffer"] = nbuffer_;
                    }

                    message_.arrays_ = [vbuffer_.buffer, nbuffer_.buffer];                             
                    break;
            }

            //messages2_[index2_] = message_;
            index2_++;
            
            postMessage(message_.job_, message_.arrays_);
            
        } else if (!message_.reduced_) {

            postMessage(message_.job_, message_.arrays_);

            //messages2_[index2_] = message_;
            index2_++;
        }
    }

    //for (var i = 0, li = index2_; i < li; i++) {
        //var message_ = messages2_[i];
        //postMessage(message_.job_, message_.arrays_);
    //}

    //var reduced_ = messageBufferIndex_ - index2_;  
    //console.log("total: " + messageBufferIndex_ + "    reduced: " + reduced_);

    messageBufferIndex_ = 0;
}; 

var postGroupMessage = function(message_, arrays_, signature_) {
    if (groupOptimize_) {
        if (messageBufferIndex_ >= messageBufferSize_) { //resize buffer
            var oldBuffer_ = messageBuffer_; 
            messageBufferSize_ += 65536;
            messageBuffer_ = new Array(messageBufferSize_);
            messageBuffer2_ = new Array(messageBufferSize_);
            
            for (var i = 0, li = messageBufferIndex_; i < li; i++) {
                messageBuffer_[i] = oldBuffer_[i];
            }
        }
        
        messageBuffer_[messageBufferIndex_] = { job_ : message_, arrays_: arrays_, signature_ : signature_ };
        messageBufferIndex_++;
    } else {
        postMessage(message_, arrays_);
    }
};

self.onmessage = function (e) {
    var message_ = e.data;
    var command_ = message_["command"];
    var data_ = message_["data"];

    console.log("worker_onmessage: " + command_);

    switch(command_) {

        case "setStylesheet":
            if (data_) {
                geocent_ = data_["geocent"] || false;
                processStylesheet(data_["data"]);
            }
            postMessage("ready");
            break;

        case "setFont":
            setFont(data_);
            postMessage("ready");
            break;

        case "processGeodata":
            tileLod_ = message_["lod"] || 0;
            data_ = JSON.parse(data_);            
            processGeodata(data_, tileLod_);
            
            if (groupOptimize_) {
                optimizeGroupMessages();
            }
            
            postMessage("allProcessed");
            postMessage("ready");
            break;
    }
};

