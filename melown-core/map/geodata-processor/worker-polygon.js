//---------------------------------------------------
// this file loaded from geoWorkerDebug
//---------------------------------------------------

var processPolygonPass = function(polygon_, lod_, style_, zIndex_, eventInfo_) {
    //console.log( "processPolygonsPass >>>>>>> ");
    
    var vertices_ = polygon_["vertices"] || [];
    if (vertices_.length == 0) {
        return;
    }
    
    // borders as points
    if (getLayerPropertyValue(style_, "point", polygon_, lod_) ||
        getLayerPropertyValue(style_, "label", polygon_, lod_)) {
            processPolygonLines(polygon_, vertices_, lod_, style_, zIndex_, eventInfo_, false);
    }
    
    // borders as lines
    if (getLayerPropertyValue(style_, "line", polygon_, lod_) ||
        getLayerPropertyValue(style_, "line-label", polygon_, lod_)) {
            processPolygonLines(polygon_, vertices_, lod_, style_, zIndex_, eventInfo_, true);
    }
    
    var spolygon_ = getLayerPropertyValue(style_, "polygon", polygon_, lod_);
    
    if (spolygon_ == false) {
        return;
    }
    
    var surface_ = polygon_["surface"] || [];
    if (surface_.length == 0) {
        return;
    }
    
    var hoverEvent_ = getLayerPropertyValue(style_, "hover-event", polygon_, lod_);
    var clickEvent_ = getLayerPropertyValue(style_, "click-event", polygon_, lod_);
    var drawEvent_ = getLayerPropertyValue(style_, "draw-event", polygon_, lod_);
    var enterEvent_ = getLayerPropertyValue(style_, "enter-event", polygon_, lod_);
    var leaveEvent_ = getLayerPropertyValue(style_, "leave-event", polygon_, lod_);

    var zbufferOffset_ = getLayerPropertyValue(style_, "zbuffer-offset", polygon_, lod_);
    
    var polygonColor_ = getLayerPropertyValue(style_, "polygon-color", polygon_, lod_);
    
    var center_ = [0,0,0];
   
    // allocate vertex buffer
    var trisCount_ = surface_.length / 3;
    var vertexCount_ = trisCount_ * 3;
    var vertexBuffer_ = new Array (vertexCount_ * 3);
    
    var dpoints_ = false;
    var surfaceI_ = 0;
    var index_ = 0;
    var p1;
    var offs;
    
    //console.log("vertexCount_ = " + vertexCount_);
    //add tris
    for (var i = 0; i < vertexCount_; i++) {
        offs = 3 * surface_[surfaceI_++];
        p1 = [vertices_[offs++], vertices_[offs++], vertices_[offs]];
        
        if (forceOrigin_ == true) {
            p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
        }

        if (forceScale_ != null) {
            p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
        }
        
        center_[0] += p1[0];
        center_[1] += p1[1];
        center_[2] += p1[2];

        //add vertex
        vertexBuffer_[index_++] = p1[0];
        vertexBuffer_[index_++] = p1[1];
        vertexBuffer_[index_++] = p1[2];
    }
    
    //console.log( "vertexBuffer_: " + vertexBuffer_ );
    
    if (vertexCount_ > 0) {
        var k = 1.0 / vertexCount_;
        center_[0] *= k;
        center_[1] *= k;
        center_[2] *= k;
    }
    center_[0] += groupOrigin_[0];
    center_[1] += groupOrigin_[1];
    center_[2] += groupOrigin_[2];

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;
    
    var messageData_ = {"command":"addRenderJob", "type": "flat-line", "vertexBuffer": vertexBuffer_,
                        "color":polygonColor_, "z-index":zIndex_, "center": center_,
                        "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                        "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                        "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                        "lod":(autoLod_ ? null : tileLod_) };

    postMessage(messageData_);
};

var createEmptyFeatureFromPolygon = function(polygon_) {
    var feature_ = {};
    for(var key_ in polygon_) {
        if(key_ != "surface" && key_ != "vertices" && key_ != "borders") {
            feature_[key_] = polygon_[key_];
        }
    }
    return feature_;
};

var processPolygonLines = function(polygon_, vertices_, lod_, style_, zIndex_, eventInfo_, processLines_) {
    //console.log( "processPolygonLines >>>>>>> " + processLines_);
    var borders_ = polygon_["borders"] || [];
    if (borders_.length == 0) {
        return;
    }
    var feature_ = createEmptyFeatureFromPolygon(polygon_);
    var bordersCount_ = borders_.length;
    for (var j = 0; j < bordersCount_; j++) {
        var border_ = borders_[j];
        var pointsCount_ = border_.length;
        if (pointsCount_ > 0) {
            var points_;
            if (processLines_) {
                points_ = new Array(pointsCount_ + 1);
            }
            else {
                points_ = new Array(pointsCount_);
            }
            for (var i = 0; i < pointsCount_; i++) {
                var offs = 3 * border_[i];
                points_[i] = [vertices_[offs++], vertices_[offs++], vertices_[offs]];
                if (processLines_ && i == 0) {
                    points_[pointsCount_] = points_[0];
                }
            }
            feature_["points"] = points_;
            if(processLines_) {
                processLineStringPass(feature_, lod_, style_, zIndex_, eventInfo_);
            }
            else {
                processPointArrayPass(feature_, lod_, style_, zIndex_, eventInfo_);
            }
        }
    }
};
 