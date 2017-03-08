/**
 * @constructor
 */
Melown.MapVirtualSurface = function(map_, json_, type_) {
    this.map_ = map_;
    this.id_ = null;
    this.metaUrl_ = "";
    this.mappingUrl_ = "";
    this.baseUrl_ = this.map_.baseUrl_;
    this.baseUrlSchema_ = this.map_.baseUrlSchema_;
    this.baseUrlOrigin_ = this.map_.baseUrlOrigin_;
    this.lodRange_ = [0,0];
    this.tileRange_ = [[0,0],[0,0]];
    this.surfaces_ = [];
    this.parseJson(json_);
    this.virtual_ = true;
    this.ready_ = false;
};

Melown.MapVirtualSurface.prototype.parseJson = function(json_) {
    this.id_ = json_["id"] || null;
    this.metaUrl_ = this.processUrl(json_["metaUrl"], "");
    this.mappingUrl_ = this.processUrl(json_["mapping"], "");
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.tileRange_ = json_["tileRange"] || [[0,0],[0,0]];
    this.strId_ = this.id_ ? this.id_.join(";") : null;

    if (this.id_) {
        var tmp_ = this.id_.slice();
        tmp_.sort(); 
        this.strId_ = tmp_.join(";");
    }

    if (json_["extents"]) {
        var ll_ = json_["extents"]["ll"];
        var ur_ = json_["extents"]["ur"];
        this.extents_ = new Melown.BBox(ll_[0], ll_[1], ll_[2], ur_[0], ur_[1], ur_[2]);
    } else {
        this.extents_ = new Melown.BBox(0,0,0,1,1,1);
    }

    this.specificity_ = Math.pow(2,this.lodRange_[0]) / ((this.tileRange_[1][0] - this.tileRange_[1][0]+1)*(this.tileRange_[1][1] - this.tileRange_[1][1]+1));    

    Melown.loadBinary(this.mappingUrl_, this.onMappingFileLoaded.bind(this), this.onMappingFileLoadError.bind(this), (Melown["useCredentials"] ? (this.jsonUrl_.indexOf(this.map_.baseUrl_) != -1) : false), this.map_.core_.xhrParams_);
};

Melown.MapVirtualSurface.prototype.onMappingFileLoaded = function(data_) {
    this.parseMappingFile(new DataView(data_));            
    this.ready_ = true;
    this.map_.refreshView();
};

Melown.MapVirtualSurface.prototype.onMappingFileLoadError = function(data_) {
};

Melown.MapVirtualSurface.prototype.parseMappingFile = function(data_) {
    var index_ = 0;

    var magic_ = "";
    magic_ += String.fromCharCode(data_.getUint8(index_, true)); index_ += 1;
    magic_ += String.fromCharCode(data_.getUint8(index_, true)); index_ += 1;

    if (magic_ != "TM") {
        return false;
    }

    var count_ = data_.getUint16(index_, true); index_ += 2;

    for (var i = 0; i < count_; i++) {
        var size_ = data_.getUint8(index_, true); index_ += 1;
        var id_ = [];

        for (var j = 0; j < size_; j++) {
            var s = data_.getUint16(index_, true); index_ += 2;
            s = this.id_[s];
            
            if (s) {
                id_.push(s);
            }
        }
        
        if (id_.length == 1) { //get surface
            this.surfaces_.push(this.map_.getSurface(id_[0]));
        } else { //get glue
            this.surfaces_.push(this.map_.getGlue(id_.join(";")));
        }
    }

    return true;    
};

Melown.MapVirtualSurface.prototype.getInfo = function() {
    return {
        "metaUrl" : this.metaUrl_,
        "mapping" : this.mappingUrl_,
        "lodRange" : this.lodRange_,
        "tileRange" : this.tileRange_
    };
};

Melown.MapVirtualSurface.prototype.processUrl = function(url_, fallback_) {
    if (!url_) {
        return fallback_;
    }

    url_ = url_.trim();
    
    if (url_.indexOf("://") != -1) { //absolute
        return url_;
    } else if (url_.indexOf("//") == 0) {  //absolute without schema
        return this.baseUrlSchema_ + url_;
    } else if (url_.indexOf("/") == 0) {  //absolute without host
        return this.baseUrlOrigin_ + url_;
    } else {  //relative
        return this.baseUrl_ + url_; 
    }
};

Melown.MapVirtualSurface.prototype.hasTile = function(id_) {
    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ < 0) {
        return false;
    }

    var x = id_[1] >> shift_;
    var y = id_[2] >> shift_;

    if (id_[0] < this.lodRange_[0] || id_[0] > this.lodRange_[1] ||
        x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
        y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
        return false;
    }

    return true;
};

Melown.MapVirtualSurface.prototype.hasTile2 = function(id_) {
    var shift_ = id_[0] - this.lodRange_[0];
    var above_ = (shift_ < 0);

    if (id_[0] < this.lodRange_[0]) {
        shift_ = -shift_;
        var x1 = this.tileRange_[0][0] >> shift_;
        var y1 = this.tileRange_[0][1] >> shift_;
        var x2 = this.tileRange_[1][0] >> shift_;
        var y2 = this.tileRange_[1][1] >> shift_;
    
        if (id_[0] > this.lodRange_[1] ||
            id_[1] < x1 || id_[1] > x2 ||
            id_[2] < y1 || id_[2] > y2 ) {
            return [false , false];
        }
    } else {
        var x = id_[1] >> shift_;
        var y = id_[2] >> shift_;
    
        if (id_[0] > this.lodRange_[1] ||
            x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
            y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
            return [false , false];
        }
    }

    return [true, above_];
};


Melown.MapVirtualSurface.prototype.hasMetatile = function(id_) {
    if (id_[0] > this.lodRange_[1]) {
        return false;
    }

    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ >= 0) {
        var x = id_[1] >> shift_;
        var y = id_[2] >> shift_;

        if (x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
            y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
            return false;
        }

    } else {
        shift_ = -shift_;

        if (id_[1] < (this.tileRange_[0][0]>>shift_) || id_[1] > (this.tileRange_[1][0]>>shift_) ||
            id_[2] < (this.tileRange_[0][1]>>shift_) || id_[2] > (this.tileRange_[1][1]>>shift_) ) {
            return false;
        }
    }

    return true;
};

//used only for glues
Melown.MapVirtualSurface.prototype.getSurface = function(index_) {
    return this.surfaces_[index_ - 1];
};

Melown.MapVirtualSurface.prototype.getMetaUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.metaUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};






