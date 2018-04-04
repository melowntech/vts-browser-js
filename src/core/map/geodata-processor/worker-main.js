
import {globals as globals_} from './worker-globals.js';
import {setFont as setFont_, setFontMap as setFontMap_,} from './worker-text.js';
import {getLayer as getLayer_, getLayerPropertyValue as getLayerPropertyValue_,
        processStylesheet as processStylesheet_, getFilterResult as getFilterResult_} from './worker-style.js';
import {processLineStringPass as processLineStringPass_, processLineStringGeometry as processLineStringGeometry_} from './worker-linestring.js';
import {processPointArrayPass as processPointArrayPass_, processPointArrayGeometry as processPointArrayGeometry_} from './worker-pointarray.js';
import {processPolygonPass as processPolygonPass_} from './worker-polygon.js';

//get rid of compiler mess
var globals = globals_;
var setFont = setFont_;
var setFontMap = setFontMap_;
var getLayer = getLayer_, getLayerPropertyValue = getLayerPropertyValue_,
    processStylesheet = processStylesheet_, getFilterResult = getFilterResult_;
var processLineStringPass = processLineStringPass_;
var processPointArrayPass = processPointArrayPass_;
var processPolygonPass = processPolygonPass_;
var processLineStringGeometry = processLineStringGeometry_;
var processPointArrayGeometry = processPointArrayGeometry_;

var exportedGeometries = [];


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

            /*if (getLayerPropertyValue(layer, "line", feature, lod) ||
                getLayerPropertyValue(layer, "line-label", feature, lod)) {
                processLineStringPass(feature, lod, layer, zIndex, eventInfo);
            }*/

        break;
            
    case 'polygon':
        processPolygonPass(feature, lod, layer, featureIndex, zIndex, eventInfo);
        break;     
    }

}

