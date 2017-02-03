/**
 * @constructor
 */
Melown.UIControlFullscreen = function(ui_, visible_) {
    this.ui_ = ui_;
    this.control_ = this.ui_.addControl("fullscreen",
      '<img id="melown-fullscreen" class="melown-fullscreen" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAwUlEQVRo3u2YwRWDIBBEIc+SLMKmckpTFkFPePKQQ57DsitR/z/D6KgMDikBAMCTycKYxai9Bul8MYkic+NFS7BOs4FUa/1IrzTn9xk6O6+rrwEMjGayTlS/UXWeujbcDKgpEZRObgYOc1oYt7CIMXCFFLKmTrS+aqAEP8iSAGBYI1s776FLv7eReaWHWd/cyLz3Bas+vxIYGNXIhBTxOhcKNdCaHvPfGPjVYb3OhVjEGLhrI/Pewc9uZDQvAABwZQMKFi+DmFdLbgAAAABJRU5ErkJggg==">'
      , visible_);
      
    var img_ = this.control_.getElement("melown-fullscreen");
    img_.on("click", this.onClick.bind(this));
    img_.on("dblclick", this.onDoNothing.bind(this));
    
    this.enabled_ = false;
};

Melown.UIControlFullscreen.prototype.onDoNothing = function(event_) {
    Melown.Utils.preventDefault(event_);    
    Melown.Utils.stopPropagation(event_);    
};


Melown.UIControlFullscreen.prototype.requestFullscreen = function(element_) {
    if(element_.requestFullscreen) {
        element_.requestFullscreen();
    } else if(element_.mozRequestFullScreen) {
        element_.mozRequestFullScreen();
    } else if(element_.webkitRequestFullscreen) {
        element_.webkitRequestFullscreen();
    } else if(element_.msRequestFullscreen) {
        element_.msRequestFullscreen();
    }
};

Melown.UIControlFullscreen.prototype.exitFullscreen = function() {
    if(document.exitFullscreen) {
        document.exitFullscreen();
    } else if(document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if(document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
};

Melown.UIControlFullscreen.prototype.fullscreenEnabled = function() {
    return (document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled);
};

Melown.UIControlFullscreen.prototype.onClick = function(event_) {
    var element_ = this.ui_.element_;
    
    if (!this.enabled_) {
    //if (!this.fullscreenEnabled()) {
        this.enabled_ = true;
        this.requestFullscreen(element_);
    } else {
        this.enabled_ = false;
        this.exitFullscreen();  
    } 
};
