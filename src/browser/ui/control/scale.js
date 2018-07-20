
var UIControlScale = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.control = this.ui.addControl("scale",
      '<div class="vts-scale"'
      + '</div>', visible, visibleLock);
};


export default UIControlScale;
