//---------------------------------------------------
// this file loaded from geoWorkerDebug or merged
// into one function in case of minification process
//---------------------------------------------------

var processPointArrayPass = function(pointArray_, lod_, style_, zIndex_, eventInfo_) {
    var pointsGroups_ = []; 

    if (pointArray_["lines"]) {  //use lines as points
        pointsGroups_ = pointArray_["lines"] || [];
    } else {
        if (pointArray_["points"]) {
            pointsGroups_ = [pointArray_["points"]];
        }
    }
    
    if (pointsGroups_.length == 0) {
        return;
    }

    //debugger
    var visibility_ = getLayerPropertyValue(style_, "visibility", pointArray_, lod_);
    var hoverEvent_ = getLayerPropertyValue(style_, "hover-event", pointArray_, lod_);
    var clickEvent_ = getLayerPropertyValue(style_, "click-event", pointArray_, lod_);
    var drawEvent_ = getLayerPropertyValue(style_, "draw-event", pointArray_, lod_);
    var enterEvent_ = getLayerPropertyValue(style_, "enter-event", pointArray_, lod_);
    var leaveEvent_ = getLayerPropertyValue(style_, "leave-event", pointArray_, lod_);

    var zbufferOffset_ = getLayerPropertyValue(style_, "zbuffer-offset", pointArray_, lod_);

    var point_ = getLayerPropertyValue(style_, "point", pointArray_, lod_);
    var pointFlat_ = getLayerPropertyValue(style_, "point-flat", pointArray_, lod_);
    var pointColor_ = getLayerPropertyValue(style_, "point-color", pointArray_, lod_);
    var pointRadius_ = 0.5 * getLayerPropertyValue(style_, "point-radius", pointArray_, lod_);
    //zIndex_ = (zIndex_ !== null) ? zIndex_ : getLayerPropertyValue(style_, "z-index", pointArray_, lod_);

    var icon_ = getLayerPropertyValue(style_, "icon", pointArray_, lod_);
    if (icon_ == true) {
        var source_ = getLayerPropertyValue(style_, "icon-source", pointArray_, lod_);
        
        if (source_) {
            var bufferSize_ = getCharVerticesCount() * pointsGroups_.length;
            var bufferSize2_ = getCharVerticesCount(true) * pointsGroups_.length;
    
            var iconData_ = {
                color_ : getLayerPropertyValue(style_, "icon-color", pointArray_, lod_),
                scale_ : getLayerPropertyValue(style_, "icon-scale", pointArray_, lod_),
                offset_ : getLayerPropertyValue(style_, "icon-offset", pointArray_, lod_),
                stick_ : getLayerPropertyValue(style_, "icon-stick", pointArray_, lod_),
                origin_ : getLayerPropertyValue(style_, "icon-origin", pointArray_, lod_),
                source_ : getLayerPropertyValue(style_, "icon-source", pointArray_, lod_),
                vertexBuffer_ : new Float32Array(bufferSize_),
                originBuffer_ : new Float32Array(bufferSize2_),
                texcoordsBuffer_ : new Float32Array(bufferSize_),
                index_ : 0,
                index2_ : 0
            };
        } else {
            icon_ = false;
        }
    }

    var label_ = getLayerPropertyValue(style_, "label", pointArray_, lod_);
    if (label_ == true) {
        var source_ = getLayerPropertyValue(style_, "label-source", pointArray_, lod_);
        var text_ = getLayerExpresionValue(style_, source_, pointArray_, lod_);
        var size_ = getLayerPropertyValue(style_, "label-size", pointArray_, lod_);
        
        if (text_ && text_ != "" && Math.abs(size_) > 0.0001) {
            var bufferSize_ = getCharVerticesCount() * text_.length * pointsGroups_.length;
            var bufferSize2_ = getCharVerticesCount(true) * text_.length * pointsGroups_.length;

            var labelData_ = {
                color_ : getLayerPropertyValue(style_, "label-color", pointArray_, lod_),
                size_ : size_,
                offset_ : getLayerPropertyValue(style_, "label-offset", pointArray_, lod_),
                stick_ : getLayerPropertyValue(style_, "label-stick", pointArray_, lod_),
                origin_ : getLayerPropertyValue(style_, "label-origin", pointArray_, lod_),
                align_ : getLayerPropertyValue(style_, "label-align", pointArray_, lod_),
                text_ : text_,
                width_ : getLayerPropertyValue(style_, "label-width", pointArray_, lod_),
                vertexBuffer_ : new Float32Array(bufferSize_),
                originBuffer_ : new Float32Array(bufferSize2_),
                texcoordsBuffer_ : new Float32Array(bufferSize_),
                index_ : 0,
                index2_ : 0
            };
        } else {
            label_ = false;
        }
    }

    var index_ = 0;
    var index2_ = 0;

    var circleBuffer_ = [];
    var circleSides_ = clamp(pointRadius_ * 8 * 0.5, 8, 32);

    var angle_ = 0, step_ = (2.0*Math.PI) / circleSides_;

    for (var i = 0; i < circleSides_; i++) {
        circleBuffer_[i] = [-Math.sin(angle_), Math.cos(angle_)];
        angle_ += step_;
    }

    circleBuffer_[circleSides_] = [0, 1.0];
    
    var totalPoints_ = 0;
    var center_ = [0,0,0];
    
    for (var g = 0, gl = pointsGroups_.length; g < gl; g++) {
        var points_ = pointsGroups_[g];
        
        if (Array.isArray(points_) && points_.length > 0) {
            var p = points_[0];
            var p1 = [p[0], p[1], p[2]];
            
            totalPoints_ += points_.length;
        
            //allocate buffers
        
            if (pointFlat_ == false) {
                var pointsVertices_ = circleSides_ * 3 * 4;
                var vertexBuffer_ = new Array(points_.length * pointsVertices_);
                var pointsNormals_ = circleSides_ * 3 * 4;
                var normalBuffer_ = new Array(points_.length * pointsNormals_);
            } else {
                var pointsVertices_ = circleSides_ * 3 * 3;
                var vertexBuffer_ = new Array(points_.length * pointsVertices_);
            }
        
            var dpoints_ = false;
        
            //add ponints
            for (var i = 0, li = points_.length; i < li; i++) {
        
                if (forceOrigin_ == true) {
                    p1 = [p1[0] - tileX_, p1[1] - tileY_, p1[2]];
                }
        
                if (forceScale_ != null) {
                    p1 = [p1[0] * forceScale_[0], p1[1] * forceScale_[1], p1[2] * forceScale_[2]];
                }
        
                center_[0] += p1[0];
                center_[1] += p1[1];
                center_[2] += p1[2];

                if (icon_ == true) {
                    processIcon(p1, iconData_) ;//, pointArray_, lod_, style_, zIndex_);
                }
    
                if (label_ == true) {
                    processLabel(p1, labelData_); //, pointArray_, lod_, style_, zIndex_);
                }
        
                for (var j = 0; j < circleSides_; j++) {

                    if (point_ == true) {
        
                        if (pointFlat_ == true) {
        
                            //add polygon
                            vertexBuffer_[index_] = p1[0];
                            vertexBuffer_[index_+1] = p1[1];
                            vertexBuffer_[index_+2] = p1[2];
        
                            vertexBuffer_[index_+3] = p1[0] + circleBuffer_[j][0] * pointRadius_;
                            vertexBuffer_[index_+4] = p1[1] + circleBuffer_[j][1] * pointRadius_;
                            vertexBuffer_[index_+5] = p1[2];
        
                            vertexBuffer_[index_+6] = p1[0] + circleBuffer_[j+1][0] * pointRadius_;
                            vertexBuffer_[index_+7] = p1[1] + circleBuffer_[j+1][1] * pointRadius_;
                            vertexBuffer_[index_+8] = p1[2];

                            index_ += 9;
        
                        } else {
        
                            //add polygon
                            vertexBuffer_[index_] = p1[0];
                            vertexBuffer_[index_+1] = p1[1];
                            vertexBuffer_[index_+2] = p1[2];
                            vertexBuffer_[index_+3] = 0;
                            normalBuffer_[index2_] = 0;
                            normalBuffer_[index2_+1] = 0;
                            normalBuffer_[index2_+2] = 0;
                            normalBuffer_[index2_+3] = 0;
        
                            vertexBuffer_[index_+4] = p1[0];
                            vertexBuffer_[index_+5] = p1[1];
                            vertexBuffer_[index_+6] = p1[2];
                            vertexBuffer_[index_+7] = 0;
                            normalBuffer_[index2_+4] = circleBuffer_[j][0] * pointRadius_;
                            normalBuffer_[index2_+5] = circleBuffer_[j][1] * pointRadius_;
                            normalBuffer_[index2_+6] = 0;
                            normalBuffer_[index2_+7] = 0;
        
                            vertexBuffer_[index_+8] = p1[0];
                            vertexBuffer_[index_+9] = p1[1];
                            vertexBuffer_[index_+10] = p1[2];
                            vertexBuffer_[index_+11] = 0;
                            normalBuffer_[index2_+8] = circleBuffer_[j+1][0] * pointRadius_;
                            normalBuffer_[index2_+9] = circleBuffer_[j+1][1] * pointRadius_;
                            normalBuffer_[index2_+10] = 0;
                            normalBuffer_[index2_+11] = 0;
        
                            index_ += 12;
                            index2_ += 12;
                        }
                    }
                }
        
                if (dpoints_ == true) {
                    var p2 = points_[i+1];
                    p1 = [p1[0] + p2[0], p1[1] + p2[1], p1[2] + p2[2]];
                } else {
                    p1 = points_[i+1];
                }
            }
        }
    }
   

    if (totalPoints_ > 0) {
        center_[0] /= totalPoints_;
        center_[1] /= totalPoints_;
        center_[2] /= totalPoints_;
    }

    center_[0] += groupOrigin_[0];
    center_[1] += groupOrigin_[1];
    center_[2] += groupOrigin_[2];

    var hitable_ = hoverEvent_ || clickEvent_ || enterEvent_ || leaveEvent_;

    if (point_ == true) {
        if (pointFlat_ == true) {
            postMessage({"command":"addRenderJob", "type": "flat-line", "vertexBuffer": vertexBuffer_,
                         "color":pointColor_, "z-index":zIndex_, "visibility": visibility_, "center": center_,
                         "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                         "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                         "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                         "lod":(autoLod_ ? null : tileLod_) }, [vertexBuffer_.buffer]);
        } else {
            postMessage({"command":"addRenderJob", "type": "pixel-line", "vertexBuffer": vertexBuffer_,
                         "normalBuffer": normalBuffer_, "color":pointColor_, "z-index":zIndex_,
                         "visibility": visibility_, "center": center_,
                         "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                         "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                         "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                         "lod":(autoLod_ ? null : tileLod_) }, [vertexBuffer_.buffer, normalBuffer_.buffer]);
        }
    }

    if (icon_ == true && iconData_.vertexBuffer_.length > 0) {
        postMessage({"command":"addRenderJob", "type": "icon", "vertexBuffer": iconData_.vertexBuffer_,
                     "originBuffer": iconData_.originBuffer_, "texcoordsBuffer": iconData_.texcoordsBuffer_,
                     "icon":stylesheetBitmaps_[iconData_.source_[0]], "color":iconData_.color_, "z-index":zIndex_,
                     "visibility": visibility_, "center": center_, "stick": iconData_.stick_,
                     "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                     "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                     "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                     "lod":(autoLod_ ? null : tileLod_) }, [iconData_.vertexBuffer_.buffer, iconData_.originBuffer_.buffer, iconData_.texcoordsBuffer_.buffer]);
    }

    if (label_ == true && labelData_.vertexBuffer_.length > 0) {
        postMessage({"command":"addRenderJob", "type": "label", "vertexBuffer": labelData_.vertexBuffer_,
                     "originBuffer": labelData_.originBuffer_, "texcoordsBuffer": labelData_.texcoordsBuffer_,
                     "color":labelData_.color_, "z-index":zIndex_, "visibility": visibility_, "center": center_, "stick": labelData_.stick_,
                     "hover-event":hoverEvent_, "click-event":clickEvent_, "draw-event":drawEvent_,
                     "enter-event":enterEvent_, "leave-event":leaveEvent_, "zbuffer-offset":zbufferOffset_,
                     "hitable":hitable_, "state":hitState_, "eventInfo":eventInfo_,
                     "lod":(autoLod_ ? null : tileLod_) }, [labelData_.vertexBuffer_.buffer, labelData_.originBuffer_.buffer, labelData_.texcoordsBuffer_.buffer]);
    }

};

var getOriginOffset = function(origin_, width_, height_) {
    switch(origin_) {
        case "top-left":        return [0, 0];
        case "top-right":       return [-width_, 0];
        case "top-center":      return [-width_*0.5, 0];
        case "center-left":     return [0, -height_*0.5];
        case "center-right":    return [-width_, -height_*0.5];
        case "center-center":   return [-width_*0.5, -height_*0.5];
        case "bottom-left":     return [0, -height_];
        case "bottom-right":    return [-width_, -height_];
        case "bottom-center":   return [-width_*0.5, -height_];
    }
};

var processIcon = function(point_, iconData_) {
    var icon_ = iconData_.source_;
    var index_ = iconData_.index_;
    var index2_ = iconData_.index2_;
    var lastIndex_ = index_;

    var width_ = Math.abs(icon_[3] * iconData_.scale_);
    var height_ = Math.abs(icon_[4] * iconData_.scale_);

    var vertexBuffer_ = iconData_.vertexBuffer_;
    var texcoordsBuffer_ = iconData_.texcoordsBuffer_;
    var originBuffer_ = iconData_.originBuffer_;

    //add polygon
    vertexBuffer_[index_] = 0;
    vertexBuffer_[index_+1] = 0;
    vertexBuffer_[index_+2] = 0;
    vertexBuffer_[index_+3] = 0;

    vertexBuffer_[index_+4] = width_;
    vertexBuffer_[index_+5] = 0;
    vertexBuffer_[index_+6] = 0;
    vertexBuffer_[index_+7] = 0;

    vertexBuffer_[index_+8] = width_;
    vertexBuffer_[index_+9] = -height_;
    vertexBuffer_[index_+10] = 0;
    vertexBuffer_[index_+11] = 0;

    texcoordsBuffer_[index_] = icon_[1];
    texcoordsBuffer_[index_+1] = icon_[2];
    texcoordsBuffer_[index_+2] = 0;
    texcoordsBuffer_[index_+3] = 0;

    texcoordsBuffer_[index_+4] = icon_[1]+icon_[3];
    texcoordsBuffer_[index_+5] = icon_[2];
    texcoordsBuffer_[index_+6] = 0;
    texcoordsBuffer_[index_+7] = 0;

    texcoordsBuffer_[index_+8] = icon_[1]+icon_[3];
    texcoordsBuffer_[index_+9] = icon_[2]+icon_[4];
    texcoordsBuffer_[index_+10] = 0;
    texcoordsBuffer_[index_+11] = 0;

    index_ += 12;

    //add polygon
    vertexBuffer_[index_] = 0;
    vertexBuffer_[index_+1] = 0;
    vertexBuffer_[index_+2] = 0;
    vertexBuffer_[index_+3] = 0;

    vertexBuffer_[index_+4] = 0;
    vertexBuffer_[index_+5] = -height_;
    vertexBuffer_[index_+6] = 0;
    vertexBuffer_[index_+7] = 0;

    vertexBuffer_[index_+8] = width_;
    vertexBuffer_[index_+9] = -height_;
    vertexBuffer_[index_+10] = 0;
    vertexBuffer_[index_+11] = 0;

    texcoordsBuffer_[index_] = icon_[1];
    texcoordsBuffer_[index_+1] = icon_[2];
    texcoordsBuffer_[index_+2] = 0;
    texcoordsBuffer_[index_+3] = 0;

    texcoordsBuffer_[index_+4] = icon_[1];
    texcoordsBuffer_[index_+5] = icon_[2]+icon_[4];
    texcoordsBuffer_[index_+6] = 0;
    texcoordsBuffer_[index_+7] = 0;

    texcoordsBuffer_[index_+8] = icon_[1]+icon_[3];
    texcoordsBuffer_[index_+9] = icon_[2]+icon_[4];
    texcoordsBuffer_[index_+10] = 0;
    texcoordsBuffer_[index_+11] = 0;
    
    index_ += 12;

    //get offset
    var originOffset_ = getOriginOffset(iconData_.origin_, width_, height_);
    var offsetX_ = originOffset_[0] + iconData_.offset_[0];
    var offsetY_ = originOffset_[1] + iconData_.offset_[1];

    var p1_ = point_[0];
    var p2_ = point_[1];
    var p3_ = point_[2];

    //set origin buffer and apply offset
    for (var i = lastIndex_; i < index_; i+=4) {
        vertexBuffer_[i] += offsetX_;
        vertexBuffer_[i+1] -= offsetY_;

        originBuffer_[index2_] = p1_;
        originBuffer_[index2_ + 1] = p2_;
        originBuffer_[index2_ + 2] = p3_;
        index2_ += 3;
    }

    iconData_.index_ = index_;
    iconData_.index2_ = index2_;
};


var processLabel = function(point_, labelData_) {
    var vertexBuffer_ = labelData_.vertexBuffer_;
    var texcoordsBuffer_ = labelData_.texcoordsBuffer_;
    var originBuffer_ = labelData_.originBuffer_;
    var index_ = labelData_.index_;
    var index2_ = labelData_.index2_;
    var lastIndex_ = index_;
    var text_ = "" + labelData_.text_;

    //split by new line
    var lines_ = text_.match(/[^\r\n]+/g);
    var lines2_ = [];
    var align_ = false;

    //split lines by width
    for (var i = 0, li = lines_.length; i < li; i++) {

        var line_= lines_[i];

        do {
            var splitIndex_ = getSplitIndex(line_, labelData_.width_, getFontFactor(labelData_.size_, fonts_["default"]), fonts_["default"]);

            if (line_.length == splitIndex_) {
                lines2_.push(line_);
                break;
            }

            lines2_.push(line_.substring(0,splitIndex_));
            line_ = line_.substring(splitIndex_+1);
            align_ = true;

        } while(true);

    }

    var x = 0;
    var y = 0;
    var textLength_ = 0;
    var lineHeight_ = getLineHeight(labelData_.size_, fonts_["default"]);
    var maxWidth_ = 0;
    var lineWidths_ = [];

    //get max width
    for (var i = 0, li = lines2_.length; i < li; i++) {
        lineWidths_[i] = getTextLength(lines2_[i], getFontFactor(labelData_.size_, fonts_["default"]), fonts_["default"]);
        maxWidth_ = Math.max(lineWidths_[i], maxWidth_);
    }

    //generate text
    for (var i = 0, li = lines2_.length; i < li; i++) {
        var textWidth_ = lineWidths_[i];//getTextLength(lines2_[i], getFontFactor(labelData_.size_, fonts_["default"]), fonts_["default"]);
        //maxWidth_ = Math.max(textWidth_, maxWidth_);

        switch(labelData_.align_) {
            case "left": x = 0; break;
            case "right": x = maxWidth_ - textWidth_; break;
            case "center": x = (maxWidth_ - textWidth_)*0.5; break;
        }

        index_ = addText([x,y,0], [1,0,0], lines2_[i], labelData_.size_, fonts_["default"], vertexBuffer_, texcoordsBuffer_, true, index_);
        y -= lineHeight_;
    }

    //get offset
    var originOffset_ = getOriginOffset(labelData_.origin_, maxWidth_, -y);
    offsetX_ = originOffset_[0] + labelData_.offset_[0];
    offsetY_ = originOffset_[1] + labelData_.offset_[1];
    
    var p1_ = point_[0];
    var p2_ = point_[1];
    var p3_ = point_[2];

    //set origin buffer and apply offset
    for (var i = lastIndex_; i < index_; i+=4) {
        vertexBuffer_[i] += offsetX_;
        vertexBuffer_[i+1] -= offsetY_;

        originBuffer_[index2_] = p1_;
        originBuffer_[index2_ + 1] = p2_;
        originBuffer_[index2_ + 2] = p3_;
        index2_ += 3;
    }

    labelData_.index_ = index_;
    labelData_.index2_ = index2_;
};








