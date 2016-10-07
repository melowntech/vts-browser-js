/**
 * @constructor
 */
Melown.UIControlSpace = function(ui_, visible_) {
    this.ui_ = ui_;
    this.browser_ = ui_.browser_;
    this.control_ = this.ui_.addControl("space",
      '<div id="melown-space"'
      + ' class="melown-space">'

        + '<img id="melown-space-2d"'
          + ' class="melown-space-button"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABqElEQVRIx+2UsWoUURSGv3Nn1sIiaKMBSbD0AdRBdmbdB7DMA0gaSSVRbFRYiGAaUWJhEAQVEey10yacO/gAwqZNSKWwhShs4ew9NtewTDI6sRCE/at7h8P/nfnvuRdmmum/lkxvut1u5pwbAOfNrAMMzWy9LMt3v2qKorCaRwC+A9vApqq+bITkeX4Z+CAiab3IzJa9988bIPXaR977G9Pf3NT6joikZvYmSZL5JElOAPcBRORu3UxVRVVlNBodCyEsmtkAMBFZjQ3va79rETluZl+rqrrpvf8c41t3zt0GFpo6Hw6HP4A9YK0oinlgRUSuAVsHIKqaH8hSJIsR7LQ54KqqNtI0XTGzS01xURuCBeBZhD1pAzGz3Vh/+o+QXq93zjnnReSsmb1W1Y0jTm3yW0ie5xdDCB5YNLMX4/H4KmAtzc/EP/py6MHH8bwAvAfmgDXv/eAo7Xc6nSsxro+HQrIsO2Vmb0VkDrilqg9aert+v39yMpksAfciZLPpMj4UkdUmJ1WVNpcReKyq15viWvrLp8mAb8CnEMLTsixfzV7rmf6dfgKmzKAWE7bqxgAAAABJRU5ErkJggg==">'

        + '<img id="melown-space-3d"'
          + ' class="melown-space-button"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAB8klEQVRIx+1Uv4sTQRT+3mRygyDInYXFabaxsRNOIiG7mEPQxsJCLQVF8AeiaCNWigrWiniCVfA/0Eo4ONnZ4P4FURAL9yyCEMQfRMzs7LOZk2HZxNgIQr7qzbw373t838wAc8zxX4P8RbvdPimEuMLM+4loAcAmM3eTJLkHgAEgiiIu9SgAfAfwBsCa1rpbJqltBWEYXhBCdAE0HEENwBIRrQZBQFmWvQKAIAhuVwyqAOwGcLzRaOzIsuylXyB+VxKdc+FTY8yyMWZbURSn3N7l8nRaa9Ja03A4XCiKosHMtwAwEV0Lw/BQJYnW+oAxZu9oNLqUpulASrmdiPa49GCS3v1+3/R6vc0kSe4AeOIGPu/XSH+Rpul7J906ER0GAGYeADgzi8F5nj+QUl5k5tZEEk+6fV6sfO+mgZk/uDO7KuUqYcUYswTgGYBFAPf/8tbW/kiitR6kafqZma+7CVdmbL7s6j9VyhVF0QtmbuV5fnDLm/F4rJRSICKehaFerx9zcr2uJGHmn0S0U0r5uNlsnlVKWQCPXG5jSm/R6XQWrbUnANx1JGuTjL/JzEeJ6IhS6qNH/kUIcaPc2X/51lo/9TCO441KT5IkeWetXQWwDuAHgG/M/BxAK47jt9MuFYCvAHpFUZzWWl+d/9Zz/Dv8ApJPyD0fWCwOAAAAAElFTkSuQmCC">'

     + ' </div>', visible_);
     
    this.button2D_ = this.control_.getElement("melown-space-2d");
    this.button2D_.on("click", this.onSwitch.bind(this));
    this.button2D_.on("dblclick", this.onDoNothing.bind(this));

    this.button3D_ = this.control_.getElement("melown-space-3d");
    this.button3D_.on("click", this.onSwitch.bind(this));
    this.button3D_.on("dblclick", this.onDoNothing.bind(this));

    this.space3D_ = true;
    this.update();
};

Melown.UIControlSpace.prototype.onDoNothing = function(event_) {
    Melown.Utils.stopPropagation(event_);    
};

Melown.UIControlSpace.prototype.onSwitch = function() {
    this.space3D_ = !this.space3D_;
    this.update();
};

Melown.UIControlSpace.prototype.update = function() {
    if (this.space3D_) {
        this.button2D_.setStyle("display", "block");
        this.button3D_.setStyle("display", "none");
    } else {
        this.button2D_.setStyle("display", "none");
        this.button3D_.setStyle("display", "block");
    }

    var map_ = this.browser_.getMap();
    if (map_ == null) {
        return;
    }

    var pos_ = map_.getPosition();
    var orientation_ = map_.getPositionOrientation(pos_);

    if (this.space3D_) {
        orientation_[0] = 45;
        orientation_[1] = -60;
        //pos_ = map_.setPositionFov(pos_, 90);
        pos_ = map_.setPositionOrientation(pos_, orientation_);
    } else {
        orientation_[0] = 0;
        orientation_[1] = -90;
        //pos_ = map_.setPositionFov(pos_, 5);
        pos_ = map_.setPositionOrientation(pos_, orientation_);
    }

    pos_ = Melown.constrainMapPosition(this.browser_, pos_);
    map_.setPosition(pos_);
};


