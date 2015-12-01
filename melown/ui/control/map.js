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
    map_.setDraggableState(true);
};
