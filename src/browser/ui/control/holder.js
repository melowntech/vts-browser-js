
import UIElement_ from '../element/element';

//get rid of compiler mess
var UIElement = UIElement_;


var UIControlHolder = function(ui, html, visible, visibleLock, parentElement) {
    this.ui = ui;
    this.html = html;
    this.elementsById = [];
    this.visible = (visible != null) ? visible : true;

    //create holder element
    this.element = document.createElement('div');
    this.setVisible(this.visible);

    this.visibleLock = visibleLock ? true : false;
    this.setVisibleLock(this.visibleLock);

    //set element content
    this.setHtml(html);

    //append elemenet to UI
    if (parentElement) {
        parentElement.appendChild(this.element);
    } else {
        this.ui.element.appendChild(this.element);
    }
};


UIControlHolder.prototype.setHtml = function(html) {
    this.element.innerHTML = html;

    var allElements = this.element.getElementsByTagName('*');

    //store all elements with id attribute to the table
    for (var i = 0, li = allElements.length; i < li; i++) {
        var id = allElements[i].getAttribute('id');

        if (id !== null) {
            //store element to the table
            this.elementsById[id] = new UIElement(this, allElements[i]);
        }
    }
};


UIControlHolder.prototype.getElement = function(id) {
    return this.elementsById[id];
};


UIControlHolder.prototype.setVisible = function(state) {
    if (this.visibleLock) {
        return;
    }

    this.element.style.display = state ? 'block' : 'none';
    this.visible = state;
};


UIControlHolder.prototype.getVisible = function() {
    return this.visible;
};

UIControlHolder.prototype.setVisibleLock = function(state) {
    this.visibleLock = state;
};


UIControlHolder.prototype.getVisibleLock = function() {
    return this.visibleLock;
};

export default UIControlHolder;

/*
//prevent minification
UIControlHolder.prototype["setHtml"] = UIControlHolder.prototype.setHtml; 
UIControlHolder.prototype["getElement"] = UIControlHolder.prototype.getElement; 
UIControlHolder.prototype["setVisible"] = UIControlHolder.prototype.setVisible; 
UIControlHolder.prototype["getVisible"] = UIControlHolder.prototype.getVisible; 
*/



