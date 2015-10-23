/**
 * @constructor
 */
Melown.MapSrs = function(map_, json_)
{
    this.map_ = map_;
    this.comment_ = json_["comment"] || null;
    this.srsDef_ = json_["srsDef"] || null;
    this.srsModifiers_ = json_["srsModifiers"] || [];
    this.type_ = json_["type"] || "projected";
    this.vdatum_ = json_["vdatum"] || "orthometric";
    this.srsDefEllps_ = json_["srsDefEllps"] || "";
    this.periodicity_ = this.parsePeriodicity(json_["periodicity"]);

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



