/**
 * @constructor
 */
Melown.UIControlSearch = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("search",
      '<div class="melown-search">'
      + '<div class="melown-search-input"><input type="text" id="melown-search-input" autocomplete="off" spellcheck="false" placeholder="Search location..."></div>'      
      + '<div id="melown-search-list" class="melown-search-list"></div>'      
      + '</div>', visible_);

    this.input_ = this.control_.getElement("melown-search-input");
    this.input_.on("change", this.onChange.bind(this));
    this.input_.on("input", this.onChange.bind(this));

    this.list_ = this.control_.getElement("melown-search-list");

    this.urlTemplate_ = "https://www.windytv.com/search/get/v1.0/{value}?lang=en-US&hash=b0f07fGWSGdsx-l";
};

Melown.UIControlSearch.prototype.processTemplate = function(str_, obj_) {
    return str_.replace(/\{([_$a-zA-Z0-9][_$a-zA-Z0-9]*)\}/g, function(s, match_) {
        return (match_ in obj_ ? obj_[match_] : s);
    });
};

Melown.UIControlSearch.prototype.showList = function(event_) {
    this.list_.setStyle("display", "block");
};

Melown.UIControlSearch.prototype.hideList = function(event_) {
    this.list_.setStyle("display", "none");
};

Melown.UIControlSearch.prototype.updateList = function(data_) {
//    this.list_.setStyle("display", "block");
    
    if (data_["data"]) {
        var list_ = "";
        var data_ = data_["data"]; 
        
        for (var i = 0, li = data_.length; i < li; i++) {
            var item_ = data_[i];
            
            if (item_["title"]) {
                list_ += '<div class="melown-search-listitem">' + item_["title"] + ' ' + (item_["region"] ? item_["region"] : "") + '</div>';
            }
        }
        
        this.list_.setHtml(list_);
        this.showList();
    } else {
        this.hideList();
    }
};

Melown.UIControlSearch.prototype.onSelectItem = function(event_) {
};

Melown.UIControlSearch.prototype.onListLoaded = function(data_) {
    this.updateList(data_);
};

Melown.UIControlSearch.prototype.onListLoadError = function(event_) {
};

Melown.UIControlSearch.prototype.onChange = function(event_) {
    var value_ = this.input_.getElement().value;
    var url_ = this.processTemplate(this.urlTemplate_, { "value" : value_ });
    //console.log(url_);
    
    Melown.loadJSON(url_, this.onListLoaded.bind(this), this.onListLoadError.bind(this));
};

