
Melown.UIElement.prototype.setDraggableState = function(state_) {
    if (state_) {
        this.on("mousedown", this.dragBeginCall_);
        this.on("touchstart", this.dragBeginCall_);
    } else if (this.dragable_){
        this.off("mousedown", this.dragBeginCall_);
        this.off("mousemove", this.dragMoveCall_, document);
        //this.off("mouseup", this.onDragEnd.bind(this));
        this.off("mouseup", this.dragEndCall_, document);
        
        this.off("touchstart", this.dragBeginCall_);
        this.off("touchmove", this.dragMoveCall_, document);
        this.off("touchend", this.dragEndCall_, document);
        
        this.dragging_ = false;
    }
    
    this.dragStartPos_ = [0,0];
    this.dragCurrentPos_ = [0,0];
    this.dragLastPos_ = [0,0];
    this.dragAbsMoved_ = [0,0];
    this.dragTouchCount_ = 0;
    this.dragTouches_ = [];
    this.dragTouches2_ = [];
    this.resetPos_ = false;
    
    this.dragable_ = state_;
    this.dragButtons_ = {
      "left" : false,
      "right" : false,
      "middle" : false
    };
};

Melown.UIElement.prototype.getDraggableState = function() {
    return this.dragable_;
};

Melown.UIElement.prototype.getDraggingState = function() {
    return {
        "dragging" : this.dragging_,
        "buttonLeft" : this.dragButtons_["left"],
        "buttonRight" : this.dragButtons_["right"],
        "buttonMiddle" : this.dragButtons_["middle"],
        "startPos" : this.dragStartPos_.slice(), 
        "lastPos" : this.dragLastPos_.slice(), 
        "currentPos" : this.dragCurrentPos_.slice(), 
        "absMoved" : this.dragAbsMoved_.slice() 
    };
};

Melown.UIElement.prototype.onDragBegin = function(event_) {
    //console.log("bergin: 1#:  " + JSON.stringify(this.dragButtons_));

    this.dragButtons_[event_.getMouseButton()] = true;

    //console.log("bergin: 2#:  " + JSON.stringify(this.dragButtons_));

    //if (event_.getTouchesCount() == 2) {
        this.dragTouches_ = [];
        this.dragTouches2_ = [];
        this.dragTouches_.push(event_.getTouchCoords(0));            
        this.dragTouches2_.push(event_.getTouchCoords(1));            
    //}

    this.resetPos_ = true;

    this.firstDragDistance_ = 0;
    this.lastDragDistance_ = 0;
    this.zoomDrag_ = false;

    if (this.dragging_ != true) {
        this.dragging_ = true;
        var pos_ = event_.getMouseCoords(true);
        this.dragStartPos_ = [pos_[0], pos_[1]];
        this.dragCurrentPos_ = [pos_[0], pos_[1]];
        this.dragLastPos_ = [pos_[0], pos_[1]];
        this.dragAbsMoved_ = [0,0];

        this.on("mousemove", this.dragMoveCall_, document);
        this.on("mouseup", this.dragEndCall_, document);
        //this.on("mouseup", this.onDragEnd.bind(this), document);

        this.on("touchmove", this.dragMoveCall_, document);
        this.on("touchend", this.dragEndCall_, document);

        Melown.Utils.disableTextSelection();
        Melown.Utils.disableImageDrag();
        //Melown.Utils.disableContexMenu();
        Melown.Utils.preventDefault(event_);

        this.fire("dragstart", {
            "clientX" : pos_[0],
            "clientY" : pos_[1]
            });
    } else {
        var pos_ = event_.getMouseCoords();
        this.dragLastPos_ = pos_;
    }

};

