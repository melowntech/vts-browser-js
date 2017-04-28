
import Dom_ from '../../utility/dom';
import {utils as utils_} from '../../../core/utils/utils';

//get rid of compiler mess
var dom = Dom_;
var utils = utils_;


var UIControlSearch = function(ui, visible) {
    this.ui = ui;
    this.browser = ui.browser;
    
    var element = this.browser.config.controlSearchElement;
    if (element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
    }
    
    this.control = this.ui.addControl('search',
      '<div class="vts-search">'
      + '<div class="vts-search-input"><input type="text" id="vts-search-input" autocomplete="off" spellcheck="false" placeholder="Search location..."></div>'      
      + '<div id="vts-search-list" class="vts-search-list"></div>'      
      + '</div>', visible, element);

    this.input = this.control.getElement('vts-search-input');
    
    //this.input.on("change", this.onChange.bind(this));
    this.input.on('input', this.onChange.bind(this));
    this.input.on('keydown', this.onKeyUp.bind(this));
    this.input.on('focus', this.onFocus.bind(this));
    this.input.on('mousedown', this.onDrag2.bind(this));
    this.input.on('mousewheel', this.onDrag.bind(this));

    this.list = this.control.getElement('vts-search-list');
    this.list.on('mousedown', this.onDrag2.bind(this));
    this.list.on('mousewheel', this.onDrag.bind(this));

    this.mapControl = this.ui.getMapControl();
    this.mapElement = this.mapControl.getMapElement();
    this.mapElement.on('mousedown', this.onDrag.bind(this), window);
    this.mapElement.on('mousewheel', this.onDrag.bind(this), window);

    this.ignoreDrag = false; 

    this.urlTemplate = 'https://www.windy.com/search/get/v1.0/{value}?lang=en-US&hash=b0f07fGWSGdsx-l';
    this.data = [];
    this.lastSearch = '';
    this.itemIndex = -1;
    this.searchCounter = 0;
    this.coordsSrs = '+proj=longlat +datum=WGS84 +nodefs';

    this.initialValueUsed = false;

    if (this.browser.config.controlSearchValue) {
        this.initialValueUsed = true;
        this.input.getElement().value = this.browser.config.controlSearchValue;
        this.onChange();
    }
};


UIControlSearch.prototype.processTemplate = function(str, obj) {
    return str.replace(/\{([$a-zA-Z0-9][$a-zA-Z0-9]*)\}/g, function(s, match) {
        return (match in obj ? obj[match] : s);
    });
};


UIControlSearch.prototype.showList = function(event) {
    this.list.setStyle('display', 'block');
};


UIControlSearch.prototype.hideList = function(event) {
    //this.data = {};
    this.list.setStyle('display', 'none');
};


UIControlSearch.prototype.moveSelector = function(delta) {
    //this.data = {};
    this.itemIndex += delta;

    if (this.itemIndex >= this.data.length) {
        this.itemIndex = this.data.length - 1;
    }
    
    if (this.itemIndex < 0) {
        this.itemIndex = 0;
    }
    
    this.updateList({'data' : this.data});
};


UIControlSearch.prototype.updateList = function(json) {
    if (json['data']) {
        var list = '';
        var data = json['data'];
        data = data.slice(0,10);
        this.data = data; 
        
        for (var i = 0, li = data.length; i < li; i++) {
            var item = data[i];

            if (this.itemIndex == i) {
                list += '<div id="vts-search-item' + i + '"'+ ' class="vts-search-listitem-selected">' + item['title'] + ' ' + (item['region'] ? item['region'] : '') + '</div>';
            } else {
                list += '<div id="vts-search-item' + i + '"'+ ' class="vts-search-listitem">' + item['title'] + ' ' + (item['region'] ? item['region'] : '') + '</div>';
            }
                
        }
        
        this.list.setHtml(list);

        for (var i = 0, li = data.length; i < li; i++) {
            var id = 'vts-search-item' + i;
            var item = this.control.getElement(id);
            
            if (item) {
                item.on('click', this.onSelectItem.bind(this, i));
                item.on('mouseenter', this.onHoverItem.bind(this, i));
            }
        }

        if (!this.initialValueUsed) {
            this.showList();
        }
    } else {
        this.hideList();
    }
};


