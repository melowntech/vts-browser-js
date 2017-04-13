var browser = null;
var button = null;
var map = null;


(function startDemo() {
    browser = vts.browser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json"
    });

    if (!browser) {
        console.log("Your web browser does not support WebGL");
        return;
    }
    
    var panel = browser.ui.addControl("view-panel",
        '<div id="switch-panel">' +
           '<input id="switch" type="checkbox"> Base Map' +
        '</div>');
    
    button = panel.getElement("switch");
    button.on("change", onSwitchView);
})();


function onSwitchView() {
    if (browser.map) { //check whether map is loaded
        if (button.getElement().checked) {
            browser.map.setView({
                "surfaces": {
                    "grand": [],
                    "ev": [ "mapycz-base" ]
                },
                "freelayers": []
            });    
        } else {
            browser.map.setView({
                "surfaces": {
                    "grand": [],
                    "ev": []
                },
                "freelayers": []
            });    
        }
    }
}
