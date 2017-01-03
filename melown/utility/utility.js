Melown.Utils = {};
Melown.Utils.stampCounter_ = 0;

Melown.Utils.stamp = function(obj_) {
    obj_.melownStamp_ = obj_.melownStamp_ || ++Melown.Utils.stampCounter_;
    return obj_.melownStamp_;
};

Melown.Utils.splitWords = function(str_) {
    return str_.trim().split(/\s+/);
};

Melown.Utils.validateBool = function(value_, defaultValue_) {
    if (typeof value_ === "boolean") {
        return value_;
    } else {
        return defaultValue_;
    }
};

Melown.Utils.validateNumber = function(value_, minValue, maxValue, defaultValue_) {
    if (typeof value_ === "number") {
        return Melown.clamp(value_, minValue, maxValue);
    } else {
        return defaultValue_;
    }
};

Melown.Utils.validateNumberArray = function(array_, arraySize_, minValues_, maxValues_, defaultValues_) {
    if (Array.isArray(array_) && array_.length == arraySize_) {
        for (var i = 0; i < arraySize_; i++) {
            array_[i] = Melown.clamp(array_[i], minValues_[i], maxValues_[i]);
        }
        return array_;
    } else {
        return defaultValues_;
    }
};


