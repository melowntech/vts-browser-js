
var InspectorGraphs = function(inspector) {
    this.inspector = inspector;
    this.core = inspector.core;
};


InspectorGraphs.prototype.init = function() {
    var inspector = this.inspector;

    inspector.addStyle( ''
        + '#vts-graphs-panel {'
            + 'position:absolute;'
            + 'left:10px;'
            + 'top:10px;'
            + 'z-index: 7;'
            + 'background-color: #FFFFFF;'
            + 'padding: 5px;'
            + 'border-radius: 4px;'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'color:#000000;'
            + 'text-align: left;'
            + 'font-size: 12px;'
            + 'display:none;'
        + '}'

        + '.vts-graphs-canvas {'
            + 'border: solid 1px #bbb;'
            + 'image-rendering : pixelated;'
        + '}'

        + '.vts-graphs-info {'
            + 'padding: 5px 2px;'
            + 'font-size: 10px;'
        + '}'

        + '.vts-graphs-button {'
            + 'padding: 2px 5px;'
            + 'display:inline-block;'
            + 'margin-right: 4px;'
            + 'border-radius: 4px;'
            + 'cursor:pointer;'
        + '}'

        + '.vts-graphs-button:hover {'
            + 'box-shadow: 0 0 1px #0066ff;'
        + '}'
    );

    this.element = document.createElement('div');
    this.element.id = 'vts-graphs-panel';
    this.element.innerHTML = ''
        + '<canvas id="vts-graphs-render" class="vts-graphs-canvas" width="900" height="100" ></canvas>'
        + '<div id="vts-graphs-info" class="vts-graphs-info" >&FilledSmallSquare; Frame: 1234 &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: 1234 &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: 1234 &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Mesh: 1234 &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMesh: 1234</div>'
        + '<canvas id="vts-graphs-cache" class="vts-graphs-canvas" width="900" height="100" ></canvas>'
        + '<div id="vts-graphs-info2" class="vts-graphs-info" >&FilledSmallSquare; Cache: 1234 &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Used: 123 &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: 1234 &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> Mesh: &nbsp 1234</div>'
        + '<div id="vts-graphs-rec" class="vts-graphs-button" >Recording On</div>'
        + '<div id="vts-graphs-ref" class="vts-graphs-button" >Refresh On</div>'
        + '<div id="vts-graphs-res" class="vts-graphs-button" >Reset</div>'
        + '<div id="vts-graphs-zoom" class="vts-graphs-button" >Scale: Max value</div>'
        + '<div id="vts-graphs-magnify" class="vts-graphs-button" >Magnify Off</div>'
        + '<div id="vts-graphs-graph" class="vts-graphs-button" >Graph: Cache</div>';

    this.core.element.appendChild(this.element);
    this.canvasRender = document.getElementById('vts-graphs-render');
    this.canvasCache = document.getElementById('vts-graphs-cache');
    this.canvasRenderCtx = this.canvasRender.getContext('2d');
    this.canvasCacheCtx = this.canvasCache.getContext('2d');

    document.getElementById('vts-graphs-rec').onclick = this.recordingPressed.bind(this);

    document.getElementById('vts-graphs-rec').onclick = this.recordingPressed.bind(this);
    document.getElementById('vts-graphs-ref').onclick = this.refreshPressed.bind(this);
    document.getElementById('vts-graphs-res').onclick = this.resetPressed.bind(this);
    document.getElementById('vts-graphs-zoom').onclick = this.zoomPressed.bind(this);
    document.getElementById('vts-graphs-magnify').onclick = this.magnifyPressed.bind(this);
    document.getElementById('vts-graphs-graph').onclick = this.graphPressed.bind(this);

    document.getElementById('vts-graphs-render').onmousemove = this.onMouseMove.bind(this);
    document.getElementById('vts-graphs-render').onmouseout = this.onMouseOut.bind(this);
    document.getElementById('vts-graphs-cache').onmousemove = this.onMouseMove.bind(this);
    document.getElementById('vts-graphs-cache').onmouseout = this.onMouseOut.bind(this);

    this.element.addEventListener('mouseup', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousedown', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousewheel', inspector.doNothing.bind(this), false);
    this.element.addEventListener('dblclick', inspector.doNothing.bind(this), false);

    this.zoom = 'max';
    this.graph = 'Cache';
    this.refresh = true;

    this.panelVisible = false;
};


