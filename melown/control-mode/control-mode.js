Melown.ControlMode = function(browser_, ui_) {
    this.browser_ = browser_;
    this.ui_ = ui_;
    this.mapControl_ = this.ui_.getMapControl();
    this.mapElement_ = this.mapControl_.getMapElement();
        
    this.mapElement_.on('drag', this.onDrag.bind(this));
    this.mapElement_.on('mousewheel', this.onWheel.bind(this));
    this.browser_.on('tick', this.onTick.bind(this));

    this.controlModes_ = {};
    this.currentCotnrolMode_ = 'map-observer';

    // default control modes
    this.addControlMode('map-observer', new Melown.ControlMode.MapObserver(browser_));
    this.addControlMode('disabled', new Melown.ControlMode.Disabled());
    this.addControlMode('pano', new Melown.ControlMode.Pano(browser_));

    // use map observer mode as default
    this.setDefaultControlMode();
}

// Control Mode object interface keys
/** @const */ Melown_ControlMode_Drag = 'drag';
/** @const */ Melown_ControlMode_Wheel = 'wheel';
/** @const */ Melown_ControlMode_Tick = 'tick';
/** @const */ Melown_ControlMode_Reset = 'reset';

// Public methods

Melown.ControlMode.prototype.addControlMode = function(id_, controller_) {
    if (typeof id_ !== 'string' 
        || controller_ === null 
        || typeof controller_ !== 'object') {
        throw new Error('Melown.ControlMode.addControlMode function has (String, Object) prototype.');
    }

    this.controlModes_[id_] = controller_;
}

Melown.ControlMode.prototype.removeControlMode = function(id_) {
    if (typeof id_ !== 'string') {
        throw new Error('Melown.ControlMode.removeControlMode function takes string as argument.');   
    }
    if (id_ === this.currentCotnrolMode_) {
        throw new Error(id_ + ' control mode is in use. Can\'t be removed.');      
    }

    delete this.controlModes_[id_];
    this.controlModes_[id_];
}

Melown.ControlMode.prototype.setCurrentControlMode = function(id_, options_) {
    var newMode_ = this.controlModes_[id_];
    if (newMode_ === null || typeof newMode_ !== 'object') {
        throw new Error ('Melown.ControlMode.setCurrentControlMode: Try tu use unregistered control mode ' + id_  + '.');
    }

    // set new mode
    this.currentControlMode_ = id_;

    // call reset
    if (typeof newMode_[Melown_ControlMode_Reset] === 'function') {
        newMode_[Melown_ControlMode_Reset](options_);
    }
}

Melown.ControlMode.prototype.setDefaultControlMode = function() {
    this.setCurrentControlMode('map-observer');
}

Melown.ControlMode.prototype.getCurrentControlMode = function() {
    return this.currentControlMode_;
}

// Event callbacks

Melown.ControlMode.prototype.onDrag = function(event_) {
    if (typeof this._currentController()[Melown_ControlMode_Drag] 
        === 'function') {
        this._currentController()[Melown_ControlMode_Drag](event_);
    }
}

Melown.ControlMode.prototype.onWheel = function(event_) {
    if (typeof this._currentController()[Melown_ControlMode_Wheel] 
        === 'function') {
        this._currentController()[Melown_ControlMode_Wheel](event_);
    }
}

Melown.ControlMode.prototype.onTick = function(event_) {
    if (typeof this._currentController()[Melown_ControlMode_Tick] 
        === 'function') {
        this._currentController()[Melown_ControlMode_Tick](event_);
    }
}

// Private metod

Melown.ControlMode.prototype._currentController = function() {
    return this.controlModes_[this.currentControlMode_];
}
