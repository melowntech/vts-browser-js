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
    this.firstDragDistance_ = 0;
    this.lastDragDistance_ = 0;
    this.zoomDrag_ = false;
};

Melown.UIElement.prototype.setStyle = function(key_, value_) {
    this.element_.style[key_] = value_;
};

Melown.UIElement.prototype.getStyle = function(key_) {
    return this.element_.style[key_];
};

Melown.UIElement.prototype.setClass = function(name_) {
    Melown.Utils.setClass(this.element_, name_);
    return this;
};

Melown.UIElement.prototype.getClass = function() {
    Melown.Utils.getClass(this.element_);
    return this;
};

Melown.UIElement.prototype.hasClass = function(name__) {
    return Melown.Utils.hasClass(this.element_, name_);
};

Melown.UIElement.prototype.addClass = function(name_) {
    Melown.Utils.addClass(this.element_, name_);
    return this;
};

Melown.UIElement.prototype.removeClass = function(name_) {
    Melown.Utils.removeClass(this.element_, name_);
    return this;
};

Melown.UIElement.prototype.setHTML = function(html_) {
    this.element_.innerHTML = html_;
};

Melown.UIElement.prototype.getHTML = function() {
    return this.element_.innerHTML;
};

Melown.UIElement.prototype.getElement = function() {
    return this.element_;
};

//prevent minification
Melown.UIElement.prototype["setHtml"] = Melown.UIElement.prototype.setHtml; 
Melown.UIElement.prototype["getHtml"] = Melown.UIElement.prototype.getHtml; 
Melown.UIElement.prototype["getElement"] = Melown.UIElement.prototype.getElement; 
Melown.UIElement.prototype["setClass"] = Melown.UIElement.prototype.setClass; 
Melown.UIElement.prototype["getClass"] = Melown.UIElement.prototype.getClass; 
Melown.UIElement.prototype["setStyle"] = Melown.UIElement.prototype.setStyle; 
Melown.UIElement.prototype["getStyle"] = Melown.UIElement.prototype.getStyle; 
Melown.UIElement.prototype["addClass"] = Melown.UIElement.prototype.addClass; 
Melown.UIElement.prototype["hasClass"] = Melown.UIElement.prototype.hasClass; 
Melown.UIElement.prototype["removeClass"] = Melown.UIElement.prototype.removeClass; 

