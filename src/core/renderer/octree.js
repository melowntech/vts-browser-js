
var Octree = function() {
    this.root = null;
};


Octree.prototype.clear = function() {
};


Octree.prototype.buildFromGeometry = function(data) {
    if (!data) {
        return;
    }

    var i, li, j, lj, item, submeshes, submesh, bbox,
        minX, minY, minZ, maxX, maxY, maxZ;

    //get gemetery bbox
    for (i = 0, li = data.length; i < li; i++) {
        item = data[i];
        if (item["type"] == "mesh") {
            submeshes = item["submeshes"];

            for (j = 0; j < lj; j++) {
                submesh = submeshes[j];
                bbox = submesh["bbox"];
                
                if (bbox.min[0] < minX) minX = bbox.min[0];
                if (bbox.min[1] < minY) minY = bbox.min[1];
                if (bbox.min[2] < minZ) minZ = bbox.min[2];

                if (bbox.max[0] > maxX) maxX = bbox.max[0];
                if (bbox.max[1] > maxY) maxY = bbox.max[1];
                if (bbox.max[2] > maxZ) maxZ = bbox.max[2];
            }
        }
    }

    this.root = new OctreeNode([minX, minY, minZ], [maxX, maxY, maxZ]);
};


var OctreeNode = function(min, max) {
    this.min = min;
    this.max = max;
    this.children = [];
    this.data = null;
};

Octree.prototype.add = function(data) {

};

Octree.prototype.split = function(data) {

};


