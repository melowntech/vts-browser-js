var browser, renderer, map, lastMessage = "";
var geodata, lineGeometry = null;
var demoTexture = null;
var usedMouseCoords = [0,0];
var linePoint, lineSegment = 0;
var distancePointer, heightPointer, heightPointer2;
var trackHeights = [], trackLengths = [];
var trackMinHeight, trackMaxHeight;
var canvas, canvasCtx, profileLink;
var pathLength = 0, pathDistance = 0;

(function startDemo() {
    // create map in the html div with id 'map-div'
    // parameter 'map' sets path to the map which will be displayed
    // you can create your own map on melown.com
    // position parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#position
    // view parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#definition-of-view
    browser = vts.browser('map-div', {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-Map-4/mapConfig.json',
        position : [ 'obj', 16.402434, 48.079867, 'float', 0.00, 9.60, -90.00, 0.00, 2595540.94, 45.00 ]
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }

    //move map controls little bit higher
    browser.ui.getControl('credits').getElement('vts-credits').setStyle('bottom', '134px');
    browser.ui.getControl('space').getElement('vts-space').setStyle('bottom', '140px');
    browser.ui.getControl('zoom').getElement('vts-zoom-plus').setStyle('bottom', '140px');
    browser.ui.getControl('zoom').getElement('vts-zoom-minus').setStyle('bottom', '140px');
    browser.ui.getControl('compass').getElement('vts-compass').setStyle('bottom', '170px');

    // create ui control with info pointers
    var infoPointers = browser.ui.addControl('info-pointers',
        '<div id="distance-div" class="distance-div">' +
        '</div>' +
        '<div id="height-div" class="distance-div">' +
        '</div>' +
        '<div id="height-div2" class="pointer-div2">' +
        '</div>');

    distancePointer = infoPointers.getElement('distance-div');
    heightPointer = infoPointers.getElement('height-div');
    heightPointer2 = infoPointers.getElement('height-div2');

    // create panel with path profile
    var profilePanel = browser.ui.addControl('profile-panel',
        '<div id="profile-div" class="profile-div">' +
            '<div id="profile-canvas-holder" class="profile-canvas-holder">' +
                '<canvas id="profile-canvas" class="profile-canvas">' +
                '</canvas>' + 
                '<div id="profile-link" class="profile-link">' +
                    'or you can try this <a id="profile-link-a" href="#">example track</a>' +
                '</div>' + 
            '</div>' + 
        '</div>');

    renderer = browser.renderer;

    //add mouse events to map element
    var mapElement = browser.ui.getMapElement();
    mapElement.on('mousemove', onMouseMove);
    mapElement.on('mouseleave', onMouseLeave);
    mapElement.on('dragover', onDragover);
    mapElement.on('drop', onDrop);
    mapElement.on('resize', onResize, window);

    //add mouse events to canvas element
    canvas = profilePanel.getElement('profile-canvas');
    canvas.on('mousemove', onCanvasHover);
    canvas.on('dragover', onDragover);
    canvas.on('drop', onDrop);
    canvasCtx = canvas.getElement().getContext("2d");
    drawCanvasMessage('Drop a GPX file here')

    profileLink = profilePanel.getElement('profile-link');
    profileLink.on('dragover', onDragover);
    profileLink.on('drop', onDrop);
    
    //add click event to the link
    profilePanel.getElement('profile-link-a').on('click', loadExampleTrack);

    //callback once is map config loaded
    browser.on('map-loaded', onMapLoaded);

    //callback when path hovered
    browser.on('geo-feature-hover', onFeatureHover);

    loadTexture();
})();


function loadTexture() {
    //load icon used for displaying path point
    var demoImage = vts.utils.loadImage(
        'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png',
        (function(){
            demoTexture = renderer.createTexture({ source: demoImage });
        }));
}

//add render slot for dynamic rendering
function onMapLoaded() {
    map = browser.map;
    map.addRenderSlot('custom-render', onCustomRender, true);
    map.moveRenderSlotAfter('after-map-render', 'custom-render');
}

// prevent default browser behaviour for droping files
function onDragover(event) {
    var e = event.event;
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
};

//load droped file
function onDrop(event) {
    if (!map) {
        return;
    }

    // prevent default browser behaviour for droping files
    var e = event.event;
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files; // Array of all files

    for (var i = 0, li = files.length; i < li; i++) {
        var reader = new FileReader();

        reader.onloadend = function (event) { 
            var parser = new DOMParser();
            var data = parser.parseFromString(event.target.result, 'text/xml');
            loadGPX(data); 
        };

        //remove old layyer and hide pointers
        map.removeFreeLayer('gpx-geodata');
        distancePointer.setStyle("display", "none");
        heightPointer.setStyle("display", "none");
        heightPointer2.setStyle("display", "none");
        profileLink.setStyle("display", "none");
        lineGeometry = null;

        drawCanvasMessage('Loading ...')
        reader.readAsText(files[i], 'text/plain');            
    }
}

function loadExampleTrack() {
    var onloaded = function (data) { 
        loadGPX(data); 
    };

    profileLink.setStyle("display", "none");

    drawCanvasMessage('Loading ...')
    vts.utils.loadXML('./test01.gpx', onloaded);
}

function getElementChildValue(element, name) {
    var child = element.getElementsByTagName(name)[0];
    if (child) {
        if(child.childNodes[0]) {
            return child.childNodes[0].nodeValue;
        }
    }

    return null;
}

function loadGPX(data) {
    var gpx = data.getElementsByTagName('gpx')[0];

    if (!gpx) {
        return;
    }

    var coords, heightMode, i, li, j, lj, points, name, properties;

    //crete geodaata
    geodata = map.createGeodata();

    //process way points
    var wayPoints = gpx.getElementsByTagName('wpt');

    if (wayPoints.length) {
        //create new group
        //all waypoints will be stored in this group
        geodata.addGroup('waypoints');

        for (i = 0, li = wayPoints.length; i < li; i++) {

            var wayPoint = wayPoints[i];
            coords = [wayPoint.getAttribute('lon'), wayPoint.getAttribute('lat'), 0];

            properties = {};

            name = getElementChildValue(wayPoint, 'name');
            if (name !== null) {
                properties.name = name;
            }

            var elevation = getElementChildValue(wayPoint, 'ele');
            if (elevation !== null) {
                heightMode = 'fix';
                coords[2] = parseFloat(elevation);
            } else {
                heightMode = 'float';
            }

            geodata.addPoint(coords, heightMode, properties);
        }
    }

    //process routes
    var routes = gpx.getElementsByTagName('rte');

    if (routes.length) {
        //create new group
        //all routes  will be stored in this group
        geodata.addGroup('routes');

        for (i = 0, li = routes.length; i < li; i++) {

            var route = routes[i];
            var routePoints = route.getElementsByTagName('rtept');

            points = new Array(routePoints.length);

            //add route points with their names
            for (j = 0, lj = routePoints.length; j < lj; j++) {
                var routePoint = routePoints[j]; 
                coords = [routePoint.getAttribute('lon'), routePoint.getAttribute('lat'), 0];

                properties = {};

                name = getElementChildValue(routePoint, 'name');
                if (name !== null) {
                    properties.name = name;
                }

                var elevation = getElementChildValue(routePoint, 'ele');
                if (elevation !== null) {
                    heightMode = 'fix';
                    coords[2] = parseFloat(elevation);
                } else {
                    heightMode = 'float';
                }

                geodata.addPoint(coords, heightMode, properties);
                points[j] = coords;
            }

            // add route line
            if (routePoints.length) {
                properties = {};

                var name = getElementChildValue(route, 'name');
                if (name !== null) {
                    properties.name = name;
                }

                geodata.addLineString(points, heightMode, properties, 'some-path');
            }
        }
    }

    //process tracks
    var tracks = gpx.getElementsByTagName('trk');

    if (tracks.length) {
        //create new group
        //all waypoints will be stored in this group
        geodata.addGroup('tracks');

        for (i = 0, li = tracks.length; i < li; i++) {
            var track = tracks[i];
            var trackSegments = track.getElementsByTagName('trkseg');

            // get total trak points
            var totalPoints = 0, trackPoints, index = 0;

            for (j = 0, lj = trackSegments.length; j < lj; j++) {
                trackPoints  = trackSegments[j].getElementsByTagName('trkpt');
                totalPoints += trackPoints.length;
            }

            points = new Array(totalPoints);

            for (j = 0, lj = trackSegments.length; j < lj; j++) {

                trackPoints = trackSegments[j].getElementsByTagName('trkpt');

                //add track points with their names
                for (var k = 0, lk = trackPoints.length; k < lk; k++) {
                    var trackPoint = trackPoints[k]; 
                    coords = [trackPoint.getAttribute('lon'), trackPoint.getAttribute('lat'), 0];

                    properties = {};

                    name = getElementChildValue(trackPoint, 'name');
                    if (name !== null) {
                        properties.name = name;
                    }

                    var elevation = getElementChildValue(trackPoint, 'ele');
                    if (elevation !== null) {
                        heightMode = 'fix';
                        coords[2] = parseFloat(elevation);
                    } else {
                        heightMode = 'float';
                    }

                    geodata.addPoint(coords, heightMode, properties);
                    points[index] = coords;
                    index++;
                }
            }

            //add track line
            if (points.length) {
                properties = {};

                var name = getElementChildValue(track, 'name');
                if (name !== null) {
                    properties.name = name;
                }

                geodata.addLineString(points, heightMode, properties, 'some-path');
            }

        }
    }

    drawCanvasMessage('Processing heights ...')
//    geodata.processHeights('heightmap-by-precision', 62, onHeightProcessed);
    geodata.processHeights('node-by-precision', 62, onHeightProcessed);
};

//when are heights converted then we can create free layer
// and dispaly that layer on the map
function onHeightProcessed() {
    //extrack gemteru with id == 'some-path'
    lineGeometry = geodata.extractGeometry('some-path');
    
    //center map postion to track gemetery
    centerPositonToGeometry(lineGeometry);

    //draw track profile
    drawPathProfile(lineGeometry);
  
    //style used for displaying geodata
    var style = {
        'constants': {
            '@icon-marker': ['icons', 6, 8, 18, 18]
        },
    
        'bitmaps': {
            'icons': 'http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png'
        },

        "layers" : {
            "track-line" : {
                "filter" : ["==", "#type", "line"],
                "line": true,
                "line-width" : 4,
                "line-color": [255,0,255,255],
                "zbuffer-offset" : [-5,0,0],
                "z-index" : -1
            },

            "track-shadow" : {
                "filter" : ["==", "#type", "line"],
                "line": true,
                "line-width" : 20,
                "line-color": [0,0,0,120],
                "zbuffer-offset" : [-5,0,0],
                "hover-event" : true,
                "advanced-hit" : true

            },

            "way-points" : {
                "filter" : ["all", ["==", "#type", "point"], ["==", "#group", "waypoints"]],
                "point": true,
                "point-radius" : 20,
                "point-color": [0,255,255,255],              
                "zbuffer-offset" : [-5,0,0]
            },

        }
    };

    //make free layer
    var freeLayer = geodata.makeFreeLayer(style);

    //add free layer to the map
    map.addFreeLayer('gpxgeodata', freeLayer);

    //add free layer to the list of free layers
    //which will be rendered on the map
    var view = map.getView();
    view.freeLayers.gpxgeodata = {};
    map.setView(view);
}

// move map position to the center of gemetru and adjust
// view extent to size of geometry
function centerPositonToGeometry(geometry) {
    if (!geometry.getElements()) {
        return;
    }

    //get detailed info about map reference frame
    var refFrame = map.getReferenceFrame();
    var navigationSrsId = refFrame.navigationSrs;
    var navigationSrs = map.getSrsInfo(navigationSrsId);
    var physicalSrsId = refFrame.physicalSrs;
    var physicalSrs = map.getSrsInfo(physicalSrsId);

    var i, li, midPoint = [0,0,0], line, vec3 = vts.vec3;

    //find center of gemetry
    for (i = 0, li = geometry.getElements() + 1; i < li; i++) {
        if (i == (li - 1)) { //last line point
            line = geometry.getElement(i-1);
            coords = line[1];
        } else {
            line = geometry.getElement(i);
            coords = line[0];
        }

        midPoint[0] += coords[0];
        midPoint[1] += coords[1];
        midPoint[2] += coords[2];
    };


    midPoint[0] /= li;
    midPoint[1] /= li;
    midPoint[2] /= li;

    // construct line which goes through the center of geometry
    // and mesure most distant point from this line

    var cameraPosition = midPoint;
    var cameraVector = [-cameraPosition[0], -cameraPosition[1], -cameraPosition[2]];
    vec3.normalize(cameraVector);

    var viewExtent = 500;                

    for (i = 0, li = geometry.getElements() + 1; i < li; i++) {
        if (i == (li - 1)) { //last line point
            line = geometry.getElement(i - 1);
            coords = line[1];
        } else {
            line = geometry.getElement(i);
            coords = line[0];
        }

        //get line point distance
        var ab = cameraVector;
        var av = [coords[0] - cameraPosition[0], coords[1] - cameraPosition[1], coords[2] - cameraPosition[2]];

        var b = [cameraPosition[0] + cameraVector[0], cameraPosition[1] + cameraVector[1], cameraPosition[2] + cameraVector[2]];
        var bv = [coords[0] - b[0], coords[1] - b[1], coords[2] - b[2]];

        var af = [0,0,0];
        vec3.cross(ab, av, af);

        var d = (vec3.length(bv) / vec3.length(ab)) * 2;

        if (d > viewExtent) {
            viewExtent = d;
        }
    }

    //limit view extent according to planet radius
    if (viewExtent > navigationSrs.a*1.4) {
        viewExtent = navigationSrs.a*1.4;
    }

    //convert coods from physical to nav
    var navCoords = vts.proj4(physicalSrs.srsDef, navigationSrs.srsDef, midPoint);
    navCoords[2] = 0;

    //set new map positon
    var pos = map.getPosition();
    pos.setCoords(navCoords);
    pos.setOrientation([0, -70, 0]);
    pos.setViewExtent(viewExtent);
    map.setPosition(pos);
}

//set heigth profile pointer accoring to current track position
function setProfilePointer(p) {
    var rect = canvas.getRect();
    var x = (pathDistance / pathLength) * rect.width;

    var rect2 = heightPointer.getRect();
    p = map.convertCoordsFromPhysToPublic(p); 

    heightPointer.setStyle('display', 'block');
    heightPointer.setStyle('left', (rect.left + x -(rect2.width*0.5)) + 'px');
    heightPointer.setStyle('top', (rect.top) + 'px');
    heightPointer.setHtml((p[2]).toFixed(2) + " m");

    heightPointer2.setStyle('display', 'block');
    heightPointer2.setStyle('left', (rect.left + x - 1) + 'px');
    heightPointer2.setStyle('top', (rect.top) + 'px');
}

//redraw track profile when browser window is resized
function onResize() {
    refereshCanvasDimensions();

    if (lastMessage) {
        drawCanvasMessage(lastMessage);
    } else {
        drawPathProfile(lineGeometry);
    }
}

//sets canvas size accoding to HTML element size
function refereshCanvasDimensions() {
    var rect = canvas.getRect();
    var canvasElement = canvas.getElement();
    if (canvasElement.width != rect.width) { 
        canvasElement.width = rect.width;
    }
    if (canvasElement.height != rect.height) {
        canvasElement.height = rect.height;
    }
    return [rect.width, rect.height];
}

//display status message in the canvas
function drawCanvasMessage(message) {
    lastMessage = message;
    var dim = refereshCanvasDimensions();
    canvasCtx.clearRect(0, 0, dim[0], dim[1]);
    canvasCtx.font="30px Arial, 'Helvetica Neue', Helvetica, sans-serif";
    canvasCtx.fillStyle = "rgba(0,0,0,1)";
    canvasCtx.fillText(message, dim[0]*0.5 - canvasCtx.measureText(message).width*0.5, 60);
}

//process track geometry and display track profile
function drawPathProfile(geometry) {
    if (!geometry) {
        return;
    }

    lastMessage = null; //prevent message rendering
    var totalElements = geometry.getElements();

    if (!totalElements) {
        return;
    }

    pathLength = geometry.getPathLength();

    trackHeights = new Array(totalElements);
    trackLengths = new Array(totalElements);
    trackMinHeight = Number.POSITIVE_INFINITY;
    trackMaxHeight = Number.NEGATIVE_INFINITY;

    var totalLength = 0;

    //get track point heights and length between track points
    for (var i = 0, li = totalElements; i < li; i++) {
        var l = geometry.getElement(i);
        var p = map.convertCoordsFromPhysToPublic(l[0]);
        trackHeights[i] = p[2];

        totalLength += vts.vec3.length([l[1][0] - l[0][0], l[1][1] - l[0][1], l[1][2] - l[0][2]]);
        trackLengths[i] = totalLength;

        if (p[2] > trackMaxHeight) {
            trackMaxHeight = p[2];
        }

        if (p[2] < trackMinHeight) {
            trackMinHeight = p[2];
        }
    }

    //draw track profile
    var dim = refereshCanvasDimensions();
    var lx = dim[0], ly = dim[1];

    canvasCtx.clearRect(0,0,lx,ly);
    canvasCtx.beginPath();
    canvasCtx.moveTo(-1,ly-1);

    if (trackMaxHeight == trackMinHeight) {
        canvasCtx.lineTo(lx,ly);
    } else {

        canvasCtx.lineTo(-1, (ly - 2) - ((trackHeights[0] - trackMinHeight) / (trackMaxHeight - trackMinHeight)) * (ly-30) );

        for (var i = 0, li = trackHeights.length; i < li; i++) {
            canvasCtx.lineTo((trackLengths[i]/pathLength)*lx, (ly - 2) - ((trackHeights[i] - trackMinHeight) / (trackMaxHeight - trackMinHeight)) * (ly-30) );
        }
    }

    canvasCtx.lineTo(lx,ly-1);
    canvasCtx.lineTo(0,ly-1);

    // Create gradient
    var grd = canvasCtx.createLinearGradient(0,0,0,ly);
    grd.addColorStop(0,"rgba(252,186,136,0.3)");
    grd.addColorStop(1,"rgba(94,45,18,0.3)");

    // Fill profile with gradient
    canvasCtx.fillStyle = grd;
    canvasCtx.fill();

    //draw profile outline
    canvasCtx.strokeStyle = "rgba(50,50,50,0.7)";
    canvasCtx.stroke();
}


function onMouseMove(event) {
    if (map) {
        var coords = event.getMouseCoords();
        usedMouseCoords = coords;
        //set map to hover cusor over provided coordinates permanently
        map.hover(coords[0], coords[1], true);
    }
}


function onMouseLeave(event) {
    if (map) {
        var coords = event.getMouseCoords();
        //stop cursor hovering
        map.hover(coords[0], coords[1], false);
    }
};


function onFeatureHover(event) {
    lineSegment = event.element;

    if (lineGeometry) { 
        //get distance of cursor on the line segment
        var res = lineGeometry.getRelationToCanvasPoint(lineSegment, usedMouseCoords[0], usedMouseCoords[1]);

        //get path length to line segment and length of the segment itself
        var lineSegmentInfo = lineGeometry.getPathLengthToElement(lineSegment);

        //compute path distance to point where cursor is hovering over the track
        pathDistance = lineSegmentInfo.lengthToElement + (lineSegmentInfo.elementLengh * vts.math.clamp(res.distance, 0, 1)); 

        //get point coodinates
        linePoint = lineGeometry.getPathPoint(pathDistance);

        //refresh pointer in height profile
        setProfilePointer(linePoint);

        //force redraw map (we have to redraw track point)
        map.redraw();
    }
}

function onCanvasHover(event) {
    if (map && lineGeometry) {
        var coords = event.getMouseCoords();
        usedMouseCoords = coords;

        //compute new path distance from cursor position in canvas
        var rect = canvas.getRect();
        pathDistance = ((coords[0] - rect.left) / canvas.getElement().width) * pathLength;

        //get point coodinates
        linePoint = lineGeometry.getPathPoint(pathDistance);

        //refresh pointer in height profile
        setProfilePointer(linePoint);

        //force redraw map (we have to redraw track point)
        map.redraw();
    }
}

function onCustomRender() {
    if (demoTexture && lineGeometry && linePoint) { //check whether texture is loaded

        //get canvas postion of the track point
        var p = map.convertCoordsFromPhysToCanvas(linePoint);

        //display distance pointer in the track point coordiantes
        var rect = distancePointer.getRect();
        distancePointer.setStyle("display", "block");
        distancePointer.setStyle("left", (p[0]-(rect.width*0.5)) + "px");
        distancePointer.setStyle("top", (p[1]-50) + "px");
        distancePointer.setHtml((pathDistance*0.001).toFixed(2) + " Km");

        //draw point image at the last line point
        renderer.drawImage({
            rect : [p[0]-12*1.5, p[1]-12*1.5, 24*1.5, 24*1.5],
            texture : demoTexture,
            color : [255,0,255,255],
            depth : p[2],
            depthTest : false,
            blend : true
            });
    }
}
