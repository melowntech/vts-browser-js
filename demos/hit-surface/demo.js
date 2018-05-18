var browser = null;
var map = null;
var renderer = null;
var pointTexture = null;
var clickCoords = null;


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

    //add mouse down callback
    browser.ui.getMapElement().on('mousedown', onMouseDown);

    loadTexture();
})();


function loadTexture() {
    //load icon used for displaying hit point
    var pointImage = vts.utils.loadImage(
        'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
        (function(){
            pointTexture = renderer.createTexture({ source: pointImage });
        }).bind(this)
        );
}


function onMapLoaded() {
    //add render slots
    //render slots are called during map render
    map = browser.map;
    map.addRenderSlot('custom-points', onDrawPoints, true);
    map.moveRenderSlotAfter('after-map-render', 'custom-points');
}


function onMouseDown(event) {
    if (event.getMouseButton() == 'left') {
        var coords = event.getMouseCoords();

        //get hit coords with fixed height
        clickCoords = map.getHitCoords(coords[0], coords[1], 'fix');

        console.log(JSON.stringify(clickCoords));
        
        //force map redraw to display hit point
        map.redraw();
    }
}


function onDrawPoints(renderChannel) {
    if (renderChannel == 'hit') {
        return; //do render points in to the hit texture
    }

    if (clickCoords) { //draw hit point
        //conver hit coords to canvas coords
        coords = map.convertCoordsFromNavToCanvas(clickCoords, "fix");

        renderer.drawImage({
            rect : [coords[0]-12, coords[1]-12, 24, 24],
            texture : pointTexture,
            color : [255,0,0,255],  //white point is multiplied by red color so resulting point will be red
            depth : coords[2],
            depthTest : false,
            blend : true   //point texture has alpha channel so blend is needed
            });
    }
};



