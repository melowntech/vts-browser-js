
import UIEvent_ from '../ui/element/event';

//get rid of compiler mess
var UIEvent = UIEvent_;


//Dom.dragging = false;
var Dom = {};

Dom.hasClass = function(element, name) {
    if (element.classList !== undefined) {
        return element.classList.contains(name);
    }
    var className = Dom.getClass(element);
    return className.length > 0 && new RegExp('(^|\\s)' + name + '(\\s|$)').test(className);
};


Dom.addClass = function(element, name) {
    if (element.classList !== undefined) {
        var classes = Dom.splitWords(name);
        for (var i = 0, li = classes.length; i < li; i++) {
            element.classList.add(classes[i]);
        }
    } else if (!Dom.hasClass(element, name)) {
        var className = Dom.getClass(element);
        Dom.setClass(element, (className ? className + ' ' : '') + name);
    }
};


Dom.removeClass = function(element, name) {
    if (element.classList !== undefined) {
        element.classList.remove(name);
    } else {
        Dom.setClass(element, ((' ' + Dom.getClass(element) + ' ').replace(' ' + name + ' ', ' ')).trim() );
    }
};


Dom.setClass = function(element, name) {
    if (element.className.baseVal === undefined) {
        element.className = name;
    } else {
        element.className.baseVal = name;
    }
};


Dom.getClass = function(element) {
    return element.className.baseVal === undefined ? element.className : element.className.baseVal;
};


Dom.preventDefault = function(e) {
    e = e instanceof UIEvent ? e.event : e;
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};


Dom.stopPropagation = function(e) {
    e = e instanceof UIEvent ? e.event : e;
    e.stopPropagation();
};


Dom.disableTextSelection = function() {
    window.addEventListener('selectstart', Dom.preventDefault);
};


Dom.enableTextSelection = function() {
    window.removeEventListener('selectstart', Dom.preventDefault);
};


Dom.disableImageDrag = function() {
    window.addEventListener('dragstart', Dom.preventDefault);
};


Dom.enableImageDrag = function() {
    window.removeEventListener('dragstart', Dom.preventDefault);
};


Dom.disableContexMenu = function(element) {
    element.addEventListener('contextmenu', Dom.preventDefault);
};


Dom.enableContexMenu = function(element) {
    element.removeEventListener('contextmenu', Dom.preventDefault);
};


Dom.getSupportedProperty = function(properties) {
    var style = document.documentElement.style;

    for (var i = 0, li = properties.length; i < li; i++) {
        if (properties[i] in style) {
            return properties[i];
        }
    }

    return false;
};


Dom.stampCounter = 0;


Dom.stamp = function(obj) {
    obj.vtsStamp = obj.vtsStamp || ++Dom.stampCounter;
    return obj.vtsStamp;
};


Dom.TRANSFORM = Dom.getSupportedProperty(
            ['transform', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);


export default Dom;
