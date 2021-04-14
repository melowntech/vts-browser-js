
import {utils as utils_} from '../utils/utils';
import MapMetanode_ from './metanode';

//get rid of compiler mess
var utils = utils_;
var MapMetanode = MapMetanode_;


var MapMetatile = function(metaresources, surface, tile) {
    this.metaresources= metaresources; //this is metastorage tile
    this.map = metaresources.map;
    this.surface = surface;
    this.id = metaresources.id;
    this.tile = tile; // used only for stats
    this.nodes = [];
    this.drawCounter = 0;
    this.loadState = 0;
    this.loadErrorTime = null;
    this.loadErrorCounter = 0;
    this.size = 0;
    this.cacheItem = null;
};


MapMetatile.prototype.kill = function(killedByCache) {
    if (killedByCache !== true && this.cacheItem != null) {
        this.map.metatileCache.remove(this.cacheItem);
    }

    if (this.metaresources) {
        this.metaresources.removeMetatile(this);
        //this.metaresources.validate();
        //this.metaresources = null;
    }

    this.loadState = 0;
    this.surface = 0;
    this.cacheItem = null;

    this.nodes = [];
};


MapMetatile.prototype.clone = function(surface) {
    var metatile = new MapMetatile(this.metaresources, surface);
    metatile.nodes = this.nodes;
    metatile.loadState = this.loadState;
    metatile.nodes = this.nodes;
    metatile.size = this.size;

    metatile.lod = this.lod;
    metatile.metatileIdx = this.metatileIdx;
    metatile.metatileIdy = this.metatileIdy;
    metatile.offsetx = this.offsetx;
    metatile.offsety = this.offsety;
    metatile.sizex = this.sizex;
    metatile.sizey = this.sizey;
    metatile.version = this.version;
    metatile.credits = this.credits;

    if (this.version < 2) {
        metatile.nodeSize = this.nodeSize;
    } else {
        metatile.flags = this.flags;
        metatile.creditCount = this.creditCount;
        metatile.flagPlanes = this.flagPlanes;
    }

    metatile.cacheItem= this.map.metatileCache.insert(metatile.kill.bind(metatile, true), metatile.size);
    return metatile;
};


MapMetatile.prototype.isReady = function (/*doNotLoad,*/ priority) {
    //if (this.id[0] == 18 &&
    //    this.id[1] == 130400 &&
    //    this.id[2] == 129088) {
    //    debugger;
    //}

    if (this.loadState == 2) { //loaded
        return true;
    } else {

        if (this.loadState == 0) { 
            //if (doNotLoad) {
                //remove from queue
                //if (this.mapLoaderUrl) {
                  //  this.map.loader.remove(this.mapLoaderUrl);
                //}
            //} else {
                //not loaded
                //add to loading queue or top position in queue
            if (this.loadState == 3) { //loadError
                if (this.loadErrorCounter <= this.map.config.mapLoadErrorMaxRetryCount &&
                        performance.now() > this.loadErrorTime + this.map.config.mapLoadErrorRetryTime) {

                    this.scheduleLoad(priority);                    
                }
            } else {
                this.scheduleLoad(priority);
            }
            //}
        } //else load in progress
        
        return false;
    }
};


MapMetatile.prototype.used = function() {
    if (this.cacheItem != null) {
        this.map.metatileCache.updateItem(this.cacheItem);
    }
};


MapMetatile.prototype.getNode = function(id) {
    var x = id[1] - this.id[1] - this.offsetx;
    var y = id[2] - this.id[2] - this.offsety;
    
    if (x < 0 || y < 0 || x >= this.sizex || y >= this.sizey) {
        return null;
    }
    
    var node = this.nodes[this.sizex * y + x];

    if (!node) {
        var index = this.sizex * y + x;
        var stream = {data:this.data, index:this.metanodesIndex + (index * this.metanodeSize)};
        node = (new MapMetanode(this, [this.lod, this.metatileIdx + this.offsetx + x, this.metatileIdy + this.offsety + y], stream, this.divisionNode)); 
        this.nodes[index] = node;
        this.applyMetanodeCredits(x, y);
        this.applyMetatanodeBitplanes(x, y); 
    }

/*    
    if (!node.ready) {
        node.generateCullingHelpers();
        node.ready = true;
    }
*/
    
    return node;
};


MapMetatile.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl == null) {
        this.mapLoaderUrl = this.surface.getMetaUrl(this.id);
    }

    this.map.loader.load(this.mapLoaderUrl, this.onLoad.bind(this), null, this.tile, 'metatile');
};


MapMetatile.prototype.onLoad = function(url, onLoaded, onError) {
    this.mapLoaderCallLoaded = onLoaded;
    this.mapLoaderCallError = onError;

    this.map.loader.processLoadBinary(url, this.onLoaded.bind(this), this.onLoadError.bind(this), null, 'metadata');
    //utils.loadBinary(url, this.onLoaded.bind(this), this.onLoadError.bind(this), (utils.useCredentials ? (this.mapLoaderUrl.indexOf(this.map.url.baseUrl) != -1) : false), this.map.core.xhrParams);
    this.loadState = 1;
};


