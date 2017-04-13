
import {utils as utils_} from '../../core/utils/utils';

//get rid of compiler mess
var utils = utils_;


var RoiLoadingQueue = function(options) {
    this.options = options;

    // states
    this.stateDownloaded = 'downloaded';
    this.stateFailed = 'failed';
    this.stateBegin = 'begin';

    // queues
    this.enqueued = [];
    this.inProgress = [];
    this.finished = [];

    // event listeners
    this.listeners = {
        downloaded : [],
        failed : [],
        begin : []
    };

    // options properties
    this.slots = 1;
    this.finishedSlots = 5;

    if (typeof this.options === 'object' && this.options !== null) {
        this.slots = this.options.slots || 1;
        this.finishedSlots = this.options.finishedSlots || 5;
    }
};

/**
 * @enum {int}
 */
RoiLoadingQueue.Status = {
    Enqueued : 0,
    Downloading : 1,
    Finished : 2,
    Error : -1
};

/**
 * @enum {int}
 */
RoiLoadingQueue.Type = {
    Binary : 0,
    JSON : 1,
    Image : 2
}
RoiLoadingQueue.TypeCheck = function(type) {
    var keys = Object.keys(RoiLoadingQueue.Type);
    var valid = false;
    for (var i in keys) {
        if (RoiLoadingQueue.Type[keys[i]] === type) {
            valid = true;
            break;
        }
    }
    return valid;
};

// Public methods

// Type is required hint for queue
RoiLoadingQueue.prototype.enqueue = function(resourceUrl, type, clb) {
    var clb = clb || function(){};

    if (typeof resourceUrl !== 'string'
        ) {// TODO: || !URLSanity(resourceUrl)) {
        var err = new Error('Loading Queue: URL given to enqueue is not valid URL');
        console.error(err);
        clb(err);
        return null;
    }

    if (!RoiLoadingQueue.TypeCheck(type)) {
        var err = new Error('Loading Queue: Given hint type is not valid type');
        console.error(err);
        clb(err);
        return null;
    }

    // find item and update (or create if doesnt exists yet)
    var item = this.pickItem(resourceUrl);
    if (item === null) {
        item = {
            url : resourceUrl,
            type : type,
            state : RoiLoadingQueue.Status.Enqueued,
            clb : [clb],
            data : null
        }
    } else {
        if (item.state === PanoLoadingQueue.Status.Enqueued) {
            item.type = type;

            var insertCallback = true;
            for (var i in item.clb) {
                if (item.clb[i] === clb) {
                    insertCallback = false;
                    break;
                }
            }
            if (insertCallback) {
                item.clb = clb;
            }
        }
    }

    // enqueue item to proper queue
    if (item.state === RoiLoadingQueue.Status.Enqueued) {
        this.enqueued.push(item);
    } else if (item.state === RoiLoadingQueue.Status.Downloading) {
        this.inProgress.push(item);
    } else if (item.state === RoiLoadingQueue.Status.Finished) {
        this.finished.push(item);
        clb(null, item);
    }

    this.next();

    return item;
};


RoiLoadingQueue.prototype.dequeue = function(resourceUrl) {
    var item = this.pickItem(resourceUrl);
    if (item.state === RoiLoadingQueue.Status.Downloading) {
        this.cancel(item);
    }
    return item;
};


RoiLoadingQueue.prototype.on = function(event, action) {
    if (typeof action !== 'function'
        || (event !== this.stateDownloaded
            && event !== this.stateFailed
            && event !== this.stateBegin)) {
        return;
    }
    for (var i in this.listeners[event]) {
        if (this.listeners[event][i] === action) {
            this.listeners[event].push(action);
        }
    }
};


RoiLoadingQueue.prototype.removeListener = function(event, action) {
    if (typeof action !== 'function'
        || (event !== this.stateDownloaded
            && event !== this.stateFailed
            && event !== this.stateBegin)) {
        return;
    }
    for (var i in this.listeners[event]) {
        if (this.listeners[event][i] === action) {
            this.listeners[event].slice(i, 1);
        }
    }
};


// Accessor methods

RoiLoadingQueue.prototype.enqueued = function() {
    return this.enqueued;
};


RoiLoadingQueue.prototype.downloading = function() {
    return this.inProgress;
};


RoiLoadingQueue.prototype.item = function(resourceUrl) {
    return this.pickItem(resourceUrl, true);
};

// Private methods

RoiLoadingQueue.prototype.next = function() {
    if (this.inProgress.length === this.slots) {
        return;
    }
    var its = this.enqueued.splice(0, 1);
    if (its.length === 0) {
        return;
    }

    var item = its[0];
    this.inProgress.push(item);

    if (item.type === RoiLoadingQueue.Type.Binary) {
        // TODO
        this.finalizeItem(item, new Error('Not implemented yet'), null);
    } else if (item.type === RoiLoadingQueue.Type.JSON) {
        // TODO
        this.finalizeItem(item, new Error('Not implemented yet'), null);
    } else if (item.type === RoiLoadingQueue.Type.Image) {
        item.data = utils.loadImage(item.url, function(data) {
            this.finalizeItem(item, null, item.data);
        }.bind(this), function(data) {
            this.finalizeItem(item, new Error(data), null);
        }.bind(this));

        // item.data = new Image();
        // item.data.addEventListener('load', function(data) {
        //     this.finalizeItem(item, null, item.data);
        // }.bind(this), false);
        // item.data.addEventListener('error', function(data) {
        //     this.finalizeItem(item, new Error(data), null);
        // }.bind(this), false);
        // //item.data.crossOrigin = "anonymous";
        // item.data.src = item.url;
    }
};


RoiLoadingQueue.prototype.cancel = function(item) {
    // TODO
};


RoiLoadingQueue.prototype.pickItem = function(itemUrl, nremove) {
    var item = null;
    var resourceUrl = itemUrl.url;
    for (var i in this.enqueued) {
        if (this.enqueued[i].url === resourceUrl) {
            item = this.enqueued[i];
            nremove || this.enqueued.splice(i, 1);
            break;
        }
    }
    if (item === null) {
        for (var i in this.inProgress) {
            if (this.inProgress[i].url === resourceUrl) {
                item = this.inProgress[i];
                nremove || this.inProgress.splice(i, 1);
                break;
            }
        }
    }
    if (item === null) {
        for (var i in this.finished) {
            if (this.finished[i].url === resourceUrl) {
                item = this.finished[i];
                nremove || this.finished.splice(i, 1);
                break;
            }
        }
    }
    return item;
};


RoiLoadingQueue.prototype.finalizeItem = function(item, error, data) {
    // remove from progress queue pass it to finished queue
    this.inProgress.splice(this.inProgress.indexOf(item), 1);
    if (!error) {
        item.data = data;
        while (this.finished.length > this.finishedSlots - 1) {
            this.finished.splice(0,1);
        }
        this.finished.push(item);
    }

    // pass data to item
    item.data = data;

    // invoke all callbacks
    for (var i in item.clb) {
        item.clb[i](error, data);
    }

    // try to load next
    this.next();
};


export default RoiLoadingQueue;
