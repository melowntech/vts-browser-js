
Melown.Platform = {

    init: function () {

        var self_ = Melown.Platform;

        self_.browser = self_.searchString(self_.dataBrowser) || "An unknown browser";
        self_.version = self_.searchVersion(navigator.userAgent.toLowerCase()) || self_.searchVersion(navigator.appVersion) || "an unknown version";
        self_.OS = self_.searchString(self_.dataOS) || "an unknown os: ua: " + navigator.userAgent + " pl: " + navigator.platform;

        self_.mobile_ = (self_.OS == "iphone/ipod" || self_.OS == "android" || self_.OS == "ipad" || self_.OS == "windows ce"  || self_.OS == "windows phone" || self_.OS == "kindle");
        self_.mobileAndroid_ = (self_.OS == "android");
    },

    isMobile : function() { return Melown.Platform.mobile_; },
    isAndroid : function() { return Melown.Platform.mobileAndroid_; },

    searchString: function (data) {
        var self_ = Melown.Platform;
        for (var i=0; i<data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            self_.versionSearchString = data[i].versionSearch || data[i].identity;

            if (dataString) {
                if (dataString.toLowerCase().indexOf(data[i].subString) != -1) {
                    if (data[i].version != null) {
                        self_.version = data[i].version;
                    }
                    return data[i].identity;
                }
            } else if (dataProp) {
                return data[i].identity;
            }
        }
    },

    searchVersion: function (dataString) {
        var self_ = Melown.Platform;
        if (self_.version != null) {
            return self_.version;
        }
        var index = dataString.indexOf(self_.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+self_.versionSearchString.length+1));
    },

    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: "chrome",
            identity: "chrome"
        },
        {
            string: navigator.userAgent,
            subString: "firefox",
            identity: "firefox"
        },
        {
            string: navigator.vendor,
            subString: "apple",
            identity: "safari",
            versionSearch: "version"
        },
        {
            prop: window.opera,
            identity: "opera",
            versionSearch: "version"
        },
        {
            string: navigator.vendor,
            subString: "icab",
            identity: "icab"
        },
        {
            string: navigator.vendor,
            subString: "kde",
            identity: "konqueror"
        },
        {
            string: navigator.vendor,
            subString: "camino",
            identity: "camino"
        },
        {       // for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: "netscape",
            identity: "netscape"
        },
        {
            string: navigator.userAgent,
            subString: "msie",
            identity: "explorer",
            versionSearch: "msie"
        },
        {
            string: navigator.userAgent,
            subString: "trident/",
            identity: "explorer",
            version: "11"
        },
        {
            string: navigator.userAgent,
            subString: "edge/",
            identity: "explorer",
            version: "12"
        },
        {   string: navigator.userAgent,
            subString: "omniweb",
            versionSearch: "omniweb/",
            identity: "omniweb"
        },
        {   string: navigator.userAgent,
            subString: "silk",
            versionSearch: "silk/",
            identity: "silk"
        },
        {
            string: navigator.userAgent,
            subString: "gecko",
            identity: "mozilla",
            versionSearch: "rv"
        },
        {       // for older Netscapes (4-)
            string: navigator.userAgent,
            subString: "mozilla",
            identity: "netscape",
            versionSearch: "mozilla"
        }
    ],

    dataOS : [
        {
           string: navigator.userAgent,
           subString: "windows ce",
           identity: "windows ce"
        },
        {
           string: navigator.userAgent,
           subString: "windows phone",
           identity: "windows phone"
        },
        {
            string: navigator.platform,
            subString: "win",
            identity: "windows"
        },
        {
            string: navigator.platform,
            subString: "mac",
            identity: "mac"
        },
        {
           string: navigator.userAgent,
           subString: "iphone",
           identity: "iphone/ipod"
        },
        {
           string: navigator.userAgent,
           subString: "ipod",
           identity: "iphone/ipod"
        },
        {
           string: navigator.userAgent,
           subString: "ipad",
           identity: "ipad"
        },
        {
           string: navigator.userAgent,
           subString: "android",
           identity: "android"
        },
        {
           string: navigator.userAgent,
           subString: "silk",
           identity: "kindle"
        },
        {
           string: navigator.userAgent,
           subString: "blackberry",
           identity: "blackberry"
        },
        {
            string: navigator.platform,
            subString: "linux",
            identity: "linux"
        }
    ]

};
