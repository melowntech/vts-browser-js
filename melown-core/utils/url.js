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
    if (!(vars_.length == 1 && vars_[0] == "")) {
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
    }
    return queryString_;
};

Melown.Url.getHost = function(url_) {
    var location_ = document.createElement("a");
    location_.href = url_;
    return location_.hostname; 
};

Melown.Url.getProcessUrl = function(url_, originUrl_) {
    if (!url_ || !originUrl_) {
        return url_;
    }
    
    var baseUrl_ = url_.split('?')[0].split('/').slice(0, -1).join('/')+'/';

    var baseUrlSchema_ = "";
    if (window.location.href.indexOf("file://") != -1) {
        if (baseUrl_.indexOf("http://") != -1) {
            baseUrlSchema_ = "http:";
        }
        if (baseUrl_.indexOf("https://") != -1) {
            baseUrlSchema_ = "https:";
        }
    }

    var location_ = document.createElement("a");
    location_.href = originUrl_;
    var baseUrlOrigin_ = location_.origin; 
   
    url_ = url_.trim();

    if (url_.indexOf("://") != -1) { //absolute
        return url_;
    } else if (url_.indexOf("//") == 0) {  //absolute without schema
        return baseUrlSchema_ + url_;
    } else if (url_.indexOf("/") == 0) {  //absolute without host
        return baseUrlOrigin_ + url_;
    } else {  //relative
        return baseUrl_ + url_; 
    }
};

Melown["Url"] = Melown.Url;
Melown.Url["getParamsFromUrl"] = Melown.Url.getParamsFromUrl;

