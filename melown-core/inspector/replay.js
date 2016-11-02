
Melown.Inspector.prototype.initReplayPanel = function() {

    this.addStyle(
        "#melown-replay-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "width: 600px;"
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
            + "width: 200px;"
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
            + "width: 330px;"
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
        
    );

    this.replayElement_ = document.createElement("div");
    this.replayElement_.id = "melown-replay-panel";
    this.replayElement_.innerHTML =
            '<div id="melown-replay-panel-left">'
            + '<div id="melown-replay-items"></div>'
          + '</div>'
          + '<div id="melown-replay-panel-right">'
            + '<div id="melown-replay-panel-lod">'  
                + '<input id="melown-replay-lod-slider" type="range" min="0" max="30" step="1" value="30" /><br/>'
                + '<span>LOD:</span>'
                + '<input id="melown-replay-lod-text" type="text" value="30"/>'
                + '<input id="melown-replay-lod-up" type="button" value="<"/>'
                + '<input id="melown-replay-lod-down" type="button" value=">"/>'
                + '<input id="melown-replay-lod-single" type="checkbox"/>'
                + '<span>Single</span>'
            + '</div><br/>'
            + '<div id="melown-replay-panel-time">'  
                + '<input id="melown-replay-time-slider" type="range" min="0" max="50000" value="0" /><br/>'
                + '<span>Time:</span>'
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

    document.getElementById("melown-replay-time-up").onclick = this.onReplaySliderChange.bind(this, "time", "down");
    document.getElementById("melown-replay-time-down").onclick = this.onReplaySliderChange.bind(this, "time", "up");
    document.getElementById("melown-replay-time-single").onclick = this.onReplaySliderChange.bind(this, "time", "single");

    this.replayElement_.addEventListener("mouseup", this.doNothing.bind(this), true);
    this.replayElement_.addEventListener("mousedown", this.doNothing.bind(this), true);
    this.replayElement_.addEventListener("mousewheel", this.doNothing.bind(this), false);
    this.replayElement_.addEventListener("dblclick", this.doNothing.bind(this), false);

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
        this.replayTimeText_.value = this.replayTimeSlider_.value;    
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



