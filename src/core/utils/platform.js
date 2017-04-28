
var platform = {

    initialized : false,

    init: function () {

        var self = platform;

        self.browser = self.searchString(self.dataBrowser) || 'An unknown browser';
        self.version = self.searchVersion(navigator.userAgent.toLowerCase()) || self.searchVersion(navigator.appVersion) || 'an unknown version';
        self.OS = self.searchString(self.dataOS) || 'an unknown os: ua: ' + navigator.userAgent + ' pl: ' + navigator.platform;

        self.mobile = (self.OS == 'iphone/ipod' || self.OS == 'android' || self.OS == 'ipad' || self.OS == 'windows ce'  || self.OS == 'windows phone' || self.OS == 'kindle');
        self.mobileAndroid = (self.OS == 'android');
        self.initialized = true;
    },

    getBrowser : function() {
        if(!platform.initialized) { platform.init(); }
        return platform.browser;
    },

    getBrowserVersion : function() {
        if(!platform.initialized) { platform.init(); }
        return platform.browser;
    },

    getOS : function() {
        if(!platform.initialized) { platform.init(); }
        return platform.browser;
    },

    isMobile : function() {
        if(!platform.initialized) { platform.init(); }
        return platform.mobile;
    },
    
    isAndroid : function() {
        if(!platform.initialized) { platform.init(); }
        return platform.mobileAndroid;
    },

    searchString: function (data) {
        var self = platform;
        for (var i=0; i<data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            self.versionSearchString = data[i].versionSearch || data[i].identity;

            if (dataString) {
                if (dataString.toLowerCase().indexOf(data[i].subString) != -1) {
                    if (data[i].version != null) {
                        self.version = data[i].version;
                    }
                    return data[i].identity;
                }
            } else if (dataProp) {
                return data[i].identity;
            }
        }
    },

    searchVersion: function (dataString) {
        var self = platform;
        if (self.version != null) {
            return self.version;
        }
        var index = dataString.indexOf(self.versionSearchString);
        if (index == -1) return;
        return parseFloat(dataString.substring(index+self.versionSearchString.length+1));
    },

    dataBrowser: [
        {
            string: navigator.userAgent,
            subString: 'chrome',
            identity: 'chrome'
        },
        {
            string: navigator.userAgent,
            subString: 'firefox',
            identity: 'firefox'
        },
        {
            string: navigator.vendor,
            subString: 'apple',
            identity: 'safari',
            versionSearch: 'version'
        },
        {
            prop: window.opera,
            identity: 'opera',
            versionSearch: 'version'
        },
        {
            string: navigator.vendor,
            subString: 'icab',
            identity: 'icab'
        },
        {
            string: navigator.vendor,
            subString: 'kde',
            identity: 'konqueror'
        },
        {
            string: navigator.vendor,
            subString: 'camino',
            identity: 'camino'
        },
        {       // for newer Netscapes (6+)
            string: navigator.userAgent,
            subString: 'netscape',
            identity: 'netscape'
        },
        {
            string: navigator.userAgent,
            subString: 'msie',
            identity: 'explorer',
            versionSearch: 'msie'
        },
        {
            string: navigator.userAgent,
            subString: 'trident/',
            identity: 'explorer',
            version: '11'
        },
        {
            string: navigator.userAgent,
            subString: 'edge/',
            identity: 'explorer',
            version: '12'
        },
        {   string: navigator.userAgent,
            subString: 'omniweb',
            versionSearch: 'omniweb/',
            identity: 'omniweb'
        },
        {   string: navigator.userAgent,
            subString: 'silk',
            versionSearch: 'silk/',
            identity: 'silk'
        },
        {
            string: navigator.userAgent,
            subString: 'gecko',
            identity: 'mozilla',
            versionSearch: 'rv'
        },
        {       // for older Netscapes (4-)
            string: navigator.userAgent,
            subString: 'mozilla',
            identity: 'netscape',
            versionSearch: 'mozilla'
        }
    ],

    dataOS : [
        {
            string: navigator.userAgent,
            subString: 'windows ce',
            identity: 'windows ce'
        },
        {
            string: navigator.userAgent,
            subString: 'windows phone',
            identity: 'windows phone'
        },
        {
            string: navigator.platform,
            subString: 'win',
            identity: 'windows'
        },
        {
            string: navigator.platform,
            subString: 'mac',
            identity: 'mac'
        },
        {
            string: navigator.userAgent,
            subString: 'iphone',
            identity: 'iphone/ipod'
        },
        {
            string: navigator.userAgent,
            subString: 'ipod',
            identity: 'iphone/ipod'
        },
        {
            string: navigator.userAgent,
            subString: 'ipad',
            identity: 'ipad'
        },
        {
            string: navigator.userAgent,
            subString: 'android',
            identity: 'android'
        },
        {
            string: navigator.userAgent,
            subString: 'silk',
            identity: 'kindle'
        },
        {
            string: navigator.userAgent,
            subString: 'blackberry',
            identity: 'blackberry'
        },
        {
            string: navigator.platform,
            subString: 'linux',
            identity: 'linux'
        }
    ]

};

export {platform};

