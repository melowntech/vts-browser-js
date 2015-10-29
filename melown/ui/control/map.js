/**
 * @constructor
 */
Melown.UIControlMap = function(ui_) {
    this.ui_ = ui_;
    this.ui_.addControl("map", '<div id="melown-map"'
                               + ' class="melown-map"'
                               + ' </div>');
};

