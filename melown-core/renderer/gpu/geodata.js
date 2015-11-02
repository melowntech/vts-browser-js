
if (Melown_MERGE != true){ if (!Melown) { var Melown = {}; } } //IE need it in very file

//! Holds the GPU data for a tile.
/**
 * @constructor
 */
Melown.GpuGeodata = function(gpu_, tile_)
{
    this.gpu_ = gpu_;
    this.type_ = tile_.type_;
    this.gpuGroups_ = [];
    this.tile_ = tile_;
    this.curerntGpuGroup_ = null;
    this.geodataProcessor_ = tile_.layer_.geodataProcessor_;
    this.size_ = 0;
    this.killed_ = false;
    this.ready_ = false;

    this.isReady();
};

Melown.GpuGeodata.prototype.kill = function() {

    this.killed_ = true;

    switch(this.type_){
        case "geodata":

            for (var i = 0, li = this.gpuGroups_.length; i < li; i++) {
                this.gpuGroups_[i].kill();
            }

            break;
    }
};

Melown.GpuGeodata.prototype.onGeodataProcessorMessage = function(message_) {

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

Melown.GpuGeodata.prototype.isReady = function() {

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


Melown.GpuGeodata.prototype.draw = function(mv_, mvp_, applyOrigin_) {

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

Melown.GpuGeodata.prototype.size = function() {
    return this.size_;
};


