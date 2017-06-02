
import {utils as utils_} from '../utils/utils';

//get rid of compiler mess
var utils = utils_;


var MapStylesheet = function(map, id, url, freeLayer) {
    this.generateLines = true;
    this.map = map;
    this.stats = map.stats;
    this.id  = id;
    this.url  = null;
    this.data = null;
    this.loadState = 0;
    this.size = 0;
    this.fileSize = 0;
    this.freeLayer = freeLayer;
    
    if (typeof url === 'object') {
        this.data = url;
        this.loadState = 2;
    } else {
        if (this.freeLayer) {
            this.url = this.freeLayer.processUrl(url, '');
        } else {
            this.url = this.map.url.processUrl(url);
        }

        //load style directly
        utils.loadJSON(this.url, this.onLoaded.bind(this), this.onLoadError.bind(this), null, (utils.useCredentials ? (this.url.indexOf(this.map.url.baseUrl) != -1) : false), this.map.core.xhrParams);
        this.loadState = 1;
    }
};


MapStylesheet.prototype.kill = function() {
};


MapStylesheet.prototype.setData = function(data) {
    this.data = data;
    this.loadState = 2;
};


MapStylesheet.prototype.isReady = function(doNotLoad, priority) {
    if (this.loadState == 2) { //loaded
        return true;
    } else {
        if (this.loadState == 0) { 
            if (doNotLoad) {
                //remove from queue
                //if (this.mapLoaderUrl) {
                  //  this.map.loader.remove(this.mapLoaderUrl);
                //}
            } else {
                //not loaded
                //add to loading queue or top position in queue
                this.scheduleLoad(priority);
            }
        } //else load in progress
    }

    return false;
};


MapStylesheet.prototype.scheduleLoad = function(priority) {
    this.map.loader.load(this.url, this.onLoad.bind(this), priority);
};


MapStylesheet.prototype.onLoad = function() {
    //this.mapLoaderCallLoaded = onLoaded;
    //this.mapLoaderCallError = onError;

    this.loadState = 1;
};


MapStylesheet.prototype.onLoadError = function() {
    if (this.map.killed){
        return;
    }

    //this.mapLoaderCallError();
    //this.loadState = 2;
};


MapStylesheet.prototype.onLoaded = function(data) {
    if (this.map.killed){
        return;
    }
    
    this.data = data;

    //this.mapLoaderCallLoaded();
    this.loadState = 2;
    this.map.markDirty();
};


// Returns RAM usage in bytes.
//MapStylesheet.prototype.size = function () {
  //  return this.size;
//};

//MapStylesheet.prototype.fileSize = function () {
  //  return this.fileSize;
//};

export default MapStylesheet;

