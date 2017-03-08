
var core = null;
var demoTexture = null;
var isMapProjected = false;

function startDemo() {
    //check vadstena support (webgl)
    if (!Melown.checkSupport()) {
        alert("Unfturtunately, Melown Maps needs browser support for WebGL. Sorry.");
        return;
    }

    //init melown core
    core = Melown.MapCore("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 1764, 90 ],
        view : {
            "surfaces": {
                "grand": [],
                "ev": []
            },
            "freelayers": []
        }
    });
    
    core.on("map-loaded", onMapLoaded);

    //load image    
    var demoImage = Melown.Http.imageFactory(
        "http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
        (function(){
            demoTexture = core.getRenderer().createTexture({ "source": demoImage });
        }).bind(this)
        );

    //mouse events
    document.onmousedown = onMouseDown;
    document.oncontextmenu = (function(){ return false;});
    document.onmouseup = onMouseUp;
    document.onmousemove = onMouseMove;
    window.addEventListener("DOMMouseScroll", onMouseWheel, true);
    window.addEventListener("mousewheel", onMouseWheel, true);
    document.onselectstart = function(){ return false; }; //removes text cusor during draging
}


function onMapLoaded() {
    var map = core.getMap();
    map.addRenderSlot("custom-render", onCustomRender, true);
    map.moveRenderSlotAfter("after-map-render", "map");

    //check whether is map projected (used for navigation)
    var rf = map.getReferenceFrame();
    var srs = map.getSrsInfo(rf["navigationSrs"]);
    isMapProjected = (srs) ? (srs["type"] == "projected") : false; 	
};
    
function onCustomRender() {
    var map = core.getMap();

    if (demoTexture) {
        var renderer = core.getRenderer();
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


function switchMap() {
    var map = core.getMap();
    
    if (map) {
        if (document.getElementById("switch").checked) {
            map.setView({
                "surfaces": {
                    "grand": [],
                    "ev": [ "mapycz-base" ]
                },
                "freelayers": []
            });    
        } else {
            map.setView({
                "surfaces": {
                    "grand": [],
                    "ev": []
                },
                "freelayers": []
            });    
        }
    }
}


//mouse events
var mouseRightDown = false;
var mouseLeftDown = false;

var mouseLx = 0;
var mouseLy = 0;

function onMouseDown(event) {
    var right = false;
    var e = event || window.event;

    if (e.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        right = e.which == 3;
    } else if (e.button) { // IE, Opera
        right = e.button == 2;
    }

    if (right == true) {
        mouseRightDown = true;
    } else {
        mouseLeftDown = true;
    }
}


function onMouseUp(event) {
    var right = false;
    var e = event || window.event;

    if (e.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        right = e.which == 3;
    } else if (e.button) { // IE, Opera
        right = e.button == 2;
    }

    if (right == true) {
        mouseRightDown = false;
    } else {
        mouseLeftDown = false;
    }
}


function onMouseMove(event) {
    //get mouse coords
    var x = event.clientX;
    var y = event.clientY;
    //get mouse deltas
    var dx = (x - mouseLx);
    var dy = (y - mouseLy);
    //store coords
    mouseLx = x;
    mouseLy = y;

    var map = core.getMap();
    
    if (map) {
        var pos = map.getPosition();
        
        if (mouseLeftDown) { //pan
            
            //get zoom factor
            var sensitivity = 0.5;
            var viewExtent = map.getPositionViewExtent(pos);
            var fov = map.getPositionFov(pos)*0.5;
            var zoomFactor = ((viewExtent * Math.tan(Melown.radians(fov))) / 800) * sensitivity;
            
            //apply factor to deltas
            dx *= zoomFactor;
            dy *= zoomFactor;
        
            //get azimuth and distance
            var distance = Math.sqrt(dx*dx + dy*dy);    
            var azimuth = Melown.degrees(Math.atan2(dx, dy)) + map.getPositionOrientation(pos)[0]; 
            
            //move position
            pos = map.movePositionCoordsTo(pos, (isMapProjected ? 1 : -1) * azimuth, distance);
            pos = reduceFloatingHeight(pos, 0.8);
            map.setPosition(pos);
                        
        } else if (mouseRightDown) { //rotate
           
            var orientation = map.getPositionOrientation(pos);  

            var sensitivity_ = 0.4;
            orientation[0] -= dx * sensitivity_;
            orientation[1] -= dy * sensitivity_;

            pos = map.setPositionOrientation(pos, orientation);  
            map.setPosition(pos);
        }    

        
    }
}

function onMouseWheel(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }

    event.returnValue = false;

    var delta = 0;

    if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
    }
    if (event.detail) {
        delta = -event.detail / 3;
    }

    if (isNaN(delta) == true) {
        delta = 0;
    }

    var map = core.getMap();
    if (map) {
        var pos = map.getPosition();

        var viewExtent = map.getPositionViewExtent(pos, viewExtent);

        viewExtent *= 1.0 + (delta > 0 ? -1 : 1)*0.05;

        pos = map.setPositionViewExtent(pos, viewExtent);
        pos = reduceFloatingHeight(pos, 0.8);
        map.setPosition(pos);
    }  
}

//used to to gradually reduce relative height over terrain
function reduceFloatingHeight(pos, factor) {
    var map = core.getMap();
    if (map.getPositionHeightMode(pos) == "float" &&
        map.getPositionViewMode(pos) == "obj") {
            
        var coords = map.getPositionCoords(pos);
        if (coords[2] != 0) {
            coords[2] *= factor;

            if (Math.abs(coords[2]) < 0.1) {
                coords[2] = 0;
            }

            pos = map.setPositionCoords(pos, coords);
        }
    }
    
    return pos;
};

