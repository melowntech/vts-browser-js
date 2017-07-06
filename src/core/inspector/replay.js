
import GpuTexture_ from '../renderer/gpu/texture';
import {math as math_} from '../utils/math';
import {vec3 as vec3_, mat4 as mat4_} from '../utils/matrix';

//get rid of compiler mess
var math = math_;
var GpuTexture = GpuTexture_;
var vec3 = vec3_, mat4 = mat4_;


var InspectorReplay = function(inspector) {
    this.inspector = inspector;
    this.core = inspector.core;
};


InspectorReplay.prototype.init = function() {
    var inspector = this.inspector;
    inspector.addStyle(
        '#vts-replay-panel {'
            + 'font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif;'
            + 'display: none;'
            + 'padding:15px;'
            + 'width: 618px;'
            + 'font-size: 14px;'
            + 'position: absolute;'
            + 'right: 10px;'
            + 'top: 10px;'
            + 'cursor: default;'
            + 'background-color: rgba(255,255,255,0.95);'
            + 'border-radius: 5px;'
            + 'border: solid 1px #ccc;'
            + 'text-align: left;'
            + 'z-index: 7;'
            + 'padding: 10px;'
        + '}'

        + '#vts-replay-panel-left {'
            + 'width: 253px;'
            + 'height: 100%;'
            + 'float: left;'
        + '}'

        + '#vts-replay-panel-right {'
            + 'width: 340px;'
            + 'height: 100%;'
            + 'float: right;'
        + '}'

        + '#vts-replay-items {'
            + 'width: 240px;'
            + 'overflow-x: hidden;'
            + 'border: 1px solid #ddd;'
            + 'padding-right: 5px;'
        + '}'

        + '.vts-replay-item {'
            + 'width: 100%;'
            + 'overflow: hidden;'
            + 'text-overflow: ellipsis;'
            + 'white-space: nowrap;'    
        + '}' 

        + '#vts-replay-lod-slider {'
            + 'width: 240px;'
        + '}'

        + '#vts-replay-lod-text {'
            + 'width: 60px;'
            + 'margin-left: 10px;'
            + 'margin-right: 10px;'
        + '}'

        + '#vts-replay-lod-single {'
            + 'margin-left: 10px;'
        + '}'
    
        + '#vts-replay-time-slider {'
            + 'width: 330px;'
        + '}'

        + '#vts-replay-time-text {'
            + 'width: 60px;'
            + 'margin-left: 10px;'
            + 'margin-right: 10px;'
        + '}'

        + '#vts-replay-time-single {'
            + 'margin-left: 10px;'
        + '}'

        + '#vts-replay-panel-gtime canvas{'
            + 'border: 1px solid #555;'
        + '}'

        + '#vts-replay-panel-gtime span{'
            + 'font-size: 10px;'
        + '}'

        + '#vts-replay-info {'
            + 'width: 240px;'
            + 'height: 140px;'
            + 'overflow-x: hidden;'
            + 'border: 1px solid #ddd;'
            + 'padding-right: 5px;'
            + 'margin-top: 10px;'            
            + 'font-size: 12px;'
            + 'word-wrap: break-word;'   
        + '}'
       
    );

    this.element = document.createElement('div');
    this.element.id = 'vts-replay-panel';
    this.element.innerHTML =
            '<div id="vts-replay-panel-left">'
            + '<div id="vts-replay-items"></div>'
            + '<div id="vts-replay-panel-lod">'  
                + '<input id="vts-replay-lod-slider" type="range" min="0" max="30" step="1" value="30" /><br/>'
                + '<span>LOD:</span>'
                + '<input id="vts-replay-lod-text" type="text" value="30"/>'
                + '<input id="vts-replay-lod-up" type="button" value="<"/>'
                + '<input id="vts-replay-lod-down" type="button" value=">"/>'
                + '<input id="vts-replay-lod-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div>'
            + '<div id="vts-replay-info"></div>'
          + '</div>'
          + '<div id="vts-replay-panel-right">'
            + '<div id="vts-replay-panel-gtime">'  
                + '<span id="vts-replay-info-meshes">Meshes Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="vts-replay-canvas-meshes" width=340 height=30></canvas><br/>'  
                + '<span id="vts-replay-info-textures">Internal Textures Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="vts-replay-canvas-textures" width=340 height=30></canvas><br/>'  
                + '<span id="vts-replay-info-textures2">External Textures Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="vts-replay-canvas-textures2" width=340 height=30></canvas><br/>'  
                + '<span id="vts-replay-info-geodata">Geodata Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="vts-replay-canvas-geodata" width=340 height=30></canvas><br/>'  
                + '<span id="vts-replay-info-metatiles">Metatiles Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="vts-replay-canvas-metatiles" width=340 height=30></canvas><br/>'  
                + '<span id="vts-replay-info-intervals">Interval Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="vts-replay-canvas-intervals" width=340 height=30></canvas><br/>'  
                + '<span id="vts-replay-info-threads">Threads Min/Max: 0/0 Avg. 0 </span><br/>'
                + '<canvas id="vts-replay-canvas-threads" width=340 height=30></canvas><br/>'  
            + '</div>'

            + '<div id="vts-replay-panel-time">'  
                + '<input id="vts-replay-time-slider" type="range" min="0" max="2000" value="0" /><br/>'
                + '<span>File:</span>'
                + '<input id="vts-replay-time-text" type="text" value="0"/>'
                + '<input id="vts-replay-time-up" type="button" value="<"/>'
                + '<input id="vts-replay-time-down" type="button" value=">"/>'
                + '<input id="vts-replay-time-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div>'
          + '</div>';

    this.core.element.appendChild(this.element);

    this.items = document.getElementById('vts-replay-items');

    this.lodSlider = document.getElementById('vts-replay-lod-slider');
    this.lodSlider.onchange = this.onSliderChange.bind(this, 'lod');
    this.lodSlider.oninput = this.onSliderChange.bind(this, 'lod');

    this.lodText = document.getElementById('vts-replay-lod-text');
    this.lodText.onchange = this.onTextChange.bind(this, 'lod');
    
    document.getElementById('vts-replay-lod-up').onclick = this.onSliderChange.bind(this, 'lod', 'down');
    document.getElementById('vts-replay-lod-down').onclick = this.onSliderChange.bind(this, 'lod', 'up');
    document.getElementById('vts-replay-lod-single').onclick = this.onSliderChange.bind(this, 'lod', 'single');
    
    this.timeSlider = document.getElementById('vts-replay-time-slider');
    this.timeSlider.onchange = this.onSliderChange.bind(this, 'time');
    this.timeSlider.oninput = this.onSliderChange.bind(this, 'time');

    this.timeText = document.getElementById('vts-replay-time-text');
    this.timeText.onchange = this.onTextChange.bind(this, 'time');

    this.timeInfo = document.getElementById('vts-replay-info');

    document.getElementById('vts-replay-time-up').onclick = this.onSliderChange.bind(this, 'time', 'down');
    document.getElementById('vts-replay-time-down').onclick = this.onSliderChange.bind(this, 'time', 'up');
    document.getElementById('vts-replay-time-single').onclick = this.onSliderChange.bind(this, 'time', 'single');

    this.element.addEventListener('mouseup', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousedown', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousewheel', inspector.doNothing.bind(this), false);
    this.element.addEventListener('dblclick', inspector.doNothing.bind(this), false);

    this.infoMeshes = document.getElementById('vts-replay-info-meshes');
    this.ctxMeshes = document.getElementById('vts-replay-canvas-meshes').getContext('2d');  
    this.infoTextures = document.getElementById('vts-replay-info-textures');
    this.ctxTextures = document.getElementById('vts-replay-canvas-textures').getContext('2d');  
    this.infoTextures2 = document.getElementById('vts-replay-info-textures2');
    this.ctxTextures2 = document.getElementById('vts-replay-canvas-textures2').getContext('2d');  
    this.infoGeodata = document.getElementById('vts-replay-info-geodata');
    this.ctxGeodata = document.getElementById('vts-replay-canvas-geodata').getContext('2d');  
    this.infoMetatiles = document.getElementById('vts-replay-info-metatiles');
    this.ctxMetatiles = document.getElementById('vts-replay-canvas-metatiles').getContext('2d');  
    this.infoIntervals = document.getElementById('vts-replay-info-intervals');
    this.ctxIntervals = document.getElementById('vts-replay-canvas-intervals').getContext('2d');  
    this.infoThreads = document.getElementById('vts-replay-info-threads');
    this.ctxThreads = document.getElementById('vts-replay-canvas-threads').getContext('2d');  

    this.cameraLines = [];
    this.cameraLines2 = [];
    this.cameraLines3 = [];
    this.cameraGenarated = false;

    this.panelVisible = false;
};


