var browser = null;
var list = null;

(function startDemo() {
    // create map in the html div with id 'map-div'
    // parameter 'map' sets path to the map which will be displayed
    // you can create your own map on melown.com
    // position parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#position
    browser = vts.browser('map-div', {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-map/mapConfig.json',
        position : [ 'obj', 84.93164,28.351981, 'fix', 2728.74, -109.06, -27.28, 0.00, 38255.68, 45.00 ]
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }

    //create new UI panel
    //html contetnt is in the form of string
    //you can style html elements as usual
    var panel = browser.ui.addControl('destinations-panel',
        '<form id="destinations-div" class="destinations-div">' +
            '<input type="radio" name="destination" value="a"> Destination A<br>' +
            '<input type="radio" name="destination" value="b"> Destination B<br>' +
            '<input type="radio" name="destination" value="c"> Destination C' +        
        '</form>');

    //get destinations-div element
    //do not use document.getElementById,
    //because element ids are changed to unique ids
    list = panel.getElement('destinations-div');

    //create event listener
    //once button state is changed then
    //onFlyToNewDestination function is called
    list.on('change', onFlyToNewDestination);
})();

//this function uses autopilot to fly to the new position
function onFlyToNewDestination() {
    if (browser.map) { //check whether map is loaded
        //get selected destination and fyly to the new position
        switch (list.getElement().elements['destination'].value) { 
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
