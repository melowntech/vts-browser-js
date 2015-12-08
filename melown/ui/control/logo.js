/**
 * @constructor
 */
Melown.UIControlLogo = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("logo",
      '<a class="melown-logo"'
      + ' href="https:\\melown.com">'
      + 'Powered by MELOWN MAPS'
      + '</a>', visible_);
};


