/**
 * @constructor
 */
Melown.MapCredit = function(map_, json_) {
    this.map_ = map_;
    this.id_ = json_["id"] || null;
    this.notice_ = json_["notice"] || null;
    this.copyrighted_ = json_["copyrighted"] || true;
    this.url_ = json_["url"] || null;
};

Melown.MapCredit.prototype.getInfo = function() {
    return {
        "id" : this.id_,
        "notice" : this.notice_,
        "copyrighted" : this.copyrighted_,
        "url" : this.url_
    };
};