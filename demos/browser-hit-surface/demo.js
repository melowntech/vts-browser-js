
var browser = null;
var pointTexture = null;
var clickCoords = null;

function startDemo() {
    browser = Melown.MapBrowser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 964, 90 ]
    });

    //callback once is map config loaded
    browser.on("map-loaded", onMapLoaded);

    //add mouse down callback
    browser.getMapElement().on('mousedown', onMouseDown);

    loadTexture();
}

function loadTexture() {
    //load icon used for displaing hit point
    var pointImage = Melown.Http.imageFactory(
        "http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
        (function(){
            pointTexture = browser.getRenderer().createTexture({ "source": pointImage });
        }).bind(this)
        );
}


function onMapLoaded() {
    //add render slots
    //render slots are called during map render
    browser.addRenderSlot("custom-points", onDrawPoints, true);
    browser.moveRenderSlotAfter("after-map-render", "custom-points");
}

function onMouseDown(event) {
    if (event.getMouseButton() == "left") {
        var coords = event.getMouseCoords();

        //get hit coords with fixed height
        clickCoords = browser.getHitCoords(coords[0], coords[1], "fixed");
        
        //force map redraw to display hit point
        browser.redraw();
    }
}

function onDrawPoints(renderChannel) {
    if (renderChannel == "hit") {
        return; //do render points in to the hit texture
    }

    if (clickCoords) { //draw hit point
        var renderer = browser.getRenderer();
        
        //conver hit coords to canvas coords
        coords = browser.convertCoordsFromNavToCanvas(clickCoords, "fixed");

        renderer.drawImage({
            "rect" : [coords[0]-12, coords[1]-12, 24, 24],
            "texture" : pointTexture,
            "color" : [255,0,0,255],
            "depth" : coords[2],
            "depth-test" : false,
            "blend" : true
            });
    }
};



