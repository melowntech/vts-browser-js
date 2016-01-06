/**
 * @constructor
 */
Melown.UIControlCredits = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("credits",
      '<div id="melown-credits"'
      + ' class="melown-credits">'
      + ' </div>', visible_);

    this.lastHTML_ = "";
    this.credits_ = this.control_.getElement("melown-credits");
};


Melown.UIControlCredits.prototype.update = function() {
    var map_ = this.browser_.getCore().getMap();
    if (map_ == null) {
        return;
    }
    
    var credits_ = this.map_.getCredits();
    var html_ = "Imagery: ";
    var copyright_ = "&copy;" + (new Date().getFullYear());
    
    for (var i = 0; i < li; i++) {
        var creditInfo_ = this.map_.getCreditInfo(credits_[i]);
        
        if (creditInfo_["copyrighted"]) {
            html_ += copyright_;        
        }

        if (creditInfo_["url"]) {
            html_ += " <a href='" + creditInfo_["notice"] + "'>" + creditInfo_["notice"] + "</a>";        
        } else {
            html_ += " " + creditInfo_["notice"];        
        }

        if (i < li) {
            html_ += ",";        
        }
    }

    if (this.lastHTML_ != html_) {
        this.lastHTML_ = html_;
        this.credits_.setHTML(html_);
    }
};