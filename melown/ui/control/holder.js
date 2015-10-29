/**
 * @constructor
 */
Melown.UIControlHolder = function(ui_, html_, visible_) {
    this.ui_ = ui_;
    this.html_ = html_;
    this.elementsById_ = [];
    this.visible_ = visible_ || true;

    //TODO: create element
    this.element_ = element_;

    this.updateHTML(html_);
};

Melown.UIControlHolder.prototype.updateHTML = function(html_) {
    this.element_.innerHTML = html_;

    //TODO: parse html and set unique ids

    //TODO: build list of elements
};

Melown.UIControlHolder.prototype.getElementById = function(id_) {
    return this.elementsById_[id_];
};

Melown.UIControlHolder.prototype.setDisplayState = function(id_, state_) {
    this.element_.style.display = state_ ? "block" : "none";
    this.visible_ = state_;
};

Melown.UIControlHolder.prototype.getDisplayState = function(id_, state_) {
    return this.visible_;
};






