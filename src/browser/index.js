
import Proj4 from 'proj4';
import {getCoreVersion as getCoreVersion_, checkSupport as checkSupport_} from '../core/core';
import {vec2 as vec2_, vec3 as vec3_, vec4 as vec4_, mat3 as mat3_, mat4 as mat4_} from '../core/utils/matrix';
import {utils as utils_} from '../core/utils/utils';
import {math as math_} from '../core/utils/math';
import BrowserInterface_ from './interface';

//get rid of compiler mess
var getCoreVersion = getCoreVersion_, checkSupport = checkSupport_;
var vec2 = vec2_, vec3 = vec3_, vec4 = vec4_, mat3 = mat3_, mat4 = mat4_;
var utils = utils_;
var math = math_;
var BrowserInterface = BrowserInterface_;
var proj4 = Proj4;

function browser (element, config) {
    var browserInterface = new BrowserInterface(element, config);
    return browserInterface.core ? browserInterface : null;
}

function getBrowserVersion() {
//    return "Browser: 2.0.0, Core: " + getCoreVersion();
    return '' + getCoreVersion();
}

export {vec2,vec3,vec4,mat3,mat4,math,utils,getCoreVersion,checkSupport,browser,getBrowserVersion,proj4};
