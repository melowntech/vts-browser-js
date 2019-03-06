
var MapView = function(map, json) {
    this.map = map;
    //this.id = json["id"] || null;
    this.parse(json);
};


MapView.prototype.parse = function(json) {
    //this.description = json['description'] || '';
    //this.boundLayers = json["boundLayers"] || [];
    this.freeLayers = json['freeLayers'] || {};
    this.surfaces = {};    

    if (json['surfaces']) {
        var surfaces = json['surfaces']; 
        if (Array.isArray(surfaces)) { //convert from old version
            for (var i = 0, li = surfaces.length; i < li; i++) {
                this.surfaces[surfaces[i]] = [];
            }
        } else {
            this.surfaces = surfaces;            
        }
    }

    if (!this.freeLayers || Array.isArray(this.freeLayers)) { //convert from old version
        this.freeLayers = {};
    } else {
        this.freeLayers = JSON.parse(JSON.stringify(this.freeLayers));
    }
    
    this.surfaces = JSON.parse(JSON.stringify(this.surfaces));
};


MapView.prototype.getInfo = function() {
    var view = {
        //'description' : JSON.parse(JSON.stringify(this.description)),
        'surfaces' : JSON.parse(JSON.stringify(this.surfaces)),
        'freeLayers' : JSON.parse(JSON.stringify(this.freeLayers)),
    };

    var renderer = this.map.renderer;

    if (this.map.renderer.getSuperElevationState()) {
        var se = this.map.renderer.getSuperElevation();

        view['options'] = {
            'superelevation' : [[se[0],se[2]],[se[1],se[3]]]
        }
    }

    return view;
};


export default MapView;