MapMetatile.prototype.onLoadError = function() {
    if (this.map.killed){
        return;
    }

    this.loadState = 3;
    this.loadErrorTime = performance.now();
    this.loadErrorCounter ++;

    //make sure we try to load it again
    if (this.loadErrorCounter <= this.map.config.mapLoadErrorMaxRetryCount) { 
        setTimeout((function(){ if (!this.map.killed) { this.map.markDirty(); } }).bind(this), this.map.config.mapLoadErrorRetryTime);
    }    

    this.mapLoaderCallError();
};


MapMetatile.prototype.onLoaded = function(data, task) {
    if (this.map.killed){
        return;
    }

    if (!task) {
    //if (this.map.stats.renderBuild > this.map.config.mapMaxProcessingTime) {
        this.map.markDirty();
        this.map.addProcessingTask(this.onLoaded.bind(this, data, true));
        return;
    }

    data = new DataView(data);

    this.size += data.byteLength * 4;
    
    this.data = data;

    var t = performance.now();
    this.parseMetatatile({data:data, index: 0});
    this.map.stats.renderBuild += performance.now() - t; 

    this.cacheItem= this.map.metatileCache.insert(this.kill.bind(this, true), this.size);

    this.map.markDirty();
    this.loadState = 2;
    this.loadErrorTime = null;
    this.loadErrorCounter = 0;
    this.mapLoaderCallLoaded();
};


MapMetatile.prototype.parseMetatatile = function(stream) {

/*
    struct Header {

        char magic[2];                         // letters "MT"
        ushort version;                        // version
        uchar lod;                             // common lod
        uint metatileIdx, metatileIdy;         // id of upper left tile corner (reflected in tile name)
        ushort offsetx, offsety;               // offset of valid data block
        ushort sizex, sizey;                   // dimensions of metanode grid
        uchar nodeSize;                        // size of a metanode in bytes
        uchar creditCount;                     // total number of credit blocks (= number of attributions used by nodes)
        ushort creditSize;                     // size of credit block in bytes
    };
*/

    var streamData = stream.data;
    var magic = '';

    magic += String.fromCharCode(streamData.getUint8(stream.index, true)); stream.index += 1;
    magic += String.fromCharCode(streamData.getUint8(stream.index, true)); stream.index += 1;

    if (magic != 'MT') {
        return;
    }

    this.version = streamData.getUint16(stream.index, true); stream.index += 2;

    if (this.version > 5) {
        return;
    }

    this.lod = streamData.getUint8(stream.index, true); stream.index += 1;

    this.metatileIdx = streamData.getUint32(stream.index, true); stream.index += 4;
    this.metatileIdy = streamData.getUint32(stream.index, true); stream.index += 4;

    this.offsetx = streamData.getUint16(stream.index, true); stream.index += 2;
    this.offsety = streamData.getUint16(stream.index, true); stream.index += 2;

    this.sizex = streamData.getUint16(stream.index, true); stream.index += 2;
    this.sizey = streamData.getUint16(stream.index, true); stream.index += 2;
    
    this.flagPlanes = new Array(8);

    if (this.version < 2) {
        this.nodeSize = streamData.getUint8(stream.index, true); stream.index += 1;
    } else {
        this.flags = streamData.getUint8(stream.index, true); stream.index += 1;
        this.creditCount = streamData.getUint8(stream.index, true); stream.index += 1;
        this.parseFlagPlanes(stream);
    }

    this.parseMetatatileCredits(stream);
    this.parseMetatatileNodes(stream);
    
    this.useVersion = (this.map.config.mapForceMetatileV3 && this.version < 5) ? 3 : this.version; 
};


MapMetatile.prototype.parseFlagPlanes = function(stream) {
    var streamData = stream.data;

    //rounded to bytes
    var bitplaneSize = ((this.sizex * this.sizey + 7) >> 3);

    for (var i = 0; i < 6; i++) {
        if ((this.flags & (1 << i)) != 0) {

            var bitplane = new Uint8Array(bitplaneSize);
    
            for (var j = 0; j < bitplaneSize; j++) {
                bitplane[j] = streamData.getUint8(stream.index, true); stream.index += 1;
            }
    
            this.flagPlanes[i] = bitplane; 
        }
    }
};


