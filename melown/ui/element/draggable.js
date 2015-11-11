
Melown.UIElement.prototype.setDraggableState = function(state_) {
    if (state_) {
        this.on("mousedown", this.dragBeginCall_);
    } else if (this.dragable_){
        this.off("mousedown", this.dragBeginCall_);
        this.off("mousemove", this.dragMoveCall_, document);
        //this.off("mouseup", this.onDragEnd.bind(this));
        this.off("mouseup", this.dragEndCall_, document);
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

    if (this.dragging_ != true) {
        this.dragging_ = true;
        var pos_ = event_.getMousePosition(true);
        this.lastDragPos_ = pos_;
        this.on("mousemove", this.dragMoveCall_, document);
        this.on("mouseup", this.dragEndCall_, document);
        //this.on("mouseup", this.onDragEnd.bind(this), document);

        Melown.Utils.disableTextSelection();
        Melown.Utils.disableImageDrag();
        //Melown.Utils.disableContexMenu();

        this.fire("dragstart", {
            "clientX" : pos_[0],
            "clientY" : pos_[1]
            });
    }

};

Melown.UIElement.prototype.onDragMove = function(event_) {
    var pos_ = event_.getMousePosition();

    this.fire("drag", {
        "clientX" : pos_[0],
        "clientY" : pos_[1],
        "deltaX" : pos_[0] - this.lastDragPos_[0],
        "deltaY" : pos_[1] - this.lastDragPos_[1],
        "left" : this.dragButtons_["left"],
        "right" : this.dragButtons_["right"],
        "middle" : this.dragButtons_["middle"]
        });

    this.lastDragPos_ = pos_;
};

Melown.UIElement.prototype.onDragEnd = function(event_) {
    this.dragButtons_[event_.getMouseButton()] = false;

    if (this.dragging_ == true) {
        if (!this.dragButtons_["left"] &&
            !this.dragButtons_["right"] &&
            !this.dragButtons_["middle"] ) {

            this.dragging_ = false;
            var pos_ = event_.getMousePosition();
            this.off("mousemove", this.dragMoveCall_, document);
            this.off("mouseup", this.dragEndCall_, document);
            //this.off("mouseup", this.onDragEnd.bind(this), document);

            Melown.Utils.enableTextSelection();
            Melown.Utils.enableImageDrag();
            //Melown.Utils.enableContexMenu();

            this.fire("dragend", {
                "clientX" : pos_[0],
                "clientY" : pos_[1]
                });
        }
    }
};