InspectorReplay.prototype.showPanel = function() {
    this.buildReplayCombo();
    this.element.style.display = 'block';
    this.panelVisible = true;

    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;
    this.updateFileInfo(replay.loadedIndex);
    this.updateLoadGraphs();
};


InspectorReplay.prototype.hidePanel = function() {
    this.element.style.display = 'none';
    this.panelVisible = false;
};


InspectorReplay.prototype.switchPanel = function() {
    if (this.panelVisible) {
        this.hidePanel();
    } else {
        this.showPanel();
    }
};


InspectorReplay.prototype.onSliderChange = function(type, button) {
    if (type == 'lod') {
        switch (button) {
        case 'up':
            this.lodSlider.stepUp();
            this.lodText.value = this.lodSlider.value;    
            break;
            
        case 'down':
            this.lodSlider.stepDown();
            this.lodText.value = this.lodSlider.value;    
            break;

        default:
            this.lodText.value = this.lodSlider.value;    
        } 
    } else {
        switch (button) {
        case 'up':
            this.timeSlider.stepUp();
            this.timeText.value = this.timeSlider.value;    
            break;
            
        case 'down':
            this.timeSlider.stepDown();
            this.timeText.value = this.timeSlider.value;    
            break;

        default:
            this.timeText.value = this.timeSlider.value;    
        } 
    }

    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;

    if (type == 'lod') {
        replay.lod = parseFloat(this.lodText.value);
        replay.singleLod = document.getElementById('vts-replay-lod-single').checked;
    } else {
        replay.loadedIndex = parseFloat(this.timeText.value);
        replay.singleLodedIndex = document.getElementById('vts-replay-time-single').checked;
        this.updateFileInfo(replay.loadedIndex);
        this.updateLoadGraphs();
    }

    map.markDirty();
};


