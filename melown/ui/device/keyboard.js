/**
 * @constructor
 */
Melown.UIDeviceKeyboard = function(ui_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.core_ = this.browser_.core_;
    this.altDown_ = false;
    this.ctrlDown_ = false;
    this.shiftDown_ = false;
    this.onKeyUpCall_ = this.onKeyUp.bind(this);
    this.onKeyDownCall_ = this.onKeyDown.bind(this);
    this.onKeyPressCall_ = this.onKeyPress.bind(this);
};

Melown.UIDeviceKeyboard.prototype.attachToElement = function(element_) {
    if (element_ == null) {
        return;
    }

    element_.addEventListener("keyup", this.onKeyUpCall_);
    element_.addEventListener("keydown", this.onKeyDownCall_);
    element_.addEventListener("keypress", this.onKeyPressCall_);
};

Melown.UIDeviceKeyboard.prototype.detachFromElement = function(element_) {
    if (element_ == null) {
        return;
    }

    element_.removeEventListener("keyup", this.onKeyUpCall_);
    element_.removeEventListener("keydown", this.onKeyDownCall_);
    element_.removeEventListener("keypress", this.onKeyPressCall_);
    element_.onselectstart = null;
};

Melown.UIDeviceKeyboard.prototype.onKeyDown = function(event_) {
    if (typeof event_ == 'undefined') {
        event_ = window.event;
    }

    this.onKeyUp(event_, true);
};

Melown.UIDeviceKeyboard.prototype.onKeyPress = function(event_) {
    this.onKeyUp(event_, true);
};

Melown.UIDeviceKeyboard.prototype.onKeyUp = function(event_, press_) {
    if (typeof event_ == 'undefined') {
        event_ = window.event;
    }

    if (event_) {
        this.updateModifierKeys();

        var keyCode_;

        if (window.event) {         // eg. IE
            keyCode_ = window.event.keyCode;
        } else if (event_.which) {   // eg. Firefox
            keyCode_ = event_.which;
        } else {
            keyCode_ = event_.charCode;
        }
    }

    this.browser_.callListener(this.ui_.getContext() + "-key-up", { keyCode_: keyCode_ });
    //console.log("key" + keyCode_);
};

Melown.UIDeviceKeyboard.isShiftDown = function() {
    return this.shiftDown_;
};

Melown.UIDeviceKeyboard.updateModifierKeys = function(event_) {
    this.altDown_ = event_.altKey;
    this.ctrlDown_ = event_.ctrlKey;
    this.shiftDown_ = event_.shiftKey;
};




