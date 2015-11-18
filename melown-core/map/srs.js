/**
 * @constructor
 */
Melown.MapSrs = function(map_, json_) {
    this.map_ = map_;
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

Melown.MapSrs.prototype.getSrsInfo = function() {
    return this.srsInfo_;
};

Melown.MapSrs.prototype.convertCoordsTo = function(coords_, srs_) {
    var coords2_ = this.proj4_(this.srsDef_, srs_.srsDef_, coords_);
    return coords2_;
};

Melown.MapSrs.prototype.convertCoordsFrom = function(coords_, srs_) {
    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;
//    var coords2_ = this.proj4_(this.srsDef_, srsDef_, coords_);
    var coords2_ = this.proj4_(srsDef_, this.srsDef_, coords_);
//    var coords2_ = this.proj4_(srsDef_, coords_);
    return coords2_;
};