function processFeatures(type, features, lod, featureIndex, featureType, group) {

    //loop layers
    for (var key in globals.stylesheetLayers) {
        var layer = globals.stylesheetLayers[key];
        var filter =  layer['filter'];
        var reduce =  layer['reduce'], i, li;

        for (i = 0, li = features.length; i < li; i++) {
            var feature = features[i];
            feature.properties = feature['properties'] || {};

            if (feature['id']) {
                feature.properties['#id'] = feature['id']; 
            }
            
            if (!filter || getFilterResult(filter, feature, featureType, group, layer, 'filter', lod, 0)) {
                if (reduce) {
                    featureCache[featureCacheIndex] = feature;
                    featureCacheIndex++;
                } else {
                    processLayerFeature(type, feature, lod, layer, featureIndex);
                }
            }
        }

        if (reduce) {

            var count = reduce[1];
            var property = reduce[2];
            //TODO: remove $ from property name

            if (count > featureCacheIndex) {
                count = featureCacheIndex;
            }

            switch (reduce[0]) {
                case 'top':
                case 'bottom':

                    var top = (reduce[0] == 'top');
                    var currentIndex = 0;
                    var currentValue = top ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
                    var currentValue2 = top ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

                    do {
                        finalFeatureCacheIndex2 = finalFeatureCacheIndex;

                        for (i = 0, li = featureCacheIndex; i < li; i++) {
                            feature = featureCache[i];

                            var value = parseFloat(feature.properties[property]);

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

                    } while(currentIndex != count);

                    break;

                case 'odd':
                case 'even':

                    for (i = (reduce[0] == 'odd') ? 1 : 0, li = featureCacheIndex; i < li; i+=2) {
                        feature = featureCache[i];
                    }

                case 'every':

                    for (i = 0, li = featureCacheIndex; i < li; i += count) {
                        feature = featureCache[i];
                    }

                    break;
            }

            //process reduced features
            for (i = 0, li = finalFeatureCacheIndex; i < li; i++) {
                processLayerFeature(type, finalFeatureCache[i], lod, layer, featureIndex);
            }

        }

    }
}

function processFeature(type, feature, lod, featureIndex, featureType, group) {
    
    //loop layers
    for (var key in globals.stylesheetLayers) {
        var layer = globals.stylesheetLayers[key];
        var filter =  layer['filter']; //getLayerPropertyValue(layer, 'filter', feature, lod);

        feature.properties = feature['properties'] || {};

        if (feature['id']) {
            feature.properties['#id'] = feature['id']; 
        }
        
        if (!filter || getFilterResult(filter, feature, featureType, group, layer, 'filter', lod, 0)) {
            processLayerFeature(type, feature, lod, layer, featureIndex);
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
            var visible = getLayerPropertyValue(mylayer, 'visible', feature, lod);

            if (!visible) {
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
    //var layer = getLayer(feature["style"], type, featureIndex);
    var visible = getLayerPropertyValue(layer, 'visible', feature, lod);
    var zIndex = getLayerPropertyValue(layer, 'z-index', feature, lod);

    if (!visible) {
        return;
    }

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

    postMessage({'command':'beginGroup', 'id': group['id'], 'bbox': [bboxMin, bboxMax], 'origin': bboxMin});

    /*
    if (groupId == 'mountain_peak' && lod < 17) {
        var hit = false;

        //debugger

        var point2 = [];

        for (i = 0, li = points.length; i < li; i++) {
            if (points[i]['properties']['prominence']) {
                point2.push(points[i]);
            }
        }

        points = point2;

        do {

            hit = false;

            for (i = 0, li = points.length - 1; i < li; i++) {
                var p = points[i]['properties']['prominence'];
                var p2 = points[i+1]['properties']['prominence'];

                if (p && p2) {

                    if (parseFloat(p) < parseFloat(p2)) {
                        var t = points[i];
                        points[i] = points[i + 1];
                        points[i + 1] = t;
                        hit = true;
                    }

                }

            }

        } while(hit);

        //process points
        for (i = 0, li = Math.min(10,points.length); i < li; i++) {
            processFeature('point-array', points[i], lod, i, 'point', groupId);
        }


    } else {

        //process points
        for (i = 0, li = points.length; i < li; i++) {
            processFeature('point-array', points[i], lod, i, 'point', groupId);
        }

    } */


    //process points
    var points = group['points'] || [];
    globals.featureType = 'point';
    processFeatures('point-array', points, lod, i, 'point', groupId);


    var lines = group['lines'] || [];
    globals.featureType = 'line';

    //process lines
    for (i = 0, li = lines.length; i < li; i++) {
        processFeature('line-string', lines[i], lod, i, 'line', groupId);
    }

    var polygons = group['polygons'] || [];
    globals.featureType = 'polygon';

    //process polygons
    for (i = 0, li = polygons.length; i < li; i++) {
        processFeature('polygon', polygons[i], lod, i, 'polygon', groupId);
    }

    if (globals.groupOptimize) {
        optimizeGroupMessages();
    }

    postMessage({'command':'endGroup'});
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

function optimizeGroupMessages() {
    //debugger;
    //loop messages
    var messages = globals.messageBuffer;
    var j, lk, k, message2, job2, vbufferSize, vbuffer, index, buff, buff2;

    for (var i = 0, li = globals.messageBufferIndex; i < li; i++) {
        var message = messages[i];
        var job = message.job;
        var type = job['type'];
        var signature = message.signature;
        
        if (!job['hitable'] && !message.reduced &&  //!job["culling"] &&
            !(type == 'icon' || type == 'label' ||
              type == 'line-geometry' || type == 'point-geometry')) {
            
            switch(type) {
            case 'flat-line':
                vbufferSize = job['vertexBuffer'].length;

                for (j = i + 1; j < li; j++) {
                    message2 = messages[j];
                        
                    if (message2.signature == signature) {
                        message2.reduced = true;
                        vbufferSize += message2.job['vertexBuffer'].length;
                    }
                }

                vbuffer = new Float32Array(vbufferSize);
                index = 0;

                for (j = i; j < li; j++) {
                    message2 = messages[j];
                    job2 = message2.job;
                        
                    if (message2.signature == signature) {
                        buff = job2['vertexBuffer'];
                        job2['vertexBuffer'] = null;
                        for (k = 0, lk = buff.length; k < lk; k++) {
                            vbuffer[index+k] = buff[k];
                        }
                        index += lk;
                    }
                }

                job['vertexBuffer'] = vbuffer;
                message.arrays = [vbuffer.buffer];
                break;
                    
            case 'pixel-line':
            case 'line-label':
            case 'flat-rline':

                vbufferSize = job['vertexBuffer'].length;

                for (j = i + 1; j < li; j++) {
                    message2 = messages[j];

                    if (message2.signature == signature) {
                        message2.reduced = true;
                        vbufferSize += message2.job['vertexBuffer'].length;
                    }
                }

                vbuffer = new Float32Array(vbufferSize);
                var nbuffer = new Float32Array(vbufferSize);
                index = 0;

                for (j = i; j < li; j++) {
                    message2 = messages[j];
                    job2 = message2.job;
                        
                    if (message2.signature == signature) {
                        buff = job2['vertexBuffer'];
                        job2['vertexBuffer'] = null;
                            
                        if (type == 'line-label') {
                            buff2 = job2['texcoordsBuffer'];
                            job2['texcoordsBuffer'] = null;
                        } else {
                            buff2 = job2['normalBuffer'];
                            job2['normalBuffer'] = null;
                        }
                            
                        for (k = 0, lk = buff.length; k < lk; k++) {
                            vbuffer[index+k] = buff[k];
                            nbuffer[index+k] = buff2[k];
                        }

                        index += lk;

                        if (type == 'line-label') {
                            var files = job['files'];
                            var files2 = job2['files'];

                            for (k = 0, lk = files2.length; k < lk; k++) {
                                if (!files[k]) {
                                    files[k] = [];
                                }

                                for (var m = 0, lm = files2[k].length; m < lm; m++) {
                                    if (files[k].indexOf(files2[k][m]) == -1) {
                                        files[k].push(files2[k][m]);
                                    }
                                }
                            }
                        }
                    }
                }

                job['vertexBuffer'] = vbuffer;

                if (type == 'line-label') {
                    job['texcoordsBuffer'] = nbuffer;
                } else {
                    job['normalBuffer'] = nbuffer;
                }

                message.arrays = [vbuffer.buffer, nbuffer.buffer];
                break;
            }

            postMessage(message.job, message.arrays);
            
        } else if (!message.reduced) {

            postMessage(message.job, message.arrays);

        }
    }

    globals.messageBufferIndex = 0;
} 

self.onmessage = function (e) {
    var message = e.data;
    var command = message['command'];
    var data = message['data'];

    //console.log("workeronmessage: " + command);

    switch(command) {

    case 'setStylesheet':
        if (data) {
            globals.geocent = data['geocent'] || false;
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
        postMessage({'command' : 'ready'});
        break;

    case 'processGeodata':
        globals.tileLod = message['lod'] || 0;
        globals.tileSize = message['tileSize'] || 1;
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

