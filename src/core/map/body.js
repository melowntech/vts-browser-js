
var MapBody = function(map, json) {
    //this.map = map;
    //this.id = json["id"] || null;
    this.parse(json);
};


MapBody.prototype.parse = function(json) {
    this.class = json['class'] || '';
    this.comment = json['comment'] || '';
    this.parent = json['parent'] || '';
    this.atmosphere = json['atmosphere'] || null;

    if (this.atmosphere) {
        if (!this.atmosphere['colorHorizon']) this.atmosphere['colorHorizon'] = [0,0,0,0];
        if (!this.atmosphere['colorZenith']) this.atmosphere['colorZenith'] = [0,0,0,0];
        if (!this.atmosphere['thickness'])  this.atmosphere['thickness'] = 100000;
        if (!this.atmosphere['visibility'])  this.atmosphere['visibility'] = 100000;
    }
};


MapBody.prototype.getInfo = function() {
    return {
        'class' : this.class,
        'comment' : this.comment,
        'parent' : this.parent,
        'atmosphere' : JSON.parse(JSON.stringify(this.atmosphere)),
    };
};


export default MapBody;