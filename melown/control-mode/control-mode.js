/**
 * @constructor
 */
Melown.ControlMode = function(browser_) {
    this.browser_ = browser_;
    this.ui_ = browser_.ui_;
    this.mapControl_ = this.ui_.getMapControl();
    this.mapElement_ = this.mapControl_.getMapElement();
    this.altKey_ = false;
    this.shiftKey_ = false;
    this.ctrlKey_ = false;

    this.mapElement_.on('drag', this.onDrag.bind(this));
    //this.mapElement_.on('dragstart', this.onDragStart.bind(this));
    //this.mapElement_.on('dragend', this.onDragEnd.bind(this));
    this.mapElement_.on('mousedown', this.onDown.bind(this));
    this.mapElement_.on('mouseup', this.onUp.bind(this));
    this.mapElement_.on('mousewheel', this.onWheel.bind(this));
    this.mapElement_.on('keyup', this.onKeyUp.bind(this), window);
    this.mapElement_.on('keydown', this.onKeyDown.bind(this), window);
    this.mapElement_.on('keypress', this.onKeyPress.bind(this), window);
    this.mapElement_.on('dblclick', this.onDoubleClick.bind(this), window);
    this.browser_.on('tick', this.onTick.bind(this));

    this.controlModes_ = {};
    this.currentCotnrolMode_ = 'map-observer';

    // default control modes
    this.addControlMode('map-observer', new Melown.ControlMode.MapObserver(browser_));
    this.addControlMode('disabled', new Melown.ControlMode.Disabled());
    this.addControlMode('pano', new Melown.ControlMode.Pano(browser_));

    // use map observer mode as default
    this.setDefaultControlMode();
};

// Control Mode object interface keys
/** @const */ Melown_ControlMode_Drag = 'drag';
/** @const */ Melown_ControlMode_Down = 'down';
/** @const */ Melown_ControlMode_Up = 'up';
/** @const */ Melown_ControlMode_KeyUp = 'keyup';
/** @const */ Melown_ControlMode_KeyDown = 'keydown';
/** @const */ Melown_ControlMode_KeyPress = 'keypress';
/** @const */ Melown_ControlMode_Wheel = 'wheel';
/** @const */ Melown_ControlMode_Tick = 'tick';
/** @const */ Melown_ControlMode_Reset = 'reset';
/** @const */ Melown_ControlMode_DoubleClick = 'doubleclick';

// Public methods

Melown.ControlMode.prototype.addControlMode = function(id_, controller_) {
    if (typeof id_ !== 'string'
        || controller_ === null
        || typeof controller_ !== 'object') {
        throw new Error('Melown.ControlMode.addControlMode function has (String, Object) prototype.');
    }

    this.controlModes_[id_] = controller_;
};

Melown.ControlMode.prototype.removeControlMode = function(id_) {
    if (typeof id_ !== 'string') {
        throw new Error('Melown.ControlMode.removeControlMode function takes string as argument.');
    }
    if (id_ === this.currentCotnrolMode_) {
        throw new Error(id_ + ' control mode is in use. Can\'t be removed.');
    }

    delete this.controlModes_[id_];
    this.controlModes_[id_];
};

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
};

Melown.ControlMode.prototype.setDefaultControlMode = function() {
    this.setCurrentControlMode('map-observer');
};

Melown.ControlMode.prototype.getCurrentControlMode = function() {
    return this.currentControlMode_;
};

// Event callbacks

Melown.ControlMode.prototype.onDrag = function(event_) {
    this._checkAutopilot();
    if (typeof this._currentController()[Melown_ControlMode_Drag]
        === 'function') {
        this._currentController()[Melown_ControlMode_Drag](event_);
    }
};

Melown.ControlMode.prototype.onDown = function(event_) {
    this._checkAutopilot();
    this._updateModifierKeys(event_);
    if (typeof this._currentController()[Melown_ControlMode_Down]
        === 'function') {
        this._currentController()[Melown_ControlMode_Down](event_);
    }
};

Melown.ControlMode.prototype.onUp = function(event_) {
    this._updateModifierKeys(event_);
    if (typeof this._currentController()[Melown_ControlMode_Up]
        === 'function') {
        this._currentController()[Melown_ControlMode_Up](event_);
    }
};

Melown.ControlMode.prototype.onWheel = function(event_) {
    this._checkAutopilot();
    if (typeof this._currentController()[Melown_ControlMode_Wheel]
        === 'function') {
        this._currentController()[Melown_ControlMode_Wheel](event_);
    }
};

Melown.ControlMode.prototype.onKeyUp = function(event_) {
    this._updateModifierKeys(event_);
    if (typeof this._currentController()[Melown_ControlMode_KeyUp]
        === 'function') {
        this._currentController()[Melown_ControlMode_KeyUp](event_);
    }
};

Melown.ControlMode.prototype.onKeyDown = function(event_) {
    this._updateModifierKeys(event_);
    if (typeof this._currentController()[Melown_ControlMode_KeyDown]
        === 'function') {
        this._currentController()[Melown_ControlMode_KeyDown](event_);
    }
};

Melown.ControlMode.prototype.onKeyPress = function(event_) {
    this._updateModifierKeys(event_);
    if (typeof this._currentController()[Melown_ControlMode_KeyPress]
        === 'function') {
        this._currentController()[Melown_ControlMode_KeyPress](event_);
    }
};

Melown.ControlMode.prototype.onDoubleClick = function(event_) {
    this._updateModifierKeys(event_);
    if (typeof this._currentController()[Melown_ControlMode_DoubleClick]
        === 'function') {
        this._currentController()[Melown_ControlMode_DoubleClick](event_);
    }
};

Melown.ControlMode.prototype.onTick = function(event_) {
    if (typeof this._currentController()[Melown_ControlMode_Tick]
        === 'function') {
        event_.draggingState_ = this.mapElement_.getDraggingState();    
        this._currentController()[Melown_ControlMode_Tick](event_);
    }
};

Melown.ControlMode.prototype.getCurrentController = function() {
    return this.controlModes_[this.currentControlMode_];
};

// Private metod
Melown.ControlMode.prototype._updateModifierKeys = function(event_) {
    this.altKey_ = event_.getModifierKey("alt");
    this.shiftKey_ = event_.getModifierKey("shift");
    this.ctrlKey_ = event_.getModifierKey("ctrl");
    
    //console.log("alt:" + this.altKey_ + "  ctrl:" + this.ctrlKey_ + "  shift:" + this.shiftKey_);
};

Melown.ControlMode.prototype._currentController = function() {
    return this.controlModes_[this.currentControlMode_];
};

Melown.ControlMode.prototype._checkAutopilot = function() {
    if (this.browser_.autopilot_) {
        this.browser_.autopilot_.setAutorotate(0);
        this.browser_.autopilot_.setAutopan(0,0);
    }
};

