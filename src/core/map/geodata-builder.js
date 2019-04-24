
import MapGeodataGeometry_ from './geodata-geometry';
import MapGeodataImportGeoJSON_ from './geodata-import/geojson';
import MapGeodataImportVTSGeodata_ from './geodata-import/vts-geodata';
//import GeographicLib_ from 'geographiclib';
import {vec3 as vec3_, mat4 as mat4_,} from '../utils/matrix';

//get rid of compiler mess
var MapGeodataGeometry = MapGeodataGeometry_;
var MapGeodataImportGeoJSON = MapGeodataImportGeoJSON_;
var MapGeodataImportVTSGeodata = MapGeodataImportVTSGeodata_;
//var GeographicLib = GeographicLib_;
var vec3 = vec3_;
var mat4 = mat4_;


var MapGeodataBuilder = function(map) {
    this.map = map;
    this.groups = [];
    this.currentGroup = null;
    this.bboxMin = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
    this.bboxMax = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];

    this.navSrs = this.map.getNavigationSrs();
    //this.navSrs = this.map.getPublicSrs();
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


MapGeodataBuilder.prototype.getPolygonCenter = function(shape, projected, proj) {
    if (shape && !shape.length) {
        return [0,0];
    }

    var sumX = 0, sumY = 0, sumZ = 0; //, convertLong = false;

    if (projected) {
        for (var i = 0, li = shape.length; i < li; i++) {
            var coords = shape[i];
            sumX += coords[0];
            sumY += coords[1];
            sumZ += coords[2];
        }

        return [sumX / li, sumY / li, sumZ / li];
    } else {
        for (var i = 0, li = shape.length; i < li; i++) {
            var coords = shape[i];

            coords = proj.forward(coords);
            sumX += coords[0];
            sumY += coords[1];
            sumZ += coords[2];

            //if (Math.abs(Math.abs(coords[0])-180) < 0.001) {
              //  convertLong = true;
            //}

            /*
            var lng = coords[0] * Math.PI / 180; //deg to rad
            var lat = coords[1] * Math.PI / 180;

            // sum of cartesian coordinates
            sumX += Math.cos(lat) * Math.cos(lng);
            sumY += Math.cos(lat) * Math.sin(lng);
            sumZ += Math.sin(lat);
            */
        }

        var avgX = sumX / li;
        var avgY = sumY / li;
        var avgZ = sumZ / li;

        // convert average x, y, z coordinate to latitude and longtitude
        /*
        var lng = Math.atan2(avgY, avgX);
        var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
        var lat = Math.atan2(avgZ, hyp);

        return [lng * 180 / Math.PI, lat *  180 / Math.PI, avgZ]; //rad to deg
        */

        coords = proj.inverse([avgX, avgY, avgZ]);

        return [coords[0], coords[1], 0];
    }
};

