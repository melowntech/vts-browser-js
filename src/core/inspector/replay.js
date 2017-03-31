
Melown.Inspector.prototype.initReplayPanel = function() {

    this.addStyle(
        "#melown-replay-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 615px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "top: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 7;"
            + "padding: 10px;"
        + "}"

        + "#melown-replay-panel-left {"
            + "width: 253px;"
            + "height: 100%;"
            + "float: left;"
        + "}"

        + "#melown-replay-panel-right {"
            + "width: 340px;"
            + "height: 100%;"
            + "float: right;"
        + "}"

        + "#melown-replay-items {"
            + "width: 240px;"
            + "overflow-x: hidden;"
            + "border: 1px solid #ddd;"
            + "padding-right: 5px;"
        + "}"

        + ".melown-replay-item {"
            + "width: 100%;"
            + "overflow: hidden;"
            + "text-overflow: ellipsis;"
            + "white-space: nowrap;"    
        + "}" 

        + "#melown-replay-lod-slider {"
            + "width: 240px;"
        + "}"

        + "#melown-replay-lod-text {"
            + "width: 60px;"
            + "margin-left: 10px;"
            + "margin-right: 10px;"
        + "}"

        + "#melown-replay-lod-single {"
            + "margin-left: 10px;"
        + "}"
    
        + "#melown-replay-time-slider {"
            + "width: 330px;"
        + "}"

        + "#melown-replay-time-text {"
            + "width: 60px;"
            + "margin-left: 10px;"
            + "margin-right: 10px;"
        + "}"

        + "#melown-replay-time-single {"
            + "margin-left: 10px;"
        + "}"

        + "#melown-replay-panel-gtime canvas{"
            + "border: 1px solid #555;"
        + "}"

        + "#melown-replay-panel-gtime span{"
            + "font-size: 10px;"
        + "}"

        + "#melown-replay-info {"
            + "width: 240px;"
            + "height: 140px;"
            + "overflow-x: hidden;"
            + "border: 1px solid #ddd;"
            + "padding-right: 5px;"
            + "margin-top: 10px;"            
            + "font-size: 12px;"
            + "word-wrap: break-word;"   
        + "}"
       
    );

    this.replayElement_ = document.createElement("div");
    this.replayElement_.id = "melown-replay-panel";
    this.replayElement_.innerHTML =
            '<div id="melown-replay-panel-left">'
            + '<div id="melown-replay-items"></div>'
            + '<div id="melown-replay-panel-lod">'  
                + '<input id="melown-replay-lod-slider" type="range" min="0" max="30" step="1" value="30" /><br/>'
                + '<span>LOD:</span>'
                + '<input id="melown-replay-lod-text" type="text" value="30"/>'
                + '<input id="melown-replay-lod-up" type="button" value="<"/>'
                + '<input id="melown-replay-lod-down" type="button" value=">"/>'
                + '<input id="melown-replay-lod-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div>'
            + '<div id="melown-replay-info"></div>'
          + '</div>'
          + '<div id="melown-replay-panel-right">'
            + '<div id="melown-replay-panel-gtime">'  
                + '<span id="melown-replay-info-meshes">Meshes Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="melown-replay-canvas-meshes" width=340 height=30></canvas><br/>'  
                + '<span id="melown-replay-info-textures">Internal Textures Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="melown-replay-canvas-textures" width=340 height=30></canvas><br/>'  
                + '<span id="melown-replay-info-textures2">External Textures Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="melown-replay-canvas-textures2" width=340 height=30></canvas><br/>'  
                + '<span id="melown-replay-info-geodata">Geodata Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="melown-replay-canvas-geodata" width=340 height=30></canvas><br/>'  
                + '<span id="melown-replay-info-metatiles">Metatiles Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="melown-replay-canvas-metatiles" width=340 height=30></canvas><br/>'  
                + '<span id="melown-replay-info-intervals">Interval Count: 0 Min/Max: 0/0 Avg. 0</span><br/>'
                + '<canvas id="melown-replay-canvas-intervals" width=340 height=30></canvas><br/>'  
                + '<span id="melown-replay-info-threads">Threads Min/Max: 0/0 Avg. 0 </span><br/>'
                + '<canvas id="melown-replay-canvas-threads" width=340 height=30></canvas><br/>'  
            + '</div>'

            + '<div id="melown-replay-panel-time">'  
                + '<input id="melown-replay-time-slider" type="range" min="0" max="2000" value="0" /><br/>'
                + '<span>File:</span>'
                + '<input id="melown-replay-time-text" type="text" value="0"/>'
                + '<input id="melown-replay-time-up" type="button" value="<"/>'
                + '<input id="melown-replay-time-down" type="button" value=">"/>'
                + '<input id="melown-replay-time-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div>'
          + '</div>';

    this.core_.element_.appendChild(this.replayElement_);

    this.replayItems_ = document.getElementById("melown-replay-items");

    this.replayLodSlider_ = document.getElementById("melown-replay-lod-slider");
    this.replayLodSlider_.onchange = this.onReplaySliderChange.bind(this, "lod");
    this.replayLodSlider_.oninput = this.onReplaySliderChange.bind(this, "lod");

    this.replayLodText_ = document.getElementById("melown-replay-lod-text");
    this.replayLodText_.onchange = this.onReplayTextChange.bind(this, "lod");
    
    document.getElementById("melown-replay-lod-up").onclick = this.onReplaySliderChange.bind(this, "lod", "down");
    document.getElementById("melown-replay-lod-down").onclick = this.onReplaySliderChange.bind(this, "lod", "up");
    document.getElementById("melown-replay-lod-single").onclick = this.onReplaySliderChange.bind(this, "lod", "single");
    
    this.replayTimeSlider_ = document.getElementById("melown-replay-time-slider");
    this.replayTimeSlider_.onchange = this.onReplaySliderChange.bind(this, "time");
    this.replayTimeSlider_.oninput = this.onReplaySliderChange.bind(this, "time");

    this.replayTimeText_ = document.getElementById("melown-replay-time-text");
    this.replayTimeText_.onchange = this.onReplayTextChange.bind(this, "time");

    this.replayTimeInfo_ = document.getElementById("melown-replay-info");

    document.getElementById("melown-replay-time-up").onclick = this.onReplaySliderChange.bind(this, "time", "down");
    document.getElementById("melown-replay-time-down").onclick = this.onReplaySliderChange.bind(this, "time", "up");
    document.getElementById("melown-replay-time-single").onclick = this.onReplaySliderChange.bind(this, "time", "single");

    this.replayElement_.addEventListener("mouseup", this.doNothing.bind(this), true);
    this.replayElement_.addEventListener("mousedown", this.doNothing.bind(this), true);
    this.replayElement_.addEventListener("mousewheel", this.doNothing.bind(this), false);
    this.replayElement_.addEventListener("dblclick", this.doNothing.bind(this), false);

    this.replayInfoMeshes_ = document.getElementById("melown-replay-info-meshes");
    this.replayCtxMeshes_ = document.getElementById("melown-replay-canvas-meshes").getContext("2d");  
    this.replayInfoTextures_ = document.getElementById("melown-replay-info-textures");
    this.replayCtxTextures_ = document.getElementById("melown-replay-canvas-textures").getContext("2d");  
    this.replayInfoTextures2_ = document.getElementById("melown-replay-info-textures2");
    this.replayCtxTextures2_ = document.getElementById("melown-replay-canvas-textures2").getContext("2d");  
    this.replayInfoGeodata_ = document.getElementById("melown-replay-info-geodata");
    this.replayCtxGeodata_ = document.getElementById("melown-replay-canvas-geodata").getContext("2d");  
    this.replayInfoMetatiles_ = document.getElementById("melown-replay-info-metatiles");
    this.replayCtxMetatiles_ = document.getElementById("melown-replay-canvas-metatiles").getContext("2d");  
    this.replayInfoIntervals_ = document.getElementById("melown-replay-info-intervals");
    this.replayCtxIntervals_ = document.getElementById("melown-replay-canvas-intervals").getContext("2d");  
    this.replayInfoThreads_ = document.getElementById("melown-replay-info-threads");
    this.replayCtxThreads_ = document.getElementById("melown-replay-canvas-threads").getContext("2d");  

    this.replayCameraLines_ = [];
    this.replayCameraLines2_ = [];
    this.replayCameraLines3_ = [];
    this.replayCameraGenarated_ = false;

    this.replayPanelVisible_ = false;
};

