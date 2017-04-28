
import {utils as utils_} from '../utils/utils';

//get rid of compiler mess
var utils = utils_;

var MapCredit = function(map, json) {
    this.map = map;
    this.id = json['id'] || null;
    this.notice = json['notice'] || null;
    this.copyrighted = json['copyrighted'] || true;
    this.url = json['url'] || null;
    this.html = utils.simpleWikiLinks(this.notice);
    this.plain = utils.simpleWikiLinks(this.notice);
};


MapCredit.prototype.getInfo = function() {
    return {
        'id' : this.id,
        'notice' : this.notice,
        //"copyrighted" : this.copyrighted,
        //"url" : this.url
        'html' : this.html,
        'plain' : this.plain
    };
};


export default MapCredit;

