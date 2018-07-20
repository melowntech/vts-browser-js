
import Dom_ from '../../utility/dom';

//get rid of compiler mess
var dom = Dom_;


var UIControlFullscreen = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.control = this.ui.addControl('fullscreen',
      '<img id="vts-fullscreen" class="vts-fullscreen" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAwUlEQVRo3u2YwRWDIBBEIc+SLMKmckpTFkFPePKQQ57DsitR/z/D6KgMDikBAMCTycKYxai9Bul8MYkic+NFS7BOs4FUa/1IrzTn9xk6O6+rrwEMjGayTlS/UXWeujbcDKgpEZRObgYOc1oYt7CIMXCFFLKmTrS+aqAEP8iSAGBYI1s776FLv7eReaWHWd/cyLz3Bas+vxIYGNXIhBTxOhcKNdCaHvPfGPjVYb3OhVjEGLhrI/Pewc9uZDQvAABwZQMKFi+DmFdLbgAAAABJRU5ErkJggg==">'
      , visible, visibleLock);
      
    var img = this.control.getElement('vts-fullscreen');
    img.on('click', this.onClick.bind(this));
    img.on('dblclick', this.onDoNothing.bind(this));
    
    this.enabled = false;
};


UIControlFullscreen.prototype.onDoNothing = function(event) {
    dom.preventDefault(event);    
    dom.stopPropagation(event);    
};


UIControlFullscreen.prototype.requestFullscreen = function(element) {
    if(element.requestFullscreen) {
        element.requestFullscreen();
    } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
};


UIControlFullscreen.prototype.exitFullscreen = function() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
};


UIControlFullscreen.prototype.fullscreenEnabled = function() {
    return (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled);
};


UIControlFullscreen.prototype.onClick = function() {
    var element = this.ui.element;
    
    if (!this.enabled) {
    //if (!this.fullscreenEnabled()) {
        this.enabled = true;
        this.requestFullscreen(element);
    } else {
        this.enabled = false;
        this.exitFullscreen();  
    } 
};


export default UIControlFullscreen;
