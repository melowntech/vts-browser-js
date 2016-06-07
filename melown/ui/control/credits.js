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

Melown.UIControlCredits.prototype.getCreditsString = function(array_) {
    var map_ = this.browser_.getMap();
    var html_ = "";
    var copyright_ = "&copy;" + (new Date().getFullYear());

    for (var i = 0, li = array_.length; i < li; i++) {
        var creditInfo_ = map_.getCreditInfo(array_[i]);
        
        /*
        if (creditInfo_["copyrighted"]) {
            html_ += copyright_;        
        }

        if (creditInfo_["url"]) {
            html_ += " <a href='" + creditInfo_["notice"] + "'>" + creditInfo_["notice"] + "</a>";        
        } else {
            html_ += " " + creditInfo_["notice"];        
        }*/
        
        if (creditInfo_["html"]) {
            html_ += creditInfo_["html"];
        }

        if (i + 1 < li) {
            html_ += ", ";        
        }
    }
    
    return html_;
};

Melown.UIControlCredits.prototype.update = function() {
    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var html_ = "<ul>";
    var credits_ = map_.getCurrentCredits();
    
    if (credits_["imagery"].length > 0) {
        html_ += "<li>Imagery: " + this.getCreditsString(credits_["imagery"]) + "</li>";
    }
    
    if (credits_["mapdata"].length > 0) {
        html_ += "<li>Map Data: " + this.getCreditsString(credits_["mapdata"]) + "</li>";
    }

    html_ += "<li>3D: MELOWN";

    if (credits_["mapdata"].length > 0) {
        html_ += ", " + this.getCreditsString(credits_["3d"]) + "</li>";
    }

    html_ += "</ul>";

    if (this.lastHTML_ != html_) {
        this.lastHTML_ = html_;
        this.credits_.setHTML(html_);
    }
};