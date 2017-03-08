/**
 * @constructor
 */
Melown.UIControlMap = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("map",
      '<div id="melown-map"'
      + ' class="melown-map">'
      + ' </div>');

    var map_ = this.getMapElement();
    map_.setDraggableState(true);
};

Melown.UIControlMap.prototype.getMapElement = function() {
    return this.control_.getElement("melown-map");
};
