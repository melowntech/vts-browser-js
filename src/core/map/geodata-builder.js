
import MapGeodataGeometry_ from './geodata-geometry';

//get rid of compiler mess
var MapGeodataGeometry = MapGeodataGeometry_;


var MapGeodataBuilder = function(map) {
    this.map = map;
    this.groups = [];
    this.currentGroup = null;
    this.bboxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    this.bboxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

    this.navSrs = this.map.getNavigationSrs();
    this.physSrs = this.map.getPhysicalSrs();

    this.heightsToProcess = 0;
    this.heightsProcessBuffer = null;
    this.heightsLod = 8;
    this.heightsSource = "heightmap-by-precision";
    this.updateCallback = null;
    this.processingHeights = false;
    this.processHeightsCalls = [];
};

MapGeodataBuilder.prototype.addToHeightsBuffer = function(coords) {
    this.heightsProcessBuffer = {
        coords:  coords,
        next : this.heightsProcessBuffer
    };
};

MapGeodataBuilder.prototype.removeFromHeightsBuffer = function(item, lastItem) {
    if (!lastItem) {
        this.heightsProcessBuffer = item.next;
        return;
    }

    lastItem.next = item.next;
};

MapGeodataBuilder.prototype.addGroup = function(id) {
    this.groups.push({
        points: [],
        lines: [],
        id: id
    });

    this.currentGroup = this.groups[this.groups.length - 1];

    return this;
};

MapGeodataBuilder.prototype.addPoint = function(point, heightMode, properties, id, srs, directCopy) {
    if (!this.currentGroup) {
        this.addGroup('some-group');
    }

    var floatHeight = (!heightMode || heightMode == "float"), coords;

    var feature = {
        id : id,
        properties : properties
    };

    if (floatHeight) {
        coords = [point[0], point[1], point[2] || 0, feature, null, null ];
        this.addToHeightsBuffer(coords);

        feature.points = [ coords ];
        feature.floatHeights = true;
        feature.srs = srs ? srs : this.navSrs;
        feature.heightsToProcess = 1;
        this.heightsToProcess++;
    } else {
        if (directCopy) {
            feature.points = [ [point[0], point[1], point[2]] ];
        } else {
            feature.points = [ this.physSrs.convertCoordsFrom(point, srs ? srs : this.navSrs) ];
        }
    }

    this.currentGroup.points.push(feature);

    return this;
};

MapGeodataBuilder.prototype.addPointArray = function(points, heightMode, properties, id, srs, directCopy) {
    if (!this.currentGroup) {
        this.addGroup('some-group');
    }

    var floatHeight = (!heightMode || heightMode == "float"), i, li, point, coords;
    srs = srs ? srs : this.navSrs;

    var feature = {
        id : id,
        properties : properties
    };

    var featurePoints = new Array(points.length);

    if (floatHeight) {
        
        for (i = 0, li = points.length; i < li; i++) {
            point = points[i];
            coords = [point[0], point[1], point[2] || 0, feature, null, null ];
            this.addToHeightsBuffer(coords);

            featurePoints[i] = coords;
        }

        feature.floatHeights = true;
        feature.srs = srs;
        feature.heightsToProcess = li;
        this.heightsToProcess++;
    } else {
        if (directCopy) {
            for (i = 0, li = points.length; i < li; i++) {
                point = points[i];
                featurePoints[i] = [point[0], point[1], point[2]];
            }
        } else {
            for (i = 0, li = points.length; i < li; i++) {
                featurePoints[i] = this.physSrs.convertCoordsFrom(points[i], srs);
            }
        }
    }

    feature.points = featurePoints;
    this.currentGroup.points.push(feature);

    return this;
};

MapGeodataBuilder.prototype.addLineString = function(linePoints, heightMode, properties, id, srs, directCopy) {
    if (!this.currentGroup) {
        this.addGroup('some-group');
    }

    var floatHeight = (!heightMode || heightMode == "float"), i, li, point, coords;
    srs = srs ? srs : this.navSrs;

    var feature = {
        id : id,
        properties : properties
    };

    var featurePoints = new Array(linePoints.length);

    if (floatHeight) {
        
        for (i = 0, li = linePoints.length; i < li; i++) {
            point = linePoints[i];
            coords = [point[0], point[1], point[2] || 0, feature, null, null ];
            this.addToHeightsBuffer(coords);

            featurePoints[i] = coords;
        }

        feature.floatHeights = true;
        feature.srs = srs;
        feature.heightsToProcess = li;
        this.heightsToProcess += li;
    } else {
        if (directCopy) {
            for (i = 0, li = linePoints.length; i < li; i++) {
                point = linePoints[i];
                featurePoints[i] = [point[0], point[1], point[2]];
            }
        } else {
            for (i = 0, li = linePoints.length; i < li; i++) {
                featurePoints[i] = this.physSrs.convertCoordsFrom(linePoints[i], srs);
            }
        }
    }

    feature.lines = [featurePoints];
    this.currentGroup.lines.push(feature);

    return this;
};

