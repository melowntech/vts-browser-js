
var UIControlMap = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('map',
      '<div id="vts-map"'
      + ' class="vts-map">'
      + ' </div>', visible, visibleLock);

    var map = this.getMapElement();
    map.setDraggableState(true);
};


UIControlMap.prototype.getMapElement = function() {
    return this.control.getElement('vts-map');
};


export default UIControlMap;
