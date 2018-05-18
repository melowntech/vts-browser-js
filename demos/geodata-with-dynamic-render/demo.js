var browser = null;
var renderer = null;
var map = null;
var geodata = null;
var lineGeometry = null;
var demoTexture = null;

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

    renderer = browser.renderer;

    //callback once is map config loaded
    browser.on('map-loaded', onMapLoaded);
    browser.on('tick', onTick);

    loadTexture();
})();


function loadTexture() {
    //load icon used for displaying
    var demoImage = vts.utils.loadImage(
        'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
        (function(){
            demoTexture = renderer.createTexture({ source: demoImage });
        }));
}

function onMapLoaded() {
    map = browser.map;
    map.addRenderSlot('custom-render', onCustomRender, true);
    map.moveRenderSlotAfter('after-map-render', 'custom-render');

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
    ], 'float', null, 'some-points');

    //this function is needed only when 'float' heights are used
    //in case you use data with 'fix' height only then you can
    //skip this function and call makeFreeLayer directly
    geodata.processHeights('heightmap-by-precision', 62, onHeightProcessed);
}

var pathLength = 0;
var pathDistance = 0;

function onHeightProcessed() {
    lineGeometry = geodata.extractGeometry('some-line');

    pathLength = lineGeometry.getPathLength();

    /*totalLineLength = lineGeometry.getPathLength();
    var p = lineGeometry.getPathPoint(2000);
    var p2 = lineGeometry.getPathPoint(398195);
    var c = lineGeometry.getPathsCount();
    var p1 = lineGeometry.getPathElement(0);*/

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
                "point-radius" : 12,
                "point-color": [255,0,255,255],              
                "zbuffer-offset" : [-5,0,0]
            },
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


function onCustomRender() {
    if (demoTexture && lineGeometry) { //check whether texture is loaded

        var p = lineGeometry.getPathPoint(pathDistance);
        p = map.convertCoordsFromPhysToCanvas(p);

        //draw point image at the last line point
        renderer.drawImage({
            rect : [p[0]-12*1.5, p[1]-12*1.5, 24*1.5, 24*1.5],
            texture : demoTexture,
            color : [255,0,255,255],
            depth : p[2],
            depthTest : false,
            blend : true
            });
    }    
}

function onTick() {
    if (demoTexture && lineGeometry) { //check whether texture is loaded

        pathDistance += pathLength / (60 * 3);
        pathDistance = pathDistance % pathLength;

        map.redraw();
    }
}