MapGeodataBuilder.prototype.addLineStringArray = function(lines, heightMode, properties, id, srs, directCopy) {
    if (!this.currentGroup) {
        this.addGroup('some-group');
    }

    var floatHeight = (!heightMode || heightMode == "float");
    var subline, points, i, li, j, lj, point, coords;
    srs = srs ? srs : this.navSrs;

    var feature = {
        id : id,
        properties : properties
    };

    var featureLines = new Array(lines.length);

    if (floatHeight) {
        var totalHeights = 0;
        
        for (i = 0, li = lines.length; i < li; i++) {
            subline = lines[i];
            points = new Array(subline.length);

            for (j = 0, lj = subline.length; j < lj; j++) {
                point = subline[j];
                coords = [point[0], point[1], point[2] || 0, feature, null, null];
                this.addToHeightsBuffer(coords);
                points[j] = coords;
            }

            totalHeights += lj;
            featureLines[i] = points;
        }

        feature.floatHeights = true;
        feature.srs = srs;
        feature.heightsToProcess = totalHeights;
        this.heightsToProcess += totalHeights;
    } else {

        for (i = 0, li = lines.length; i < li; i++) {
            subline = lines[i];
            points = new Array(subline.length);

            if (directCopy) {
                for (i = 0, li = subline.length; i < li; i++) {
                    point = subline[i];
                    featurePoints[i] = [point[0], point[1], point[2]];
                }
            } else {
                for (i = 0, li = subline.length; i < li; i++) {
                    featurePoints[i] = this.physSrs.convertCoordsFrom(subline[i], srs);
                }
            }

            featureLines[i] = points;
        }
    }

    feature.lines = featureLines;
    this.currentGroup.lines.push(feature);

    return this;
};

MapGeodataBuilder.prototype.processHeights = function(heightsSource, precision, onProcessed) {
    if (this.heightsToProcess <= 0) {
        if (onProcessed) {
            onProcessed(this);
        }

        return;
    }

    if (this.processingHeights) {
        this.processHeightsCalls.push(this.processHeights.bind(this, heightsSource, precision));
    }

    this.processingHeights = true;
    this.heightsSource = heightsSource;
    this.heightsLod = precision;

    var item = this.heightsProcessBuffer, lastItem;
    var p, res, nodeOnly, heightsLod, nodeOnly, coords;

    switch (heightsSource) {
        case "node-by-precision":
            nodeOnly = true;
        case "heightmap-by-precision":

            coords = item.coords;

            if (coords[3].srs) {
                p = this.navSrs.convertCoordsFrom(coords, srs);
            } else {
                p = coords;
            }

            heightLod = this.map.measure.getOptimalHeightLodBySampleSize(p, precision);
            break;

        case "node-by-lod":
            nodeOnly = true;
        case "heightmap-by-lod":
            heightsLod = precision;
            break;
    }

    do {
        coords = item.coords;

        if (coords[4] == null) {
            if (coords[3].srs) {
                p = this.navSrs.convertCoordsFrom(coords, coords[3].srs);
            } else {
                p = coords;
            }

            res = this.map.measure.getSpatialDivisionNode(p);

            coords[4] = res[0];
            coords[5] = res[1];
        }

        res = this.map.measure.getSurfaceHeight(coords, heightsLod, null, coords[4], coords[5], null, nodeOnly);

        console.log(JSON.stringify(res));

        if (res[1] || res[2]) { //precisin reached or not aviable
            coords[2] += res[0]; //convet float height to fixed
            this.removeFromHeightsBuffer(item, lastItem);
            coords[3].heightsToProcess--;
            this.heightsToProcess--;

            if (coords[3].heightsToProcess <= 0) { //this prevents multiple conversions
                coords[3].floatHeights = false;
            }

            p = [coords[0], coords[1], coords[2]];
            p = this.physSrs.convertCoordsFrom(p, coords[3].srs);

            coords[0] = p[0];
            coords[1] = p[1];
            coords[2] = p[2];
        }

        lastItem = item;
        item = item.next;

    } while(item);

    if (this.heightsToProcess <= 0) {
        if (this.updateCallback) {
            this.updateCallback(); //remove callback
        }

        this.processingHeights = false;

        if (onProcessed) {
            onProcessed(this);
        }

        if (this.processHeightsCalls.length > 1) {
            (this.processHeightsCalls.shift())();
        }

    } else {
        if (!this.updateCallback) {
            this.updateCallback = this.map.core.on("map-update", this.processHeights.bind(this, this.heightsSource, this.heightsLod, onProcessed));
        }
    }

    //this.heightsToProcess
};

