/**
 * @constructor
 */
Melown.UIControlLayers = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("layers",
      '<div class="melown-layers"'
      + '</div>', visible_);
};
