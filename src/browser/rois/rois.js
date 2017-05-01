// Basic class for requesting ROI servers. It hasn't any UI. Eg. Explore Bar
// class has this class as ancestor.

/**
 * @constructor
 */

var Rois = function(roiServers) {
    this.roiServers = roiServers;
};


/**
 * roisAtPosition
 * Request rois intended for specific position
 * @param position position array 
 * @param count number of requested rois
 * @param clb callback
 * @return Response promise object (if ES6 is supported otherwise null)
 */
Rois.prototype.roisAtPosition = function(/*position, count, clb*/) {
    // TODO request ROI server
    // ROI gravity must be defined before implementation
};


export default Rois;

