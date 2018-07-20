
import Dom_ from '../../utility/dom';

//get rid of compiler mess
var dom = Dom_;

var UIControlCompass = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('compass',
      '<div id="vts-compass">'

        + '<div id="vts-compass-frame">'
            + '<img id="vts-compass-compass" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABjCAYAAACPO76VAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODRDNjZFNDJCQjNCMTFFM0IyN0ZCQTZFQTAwNzEzNDUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODRDNjZFNDNCQjNCMTFFM0IyN0ZCQTZFQTAwNzEzNDUiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4NEM2NkU0MEJCM0IxMUUzQjI3RkJBNkVBMDA3MTM0NSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4NEM2NkU0MUJCM0IxMUUzQjI3RkJBNkVBMDA3MTM0NSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pgg3VBcAAAzUSURBVHja7F1bbBTX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">'
        + '</div>'

        + '<div id="vts-compass-frame2">'
            + '<img id="vts-compass-compass2" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABjCAYAAACPO76VAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABG9JREFUeNrtnM9LFGEcxkeEPCQVmbkh7EXoEgW6noIQzQwKoQ5Lkgh7SA8iddlCQfAQFApdghAxooJCsEMe9JAEek8i81YQCIEYQvgHZM9L37Fpmpl9Z3d+rs8DDw7unuaz3+ddX+d9DIOiKIqiKIqiKIqiKIqiKIqiKIqiKMpTQ0NDyqNwTq7/MRUNAKsfwL2EER+MLHxBru/BA4QR3zR0wY/lWmmEMKKHcVh+tsEv5PoGPE4Y0cP4LD9b4AW57oC/whvwB3gZfgN3886FG1EmjAZ41WEa6uAm+DTcyLsXPAz11fWkDUYtvAVPwHfgAnwdbmVMhQtjDj4jN3gNPiTXF+E8fAsuwvfhQScIuVwuMusK762H69IGYwY+LwDew+3wcZkOQ2fhThoMvK8TnkrjZEzCV+RGF2XhXoE/wuvwJ7jGK5aSAkOm4Qm8DTemEcYYfNNtCnTWiCTAkGn4Bu/B+bSuGcPwF3gJfg1Pww/l661uLMQGwzINe+L5tH+1PSpbIOdkG0TtRWWSDsM2Dco/UhlPQSpqGA7TsJfqeEorDLjHNg3pj6cUwjgCzzpAYDxFDENNw6YLCOU+Uggfhtc0mH5LAuHDKDUNyjtwhgTCg6EzDab7effDg6EzDYynkGH4mQbGU4gw/EwD4ykkGMfgZz4hMJ5CgHEV/l4GCMZTgDDUNDwvAwLjKeD1odxp2I8nP/92JQx3P6oAwn48EUYw64N5U3+VG09+H0ggDOc1woymn/Bl2WH1A2KhnKdDCON/WxfrgvzurA8gCmAzYVQOwxpPi7bXdIEUyn1uijDc46nZ4T2lgCxW8hAbYfz1U69PtwYQN4AE4BNGT6lPtwaQQqWPdxLGn93XzVKfbgff1QVI6cOY1Ywnt+2RkgApPRh+48m+PaJA9Ab1FPpBhuEnnpw2Cxd1I40qDUM3npymoRDG+YyDCsMaT0thTANh6MGwxtMunA1jGghDD4Y1ngY1pkH9T+JUFMfIDhoMazy9g2s8pmHHug1OGMHCcIunBvilwzRkoj5geZBgOMXTNXgrjGkgDHcYl2zxdAJ+FeY0EIYziHrLQRUVT7ejmAbCcIZhPbq1G9U06MIo97RuGkF0ejy50Z9LwDlwuekZOSB6QQ6MZuUAaVXGU+TT4BNGixydnpaj1EtytHq4GuPJPEPXF/HBSkcYOmUCUjowVo3xNK8OM8YBwgNGjdRqrEvNxorUbhTldVXHMVlN8aSmIR8XBDsMjymolSKadimmMaSoZqZa4mnePNqbMBiDUr1UlCqmvFQzGVLVtCbXqsJpLu3xtG1vHYgThMMUtEopWUFKyiaktKzWVmamys1G0xxPU04H3RMAo1Fq+Zqkps8OaFVq/aww0vt3hleDWQJgdEth5bIUWG5IoWWHvL5gNgJZYVABy2PRHpfKV0MqYNts1bC8eRHCGJEyZEPKkbvYwRsfjAGpCTdkGyRLAPHB6JUCfU5DAmDkpJ+XN4miKIqiKIqiKIqiKIqiKIqiKIpKpn4DKrVAiBFUfdUAAAAASUVORK5CYII=">'
        + '</div>'

        + '<div id="vts-compass-frame3">'
            + '<img id="vts-compass-compass3" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGMAAABjCAYAAACPO76VAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABG9JREFUeNrtnM9LFGEcxkeEPCQVmbkh7EXoEgW6noIQzQwKoQ5Lkgh7SA8iddlCQfAQFApdghAxooJCsEMe9JAEek8i81YQCIEYQvgHZM9L37Fpmpl9Z3d+rs8DDw7unuaz3+ddX+d9DIOiKIqiKIqiKIqiKIqiKIqiKIqiKMpTQ0NDyqNwTq7/MRUNAKsfwL2EER+MLHxBru/BA4QR3zR0wY/lWmmEMKKHcVh+tsEv5PoGPE4Y0cP4LD9b4AW57oC/whvwB3gZfgN3886FG1EmjAZ41WEa6uAm+DTcyLsXPAz11fWkDUYtvAVPwHfgAnwdbmVMhQtjDj4jN3gNPiTXF+E8fAsuwvfhQScIuVwuMusK762H69IGYwY+LwDew+3wcZkOQ2fhThoMvK8TnkrjZEzCV+RGF2XhXoE/wuvwJ7jGK5aSAkOm4Qm8DTemEcYYfNNtCnTWiCTAkGn4Bu/B+bSuGcPwF3gJfg1Pww/l661uLMQGwzINe+L5tH+1PSpbIOdkG0TtRWWSDsM2Dco/UhlPQSpqGA7TsJfqeEorDLjHNg3pj6cUwjgCzzpAYDxFDENNw6YLCOU+Uggfhtc0mH5LAuHDKDUNyjtwhgTCg6EzDab7effDg6EzDYynkGH4mQbGU4gw/EwD4ykkGMfgZz4hMJ5CgHEV/l4GCMZTgDDUNDwvAwLjKeD1odxp2I8nP/92JQx3P6oAwn48EUYw64N5U3+VG09+H0ggDOc1woymn/Bl2WH1A2KhnKdDCON/WxfrgvzurA8gCmAzYVQOwxpPi7bXdIEUyn1uijDc46nZ4T2lgCxW8hAbYfz1U69PtwYQN4AE4BNGT6lPtwaQQqWPdxLGn93XzVKfbgff1QVI6cOY1Ywnt+2RkgApPRh+48m+PaJA9Ab1FPpBhuEnnpw2Cxd1I40qDUM3npymoRDG+YyDCsMaT0thTANh6MGwxtMunA1jGghDD4Y1ngY1pkH9T+JUFMfIDhoMazy9g2s8pmHHug1OGMHCcIunBvilwzRkoj5geZBgOMXTNXgrjGkgDHcYl2zxdAJ+FeY0EIYziHrLQRUVT7ejmAbCcIZhPbq1G9U06MIo97RuGkF0ejy50Z9LwDlwuekZOSB6QQ6MZuUAaVXGU+TT4BNGixydnpaj1EtytHq4GuPJPEPXF/HBSkcYOmUCUjowVo3xNK8OM8YBwgNGjdRqrEvNxorUbhTldVXHMVlN8aSmIR8XBDsMjymolSKadimmMaSoZqZa4mnePNqbMBiDUr1UlCqmvFQzGVLVtCbXqsJpLu3xtG1vHYgThMMUtEopWUFKyiaktKzWVmamys1G0xxPU04H3RMAo1Fq+Zqkps8OaFVq/aww0vt3hleDWQJgdEth5bIUWG5IoWWHvL5gNgJZYVABy2PRHpfKV0MqYNts1bC8eRHCGJEyZEPKkbvYwRsfjAGpCTdkGyRLAPHB6JUCfU5DAmDkpJ+XN4miKIqiKIqiKIqiKIqiKIqiKIpKpn4DKrVAiBFUfdUAAAAASUVORK5CYII=">'
        + '</div>'

      + ' </div>', visible, visibleLock);

    var compass = this.control.getElement('vts-compass');
    compass.setDraggableState(true);
    compass.on('drag', this.onDrag.bind(this));
    compass.on('dblclick', this.onDoubleClick.bind(this));

    this.image = this.control.getElement('vts-compass-compass');
    this.image2 = this.control.getElement('vts-compass-compass2');
    this.image3 = this.control.getElement('vts-compass-compass3');
    
    this.lastStyle = '';
};


