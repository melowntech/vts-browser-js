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
        position : [ 'obj', 8.151584320, 61.48064554, 'float', 0.00, -23.00, -49.10, 0.00, 41033.50, 45.00 ]
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
    vts.utils.loadJSON('./jotunheimen_track.json', geojsonLoaded);
}


function geojsonLoaded(data) {
    //create geodata object
    geodata = map.createGeodata();

    //import GeoJSON data
    //polygon are not supported yet
    geodata.importGeoJson(data);

    //this function is needed only when 'float' heights are used
    //in case you use data with 'fix' height only then you can
    //skip this function and call makeFreeLayer directly
    geodata.processHeights('node-by-precision', 62, onHeightProcessed);
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

            "track-line" : {
                "filter" : ["==", "#type", "line"],
                "line": true,
                "line-width" : 4,
                "line-color": [255,0,255,255],
                "zbuffer-offset" : [-7,0,0],
                "z-index" : -1
            },

            "track-shadow" : {
                "filter" : ["==", "#type", "line"],
                "line": true,
                "line-width" : 20,
                "line-color": [0,0,0,120],
                "zbuffer-offset" : [-7,0,0]
            },

            "place" : {
                "filter" : [ "all", ["==", "#type", "point"]],
                'icon': true,
                'icon-source': '@icon-marker',
                'icon-color': [0,255,0,255],
                'icon-scale': 2,
                'icon-origin': 'center-center',

                "label": true,
                "label-size": 19,
                "label-source": "$title",
                "label-offset": [0,-20],

                "zbuffer-offset" : [-8,0,0]
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

