Melown.URL = {};

Melown.URL.isSameOrigin = function(url_) {
    if (typeof url_ !== 'string') {
        return false;
    }
    var docHost_ = document.location.hostname;
    var parser_ = Melown.URL.parse(url_)
    return parser_['hostname'] === docHost_;
}

Melown.URL.parse = function(url_) {
    if (typeof url_ !== 'string') {
        return null;
    }

    var parser_ = document.createElement('a');
    parser_['href'] = url_;
    return parser_
}

