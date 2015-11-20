
/**
 * @constructor
 */
Melown.Inspector = function(core_) {
    this.core_ = core_;

    this.initStatsPanel();
    this.initGraphsPanel();

    //keyboard events
    document.onkeyup = this.onKeyUp.bind(this);
    document.onkeypress = this.onKeyPress.bind(this);
    document.onkeydown = this.onKeyDown.bind(this);
};

Melown.Inspector.prototype.addStyle = function(string_) {
    var style_ = document.createElement('style');
    style_.type = 'text/css';
    style_.innerHTML = string_;
    document.getElementsByTagName('head')[0].appendChild(style_);
};


