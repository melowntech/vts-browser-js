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
        position : [ 'obj', 15.096869389048662, 49.38435909591623, 'float', 0.00, 0.00, -90.00, 0.00, 1587848.47, 45.00 ],
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }

    renderer = browser.renderer;

    //callback once is map config loaded
    browser.on('map-loaded', onMapLoaded);

    loadTexture();
})();


var demoTexture = null;


function loadTexture() {
    //load icon used for displaying
    var demoImage = vts.utils.loadImage(
        'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
        (function(){
            demoTexture = renderer.createTexture({ source: demoImage });
        }));
}


function onMapLoaded() {
    //add render slots
    //render slots are called during map render
    map = browser.map;
    map.addRenderSlot('custom-render', onCustomRender, true);
    map.moveRenderSlotAfter('after-map-render', 'custom-render');
};


function onCustomRender() {
    if (demoTexture) { //check whether texture is loaded

        //we have line points in navigation coordinates
        //so we need to convert them to physical coordinates

        //we have to use coords in physical space to deal
        //with cases where we need to clip line poins to the
        //camera near plane

        var points = new Array(linePoints.length);
        
        for (var i = 0; i < linePoints.length; i++) {
            points[i] = map.convertCoordsFromNavToPhys(linePoints[i], 'float', null, true);
        }

        //draw line
        renderer.drawLineString({
            points : points,
            size : 2.0,
            color : [255,0,255,255],
            depthTest : false,
            //depthTest : true,
            //depthOffset : [-0.01,0,0],
            screenSpace : false, //switch to physical space
            blend : false
            });

        //draw point image at the first line point
        //we have to use canvas space
        var coords = map.convertCoordsFromPhysToCanvas(points[0]);
        if (coords[2] <= 1.0) { // check camera near plane collision
            renderer.drawImage({
                rect : [coords[0]-12, coords[1]-12, 24, 24],
                texture : demoTexture,
                color : [255,0,255,255],
                depth : coords[2],
                depthTest : true,
                depthOffset : [-0.01,0,0],
                blend : true
                });
        }

        //draw point image at the last line point
        coords = map.convertCoordsFromPhysToCanvas(points[points.length-1]);
        if (coords[2] <= 1.0) { // check camera near plane collision
            renderer.drawImage({
                rect : [coords[0]-12, coords[1]-12, 24, 24],
                texture : demoTexture,
                color : [255,0,255,255],
                depth : coords[2],
                depthTest : true,
                depthOffset : [-0.01,0,0],
                blend : true
                });
        }
    }    
}
