
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

        + "#melown-layers-views-panel {"
            + "margin-top: 5px;"
            + "float: left;"
        + "}"

        + "#melown-layers-views-items {"
            + "width: 150px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
            + "height: 200px;"
            + "border: 1px solid #ddd;"
        + "}"
        
        + "#melown-layers-left-panel {"
            + "margin-top: 5px;"
            + "float: left;"
        + "}"        
        
        + "#melown-layers-left-items {"
            + "width: 150px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
            + "height: 200px;"
            + "border-top: 1px solid #ddd;"
            + "border-bottom: 1px solid #ddd;"
        + "}"
         
        + "#melown-layers-middle-panel {"
            + "margin-top: 5px;"
            + "float: left;"
        + "}"

        + "#melown-layers-middle-items {"
            + "width: 250px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
            + "height: 200px;"
            + "border: 1px solid #ddd;"
            + "border-right: none;"
        + "}"

        + "#melown-layers-right-panel {"
            + "margin-top: 5px;"
            + "float: right;"
        + "}"

        + "#melown-layers-right-items {"
            + "width: 150px;"
            + "overflow-y: scroll;"
            + "overflow-x: hidden;"
            + "height: 200px;"
            + "border: 1px solid #ddd;"
        + "}"
        
        + ".melown-layers-panel-title {"
            + "margin: 0px;"
            + "margin-bottom: 5px;"
        + "}"

        + ".melown-layers-item {"
            + "width: 100%;"
        + "}"        
        
        + ".melown-layers-item input[type=number]{"
            + "width: 45px;"
        + "}"
        
        + ".melown-layers-name {"
            + "width: 120px;"
            + "display: inline-block;"
            + "overflow: hidden;"
            + "text-overflow: ellipsis;"
            + "white-space: nowrap;"       
        + "}"          

        + ".melown-surface-item {"
            + "width: 100%;"
            + "overflow: hidden;"
            + "text-overflow: ellipsis;"
            + "white-space: nowrap;"    
        + "}" 
        
    );

    this.layersElement_ = document.createElement("div");
    this.layersElement_.id = "melown-layers-panel";
    this.layersElement_.innerHTML = ""
        + '<div id="melown-layers-views-panel"><p class="melown-layers-panel-title">Named Views:</p>'
           + '<div id="melown-layers-views-items"></div></div>'
        + '<div id="melown-layers-left-panel"><p class="melown-layers-panel-title">Surfaces:</p>'
           + '<div id="melown-layers-left-items"></div></div>'
        + '<div id="melown-layers-middle-panel"><p class="melown-layers-panel-title">Bound Layers:</p>'
           + '<div id="melown-layers-middle-items"></div></div>'
        + '<div id="melown-layers-right-panel"><p class="melown-layers-panel-title">Free Layers:</p>'
           + '<div id="melown-layers-right-items"></div></div>';

    this.core_.element_.appendChild(this.layersElement_);
    this.layersViewItems_ = document.getElementById("melown-layers-view-items");
    this.layersSurfacesItems_ = document.getElementById("melown-layers-left-items");
    this.layersBoundLayersItems_ = document.getElementById("melown-layers-middle-items");
    this.layersFreeLayersItems_ = document.getElementById("melown-layers-right-items");

    this.layersViews_ = [];
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
                alpha_ : 100,
                enabled_ : false
            });
        }
        
        this.layersSurfaces_[id_] = {
            surface_ : surface_,
            enabled_ : false,
            layers_ : layerStates_ 
        };
        
        html_ += '<div id="melown-surface-item-' + id_ + '" class="melown-surface-item"><input id="melown-surface-checkbox-'
                 + id_ + '" type="checkbox"/><span title=' + id_ + '>' + id_ + '</span></div>';
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
        var htmlId_ = "melown-surface-item-" + surfaces_[i];
        document.getElementById(htmlId_).onclick = this.selectSurface.bind(this, surfaces_[i]);
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

        html_ += '<div class="melown-layers-item"><input id="melown-boundlayer-checkbox-' + layer_.id_ + '" type="checkbox" ' + (layer_.enabled_ ? "checked" : "")   + '/>'
                 + '<div class="melown-layers-name">' + layer_.id_ + '</div>'
                 + '<input id="melown-boundlayer-spinner-' + layer_.id_ + '" type="number" title="Alpha" min="0" max="100" step="10" value="' + layer_.alpha_ + '">'
                 + '<button id="melown-boundlayer-ubutton-' + layer_.id_ + '" type="button" title="Move Above">&uarr;</button>' 
                 + '<button id="melown-boundlayer-dbutton-' + layer_.id_ + '" type="button" title="Move Bellow">&darr;</button>' 
                 + '</div>';
    }

    this.layersBoundLayersItems_.innerHTML = html_;

    for (var i = 0, li = layers_.length; i < li; i++) {
        var htmlId_ = "melown-boundlayer-checkbox-" + layers_[i].id_;
        document.getElementById(htmlId_).onchange = this.switchBoundLayer.bind(this, layers_[i].id_, htmlId_, "enable");
        htmlId_ = "melown-boundlayer-spinner-" + layers_[i].id_;
        document.getElementById(htmlId_).onchange = this.switchBoundLayer.bind(this, layers_[i].id_, htmlId_, "alpha");
        htmlId_ = "melown-boundlayer-ubutton-" + layers_[i].id_;
        document.getElementById(htmlId_).onclick = this.switchBoundLayer.bind(this, layers_[i].id_, htmlId_, "up");
        htmlId_ = "melown-boundlayer-dbutton-" + layers_[i].id_;
        document.getElementById(htmlId_).onclick = this.switchBoundLayer.bind(this, layers_[i].id_, htmlId_, "down");
    }

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
        
        html_ += '<input id="melown-freelayer-checkbox-' + id_ + '" type="checkbox"/>' + id_ + '<br />';
    }

    this.layersFreeLayersItems_.innerHTML = html_;
};

