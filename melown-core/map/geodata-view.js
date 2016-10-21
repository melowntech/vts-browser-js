
/**
 * @constructor
 */
Melown.MapGeodataView = function(map_, geodata_, extraInfo_) {
    this.map_ = map_;
    this.stats_ = map_.stats_;
    this.geodata_ = geodata_;
    this.gpu_ = this.map_.renderer_.gpu_;
    this.renderer_ = this.map_.renderer_;
    this.gpuGroups_ = [];
    this.currentGpuGroup_ = null;
    this.tile_ = extraInfo_.tile_;
    this.surface_ = extraInfo_.surface_;

    if (!this.surface_.geodataProcessor_) {
        var processor_ = new Melown.MapGeodataProcessor(this, this.onGeodataProcessorMessage.bind(this));
        processor_.sendCommand("setStylesheet", { "data" : this.surface_.stylesheet_.data_, "geocent" : (!this.map_.getNavigationSrs().isProjected()) } );
        processor_.sendCommand("setFont", {"chars" : this.renderer_.font_.chars_, "space" : this.renderer_.font_.space_, "size" : this.renderer_.font_.size_});
        this.surface_.geodataProcessor_ = processor_;
    } else {
        if (this.surface_.styleChanged_) {
            this.surface_.geodataProcessor_.sendCommand("setStylesheet", { "data" : this.surface_.stylesheet_.data_, "geocent" : (!this.map_.getNavigationSrs().isProjected()) } );
            this.surface_.styleChanged_ = false;
        }
    }

    this.geodataProcessor_ = this.surface_.geodataProcessor_;
    this.statsCounter_ = 0;
    this.size_ = 0;
    this.killed_ = false;
    this.killedByCache_ = false;
    this.ready_ = false;
    this.isReady();
};

Melown.MapGeodataView.prototype.kill = function() {
    this.killed_ = true;
    this.geodata_ = null;
    this.killGeodataView(false);
};

Melown.MapGeodataView.prototype.killGeodataView = function(killedByCache_) {
    this.killedByCache_ = killedByCache_;

    for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
        this.gpuGroups_[i].kill();
    }

    this.gpuGroups_ = [];

    if (killedByCache_ != true && this.gpuCacheItem_ != null) {
        this.map_.gpuCache_.remove(this.gpuCacheItem_);
    }

    this.stats_.gpuGeodata_ -= this.size_;
    this.stats_.graphsFluxGeodata_[1][0]++;
    this.stats_.graphsFluxGeodata_[1][1] += this.size_;
    
    this.ready_ = false;
    this.size_ = 0;
    this.gpuCacheItem_ = null;
};


Melown.MapGeodataView.prototype.onGeodataProcessorMessage = function(message_) {
    if (this.killed_ || this.killedByCache_){
        return;
    }

    if (typeof message_ !== "string" && message_["command"] != null) {

        //console.log("worker-reply: " + message_["command"]);

        switch (message_["command"]) {

            case "beginGroup":
                this.currentGpuGroup_ = new Melown.GpuGroup(message_["id"], message_["bbox"], message_["origin"], this.gpu_, this.renderer_);
                this.gpuGroups_.push(this.currentGpuGroup_);
                break;

            case "addRenderJob":
                if (this.currentGpuGroup_) {
                    this.currentGpuGroup_.addRenderJob(message_);
                } //else {
                    //message_ = message_;
                //}
                break;

            case "endGroup":
                if (this.currentGpuGroup_) {
                    //this.currentGpuGroup_.optimize();
                    this.size_ += this.currentGpuGroup_.size();
                } //else {
                    //message_ = message_;
                //}
                break;
        }

    } else {

        //console.log("worker-reply: " + message_);

        switch (message_) {
            case "allProcessed":
                this.map_.markDirty();
                this.gpuCacheItem_ = this.map_.gpuCache_.insert(this.killGeodataView.bind(this, true), this.size_);

                this.stats_.gpuGeodata_ += this.size_;
                this.stats_.graphsFluxGeodata_[0][0]++;
                this.stats_.graphsFluxGeodata_[0][1] += this.size_;
                //console.log("geodata: " + this.size_ + " total: " + this.stats_.gpuGeodata_);

                this.ready_ = true;
                break;

            case "ready":
                this.map_.markDirty();
                //this.ready_ = true;
                break;

        }
    }

};

Melown.MapGeodataView.prototype.isReady = function(doNotLoad_, priority_, doNotCheckGpu_) {
    if (this.killed_) {
        return false;
    }

    var doNotUseGpu_ = (this.map_.stats_.gpuRenderUsed_ >= this.map_.maxGpuUsed_);
    doNotLoad_ = doNotLoad_ || doNotUseGpu_;
    
    //if (!this.ready_ && !doNotUseGpu_ && this.geodataProcessor_.isReady()) {
    if (!this.ready_ && !doNotLoad_) {
        if (this.geodata_.isReady(doNotLoad_, priority_, doNotCheckGpu_) && this.geodataProcessor_.isReady()) {
            this.killedByCache_ = false;
            this.geodataProcessor_.setListener(this.onGeodataProcessorMessage.bind(this));
            this.geodataProcessor_.sendCommand("processGeodata", this.geodata_.geodata_, this.tile_);
        }
    }

    if (!doNotLoad_ && this.gpuCacheItem_) {
        this.map_.gpuCache_.updateItem(this.gpuCacheItem_);
    }

    return this.ready_;
};

Melown.MapGeodataView.prototype.getWorldMatrix = function(bbox_, geoPos_, matrix_) {
    var m = matrix_;

    if (m != null) {/*
        m[0] = bbox_.side(0); m[1] = 0; m[2] = 0; m[3] = 0;
        m[4] = 0; m[5] = bbox_.side(1); m[6] = 0; m[7] = 0;
        m[8] = 0; m[9] = 0; m[10] = bbox_.side(2); m[11] = 0;
        m[12] = this.bbox_.min_[0] - geoPos_[0]; m[13] = this.bbox_.min_[1] - geoPos_[1]; m[14] = this.bbox_.min_[2] - geoPos_[2]; m[15] = 1;*/
    } else {
        var m = Melown.mat4.create();

        Melown.mat4.multiply( Melown.translationMatrix(bbox_.min_[0] - geoPos_[0], bbox_.min_[1] - geoPos_[1], bbox_.min_[2] - geoPos_[2]),
                       Melown.scaleMatrix(1, 1, 1), m);
    }

    return m;
};


Melown.MapGeodataView.prototype.draw = function(cameraPos_) {
    if (this.ready_) {
        var renderer_ = this.renderer_;

        for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
            var group_ = this.gpuGroups_[i]; 

            var mvp_ = Melown.mat4.create();
            var mv_ = Melown.mat4.create();
        
            Melown.mat4.multiply(renderer_.camera_.getModelviewMatrix(), this.getWorldMatrix(group_.bbox_, cameraPos_), mv_);
        
            var proj_ = renderer_.camera_.getProjectionMatrix();
            Melown.mat4.multiply(proj_, mv_, mvp_);
            
            group_.draw(mv_, mvp_);

            this.stats_.drawnFaces_ += group_.polygons_;
            this.stats_.drawCalls_ += group_.jobs_.length;
        }
        
        if (this.statsCoutner_ != this.stats_.counter_) {
            this.statsCoutner_ = this.stats_.counter_;
            this.stats_.gpuRenderUsed_ += this.size_;
        }
        
    }
    return this.ready_;
};

Melown.MapGeodataView.prototype.size = function() {
    return this.size_;
};


