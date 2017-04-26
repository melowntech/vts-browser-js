var browser = null;
var list = null;

(function startDemo() {
    browser = vts.browser("map-div", {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-map/mapConfig.json',
        position : [ 'obj', 84.93164,28.351981, 'fix', 2728.74, -109.06, -27.28, 0.00, 38255.68, 55.00 ]
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
                browser.autopilot.flyTo([ 'obj', 84.931640, 28.351981, 'fix', 2728.74, -109.06, -27.28, 0.00, 10605.11, 55.00 ]);
                break;

            case "b":
                browser.autopilot.flyTo([ 'obj', 19.285509, -33.876371, 'fix', 711.90, 339.28, -31.75, 0.00, 68309.37, 55.00 ]);
                break;

            case "c":
                browser.autopilot.flyTo([ 'obj', -122.188130, 46.202126, 'fix', 882.39, 176.89, -15.98, 0.00, 10766.96, 55.00 ]);
                break;
        }
    }
}
