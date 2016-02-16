
Melown.UIElement.prototype.on = function(type_, function_, externalElement_) {
    this.addEvent(type_, function_, externalElement_);
};

Melown.UIElement.prototype.once = function(type_, function_, externalElement_) {
    var removeEventCall_ = (function() {
        this.removeEvent(type_, function_, externalElement_);
    }).bind(this);

    var handler_ = function(e) {
        function_(e);
        removeEventCall_();
    };

    this.addEvent(type_, handler_, externalElement_);
};

Melown.UIElement.prototype.off = function(type_, function_, externalElement_) {
    this.removeEvent(type_, function_, externalElement_);
};

Melown.UIElement.prototype.fire = function(type_, event_) {
    var hooks_ = this.events_[type_];

    if (hooks_ != null) {
        for (var hook_ in hooks_) {
            hooks_[hook_](event_);
        }
    }
};

Melown.UIElement.prototype.addEvent = function(type_, function_, externalElement_) {
    var id_ = type_ + "-" + Melown.Utils.stamp(function_)
              + (externalElement_ ? ("-" + Melown.Utils.stamp(externalElement_)) : "");

    var handler_ = function(e) {
//        function_.call(new Melown.UIEvent(type_, this, e || window.event));
        function_(new Melown.UIEvent(type_, this, e || window.event));
    };

    var element_ =  externalElement_ || this.element_;
    element_.addEventListener(this.getEventName(type_), handler_, false);

    if (type_ == "mousewheel") {
        element_.addEventListener("DOMMouseScroll", handler_, false);
    }

    this.events_[type_] = this.events_[type_] || [];
    this.events_[type_][id_] = handler_;

};

Melown.UIElement.prototype.removeEvent = function(type_, function_, externalElement_) {
    var id_ = type_ + "-" + Melown.Utils.stamp(function_)
              + (externalElement_ ? ("-" + Melown.Utils.stamp(externalElement_)) : "");

    var handler_ = this.events_[type_] && this.events_[type_][id_];

    if (handler_ != null) {
        delete this.events_[type_][id_];

        var element_ =  externalElement_ || this.element_;
        element_.removeEventListener(this.getEventName(type_), handler_, false);
    }
};

Melown.UIElement.prototype.getEventName = function(type_) {
    return type_;
};

//prevent minification
Melown.UIElement.prototype["on"] = Melown.UIElement.prototype.on;
Melown.UIElement.prototype["once"] = Melown.UIElement.prototype.once;
Melown.UIElement.prototype["off"] = Melown.UIElement.prototype.off;
Melown.UIElement.prototype["fire"] = Melown.UIElement.prototype.fire;


