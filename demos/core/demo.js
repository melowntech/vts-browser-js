var core = null;
var map = null;
var isMapProjected = false;


(function startDemo() {
    //check vts-core support (webgl)
    if (!vts.checkSupport()) {
        alert('VTS browser needs web browser with WebGL support.');
        return;
    }

    // create map in the html div with id 'map-div'
    // parameter 'map' sets path to the map which will be displayed
    // you can create your own map on melown.com
    core = vts.core('map-div', {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-map/mapConfig.json'
    });

    //callback once is map config loaded
    core.on('map-loaded', onMapLoaded);	
	
    //set mouse events callbacks
    document.onmousedown = onMouseDown;
    document.oncontextmenu = (function(){ return false;});
    document.onmouseup = onMouseUp;
    document.onmousemove = onMouseMove;
    window.addEventListener('DOMMouseScroll', onMouseWheel, true);
    window.addEventListener('mousewheel', onMouseWheel, true);
    document.onselectstart = function(){ return false; }; //removes text cusor during draging
})();


function onMapLoaded() {
    map = core.map;
    //check whether is map projected (used for navigation)
    var rf = map.getReferenceFrame();
    var srs = map.getSrsInfo(rf.navigationSrs);
    isMapProjected = (srs) ? (srs.type == 'projected') : false; 
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
   
    if (map) {
        var pos = map.getPosition();
        
        if (mouseLeftDown) { //pan

            //pan sensitivity
            var sensitivity = 2;
            
            //sensitivity have to be also
            //affected by zoom (view extent) and fov

            //get zoom factor
            var viewExtent = pos.getViewExtent();
            var fov = pos.getFov();
            var zoomFactor = ((viewExtent * Math.tan(vts.math.radians(fov*0.5))) / 800) * sensitivity;

            //get fov factor
            var fovCorrection = (fov > 0.01 && fov < 179) ? (1.0 / Math.tan(vts.math.radians(fov*0.5))) : 1.0;
       
            //get azimuth and distance
            //apply zoon a fov factors to distance
            //distance means how far we move in direction of azimut
            var distance = Math.sqrt(dx*dx + dy*dy) * zoomFactor * fovCorrection;    
            var azimuth = vts.math.degrees(Math.atan2(dx, dy)) - pos.getOrientation()[0]; 
            
            //move to new position
            pos = map.movePositionCoordsTo(pos, (isMapProjected ? 1 : -1) * azimuth, distance);
            pos = reduceFloatingHeight(pos, 0.8);
            map.setPosition(pos);
                        
        } else if (mouseRightDown) { //rotate
           
            var orientation = pos.getOrientation();  

            var sensitivity_ = 0.4;
            orientation[0] += dx * sensitivity_;
            orientation[1] -= dy * sensitivity_;

            pos = pos.setOrientation(orientation);  
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

    if (map) {
        var pos = map.getPosition();

        var viewExtent = pos.getViewExtent();

        viewExtent *= 1.0 + (delta > 0 ? -1 : 1)*0.05;

        pos = pos.setViewExtent(viewExtent);
        pos = reduceFloatingHeight(pos, 0.8);
        map.setPosition(pos);
    }  
}


//used to to gradually reduce relative height over terrain
function reduceFloatingHeight(pos, factor) {
    if (pos.getHeightMode() == "float" &&
        pos.getViewMode() == "obj") {
            
        var coords = pos.getCoords();
        if (coords[2] != 0) {
            coords[2] *= factor;

            if (Math.abs(coords[2]) < 0.1) {
                coords[2] = 0;
            }

            pos.setCoords(coords);
        }
    }
    
    return pos;
};

