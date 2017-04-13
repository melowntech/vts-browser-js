
var UIControlScale = function(ui, visible) {
    this.ui = ui;
    this.control = this.ui.addControl("scale",
      '<div class="vts-scale"'
      + '</div>', visible);
};


export default UIControlScale;
