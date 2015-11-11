/**
 * @constructor
 */
Melown.UIEvent = function(type_, element_, event_) {
    this.type_ = type_;
    this.event_ = event_;
    this.element_ = element_;
};

Melown.UIEvent.prototype.getMouseButton = function() {

    switch(this.event_.which) {
        case 1: return "left";
        case 2: return "middle";
        case 3: return "right";
    }

    return "";
};

Melown.UIEvent.prototype.getMousePosition = function(absolute_) {
    switch (this.type_) {
        case "mousedown":
        case "mouseup":
        case "mousemove":
        case "dragstart":
        case "dragend":
        case "drag":

            if (this.element_.getBoundingClientRect == null || absolute_) {
                return [ this.event_.clientX,
                         this.event_.clientY ];
            } else {
                var rect_ = this.element_.getBoundingClientRect();

                return [ this.event_.clientX - rect_.left,
                         this.event_.clientY - rect_.top ];
            }

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

Melown.UIEvent.prototype.getDragButton = function(button_) {
    switch(button_) {
        case "left": return this.event_.left;
        case "right": return this.event_.right;
        case "middle": return this.event_.middle;
    }

    return false;
};


Melown.UIEvent.prototype.getWheelDelta = function() {
    switch (this.type_) {
        case "mousewheel":

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