InspectorReplay.prototype.onTextChange = function(type) {
    if (type == 'lod') {
        this.lodSlider.value = this.lodText.value;    
    } else {
        this.timeSlider.value = this.timeText.value;    
    }

    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;

    if (type == 'lod') {
        replay.lod = parseFloat(this.lodText.value);
    } else {
        replay.loadedIndex = parseFloat(this.timeText.value);
        this.updateFileInfo(replay.loadedIndex);
        this.updateLoadGraphs();
    }

    map.markDirty();
};


InspectorReplay.prototype.generateCameraLines = function(camera) {
    var renderer = this.core.getRendererInterface();
    var p1 = camera.position;
    var p2 = camera.center;

    this.cameraLines = [p1, p2];
/*        
    var screenSize = renderer.getCanvasSize();
    
    var v1 = map.getScreenRay(0+1,0+1);
    var v2 = map.getScreenRay(screenSize[0]-1,0+1);
    var v3 = map.getScreenRay(screenSize[0]-1,screenSize[1]-1);
    var v4 = map.getScreenRay(0+1,screenSize[1]-1);
    var v5 = map.getScreenRay(screenSize[0]*0.5,screenSize[1]*0.5);
    
    var l = camera.distance;
    
    //l = map.getPositionViewExtent(pos);    
    
    vec3.scale(v1, l*10);
    //vec3.scale(v2, l);
    //vec3.scale(v3, l);
    //vec3.scale(v4, l);
    //vec3.scale(v5, l);
    
    vec3.add(v1, p1);
    //vec3.add(v2, p1);
    //vec3.add(v3, p1);
    //vec3.add(v4, p1);
    //vec3.add(v5, p1);

    this.cameraLines3 = [p1, v1]; //, p1, v2, p1, v3, p1, v4, v1, v2, v3, v4];//, v5, p1];
    */
/*
    this.cameraLines2 = [p1];
    
    for (var y = 0; y < screenSize[1]*0.5; y += 100) {
        for (var x = screenSize[0]*0.5; x < screenSize[0]; x += 100) {

            var v1 = map.getScreenRay(x,y);
            vec3.scale(v1, l);
            vec3.add(v1, p1);
            
            this.cameraLines2.push(v1);
        }
    }    
*/
    this.cameraLines2 = [[p1], [p1], [p1], [p1]];
    
    var segments = 16;

    var map2 = this.core.getMap();

    var m2 = map2.camera.getRotationviewMatrix();
    var m = mat4.create();
    mat4.inverse(m2, m);
    
    this.cameraMatrix = m;
    
    var a = Math.tan(math.radians(map2.camera.getFov()));
    var b = a * map2.camera.getAspect();
    var c = Math.sqrt(a*a + b*b);
    
    var dfov = Math.atan(c/1);
    
    var l = camera.cameraDistance / segments;
    var l2 = 0.5 * l * Math.tan(dfov);
    var l3 = l2 * map2.camera.getAspect();
    var v1, v2, v3, v4;

    for (var i = 0; i < segments; i++) {
        v1 = [-l3, -l2, -l];
        v2 = [l3, -l2, -l];
        v3 = [l3, l2, -l];
        v4 = [-l3, l2, -l];

        vec3.scale(v1, (i+1));
        vec3.scale(v2, (i+1));
        vec3.scale(v3, (i+1));
        vec3.scale(v4, (i+1));
        
        mat4.multiplyVec3(m, v1);
        mat4.multiplyVec3(m, v2);
        mat4.multiplyVec3(m, v3);
        mat4.multiplyVec3(m, v4);
    
        vec3.add(v1, p1);
        vec3.add(v2, p1);
        vec3.add(v3, p1);
        vec3.add(v4, p1);
        
        this.cameraLines2[0].push(v1);
        this.cameraLines2[1].push(v2);
        this.cameraLines2[2].push(v3);
        this.cameraLines2[3].push(v4);
    }
    
    this.cameraLines3 = [[p1], [p1], [p1], [p1]];

    segments = 256;
    l = (camera.distance + 12742000 * 1.1) / segments;
    //l = (camera.distance * 20.1) / segments;
    l2 = 0.5 * l * Math.tan(dfov);
    l3 = l2 * map2.camera.getAspect();
    
    for (i = 0; i < segments; i++) {
        v1 = [-l3, -l2, -l];
        v2 = [l3, -l2, -l];
        v3 = [l3, l2, -l];
        v4 = [-l3, l2, -l];

        vec3.scale(v1, (i+1));
        vec3.scale(v2, (i+1));
        vec3.scale(v3, (i+1));
        vec3.scale(v4, (i+1));
        
        mat4.multiplyVec3(m, v1);
        mat4.multiplyVec3(m, v2);
        mat4.multiplyVec3(m, v3);
        mat4.multiplyVec3(m, v4);
    
        vec3.add(v1, p1);
        vec3.add(v2, p1);
        vec3.add(v3, p1);
        vec3.add(v4, p1);
        
        this.cameraLines3[0].push(v1);
        this.cameraLines3[1].push(v2);
        this.cameraLines3[2].push(v3);
        this.cameraLines3[3].push(v4);
    }

    v1 = [-l3, -l2, -l];
    v2 = [l3, -l2, -l];
    v3 = [l3, l2, -l];
    v4 = [-l3, l2, -l];

    vec3.scale(v1, segments);
    vec3.scale(v2, segments);
    vec3.scale(v3, segments);
    vec3.scale(v4, segments);
    
    p1 = [0,0,0];
    
    var vertices = [ p1[0], p1[1], p1[2],
        v1[0], v1[1], v1[2],
        v2[0], v2[1], v2[2],

        p1[0], p1[1], p1[2],
        v2[0], v2[1], v2[2],
        v3[0], v3[1], v3[2],

        p1[0], p1[1], p1[2],
        v3[0], v3[1], v3[2],
        v4[0], v4[1], v4[2],

        p1[0], p1[1], p1[2],
        v4[0], v4[1], v4[2],
        v1[0], v1[1], v1[2]
    ];
                      
    var uvs = [ 0,0, 0,0, 0,0,
        0,0, 0,0, 0,0,
        0,0, 0,0, 0,0,
        0,0, 0,0, 0,0 ];

    var normals = [ 0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1,
        0,0,1, 0,0,1, 0,0,1 ];

    this.frustumState = renderer.createState({
        'blend' : true,
        'zwrite' : false,
        'ztest' : true,
        'culling' : false
    });
    
    this.frustumMesh = renderer.createMesh({ 'vertices': vertices, 'uvs': uvs, 'normals': normals });
    this.cameraGenarated = true;
};


