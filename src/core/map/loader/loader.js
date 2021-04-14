
import {utils as utils_} from '../../utils/utils';

//get rid of compiler mess
var utils = utils_;


var MapLoader = function(map, maxThreads) {
    this.map = map;
    this.core = map.core;
    this.killed = false;
    this.config = map.config;

    this.maxThreads = maxThreads || 1;
    this.usedThreads = 0;
    this.maxPending = this.maxThreads * 2;
    this.fadeout = 19 / 20;

    this.pending = [[],[]];
    this.channel = 0;

    this.downloading = [];
    this.downloadingTime = [];
    this.workerTask = {};

    this.lastDownloadTime = 0;
    this.downloaded = 0;
    this.processWorker = null;
    this.updateThreadCount();

    if (this.config.mapSeparateLoader) {
        // eslint-disable-next-line
        var worker = require('worker-loader?inline&fallback=false!./worker-main');

        this.processWorker = new worker;
        
        this.processWorker.onerror = function(event){
            throw new Error(event.message + ' (' + event.filename + ':' + event.lineno + ')');
        };

        this.processWorker.onmessage = this.onWorkerMessage.bind(this);

        this.processWorker.postMessage({'command':'config', 'data': this.config});
    }

};


MapLoader.prototype.updateThreadCount = function() {
    this.maxThreads = this.config.mapDownloadThreads;
    this.maxPending = Math.max(20, this.maxThreads * 2);
    this.fadeout = (this.maxPending-1) / this.maxPending;
};


MapLoader.prototype.setChannel = function(channel) {
    this.channel = channel;
};


MapLoader.prototype.onWorkerMessage = function(message, direct) {
    if (this.killed) {
        return;
    }

    if (!direct) {
        message = message.data;
    }
    
    var command = message['command'];

    if (command == 'packed-events') {
        var messages = message['messages'];

        for (var i = 0, li = messages.length; i < li; i++) {
            this.onWorkerMessage(messages[i], true);
        }

        return;
    }

    var path = message['path'];

    var task = this.workerTask[path];
    if (task) {

        switch(command) {

            case 'on-loaded':

                if (task.onLoaded) {

                    switch(task.kind) {
                        case 'direct-texture':
                            task.onLoaded(message['data'], true, message['filesize']);
                            break;

                        case 'direct-mesh':
                            task.onLoaded(message['data'], false, true, message['filesize']);
                            break;

                        case 'texture':
                            task.onLoaded(new Blob([message['data']]));
                            break;

                        default:
                            task.onLoaded(message['data']);
                    }

                }

                break;

            case 'on-error':
                if (task.onError) {
                    task.onError();
                }

                break;
        }

        /*
        if (command == 'on-loaded') {

            if (task.onLoaded) {
                if (task.kind == 'texture') {
                    task.onLoaded(new Blob([message['data']]));
                } else {
                    task.onLoaded(message['data']);
                }
            }

        } else if (command == 'on-error') {

            if (task.onError) {
                task.onError();
            }
        }*/

        delete this.workerTask[path];
    }

};


MapLoader.prototype.processLoadBinary = function(path, onLoaded, onError, responseType, kind, options) {
    var withCredentials = (utils.useCredentials ? (this.mapLoaderUrl.indexOf(this.map.url.baseUrl) != -1) : false);

    if (this.processWorker) {

        switch(kind) {
            case 'texture':
                if (this.config.mapAsyncImageDecode) {
                    responseType = 'blob';
                    kind = 'direct-texture';
                }
                break;

            case 'mesh':
                if (this.config.mapParseMeshInWorker) {
                    kind = 'direct-mesh';
                }
                break;
        }

        switch(kind) {
            case 'texture':
            case 'direct-texture':
            case 'mesh':
            case 'pointcloud':
            case 'direct-mesh':
            case 'metadata':
            case 'geodata':
            case 'direct-3dtiles':

                //console.log("kind: " + kind + " " + "path: " + path);

                this.workerTask[path] = { onLoaded: onLoaded, onError: onError, kind: kind };
                this.processWorker.postMessage({'command':'load-binary', 'path': path, 'withCredentials':withCredentials, 'xhrParams':this.map.core.xhrParams, 'responseType':responseType, 'kind': kind, 'options': options});
                break;

            default:
                utils.loadBinary(path, onLoaded, onError, withCredentials, this.map.core.xhrParams, responseType);
        }

    } else {
        if (kind == 'texture' && this.config.mapAsyncImageDecode) {
            responseType = 'blob';
        }

        utils.loadBinary(path, onLoaded, onError, withCredentials, this.map.core.xhrParams, responseType);
    }
};


