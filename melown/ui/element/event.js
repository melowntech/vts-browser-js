/**
 * @constructor
 */
Melown.UIEvent = function(type_, element_, event_) {
    this.type_ = event_;
    this.event_ = event_;
    this.element_ = event_;
};

Melown.UIEvent.prototype.getMouseButton = function() {

    switch(this.event_.which) {
        case 1: return "left";
        case 2: return "middle";
        case 3: return "right";
    }

    return "";
};

Melown.UIEvent.prototype.getMousePosition = function() {
    switch (this.type_) {
        case "mousedown":
        case "mouseup":
        case "mousemove":
        case "dragstart":
        case "dragend":
        case "drag":

            var rect_ = this.element_.getBoundingClientRect();

            return [ this.event_.clientX - rect_.left,
                     this.event_.clientY - rect_.top ];
    }

    return [0,0];
};

Melown.UIEvent.prototype.getDragDelta = function() {
    switch (this.type_) {
        case "drag":

            return [ this.event_.deltaX,
                     this.event_.deltaY];
    }

    return [0,0];
};

Melown.UIEvent.prototype.getWheelDelta = function() {
    switch (this.type_) {
        case "wheel":

            var delta = 0;

            if (this.event_.wheelDelta) {
                delta = this.event_.wheelDelta / 120;
            }
            if (this.event_.detail) {
                delta = -this.event_.detail / 3;
            }

            return delta;
    }

    return 0;
};





