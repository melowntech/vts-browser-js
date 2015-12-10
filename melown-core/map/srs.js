/**
 * @constructor
 */
Melown.MapSrs = function(map_, id_, json_) {
    this.map_ = map_;
    this.id_ = id_;
    this.proj4_ = map_.proj4_;
    this.comment_ = json_["comment"] || null;
    this.srsDef_ = json_["srsDef"] || null;
    this.srsModifiers_ = json_["srsModifiers"] || [];
    this.type_ = json_["type"] || "projected";
    this.vdatum_ = json_["vdatum"] || "orthometric";
    //this.srsDefEllps_ = json_["srsDefEllps"] || "";
    this.srsDef_ = json_["srsDefEllps"] || this.srsDef_;
    this.periodicity_ = this.parsePeriodicity(json_["periodicity"]);
    this.srsInfo_ = this.proj4_(this.srsDef_).info();
    this.geoidGrid_ = null;
    this.geoidGridMap_ = null;

    if (json_["geoidGrid"]) {
        var geoidGridData_ = json_["geoidGrid"];

        this.geoidGrid_ = {
            definition_ : geoidGridData_["definition"] || null,
            srsDefEllps_ : geoidGridData_["srsDefEllps"] || null,
            valueRange : geoidGridData_["valueRange"] || [0,1]
        };

        if (geoidGridData_["extents"] != null) {
            this.geoidGrid_.extents_ = {
                ll_ : geoidGridData_["extents"]["ll"],
                ur_ : geoidGridData_["extents"]["ur"]
            };
        } else {
            this.geoidGrid_.extents_ = {
                ll_ : [0,0],
                ur_ : [1,1]
            };
        }

        if (this.geoidGrid_.definition_ != null) {
            var url_ = this.map_.makeUrl(this.geoidGrid_.definition_, {}, null);
            this.geoidGridMap_ = new Melown.MapTexture(this.map_, url_, true);
        }
    }

    if (this.type_ == "geographic") {
        this.spheroid_ = json_["spheroid"] || null;

        if (this.spheroid_ == null) {
            //TODO: return error
        }
    }

};

Melown.MapSrs.prototype.parsePeriodicity = function(periodicityData_) {
    if (periodicityData_ == null) {
        return null;
    }

    var periodicity_ = {
        "type" : periodicityData_["type"] || "",
        "period" : periodicityData_["period"] || 0
    };

    return periodicity_;
};

Melown.MapSrs.prototype.getInfo = function() {
    return {
        "comment" : this.comment_,
        "srsDef" : this.srsDef_,
        "srsModifiers" : this.srsModifiers_,
        "type" : this.type_,
        "vdatum" : this.vdatum_,
        "srsDefEllps" : this.srsDef_
    };
};

Melown.MapSrs.prototype.getSrsInfo = function() {
    return this.srsInfo_;
};

Melown.MapSrs.prototype.isReady = function() {
    return this.isGeoidGridReady();
};

Melown.MapSrs.prototype.isGeoidGridReady = function() {
    return (this.geoidGrid_ == null ||
           (this.geoidGridMap_ != null && this.geoidGridMap_.isReady()));
};

Melown.MapSrs.prototype.isProjected = function() {
    return (this.type_ == "projected");
};

Melown.MapSrs.prototype.getOriginalHeight = function(coords_, direction_) {
    var height_ = coords_[2] || 0;
    height_ /= this.getVerticalAdjustmentFactor(coords_);
    height_ -= this.getGeoidGridDelta(coords_);
    return height_;
};

Melown.MapSrs.prototype.getFinalHeight = function(coords_) {
    var height_ = coords_[2] || 0;
    height_ += this.getGeoidGridDelta(coords_);
    height_ *= this.getVerticalAdjustmentFactor(coords_);
    return height_;
};

