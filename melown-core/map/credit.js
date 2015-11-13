/**
 * @constructor
 */
Melown.MapCredit = function(map_, json_) {
    this.map_ = map_;
    this.notice_ = json_["notice"] || null;
    this.copyrighted_ = json_["copyrighted"] || true;
    this.url_ = json_["url"] || null;
};