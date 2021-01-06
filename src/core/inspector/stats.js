

import {getCoreVersion} from '../core';


var InspectorStats = function(inspector) {
    this.inspector = inspector;
    this.core = inspector.core;
};


InspectorStats.prototype.init = function() {
    var inspector = this.inspector;
    inspector.addStyle(
        '#vts-stats-panel {'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'display: none;'
            + 'padding:15px;'
            + 'width: 305px;'
            + 'font-size: 14px;'
            + 'position: absolute;'
            + 'right: 10px;'
            + 'top: 10px;'
            + 'cursor: default;'
            + 'background-color: rgba(255,255,255,0.95);'
            + 'border-radius: 5px;'
            + 'border: solid 1px #ccc;'
            + 'text-align: left;'
            + 'z-index: 7;'
            + 'padding: 10px;'
        + '}'

        + '#vts-stats-panel-info {'
            + 'margin-top: 5px;'
            + 'margin-bottom: 3px;'
            + 'overflow: hidden;'
        + '}'

        + '#vts-stats-panel-info table {'
            + 'color:#000000;'
            + 'text-align: left;'
            + 'font-size: 12px;'
        + '}'

        + '#vts-stats-panel-info table td {'
            + 'vertical-align: top;'
        + '}'

        + '#vts-stats-panel-pos {'
            + 'width: 100%;'
        + '}'
    );

    this.element = document.createElement('div');
    this.element.id = 'vts-stats-panel';
    this.element.innerHTML =
        '<span id="vts-stats-panel-title">Render statistics &nbsp;&nbsp;&nbsp;v' + getCoreVersion() + '</h3>'+
        '<p id="vts-stats-panel-info"></p>'+
        '<input id="vts-stats-panel-pos" type="text">';

    this.core.element.appendChild(this.element);
    this.infoElement = document.getElementById('vts-stats-panel-info');
    this.posElement = document.getElementById('vts-stats-panel-pos');

    this.element.addEventListener('mouseup', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousedown', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousewheel', inspector.doNothing.bind(this), false);
    this.element.addEventListener('dblclick', inspector.doNothing.bind(this), false);

    this.panelVisible = false;
};


InspectorStats.prototype.showPanel = function() {
    this.element.style.display = 'block';
    this.panelVisible = true;
};


InspectorStats.prototype.hidePanel = function() {
    this.element.style.display = 'none';
    this.panelVisible = false;
};


InspectorStats.prototype.switchPanel = function() {
    if (this.panelVisible) {
        this.hidePanel();
    } else {
        this.showPanel();
    }
};


