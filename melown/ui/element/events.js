
Melown.UIElement.prototype.on = function(type_, function_) {
    this.addEvent(type_, function_);
};

Melown.UIElement.prototype.once = function(type_, function_) {
    var removeEventCall_ = (function() {
        this.removeEvent(type_, function_);
    }).bind(this);

    var handler_ = function(e) {
        function_(e);
        removeEventCall_();
    };

    this.addEvent(type_, handler_);
};

Melown.UIElement.prototype.off = function(type_, function_) {
    this.removeEvent(type_, function_);
};

Melown.UIElement.prototype.fire = function(type_, event_) {
    var events_ = this.events_[type_];

    if (events_ != null) {
        for (var hook_ in events_) {

        }
    }
};

Melown.UIElement.prototype.addEvent = function(type_, function_) {
    var id_ = type + "-" + Melown.Utils.stamp(function_);

    var handler_ = function(e) {
        function_.call(new Melown.UIEvent(type_, this, e || window.event));
    };

    this.element_.addEventListener("on" + type_, handler, false);

    this.events_[type_] = this.events_[type_] || [];
    this.events_[type_][id_] = handler_;

};

Melown.UIElement.prototype.removeEvent = function(type_, function_) {
    var id_ = type + "-" + Melown.Utils.stamp(function_);
    var handler_ = this.events_[type_] && this.events_[type_][id_];

    if (handler_ != null) {
        delete this.events_[type_][id_];
        this.element_.removeEventListener("on" + type_, handler, false);
    }
};


