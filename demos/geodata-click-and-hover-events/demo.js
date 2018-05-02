var browser = null;
var renderer = null;
var map = null;
var geodata = null;
var statusDiv = null;

(function startDemo() {
    // create map in the html div with id 'map-div'
    // parameter 'map' sets path to the map which will be displayed
    // you can create your own map on melown.com
    // position parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#position
    // view parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#definition-of-view
    browser = vts.browser('map-div', {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-map/mapConfig.json',
        position : [ 'obj', 15.096869, 49.3843590, 'float', 0.00, 2.70, -77.86, 0.00, 692772.54, 45.00 ]
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }

    var panel = browser.ui.addControl('status-panel',
        '<div id="status-div">' +
            '<div id="selected-status">Selected: Nothing</div>' +
            '<div id="hover-status">Hovering over: Nothing</div>' +
        '</div>');

    //get status-div element
    //do not use document.getElementById,
    //because element ids are changed to unique ids
    selectedStatusDiv = panel.getElement('selected-status');
    hoverStatusDiv = panel.getElement('hover-status');

    renderer = browser.renderer;

    //add mouse down callback
    browser.ui.getMapElement().on('mousemove', onMouseMove);
    browser.ui.getMapElement().on('mouseleave', onMouseLeave);
    browser.ui.getMapElement().on('mouseup', onMouseClick);

    //geodata events listeners
    browser.on('geo-feature-enter', onFeatureEnter);
    browser.on('geo-feature-leave', onFeatureLeave);
    browser.on('geo-feature-hover', onFeatureHover);
    browser.on('geo-feature-click', onFeatureClick);

    //callback once is map config loaded
    browser.on('map-loaded', onMapLoaded);
})();


function onMapLoaded() {
    map = browser.map;

    //create geodata object
    geodata = map.createGeodata();

    // add line to geodata with id = 'blue-line'
    // note that feature has its own properties
    geodata.addLineString([
        [13.4836691, 49.6285568, 0],
        [13.8559398, 49.2926023, 0],
        [14.3590684, 49.1136598, 0],
        [15.2561336, 49.0637509, 0],
        [15.8564221, 49.2444548, 0],
        [16.2429312, 49.5161402, 0]
    ], 'float', { a : 1, b : 2 }, 'blue-line');


    //add line to geodata with id = 'red-line'
    geodata.addLineString([
        [13.4836691, 50.6285568, 0],
        [13.8559398, 50.2926023, 0],
        [14.3590684, 50.1136598, 0],
        [15.2561336, 50.0637509, 0],
        [15.8564221, 50.2444548, 0],
        [16.2429312, 50.5161402, 0]
    ], 'float', { a : 4, b : 5 }, 'red-line');


    //this function is needed only when 'float' heights are used
    //in case you use data with 'fix' height only then you can
    //skip this function and call makeFreeLayer directly
    geodata.processHeights('heightmap-by-precision', 62, onHeightProcessed);
}

function onHeightProcessed() {

    var style = {
        'constants': {
            '@icon-marker': ['icons', 6, 8, 18, 18]
        },
    
        'bitmaps': {
            'icons': 'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png'
        },

        "layers" : {
            "some-red-line" : {
                "filter" : ["==", "#id", "red-line"],
                "line": true,
                "line-width" : 4,
                "line-color": [255,0,0,255],
                "zbuffer-offset" : [-5,0,0],
                "z-index" : -1
            },

            "some-blue-line" : {
                "filter" : ["==", "#id", "blue-line"],
                "line": true,
                "line-width" : 4,
                "line-color": [0,0,255,255],
                "zbuffer-offset" : [-5,0,0],
                "z-index" : -1
            },

            "line-base-outline" : {
                "filter" : ["skip"],
                "line": true,
                "line-width" : 40,
                "line-color": [0,0,0,100],
                "zbuffer-offset" : [-5,0,0],
                "hover-event" : true,  //we enable generating hover events 
                "click-event" : true   //we enable generating click events 
            },

            "line-hover-outline" : {
                "inherit" : "line-base-outline",
                "line-width" : 48,
                "line-color": [255,0,255,100]
            },

            "line-base" : {
                "filter" : null,
                "inherit" : "line-base-outline",
                "selected-layer" : "line-selected",  //this style layer will be used when feature is selected
                "selected-hover-layer" : "line-selected-hover",  //this style layer will be used when feature is selected
                "hover-layer" : "line-hover",  //this style layer will be used when feature is hovered
            },

            "line-hover" : {
                "inherit" : "line-base-outline",
                "next-pass" : [[1,"line-hover-outline"]]
            },

            "line-selected" : {
                "inherit" : "line-base-outline",
                "line-color": [255,255,255,100]
            },

            "line-selected-hover" : {
                "inherit" : "line-base-outline",
                "line-color": [255,255,255,100],
                "next-pass" : [[1,"line-hover-outline"]]
            }

        }
    };

    //make free layer
    var freeLayer = geodata.makeFreeLayer(style);

    //add free layer to the map
    map.addFreeLayer('geodatatest', freeLayer);

    //add free layer to the list of free layers
    //which will be rendered on the map
    var view = map.getView();
    view.freeLayers.geodatatest = {};
    map.setView(view);

}

function onMouseLeave(event) {
    if (map) {
        var coords = event.getMouseCoords();
        //stop cursor hovering
        map.hover(coords[0], coords[1], false);
    }
}

function onMouseMove(event) {
    if (map) {
        var coords = event.getMouseCoords();
        //set map to hover cusor over provided coordinates permanently
        map.hover(coords[0], coords[1], true);
    }
}

function onMouseClick(event) {
    if (map) {
        var coords = event.getMouseCoords();
        //set map to hover cusor over provided coordinates permanently
        map.click(coords[0], coords[1], true);
    }
}

function onFeatureEnter(event) {
}

function onFeatureHover(event) {
    //update status box when feature is hovered
    hoverStatusDiv.setHtml('Hovering over:' + event.feature['#id']);
}

function onFeatureLeave(event) {
    //update status box when feature no longer hovered
    hoverStatusDiv.setHtml('Hovering over: nothing');
}

function onFeatureClick(event) {
    //update status box when feature no longer hovered
    selectedStatusDiv.setHtml('Selected: ' + event.feature['#id']);
    map.setGeodataSelection([event.feature['#id']]);
}