UIControlCompass.prototype.update = function() {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var pos = map.getPosition();
    var orientation = pos.getOrientation();
    var value = 'rotateX('+(Math.round(orientation[1]+90)*0.7)+'deg) ' + 'rotateZ('+Math.round(-orientation[0]-45)+'deg)';

    if (value != this.lastStyle) {
        this.lastStyle = value;
        this.image.setStyle(dom.TRANSFORM, value);
        this.image2.setStyle(dom.TRANSFORM, value);
        this.image3.setStyle(dom.TRANSFORM, value);
    }
};


UIControlCompass.prototype.onDrag = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    if (this.browser.autopilot) { //stop autorotation
        this.browser.autopilot.setAutorotate(0);
        this.browser.autopilot.setAutopan(0,0);
    }

    var delta = event.getDragDelta();
    var sensitivity = 0.4;
    
    var controller = this.browser.controlMode.getCurrentController();
    
    if (controller.orientationDeltas) {
        controller.orientationDeltas.push([delta[0] * sensitivity,
            -delta[1] * sensitivity, 0]);
    }
};


UIControlCompass.prototype.onDoubleClick = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    if (this.browser.autopilot) { //stop autorotation
        this.browser.autopilot.setAutorotate(0);
        this.browser.autopilot.setAutopan(0,0);
    }

    var pos = map.getPosition();
    var orientation = pos.getOrientation();
    orientation[0] = 0;
    orientation[1] = -90;
    pos.setOrientation(orientation);

    map.setPosition(pos);

    if (this.browser.config.navigationMode == 'azimuthal2')  {
        this.browser.config.navigationMode = 'azimuthal';
    }
    
    dom.stopPropagation(event);    
};


export default UIControlCompass;
