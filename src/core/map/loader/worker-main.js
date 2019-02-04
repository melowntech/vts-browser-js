
var config;

function loadBinary(path, onLoaded, onError, withCredentials, xhrParams, responseType, kind) {
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
                    onError(xhr.status);
                }
                break;
            }
    
            var abuffer = xhr.response;
                    
            if (!abuffer) {
                if (onError) {
                    postMessage({'command' : 'on-error', 'path': path});
                }
                break;
            }
    
            if (onLoaded) {
                if (kind == 'direct-texture') {
                    createImageBitmap(abuffer).then((function(bitmap){
                        postMessage({'command' : 'on-loaded', 'path': path, 'data': bitmap, 'filesize': abuffer.byteLength}, [bitmap]);                        
                    }).bind(this));
                } else {
                    postMessage({'command' : 'on-loaded', 'path': path, 'data': abuffer}, [abuffer]);
                }
            }
    
            break;
    
        default:
    
            if (onError) {
                postMessage({'command' : 'on-error', 'path': path});
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

    if (xhrParams && xhrParams['token'] /*&& xhrParams["tokenHeader"]*/) {
        //xhr.setRequestHeader(xhrParams["tokenHeader"], xhrParams["token"]); //old way
        xhr.setRequestHeader('Accept', 'token/' + xhrParams['token'] + ', */*');
    }

    xhr.send('');
};


self.onmessage = function (e) {
    var message = e.data;
    var command = message['command'];
    //var data = message['data'];

    //console.log("workeronmessage: " + command);

    switch(command) {

        case 'config':
            config = message['config'];
            break;

        case 'load-binary':
            loadBinary(message['path'], true, true, message['withCredentials'], message['xhrParams'], message['responseType'], message['kind']);
            break;

    }
};

