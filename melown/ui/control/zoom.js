/**
 * @constructor
 */
Melown.UIControlZoom = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("zoom",
      '<div id="melown-zoom"'
      + ' class="melown-zoom">'

        + '<div id="melown-zoom-plus" class="melown-zoom-plus">'
            + '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAASUlEQVRIx+2Tyw0AIAhDq0d2KsMzFFddQBO9+En6rqR5kFBAiBVINpJtJ1NPLCbJe5IyG7j78IMyEwBgZsNcRJQrl6gnkgjxIx12Cg3wDaLBUAAAAABJRU5ErkJggg==">'
        + '</div>'

        + '<div id="melown-zoom-minus" class="melown-zoom-minus">'
          + '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAALUlEQVRIx2NgGAWjYBSMAqoCRlwSdnZ2/8kx8NChQxhmMo2G8ygYBaNgFGAHAElYBARpOBYqAAAAAElFTkSuQmCC">'
        + '</div>'

     + ' </div>', visible_);

    var plus_ = this.control_.getElement("melown-zoom-plus");
    plus_.on("click", this.onZoomIn.bind(this));
    plus_.on("dblclick", this.onDoNothing.bind(this));

    var minus_ = this.control_.getElement("melown-zoom-minus");
    minus_.on("click", this.onZoomOut.bind(this));
    minus_.on("dblclick", this.onDoNothing.bind(this));
};

Melown.UIControlZoom.prototype.onDoNothing = function(event_) {
    Melown.Utils.stopPropagation(event_);    
};

Melown.UIControlZoom.prototype.onZoomIn = function() {
    this.repeat(7, 0.96, 50);
};

Melown.UIControlZoom.prototype.onZoomOut = function() {
    this.repeat(7, 1.04, 50);
};

Melown.UIControlZoom.prototype.repeat = function(count_, factor_, delay_) {
    if (count_ <= 0) {
        return;
    }

    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }
    
    var controller_ = this.browser_.controlMode_.getCurrentController();
    
    if (controller_.viewExtentDeltas_) {
        controller_.viewExtentDeltas_.push(factor_);
    }

    setTimeout(this.repeat.bind(this, --count_, factor_, delay_), delay_);
};