Melown.Inspector.prototype.showReplayPanel = function() {
    this.buildReplayCombo();
    this.replayElement_.style.display = "block";
    this.replayPanelVisible_ = true;

    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    this.updateFileInfo(map_.replay_.loadedIndex_);
    this.updateLoadGraphs();
};

Melown.Inspector.prototype.hideReplayPanel = function() {
    this.replayElement_.style.display = "none";
    this.replayPanelVisible_ = false;
};

Melown.Inspector.prototype.switchReplayPanel = function() {
    if (this.replayPanelVisible_) {
        this.hideReplayPanel();
    } else {
        this.showReplayPanel();
    }
};

Melown.Inspector.prototype.onReplaySliderChange = function(type_, button_) {
    if (type_ == "lod") {
        switch (button_) {
            case "up":
                this.replayLodSlider_.stepUp();
                this.replayLodText_.value = this.replayLodSlider_.value;    
                break;
            
            case "down":
                this.replayLodSlider_.stepDown();
                this.replayLodText_.value = this.replayLodSlider_.value;    
                break;

            default:
                this.replayLodText_.value = this.replayLodSlider_.value;    
        } 
    } else {
        switch (button_) {
            case "up":
                this.replayTimeSlider_.stepUp();
                this.replayTimeText_.value = this.replayTimeSlider_.value;    
                break;
            
            case "down":
                this.replayTimeSlider_.stepDown();
                this.replayTimeText_.value = this.replayTimeSlider_.value;    
                break;

            default:
                this.replayTimeText_.value = this.replayTimeSlider_.value;    
        } 
    }

    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    if (type_ == "lod") {
        map_.replay_.lod_ = parseFloat(this.replayLodText_.value);
        map_.replay_.singleLod_ = document.getElementById("melown-replay-lod-single").checked;
    } else {
        map_.replay_.loadedIndex_ = parseFloat(this.replayTimeText_.value);
        map_.replay_.singleLodedIndex_ = document.getElementById("melown-replay-time-single").checked;
        this.updateFileInfo(map_.replay_.loadedIndex_);
        this.updateLoadGraphs();
    }

    map_.markDirty();
};

