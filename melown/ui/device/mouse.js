/**
 * @constructor
 */
Melown.UIDeviceMouse = function(ui_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.core_ = this.browser_.core_;
    this.coords_ = [0,0];
    this.lasCoords_ = [0,0];
    this.movement_ = [0,0];
    this.onMouseUpCall_ = this.onMouseUp.bind(this);
    this.onMouseDownCall_ = this.onMouseDown.bind(this);
    this.onMouseMoveCall_ = this.onMouseMove.bind(this);
    this.onMouseWheelCall_ = this.onMouseWheel.bind(this);
};

Melown.UIDeviceMouse.prototype.attachToElement = function(element_, allowSelection_) {
    if (element_ == null) {
        return;
    }

    element_.addEventListener("mouseup", this.onMouseUpCall_);
    element_.addEventListener("mousedown", this.onMouseDownCall_);
    element_.addEventListener("mousemove", this.onMouseMoveCall_);
    element_.addEventListener("mousewheel", this.onMouseWheelCall_);
    element_.addEventListener("DOMMouseScroll", this.onMouseWheelCall_); //firefox version

    if (allowSelection_ == true) { //removes text cusor during draging
        element_.onselectstart = function(){ return false; };
    }
};

Melown.UIDeviceMouse.prototype.detachFromElement = function(element_, allowSelection_) {
    if (element_ == null) {
        return;
    }

    element_.removeEventListener("mouseup", this.onMouseUpCall_);
    element_.removeEventListener("mousedown", this.onMouseDownCall_);
    element_.removeEventListener("mousemove", this.onMouseMoveCall_);
    element_.removeEventListener("mousewheel", this.onMouseWheelCall_);
    element_.removeEventListener("DOMMouseScroll", this.onMouseWheelCall_);
    element_.onselectstart = null;
};

Melown.UIDeviceMouse.prototype.getState = function(rightButton_, delta_) {
    var state_ =  {
        coords_ : this.coors_.slice(),
        lastCoords_ : this.coors_.slice(),
        movement_ : this.movement_.slice()
    };

    if (rightButton_ !== null) {
        state_.rightButton_ = rightButton_;
    }

    if (delta_ !== null) {
        state_.wheel_ = delta_;
    }
};

Melown.UIDeviceMouse.prototype.onMouseUp = function(event_) {
    var right_ = false;
    var e = event_ || window.event;

    if (e.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        right_ = e.which == 3;
    } else if (e.button) { // IE, Opera
        right_ = e.button == 2;
    }

    this.browser_.callListener(this.ui_.getContext() + "-mouse-up", this.getState(right_));
};

Melown.UIDeviceMouse.prototype.onMouseDown = function(event_) {
    var right_ = false;
    var e = event_ || window.event;

    //
    this.ui_.keyboard_.updateModifierKeys(e);
    /*
    this.altDown_ = e.altKey;
    this.ctrlDown_ = e.ctrlKey;
    this.shiftDown_ = e.shiftKey;
    */

    if (e.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        right_ = e.which == 3;
    } else if (e.button) { // IE, Opera
        right_ = e.button == 2;
    }

    this.browser_.callListener(this.ui_.getContext() + "-mouse-down", this.getState(right_));
};

Melown.UIDeviceMouse.prototype.onMouseMove = function(event_) {
    this.lastCoords_ = this.coords_;
    this.coords_= [event_.clientX, event_.clientY];
    this.movement_ = [event_.clientX - this.lastCoords_[0], event_.clientY - this.lastCoords_[1]];
    this.browser_.callListener(this.ui_.getContext() + "-mouse-move", this.getState(null));
};

Melown.UIDeviceMouse.prototype.onMouseWheel = function(event_) {
    if (event_.preventDefault) {
        event_.preventDefault();
    }

    event_.returnValue = false;

    var delta_ = 0;
    var w = event.wheelDelta;
    var d = event.detail;

    if (d) {
        if (w) delta_ = w/d/40*(d>=0?1:-1); // Opera
        else delta_ = -d/3;                 // Firefox;         TO_DO: do not /3 for OS X
    } else {
        delta_ = w/120;                     // IE/Safari/Chrome TO_DO: /3 for Chrome OS X
    }

    if (isNaN(delta_) == true) {
        delta_ = 0;
    }

    this.browser_.callListener(this.ui_.getContext() + "-mouse-wheel", this.getState(null, delta_));
};


