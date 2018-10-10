
import {globals as globals_} from './worker-globals.js';
import {setFont as setFont_, setFontMap as setFontMap_,} from './worker-text.js';
import {getLayer as getLayer_, getLayerPropertyValue as getLayerPropertyValue_,
        processStylesheet as processStylesheet_, getFilterResult as getFilterResult_,
        getLayerPropertyValueInner as getLayerPropertyValueInner_, makeFasterFilter as makeFasterFilter_} from './worker-style.js';
import {processLineStringPass as processLineStringPass_, processLineStringGeometry as processLineStringGeometry_} from './worker-linestring.js';
import {processPointArrayPass as processPointArrayPass_, processPointArrayGeometry as processPointArrayGeometry_} from './worker-pointarray.js';
import {processPolygonPass as processPolygonPass_} from './worker-polygon.js';
import {postGroupMessage as postGroupMessage_, optimizeGroupMessages as optimizeGroupMessages_} from './worker-message.js';

//get rid of compiler mess
var globals = globals_;
var setFont = setFont_;
var setFontMap = setFontMap_, makeFasterFilter = makeFasterFilter_;
var getLayer = getLayer_, getLayerPropertyValue = getLayerPropertyValue_,
    processStylesheet = processStylesheet_, getFilterResult = getFilterResult_;
var processLineStringPass = processLineStringPass_;
var processPointArrayPass = processPointArrayPass_;
var processPolygonPass = processPolygonPass_;
var processLineStringGeometry = processLineStringGeometry_;
var processPointArrayGeometry = processPointArrayGeometry_;
var postGroupMessage = postGroupMessage_, optimizeGroupMessages = optimizeGroupMessages_;
var getLayerPropertyValueInner = getLayerPropertyValueInner_;

var exportedGeometries = [];
var featureCache = new Array(1024), featureCacheIndex = 0, finalFeatureCache = new Array(1024), finalFeatureCacheIndex = 0, finalFeatureCacheIndex2 = 0;


function processLayerFeaturePass(type, feature, lod, layer, featureIndex, zIndex, eventInfo) {

    switch(type) {
    case 'line-string':
        if (getLayerPropertyValue(layer, 'point', feature, lod) ||
            getLayerPropertyValue(layer, 'label', feature, lod)) {
            processPointArrayPass(feature, lod, layer, zIndex, eventInfo);
        }

        processLineStringPass(feature, lod, layer, featureIndex, zIndex, eventInfo);
        break;

    case 'point-array':
        processPointArrayPass(feature, lod, layer, featureIndex, zIndex, eventInfo);
        break;
            
    case 'polygon':
        processPolygonPass(feature, lod, layer, featureIndex, zIndex, eventInfo);
        break;     
    }

}

function processFeatures(type, features, lod, featureType, group) {

    //loop layers
    for (var key in globals.stylesheetLayers) {
        var layer = globals.stylesheetLayers[key];
        var filter =  layer['filter'];
        var reduce =  layer['reduce'], i, li;

        if (filter) {
            filter = layer['#filter'];
            if (!filter) {
                layer['#filter'] = makeFasterFilter(layer['filter']);
                filter = layer['#filter'];
            }
        }

        featureCacheIndex = 0, finalFeatureCacheIndex = 0, finalFeatureCacheIndex2 = 0;

        for (i = 0, li = features.length; i < li; i++) {
            var feature = features[i];
            feature.properties = feature['properties'] || {};

            if (feature['id']) {
                feature.properties['#id'] = feature['id']; 
            }
            
            if (!filter || getFilterResult(filter, feature, featureType, group, layer, 'filter', lod, 0, true)) {
                if (reduce) {
                    featureCache[featureCacheIndex] = feature;
                    featureCacheIndex++;
                } else {
                    processLayerFeature(type, feature, lod, layer, i);
                }
            }
        }

        if (reduce) {

            var count = reduce[1];
            var property = reduce[2];

            switch (reduce[0]) {
                case 'top':
                case 'bottom':

                    if (typeof property === 'string' && property.charAt(0) == '@') {
                        property = globals.stylesheetConstants[property];

                        if (typeof property === 'undefined') {
                            break;
                        }
                    }

                    if ((typeof property === 'string' && property.charAt(0) == '$') || (typeof property === 'object')) {
                        var complexProperty = (typeof property === 'object');

                        if (!complexProperty) {
                            property = property.substr(1);
                        }

                        if (count > featureCacheIndex) {
                            count = featureCacheIndex;
                        }

                        var top = (reduce[0] == 'top'), value;
                        var currentIndex = 0;
                        var currentValue2 = top ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

                        do {
                            var currentValue = top ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                            finalFeatureCacheIndex2 = finalFeatureCacheIndex;

                            for (i = 0, li = featureCacheIndex; i < li; i++) {
                                feature = featureCache[i];

                                if (!currentIndex) {
                                    if (!complexProperty) {
                                        value = parseFloat(feature.properties[property]);
                                    } else {
                                        value = getLayerPropertyValueInner(layer, null, feature, lod, property, 0);
                                    }
                                    feature.tmp = value;
                                } else {
                                    value = feature.tmp;
                                }

                                if (!isNaN(value) && ((top && value >= currentValue && value < currentValue2) || (value <= currentValue && value > currentValue2)) ) {
                                    if (currentValue != value) {
                                        finalFeatureCacheIndex = finalFeatureCacheIndex2;
                                    }

                                    finalFeatureCache[finalFeatureCacheIndex] = feature;
                                    finalFeatureCacheIndex++;
                                    currentValue = value;
                                }
                            }

                            currentValue2 = currentValue;
                            currentIndex++;

                        } while(currentIndex < count);
                    }

                    break;

                case 'odd':
                case 'even':

                    for (i = (reduce[0] == 'odd') ? 1 : 0, li = featureCacheIndex; i < li; i+=2) {
                        feature = featureCache[i];
                        finalFeatureCache[finalFeatureCacheIndex] = feature;
                        finalFeatureCacheIndex++;
                    }

                case 'every':

                    if (count > featureCacheIndex) {
                        count = featureCacheIndex;
                    }

                    for (i = 0, li = featureCacheIndex; i < li; i += count) {
                        feature = featureCache[i];
                        finalFeatureCache[finalFeatureCacheIndex] = feature;
                        finalFeatureCacheIndex++;
                    }

                    break;
            }

            //process reduced features
            for (i = 0, li = finalFeatureCacheIndex; i < li; i++) {
                processLayerFeature(type, finalFeatureCache[i], lod, layer, i);
            }

        }

    }
}