//same as addPolygon but works on poles
MapGeodataBuilder.prototype.addPolygon2 = function(shape, holes, middle, heightMode, properties, id, srs) {
    srs = srs ? srs : this.navSrs.srsProj4;
    holes = holes || [];

    var flatShape = shape, flatHoles = holes, i, li, j, k, lk, l, hole, coords, proj, holesIndices, vertices;
    var projected = true;

    //convert shape and holes to flat space
    if (srs.indexOf('+proj=longlat') != -1) {
        projected = false;
        //proj = this.map.proj4(srs, '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
        //proj = this.map.proj4(srs, '+proj=merc +lat_ts=' + center[1] + ' +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
        proj = this.map.proj4(srs, '+proj=geocent +datum=WGS84 +units=m +no_defs');
    }

    var c = document.getElementById("dbg-canvas");
    var ctx = c.getContext("2d");
    var sx = 300;
    var fx = 300 / 7500000;

    var center = this.getPolygonCenter(shape, projected, proj), north, east, dir;

    this.addPoint(center, 'fix', {}, 'aaa');

//    var ned = this.map.measure.getNewNED(center, true);
    var ned = this.map.measure.getNewNED(center);

    dir = ned.direction;
    north = ned.north;
    east = ned.east;

    //var center2 = proj.forward(center);

    coords = proj.forward(center);
    var coords2 = [coords[0]+1000000*east[0], coords[1]+1000000*east[1], coords[2]+1000000*east[2]];

    this.addLineString([coords, coords2], 'fix', {}, 'line', null, true);
    var coords2 = [coords[0]+1000000*dir[0], coords[1]+1000000*dir[1], coords[2]+1000000*dir[2]];

    this.addLineString([coords, coords2], 'fix', {}, 'line', null, true);
    var coords2 = [coords[0]+1000000*north[0], coords[1]+1000000*north[1], coords[2]+1000000*north[2]];


    this.addLineString([coords, coords2], 'fix', {}, 'line', null, true);
    //ned = this.map.measure.getNewNED(center, true);

    if (!projected) {
        var pos = this.map.getPosition();
        pos.setCoords(center);
        pos.setOrientation([0,0,-90]);
        var ret = this.map.measure.getPositionCameraInfo(pos, false, false);
        ned = ret.rotMatrix;

        mat4.inverse(ned);
        dir = [ned[2], ned[6], ned[10]];
        north = [ned[1], ned[5], ned[9]];
        east = [ned[0], ned[4], ned[8]];
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

        if (proj) {
            coords = proj.forward(shape[i]);
            //coords[0] -= center2[0];
            //coords[1] -= center2[1];
            //coords[2] -= center2[2];
            coords[0] = east[0] * coords[0] + east[1] * coords[1] + east[2] * coords[2];
            coords[1] = dir[0] * coords[0] + dir[1] * coords[1] + dir[2] * coords[2];
            coords[2] = 0;
        } else {
            coords = shape[i];
        }

        if (i ==0) {
            ctx.moveTo(coords[0]*fx+sx,coords[1]*fx+sx);
        } else {
            ctx.lineTo(coords[0]*fx+sx,coords[1]*fx+sx);
        }

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

            if (proj) {
                coords = proj.forward(hole[k]);
                coords[0] = east[0] * coords[0] + east[1] * coords[1] + east[2] * coords[2];
                coords[1] = dir[0] * coords[0] + dir[1] * coords[1] + dir[2] * coords[2];
                coords[2] = 0;
            } else {
                coords = hole[k];
            }

            if (k ==0) {
                ctx.moveTo(coords[0]*fx+sx,coords[1]*fx+sx);
            } else {
                ctx.lineTo(coords[0]*fx+sx,coords[1]*fx+sx);
            }


            flatShape[j] = coords[0]; 
            flatShape[j+1] = coords[1]; 
            flatShape[j+2] = coords[2]; 
            j+=3;
            border[k] = l++;
        }
    }

    ctx.strokeStyle = "#ff0000";
    ctx.stroke();


    var surface = vts.earcut(flatShape, holesIndices, 3);

    this.addPolygonRAW(vertices, surface, borders, middle, heightMode, properties, id, srs);

    return this;
};


