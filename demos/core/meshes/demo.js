var core = null;
var map = null;
var renderer = null;
var woodTexture = null;
var cubeMesh = null;
var isMapProjected = false;

(function startDemo() {
    //check vadstena support (webgl)
    if (!vts.checkSupport()) {
        alert("VTS browser needs web browser with WebGL support.");
        return;
    }

    //init melown core
    core = vts.core("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 964, 90 ]
    });

    renderer = core.renderer;
   
    //callback once is map config loaded
    core.on("map-loaded", onMapLoaded);

    //load texture used for cubes    
    var woodImage = vts.utils.loadImage("./wood.png",
        (function(){
            woodTexture = renderer.createTexture({ "source": woodImage });
        }).bind(this)
        );
        

    //create cube mesh        
    createCube();         

    //mouse events
    document.onmousedown = onMouseDown;
    document.oncontextmenu = (function(){ return false;});
    document.onmouseup = onMouseUp;
    document.onmousemove = onMouseMove;
    window.addEventListener("DOMMouseScroll", onMouseWheel, true);
    window.addEventListener("mousewheel", onMouseWheel, true);
    document.onselectstart = function(){ return false; }; //removes text cusor during draging
})();


function createCube() {
    var vertices = [ 1,1,1, -1,1,1, -1,-1,1, //top 
                     -1,-1,1, 1,-1,1, 1,1,1,

                     -1,1,-1, 1,1,-1, 1,-1,-1, //bottom 
                     1,-1,-1, -1,-1,-1, -1,1,-1,
                     
                     1,-1,1, -1,-1,1, -1,-1,-1, //front 
                     -1,-1,-1, 1,-1,-1, 1,-1,1,
                     
                     -1,1,1, 1,1,1, 1,1,-1, //back 
                     1,1,-1, -1,1,-1, -1,1,1,

                     -1,-1,1, -1,1,1, -1,1,-1, //left 
                     -1,1,-1, -1,-1,-1, -1,-1,1,

                     1,1,1, 1,-1,1, 1,-1,-1, //right 
                     1,-1,-1, 1,1,-1, 1,1,1 ];
                      
    var uvs = [ 0,0, 1,0, 1,1, //top
                1,1, 0,1, 0,0,

                0,0, 1,0, 1,1, //bottom
                1,1, 0,1, 0,0,                
                
                0,0, 1,0, 1,1, //front
                1,1, 0,1, 0,0,                

                0,0, 1,0, 1,1, //back
                1,1, 0,1, 0,0,                

                0,0, 1,0, 1,1, //left
                1,1, 0,1, 0,0,

                0,0, 1,0, 1,1, //right
                1,1, 0,1, 0,0 ];

    var normals = [ 0,0,1, 0,0,1, 0,0,1, //top
                    0,0,1, 0,0,1, 0,0,1,

                    0,0,-1, 0,0,-1, 0,0,-1, //bottom
                    0,0,-1, 0,0,-1, 0,0,-1,                    

                    0,-1,0, 0,-1,0, 0,-1,0, //front
                    0,-1,0, 0,-1,0, 0,-1,0,                    
                    
                    0,1,0, 0,1,0, 0,1,0, //back
                    0,1,0, 0,1,0, 0,1,0,                    

                    -1,0,0, -1,0,0, -1,0,0, //left
                    -1,0,0, -1,0,0, -1,0,0,                    

                    1,0,0, 1,0,0, 1,0,0, //right
                    1,0,0, 1,0,0, 1,0,0 ];

    cubeMesh = renderer.createMesh({ "vertices": vertices, "uvs": uvs, "normals": normals });
}

function drawCube(coords, scale, ambientColor, diffuseColor, specularColor, shininess, textured) {
    var cameInfo = map.getCameraInfo();

    //matrix which tranforms mesh position and scale
    var mv = [
        scale, 0, 0, 0,
        0, scale, 0, 0,
        0, 0, scale, 0,
        coords[0], coords[1], coords[2] + scale, 1
    ];

    //setup material 
    var material = [
        ambientColor[0], ambientColor[1], ambientColor[2], 0,
        diffuseColor[0], diffuseColor[1], diffuseColor[2], 0,
        specularColor[0], specularColor[1], specularColor[2], 0,
        shininess, 0, 0, 0
    ];

    //multiply cube matrix with camera view matrix
    vts.mat4.multiply(cameInfo["view-matrix"], mv, mv);

    var norm = [
        0,0,0,
        0,0,0,
        0,0,0
    ];

    //normal transformation matrix
    vts.mat4.toInverseMat3(mv, norm);

    //draw cube
    renderer.drawMesh({
            "mesh" : cubeMesh,
            "texture" : woodTexture,
            "shader" : textured ? "textured-and-shaded" : "shaded",
            "shader-variables" : {
                "uMV" : ["mat4", mv],
                "uNorm" : ["mat3", norm],
                "uMaterial" : ["mat4", material]
            }
        });
}


function onMapLoaded() {
    map = core.map;
    //add render slots
    //render slots are called during map render
    map.addRenderSlot("custom-meshes", onDrawMeshes, true);
    map.moveRenderSlotAfter("after-map-render", "custom-meshes");
	
    //check whether is map projected (used for navigation)
    var rf = map.getReferenceFrame();
    var srs = map.getSrsInfo(rf["navigationSrs"]);
    isMapProjected = (srs) ? (srs["type"] == "projected") : false; 	
}
    
function onDrawMeshes(renderChannel) {
    if (renderChannel != "base") {
        return; //draw only in base channel
    }

    if (woodTexture) {
        var coords;

        //draw textured cubes        
        coords = map.convertCoordsFromNavToCameraSpace([1683559, 6604129, 0], "float");
        drawCube(coords, 50, [255,128,128], [0,0,0], [0,0,0], 0, true);

        coords = map.convertCoordsFromNavToCameraSpace([1683559+150, 6604129, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [0,0,0], 0, true);

        coords = map.convertCoordsFromNavToCameraSpace([1683559+300, 6604129, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [255,255,255], 90, true);

        //draw cubes without textures
        coords = map.convertCoordsFromNavToCameraSpace([1683559, 6604129+200, 0], "float");
        drawCube(coords, 50, [255,128,128], [0,0,0], [0,0,0], 0, false);

        coords = map.convertCoordsFromNavToCameraSpace([1683559+150, 6604129+200, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [0,0,0], 0, false);

        coords = map.convertCoordsFromNavToCameraSpace([1683559+300, 6604129+200, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [255,255,255], 90, false);
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
   
    if (map) {
        var pos = map.getPosition();
        
        if (mouseLeftDown) { //pan
            
            //get zoom factor
            var sensitivity = 0.5;
            var viewExtent = pos.getViewExtent();
            var fov = pos.getFov()*0.5;
            var zoomFactor = ((viewExtent * Math.tan(vts.math.radians(fov))) / 800) * sensitivity;
            
            //apply factor to deltas
            dx *= zoomFactor;
            dy *= zoomFactor;
        
            //get azimuth and distance
            var distance = Math.sqrt(dx*dx + dy*dy);    
            var azimuth = vts.math.degrees(Math.atan2(dx, dy)) + pos.getOrientation()[0]; 
            
            //move position
            pos = map.movePositionCoordsTo(pos, (isMapProjected ? 1 : -1) * azimuth, distance);
            pos = reduceFloatingHeight(pos, 0.8);
            map.setPosition(pos);
                        
        } else if (mouseRightDown) { //rotate
           
            var orientation = pos.getOrientation();  

            var sensitivity_ = 0.4;
            orientation[0] -= dx * sensitivity_;
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

