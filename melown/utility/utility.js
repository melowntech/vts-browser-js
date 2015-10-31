Melown.Utils = {};
Melown.Utils.stampCounter_ = 0;

Melown.Utils.stamp = function(obj_) {
    obj_.melownStamp_ = obj_.melownStamp_ || ++obj_.melownStamp_;
    return obj_.melownStamp_;
};

Melown.Utils.splitWords = function (str_) {
    return str_.trim().split(/\s+/);
};