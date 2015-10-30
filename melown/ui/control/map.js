/**
 * @constructor
 */
Melown.UIControlMap = function(ui_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("map",
      '<div id="melown-map"'
      + ' class="melown-map">'
      + ' </div>');

    var map_ = this.control_.getElement("melown-compass");
    map_.on("drag", this.onDrag.bind(this));
    map_.on("mousedown", this.onMouseDown.bind(this));
    map_.on("mouseup", this.onMouseUp.bind(this));

    this.mouseLeft_ = false;
    this.mouseRight_ = false;
};