UIControlSearch.prototype.onSelectItem = function(index, event) {
    var map = this.browser.getMap();
    if (map == null) {
        return;
    }

    var pos = map.getPosition();
    //var coords = map.getPositionCoords(pos);                

    var item = this.data[index];
    if (item) {
        var coords = [item['lon'], item['lat']];
        
        //conver coords from location srs to map navigation srs         
        var refFrame = map.getReferenceFrame();
        var navigationSrsId = refFrame['navigationSrs'];
        var navigationSrs = map.getSrsInfo(navigationSrsId);
        
        var proj4 = this.browser.getProj4();
        coords = proj4(this.coordsSrs, navigationSrs['srsDef'], coords);
        coords[2] = 0;

        pos.setCoords(coords);
        
        //try to guess view extent from location type
        var viewExtent = 10000;                

        switch(item['type']) {
        case 'peak': viewExtent = 20000; break;
        case 'city': viewExtent = 30000; break;                
        case 'street': viewExtent = 4000; break;
        case 'residential': viewExtent = 3000; break;               
        }
        
        pos.setViewExtent(viewExtent);                
        pos.setOrientation([0,-60,0]);                

        map.setPosition(pos);
        
        this.itemIndex = index;
        this.lastSearch = item['title'];
        
        var element = this.input.getElement();  
        element.value = this.lastSearch;
        element.blur(); //defocus 
    }

    this.hideList();
};


UIControlSearch.prototype.onHoverItem = function(index, event) {
    if (this.itemIndex == index) {
        return;
    }

    this.itemIndex = index;
    this.updateList({'data' : this.data});
};


UIControlSearch.prototype.onListLoaded = function(counter, data) {
    if (this.searchCounter == counter) {
        this.updateList(data);
    }
};


UIControlSearch.prototype.onListLoadError = function(event) {
};


UIControlSearch.prototype.onFocus = function(event) {
    this.lastSearch = '';
    var element = this.input.getElement();  
    element.value = this.lastSearch;
    this.hideList();
};


UIControlSearch.prototype.onKeyPress = function(event) {
    console.log('press');

    this.onKeyUp(event);
};


UIControlSearch.prototype.onKeyUp = function(event) {
    var code = event.getKeyCode();
    
    switch(code) {
    case 38:  //up
        this.moveSelector(-1);
        dom.preventDefault(event);
        dom.stopPropagation(event);    
        break;

    case 40:  //down
        this.moveSelector(1); 
        dom.preventDefault(event);
        dom.stopPropagation(event);    
        break;

    case 9:  //tab
    case 13: //enter
        
        this.onSelectItem(Math.max(0,this.itemIndex), null); 
        break;
    }
};


UIControlSearch.prototype.onChange = function(event) {
    var value = this.input.getElement().value;
    value = value.trim();

    //console.log("value: " + value + "  last-value: " + this.lastSearch);

    if (value == this.lastSearch) {
        //console.log("value-same");
        return;        
    }
    
    this.lastSearch = value;
    
    if (value == '') {
        //console.log("value-null");
        this.hideList();        
    }    
    
    var url = this.processTemplate(this.urlTemplate, { 'value' : value });
    //console.log(url);
    this.searchCounter++;
    this.itemIndex = -1;
   
    utils.loadJSON(url, this.onListLoaded.bind(this, this.searchCounter), this.onListLoadError.bind(this));
};


UIControlSearch.prototype.onDrag2 = function(event) {
    this.ignoreDrag = true; 
    var element = this.input.getElement();  
};


UIControlSearch.prototype.onDrag = function(event) {
    if (this.ignoreDrag) {
        this.ignoreDrag = false;
        return; 
    } 

    var element = this.input.getElement();  
    element.value = this.lastSearch;
    element.blur(); //defocus'
    this.hideList(); 
};


UIControlSearch.prototype.update = function(event) {
    if (this.initialValueUsed && this.browser.mapLoaded) {
        this.initialValueUsed = false;
        this.onSelectItem(0);
    }
};


export default UIControlSearch;
