
var MapView = function(map, json) {
    //this.map = map;
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
    return {
        //'description' : JSON.parse(JSON.stringify(this.description)),
        'surfaces' : JSON.parse(JSON.stringify(this.surfaces)),
        //"boundLayers" : JSON.parse(JSON.stringify(this.boundLayers)),
        'freeLayers' : JSON.parse(JSON.stringify(this.freeLayers))
    };
};


export default MapView;

