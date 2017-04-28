
//css stuff
import 'browser/browser.css';
import 'browser/presenter/css/main.css';
import 'browser/presenter/css/panel.css';
import 'browser/presenter/css/subtitles.css';

import Browser_ from './browser';


//get rid of compiler mess
var Browser = Browser_;


var BrowserInterface = function(element, config) {
    this.browser = new Browser(element, config);
    this.core = this.browser.getCore();
    //this.map = null;//this.core.getMap();
    //this.ui = this.browser.ui;
    //this.autopilot = this.browser.autopilot;
    //this.presenter = this.browser.presenter;
    this.killed = false;
    //this.core.on("map-loaded", (function(){ this.map = this.core.getMap(); }).bind(this));
    //this.core.on("map-unloaded", (function(){ this.map = null; }).bind(this));    

    Object.defineProperty(this, 'map', {
        get: function() {
            if (this.killed) return;
            return this.core.map;
        }
    });

    Object.defineProperty(this, 'renderer', {
        get: function() {
            if (this.killed) return;
            return this.core.renderer;
        }
    });

    Object.defineProperty(this, 'autopilot', {
        get: function() {
            if (this.killed) return;
            return this.browser.autopilot;
        }
    });

    Object.defineProperty(this, 'presenter', {
        get: function() {
            if (this.killed) return;
            return this.browser.presenter;
        }
    });

    Object.defineProperty(this, 'ui', {
        get: function() {
            if (this.killed) return;
            return this.browser.ui;
        }
    });
};


/*BrowserInterface.prototype.getPresenter = function() {
    if (this.killed) return;
    return this.presenter;
};


BrowserInterface.prototype.getMap = function() {
    if (this.killed) return;
    return this.core.getMap();
};


BrowserInterface.prototype.getRenderer = function() {
    if (this.killed) return;
    return this.core.getRenderer();
};


BrowserInterface.prototype.getAutopilot = function() {
    if (this.killed) return;
    return this.autopilot;
};


BrowserInterface.prototype.getProj4 = function() {
    if (this.killed) return;
    return this.core.getProj4();
};


BrowserInterface.prototype.getUI = function() {
    if (this.killed) return;
    return this.ui;
};*/


BrowserInterface.prototype.destroy = function() {
    if (this.killed) return;
    this.core.destroy();
    //this.map = null;
    this.browser.kill();
    //this.ui.kill();
    //this.ui = null;
    //this.core = null;
    this.killed = true;
    return null;    
};


BrowserInterface.prototype.setControlMode = function(mode) {
    if (this.killed) return;
    this.browser.setControlMode(mode);
    return this;    
};


BrowserInterface.prototype.getControlMode = function() {
    if (this.killed) return;
    return this.browser.getControlMode();
};


BrowserInterface.prototype.loadMap = function(path) {
    if (this.killed) return;
    this.core.loadMap(path);
    return this;    
};


BrowserInterface.prototype.destroyMap = function() {
    if (this.killed) return;
    this.core.destroyMap();
    this.map = null;
    return this;    
};


BrowserInterface.prototype.on = function(eventName, call) {
    this.core.on(eventName, call);
    return this;    
};


BrowserInterface.prototype.setParams = function(params) {
    this.setConfigParams(params);
    return this;
};


BrowserInterface.prototype.setParam = function(key, value) {
    this.setConfigParam(key, value);
    return this;
};


BrowserInterface.prototype.getParam = function(key) {
    return this.getConfigParam(key);
};


export default BrowserInterface;
