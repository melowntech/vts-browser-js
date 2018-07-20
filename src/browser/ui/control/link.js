
import Dom_ from '../../utility/dom';

//get rid of compiler mess
var dom = Dom_;


var UIControlLink = function(ui, visible, visibleLock) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('link',
      '<div id="vts-link" class="vts-link">'

        + '<div id="vts-link-button" class="vts-link-button">'
          + '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAABrUlEQVRIx+2VMWtUQRSFz5nZjVrpD9gNVhpLQbZZ5vWaIoUECayNRSpbo9UiJI1pBRs7DVjYGBC1ntm3yHaiwgYsZP+EmMe7x8K3YJEH+xYLwT3NcGe483HvnJkBVvovxWWSsiy7BeAxgGuSpmY2zPP8/V+DhBAekDysQgPgAMDMbo5Gow9n5bgmgF6vd47kAYBC0t0Y45qkPQAguV+X1wgymUx+ShqUZZmllI4AlEVRPJckkht1ea1FNu/3+1ve+31JV0h+dc49mq+12+0dkpQ0XfpMQgh7JJ9U4SmANf3WZUnXvfevAbQBbMYY3zVu1x+Awsx2YoznzewOgKcke3OApId1AADwCwIGJG90u12f5/nx+vr6Jefc0RyQUjpsfE9CCJsk3wIoyrLcljRttVrznv8AcAEAFgHUtovksNrkXp7nx+Px+ETSbQBfKrN8NrOtRQC17pK0QbJMKb2az5nZd+fc/ZRSBKAm1q+r5ASADyHsVuPAe/+R5JtlnqEzIWY2rGDPsiw7JfmysulB0ypq3TWbzb51Op0JyaskLwL4BGA3xvhi9aes9G/pF4AdwlhUZ8RfAAAAAElFTkSuQmCC">'
        + '</div>'

        + '<div id="vts-link-text-holder" class="vts-link-text-holder">'
            + '<div class="vts-link-text">'
              + '<textarea id="vts-link-text-input" rows="4" cols="50" wrap="hard"></textarea>'
            + '</div>'
        + '</div>'
        
     + ' </div>', visible, visibleLock);
     
    this.div = this.control.getElement('vts-link');

    var button = this.control.getElement('vts-link-button');
    button.on('click', this.onSwitch.bind(this));
    button.on('dblclick', this.onDoNothing.bind(this));

    this.linkPanel = this.control.getElement('vts-link-text-holder');
    this.link = this.control.getElement('vts-link-text-input');

    this.linkVisible = false;
    this.update();
};


UIControlLink.prototype.onDoNothing = function(event) {
    dom.stopPropagation(event);    
};


UIControlLink.prototype.onSwitch = function() {
    this.linkVisible = !this.linkVisible;
    this.updateLink();
    this.update();
};


UIControlLink.prototype.update = function() {
    //var button = this.control.getElement('vts-link-button');
    
    var left = 10 + (this.ui.config.controlZoom ? 70 : 0) +
                (this.ui.config.controlSpace ? 35 : 0);
    
    this.div.setStyle('left', left + 'px');
    this.linkPanel.setStyle('display', this.linkVisible ? 'block' : 'none');
};


UIControlLink.prototype.updateLink = function() {
    var linkValue =  this.browser.getLinkWithCurrentPos();
    if (this.link.getElement().value != linkValue) {
        this.link.getElement().value = linkValue;
    }
};


export default UIControlLink;