InspectorReplay.prototype.itemButton = function(item, button) {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;    
    
    switch (item) {
    case 'DrawnTiles':
        replay.storeTiles = true;
        break;

    case 'DrawnTilesFreeLayers':
        replay.storeFreeTiles = true;
        break;

    case 'TracedNodes':
        replay.storeNodes = true;
        break;

    case 'TracedNodesFreeLayers':
        replay.storeFreeNodes = true;
        break;

    case 'LoadSequence':
        replay.storeLoaded = (button == 'S');

        if (button == 'S') {
            replay.loadedIndex = 0;
            replay.loaded = [];
        } else {
            this.updateFileInfo(replay.loadedIndex);
            this.updateLoadGraphs();
        }
        break;

    case 'Camera':

        if (button == 'S') {
            var camera = replay.camera = {
                distance : map.camera.distance,
                position : map.camera.position.slice(),
                vector : map.camera.vector.slice(),
                center : map.camera.center.slice(),
                height : map.camera.height
            };

            replay.cameraPos = map.getPosition();
            this.generateCameraLines(camera);
        } else {
            if (replay.cameraPos) {
                map.setPosition(replay.cameraPos);
            }
        }

        break;
            
    case 'Globe':
                        
        break;
    }

    map.markDirty();
};


InspectorReplay.prototype.switchItem = function(item, htmlId) {
    var element = document.getElementById(htmlId);
    //element.checked;
    //this.applyMapView();
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;

    switch (item) {
    case 'DrawnTiles':
        replay.drawTiles = element.checked;
        break;

    case 'DrawnTilesFreeLayers':
        replay.drawFreeTiles = element.checked;
        break;

    case 'TracedNodes':
        replay.drawNodes = element.checked;
        break;

    case 'TracedNodesFreeLayers':
        replay.drawFreeNodes = element.checked;
        break;

    case 'LoadSequence':
        replay.drawLoaded = element.checked;
        break;

    case 'Camera':
        
        if (!this.cameraGenarated) {
            this.itemButton('Camera');
        }
        
        this.drawCamera = element.checked;
        break;
            
    case 'Globe':
        var renderer = this.core.getRenderer();
        
        if (!this.globeTexture) {
            var texture = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAEACAMAAADyTj5VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0Mzk4RkVFMzlGNjUxMUU2OTBDM0I0OEM1NjU0RURBMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0Mzk4RkVFNDlGNjUxMUU2OTBDM0I0OEM1NjU0RURBMyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjQzOThGRUUxOUY2NTExRTY5MEMzQjQ4QzU2NTRFREEzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQzOThGRUUyOUY2NTExRTY5MEMzQjQ4QzU2NTRFREEzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+5rvbhAAAAAZQTFRFwcHBLS0tMDfv/wAAAiZJREFUeNrs2LENAEEIA0HTf9ME5DTgIZn8ta+TnLjymzuW6kMIwIcQgA8hAAqAAmBdAM4O4E/wBPgQAqAAKAAKgAKgHcDZAegJoAAoAAqAAqAAaAdwdgB6AigACoACoAAoANoBnB2AngAKgAKgACgACoB2AGcHoCeAAqAAKAAKgAKgHcDZAegJoAAoAAqAAqAAaAdwdgB6AigACoACoAAoANoBnB2AngAKgAKgACgACoB2AGcHoCeAAqAAKAAKgAKgHcDZAegJoAAoAAqAAqAAaAdwdgB6AigACoACEIAPIQAfwg7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABSAAH0IAPoQAfAgB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQAPxcAQYAZt2IEFFJhxsAAAAASUVORK5CYII=';        
            this.globeTexture = new GpuTexture(renderer.gpu, texture, this.core, null, true);
        }

        this.drawGlobe = element.checked;
        this.drawGlobe = this.drawGlobe;
        break;
    }

    map.markDirty();
};


