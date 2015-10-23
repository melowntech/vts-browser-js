
Melown.Interface.prototype.initInput = function() {

    //mouse events
    document.onmouseup = this.onMouseUp.bind(this);
    document.onmousemove = this.onMouseMove.bind(this);

    //touch events
    document.ontouchmove = this.onTouchMove.bind(this);
    document.ontouchend = this.onTouchEnd.bind(this);

    document.onselectstart = function(){ return false; }; //removes text cusor during draging

    var element_ = document.getElementById('Melown-engine');
    this.element_ = element_;

    if (element_ != null) {
        //touch envents
        element_.ontouchstart = this.onTouchStart.bind(this);

        //mouse events
        element_.onmousedown = this.onMouseDown.bind(this);
        element_.oncontextmenu = (function(){ return false;});
        element_.ondblclick = this.onDoubleClick.bind(this);
        element_.addEventListener("DOMMouseScroll", this.onMouseWheel.bind(this), false);
        element_.addEventListener("mousewheel", this.onMouseWheel.bind(this), false);
    }

    element_ = document.getElementById('Melown-engine-canvas-2d');

    if (element_ != null) {
        element_.onmouseover = (function(){
            this.gisShowCusor_ = true;
            }).bind(this);

        element_.onmouseout = (function(){
            this.gisShowCusor_ = false;
            }).bind(this);
    }

    element_ = document.getElementById('Melown-engine-stats-render');

    if (element_ != null) {
        element_.onmousemove = this.onStatsMouseMove.bind(this);
        element_.onmouseout = this.onStatsMouseOut.bind(this);
    }

    element_ = document.getElementById('Melown-engine-stats-cache');

    if (element_ != null) {
        element_.onmousemove = this.onStatsMouseMove.bind(this);
        element_.onmouseout = this.onStatsMouseOut.bind(this);
    }

    //keyboard events
    document.onkeyup = this.onKeyUp.bind(this);
    document.onkeypress = this.onKeyPress.bind(this);
    document.onkeydown = this.onKeyDown.bind(this);
};


Melown.Interface.prototype.onDoubleClick = function(event_, skipIgnoreMouse_)
{
    if (this.engine_ == null || this.autopilot_ == null || this.browser_ == null || (this.ignoreMouse_ == true && skipIgnoreMouse_ != true)) {
        return;
    }

    if (this.ignoreDoubleClick_ == true) {
        this.ignoreDoubleClick_ = false;
        return;
    }

    var pos_ = this.browser_.hitTest(this.mouseX_, this.mouseY_, "all");
    var height_ = this.browser_.getTerrainHeight(pos_[0], pos_[1])

    var pos2_ = this.browser_.getPosition();
    var rot_ = this.browser_.getOrientation();
    var height2_ = this.browser_.getTerrainHeight(pos2_[0], pos2_[1]);

    var ray_ = this.browser_.getCameraVector();
    var pos3_ = ray_[0];

    var dx_ = pos_[0] - pos3_[0];
    var dy_ = pos_[1] - pos3_[1];
    var dz_ = pos_[2] - pos3_[2];//(height_[0] + this.browser_.getOption("cameraHeightOffset"));
    //var height3_ = this.browser_.getTerrainHeight(pos3_[0], pos3_[1]);

    var dist_ = Math.sqrt(dx_*dx_ + dy_*dy_ + dz_*dz_);

    var dist2_ = -(pos3_[2] - pos_[2]) / ray_[1][2];
    var dist3_ = -(pos3_[2] - (height2_[0] +  this.browser_.getOption("cameraHeightOffset"))) / ray_[1][2];

    //var dist_ = Math.sqrt(dx_*dx_ + dy_*dy_ + dz_*dz_);

    if (dist2_ < 0) {
        if (dist3_ < 0) {
            dist_ = 20;
        } else {
            dist_ = dist3_;
        }
    } else {
        dist_ = dist2_;
    }

    rot_[0] = rot_[0] % 360;
    rot_[1] = rot_[1] % 360;
    rot_[2] = rot_[2] % 360;

    this.autopilot_.setSource([pos2_[0], pos2_[1], pos2_[2]], [rot_[0], rot_[1], rot_[2]], null, this.browser_.getOption("cameraHeightOffset"));
    this.autopilot_.setDestination([pos_[0], pos_[1], dist_], rot_, null, (pos_[2] - height_[0]), false);
    this.engine_.setAutorotate(0);
    this.engine_.flying_ = false;
    this.engine_.shortflight_ = true;

};

