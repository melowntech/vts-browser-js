/**
 * @constructor
 */
Melown.UIControlSearch = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("search",
      '<div class="melown-search">'
      + '<div class="melown-search-input"><input type="text" id="melown-search-input" autocomplete="off" spellcheck="false" placeholder="Search location..."></div>'      
      + '<div id="melown-search-list" class="melown-search-list"></div>'      
      + '</div>', visible_);

    this.input_ = this.control_.getElement("melown-search-input");
    //this.input_.on("change", this.onChange.bind(this));
    this.input_.on("input", this.onChange.bind(this));
    this.input_.on("keydown", this.onKeyUp.bind(this));
    this.input_.on("focus", this.onFocus.bind(this));
    this.input_.on('mousedown', this.onDrag2.bind(this));
    this.input_.on('mousewheel', this.onDrag.bind(this));

    this.list_ = this.control_.getElement("melown-search-list");
    this.list_.on('mousedown', this.onDrag2.bind(this));
    this.list_.on('mousewheel', this.onDrag.bind(this));

    this.mapControl_ = this.ui_.getMapControl();
    this.mapElement_ = this.mapControl_.getMapElement();
    this.mapElement_.on('mousedown', this.onDrag.bind(this), window);
    this.mapElement_.on('mousewheel', this.onDrag.bind(this), window);

    this.ignoreDrag_ = false; 

    this.urlTemplate_ = "https://www.windytv.com/search/get/v1.0/{value}?lang=en-US&hash=b0f07fGWSGdsx-l";
    this.data_ = [];
    this.lastSearch_ = "";
    this.itemIndex_ = -1;
    this.searchCounter_ = 0;
    this.coordsSrs_ = "+proj=longlat +datum=WGS84 +no_defs";
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
    //this.data_ = {};
    this.list_.setStyle("display", "none");
};

Melown.UIControlSearch.prototype.moveSelector = function(delta_) {
    //this.data_ = {};
    this.itemIndex_ += delta_;

    if (this.itemIndex_ >= this.data_.length) {
        this.itemIndex_ = this.data_.length - 1;
    }
    
    if (this.itemIndex_ < 0) {
        this.itemIndex_ = 0;
    }
    
    this.updateList({"data" : this.data_});
};

Melown.UIControlSearch.prototype.updateList = function(json_) {
    if (json_["data"]) {
        var list_ = "";
        var data_ = json_["data"];
        data_ = data_.slice(0,10);
        this.data_ = data_; 
        
        for (var i = 0, li = data_.length; i < li; i++) {
            var item_ = data_[i];

            if (this.itemIndex_ == i) {
                list_ += '<div id="melown-search-item' + i + '"'+ ' class="melown-search-listitem-selected">' + item_["title"] + ' ' + (item_["region"] ? item_["region"] : "") + '</div>';
            } else {
                list_ += '<div id="melown-search-item' + i + '"'+ ' class="melown-search-listitem">' + item_["title"] + ' ' + (item_["region"] ? item_["region"] : "") + '</div>';
            }
                
        }
        
        this.list_.setHtml(list_);

        for (var i = 0, li = data_.length; i < li; i++) {
            var id_ = "melown-search-item" + i;
            var item_ = this.control_.getElement(id_);
            
            if (item_) {
                item_.on("click", this.onSelectItem.bind(this, i));
                item_.on("mouseenter", this.onHoverItem.bind(this, i));
            }
        }

        this.showList();
    } else {
        this.hideList();
    }
};

Melown.UIControlSearch.prototype.onSelectItem = function(index_, event_) {
    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    //var coords_ = map_.getPositionCoords(pos_);                

    var item_ = this.data_[index_];
    if (item_) {
        var coords_ = [item_["lon"], item_["lat"]];
        
        //conver coords from location srs to map navigation srs         
        var refFrame_ = map_.getReferenceFrame();
        var navigationSrsId_ = refFrame_["navigationSrs"];
        var navigationSrs_ = map_.getSrsInfo(navigationSrsId_);
        
        var proj4_ = this.browser_.getProj4();
        coords_ = proj4_(this.coordsSrs_, navigationSrs_["srsDef"], coords_);

        pos_ = map_.setPositionCoords(pos_, coords_);
        
        //try to guess view extent from location type
        var viewExtent_ = 10000;                

        switch(item_["type"]) {
            case "peak": viewExtent_ = 20000; break;
            case "city": viewExtent_ = 30000; break;                
            case "street": viewExtent_ = 4000; break;
            case "residential": viewExtent_ = 3000; break;               
        }
        
        pos_ = map_.setPositionViewExtent(pos_, viewExtent_);                
        pos_ = map_.setPositionOrientation(pos_, [0,-60,0]);                

        map_.setPosition(pos_);
        
        this.itemIndex_ = index_;
        this.lastSearch_ = item_["title"];
        
        var element_ = this.input_.getElement();  
        element_.value = this.lastSearch_;
        element_.blur(); //defocus 
    }

    this.hideList();
};

Melown.UIControlSearch.prototype.onHoverItem = function(index_, event_) {
    if (this.itemIndex_ == index_) {
        return;
    }

    this.itemIndex_ = index_;
    this.updateList({"data" : this.data_});
};

Melown.UIControlSearch.prototype.onListLoaded = function(counter_, data_) {
    if (this.searchCounter_ == counter_) {
        this.updateList(data_);
    }
};

Melown.UIControlSearch.prototype.onListLoadError = function(event_) {
};

Melown.UIControlSearch.prototype.onFocus = function(event_) {
    this.lastSearch_ = "";
    var element_ = this.input_.getElement();  
    element_.value = this.lastSearch_;
    this.hideList();
};

Melown.UIControlSearch.prototype.onKeyPress = function(event_) {
        console.log("press");

    this.onKeyUp(event_);
};

Melown.UIControlSearch.prototype.onKeyUp = function(event_) {
    var code_ = event_.getKeyCode();
    
    switch(code_) {
        case 38:  //up
            this.moveSelector(-1);
            Melown.Utils.preventDefault(event_);
            Melown.Utils.stopPropagation(event_);    
            break;

        case 40:  //down
            this.moveSelector(1); 
            Melown.Utils.preventDefault(event_);
            Melown.Utils.stopPropagation(event_);    
            break;

        case 9:  //tab
        case 13: //enter
        
            this.onSelectItem(Math.max(0,this.itemIndex_), null); 
            break;
    }
};

Melown.UIControlSearch.prototype.onChange = function(event_) {
    var value_ = this.input_.getElement().value;
    value_ = value_.trim();

    //console.log("value: " + value_ + "  last-value: " + this.lastSearch_);

    if (value_ == this.lastSearch_) {
        //console.log("value-same");
        return;        
    }
    
    this.lastSearch_ = value_;
    
    if (value_ == "") {
        //console.log("value-null");
        this.hideList();        
    }    
    
    var url_ = this.processTemplate(this.urlTemplate_, { "value" : value_ });
    //console.log(url_);
    this.searchCounter_++;
    this.itemIndex_ = -1;
   
    Melown.loadJSON(url_, this.onListLoaded.bind(this, this.searchCounter_), this.onListLoadError.bind(this));
};

Melown.UIControlSearch.prototype.onDrag2 = function(event_) {
    this.ignoreDrag_ = true; 
    var element_ = this.input_.getElement();  
};

Melown.UIControlSearch.prototype.onDrag = function(event_) {
    if (this.ignoreDrag_) {
        this.ignoreDrag_ = false;
        return; 
    } 

    var element_ = this.input_.getElement();  
    element_.value = this.lastSearch_;
    element_.blur(); //defocus'
    this.hideList(); 
};
