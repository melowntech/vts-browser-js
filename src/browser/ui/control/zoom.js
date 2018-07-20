
import Dom_ from '../../utility/dom';

//get rid of compiler mess
var dom = Dom_;


var UIControlZoom = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('zoom',
      '<div id="vts-zoom"'
      + ' class="vts-zoom">'

        + '<div id="vts-zoom-plus" class="vts-zoom-plus">'
            + '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAASUlEQVRIx+2Tyw0AIAhDq0d2KsMzFFddQBO9+En6rqR5kFBAiBVINpJtJ1NPLCbJe5IyG7j78IMyEwBgZsNcRJQrl6gnkgjxIx12Cg3wDaLBUAAAAABJRU5ErkJggg==">'
        + '</div>'

        + '<div id="vts-zoom-minus" class="vts-zoom-minus">'
          + '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAALUlEQVRIx2NgGAWjYBSMAqoCRlwSdnZ2/8kx8NChQxhmMo2G8ygYBaNgFGAHAElYBARpOBYqAAAAAElFTkSuQmCC">'
        + '</div>'

     + ' </div>', visible, visibleLock);

    var plus = this.control.getElement('vts-zoom-plus');
    plus.on('click', this.onZoomIn.bind(this));
    plus.on('dblclick', this.onDoNothing.bind(this));

    var minus = this.control.getElement('vts-zoom-minus');
    minus.on('click', this.onZoomOut.bind(this));
    minus.on('dblclick', this.onDoNothing.bind(this));
};


UIControlZoom.prototype.onDoNothing = function(event) {
    dom.preventDefault(event);    
    dom.stopPropagation(event);    
};


UIControlZoom.prototype.onZoomIn = function() {
    this.repeat(7, 0.96, 50);
};


UIControlZoom.prototype.onZoomOut = function() {
    this.repeat(7, 1.04, 50);
};


UIControlZoom.prototype.repeat = function(count, factor, delay) {
    if (count <= 0) {
        return;
    }

    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    if (this.browser.autopilot) { //stop autorotation
        this.browser.autopilot.setAutorotate(0);
        this.browser.autopilot.setAutopan(0,0);
    }
    
    var controller = this.browser.controlMode.getCurrentController();
    
    if (controller.viewExtentDeltas) {
        controller.viewExtentDeltas.push(factor);
    }

    setTimeout(this.repeat.bind(this, --count, factor, delay), delay);
};


export default UIControlZoom;
