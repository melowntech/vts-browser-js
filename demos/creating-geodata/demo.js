var browser = null;
var renderer = null;
var map = null;

var linePoints = [
    [13.4836691, 49.6285568, 0],
    [13.8559398, 49.2926023, 0],
    [14.3590684, 49.1136598, 0],
    [15.2561336, 49.0637509, 0],
    [15.8564221, 49.2444548, 0],
    [16.2429312, 49.5161402, 0]
];

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
        position : [ 'obj', 15.096869389048662, 49.38435909591623, 'float', 0.00, 0.00, -90.00, 0.00, 1587848.47, 55.00 ]
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

    var geodata = map.createGeodata();


    geodata.addLineString([
        [13.4836691, 49.6285568, 0],
        [13.8559398, 49.2926023, 0],
        [14.3590684, 49.1136598, 0],
        [15.2561336, 49.0637509, 0],
        [15.8564221, 49.2444548, 0],
        [16.2429312, 49.5161402, 0]
    ], 'float', null, 'some-line');

/*
    geodata.addLineStringArray([[
        [13.4836691, 49.6285568, 0],
        [13.8559398, 49.2926023, 0],
        [14.3590684, 49.1136598, 0],
        [15.2561336, 49.0637509, 0],
        [15.8564221, 49.2444548, 0],
        [16.2429312, 49.5161402, 0]
    ]], 'float', null, 'some-line');
*/

    geodata.addPointArray([
        [13.4836691, 49.6285568, 0],
        [16.2429312, 49.5161402, 0]
    ], 'float', null, 'some-point');

//    geodata.addPoint([16.2429312, 49.5161402, 0], 'float', null, 'some-line');
//    geodata.addPoint([13.4836691, 49.6285568, 0], 'float', null, 'some-line');

    geodata.processHeights('heightmap-by-lod', 4, (function(){

        var lineGeometry = geodata.extractGeometry('some-line');
        var pointGeometry = geodata.extractGeometry('some-point');

        var freeLayer = geodata.makeFreeLayer({
            "layers" : {
                "my-line" : {
                    "filter" : ["==", "#type", "line"],
                    "line": true,
                    "line-width" : 4,
                    "line-color": [255,0,255,255],
                    //"export-geometry" : true,                
                    "zbuffer-offset" : [-5,0,0]
                },

                "my-points" : {
                    "filter" : ["==", "#type", "point"],
                    "point": true,
                    "point-radius" : 10,
                    "point-color": [0,0,255,255],                
                    "zbuffer-offset" : [-5,0,0]
                }
            }
        });

        map.addFreeLayer('builder-test', freeLayer);

        map.setView({
            surfaces: {
                'melown-viewfinder-world': [
                    'bing-world',
                    'bmng08-world'
                ]
            },
            freeLayers: {
                'builder-test': {}
            }
        });    

    }));

};