MapGeodataBuilder.prototype.insidePolygon = function(point, vertices, verticesLength) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vertices.length - 1, li = (verticesLength || vertices.length); i < li; j = i++) {
        var xi = vertices[i*3], yi = vertices[i*3+1];
        var xj = vertices[j*3], yj = vertices[j*3+1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};    

//same as addPolygon but works on poles and is subivided
MapGeodataBuilder.prototype.addPolygon3 = function(shape, holes, middle, heightMode, properties, id, srs) {
    srs = srs ? srs : this.navSrs.srsProj4;
    holes = holes || [];

    var flatShape = shape, flatHoles = holes, i, li, j, lj, k, lk, l, hole, coords, proj, holesIndices, vertices;
    var projected = true, dx, dy, dd, maxDistance = 0, maxDistanceCoords, flatCenter, trueHolesCount = holes.length;
    var density = 19;

    //convert shape and holes to flat space
    if (srs.indexOf('+proj=longlat') != -1) {
        projected = false;
        proj = this.map.proj4(srs, '+proj=geocent +datum=WGS84 +units=m +no_defs');
    }

    var center = this.getPolygonCenter(shape, projected, proj), north, east, dir;

    if (!projected) {
        var pos = this.map.getPosition();
        pos.setCoords(center);
        pos.setOrientation([0,0,-90]);
        var ret = this.map.measure.getPositionCameraInfo(pos, false, false);
        var ned = ret.rotMatrix;

        mat4.inverse(ned);
        dir = [ned[2], ned[6], ned[10]];
        north = [ned[1], ned[5], ned[9]];
        east = [ned[0], ned[4], ned[8]];
    }


    var center2 = proj.forward(center);
    center2[0] = east[0] * center2[0] + east[1] * center2[1] + east[2] * center2[2];
    center2[1] = dir[0] * center2[0] + dir[1] * center2[1] + dir[2] * center2[2];
    center2[2] = 0;

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

    if (proj) {
        coords = proj.forward(center);
        coords[0] = east[0] * coords[0] + east[1] * coords[1] + east[2] * coords[2];
        coords[1] = north[0] * coords[0] + north[1] * coords[1] + north[2] * coords[2];
        coords[2] = 0;
        flatCenter = coords;
    }

    for (i = 0, li = shape.length; i < li; i++) {
        border[i] = i;
        coords = shape[i];
        vertices[j] = coords[0]; 
        vertices[j+1] = coords[1]; 
        vertices[j+2] = coords[2];

        if (proj) {
            coords = proj.forward(shape[i]);
            coords[0] = east[0] * coords[0] + east[1] * coords[1] + east[2] * coords[2];
            coords[1] = dir[0] * coords[0] + dir[1] * coords[1] + dir[2] * coords[2];
            coords[2] = 0;
        } else {
            coords = shape[i];
        }

        dx = coords[0] - center2[0];
        dy = coords[1] - center2[1];
        dd = dx * dx + dy * dy;
        if (dd > maxDistance) {
            maxDistance = dd;
            maxDistanceCoords = shape[i]
        }

        flatShape[j] = coords[0]; 
        flatShape[j+1] = coords[1]; 
        flatShape[j+2] = coords[2]; 
        j+=3;
    }

    //check curve orientation (have to be clockwise)
    var angle = 0, x1, y1, x2, y2, index;
    for (i = 0, li = shape.length * 3; i < li; i+=3) {
        x1 = flatShape[i]; 
        y1 = flatShape[i+1]; 

        if (i < li - 3) {
            x2 = flatShape[i+3]; 
            y2 = flatShape[i+4]; 
        } else {
            x2 = flatShape[0]; 
            y2 = flatShape[1]; 
        }

        //angle += (x2 - x1) * (y2 + y1);
        angle += (x1 * y2);
        angle -= (x2 * y1);
    }    
    
    if (angle < 0) { //convert to clokwise
        var vertices2 = vertices.slice();
        var flatShape2 = flatShape.slice();

        for (i = 0, li = shape.length * 3; i < li; i+=3) {
            vertices[i] = vertices2[li - i - 3];
            vertices[i+1] = vertices2[li - i - 2];
            vertices[i+2] = vertices2[li - i - 1];

            flatShape[i] = flatShape2[li - i - 3];
            flatShape[i+1] = flatShape2[li - i - 2];
            flatShape[i+2] = flatShape2[li - i - 1];
        }
    }


    flatHoles = new Array(holes.length);
    holesIndices = new Array(holes.length);

    for (i = 0, li = holes.length; i < li; i++) {
        hole = holes[i];
        index = Math.round(j/3);
        holesIndices[i] = index;

        if (i < trueHolesCount) {
            border = new Array(hole.length);
            borders[i + 1] = border;
        }

        l = index;

        for (k = 0, lk = hole.length; k < lk; k++) {
            coords = hole[k];
            vertices[j] = coords[0]; 
            vertices[j+1] = coords[1]; 
            vertices[j+2] = coords[2]; 

            if (proj) {
                coords = proj.forward(hole[k]);
                coords[0] = east[0] * coords[0] + east[1] * coords[1] + east[2] * coords[2];
                coords[1] = dir[0] * coords[0] + dir[1] * coords[1] + dir[2] * coords[2];
                coords[2] = 0;
            } else {
                coords = hole[k];
            }

            flatShape[j] = coords[0]; 
            flatShape[j+1] = coords[1]; 
            flatShape[j+2] = coords[2]; 
            j+=3;

            if (i < trueHolesCount) {
                border[k] = l;
                l++;
            }
        }

        //check curve orientation (have to be clockwise)
        angle = 0;
        index *= 3;
        for (k = 0, lk = hole.length * 3; k < lk; k+=3) {
            x1 = flatShape[index + k]; 
            y1 = flatShape[index + k+1]; 

            if (k < lk - 3) {
                x2 = flatShape[index + k+3]; 
                y2 = flatShape[index + k+4]; 
            } else {
                x2 = flatShape[index + 0]; 
                y2 = flatShape[index + 1]; 
            }

            //angle += (x2 - x1) * (y2 + y1);
            angle += (x1 * y2);
            angle -= (x2 * y1);
        }    
        
        if (angle > 0) { //convert to clokwise
            var vertices2 = vertices.slice();
            var flatShape2 = flatShape.slice();

            for (k = 0, lk = hole.length * 3; k < lk; k+=3) {
                vertices[index + k] = vertices2[index + lk - k - 3];
                vertices[index + k+1] = vertices2[index + lk - k - 2];
                vertices[index + k+2] = vertices2[index + lk - k - 1];

                flatShape[index + k] = flatShape2[index + lk - k - 3];
                flatShape[index + k+1] = flatShape2[index + lk - k - 2];
                flatShape[index + k+2] = flatShape2[index + lk - k - 1];
            }
        }

    }

    var surface = vts.earcut(flatShape, holesIndices, 3);

    var maxFaceLength = Math.sqrt(maxDistance) / density;
    var v1, v2, v3, p1, p2, p3, p4, p5, p6;

    /*
    for (k = 0; k < 5; k++) {

        var vertices2 = new Array(vertices.length * 2);
        var surface2 = new Array(surface.length * 4);

        j = vertices.length
        l = 0;

        for (i = 0, li = vertices.length; i < li; i +=3) {
            vertices2[i] = vertices[i];
            vertices2[i+1] = vertices[i+1];
            vertices2[i+2] = vertices[i+2];
        }

        for (i = 0, li = surface.length; i < li; i +=3) {
            v1 = surface[i];
            v2 = surface[i+1];
            v3 = surface[i+2];

            p1 = [vertices[v1*3], vertices[v1*3+1], vertices[v1*3+2]];
            p2 = [vertices[v2*3], vertices[v2*3+1], vertices[v2*3+2]];
            p3 = [vertices[v3*3], vertices[v3*3+1], vertices[v3*3+2]];
            p1 = proj.forward(p1);
            p2 = proj.forward(p2);
            p3 = proj.forward(p3);

            p4 = [(p1[0]+p2[0])*0.5, (p1[1]+p2[1])*0.5, (p1[2]+p2[2])*0.5];
            p5 = [(p2[0]+p3[0])*0.5, (p2[1]+p3[1])*0.5, (p2[2]+p3[2])*0.5];
            p6 = [(p3[0]+p1[0])*0.5, (p3[1]+p1[1])*0.5, (p3[2]+p1[2])*0.5];
            p4 = proj.inverse(p4); p4[2] = (vertices[v1*3+2]+vertices[v2*3+2])*0.5;
            p5 = proj.inverse(p5); p5[2] = (vertices[v2*3+2]+vertices[v3*3+2])*0.5;
            p6 = proj.inverse(p6); p6[2] = (vertices[v3*3+2]+vertices[v1*3+2])*0.5;

            jj = j * 3;

            vertices2[jj] = p4[0];
            vertices2[jj+1] = p4[1];
            vertices2[jj+2] = p4[2];

            vertices2[jj+3] = p5[0];
            vertices2[jj+4] = p5[1];
            vertices2[jj+5] = p5[2];

            vertices2[jj+6] = p6[0];
            vertices2[jj+7] = p6[1];
            vertices2[jj+8] = p6[2];

            surface2[l] = v1;
            surface2[l+1] = j;
            surface2[l+2] = j + 2;

            surface2[l+3] = j;
            surface2[l+4] = v2;
            surface2[l+5] = j + 1;

            surface2[l+6] = j + 2;
            surface2[l+7] = j + 1;
            surface2[l+8] = v3;

            surface2[l+9] = j + 2;
            surface2[l+10] = j;
            surface2[l+11] = j + 1;

            j += 3;
            l += 12;
        }

        vertices = vertices2;
        surface = surface2;
    }

    this.addPolygonRAW(vertices, surface, borders, middle, heightMode, properties, id, srs);
    //this.addPolygonRAW(vertices, surface, borders, middle, heightMode, properties, id, srs);

    return this;
    */

    //this.addPolygonRAW(vertices, surface, borders, middle, heightMode, properties, id, srs);
    //return this;

    //copy bordes
    var borders2 = new Array(borders.length), border2; 
    for (i = 0, li = borders.length; i < li; i++) {
        borders2[i] = borders[i].slice();
    }

    var sbuffer = new Array(65536*3);
    var sbuffer2 = new Array(65536*3);
    var sbuffer3 = new Array(65536*3);

    var sbufferIndex = 0, l1, l2, l3, vv1, vv2, vv3;
    var sbufferIndex2 = 0;//, i1, i2, i3;
    var sbufferIndex3 = 0;

    var vbuffer = new Array(65536*3);

    //copy vertices
    for (i = 0, li = vertices.length; i < li; i +=3) { 
        vbuffer[i] = vertices[i];
        vbuffer[i+1] = vertices[i+1];
        vbuffer[i+2] = vertices[i+2];
    }

    var m = Math.round(li / 3);


    var lastMaxFaceLength = maxFaceLength;

    for (i = 0, li = surface.length; i < li; i +=3) { 

        v1 = surface[i];
        v2 = surface[i+1];
        v3 = surface[i+2];
        sbufferIndex = 3;

        //find face edges in borders
        var edge1 = null, edge2 = null, edge3 = null;
        //var edge1, edge2, edge3;
        for (j = 0, lj = borders.length; j < lj; j++) { 
            border = borders[j];
            border2 = borders2[j];

            for (k = 0, lk = border.length; k < lk; k++) {
                var k2 = (k < border.length - 1) ? k + 1 : 0;

                if ((v1 == border[k] && v2 == border[k2]) || (v1 == border[k2] && v2 == border[k])) {
                    border2[k] = [border[k]];
                    edge1 = border2[k];
                }

                if ((v2 == border[k] && v3 == border[k2]) || (v2 == border[k2] && v3 == border[k])) {
                    border2[k] = [border[k]];
                    edge2 = border2[k];
                }

                if ((v3 == border[k] && v1 == border[k2]) || (v1 == border[k2] && v3 == border[k])) {
                    border2[k] = [border[k]];
                    edge3 = border2[k];
                }
            }
        }

        sbuffer[0] = [v1, edge1];
        sbuffer[1] = [v2, edge2];
        sbuffer[2] = [v3, edge3];

        var depth = 0;
        //maxFaceLength = Number.POSITIVE_INFINITY;

        //loop until subdivision is finished
        do {

            for (j = 0, lj = sbufferIndex; j < lj; j+=3) {
                //face indices
                vv1 = sbuffer[j][0];
                vv2 = sbuffer[j+1][0];
                vv3 = sbuffer[j+2][0];
                //face edges
                edge1 = sbuffer[j][1];
                edge2 = sbuffer[j+1][1];
                edge3 = sbuffer[j+2][1];

                /*console.log('v1: ' + vv1 + ' v2:' + vv2 + ' v3:' + vv3);
                console.log('e1: ' + (Array.isArray(edge1) ? 'a' : '') + edge1 + ' e2:' + (Array.isArray(edge2) ? 'a' : '') + edge2 + ' e3:' + (Array.isArray(edge3) ? 'a' : '') + edge3);
                */

                //get face vertices
                p1 = [vbuffer[vv1*3], vbuffer[vv1*3+1], vbuffer[vv1*3+2]];
                p2 = [vbuffer[vv2*3], vbuffer[vv2*3+1], vbuffer[vv2*3+2]];
                p3 = [vbuffer[vv3*3], vbuffer[vv3*3+1], vbuffer[vv3*3+2]];

                //covert coords to geocent
                p1 = proj.forward(p1);
                p2 = proj.forward(p2);
                p3 = proj.forward(p3);

                //get face edges lengths
                l1 = vec3.length([p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2]]);
                l2 = vec3.length([p2[0] - p3[0], p2[1] - p3[1], p2[2] - p3[2]]);
                l3 = vec3.length([p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]]);

                //get max length
                l = Math.max(l1,l2,l3);

                //console.log('ll:' + l);

                //is length below threshold
                if (l < maxFaceLength) {  
                    //add to final buffer
                    sbuffer3[sbufferIndex3] = vv1;
                    sbuffer3[sbufferIndex3+1] = vv2;
                    sbuffer3[sbufferIndex3+2] = vv3;
                    sbufferIndex3 += 3;
                } else {

                    //crete new vertices in the midle of edges
                    p4 = [(p1[0]+p2[0])*0.5, (p1[1]+p2[1])*0.5, (p1[2]+p2[2])*0.5];
                    p5 = [(p2[0]+p3[0])*0.5, (p2[1]+p3[1])*0.5, (p2[2]+p3[2])*0.5];
                    p6 = [(p3[0]+p1[0])*0.5, (p3[1]+p1[1])*0.5, (p3[2]+p1[2])*0.5];

                    //convert coords back to long lat
                    p4 = proj.inverse(p4); p4[2] = (vertices[v1*3+2]+vertices[v2*3+2])*0.5;
                    p5 = proj.inverse(p5); p5[2] = (vertices[v2*3+2]+vertices[v3*3+2])*0.5;
                    p6 = proj.inverse(p6); p6[2] = (vertices[v3*3+2]+vertices[v1*3+2])*0.5;

                    var mm = m * 3;

                    /*if (false) {

                        //add new vertices to the buffer
                        vbuffer[mm] = p4[0];
                        vbuffer[mm+1] = p4[1];
                        vbuffer[mm+2] = p4[2];

                        vbuffer[mm+3] = p5[0];
                        vbuffer[mm+4] = p5[1];
                        vbuffer[mm+5] = p5[2];

                        vbuffer[mm+6] = p6[0];
                        vbuffer[mm+7] = p6[1];
                        vbuffer[mm+8] = p6[2];

                        //create new edges
                        if (edge1) {
                            edge1[0] = [[edge1[0]], [k]];
                            edge1 = edge1[0];
                        }

                        if (edge2) {
                            edge2[0] = [[edge2[0]], [k+1]];
                            edge2 = edge2[0];
                        }

                        if (edge3) {
                            edge3[0] = [[edge3[0]], [k+2]];
                            edge3 = edge3[0];
                        }

                        l = sbufferIndex2;

                        //store new faces with edges
                        sbuffer2[l] = [vv1, edge1 ? edge1[0] : null];
                        sbuffer2[l+1] = [m, null];
                        sbuffer2[l+2] = [m + 2, edge3 ? edge3[1] : null];

                        sbuffer2[l+3] = [m, edge1 ? edge1[1] : null];
                        sbuffer2[l+4] = [vv2, edge2 ? edge2[0] : null];
                        sbuffer2[l+5] = [m + 1, null];

                        sbuffer2[l+6] = [m + 2, null];
                        sbuffer2[l+7] = [m + 1, edge2 ? edge2[1] : null];
                        sbuffer2[l+8] = [vv3, edge3 ? edge3[0] : null];

                        sbuffer2[l+9] = [m + 2, null];
                        sbuffer2[l+10] = [m, null];
                        sbuffer2[l+11] = [m + 1, null];

                        m += 3;
                        sbufferIndex2 += 12;
                    } else {*/

                        if (l1 == l) {
                            //console.log('l1');

                            //add new vertices to the buffer
                            vbuffer[mm] = p4[0];
                            vbuffer[mm+1] = p4[1];
                            vbuffer[mm+2] = p4[2];

                            //create new edges
                            if (edge1) {
                                edge1[0] = [[edge1[0]], [-m]];
                                edge1 = edge1[0];
                            }

                            l = sbufferIndex2;

                            //store new faces with edges
                            sbuffer2[l] = [vv1, edge1 ? edge1[0] : null];
                            sbuffer2[l+1] = [m, null];
                            sbuffer2[l+2] = [vv3, edge3 ? edge3 : null];
                            /*console.log('-v1: ' + sbuffer2[l][0] + ' v2:' + sbuffer2[l+1][0] + ' v3:' + sbuffer2[l+2][0]);
                            console.log('p1: ' + (Array.isArray(sbuffer2[l][1]) ? 'a' : '') + sbuffer2[l][1] + 
                                       ' p2:' + (Array.isArray(sbuffer2[l+1][1]) ? 'a' : '') + sbuffer2[l+1][1] +
                                       ' p3:' + (Array.isArray(sbuffer2[l+2][1]) ? 'a' : '') + sbuffer2[l+2][1]);*/


                            sbuffer2[l+3] = [m, edge1 ? edge1[1] : null];
                            sbuffer2[l+4] = [vv2, edge2 ? edge2 : null];
                            sbuffer2[l+5] = [vv3, null];
                            /*console.log('-v1: ' + sbuffer2[l+3][0] + ' v2:' + sbuffer2[l+4][0] + ' v3:' + sbuffer2[l+5][0]);
                            console.log('p4: ' + (Array.isArray(sbuffer2[l+3][1]) ? 'a' : '') + sbuffer2[l+3][1] + 
                                       ' p5:' + (Array.isArray(sbuffer2[l+4][1]) ? 'a' : '') + sbuffer2[l+4][1] +
                                       ' p6:' + (Array.isArray(sbuffer2[l+5][1]) ? 'a' : '') + sbuffer2[l+5][1]);*/

                        } else if (l2 == l) {
                            //console.log('l2');

                            //add new vertices to the buffer
                            vbuffer[mm] = p5[0];
                            vbuffer[mm+1] = p5[1];
                            vbuffer[mm+2] = p5[2];

                            //create new edges
                            if (edge2) {
                                edge2[0] = [[edge2[0]], [-m]];
                                edge2 = edge2[0];
                            }

                            l = sbufferIndex2;

                            //store new faces with edges
                            sbuffer2[l] = [vv1, edge1 ? edge1 : null];
                            sbuffer2[l+1] = [vv2, edge2 ? edge2[0] : null];
                            sbuffer2[l+2] = [m, null];
                            /*console.log('-v1: ' + sbuffer2[l][0] + ' v2:' + sbuffer2[l+1][0] + ' v3:' + sbuffer2[l+2][0]);
                            console.log('p1: ' + (Array.isArray(sbuffer2[l][1]) ? 'a' : '') + sbuffer2[l][1] + 
                                       ' p2:' + (Array.isArray(sbuffer2[l+1][1]) ? 'a' : '') + sbuffer2[l+1][1] +
                                       ' p3:' + (Array.isArray(sbuffer2[l+2][1]) ? 'a' : '') + sbuffer2[l+2][1]);*/

                            sbuffer2[l+3] = [m, edge2 ? edge2[1] : null];
                            sbuffer2[l+4] = [vv3, edge3 ? edge3 : null];
                            sbuffer2[l+5] = [vv1, null];
                            /*console.log('-v1: ' + sbuffer2[l+3][0] + ' v2:' + sbuffer2[l+4][0] + ' v3:' + sbuffer2[l+5][0]);
                            console.log('p4: ' + (Array.isArray(sbuffer2[l+3][1]) ? 'a' : '') + sbuffer2[l+3][1] + 
                                       ' p5:' + (Array.isArray(sbuffer2[l+4][1]) ? 'a' : '') + sbuffer2[l+4][1] +
                                       ' p6:' + (Array.isArray(sbuffer2[l+5][1]) ? 'a' : '') + sbuffer2[l+5][1]);*/

                        } else if (l3 == l) {
                            //console.log('l3');

                            //add new vertices to the buffer
                            vbuffer[mm] = p6[0];
                            vbuffer[mm+1] = p6[1];
                            vbuffer[mm+2] = p6[2];

                            //create new edges
                            if (edge3) {
                                edge3[0] = [[edge3[0]], [-m]];
                                edge3 = edge3[0];
                            }

                            l = sbufferIndex2;

                            //store new faces with edges
                            sbuffer2[l] = [vv1, edge1 ? edge1 : null];
                            sbuffer2[l+1] = [vv2, null];
                            sbuffer2[l+2] = [m, edge3 ? edge3[1] : null];
                            /*console.log('-v1: ' + sbuffer2[l][0] + ' v2:' + sbuffer2[l+1][0] + ' v3:' + sbuffer2[l+2][0]);
                            console.log('p1: ' + (Array.isArray(sbuffer2[l][1]) ? 'a' : '') + sbuffer2[l][1] + 
                                       ' p2:' + (Array.isArray(sbuffer2[l+1][1]) ? 'a' : '') + sbuffer2[l+1][1] +
                                       ' p3:' + (Array.isArray(sbuffer2[l+2][1]) ? 'a' : '') + sbuffer2[l+2][1]);*/

                            sbuffer2[l+3] = [m, null]; 
                            sbuffer2[l+4] =  [vv2, edge2 ? edge2 : null]; 
                            sbuffer2[l+5] = [vv3, edge3 ? edge3[0] : null];
                            /*console.log('-v1: ' + sbuffer2[l+3][0] + ' v2:' + sbuffer2[l+4][0] + ' v3:' + sbuffer2[l+5][0]);
                            console.log('p4: ' + (Array.isArray(sbuffer2[l+3][1]) ? 'a' : '') + sbuffer2[l+3][1] + 
                                       ' p5:' + (Array.isArray(sbuffer2[l+4][1]) ? 'a' : '') + sbuffer2[l+4][1] +
                                       ' p6:' + (Array.isArray(sbuffer2[l+5][1]) ? 'a' : '') + sbuffer2[l+5][1]);*/

                        }
    
                        m += 1;
                        sbufferIndex2 += 6;
                    //}

                }
            }

            var tmp = sbuffer;
            sbuffer = sbuffer2;
            sbuffer2 = tmp;
            sbufferIndex = sbufferIndex2;
            sbufferIndex2 = 0;

            //if (sbufferIndex3 > 1000) {
                //break;
            //}

            depth++;

            //if (depth == 2) {
                //maxFaceLength = Number.POSITIVE_INFINITY;
            //}


        } while(sbufferIndex > 0);

        maxFaceLength = lastMaxFaceLength;

    }


    //loop faces
        //call subdivide face

    var ebuffer = new Array(65536*3), ebufferIndex = 0;

    var unrollBorder = (function(borderArray) {
        for (var o = 0, lo = borderArray.length; o < lo; o++) {
            if (Array.isArray(borderArray[o])) {
                unrollBorder(borderArray[o]);
            } else {
                ebuffer[ebufferIndex] = borderArray[o];
                ebufferIndex++;
            }
        }
    });

    var lastEbufferIndex = 0;

    //unroll edges
    for (i = 0, li = borders2.length; i < li; i++) {
        unrollBorder(borders2[i]);
        borders2[i] = ebuffer.slice(lastEbufferIndex, ebufferIndex);
        lastEbufferIndex = ebufferIndex;
    }

    surface = new Array(sbufferIndex);

    for (i = 0, li = sbufferIndex3; i < li; i+=3) {
        surface[i] = sbuffer3[i+2];
        surface[i+1] = sbuffer3[i+1];
        surface[i+2] = sbuffer3[i];
    }

    vertices = new Array(m * 3);
    j = 0;

    for (i = 0, li = m*3; i < li; i+=3) {
        vertices[i] = vbuffer[i];
        vertices[i+1] = vbuffer[i+1];
        vertices[i+2] = vbuffer[i+2];
        //this.addPoint([vertices[i], vertices[i+1], vertices[i+2]], 'fix', {name:(''+j)}, 'aaa');
        j++;
    }

    this.addPolygonRAW(vertices, surface, borders2, middle, heightMode, properties, id, srs);
};



