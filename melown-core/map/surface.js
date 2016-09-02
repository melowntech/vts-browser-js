/**
 * @constructor
 */
Melown.MapSurface = function(map_, json_, type_) {
    this.map_ = map_;
    this.id_ = null;
    this.type_ = "basic";
    this.metaBinaryOrder_ = 1;
    this.metaUrl_ = "";
    this.navUrl_ = "";
    this.navDelta_ = 1;
    this.meshUrl_ = "";
    this.textureUrl_ = "";
    this.baseUrl_ = "";
    this.lodRange_ = [0,0];
    this.tileRange_ = [[0,0],[0,0]];
    this.textureLayer_ = null;
    this.boundLayerSequence_ = [];
    this.glue_ = (type_ == "glue");
    this.free_ = (type_ == "free");
    this.zFactor_ = 0;
    this.ready_ = false;
    this.geodataProcessor_ = null;
    this.geodataCounter_ = 0;
    this.monoGeodata_ = null;
    this.monoGeodataView_ = null;
    this.monoGeodataCounter_ = -1;
    this.creditsNumbers_ = [];
    
    this.style_ = null;
    this.stylesheet_ = null;
    this.originalStyle_ = null;
    this.originalStylesheet_ = null;
    this.styleChanged_ = true;
    
    if (this.free_) { //each free layer has its own data tree
        this.tree_ = new Melown.MapSurfaceTree(this.map_, true, this);
    } else {
        this.tree_ = null;
    }
    
    if (typeof json_ === "string") {
        this.jsonUrl_ = this.map_.processUrl(json_);
        this.baseUrl_ = json_.split('?')[0].split('/').slice(0, -1).join('/')+'/';
        
        var onLoaded_ = (function(data_){
            this.parseJson(data_);            
            this.ready_ = true;
            this.map_.refreshView();
        }).bind(this);
        
        var onError_ = (function(){ }).bind(this);

        Melown.loadJSON(this.jsonUrl_, onLoaded_, onError_, null,(Melown["useCredentials"] ? (this.jsonUrl_.indexOf(this.map_.baseURL_) != -1) : false));
        //Melown.loadJSON(this.url_, onLoaded_, onError_, null, Melown["useCredentials"]);
    } else {
        this.parseJson(json_);
        this.ready_ = true;
    }
};

Melown.MapSurface.prototype.parseJson = function(json_) {
    this.id_ = json_["id"] || null;
    this.type_ = json_["type"] || "basic";
    this.metaBinaryOrder_ = json_["metaBinaryOrder"] || 1;
    this.metaUrl_ = this.processUrl(this.baseUrl_, json_["metaUrl"], "");
    this.navUrl_ = this.processUrl(this.baseUrl_, json_["navUrl"], "");
    this.navDelta_ = json_["navDelta"] || 1;
    this.meshUrl_ = this.processUrl(this.baseUrl_, json_["meshUrl"], "");
    this.textureUrl_ = this.processUrl(this.baseUrl_, json_["textureUrl"], "");
    this.geodataUrl_ = this.processUrl(this.baseUrl_, json_["geodataUrl"] || json_["geodata"], "");
    this.lodRange_ = json_["lodRange"] || [0,0];
    this.tileRange_ = json_["tileRange"] || [[0,0],[0,0]];
    this.textureLayer_ = json_["textureLayer"] || null;
    this.geodata_ = (this.type_ == "geodata" || this.type_ == "geodata-tiles");
    this.credits_ = json_["credits"] || [];
    this.creditsUrl_ = null;
    this.displaySize_ = json_["displaySize"] || 256;

    if (json_["extents"]) {
        var ll_ = json_["extents"]["ll"];
        var ur_ = json_["extents"]["ur"];
        this.extents_ = new Melown.BBox(ll_[0], ll_[1], ll_[2], ur_[0], ur_[1], ur_[2]);
    } else {
        this.extents_ = new Melown.BBox(0,0,0,1,1,1);
    }

    this.specificity_ = Math.pow(2,this.lodRange_[0]) / ((this.tileRange_[1][0] - this.tileRange_[1][0]+1)*(this.tileRange_[1][1] - this.tileRange_[1][1]+1));    
    
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
                this.creditsNumbers_.push(credit_ ? credit_.id_ : null); 
            }
        
            break;
    }    

    //load stylesheet
    if (this.geodata_) {
        var style_ = json_["style"];
        this.originalStyle_ = style_;
        
        if (style_) {
            this.setStyle(style_);
            this.originalStylesheet_ = this.stylesheet_;
        }
    }

    this.surfaceReference_ = [];
    if (this.glue_) {
        for (var i = 0, li = this.id_.length; i < li; i++) {
            this.surfaceReference_.push(this.map_.getSurface(this.id_[i]));
        }
    }
};

Melown.MapSurface.prototype.getInfo = function() {
    if (this.geodata_) {
        return {
            "type" : this.type_,
            "metaUrl" : this.metaUrl_,
            "geodataUrl" : this.geodataUrl_,
            "lodRange" : this.lodRange_,
            "tileRange" : this.tileRange_,
            "style" : this.originalStyle_
        };
    } else {
        return {
            "type" : this.type_,
            "metaUrl" : this.metaUrl_,
            "navUrl" : this.navUrl_,
            "meshUrl" : this.meshUrl_,
            "textureUrl" : this.textureUrl_,
            "lodRange" : this.lodRange_,
            "tileRange" : this.tileRange_,
            "textureLayer" : this.textureLayer_
        };
    }
};

Melown.MapSurface.prototype.processUrl = function(baseUrl_, url_, fallback_) {
    if (!url_) {
        return fallback_;
    }
    
    //is url absolute
    if (url_.indexOf("//") != -1) {
        return url_;
    } else {
        return baseUrl_ + url_; 
    }
};

Melown.MapSurface.prototype.hasTile = function(id_) {
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

Melown.MapSurface.prototype.hasTile2 = function(id_) {
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


Melown.MapSurface.prototype.hasMetatile = function(id_) {
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

Melown.MapSurface.prototype.setStyle = function(style_) {
    if (this.style_ == style_) {
        return;
    } 
    
    this.stylesheet_ = this.map_.getStylesheet(style_);
    
    if (!this.stylesheet_) {
        this.stylesheet_ = new Melown.MapStylesheet(this.map_, style_, style_);
        this.map_.addStylesheet(style_, this.stylesheet_); 
    } 

    this.style_ = style_;
    this.styleChanged_ = true;
    this.geodataCounter_++;
    
    this.map_.markDirty();
};

//used only for glues
Melown.MapSurface.prototype.getSurfaceReference = function(index_) {
    return this.surfaceReference_[index_ - 1];
};

Melown.MapSurface.prototype.getMetaUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.metaUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getNavUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.navUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getMeshUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.meshUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getTextureUrl = function(id_, subId_, skipBaseUrl_) {
    return this.map_.makeUrl(this.textureUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, subId_, skipBaseUrl_);
};

Melown.MapSurface.prototype.getGeodataUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.geodataUrl_, {lod_:id_[0], ix_:id_[1], iy_:id_[2] }, null, skipBaseUrl_);
};

Melown.MapSurface.prototype.getMonoGeodataUrl = function(id_, skipBaseUrl_) {
    return this.map_.makeUrl(this.geodataUrl_, {}, null, skipBaseUrl_);
};







