
var UIEvent = function(type, element, event) {
    this.type = type;
    this.event = event;
    this.element = element;
};


UIEvent.prototype.getMouseButton = function() {
    switch (this.type) {
    case 'touchstart':
    case 'touchend':
    case 'touchmove':

        var touches = this.event['touches'];
            
        if (touches) {
            switch(touches.length) {
            case 1: return 'left';
            case 2: return 'right';
            case 3: return 'middle';
            }
        }

        return '';   

    default:
    
        if (this.event.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
                //right = e.which == 3;
        
            switch(this.event.which) {
            case 1: return 'left';
            case 2: return 'middle';
            case 3: return 'right';
            }
        
        } else if (this.event.button) { // IE, Opera
                //right = e.button == 2;
        
            switch(this.event.button) {
            case 1: return 'left';
            case 2: return 'right';
            case 3: return 'middle';
            }
        }
    
    }

    return '';
};


UIEvent.prototype.getMouseCoords = function(absolute) {
    var pos = [0,0];

    switch (this.type) {
    case 'touchstart':
    case 'touchend':
    case 'touchmove':

        var touches = this.event['touches'];
        if (!touches || touches.length == 0) {
            break;
        }
            
        for (var i = 0, li = touches.length; i < li; i++) {
            var pos2 = this.getEventCoords(this.event['touches'][i], absolute);
            pos[0] += pos2[0];   
            pos[1] += pos2[1];   
        }
            
        pos[0] /= li;
        pos[1] /= li;
        break;

    case 'mousedown':
    case 'mouseup':
    case 'mousemove':
    case 'mouseenter':
    case 'mouseover':
    case 'mouseleave':
    case 'click':
    case 'dblclick':
    case 'dragstart':
    case 'dragend':
    case 'drag':

        pos = this.getEventCoords(this.event, absolute);
        break;
    }

    return pos;
};


UIEvent.prototype.getEventCoords = function(event, absolute) {
//    if (this.element.getBoundingClientRect == null || absolute) {
    if (this.element.getPageRect == null || absolute) {
        return [ event['clientX'],
                 event['clientY'] ];
    } else {
        var rect = this.element.getPageRect();

        return [ event['pageX'] - rect.left,
                 event['pageY'] - rect.top ];
    }
};


UIEvent.prototype.getDragDelta = function() {
    switch (this.type) {
    case 'drag':

        return [ this.event['deltaX'],
                 this.event['deltaY'] ];
    }

    return [0,0];
};


UIEvent.prototype.getDragZoom = function() {
    switch (this.type) {
    case 'drag':
        return this.event['zoom'];
    }
    
    return 1.0;
};


UIEvent.prototype.getDragTouches = function() {
    switch (this.type) {
    case 'drag':
        return this.event['touches'];
    }
    
    return 0;
};


UIEvent.prototype.getModifierKey = function(key) {
    switch (this.type) {
    case 'mouseup':
    case 'mousedown':
    case 'dblclick':
    case 'keyup':
    case 'keydown':
    case 'keypress':

        switch(key) {
        case 'alt':   return this.event.altKey;
        case 'ctrl':  return this.event.ctrlKey;
        case 'shift': return this.event.shiftKey;
        }
    }

    return false;
};


UIEvent.prototype.getKeyCode = function() {
    switch (this.type) {
    case 'keyup':
    case 'keydown':
    case 'keypress':
        
        if (this.event.keyCode) {         // eg. IE
            return this.event.keyCode;
        } else if (this.event.which) {   // eg. Firefox
            return this.event.which;
        } else {
            return this.event.charCode;
        }
    }
    
    return null;
};


UIEvent.prototype.getDragButton = function(button) {
    switch(button) {
    case 'left': 
    case 'right':
    case 'middle':
            
        switch(this.getTouchesCount()) {
        case -1: return this.event[button];
        case 0: return false;
        case 1: return button == 'left';
        case 2: return button == 'right';
        case 3: return button == 'middle';
        }
        
    }

    return false;
};


UIEvent.prototype.getWheelDelta = function() {
    switch (this.type) {
    case 'mousewheel':

        var delta = 0;

        if (this.event.wheelDelta) {
            delta = this.event.wheelDelta / 120;
        }
        if (this.event.detail) {
            delta = -this.event.detail / 3;
        }

        return delta;
    }

    return 0;
};


UIEvent.prototype.getTouchesCount = function() {
    switch (this.type) {
    case 'touchstart':
    case 'touchend':
    case 'touchmove':

        var touches = this.event['touches'];
        if (!touches) {
            break;
        }
            
        return this.event['touches'].length;    
    }
    
    return -1;
};


UIEvent.prototype.getTouchParameter = function(name) {
    switch (this.type) {
    case 'drag':
        return this.event[name];
    }
    
    return null;
};


UIEvent.prototype.getTouchCoords = function(index, absolute) {
    switch (this.type) {
    case 'touchstart':
    case 'touchend':
    case 'touchmove':

        var touches = this.event['touches'];
        if (!touches) {
            break;
        }
            
        var event = this.event['touches'][index];    
        if (!event) {
            break;
        }

        if (this.element.getPageRect == null || absolute) {
            return [ event['clientX'],
                     event['clientY'] ];
        } else {
            var rect = this.element.getPageRect();

            return [ event['pageX'] - rect.left,
                     event['pageY'] - rect.top ];
        }
    }

    return [0,0];
};


UIEvent.prototype.getType = function() {
    return this.type;
};


export default UIEvent;


