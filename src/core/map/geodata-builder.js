
import MapGeodataGeometry_ from './geodata-geometry';
import MapGeodataImportGeoJSON_ from './geodata-import/geojson';
import MapGeodataImportVTSGeodata_ from './geodata-import/vts-geodata';

//get rid of compiler mess
var MapGeodataGeometry = MapGeodataGeometry_;
var MapGeodataImportGeoJSON = MapGeodataImportGeoJSON_;
var MapGeodataImportVTSGeodata = MapGeodataImportVTSGeodata_;


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
    this.heightsProcessBufferFirst = null;
    this.heightsProcessBufferLast = null;

    this.heightsLod = 8;
    this.heightsSource = "heightmap-by-precision";
    this.updateCallback = null;
    this.processingHeights = false;
    this.processHeightsCalls = [];
};


MapGeodataBuilder.prototype.addToHeightsBuffer = function(coords) {

    var item = { coords: coords, prev: null, next: this.heightsProcessBufferFirst };

    if (this.heightsProcessBufferFirst != null) {
        this.heightsProcessBufferFirst.prev = item;
    }

    //add item as first in list
    this.heightsProcessBufferFirst = item;

    if (this.heightsProcessBufferLast == null) {
        this.heightsProcessBufferLast = item;
    }
};


MapGeodataBuilder.prototype.removeFromHeightsBuffer = function(item) {
    var hit = false;

    if (item == this.heightsProcessBufferFirst) {
        this.heightsProcessBufferFirst = item.next;
        hit = true;

        if (this.heightsProcessBufferFirst != null) {
            this.heightsProcessBufferFirst.prev = null;
        }
    }

    if (item == this.heightsProcessBufferLast) {
        this.heightsProcessBufferLast = item.prev;
        hit = true;

        if (this.heightsProcessBufferLast != null) {
            this.heightsProcessBufferLast.next = null;
        }
    }

    if (!hit) {
        if (!item.prev) {
            //debugger;
        } else {
            item.prev.next = item.next;
        }
        
        if (!item.next) {
            //debugger;
        } else {
            item.next.prev = item.prev;
        }
    }
};


MapGeodataBuilder.prototype.addGroup = function(id) {
    this.groups.push({
        points: [],
        lines: [],
        polygons: [],
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
                for (j = 0, lj = subline.length; j < lj; j++) {
                    point = subline[j];
                    points[j] = [point[0], point[1], point[2]];
                }
            } else {
                for (j = 0, lj = subline.length; j < lj; j++) {
                    points[j] = this.physSrs.convertCoordsFrom(subline[j], srs);
                }
            }

            featureLines[i] = points;
        }
    }

    feature.lines = featureLines;
    this.currentGroup.lines.push(feature);

    return this;
};


