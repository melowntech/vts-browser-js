Melown.Roi.Pano = function(config_, core_, options_) {
    // TODO setup

    this.super_ = Melown.Roi.prototype;
    Melown.Roi.call(this, config_, core_, options_);
}

// inheritance from Roi
Melown.Roi.Pano.prototype = Object.create(Melown.Roi.prototype);
Melown.Roi.Pano.prototype.constructor = Melown.Roi.Pano;

// TODO zoom methods

// Protected methods

Melown.Roi.Pano.prototype._init = function() {
    // check browser instance
    // load and parse configuration file
    // prepare UI

    this.super_._init();
}

Melown.Roi.Pano.prototype._processConfig = function() {
    this.super_._processConfig();
}

Melown.Roi.Pano.prototype._initFinalize = function() {
    this.super_._initFinalize();
}

Melown.Roi.Pano.prototype._update = function() {
    this.super_.update();

    // calc visible area
    // zoom
    // prepare reasources

    // render
    this._draw();
}

Melown.Pano.prototype._draw = function() {
    // prepare all billboards and draw them seqs.
    this.browser_.drawBillboard(/* TODO */);
}
