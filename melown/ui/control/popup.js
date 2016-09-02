/**
 * @constructor
 */
Melown.UIControlPopup = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("popup",
        '<div class="melown-popup-background" id="melown-popup-background">'
      +    '<div id="melown-popup"</div>'
      + '</div>', visible_);

    this.lastHTML_ = "";
    this.popup_ = this.control_.getElement("melown-popup");
    this.background_ = this.control_.getElement("melown-popup-background");
    this.background_.on("click", this.hide.bind(this));
};

Melown.UIControlPopup.prototype.show = function(style_, html_) {
    this.control_.setVisible(true);
    
    for (var key_ in style_) {
        this.popup_.setStyle(key_, style_[key_]);
    }

    this.popup_.setHtml(html_);
};

Melown.UIControlPopup.prototype.hide = function() {
    this.control_.setVisible(false);
};