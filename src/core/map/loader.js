
var MapLoader = function(map, maxThreads) {
    this.map = map;

    this.maxThreads = maxThreads || 1;
    this.usedThreads = 0;
    this.maxPending = this.maxThreads * 2;
    this.fadeout = 19 / 20;

    this.pending = [[],[]];
    this.channel = 0;

    this.downloading = [];
    this.downloadingTime = [];
    this.lastDownloadTime = 0;
    this.downloaded = 0;
    this.updateThreadCount();
};


MapLoader.prototype.updateThreadCount = function(channel) {
    this.maxThreads = this.map.config.mapDownloadThreads;
    this.maxPending = Math.max(20, this.maxThreads * 2);
    this.fadeout = (this.maxPending-1) / this.maxPending;
};


MapLoader.prototype.setChannel = function(channel) {
    this.channel = channel;
};


MapLoader.prototype.load = function(path, downloadFunction, priority, id, kind) {
    var index = this.downloading.indexOf(path);

    if (index != -1) {
        return;
    }

    // update the pending list
    var pending = this.pending[this.channel];

   // put the request to the beginning of the pending list
    var index = this.map.searchArrayIndexById(pending, path);
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

        var a = (timer - this.downloadingTime[index]);
        if (Number.isNaN(a)) {
            a = a; 
        }

    }

    this.downloading.splice(index, 1);
    this.downloadingTime.splice(index, 1);
    //this.lastDownloadTime = Date.now();
    this.lastDownloadTime = timer;
    this.usedThreads--;
    this.map.markDirty();
    this.update();
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
    this.update();
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
    var stats = this.map.stats;

    var recordStats = this.map.draw.replay.storeLoaded;

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


MapLoader.prototype.update = function() {
    if (this.map.loaderSuspended) {
        return;
    }

    for (var i = this.pending.length - 1; i >= 0; i--) {
        if (this.pending[i].length > 0) {
            this.updateChannel(i);
            break;
        }
    }
};


export default MapLoader;

