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
    this.dragStartPos_ = [0,0];
    this.dragCurrentPos_ = [0,0];
    this.dragLastPos_ = [0,0];
    this.dragAbsMoved_ = [0,0];
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

Melown.UIElement.prototype.hasClass = function(name_) {
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

Melown.UIElement.prototype.getRect = function() {
    var rect_ = this.element_.getBoundingClientRect();
    var rect2_ = this.ui_.element_.getBoundingClientRect();
    var offsetX_ = window.pageXOffset || 0;
    var offsetY_ = window.pageYOffset || 0;
    return {
        "left" : (rect_.left + offsetX_) - (rect2_.left + offsetX_), 
        "top" : (rect_.top + offsetY_) - (rect2_.top + offsetY_), 
        "fromRight" : rect2_.right - (rect_.left + offsetX_) - (rect2_.left + offsetX_), 
        "fromBottom" : rect2_.height - ((rect_.top + offsetY_) - (rect2_.top + offsetY_)),
        "width" : rect_.width, 
        "height" : rect_.height 
    };
};

Melown.UIElement.prototype.setHtml = function(html_) {
    this.element_.innerHTML = html_;
    
    var allElements_ = this.element_.getElementsByTagName('*');

    //store all elements with id attribute to the table
    for (var i = 0, li = allElements_.length; i < li; i++) {
        var id_ = allElements_[i].getAttribute("id");

        if (id_ !== null) {
            //store element to the table
            this.control_.elementsById_[id_] = new Melown.UIElement(this, allElements_[i]);
        }
    }    
};

Melown.UIElement.prototype.getHtml = function() {
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
Melown.UIElement.prototype["getRect"] = Melown.UIElement.prototype.getRect; 
Melown.UIElement.prototype["removeClass"] = Melown.UIElement.prototype.removeClass; 