Melown.UIElement.prototype.onDragMove = function(event_) {
    var pos_ = event_.getMouseCoords();

    if (event_.getTouchesCount() != -1) {
        this.updateDragButtonsState(event_, true);
    }

    Melown.Utils.preventDefault(event_);

    var mode_ = "";
    var zoom_ = 0;
    var rotateDelta_ = 0;
    var panDelta_ = [0,0];
    var distanceDelta_ = 0;

    //var el_ = document.getElementById("debug123");
    
    var touchCount_ = event_.getTouchesCount();
    if (touchCount_ != this.dragTouchCount_) {
        this.dragLastPos_[0] = pos_[0];
        this.dragLastPos_[1] = pos_[1];
        this.dragTouchCount_ = touchCount_; 
    }

    if (this.resetPos_) {
        this.dragCurrentPos_ = [pos_[0], pos_[1]];
        this.dragLastPos_[0] = pos_[0];
        this.dragLastPos_[1] = pos_[1];
        this.resetPos_ = false;
    }

    if (touchCount_ == 2) {
        this.dragTouches_.push(event_.getTouchCoords(0));            
        this.dragTouches2_.push(event_.getTouchCoords(1));            

        if (this.dragTouches_.length >= 7) {
            this.dragTouches_.shift();
            this.dragTouches2_.shift();
        }

        if (this.dragTouches_.length == 6) {

            //get vector for touch #1
            var t = this.dragTouches_;
            var v1x_ = (t[5][0] - t[4][0]) + (t[4][0] - t[3][0]) + (t[3][0] - t[2][0]) + (t[2][0] - t[1][0]) + (t[1][0] - t[0][0]);
            var v1y_ = (t[5][1] - t[4][1]) + (t[4][1] - t[3][1]) + (t[3][1] - t[2][1]) + (t[2][1] - t[1][1]) + (t[1][1] - t[0][1]);

            //get vector for touch #2
            t2 = this.dragTouches2_;
            var v2x_ = (t2[5][0] - t2[4][0]) + (t2[4][0] - t2[3][0]) + (t2[3][0] - t2[2][0]) + (t2[2][0] - t2[1][0]) + (t2[1][0] - t2[0][0]);
            var v2y_ = (t2[5][1] - t2[4][1]) + (t2[4][1] - t2[3][1]) + (t2[3][1] - t2[2][1]) + (t2[2][1] - t2[1][1]) + (t2[1][1] - t2[0][1]);
            
            //get distance of each vector
            var d1_ = Math.sqrt(v1x_ * v1x_ + v1y_ * v1y_);
            var d2_ = Math.sqrt(v2x_ * v2x_ + v2y_ * v2y_);

            mode_ = "pan";

            if (d1_ > d2_ * 5 || d2_ > d1_ * 5) { //dectec situation where only one finger is closing to another
                
                //make first vector from non moving point to beginnig positon of moving point
                //make seconf vector from non moving point to ending positon of moving point
                if (d1_ > d2_ * 5) {
                    var p1_ = t2[0];
                    var p2_ = t[0];
                    var p3_ = t[5];
                } else {
                    var p1_ = t[0];
                    var p2_ = t2[0];
                    var p3_ = t2[5];
                }
                
                var v1_ = [p2_[0] - p1_[0], p2_[1] - p1_[1]];
                var v2_ = [p3_[0] - p1_[0], p3_[1] - p1_[1]];

                //normalize vectors                
                var d =  Math.sqrt(v1_[0] * v1_[0] + v1_[1] * v1_[1]);
                v1_[0] /= d;
                v1_[1] /= d;
                
                d =  Math.sqrt(v2_[0] * v2_[0] + v2_[1] * v2_[1]);
                v2_[0] /= d;
                v2_[1] /= d;

                //measure angle between vectors
                var cosAngle_ = v1_[0] * v2_[0] + v1_[1] * v2_[1];
                var cosAngle2_ = -v1_[1] * v2_[0] + v1_[0] * v2_[1]; //v1 is rotated by 90deg
                
                rotateDelta_ = (Math.acos(cosAngle2_) * (180.0/Math.PI)) - 90;

                if (cosAngle_ > 0.9999) { //are vectors in same line?
                    mode_ = "zoom";
                } else {
                    panDelta_ = [(v1x_ + v2x_) *0.5, (v1y_ + v2y_) *0.5];
                }

            } else if (d1_ > 1 && d2_ > 1) { //are bouth vectors in motion

                //normalize vectors
                var nv1x_ = v1x_ / d1_;
                var nv1y_ = v1y_ / d1_;

                var nv2x_ = v2x_ / d2_;
                var nv2y_ = v2y_ / d2_;
                
                //do vectors move in same direction
                var cosAngle_ = nv1x_ * nv2x_ + nv1y_ * nv2y_;
                
                if (cosAngle_ < 0.2) {
                    mode_ = "zoom";
                } else {
                    panDelta_ = [(v1x_ + v2x_) *0.5, (v1y_ + v2y_) *0.5];
                } 
            }
            
            //if (mode_ == "zoom") {
                var t = this.dragTouches_;
                var t2 = this.dragTouches2_;

                //get distance between points at the beginig
                var dx_ = (t2[0][0] - t[0][0]);
                var dy_ = (t2[0][1] - t[0][1]);
                var d1_ = Math.sqrt(dx_ * dx_ + dy_ * dy_);

                //get distance between points at the end
                var dx_ = (t2[5][0] - t[5][0]);
                var dy_ = (t2[5][1] - t[5][1]);
                var d2_ = Math.sqrt(dx_ * dx_ + dy_ * dy_);

                //get delta betwwen distances
                distanceDelta_ = d2_ - d1_;   
            //}  
        }
    }

    this.fire("drag", {
        "clientX" : pos_[0],
        "clientY" : pos_[1],
        "deltaX" : pos_[0] - this.dragLastPos_[0],
        "deltaY" : pos_[1] - this.dragLastPos_[1],
        "left" : this.dragButtons_["left"],
        "right" : this.dragButtons_["right"],
        "middle" : this.dragButtons_["middle"],
        "zoom" : zoom_,
        "touchMode" : mode_,
        "touchPanDelta" : panDelta_,
        "touchRotateDelta" : rotateDelta_,
        "touchDistanceDelta" : distanceDelta_,
        "touches" : touchCount_  
        });

    //
    //el_.innerHTML = "rotDelta" + rotateDelta_;

    this.dragLastPos_ = this.dragCurrentPos_;
    this.dragCurrentPos_ = [pos_[0], pos_[1]];
    this.dragAbsMoved_[0] += Math.abs(pos_[0] - this.dragLastPos_[0]);
    this.dragAbsMoved_[1] += Math.abs(pos_[1] - this.dragLastPos_[1]);
};

