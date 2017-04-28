
import Dom_ from '../utility/dom';
var dom = Dom_;

import {utils as utils_} from '../../core/utils/utils';
var utils = utils_;

import UIControlHolder_ from './control/holder';
var UIControlHolder = UIControlHolder_;

import UIControlMap_ from './control/map';
var UIControlMap = UIControlMap_;

import UIControlCompass_ from './control/compass';
import UIControlCredits_ from './control/credits';
import UIControlFullscreen_ from './control/fullscreen';
import UIControlZoom_ from './control/zoom';
import UIControlSpace_ from './control/space';
import UIControlSearch_ from './control/search';
import UIControlLink_ from './control/link';
import UIControlLayers_ from './control/layers';
import UIControlFallback_ from './control/fallback';
import UIControlPopup_ from './control/popup';
import UIControlLoading_ from './control/loading';

//get rid of compiler mess
var UIControlCompass = UIControlCompass_;
var UIControlCredits = UIControlCredits_;
var UIControlFullscreen = UIControlFullscreen_;
var UIControlZoom = UIControlZoom_;
var UIControlSpace = UIControlSpace_;
var UIControlSearch = UIControlSearch_;
var UIControlLink = UIControlLink_;
var UIControlLayers = UIControlLayers_;
var UIControlFallback = UIControlFallback_;
var UIControlPopup = UIControlPopup_;
var UIControlLoading = UIControlLoading_;


var UI = function(browser, element) {
    this.browser = browser;
    this.config = browser.config;
    this.rootElement = element;
    this.element = null;
    this.controls = [];
    this.killed = false;
    this.init();
    this.instanceId = utils.instanceCounter++;
};


UI.prototype.init = function() {
    //create browser wrapper
    this.element = document.createElement('div');
    this.element.className = 'vts-browser';
    this.rootElement.appendChild(this.element);

    //create map cotrol
    this.map = new UIControlMap(this);
   
    //create other ui controls
    var loading = this.config.controlLoading;
    this.compass = new UIControlCompass(this, (!loading && this.config.controlCompass));
    this.credits = new UIControlCredits(this, (!loading && this.config.controlCredits));
    //this.logo = new UIControlLogo(this, this.config.controlLogo);
    this.fullscreen = new UIControlFullscreen(this, (!loading && this.config.controlFullscreen));
    this.zoom = new UIControlZoom(this, (!loading && this.config.controlZoom));
    this.space = new UIControlSpace(this, (!loading && this.config.controlSpace));
    this.search = new UIControlSearch(this, (!loading && this.config.controlSearch));
    this.link = new UIControlLink(this, (!loading && this.config.controlLink));
    //this.navigator = new UIControlNavigation(this, this.config.controlNavigator);
    this.layers = new UIControlLayers(this, (!loading && this.config.controlLayers));
    this.fallback = new UIControlFallback(this);
    this.popup = new UIControlPopup(this, false);
    this.loading = new UIControlLoading(this, this.config.controlLoading);

    dom.disableContexMenu(this.element);
};


UI.prototype.kill = function() {
    this.killed = true;

    for (var key in this.controls) {
        delete this.controls[key];
    }

    this.rootElement.removeChild(this.element);
    delete this.element;
    this.element = null;
};


UI.prototype.addControl = function(id, html, visible, parentElement) {
    var control = new UIControlHolder(this, html, visible, parentElement);
    this.controls[id] = control;
    return control;
};


UI.prototype.removeControl = function(id) {
    if (this.controls[id] != null) {
        delete this.controls[id];
    }
};


UI.prototype.setControlHtml = function(id, html) {
    if (this.controls[id] != null) {
        this.controls[id].setHTML(html);
    }
};


UI.prototype.setControlVisible = function(id, state) {
    if (this.controls[id] != null) {
        this.controls[id].setVisible(state);
    }
};


UI.prototype.getControlVisible = function(id) {
    if (this.controls[id] != null) {
        this.controls[id].getVisible();
    }
};


UI.prototype.getControl = function(id) {
    return this.controls[id];
};


UI.prototype.getMapControl = function() {
    return this.map;
};


UI.prototype.getMapElement = function() {
    return this.map.getMapElement();
};


UI.prototype.setParam = function(key) {
    switch (key) {
    case 'controlCompass':     this.setControlVisible('comapss', this.config.controlCompass); break;
    case 'controlZoom':        this.setControlVisible('zoom', this.config.controlZoom); break;
        //case "controlMeasure":     this.setControlVisible(this.config.controlCompass); break;
    case 'controlScale':       this.setControlVisible('scale', this.config.controlScale); break;
    case 'controlLayers':      this.setControlVisible('layers', this.config.controlLayers); break;
    case 'controlSpace':       this.setControlVisible('space', this.config.controlSpace); break;
    case 'controlSearch':      this.setControlVisible('search', this.config.controlSearch); break;
    case 'controlLink':        this.setControlVisible('link', this.config.controlLink); break;
    case 'controlLogo':        this.setControlVisible('logo', this.config.controlLogo); break;
    case 'controlFullscreen':  this.setControlVisible('fullscreeen', this.config.controlFullscreen); break;
    case 'controlCredits':     this.setControlVisible('credits', this.config.controlCredits); break;
        //case "controlLoading":     this.setControlVisible("loading", this.config.controlLogo); break;
    }
};


UI.prototype.tick = function(dirty) {
    if (dirty) {
        this.compass.update();
        this.space.update();
        this.credits.update();
        this.link.updateLink();                
        this.search.update();
    }

    if (this.loading.control.getVisible()) {
        this.loading.update();
    }
};


export default UI;