Melown.Inspector.prototype.onReplayTextChange = function(type_) {
    if (type_ == "lod") {
        this.replayLodSlider_.value = this.replayLodText_.value;    
    } else {
        this.replayTimeSlider_.value = this.replayTimeText_.value;    
    }

    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    if (type_ == "lod") {
        map_.replay_.lod_ = parseFloat(this.replayLodText_.value);
    } else {
        map_.replay_.loadedIndex_ = parseFloat(this.replayTimeText_.value);
        this.updateFileInfo(map_.replay_.loadedIndex_);
        this.updateLoadGraphs();
    }

    map_.markDirty();
};

Melown.Inspector.prototype.generateCameraLines = function(camera_) {
    var map_ = this.core_.getMapInterface();
    var renderer_ = this.core_.getRendererInterface();
    
    var pos_ = map_.getPosition();

    var p1_ = camera_.cameraPosition_;
    var p2_ = camera_.cameraCenter_;

    this.replayCameraLines_ = [p1_, p2_];
/*        
    var screenSize_ = renderer_.getCanvasSize();
    
    var v1_ = map_.getScreenRay(0+1,0+1);
    var v2_ = map_.getScreenRay(screenSize_[0]-1,0+1);
    var v3_ = map_.getScreenRay(screenSize_[0]-1,screenSize_[1]-1);
    var v4_ = map_.getScreenRay(0+1,screenSize_[1]-1);
    var v5_ = map_.getScreenRay(screenSize_[0]*0.5,screenSize_[1]*0.5);
    
    var l = camera_.cameraDistance_;
    
    //l = map_.getPositionViewExtent(pos_);    
    
    Melown.vec3.scale(v1_, l*10);
    //Melown.vec3.scale(v2_, l);
    //Melown.vec3.scale(v3_, l);
    //Melown.vec3.scale(v4_, l);
    //Melown.vec3.scale(v5_, l);
    
    Melown.vec3.add(v1_, p1_);
    //Melown.vec3.add(v2_, p1_);
    //Melown.vec3.add(v3_, p1_);
    //Melown.vec3.add(v4_, p1_);
    //Melown.vec3.add(v5_, p1_);

    this.replayCameraLines3_ = [p1_, v1_]; //, p1_, v2_, p1_, v3_, p1_, v4_, v1_, v2_, v3_, v4_];//, v5_, p1_];
    */
/*
    this.replayCameraLines2_ = [p1_];
    
    for (var y = 0; y < screenSize_[1]*0.5; y += 100) {
        for (var x = screenSize_[0]*0.5; x < screenSize_[0]; x += 100) {

            var v1_ = map_.getScreenRay(x,y);
            Melown.vec3.scale(v1_, l);
            Melown.vec3.add(v1_, p1_);
            
            this.replayCameraLines2_.push(v1_);
        }
    }    
*/
    this.replayCameraLines2_ = [[p1_], [p1_], [p1_], [p1_]];
    
    var segments_ = 16;

    var map2_ = this.core_.getMap();

    var m2_ = map2_.camera_.getRotationviewMatrix();
    var m_ = Melown.mat4.create();
    Melown.mat4.inverse(m2_, m_);
    
    this.replayCameraMatrix_ = m_;
    
    var a = Math.tan(Melown.radians(map2_.camera_.getFov()));
    var b = a * map2_.camera_.getAspect();
    var c = Math.sqrt(a*a + b*b);
    
    var dfov = Math.atan(c/1);
    
    var l = camera_.cameraDistance_ / segments_;
    var l2 = 0.5 * l * Math.tan(dfov);
    var l3 = l2 * map2_.camera_.getAspect();

    for (var i = 0; i < segments_; i++) {
        var v1_ = [-l3, -l2, -l];
        var v2_ = [l3, -l2, -l];
        var v3_ = [l3, l2, -l];
        var v4_ = [-l3, l2, -l];

        Melown.vec3.scale(v1_, (i+1));
        Melown.vec3.scale(v2_, (i+1));
        Melown.vec3.scale(v3_, (i+1));
        Melown.vec3.scale(v4_, (i+1));
        
        Melown.mat4.multiplyVec3(m_, v1_);
        Melown.mat4.multiplyVec3(m_, v2_);
        Melown.mat4.multiplyVec3(m_, v3_);
        Melown.mat4.multiplyVec3(m_, v4_);
    
        Melown.vec3.add(v1_, p1_);
        Melown.vec3.add(v2_, p1_);
        Melown.vec3.add(v3_, p1_);
        Melown.vec3.add(v4_, p1_);
        
        this.replayCameraLines2_[0].push(v1_);
        this.replayCameraLines2_[1].push(v2_);
        this.replayCameraLines2_[2].push(v3_);
        this.replayCameraLines2_[3].push(v4_);
    }
    
    this.replayCameraLines3_ = [[p1_], [p1_], [p1_], [p1_]];

    segments_ = 256;
    l = (camera_.cameraDistance_ + 12742000 * 1.1) / segments_;
    //l = (camera_.cameraDistance_ * 20.1) / segments_;
    l2 = 0.5 * l * Math.tan(dfov);
    l3 = l2 * map2_.camera_.getAspect();
    
    for (var i = 0; i < segments_; i++) {
        var v1_ = [-l3, -l2, -l];
        var v2_ = [l3, -l2, -l];
        var v3_ = [l3, l2, -l];
        var v4_ = [-l3, l2, -l];

        Melown.vec3.scale(v1_, (i+1));
        Melown.vec3.scale(v2_, (i+1));
        Melown.vec3.scale(v3_, (i+1));
        Melown.vec3.scale(v4_, (i+1));
        
        Melown.mat4.multiplyVec3(m_, v1_);
        Melown.mat4.multiplyVec3(m_, v2_);
        Melown.mat4.multiplyVec3(m_, v3_);
        Melown.mat4.multiplyVec3(m_, v4_);
    
        Melown.vec3.add(v1_, p1_);
        Melown.vec3.add(v2_, p1_);
        Melown.vec3.add(v3_, p1_);
        Melown.vec3.add(v4_, p1_);
        
        this.replayCameraLines3_[0].push(v1_);
        this.replayCameraLines3_[1].push(v2_);
        this.replayCameraLines3_[2].push(v3_);
        this.replayCameraLines3_[3].push(v4_);
    }

    var v1_ = [-l3, -l2, -l];
    var v2_ = [l3, -l2, -l];
    var v3_ = [l3, l2, -l];
    var v4_ = [-l3, l2, -l];

    Melown.vec3.scale(v1_, segments_);
    Melown.vec3.scale(v2_, segments_);
    Melown.vec3.scale(v3_, segments_);
    Melown.vec3.scale(v4_, segments_);
    
    p1_ = [0,0,0];
    
    var vertices_ = [ p1_[0], p1_[1], p1_[2],
                      v1_[0], v1_[1], v1_[2],
                      v2_[0], v2_[1], v2_[2],

                      p1_[0], p1_[1], p1_[2],
                      v2_[0], v2_[1], v2_[2],
                      v3_[0], v3_[1], v3_[2],

                      p1_[0], p1_[1], p1_[2],
                      v3_[0], v3_[1], v3_[2],
                      v4_[0], v4_[1], v4_[2],

                      p1_[0], p1_[1], p1_[2],
                      v4_[0], v4_[1], v4_[2],
                      v1_[0], v1_[1], v1_[2]
                    ];
                      
    var uvs_ = [ 0,0, 0,0, 0,0,
                 0,0, 0,0, 0,0,
                 0,0, 0,0, 0,0,
                 0,0, 0,0, 0,0 ];

    var normals_ = [ 0,0,1, 0,0,1, 0,0,1,
                     0,0,1, 0,0,1, 0,0,1,
                     0,0,1, 0,0,1, 0,0,1,
                     0,0,1, 0,0,1, 0,0,1 ];

    this.replayFrustumState_ = renderer_.createState({
        "blend" : true,
        "zwrite" : false,
        "ztest" : true,
        "culling" : false
    });
    
    this.replayFrustumMesh_ = renderer_.createMesh({ "vertices": vertices_, "uvs": uvs_, "normals": normals_ });
    this.replayCameraGenarated_ = true;
};


