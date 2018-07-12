
import MapDivisionNode_ from './division-node';

//get rid of compiler mess
var MapDivisionNode = MapDivisionNode_;


var MapRefFrame = function(map, json) {
    this.map = map;
    this.proj4 = map.proj4;
    this.valid = false;
    this.id = json['id'] || null;
    this.description = json['description'] || '';
    this.nodesMap = [];

    var model = json['model'];

    if (model == null) {
        return;
    }

    this.model = {
        physicalSrs : map.getMapsSrs(model['physicalSrs']),
        navigationSrs : map.getMapsSrs(model['navigationSrs']),
        publicSrs : map.getMapsSrs(model['publicSrs'])
    };

    this.body = json['body'] ? map.getBody(json['body']) : null;

    this.params = {};

    if (json['parameters'] != null) {
        var params = json['parameters'];
        this.params.metaBinaryOrder = params['metaBinaryOrder'] || 1;
        this.params.navDelta = params['navDelta'] || 8;
    }

    var division = json['division'];

    if (division == null) {
        return;
    }

    this.division = {
        rootLod : division['rootLod'] || 0,
        arity : division['arity'] || null,
        heightRange : division['heightRange'] || [0,1]
    };

    var extents = this.parseSpaceExtents(division['extents']);
    this.division.extents = extents;

    map.spaceExtentSize = [extents.ur[0] - extents.ll[0], extents.ur[1] - extents.ll[1], extents.ur[2] - extents.ll[2]];
    map.spaceExtentOffset = extents.ll;

    var divisionNodes = division['nodes'];
    this.division.nodes = [];

    if (divisionNodes == null) {
        return;
    }

    this.hasPoles = (divisionNodes.length == 4); 

    for (var i = 0, li = divisionNodes.length; i < li; i++) {
        var node = this.parseNode(divisionNodes[i]);
        this.nodesMap['' + node.id[0] + '.'  + node.id[1] + '.' + node.id[2]] = node;
        this.division.nodes.push(node);
    }

    this.valid = true;
};


MapRefFrame.prototype.getInfo = function() {
    return {
        'id' : this.id,
        'physicalSrs' : this.model.physicalSrs.id,
        'navigationSrs' : this.model.navigationSrs.id,
        'publicSrs' : this.model.publicSrs.id
    };
};


MapRefFrame.prototype.getGlobalHeightRange = function() {
    return this.division.heightRange;     
};


MapRefFrame.prototype.parseNode = function(nodeData) {
    var node = {
        srs : nodeData['srs'],
        partitioning : nodeData['partitioning']
    };

    node.extents = this.parseExtents(nodeData['extents']);

    var nodeId = nodeData['id'];

    if (nodeId == null) {
        return;
    }

    node.id = {
        lod : nodeId['lod'] || 0,
        position : nodeId['position'] || [0,0]
    };

    return new MapDivisionNode(this.map, [node.id.lod, node.id.position[0], node.id.position[1]],
                                           node.srs, node.extents, this.heightRange, node.partitioning);
};


MapRefFrame.prototype.parseExtents = function(extentsData) {
    if (extentsData == null) {
        return { ll : [0,0], ur : [1,1] };
    }

    return {
        ll : extentsData['ll'] || [0,0],
        ur : extentsData['ur'] || [1,1]
    };
};


MapRefFrame.prototype.parseSpaceExtents = function(extentsData) {
    if (extentsData == null) {
        return { ll : [0,0,0], ur : [1,1,1] };
    }

    return {
        ll : extentsData['ll'] || [0,0,0],
        ur : extentsData['ur'] || [1,1,1]
    };
};


MapRefFrame.prototype.getSpatialDivisionNodes = function() {
    return this.division.nodes;
};


MapRefFrame.prototype.convertCoords = function(coords, source, destination) {
    var sourceSrs, destinationSrs;

    switch(source) {
    case 'public':     sourceSrs = this.model.publicSrs;     break;
    case 'physical':   sourceSrs = this.model.physicalSrs;   break;
    case 'navigation': sourceSrs = this.model.navigationSrs; break;
    }

    switch(destination) {
    case 'public':     destinationSrs = this.model.publicSrs;     break;
    case 'physical':   destinationSrs = this.model.physicalSrs;   break;
    case 'navigation': destinationSrs = this.model.navigationSrs; break;
    }

    return sourceSrs.convertCoordsTo(coords, destinationSrs);
};


export default MapRefFrame;


