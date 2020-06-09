
//css stuff
import './browser.css';
import './presenter/css/main.css';
import './presenter/css/panel.css';
import './presenter/css/subtitles.css';

import Browser_ from './browser';


//get rid of compiler mess
var Browser = Browser_;


var BrowserInterface = function(element, config) {
    this.browser = new Browser(element, config);
    this.core = this.browser.getCore();
    this.killed = false;


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



BrowserInterface.prototype.destroy = function() {
    if (this.killed) return;
    this.core.destroy();
    this.browser.kill();
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
    if (this.killed) return;
    return this.core.on(eventName, call);
    //return this;    
};


BrowserInterface.prototype.setParams = function(params) {
    if (this.killed) return;
    this.setConfigParams(params,true);
    return this;
};


BrowserInterface.prototype.setParam = function(key, value) {
    if (this.killed) return;
    this.browser.setConfigParam(key, value, true);
    return this;
};


BrowserInterface.prototype.getParam = function(key) {
    if (this.killed) return;
    return this.browser.getConfigParam(key);
};


export default BrowserInterface;