Melown.Inspector.prototype.replayItemButton = function(item_, button_) {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }
    
    switch (item_) {
        case "DrawnTiles":
            map_.replay_.storeTiles_ = true;
            break;

        case "DrawnTilesFreeLayers":
            map_.replay_.storeFreeTiles_ = true;
            break;

        case "TracedNodes":
            map_.replay_.storeNodes_ = true;
            break;

        case "TracedNodesFreeLayers":
            map_.replay_.storeFreeNodes_ = true;
            break;

        case "LoadSequence":
            map_.replay_.storeLoaded_ = (button_ == "S");

            if (button_ == "S") {
                map_.replay_.loadedIndex_ = 0;
                map_.replay_.loaded_ = [];
            } else {
                this.updateFileInfo(map_.replay_.loadedIndex_);
                this.updateLoadGraphs();
            }
            break;

        case "Camera":

            var camera_ = map_.replay_.camera_ = {
                cameraDistance_ : map_.cameraDistance_,
                cameraPosition_ : map_.cameraPosition_.slice(),
                cameraVector_ : map_.cameraVector_.slice(),
                cameraCenter_ : map_.cameraCenter_.slice(),
                cameraHeight_ : map_.cameraHeight_
            };
            
            this.generateCameraLines(camera_);
            //this.drawReplayCamera_ = true; 
            break;
            
        case "Globe":
                        
            break;
    }

    map_.markDirty();
};

