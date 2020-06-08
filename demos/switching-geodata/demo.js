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
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-Map-4/mapConfig.json',
        position : [ 'obj', 16.859804814132534, 48.487330129634145, 'float', 0.00, 0.99, -90.00, 310.56, 2339330.58, 45.00 ]
    });

    //check whether browser is supported
    if (!browser) {
        console.log('Your web browser does not support WebGL');
        return;
    }
    
    //create new UI panel
    //html contetnt is in the form of string
    //you can style html element as usual
    var panel = browser.ui.addControl('switch-panel',
        '<div class="switch-panel-div">' +
           '<input id="switch" type="checkbox"> Hide geodata' +
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

//this function changes whether geodata will be displayed on not
function onSwitchView() {
    if (browser.map) { //check whether map is loaded
        if (button.getElement().checked) { //check switch state
            //set map view without geodata
            browser.map.setView({
                surfaces: {
                    'melown-viewfinder-world': [
                        'bmng08-world',
                         "sentinel2-cloudless-eox"
                    ]
                },
                freeLayers: {}
            }); 
        } else {
            //set map view with geodata
            browser.map.setView({
                surfaces: {
                    'melown-viewfinder-world': [
                        'bmng08-world',
                         "sentinel2-cloudless-eox"
                    ]
                },
                freeLayers: {
                    'osm-tilehosting-v1': {}
                }
            });    
        }
    }
}
