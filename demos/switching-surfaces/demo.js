var browser = null;
var button = null;
var map = null;

(function startDemo() {
    // create map in the html div with id 'map-div'
    // parameter 'map' sets path to the map which will be displayed
    // you can create your own map on melown.com
    // position format is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#position
    browser = vts.browser('map-div', {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-Map-3/mapConfig.json',
        position : [ 'obj', 14.826494839713265, 50.29312224877758, 'float', 0.00, 218.81, -24.64, 0.00, 325.29, 45.00 ]
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }
    
    //create new UI panel
    //html contetnt is in the form of string
    //you can style html elements as usual
    var panel = browser.ui.addControl('switch-panel',
        '<div class="switch-panel-div">' +
           '<input id="switch" type="checkbox"> Hide town' +
        '</div>');
    
    //get switch element
    //do not use document.getElementById,
    //because element ids are changed to unique ids
    button = panel.getElement('switch');
    
    //create event listener
    //once button state is changed then
    //onSwitchView function is called
    button.on('change', onSwitchView);
})();

//this function changes wich surfaces will be displayed on the map
function onSwitchView() {
    if (browser.map) { //check whether map is loaded
        if (button.getElement().checked) { //check switch state
            //set map view without town
            browser.map.setView({
                surfaces: {
                    'melown-viewfinder-world': [
                        'bmng08-world',
                        'sentinel2-cloudless-eox'
                    ]
                },
                freeLayers: {}
            }); 
        } else {
            //set map view with town
            browser.map.setView({
                surfaces: {
                    'melown-viewfinder-world': [
                        'bmng08-world',
                        'sentinel2-cloudless-eox'
                    ],
                    'melown-benatky-nad-jizerou': []
                },
                freeLayers: {}
            });    
        }
    }
}
