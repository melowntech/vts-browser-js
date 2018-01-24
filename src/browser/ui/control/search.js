
import Dom_ from '../../utility/dom';
import {utils as utils_} from '../../../core/utils/utils';
import {filterSearch as filterSearch_, nofilterSearch as nofilterSearch_} from './search-filter';
import {vec3 as vec3_} from '../../../core/utils/matrix';
import {math as math_} from '../../../core/utils/math';

//get rid of compiler mess
var dom = Dom_;
var vec3 = vec3_;
var math = math_;
var utils = utils_;
var filterSearch = filterSearch_;
var nofilterSearch = nofilterSearch_;

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
    this.input.on('dblclick', this.onDoNothing.bind(this));

    this.list = this.control.getElement('vts-search-list');
    this.list.on('mousedown', this.onDrag2.bind(this));
    this.list.on('mousewheel', this.onDrag.bind(this));

    this.mapControl = this.ui.getMapControl();
    this.mapElement = this.mapControl.getMapElement();
    this.mapElement.on('mousedown', this.onDrag.bind(this), window);
    this.mapElement.on('mousewheel', this.onDrag.bind(this), window);

    this.ignoreDrag = false; 

    this.urlTemplate = '//eu-n1.windyty.com/search.php?q={value}&format=json&lang=en-US&addressdetails=1&limit=20';
    this.urlTemplate2 = this.urlTemplate;
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


UIControlSearch.prototype.onDoNothing = function(event) {
    dom.preventDefault(event);    
    dom.stopPropagation(event);    
};


UIControlSearch.prototype.processTemplate = function(str, obj) {
    return str.replace(/\{([$a-zA-Z0-9][$a-zA-Z0-9]*)\}/g, function(s, match) {
        return (match in obj ? obj[match] : s);
    });
};


UIControlSearch.prototype.showList = function() {
    this.list.setStyle('display', 'block');
};


UIControlSearch.prototype.hideList = function() {
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
    
    this.updateList(this.data);
};


UIControlSearch.prototype.updateList = function(json) {
    if (Array.isArray(json)) {
        var data = json, item, list = '';
        data = data.slice(0,10);
        this.data = data;

        for (var i = 0, li = data.length; i < li; i++) {
            item = data[i];

            if (this.itemIndex == i) {
                list += '<div id="vts-search-item' + i + '"'+ ' class="vts-search-listitem-selected">' + item['title'] + ' ' + (item['region'] ? item['region'] : '') + '</div>';
            } else {
                list += '<div id="vts-search-item' + i + '"'+ ' class="vts-search-listitem">' + item['title'] + ' ' + (item['region'] ? item['region'] : '') + '</div>';
            }
                
        }
        
        this.list.setHtml(list);

        for (i = 0, li = data.length; i < li; i++) {
            var id = 'vts-search-item' + i;
            item = this.control.getElement(id);
            
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

UIControlSearch.prototype.solveSRS = function(srs) {
    if (srs.indexOf('+proj=') == -1) { //no proj4 string
        srs = map.getSrsInfo(srs);
        if (srs && srs['srsDef']) {
            srs = srs['srsDef'];
        } else {
            srs = this.coordsSrs;            
        }
    }

    return srs;
};

UIControlSearch.prototype.onSelectItem = function(index) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }
    
    //sort list with polygons
    var pos = map.getPosition();
    var refFrame = map.getReferenceFrame();
    var navigationSrsId = refFrame['navigationSrs'];
    var navigationSrs = map.getSrsInfo(navigationSrsId);
    var physicalSrsId = refFrame['physicalSrs'];
    var physicalSrs = map.getSrsInfo(physicalSrsId);

    var proj4 = this.browser.getProj4();
    var srs = this.browser.config.controlSearchSrs || this.coordsSrs;
    srs = this.solveSRS(srs);

    var coords = proj4(navigationSrs['srsDef'], srs, pos.getCoords());

    pos = map.convertPositionHeightMode(pos, "float", true);

    var item = this.data[index];
    if (item) {
        var coords = [item['lon'], item['lat']];
        
        //conver coords from location srs to map navigation srs         
        coords = proj4(srs, navigationSrs['srsDef'], coords);
        coords[2] = 0;

        pos.setCoords(coords);

        var viewExtent = 6667;                

        if (item.bbox) {
            var lat1 = parseFloat(item.bbox[0]);
            var lat2 = parseFloat(item.bbox[1]);
            var lon1 = parseFloat(item.bbox[2]);
            var lon2 = parseFloat(item.bbox[3]);

            item.polygon = [
                [lon1, lat1], [(lon2+lon1)*0.5, lat1], [lon2, lat1],
                [lon1, (lat2+lat1)*0.5],  [lon2, (lat2+lat1)*0.5],
                [lon1, lat2], [(lon2+lon1)*0.5, lat2], [lon2, lat2]
            ];
        }

        if (item.polygon && item.type != 'continent') {
            var points = item.polygon;

            //convert point to physical coords
            var cameraPosition = proj4(srs, physicalSrs['srsDef'], coords);
            var cameraVector = [-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]];
            vec3.normalize(cameraVector);

            for (var i = 0, li = points.length; i < li; i++) {
                //convert point to physical coords
                coords = proj4(srs, physicalSrs['srsDef'], [points[i][0], points[i][1], 0]);

                var ab = cameraVector;
                var av = [coords[0] - cameraPosition[0], coords[1] - cameraPosition[1], coords[2] - cameraPosition[2]];

                //final R3 bv  = v.sub( b ) ;
                var b = [cameraPosition[0] + cameraVector[0], cameraPosition[1] + cameraVector[1], cameraPosition[2] + cameraVector[2]];
                var bv = [coords[0] - b[0], coords[1] - b[1], coords[2] - b[2]];

                var af = [0,0,0];
                vec3.cross(ab, av, af);

                var d = (vec3.length(bv) / vec3.length(ab)) * 2;

                if (d > viewExtent) {
                    viewExtent = d;
                }
            }

            if (navigationSrs['type'] != 'projected') {
                if (viewExtent > navigationSrs['a']*1.4) {
                    viewExtent = navigationSrs['a']*1.4;
                }
            }
        } else {
            //try to guess view extent from location type
            switch(item.type) {
            case 'peak':        viewExtent = 20000;   break;
            case 'city':        viewExtent = 30000;   break;                
            case 'street':      viewExtent = 4000;    break;
            case 'residential': viewExtent = 3000;    break;
            case 'continent':   viewExtent = 8550000; break;             
            }
        }
        
        pos.setViewExtent(viewExtent);                

        var orientation = [0,-60,0];

        //reduce tilt when you are far off the planet
        if (pos.getViewMode() == 'obj') {
            if (navigationSrs['a']) {
                var distance = (pos.getViewExtent()*0.5) / Math.tan(math.radians(pos.getFov()*0.5));
                var factor = Math.min(distance / (navigationSrs['a']*0.5), 1.0);
                var maxTilt = 20 + ((-90) - 20) * factor; 
                var minTilt = -90; 
                
                if (orientation[1] > maxTilt) {
                    orientation[1] = maxTilt;
                }
        
                if (orientation[1] < minTilt) {
                    orientation[1] = minTilt;
                }
            }
        }

        pos.setOrientation(orientation);
        map.setPosition(pos);
        
        this.itemIndex = index;
        this.lastSearch = item['title'];
        
        var element = this.input.getElement();  
        element.value = this.lastSearch;
        element.blur(); //defocus 
    }

    this.hideList();
};


