var browser = null;
var map = null;
var renderer = null;
var woodTexture = null;
var pointTexture = null;
var cubeMesh = null;
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
        position : [ 'obj', 15.401540091152043, 50.660724358366906, 'float', 0.00, -244.63, -28.56, 0.00, 175.37, 45.00 ]
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

    //load texture used for cubes    
    loadTextures();

    //create cube mesh        
    createCube();    
})();


function loadTextures() {
    //load texture used for cubes    
    var woodImage = vts.utils.loadImage('./wood.png',
        (function(){
            woodTexture = renderer.createTexture({ source: woodImage });
        }).bind(this)
        );

    //load icon used for displaying hit point
    var pointImage = vts.utils.loadImage(
        'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
        (function(){
            pointTexture = renderer.createTexture({ source: pointImage });
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

    cubeMesh = renderer.createMesh({ vertices: vertices, uvs: uvs, normals: normals });
}


function drawCube(coords, scale, ambientColor, diffuseColor, specularColor, shininess, shader) {
    //get camera transformations matrices
    var cameraInfo = map.getCameraInfo();

    //get local space matrix
    //this matrix makes mesh
    //perpendiculal to the ground
    //and oriteted to the north
    var spaceMatrix = map.getNED(coords);

    //move cube above terain
    coords[2] += scale * 2;

    //we have coords in navigation coodinates,
    //so we need to convert them to camera space.
    //you can imagine camera space as physical space
    //but reative to the camera coordinates
    coords = map.convertCoordsFromNavToCameraSpace(coords, 'float');

    // translate matrix
    var translateMatrix = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        coords[0], coords[1], coords[2], 1
    ];

    // scale matrix
    var scaleMatrix = [
        scale, 0, 0, 0,
        0, scale, 0, 0,
        0, 0, scale, 0,
        0, 0, 0, 1
    ];

    //combine scale, space and translate matrices
    var mv = vts.mat4.create();
    vts.mat4.multiply(spaceMatrix, scaleMatrix, mv);
    vts.mat4.multiply(translateMatrix, mv, mv);

    //multiply cube matrix with camera view matrix
    vts.mat4.multiply(cameraInfo.viewMatrix, mv, mv);

    var norm = [
        0,0,0,
        0,0,0,
        0,0,0
    ];

    //extract normal transformation matrix from model view matrix
    //this matrix is needed for corret lighting
    vts.mat4.toInverseMat3(mv, norm);

    //setup material 
    var opacity = 1;
    var material = [
        ambientColor[0], ambientColor[1], ambientColor[2], 0,
        diffuseColor[0], diffuseColor[1], diffuseColor[2], 0,
        specularColor[0], specularColor[1], specularColor[2], 0,
        shininess, opacity, 0, 0   
    ];

    //draw cube
    renderer.drawMesh({
            mesh : cubeMesh,
            texture : woodTexture,
            shader : shader,
            shaderVariables : {
                'uMV' : ['mat4', mv],
                'uNorm' : ['mat3', norm],
                'uMaterial' : ['mat4', material]
            }
        });
}


function onMapLoaded() {
    //add render slots
    //render slots are called during map render
    map = browser.map;
    map.addRenderSlot("custom-meshes", onDrawMeshes, true);
    map.addRenderSlot("custom-points", onDrawPoints, true);
    map.moveRenderSlotAfter("after-map-render", "custom-meshes");
    map.moveRenderSlotAfter("custom-meshes", "custom-points");
};


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


function onDrawMeshes(renderChannel) {
    if (woodTexture) { //check whether texture is loded
        //draw textured cubes        
        //when we render in to thed hit texture then we use only hit shader
        var shader =  (renderChannel == "hit") ? "hit" : "textured-and-shaded";
        drawCube([15.401619754298016, 50.66116076086283, 0], 10, [255,128,128], [0,0,0], [0,0,0], 0, shader);
        drawCube([15.401273646044713, 50.66085886059055, 0], 10, [0,0,0], [255,128,128], [0,0,0], 0, shader);
        drawCube([15.400964365373339, 50.66056777477979, 0], 10, [0,0,0], [255,128,128], [255,255,255], 90, shader);

        //draw cubes without textures
        //when we render in to thed hit texture then we use only hit shader
        shader =  (renderChannel == "hit") ? "hit" : "shaded";
        drawCube([15.401240821143277, 50.66137227148973, 0], 10, [255,128,128], [0,0,0], [0,0,0], 0, shader);
        drawCube([15.400944108141767, 50.66112054925841, 0], 10, [0,0,0], [255,128,128], [0,0,0], 0, shader);
        drawCube([15.400597205224727, 50.66084127611251, 0], 10, [0,0,0], [255,128,128], [255,255,255], 90, shader);
    }    
} 


function onDrawPoints(renderChannel) {
    if (renderChannel == 'hit') {
        return; //do render points in to the hit texture
    }

    if (clickCoords) { //draw hit point
        //conver hit coords to canvas coords
        coords = map.convertCoordsFromNavToCanvas(clickCoords, 'fix');

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

