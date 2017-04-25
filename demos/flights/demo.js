var browser = null;
var list = null;

(function startDemo() {
    browser = vts.browser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json",
        position : [ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 3764, 90 ]
    });

    if (!browser) {
        console.log("Your web browser does not support WebGL");
        return;
    }
    
    var panel = browser.ui.addControl("destination-panel",
        '<form id="panel">' +
          '<input type="radio" name="destination" value="a"> Destination A<br>' +
          '<input type="radio" name="destination" value="b"> Destination B<br>' +
          '<input type="radio" name="destination" value="c"> Destination C' +        
        '</form>');
    
    list = panel.getElement("panel");
    list.on("change", onFlyToNewDestination);
})();


function onFlyToNewDestination() {
    if (browser.map) { //check whether map is loaded
        switch (list.getElement().elements["destination"].value) {
            case "a":
                browser.autopilot.flyTo([ "obj", 1683559, 6604129, "float", 0, -13, -58, 0, 1764, 90 ]);
                break;

            case "b":
                browser.autopilot.flyTo([ "obj", 1679084, 6607401, "float", 0, -17, -57, 0, 1158, 90 ]);
                break;

            case "c":
                browser.autopilot.flyTo([ "obj", 1694920, 6608430, "float", 0, -24, -76, 0, 2049, 90 ]);
                break;
        }
    }
}
