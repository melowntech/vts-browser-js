var browser = null;
var renderer = null;
var map = null;

(function startDemo() {
    browser = vts.browser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 1764, 90 ]
    });

    if (!browser) {
        console.log("Your web browser does not support WebGL");
        return;
    }

    renderer = browser.renderer;

    browser.on("map-loaded", onMapLoaded);
    loadImage();
})();


var demoTexture = null;


function loadImage() {
    var demoImage = vts.utils.loadImage(
                   "http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
                    (function(){
                       demoTexture = renderer.createTexture({ "source": demoImage });
                    }));
}


function onMapLoaded() {
    map = browser.map;
    map.addRenderSlot("custom-render", onCustomRender, true);
    map.moveRenderSlotAfter("after-map-render", "custom-render");
};


function onCustomRender() {
    if (demoTexture) {
        var coords = map.convertCoordsFromNavToCanvas([1683559, 6604129, 0], "float");

        var totalPoints = 32;
        var points = new Array(totalPoints);
        var p = [1683559, 6604129, 0];
        var scale = [400, 100];
        
        for (var i = 0; i < totalPoints; i++) {
            points[i] = map.convertCoordsFromNavToCanvas(
                         [p[0] + (i / totalPoints) * scale[0],
                         p[1] + Math.sin(2 * Math.PI * (i / totalPoints)) * scale[1],
                         p[2]], "float");
        }

        renderer.drawLineString({
            "points" : points,
            "size" : 2.0,
            "color" : [255,0,255,255],
            "depth-test" : false,
            "blend" : false
            });
        
            
        renderer.drawImage({
            "rect" : [coords[0]-12, coords[1]-12, 24, 24],
            "texture" : demoTexture,
            "color" : [255,0,255,255],
            "depth" : coords[2],
            "depth-test" : false,
            "blend" : true
            });
    }    
}


 
