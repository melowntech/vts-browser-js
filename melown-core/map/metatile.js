/**
 * @constructor
 */
Melown.MapMetatile = function(metaresources_, surface_) {
    this.metaresources_= metaresources_; //this is metastorage tile
    this.map_ = metaresources_.map_;
    this.surface_ = surface_;
    this.id_ = metaresources_.id_;
    this.nodes_ = [];
    this.loadState_ = 0;
    this.size_ = 0;
    this.cacheItem_ = null;
};

Melown.MapMetatile.prototype.kill = function(killedByCache_) {
    if (killedByCache_ != true && this.cacheItem_ != null) {
        this.map_.metatileCache_.remove(this.cacheItem_);
    }

    if (this.metaresources_) {
        this.metaresources_.removeMetatile(this);
        //this.metaresources_.validate();
        //this.metaresources_ = null;
    }

    this.loadState_ = 0;
    this.surface_ = 0;
    this.cacheItem_ = null;

    this.nodes_ = [];
};

Melown.MapMetatile.prototype.clone = function(surface_) {
    var metatile_ = new Melown.MapMetatile(this.metaresources_, surface_);
    metatile_.nodes_ = this.nodes_;
    metatile_.loadState_ = this.loadState_;
    metatile_.nodes_ = this.nodes_;
    metatile_this.loadState_ = 0;
    metatile_.size_ = this.size_;
    metatile_.cacheItem_= this.map_.metatileCache_.insert(metatile_.kill.bind(metatile_, true), metatile_.size_);
};

Melown.MapMetatile.prototype.isReady = function () {
    //if (this.id_[0] == 18 &&
    //    this.id_[1] == 130400 &&
    //    this.id_[2] == 129088) {
    //    debugger;
    //}

    if (this.loadState_ == 2) { //loaded
        return true;
    } else {

        if (this.loadState_ == 0) { //not loaded
            this.scheduleLoad();
        } //else load in progress

        return false;
    }

};

Melown.MapMetatile.prototype.used = function() {
    if (this.cacheItem_ != null) {
        this.map_.metatileCache_.updateItem(this.cacheItem_);
    }

};

Melown.MapMetatile.prototype.getNode = function(id_) {
    var x = id_[1] - this.id_[1] - this.offsetx_;
    var y = id_[2] - this.id_[2] - this.offsety_;
    
    if (x < 0 || y < 0 || x >= this.sizex_ || y >= this.sizey_) {
        return null;
    }
    
    return this.nodes_[this.sizex_ * y + x];
};

Melown.MapMetatile.prototype.scheduleLoad = function() {
    if (this.mapLoaderUrl_ == null) {
        this.mapLoaderUrl_ = this.surface_.getMetaUrl(this.id_);
    }

    this.map_.loader_.load(this.mapLoaderUrl_, this.onLoad.bind(this), null);
};

Melown.MapMetatile.prototype.onLoad = function(url_, onLoaded_, onError_) {
    this.mapLoaderCallLoaded_ = onLoaded_;
    this.mapLoaderCallError_ = onError_;

    Melown.loadBinary(url_, this.onLoaded.bind(this), this.onLoadError.bind(this), (Melown["useCredentials"] ? (this.mapLoaderUrl_.indexOf(this.map_.baseURL_) != -1) : false));
    this.loadState_ = 1;
};

Melown.MapMetatile.prototype.onLoadError = function() {
    if (this.map_.killed_ == true){
        return;
    }

    this.mapLoaderCallError_();
    //this.loadState_ = 2;
};

Melown.MapMetatile.prototype.onLoaded = function(data_) {
    if (this.map_.killed_ == true){
        return;
    }

    this.size_ += data_.byteLength * 4;

    this.parseMetatatile({data_:data_, index_: 0});

    this.cacheItem_= this.map_.metatileCache_.insert(this.kill.bind(this, true), this.size_);

    this.mapLoaderCallLoaded_();
    this.loadState_ = 2;
    this.map_.markDirty();
};