Melown.MapSrs.prototype.getGeoidGridDelta = function(coords_, original_) {
    if (this.geoidGridMap_ != null && this.isGeoidGridReady()) {
        //get cooords in geoidGrid space
        mapCoords_ = this.proj4_(this.srsDef_, this.geoidGrid_.srsDefEllps_, [coords_[0], coords_[1]]);

        //get image coords
        var px_ = mapCoords_[0] - this.geoidGrid_.extents_.ll_[0];
        var py_ = this.geoidGrid_.extents_.ur_[1] - mapCoords_[1];

        var imageExtens_ = this.geoidGridMap_.imageExtents_;

        px_ *= imageExtens_[0] / (this.geoidGrid_.extents_.ur_[0] - this.geoidGrid_.extents_.ll_[0]);
        py_ *= imageExtens_[1] / (this.geoidGrid_.extents_.ur_[1] - this.geoidGrid_.extents_.ll_[1]);

        px_ = Melown.clamp(px_, 0, imageExtens_[0] - 2);
        py_ = Melown.clamp(py_, 0, imageExtens_[1] - 2);

        //get bilineary interpolated value from image
        var ix_ = Math.floor(px_);
        var iy_ = Math.floor(py_);
        var fx_ = px_ - ix_;
        var fy_ = py_ - iy_;

        var data_ = this.geoidGridMap_.imageData_;
        var index_ = iy_ * imageExtens_[0];
        var index2_ = index_ + imageExtens_[0];
        var h00_ = data_[(index_ + ix_)*4];
        var h01_ = data_[(index_ + ix_ + 1)*4];
        var h10_ = data_[(index2_ + ix_)*4];
        var h11_ = data_[(index2_ + ix_ + 1)*4];
        var w0_ = (h00_ + (h01_ - h00_)*fx_);
        var w1_ = (h10_ + (h11_ - h10_)*fx_);
        var delta_ = (w0_ + (w1_ - w0_)*fy_);

        //strech deta into value range
        delta_ = this.geoidGrid_.valueRange[0] + (delta_ * ((this.geoidGrid_.valueRange[1] - this.geoidGrid_.valueRange[0]) / 255));

        return delta_;
    }

    return 0;
};

Melown.MapSrs.prototype.getVerticalAdjustmentFactor = function(coords_) {
    if (this.srsModifiers_.indexOf("adjustVertical") != -1) {
        var info_ = this.getSrsInfo();

        //convert coords to latlon
        var latlonProj_ = "+proj=longlat " +
                          " +alpha=0" +
                          " +gamma=0 +a=" + info_["a"] +
                          " +b=" + info_["b"] +
                          " +x_0=0 +y_0=0";

        var coords2_ = this.proj4_(this.srsDef_, latlonProj_, [coords_[0], coords_[1]]);

        //move coors 1000m
        var geod = new GeographicLib.Geodesic.Geodesic(info_["a"],
                                                       (info_["a"] / info_["b"]) - 1.0);


        var r = geod.Direct(coords2_[1], coords2_[0], 90, 1000);
        coords2_ = [r.lon2, r.lat2];

        //convet coords from latlon back to projected
        coords2_ = this.proj4_(latlonProj_, this.srsDef_, coords2_);

        //get distance between coords
        var dx_ = coords2_[0] - coords_[0];
        var dy_ = coords2_[1] - coords_[1];

        var distance_ = Math.sqrt(dx_ * dx_ + dy_* dy_);

        //get factor
        var factor_ = distance_ / 1000;

        return factor_;
    }

    return 1.0;
};

Melown.MapSrs.prototype.convertCoordsTo = function(coords_, srs_) {
    this.isReady();
    if (typeof srs_ !== "string") {
        if (srs_.id_ == this.id_) {
            return coords_.slice();
        }

        srs_.isReady();
    }

    coords_ = coords_.slice();
    coords_[2] = this.getOriginalHeight(coords_);

    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;
    var coords2_ = this.proj4_(this.srsDef_, srsDef_, coords_);

    if (typeof srs_ !== "string") {
        coords2_[2] = srs_.getFinalHeight(coords2_);
    }

    return coords2_;
};

Melown.MapSrs.prototype.convertCoordsFrom = function(coords_, srs_) {
    this.isReady();
    if (typeof srs_ !== "string") {
        if (srs_.id_ == this.id_) {
            return coords_.slice();
        }

        srs_.isReady();
    }

    coords_ = coords_.slice();

    if (typeof srs_ !== "string") {
        coords_[2] = srs_.getOriginalHeight(coords_);
    }

    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;
    var coords2_ = this.proj4_(srsDef_, this.srsDef_, coords_);

    coords2_[2] = this.getFinalHeight(coords2_);

    return coords2_;
};



