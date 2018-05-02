var browser = null;
var map = null;
var renderer = null;
var houseModel = null;
var carModel = null;

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
        position : [ 'obj', 15.3775623,50.675077, 'float', 0.00, -231.22, -25.55, 0.00, 101.83, 45.00],
        minViewExtent: 50 //allow camera little bit closer
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }

    renderer = browser.renderer;

    //callback once is map config loaded
    browser.on('map-loaded', onMapLoaded);
})();


function onMapLoaded() {
    //add render slots
    //render slots are called during map render
    map = browser.map;    
    map.addRenderSlot('custom-models', onDrawModels, true);
    map.moveRenderSlotAfter('after-map-render', 'custom-models');

    //load models
    //ModelOBJ is the separate modelObj.js library
    carModel = new ModelOBJ(map, renderer, { path:'./models/car-alpine/alpine.obj' });    
    houseModel = new ModelOBJ(map, renderer, { path:'./models/modern-house/house.obj' });    
}


function onDrawModels(renderChannel) {
    if (renderChannel != 'base') {
        return; //draw only in base channel
    }

    //draw models when all model resources are ready
    if (houseModel && houseModel.ready) { 
        houseModel.draw({
            navCoords: [15.3772953, 50.6752052, 13.5],
            heightMode: 'float',
            rotation: [0,0,0],
            scale: [0.001, 0.001, 0.001],
            ambientLight: [90,90,90]

            //other possible value are:
            //depthOffset: [-50,0,0]   //when you need some zbuffer tolerance
                                       // you will probably only need to change first
                                       // value in the array
            //depthOnly: true          //for hit test implementation
            //onLoaded: (fuction(){})  //callback when model is loded
        });
    }    

    if (carModel && carModel.ready) { 
        carModel.draw({
            navCoords: [15.3771059, 50.6752981, 12.5],
            heightMode: 'float',
            rotation: [0,0,0],
            scale: [1, 1, 1],
            ambientLight: [90,90,90]
        });
    }    
} 

