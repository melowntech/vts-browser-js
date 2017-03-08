
//Melown.Utils.dragging_ = false;

Melown.Utils.hasClass = function(element_, name_) {
    if (element_.classList !== undefined) {
        return element_.classList.contains(name_);
    }
    var className_ = Melown.Utils.getClass(element_);
    return className_.length > 0 && new RegExp('(^|\\s)' + name_ + '(\\s|$)').test(className_);
};

Melown.Utils.addClass = function(element_, name_) {
    if (element_.classList !== undefined) {
        var classes_ = Melown.Utils.splitWords(name_);
        for (var i = 0, li = classes_.length; i < li; i++) {
            element_.classList.add(classes_[i]);
        }
    } else if (!Melown.Utils.hasClass(element_, name_)) {
        var className_ = Melown.Utils.getClass(element_);
        Melown.Utils.setClass(element_, (className_ ? className_ + ' ' : '') + name_);
    }
};

Melown.Utils.removeClass = function(element_, name_) {
    if (element_.classList !== undefined) {
        element_.classList.remove(name_);
    } else {
        Melown.Utils.setClass(element_, ((' ' + Melown.Utils.getClass(element_) + ' ').replace(' ' + name_ + ' ', ' ')).trim() );
    }
};

Melown.Utils.setClass = function(element_, name_) {
    if (element_.className.baseVal === undefined) {
        element_.className = name_;
    } else {
        element_.className.baseVal = name_;
    }
};

Melown.Utils.getClass = function(element_) {
    return element_.className.baseVal === undefined ? element_.className : element_.className.baseVal;
};

Melown.Utils.preventDefault = function(e) {
    e = e instanceof Melown.UIEvent ? e.event_ : e;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};

Melown.Utils.stopPropagation = function(e) {
    e = e instanceof Melown.UIEvent ? e.event_ : e;
    e.stopPropagation();
};

Melown.Utils.disableTextSelection = function() {
    window.addEventListener("selectstart", Melown.Utils.preventDefault);
};

Melown.Utils.enableTextSelection = function() {
    window.removeEventListener("selectstart", Melown.Utils.preventDefault);
};

Melown.Utils.disableImageDrag = function() {
    window.addEventListener("dragstart", Melown.Utils.preventDefault);
};

Melown.Utils.enableImageDrag = function() {
    window.removeEventListener("dragstart", Melown.Utils.preventDefault);
};

Melown.Utils.disableContexMenu = function(element_) {
    element_.addEventListener("contextmenu", Melown.Utils.preventDefault);
};

Melown.Utils.enableContexMenu = function(element_) {
    element_.removeEventListener("contextmenu", Melown.Utils.preventDefault);
};

Melown.Utils.getSupportedProperty = function(properties_) {
    var style_ = document.documentElement.style;

    for (var i = 0, li = properties_.length; i < li; i++) {
        if (properties_[i] in style_) {
            return properties_[i];
        }
    }

    return false;
};

Melown.Utils.TRANSFORM = Melown.Utils.getSupportedProperty(
            ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);


