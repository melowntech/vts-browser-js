mkdir build 

cd melown-core

# merge geodata workers
echo "Melown.geodataProcessorWorker = function() { " | cat - map/geodata/worker-globals.js map/geodata/worker-style.js map/geodata/worker-linestring.js map/geodata/worker-pointarray.js map/geodata/worker-text.js map/geodata/worker-main.js > ../build/geodata-worker-tmp.js
echo "};">> ../build/geodata-worker-tmp.js 

# merge melown-core 
cat utils/libs/proj4.js \
    utils/libs/geographics-full.js \
    _nominify.js \
    utils/matrix.js \
    utils/math.js \
    utils/utils.js \
    utils/platform.js \
    utils/url.js \
    utils/http.js \
    inspector/inspector.js \
    inspector/input.js \
    inspector/stats.js \
    inspector/graphs.js \
    renderer/gpu/bbox.js \
    renderer/gpu/device.js \
    renderer/gpu/font.js \
    renderer/gpu/geodata.js \
    renderer/gpu/group.js \
    renderer/gpu/line.js \
    renderer/gpu/mesh.js \
    renderer/gpu/pixel-line.js \
    renderer/gpu/pixel-line3.js \
    renderer/gpu/polygon.js \
    renderer/gpu/program.js \
    renderer/gpu/shaders.js \
    renderer/gpu/text.js \
    renderer/gpu/texture.js \
    renderer/gpu/tile.js \
    renderer/renderer.js \
    renderer/interface.js \
    renderer/bbox.js \
    renderer/camera.js \
    renderer/draw.js \
    renderer/geometry.js \
    renderer/init.js \
    map/map.js \
    ../build/geodata-worker-tmp.js \
    map/geodata/processor.js \
    map/bound-layer.js \
    map/cache.js \
    map/position.js \
    map/camera.js \
    map/config.js \
    map/credit.js \
    map/draw.js \
    map/interface.js \
    map/loader.js \
    map/measure.js \
    map/trajectory.js \
    map/mesh.js \
    map/metanode-tracer.js \
    map/metanode.js \
    map/metastorage.js \
    map/metatile.js \
    map/division-node.js \
    map/refframe.js \
    map/render-slots.js \
    map/metatile.js \
    map/srs.js \
    map/stats.js \
    map/submesh.js \
    map/surface.js \
    map/surface-sequence.js \
    map/free-layer.js \
    map/glue.js \
    map/texture.js \
    map/tile.js \
    map/tree.js \
    map/url.js \
    map/view.js \
    core.js \
    interface.js \
    config.js \
    update.js > ../build/melown-core-v1-merge-tmp.js

# merge final lib 
cat utils/libs/proj4.js \
    _nominify.js \
    ../build/melown-core-v1-merge-tmp.js > ../build/melown-core-v1-merge.js

#minify lib
# java -jar compiler/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js engine/browser/_minify.js ../build/melown-v1-merge-tmp.js --js_output_file build/engine-core-v1-tmp2.js
# cat utils/libs/proj4.js \
#    _nominify.js \
#    ../build/melown-core-v1-merge-tmp2.js > ../build/melown-core-v1-merge.js
# rm ../build/melown-core-v1-merge-tmp2.js

# remove remaining tmps
rm ../build/geodata-worker-tmp.js 
rm ../build/melown-core-v1-merge-tmp.js

cd ..

# cp engine/interface/melown-v1.css build/melown-v1.css
# java -jar compiler/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js engine/browser/_minify.js engine/browser/matrix.js engine/browser/math.js engine/browser/utility.js engine/browser/config.js engine/browser/bbox.js engine/browser/cache.js engine/browser/camera.js engine/browser/geodataWorkerTmp.js engine/browser/geodataProcessor.js engine/browser/gpuFont.js engine/browser/gpuText.js engine/browser/gpuGeodata.js engine/browser/gpuGroup.js engine/browser/gpuLine.js engine/browser/gpuPixelLine.js engine/browser/gpuPolygon.js engine/browser/gpuDevice.js engine/browser/gpuBBox.js engine/browser/gpuMesh.js engine/browser/gpuProgram.js engine/browser/gpuShaders.js engine/browser/gpuTexture.js engine/browser/gpuTile.js engine/browser/layer.js engine/browser/layerOld.js engine/browser/layerTiled.js engine/browser/layerTiledDraw.js engine/browser/layerTerrain.js engine/browser/layerTerrainDraw.js engine/browser/layerTerrainSurface.js engine/browser/mesh.js engine/browser/planet.js engine/browser/renderer.js engine/browser/rendererInit.js engine/browser/rendererCamera.js engine/browser/rendererDraw.js engine/browser/rendererDrawLayers.js engine/browser/rendererDrawTiles.js engine/browser/tileId.js engine/browser/tileTerrain.js engine/browser/tileGeodata.js engine/browser/tileMetadata.js engine/browser/platform.js engine/browser/browser.js engine/autopilot/autopilot.js engine/interface/builder.js engine/interface/interface.js engine/interface/info.js engine/interface/input.js engine/interface/input-touch.js engine/interface/panels.js engine/interface/compass.js engine/interface/gis.js engine/interface/places.js engine/interface/stats.js engine/interface/websockets.js engine/import/kmlLoad.js engine/import/osmLoad.js engine/import/mglLoad.js engine/engine.js --js_output_file build/engine-v1-tmp.js
# cat engine/libs/proj4.js engine/libs/poly2tri.min.js build/engine-v1-tmp.js  > build/engine-v1.js
# rm build/engine-v1-tmp.js
# rm ../build/geodata-worker-tmp.js 
# cp build/engine-v1.js build/engine-latest.js
# cp build/engine-v1.css build/engine-latest.css




