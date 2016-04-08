exports.init = function() {
  this.isGeocent = true;
};

function identity(pt) {
  return pt;
}
exports.forward = identity;
exports.inverse = identity;
exports.names = ["geocent"];//, "identity"];
