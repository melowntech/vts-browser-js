

var UIControlFallback = function(ui, visible) {
    this.ui = ui;
    this.control = this.ui.addControl("fallback",
      '<div class="vts-fallback">'

        + '<div class="vts-fallback-text">'
            + '<p>VTS Browser needs <a href="http://get.webgl.org/">WebGL</a> capable web browser.</p>'
        + '</div>'

      + ' </div>', visible);
};


export default UIControlFallback;
