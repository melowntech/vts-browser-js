
var MapGeodataImportGeoJSON = function(builder, json, heightMode, srs) {
    this.builder = builder;
    this.map = builder.map;
    this.heightMode = heightMode || 'float';
    this.srs = srs;
    this.processJSON(json);
};

MapGeodataBuilder.prototype.processGeometry = function(json, feature) {
    var coords = geometry['coordinates'];
    if (!coords) {
        return;
    }

    switch(geometry['type']) {
        case 'Point':
            this.builder.addPoint(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'MultiPoint':
            this.builder.addPointArray(cords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'LineString':
            this.builder.addLineString(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
            break;

        case 'MultiLineString':
            this.builder.addLineString(coords, this.heightMode, feature['properties'], feature['properties'] ? feature['properties']['id'] : null, this.srs);
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

MapGeodataBuilder.prototype.processFeature = function(json) {
    var geometry = json['geometry'];

    if (geometry) {
        this.processGeometry(geometry, json);
    }
};

MapGeodataBuilder.prototype.processCollection = function(json) {
    var features = json['features'];

    if (features) {
        return;
    }

    for (var i = 0, li = features.length; i < li; i++) {
        this.processFeature(features[i]);
    }
};

MapGeodataBuilder.prototype.processJSON = function(json) {
    if (!json) {
        return;
    }

    if (json['type']) {

        switch (json['type']) {
            case 'FeatureCollection':
                this.builder.addGroup();
                this.processCollection(json);
                break;
            case 'Feature':
                this.builder.addGroup();
                this.processFeature(json);
                break;
        }

    } else {

        for (var key in json) {
            var item = json[key];

            this.builder.addGroup(key);

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

