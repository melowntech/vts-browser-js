

//keyboard events
Melown.Inspector.prototype.onKeyDown = function(event_) {
    if (typeof event_ == 'undefined') {
        event_ = window.event;
    }

    this.altDown_ = event_.altKey;
    this.ctrlDown_ = event_.ctrlKey;
    this.shiftDown_ = event_.shiftKey;

    this.onKeyUp(event_, true);
};

Melown.Inspector.prototype.onKeyPress = function(event_) {
    this.onKeyUp(event_, true);
};

Melown.Inspector.prototype.preventDefault = function(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
};

Melown.Inspector.prototype.onKeyUp = function(event_, press_) {
    if (typeof event_ == 'undefined') {
        event_ = window.event;
    }

    var map_ = this.core_.getMap();

    if (map_ == null) {
        return;
    }

    this.altDown_ = event_.altKey;
    this.ctrlDown_ = event_.ctrlKey;
    this.shiftDown_ = event_.shiftKey;

    var done_ = (function(){});
    var hit_ = false;

    if (event_) {
        var keyCode_;

        if (window.event) {         // eg. IE
            keyCode_ = window.event.keyCode;
        } else if (event_.which) {   // eg. Firefox
            keyCode_ = event_.which;
        } else {
            keyCode_ = event_.charCode;
        }

        if (this.shiftDown_ == true) {

            if (this.ctrlDown_ == true) {

                switch(keyCode_) {
                    case 68:
                    case 100:
                        this.preventDefault(event_); break;  //key D pressed
                }
            }
        }

        if (this.shiftDown_ == true && press_ != true) {

            switch(keyCode_) {
                case 76:
                case 108:
                    /*this.showMenu(); this.toolbarItemSelected('link'); done_();*/  break;  //key L pressed

                case 71:
                case 103:
                    /*this.showMenu(); this.toolbarItemSelected('position'); done_();*/ break; //key G pressed

                case 65:
                case 97:
                    /*this.engine_.setAutorotate(1);*/ break;  //key A pressed
            }

            if (this.ctrlDown_ == true) {

                switch(keyCode_) {
                    case 68:
                    case 100:
                    
                    //load image    
                        
                        if (!this.circleImage_) {
                            this.circleImage_ = Melown.Http.imageFactory(
                                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QAAAAAAAD5Q7t/AAAACW9GRnMAAAAgAAAA4ACD+EAUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA/UlEQVRYw+2VPwqDMBTG3dz1Am56EnH2XLroETxGuwc3Z7cOdhY8QJpfSUBspUvStJAPPggvD973/uQligICAgL+DKViqygUV02hbaXLwJlio7gpyhNu2idzEXwwgfI8H+u6vnZdN/V9P3EuimLcCRlsiyArGcfxjWDLsmzyAGzc4aNFNDZ7/iw7AeQH4LNrh5WZYLgkJTaZCyHuVVVdkiSZ0zSdOWMzlaBFWkRrQ4A4Zk/A4wBie1MFYUMAz0wybCYAmR8FUAlzj6+2r18TgM2VAO8tOB1Cyk7mrofQ+zP0voheVjHtIBjDxjrmvCu7k1Xs/TP6ie84ICDAGR5uCYdPo0MWiAAAAABJRU5ErkJggg==",
                                //"http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png",
                                (function(){
                                    this.circleTexture_ = this.core_.getRendererInterface().createTexture({ "source": this.circleImage_ });
                                }).bind(this)
                            );
                        }
                                            
                        this.diagnosticMode_ = true; hit_ = true; break;  //key D pressed
                }
            }

            if (this.diagnosticMode_ == true) {
                var blockHit_ = true;

                switch(keyCode_) {

                    case 68:
                    case 100:
                        break; //key D pressed


                    case 49: /*this.core_.setControlMode("manual"); done_();*/  break;  //key 1 pressed
                    case 50: /*this.core_.setControlMode("drone"); done_();*/   break;  //key 2 pressed
                    case 51: /*this.core_.setControlMode("observer"); done_();*/ break; //key 3 pressed

                    case 48:  //key 0 pressed
                        /*this.core_.setOption("noForwardMovement" , !this.core_.getOption("noForwardMovement"));*/
                        break;

                    //case 84: //key T pressed
                    //case 116:
                        /*var pos_ = this.core_.hitTest(this.mouseX_, this.mouseY_, "all");
                        console.log("hit pos: " + pos_[0] + " " + pos_[1] + " " + pos_[2] + " " + pos_[3] + " d " + pos_[4]); //key T pressed
                        this.core_.logTile(pos_);*/
                        //break;

                    case 72:
                    case 104:
                        map_.heightmapOnly_ = !map_.heightmapOnly_;

                        /*
                        var pos_ = map_.getPosition();
                        pos_.setHeight(pos_.setHeight() * 0.9);
                        map_.setPosition(pos_);*/

                        break;  //key H pressed

                    case 80:
                    case 112:
                       var pos_ = map_.getPosition();
                       console.log("pos-before: " + JSON.stringify(pos_.pos_));
                       pos_.convertViewMode((pos_.getViewMode() == "obj") ? "subj" : "obj");
                       console.log("new mode: " + pos_.getViewMode());
                       console.log("pos-after: " + JSON.stringify(pos_.pos_));
                       map_.setPosition(pos_);

                        /*this.core_.saveScreenshot(pos_);*/ break;  //key P pressed

                    case 83:
                    case 115:
                        this.switchStatsPanel(); break; //key S pressed

                    case 86:
                    case 118:
                        this.switchLayersPanel(); break; //key V pressed

                    case 69:
                    case 101:
                        this.switchStylesheetsPanel(); break; //key E pressed

                    case 84:
                    case 116:
                        this.switchReplayPanel(); break; //key T pressed

                    case 66:
                    case 98:
                        map_.drawBBoxes_ = !map_.drawBBoxes_; break; //key B pressed

                    case 87:
                    case 119:
                        var value_ = map_.drawWireframe_ + 1;
                        map_.drawWireframe_ = value_ > 2 ? 0 : value_;
                        break; //key W pressed

                    case 70:
                    case 102:
                        map_.drawWireframe_ = map_.drawWireframe_ != 3 ? 3 : 0;
                        break; //key F pressed

                    case 77:
                    case 109:
                        //map_.drawMaxLod_ = !map_.drawMaxLod_;
                        
                        //map_.config_.mapGeocentCulling2_ = !map_.config_.mapGeocentCulling2_;
                        //console.log("mapGeocentCulling2: " + map_.config_.mapGeocentCulling2_);
                        
                       /*
                        var from_ = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs";
                        var to_ = "+proj=geocent +datum=WGS84 +units=m +no_defs";
                        var coords_ = [-5009377.08569725, 15028131.257091751, 0];
    
                        var timeStart_ = performance.now();
                        
                        for (var i = 0; i < 100000; i++) {
                            var r = map_.proj4_(from_, to_, coords_);
                        }
                        
                        var timeEnd_ = performance.now();
                        
                        var tt = timeEnd_ - timeStart_;
                        
                        console.log("proj4 timer: " + tt + "   " + JSON.stringify(r));
                        */
                        /*
                        var from2_ = map_.proj4_("+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs", null, null, true);
                        var to2_ = map_.proj4_("+proj=geocent +datum=WGS84 +units=m +no_defs", null, null, true);
                        var coords_ = [-5009377.08569725, 15028131.257091751, 0];

                        var timeStart_ = performance.now();
                        
                        for (var i = 0; i < 100000; i++) {
                            var r = map_.proj4_(from2_, to2_, coords_);
                        }
                        
                        var timeEnd_ = performance.now();
                        
                        var tt = timeEnd_ - timeStart_;
                        
                        console.log("proj4 timer2: " + tt + "   " + JSON.stringify(r));
                        */

                        //map_.zFactor2_ += 0.1; //0.000001;
                        //console.log("zfactor  " + map_.zFactor2_ + "   zz: " + map_.renderer_.getZoffsetFactor([map_.zFactor2_, 0, 0]));
                        
                        map_.loaderSuspended_ = !map_.loaderSuspended_;            
                        console.log("loader state " + map_.loaderSuspended_);

                        break; //key M pressed

                    case 74:
                    case 106:
                        //map_.config_.mapGeocentCulling_ = !map_.config_.mapGeocentCulling_;
                        //console.log("mapGeocentCulling: " + map_.config_.mapGeocentCulling_);
                        //map_.blendHeightmap_ = !map_.blendHeightmap_;
                        //map_.zFactor2_ -= 0.1;//0.000001;
                        //console.log("zfactor  " + map_.zFactor2_);                          

                        break; //key J pressed

                    case 88:
                    case 120:
                        map_.drawFog_ = !map_.drawFog_; hit_ = true; break; //key X pressed

                    case 82:
                    case 114:
                        this.switchGraphsPanel(); break; //key R pressed

                    case 79:
                    case 111:
                        map_.camera_.setOrtho(!map_.camera_.getOrtho()); break; //key O pressed

                    case 76:
                    case 108:
                        this.drawRadar_ = !this.drawRadar_; break; //key L pressed

                    case 90:
                    case 122:
                        map_.ignoreTexelSize_ = !map_.ignoreTexelSize_; break; //key Z pressed

                    default:
                        blockHit_ = false;
                        break;

                }

                if (blockHit_) {
                    hit_ = true;
                }
            }
        }

        if (this.diagnosticMode_ && this.drawRadar_ && !this.shiftDown_ && !press_) {
            var blockHit_ = true;

            switch(keyCode_) {
                case 43:
                case 107:
                    if (this.radarLod_ == null) { this.radarLod_ = 8;}
                    this.radarLod_++; /*console.log("radarLOD: " + this.radarLod_);*/ break; //key mun + pressed

                case 45:
                case 109:
                    if (this.radarLod_ == null) { this.radarLod_ = 8;}
                    this.radarLod_ = Math.max(0,this.radarLod_-1); /*console.log("radarLOD: " + this.radarLod_);*/ break; //key mun - pressed

                case 42:
                case 106:
                    this.radarLod_ = null; /*console.log("radarLOD: auto");*/ break; //key mun * pressed

                default:
                    blockHit_ = false;
                    break;
            }

            if (blockHit_) {
                hit_ = true;
            }
        }

        if (this.diagnosticMode_ && map_.drawBBoxes_ && !this.shiftDown_ && !press_) {
             var blockHit_ = true;

            switch(keyCode_) {
                case 76:
                case 108:
                    map_.drawLods_ = !map_.drawLods_; break; //key L pressed

                case 80:
                case 112:
                    map_.drawPositions_ = !map_.drawPositions_; break; //key P pressed

                case 84:
                case 116:
                    map_.drawTextureSize_ = !map_.drawTextureSize_; break; //key T pressed

                case 70:
                case 102:
                    map_.drawFaceCount_ = !map_.drawFaceCount_; break; //key F pressed

                case 68:
                case 100:
                    map_.drawDistance_ = !map_.drawDistance_; break; //key D pressed

                case 78:
                case 110:
                    map_.drawNodeInfo_ = !map_.drawNodeInfo_; break; //key N pressed

                case 77:
                case 109:
                    map_.drawMeshBBox_ = !map_.drawMeshBBox_; break; //key M pressed

                case 73:
                case 105:
                    map_.drawIndices_ = !map_.drawIndices_; break; //key I pressed

                case 66:
                case 98:
                    map_.drawBoundLayers_ = !map_.drawBoundLayers_; break; //key B pressed

                case 83:
                case 115:
                    map_.drawSurfaces_ = !map_.drawSurfaces_; break; //key S pressed

                case 67:
                case 99:
                    map_.drawCredits_ = !map_.drawCredits_; break; //key C pressed

                case 79:
                case 111:
                    map_.drawOrder_ = !map_.drawOrder_; break; //key O pressed

                case 69:
                case 101:
                    map_.debugTextSize_ = (map_.debugTextSize_ == 2.0) ? 3.0 : 2.0; break; //key E pressed

                case 88:
                case 120:
                    map_.config_.mapPreciseBBoxTest_ = !map_.config_.mapPreciseBBoxTest_; break; //key X pressed

                case 90:
                case 122:
                    map_.config_.mapPreciseDistanceTest_ = !map_.config_.mapPreciseDistanceTest_; break; //key Z pressed

                default:
                    blockHit_ = false;
                    break;
            }

            if (blockHit_) {
                hit_ = true;
            }
        }

    }

    if (hit_) {
        map_.markDirty();
        this.preventDefault(event_);
    }

    //console.log("key" + keyCode_);

};