Melown.Inspector.prototype.switchSurface = function(id_, htmlId_) {
    var element_ = document.getElementById(htmlId_);
    this.layersSurfaces_[id_].enabled_ = element_.checked;
    this.applyMapView();
};

Melown.Inspector.prototype.selectSurface = function(id_, htmlId_) {
    //deselect previous
    if (this.layersCurrentSurface_) {
        var element_ = document.getElementById("melown-surface-item-" + this.layersCurrentSurface_);
        element_.style.backgroundColor = "initial";
    }

    //select new one
    var element_ = document.getElementById("melown-surface-item-" + id_);
    element_.style.backgroundColor = "#ddd";
    this.layersCurrentSurface_ = id_;
    this.buildBoundLayers(this.layersCurrentSurface_);
};

Melown.Inspector.prototype.switchBoundLayer = function(id_, htmlId_, action_) {
    var element_ = document.getElementById(htmlId_);
    var layers_ = this.layersSurfaces_[this.layersCurrentSurface_].layers_;
    
    for (var i = 0, li = layers_.length; i < li; i++) {
        if (layers_[i].id_ == id_) {
            switch(action_) {
                case "enable":
                    layers_[i].enabled_ = element_.checked;
                    break;
                case "alpha":
                    layers_[i].alpha_ = parseInt(element_.value, 10);
                    break;
                case "up":
                    layers_.splice(Math.max(0,i-1), 0, layers_.splice(i, 1)[0]);
                    this.selectSurface(this.layersCurrentSurface_);
                    break;
                case "down":
                    layers_.splice(Math.max(0,i+1), 0, layers_.splice(i, 1)[0]);
                    this.selectSurface(this.layersCurrentSurface_);
                    break;
            }
            
            break;
        }
    }
    
    this.applyMapView();
};

Melown.Inspector.prototype.applyMapView = function() {
    var view_ = {
        "surfaces" : {},
        "freelayers" : []
    };
    
    for (var key_ in this.layersSurfaces_) {
        if (this.layersSurfaces_[key_].enabled_) {
            var viewLayers_ = [];
            var layers_ = this.layersSurfaces_[key_].layers_;
            
            for (var i = 0, li = layers_.length; i < li; i++) {
                if (layers_[i].enabled_) {
                    
                    if (layers_[i].alpha_ < 100) {
                        viewLayers_.push({"id":layers_[i].id_, "alpha":layers_[i].alpha_*0.01});
                    } else {
                        viewLayers_.push(layers_[i].id_);
                    }
                }
            }
            
            view_["surfaces"][key_] = viewLayers_;
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
        this.selectSurface(this.layersCurrentSurface_);
        this.buildFreeLayers();
    }
    
};

