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
    this.surfaces_ = json_["surfaces"] || [];
    this.boundLayers_ = json_["type"] || [];
    this.freeLayers_ = json_["freeLayers"] || [];
};

Melown.MapView.prototype.getInfo = function() {
    return {
        "description" : JSON.parse(JSON.stringify(this.description_)),
        "surfaces" : JSON.parse(JSON.stringify(this.surfaces_)),
        "boundLayers" : JSON.parse(JSON.stringify(this.boundLayers_)),
        "freeLayers" : JSON.parse(JSON.stringify(this.freeLayers_))
    };
};