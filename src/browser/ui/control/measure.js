
import Dom_ from '../../utility/dom';

//get rid of compiler mess
var dom = Dom_;


var UIControlMeasure = function(ui, visible) {
    this.ui = ui;
    this.browser = ui.browser;
    this.control = this.ui.addControl('measure',
      '<div id="vts-measure" class="vts-measure">'

        + '<img id="vts-measure-button"'
          + ' class="vts-measure-button"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2lpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkNjI1MjFjMi1mYzE5LTcyNDUtOTI5My1kNTU3MmE5N2E1MjgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6ODJGRUI2NzE2NzkwMTFFN0EzRUZFNzQ1NEFCMkVFQUQiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ODJGRUI2NzA2NzkwMTFFN0EzRUZFNzQ1NEFCMkVFQUQiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjRBMjkwN0JENjc4QzExRTc5QTQwRjk4NjQzOEI4RDczIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjRBMjkwN0JFNjc4QzExRTc5QTQwRjk4NjQzOEI4RDczIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+k3ySjQAAAdJJREFUeNrclk0oBGEYgHemjZOLm8tSyt9BqT2I1O7JSdSSkpsDxZGLi5MTjn5K4SDh4OfiaPfkIDebOPiPUqKUiLKet96pzzT7MztxMPX0le+b95n3Z2ZZmUwm9NuXHfqLK1smsVhsED5hKkhswc4mYJmHVxgNIvIslyE4hnLYDSqycwiaoCGVSnUFFdk5BH2wKHtBRbYKqlVwbQhGoNU5GETkZHKpggjMqaBFhaGgIltv/mKphRuQss1oZkPuG4oRWTLHlmU5fSlhOYNKSEK7xIUugj+6hmSHpROm2RvL9Q7arqf80IykdDEdgll4IWi/Bm+ECT8Z2R7l+DBKV6N/PoRnEbBuwIKf0nm+8S7RGuzDLaxLMuw/5OuR+bn60ROPt9/pUUQnUEa6A56SyeSWeTYejzs9GkC8ZIpySjxEy1APbdCM6MAlGmeZdIahYIlLVAU9kIA7KZFxrJrA5+bU8RBjBf+eGD26gk0oI4AItiU4dMOqHh+GTylbQT3JU7oj2IMLmNBJrIATKIUoD5L2LfEQJbRPvXAP0iPZj5J92vNl9Fk6mSCZsBV4dwuyflb8XJrRqX6C3iDsFhSdiXOzZlSnwxD2yuBHJv/iX6JvAQYAPSICqA82OnoAAAAASUVORK5CYII=">'

        + '<img id="vts-measure-button2"'
          + ' class="vts-measure-button"'
          + ' src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDIxIDc5LjE1NDkxMSwgMjAxMy8xMC8yOS0xMTo0NzoxNiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2Nzg3NzczMzY3OEMxMUU3QjU2QUUxNTNCNzc4MzVBQiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2Nzg3NzczNDY3OEMxMUU3QjU2QUUxNTNCNzc4MzVBQiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjY3ODc3NzMxNjc4QzExRTdCNTZBRTE1M0I3NzgzNUFCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjY3ODc3NzMyNjc4QzExRTdCNTZBRTE1M0I3NzgzNUFCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+owD8TQAAAepJREFUeNrcls8rBGEYx993lIMfxR4kF/+AKMqBg7K1ajelLEWK025tKOTnjVykuAklNgcHuzmQg4MiTtz4Aza3TeGActDr+45nZt41s7tmBwdbn2l35933M9/3eead5UII9tsvjf3FK2uSiGgBKdDtZW6JllXA2DG4A3teRM7LZQl2QRuY9irScghGQRXb5KteRVoOQSMY0895FGkk8JHgSBH0gllzpAeRkeSRBAEwQIIZUJMxukARly3GOZdpivA5DnpAM2iQ5zFx3KE55DIugT6cT+a7PTTlKt9xHAT74AzU6vWJiEVQ4iWR9uXHhkgu3QhYB/JK3zBZE6WoBkE3Ivt9YolOQBd9uwJedQFjC+A8XyJ1J3G+4zNFV+CCmmMejINnY8sQG0wVzZnFlnW2Fd55ezGaIUAtPgzqwAsmv8mYMCLW8DaqdyY1g73w+RMFQRh0glse1RtDHRvDcdJp6XInsScKU3u3gnukSfCoOcoH0YPa3jif/P7zxEqUoPqUkWBZ398YqwdTNHqLdu+YuyTONToEl+AaTIAhUE61qwTtuJC0e4klkssQAn7QTy3+BA5AhRQgfdoovHvJp6iYli5EdTqlBKZA7a7CJFaiHdABUqBUFfyMxBJt06PBrwpskn/xl+hDgAEAH0j0b9rsgVUAAAAASUVORK5CYII=">'

        + '<div id="vts-measure-text-holder" class="vts-measure-text-holder">'
            + '<div class="vts-measure-text">'
              + '<textarea id="vts-measure-text-input" rows="4" cols="50" wrap="hard"></textarea>'
            + '</div>'
        + '</div>'

        + '<div id="vts-measure-info" class="vts-measure-info">'
        + '</div>'
        
     + ' </div>', visible);
     
    this.div = this.control.getElement('vts-measure');

    this.buttonOff = this.control.getElement('vts-measure-button');
    this.buttonOff.on('click', this.onSwitch.bind(this));
    this.buttonOff.on('dblclick', this.onDoNothing.bind(this));

    this.buttonOn = this.control.getElement('vts-measure-button2');
    this.buttonOn.on('click', this.onSwitch.bind(this));
    this.buttonOn.on('dblclick', this.onDoNothing.bind(this));

    this.info = this.control.getElement('vts-measure-info');

    this.measuring = false;
    this.counter = 1;

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


UIControlMeasure.prototype.onDoNothing = function(event) {
    dom.stopPropagation(event);    
};

UIControlMeasure.prototype.onMouseLeave = function(event) {
    this.info.setStyle('display', 'none');
};


UIControlMeasure.prototype.onMouseClick = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var coords = event.getMouseCoords();
    var clickCoords = map.getHitCoords(coords[0], coords[1], 'fix');
    clickCoords = map.convertCoordsFromNavToPublic(clickCoords, 'fix');

    var str = '#' + this.counter + '  ' + clickCoords[0].toFixed(7) + ', ' + clickCoords[1].toFixed(7) + ', ' + clickCoords[2].toFixed(2);
    this.counter++;

    var listElement = this.list.getElement();
    listElement.value += str + '\n';
    listElement.scrollTop = listElement.scrollHeight;    //scroll list to the last line
};

