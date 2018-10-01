
var MapGeodataImportGeoJSON = function(builder, heightMode, srs, groupIdPrefix, dontCreateGroups) {
    this.builder = builder;
    this.map = builder.map;
    this.heightMode = heightMode || 'float';
    this.srs = srs;
    this.groupIdPrefix = groupIdPrefix || '';
    this.dontCreateGroups = dontCreateGroups;
    //this.processJSON(json);
};

MapGeodataImportGeoJSON.prototype.processGeometry = function(geometry, feature) {
    var coords = geometry['coordinates'];
    if (!coords) {
        return;
    }

    switch(geometry['type']) {
        case 'Point':
            this.builder.addPoint(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'MultiPoint':
            this.builder.addPointArray(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'LineString':
            this.builder.addLineString(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'MultiLineString':
            this.builder.addLineStringArray(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'GeometryCollection':

            var geometries = geometry['gemetries'];

            if (geometries) {
                for (var i = 0, li = geometries.length; i < li; i++) {
                    this.processGeometry(geometries[i], feature);
                }
            }
    }
};

MapGeodataImportGeoJSON.prototype.processFeature = function(json) {
    var geometry = json['geometry'];

    if (geometry) {
        this.processGeometry(geometry, json);
    }
};

MapGeodataImportGeoJSON.prototype.processCollection = function(json) {
    var features = json['features'];

    if (!features) {
        return;
    }

    for (var i = 0, li = features.length; i < li; i++) {
        this.processFeature(features[i]);
    }
};

MapGeodataImportGeoJSON.prototype.processJSON = function(json) {
    if (!json) {
        return;
    }

    if (json['type']) {

        switch (json['type']) {
            case 'FeatureCollection':

                if (!this.dontCreateGroups) {
                    this.builder.addGroup(this.groupIdPrefix != '' ? this.groupIdPrefix : null);
                }

                this.processCollection(json);
                break;
            case 'Feature':

                if (!this.dontCreateGroups) {
                    this.builder.addGroup(this.groupIdPrefix != '' ? this.groupIdPrefix : null);
                }

                this.processFeature(json);
                break;
        }

    } else {

        for (var key in json) {
            var item = json[key];

            if (!this.dontCreateGroups) {
                this.builder.addGroup(this.groupIdPrefix + key);
            }

            switch (json['type']) {
                case 'FeatureCollection':
                    this.processCollection(item);
                    break;
                case 'Feature':
                    this.processFeature(item);
                    break;
            }
        }
    }

};

export default MapGeodataImportGeoJSON;

