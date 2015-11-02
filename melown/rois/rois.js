'use strict'

// Basic class for requesting ROI servers. It hasn't any UI. Eg. Explore Bar
// class has this class as ancestor.

// Uses EC6 promises to handle requests

/**
 * @constructor
 */
Melown.Rois = function(roiServers_) {
    this.roiServer_ = roiServers_;

};

Melown.Rois.prototype.roisAtPosition = function(position_) {
    // TODO request ROI server
    // ROI gravity must be defined before implementation
};

