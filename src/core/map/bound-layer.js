/**
 * @constructor
 */
Melown.MapBoundLayer = function(map_, json_, id_) {
    this.map_ = map_;
    this.id_ = id_;
    this.currentAlpha_ = 1.0;

    this.tileSize_ = [256,256];
    this.lodRange_ = [0,100];
    this.credits_ = [];
    this.tileRange_ = [[0,0],[0,0]];
    this.jsonUrl_ = null;
    this.baseUrl_ = this.map_.baseUrl_;
    this.baseUrlSchema_ = this.map_.baseUrlSchema_;
    this.baseUrlOrigin_ = this.map_.baseUrlOrigin_;
    this.ready_ = false;

    //hack
    if (id_ == "esri-world-imagery") {
        json_["availability"] = {
             // "type" : "negative-type",
             // "mime": "image/png"
             // "type" : "negative-code",
             // "codes": [301, 302, 404]
              "type" : "negative-size",
              "size": 2521
            };  
    }
    
    if (typeof json_ === "string") {
        this.jsonUrl_ = this.map_.processUrl(json_);
        this.baseUrl_ = Melown.Url.getBase(this.jsonUrl_);
        this.baseUrlSchema_ = Melown.Url.getSchema(this.jsonUrl_);
        this.baseUrlOrigin_ = Melown.Url.getOrigin(this.jsonUrl_);
        
        var onLoaded_ = (function(data_){
            this.parseJson(data_);            
            this.ready_ = true;
            this.map_.refreshView();
        }).bind(this);
        
        var onError_ = (function(){ }).bind(this);

        Melown.loadJSON(this.jsonUrl_, onLoaded_, onError_, null, (Melown["useCredentials"] ? (this.jsonUrl_.indexOf(this.map_.baseUrl_) != -1) : false), this.map_.core_.xhrParams_);
        //Melown.loadJSON(this.url_, onLoaded_, onError_, null, Melown["useCredentials"]);
    } else {
        this.parseJson(json_);
        this.ready_ = true;
    }
    
};

Melown.MapBoundLayer.prototype.parseJson = function(json_) {
    this.numberId_ = json_["id"] || null;
    this.type_ = json_["type"] || "raster";
    this.url_ = this.processUrl(json_["url"], "");
    this.tileSize_ = json_["tileSize"] || [256,256];
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.tileRange_ = json_["tileRange"] || [[0,0],[0,0]];
    this.metaUrl_ = this.processUrl(json_["metaUrl"]);
    this.maskUrl_ = this.processUrl(json_["maskUrl"]);
    this.isTransparent_ = json_["isTransparent"] || false;
    this.credits_ = json_["credits"] || [];
    this.creditsUrl_ = null;

    this.specificity_ = Math.pow(2,this.lodRange_[0]) / ((this.tileRange_[1][0] - this.tileRange_[1][0]+1)*(this.tileRange_[1][1] - this.tileRange_[1][1]+1));    

    this.availability_ = json_["availability"] ? {} : null;

    if (this.availability_) {
        var p = json_["availability"];
        this.availability_.type_ = p["type"];
        this.availability_.mime_ = p["mime"];
        this.availability_.codes_ = p["codes"];
        this.availability_.size_ = p["size"];
        //this.availability_.coverageUrl_ = p["coverageUrl"];
    }

    if (this.metaUrl_ && this.maskUrl_) {
        this.availability_ = {
            type_ : "metatile"
        };
    }

    switch(typeof this.credits_) {
        case "string":
            this.creditsUrl_ = this.credits_;
            this.credits_ = [];
            break;

        case "object":
        
            if (!Array.isArray(this.credits_)) {
                var credits_ = this.credits_;
                this.credits_ = [];
                
                for (var key_ in credits_){
                    this.map_.addCredit(key_, new Melown.MapCredit(this.map_, credits_[key_]));
                    this.credits_.push(key_);
                }
            }

            for (var i = 0, li = this.credits_.length; i < li; i++) {
                var credit_ = this.map_.getCreditById(this.credits_[i]);
                //this.creditsNumbers_.push(credit_ ? credit_.id_ : null); 
            }
        
            break;
    }

};

Melown.MapBoundLayer.prototype.getInfo = function() {
    return {
        "type" : this.type_,
        "url" : this.url_,
        "tileSize" : this.tileSize_,
        "credits" : this.credits_,
        "lodRange" : this.lodRange_,
        "tileRange" : this.tileRange_,
        "mataUrl" : this.metaUrl_,
        "maskUrl" : this.maskUrl_,
        "isTransparent" : this.isTransparent_
    };
};

Melown.MapBoundLayer.prototype.processUrl = function(url_, fallback_) {
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

Melown.MapBoundLayer.prototype.hasTile = function(id_) {
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

Melown.MapBoundLayer.prototype.hasTileOrInfluence = function(id_) {
    var shift_ = id_[0] - this.lodRange_[0];

    if (shift_ < 0) {
        return false;
    }

    var x = id_[1] >> shift_;
    var y = id_[2] >> shift_;

    if (x < this.tileRange_[0][0] || x > this.tileRange_[1][0] ||
        y < this.tileRange_[0][1] || y > this.tileRange_[1][1] ) {
        return 0;
    }

    return (id_[0] > this.lodRange_[1]) ? 1 : 2;
};

Melown.MapBoundLayer.prototype.getUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.url_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapBoundLayer.prototype.getMetatileUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.metaUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapBoundLayer.prototype.getMaskUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.maskUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};




