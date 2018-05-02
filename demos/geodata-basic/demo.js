var browser = null;
var renderer = null;
var map = null;
var geodata = null;

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
        position : [ 'obj', 15.096869389048662, 49.38435909591623, 'float', 0.00, 0.00, -90.00, 0.00, 1587848.47, 45.00 ]
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }

    //callback once is map config loaded
    browser.on('map-loaded', onMapLoaded);
})();


function onMapLoaded() {
    map = browser.map;

    //create geodata object
    geodata = map.createGeodata();

    //add line to geodata with id = 'some-points'
    //note that we are using 'float' heights which
    //define how much are above terrain
    geodata.addLineString([
        [13.4836691, 49.6285568, 0],
        [13.8559398, 49.2926023, 0],
        [14.3590684, 49.1136598, 0],
        [15.2561336, 49.0637509, 0],
        [15.8564221, 49.2444548, 0],
        [16.2429312, 49.5161402, 0]
    ], 'float', null, 'some-line');

    //add points with id = 'some-points'
    //note that this feature contains properties
    //with 'radius' parameter. We can use this parameter
    //later in the style for this feature
    geodata.addPointArray([
        [13.4836691, 49.6285568, 0],
        [16.2429312, 49.5161402, 0]
    ], 'float', { 'radius' : 20  }, 'some-points');
    
    //add group with id = 'places'
    //all features we create later will be stured in
    //this group. Storing fetures in diffrent groups
    //can be usefull for filtering in the styles
    geodata.addGroup('places');

    //add point with id = 'some-place'
    //note that this feature uses 'fix' height which
    //define heigth with no relation to the terrain
    geodata.addPoint([14.3836691, 50.0485568, 500],
                     'fix', { 'name' : 'Nice place'  }, 'some-place');

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
            "violet-line" : {
                "filter" : ["==", "#type", "line"],
                "line": true,
                "line-width" : 4,
                "line-color": [255,0,255,255],
                "zbuffer-offset" : [-5,0,0]
            },

            "violet-points" : {
                "filter" : ["==", "#id", "some-points"],
                "point": true,
                "point-radius" : "$radius",
                "point-color": [255,0,255,255],              
                "zbuffer-offset" : [-5,0,0]
            },

            "place" : {
                "filter" : [ "all", ["==", "#type", "point"], ["==", "#group", "places"] ],
                'icon': true,
                'icon-source': '@icon-marker',
                'icon-color': [0,255,0,255],
                'icon-scale': 2,
                'icon-origin': 'center-center',

                "label": true,
                "label-size": 19,
                "label-source": "$name",
                "label-offset": [0,-20],

                "zbuffer-offset" : [-5,0,0]
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