MapGeodataBuilder.prototype.extractGeometry = function(id) {
    var feature, i, li, j, lj, points, lines,
        vertexBuffer, indexBuffer, index, p;


    for (var i = 0, li = this.groups.length; i < li; i++) {
        var group = this.groups[i];

        var groupPoints = group.points;
        var groupLines = group.lines, j, lj;

        //get group bbox
        for (j = 0, lj = groupPoints.length; j < lj; j++) {
            if (groupPoints[j].id == id) {
                feature = groupPoints[j];
            }
        }

        for (j = 0, lj = groupLines.length; j < lj; j++) {
            if (groupLines[j].id == id) {
                feature = groupLines[j];
            }
        }
    }

    if (feature) {
        if (feature.points) {

            points = feature.points;

            if (points.length > 0) {
                vertexBuffer = new Float64Array(points.length * 3);

                for (i = 0, li = points.length; i < li; i++) {
                    index = i * 3;
                    p = points[i];
                    vertexBuffer[index] = p[0];
                    vertexBuffer[index+1] = p[1];
                    vertexBuffer[index+2] = p[2];
                }
            }

            return new MapGeodataGeometry(this.map, {'type': 'point-geometry', 'id':feature.id, 'geometryBuffer': vertexBuffer });

        } else if (feature.lines) {

            lines = feature.lines;

            if (lines.length > 0) {
                
                var totalPoints = 0;

                for (i = 0, li = lines.length; i < li; i++) {
                    totalPoints += lines[i].length;
                }

                vertexBuffer = new Float64Array(totalPoints * 3);
                indexBuffer = new Uint32Array(li);
                index = 0;

                for (i = 0, li = lines.length; i < li; i++) {

                    var points = lines[i];

                    for (j = 0, lj = points.length; j < lj; j++) {
                        p = points[j];
                        vertexBuffer[index] = p[0];
                        vertexBuffer[index+1] = p[1];
                        vertexBuffer[index+2] = p[2];
                        index += 3;
                    }
                }
            }

            return new MapGeodataGeometry(this.map, {'type': 'line-geometry', 'id':feature.id, 'geometryBuffer': vertexBuffer, 'indicesBuffer': indexBuffer });
        }

        return;
    }

};

