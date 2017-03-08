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
    this.srsProj4_ = this.proj4_(this.srsDef_, null, null, true); 
    this.latlonProj4_ = null; 
    this.proj4Cache_ = {};

    if (json_["geoidGrid"]) {
        var geoidGridData_ = json_["geoidGrid"];

        this.geoidGrid_ = {
            definition_ : geoidGridData_["definition"] || null,
            srsDefEllps_ : geoidGridData_["srsDefEllps"] || null,
            valueRange : geoidGridData_["valueRange"] || [0,1]
        };

        if (geoidGridData_["extents"]) {
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

        if (this.geoidGrid_.definition_) {
            var url_ = this.map_.makeUrl(this.geoidGrid_.definition_, {}, null);
            this.geoidGridMap_ = new Melown.MapTexture(this.map_, url_, true);
        }
        
        if (this.geoidGrid_.srsDefEllps_) {
            this.geoidGrid_.srsProj4_ = this.proj4_(this.geoidGrid_.srsDefEllps_, null, null, true);        
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
        "srsDefEllps" : this.srsDef_,
        "a" : this.srsInfo_["a"],
        "b" : this.srsInfo_["b"]
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
        mapCoords_ = this.proj4_(this.srsProj4_, this.geoidGrid_.srsProj4_, [coords_[0], coords_[1]]);

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

        if (!this.latlonProj4_) {
            this.latlonProj4_ = this.proj4_(latlonProj_, null, null, true); 
        }

        var coords2_ = this.proj4_(this.srsProj4_, this.latlonProj4_, [coords_[0], coords_[1]]);

        //move coors 1000m
        var geod = new GeographicLib["Geodesic"]["Geodesic"](info_["a"],
                                                       (info_["a"] / info_["b"]) - 1.0);


        var r = geod["Direct"](coords2_[1], coords2_[0], 90, 1000);
        coords2_ = [r.lon2, r.lat2];

        //convet coords from latlon back to projected
        coords2_ = this.proj4_(this.latlonProj4_, this.srsProj4_, coords2_);

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

Melown.MapSrs.prototype.convertCoordsTo = function(coords_, srs_, skipVerticalAdjust_) {
    this.isReady();
    if (typeof srs_ !== "string") {
        if (srs_.id_ == this.id_) {
            return coords_.slice();
        }

        srs_.isReady();
    }

    coords_ = coords_.slice();

    var stringSrs_ = (typeof srs_ === "string");

    //if (!skipVerticalAdjust_ && stringSrs_) {
        coords_[2] = this.getOriginalHeight(coords_);
    //}

    var srsDef_ = (stringSrs_) ? srs_ : srs_.srsProj4_;

    /*
    if (srsDef_.isGeocent && this.srsProj4_.projName == "merc") {
        var coords3_ = coords_.slice();
        this.convertMercToWGS(coords3_);
        this.convertWGSToGeocent(coords3_, srsDef_);
        return coords3_;
    }*/


    var srsDef2_ = (stringSrs_) ? srs_ : srs_.srsDef_;
    //var coords2_ = this.proj4_(this.srsProj4_, srsDef_, coords_);

    var proj_ = this.proj4Cache_[srsDef2_];
    
    if (!proj_) {
        proj_ = this.proj4_(this.srsProj4_, srsDef_);
        this.proj4Cache_[srsDef2_] = proj_;
    }

    var coords2_ = proj_.forward(coords_);

    if (!skipVerticalAdjust_ && stringSrs_) {
        coords2_[2] = srs_.getFinalHeight(coords2_);
    }

    return coords2_;
};

Melown.MapSrs.prototype.convertCoordsToFast = function(coords_, srs_, skipVerticalAdjust_, coords2_, index_, index2_) {

    //if (!skipVerticalAdjust_ && stringSrs_) {
        //coords_[2] = this.getOriginalHeight(coords_);
    //}

    var srsDef_ = srs_.srsProj4_;
    
    /*
    if (srsDef_.isGeocent && this.srsProj4_.projName == "merc") {
        this.convertMercToWGS(coords_, coords2_, index_, index2_);
        this.convertWGSToGeocent(coords2_, srsDef_, coords2_, index2_, index2_);
        return;
    }*/

    var srsDef2_ = srs_.srsDef_;

    var proj_ = this.proj4Cache_[srsDef2_];
    
    if (!proj_) {
        proj_ = this.proj4_(this.srsProj4_, srsDef_);
        this.proj4Cache_[srsDef2_] = proj_;
    }

    var coords3_ = proj_.forward(coords_);
    
    coords2_[index2_] = coords3_[0];
    coords2_[index2_+1] = coords3_[1];
    coords2_[index2_+2] = coords3_[2];
    

    //if (!skipVerticalAdjust_ && stringSrs_) {
        //coords2_[2] = srs_.getFinalHeight(coords2_);
    //}
    
    if (srs_.geoidGrid_) {
        coords2_[index2_+2] -= srs_.getGeoidGridDelta(coords_);
    }
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

    var srsDef_ = (typeof srs_ === "string") ? srs_ : srs_.srsProj4_;
    var srsDef2_ = (typeof srs_ === "string") ? srs_ : srs_.srsDef_;

    //var coords2_ = this.proj4_(srsDef_, this.srsProj4_, coords_);

    var proj_ = this.proj4Cache_[srsDef2_];
    
    if (!proj_) {
        proj_ = this.proj4_(this.srsProj4_, srsDef_);
        this.proj4Cache_[srsDef2_] = proj_;
    }

    var coords2_ = proj_.inverse(coords_);

    coords2_[2] = this.getFinalHeight(coords2_);

    return coords2_;
};


Melown.MapSrs.prototype.phi2z = function(eccent_, ts_) {
  var HALF_PI = Math.PI*0.5;
  var eccnth_ = 0.5 * eccent_;
  var con_, dphi_;
  var phi_ = HALF_PI - 2 * Math.atan(ts_);
  for (var i = 0; i <= 15; i++) {
    con_ = eccent_ * Math.sin(phi_);
    dphi_ = HALF_PI - 2 * Math.atan(ts_ * (Math.pow(((1 - con_) / (1 + con_)), eccnth_))) - phi_;
    phi_ += dphi_;
    if (Math.abs(dphi_) <= 0.0000000001) {
      return phi_;
    }
  }
  //console.log("phi2z has NoConvergence");
  return -9999;
};


Melown.MapSrs.prototype.convertMercToWGS = function(coords_, coords2_, index_, index2_) {
    var TWO_PI = Math.PI * 2;
    var HALF_PI = Math.PI*0.5;
    var proj_ = this.srsProj4_;
    var x = coords_[index_] - proj_.x0;
    var y = coords_[index_+1] - proj_.y0;

    if (proj_.sphere) {
        coords2_[index2_+1] = HALF_PI - 2 * Math.atan(Math.exp(-y / (proj_.a * proj_.k0)));
    } else {
        var ts_ = Math.exp(-y / (proj_.a * proj_.k0));
        var yy = this.phi2z(proj_.e, ts_);
        coords2_[index2_+1] = yy;
        if (yy === -9999) {
            return;
        }
    }
    
    //coords_[0] = adjust_lon(proj_.long0 + x / (proj_.a * proj_.k0));
    x = proj_.long0 + x / (proj_.a * proj_.k0);
    var SPI = 3.14159265359;
    coords2_[index2_] = (Math.abs(x) <= SPI) ? x : (x - ((x < 0) ? -1 : 1) * TWO_PI);
    coords2_[index2_+2] = coords_[index_+2];
};

Melown.MapSrs.prototype.convertWGSToGeocent = function(coords_, srs_, coords2_, index_, index2_) {
    var datum_ = srs_.datum;

    var HALF_PI = Math.PI*0.5;
    var Longitude = coords_[index_];
    var Latitude = coords_[index_+1];
    var Height = coords_[index_+2]; //Z value not always supplied

    var Rn; /*  Earth radius at location  */
    var Sin_Lat; /*  Math.sin(Latitude)  */
    var Sin2_Lat; /*  Square of Math.sin(Latitude)  */
    var Cos_Lat; /*  Math.cos(Latitude)  */

    /*
     ** Don't blow up if Latitude is just a little out of the value
     ** range as it may just be a rounding issue.  Also removed longitude
     ** test, it should be wrapped by Math.cos() and Math.sin().  NFW for PROJ.4, Sep/2001.
     */
    if (Latitude < -HALF_PI && Latitude > -1.001 * HALF_PI) {
      Latitude = -HALF_PI;
    }
    else if (Latitude > HALF_PI && Latitude < 1.001 * HALF_PI) {
      Latitude = HALF_PI;
    }
    else if ((Latitude < -HALF_PI) || (Latitude > HALF_PI)) {
      /* Latitude out of range */
      //..reportError('geocent:lat out of range:' + Latitude);
      return null;
    }

    if (Longitude > Math.PI) {
      Longitude -= (2 * Math.PI);
    }

    Sin_Lat = Math.sin(Latitude);
    Cos_Lat = Math.cos(Latitude);
    Sin2_Lat = Sin_Lat * Sin_Lat;
    Rn = datum_.a / (Math.sqrt(1.0e0 - datum_.es * Sin2_Lat));
    coords2_[index2_] = (Rn + Height) * Cos_Lat * Math.cos(Longitude);
    coords2_[index2_+1] = (Rn + Height) * Cos_Lat * Math.sin(Longitude);
    coords2_[index2_+2] = ((Rn * (1 - datum_.es)) + Height) * Sin_Lat;
};

