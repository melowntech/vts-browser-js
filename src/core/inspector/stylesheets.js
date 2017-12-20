
var InspectorStylesheets = function(inspector) {
    this.inspector = inspector;
    this.core = inspector.core;
};


InspectorStylesheets.prototype.init = function() {
    var inspector = this.inspector;
    inspector.addStyle(
        '#vts-stylesheets-panel * {'
            + 'all: initial;'
        + '}'

        + '#vts-stylesheets-panel {'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'display: none;'
            + 'padding:15px;'
            + 'width: 1200px;'
            + 'height: 350px;'
            + 'font-size: 14px;'
            + 'position: absolute;'
            + 'right: 10px;'
            + 'bottom: 10px;'
            + 'cursor: default;'
            + 'background-color: rgba(255,255,255,0.95);'
            + 'border-radius: 5px;'
            + 'border: solid 1px #ccc;'
            + 'text-align: left;'
            + 'z-index: 7;'
            + 'padding: 10px;'
        + '}'

        + '#vts-stylesheets-panel-header {'
            + 'width: 100%;'
            + 'height: 28px;'
        + '}'

        + '#vts-stylesheets-panel-combo {'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'font-size: 13px;'
            + 'border: 1px solid #a9a9a9;'
            + 'width: 1070px;'
            + 'height: 17px;'
            + 'padding: 2px;'
            + 'margin-bottom: 5px;'
            + '-webkit-appearance: menulist;'
            + '-moz-appearance: menulist;'
        + '}'

        + '#vts-stylesheets-panel-combo option {'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'font-size: 13px;'
        + '}'

        + '#vts-stylesheets-panel-update-button {'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'font-size: 14px;'
            + 'float: right;'
            + 'background-color: #dedede;'
            + 'padding: 3px 2px 2px 2px;'
            + 'border: 1px solid #a0a0a0;'
            + 'border-radius: 2px;'
            + 'margin-right: 5px;'
        + '}'

        + '#vts-stylesheets-panel-hide-button {'
            + 'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;'
            + 'font-size: 14px;'
            + 'float: right;'
            + 'background-color: #dedede;'
            + 'padding: 3px 2px 2px 2px;'
            + 'border: 1px solid #a0a0a0;'
            + 'border-radius: 2px;'
        + '}'

        + '#vts-stylesheets-panel-text {'
            + 'font-family: monospace;'
            + 'border: 1px solid #a9a9a9;'
            + 'padding: 2px 0px 0px 2px;'
            + 'width: 100%;'
            + 'height: 300px;'
            + 'resize: none;'
            + 'white-space: pre;'
        + '}'
    );

    this.element = document.createElement('div');
    this.element.id = 'vts-stylesheets-panel';
    this.element.innerHTML =
            '<div id="vts-stylesheets-panel-header">'
            + '<select id="vts-stylesheets-panel-combo"></select>'
            + '<button id="vts-stylesheets-panel-hide-button" type="button" title="Hide">Hide</button>'
            + '<button id="vts-stylesheets-panel-update-button" type="button" title="Update">Update</button>'
          + '</div>'
          + '<textarea id="vts-stylesheets-panel-text" rows="4" cols="50">aa\naa\n</textarea>';

    //this.inspectorElement.appendChild(this.element);
    this.core.element.appendChild(this.element);

    this.optionsElement = document.getElementById('vts-stylesheets-panel-combo');
    this.optionsElement.onchange = this.onComboSwitched.bind(this);

    this.textElement = document.getElementById('vts-stylesheets-panel-text');
    
    document.getElementById('vts-stylesheets-panel-update-button').onclick = this.onUpdate.bind(this);
    document.getElementById('vts-stylesheets-panel-hide-button').onclick = this.hidePanel.bind(this);

    this.element.addEventListener('mouseup', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousedown', inspector.doNothing.bind(this), true);
    this.element.addEventListener('mousewheel', inspector.doNothing.bind(this), false);
    this.element.addEventListener('dblclick', inspector.doNothing.bind(this), false);

    this.textElement.addEventListener('keyup', inspector.doNothing.bind(this), false);
    this.textElement.addEventListener('keydown', inspector.doNothing.bind(this), false);

    this.panelVisible = false;
};


InspectorStylesheets.prototype.showPanel = function() {
    this.buildStylesheetsCombo();
    this.element.style.display = 'block';
    this.panelVisible = true;
};


InspectorStylesheets.prototype.hidePanel = function() {
    this.element.style.display = 'none';
    this.panelVisible = false;
};


InspectorStylesheets.prototype.switchPanel = function() {
    if (this.panelVisible) {
        this.hidePanel();
    } else {
        this.showPanel();
    }
};


InspectorStylesheets.prototype.onComboSwitched = function() {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var stylesheet = map.getStylesheet(this.optionsElement.value);
    this.textElement.value = this.niceStyleFormat(stylesheet);
};


InspectorStylesheets.prototype.onUpdate = function() {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    map.setStylesheetData(this.optionsElement.value, JSON.parse(this.textElement.value));
};


InspectorStylesheets.prototype.niceStyleFormat = function(data) {
    if (!data || !data.data) {
        return '';
    }
    
    data = data.data;

    //return JSON.stringify(data, null, "  ");
    
    var tmp = '';
    tmp += '{\n';

    var elements = [];

    if (data['constants']) {
        elements.push('constants');
    } 

    if (data['bitmaps']) {
        elements.push('bitmaps');
    } 

    if (data['fonts']) {
        elements.push('fonts');
    } 

    if (data['layers']) {
        elements.push('layers');
    } 
    
    for (var j = 0, lj = elements.length; j < lj; j++) {
        var type = elements[j];
        tmp += '  "' + type + '": {\n';

        var element = data[type];

        var buff = [];
        for (var key in element) {
            buff.push(key);
        }

        for (var i = 0, li = buff.length; i < li; i++) {
            if (type == 'layers') {
                
                var element2 = element[buff[i]];
                
                var buff2 = [];
                for (var key2 in element2) {
                    buff2.push(key2);
                }

                tmp += '    "' + buff[i] + '": {\n';

                for (var k = 0, lk = buff2.length; k < lk; k++) {
                    tmp += '      "' + buff2[k] + '": ' + JSON.stringify(element2[buff2[k]]) + (k == (lk - 1) ? '' : ',') + '\n';
                }
                
                tmp += '    }'  + (i == (li - 1) ? '' : ',\n');
            } else {
                tmp += '    "' + buff[i] + '": ' + JSON.stringify(element[buff[i]]) + (i == (li - 1) ? '' : ',') + '\n';
            }
        }
        
        tmp += '\n  }' + (j == (lj - 1) ? '' : ',\n');
    }
    
    tmp += '\n}';
    
    return tmp;
};


InspectorStylesheets.prototype.buildStylesheetsCombo = function() {
    var map = this.core.getMap();
    if (!map) {
        return;
    }

    var html = '';

    var styles = map.getStylesheets();
    
    for (var i = 0, li = styles.length; i < li; i++) {
        html += '<option value="' + styles[i] + '">' + styles[i] + '</option>';
    }    
    
    this.optionsElement.innerHTML = html;
    
    var stylesheet = map.getStylesheet(styles[0]);
    this.textElement.value = this.niceStyleFormat(stylesheet);
};


export default InspectorStylesheets;

