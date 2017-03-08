
var browser = null;
var woodTexture = null;
var cubeMesh = null;

function startDemo() {
    browser = Melown.MapBrowser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 964, 90 ]
    });

    //callback once is map config loaded
    browser.on("map-loaded", onMapLoaded);

    //load texture used for cubes    
    loadTexture();

    //create cube mesh        
    createCube();    
}

function loadTexture() {
    //load texture used for cubes    
    var woodImage = Melown.Http.imageFactory("./wood.png",
        (function(){
            woodTexture = browser.getRenderer().createTexture({ "source": woodImage });
        }).bind(this)
        );
}

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

    cubeMesh = browser.getRenderer().createMesh({ "vertices": vertices, "uvs": uvs, "normals": normals });
}

function drawCube(coords, scale, ambientColor, diffuseColor, specularColor, shininess, textured) {
    var renderer = browser.getRenderer();
    var cameInfo = browser.getCameraInfo();

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
    Melown.Math.mat4Multiply(cameInfo["view-matrix"], mv, mv);

    var norm = [
        0,0,0,
        0,0,0,
        0,0,0
    ];

    //extract normal transformation matrix from model view matrix
    Melown.Math.mat4ToInverseMat3(mv, norm);

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
    //add render slots
    //render slots are called during map render
    browser.addRenderSlot("custom-meshes", onDrawMeshes, true);
    browser.moveRenderSlotAfter("after-map-render", "custom-meshes");
};

function onDrawMeshes(renderChannel) {
    if (renderChannel != "base") {
        return; //draw only in base channel
    }

    if (woodTexture) {
        var coords;

        //draw textured cubes        
        coords = browser.convertCoordsFromNavToCameraSpace([1683559, 6604129, 0], "float");
        drawCube(coords, 50, [255,128,128], [0,0,0], [0,0,0], 0, true);

        coords = browser.convertCoordsFromNavToCameraSpace([1683559+150, 6604129, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [0,0,0], 0, true);

        coords = browser.convertCoordsFromNavToCameraSpace([1683559+300, 6604129, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [255,255,255], 90, true);

        //draw cubes without textures
        coords = browser.convertCoordsFromNavToCameraSpace([1683559, 6604129+200, 0], "float");
        drawCube(coords, 50, [255,128,128], [0,0,0], [0,0,0], 0, false);

        coords = browser.convertCoordsFromNavToCameraSpace([1683559+150, 6604129+200, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [0,0,0], 0, false);

        coords = browser.convertCoordsFromNavToCameraSpace([1683559+300, 6604129+200, 0], "float");
        drawCube(coords, 50, [0,0,0], [255,128,128], [255,255,255], 90, false);
    }    
} 

