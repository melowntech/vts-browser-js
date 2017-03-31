CLOSURECOMPILER=./build/tools/closure-compiler/compiler.jar


# create lincense header
echo "/* Melown-js (c) 2011 - 2017 MELOWN TECHNOLOGIES SE */ " > ./build/license-tmp.js

# merge geodata workers
echo "Melown.MapGeodataProcessorWorker = function() { " | cat - src/core/map/geodata-processor/worker-globals.js src/core/map/geodata-processor/worker-style.js src/core/map/geodata-processor/worker-linestring.js src/core/map/geodata-processor/worker-pointarray.js src/core/map/geodata-processor/worker-polygon.js src/core/map/geodata-processor/worker-text.js src/core/map/geodata-processor/worker-main.js > ./build/geodata-worker-tmp.js
echo "};">> ./build/geodata-worker-tmp.js 

# merge melown-core with inspector
cat src/core/utils/matrix.js \
    src/core/utils/math.js \
    src/core/utils/utils.js \
    src/core/utils/platform.js \
    src/core/utils/url.js \
    src/core/utils/http.js \
    src/core/inspector/inspector.js \
    src/core/inspector/input.js \
    src/core/inspector/stats.js \
    src/core/inspector/layers.js \
    src/core/inspector/stylesheets.js \
    src/core/inspector/graphs.js \
    src/core/inspector/replay.js \
    src/core/renderer/gpu/bbox.js \
    src/core/renderer/gpu/device.js \
    src/core/renderer/gpu/font.js \
    src/core/renderer/gpu/group.js \
    src/core/renderer/gpu/line.js \
    src/core/renderer/gpu/mesh.js \
    src/core/renderer/gpu/pixel-line.js \
    src/core/renderer/gpu/pixel-line3.js \
    src/core/renderer/gpu/polygon.js \
    src/core/renderer/gpu/program.js \
    src/core/renderer/gpu/shaders.js \
    src/core/renderer/gpu/text.js \
    src/core/renderer/gpu/texture.js \
    src/core/renderer/gpu/tile.js \
    src/core/renderer/renderer.js \
    src/core/renderer/interface.js \
    src/core/renderer/bbox.js \
    src/core/renderer/camera.js \
    src/core/renderer/draw.js \
    src/core/renderer/geometry.js \
    src/core/renderer/init.js \
    src/core/map/map.js \
    ./build/geodata-worker-tmp.js \
    src/core/map/geodata-processor/processor.js \
    src/core/map/bound-layer.js \
    src/core/map/resource-tree.js \
    src/core/map/resource-node.js \
    src/core/map/cache.js \
    src/core/map/position.js \
    src/core/map/convert.js \
    src/core/map/camera.js \
    src/core/map/config.js \
    src/core/map/credit.js \
    src/core/map/draw.js \
    src/core/map/interface.js \
    src/core/map/loader.js \
    src/core/map/measure.js \
    src/core/map/trajectory.js \
    src/core/map/stylesheet.js \
    src/core/map/geodata.js \
    src/core/map/geodata-view.js \
    src/core/map/mesh.js \
    src/core/map/metanode.js \
    src/core/map/metatile.js \
    src/core/map/division-node.js \
    src/core/map/refframe.js \
    src/core/map/render-slots.js \
    src/core/map/metatile.js \
    src/core/map/srs.js \
    src/core/map/stats.js \
    src/core/map/submesh.js \
    src/core/map/surface.js \
    src/core/map/surface-sequence.js \
    src/core/map/subtexture.js \
    src/core/map/texture.js \
    src/core/map/virtual-surface.js \
    src/core/map/surface-tile.js \
    src/core/map/surface-tree.js \
    src/core/map/url.js \
    src/core/map/view.js \
    src/core/core.js \
    src/core/interface.js \
    src/core/config.js \
    src/core/update.js > ./build/melown-core-v1-merge-tmp.js

# merge final core lib 
cat ./build/license-tmp.js \
    src/core/utils/libs/proj4.js \
    src/core/utils/libs/geographics-nomini.js \
    src/core/_nominify.js \
    ./build/melown-core-v1-merge-tmp.js > ./build/melown-core-v1-merge.js

# minify core lib
# java -jar ${CLOSURECOMPILER} --compilation_level ADVANCED_OPTIMIZATIONS --js _minify.js ../build/melown-core-v1-merge-tmp.js --js_output_file ../build/melown-core-v1-tmp.js
# cat ./build/license-tmp.js \
#     src/core/utils/libs/proj4.js \
#     src/core/utils/libs/geographics-nomini.js \
#     ./build/melown-core-v1-tmp.js > ./build/melown-core-v1-inspector-mini.js
# rm ./build/melown-core-v1-tmp.js


# merge melown 
cat ./build/melown-core-v1-merge.js \
    src/browser/utility/utility.js \
    src/browser/utility/dom.js \
    src/browser/presenter/presenter.js \
    src/browser/presenter/creator.js \
    src/browser/presenter/render.js \
    src/browser/presenter/handlers.js \
    src/browser/autopilot/autopilot.js \
    src/browser/rois/rois.js \
    src/browser/ui/control/compass.js \
    src/browser/ui/control/credits.js \
    src/browser/ui/control/fullscreen.js \
    src/browser/ui/control/layers.js \
    src/browser/ui/control/fallback.js \
    src/browser/ui/control/holder.js \
    src/browser/ui/control/logo.js \
    src/browser/ui/control/scale.js \
    src/browser/ui/control/map.js \
    src/browser/ui/control/zoom.js \
    src/browser/ui/control/popup.js \
    src/browser/ui/control/space.js \
    src/browser/ui/control/search.js \
    src/browser/ui/control/link.js \
    src/browser/ui/control/loading.js \
    src/browser/ui/control/navigation.js \
    src/browser/ui/element/element.js \
    src/browser/ui/element/draggable.js \
    src/browser/ui/element/event.js \
    src/browser/ui/element/events.js \
    src/browser/ui/ui.js \
    src/browser/control-mode/control-mode.js \
    src/browser/control-mode/disabled.js \
    src/browser/control-mode/map-observer.js \
    src/browser/control-mode/pano.js \
    src/browser/browser.js \
    src/browser/config.js \
    src/browser/interface.js > ./build/melown-v1-merge.js

#minify lib
# java -jar compiler/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --js melown-core-v1-merge.js ../build/melown-v1-merge.js --js_output_file ../build/melown-v1-tmp.js
# cat ./build/license-tmp.js \
#    src/core/utils/libs/proj4.js \
#    src/core/_nominify.js \
#    ./build/melown-v1-merge-tmp2.js > ./build/melown-v1-merge.js
# rm ./build/melown-v1-merge-tmp2.js

cat src/browser/presenter/css/main.css \
    src/browser/presenter/css/panel.css \
    src/browser/presenter/css/subtitles.css \
    src/browser/browser.css > ./build/melown-v1.css

# set final names
mv ./build/melown-v1.css ./build/melown-browser.css 
mv ./build/melown-v1-merge.js ./build/melown-browser.js 
mv ./build/melown-core-v1-merge.js ./build/melown-core.js

# remove remaining tmps
rm ./build/geodata-worker-tmp.js 
rm ./build/melown-core-v1-merge-tmp.js
rm ./build/license-tmp.js

echo Make complete.










