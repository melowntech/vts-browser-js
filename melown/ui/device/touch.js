/**
 * @constructor
 */
Melown.UIDeviceTouch = function(ui_) {
    this.ui_ = ui_;
    this.mouse_ = ui.mouse_;
    this.inputMode_ = "down";
    this.lockTouch_ = "";
    this.maxTouches_ = 0;
    this.lastTouchDistance_ = 0;
    this.mouseLeftDown_ = false;
    this.mouseRightDown_ = false;
    this.onTouchStartCall_ = this.onTouchStart.bind(this);
    this.onTouchMoveCall_ = this.onTouchMove.bind(this);
    this.onTouchEndCall_ = this.onTouchEnd.bind(this);
};

Melown.UIDeviceTouch.prototype.attachToElement = function(element_) {
    if (element_ == null) {
        return;
    }

    element_.addEventListener("touchstart", this.onTouchStartCall_);
    element_.addEventListener("touchmove", this.onTouchMoveCall_);
    element_.addEventListener("touchend", this.onTouchEndCall_);
};

Melown.UIDeviceTouch.prototype.detachFromElement = function(element_) {
    if (element_ == null) {
        return;
    }

    element_.removeEventListener("touchstart", this.onTouchStartCall_);
    element_.removeEventListener("touchmove", this.onTouchMoveCall_);
    element_.removeEventListener("touchend", this.onTouchEndCall_);
};

Melown.UIDeviceTouch.prototype.onTouchStart = function(evt_) {
    this.inputMode_ = "down";
    this.lockTouch_ = "";
    this.maxTouches_ = evt_.touches.length;
    this.lastTouchDistance_ = 0;

    var touch_ = evt_.touches[0],
        bcr_ = this.element_.getBoundingClientRect(),
        x = (touch_.clientX - bcr_.left),
        y = (touch_.clientY - bcr_.top);

    if (this.inputMode_ == "down") {
        this.mouse_.coords_ = [x,y];
        this.mouse_.lastCoords_ = [x,y];
        this.mouse_.movement_ = [0,0];
    }

    document.ontouchend = this.onTouchEnd.bind(this);

    this.onMouseDown({button:1}, true);
};

Melown.UIDeviceTouch.prototype.onTouchMove = function(evt_) {
    evt_.preventDefault();

    if (this.inputMode_ == "") {
        return;
    }

    if (evt_.touches.length > this.maxTouches_) {
        this.maxTouches_ = evt_.touches.length;
    }

    var touch_ = evt_.touches[0],
        bcr_ = this.element_.getBoundingClientRect(),
        x = (touch_.clientX - bcr_.left),
        y = (touch_.clientY - bcr_.top);

    //two fingers are right mouse button
    if (evt_.touches.length == 2) {
        if (this.mouseRightDown_ != true) {

            var touch2_ = evt_.touches[1],
                x2_ = (touch2_.clientX - bcr_.left),
                y2_ = (touch2_.clientY - bcr_.top),
                dx_ = (x2_ - x),
                dy_ = (y2_ - y),
                distance_ = 0;

            if (isNaN(dx_) != true && isNaN(dy_) != true) {
                distance_ = Math.sqrt(dx_*dx_ + dy_*dy_);
            }

            this.lastTouchDistance_ = distance_;

            this.onMouseDown({button:2}, true);
        }
        if (this.mouseLeftDown_ == true) {
            this.onMouseUp({button:1}, true);
        }
    } else if (evt_.touches.length == 1) {
        this.lastTouchDistance_ = 0;

        if (this.inputMode_ == "pinch") {
            this.inputMode_ = "drag";
        }

        if (this.mouseLeftDown_ != true) {
            this.onMouseUp({button:1}, true);
        }
        if (this.mouseRightDown_ == true) {
            this.onMouseUp({button:2}, true);
        }
    }

    if (this.inputMode_ == "down") {
        this.mouseLX_ = newX_;
        this.mouseLY_ = newY_;
        this.mouseX_ = newX_;
        this.mouseY_ = newY_;
        this.mouseDX_ = 0;
        this.mouseDY_ = 0;
        this.inputMode_ = "drag";
    } else if (this.inputMode_ == "drag" || this.inputMode_ == "pinch") {

        if (evt_.touches.length > 1) {

            var touch2_ = evt_.touches[1];
            var newX2_ = (touch2_.clientX - bcr_.left);
            var newY2_ = (touch2_.clientY - bcr_.top);

            var dx_ = (newX2_ - newX_);
            var dy_ = (newY2_ - newY_);
            var distance_ = 0;

            if (isNaN(dx_) != true && isNaN(dy_) != true) {
                distance_ = Math.sqrt(dx_*dx_ + dy_*dy_);
            }

            if (isNaN(distance_) != true && ((Math.abs(distance_ - this.lastTouchDistance_)  > 40.0 && this.inputMode_ == "drag") || (Math.abs(distance_ - this.lastTouchDistance_)  > 20.0 && this.inputMode_ == "pinch")) ) {

                this.inputMode_ = "pinch";
                //document.getElementById("Melown-engine-debug-text").innerHTML = "touch pinch:  delta " + ((distance_ - this.lastTouchDistance_)*6);

                var delta_ = Math.abs(distance_ - this.lastTouchDistance_);

                if (delta_  > 60.0) {
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                } else if (delta_  > 40.0) {
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                } else {
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                    this.onMouseWheel({wheelDelta: ((distance_ - this.lastTouchDistance_)*6)}, true);
                }

                this.lastTouchDistance_ = distance_;
            }
        }

        if (this.inputMode_ == "drag") {
            this.onMouseMove({clientX: newX_, clientY: newY_}, true);
        }

    }

};

Melown.UIDeviceTouch.prototype.onTouchEnd = function(evt_) {
    this.inputMode_ = "";

    if (this.mouseLeftDown_ == true) {
        this.onMouseUp({button:1}, true);
    }

    if (this.mouseRightDown_ == true) {
        this.onMouseUp({button:2}, true);
    }

    var timer_ = (new Date()).getTime();

    if (this.maxTouches_ == 1 && (timer_ - this.lastTouchTimer_) < 300) {
        this.onDoubleClick({}, true);
    }

    this.maxTouches_ = 0;
    this.lastTouchTimer_ = timer_;
    this.lastTouchDistance_ = 0;

    document.ontouchend = null;
};