Melown.Inspector.prototype.switchReplayItem = function(item_, htmlId_) {
    var element_ = document.getElementById(htmlId_);
    //element_.checked;
    //this.applyMapView();
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    switch (item_) {
        case "DrawnTiles":
            map_.replay_.drawTiles_ = element_.checked;
            break;

        case "DrawnTilesFreeLayers":
            map_.replay_.drawFreeTiles_ = element_.checked;
            break;

        case "TracedNodes":
            map_.replay_.drawNodes_ = element_.checked;
            break;

        case "TracedNodesFreeLayers":
            map_.replay_.drawFreeNodes_ = element_.checked;
            break;

        case "LoadSequence":
            map_.replay_.drawLoaded_ = element_.checked;
            break;

        case "Camera":
        
            if (!this.replayCameraGenarated_) {
                this.replayItemButton("Camera");
            }
        
            this.drawReplayCamera_ = element_.checked;
            break;
            
        case "Globe":
            var renderer_ = this.core_.getRenderer();
        
            if (!this.replayGlobeTexture_) {
                var texture_ = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAEACAMAAADyTj5VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0Mzk4RkVFMzlGNjUxMUU2OTBDM0I0OEM1NjU0RURBMyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0Mzk4RkVFNDlGNjUxMUU2OTBDM0I0OEM1NjU0RURBMyI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjQzOThGRUUxOUY2NTExRTY5MEMzQjQ4QzU2NTRFREEzIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjQzOThGRUUyOUY2NTExRTY5MEMzQjQ4QzU2NTRFREEzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+5rvbhAAAAAZQTFRFwcHBLS0tMDfv/wAAAiZJREFUeNrs2LENAEEIA0HTf9ME5DTgIZn8ta+TnLjymzuW6kMIwIcQgA8hAAqAAmBdAM4O4E/wBPgQAqAAKAAKgAKgHcDZAegJoAAoAAqAAqAAaAdwdgB6AigACoACoAAoANoBnB2AngAKgAKgACgACoB2AGcHoCeAAqAAKAAKgAKgHcDZAegJoAAoAAqAAqAAaAdwdgB6AigACoACoAAoANoBnB2AngAKgAKgACgACoB2AGcHoCeAAqAAKAAKgAKgHcDZAegJoAAoAAqAAqAAaAdwdgB6AigACoACEIAPIQAfwg7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABSAAH0IAPoQAfAgB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQALQDODsAPQEUAAVAAVAAFADtAM4OQE8ABUABUAAUAAVAO4CzA9ATQAFQABQABUAB0A7g7AD0BFAAFAAFQAFQAPxcAQYAZt2IEFFJhxsAAAAASUVORK5CYII=";        
                this.replayGlobeTexture_ = new Melown.GpuTexture(renderer_.gpu_, texture_, this.core_, null, true);
            }

            this.drawReplayGlobe_ = element_.checked;
            map_.replay_.drawGlobe_ = this.drawReplayGlobe_;
            break;
    }

    map_.markDirty();
};