MapMetatile.prototype.parseMetatatileCredits = function(stream) {

/*
    struct CreditBlock {
       ushort creditId;       // numerical creditId
       char creditMask[];     // bitfield of size header.sizex * header.sizey, row major, row padded
    };
*/

    var streamData = stream.data;
    
    if (this.version < 2) {
        this.creditCount = streamData.getUint8(stream.index, true); stream.index += 1;
        this.creditSize = streamData.getUint16(stream.index, true); stream.index += 2;
    }
    
    if (this.creditCount == 0) {
        this.credits = [];
        return;
    }

    //rounded to bytes
    var bitfieldSize = ((this.sizex * this.sizey + 7) >> 3);

    this.credits = new Array(this.creditCount);

    for (var i = 0, li = this.credits.length; i < li; i++) {
        var creditId = streamData.getUint16(stream.index, true); stream.index += 2;
        var bitfield = new Uint8Array(bitfieldSize);

        for (var j = 0; j < bitfieldSize; j++) {
            bitfield[j] = streamData.getUint8(stream.index, true); stream.index += 1;
        }
    
        var credit = this.map.getCreditByNumber(creditId);
        var stringId = credit ? credit.key : null;

        this.credits[i] = { creditId : stringId, creditMask: bitfield};
    }
};


MapMetatile.prototype.applyMetatatileBitplanes = function() {
    for (var i = 0; i < 1; i++) {
        if (this.flagPlanes[i]) {
            
            var bitplane = this.flagPlanes[i]; 
    
            for (var y = 0; y < this.sizey; y++) {
                for (var x = 0; x < this.sizex; x++) {
                    var byteIndex = this.sizex * y + x;
                    var bitIndex = byteIndex & 7;
                    var bitMask = 1 << bitIndex;
                    byteIndex >>= 3;
                    
                    if (bitplane[byteIndex] & bitMask) {
                        switch(i) {
                        case 0:
                            this.nodes[y*this.sizex+x].alien = true;
                            break;       
                        }
                    }
                }
            }
        }
    }
};


MapMetatile.prototype.applyMetatanodeBitplanes = function(x, y) {
    for (var i = 0; i < 1; i++) {
        if (this.flagPlanes[i]) {
            var bitplane = this.flagPlanes[i]; 
            var byteIndex = this.sizex * y + x;
            var bitIndex = byteIndex & 7;
            var bitMask = 1 << bitIndex;
            byteIndex >>= 3;
            
            if (bitplane[byteIndex] & bitMask) {
                switch(i) {
                case 0:
                    this.nodes[y*this.sizex+x].alien = true;
                    break;       
                }
            }
        }
    }
};


MapMetatile.prototype.applyMetatatileCredits = function() {
    for (var y = 0; y < this.sizey; y++) {
        for (var x = 0; x < this.sizex; x++) {
            var byteIndex = this.sizex * y + x;
            var bitIndex = byteIndex & 7;
            var bitMask = 1 << bitIndex;
            byteIndex >>= 3;

            for (var i = 0, li = this.credits.length; i < li; i++) {
                if (this.credits[i].creditMask[byteIndex] & bitMask) {
                    var id = this.credits[i].creditId;
                    if (id) {
                        this.nodes[y*this.sizex+x].credits.push(id);
                    }
                }
            }
        }
    }
};


MapMetatile.prototype.applyMetanodeCredits = function(x, y) {
    var byteIndex = this.sizex * y + x;
    var bitIndex = byteIndex & 7;
    var bitMask = 1 << bitIndex;
    byteIndex >>= 3;

    for (var i = 0, li = this.credits.length; i < li; i++) {
        if (this.credits[i].creditMask[byteIndex] & bitMask) {
            var id = this.credits[i].creditId;
            if (id) {
                this.nodes[y*this.sizex+x].credits.push(id);
            }
        }
    }
};


MapMetatile.prototype.parseMetatatileNodes = function(stream) {
    this.metanodesIndex = stream.index;
    this.metanodeSize = 1 + 1 + 2 + 2 + 2 + 2;
    
    if (this.version >= 5) {
        this.metanodeSize += (3 + 4) * 4;
    } else {
        this.metanodeSize += Math.floor((6 * (this.id[0] + 2) + 7) / 8);

        if (this.version == 4) {
            this.metanodeSize += 3 * 4;
        }
    }

    if (this.version >= 3) {
        if (this.flags & (1<<7)) {
            this.metanodeSize += 2;
        } else if (this.flags & (1<<6)) {
            this.metanodeSize += 1;
        }
    }

    if (this.lod >= this.map.measure.minDivisionNodeDepth) {
        this.divisionNode = this.map.measure.getSpatialDivisionNodeAndExtents([this.lod, this.metatileIdx + this.offsetx, this.metatileIdy + this.offsety]);
        if (this.divisionNode) {
            this.divisionNode = this.divisionNode[0];
        }
    } else {
        this.divisionNode = null;
    }
    
    this.nodes = new Array(this.sizex*this.sizey);
    
    /*
    var index = 0;

    for (var y = 0; y < this.sizey; y++) {
        for (var x = 0; x < this.sizex; x++) {
            this.nodes[index] = (new MapMetanode(this, [this.lod, this.metatileIdx + this.offsetx + x, this.metatileIdy + this.offsety + y], stream, divisionNode));
            index++;
        }
    }
    
    this.applyMetatatileCredits();
    this.applyMetatatileBitplanes();
    */
};


export default MapMetatile;