MapGeodataBuilder.prototype.addPolygon = function(shape, holes, middle, heightMode, properties, id, srs) {
    srs = srs ? srs : this.navSrs.srsProj4;
    holes = holes || [];

    var flatShape = shape, flatHoles = holes, i, li, j, k, lk, l, hole, coords, proj, holesIndices, vertices;

    //convert shape and holes to flat space
    if (srs.indexOf('+proj=longlat') != -1) {
        proj = this.map.proj4(srs, '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
    }

    var totalPoints = shape.length*3;

    for (i = 0, li = holes.length; i < li; i++) {
        totalPoints += holes[i].length*3;
    }

    flatShape = new Array(totalPoints);
    vertices = new Array(totalPoints);
    j = 0;

    var borders = new Array(holes.length + 1);
    var border = new Array(shape.length);
    borders[0] = border;

    for (i = 0, li = shape.length; i < li; i++) {
        border[i] = i;
        coords = shape[i];
        vertices[j] = coords[0]; 
        vertices[j+1] = coords[1]; 
        vertices[j+2] = coords[2]; 
        coords = proj ? proj.forward(shape[i]) : shape[i];
        flatShape[j] = coords[0]; 
        flatShape[j+1] = coords[1]; 
        flatShape[j+2] = coords[2]; 
        j+=3;
    }

    flatHoles = new Array(holes.length);
    holesIndices = new Array(holes.length);

    for (i = 0, li = holes.length; i < li; i++) {
        hole = holes[i];
        holesIndices[i] = Math.round(j/3);

        border = new Array(hole.length);
        borders[i + 1] = border;

        l = Math.floor(j /3);

        for (k = 0, lk = hole.length; k < lk; k++) {
            coords = hole[k];
            vertices[j] = coords[0]; 
            vertices[j+1] = coords[1]; 
            vertices[j+2] = coords[2]; 
            coords = proj ? proj.forward(hole[k]) : hole[k];
            flatShape[j] = coords[0]; 
            flatShape[j+1] = coords[1]; 
            flatShape[j+2] = coords[2]; 
            j+=3;
            border[k] = l++;
        }
    }

    var surface = vts.earcut(flatShape, holesIndices, 3);

    this.addPolygonRAW(vertices, surface, borders, middle, heightMode, properties, id, srs);

    return this;
};

MapGeodataBuilder.prototype.addTerrainPolygon = function(shape, holes, middle, density, heightMode, properties, id, srs) {
};

MapGeodataBuilder.prototype.addPolygonRAW = function(vertices, surface, borders, middle, heightMode, properties, id, srs, directCopy) {
    if (!this.currentGroup) {
        this.addGroup('some-group');
    }

    var floatHeight = (!heightMode || heightMode == "float");
    var i, li, j = 0, coords;
    srs = srs ? srs : this.navSrs;

    var feature = {
        id : id,
        properties : properties
    };

    var featureVertices = new Array(Math.round(vertices.length/3));

    if (floatHeight) {
        for (i = 0, li = vertices.length; i < li; i+=3) {
            coords = [vertices[i], vertices[i+1], vertices[i+2], feature, null, null];
            this.addToHeightsBuffer(coords);
            featureVertices[j++] = coords;
        }

        feature.floatHeights = true;
        feature.srs = srs;
        feature.heightsToProcess = featureVertices.length;
        this.heightsToProcess += featureVertices.length;
    } else {

        for (i = 0, li = vertices.length; i < li; i++) {
            coords = [vertices[i], vertices[i+1], vertices[i+2]];

            if (directCopy) {
                featureVertices[j++] = coords;
            } else {
                featureVertices[j++] = this.physSrs.convertCoordsFrom(coords, srs);
            }
        }
    }

    var featureSurface = surface.slice();
    var featureBorders = new Array(borders.length);

    for (i = 0, li = borders.length; i < li; i++) {
        featureBorders[i] = borders[i].slice();
    }

    feature.vertices = featureVertices;
    feature.surface = featureSurface;
    feature.borders = featureBorders;
    this.currentGroup.polygons.push(feature);

    return this;
};


MapGeodataBuilder.prototype.importVTSGeodata = function(json, groupIdPrefix, dontCreateGroups) {
    var importer = new MapGeodataImportVTSGeodata(this, groupIdPrefix, dontCreateGroups);
    return importer.processJSON(json);
};


MapGeodataBuilder.prototype.importGeoJson = function(json, heightMode, srs, groupIdPrefix, dontCreateGroups) {
    var importer = new MapGeodataImportGeoJSON(this, heightMode, srs, groupIdPrefix, dontCreateGroups);
    return importer.processJSON(json);
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

    var item = this.heightsProcessBufferFirst, lastItem;
    //var item = this.heightsProcessBuffer, lastItem;
    var p, res, nodeOnly, heightsLod, nodeOnly, coords;

    switch (heightsSource) {
        case "node-by-precision":
            nodeOnly = true;
        case "heightmap-by-precision":

            coords = item.coords;

            if (coords[3].srs) {
                p = this.navSrs.convertCoordsFrom(coords, coords[3].srs);
            } else {
                p = coords;
            }

            heightsLod = this.map.measure.getOptimalHeightLodBySampleSize(p, precision);
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

            //coords[4] = p;
        }

        res = this.map.measure.getSurfaceHeight(coords, heightsLod, null, coords[4], coords[5], null, nodeOnly);
        //res = this.map.measure.getSurfaceHeight(coords[4], heightsLod, null, null, null, null, nodeOnly);

        //console.log(JSON.stringify(res));

        //if (res[1] || res[2]) { //precisin reached or not aviable
            //res = this.map.measure.getSurfaceHeight(coords[4], heightsLod, null, null, null, null, nodeOnly);
            //res = this.map.measure.getSurfaceHeight(coords, heightsLod, null, coords[4], coords[5], null, nodeOnly);
        //}

        if (res[1] || res[2]) { //precision reached or not aviable

            //console.log(JSON.stringify(res));

            coords[2] += res[0]; //convet float height to fixed
            this.removeFromHeightsBuffer(item, lastItem);
            coords[3].heightsToProcess--;
            this.heightsToProcess--;

            if (coords[3].heightsToProcess <= 0) { //this prevents multiple conversions
                coords[3].floatHeights = false;
            }

            p = [coords[0], coords[1], coords[2]];

            //console.log(JSON.stringify(p) + "  srs  " + coords[3].srs);

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
    var groupPolygons = group.polygons, borders;

    geodataGroup.id = group.id;

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

    for (i = 0, li = groupPolygons.length; i < li; i++) {
        points = groupPolygons[i].vertices;

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


    geodataGroup.polygons = new Array(groupPolygons.length);

    for (i = 0, li = groupPolygons.length; i < li; i++) {
        feature = groupPolygons[i]; 
        points = feature.vertices;

        var finalVertices = new Array(points.length);
        k = 0;

        for (j = 0, lj = points.length; j < lj; j++) {
            p = points[j];
            finalVertices[k++] = Math.round((p[0] - bboxMin[0]) * bboxScaleFactor[0]);
            finalVertices[k++] = Math.round((p[1] - bboxMin[1]) * bboxScaleFactor[1]);
            finalVertices[k++] = Math.round((p[2] - bboxMin[2]) * bboxScaleFactor[2]);
        }

        finalFeature = {
            vertices : finalVertices,
            surface : feature.surface.slice()
        };

        borders = feature.borders;
        var finalBorders = new Array(borders.length);

        for (j = 0, lj = finalBorders.length; j < lj; j++) {
            finalBorders[j] = borders[j].slice();
        }

        finalFeature.borders = finalBorders;

        if (feature.id) {
            finalFeature.id = feature.id;
        }

        if (feature.properties) {
            finalFeature.properties = feature.properties;
        }

        geodataGroup.polygons[i] = finalFeature;
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