InspectorGraphs.prototype.showPanel = function() {
    this.element.style.display = 'block';
    this.panelVisible = true;
    this.recordingPressed(true);
};


InspectorGraphs.prototype.hidePanel = function() {
    this.element.style.display = 'none';
    this.panelVisible = false;
    this.recordingPressed(true);
};


InspectorGraphs.prototype.switchPanel = function() {
    if (this.panelVisible) {
        this.hidePanel();
    } else {
        this.showPanel();
    }
};


InspectorGraphs.prototype.recordingPressed = function(state) {
    var map = this.core.getMap();

    if (!map) {
        return;
    }

    map.stats.recordGraphs = (state == null) ? state : !map.stats.recordGraphs;
    this.updateGraphsPanel();
    this.updateGraphs(null, true);
};


InspectorGraphs.prototype.refreshPressed = function() {
    this.refresh = !this.refresh;
    this.updateGraphsPanel();
    this.updateGraphs();
};


InspectorGraphs.prototype.resetPressed = function() {
    var map = this.core.getMap();

    if (!map) {
        return;
    }

    map.stats.resetGraphs();
    this.updateGraphs(null, true);
};


InspectorGraphs.prototype.zoomPressed = function() {
    switch (this.zoom) {
    case 'max':     this.zoom = '120avrg'; break;
    case '120avrg': this.zoom = '180avrg'; break;
    case '180avrg': this.zoom = 'max'; break;
    }

    this.updateGraphsPanel();
    this.updateGraphs();
};


InspectorGraphs.prototype.graphPressed = function() {
    switch (this.graph) {
    case 'Cache':      this.graph = 'Polygons'; break;
    case 'Polygons':   this.graph = 'Processing'; break;
    case 'Processing': this.graph = 'LODs'; break;
    case 'LODs':       this.graph = 'Flux'; break;
    case 'Flux':       this.graph = 'Cache'; break;
    }

    this.updateGraphsPanel();
    this.updateGraphs();
};


InspectorGraphs.prototype.magnifyPressed = function() {
    this.magnify = !this.magnify;

    if (this.magnify) {
        this.canvasRender.style.width = '1400px';
        this.canvasRender.style.height = '200px';
        this.canvasCache.style.width = '1400px';
        this.canvasCache.style.height = '200px';
        document.getElementById('vts-graphs-magnify').innerHTML = 'Magnify On';
    } else {
        this.canvasRender.style.width = '900px';
        this.canvasRender.style.height = '100px';
        this.canvasCache.style.width = '900px';
        this.canvasCache.style.height = '100px';
        document.getElementById('vts-graphs-magnify').innerHTML = 'Magnify Off';
    }

    this.updateGraphsPanel();
    this.updateGraphs();
};


InspectorGraphs.prototype.updateGraphsPanel = function() {
    var map = this.core.getMap();

    if (!map) {
        return;
    }

    if (map.stats.recordGraphs) {
        document.getElementById('vts-graphs-rec').innerHTML = 'Recording On';
    } else {
        document.getElementById('vts-graphs-rec').innerHTML = 'Recording Off';
    }

    if (this.refresh) {
        document.getElementById('vts-graphs-ref').innerHTML = 'Refresh On';
    } else {
        document.getElementById('vts-graphs-ref').innerHTML = 'Refresh Off';
    }

    switch (this.zoom) {
    case 'max':
        document.getElementById('vts-graphs-zoom').innerHTML = 'Scale: Max value';
        break;

    case '120avrg':
        document.getElementById('vts-graphs-zoom').innerHTML = 'Scale: 100% Avrg';
        break;

    case '180avrg':
        document.getElementById('vts-graphs-zoom').innerHTML = 'Scale: 50% Avrg';
        break;
    }

    document.getElementById('vts-graphs-graph').innerHTML = 'Graph: ' + this.graph;
};


InspectorGraphs.prototype.onMouseMove = function(event) {
    var x = event.clientX - this.canvasRender.getBoundingClientRect().left;
    this.showCursor = true;

    if (this.magnify) {
        x = Math.floor(x * 900/1400);
    }

    this.cursorIndex = x;

    var map = this.core.getMap();
    if (!map) {
        return;
    }

    if (!map.stats.recordGraphs) {
        this.updateGraphs(null);
    }
};


