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
    this.geoidGrid_ = null;

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

Melown.MapSrs.prototype.convertCoordsTo = function(coords_, srs_) {
    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;
    var coords2_ = this.proj4_(this.srsDef_, srsDef_, coords_);
    return coords2_;
};

Melown.MapSrs.prototype.convertCoordsFrom = function(coords_, srs_) {
    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;
    var coords2_ = this.proj4_(srsDef_, this.srsDef_, coords_);
    return coords2_;
};



