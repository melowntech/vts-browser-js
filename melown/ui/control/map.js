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

    var map_ = this.control_.getElement("melown-map");
    map_.on("drag", this.onDrag.bind(this));
    map_.on("mousewheel", this.onMouseWheel.bind(this));
    map_.setDraggableState(true);
};

Melown.UIControlMap.prototype.onDrag = function(event_) {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    if (this.browser_.controlMode_ == "pannorama") {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getDragDelta();

    if (event_.getDragButton("left")) { //pan
        var sensitivity_ = 0.5;
        pos_ = map_.pan(pos_, delta_[0] * sensitivity_,
                              delta_[1] * sensitivity_);
    } else if (event_.getDragButton("right")) { //rotate
        var sensitivity_ = 0.4;
        pos_[5] -= delta_[0] * sensitivity_;
        pos_[6] -= delta_[1] * sensitivity_;
    }

    map_.setPosition(pos_);
};

Melown.UIControlMap.prototype.onMouseWheel = function(event_) {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var delta_ = event_.getWheelDelta();

    var factor_ = 1.0 + (delta_ > 0 ? -1 : 1)*0.05;

    if (this.browser_.controlMode_ == "pannorama") {
        pos_[9] *= factor_;
    } else {
        pos_[8] *= factor_;
    }

    map_.setPosition(pos_);
};

Melown.UIControlMap.prototype.onMouseUp = function() {
    console.log("map-up");
};

