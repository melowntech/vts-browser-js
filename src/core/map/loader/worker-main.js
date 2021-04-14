
import {globals as globals_} from './worker-globals.js';
import {parseMesh as parseMesh_} from './worker-mesh.js';
import MapGeodataImport3DTiles2_ from '../geodata-import/3dtiles2';


//get rid of compiler mess
var globals = globals_;
var parseMesh = parseMesh_;
var MapGeodataImport3DTiles2 = MapGeodataImport3DTiles2_;

var packedEvents = [];
var packedTransferables = [];

function postPackedMessage(message, transferables) {

    if (globals.config.mapPackLoaderEvents) {

        packedEvents.push(message);

        if (transferables) {
            packedTransferables = packedTransferables.concat(transferables);
        }

    } else {

        if (transferables) {
            postMessage(message, transferables);
        } else {
            postMessage(message);
        }

    }
}

function loadBinary(path, onLoaded, onError, withCredentials, xhrParams, responseType, kind, options) {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (function (){

        switch (xhr.readyState) {
        case 0 : // UNINITIALIZED
        case 1 : // LOADING
        case 2 : // LOADED
        case 3 : // INTERACTIVE
            break;
        case 4 : // COMPLETED
    
            if (xhr.status >= 400 || xhr.status == 0) {
                if (onError) {
                    postPackedMessage({'command' : 'on-error', 'path': path, 'status':xhr.status});
                }
                break;
            }
    
            var abuffer = xhr.response;
                    
            if (!abuffer) {
                if (onError) {
                    postPackedMessage({'command' : 'on-error', 'path': path});
                }
                break;
            }
    
            if (onLoaded) {
                if (kind == 'direct-texture') {
                    createImageBitmap(abuffer).then((function(bitmap){
                        postPackedMessage({'command' : 'on-loaded', 'path': path, 'data': bitmap, 'filesize': abuffer.size}, [bitmap]);                        
                    }).bind(this));
                } else if (kind == 'direct-mesh') {
                    var data = parseMesh({data:new DataView(abuffer), index:0});
                    postPackedMessage({'command' : 'on-loaded', 'path': path, 'data': data.mesh}, data.transferables);
                } else if (kind == 'direct-3dtiles') {
                    //debugger
                    var data = parse3DTile(JSON.parse(abuffer), options);
                    //postPackedMessage({'command' : 'on-loaded', 'path': path, 'data': data.geodata}, data.transferables);
                    postMessage({'command' : 'on-loaded', 'path': path, 'data': data.geodata}, data.transferables);
                } else {
                    postPackedMessage({'command' : 'on-loaded', 'path': path, 'data': abuffer}, [abuffer]);
                }
            }
    
            break;
    
        default:
    
            if (onError) {
                postPackedMessage({'command' : 'on-error', 'path': path});
            }
    
            break;
        }

    }).bind(this);
    
    /*
    xhr.onerror  = (function() {
        if (onError) {
            onError();
        }
    }).bind(this);*/

    xhr.open('GET', path, true);
    xhr.responseType = responseType ? responseType : 'arraybuffer';
    xhr.withCredentials = withCredentials;

    if (options && options.size) {
        xhr.setRequestHeader('Range', 'bytes=' + options.offset + '-' + (options.offset + options.size));
    }

    if (xhrParams && xhrParams['token'] /*&& xhrParams["tokenHeader"]*/) {
        //xhr.setRequestHeader(xhrParams["tokenHeader"], xhrParams["token"]); //old way
        xhr.setRequestHeader('Accept', 'token/' + xhrParams['token'] + ', */*');
    }

    xhr.send('');
};

function parse3DTile(json, options) {

    var geodata = new MapGeodataImport3DTiles2();
    geodata.processJSON(json, options);

    return { geodata:{
                'bintree': geodata.bintree,
                'pathTable': geodata.pathTable,
                'totalNodes': geodata.totalNodes,
                'rootSize': geodata.rootSize,
                'points': geodata.rootPoints,
                'center': geodata.rootCenter,
                'radius': geodata.rootRadius,
                'texelSize': geodata.rootTexelSize
             },
             transferables:[geodata.bintree.buffer, geodata.pathTable.buffer]
           };

}

self.onmessage = function (e) {
    var message = e.data;
    var command = message['command'];
    //var data = message['data'];

    //console.log("workeronmessage: " + command);

    switch(command) {

        case 'config':
            globals.config = message['data'];
            break;

        case 'tick':

            if (packedEvents.length > 0) {
                if (packedTransferables.length > 0) {
                    postMessage({'command': 'packed-events', 'messages':packedEvents}, packedTransferables);
                } else {
                    postMessage({'command': 'packed-events', 'messages':packedEvents});
                }
            }

            packedEvents = [];
            packedTransferables = [];

            break;

        case 'load-binary':
            loadBinary(message['path'], true, true, message['withCredentials'], message['xhrParams'], message['responseType'], message['kind'], message['options']);
            break;

    }
};

