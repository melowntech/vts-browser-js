
Melown.Inspector.prototype.initLayersPanel = function() {

    this.addStyle(
        "#melown-layers-panel {"
            + "font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;"
            + "display: none;"
            + "padding:15px;"
            + "font-size: 14px;"
            + "position: absolute;"
            + "right: 10px;"
            + "bottom: 10px;"
            + "cursor: default;"
            + "background-color: rgba(255,255,255,0.95);"
            + "border-radius: 5px;"
            + "border: solid 1px #ccc;"
            + "text-align: left;"
            + "z-index: 4;"
            + "padding: 10px;"
        + "}"

        + "#melown-layers-panel-title {"
            + "margin-bottom: 3px;"
        + "}"
        
        + "#melown-layers-left-panel {"
            + "margin-top: 5px;"
            + "float: left;"
        + "}"

        + "#melown-layers-left-items {"
            + "width: 150px;"
            + "min-height: 50px;"
            + "max-height: 150px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
        + "}"
         
        + "#melown-layers-middle-panel {"
            + "margin-top: 5px;"
            + "float: left;"
        + "}"

        + "#melown-layers-middle-items {"
            + "width: 150px;"
            + "min-height: 100px;"
            + "max-height: 250px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
        + "}"

        + "#melown-layers-right-panel {"
            + "margin-top: 5px;"
            + "float: right;"
        + "}"

        + "#melown-layers-right-items {"
            + "width: 150px;"
            + "min-height: 50px;"
            + "max-height: 150px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
        + "}"
    );

    this.layersElement_ = document.createElement("div");
    this.layersElement_.id = "melown-layers-panel";
    this.layersElement_.innerHTML = ""
        + '<span id="melown-layers-panel-title">Layers Switcher</span><br/>'
        + '<div id="melown-layers-left-panel">Surfaces:<br/>'
           + '<div id="melown-layers-left-items"></div></div>'
        + '<div id="melown-layers-middle-panel">Bound Layers:<br/>'
           + '<div id="melown-layers-middle-items"></div></div>'
        + '<div id="melown-layers-right-panel">Free Layers:<br/>'
           + '<div id="melown-layers-right-items"></div></div>';

    this.core_.element_.appendChild(this.layersElement_);
    this.layersSurfacesItems_ = document.getElementById("melown-layers-left-items");
    this.layersBoundLayersItems_ = document.getElementById("melown-layers-middle-items");
    this.layersFreeLayersItems_ = document.getElementById("melown-layers-right-items");
    
    this.layersSurfaces_ = [];
    this.layersFreeLayer_ = [];
    
    this.layersPanelVisible_ = false;
    this.layersPanelInitialized_ = false;
    this.layersCurrentSurface_ = "";
};

Melown.Inspector.prototype.buildSurfaces = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }
   
    var surfaces_ = map_.getSurfaces();
    var html_ = "";
    
    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var id_ = surfaces_[i];
        var surface_ = map_.getSurface(id_);
        
        var layers_ = map_.getBoundLayers();
        var layerStates_ = []; 

        for (var j = 0, lj = layers_.length; j < lj; j++) {
            var layer_ = map_.getBoundLayerById(layers_[j]);
            
            layerStates_.push({
                id_ : layers_[j],
                alpha_ : 1.0
            });
        }
        
        this.layersSurfaces_[id_] = {
            surface_ : surface_,
            enabled_ : false,
            layers_ : layerStates_ 
        };
        
        html_ += '<input id="melown-surface-checkbox-' + id_ + '" type="checkbox"/>' + id_ + '<br />';
    }

    this.layersSurfacesItems_.innerHTML = html_;
    this.layersCurrentSurface_ = surfaces_[0];

    var view_ = map_.getView();

    for (var key_ in view_["surfaces"]) {
        var surface_ = this.layersSurfaces_[key_];
        
        if (surface_) {
            surface_.enabled_ = true;

            var htmlId_ = "melown-surface-checkbox-" + key_;
            document.getElementById(htmlId_).checked = true;
        }
    }


    for (var i = 0, li = surfaces_.length; i < li; i++) {
        var htmlId_ = "melown-surface-checkbox-" + surfaces_[i];
        document.getElementById(htmlId_).onchange = this.switchSurface.bind(this, surfaces_[i], htmlId_);
    }

};

Melown.Inspector.prototype.buildBoundLayers = function(id_) {
    var map_ = this.core_.getMap();
    if (!map_ || !id_) {
        return;
    }

    var layers_ = this.layersSurfaces_[id_].layers_;
    var html_ = "";

    for (var i = 0, li = layers_.length; i < li; i++) {
        var layer_ = layers_[i];

        html_ += '<input id="melown-surface-checkbox-' + layer_.id_ + '" type="checkbox"/>' + layer_.id_ + '<br />';
    }

    this.layersBoundLayersItems_.innerHTML = html_;
};

Melown.Inspector.prototype.buildFreeLayers = function() {
    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }
   
    var layers_ = map_.getFreeLayers();
    var html_ = "";
    
    for (var i = 0, li = layers_.length; i < li; i++) {
        var id_ = layers_[i];
        var layer_ = map_.getFreeLayer(id_);
        
        html_ += '<input id="melown-surface-checkbox-' + id_ + '" type="checkbox"/>' + id_ + '<br />';
    }

    this.layersFreeLayersItems_.innerHTML = html_;
};

Melown.Inspector.prototype.switchSurface = function(id_, htmlId_) {
    var element_ = document.getElementById(htmlId_);
    this.layersSurfaces_[id_].enabled_ = element_.checked;
    this.applyMapView();
};

Melown.Inspector.prototype.applyMapView = function() {
    var view_ = {
        "surfaces" : {},
        "freelayers" : []
    };
    
    for (var key_ in this.layersSurfaces_) {
        if (this.layersSurfaces_[key_].enabled_) {
            view_["surfaces"][key_] = [];
        }
    }

    var map_ = this.core_.getMap();
    if (!map_) {
        return;
    }
    
    map_.setView(view_);
};

Melown.Inspector.prototype.showLayersPanel = function() {
    this.layersElement_.style.display = "block";
    this.layersPanelVisible_ = true;
    this.updateLayersPanel();
};

Melown.Inspector.prototype.hideLayersPanel = function() {
    this.layersElement_.style.display = "none";
    this.layersPanelVisible_ = false;
};

Melown.Inspector.prototype.switchLayersPanel = function() {
    if (this.layersPanelVisible_) {
        this.hideLayersPanel();
    } else {
        this.showLayersPanel();
    }
};

Melown.Inspector.prototype.updateLayersPanel = function(Layers_) {
};

Melown.Inspector.prototype.updateLayersPanel = function(Layers_) {
    if (!this.layersPanelInitialized_) {
        this.layersPanelInitialized_ = false;
        this.buildSurfaces();
        this.buildBoundLayers(this.layersCurrentSurface_);
        this.buildFreeLayers(this.layersCurrentSurface_);
    }
    
};

