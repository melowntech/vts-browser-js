
import {vec3 as vec3_} from '../utils/matrix';
import {math as math_} from '../utils/math';

//get rid of compiler mess
var vec3 = vec3_;
var math = math_;


var MapGeodataBuilder = function() {
    this.map = map;
    this.groups = [];
    this.currentGroup = null;
    this.bboxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    this.bboxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
};

MapGeodataBuilder.prototype.addGroup = function(id) {
    this.groups.push({
        points: [],
        lines: [],
        id: id
    });

    this.currentGroup = this.groups[this.groups.length - 1];
};

MapGeodataBuilder.prototype.addPoint = function(point, properties, id) {
    this.currentGroup.points.push({
        id : id,
        points : [point],
        properties : properties
    });
};

MapGeodataBuilder.prototype.addPointArray = function(points, properties, id) {
    this.currentGroup.points.push({
        id : id,
        points : points,
        properties : properties
    });
};

MapGeodataBuilder.prototype.addLineString = function(linePoints, properties, id) {
    this.currentGroup.lines.push({
        id : id,
        lines : [linePoints],
        properties : properties
    });
};

MapGeodataBuilder.prototype.addLineStringArray = function(lines, properties, id) {
    this.currentGroup.lines.push({
        id : id,
        lines : lines,
        properties : properties
    });
};

MapGeodataBuilder.prototype.compileGroup = function(group) {
    bboxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    bboxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

    var geodataGroup = {};
    var points = this.points, p;
    var lines = this.lines, line, i, li, j, lj;

    //get group bbox
    for (i = 0, li = points.length; i < li; i++) {
        p = points[i];

        if (p[0] > bbopxMax[0]) { bboxMax[0] = p[0]; }
        if (p[1] > bboxMax[1]) { bboxMax[1] = p[1]; }
        if (p[2] > bboxMax[2]) { bboxMax[2] = p[2]; }

        if (p[0] < bboxMin[0]) { bboxMin[0] = p[0]; }
        if (p[1] < bboxMin[1]) { bboxMin[1] = p[1]; }
        if (p[2] < bboxMin[2]) { bboxMin[2] = p[2]; }
    }

    for (i = 0, li = lines.length; i < li; i++) {
        line = lines[i];

        for (ji = 0, lj = line.length; j < lj; j++) {
            p = line[j];

            if (p[0] > bboxMax[0]) { bboxMax[0] = p[0]; }
            if (p[1] > bboxMax[1]) { bboxMax[1] = p[1]; }
            if (p[2] > bboxMax[2]) { bboxMax[2] = p[2]; }

            if (p[0] < bboxMin[0]) { bboxMin[0] = p[0]; }
            if (p[1] < bboxMin[1]) { bboxMin[1] = p[1]; }
            if (p[2] < bboxMin[2]) { bboxMin[2] = p[2]; }
        }
    }

    //process coords to resolution
    bboxScaleFactor = [resolution/((bboxMax[0] - bboxMin[0]) + 1),
                       resolution/((bboxMax[1] - bboxMin[1]) + 1),
                       resolution/((bboxMax[2] - bboxMin[2]) + 1)];

    if (!resolution) {
        var maxDelta = Math.max((bboxMax[0] - bboxMin[0]) + 1, (bboxMax[1] - bboxMin[1]) + 1, (bboxMax[2] - bboxMin[2]) + 1));

        //25cm resolution
        resolution = maxDelta / 0.25;
        resolution = Math.max(resolution, 1024);
        resolution = Math.min(resolution, (2<<20));
    }

    geodataGroup.resolution = resolution;

    var finalPoints = new Array(points.length);

    for (i = 0, li = points.length; i < li; i++) {
        p = points[i];

        finalPoints[i] = [ Math.round((p[0] - bboxMin[0]) * bboxScaleFactor[0]),
                           Math.round((p[1] - bboxMin[1]) * bboxScaleFactor[1]),
                           Math.round((p[2] - bboxMin[2]) * bboxScaleFactor[2]) ];
    }

    geodataGroup.points = finalPoints;

    var finalLines = new Array(lines.length);

    for (i = 0, li = lines.length; i < li; i++) {
        line = lines[i];

        finalPoints = new Array(line.length);

        for (ji = 0, lj = line.length; j < lj; j++) {
            p = line[j];

            finalPoints[i] = [ Math.round((p[0] - bboxMin[0]) * bboxScaleFactor[0]),
                               Math.round((p[1] - bboxMin[1]) * bboxScaleFactor[1]),
                               Math.round((p[2] - bboxMin[2]) * bboxScaleFactor[2]) ];
        }
    }

    geodataGroup.lines = finalLines;
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
};

MapGeodataBuilder.prototype.makeFreeLayer = function(id, style, resolution) {
    var geodata = this.makeGeodata(resolution);

};

export default MapGeodataBuilder;