MapGeodataBuilder.prototype.addTerrainPolygon = function(shape, holes, middle, density, heightMode, properties, id, srs) {

    //https://github.com/substack/point-in-polygon

    /*
    function insidePolygon (point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        
        var x = point[0], y = point[1];
        
        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];
            
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        
        return inside;
    };*/    

    /*
        function rad2degr(rad) { return rad * 180 / Math.PI; }
        function degr2rad(degr) { return degr * Math.PI / 180; }

        function getLatLngCenter(latLngInDegr) {
            var LATIDX = 0;
            var LNGIDX = 1;
            var sumX = 0;
            var sumY = 0;
            var sumZ = 0;

            for (var i=0; i<latLngInDegr.length; i++) {
                var lat = degr2rad(latLngInDegr[i][LATIDX]);
                var lng = degr2rad(latLngInDegr[i][LNGIDX]);
                // sum of cartesian coordinates
                sumX += Math.cos(lat) * Math.cos(lng);
                sumY += Math.cos(lat) * Math.sin(lng);
                sumZ += Math.sin(lat);
            }

            var avgX = sumX / latLngInDegr.length;
            var avgY = sumY / latLngInDegr.length;
            var avgZ = sumZ / latLngInDegr.length;

            // convert average x, y, z coordinate to latitude and longtitude
            var lng = Math.atan2(avgY, avgX);
            var hyp = Math.sqrt(avgX * avgX + avgY * avgY);
            var lat = Math.atan2(avgZ, hyp);

            return ([rad2degr(lat), rad2degr(lng)]);
        }
    */

    //get center of polygon

    //detect Math.abs(Math.abs(lon)-180) < 0.001
       // if true then add 360 to negative lon values

    //construct merc projection with +lat_ts == polygon_center_lat

    //convert vertices to merc flat space
      //get polygon extents in merc projection

    //divide merc extents in to the grid
      // test each grid point is is polygon and not in hole

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

        for (i = 0, li = vertices.length; i < li; i+=3) {
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
            precision -= 8;
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

};

MapGeodataBuilder.prototype.extractGeometry = function(id) {
    var feature, i, li, j, lj, points, lines,
        vertexBuffer, indexBuffer, index, p;


    for (var i = 0, li = this.groups.length; i < li; i++) {
        var group = this.groups[i];

        var groupPoints = group.points;
        var groupLines = group.lines;
        var groupPolygons = group.polygons, j, lj;

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

        for (j = 0, lj = groupPolygons.length; j < lj; j++) {
            if (groupPolygons[j].id == id) {
                feature = groupPolygons[j];
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
        } else if (feature.vertices) {

            /*feature.vertices = featureVertices;
            feature.surface = featureSurface;
            feature.borders = featureBorders;*/

            return new MapGeodataGeometry(this.map, {'type': 'polygon-geometry', 'id':feature.id, 'geometryBuffer': feature.vertices, 'surface': feature.surface });
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


