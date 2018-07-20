
import Dom_ from '../../utility/dom';
var dom = Dom_;

import {constrainMapPosition as constrainMapPosition_} from '../../control-mode/map-observer';
var constrainMapPosition = constrainMapPosition_;


var UIControlSpace = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('space',
      '<div id="vts-space"'
      + ' class="vts-space">'

        + '<img id="vts-space-2d"'
          + ' class="vts-space-button"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABqElEQVRIx+2UsWoUURSGv3Nn1sIiaKMBSbD0AdRBdmbdB7DMA0gaSSVRbFRYiGAaUWJhEAQVEey10yacO/gAwqZNSKWwhShs4ew9NtewTDI6sRCE/at7h8P/nfnvuRdmmum/lkxvut1u5pwbAOfNrAMMzWy9LMt3v2qKorCaRwC+A9vApqq+bITkeX4Z+CAiab3IzJa9988bIPXaR977G9Pf3NT6joikZvYmSZL5JElOAPcBRORu3UxVRVVlNBodCyEsmtkAMBFZjQ3va79rETluZl+rqrrpvf8c41t3zt0GFpo6Hw6HP4A9YK0oinlgRUSuAVsHIKqaH8hSJIsR7LQ54KqqNtI0XTGzS01xURuCBeBZhD1pAzGz3Vh/+o+QXq93zjnnReSsmb1W1Y0jTm3yW0ie5xdDCB5YNLMX4/H4KmAtzc/EP/py6MHH8bwAvAfmgDXv/eAo7Xc6nSsxro+HQrIsO2Vmb0VkDrilqg9aert+v39yMpksAfciZLPpMj4UkdUmJ1WVNpcReKyq15viWvrLp8mAb8CnEMLTsixfzV7rmf6dfgKmzKAWE7bqxgAAAABJRU5ErkJggg==">'

        + '<img id="vts-space-3d"'
          + ' class="vts-space-button"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAB8klEQVRIx+1Uv4sTQRT+3mRygyDInYXFabaxsRNOIiG7mEPQxsJCLQVF8AeiaCNWigrWiniCVfA/0Eo4ONnZ4P4FURAL9yyCEMQfRMzs7LOZk2HZxNgIQr7qzbw373t838wAc8zxX4P8RbvdPimEuMLM+4loAcAmM3eTJLkHgAEgiiIu9SgAfAfwBsCa1rpbJqltBWEYXhBCdAE0HEENwBIRrQZBQFmWvQKAIAhuVwyqAOwGcLzRaOzIsuylXyB+VxKdc+FTY8yyMWZbURSn3N7l8nRaa9Ja03A4XCiKosHMtwAwEV0Lw/BQJYnW+oAxZu9oNLqUpulASrmdiPa49GCS3v1+3/R6vc0kSe4AeOIGPu/XSH+Rpul7J906ER0GAGYeADgzi8F5nj+QUl5k5tZEEk+6fV6sfO+mgZk/uDO7KuUqYcUYswTgGYBFAPf/8tbW/kiitR6kafqZma+7CVdmbL7s6j9VyhVF0QtmbuV5fnDLm/F4rJRSICKehaFerx9zcr2uJGHmn0S0U0r5uNlsnlVKWQCPXG5jSm/R6XQWrbUnANx1JGuTjL/JzEeJ6IhS6qNH/kUIcaPc2X/51lo/9TCO441KT5IkeWetXQWwDuAHgG/M/BxAK47jt9MuFYCvAHpFUZzWWl+d/9Zz/Dv8ApJPyD0fWCwOAAAAAElFTkSuQmCC">'

     + ' </div>', visible, visibleLock);
     
    this.button2D = this.control.getElement('vts-space-2d');
    this.button2D.on('click', this.onSwitch.bind(this));
    this.button2D.on('dblclick', this.onDoNothing.bind(this));

    this.button3D = this.control.getElement('vts-space-3d');
    this.button3D.on('click', this.onSwitch.bind(this));
    this.button3D.on('dblclick', this.onDoNothing.bind(this));

    this.space3D = true;
    this.display3D = this.space3D;

    if (this.space3D) {
        this.button2D.setStyle('display', 'block');
        this.button3D.setStyle('display', 'none');
    } else {
        this.button2D.setStyle('display', 'none');
        this.button3D.setStyle('display', 'block');
    }
};


UIControlSpace.prototype.onDoNothing = function(event) {
    dom.stopPropagation(event);    
};


UIControlSpace.prototype.onSwitch = function() {
    this.space3D = !this.space3D;

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

    if (this.space3D) {
        orientation[0] = 45;
        orientation[1] = -60;
        //pos = map.setPositionFov(pos, 90);
        pos.setOrientation(orientation);
    } else {
        orientation[0] = 0;
        orientation[1] = -90;
        //pos = map.setPositionFov(pos, 5);
        pos.setOrientation(orientation);
    }

    pos = constrainMapPosition(this.browser, pos);
    map.setPosition(pos);
    
    this.update();
};


UIControlSpace.prototype.update = function() {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var pos = map.getPosition();
    var orientation = pos.getOrientation();

    var space3D = (Math.abs(orientation[1]+90) > 0.1);

    if (space3D != this.display3D) {
        if (space3D) {
            this.button2D.setStyle('display', 'block');
            this.button3D.setStyle('display', 'none');
        } else {
            this.button2D.setStyle('display', 'none');
            this.button3D.setStyle('display', 'block');
        }

        this.space3D = space3D;
        this.display3D = space3D;
    }
};


export default UIControlSpace;