MapGeodataBuilder.prototype.compileGroup = function(group, resolution) {
    var bboxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    var bboxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
    var geodataGroup = {};
    var groupPoints = group.points, points, p, feature, finalFeature;
    var groupLines = group.lines, lines, line, i, li, j, lj, k, lk;

    //get group bbox
    for (i = 0, li = groupPoints.length; i < li; i++) {
        points = groupPoints[i].points;

        for (j = 0, lj = points.length; j < lj; j++) {
            p = points[j];

            if (p[0] > bboxMax[0]) { bboxMax[0] = p[0]; }
            if (p[1] > bboxMax[1]) { bboxMax[1] = p[1]; }
            if (p[2] > bboxMax[2]) { bboxMax[2] = p[2]; }

            if (p[0] < bboxMin[0]) { bboxMin[0] = p[0]; }
            if (p[1] < bboxMin[1]) { bboxMin[1] = p[1]; }
            if (p[2] < bboxMin[2]) { bboxMin[2] = p[2]; }
        }
    }

    for (i = 0, li = groupLines.length; i < li; i++) {
        lines = groupLines[i].lines;

        for (j = 0, lj = lines.length; j < lj; j++) {
            line = lines[j];

            for (k = 0, lk = line.length; k < lk; k++) {
                p = line[k];

                if (p[0] > bboxMax[0]) { bboxMax[0] = p[0]; }
                if (p[1] > bboxMax[1]) { bboxMax[1] = p[1]; }
                if (p[2] > bboxMax[2]) { bboxMax[2] = p[2]; }

                if (p[0] < bboxMin[0]) { bboxMin[0] = p[0]; }
                if (p[1] < bboxMin[1]) { bboxMin[1] = p[1]; }
                if (p[2] < bboxMin[2]) { bboxMin[2] = p[2]; }
            }
        }
    }

    if (!resolution) {
        var maxDelta = Math.max((bboxMax[0] - bboxMin[0]) + 1, (bboxMax[1] - bboxMin[1]) + 1, (bboxMax[2] - bboxMin[2]) + 1);

        //25cm resolution
        resolution = maxDelta / 0.25;
        resolution = Math.max(resolution, 1024);
        resolution = Math.min(resolution, (2<<20));
    }

    geodataGroup.resolution = resolution;

    //process coords to resolution
    var bboxScaleFactor = [resolution/((bboxMax[0] - bboxMin[0]) + 1),
                           resolution/((bboxMax[1] - bboxMin[1]) + 1),
                           resolution/((bboxMax[2] - bboxMin[2]) + 1)];

    geodataGroup.points = new Array(groupPoints.length);

    for (i = 0, li = groupPoints.length; i < li; i++) {
        feature = groupPoints[i]; 
        points = feature.points;

        var finalPoints = new Array(points.length);

        for (j = 0, lj = points.length; j < lj; j++) {
            p = points[j];

            finalPoints[j] = [ Math.round((p[0] - bboxMin[0]) * bboxScaleFactor[0]),
                               Math.round((p[1] - bboxMin[1]) * bboxScaleFactor[1]),
                               Math.round((p[2] - bboxMin[2]) * bboxScaleFactor[2]) ];
        }

        finalFeature = {
            points : finalPoints
        };

        if (feature.id) {
            finalFeature.id = feature.id;
        }

        if (feature.properties) {
            finalFeature.properties = feature.properties;
        }

        geodataGroup.points[i] = finalFeature;
    }

    geodataGroup.lines = new Array(groupLines.length);

    for (i = 0, li = groupLines.length; i < li; i++) {
        feature = groupLines[i]; 
        lines = feature.lines;

        var finalLines = new Array(lines.length);

        for (j = 0, lj = lines.length; j < lj; j++) {
            line = lines[j];

            finalPoints = new Array(line.length);

            for (k = 0, lk = line.length; k < lk; k++) {
                p = line[k];

                finalPoints[k] = [ Math.round((p[0] - bboxMin[0]) * bboxScaleFactor[0]),
                                   Math.round((p[1] - bboxMin[1]) * bboxScaleFactor[1]),
                                   Math.round((p[2] - bboxMin[2]) * bboxScaleFactor[2]) ];
            }

            finalLines[j] = finalPoints;
        }

        finalFeature = {
            lines : finalLines
        };

        if (feature.id) {
            finalFeature.id = feature.id;
        }

        if (feature.properties) {
            finalFeature.properties = feature.properties;
        }

        geodataGroup.lines[i] = finalFeature;
    }

    geodataGroup.bbox = [ bboxMin, bboxMax ];

    if (bboxMax[0] > this.bboxMax[0]) { this.bboxMax[0] = bboxMax[0]; }
    if (bboxMax[1] > this.bboxMax[1]) { this.bboxMax[1] = bboxMax[1]; }
    if (bboxMax[2] > this.bboxMax[2]) { this.bboxMax[2] = bboxMax[2]; }

    if (bboxMin[0] < this.bboxMin[0]) { this.bboxMin[0] = bboxMin[0]; }
    if (bboxMin[1] < this.bboxMin[1]) { this.bboxMin[1] = bboxMin[1]; }
    if (bboxMin[2] < this.bboxMin[2]) { this.bboxMin[2] = bboxMin[2]; }

    return geodataGroup;
};

MapGeodataBuilder.prototype.makeGeodata = function(resolution) {
    this.bboxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    this.bboxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

    var geodata = {
        "version" : 1,
        "groups" : []
    }

    for (var i = 0, li = this.groups.length; i < li; i++) {
        geodata["groups"].push(this.compileGroup(this.groups[i], resolution));
    }

    return geodata;
};

MapGeodataBuilder.prototype.makeFreeLayer = function(style, resolution) {
    var geodata = this.makeGeodata(resolution);

    if (!style) {
        style = {
            "layers" : {
                "my-lines" : {
                    "filter" : ["==", "#type", "line"],
                    "line": true,
                    "line-width" : 4,
                    "line-color": [255,0,255,255],
                    "zbuffer-offset" : [-5,0,0]
                },
                "my-points" : {
                    "filter" : ["==", "#type", "point"],
                    "point": true,
                    "point-radius" : 10,
                    "point-color": [0,0,255,255],
                    "zbuffer-offset" : [-5,0,0]
                }
            }
        }        
    }

    var freeLayer = {
            'credits' : [],
            'displaySize' : 1024,
            'extents' : {
                'll' : this.bboxMin,
                'ur' : this.bboxMax
            },
            'geodata' : geodata,
            'style' : style,
            'type' : 'geodata'
        };

    return freeLayer;        
};

export default MapGeodataBuilder;


