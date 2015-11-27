Melown.http = {};

Melown.http.loadImageFormUrl = function(image_, url_) {
    if (!image_ instanceof Image || typeof url_ !== 'string') {
        return;
    }

    var parser_ = Melown.URL.parse(url_);
    if (parser_ === null) {
        return;
    }

    if (parser_['hostname'] !== '') {
        image_.crossOrigin = Melown.URL.isSameOrigin(url_) ? 
                             "use-credentials" : "anonymous";
    }
    image_.src = url_;
}

Melown.http.imageFactory = function(url_, onload_, onerror_) {
    var image_ = new Image();
    image_.onerror = onerror_;
    image_.onload = onload_;
    Melown.http.loadImageFormUrl(image_, url_);
    return image_;
}