function processLayerFeatureMultipass(type, feature, lod, layer, featureIndex, eventInfo) {
    var multiPass = getLayerPropertyValue(layer, 'next-pass', feature, lod);

    var mylayer;

    if (multiPass != null) {
        for (var i = 0, li = multiPass.length; i < li; i++) {
            var zIndex = multiPass[i][0];
            mylayer = getLayer(multiPass[i][1], type, featureIndex);
            
            if (!getLayerPropertyValue(mylayer, 'visible', feature, lod)) {
                continue;
            }

            var selectedLayerId = getLayerPropertyValue(mylayer, 'selected-layer', feature, lod);
            var selectedLayer = (selectedLayerId != '') ? getLayer(selectedLayerId, type, featureIndex) : null;

            var selectedHoverLayerId = getLayerPropertyValue(mylayer, 'selected-hover-layer', feature, lod);
            var selectedHoverLayer = (selectedHoverLayerId != '') ? getLayer(selectedHoverLayerId, type, featureIndex) : null;

            var hoverLayerId = getLayerPropertyValue(mylayer, 'hover-layer', feature, lod);
            var hoverLayer = (hoverLayerId != '') ? getLayer(hoverLayerId, type, featureIndex) : null;

            var flags =  ((hoverLayer != null) ? (1<<8) : 0) | ((selectedLayer != null) ? (1<<9) : 0) | ((selectedHoverLayer != null) ? (1<<10) : 0);

            var lastHitState = globals.hitState;

            if (selectedLayer != null) {
                globals.hitState = flags | 2;
                processLayerFeaturePass(type, feature, lod, selectedLayer, featureIndex, zIndex, eventInfo);
            }

            if (selectedHoverLayer != null) {
                globals.hitState = flags | 3;
                processLayerFeaturePass(type, feature, lod, selectedHoverLayer, featureIndex, zIndex, eventInfo);
            }

            if (hoverLayer != null) {
                globals.hitState = flags | 1;
                processLayerFeaturePass(type, feature, lod, hoverLayer, featureIndex, zIndex, eventInfo);
            }
                
            //globals.hitState = flags | 0;
            processLayerFeaturePass(type, feature, lod, mylayer, featureIndex, zIndex, eventInfo);

            globals.hitState = lastHitState;
        }
    }
}


