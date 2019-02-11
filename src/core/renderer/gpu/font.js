
import GpuTexture_ from './texture';
import {utils as utils_} from '../../utils/utils';

//get rid of compiler mess
var GpuTexture = GpuTexture_;
var utils = utils_;


var GpuFont = function(gpu, core, font, size, path) {
    this.bbox = null;
    this.gpu = gpu;
    this.gl = gpu.gl;
    this.core = core;

    this.data = null;
    this.path = path;

    this.texture = {width:256, height:256}; //hack

    this.textures = [];
    this.images = [];
    this.ready = false;    
    this.version = 1;    

    this.load(path);
};


//destructor
GpuFont.prototype.kill = function() {
};

// Returns GPU RAM used, in bytes.
GpuFont.prototype.getSize = function(){ return this.size; };


GpuFont.prototype.load = function(path) {
    utils.loadBinary(path, this.onLoaded.bind(this), this.onError.bind(this));
};

GpuFont.prototype.onLoaded = function(data) {
    this.data = data;
    this.ready = true;    
    this.core.markDirty();
};

GpuFont.prototype.isReady = function() {
    return this.ready;
};

GpuFont.prototype.onError = function() {

};

GpuFont.prototype.onFileLoaded = function(index, data) {
    this.core.markDirty();
    this.textures[index].createFromData(256, 256, new Uint8Array(data), 'linear');
};

GpuFont.prototype.onFileLoadError = function() {
};

GpuFont.prototype.areTexturesReady = function(files) {
    var ready = true;
    for (var i = 0, li = files.length; i < li; i++) {
        var index = files[i];//Math.round( (planes[i] - (planes[i] % 3)) );

        if (!this.textures[index]) {
            utils.loadBinary(this.path + (index+2), this.onFileLoaded.bind(this, index), this.onFileLoadError.bind(this));
            this.textures[index] = new GpuTexture(this.gpu, null, this.core);
            ready = false;
        } else {
            ready = (ready && this.textures[index].loaded);
        }
    }

    return ready;
};

GpuFont.prototype.getTexture = function(file) {
    //if (!this.textures[file]) {
        //debugger;
    //}

    return this.textures[file];
};

export default GpuFont;


