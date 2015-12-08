/**
 * @constructor
 */
Melown.UIControlScale = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("scale",
      '<div class="melown-scale"'
      + '</div>', visible_);
};