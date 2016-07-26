
/**
 * @constructor
 */
Melown.MapGeodataView = function(map_, geodata_, extraInfo_) {
    this.map_ = map_;
    this.geodata_ = geodata_;
    this.gpu_ = this.map_.renderer_.gpu_;
    this.renderer_ = this.map_.renderer_;
    this.gpuGroups_ = [];
    this.curerntGpuGroup_ = null;
    this.tile_ = extraInfo_.tile_;
    this.surface_ = extraInfo_.surface_;

    if (!this.surface_.geodataProcessor_) {
        var processor_ = new Melown.MapGeodataProcessor(this, this.onGeodataProcessorMessage.bind(this));
        processor_.sendCommand("setStyle", this.stylesheet_.data_);
        processor_.sendCommand("setFont", {"chars" : this.renderer_.font_.chars_, "space" : this.renderer_.font_.space_, "size" : this.renderer_.font_.size_});
        this.geodataProcessor_ = processor_;
    }

    this.geodataProcessor_ = this.surface_.geodataProcessor_;
    this.size_ = 0;
    this.killed_ = false;
    this.ready_ = false;
    this.isReady();
};

Melown.MapGeodataView.prototype.kill = function() {
    this.killed_ = true;

    for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
        this.gpuGroups_[i].kill();
    }
};

Melown.MapGeodataView.prototype.onGeodataProcessorMessage = function(message_) {
    if (this.killed_ == true){
        return;
    }

    if (message_["command"] != null) {

        switch (message_["command"]) {

            case "beginGroup":
                this.currentGpuGroup_ = new Melown.GpuGroup(message_["id"], message_["bbox"], message_["origin"], this.gpu_, this.tile_.core_, this.tile_.layer_);
                this.gpuGroups_.push(this.currentGpuGroup_);
                break;

            case "addRenderJob":
                this.currentGpuGroup_.addRenderJob(message_);
                break;

            case "endGroup":
                this.size += this.currentGpuGroup_.size();
                break;
        }

    } else {

        switch (message_) {
            case "allProcessed":
                this.tile_.core_.renderer_.dirty_ = true;
                this.ready_ = true;
                break;

            case "ready":
                break;

        }
    }

};

Melown.MapGeodataView.prototype.isReady = function() {
    if (this.ready_ == false && this.geodataProcessor_.isReady() == true) {
        switch(this.type_){
            case "geodata":
                this.geodataProcessor_.setListener(this.onGeodataProcessorMessage.bind(this));
                this.geodataProcessor_.sendCommand("processGeodata", this.tile_.geodata_, this.tile_.id_, this.tile_.layer_.autoLods_);
                break;
        }
    }

    return this.ready_;
};


Melown.MapGeodataView.prototype.draw = function(mv_, mvp_, applyOrigin_) {
    if (this.ready_ == true) {
        switch(this.type_){
            case "geodata":
                for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
                    this.gpuGroups_[i].draw(mv_, mvp_, applyOrigin_);
                }
                break;
        }
    }
    return this.ready_;
};

Melown.MapGeodataView.prototype.size = function() {
    return this.size_;
};


