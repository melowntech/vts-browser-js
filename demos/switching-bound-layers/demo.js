var browser = null;
var button = null;
var map = null;


(function startDemo() {
    // create map in the html div with id 'map-div'
    // parameter 'map' sets path to the map which will be displayed
    // you can create your own map on melown.com
    // position parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#position
    // view parameter is described in documentation 
    // https://github.com/Melown/vts-browser-js/wiki/VTS-Browser-Map-API#definition-of-view
    browser = vts.browser('map-div', {
        map: 'https://cdn.melown.com/mario/store/melown2015/map-config/melown/VTS-Tutorial-map/mapConfig.json',
        position : [ 'obj', 15.096869389048662, 49.38435909591623, 'float', 0.00, 0.00, -90.00, 0.00, 1587848.47, 45.00 ],
        view : {
                    surfaces: {
                        'melown-viewfinder-world': [
                            'bmng08-world'
                        ]
                    },
                   freeLayers: {}
               }
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
           '<input id="switch" type="checkbox"> EOX maps' +
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


//this function changes wich sbound layers on the surface
function onSwitchView() {
    if (browser.map) { //check whether map is loaded
        if (button.getElement().checked) { //check switch state
            //set map view with bing
            browser.map.setView({
                surfaces: {
                    'melown-viewfinder-world': [
                        'sentinel2-cloudless-eox'
                    ]
                },
                freeLayers: {}
            }); 
        } else {
            //set map view without bing
            browser.map.setView({
                surfaces: {
                    'melown-viewfinder-world': [
                        'bmng08-world'
                    ]
                },
                freeLayers: {}
            });    
        }
    }
}
