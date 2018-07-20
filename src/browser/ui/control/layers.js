
var UIControlLayers = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.control = this.ui.addControl('layers',
      '<div class="vts-layers"'
      + '</div>', visible, visibleLock);
};


export default UIControlLayers;
