
/**
 * @constructor
 */
Melown.Inspector = function(core_) {
    this.core_ = core_;

    this.initStatsPanel();
    this.initGraphsPanel();

    //keyboard events
//    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
//    document.addEventListener("keypress", this.onKeyPress.bind(this), false);
//    document.addEventListener("keydown", this.onKeyDown.bind(this), false);

    document.addEventListener("keyup", this.onKeyUp.bind(this), false);
    document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    
    this.debugValue_ = 0.1;
};

Melown.Inspector.prototype.addStyle = function(string_) {
    var style_ = document.createElement('style');
    style_.type = 'text/css';
    style_.innerHTML = string_;
    document.getElementsByTagName('head')[0].appendChild(style_);
};


