

var RoiPanoTile = function(face, position, index, lod, scale, url) {
    this.face = face;
    this.position = [position[0], position[1]];
    this.index = [index[0], index[1]];
    this.lod = lod;
    this.scale = scale;
    this.mat = null;
    this.children = [];
    this.resources = {
        url : url,
        image : null,
        texture : null
    };
};


RoiPanoTile.prototype.applendChild = function(tile) {
    this.children.push(tile);
};


RoiPanoTile.prototype.url = function() {
    return this.resources.url;
};


RoiPanoTile.prototype.image = function(image) {
    if (image === undefined) {
        return this.resources.image
    }
    this.resources.image = image;
};


RoiPanoTile.prototype.texture = function(texture) {
    if (texture === undefined) {
        return this.resources.texture
    }
    this.resources.texture = texture;
};


export default RoiPanoTile;
