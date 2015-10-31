
Melown.UIElement.prototype.setDraggableState = function(state_) {
    if (state_) {
        this.on("mousedown", this.onDragBegin.bind(this));
    } else if (this.dragable_){
        this.off("mousedown", this.onDragBegin.bind(this));
        this.off("mousemove", this.onDragMove.bind(this));
        this.off("mouseup", this.onDragEnd.bind(this));
        this.off("mouseup", this.onDragEnd.bind(this), document);
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
        var pos_ = event_.getMousePosition();
        this.lastDragPos_ = pos_;
        this.on("mousemove", this.onDrag.bind(this));
        this.on("mousedup", this.onDragEnd.bind(this));
        this.on("mousedup", this.onDragEnd.bind(this), document);

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
        "deltaY" : pos_[1] - this.lastDragPos_[1]
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
            this.off("mousemove", this.onDragMove.bind(this));
            this.off("mouseup", this.onDragEnd.bind(this));
            this.off("mouseup", this.onDragEnd.bind(this), document);

            this.fire("dragend", {
                "clientX" : pos_[0],
                "clientY" : pos_[1]
                });
        }
    }
};