Melown.MapMetatile.prototype.parseMetatatile = function(stream_) {

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

    var streamData_ = stream_.data_;
    var magic_ = "";

    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;
    magic_ += String.fromCharCode(streamData_.getUint8(stream_.index_, true)); stream_.index_ += 1;

    if (magic_ != "MT") {
        return;
    }

    this.version_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    if (this.version_ > 2) {
        return;
    }

    this.lod_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;

    this.metatileIdx_ = streamData_.getUint32(stream_.index_, true); stream_.index_ += 4;
    this.metatileIdy_ = streamData_.getUint32(stream_.index_, true); stream_.index_ += 4;

    this.offsetx_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.offsety_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;

    this.sizex_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    this.sizey_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    
    this.flagPlanes_ = new Array(8);

    if (this.version_ < 2) {
        this.nodeSize_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
    } else {
        this.flags_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        this.creditCount_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        this.parseFlagPlanes(stream_);
    }

    this.parseMetatatileCredits(stream_);
    this.parseMetatatileNodes(stream_);
};


Melown.MapMetatile.prototype.parseFlagPlanes = function(stream_) {
    var streamData_ = stream_.data_;

    //rounded to bytes
    var bitplaneSize_ = ((this.sizex_ * this.sizey_ + 7) >> 3);

    for (var i = 0; i < 8; i++) {
        if ((this.flags_ & (1 << i)) != 0) {

            var bitplane_ = new Uint8Array(bitplaneSize_);
    
            for (var j = 0; j < bitplaneSize_; j++) {
                bitplane_[j] = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
            }
    
            this.flagPlanes_[i] = bitplane_; 
        }
    }
};

Melown.MapMetatile.prototype.parseMetatatileCredits = function(stream_) {

/*
    struct CreditBlock {
       ushort creditId;       // numerical creditId
       char creditMask[];     // bitfield of size header.sizex * header.sizey, row major, row padded
    };
*/

    var streamData_ = stream_.data_;
    
    if (this.version_ < 2) {
        this.creditCount_ = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        this.creditSize_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
    }
    
    if (this.creditCount_ == 0) {
        this.credits_ = [];
        return;
    }

    //rounded to bytes
    var bitfieldSize_ = ((this.sizex_ * this.sizey_ + 7) >> 3);

    this.credits_ = new Array(this.creditCount_);

    for (var i = 0, li = this.credits_.length; i < li; i++) {
        var creditId_ = streamData_.getUint16(stream_.index_, true); stream_.index_ += 2;
        var bitfield_ = new Uint8Array(bitfieldSize_);

        for (var j = 0; j < bitfieldSize_; j++) {
            bitfield_[j] = streamData_.getUint8(stream_.index_, true); stream_.index_ += 1;
        }

        this.credits_[i] = { creditId_ : creditId_, creditMask_: bitfield_};
    }

};

Melown.MapMetatile.prototype.applyMetatatileBitplanes = function() {
    for (var i = 0; i < 1; i++) {
        if (this.flagPlanes_[i]) {
            
            bitplane_ = this.flagPlanes_[i]; 
    
            for (var y = 0; y < this.sizey_; y++) {
                for (var x = 0; x < this.sizex_; x++) {
                    var byteIndex_ = this.sizex_ * y + x;
                    var bitIndex_ = byteIndex_ & 7;
                    var bitMask_ = 1 << bitIndex_;
                    byteIndex_ >>= 3;
                    
                    if (bitplane_[byteIndex_] & bitMask_) {
                        switch(i) {
                            case 0:
                                this.nodes_[y*this.sizex_+x].alien_ = true;
                                break;       
                        }
                    }
                }
            }
        }
    }
};

Melown.MapMetatile.prototype.applyMetatatileCredits = function() {
    for (var y = 0; y < this.sizey_; y++) {
        for (var x = 0; x < this.sizex_; x++) {
            var byteIndex_ = this.sizex_ * y + x;
            var bitIndex_ = byteIndex_ & 7;
            var bitMask_ = 1 << bitIndex_;
            byteIndex_ >>= 3;

            for (var i = 0, li = this.credits_.length; i < li; i++) {
                if (this.credits_[i].creditMask_[byteIndex_] & bitMask_) {
                    this.nodes_[y*this.sizex_+x].credits_.push(this.credits_[i].creditId_);
                }
            }
             
        }
    }
};

Melown.MapMetatile.prototype.parseMetatatileNodes = function(stream_) {
    this.nodes_ = new Array(this.sizex_*this.sizey_);
    var index_ = 0;

    for (var y = 0; y < this.sizey_; y++) {
        for (var x = 0; x < this.sizex_; x++) {
            this.nodes_[index_] = (new Melown.MapMetanode(this, [this.lod_, this.metatileIdx_ + this.offsetx_ + x, this.metatileIdy_ + this.offsety_ + y], stream_));
            index_++;
        }
    }
    
    this.applyMetatatileCredits();
    this.applyMetatatileBitplanes();
};

