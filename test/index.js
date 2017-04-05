var expect = require("chai").expect,
    MapCore = require('../src/core/interface').MapCore;

describe("#MapCore", function() {
  it('constructor', function() {
    var core = MapCore('map-div', {
        map: "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json"
    });
    expect(core).to.be.a('object');
  });
});
