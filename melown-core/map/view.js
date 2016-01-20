/**
 * @constructor
 */
Melown.MapView = function(map_, json_) {
    //this.map_ = map_;
    //this.id_ = json_["id"] || null;
    this.parse(json_);
};

Melown.MapView.prototype.parse = function(json_) {
    this.description_ = json_["description"] || "";
    this.boundLayers_ = json_["boundLayers"] || [];
    this.freeLayers_ = json_["freeLayers"] || [];
    this.surfaces_ = {};    

    if (json_["surfaces"]) {
        var surfaces_ = json_["surfaces"]; 
        if (Array.isArray(surfaces_)) { //convert old version
            for (var i = 0, li = surfaces_.length; i < li; i++) {
                this.surfaces_[surfaces_[i]] = [];
            }
        } else {
            this.surfaces_ = surfaces_;            
        }
    }
    
    this.surfaces_ = JSON.parse(JSON.stringify(this.surfaces_));
};

Melown.MapView.prototype.getInfo = function() {
    return {
        "description" : JSON.parse(JSON.stringify(this.description_)),
        "surfaces" : JSON.parse(JSON.stringify(this.surfaces_)),
        //"boundLayers" : JSON.parse(JSON.stringify(this.boundLayers_)),
        "freeLayers" : JSON.parse(JSON.stringify(this.freeLayers_))
    };
};