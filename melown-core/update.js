
Melown.Core.prototype.updateInertia = function() {

    if (this.killed_ == true || this.renderer_ == null) {
        return;
    }

    var hit_ = false;
    var factorPan_ = this.coreConfig_.controlInertia_[0];
    var factorRotate_ = this.coreConfig_.controlInertia_[1];
    var factorZoom_ = this.coreConfig_.controlInertia_[2];
    var renderer_ = this.renderer_;

    if (this.orbitDeltas_.length > 0 && this.panDeltas_.length == 0 && this.distanceDeltas_.length == 0) {
        renderer_.tilting_ = true;
    }

    for (var i = 0; i < this.panDeltas_.length; i++) {
        this.panDeltas_[i][0] *= factorPan_;
        this.panDeltas_[i][1] *= factorPan_;

        renderer_.position_[0] += this.panDeltas_[i][0];
        renderer_.position_[1] += this.panDeltas_[i][1];

        //remove zero deltas
        if (Math.abs(this.panDeltas_[i][0])+Math.abs(this.panDeltas_[i][1]) < 0.01) {
            this.panDeltas_.splice(i, 1);
            i--;
        }

        hit_ = true;
    }

    for (var i = 0; i < this.distanceDeltas_.length; i++) {

        this.distanceDeltas_[i][0] += (1 - this.distanceDeltas_[i][0]) * (1.0 - factorZoom_);// * 0.01;
        renderer_.position_[2] *= this.distanceDeltas_[i][0];

        renderer_.position_[2] = Math.min(renderer_.position_[2], this.coreConfig_.cameraVisibility_);

        //remove zero deltas
        if (Math.abs(1 - this.distanceDeltas_[i][0]) < 0.001) {
            this.distanceDeltas_.splice(i, 1);
            i--;
        }

        hit_ = true;
    }

    for (var i = 0; i < this.orbitDeltas_.length; i++) {
        this.orbitDeltas_[i][0] *= factorRotate_;
        this.orbitDeltas_[i][1] *= factorRotate_;
        this.orbitDeltas_[i][2] *= factorRotate_;

        renderer_.orientation_[0] += this.orbitDeltas_[i][0];
        renderer_.orientation_[1] += this.orbitDeltas_[i][1];
        renderer_.orientation_[2] += this.orbitDeltas_[i][2];

        //remove zero deltas
        if (Math.abs(this.orbitDeltas_[i][0])+Math.abs(this.orbitDeltas_[i][1])+Math.abs(this.orbitDeltas_[i][2]) < 0.01) {
            this.orbitDeltas_.splice(i, 1);
            i--;
        }

        hit_ = true;
    }

    //console.log("pos: " + renderer_.position_[0] + " "  + renderer_.position_[1] + " " + renderer_.position_[2] + "rot: " + renderer_.orientation_[0] + " "  + renderer_.orientation_[1] + " " + renderer_.orientation_[2]);


    if (hit_ == true) {
        renderer_.updateCamera();
    }

    //detect view change
    if (Math.abs(renderer_.position_[0] - this.lastPosition_[0]) > 0.001 ||
        Math.abs(renderer_.position_[1] - this.lastPosition_[1]) > 0.001 ||
        Math.abs(renderer_.position_[2] - this.lastPosition_[2]) > 0.001 ||
        Math.abs(renderer_.orientation_[0] - this.lastOrientation_[0]) > 0.001 ||
        Math.abs(renderer_.orientation_[1] - this.lastOrientation_[1]) > 0.001 ||
        Math.abs(renderer_.orientation_[2] - this.lastOrientation_[2]) > 0.001 ||
        Math.abs(renderer_.camera_.getFov() - this.lastFov_) > 0.001) {

        var position_ = renderer_.position_.slice();
        var orientation_ = renderer_.orientation_.slice();
        this.lastPosition_ = position_.slice();
        this.lastOrientation_ = orientation_.slice();
        this.lastFov_ = renderer_.camera_.getFov();
        this.callListener("view-update", {"position": position_, "orientaion":orientation_,
                                           "fov": renderer_.camera_.getFov()});
    }

    this.callListener("render-update", { "dirty": true, "message": "DOM element does not exist" });
};


Melown.Core.prototype.onUpdate = function() {

    //this.updateInertia();

};