MapLoader.prototype.load = function(path, downloadFunction, priority, id, kind) {
    var index = this.downloading.indexOf(path);

    if (index != -1) {
        return;
    }

    // update the pending list
    var pending = this.pending[this.channel];

   // put the request to the beginning of the pending list
    index = this.map.searchArrayIndexById(pending, path);
    if (index != -1) {
        pending[index].priority = priority; 
    } else {
        pending.unshift({id:path, call: downloadFunction, priority : (priority || 0), tile:id, kind:kind });
    }

    //sort pending list by priority
    do {
        var sorted = true;
        
        for (var i = 0, li = pending.length - 1; i < li; i++) {
            if (pending[i].priority > pending[i+1].priority) {
                var t = pending[i];
                pending[i] = pending[i+1];
                pending[i+1] = t;
    
                sorted = false;
            } 
        }
        
    } while(!sorted);

    // keep the pending list at reasonable length
    if (pending.length > this.maxPending) {
        pending.pop();
    }
};


MapLoader.prototype.remove = function(path) {
    var index = this.map.searchArrayIndexById(this.pending[this.channel], path);
    if (index != -1) {
        this.pending[this.channel].splice(index, 1);
    }
};


MapLoader.prototype.onLoaded = function(item) {
    var index = this.downloading.indexOf(item.id);
    var timer = performance.now();
    var stats = this.map.stats;
    var recordStats = this.map.draw.replay.storeLoaded;

    if (recordStats) {
        this.map.draw.replay.loaded.push({
            url : item.id,
            kind : item.kind,
            tile: item.tile,
            priority : item.priority,
            time : timer,
            duration : timer - this.downloadingTime[index],
            interval : timer - this.lastDownloadTime,
            threads : this.downloading.length
        });

        //var a = (timer - this.downloadingTime[index]);
        //if (Number.isNaN(a)) {
            //a = a; 
        //}

    }

    this.downloading.splice(index, 1);
    this.downloadingTime.splice(index, 1);
    //this.lastDownloadTime = Date.now();
    this.lastDownloadTime = timer;
    this.usedThreads--;
    this.map.markDirty();
    this.update(true);
    stats.loadedCount++;
    stats.loadLast = timer;
};


MapLoader.prototype.onLoadError = function(item) {
    var index = this.downloading.indexOf(item.id);
    var timer = performance.now();
    var stats = this.map.stats;
    var recordStats = this.map.draw.replay.storeLoaded;

    if (recordStats) {
        this.map.draw.replay.loaded.push({
            url : item.id,
            kind : item.kind,
            tile: item.tile,
            priority : item.priority,
            time : timer,
            duration : timer - this.downloadingTime[index],
            interval : timer - this.lastDownloadTime,
            threads : this.downloading.length
        });
    }

    this.downloading.splice(index, 1);
    this.downloadingTime.splice(index, 1);
    //this.lastDownloadTime = Date.now();
    this.lastDownloadTime = timer;
    this.usedThreads--;
    this.map.markDirty();
    this.update(true);
    stats.loadErrorCount++;
    stats.loadLast = timer;
};


MapLoader.prototype.updateChannel = function(channel) {
    var pending = this.pending[channel];
    this.updateThreadCount();

    //reduce priority for pending stuff
    for (var i = 0, li = pending.length; i < li; i++) {
        pending[i].priority *= this.fadeout;
    }

    var timer = performance.now();

    while (pending.length > 0 && this.usedThreads < this.maxThreads) {
        var item = pending.shift();

        if (this.downloading.indexOf(item.id) == -1 && item.call != null) {
            this.downloading.push(item.id);
            this.downloadingTime.push(timer);
            this.usedThreads++;
            this.downloaded++;

            item.call(item.id, this.onLoaded.bind(this, item), this.onLoadError.bind(this, item));
        }
    }
};


MapLoader.prototype.update = function(skipTick) {
    if (this.map.loaderSuspended || this.core.contextLost) {
        return;
    }

    if (!skipTick && this.processWorker && this.config.mapPackLoaderEvents && this.downloading.length) {
        this.processWorker.postMessage({'command':'tick'});
    }

    for (var i = this.pending.length - 1; i >= 0; i--) {
        if (this.pending[i].length > 0) {
            this.updateChannel(i);
            break;
        }
    }
};


export default MapLoader;