InspectorStats.prototype.updateStatsPanel = function(stats) {
    if (!this.infoElement || !this.panelVisible) {
        return;
    }
    var inspector = this.inspector;
    
    var text2 =
            'FPS: ' + Math.round(stats.fps) + '<br/>' +
            'Render time: ' + Math.round(stats.renderTime*1000) + '<br/>' +
            ' - resources: ' + Math.round(stats.gpuRenderUsed/(1024*1024)) + 'MB<br/>' +
            ' - topdown: ' + Math.round(stats.gpuNeeded/(1024*1024)) + 'MB<br/>' +
            //" - resources: " + (stats.gpuRenderUsed) + " --- " + (stats.gpuRenderUsed / stats.drawnTiles) + "<br/>" +
            'GPU Cache: ' + Math.round(stats.gpuUsed/(1024*1024)) + 'MB<br/>' +
            ' - textures: ' + Math.round(stats.gpuTextures/(1024*1024)) + 'MB<br/>' +
            ' - meshes: ' + Math.round(stats.gpuMeshes/(1024*1024)) + 'MB<br/>' +
            ' - geodata: ' + Math.round(stats.gpuGeodata/(1024*1024)) + 'MB<br/>' +
            'CPU Cache: ' + Math.round(stats.resourcesUsed/(1024*1024)) + 'MB<br/>' +
            'Metatile Cache: ' + Math.round(stats.metaUsed/(1024*1024)) + 'MB<br/>' +
//            "FOV: " + Math.round(this.core.getOption("fov")) + " deg<br/>" +
//            "viewHeight: " + Math.round(this.core.getOption("viewHeight")) + " m<br/>" +
//            "distance: " + Math.round(this.core.renderer.cameraDistance) + " m<br/>" +
            'Draw calls: ' + (stats.drawCalls) + '<br/>' +
            'Polygons: ' + (stats.drawnFaces) + '<br/><br/>' +
            'Terrain Height: ' + (stats.heightTerrain.toFixed(2)) + '<br/>' +
            '- float: ' + (stats.heightDelta.toFixed(2)) + '<br/>' +
            '- desired lod: ' + (stats.heightLod.toFixed(2)) + '<br/>' +
            '- used lod: ' + (stats.heightNode.toFixed(2)) + '<br/>' +
            '- used source: ' + ((stats.heightClass == 2 ? 'navtile' : stats.heightClass == 1 ? 'node': '---') ) + '<br/>' +
            'Terrain Radar Lod: ' + (inspector.radarLod) + '<br/><br/>' + 
            'Loaded/Errors: ' + (stats.loadedCount) + ' / ' + (stats.loadErrorCount) + '<br/>' +
            'Load time: ' + ((stats.loadLast - stats.loadFirst)*0.001).toFixed(2) + 's <br/>';

    var renderer = this.core.renderer;

    if (renderer) {
        text2 += '<br/>Render jobs: ' + renderer.totalJobs + '<br/>' +
                 'Drawn jobs: ' + renderer.drawnJobs + '<br/>' +
                 'Jobs total time: ' +  Math.round((renderer.jobsTimer2 - renderer.jobsTimer1)*1000) + '<br/>' +
                 'Jobs reduce time: ' + Math.round((renderer.jobsTimer4)*1000) + '<br/>';
    }

    if (stats.debugStr) {
        text2 += stats.debugStr + '<br/>';        
    }

    var text3 =  'PixelRatio: ' + (window.devicePixelRatio || 1).toFixed(3) +'<br/>'+
                 'BFRate: ' + Math.round(1000 / (stats.frameTime+0.00001)) +'<br/><br/>';

    var map = this.core.getMap();

    if (map) {
        text3 += 'ReduceMode: ' +'<br/>'+ map.config.mapFeaturesReduceMode +'<br/>'+
                 'ReduceParams: ' +'<br/>'+ JSON.stringify(map.config.mapFeaturesReduceParams) +'<br/><br/>';

        if (map.draw.debug.meshStats) {
            text3 += 'TexelsPerPoly: ' + (stats.meshesUVArea / Math.max(1,stats.meshesFaces)).toFixed(2) +'<br/><br/>';
        }
    }

    text3 += 'Metatiles: ' + (stats.processedMetatiles) +'<br/>'+
             'Metanodes: ' + (stats.processedNodes) + ' / ' + (stats.usedNodes) + '<br/>'+
             'GeodataTiles: ' + (stats.drawnGeodataTiles) + '<br/>';

    if (stats.octoNodes) {
        text3 += 'OctoNodes: ' + (stats.octoNodes) +'<br/>'+
                 'OctoNodesMem: ' + Math.round(stats.octoNodesMemSize/(1024*1024)) + 'MB<br/>';
    }

    text3 += '<br/>';

    if (renderer) {
        text3 += 'Nodes: ' + (renderer.drawnNodes) +'<br/><br/>';
    }

    text3 += 'Tiles: ' + (stats.drawnTiles) +'<br/>';

    for (var i =0, li = stats.renderedLods.length; i < li; i++) {
        if (stats.renderedLods[i]) {
            text3 += 'LOD ' + i + ': ' + (stats.renderedLods[i]) +'<br/>';
        }
    }


    var text = '<table style="width:305px"><tr><td>' + text2 + '</td><td>' + text3 + '</td></tr></table>';

    this.infoElement.innerHTML = text;

    if (map) {
        var p = map.getPosition();
        var s = '';
        s += p.getViewMode() + ',';
        var c = p.getCoords();
        s += c[0] + ',' + c[1] + ',' + p.getHeightMode() + ',' + c[2].toFixed(2) + ',';
        var o = p.getOrientation();
        s += o[0].toFixed(2) + ',' + o[1].toFixed(2) + ',' + o[2].toFixed(2) + ',';
        s += p.getViewExtent().toFixed(2) + ',' + p.getFov().toFixed(2);
        
        //var value = JSON.stringify(p.pos);

        if (this.posElement.value != s) {
            this.posElement.value = s;
        }
    }
};


export default InspectorStats;

