
var browser = null;

function startDemo() {
    browser = Melown.MapBrowser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 1764, 90 ]
    });

    browser.on("map-loaded", onMapLoaded);
    loadImage();
}

var demoTexture = null;

function loadImage() {
    var demoImage = Melown.Http.imageFactory(
                   "http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
                    (function(){
                       demoTexture = browser.getRenderer().createTexture({ "source": demoImage });
                    }));
}

function onMapLoaded() {
    browser.addRenderSlot("custom-render", onCustomRender, true);
    browser.moveRenderSlotAfter("after-map-render", "map");
};

function onCustomRender() {
    if (demoTexture) {
        var renderer = browser.getRenderer();
        var coords = browser.convertCoordsFromNavToCanvas([1683559, 6604129, 0], "float");

        var totalPoints = 32;
        var points = new Array(totalPoints);
        var p = [1683559, 6604129, 0];
        var scale = [400, 100];
        
        for (var i = 0; i < totalPoints; i++) {
            points[i] = browser.convertCoordsFromNavToCanvas(
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


 