function processLayerFeature(type, feature, lod, layer, featureIndex) {
    if (!getLayerPropertyValue(layer, 'visible', feature, lod)) {
        return;
    }

    var zIndex = getLayerPropertyValue(layer, 'z-index', feature, lod);

    if (getLayerPropertyValue(layer, 'export-geometry', feature, lod) && (typeof feature['id'] !== 'undefined')) {
        if (!exportedGeometries[feature]) {

            switch(type) {
            case 'line-string':
                processLineStringGeometry(feature);
                break;

            case 'point-array':
                processPointArrayGeometry(feature);
                break;
                    
            case 'polygon':
                break;     
            }

            exportedGeometries[feature] = true;
        }
    }

    var eventInfo = feature.properties;

    var selectedLayerId = getLayerPropertyValue(layer, 'selected-layer', feature, lod);
    var selectedLayer = (selectedLayerId != '') ? getLayer(selectedLayerId, type, featureIndex) : null;

    var selectedHoverLayerId = getLayerPropertyValue(layer, 'selected-hover-layer', feature, lod);
    var selectedHoverLayer = (selectedHoverLayerId != '') ? getLayer(selectedHoverLayerId, type, featureIndex) : null;

    var hoverLayerId = getLayerPropertyValue(layer, 'hover-layer', feature, lod);
    var hoverLayer = (hoverLayerId != '') ? getLayer(hoverLayerId, type, featureIndex) : null;

    var flags =  ((hoverLayer != null) ? (1<<8) : 0) | ((selectedLayer != null) ? (1<<9) : 0) | ((selectedHoverLayer != null) ? (1<<10) : 0);

    if (selectedLayer != null) {
        globals.hitState = flags | 2;
        processLayerFeaturePass(type, feature, lod, selectedLayer, featureIndex, zIndex, eventInfo);
        processLayerFeatureMultipass(type, feature, lod, selectedLayer, featureIndex, eventInfo);
    }

    if (selectedHoverLayer != null) {
        globals.hitState = flags | 3;
        processLayerFeaturePass(type, feature, lod, selectedHoverLayer, featureIndex, zIndex, eventInfo);
        processLayerFeatureMultipass(type, feature, lod, selectedHoverLayer, featureIndex, eventInfo);
    }

    if (hoverLayer != null) {
        globals.hitState = flags | 1;
        processLayerFeaturePass(type, feature, lod, hoverLayer, featureIndex, zIndex, eventInfo);
        processLayerFeatureMultipass(type, feature, lod, hoverLayer, featureIndex, eventInfo);
    }

    globals.hitState = flags | 0;
    processLayerFeaturePass(type, feature, lod, layer, featureIndex, zIndex, eventInfo);
    processLayerFeatureMultipass(type, feature, lod, layer, featureIndex, eventInfo);
}


function processGroup(group, lod) {
    var i, li;
    var groupId = group['id'] || '';
    globals.groupId = groupId;

    var bbox = group['bbox'];    
    if (!bbox) {
        return;
    }
          
    var bboxMin = bbox[0];
    var bboxMax = bbox[1];
    globals.bboxMin = bboxMin;
    globals.bboxMax = bboxMax;

    var bboxDelta = [bbox[1][0] - bbox[0][0],
        bbox[1][1] - bbox[0][1],
        bbox[1][2] - bbox[0][2]];
    var bboxResolution = group['resolution'] || 4096;
    
    globals.groupOrigin = [0,0,0];
    globals.forceScale = [bboxDelta[0] / bboxResolution,
        bboxDelta[1] / bboxResolution,
        bboxDelta[2] / bboxResolution];

    postGroupMessage({'command':'beginGroup', 'id': group['id'], 'bbox': [bboxMin, bboxMax], 'origin': bboxMin});

    //process points
    var points = group['points'] || [];
    globals.featureType = 'point';
    processFeatures('point-array', points, lod, 'point', groupId);

    //process lines
    var lines = group['lines'] || [];
    globals.featureType = 'line';
    processFeatures('line-string', lines, lod, 'line', groupId);

    //process polygons
    var polygons = group['polygons'] || [];
    globals.featureType = 'polygon';
    processFeatures('polygon', polygons, lod, 'polygon', groupId);

    postGroupMessage({'command':'endGroup'});

    if (globals.groupOptimize) {
        optimizeGroupMessages();
    }
}


function processGeodata(data, lod) {
    //console.log("processGeodata");

    //create object from JSON
    if ((typeof data) == 'string') {
        try {
            var geodata = JSON.parse(data);
        } catch (e) {
            geodata = null;
        }
    } else {
        geodata = data;
    }

    if (geodata) {

        var groups = geodata['groups'] || [];

        //process layers
        for (var i = 0, li = groups.length; i < li; i++) {
            processGroup(groups[i], lod);
        }
    }

    //console.log("processGeodata-ready");
}


self.onmessage = function (e) {
    var message = e.data;
    var command = message['command'];
    var data = message['data'];

    //console.log("workeronmessage: " + command);

    switch(command) {

    case 'setStylesheet':
        if (data) {
            globals.geocent = data['geocent'];
            globals.metricUnits = data['metric'];
            processStylesheet(data['data']);
        }
        postMessage({'command' : 'ready'});
        break;

    case 'setFont':
        setFont(data);
        postMessage({'command' : 'ready'});
        break;

    case 'setFontMap':
        setFontMap(data);
        postMessage({'command' : 'styleDone'});
        postMessage({'command' : 'ready'});
        break;

    case 'processGeodata':
        globals.tileLod = message['lod'] || 0;
        globals.tileSize = message['tileSize'] || 1;
        globals.pixelFactor = message['dpr'] || 1;
        globals.reduceMode = message['reduceMode'] || 'scr-count4';
        globals.invPixelFactor = 1.0 / globals.pixelFactor;
        data = JSON.parse(data);            
        exportedGeometries = [];
        processGeodata(data, globals.tileLod);
            
        if (globals.groupOptimize) {
            optimizeGroupMessages();
        }
            
        postMessage({'command' : 'allProcessed'});
        postMessage({'command' : 'ready'});
        break;
    }
};

