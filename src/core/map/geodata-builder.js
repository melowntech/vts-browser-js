
//import Delaunator_ from './geodata-utils';
import MapGeodataGeometry_ from './geodata-geometry';
import MapGeodataImportGeoJSON_ from './geodata-import/geojson';
import MapGeodataImportVTSGeodata_ from './geodata-import/vts-geodata';
//import MapGeodataImport3DTiles_ from './geodata-import/3dtiles';
//import GeographicLib_ from 'geographiclib';
import {vec3 as vec3_, mat4 as mat4_,} from '../utils/matrix';

//get rid of compiler mess
//var Delaunator = Delaunator_;
var MapGeodataGeometry = MapGeodataGeometry_;
var MapGeodataImportGeoJSON = MapGeodataImportGeoJSON_;
var MapGeodataImportVTSGeodata = MapGeodataImportVTSGeodata_;
//var MapGeodataImport3DTiles = MapGeodataImport3DTiles_;

//var GeographicLib = GeographicLib_;
var vec3 = vec3_;
var mat4 = mat4_;


var MapGeodataBuilder = function(map) {
    this.map = map;
    this.groups = [];
    this.nodes = [];
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


MapGeodataBuilder.prototype.addNode = function(parentNode, volume, precision, tileset) {
    var node = {
        meshes: [],
        precision : precision,
        volume : volume,
        tileset: tileset ? true : false,
        nodes : []
    };

    if(!parentNode) {
        parentNode = this;
    }

    parentNode.nodes.push(node);

    return node;
};


MapGeodataBuilder.prototype.addMesh = function(node, path) {
    if (node) {
        node.meshes.push(path);
    }
};


MapGeodataBuilder.prototype.addLoadNode = function(node, path) {
    if (node) {
        if (!node.loadNodes) {
            node.loadNodes = [];
        }
        
        node.loadNodes.push(path);
    }
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


MapGeodataBuilder.prototype.addPolygon = function(shape, holes, middle, heightMode, properties, id, srs, tesselation) {
    //older versions are in github history 2.20.x
    return this.addPolygon3(shape, holes, middle, heightMode, properties, id, srs, tesselation);
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
            var coords2 = proj.forward(coords);
            sumX += coords2[0];
            sumY += coords2[1];
            sumZ += coords2[2];
        }

        var avgX = sumX / li;
        var avgY = sumY / li;
        var avgZ = sumZ / li;

        // convert average x, y, z coordinate to latitude and longtitude

        coords = proj.inverse([avgX, avgY, avgZ]);

        return [coords[0], coords[1], 0];
    }
};