//Melown.debugCoutner = 0;

Melown.UIElement.prototype.onDragEnd = function(event_) {
    //this.dragButtons_[event_.getMouseButton()] = false;
    //console.log("end: 1#:  " + JSON.stringify(this.dragButtons_));

    var left_ = this.dragButtons_["left"];
    var right_ = this.dragButtons_["right"];
    var middle_ = this.dragButtons_["middle"];

    this.updateDragButtonsState(event_, false);

    //if (event_.getTouchesCount() == 2) {
        this.dragTouches_ = [];
        this.dragTouches2_ = [];
        this.dragTouches_.push(event_.getTouchCoords(0));            
        this.dragTouches2_.push(event_.getTouchCoords(1));            
    //}

    //console.log("end: 2#:  " + JSON.stringify(this.dragButtons_));

    this.resetPos_ = true;

    this.firstDragDistance_ = 0;
    this.lastDragDistance_ = 0;
    this.zoomDrag_ = false;


    if (this.dragging_ == true) {
        var pos_ = event_.getMouseCoords();
        this.dragLastPos_ = pos_;

        if (!this.dragButtons_["left"] &&
            !this.dragButtons_["right"] &&
            !this.dragButtons_["middle"] ) {

            this.dragging_ = false;
            var pos_ = this.dragCurrentPos_;//event_.getMouseCoords();
            this.off("mousemove", this.dragMoveCall_, document);
            this.off("mouseup", this.dragEndCall_, document);
            //this.off("mouseup", this.onDragEnd.bind(this), document);

            this.off("touchmove", this.dragMoveCall_, document);
            this.off("touchend", this.dragEndCall_, document);

            Melown.Utils.enableTextSelection();
            Melown.Utils.enableImageDrag();
            //Melown.Utils.enableContexMenu();
            Melown.Utils.preventDefault(event_);

            this.fire("dragend", {
                "clientX" : pos_[0],
                "clientY" : pos_[1],
                "left" : left_,
                "right" : right_,
                "middle" : middle_
                });
        }
    }
};

Melown.UIElement.prototype.updateDragButtonsState = function(event_, state_) {
    switch(event_.getTouchesCount()) {
        case -1: this.dragButtons_[event_.getMouseButton()] = state_; break;
        case 0: this.dragButtons_ = { "left" : false, "right" : false, "middle" : false }; break;
        case 1: this.dragButtons_ = { "left" : true, "right" : false, "middle" : false }; break;
        case 2: this.dragButtons_ = { "left" : false, "right" : true, "middle" : false }; break;
        case 3: this.dragButtons_ = { "left" : false, "right" : false, "middle" : true }; break;
    }        
};



Melown.UIElement.prototype.setDraggableState = function(state_) {
    if (state_) {
        this.on("mousedown", this.dragBeginCall_);
        this.on("touchstart", this.dragBeginCall_);
    } else if (this.dragable_){
        this.off("mousedown", this.dragBeginCall_);
        this.off("mousemove", this.dragMoveCall_, document);
        //this.off("mouseup", this.onDragEnd.bind(this));
        this.off("mouseup", this.dragEndCall_, document);
        
        this.off("touchstart", this.dragBeginCall_);
        this.off("touchmove", this.dragMoveCall_, document);
        this.off("touchend", this.dragEndCall_, document);
        
        this.dragging_ = false;
    }

    this.dragable_ = state_;
    this.dragButtons_ = {
      "left" : false,
      "right" : false,
      "middle" : false
    };
};

//prevent minification
Melown.UIElement.prototype["setDraggableState"] = Melown.UIElement.prototype.setDraggableState; 
Melown.UIElement.prototype["getDraggableState"] = Melown.UIElement.prototype.getDraggableState; 
Melown.UIElement.prototype["getDraggingState"] = Melown.UIElement.prototype.getDraggingState; 



