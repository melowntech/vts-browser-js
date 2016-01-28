Melown.Url = {};

Melown.Url.isSameOrigin = function(url_) {
    if (typeof url_ !== 'string') {
        return false;
    }
    var docHost_ = document.location.hostname;
    var parser_ = Melown.Url.parse(url_);
    return parser_['hostname'] === docHost_;
};

Melown.Url.parse = function(url_) {
    if (typeof url_ !== 'string') {
        return null;
    }

    var parser_ = document.createElement('a');
    parser_['href'] = url_;
    return parser_;
};

Melown.Url.getParamsFromUrl = function(url_) {
    var parser_ = Melown.Url.parse(url_);
    var queryString_ = {};
    var query_ = parser_['search'].substring(1);
    var vars_ = query_.split("&");
    for (var i=0; i < vars_.length; i++) {
        var pair_ = vars_[i].split("=");
        if (typeof queryString_[pair_[0]] === "undefined") {
            queryString_[pair_[0]] = pair_[1];
        } else if (typeof queryString_[pair_[0]] === "string") {
            var arr_ = [ queryString_[pair_[0]], pair_[1] ];
            queryString_[pair_[0]] = arr_;
        } else {
            queryString_[pair_[0]].push(pair_[1]);
        }
    }
    return queryString_;
};