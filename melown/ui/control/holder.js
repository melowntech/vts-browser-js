/**
 * @constructor
 */
Melown.UIControlHolder = function(ui_, html_, visible_) {
    this.ui_ = ui_;
    this.html_ = html_;
    this.elementsById_ = [];
    this.visible_ = visible_ || true;

    //create holder element
    this.element_ = document.createElement("div");
    this.setDisplayState(this.visible_);

    //set element content
    this.updateHTML(html_);

    //append elemenet to UI
    this.ui_.element_.appendChild(this.element_);
};

Melown.UIControlHolder.prototype.updateHTML = function(html_) {
    this.element_.innerHTML = html_;

    var allElements_ = document.getElementsByTagName('*');

    //store all elements with id to the table
    for (var i = 0, li = allElements_.length; i < li; i++) {
        if (allElements_[i].id != null) {
            var id_ = allElements_[i].id;

            //store element to the table
            this.elementsById_ = allElements_[i];

            //modify element id according to instance id
            allElements_[i].id = this.ui_.instanceId_ + "-" + id_;
        }
    }
};

Melown.UIControlHolder.prototype.getElementById = function(id_) {
    return this.elementsById_[id_];
};

Melown.UIControlHolder.prototype.setDisplayState = function(state_) {
    this.element_.style.display = state_ ? "block" : "none";
    this.visible_ = state_;
};

Melown.UIControlHolder.prototype.getDisplayState = function() {
    return this.visible_;
};






