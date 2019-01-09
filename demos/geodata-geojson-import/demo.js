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
        position : [ 'obj', -122.48443455025, 37.83071587047, 'float', 0.00, 19.04, -49.56, 0.00, 1946.45, 45.00 ]
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

    //import GeoJSON data
    //polygon are not supported yet
    geodata.importGeoJson(

        {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [-122.48347, 37.82955],
                    },
                    "properties": {
                        "title": "Golden Gate Bridge Vista Point",
                    }
                },

                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [-122.48369693756, 37.83381888486],
                            [-122.48344236083, 37.83317489144],
                            [-122.48335253015, 37.83270036637],
                            [-122.48361819152, 37.83205636317],
                            [-122.48404026031, 37.83114119107],
                            [-122.48404026031, 37.83049717427],
                            [-122.48348236083, 37.82992094395],
                            [-122.48356819152, 37.82954808664],
                            [-122.48507022857, 37.82944639795],
                            [-122.48610019683, 37.82880236636],
                            [-122.48695850372, 37.82931081282],
                            [-122.48700141906, 37.83080223556],
                            [-122.48751640319, 37.83168351665],
                            [-122.48803138732, 37.83215804826],
                            [-122.48888969421, 37.83297152392],
                            [-122.48987674713, 37.83263257682],
                            [-122.49043464660, 37.83293762928],
                            [-122.49125003814, 37.83242920781],
                            [-122.49163627624, 37.83256478721],
                            [-122.49223709106, 37.83337825839],
                            [-122.49378204345, 37.83368330777]
                        ]
                    }
                }
            ]
        }
    );

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