InspectorReplay.prototype.updateLoadGraphs = function() {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;
    var loaded = replay.loaded;
    var index = replay.loadedIndex;

    this.timeSlider.max = loaded.length; 

    var ctx;   
    var lx = 340;
    var ly = 30;

    this.ctxMeshes.fillStyle = '#000000';
    this.ctxMeshes.fillRect(0, 0, lx, ly);
    this.ctxTextures.fillStyle = '#000000';
    this.ctxTextures.fillRect(0, 0, lx, ly);
    this.ctxTextures2.fillStyle = '#000000';
    this.ctxTextures2.fillRect(0, 0, lx, ly);
    this.ctxGeodata.fillStyle = '#000000';
    this.ctxGeodata.fillRect(0, 0, lx, ly);
    this.ctxMetatiles.fillStyle = '#000000';
    this.ctxMetatiles.fillRect(0, 0, lx, ly);
    this.ctxIntervals.fillStyle = '#000000';
    this.ctxIntervals.fillRect(0, 0, lx, ly);
    this.ctxThreads.fillStyle = '#000000';
    this.ctxThreads.fillRect(0, 0, lx, ly);

    var i = Math.floor(replay.loadedIndex / lx) * lx, li = (lx-1);
    var shift = i, file;
    
    for (i = 0; i < li; i++) {
        file = loaded[i + shift];
        
        if (file) {
            switch(file.kind) {
            case 'mesh':       ctx = this.ctxMeshes; break;
            case 'texture-in': ctx = this.ctxTextures; break;
            case 'texture-ex': ctx = this.ctxTextures2; break;
            case 'geodata':    ctx = this.ctxGeodata; break;
            case 'metatile':   ctx = this.ctxMetatiles; break;
            default:
                continue;
            }

            var grey = Math.round(Math.min(255, 60+20 * Math.max(1, file.duration / 300)));
            ctx.fillStyle='rgb('+grey+','+grey+','+grey+')';

            var h = (file.duration / 300) * 30;                 
            ctx.fillRect(i, ly, 1, -h);

            //interval
            grey = Math.round(Math.min(255, 60+20 * Math.max(1, file.interval / 300)));
            this.ctxIntervals.fillStyle='rgb('+grey+','+grey+','+grey+')';
            h = (file.interval / 300) * 30;                 
            this.ctxIntervals.fillRect(i, ly, 1, -h);

            //interval
            this.ctxThreads.fillStyle='rgb(80,80,80)';
            h = (file.threads / map.config.mapDownloadThreads) * 30;                 
            this.ctxThreads.fillRect(i, ly, 1, -h);
        }
    }

    var minMeshes = Number.MAX_VALUE, maxMeshes = 0, avgMeshes = 0, avgMeshesCount = 0;
    var minTextures = Number.MAX_VALUE, maxTextures = 0, avgTextures = 0, avgTexturesCount = 0;
    var minTextures2 = Number.MAX_VALUE, maxTextures2 = 0, avgTextures2 = 0, avgTextures2Count = 0;
    var minGeodata = Number.MAX_VALUE, maxGeodata = 0, avgGeodata = 0, avgGeodataCount = 0;
    var minMetatiles = Number.MAX_VALUE, maxMetatiles = 0, avgMetatiles = 0, avgMetatilesCount = 0;
    var minThreads = Number.MAX_VALUE, maxThreads = 0, avgThreads = 0, avgThreadsCount = 0;
    var minIntervals = Number.MAX_VALUE, maxIntervals = 0, avgIntervals = 0, avgIntervalsCount = 0;
    
    li = loaded.length;

    for (i = 0; i < li; i++) {
        file = loaded[i];
        
        if (file) {
            
            switch(file.kind) {
            case 'mesh':
                if (file.duration < minMeshes) minMeshes = file.duration; 
                if (file.duration > maxMeshes) maxMeshes = file.duration; 
                avgMeshes += file.duration;
                avgMeshesCount++;  
                break;
                    
            case 'texture-in':
                if (file.duration < minTextures) minTextures = file.duration; 
                if (file.duration > maxTextures) maxTextures = file.duration; 
                avgTextures += file.duration;
                avgTexturesCount++;  
                break;
                    
            case 'texture-ex':
                if (file.duration < minTextures2) minTextures2 = file.duration; 
                if (file.duration > maxTextures2) maxTextures2 = file.duration; 
                avgTextures2 += file.duration;
                avgTextures2Count++;  
                break;
                    
            case 'geodata':
                if (file.duration < minGeodata) minGeodata = file.duration; 
                if (file.duration > maxGeodata) maxGeodata = file.duration; 
                avgGeodata += file.duration;
                avgGeodataCount++;  
                break;
                    
            case 'metatile':
                if (file.duration < minMetatiles) minMetatiles = file.duration; 
                if (file.duration > maxMetatiles) maxMetatiles = file.duration; 
                avgMetatiles += file.duration;
                avgMetatilesCount++;  
                break;

            default:
                continue;
            }
                
            if (file.threads < minThreads) minThreads = file.threads; 
            if (file.threads > maxThreads) maxThreads = file.threads; 
            avgThreads += file.threads;
            avgThreadsCount++;  

            if (file.threads < minIntervals) minIntervals = file.threads; 
            if (file.threads > maxIntervals) maxIntervals = file.threads; 
            avgIntervals += file.threads;
            avgIntervalsCount++;  
        }
    }
    
    index -= shift;

    this.ctxMeshes.fillStyle = '#ff0000';
    this.ctxMeshes.fillRect(index - 1, 0, 1, ly);
    this.ctxMeshes.fillRect(index + 1, 0, 1, ly);
    this.ctxTextures.fillStyle = '#ff0000';
    this.ctxTextures.fillRect(index - 1, 0, 1, ly);
    this.ctxTextures.fillRect(index + 1, 0, 1, ly);
    this.ctxTextures2.fillStyle = '#ff0000';
    this.ctxTextures2.fillRect(index - 1, 0, 1, ly);
    this.ctxTextures2.fillRect(index + 1, 0, 1, ly);
    this.ctxGeodata.fillStyle = '#ff0000';
    this.ctxGeodata.fillRect(index - 1, 0, 1, ly);
    this.ctxGeodata.fillRect(index + 1, 0, 1, ly);
    this.ctxMetatiles.fillStyle = '#ff0000';
    this.ctxMetatiles.fillRect(index - 1, 0, 1, ly);
    this.ctxMetatiles.fillRect(index + 1, 0, 1, ly);
    this.ctxIntervals.fillStyle = '#ff0000';
    this.ctxIntervals.fillRect(index - 1, 0, 1, ly);
    this.ctxIntervals.fillRect(index + 1, 0, 1, ly);
    this.ctxThreads.fillStyle = '#ff0000';
    this.ctxThreads.fillRect(index - 1, 0, 1, ly);
    this.ctxThreads.fillRect(index + 1, 0, 1, ly);

    if (!avgMeshesCount) { minMeshes = 0, maxMeshes = 0; }
    if (!avgTexturesCount) { minTextures = 0, maxTextures = 0; }
    if (!avgTextures2Count) { minTextures2 = 0, maxTextures2 = 0; }
    if (!avgGeodataCount) { minGeodata = 0, maxGeodata = 0; }
    if (!avgMetatilesCount) { minMetatiles = 0, maxMetatiles = 0; }
    if (!avgThreadsCount) { minThreads = 0, maxThreads = 0; }
    if (!avgIntervalsCount) { minIntervals = 0, maxIntervals = 0; }

    avgMeshes = avgMeshesCount ? (avgMeshes/avgMeshesCount) : 0;
    avgTextures = avgTexturesCount ? (avgTextures/avgTexturesCount) : 0;
    avgTextures2 = avgTextures2Count ? (avgTextures2/avgTextures2Count) : 0;
    avgGeodata = avgGeodataCount ? (avgGeodata/avgGeodataCount) : 0;
    avgMetatiles = avgMetatilesCount ? (avgMetatiles/avgMetatilesCount) : 0;
    avgIntervals = avgIntervalsCount ? (avgIntervals/avgIntervalsCount) : 0;
    avgThreads = avgThreadsCount ? (avgThreads/avgThreadsCount) : 0;

    this.infoMeshes.innerHTML = 'Meshes Min/Max/Avg/Count: ' + minMeshes.toFixed(0) + '/' + maxMeshes.toFixed(0) + '/' + avgMeshes.toFixed(1) + '/' + avgMeshesCount;
    this.infoTextures.innerHTML = 'Internal Textures Min/Max/Avg/Count: ' + minTextures.toFixed(0) + '/' + maxTextures.toFixed(0) + '/' + avgTextures.toFixed(1) + '/' + avgTexturesCount;
    this.infoTextures2.innerHTML = 'External Textures Min/Max/Avg/Count: ' + minTextures2.toFixed(0) + '/' + maxTextures2.toFixed(0) + '/' + avgTextures2.toFixed(1) + '/' + avgTextures2Count;
    this.infoGeodata.innerHTML = 'Geodata Min/Max/Avg/Count: ' + minGeodata.toFixed(0) + '/' + maxGeodata.toFixed(0) + '/' + avgGeodata.toFixed(1) + '/' + avgGeodataCount;
    this.infoMetatiles.innerHTML = 'Metatiles Min/Max/Avg/Count: ' + minMetatiles.toFixed(0) + '/' + maxMetatiles.toFixed(0) + '/' + avgMetatiles.toFixed(1) + '/' + avgMetatilesCount;
    this.infoIntervals.innerHTML = 'Intervals Min/Max/Avg: ' + minIntervals.toFixed(0) + '/' + maxIntervals.toFixed(0) + '/' + avgIntervals.toFixed(1);  
    this.infoThreads.innerHTML = 'Threads Min/Max/Avg: ' + minThreads + '/' + maxThreads + '/' + avgThreads.toFixed(1);  
};


