/**
 * @constructor
 */
Melown.UIControlCredits = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("credits",
      '<div id="melown-credits"'
      + ' class="melown-credits">'
      + ' </div>', visible_);
};


