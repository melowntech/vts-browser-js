
import Dom_ from '../../utility/dom';
import {UIControlMeasureIcon as UIControlMeasureIcon_, UIControlMeasureIcon2 as UIControlMeasureIcon2_} from './measure';

//get rid of compiler mess
var dom = Dom_,
    UIControlMeasureIcon = UIControlMeasureIcon_,
    UIControlMeasureIcon2 = UIControlMeasureIcon2_;


var UIControlMeasureLite = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('measure2',
      '<div id="vts-measure" class="vts-measure">'

        + '<img id="vts-measure-button"'
          + ' class="vts-measure-button"'
          + ' src="' + UIControlMeasureIcon + '">'

        + '<img id="vts-measure-button2"'
          + ' class="vts-measure-button"'
          + ' src="' + UIControlMeasureIcon2 + '">'

        + '<div id="vts-measure-text-holder" class="vts-measure-text-holder">'
            + '<div class="vts-measure-text-holder2">'
                + '<div class="vts-measure-text">'
                  + '<textarea id="vts-measure-text-input" rows="6" cols="50" wrap="hard"></textarea>'
                + '</div>'
                + '<div class="vts-measure-tools">'
                    + '<div id="vts-measure-clear" class="vts-measure-tools-button">Clear</div>'
                + '</div>'
            + '</div>'
        + '</div>'

        + '<div id="vts-measure-info" class="vts-measure-info">'
        + '</div>'
        
     + ' </div>', visible, visibleLock);
     
    this.div = this.control.getElement('vts-measure');

    this.buttonOff = this.control.getElement('vts-measure-button');
    this.buttonOff.on('click', this.onSwitch.bind(this));
    this.buttonOff.on('dblclick', this.onDoNothing.bind(this));

    this.buttonOn = this.control.getElement('vts-measure-button2');
    this.buttonOn.on('click', this.onSwitch.bind(this));
    this.buttonOn.on('dblclick', this.onDoNothing.bind(this));

    this.info = this.control.getElement('vts-measure-info');

    var clearButton = this.control.getElement('vts-measure-clear');
    clearButton.on('click', this.onClear.bind(this));
    clearButton.on('dblclick', this.onDoNothing.bind(this));

    this.measuring = false;
    this.counter = 1;
    this.lastCoords = null;

    this.listPanel = this.control.getElement('vts-measure-text-holder');
    this.list = this.control.getElement('vts-measure-text-input');

    if (this.measuring) {
        this.buttonOn.setStyle('display', 'block');
        this.buttonOff.setStyle('display', 'none');
    } else {
        this.buttonOn.setStyle('display', 'none');
        this.buttonOff.setStyle('display', 'block');
    }    

    this.onMouseMoveCall = this.onMouseMove.bind(this);
    this.onMouseLeaveCall = this.onMouseLeave.bind(this);
    this.onMouseClickCall = this.onMouseClick.bind(this);

    this.update();
};


UIControlMeasureLite.prototype.onDoNothing = function(event) {
    dom.stopPropagation(event);    
};

UIControlMeasureLite.prototype.onMouseLeave = function(event) {
    this.info.setStyle('display', 'none');
};


UIControlMeasureLite.prototype.onMouseClick = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var mapElement = this.ui.getMapElement();
    var state = mapElement.getDraggingState();

    //if (state['dragging']) { //TODO: why does not work this parameter? Fix it once you have time
      //  return;
    //}
    var delta = state['absMoved'];

    if ((delta[0]+delta[1]) > 0) {
        return;
    }

    var coords = event.getMouseCoords();
    var clickCoords = map.getHitCoords(coords[0], coords[1], 'fix');

    if (!clickCoords) {
        return;
    }

    clickCoords = map.convertCoordsFromNavToPublic(clickCoords, 'fix');

    var str = '#' + this.counter + '  ' + clickCoords[0].toFixed(7) + ', ' + clickCoords[1].toFixed(7) + ', ' + clickCoords[2].toFixed(2) + 'm';

    if (this.lastCoords) {
        var res = map.getDistance(this.lastCoords, clickCoords, false, true);
        var space = '\n   ';

        for (var i = 0, li = ('' + this.counter).length; i < li; i++) {
            space += ' ';
        }

        str += space + 'great-circle distance: ';

        if (res[0] > 100000) {
            str += '' + (res[0]*0.001).toFixed(2) + 'km';
        } else {
            str += '' + res[0].toFixed(2) + 'm';
        }

        str += space + 'elevation difference: ' + (clickCoords[2] - this.lastCoords[2]).toFixed(2) + 'm';
        str += space + 'euclidean distance: ';

        if (res[2] > 100000) {
            str += '' + (res[2]*0.001).toFixed(2) + 'km';
        } else {
            str += '' + res[2].toFixed(2) + 'm';
        }
    }

    this.counter++;
    this.lastCoords = clickCoords;

    var listElement = this.list.getElement();
    listElement.value += str + '\n';
    listElement.scrollTop = listElement.scrollHeight;    //scroll list to the last line
};

UIControlMeasureLite.prototype.onMouseMove = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var coords = event.getMouseCoords();
    var clickCoords = map.getHitCoords(coords[0], coords[1], 'fix');

    if (!clickCoords) {
        this.info.setStyle('display', 'none');
        return;    
    }

    clickCoords = map.convertCoordsFromNavToPublic(clickCoords, 'fix');

    var str = clickCoords[0].toFixed(7) + ', ' + clickCoords[1].toFixed(7) + ', ' + clickCoords[2].toFixed(2) + 'm';

    coords[0] -= this.divRect.left;
    coords[1] -= this.divRect.top;

    this.info.setStyle('display', 'block');
    this.info.setStyle('left', (coords[0]+20)+'px');
    this.info.setStyle('top', (coords[1]+10)+'px');
    this.info.setHtml(str);
};

UIControlMeasureLite.prototype.onSwitch = function() {
    this.measuring = !this.measuring;

    var mapElement = this.ui.getMapElement();

    if (this.measuring) {
        this.buttonOn.setStyle('display', 'block');
        this.buttonOff.setStyle('display', 'none');

        this.divRect = this.div.getRect();

        mapElement.on('mousemove', this.onMouseMoveCall);
        mapElement.on('mouseleave', this.onMouseLeaveCall);
        mapElement.on('click', this.onMouseClickCall);

    } else {
        this.buttonOn.setStyle('display', 'none');
        this.buttonOff.setStyle('display', 'block');

        mapElement.off('mousemove', this.onMouseMoveCall);
        mapElement.off('mouseleave', this.onMouseLeaveCall);
        mapElement.off('click', this.onMouseClickCall);
    }

    this.updateLink();
    this.update();
};

UIControlMeasureLite.prototype.onClear = function() {
    this.counter = 1;
    this.lastCoords = null;

    var listElement = this.list.getElement();
    listElement.value = '';
    listElement.scrollTop = 0;
};

UIControlMeasureLite.prototype.update = function() {
    //var button = this.control.getElement('vts-measure-button');
    
    var left = 10 + (this.ui.config.controlZoom ? 70 : 0) +
                (this.ui.config.controlSpace ? 35 : 0);
    
    this.div.setStyle('left', left + 'px');
    this.listPanel.setStyle('display', this.measuring ? 'block' : 'none');
};


UIControlMeasureLite.prototype.updateLink = function() {
    /*
    var linkValue =  this.browser.getLinkWithCurrentPos();
    if (this.list.getElement().value != linkValue) {
        this.list.getElement().value = linkValue;
    }*/
};


export default UIControlMeasureLite;
