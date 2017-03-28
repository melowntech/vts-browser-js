
var browser = null;
var ui = null;
var button = null;

function startDemo() {
    browser = Melown.MapBrowser("map-div", {
        map : "https://demo.test.mlwn.se/public-maps/grand-ev/mapConfig.json"
    });
    
    ui = browser.getUI();
    var panel = ui.addControl("view-panel",
        '<div id="switch-panel">' +
           '<input id="switch" type="checkbox"> Base Map' +
        '</div>');
    
    button = panel.getElement("switch");
    button.on("change", onSwitchView);
}

function onSwitchView() {
    if (button.getElement().checked) {
        browser.setView({
            "surfaces": {
                "grand": [],
                "ev": [ "mapycz-base" ]
            },
            "freelayers": []
        });    
    } else {
        browser.setView({
            "surfaces": {
                "grand": [],
                "ev": []
            },
            "freelayers": []
        });    
    }
}
