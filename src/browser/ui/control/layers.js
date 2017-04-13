
var UIControlLayers = function(ui, visible) {
    this.ui = ui;
    this.control = this.ui.addControl("layers",
      '<div class="vts-layers"'
      + '</div>', visible);
};


export default UIControlLayers;
