/**
 * @constructor
 */
Melown.UIControlLogo = function(ui_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("logo",
      '<a id="melown-logo"'
      + ' class="melown-logo"'
      + ' href="https:\\melown.com">'
      + 'Powered by MELOWN MAPS'
      + '</a>');
};


