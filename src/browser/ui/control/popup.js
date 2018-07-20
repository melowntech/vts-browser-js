
var UIControlPopup = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('popup',
        '<div class="vts-popup-background" id="vts-popup-background">'
      +    '<div id="vts-popup"</div>'
      + '</div>', visible, visibleLock);

    this.lastHTML = '';
    this.popup = this.control.getElement('vts-popup');
    this.background = this.control.getElement('vts-popup-background');
    this.background.on('click', this.hide.bind(this));
};


UIControlPopup.prototype.show = function(style, html) {
    this.control.setVisible(true);
    
    for (var key in style) {
        this.popup.setStyle(key, style[key]);
    }

    this.popup.setHtml(html);
};


UIControlPopup.prototype.hide = function() {
    this.control.setVisible(false);
};


export default UIControlPopup;
