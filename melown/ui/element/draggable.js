
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

Melown.UIElement.prototype.getDraggableState = function() {
    return this.dragable_;
};

Melown.UIElement.prototype.onDragBegin = function(event_) {
    this.dragButtons_[event_.getMouseButton()] = true;
    this.firstDragDistance_ = 0;
    this.lastDragDistance_ = 0;
    this.zoomDrag_ = false;

    if (this.dragging_ != true) {
        this.dragging_ = true;
        var pos_ = event_.getMouseCoords(true);
        this.lastDragPos_ = pos_;
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
        this.lastDragPos_ = pos_;
    }

};

Melown.UIElement.prototype.onDragMove = function(event_) {
    var pos_ = event_.getMouseCoords();
    this.updateDragButtonsState(event_, true);

    Melown.Utils.preventDefault(event_);

    var zoom_ = 0;

    if (event_.getTouchesCount() == 2) {
        var p1_ = event_.getTouchCoords(0); 
        var p2_ = event_.getTouchCoords(1); 
        var dx_ = p2_[0] - p1_[0];
        var dy_ = p2_[1] - p1_[1];
        var distance_ = Math.sqrt(dx_ * dx_ + dy_* dy_); 

        if (this.firstDragDistance_ == 0) {
            this.firstDragDistance_ = distance_;
        }

        if (!this.zoomDrag_ && Math.abs(this.firstDragDistance_ - distance_) > 25) {
            this.zoomDrag_ = true;
            this.firstDragDistance_ = distance_;
            this.lastDragDistance_ = distance_;
            //zoom_ = 1.0;
        } else {
            zoom_ = this.zoomDrag_ ? (distance_ / this.lastDragDistance_) : 0; 
            this.lastDragDistance_ = distance_;
        }
    }

    this.fire("drag", {
        "clientX" : pos_[0],
        "clientY" : pos_[1],
        "deltaX" : pos_[0] - this.lastDragPos_[0],
        "deltaY" : pos_[1] - this.lastDragPos_[1],
        "left" : this.dragButtons_["left"],
        "right" : this.dragButtons_["right"],
        "middle" : this.dragButtons_["middle"],
        "zoom" : zoom_
        });

    this.lastDragPos_ = pos_;
};

Melown.UIElement.prototype.onDragEnd = function(event_) {
    //this.dragButtons_[event_.getMouseButton()] = false;
    this.updateDragButtonsState(event_, false);
    this.firstDragDistance_ = 0;
    this.lastDragDistance_ = 0;
    this.zoomDrag_ = false;

    if (this.dragging_ == true) {
        var pos_ = event_.getMouseCoords();
        this.lastDragPos_ = pos_;

        if (!this.dragButtons_["left"] &&
            !this.dragButtons_["right"] &&
            !this.dragButtons_["middle"] ) {

            this.dragging_ = false;
            var pos_ = event_.getMouseCoords();
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
                "clientY" : pos_[1]
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




