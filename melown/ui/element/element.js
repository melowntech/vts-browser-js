/**
 * @constructor
 */
Melown.UIElement = function(control_, element_) {
    this.control_ = control_;
    this.ui_ = this.control_.ui_;
    this.element_ = element_;
    this.events_ = [];
    this.dragBeginCall_ = this.onDragBegin.bind(this);
    this.dragMoveCall_ = this.onDragMove.bind(this);
    this.dragEndCall_ = this.onDragEnd.bind(this);
};

Melown.UIElement.prototype.setStyle = function(key_, value_) {
    this.element_.style[key_] = value_;
};