UIControlSearch.prototype.onHoverItem = function(index) {
    if (this.itemIndex == index) {
        return;
    }

    this.itemIndex = index;
    this.updateList(this.data);
};


UIControlSearch.prototype.onListLoaded = function(counter, data) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    if (this.searchCounter == counter) {

        var pos = map.getPosition();
        var refFrame = map.getReferenceFrame();
        var navigationSrsId = refFrame['navigationSrs'];
        var navigationSrs = map.getSrsInfo(navigationSrsId);

        var proj4 = this.browser.getProj4();
        var srs = this.browser.config.controlSearchSrs || this.coordsSrs;
        srs = this.solveSRS(srs);

        var coords = proj4(navigationSrs['srsDef'], srs, pos.getCoords());

        if (this.browser.config.controlSearchFilter) {
            data = filterSearch(data, coords[0], coords[1]);
        } else {
            data = nofilterSearch(data, coords[0], coords[1]);
        }

        this.updateList(data);
    }
};


UIControlSearch.prototype.onListLoadError = function() {
};


UIControlSearch.prototype.onFocus = function() {
    this.lastSearch = '';
    var element = this.input.getElement();  
    element.value = this.lastSearch;
    this.hideList();
};


UIControlSearch.prototype.onKeyPress = function(event) {
    //console.log('press');

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


UIControlSearch.prototype.onChange = function() {
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
    
    var url = this.processTemplate(this.browser.config.controlSearchUrl || this.urlTemplate, { 'value' : value });
    //console.log(url);
    this.searchCounter++;
    this.itemIndex = -1;
   
    utils.loadJSON(url, this.onListLoaded.bind(this, this.searchCounter), this.onListLoadError.bind(this));
};


UIControlSearch.prototype.onDrag2 = function() {
    this.ignoreDrag = true; 
    //var element = this.input.getElement();  
};


UIControlSearch.prototype.onDrag = function() {
    if (this.ignoreDrag) {
        this.ignoreDrag = false;
        return; 
    } 

    var element = this.input.getElement();  
    element.value = this.lastSearch;
    element.blur(); //defocus'
    this.hideList(); 
};


UIControlSearch.prototype.update = function() {
    if (this.initialValueUsed && this.browser.mapLoaded) {
        this.initialValueUsed = false;
        this.onSelectItem(0);
    }
};


export default UIControlSearch;
