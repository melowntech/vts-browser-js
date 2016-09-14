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

Melown.UIControlCredits.prototype.getCreditsString = function(array_, separator_, full_) {
    var map_ = this.browser_.getMap();
    var html_ = "";
    var copyright_ = "&copy;" + (new Date().getFullYear());
    
    var li = array_.length;
    var plain_ = ""; 
    var more_ = false;

    for (var i = 0; i < li; i++) {
        var creditInfo_ = map_.getCreditInfo(array_[i]);
        if (creditInfo_["plain"]) {
            plain_ += creditInfo_["plain"];
        }
    }        
    
    if (plain_ && plain_.length > 30 && li > 1 && !full_) {
        li = 1;
        more_ = true; 
    }

    for (var i = 0; i < li; i++) {
        var creditInfo_ = map_.getCreditInfo(array_[i]);
       
        if (creditInfo_["html"]) {
            html_ += creditInfo_["html"];
        }

        if (i + 1 < li) {
            html_ += separator_;        
        }
    }
    
    return [html_, more_];
};

Melown.UIControlCredits.prototype.update = function() {
    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var html_ = "";
    var credits_ = map_.getCurrentCredits();
    
    if (credits_["imagery"].length > 0) {
        var res_ = this.getCreditsString(credits_["imagery"], ", ");
        html_ += "<div class='melown-credits-supercell'>";
            html_ += "<div class='melown-credits-cell'>Imagery: " + res_[0] + "</div>";
            html_ += res_[1] ? "<div class='melown-credits-cell-button' id='melown-credits-imagery-more'>and others</div>" : "";
            html_ += "<div class='melown-credits-separator'></div>";
        html_ += "</div>";
        var html2_ = "<div class='melown-credits-list'>";
        html2_ += this.getCreditsString(credits_["imagery"], "<br/>", true)[0] + "</div>";
    }
    
    if (credits_["mapdata"].length > 0) {
        var res_ = this.getCreditsString(credits_["mapdata"], ", ");
        html_ += "<div class='melown-credits-supercell'>";
            html_ += "<div class='melown-credits-cell'>Map Data: " + res_[0] + "</div>";
            html_ += res_[1] ? "<div class='melown-credits-cell-button' id='melown-credits-mapdata-more'>and others</div>" : "";
            html_ += "<div class='melown-credits-separator'></div>";
        html_ += "</div>";
        var html3_ = "<div class='melown-credits-list'>";
        html3_ += this.getCreditsString(credits_["mapdata"], "<br/>", true)[0] + "</div>";
    }

    html_ += "<div class='melown-credits-supercell'>";
        html_ += "<div class='melown-credits-cell'>Powered by <a class='melown-logo' href='https://melown.com' target='_blank'>MELOWN</a></div>";
        html_ += "<div class='melown-credits-separator'></div>";
    html_ += "</div>";

    if (this.lastHTML_ != html_) {
        this.lastHTML_ = html_;
        this.credits_.setHtml(html_);

        var butt_ = this.control_.getElement("melown-credits-imagery-more");
        if (butt_) {
            butt_.on("click", this.onMoreButton.bind(this, butt_, html2_));
        }
        
        butt_ = this.control_.getElement("melown-credits-mapdata-more");
        if (butt_) {
            butt_.on("click", this.onMoreButton.bind(this, butt_, html3_));
        }
    }
};

Melown.UIControlCredits.prototype.onMoreButton = function(butt_, html_) {
    var rect_ = butt_.getRect();
    this.ui_.popup_.show({"right" : Math.max(0,(rect_["fromRight"]-rect_["width"])) + "px",
                          "bottom" : (rect_["fromBottom"]+7) + "px"}, html_);
};