Melown.Interface.prototype.onMouseDown = function(event, skipIgnoreMouse_)
{
    var right_ = false;
    var e = event || window.event;

    this.altDown_ = e.altKey;
    this.ctrlDown_ = e.ctrlKey;
    this.shiftDown_ = e.shiftKey;

    if (this.ignoreMouse_ == true && skipIgnoreMouse_ != true) {
        return;
    }


    if (e.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        right_ = e.which == 3;
    } else if (e.button) { // IE, Opera
        right_ = e.button == 2;
    }

    if (right_ == true) {
        this.mouseRightDown_ = true;
        this.placesMouseRightDown();
    } else {
        this.mouseLeftDown_ = true;

        if (this.ignoreMouse_ != true) {
            if (this.ignoreMouseUp_ != true) {
                this.placesMouseLeftDown();
            }
        }

        if (this.panelVisible_ == "gis" && this.browser_ != null) {
            this.gisMouseLeftDown();
        }
    }
};


Melown.Interface.prototype.onMouseUp = function(event, skipIgnoreMouse_)
{
    if (this.ignoreMouse_ == true && skipIgnoreMouse_ != true) {
        return;
    }

    //document.getElementById("Melown-engine-debug-text").innerHTML += ".e3.";

    var right_ = false;
    var e = event || window.event;

    if (e.which) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        right_ = e.which == 3;
    } else if (e.button) { // IE, Opera
        right_ = e.button == 2;
    }

    if (right_ == true) {
        this.mouseRightDown_ = false;
    } else {
        this.mouseLeftDown_ = false;

        //document.getElementById("Melown-engine-debug-text").innerHTML += ".e4.";

        if (this.ignoreMouseUp_ != true) {
          //document.getElementById("Melown-engine-debug-text").innerHTML += ".e5.";

            if (this.panelVisible_ == "gis" && this.browser_ != null) {
                //document.getElementById("Melown-engine-debug-text").innerHTML += ".e6.";
                this.gisMouseLeftUp();
            }

            this.placesMouseLeftUp();
        }
    }

    this.compassMove_ = false;
    this.ignoreMove_ = false;
    this.ignoreMouseUp_ = false;
};


Melown.Interface.prototype.onMouseMove = function(event, skipIgnoreMouse_)
{
    //document.getElementById("Melown-engine-debug-text").innerHTML = "mouse-move dx " + this.mouseX_ + " dy " + this.mouseY_ + " dx" + this.mouseDX_ + " dy " + this.mouseDY_;

    if (this.ignoreMouse_ == true && skipIgnoreMouse_ != true) {
        return;
    }

    var newX_ = event.clientX;
    var newY_ = event.clientY;

    this.mouseDX_ = (newX_ - this.mouseX_);
    this.mouseDY_ = (newY_ - this.mouseY_);

    this.mouseLX_ = this.mouseX_;
    this.mouseLY_ = this.mouseY_;
    this.mouseX_ = newX_;
    this.mouseY_ = newY_;

    var panFactor_ = 0.5;
    var rotateFactor_ = 0.4;


    if (this.ignoreMove_ == true) {
        return;
    }

    if (this.browser_ == null){
        return;
    }

    if (this.compassMove_ == true) {

        this.browser_.rotate(this.mouseDX_*rotateFactor_*2, this.mouseDY_*rotateFactor_*2);
        this.engine_.setAutorotate(0);
        this.sendWSCoords();

    } else {

        this.placesMouseMove();

        // handle position change
        if (this.mouseLeftDown_ == true && !(this.altDown_ == true || this.ctrlDown_ == true || this.shiftDown_ == true)) {
            if (this.ignorePan_ != true) {
                this.browser_.pan(this.mouseDX_*panFactor_, this.mouseDY_*panFactor_);
                this.engine_.setAutorotate(0);
                this.sendWSCoords();
            }
        }

        // handle orientation change
        if (this.mouseRightDown_ == true || (this.mouseLeftDown_ == true && (this.altDown_ == true || this.ctrlDown_ == true || this.shiftDown_ == true))) {
            this.browser_.rotate(this.mouseDX_*rotateFactor_, this.mouseDY_*rotateFactor_);
            this.engine_.setAutorotate(0);
            this.sendWSCoords();
        }

    }

    if (this.panelVisible_ == "gis") {
        this.gisMouseMove();
    }

};

