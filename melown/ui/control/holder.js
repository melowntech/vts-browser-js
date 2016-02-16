/**
 * @constructor
 */
Melown.UIControlHolder = function(ui_, html_, visible_) {
    this.ui_ = ui_;
    this.html_ = html_;
    this.elementsById_ = [];
    this.visible_ = (visible_ != null) ? visible_ : true;

    //create holder element
    this.element_ = document.createElement("div");
    this.setVisible(this.visible_);

    //set element content
    this.setHtml(html_);

    //append elemenet to UI
    this.ui_.element_.appendChild(this.element_);
};

Melown.UIControlHolder.prototype.setHtml = function(html_) {
    this.element_.innerHTML = html_;

    var allElements_ = this.element_.getElementsByTagName('*');

    //store all elements with id attribute to the table
    for (var i = 0, li = allElements_.length; i < li; i++) {
        var id_ = allElements_[i].getAttribute("id");

        if (id_ !== null) {
            //store element to the table
            this.elementsById_[id_] = new Melown.UIElement(this, allElements_[i]);
        }
    }
};

Melown.UIControlHolder.prototype.getElement = function(id_) {
    return this.elementsById_[id_];
};

Melown.UIControlHolder.prototype.setVisible = function(state_) {
    this.element_.style.display = state_ ? "block" : "none";
    this.visible_ = state_;
};

Melown.UIControlHolder.prototype.getVisible = function() {
    return this.visible_;
};


//prevent minification
Melown.UIControlHolder.prototype["setHtml"] = Melown.UIControlHolder.prototype.setHtml; 
Melown.UIControlHolder.prototype["getElement"] = Melown.UIControlHolder.prototype.getElement; 
Melown.UIControlHolder.prototype["setVisible"] = Melown.UIControlHolder.prototype.setVisible; 
Melown.UIControlHolder.prototype["getVisible"] = Melown.UIControlHolder.prototype.getVisible; 