InspectorGraphs.prototype.onMouseOut = function() {
    this.showCursor = false;
    this.updateGraphs(null);
};


InspectorGraphs.prototype.updateGraphs = function(stats, ignoreRefresh) {
    var map = this.core.getMap();

    if (!map || (!this.refresh && !ignoreRefresh) || !this.panelVisible) {
        return;
    }

    stats = stats || map.stats;

    var width = this.canvasRender.width;
    var height = this.canvasRender.height;
    var ctx = this.canvasRenderCtx;

    var samples = stats.graphsTimeSamples;
    var samplesIndex = stats.graphsTimeIndex;

    var factorX = width / samples;

    ctx.clearRect(0, 0, width, height);

    var maxValue = 0;
    var totalFrame = 0;
    var totalRender = 0;
    var totalTexture = 0;
    var totalMeshes = 0;
    var totalGpuMeshes = 0;
    var realCount = 0, i, j, lj;
    var index, value, values, str, y, factorY, max, min;

    var valuesFrame = stats.graphsFrameTimes;
    var valuesRender = stats.graphsRenderTimes;
    var valuesTextures = stats.graphsCreateTextureTimes;
    var valuesMeshes = stats.graphsCreateMeshTimes;
    var valuesGpuMeshes = stats.graphsCreateGpuMeshTimes;
    var valuesGeodata;

    for (i = 0; i < samples; i++) {
        totalFrame += valuesFrame[i];
        totalRender += valuesRender[i];
        totalTexture += valuesTextures[i];
        totalMeshes += valuesMeshes[i];
        totalGpuMeshes += valuesGpuMeshes[i];

        var v = valuesFrame[i];

        if (v > maxValue) {
            maxValue = v;
        }

        if (v > 0) {
            realCount++;
        }
    }

    if (this.zoom == '120avrg') {
        maxValue = (totalFrame / realCount) * 1.0;
    }

    if (this.zoom == '180avrg') {
        maxValue = (totalFrame / realCount) * 0.5;
    }

    factorY = height / maxValue;

    for (i = 0; i < samples; i++) {
        index = samplesIndex + i;
        index %= samples;

        ctx.fillStyle='#000000';
        ctx.fillRect(i*factorX, height, 1, -(valuesFrame[index])*factorY);
        ctx.fillStyle='#ff0000';
        ctx.fillRect(i*factorX, height, 1, -(valuesRender[index])*factorY);

        ctx.fillStyle='#0000ff';
        ctx.fillRect(i*factorX, height, 1, -(valuesTextures[index])*factorY);

        y = height -(valuesTextures[index])*factorY;

        ctx.fillStyle='#007700';
        ctx.fillRect(i*factorX, y, 1, -(valuesMeshes[index])*factorY);

        y -= (valuesMeshes[index])*factorY;

        ctx.fillStyle='#00ff00';
        ctx.fillRect(i*factorX, y, 1, -(valuesGpuMeshes[index])*factorY);

    }

    if (this.showCursor) {
        ctx.fillStyle='#aa00aa';
        index = (this.cursorIndex) % samples;
        ctx.fillRect(Math.floor(index*factorX)-1, 0, 1, height);
        ctx.fillRect(Math.floor(index*factorX)+1, 0, 1, height);
        index = (this.cursorIndex + samplesIndex) % samples;

        str = '&FilledSmallSquare; Frame: ' + valuesFrame[index].toFixed(2) +
              ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: ' + valuesRender[index].toFixed(2) +
              ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + valuesTextures[index].toFixed(2) +
              ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + valuesMeshes[index].toFixed(2) +
              ' &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMeshes: ' + valuesGpuMeshes[index].toFixed(2) + '</div>';
    } else {
        str = '&FilledSmallSquare; Frame: ' + Math.round(totalFrame) +
              ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Render: ' + Math.round(totalRender) +
              ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Textures: ' + Math.round(totalTexture) +
              ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Meshes: ' + Math.round(totalMeshes) +
              ' &nbsp <span style="color:#00bb00">&FilledSmallSquare;</span> GpuMeshes: ' + Math.round(totalGpuMeshes) +'</div>';
    }

    document.getElementById('vts-graphs-info').innerHTML = str;

    width = this.canvasCache.width;
    height = this.canvasCache.height;
    ctx = this.canvasCacheCtx;

    factorX = width / samples;

    ctx.clearRect(0, 0, width, height);

    switch (this.graph) {
    case 'Cache':
        {
            factorY = height / ((map.gpuCache.maxCost+map.resourcesCache.maxCost+map.metatileCache.maxCost));

            var maxMetatiles = 0;
            var maxResources = 0;
            var maxTextures = 0;
            var maxMeshes = 0;
            var maxGeodata = 0;
            var maxGpu = 0;

            var valuesMetatiles = stats.graphsCpuMemoryMetatiles;
            var valuesResources = stats.graphsCpuMemoryUsed;
            var valuesGpu = stats.graphsGpuMemoryRender;
            valuesGeodata = stats.graphsGpuMemoryGeodata;
            valuesTextures = stats.graphsGpuMemoryTextures;
            valuesMeshes = stats.graphsGpuMemoryMeshes;

            for (i = 0; i < samples; i++) {
                maxMetatiles = valuesMetatiles[i] > maxMetatiles ? valuesMetatiles[i] : maxMetatiles;
                maxResources = valuesResources[i] > maxResources ? valuesResources[i] : maxResources;
                maxTextures = valuesTextures[i] > maxTextures ? valuesTextures[i] : maxTextures;
                maxMeshes = valuesMeshes[i] > maxMeshes ? valuesMeshes[i] : maxMeshes;
                maxGeodata = valuesGeodata[i] > maxGeodata ? valuesGeodata[i] : maxGeodata;
                maxGpu = valuesGpu[i] > maxGpu ? valuesGpu[i] : maxGpu;
            }

            for (i = 0; i < samples; i++) {
                index = samplesIndex + i;
                index %= samples;

                value = valuesMetatiles[index] + valuesMeshes[index] + valuesTextures[index] + valuesGeodata[index] + valuesResources[index];
                ctx.fillStyle='#000000';
                ctx.fillRect(i*factorX, height, 1, -(value)*factorY);
                value -= valuesResources[index];

                ctx.fillStyle='#0000ff';
                ctx.fillRect(i*factorX, height, 1, -(value)*factorY);
                value -= valuesTextures[index];

                ctx.fillStyle='#009999';
                ctx.fillRect(i*factorX, height, 1, -(value)*factorY);
                value -= valuesGeodata[index];

                ctx.fillStyle='#007700';
                ctx.fillRect(i*factorX, height, 1, -(value)*factorY);
                value -= valuesMeshes[index];

                ctx.fillStyle='#ff0000';
                ctx.fillRect(i*factorX, height, 1, -(value)*factorY);

                value = valuesGpu[index];
                ctx.fillStyle='#ffff00';
                ctx.fillRect(i*factorX, height -(value)*factorY, 1, 1);
            }

            if (this.showCursor) {
                index = (this.cursorIndex + samplesIndex) % samples;
                str = '<span style="color:#555">&FilledSmallSquare;</span> Total: ' + Math.ceil((valuesMetatiles[index] + valuesResources[index] + valuesTextures[index] + valuesMeshes[index])/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#000000">&FilledSmallSquare;</span> CPU: ' + Math.ceil(valuesResources[index]/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#000000">&FilledSmallSquare;</span> GPU: ' + Math.ceil((valuesTextures[index] + valuesMeshes[index])/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Te: ' + Math.ceil(valuesTextures[index]/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Me: ' + Math.ceil(valuesMeshes[index]/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#009999">&FilledSmallSquare;</span> Ge: ' + Math.ceil(valuesGeodata[index]/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Met: ' + Math.ceil(valuesMetatiles[index]/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#ffff00">&FilledSmallSquare;</span> Render: ' + Math.ceil(valuesGpu[index]/(1024*1024)) + 'MB' +'</div>';
            } else {
                str = '<span style="color:#555">&FilledSmallSquare;</span> Total: ' + Math.round((maxMetatiles + maxResources + maxTextures + maxMeshes)/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#000000">&FilledSmallSquare;</span> CPU: ' + Math.ceil(maxResources/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#000000">&FilledSmallSquare;</span> GPU: ' + Math.ceil((maxTextures + maxMeshes)/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#0000ff">&FilledSmallSquare;</span> Te ' + Math.ceil(maxTextures/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#005500">&FilledSmallSquare;</span> Me: ' + Math.ceil(maxMeshes/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#009999">&FilledSmallSquare;</span> Ge: ' + Math.ceil(maxGeodata/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#ff0000">&FilledSmallSquare;</span> Met: ' + Math.ceil(maxMetatiles/(1024*1024)) + 'MB' +
                      ' &nbsp <span style="color:#ffff00">&FilledSmallSquare;</span> Render: ' + Math.ceil(maxGpu/(1024*1024)) + 'MB' +'</div>';
            }

        }
        break;


    case 'Polygons':
    case 'Processing':
        {
            max = 0;
            min = 99999999999;
            realCount = 0;
            values = (this.graph == 'Polygons') ? stats.graphsPolygons : stats.graphsBuild;
            var total = 0;

            for (i = 0; i < samples; i++) {
                max = values[i] > max ? values[i] : max;

                if (values[i] > 0) {
                    min = values[i] < min ? values[i] : min;
                    total += values[i];
                    realCount++;
                }
            }

            factorY = height / max;

            for (i = 0; i < samples; i++) {
                index = samplesIndex + i;
                index %= samples;

                ctx.fillStyle='#007700';
                ctx.fillRect(i*factorX, height, 1, -(values[index])*factorY);
            }

            if (this.showCursor) {
                index = (this.cursorIndex + samplesIndex) % samples;
                str = '<span style="color:#007700">&FilledSmallSquare;</span> ' + this.graph + ' Max: ' + Math.round(values[index]) +'</div>';
            } else {
                str = '<span style="color:#007700">&FilledSmallSquare;</span> ' + this.graph + ' Max: ' + max +'</div>';
                str += ' &nbsp Min: ' + min;
                str += ' &nbsp Avrg: ' + Math.round(total / realCount) +'</div>';
            }
        }
        break;


    case 'LODs':
        {
            max = 0;
            values = stats.graphsLODs;

            for (i = 0; i < samples; i++) {
                max = values[i][0] > max ? values[i][0] : max;
            }

            factorY = height / max;

            ctx.fillStyle='#000000';
            ctx.fillRect(0, 0, width, height);

            var lods;

            for (i = 0; i < samples; i++) {
                index = samplesIndex + i;
                index %= samples;

                //ctx.fillStyle="#000000";
                //ctx.fillRect(i*factorX, height, 1, -(values[index][0])*factorY);

                y = height;
                
                lods = values[index][1]; 

                for (j = 0, lj = lods.length; j < lj; j++) {
                    if (lods[j]) {
                        ctx.fillStyle='hsl('+((j*23)%360)+',100%,50%)';
                        value = Math.round((lods[j])*factorY);
                        ctx.fillRect(i*factorX, y, 1, -value);
                        y -= value;
                    }
                }

            }

            if (this.showCursor) {
                index = (this.cursorIndex + samplesIndex) % samples;

                str = 'LODs:' + values[index][0];
                lods = values[index][1]; 

                for (j = 0, lj = lods.length; j < lj; j++) {
                    if (lods[j]) {
                        str += '<span style="color:hsl('+((j*23)%360)+',100%,50%)">&FilledSmallSquare;</span>'+j+':'+lods[j];
                    }
                }

            } else {
                str = 'LODs:' + values[index][0];
            }

            str += '</div>';
        }
        break;

    case 'Flux':
        {
            var maxCount = 0;
            var maxSize = 0;

            var maxTexPlusCount = 0;
            var maxTexPlusSize = 0;
            var maxTexMinusCount = 0;
            var maxTexMinusSize = 0;

            var maxMeshPlusCount = 0;
            var maxMeshPlusSize = 0;
            var maxMeshMinusCount = 0;
            var maxMeshMinusSize = 0;

            var maxGeodataPlusCount = 0;
            var maxGeodataPlusSize = 0;
            var maxGeodataMinusCount = 0;
            var maxGeodataMinusSize = 0;

            valuesTextures = stats.graphsFluxTextures;
            valuesMeshes = stats.graphsFluxMeshes;
            valuesGeodata = stats.graphsFluxGeodatas;

            for (i = 0; i < samples; i++) {
                var tmp = valuesTextures[i][0][0] + valuesMeshes[i][0][0];
                maxCount = tmp > maxCount ? tmp : maxCount;
                tmp = valuesTextures[i][1][0] + valuesMeshes[i][1][0];
                maxCount = tmp > maxCount ? tmp : maxCount;

                tmp = valuesTextures[i][0][1] + valuesMeshes[i][0][1];
                maxSize = tmp > maxSize ? tmp : maxSize;
                tmp = valuesTextures[i][1][1] + valuesMeshes[i][1][1];
                maxSize = tmp > maxSize ? tmp : maxSize;

                maxTexPlusCount = valuesTextures[i][0][0] > maxTexPlusCount ? valuesTextures[i][0][0] : maxTexPlusCount;
                maxTexPlusSize = valuesTextures[i][0][1] > maxTexPlusSize ? valuesTextures[i][0][1] : maxTexPlusSize;
                maxTexMinusCount = valuesTextures[i][1][0] > maxTexMinusCount ? valuesTextures[i][1][0] : maxTexMinusCount;
                maxTexMinusSize = valuesTextures[i][1][1] ? valuesTextures[i][1][1] : maxTexMinusSize;

                maxMeshPlusCount = valuesMeshes[i][0][0] > maxMeshPlusCount ? valuesMeshes[i][0][0] : maxMeshPlusCount;
                maxMeshPlusSize = valuesMeshes[i][0][1] > maxMeshPlusSize ? valuesMeshes[i][0][1] : maxMeshPlusSize;
                maxMeshMinusCount = valuesMeshes[i][1][0] > maxMeshMinusCount ? valuesMeshes[i][1][0] : maxMeshMinusCount;
                maxMeshMinusSize = valuesMeshes[i][1][1] > maxMeshMinusSize ? valuesMeshes[i][1][1] : maxMeshMinusSize;

                maxGeodataPlusCount = valuesGeodata[i][0][0] > maxGeodataPlusCount ? valuesGeodata[i][0][0] : maxGeodataPlusCount;
                maxGeodataPlusSize = valuesGeodata[i][0][1] > maxGeodataPlusSize ? valuesGeodata[i][0][1] : maxGeodataPlusSize;
                maxGeodataMinusCount = valuesGeodata[i][1][0] > maxGeodataMinusCount ? valuesGeodata[i][1][0] : maxGeodataMinusCount;
                maxGeodataMinusSize = valuesGeodata[i][1][1] > maxGeodataMinusSize ? valuesGeodata[i][1][1] : maxGeodataMinusSize;
            }

            factorY = (height*0.25-2) / maxCount;
            var factorY2 = (height*0.25-2) / maxSize;

            var base = Math.floor(height*0.25);
            var base2 = Math.floor(height*0.75);

            for (i = 0; i < samples; i++) {
                index = samplesIndex + i;
                index %= samples;
                
                var y1Up = base;
                var y1Down = base+1;
                var y2Up = base2;
                var y2Down = base2+1;

                ctx.fillStyle='#0000aa';
                ctx.fillRect(i*factorX, y1Up, 1, -(valuesTextures[index][0][0])*factorY);
                ctx.fillRect(i*factorX, y1Down, 1, (valuesTextures[index][1][0])*factorY);

                ctx.fillRect(i*factorX, y2Up, 1, -(valuesTextures[index][0][1])*factorY2);
                ctx.fillRect(i*factorX, y2Down, 1, (valuesTextures[index][1][1])*factorY2);

                y1Up -= (valuesTextures[index][0][0])*factorY;
                y1Down += (valuesTextures[index][1][0])*factorY;
                y2Up -= (valuesTextures[index][0][1])*factorY2;
                y2Down += (valuesTextures[index][1][1])*factorY2;

                ctx.fillStyle='#007700';
                ctx.fillRect(i*factorX, y1Up, 1, -(valuesMeshes[index][0][0])*factorY);
                ctx.fillRect(i*factorX, y1Down, 1, (valuesMeshes[index][1][0])*factorY);

                ctx.fillRect(i*factorX, y2Up, 1, -(valuesMeshes[index][0][1])*factorY2);
                ctx.fillRect(i*factorX, y2Down, 1, (valuesMeshes[index][1][1])*factorY2);

                y1Up -= (valuesMeshes[index][0][0])*factorY;
                y1Down += (valuesMeshes[index][1][0])*factorY;
                y2Up -= (valuesMeshes[index][0][1])*factorY2;
                y2Down += (valuesMeshes[index][1][1])*factorY2;

                ctx.fillStyle='#009999';
                ctx.fillRect(i*factorX, y1Up, 1, -(valuesGeodata[index][0][0])*factorY);
                ctx.fillRect(i*factorX, y1Down, 1, (valuesGeodata[index][1][0])*factorY);

                ctx.fillRect(i*factorX, y2Up, 1, -(valuesGeodata[index][0][1])*factorY2);
                ctx.fillRect(i*factorX, y2Down, 1, (valuesGeodata[index][1][1])*factorY2);

                ctx.fillStyle='#aaaaaa';
                ctx.fillRect(0, Math.floor(height*0.5), width, 1);
                ctx.fillStyle='#dddddd';
                ctx.fillRect(0, base, width, 1);
                ctx.fillRect(0, base2, width, 1);
            }


            if (this.showCursor) {
                index = (this.cursorIndex + samplesIndex) % samples;
                str = '<span style="color:#007700">&FilledSmallSquare;</span> Textures Count +/-: ' + valuesTextures[index][0][0] + '/' + valuesTextures[index][1][0];
                str += ' &nbsp Size +/-: ' + (valuesTextures[index][0][1]/1024/1024).toFixed(2) + '/' + (valuesTextures[index][1][1]/1024/1024).toFixed(2);
                str += ' &nbsp <span style="color:#0000aa">&FilledSmallSquare;</span> Meshes Count +/-: ' + valuesMeshes[index][0][0] + '/' + valuesMeshes[index][1][0];
                str += ' &nbsp Size +/-: ' + (valuesMeshes[index][0][1]/1024/1024).toFixed(2) + '/' + (valuesMeshes[index][1][1]/1024/1024).toFixed(2);
                str += ' &nbsp <span style="color:#009999">&FilledSmallSquare;</span> Geodata Count +/-: ' + valuesGeodata[index][0][0] + '/' + valuesGeodata[index][1][0];
                str += ' &nbsp Size +/-: ' + (valuesGeodata[index][0][1]/1024/1024).toFixed(2) + '/' + (valuesGeodata[index][1][1]/1024/1024).toFixed(2);
                str += '</div>';
            } else {
                str = '<span style="color:#007700">&FilledSmallSquare;</span> Textures Count +/-: ' + maxTexPlusCount + '/' + maxTexMinusCount;
                str += ' &nbsp Size +/-: ' + (maxTexPlusSize/1024/1024).toFixed(2) + '/' + (maxTexMinusSize/1024/1024).toFixed(2);
                str += ' &nbsp <span style="color:#0000aa">&FilledSmallSquare;</span> Meshes Count +/-: ' + maxMeshPlusCount + '/' + maxMeshMinusCount;
                str += ' &nbsp Size +/-: ' + (maxMeshPlusSize/1024/1024).toFixed(2) + '/' + (maxMeshMinusSize/1024/1024).toFixed(2);
                str += ' &nbsp <span style="color:#009999">&FilledSmallSquare;</span> Geodata Count +/-: ' + maxGeodataPlusCount + '/' + maxGeodataMinusCount;
                str += ' &nbsp Size +/-: ' + (maxGeodataPlusSize/1024/1024).toFixed(2) + '/' + (maxGeodataMinusSize/1024/1024).toFixed(2);
                str += '</div>';
            }

        }
        break;

    }

    if (this.showCursor) {
        ctx.fillStyle='#aa00aa';
        index = (this.cursorIndex) % samples;
        ctx.fillRect(Math.floor(index*factorX)-1, 0, 1, height);
        ctx.fillRect(Math.floor(index*factorX)+1, 0, 1, height);
    }

    document.getElementById('vts-graphs-info2').innerHTML = str;
};


export default InspectorGraphs;