InspectorReplay.prototype.updateFileInfo = function(index) {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var replay = map.draw.replay;
    var file = replay.loaded[index];

    if (file) {
        this.timeInfo.innerHTML = ''
            + 'Resource Kind: ' + file.kind + '<br/>'
            + 'Time: ' + file.time.toFixed(2) + '<br/>'
            + 'Duration: ' + file.duration.toFixed(2) + '<br/>'
            + 'Interval: ' + file.interval.toFixed(2) + '<br/>'
            + 'Priority: ' + file.priority.toFixed(2) + '<br/>'
            + 'Threads: ' + file.threads + '<br/>'
            + '' + file.url;
    } else {
        this.timeInfo.innerHTML = '';
    }
};


InspectorReplay.prototype.buildReplayCombo = function() {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var items = [
        ['Drawn Tiles',1],
        ['Drawn Tiles - Free Layers',1],
        ['Traced Nodes',1],
        ['Traced Nodes - Free Layers',1],
        ['Load Sequence',2],
        ['Camera',2],
        ['Globe',0]
    ];

    var keys = [
        'DrawnTiles',
        'DrawnTilesFreeLayers',
        'TracedNodes',
        'TracedNodesFreeLayers',
        'LoadSequence',
        'Camera',
        'Globe'
    ];

    var html = '', i, li, htmlId;

    for (i = 0, li = items.length; i < li; i++) {
        html += '<div id="vts-replay-item-' + keys[i] + '" class="vts-replay-item">'
                 + '<input id="vts-replay-checkbox-' + keys[i] + '" type="checkbox"/>'
                 + '<span title=' + items[i][0] + '>' + items[i][0] + '&nbsp;&nbsp;</span>';
                 
        if (items[i][1] > 0) {
            html += '<input id="vts-replay-sbutton-' + keys[i] + '" type="button" value="S"/>';
        }
        
        if (items[i][1] > 1) {
            html += '<input id="vts-replay-fbutton-' + keys[i] + '" type="button" value="' + ((keys[i] == 'Camera') ? 'R' : 'F') + '"/>';
        }
        
        html += '</div>';
    }

    this.items.innerHTML = html;
    //this.currentItem = keys[0];

    for (i = 0, li = items.length; i < li; i++) {
        htmlId = 'vts-replay-checkbox-' + keys[i];
        document.getElementById(htmlId).onchange = this.switchItem.bind(this, keys[i], htmlId);
        //var htmlId = "vts-replay-item-" + keys[i];
        //document.getElementById(htmlId).onclick = this.selectReplayItem.bind(this, keys[i]);

        if (items[i][1] > 0) {
            htmlId = 'vts-replay-sbutton-' + keys[i];
            document.getElementById(htmlId).onclick = this.itemButton.bind(this, keys[i], 'S');
        }

        if (items[i][1] > 1) {
            htmlId = 'vts-replay-fbutton-' + keys[i];
            document.getElementById(htmlId).onclick = this.itemButton.bind(this, keys[i], ((keys[i] == 'Camera') ? 'R' : 'F'));
        }
    }
};


export default InspectorReplay;

