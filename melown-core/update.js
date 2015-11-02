
Melown.Core.prototype.onUpdate = function() {

    if (this.map_ != null) {
        this.map_.update();
    }

    //TODO: detect view change
    //this.callListener("view-update", {"position": position_, "orientaion":orientation_,
    //                                  "fov": renderer_.camera_.getFov()});

    //this.callListener("render-update", { "dirty": true, "message": "DOM element does not exist" });

    this.callListener("tick", {});

    window.requestAnimFrame(this.onUpdate.bind(this));
};




