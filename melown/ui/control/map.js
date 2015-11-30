/**
 * @constructor
 */
Melown.UIControlMap = function(ui_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("map",
      '<div id="melown-map"'
      + ' class="melown-map">'
      + ' </div>');

    this.dragCall_ = this.onDrag.bind(this);

    var map_ = this.control_.getElement("melown-map");
    map_.on("drag", this.onDrag.bind(this));
    map_.on("mousewheel", this.onMouseWheel.bind(this));
    map_.setDraggableState(true);

    this.controlModes_ = {};
    this.currentCotnrolMode_;
};

// Control Mode object interface keys
/** @const */ Melown_UIControlMap_ControlMode_Drag = 'drag';
/** @const */ Melown_UIControlMap_ControlMode_Wheel = 'wheel';
/** @const */ Melown_UIControlMap_ControlMode_Tick = 'tick';
/** @const */ Melown_UIControlMap_ControlMode_Reset = 'reset';

Melown.UIControlMap.prototype.addControlMode = function(id_, controller_) {
    if (typeof id_ !== 'string' 
        || controller_ === null 
        || typeof controller_ !== 'object') {
        throw new Error('Melown.UIControlMap.addControlMode function has (String, Object) prototype.');
    }

    this.controlModes_[id_] = controller_;
}

Melown.UIControlMap.prototype.removeControlMode = function(id_) {
    if (typeof id_ !== 'string') {
        throw new Error('Melown.UIControlMap.removeControlMode function takes string as argument.');   
    }
    if (id_ === this.currentCotnrolMode_) {
        throw new Error(id_ + ' control mode is in use. Can\'t be removed.');      
    }

    delete this.controlModes_[id_];
    this.controlModes_[id_];
}

Melown.UIControlMap.prototype.setCurrentControlMode = function(id_) {
    var newMode_ = this.currentCotnrolMode_[id_];
    if (newMode_ === null || typeof newMode_ !== 'object') {
        throw new Error ('Melown.UIControlMap.setCurrentControlMode: Try tu use unregistered control mode ' + id_  + '.');
    }

    // set new mode
    this.currentControlMode_ = newMode_;

    // call reset
    if (typeof newMode_[Melown_UIControlMap_ControlMode_Reset] === 'function') {
        newMode_[Melown_UIControlMap_ControlMode_Reset]();
    }
}

Melown.UIControlMap.prototype.getCurrentControlMode = function() {
    return this.currentCotnrolMode_;
}



Melown.UIControlMap.prototype.onDrag = function(event_) {
    if (typeof this.currentCotnrolMode_[Melown_UIControlMap_ControlMode_Drag] 
        === 'function') {
        this.currentControlMode_[Melown_UIControlMap_ControlMode_Drag](event_);
    }
}


//     var map_ = this.browser_.getCore().getMap();
//     if (map_ == null) {
//         return;
//     }

//     var pos_ = map_.getPosition();
//     var delta_ = event_.getDragDelta();

//     if (event_.getDragButton("left")) { //pan
//         if (this.browser_.controlMode_ == "pannorama") {
//             return;
//         }

//         var sensitivity_ = 0.5;
//         pos_ = map_.pan(pos_, delta_[0] * sensitivity_,
//                               delta_[1] * sensitivity_);
//     } else if (event_.getDragButton("right")) { //rotate
//         var sensitivity_ = 0.4;
//         pos_[5] -= delta_[0] * sensitivity_;
//         pos_[6] -= delta_[1] * sensitivity_;
//     }

//     map_.setPosition(pos_);
// };

Melown.UIControlMap.prototype.onMouseWheel = function(event_) {
    if (typeof this.currentCotnrolMode_[Melown_UIControlMap_ControlMode_Wheel] 
        === 'function') {
        this.currentControlMode_[Melown_UIControlMap_ControlMode_Wheel](event_);
    }
}

//     var map_ = this.browser_.getCore().getMap();
//     if (map_ == null) {
//         return;
//     }

//     var pos_ = map_.getPosition();
//     var delta_ = event_.getWheelDelta();

//     if (this.browser_.controlMode_ == "pannorama") {
//         var factor_ = (delta_ > 0 ? -1 : 1) * 1;
//         pos_[9] = Melown.clamp(pos_[9] + factor_, 1, 179);
//     } else {
//         var factor_ = 1.0 + (delta_ > 0 ? -1 : 1)*0.05;
//         pos_[8] *= factor_;
//     }

//     map_.setPosition(pos_);
// };

Melown.UIControlMap.prototype.onMouseUp = function() {
    console.log("map-up");
};

