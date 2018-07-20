
var UIControlLogo = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.control = this.ui.addControl("logo",
      '<a class="vts-logo"'
      + ' href="https://melown.com">'
      + 'Powered by MELOWN'
      + '</a>', visible, visibleLock);
};


export default UIControlLogo;

