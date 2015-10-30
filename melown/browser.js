/**
 * @constructor
 */
Melown.Browser = function(element_, config_)
{
};


Melown.Browser.prototype.on = function(name_, listener_) {
    if (listener_ == null) {
        return;
    }

    this.listenerCounter_++;
    this.listeners_.push({ name_ : name_, listener_ : listener_, id_ : this.listenerCounter_ });

    return (function(id_){ this.removeListener(id_); }).bind(this, this.listenerCounter_);
};


Melown.Browser.prototype.callListener = function(name_, event_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].name_ == name_) {
            this.listeners_[i].listener_(event_);
        }
    }
};

Melown.Browser.prototype.removeListener = function(id_) {
    for (var i = 0; i < this.listeners_.length; i++) {
        if (this.listeners_[i].id_ == id_) {
            //this.listeners_[i].splice(i, 1);
            this.listeners_.splice(i, 1);
            return;
        }
    }
};


//prevent minification
Melown["Browser"] = Melown.Browser;
Melown.Browser.prototype["on"] = Melown.Browser.prototype.on;