UIControlMeasure.prototype.onMouseMove = function(event) {
    var map = this.browser.getMap();
    if (!map) {
        return;
    }

    var coords = event.getMouseCoords();
    var clickCoords = map.getHitCoords(coords[0], coords[1], 'fix');
    clickCoords = map.convertCoordsFromNavToPublic(clickCoords, 'fix');

    var str = clickCoords[0].toFixed(7) + ', ' + clickCoords[1].toFixed(7) + ', ' + clickCoords[2].toFixed(2);

    coords[0] -= this.divRect.left;
    coords[1] -= this.divRect.top;

    this.info.setStyle('display', 'block');
    this.info.setStyle('left', (coords[0]+20)+'px');
    this.info.setStyle('top', (coords[1]+10)+'px');
    this.info.setHtml(str);
};

UIControlMeasure.prototype.onSwitch = function() {
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


UIControlMeasure.prototype.update = function() {
    //var button = this.control.getElement('vts-measure-button');
    
    var left = 10 + (this.ui.config.controlZoom ? 70 : 0) +
                (this.ui.config.controlSpace ? 35 : 0);
    
    this.div.setStyle('left', left + 'px');
    this.listPanel.setStyle('display', this.measuring ? 'block' : 'none');
};


UIControlMeasure.prototype.updateLink = function() {
    /*
    var linkValue =  this.browser.getLinkWithCurrentPos();
    if (this.list.getElement().value != linkValue) {
        this.list.getElement().value = linkValue;
    }*/
};


export default UIControlMeasure;