Melown.Interface.prototype.onMouseWheel = function(event, skipIgnoreMouse_)
{
    if (this.ignoreMouse_ == true && skipIgnoreMouse_ != true) {
        return;
    }

    if (event.preventDefault) {
        event.preventDefault();
    }

    event.returnValue = false;

    if (this.ignoreWheel_ == true) {
        this.ignoreWheel_ = false;
        return;
    }

    var delta_ = 0;
    var w = event.wheelDelta;
    var d = event.detail;

    if (d) {
        if (w) delta_ = w/d/40*(d>=0?1:-1); // Opera
        else delta_ = -d/3;                 // Firefox;         TO_DO: do not /3 for OS X
    } else {
        delta_ = w/120;                     // IE/Safari/Chrome TO_DO: /3 for Chrome OS X
    }

    if (isNaN(delta_) == true) {
        delta_ = 0;
    }

    var zoomFactor = 0.35;

    //change camera distance
    delta_ = (delta_<0)?1:-1;

    if (this.browser_ == null){
        return;
    }

    this.placesMouseWheel();

    if (this.diagnosticMode_ == true && this.shiftDown_ == true && this.ctrlDown_ == true) {
        this.browser_.rotate(0, 0, delta_*5);
    } else if (this.diagnosticMode_ == true && this.shiftDown_ == true) {
        this.browser_.changeFov(delta_*50*zoomFactor);
    } else {
        if (this.browser_.getControlMode() == "observer") {
            this.browser_.zoom(delta_*50*zoomFactor);
        } else {
            this.browser_.zoom(delta_*20*zoomFactor);
        }
    }

    this.engine_.setAutorotate(0);
    this.sendWSCoords();
};

//keyboard events
Melown.Interface.prototype.onKeyDown = function(event)
{
    if (typeof event == 'undefined') {
        event = window.event;
    }

    this.altDown_ = event.altKey;
    this.ctrlDown_ = event.ctrlKey;
    this.shiftDown_ = event.shiftKey;

    if (this.ignoreKeyboard_ == true) {
        return;
    }


    //event.preventDefault();

    this.onKeyUp(event, true);
};

Melown.Interface.prototype.onKeyPress = function(event)
{
    if (this.ignoreKeyboard_ == true) {
        return;
    }

    this.onKeyUp(event, true);
};

Melown.Interface.prototype.onKeyUp = function(event, press_)
{
    if (typeof event == 'undefined') {
        event = window.event;
    }

    this.altDown_ = event.altKey;
    this.ctrlDown_ = event.ctrlKey;
    this.shiftDown_ = event.shiftKey;

    if (this.ignoreKeyboard_ == true) {
        return;
    }


    ///event.preventDefault();
    //var done_ = (event.preventDefault) ? event.preventDefault : (function(){});
    var done_ = (function(){});

    if (event) {
        var keyCode_;

        if (window.event) {         // eg. IE
            keyCode_ = window.event.keyCode;
        } else if (event.which) {   // eg. Firefox
            keyCode_ = event.which;
        } else {
            keyCode_ = event.charCode;
        }

        if (this.shiftDown_ == true) {

            if (this.ctrlDown_ == true) {

                switch(keyCode_) {
                    case 68:
                    case 100:
                        if (event.preventDefault) event.preventDefault(); break;  //key D pressed
                }
            }
        }

        if (this.shiftDown_ == true && press_ != true && this.browser_ != null) {

            switch(keyCode_) {
                case 76:
                case 108:
                    this.showMenu(); this.toolbarItemSelected('link'); done_();  break;  //key L pressed

                case 71:
                case 103:
                    this.showMenu(); this.toolbarItemSelected('position'); done_(); break; //key G pressed

                case 65:
                case 97:
                    this.engine_.setAutorotate(1); break;  //key A pressed
            }

            if (this.ctrlDown_ == true) {

                switch(keyCode_) {
                    case 68:
                    case 100:
                        this.diagnosticMode_ = true;   break;  //key D pressed
                }

            }

            if (this.diagnosticMode_ == true) {

                switch(keyCode_) {

                    case 49: this.browser_.setControlMode("manual"); done_();  break;  //key 1 pressed
                    case 50: this.browser_.setControlMode("drone"); done_();   break;  //key 2 pressed
                    case 51: this.browser_.setControlMode("observer"); done_(); break; //key 3 pressed

                    case 48:  //key 0 pressed
                        this.browser_.setOption("noForwardMovement" , !this.browser_.getOption("noForwardMovement"));
                        break;

                    case 84:
                    case 116:
                        var pos_ = this.browser_.hitTest(this.mouseX_, this.mouseY_, "all");
                        console.log("hit pos: " + pos_[0] + " " + pos_[1] + " " + pos_[2] + " " + pos_[3] + " d " + pos_[4]); //key T pressed
                        this.browser_.logTile(pos_);
                        break;

                    case 72:
                    case 104:
                        this.drawOnlyHeightmap_ = !this.drawOnlyHeightmap_;
                        this.browser_.setOption("drawOnlyHeightmap", this.drawOnlyHeightmap_); break;  //key H pressed

                    case 80:
                    case 112:
                        this.browser_.saveScreenshot(pos_); break;  //key P pressed

                    case 83:
                    case 115:
                        this.showMenu(); this.toolbarItemSelected('stats'); break; //key S pressed

                    case 66:
                    case 98:
                        this.browser_.setOption("drawBBoxes" , !this.browser_.getOption("drawBBoxes")); break; //key B pressed

                    case 87:
                    case 119:
                        var value_ = this.browser_.getOption("drawWireframe")+1;
                        this.browser_.setOption("drawWireframe" , value_ > 2 ? 0 : value_ ); break; //key W pressed

                    case 70:
                    case 102:
                        this.browser_.setOption("drawWireframe" , this.browser_.getOption("drawWireframe") != 3 ? 3 : 0 ); break; //key F pressed

                    case 77:
                    case 109:
                        this.browser_.setOption("drawMaxLod" , !this.browser_.getOption("drawMaxLod")); break; //key M pressed

                    case 74:
                    case 106:
                        this.browser_.setOption("blendHeightmap" , !this.browser_.getOption("blendHeightmap")); break; //key J pressed

                    case 88:
                    case 120:
                        this.browser_.setOption("drawFog" , !this.browser_.getOption("drawFog")); break; //key X pressed

                    case 82:
                    case 114:
                        this.switchStatsGraphsPanel(); break; //key R pressed

                    case 69:
                    case 101:
                        this.showExport(); break; //key E pressed

                    case 79:
                    case 111:
                        this.browser_.setOption("ortho" , !this.browser_.getOption("ortho")); break; //key O pressed

                    case 86:
                    case 118:
                         this.switchLocationsPanel(); break; //key V pressed

                    case 90:
                    case 122:
                        this.browser_.setOption("ignoreTexelSize" , !this.browser_.getOption("ignoreTexelSize")); break; //key Z pressed

                        /*
                        if (this.browser_.getOption("ignoreTexelSize") != true) {
                            //this.showPosition(true);
                            //this.ignorePan(true);
                        } else {
                            //this.showPosition(false);
                            //this.ignorePan(false);
                        }

                        break; //key Z pressed
                        */
                }

            }

        }


        if (this.diagnosticMode_ == true && this.browser_.getOption("drawBBoxes") == true && this.shiftDown_ != true && press_ != true && this.browser_ != null) {

            switch(keyCode_) {
                case 76:
                case 108:
                    this.browser_.setOption("drawLods" , !this.browser_.getOption("drawLods")); break; //key L pressed

                case 80:
                case 112:
                    this.browser_.setOption("drawPositions" , !this.browser_.getOption("drawPositions")); break; //key P pressed

                case 84:
                case 116:
                    this.browser_.setOption("drawTextureSize" , !this.browser_.getOption("drawTextureSize")); break; //key T pressed

                case 83:
                case 115:
                    this.browser_.setOption("drawTexelSize" , !this.browser_.getOption("drawTexelSize")); break; //key S pressed

                case 70:
                case 102:
                    this.browser_.setOption("drawFaceCount" , !this.browser_.getOption("drawFaceCount")); break; //key F pressed

                case 68:
                case 100:
                    this.browser_.setOption("drawDistance" , !this.browser_.getOption("drawDistance")); break; //key D pressed
            }

        }

    }

    //console.log("key" + keyCode_);

    if (this.panelVisible_ == "gis") {
        this.gisKeyUp(keyCode_);
    }
};