Melown.Inspector.prototype.updateLoadGraphs = function(index_) {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var loaded_ = map_.replay_.loaded_;
    var index_ = map_.replay_.loadedIndex_;

    this.replayTimeSlider_.max = loaded_.length; 

    var ctx_;   
    var lx_ = 340;
    var ly_ = 30;

    this.replayCtxMeshes_.fillStyle = "#000000";
    this.replayCtxMeshes_.fillRect(0, 0, lx_, ly_);
    this.replayCtxTextures_.fillStyle = "#000000";
    this.replayCtxTextures_.fillRect(0, 0, lx_, ly_);
    this.replayCtxTextures2_.fillStyle = "#000000";
    this.replayCtxTextures2_.fillRect(0, 0, lx_, ly_);
    this.replayCtxGeodata_.fillStyle = "#000000";
    this.replayCtxGeodata_.fillRect(0, 0, lx_, ly_);
    this.replayCtxMetatiles_.fillStyle = "#000000";
    this.replayCtxMetatiles_.fillRect(0, 0, lx_, ly_);
    this.replayCtxIntervals_.fillStyle = "#000000";
    this.replayCtxIntervals_.fillRect(0, 0, lx_, ly_);
    this.replayCtxThreads_.fillStyle = "#000000";
    this.replayCtxThreads_.fillRect(0, 0, lx_, ly_);

    var i = Math.floor(map_.replay_.loadedIndex_ / lx_) * lx_;
    var shift_ = i;
    var li = (lx_-1);
    
    for (var i = 0; i < li; i++) {
        var file_ = loaded_[i + shift_];
        
        if (file_) {
            switch(file_.kind_) {
                case "mesh":       ctx_ = this.replayCtxMeshes_; break;
                case "texture-in": ctx_ = this.replayCtxTextures_; break;
                case "texture-ex": ctx_ = this.replayCtxTextures2_; break;
                case "geodata":    ctx_ = this.replayCtxGeodata_; break;
                case "metatile":   ctx_ = this.replayCtxMetatiles_; break;
                default:
                    continue;
            }

            var grey_ = Math.round(Math.min(255, 60+20 * Math.max(1, file_.duration_ / 300)));
            ctx_.fillStyle="rgb("+grey_+","+grey_+","+grey_+")";

            var h = (file_.duration_ / 300) * 30;                 
            ctx_.fillRect(i, ly_, 1, -h);

            //interval
            grey_ = Math.round(Math.min(255, 60+20 * Math.max(1, file_.interval_ / 300)));
            this.replayCtxIntervals_.fillStyle="rgb("+grey_+","+grey_+","+grey_+")";
            h = (file_.interval_ / 300) * 30;                 
            this.replayCtxIntervals_.fillRect(i, ly_, 1, -h);

            //interval
            this.replayCtxThreads_.fillStyle="rgb(80,80,80)";
            h = (file_.threads_ / map_.config_.mapDownloadThreads_) * 30;                 
            this.replayCtxThreads_.fillRect(i, ly_, 1, -h);
        }
    }

    var minMeshes_ = Number.MAX_VALUE, maxMeshes_ = 0, avgMeshes_ = 0, avgMeshesCount_ = 0;
    var minTextures_ = Number.MAX_VALUE, maxTextures_ = 0, avgTextures_ = 0, avgTexturesCount_ = 0;
    var minTextures2_ = Number.MAX_VALUE, maxTextures2_ = 0, avgTextures2_ = 0, avgTextures2Count_ = 0;
    var minGeodata_ = Number.MAX_VALUE, maxGeodata_ = 0, avgGeodata_ = 0, avgGeodataCount_ = 0;
    var minMetatiles_ = Number.MAX_VALUE, maxMetatiles_ = 0, avgMetatiles_ = 0, avgMetatilesCount_ = 0;
    var minThreads_ = Number.MAX_VALUE, maxThreads_ = 0, avgThreads_ = 0, avgThreadsCount_ = 0;
    var minIntervals_ = Number.MAX_VALUE, maxIntervals_ = 0, avgIntervals_ = 0, avgIntervalsCount_ = 0;
    
    li = loaded_.length;

    for (var i = 0; i < li; i++) {
        var file_ = loaded_[i];
        
        if (file_) {
            
            switch(file_.kind_) {
                case "mesh":
                    if (file_.duration_ < minMeshes_) minMeshes_ = file_.duration_; 
                    if (file_.duration_ > maxMeshes_) maxMeshes_ = file_.duration_; 
                    avgMeshes_ += file_.duration_;
                    avgMeshesCount_++;  
                    break;
                    
                case "texture-in":
                    if (file_.duration_ < minTextures_) minTextures_ = file_.duration_; 
                    if (file_.duration_ > maxTextures_) maxTextures_ = file_.duration_; 
                    avgTextures_ += file_.duration_;
                    avgTexturesCount_++;  
                    break;
                    
                case "texture-ex":
                    if (file_.duration_ < minTextures2_) minTextures2_ = file_.duration_; 
                    if (file_.duration_ > maxTextures2_) maxTextures2_ = file_.duration_; 
                    avgTextures2_ += file_.duration_;
                    avgTextures2Count_++;  
                    break;
                    
                case "geodata":
                    if (file_.duration_ < minGeodata_) minGeodata_ = file_.duration_; 
                    if (file_.duration_ > maxGeodata_) maxGeodata_ = file_.duration_; 
                    avgGeodata_ += file_.duration_;
                    avgGeodataCount_++;  
                    break;
                    
                case "metatile":
                    if (file_.duration_ < minMetatiles_) minMetatiles_ = file_.duration_; 
                    if (file_.duration_ > maxMetatiles_) maxMetatiles_ = file_.duration_; 
                    avgMetatiles_ += file_.duration_;
                    avgMetatilesCount_++;  
                    break;

                default:
                    continue;
            }
                
            if (file_.threads_ < minThreads_) minThreads_ = file_.threads_; 
            if (file_.threads_ > maxThreads_) maxThreads_ = file_.threads_; 
            avgThreads_ += file_.threads_;
            avgThreadsCount_++;  

            if (file_.threads_ < minIntervals_) minIntervals_ = file_.threads_; 
            if (file_.threads_ > maxIntervals_) maxIntervals_ = file_.threads_; 
            avgIntervals_ += file_.threads_;
            avgIntervalsCount_++;  
        }
    }

    
    index_ -= shift_;

    this.replayCtxMeshes_.fillStyle = "#ff0000";
    this.replayCtxMeshes_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxMeshes_.fillRect(index_ + 1, 0, 1, ly_);
    this.replayCtxTextures_.fillStyle = "#ff0000";
    this.replayCtxTextures_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxTextures_.fillRect(index_ + 1, 0, 1, ly_);
    this.replayCtxTextures2_.fillStyle = "#ff0000";
    this.replayCtxTextures2_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxTextures2_.fillRect(index_ + 1, 0, 1, ly_);
    this.replayCtxGeodata_.fillStyle = "#ff0000";
    this.replayCtxGeodata_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxGeodata_.fillRect(index_ + 1, 0, 1, ly_);
    this.replayCtxMetatiles_.fillStyle = "#ff0000";
    this.replayCtxMetatiles_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxMetatiles_.fillRect(index_ + 1, 0, 1, ly_);
    this.replayCtxIntervals_.fillStyle = "#ff0000";
    this.replayCtxIntervals_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxIntervals_.fillRect(index_ + 1, 0, 1, ly_);
    this.replayCtxThreads_.fillStyle = "#ff0000";
    this.replayCtxThreads_.fillRect(index_ - 1, 0, 1, ly_);
    this.replayCtxThreads_.fillRect(index_ + 1, 0, 1, ly_);

    if (!avgMeshesCount_) { minMeshes_ = 0, maxMeshes_ = 0; }
    if (!avgTexturesCount_) { minTextures_ = 0, maxTextures_ = 0; }
    if (!avgTextures2Count_) { minTextures2_ = 0, maxTextures2_ = 0; }
    if (!avgGeodataCount_) { minGeodata_ = 0, maxGeodata_ = 0; }
    if (!avgMetatilesCount_) { minMetatiles_ = 0, maxMetatiles_ = 0; }
    if (!avgThreadsCount_) { minThreads_ = 0, maxThreads_ = 0; }
    if (!avgIntervalsCount_) { minIntervals_ = 0, maxIntervals_ = 0; }

    avgMeshes_ = avgMeshesCount_ ? (avgMeshes_/avgMeshesCount_) : 0;
    avgTextures_ = avgTexturesCount_ ? (avgTextures_/avgTexturesCount_) : 0;
    avgTextures2_ = avgTextures2Count_ ? (avgTextures2_/avgTextures2Count_) : 0;
    avgGeodata_ = avgGeodataCount_ ? (avgGeodata_/avgGeodataCount_) : 0;
    avgMetatiles_ = avgMetatilesCount_ ? (avgMetatiles_/avgMetatilesCount_) : 0;
    avgIntervals_ = avgIntervalsCount_ ? (avgIntervals_/avgIntervalsCount_) : 0;
    avgThreads_ = avgThreadsCount_ ? (avgThreads_/avgThreadsCount_) : 0;

    this.replayInfoMeshes_.innerHTML = "Meshes Min/Max/Avg/Count: " + minMeshes_.toFixed(0) + "/" + maxMeshes_.toFixed(0) + "/" + avgMeshes_.toFixed(1) + "/" + avgMeshesCount_;
    this.replayInfoTextures_.innerHTML = "Internal Textures Min/Max/Avg/Count: " + minTextures_.toFixed(0) + "/" + maxTextures_.toFixed(0) + "/" + avgTextures_.toFixed(1) + "/" + avgTexturesCount_;
    this.replayInfoTextures2_.innerHTML = "External Textures Min/Max/Avg/Count: " + minTextures2_.toFixed(0) + "/" + maxTextures2_.toFixed(0) + "/" + avgTextures2_.toFixed(1) + "/" + avgTextures2Count_;
    this.replayInfoGeodata_.innerHTML = "Geodata Min/Max/Avg/Count: " + minGeodata_.toFixed(0) + "/" + maxGeodata_.toFixed(0) + "/" + avgGeodata_.toFixed(1) + "/" + avgGeodataCount_;
    this.replayInfoMetatiles_.innerHTML = "Metatiles Min/Max/Avg/Count: " + minMetatiles_.toFixed(0) + "/" + maxMetatiles_.toFixed(0) + "/" + avgMetatiles_.toFixed(1) + "/" + avgMetatilesCount_;
    this.replayInfoIntervals_.innerHTML = "Intervals Min/Max/Avg: " + minIntervals_.toFixed(0) + "/" + maxIntervals_.toFixed(0) + "/" + avgIntervals_.toFixed(1);  
    this.replayInfoThreads_.innerHTML = "Threads Min/Max/Avg: " + minThreads_ + "/" + maxThreads_ + "/" + avgThreads_.toFixed(1);  
};