MapGeodataBuilder.prototype.insidePolygon = function(point, vertices, verticesLength) {
    // ray-casting algorithm based on
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    
    var x = point[0], y = point[1];

    verticesLength = (verticesLength || Math.round(vertices.length/3));

    var inside = false;
    for (var i = 0, j = verticesLength - 1, li = verticesLength; i < li; j = i++) {
        var xi = vertices[i*3], yi = vertices[i*3+1];
        var xj = vertices[j*3], yj = vertices[j*3+1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};    


//same as addPolygon but works on poles
/*
MapGeodataBuilder.prototype.addPolygon2 = function(shape, holes, middle, heightMode, properties, id, srs) {
    srs = srs ? srs : this.navSrs.srsProj4;
    holes = holes || [];

    var flatShape = shape, flatHoles = holes, i, li, j, lj, k, lk, l, hole, coords, coords2, proj, holesIndices, vertices;
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


    for (i = 0, li = shape.length; i < li; i++) {
        shape[i][2] = shape[i][2] || 0; //add third coord
    }

    for (i = 0, li = holes.length; i < li; i++) {
        hole = holes[i];
        totalPoints += hole.length*3;

        for (j = 0, lj = hole.length; j < lj; j++) {
            hole[j][2] = hole[j][2] || 0; //add third coord
        }
    }

    var center = this.getPolygonCenter(shape, projected, proj), north, east, dir;

    this.addPoint(center.slice(), 'fix', {}, 'aaa');

    var ned = this.map.measure.getNewNED(center);

    dir = ned.direction;
    north = ned.north;
    east = ned.east;

    var totalPoints = shape.length*3;

    for (i = 0, li = shape.length; i < li; i++) {
        shape[i][2] = shape[i][2] || 0; //add third coord
    }

    for (i = 0, li = holes.length; i < li; i++) {
        hole = holes[i];
        totalPoints += hole.length*3;

        for (j = 0, lj = hole.length; j < lj; j++) {
            hole[j][2] = hole[j][2] || 0; //add third coord
        }
    }

    flatShape = new Array(totalPoints);
    vertices = new Array(totalPoints);
    j = 0;

    var borders = new Array(holes.length + 1);
    var border = new Array(shape.length);
    borders[0] = border;

    ctx.beginPath();

    for (i = 0, li = shape.length; i < li; i++) {
        border[i] = i;
        coords = shape[i];
        vertices[j] = coords[0]; 
        vertices[j+1] = coords[1]; 
        vertices[j+2] = coords[2];

        if (proj) {
            coords2 = proj.forward(shape[i]);
            coords= [ east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                      dir[0] * coords2[0] + dir[1] * coords2[1] + dir[2] * coords2[2], 0];
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
                coords2 = proj.forward(hole[k]);
                coords = [east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                          dir[0] * coords2[0] + dir[1] * coords2[1] + dir[2] * coords2[2], 0];
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

    ctx.beginPath();

    for (i = 0, li = surface.length; i < li; i+=3) {
        var v1 = surface[i]*3;
        var v2 = surface[i+1]*3;
        var v3 = surface[i+2]*3;

        ctx.moveTo(flatShape[v1]*fx+sx,flatShape[v1+1]*fx+sx);
        ctx.lineTo(flatShape[v2]*fx+sx,flatShape[v2+1]*fx+sx);
        ctx.lineTo(flatShape[v3]*fx+sx,flatShape[v3+1]*fx+sx);
        ctx.lineTo(flatShape[v1]*fx+sx,flatShape[v1+1]*fx+sx);
    }

    ctx.strokeStyle = "#0000ff";
    ctx.stroke();

    return this;
};
*/

//same as addPolygon3 but with Delaunator sudivision
/*
MapGeodataBuilder.prototype.addPolygon4 = function(shape, holes, middle, heightMode, properties, id, srs) {
    srs = srs ? srs : this.navSrs.srsProj4;
    holes = holes || [];
    holes = [];

    var flatShape = shape, flatHoles = holes, i, li, j, lj, k, lk, l, hole, coords = [], coords2 = [], proj, holesIndices, vertices;
    var projected = true, dx, dy, dz, dd, maxDistance = 0, maxDistanceCoords, flatCenter, trueHolesCount = holes.length;
    var density = 20;

    //convert shape and holes to flat space
    if (srs.indexOf('+proj=longlat') != -1) {
        projected = false;
        proj = this.map.proj4(srs, '+proj=geocent +datum=WGS84 +units=m +no_defs');
    }

    var totalPoints = shape.length*3;

    for (i = 0, li = shape.length; i < li; i++) {
        shape[i][2] = shape[i][2] || 0; //add third coord
    }

    for (i = 0, li = holes.length; i < li; i++) {
        hole = holes[i];
        totalPoints += hole.length*3;

        for (j = 0, lj = hole.length; j < lj; j++) {
            hole[j][2] = hole[j][2] || 0; //add third coord
        }
    }

    var center = this.getPolygonCenter(shape, projected, proj), north, east, dir, geod;

    var ned = this.map.measure.getNewNED(center);

   // dir = ned.direction;
    north = ned.direction;
    east = ned.east;

     geod = this.map.measure.getGeodesic(); 

    flatShape = new Array(totalPoints);
    vertices = new Array(totalPoints);
    j = 0;

    var borders = new Array(holes.length + 1);
    var border = new Array(shape.length);
    borders[0] = border;


    var gcenter;

    if (proj) {
        gcenter = proj.forward(center);
    } else {
        gcenter = center;
    }

    for (i = 0, li = shape.length; i < li; i++) {
        border[i] = i;
        coords = shape[i];
        vertices[j] = coords[0]; 
        vertices[j+1] = coords[1]; 
        vertices[j+2] = coords[2];

        if (proj) {
            coords2 = proj.forward(shape[i]);
            coords = [east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                      north[0] * coords2[0] + north[1] * coords2[1] + north[2] * coords2[2], 0];
        } else {
            coords2 = shape[i];
            coords = coords2;
        }

        dx = coords2[0] - gcenter[0];
        dy = coords2[1] - gcenter[1];
        dz = coords2[2] - gcenter[2];
        dd = dx * dx + dy * dy + dz*dz;
        if (dd > maxDistance) {
            maxDistance = dd;
            maxDistanceCoords = shape[i]
        }

        flatShape[j] = coords[0]; 
        flatShape[j+1] = coords[1]; 
        flatShape[j+2] = coords[2]; 
        j+=3;
    }

    maxDistance = Math.sqrt(maxDistance);

    var inPoints = new Array(density * density * 3);
    var inPointsFlat = new Array(density * density * 3);
    var inPointsIndex = 0;
    var inPointsFlatIndex = 0;

    if (proj) {

        if (!projected) {
            //maxDistanceCoords = proj.inverse(maxDistanceCoords); maxDistanceCoords[2] = 0;
            maxDistance = this.map.measure.getDistance(center, maxDistanceCoords, false)[0];
        }
        
        density = Math.round(density * 0.5);

        var r, ncoords, ecoords, lastJ = j;
        var geod = this.map.measure.getGeodesic();
        
        for (i = -density; i < density; i++) {
            r = geod.Direct(center[1], center[0], 0, (maxDistance / (density)) * i);
            ncoords = [r.lon2, r.lat2];

            for (j = -density; j < density; j++) {
                r = geod.Direct(ncoords[1], ncoords[0], 90, (maxDistance / (density)) * j);

                ecoords = [r.lon2, r.lat2, 0];
                coords2 = proj.forward(ecoords);
                coords = [east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                          north[0] * coords2[0] + north[1] * coords2[1] + north[2] * coords2[2], 0];
               
                if (this.insidePolygon(coords, flatShape, shape.length)) {
                    //this.addPoint(ecoords.slice(), 'fix', {}, 'bbb', srs);
                    //holes.push([ecoords]);

                    inPoints[inPointsIndex] = ecoords[0];
                    inPoints[inPointsIndex+1] = ecoords[1];
                    inPoints[inPointsIndex+2] = ecoords[2];
                    inPointsIndex += 3;

                    inPointsFlat[inPointsFlatIndex] = coords[0];
                    inPointsFlat[inPointsFlatIndex+1] = coords[1];
                    inPointsFlat[inPointsFlatIndex+2] = coords[2];
                    inPointsFlatIndex += 3;

                } else {
                    //this.addPoint(ecoords.slice(), 'fix', {}, 'aaa', srs);
                }
            }
        }

        j = lastJ; 

        inPoints = inPoints.slice(0, inPointsIndex);
        inPointsFlat = inPointsFlat.slice(0, inPointsFlatIndex);

        vertices = vertices.concat(inPoints);
        flatShape = flatShape.concat(inPointsFlat);

    }

    if (false) {
        flatHoles = new Array(holes.length);
        holesIndices = new Array(holes.length);

        for (i = 0, li = holes.length; i < li; i++) {
            hole = holes[i];
            holesIndices[i] = Math.round(j/3);

            if (i < trueHolesCount) {
                border = new Array(hole.length);
                borders[i + 1] = border;
            }

            l = Math.floor(j /3);

            for (k = 0, lk = hole.length; k < lk; k++) {
                coords = hole[k];
                vertices[j] = coords[0]; 
                vertices[j+1] = coords[1]; 
                vertices[j+2] = coords[2]; 

                if (proj) {
                    coords2 = proj.forward(hole[k]);
                    coords = [east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                              north[0] * coords2[0] + north[1] * coords2[1] + north[2] * coords2[2], 0];
                } else {
                    coords = hole[k];
                }

                flatShape[j] = coords[0]; 
                flatShape[j+1] = coords[1]; 
                flatShape[j+2] = coords[2]; 
                j+=3;

                if (i < trueHolesCount) {
                    border[k] = l++;
                }
            }
        }
    }

    var flatShape2 = new Array((flatShape.length / 3) *2);

    for (i = 0, j =0, li = flatShape.length; i < li; i+=3, j+=2) {
        flatShape2[j] = flatShape[i];
        flatShape2[j+1] = flatShape[i+1];
    }

    var delaunay = new Delaunator(flatShape2);

    var surface2 = delaunay.triangles;
    var smax = 30;//vertices.length / 3;

    var surface = new Array(surface2.length);

    j = 0;

    for (i = 0, li = surface.length; i < li; i+=3) {
        var v1 = surface2[i]*2;
        var v2 = surface2[i+1]*2;
        var v3 = surface2[i+2]*2;

        var mid = [(flatShape2[v1]+flatShape2[v2]+flatShape2[v3])/3,
                   (flatShape2[v1+1]+flatShape2[v2+1]+flatShape2[v3+1])/3,0];

        if (this.insidePolygon(mid, flatShape, shape.length)) {
            surface[j] = surface2[i+2];
            surface[j+1] = surface2[i+1];
            surface[j+2] = surface2[i];
            j+=3;
        }
    }

    surface = surface.slice(0,j);

    //var surface = vts.earcut(flatShape, holesIndices, 3);
    //var surface = vts.earcut(flatShape2, holesIndices, 2);

    var c = document.getElementById("dbg-canvas");
    var ctx = c.getContext("2d");
    var sx = 300;
    var fx = 300 / 7500000; fx*=30;


    ctx.beginPath();

    for (i = 0, li = surface2.length; i < li; i+=3) {
        var v1 = surface2[i]*2;
        var v2 = surface2[i+1]*2;
        var v3 = surface2[i+2]*2;

        ctx.moveTo(flatShape2[v1]*fx+sx,flatShape2[v1+1]*fx+sx);
        ctx.lineTo(flatShape2[v2]*fx+sx,flatShape2[v2+1]*fx+sx);
        ctx.lineTo(flatShape2[v3]*fx+sx,flatShape2[v3+1]*fx+sx);
        ctx.lineTo(flatShape2[v1]*fx+sx,flatShape2[v1+1]*fx+sx);
    }

    ctx.strokeStyle = "#0000ff";
    ctx.stroke();


    ctx.beginPath();

    for (i = 0, li = surface.length; i < li; i+=3) {
        var v1 = surface[i]*2;
        var v2 = surface[i+1]*2;
        var v3 = surface[i+2]*2;

        ctx.moveTo(flatShape2[v1]*fx+sx,flatShape2[v1+1]*fx+sx);
        ctx.lineTo(flatShape2[v2]*fx+sx,flatShape2[v2+1]*fx+sx);
        ctx.lineTo(flatShape2[v3]*fx+sx,flatShape2[v3+1]*fx+sx);
        ctx.lineTo(flatShape2[v1]*fx+sx,flatShape2[v1+1]*fx+sx);
    }

    ctx.strokeStyle = "#ff00ff";
    ctx.stroke();

    this.addPolygonRAW(vertices, surface, borders, middle, heightMode, properties, id, srs);

    return this;
};*/

//same as addPolygon but works on poles and is subivided
MapGeodataBuilder.prototype.addPolygon3 = function(shape, holes, middle, heightMode, properties, id, srs, tesselation) {
    srs = srs ? srs : this.navSrs.srsProj4;
    holes = holes || [];

    var flatShape = shape, flatHoles = holes, i, li, j, lj, k, lk, l, hole, coords = [], coords2 = [], proj, holesIndices, vertices;
    var projected = true, dx, dy, dz, dd, maxDistance = 0, maxDistanceCoords, flatCenter, trueHolesCount = holes.length;

    tesselation = tesselation || {};
    tesselation.mode = tesselation['mode'] || 'auto';

    if (tesselation.mode == 'by-length') {
        tesselation.length = tesselation['length'] || 200000;
    }

    var density = 19;

    //convert shape and holes to flat space
    if (srs.indexOf('+proj=longlat') != -1) {
        projected = false;
        proj = this.map.proj4(srs, '+proj=geocent +datum=WGS84 +units=m +no_defs');
        //proj = this.map.proj4(srs, '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs');
    }

    var totalPoints = shape.length*3;

    for (i = 0, li = shape.length; i < li; i++) {
        shape[i][2] = shape[i][2] || 0; //add third coord
    }

    for (i = 0, li = holes.length; i < li; i++) {
        hole = holes[i];
        totalPoints += hole.length*3;

        for (j = 0, lj = hole.length; j < lj; j++) {
            hole[j][2] = hole[j][2] || 0; //add third coord
        }
    }

    var center = this.getPolygonCenter(shape, projected, proj), north, east, dir, geod;

    var ned = this.map.measure.getNewNED(center);

    dir = ned.direction;
    north = ned.direction;
    east = ned.east;

    flatShape = new Array(totalPoints);
    vertices = new Array(totalPoints);
    j = 0;

    var borders = new Array(holes.length + 1);
    var border = new Array(shape.length);
    borders[0] = border;

    var gcenter;

    if (proj) {
        gcenter = proj.forward(center);
    } else {
        gcenter = center;
    }

    for (i = 0, li = shape.length; i < li; i++) {
        border[i] = i;
        coords = shape[i];
        vertices[j] = coords[0]; 
        vertices[j+1] = coords[1]; 
        vertices[j+2] = coords[2];

        if (proj) {
            coords2 = proj.forward(shape[i]);
            coords = [east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                      north[0] * coords2[0] + north[1] * coords2[1] + north[2] * coords2[2], 0];
        } else {
            coords2 = shape[i];
            coords = coords2;
        }

        dx = coords2[0] - gcenter[0];
        dy = coords2[1] - gcenter[1];
        dz = coords2[2] - gcenter[2];
        dd = dx * dx + dy * dy + dz*dz;
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
                coords2 = proj.forward(hole[k]);
                //cords = [coords2[0], coords2[1], 0];
                coords = [east[0] * coords2[0] + east[1] * coords2[1] + east[2] * coords2[2],
                          dir[0] * coords2[0] + dir[1] * coords2[1] + dir[2] * coords2[2], 0];
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

    var maxFaceLength = Number.POSITIVE_INFINITY;

    switch (tesselation.mode) {
        case 'auto':      maxFaceLength = Math.sqrt(maxDistance) / density; break;
        case 'by-length': maxFaceLength = tesselation.length; break;
    }

    var v1, v2, v3, p1, p2, p3, p4, p5, p6;

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

        var depth = 0, r;

        //loop until subdivision is finished
        do {

            for (j = 0, lj = sbufferIndex; j < lj; j+=3) {
                //face indices//
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
                if (proj) {
                    p1 = proj.forward(p1);
                    p2 = proj.forward(p2);
                    p3 = proj.forward(p3);
                }

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

                    //crete new vertices in the midle of edges and convert coords back to long lat
                    //if (l1 > 200000 && !projected) {
                     //   r = geod.Inverse(vbuffer[vv1*3+1], vbuffer[vv1*3], vbuffer[vv2*3+1], vbuffer[vv2*3]);
                     //   r = geod.Direct(vbuffer[vv1*3+1], vbuffer[vv1*3], r.azi1, r.s12 *0.5);
                    //    p4 = [r.lon2, r.lat2, (vbuffer[vv1*3+2]+vbuffer[vv2*3+2])*0.5];
                    //} else {
                        p4 = [(p1[0]+p2[0])*0.5, (p1[1]+p2[1])*0.5, (p1[2]+p2[2])*0.5];
                    if (proj) {
                        p4 = proj.inverse(p4); p4[2] = (vbuffer[vv1 * 3 + 2] + vbuffer[vv2 * 3 + 2]) * 0.5;
                    }
                    //}

                    //if (l2 > 200000 && !projected) {
                     //   r = geod.Inverse(vbuffer[vv2*3+1], vbuffer[vv2*3], vbuffer[vv3*3+1], vbuffer[vv3*3]);
                     //   r = geod.Direct(vbuffer[vv2*3+1], vbuffer[vv2*3], r.azi1, r.s12 *0.5);
                     //   p5 = [r.lon2, r.lat2, (vbuffer[vv2*3+2]+vbuffer[vv3*3+2])*0.5];
                    //} else {
                        p5 = [(p2[0]+p3[0])*0.5, (p2[1]+p3[1])*0.5, (p2[2]+p3[2])*0.5];
                    if (proj) {
                        p5 = proj.inverse(p5); p5[2] = (vbuffer[vv2 * 3 + 2] + vbuffer[vv3 * 3 + 2]) * 0.5;
                    }
                    //}

                    //if (l3 > 200000 && !projected) {
                     //   r = geod.Inverse(vbuffer[vv3*3+1], vbuffer[vv3*3], vbuffer[vv1*3+1], vbuffer[vv1*3]);
                     //   r = geod.Direct(vbuffer[vv3*3+1], vbuffer[vv3*3], r.azi1, r.s12 *0.5);
                     //   p6 = [r.lon2, r.lat2, (vbuffer[vv3*3+2]+vbuffer[vv1*3+2])*0.5];
                    //} else {
                        p6 = [(p3[0]+p1[0])*0.5, (p3[1]+p1[1])*0.5, (p3[2]+p1[2])*0.5];
                    if (proj) {
                        p6 = proj.inverse(p6); p6[2] = (vbuffer[vv3 * 3 + 2] + vbuffer[vv1 * 3 + 2]) * 0.5;
                    }
                    //}

                    var mm = m * 3;

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

            //if (depth == 1) {
              //  maxFaceLength = Number.POSITIVE_INFINITY;
            //}


        } while(sbufferIndex > 0);

        maxFaceLength = lastMaxFaceLength;

    }

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
        surface[i] = sbuffer3[i];
        surface[i+1] = sbuffer3[i+1];
        surface[i+2] = sbuffer3[i+2];
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


MapGeodataBuilder.prototype.addPolygonRAW = function(vertices, surface, borders, middle, heightMode, properties, id, srs, directCopy, transform) {
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

            if (directCopy) {
                if (transform) {
                    featureVertices[j++] = [vertices[i]*transform.sx+transform.px, vertices[i+1]*transform.sy+transform.py, vertices[i+2]*transform.sz+transform.pz];
                } else {
                    featureVertices[j++] = [vertices[i], vertices[i+1], vertices[i+2]];
                }
            } else {
                featureVertices[j++] = this.physSrs.convertCoordsFrom([vertices[i], vertices[i+1], vertices[i+2]], srs);
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


MapGeodataBuilder.prototype.importGeoJson = function(json, heightMode, srs, options) {
    var importer = new MapGeodataImportGeoJSON(this, heightMode, srs, options);
    return importer.processJSON(json);
};


MapGeodataBuilder.prototype.import3DTiles = function(json, options) {
    var importer = new MapGeodataImport3DTiles(this, options);
    return importer.processJSON(json);
};


MapGeodataBuilder.prototype.load3DTiles = function(path, options, onLoaded) {
    var importer = new MapGeodataImport3DTiles(this, options);
    importer.loadJSON(path, options, onLoaded);
};


MapGeodataBuilder.prototype.load3DTiles2 = function(path, options, onLoaded) {
    this.binPath = path;
    if (onMapLoaded) {
        onMapLoaded();
    }
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
    var p, res, nodeOnly, heightsLod, nodeOnly, coords, noSource;

    if (item) {

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
            case "none":
                noSource = true;
                break;
        }

        do {
            coords = item.coords;

            if (!noSource && coords[4] == null) {
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


            if (noSource) {
                res = [0,true,true];
            } else {
                res = this.map.measure.getSurfaceHeight(coords, heightsLod, null, coords[4], coords[5], null, nodeOnly);
            }

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
    }

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
        "groups" : [],
    }
    
    if (this.binPath) {
        geodata["binPath"] = this.binPath;
    }

    for (var i = 0, li = this.groups.length; i < li; i++) {
        geodata["groups"].push(this.compileGroup(this.groups[i], resolution));
    }

    if (this.nodes.length > 0) {
        geodata.nodes = [];
        for (i = 0, li = this.nodes.length; i < li; i++) {
            geodata["nodes"].push(this.nodes[i]);
        }
    }

    return geodata;
};


MapGeodataBuilder.prototype.makeFreeLayer = function(style, resolution, geodata) {
    if (!geodata) {
        geodata = this.makeGeodata(resolution);
    }

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

