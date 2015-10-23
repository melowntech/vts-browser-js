

Melown.Interface.prototype.initCompass = function() {
    this.setElementProperty("Melown-engine-compass-main", "onmousedown", this.onMelownCompass.bind(this));
    this.setElementProperty("Melown-engine-plus", "onclick", this.onMelownZoomIn.bind(this));
    this.setElementProperty("Melown-engine-minus", "onclick", this.onMelownZoomOut.bind(this));

    this.setElementProperty("Melown-engine-compass", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-compass2", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-compass3", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-compass-frame", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-compass-frame2", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-compass-frame3", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-plus", "ondragstart", (function() { return false; }));
    this.setElementProperty("Melown-engine-minus", "ondragstart", (function() { return false; }));
};

Melown.Interface.prototype.compassUpdate = function() {
    if (this.browser_ == null){
        return;
    }

    var compass = document.getElementById("Melown-engine-compass");
    var compass2 = document.getElementById("Melown-engine-compass2");
    var compass3 = document.getElementById("Melown-engine-compass3");
    var orientation = this.browser_.getOrientation();

    var value = "rotateX("+((orientation[1]+90)*0.7)+"deg) " + "rotateZ("+(orientation[0]-45)+"deg)";

    if (compass != null && compass2 != null && compass3 != null) {

        compass.style.transform = value;
        compass.style.webkitTransform = value;
        compass.style.msTransform = value;

        compass2.style.transform = value;
        compass2.style.webkitTransform = value;
        compass2.style.msTransform = value;

        compass3.style.transform = value;
        compass3.style.webkitTransform = value;
        compass3.style.msTransform = value;

    }
};

Melown.Interface.prototype.onMelownCompass = function() {
    this.compassMove_ = true;
    this.compassFirst_ = false;
};

Melown.Interface.prototype.onMelownZoomIn = function() {
    if (this.browser_ == null){
        return;
    }

    setTimeout((function(){ this.browser_.zoom(-5); setTimeout((function(){ this.browser_.zoom(-10); setTimeout((function(){ this.browser_.zoom(-10); setTimeout((function(){ this.browser_.zoom(-10); setTimeout((function(){ this.browser_.zoom(-10); setTimeout((function(){ this.browser_.zoom(-10); }).bind(this),60); }).bind(this),60);}).bind(this),60); }).bind(this),60); }).bind(this),60); }).bind(this),60);

};

Melown.Interface.prototype.onMelownZoomOut = function() {
    if (this.browser_ == null){
        return;
    }

    setTimeout((function(){ this.browser_.zoom(5); setTimeout((function(){ this.browser_.zoom(10); setTimeout((function(){ this.browser_.zoom(10); setTimeout((function(){ this.browser_.zoom(10); setTimeout((function(){ this.browser_.zoom(10); setTimeout((function(){ this.browser_.zoom(10); }).bind(this),60); }).bind(this),60);}).bind(this),60); }).bind(this),60); }).bind(this),60); }).bind(this),60);
};