Melown.Interface.prototype.isShiftDown = function() {
    return this.shiftDown_;
};

Melown.Interface.prototype.ignoreInputEvents = function(state_) {
    this.ignoreMouse_ = state_;
    this.ignoreTouch_ = state_;
    this.ignoreKeyboard_ = state_;

    //removes text cusor during draging
    document.onselectstart = state_ ? null : (function(){ return false; });
    //allows default touch behaviour - ios safari scrolling
    document.ontouchmove = state_ ? null : this.onTouchMove.bind(this);
    document.ontouchend = state_ ? null : this.onTouchEnd.bind(this);

    //disable right click menu
    if (this.element_ != null) {
        this.element_.oncontextmenu = state_ ? null : (function(){ return false; });
    }
};

Melown.Interface.prototype.ignorePan = function(state_) {
    this.ignorePan_ = state_;
};

Melown.Interface.prototype.getMouseState = function() {
    return {
        "x":this.mouseX_, "y": this.mouseY_,
        "lx":this.mouseLX_, "ly": this.mouseLY_,
        "dx":this.mouseDX_, "dy": this.mouseDY_,
        "l":this.mouseLeftDown_, "r": this.mouseRightDown_
    };
};


//prevet minification
Melown.Interface.prototype["isShiftDown"] = Melown.Interface.prototype.isShiftDown;
Melown.Interface.prototype["ignoreInputEvents"] = Melown.Interface.prototype.ignoreInputEvents;
Melown.Interface.prototype["ignorePan"] = Melown.Interface.prototype.ignorePan;
Melown.Interface.prototype["getMouseState"] = Melown.Interface.prototype.getMouseState;



