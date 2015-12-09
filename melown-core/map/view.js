/**
 * @constructor
 */
Melown.MapView = function(map_, json_) {
    this.map_ = map_;
    //this.id_ = json_["id"] || null;
    this.description_ = json_["description"] || "";
    this.surfaces_ = json_["surfaces"] || [];
    this.boundLayers_ = json_["type"] || [];
    this.freeLayers_ = json_["freeLayers"] || [];
};

Melown.MapView.prototype.getInfo = function() {
    return {
        "description" : this.description_,
        "surfaces" : this.surfaces_,
        "boundLayers" : this.boundLayers_,
        "freeLayers" : this.freeLayers_
    };
};