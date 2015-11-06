/**
 * @constructor
 */
Melown.UIControlMap = function(ui_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("map",
      '<div id="melown-map"'
      + ' class="melown-map">'
      + ' </div>');

    this.dragCall_ = this.onDrag.bind(this);

    var mapElement_ = this.control_.getElement("melown-map");
    mapElement_.on("drag", this.onDrag.bind(this));
    //mapElement_.on("mousedown", this.onMouseDown.bind(this));
    //mapElement_.on("mouseup", this.onMouseUp.bind(this));
    //mapElement_.on("click", this.onClick.bind(this));
    mapElement_.setDraggableState(true);

    this.mouseLeft_ = false;
    this.mouseRight_ = false;
};

Melown.UIControlMap.prototype.onDrag = function(event_) {
    console.log("map-drag");

    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getDragDelta();

    if (event_.getDragButton("left")) { //pan
        var sensitivity_ = 0.5;
        pos_ = map_.pan(pos_, delta_[0] * sensitivity_,
                              delta_[1] * sensitivity_);
    } else if (event_.getDragButton("right")) { //rotate
        var sensitivity_ = 0.5;
        pos_[4] += delta_[0] * sensitivity_;
        pos_[5] += -delta_[1] * sensitivity_;
    }

    map_.setPosition(pos_);

    //console.log("delta " + JSON.stringify(delta_));
};

Melown.UIControlMap.prototype.onMouseDown = function() {
    console.log("map-down");
};

Melown.UIControlMap.prototype.onMouseUp = function() {
    console.log("map-up");
};

Melown.UIControlMap.prototype.onClick = function() {
    console.log("map-click");
};




