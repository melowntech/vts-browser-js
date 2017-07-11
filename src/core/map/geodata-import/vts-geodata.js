
var MapGeodataImportVTSGeodata = function(builder, groupIdPrefix, dontCreateGroups) {
    this.builder = builder;
    this.map = builder.map;
    this.groupIdPrefix = groupIdPrefix || '';
    this.dontCreateGroups = dontCreateGroups;
    //this.processJSON(json);
};

MapGeodataImportVTSGeodata.prototype.processJSON = function(json) {
    if (!json) {
        return;
    }

    var groups = json['groups'], i, li, j, lj, p;
    var builder = this.builder, newPoints, points;

    if (!groups) {
        return;
    }

    for (i = 0, li = groups.length; i < li; i++) {
        var group = groups[i];

        var bbox = group['bbox'],
            resolution = group['resolution'];

        if (!bbox || !resolution) {
            continue;
        }

        var bboxMin = bbox[0];
        var bboxMax = bbox[1];

        if (!bboxMin || !bboxMax) {
            continue;
        }

        if (!this.dontCreateGroups) {
            builder.addGroup(this.groupIdPrefix + (group['id'] || ''));
        }

        var fx = (bboxMax[0] - bboxMin[0]) / resolution;
        var fy = (bboxMax[1] - bboxMin[1]) / resolution;
        var fz = (bboxMax[2] - bboxMin[2]) / resolution;

        //import group points
        var pointsFeatures = group['points'];
        if (pointsFeatures) {

            points = pointsFeatures['points']

            for (j = 0, lj = points.length; j < lj; j++) {
                var point = points[j];
                var subpoints = point['points'];
                var newSubpoints = new Array(subpoints.length);

                for (k = 0, lk = subpoints.length; k < lk; k++) {
                    p = subpoints[k];
                    newSubpoints[j] = [bboxMin[0] + p[0] * fx, bboxMin[1] + p[1] * fy, bboxMin[2] + p[2] * fz];
                }

                builder.addPointArray(newSubpoints, 'fix', point['properties'], point['id'], null, true);
            }
        }

        //import group lines
        var linesFeatures = group['lines'];
        if (linesFeatures) {
            
            var lines = linesFeatures['lines'];

            for (j = 0, lj = lines.length; j < lj; j++) {
                var line = lines[j];
                var sublines = line['lines'];
                var newSublines = new Array(lines.length);

                for (k = 0, lk = sublines.length; k < lk; k++) {

                    points = sublines[k];
                    newPoints = new Array(points.length);

                    for (var l  = 0, ll = points.length; l < ll; l++) {
                        p = points[l];
                        newPoints[l] = [bboxMin[0] + p[0] * fx, bboxMin[1] + p[1] * fy, bboxMin[2] + p[2] * fz];
                    }
                }

                builder.addLineStringArray(newSublines, 'fix', line['properties'], line['id'], null, true);
            }
        }
    }

};

export default MapGeodataImportVTSGeodata;