Melown.Inspector.prototype.updateFileInfo = function(index_) {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var file_ = map_.replay_.loaded_[index_];

    if (file_) {
        this.replayTimeInfo_.innerHTML = ""
            + "Resource Kind: " + file_.kind_ + "<br/>"
            + "Time: " + file_.time_.toFixed(2) + "<br/>"
            + "Duration: " + file_.duration_.toFixed(2) + "<br/>"
            + "Interval: " + file_.interval_.toFixed(2) + "<br/>"
            + "Priority: " + file_.priority_.toFixed(2) + "<br/>"
            + "Threads: " + file_.threads_ + "<br/>"
            + "" + file_.url_;
    } else {
        this.replayTimeInfo_.innerHTML = "";
    }
};

Melown.Inspector.prototype.buildReplayCombo = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }

    var items_ = [
        ["Drawn Tiles",1],
        ["Drawn Tiles - Free Layers",1],
        ["Traced Nodes",1],
        ["Traced Nodes - Free Layers",1],
        ["Load Sequence",2],
        ["Camera",1],
        ["Globe",0]
    ];

    var keys_ = [
        "DrawnTiles",
        "DrawnTilesFreeLayers",
        "TracedNodes",
        "TracedNodesFreeLayers",
        "LoadSequence",
        "Camera",
        "Globe"
    ];

    var html_ = "";

    for (var i = 0, li = items_.length; i < li; i++) {
        html_ += '<div id="melown-replay-item-' + keys_[i] + '" class="melown-replay-item">'
                 + '<input id="melown-replay-checkbox-' + keys_[i] + '" type="checkbox"/>'
                 + '<span title=' + items_[i][0] + '>' + items_[i][0] + '&nbsp;&nbsp;</span>';
                 
        if (items_[i][1] > 0) {
            html_ += '<input id="melown-replay-sbutton-' + keys_[i] + '" type="button" value="S"/>';
        }
        
        if (items_[i][1] > 1) {
            html_ += '<input id="melown-replay-fbutton-' + keys_[i] + '" type="button" value="F"/>';
        }
        
        html_ += '</div>';
    }

    this.replayItems_.innerHTML = html_;
    //this.replayCurrentItem_ = keys_[0];

    for (var i = 0, li = items_.length; i < li; i++) {
        var htmlId_ = "melown-replay-checkbox-" + keys_[i];
        document.getElementById(htmlId_).onchange = this.switchReplayItem.bind(this, keys_[i], htmlId_);
        //var htmlId_ = "melown-replay-item-" + keys_[i];
        //document.getElementById(htmlId_).onclick = this.selectReplayItem.bind(this, keys_[i]);

        if (items_[i][1] > 0) {
            var htmlId_ = "melown-replay-sbutton-" + keys_[i];
            document.getElementById(htmlId_).onclick = this.replayItemButton.bind(this, keys_[i], "S");
        }

        if (items_[i][1] > 1) {
            var htmlId_ = "melown-replay-fbutton-" + keys_[i];
            document.getElementById(htmlId_).onclick = this.replayItemButton.bind(this, keys_[i], "F");
        }

    }
};



