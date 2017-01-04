/**
 * @constructor
 */
Melown.UIEvent = function(type_, element_, event_) {
    this.type_ = type_;
    this.event_ = event_;
    this.element_ = element_;
};

Melown.UIEvent.prototype.getMouseButton = function() {
    switch (this.type_) {
        case "touchstart":
        case "touchend":
        case "touchmove":

            var touches_ = this.event_["touches"];
            
            if (touches_) {
                switch(touches_.length) {
                    case 1: return "left";
                    case 2: return "right";
                    case 3: return "middle";
                }
            }   

        default:
    
            if (this.event_.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                //right_ = e.which == 3;
        
                switch(this.event_.which) {
                    case 1: return "left";
                    case 2: return "middle";
                    case 3: return "right";
                }
        
            } else if (this.event_.button) { // IE, Opera
                //right_ = e.button == 2;
        
                switch(this.event_.button) {
                    case 1: return "left";
                    case 2: return "right";
                    case 3: return "middle";
                }
            }
    
    }

    return "";
};

Melown.UIEvent.prototype.getMouseCoords = function(absolute_) {
    var event_ = null;

    switch (this.type_) {
        case "touchstart":
        case "touchend":
        case "touchmove":

            var touches_ = this.event_["touches"];
            if (!touches_ || touches_.length == 0) {
                break;
            }
            
            var pos_ = [0,0];
            
            for (var i = 0, li = touches_.length; i < li; i++) {
                var pos2_ = this.getEventCoords(this.event_["touches"][i], absolute_);
                pos_[0] += pos2_[0];   
                pos_[1] += pos2_[1];   
            }
            
            pos_[0] /= li;
            pos_[1] /= li;
            return pos_;    

        case "mousedown":
        case "mouseup":
        case "mousemove":
        case "dblclick":
        case "dragstart":
        case "dragend":
        case "drag":

            return this.getEventCoords(this.event_, absolute_);
            break;

    }

    return [0,0];
};

Melown.UIEvent.prototype.getEventCoords = function(event_, absolute_) {
    if (this.element_.getBoundingClientRect == null || absolute_) {
        return [ event_["clientX"],
                 event_["clientY"] ];
    } else {
        var rect_ = this.element_.getBoundingClientRect();

        return [ event_["clientX"] - rect_.left,
                 event_["clientY"] - rect_.top ];
    }
};

Melown.UIEvent.prototype.getDragDelta = function() {
    switch (this.type_) {
        case "drag":

            return [ this.event_["deltaX"],
                     this.event_["deltaY"] ];
    }

    return [0,0];
};

Melown.UIEvent.prototype.getDragZoom = function() {
    switch (this.type_) {
        case "drag":
            return this.event_["zoom"];
    }
    
    return 1.0;
};

Melown.UIEvent.prototype.getDragTouches = function() {
    switch (this.type_) {
        case "drag":
            return this.event_["touches"];
    }
    
    return 0;
};

Melown.UIEvent.prototype.getModifierKey = function(key_) {
    switch (this.type_) {
        case "mouseup":
        case "mousedown":
        case "dblclick":
        case "keyup":
        case "keydown":
        case "keypress":

            switch(key_) {
                case "alt":   return this.event_.altKey;
                case "ctrl":  return this.event_.ctrlKey;
                case "shift": return this.event_.shiftKey;
            }
    }

    return false;
};

Melown.UIEvent.prototype.getKeyCode = function() {
    switch (this.type_) {
        case "keyup":
        case "keydown":
        case "keypress":
        
            if (this.event_.keyCode) {         // eg. IE
                return this.event_.keyCode;
            } else if (this.event_.which) {   // eg. Firefox
                return this.event_.which;
            } else {
                return this.event_.charCode;
            }
    }
    
    return null;
};

Melown.UIEvent.prototype.getDragButton = function(button_) {
    switch(button_) {
        case "left": 
        case "right":
        case "middle":
            
            switch(this.getTouchesCount()) {
                case -1: return this.event_[button_];
                case 0: return false;
                case 1: return button_ == "left";
                case 2: return button_ == "right";
                case 3: return button_ == "middle";
            }
        
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

Melown.UIEvent.prototype.getTouchesCount = function() {
    switch (this.type_) {
        case "touchstart":
        case "touchend":
        case "touchmove":

            var touches_ = this.event_["touches"];
            if (!touches_) {
                break;
            }
            
            return this.event_["touches"].length;    
    }
    
    return -1;
};

Melown.UIEvent.prototype.getTouchCoords = function(index_, absolute_) {
    switch (this.type_) {
        case "touchstart":
        case "touchend":
        case "touchmove":

            var touches_ = this.event_["touches"];
            if (!touches_) {
                break;
            }
            
            var event_ = this.event_["touches"][index_];    
            if (!event_) {
                break;
            }

            if (this.element_.getBoundingClientRect == null || absolute_) {
                return [ event_["clientX"],
                         event_["clientY"] ];
            } else {
                var rect_ = this.element_.getBoundingClientRect();

                return [ event_["clientX"] - rect_.left,
                         event_["clientY"] - rect_.top ];
            }
    }

    return [0,0];
};

Melown.UIEvent.prototype.getType = function() {
    return this.type_;
};

//prevent minification
Melown.UIEvent.prototype["getMouseButton"] = Melown.UIEvent.prototype.getMouseButton;
Melown.UIEvent.prototype["getMouseCoords"] = Melown.UIEvent.prototype.getMouseCoords;
Melown.UIEvent.prototype["getDragDelta"] = Melown.UIEvent.prototype.getDragDelta;
Melown.UIEvent.prototype["getModifierKey"] = Melown.UIEvent.prototype.getModifierKey;
Melown.UIEvent.prototype["getKeyCode"] = Melown.UIEvent.prototype.getKeyCode;
Melown.UIEvent.prototype["getDragButton"] = Melown.UIEvent.prototype.getDragButton;
Melown.UIEvent.prototype["getWheelDelta"] = Melown.UIEvent.prototype.getWheelDelta;
Melown.UIEvent.prototype["getDragZoom"] = Melown.UIEvent.prototype.getDragZoom;
Melown.UIEvent.prototype["getDragTuches"] = Melown.UIEvent.prototype.getDragTuches;
Melown.UIEvent.prototype["getTouchesCount"] = Melown.UIEvent.prototype.getTouchesCount;
Melown.UIEvent.prototype["getTouchCoords"] = Melown.UIEvent.prototype.getTouchCoords;
Melown.UIEvent.prototype["getType"] = Melown.UIEvent.prototype.getType;


