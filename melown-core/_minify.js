/** @define {boolean} */
var Melown_MERGE = true;

/** @define {boolean} */
var SEZNAMCZ = false;

var Melown = {};

//prevent minification
window["Melown"] = Melown;
window["ga"] = (window["ga"] != null) ? window["ga"] : {}; //google analytics
window["MelownMap_"] = (window["MelownMap_"] != null) ? window["MelownMap_"] : null;
window["Q"] = (window["Q"] != null) ? window["Q"] : {}; //google analytics


//demo
//cat init.js matrix.js math.js utility.js config.js bbox.js cache.js camera.js geometry.js gpuDevice.js gpuMesh.js gpuProgram.js gpuShaders.js gpuTexture.js gpuTile.js mesh.js metatile.js renderer.js tile.js tileid.js browser.js demo.js > minifiedViewer.js

//only lib
//cat init.js matrix.js math.js utility.js config.js bbox.js cache.js camera.js geometry.js gpuDevice.js gpuMesh.js gpuProgram.js gpuShaders.js gpuTexture.js gpuTile.js mesh.js metatile.js renderer.js tile.js tileid.js browser.js > minifiedViewer.js

//minify
//http://closure-compiler.appspot.com/home